import { it, expect } from "vitest";
import seed from "../../supabase/seed_snapshot.json";
import { snapshotSchema } from "./model";
import { WorkspacePersistence, type SaveState } from "./persistence";
const fresh = () => snapshotSchema.parse(structuredClone(seed));
it("serializes rapid saves and advances expected revisions", async () => {
  const revisions: number[] = [],
    states: SaveState[] = [];
  const p = new WorkspacePersistence(
    async (_s, r) => {
      revisions.push(r);
      await Promise.resolve();
      return r + 1;
    },
    (s) => states.push(s),
    100000,
  );
  p.start(fresh(), 4);
  const changed = fresh();
  changed.state.drafts = 1;
  p.changed(changed);
  await p.flush();
  changed.state.drafts = 2;
  p.changed(changed);
  await p.flush();
  expect(revisions).toEqual([4, 5]);
  expect(p.dirty).toBe(false);
  expect(states.at(-1)).toBe("saved");
  p.dispose();
});
it("keeps unsaved data and blocks retry on revision conflicts", async () => {
  const p = new WorkspacePersistence(
    async () => {
      throw { code: "40001" };
    },
    () => {},
    100000,
  );
  p.start(fresh(), 2);
  const changed = fresh();
  changed.state.drafts = 1;
  p.changed(changed);
  await expect(p.flush()).rejects.toBeTruthy();
  expect(p.dirty).toBe(true);
  expect(p.conflict).toBe(true);
  await expect(p.retry()).rejects.toThrow("ข้อมูลขัดแย้ง");
  p.dispose();
});
it("retries connection errors without advancing the revision", async () => {
  let failed = true;
  const p = new WorkspacePersistence(
    async (_s, r) => {
      if (failed) throw new Error("network");
      return r + 1;
    },
    () => {},
    100000,
  );
  p.start(fresh(), 2);
  const changed = fresh();
  changed.state.drafts = 1;
  p.changed(changed);
  await expect(p.flush()).rejects.toThrow();
  expect(p.revision).toBe(2);
  failed = false;
  await p.retry();
  expect(p.revision).toBe(3);
  expect(p.dirty).toBe(false);
  p.dispose();
});
