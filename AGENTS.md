# ข้อกำหนดพัฒนา new_9_gpt

ข้อกำหนดจากผู้ใช้ 17 ตุลาคม 2569 มีผลเหนือแนวทางเดิมที่ขัดกัน

## Stack ที่อนุญาต
Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase (Postgres/Auth/Storage/RLS/ltree/pg_trgm/pgcrypto), Zod, React Hook Form, TanStack Table, ExcelJS, @react-pdf/renderer + TH Sarabun New, Recharts, Leaflet, Vitest, Playwright, Vercel

## ความปลอดภัย
- ไม่แสดง/commit secret key หรือ .env จริง; publishable key ไม่ใช่ secret แต่ config สภาพแวดล้อมใหม่ต้องไม่ hardcode
- ไม่มีข้อมูลบุคคลจริงใน seed/test/commit ใช้ TEST_ และ .test/.invalid เท่านั้น
- Supabase connector ใช้กับ dev ที่ยืนยันแล้วเท่านั้น ตอนนี้ยังไม่ยืนยันว่า ffgedvyumiyujlfuimrj เป็น dev จึงห้ามใช้ connector กับ project นี้
- ห้ามลบไฟล์, force push หรือ reset --hard โดยไม่ถาม
- migration ที่รันแล้วห้ามแก้ไข เพิ่ม migration ใหม่เท่านั้น; baseline hash อยู่ใน docs/STACK_COMPLIANCE_AUDIT.md

## กฎเหล็ก
1. บุคคล วัด สถานที่ และพื้นที่ใช้ตารางกลางใน docs/design.md หัวข้อ 4 เท่านั้น ขณะยังไม่มีเอกสาร ห้ามสร้างตารางทดแทนหรือเดาชื่อ/ลายเซ็น can_access()
2. ทุกตารางมี RLS; ข้อมูลตามพื้นที่ใช้ can_access() ตามสัญญาที่อนุมัติ
3. Server Action ทุกตัว: Zod -> authorize -> เขียน -> audit_logs; การเขียนกับ audit ต้องอยู่ transaction เดียว
4. ทุกการเปลี่ยนสถานะผ่าน src/core/workflow รวม soft-delete/restore ห้ามแก้ status ตรงใน UI/service
5. ไม่ลบจริง ใช้ deleted_at และสถานะตาม workflow
6. UI/แจ้งเตือนภาษาไทย วันที่ พ.ศ. ปีงบ 1 ต.ค.–30 ก.ย.
7. เลขประจำตัวประชาชนเข้ารหัสฝั่ง server; ปกปิดโดยปริยายและตรวจสิทธิ์ reveal แยก
8. ชื่อหน่วยงานและค่าตั้งค่าอ่าน settings ไม่ hardcode; secret encryption keys ใช้ secret store ฝั่ง server ไม่เก็บค่าลับลง settings/client
9. ทุกฟีเจอร์มี schema/logic unit tests และ e2e ของเส้นทางหลัก; RLS มี negative/cross-scope tests
10. ไลบรารีนอก Stack ต้องบันทึกเหตุผลใน docs/decisions.md และได้รับคำยืนยันก่อนเพิ่ม ปัจจุบันบันทึกเดิมชื่อ docs/DECISIONS.md; อย่าสร้างสองชื่อที่ชนกันบนระบบ case-insensitive
11. ห้ามแก้ applied migration; ตรวจ hash ก่อนและหลังทำงาน

## สถานะการย้าย
Branch foundation เป็นงานเตรียมส่วนกลาง ไม่ใช่หลักฐานว่าระบบเดิมผ่านกฎทั้งหมด ห้ามเรียกใช้ adapter จำลองกับ production และห้าม merge/deploy การย้ายฐานจนได้ canonical design และ dev target
