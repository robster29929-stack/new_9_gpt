# การย้าย frontend เป็น Next.js — 17 ตุลาคม 2569

## สิ่งที่เปิดตรวจได้

แอปใหม่อยู่ใน `apps/web` ใช้ Next.js App Router 16.4.2, React 19.3.1,
TypeScript strict, Tailwind 4.3.3 และ primitives ที่ดัดแปลงจาก shadcn/ui
โดยไม่เพิ่ม Slot/CVA/class-merging libraries นอก Stack ใช้ Zod + React Hook Form,
TanStack Table 8.21.3, ExcelJS 4.4.0 และ Recharts 3.10.1 จริงในหน้าจอ

TanStack Table ใช้ API v8 ที่ตรวจ build แล้ว ไม่อ้างว่าใช้ major ล่าสุด
เก็บ dependency แบบ exact และ lockfile ในแอปใหม่แยกจาก runtime เดิม

- `/workspace/`: ภาพรวม กราฟ และเมนู 9 ระบบ
- `/workspace/{people,organizations,learning,requests,admissions,budget,assets,correspondence,exam-import}/`
  แสดง DTO สาธิต ค้นหา เรียงลำดับ แบ่งหน้า และส่งออก Excel
- ระบบ 09 ตรวจไฟล์ `.xlsx` TEST_ ที่ส่งออกจากตาราง แสดงเพียงจำนวนรายการที่ผ่าน
  ไม่เขียนข้อมูลหรือเขียนทับ และไม่ส่งไฟล์ไป server
- ตัวอักษรพื้นฐาน 18px (17px บนจอเล็ก), ข้อความขึ้นบรรทัดตามคำ,
  ตารางบนจอเล็กเลื่อนในกรอบได้ และปุ่ม/ช่องกรอกมีพื้นที่สัมผัสอย่างน้อย 48px

แหล่งข้อมูลคือ `supabase/seed_snapshot.json` เดิมใน repository เท่านั้น
build-time projection ส่งออกเฉพาะ id/name/type/status และบังคับรหัส TEST_
ไม่คัดลอกข้อมูลผู้ใช้หรือข้อมูล live ของ Site/Supabase มาใส่ใน build
ไม่มีตาราง Person/Temple/Place/Area หรือ schema ทดแทนใหม่

## ขอบเขตที่ยังไม่ผ่านและห้ามอ้างว่าเสร็จ

นี่คือ migration preview แบบอ่านข้อมูลสาธิต ไม่ใช่การย้ายฟีเจอร์ทั้ง 9 ระบบสำเร็จ
ยังไม่มี create/edit/detail workflows, role/area-based pages, audited server actions,
Supabase SSR Auth/Storage, can_access(), settings adapter หรือ data migration
ฟังก์ชันเดิมใน `dist` ไม่ได้ถูกแปลงเป็น React ทุกจุด

ยังไม่ได้เพิ่ม Leaflet หรือ @react-pdf/renderer เพราะยังไม่มีการเชื่อมสถานที่กลาง
หรือชุดเอกสาร/ไฟล์ฟอนต์ TH Sarabun New ที่ตรวจแล้ว ไม่ใช้ Sarabun รุ่นอื่นแทน
Static export ระยะนี้ไม่มี Server Actions; เมื่อได้ canonical design และ dev
ต้องเปลี่ยนเป็น server deployment และเพิ่ม Zod → authorize → write+audit แบบ atomic
ก่อนเปิดการเขียนข้อมูลจริง

Excel preview นี้ไม่ใช่ production upload pipeline: ยังต้องมี sandbox/ZIP expansion
limits, authorization, schema-specific validation, provenance และ transaction/audit
ตามแบบก่อนรับไฟล์จริง ห้ามอ้างว่า unit tests ทดแทนการตรวจ RLS/สิทธิ์พื้นที่

## เป้าหมายการเผยแพร่

- GitHub: ใช้ branch `chore/stack-compliance-foundation` และ Draft PR #1 ต่อ
- Vercel: branch preview ของ project `kung-robster/new_9_gpt-i9kg`
  ใช้ install/build ของ `apps/web` และเสิร์ฟ `apps/web/out`
- CSP ของ preview ยอมรับ inline bootstrapping ของ Next static export แต่
  `connect-src 'self'` ไม่อนุญาต Supabase/remote API; ไม่มี authenticated/private
  data ใน preview การย้าย server production ต้องออกแบบ nonce/CSP ใหม่
- `main`/production เดิมไม่เปลี่ยน ห้าม merge จนทดสอบ parity และ integration ครบ
- Site ต้นทาง version 24 / aa8703f ใช้เป็นฐานตรวจ ยังไม่แทนที่ `/workspace`
  ด้วยหน้าดูข้อมูลสาธิตที่ทำงานไม่ครบของเดิม
- ไม่ใช้ Supabase connector หรือแก้ `ffgedvyumiyujlfuimrj` เพราะยังไม่ยืนยัน dev
- applied migration hash คงเดิม; ไม่มี SQL ใหม่ถูกรัน ไม่มี DB dump/secret ถูก commit

## ตรวจในเครื่อง

```sh
npm ci --prefix apps/web
npm run build:web
npm run typecheck:web
npm run test:web
npm --prefix apps/web run test:e2e -- --list
```

Next build สร้าง 13 pages (รวม not-found และเส้นทางภายใน) ผ่าน strict typecheck
และ prerender; TypeScript strict แยกผ่าน; unit tests ใหม่ 20/20 ผ่าน
โดยครอบคลุม DTO ทุกระบบ, projection/privacy, search, invalid IDs และ Excel
roundtrip/header/formula/duplicate/size guards

`npm audit --omit=dev`: ไม่พบ high/critical แต่มี moderate 2 รายการ
(ExcelJS ผ่าน transitive uuid; advisory เรื่อง buffer bounds ของ v3/v5/v6)
ยังไม่ได้เปลี่ยน major/downgrade dependency อัตโนมัติ ต้องทบทวนเส้นทางใช้งาน
และแก้/ประเมินก่อนเปิด production import pipeline

Playwright พบ 24 cases (12 × desktop/mobile) แต่ยังไม่รัน browser:
Chromium ไม่มี executable จากปัญหา archive ในรอบก่อน และ managed preview
ไม่มี control-browser skill จึงไม่ติดตั้ง browser หรืออ้าง E2E PASS
เมื่อมี infrastructure ให้ใช้ BASE_URL ของแอป Next (ไม่มี `/next` basePath)
แล้วรัน `npm --prefix apps/web run test:e2e` บน preview ที่ได้รับอนุญาต

## ข้อมูลที่ต้องได้รับก่อนย้ายฐาน/production ต่อ

1. `docs/design.md` ฉบับ authoritative หัวข้อ 4 รวม central tables, settings,
   area hierarchy, can_access() และ audit_logs
2. Supabase project ref ที่ยืนยันว่าเป็น dev ตามข้อกำหนดผู้ใช้
3. ทำ feature parity ทีละระบบ พร้อม schema/logic unit + main-path e2e,
   cross-area RLS negative tests, rollback และตรวจ advisors บน dev
