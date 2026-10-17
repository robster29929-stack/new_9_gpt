import { z } from "zod";
export type AuthMode = "login" | "signup" | "forgot" | "reset";
export function validateAuth(
  mode: AuthMode,
  input: { email: string; password: string; confirmPassword: string },
) {
  if (mode !== "reset") z.email("กรุณากรอกอีเมลให้ถูกต้อง").parse(input.email);
  if (mode !== "forgot")
    z.string()
      .min(
        mode === "login" ? 1 : 12,
        mode === "login"
          ? "กรุณากรอกรหัสผ่าน"
          : "ใช้รหัสผ่านอย่างน้อย 12 ตัวอักษร",
      )
      .parse(input.password);
  if (mode === "reset" && input.password !== input.confirmPassword)
    throw new Error("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
  return input;
}
export function authMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  const messages: Record<string, string> = {
    invalid_credentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    email_not_confirmed: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
    over_email_send_rate_limit: "ส่งอีเมลถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
    email_address_not_authorized:
      "โปรดให้ผู้ดูแลตั้งค่าผู้ส่ง SMTP เพื่อส่งอีเมลถึงบัญชีนี้",
    user_already_exists:
      "บัญชีนี้มีอยู่แล้ว กรุณาเข้าสู่ระบบหรือขอตั้งรหัสผ่านใหม่",
    signup_disabled: "การสมัครบัญชีถูกปิด โปรดติดต่อผู้ดูแล",
  };
  if (error instanceof z.ZodError)
    return error.issues[0]?.message || "กรุณาตรวจข้อมูล";
  return (
    messages[code] ||
    "ดำเนินการไม่สำเร็จ กรุณาตรวจข้อมูลและการเชื่อมต่อ หรือติดต่อผู้ดูแล"
  );
}
