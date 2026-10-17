# การย้ายหน้าเว็บเป็น Next.js / React

วันที่ 17 ตุลาคม 2569 · baseline main `d34e9553696b12cefabdef0fd453abc20a260c7f`

## เทคโนโลยีที่ใช้จริง

- Next.js App Router 16.4.2 และ React/React DOM 19.3.1
- TypeScript 7.0.2: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, allowJs false
- Tailwind CSS 4.3.3; Button/Card เป็น native primitives ที่ปรับจาก shadcn/ui ไม่ได้ติดตั้ง Radix/Slot/CVA หรืออ้างว่าใช้ชุด shadcn ทั้งหมด
- Supabase JS 2.118.0; Zod, React Hook Form, TanStack Table, ExcelJS, Recharts
- Vitest สำหรับ logic/schema; Playwright สำหรับ browser; สคริปต์ Node เดิมคงไว้ตรวจ regression
- ฟอนต์ self-hosted เดิมผ่าน next/font/local

## ขอบเขตที่ย้าย

| ส่วน | การทำงานใน React |
|---|---|
| บัญชี | เข้าสู่ระบบ สมัคร ลืมรหัสผ่าน ตั้งรหัสผ่านใหม่ ออกจากระบบ และข้อความภาษาไทย |
| 01 | ค้นหา/กรองบุคคล รายละเอียด แก้ไข ตำแหน่งหลายรายการ ภาค 1–18 และยกเลิก/คืนสถานะแบบ soft delete |
| 02 | หน่วยงาน/สนามสอบ 10 ประเภท ผู้ประสานงาน ประธาน และผู้รับข้อสอบต่อรอบ |
| 03 | 68 รายวิชา นักธรรม ธรรมศึกษา 9 ช่วงชั้น และบาลี พร้อมสถานะเนื้อหา/ข้อสอบที่ยังไม่รับรอง |
| 04 | คำขอ จัดตั้ง/ยุบ/เปิด/ปิด/ย้าย กรอง รายละเอียด และยืนยันลำดับสถานะ TEST_ |
| 05 | บัญชีสมัคร รายละเอียด/แก้ไข ค้นผลสอบจากชุดที่เผยแพร่ (ขณะนี้ไม่มี) และดาวน์โหลดแบบบัญชี |
| 06 | แผน ภาพรวม โอน ผูกพัน เบิกจ่าย คืนเงิน กระทบยอด ปิดงวด และสร้างร่างจำนวนเต็มสตางค์โดยตรวจยอดสำรอง |
| 07 | ทะเบียน/ยอดคงเหลือ Stock card ขอซื้อ รับ เบิก คืน โอนคู่ ยืม/คืนยืม ซ่อม ตรวจนับ และคำขอจำหน่าย |
| 08 | กล่องรับ/ส่ง/ร่าง/แจ้งงาน ปกปิดเอกสารจำกัดสิทธิ์ สร้างจดหมายเวียนแยกผู้รับหลัง preview และสถานะส่ง/รับทราบจำลอง |
| 09 | แบบบัญชี 4 ประเภท ตรวจชั้น/ประเภทผู้สมัคร/ชื่อซ้ำ preview และยืนยันนำเข้า TEST_ |
| ส่วนกลาง | เมนู mobile ตารางเรียง/ค้นหา/แบ่งหน้าและช่องไปหน้า Excel preview/ยืนยันเขียนทับ บันทึกอัตโนมัติ สำรองข้อมูล สิทธิ์และประวัติ TEST_ |

หน้าใหม่เป็น JSX/TSX จริง ไม่ใช้ dangerouslySetInnerHTML ไม่ใช้ iframe และไม่โหลด runtime JavaScript เดิม ไฟล์เก่ายังคงอยู่ใน git เป็น reference โดยไม่ได้เผยแพร่เป็น public pages

## สัญญาข้อมูลและการบันทึก

- คง schemaVersion 1 และทุก collection เดิม; snapshot codec เก็บฟิลด์เพิ่มเติมโดยไม่ตัดทิ้ง
- ใช้ `portal_save_workspace` เดิมและ expected revision เดิม; เซฟเรียงลำดับไม่แข่งกัน
- เมื่อ revision conflict: คงข้อมูลที่ยังไม่เซฟ ปิดการเขียนเพิ่ม ให้ดาวน์โหลดสำรองและโหลดใหม่ ไม่ retry เขียนทับอัตโนมัติ
- สิทธิ์จริงของพื้นที่ยังอิง auth.uid()/RLS ในฐานเดิม สิทธิ์/บทบาทที่แก้ผ่านหน้าทดสอบไม่มีอำนาจเปลี่ยนสิทธิ์บัญชี
- การแก้ไขและเหตุการณ์ TEST_ อยู่ snapshot เดียว จึงถูกบันทึกด้วย CAS เดียวกัน ไม่อ้างว่าติดตั้ง `audit_logs` สำหรับ production แล้ว
- สถานะการจำลองและ soft delete อยู่ใน `src/core/workflow/test-portal.ts`; transition engine ฝั่ง server ที่เตรียมใน foundation ยังไม่ถูกนำมาอ้างเป็นระบบสิทธิ์จริง
- ไม่สร้างตารางกลางทดแทน ไม่ใช้ connector กับ project ที่ยังไม่ยืนยัน dev ไม่เปลี่ยน migration ที่รันแล้ว

