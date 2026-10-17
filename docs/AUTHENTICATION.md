# บัญชีเว็บไซต์หลังย้ายมา Vercel

อัปเดต 2026-10-17

- `/` และ `/login.html`: Supabase email/password
- `/signup.html`: สร้างบัญชีทดสอบและยืนยันอีเมลตามการตั้งค่าของ Supabase
- `/forgot-password.html`: `resetPasswordForEmail` พร้อม `redirectTo` ที่ origin ปัจจุบัน
- `/reset-password.html`: รับ recovery session หรือ token hash จาก Supabase แล้ว `updateUser({password})`; รหัสใหม่ขั้นต่ำ 12 ตัวอักษร
- ปุ่มออกจากระบบบันทึกข้อมูลที่ค้างก่อน แล้วใช้ `supabase.auth.signOut()`; ปุ่ม “ปิดโหมดทดสอบ” แยกจากการออกจากบัญชี
- `/workspace.html` ตรวจ session และ `getUser()` ก่อนแสดงพื้นที่ทำงาน; RLS ของฐานข้อมูลผูก `auth.uid()` กับ user_id
- ใช้ SDK Supabase ที่ bundle ในเว็บไซต์ ไม่โหลด JS ภายนอก; publishable key ไม่มีสิทธิ์ admin
- สิทธิ์จำลองในหน้า System administration ไม่เปลี่ยน RLS และไม่ให้สิทธิ์อ่านพื้นที่ของบัญชีอื่น

## ต้องตั้งใน Supabase Dashboard

ที่ Authentication → URL Configuration ตั้ง Site URL เป็น production origin และ allowlist `/login.html` กับ `/reset-password.html` ของ origin นั้น ไม่มี wildcard ข้ามโปรเจกต์

ที่ SMTP Settings ตั้งผู้ส่งขององค์กรหากจะส่งอีเมลให้บัญชีทั่วไป บริการเริ่มต้นอาจจำกัดผู้รับ/อัตราส่ง

เครื่องมือ Supabase ที่เชื่อมในรอบนี้ไม่มี API สำหรับแก้ Auth URL/SMTP configuration จึงไม่ได้แก้ค่าดังกล่าว และไม่ได้ทดสอบส่งอีเมลจริง ไม่มีการสร้างรหัสผ่านแทนเจ้าของหรือส่งคำเชิญให้บุคคลอื่น

## การตรวจ

- Mock SDK tests: login สำเร็จ/ผิดรหัส, recovery redirect ที่ origin เดียวกัน, ไม่ตั้งรหัสเมื่อไม่มี session และ update/signout หลังเปลี่ยนรหัส
- Auth/user endpoints จริงและการส่งอีเมลยังต้องทดสอบด้วยบัญชีเจ้าของหลังตั้ง URL/SMTP
- RLS ใช้ owner ID จาก JWT ฝั่งฐานข้อมูล ไม่ใช้ user_metadata ตัดสินสิทธิ์
