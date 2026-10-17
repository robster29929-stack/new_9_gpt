"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { allModules } from "@/lib/modules";
import { text } from "@/lib/model";
import { useWorkspace } from "./workspace-provider";
import { Button } from "./ui/button";
const saveLabels = {
  saved: "บันทึกใน Supabase แล้ว",
  pending: "มีข้อมูลรอบันทึก",
  saving: "กำลังบันทึก…",
  error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง",
  conflict:
    "ข้อมูลถูกแก้จากหน้าต่างอื่น กรุณาดาวน์โหลดข้อมูลที่ค้างก่อนโหลดใหม่",
};
function WorkspaceNavigation({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label="เมนูระบบหลัก" className="space-y-1">
      <Link
        className="sidebar-link"
        href="/workspace"
        aria-current={path === "/workspace" ? "page" : undefined}
        onClick={onNavigate}
      >
        ⌂ ภาพรวม
      </Link>
      {allModules.map((m) => (
        <Link
          key={m.id}
          className="sidebar-link"
          href={"/workspace/" + m.id}
          aria-current={path === "/workspace/" + m.id ? "page" : undefined}
          onClick={onNavigate}
        >
          {"number" in m && <span className="sidebar-number">{m.number}</span>}
          {m.name}
        </Link>
      ))}
    </nav>
  );
}
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { snapshot, email, saveState, save, backup, logout, message } =
    useWorkspace();
  const path = usePathname(),
    router = useRouter();
  const [mobile, setMobile] = useState(false);
  const setting = snapshot.state.settings;
  const brand =
    setting && typeof setting === "object" && !Array.isArray(setting)
      ? text(setting.organizationName)
      : "พื้นที่ทำงาน";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-[#f1f5ed] p-5 md:block">
        <Link
          href="/workspace"
          className="mb-6 block text-2xl font-bold no-underline"
        >
          {brand || "พื้นที่ทำงาน"}
        </Link>
        <p className="mb-5 text-muted-foreground">ระบบงาน 9 ระบบ · TEST_</p>
        <WorkspaceNavigation path={path} onNavigate={() => setMobile(false)} />
      </aside>
      <div className="min-w-0">
        <header className="border-b border-border bg-card px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="md:hidden"
                variant="outline"
                onClick={() => setMobile(!mobile)}
                aria-expanded={mobile}
                aria-controls="mobile-navigation"
              >
                เมนูระบบ
              </Button>
              {path !== "/workspace" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.history.length > 1) router.back();
                    else router.push("/workspace");
                  }}
                >
                  ← ย้อนกลับ
                </Button>
              )}
              <span className="text-base break-all">{email}</span>
            </div>
            <Button variant="outline" onClick={() => void logout()}>
              ออกจากระบบ
            </Button>
          </div>
          {mobile && (
            <div id="mobile-navigation" className="mt-4 md:hidden">
              <WorkspaceNavigation
                path={path}
                onNavigate={() => setMobile(false)}
              />
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <span role="status" className="text-base">
              {saveLabels[saveState]}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={saveState === "saving" || saveState === "conflict"}
                onClick={() => void save()}
              >
                บันทึกข้อมูล
              </Button>
              <Button variant="outline" onClick={backup}>
                ดาวน์โหลดสำรอง
              </Button>
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-[1600px] px-4 py-6 md:px-8"
        >
          <div className="test-note mb-6">
            พื้นที่ข้อมูล TEST_ แยกตามบัญชี · สิทธิ์งาน การอนุมัติ ผลสอบ
            และการเงินยังเป็นแบบจำลอง
          </div>
          {message && (
            <p
              role="status"
              className="mb-4 rounded-xl border border-border bg-white p-3"
            >
              {message}
            </p>
          )}
          {children}
        </main>
        <footer className="border-t border-border px-6 py-5 text-base text-muted-foreground">
          ปีงบประมาณ 1 ตุลาคม–30 กันยายน · Next.js / React / TypeScript
        </footer>
      </div>
      <button
        className="fixed right-4 bottom-4 z-40 rounded-full bg-primary px-5 py-3 text-white shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="กลับขึ้นด้านบน"
      >
        ↑ กลับขึ้นด้านบน
      </button>
    </div>
  );
}
