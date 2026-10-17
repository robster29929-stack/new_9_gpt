# ย้าย GitHub / Supabase / Vercel — 2026-10-17

## เป้าหมายที่ผู้ใช้ระบุ

- GitHub: https://github.com/robster29929-stack/new_9_gpt (Public ตามสถานะเดิม)
- Supabase: https://supabase.com/dashboard/project/ffgedvyumiyujlfuimrj (`new_9_gpt`, Singapore)
- Vercel team: `kung-robster` (`team_aMImcigCsLVbYQzV5EB2c62a`)
- ต้นทาง Sites version 24 / source `aa8703f34cdf2118cec818383dc8fa6a7325f71f`

## สิ่งที่ย้าย

- HTML/CSS/JS ของ 9 ระบบ พร้อมการปรับตัวอักษร, modal, navigation, pagination, Excel/CSV และจดหมายเวียน
- ไฟล์แม่แบบบัญชี 8 ไฟล์ และ TEST import workbook
- เอกสารและ regression tests เดิม โดยปรับ assertions ส่วนบัญชีให้ตรง Supabase
- ข้อมูล fixture ของบุคคล 4, องค์กร/สนามสอบ 10, คำขอ 9, สมัครบาลี 3, แผนงบ 3, ทะเบียนพัสดุ 3, สารบรรณ 4; catalog 68 รายวิชา; movements/loans/maintenance/counts/disposals/purchases/permissions/budget events ใน seed JSON
- ไม่ย้าย Sites project identity/credentials/history, .env, รหัสผ่าน หรือ service-role key

## การบันทึก

ข้อมูลต่อบัญชีเก็บ JSONB ใน `portal_workspaces`; seed ทั้งหมดอยู่ใน `portal_seed` RLS และ grants ปฏิเสธ anonymous; บัญชีอ่าน/เขียนได้เฉพาะ user_id ของตัวเอง ฟังก์ชัน save เป็น SECURITY INVOKER, ตรวจ owner ID และ expected revision; ถ้า revision ไม่ตรง จะหยุด autosave และให้ดาวน์โหลดสำรอง/โหลดข้อมูลใหม่

ไม่รวมร่างที่ยังไม่กดยืนยันใน modal หรือ preview Excel ที่ยังไม่ commit การออกจากระบบรอการบันทึก; ก่อนปิด/โหลดหน้าใหม่ขณะมีข้อมูลค้าง browser จะแจ้งเตือน การบันทึก offline ยังไม่ใช่ offline-first และไม่มีการเก็บ snapshot ส่วนบุคคลใน localStorage

## ผลตรวจ

- JavaScript syntax, build และ regression ระบบ 01–09 ผ่าน
- unit tests ของ auth adapter และ save queue/retry/conflict ผ่าน 7 กรณี
- Supabase schema/seed ติดตั้งแล้ว; SECURITY INVOKER และ RLS เปิดบนตารางทั้งสอง
- Security advisors หลัง migration ไม่พบข้อเตือน; revoke การเรียก platform helper `rls_auto_enable` ผ่าน API โดยคงตัว event trigger เดิม
- การทดสอบ SQL แบบสร้าง test users ภายใน transaction/rollback ไม่สำเร็จผ่าน connector (`Invalid or expired requestState`) จึงไม่อ้างว่า integration test นี้ผ่าน ใช้การตรวจ policy/grants และ Data API แทนในรอบนี้
- ไม่มีบัญชีหรืออีเมลจริงถูกสร้าง/ส่งระหว่างการย้าย
- ยังไม่ได้ทดสอบภาพด้วย browser หรือวงจรยืนยันอีเมล/reset ของเจ้าของจริง

## งานที่ยังแยกจากการย้าย

นโยบาย/เจ้าของตาม OQ เดิม, schema ธุรกิจแบบ relational, สิทธิ์หลายหน่วยงาน, maker-checker, audit กลาง, เอกสารจริง, official results และ transaction ของงบ/พัสดุฝั่ง server ยังไม่ใช่ขอบเขตที่เสร็จจากการย้ายครั้งนี้

Auth URL และ SMTP ต้องตั้งใน Supabase Dashboard ตาม README ก่อนใช้ลิงก์ยืนยัน/รีเซ็ตจริง เครื่องมือที่มีไม่สามารถแก้ Auth configuration ได้


## สำเนาเผยแพร่สาธารณะ (2026-10-17)

ไฟล์แม่แบบทั้ง 8 ไฟล์ใน repository เป็นสำเนาที่ลบ Author/Last Saved By จาก metadata แล้ว ตรวจแล้วว่าไม่มีรายชื่อผู้สมัครกรอกอยู่ และ cell/formula/format streams ไม่เปลี่ยนจากต้นฉบับ ชื่อไฟล์และหน้าดาวน์โหลดคงเดิม ต้นฉบับใน Sites ไม่ถูกแก้ไข.


### ข้อยกเว้นไฟล์เผยแพร่

เผยแพร่สำเนาแม่แบบ 5 ไฟล์ที่ผ่านการตรวจและลบชื่อผู้จัดทำแล้ว ส่วนไฟล์นักธรรม 3 ไฟล์คงไว้นอก repository/โฮสต์สาธารณะ หลัง automatic approval review ปฏิเสธไฟล์หนึ่งในกลุ่มนี้เพราะข้อมูลระบุตัวบุคคล/embedded content แม้ลบ metadata บางส่วนแล้ว หน้าดาวน์โหลดเปิดเว็บไซต์ dhammastudy.org ของเจ้าของแบบแทน จึงไม่มีลิงก์ไฟล์ที่หายไป.
