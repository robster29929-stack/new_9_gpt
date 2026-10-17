# สังฆะพอร์ทัล · new_9_gpt

ย้ายต้นแบบ 9 ระบบจาก Sites version 24 (source `aa8703f34cdf2118cec818383dc8fa6a7325f71f`) มายัง GitHub / Supabase / Vercel โดยคงหน้าจอ ตัวอักษรใหญ่ แม่แบบ Excel 8 ไฟล์ และ workflow `TEST_` เดิม

## ติดตั้ง

ใช้ Node.js 22 ขึ้นไป:

```sh
npm ci
npm test
npm run build
```

เผยแพร่โฟลเดอร์ `dist` ด้วย Vercel ตาม `vercel.json` โครงการเชื่อม repository แล้วให้ deploy branch `main`

`config/supabase.public.json` มีเฉพาะ URL กับ **publishable key** ที่ออกแบบให้ใช้ใน browser; ไม่มี secret/service-role key, รหัสผ่านหรือ access token ใน repository สามารถ override ด้วย `SUPABASE_URL` และ `SUPABASE_PUBLISHABLE_KEY` ใน Vercel

## ฐานข้อมูล

- โปรเจกต์: `ffgedvyumiyujlfuimrj` (`new_9_gpt`)
- ติดตั้ง `supabase/migrations/20261017102044_portal_workspaces.sql` แล้วรัน `supabase/seed.sql` (ไม่เขียนทับพื้นที่บัญชีที่มีอยู่)
- `portal_seed` เก็บข้อมูลจำลองตั้งต้นและ catalog รายวิชา 68 รายการ
- `portal_workspaces` เก็บ snapshot JSONB แยกเจ้าของบัญชีด้วย RLS; ข้อมูลจากการกดยืนยันบันทึกจะไม่หายเมื่อ reload หลังขึ้นสถานะ “บันทึกใน Supabase แล้ว”
- `portal_save_workspace` ใช้ expected revision เพื่อหยุดการเขียนทับจากอีกหน้าต่าง มีสถานะบันทึก ลองใหม่ และดาวน์โหลดข้อมูลที่ค้าง
- ไม่มีฐานข้อมูลเดิมให้ dump: ต้นทางเป็น static prototype ที่มี fixture ใน source เท่านั้น ข้อมูลที่กรอกค้างใน browser ของผู้ใช้ก่อนย้ายไม่สามารถดึงกลับจาก source ได้

## บัญชีและอีเมล — ต้องตั้งค่า URL ก่อนใช้อีเมล

เข้าสู่ระบบด้วย Supabase email/password; มีสมัครบัญชีทดสอบ, ออกจากระบบ, ลืมรหัสผ่านและตั้งรหัสผ่านใหม่ บัญชีนี้แยกจาก ChatGPT

หลังได้ URL production ให้ตั้ง Supabase → Authentication → URL Configuration:

- **Site URL:** URL production ของเว็บไซต์นี้
- **Redirect URLs:** `https://<production-domain>/login.html` และ `https://<production-domain>/reset-password.html`

ตั้ง SMTP ขององค์กรหากต้องส่งอีเมลให้ผู้ใช้ทั่วไป: ตัวส่งเริ่มต้นของ Supabase อาจจำกัดผู้รับและอัตราส่ง ไม่มีการสร้างบัญชีผู้ใช้หรือส่งอีเมลจริงโดยอัตโนมัติระหว่างย้าย ให้เจ้าของสร้างบัญชีจากหน้า “สร้างบัญชีทดสอบ” หลังตั้ง URL/SMTP แล้ว

## ขอบเขต

ข้อมูลธุรกิจทุกระบบยังเป็น `TEST_` และ workflow จำลอง; เพิ่มเฉพาะบัญชีจริงกับการบันทึกพื้นที่ทดสอบต่อบัญชี ระบบสิทธิ์งาน 01–09 ยังเป็นตัวอย่างบนหน้าจอ ไม่ใช่ระบบสิทธิ์ส่วนกลางหลายหน่วยงาน ไม่มีการรับเอกสารลับจริง ลงนาม อนุมัติการเงิน ประกาศผลสอบจริง หรือรับใบสมัครจริง

ฐานข้อมูลเป็น snapshot ของ prototype ไม่ใช่ relational schema ของ Person/Organization/File/ExamSession สำหรับ production ต้องแยกตารางธุรกิจ กำหนดสิทธิ์และกติกาฝั่ง server และทดสอบกับเจ้าของงานก่อนใช้จริง

ดู [รายละเอียดการย้าย](docs/HOSTING_MIGRATION.md), [ระบบบัญชี](docs/AUTHENTICATION.md), [ข้อค้างนโยบายเดิม](docs/OPEN_QUESTIONS.md) และเอกสาร Systems 01–09 ใน `docs/` เอกสารเดิมที่กล่าวถึง browser memory เป็นหลักฐานของต้นแบบก่อนย้าย ไม่ใช่สถาปัตยกรรมการบันทึกรุ่นนี้


### ข้อยกเว้นไฟล์เผยแพร่

เผยแพร่สำเนาแม่แบบ 5 ไฟล์ที่ผ่านการตรวจและลบชื่อผู้จัดทำแล้ว ส่วนไฟล์นักธรรม 3 ไฟล์คงไว้นอก repository/โฮสต์สาธารณะ หลัง automatic approval review ปฏิเสธไฟล์หนึ่งในกลุ่มนี้เพราะข้อมูลระบุตัวบุคคล/embedded content แม้ลบ metadata บางส่วนแล้ว หน้าดาวน์โหลดเปิดเว็บไซต์ dhammastudy.org ของเจ้าของแบบแทน จึงไม่มีลิงก์ไฟล์ที่หายไป.
