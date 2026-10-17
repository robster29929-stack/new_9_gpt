import { connection } from "next/server";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
const sarabun = localFont({
  src: [
    {
      path: "../../public/assets/fonts/Sarabun-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Sarabun-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Sarabun-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Sarabun-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-sarabun",
  display: "swap",
});
export const metadata: Metadata = {
  title: "พื้นที่ทำงาน · 9 ระบบ",
  description: "พื้นที่ทดสอบระบบงานทะเบียน การศึกษา และงานบริหาร",
};
export default async function Layout({ children }: { children: ReactNode }) {
  await connection();
  return (
    <html lang="th" className={sarabun.variable}>
      <body>
        <a className="skip-link" href="#main-content">
          ข้ามไปเนื้อหา
        </a>
        {children}
      </body>
    </html>
  );
}
