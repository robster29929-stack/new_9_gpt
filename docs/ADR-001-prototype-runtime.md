# ADR-001 — Runtime ของเว็บต้นแบบ

- สถานะ: ใช้เฉพาะต้นแบบสำหรับตรวจแนวคิด ยังไม่ใช่การอนุมัติสถาปัตยกรรมใช้งานจริง
- วันที่: 2026-10-15

## บริบท

ข้อเสนอเดิมระบุ Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase/PostgreSQL/Auth/RLS/Storage, ExcelJS และ worker แต่ workspace นี้ไม่มี application source, schema, Supabase project credentials, รายชื่อเจ้าของข้อมูลที่ยืนยันแล้ว หรือหลักฐานยืนยัน policy การอนุมัติและการเผยแพร่

## การตัดสินใจสำหรับต้นแบบนี้

ใช้ HTML/CSS/JavaScript แบบ static ที่ไม่มี dependency เพื่อแสดง navigation และ workflow ของทั้ง 9 ระบบใน private Site ข้อมูลทั้งหมดเป็น TEST_ ฝั่ง browser เท่านั้น ไม่มีการเชื่อมต่อฐานข้อมูล มีการยืนยันตัวตนและจำกัดผู้ชมโดย Sites/ChatGPT; ยังไม่มี authentication แบบบัญชีอีเมลแยกหรือ authorization รายระบบงาน ไม่มี API และไม่มีการเก็บไฟล์หรือข้อมูลหลัง reload

การตัดสินใจนี้จำกัดเฉพาะต้นแบบ ไม่เปลี่ยนข้อเสนอ production stack เดิม การพัฒนา production ต้องทำ ADR ใหม่หลังยืนยันเจ้าของงาน แหล่งข้อมูล แบบฟอร์ม ระเบียบ และ security policy

## ผลที่ตามมา

- ทดสอบ responsive UI, navigation, form validation และ Excel preview ได้โดยไม่ใช้ข้อมูลจริง
- เพิ่มเมนู TEST_ สำหรับ role/scope/action, ปุ่มย้อนกลับ, ออกจากโหมดตัวอย่าง และกลับขึ้นด้านบน
- เพิ่ม XLSX export แบบ browser-only และ workflow import/preview/ยืนยันเพิ่มหรือเขียนทับสำหรับระเบียน TEST_ ระบบ 01–08; ระบบสมัครนักธรรม/ธรรมศึกษาคง workflow เฉพาะไว้
- การจำลอง role, approval, public results, budget, stock และการเขียนทับไม่ถือเป็นการบังคับใช้ business rule หรือ security boundary
- XLSX reader ในต้นแบบอ่าน worksheet แรกและ string/numeric แบบพื้นฐาน; production importer ต้องใช้ ExcelJS และ worker ตามข้อเสนอเดิม พร้อม scan/type/size policy, transaction, idempotency, audit และ permission recheck ที่องค์กรอนุมัติ
- ไม่ใช้ service key, secret หรือข้อมูลจริงใน client