SHA-256 migration เดิมก่อน/หลัง: `24018012e1de2ef55aa672a587811bcf25933e36b395a627ea32487c2f8587cf`

## Security และ compatibility

- ไม่เพิ่ม secret/.env จริง หรือข้อมูลบุคคลจริง; config เดิมมีเฉพาะ URL/publishable key
- CSP ใช้ nonce ใหม่แต่ละ response กับ strict-dynamic สำหรับ Next bootstrap; ไม่เปิด script unsafe-inline/unsafe-eval และจำกัด connect-src เฉพาะ Supabase เป้าหมาย
- Next render แบบ dynamic เพื่อให้ nonce ไม่ถูกนำกลับมาใช้จาก cache; Proxy ไม่ได้ถูกใช้เป็นหลักฐาน authorization
- React escape ข้อความตามปกติ; ไม่มีการนำเนื้อความผู้ใช้ไปแปลงเป็น HTML
- ExcelJS โหลดเมื่อใช้ Excel; จำกัดนามสกุล/ขนาด/แถว/หัวคอลัมน์ และปฏิเสธสูตร มาโคร ลิงก์ภายนอก/ไฟล์ฝัง และ zip ที่มีขนาดเกินกำหนด
- เลขประจำตัวประชาชนยังไม่เปิดรับ/เปิดเผยใน UI ใหม่
- ลิงก์ .html และ callback อีเมลเก่าเปลี่ยนไป route React โดยเก็บ query/fragment ตาม browser redirect
- แบบฟอร์ม 5 ไฟล์ที่เผยแพร่แล้วและฟอนต์คัดลอกโดยไม่เปลี่ยนเนื้อหา; แบบนักธรรมที่เคยไม่อนุมัติไม่ถูกเพิ่ม

## ผลตรวจและขอบเขตหลักฐาน

ผลสุดท้ายบันทึกหลังตรวจครบในหัวข้อท้ายรายงานนี้

Browser tests ใช้ production build และ mock เฉพาะขอบเขต Supabase HTTP ด้วย fixture เดิม ไม่ bypass Auth ใน app code ไม่มี demo login สำหรับ production และไม่เรียกฐานจริง/ส่งอีเมลจริง Tests จึงไม่ใช่หลักฐาน SMTP หรือ cross-account RLS ของ Supabase จริง

Dependency audit: high/critical 0; moderate 2 (ExcelJS และ uuid transitive, GHSA-w5hq-g745-h8pq) Advisory กล่าวถึง v3/v5/v6 เมื่อส่ง buffer; ExcelJS ที่ตรวจใช้ `uuid.v4()` ยังไม่ปรับ dependency เป็นรุ่นที่ไม่เข้ากันโดยอัตโนมัติ

Browser binary สำหรับทดสอบเป็นเครื่องมือชั่วคราวนอก repo; ไม่เพิ่ม browser runtime package เข้า app หรือ lockfile หาก Playwright download ปกติใช้ได้ ให้ใช้ `npx playwright install chromium` ตาม README

## ข้อค้างเดิมของต้นแบบ

Auth URL/SMTP, admin จริง, canonical tables/settings/can_access/audit_logs และเอกสาร design ที่อนุมัติยังไม่ได้รับการแก้ด้วยการเปลี่ยน frontend คำว่า “ย้ายครบ” ในรายงานนี้หมายถึงหน้าและฟังก์ชันของต้นแบบเดิม ไม่ใช่รับรองระบบธุรกิจ production 9 ระบบครบตามข้อกำหนดทั้งหมด

## ผลตรวจสุดท้ายก่อน push

- Next route type generation และ TypeScript strict: PASS
- Vitest: **70/70 PASS** (domain/schema/persistence และ core foundation)
- Legacy smoke: PASS; Node auth/persistence: **7/7 PASS** เฉพาะ regression reference
- Next.js production build: PASS; App Router และ Proxy ใช้ Next runtime จริง
- Playwright: **62/62 PASS** (31 desktop + 31 mobile) กับ production build และ Supabase HTTP mocks
- ตรวจภาพหน้า workspace desktop/mobile และฟอนต์ self-hosted แล้ว; ไม่มี horizontal overflow ของ document ใน routes ระบบ 01–09
- ตรวจ callback ยืนยันอีเมลเดิม, reset password, .html redirect, create/edit/reload, soft delete/restore, stock, budget, mail merge, exam preview/commit, simulated roles, revision conflict/backup และ nonce CSP
- ไม่มี diff ใน supabase/; ไม่มีไฟล์ repo ถูกลบ ไม่มี force push/reset --hard; font/form copies byte-identical กับ baseline
- Secret-pattern scan ของไฟล์ที่เตรียม commit ไม่พบ sb_secret_ หรือ .env จริง

ผลนี้ไม่รวมการทดสอบ SMTP/บัญชีจริง หรือเปลี่ยน/ตรวจ policy บน Supabase จริง ซึ่งยังอยู่ภายใต้ข้อกำหนด dev-only และ canonical design ของผู้ใช้
