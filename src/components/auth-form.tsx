"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getSupabase } from "@/lib/supabase";
import { authMessage, validateAuth, type AuthMode } from "@/lib/auth";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
const titles = {
  login: "เข้าสู่ระบบ",
  signup: "สร้างบัญชีทดสอบ",
  forgot: "ลืมรหัสผ่าน",
  reset: "ตั้งรหัสผ่านใหม่",
};
export function AuthForm({ mode }: { mode: AuthMode }) {
  const form = useForm({
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });
  const [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [recovery, setRecovery] = useState(mode !== "reset");
  useEffect(() => {
    // Initialize every account route so legacy email callback fragments are consumed.
    const client = getSupabase();
    if (mode !== "reset") return;
    let active = true;
    const subscription = client.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") setRecovery(true);
    }).data.subscription;
    async function prepare() {
      const params = new URLSearchParams(window.location.search);
      const hash = params.get("token_hash");
      const type = params.get("type");
      if (hash && type === "recovery") {
        const result = await client.auth.verifyOtp({
          token_hash: hash,
          type: "recovery",
        });
        if (result.error) {
          setMessage("ลิงก์ไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่");
          setError(true);
          return;
        }
        if (active) setRecovery(true);
      }
      const { data, error } = await client.auth.getSession();
      if (!active) return;
      if (!error && data.session) setRecovery(true);
      else setMessage("กรุณาเปิดหน้านี้จากลิงก์ตั้งรหัสผ่านในอีเมล");
      history.replaceState(null, "", location.pathname);
    }
    void prepare().catch(() => {
      if (active) {
        setMessage("ตรวจลิงก์ไม่สำเร็จ กรุณาขอลิงก์ใหม่");
        setError(true);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [mode]);
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-12"
    >
      <Card className="w-full">
        <p className="mb-2 text-muted-foreground">พื้นที่ทดสอบระบบงาน 9 ระบบ</p>
        <h1 className="mb-4 text-3xl font-bold">{titles[mode]}</h1>
        <p className="mb-6 text-muted-foreground">
          ใช้อีเมลเป็นชื่อผู้ใช้
          บัญชีที่สมัครใหม่ไม่ได้รับสิทธิ์ผู้ดูแลระบบโดยอัตโนมัติ
        </p>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(async (values) => {
            setError(false);
            setMessage("กำลังดำเนินการ…");
            try {
              validateAuth(mode, values);
            } catch (e) {
              setError(true);
              setMessage(
                e instanceof Error && !(e instanceof Object && "issues" in e)
                  ? e.message
                  : authMessage(e),
              );
              return;
            }
            try {
              const client = getSupabase();
              if (mode === "login") {
                const r = await client.auth.signInWithPassword({
                  email: values.email.trim(),
                  password: values.password,
                });
                if (r.error) throw r.error;
                location.replace("/workspace");
                return;
              }
              if (mode === "signup") {
                const r = await client.auth.signUp({
                  email: values.email.trim(),
                  password: values.password,
                  options: { emailRedirectTo: location.origin + "/login.html" },
                });
                if (r.error) throw r.error;
                if (r.data.session) {
                  location.replace("/workspace");
                  return;
                }
                setMessage(
                  "กรุณาตรวจอีเมลและสแปมเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ หากมีบัญชีแล้วให้ใช้หน้าลืมรหัสผ่าน",
                );
              }
              if (mode === "forgot") {
                const r = await client.auth.resetPasswordForEmail(
                  values.email.trim(),
                  { redirectTo: location.origin + "/reset-password.html" },
                );
                if (r.error) throw r.error;
                setMessage(
                  "หากอีเมลนี้มีบัญชี ระบบจะส่งลิงก์ตั้งรหัสผ่านให้ กรุณาตรวจอีเมลและสแปม",
                );
              }
              if (mode === "reset") {
                if (!recovery) throw new Error("recovery_required");
                const r = await client.auth.updateUser({
                  password: values.password,
                });
                if (r.error) throw r.error;
                const out = await client.auth.signOut();
                if (out.error) throw out.error;
                location.replace("/login");
              }
            } catch (e) {
              setError(true);
              setMessage(authMessage(e));
            }
          })}
        >
          {mode !== "reset" && (
            <label className="block">
              อีเมล
              <input
                className="mt-1 w-full"
                type="email"
                autoComplete="username"
                required
                {...form.register("email")}
              />
            </label>
          )}
          {mode !== "forgot" && (
            <label className="block">
              รหัสผ่าน{mode !== "login" && " (อย่างน้อย 12 ตัวอักษร)"}
              <input
                className="mt-1 w-full"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={mode === "login" ? 1 : 12}
                required
                {...form.register("password")}
              />
            </label>
          )}
          {mode === "reset" && (
            <label className="block">
              ยืนยันรหัสผ่าน
              <input
                className="mt-1 w-full"
                type="password"
                autoComplete="new-password"
                required
                {...form.register("confirmPassword")}
              />
            </label>
          )}
          <p
            role={error ? "alert" : "status"}
            className={error ? "error" : "success"}
          >
            {message}
          </p>
          <Button
            className="w-full"
            type="submit"
            disabled={form.formState.isSubmitting || !recovery}
          >
            {form.formState.isSubmitting ? "กำลังดำเนินการ…" : titles[mode]}
          </Button>
        </form>
        <nav className="mt-6 flex flex-wrap gap-4" aria-label="เมนูบัญชี">
          {mode !== "login" && <Link href="/login">เข้าสู่ระบบ</Link>}
          {mode === "login" && (
            <>
              <Link href="/signup">สร้างบัญชีทดสอบ</Link>
              <Link href="/forgot-password">ลืมรหัสผ่าน?</Link>
            </>
          )}
        </nav>
      </Card>
    </main>
  );
}
