# สถานะการย้ายโฮสต์

อัปเดต 2026-10-17

- GitHub: `robster29929-stack/new_9_gpt`, branch `main`; โค้ด migration commit `05b7ba43990c8834fc0bc48bc161f7dd4002cf16`
- Supabase: `ffgedvyumiyujlfuimrj`; migration `20261017102044_portal_workspaces` ติดตั้งแล้ว; seed 1 ชุด, catalog 68 รายวิชา, RLS เปิดทั้งสองตาราง; ยังไม่มีบัญชีหรือข้อมูลผู้ใช้งานจริง
- ตรวจ anonymous Data API จริง: อ่านทั้ง seed และ workspace ถูกปฏิเสธ; Security advisors ไม่พบข้อเตือน
- Local build, regression ระบบ 01–09 และ unit tests Auth/persistence 7 กรณีผ่าน; ยังไม่ใช่การทดสอบส่งอีเมล/ล็อกอินจริงครบวงจร

## Vercel — ยังไม่ deploy

เป้าหมายล่าสุดจากผู้ใช้: https://vercel.com/kung-robster/new_9_gpt-i9kg

การเชื่อมต่อปัจจุบันเห็นทีม `kung-robster` แต่ไม่แสดงโปรเจกต์; อ่านชื่อที่ระบุได้ 404 Project not found และ create/import project ถูกปฏิเสธ 403 Permission denied จึงไม่มี deployment หรือ URL production ที่ยืนยันได้ในรอบนี้ ไม่ได้เปลี่ยนโปรเจกต์ Vercel อื่น

เมื่อบัญชี/การเชื่อมต่อได้รับสิทธิ์ ให้เชื่อม repository นี้กับโปรเจกต์ดังกล่าว แล้วตั้ง Framework = Other, Build = `npm run build`, Output = `dist`, Node.js 22 ขึ้นไป และ deploy `main` ไฟล์ vercel.json อยู่ใน repo แล้ว

config/supabase.public.json ใช้ publishable key ที่ปลอดภัยสำหรับ frontend จึง build ได้ทันที ไม่ต้องใส่ service-role key

หลังได้ domain จริง ตั้ง Supabase Auth Site URL/Redirect URLs และ SMTP ตาม README ก่อนทดสอบ signup/recovery email

## ข้อยกเว้นไฟล์แนบ

เผยแพร่แม่แบบที่ทำความสะอาดแล้ว 5 ไฟล์ และ TEST import workbook; ไฟล์นักธรรม 3 ไฟล์คงนอก public repository/โฮสต์ หลัง automatic approval review ปฏิเสธไฟล์หนึ่งในกลุ่มนี้เพราะข้อมูลระบุตัวบุคคล/embedded content ใช้ลิงก์เว็บไซต์เจ้าของแบบแทน ไม่มีการอัปโหลดไฟล์ที่ยังไม่ผ่านการอนุญาตโดยช่องทางอื่น
