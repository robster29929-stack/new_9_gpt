"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSupabase } from "@/lib/supabase";
import { type Snapshot, snapshotSchema, download } from "@/lib/model";
import { WorkspacePersistence, type SaveState } from "@/lib/persistence";
interface ContextValue {
  snapshot: Snapshot;
  mutate: (action: (s: Snapshot) => Snapshot) => void;
  email: string;
  saveState: SaveState;
  save: () => Promise<void>;
  backup: () => void;
  logout: () => Promise<void>;
  message: string;
  setMessage: (s: string) => void;
}
const Context = createContext<ContextValue | null>(null);
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("พื้นที่ทำงานยังไม่พร้อม");
  return value;
}
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null),
    [email, setEmail] = useState(""),
    [saveState, setSaveState] = useState<SaveState>("saved"),
    [message, setMessage] = useState(""),
    [loadError, setLoadError] = useState("");
  const current = useRef<Snapshot | null>(null),
    persistence = useRef<WorkspacePersistence | null>(null),
    account = useRef("");
  useEffect(() => {
    let active = true;
    const client = getSupabase();
    const sub = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (
        account.current &&
        (event === "SIGNED_OUT" ||
          (session && session.user.id !== account.current))
      ) {
        if (persistence.current) persistence.current.blocked = true;
        setLoadError(
          "บัญชีเปลี่ยนแล้ว กรุณาดาวน์โหลดข้อมูลที่ค้างก่อนเข้าสู่ระบบใหม่",
        );
      }
    }).data.subscription;
    async function load(attempt = 0) {
      const { data, error } = await client.auth.getUser();
      if (error || !data.user) {
        location.replace("/login");
        return;
      }
      const user = data.user;
      if (!active) return;
      account.current = user.id;
      setEmail(user.email || "บัญชีที่เข้าสู่ระบบ");
      const loaded = await client
        .from("portal_workspaces")
        .select("snapshot,revision")
        .eq("user_id", user.id)
        .maybeSingle();
      if (loaded.error) throw loaded.error;
      let s: Snapshot, revision: number;
      if (loaded.data) {
        s = snapshotSchema.parse(loaded.data.snapshot);
        revision = Number(loaded.data.revision);
      } else {
        const seed = await client
          .from("portal_seed")
          .select("snapshot")
          .eq("id", "TEST_SEED_001")
          .single();
        if (seed.error) throw seed.error;
        s = snapshotSchema.parse(seed.data.snapshot);
        const saved = await client.rpc("portal_save_workspace", {
          p_snapshot: s,
          p_expected_revision: 0,
          p_user_id: user.id,
        });
        if (saved.error) {
          if (saved.error.code === "40001" && attempt < 1) {
            return load(attempt + 1);
          }
          throw saved.error;
        }
        revision = Number(saved.data);
      }
      if (!active) return;
      const store = new WorkspacePersistence(
        async (next, expected) => {
          const auth = await client.auth.getUser();
          if (auth.error || auth.data.user?.id !== user.id)
            throw new Error("บัญชีเปลี่ยนแล้ว");
          const result = await client.rpc("portal_save_workspace", {
            p_snapshot: next,
            p_expected_revision: expected,
            p_user_id: user.id,
          });
          if (result.error) throw result.error;
          return Number(result.data);
        },
        (state) => {
          if (active) setSaveState(state);
        },
      );
      store.start(s, revision);
      persistence.current = store;
      current.current = s;
      setSnapshot(s);
    }
    void load().catch(() => {
      if (active)
        setLoadError(
          "เปิดพื้นที่ทำงานไม่สำเร็จ กรุณาตรวจการเชื่อมต่อหรือให้ผู้ดูแลตรวจฐานข้อมูลและสิทธิ์",
        );
    });
    const unload = (event: BeforeUnloadEvent) => {
      if (persistence.current?.dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      active = false;
      sub.unsubscribe();
      persistence.current?.dispose();
      window.removeEventListener("beforeunload", unload);
    };
  }, []);
  const mutate = useCallback((action: (s: Snapshot) => Snapshot) => {
    try {
      const existing = current.current;
      if (!existing || !persistence.current || persistence.current.blocked)
        throw new Error(
          "ยังแก้ไขไม่ได้ โปรดบันทึกข้อมูลที่ค้างหรือแก้ปัญหาการเชื่อมต่อก่อน",
        );
      const next = snapshotSchema.parse(action(existing));
      current.current = next;
      setSnapshot(next);
      persistence.current.changed(next);
      setMessage("ปรับข้อมูล TEST_ แล้ว กำลังบันทึกขึ้น Supabase");
    } catch (error) {
      const text =
        error instanceof Error ? error.message : "ตรวจข้อมูลไม่สำเร็จ";
      setMessage(text);
      throw new Error(text);
    }
  }, []);
  const backup = () => {
    if (current.current)
      download(
        JSON.stringify(current.current, null, 2),
        "TEST_workspace_backup.json",
        "application/json",
      );
  };
  async function save() {
    try {
      await persistence.current?.retry();
      setMessage("บันทึกใน Supabase แล้ว");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    }
  }
  async function logout() {
    try {
      await persistence.current?.flush();
      const result = await getSupabase().auth.signOut();
      if (result.error) throw result.error;
      location.replace("/login");
    } catch {
      setMessage(
        "ยังออกจากระบบไม่ได้ โปรดบันทึกหรือดาวน์โหลดข้อมูลที่ค้างก่อน",
      );
    }
  }
  if (loadError)
    return (
      <main id="main-content" className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-bold">พื้นที่ทำงานยังไม่พร้อม</h1>
        <p className="my-5" role="alert">
          {loadError}
        </p>
        {snapshot && <button onClick={backup}>ดาวน์โหลดข้อมูลที่ค้าง</button>}
        <p>
          <a href="/login">กลับหน้าเข้าสู่ระบบ</a>
        </p>
        <button onClick={() => location.reload()}>ลองโหลดใหม่</button>
      </main>
    );
  if (!snapshot)
    return (
      <main id="main-content" className="p-10" role="status">
        กำลังตรวจบัญชีและโหลดพื้นที่ทำงาน…
      </main>
    );
  return (
    <Context.Provider
      value={{
        snapshot,
        mutate,
        email,
        saveState,
        save,
        backup,
        logout,
        message,
        setMessage,
      }}
    >
      {children}
    </Context.Provider>
  );
}
