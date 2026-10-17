# สถานะการย้ายโฮสต์

อัปเดต 2026-10-17

- GitHub: `robster29929-stack/new_9_gpt`, branch `main`; โค้ด migration commit `05b7ba43990c8834fc0bc48bc161f7dd4002cf16`
- Supabase: `ffgedvyumiyujlfuimrj`; migration `20261017102044_portal_workspaces` ติดตั้งแล้ว; seed 1 ชุด, catalog 68 รายวิชา, RLS เปิดทั้งสองตาราง; ยังไม่มีบัญชีหรือข้อมูลผู้ใช้งานจริง
- ตรวจ anonymous Data API จริง: อ่านทั้ง seed และ workspace ถูกปฏิเสธ; Security advisors ไม่พบข้อเตือน
- Local build, regression ระบบ 01–09 และ unit tests Auth/persistence 7 กรณีผ่าน; ยังไม่ใช่การทดสอบส่งอีเมล/ล็อกอินจริงครบวงจร

## Vercel — Ready (ยืนยันผ่านหน้าเว็บ)

เป้าหมายล่าสุดจากผู้ใช้: https://vercel.com/kung-robster/new_9_gpt-i9kg

หลังผู้ใช้อนุญาตให้ตรวจผ่านหน้าเว็บ ยืนยันว่าโปรเจกต์เชื่อม GitHub `robster29929-stack/new_9_gpt`, branch `main` และ production deployment ของ commit `eac3a9ab9016eba41c1dd554d5fb2924d12d8908` มีสถานะ Ready แล้ว เปิดหน้าเข้าสู่ระบบ production ได้จริงที่ https://new9gpt-i9kg.vercel.app/ . API connector ยังมีข้อจำกัดสิทธิ์ แต่ไม่ได้หมายความว่าเว็บไซต์ไม่ถูกเผยแพร่

โครงการใช้ Git integration: push ไป `main` จะสร้าง production deployment ตาม vercel.json; local build ใช้ `npm run build` และ output `dist`

config/supabase.public.json ใช้ publishable key ที่ปลอดภัยสำหรับ frontend จึง build ได้ทันที ไม่ต้องใส่ service-role key

โดเมนจริงคือ https://new9gpt-i9kg.vercel.app/ . ยังต้องตั้ง/ตรวจ Supabase Auth Site URL/Redirect URLs และ SMTP ตาม README ก่อนทดสอบ signup/recovery email จริง รอบนี้ตรวจเฉพาะหน้าบัญชีที่เผยแพร่ ไม่ได้สร้างบัญชี ส่งอีเมล หรือเข้าสู่ข้อมูล TEST_ ด้วยบัญชีผู้ใช้

## ข้อยกเว้นไฟล์แนบ

เผยแพร่แม่แบบที่ทำความสะอาดแล้ว 5 ไฟล์ และ TEST import workbook; ไฟล์นักธรรม 3 ไฟล์คงนอก public repository/โฮสต์ หลัง automatic approval review ปฏิเสธไฟล์หนึ่งในกลุ่มนี้เพราะข้อมูลระบุตัวบุคคล/embedded content ใช้ลิงก์เว็บไซต์เจ้าของแบบแทน ไม่มีการอัปโหลดไฟล์ที่ยังไม่ผ่านการอนุญาตโดยช่องทางอื่น
