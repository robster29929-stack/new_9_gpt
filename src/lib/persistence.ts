import { type Snapshot, snapshotSchema } from "./model";
export type SaveState = "saved" | "pending" | "saving" | "error" | "conflict";
export class WorkspacePersistence {
  revision = 0;
  saved = "";
  latest = "";
  ready = false;
  blocked = false;
  conflict = false;
  private inFlight: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(
    private save: (s: Snapshot, revision: number) => Promise<number>,
    private notify: (state: SaveState) => void,
    private delay = 450,
  ) {}
  start(snapshot: Snapshot, revision: number) {
    this.saved = this.latest = JSON.stringify(snapshotSchema.parse(snapshot));
    this.revision = revision;
    this.ready = true;
    this.notify("saved");
  }
  get dirty() {
    return this.ready && this.latest !== this.saved;
  }
  changed(snapshot: Snapshot) {
    if (!this.ready) return;
    this.latest = JSON.stringify(snapshotSchema.parse(snapshot));
    if (!this.dirty || this.blocked) return;
    this.notify("pending");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.flush().catch(() => {});
    }, this.delay);
  }
  async flush(): Promise<void> {
    clearTimeout(this.timer);
    if (!this.ready) return;
    if (this.blocked) throw new Error("ข้อมูลยังไม่พร้อมบันทึก");
    if (this.inFlight) {
      await this.inFlight;
      if (this.dirty) return this.flush();
      return;
    }
    this.inFlight = (async () => {
      while (this.dirty && !this.blocked) {
        const serialized = this.latest;
        this.notify("saving");
        try {
          const next = await this.save(
            snapshotSchema.parse(JSON.parse(serialized)),
            this.revision,
          );
          if (!Number.isSafeInteger(next) || next !== this.revision + 1)
            throw new Error("รุ่นข้อมูลไม่ถูกต้อง");
          this.revision = next;
          this.saved = serialized;
        } catch (error) {
          this.blocked = true;
          this.conflict =
            !!error &&
            typeof error === "object" &&
            (("code" in error && error.code === "40001") ||
              ("message" in error &&
                String(error.message).includes("revision_conflict")));
          this.notify(this.conflict ? "conflict" : "error");
          throw error;
        }
      }
      this.notify("saved");
    })();
    try {
      await this.inFlight;
    } finally {
      this.inFlight = null;
    }
  }
  async retry() {
    if (this.conflict)
      throw new Error(
        "ข้อมูลขัดแย้ง กรุณาดาวน์โหลดข้อมูลที่ค้างและโหลดหน้าใหม่",
      );
    this.blocked = false;
    await this.flush();
  }
  dispose() {
    clearTimeout(this.timer);
    this.ready = false;
  }
}
