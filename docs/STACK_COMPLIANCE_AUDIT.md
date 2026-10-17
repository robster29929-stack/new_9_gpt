# ตรวจ Stack และกฎเหล็ก — 17 ตุลาคม 2569

## ขอบเขตและผลโดยรวม

ฐานตรวจ: GitHub main `a5836954e1572785e60fc53fc47e1de62cc62914` เว็บไซต์ปัจจุบันเป็น static HTML/JavaScript กับ Supabase Auth และ JSONB snapshots ต่อบัญชี จึง **ยังไม่ผ่าน Stack/กฎทั้งหมด** การเพิ่ม dependency หรือ helper ไม่เท่ากับการย้ายฟีเจอร์สำเร็จ

งานเตรียมแยกใน `chore/stack-compliance-foundation` ไม่แก้ applied migration ไม่ใช้ Supabase connector ไม่แก้ production deployment และไม่สร้างตารางกลางขึ้นเอง

## ตารางเทียบเทคโนโลยี

| เทคโนโลยีเป้าหมาย | ผลตรวจ source ปัจจุบัน | งานที่ต้องทำ |
|---|---|---|
| Next.js App Router | ยังไม่มี app/ หรือ Next build; vercel.json เสิร์ฟ dist | ย้าย routes/layout/server boundaries จาก static แล้วเทียบฟีเจอร์เดิม |
| TypeScript strict | เพิ่ม strict สำหรับ core ใหม่; legacy app.js ยังไม่ typed | ย้ายทุก module แล้วขยาย strict coverage; ห้ามนับ helper ว่าครบทั้งแอป |
| Tailwind + shadcn/ui | ยังเป็น CSS เดิม ไม่มี component system นี้ | ย้าย design tokens/primitive/form/table โดยคงตัวอักษรอ่านง่าย |
| Supabase Postgres/Auth/RLS | มี SQL snapshots + browser SDK Auth, owner RLS | ย้ายข้อมูลผ่าน canonical schema/สิทธิ์พื้นที่ และ server-side auth |
| Supabase Storage | ยังไม่มี private file workflow | ใช้ storage/file model กลางจาก design; ACL/quarantine/soft-delete |
| ltree / pg_trgm / pgcrypto | ไม่ปรากฏใน migration เดิม; ไม่ตรวจ live DB เพราะยังไม่ยืนยัน dev | ตรวจ availability/versions บน dev แล้วเพิ่ม migration ใหม่ |
| Zod | เพิ่มที่ workflow/action contract ใหม่ | ย้าย schema ของทุก form/action/import มาตรวจจริง |
| React Hook Form | ยังไม่มี | ใช้ร่วม Zod ในฟอร์ม Next ใหม่ |
| TanStack Table | ยังไม่มี; legacy render HTML table | ย้าย pagination/filter/selection ใน Next พร้อมขอบเขต server |
| ExcelJS | ยังไม่มี; legacy มี parser/writer เอง | ย้าย import/export พร้อม template/version และแยก preview/commit |
| @react-pdf/renderer + TH Sarabun New | ยังไม่มี PDF component/font bundle | เตรียมฟอนต์ที่ได้รับสิทธิ์ ตรวจ Thai embedding และ pagination |
| Recharts | ยังไม่มี | ย้ายกราฟที่อิงข้อมูลจริงตามสิทธิ์/DTO |
| Leaflet | ยังไม่มี | ย้ายแผนที่โดยใช้สถานที่กลาง ไม่สร้างตารางซ้ำ |
| Vitest | เพิ่ม core tests 20 กรณี | ขยายทุก schema/logic เมื่อย้ายฟีเจอร์ |
| Playwright | เพิ่ม public account smoke บน desktop/mobile | ต้องเพิ่ม authenticated/role/area/workflow paths บน dev ที่ยืนยันแล้ว |
| Vercel | main เปิดใช้งานแล้ว; branch นี้ยังไม่ merge | ย้าย build config หลัง Next feature parity และ dev checks ผ่าน |

## ตารางเทียบกฎ 11 ข้อ

| ข้อ | หลักฐาน / สถานะ | การแก้ที่เตรียม |
|---|---|---|
| 1 ไม่สร้างบุคคล/วัด/สถานที่/พื้นที่ซ้ำ | ไม่พบ docs/design.md ใน main หรือชุด L001 ที่ตรวจ; blueprint ชื่ออื่นไม่ใช่ physical schema authority | หยุดการออกแบบตารางไว้ก่อน ขอ canonical section 4 |
| 2 ทุกตาราง RLS และ can_access() สำหรับพื้นที่ | migration เดิมเปิด RLS 2 ตาราง แต่เป็น owner-based snapshots; ไม่มี area function | ไม่เดา can_access signature/area model; รอ design และ dev target |
| 3 Zod → สิทธิ์ → เขียน → audit_logs | ไม่มี Next Server Actions/audit_logs schema; legacy เขียน snapshot โดยตรง | src/core/actions/execute-action.ts กำหนด contract ลำดับและ transaction write+audit; ยังไม่เชื่อม DB |
| 4 ทุก transition ผ่าน core workflow | legacy app.js ยังเปลี่ยน row.status โดยตรง | เพิ่ม src/core/workflow engine พร้อม revision/permission/graph checks; ต้องย้าย caller ทุกจุดภายหลัง |
| 5 deleted_at และสถานะ | ไม่มี soft-delete contract ใน snapshots | เพิ่มเฉพาะ migration ใหม่ตาม canonical schema; delete/restore เป็น workflow actions |
| 6 ไทย / พ.ศ. / ปีงบ | UI เดิมมีศัพท์อังกฤษและวันยังไม่ใช้ formatter กลาง | เพิ่ม Thai Buddhist formatter กับ fiscal-year boundary tests; timezone ต้องส่งมาจาก settings |
| 7 เลขประจำตัวเข้ารหัสและ masked | prototype ปฏิเสธคอลัมน์เลขบัตร ไม่ได้เป็นที่เก็บเลขบัตรจริง | เพิ่ม Node-only AES-256-GCM helper + permission-aware masked presenter; ยังไม่เชื่อม field/key provider/DB |
| 8 อ่านค่าตั้งจาก settings | fixtures/branding/project config ยัง hardcode และไม่มี settings contract | ไม่สร้าง settings table ทดแทนเอง; ต้อง map จาก design แล้วแยก secrets ไว้ server secret store |
| 9 unit + e2e ทุกฟีเจอร์ | มี legacy harness; core ใหม่มี 20 unit cases; Playwright ครอบคลุมเฉพาะ public paths | ยังไม่ผ่านทุกฟีเจอร์ ต้องเพิ่ม auth/role/area/negative workflows บน dev |
| 10 ไม่เพิ่มนอก Stack | เพิ่ม Zod, TypeScript, Vitest, Playwright; @types/node เป็น type definitions สำหรับ TypeScript | ไม่เพิ่ม runtime libraries นอก Stack; adapter/dependency เพิ่มเติมต้องบันทึกและยืนยันก่อน |
| 11 applied migration immutable | hash ก่อน/หลังเหมือนกัน; ไม่มี SQL ใหม่รันในงานนี้ | ตรึง hash และเพิ่ม migration ใหม่เมื่อมี canonical design/dev target |

## Applied migration baseline

- `supabase/migrations/20261017102044_portal_workspaces.sql`
- SHA-256: `24018012e1de2ef55aa672a587811bcf25933e36b395a627ea32487c2f8587cf`

ไม่มีการลบไฟล์ force push หรือ reset --hard ไม่มีการใช้ connector กับ Supabase ในรอบตรวจตามข้อกำหนดใหม่นี้

## สัญญาของ core ที่เพิ่ม

- Workflow graph/status definitions มาจาก design/settings ที่อนุมัติ ไม่ฝัง business statuses ขององค์กรใน engine
- authorize/permission flags ต้องได้จาก server auth และ can_access() ห้ามรับจากฟอร์มหรือ user_metadata
- transaction adapter ต้อง rollback หาก write หรือ audit ล้มเหลว; unit test ใช้ fake adapter จึงไม่ใช่หลักฐาน transaction บน Postgres จริง
- audit DTO ไม่รับ raw form payload/เลขประจำตัว/secret เป็นค่าเริ่มต้น
- Crypto เป็น helper สำหรับ server เท่านั้น; กุญแจสุ่มใน test ถูกสร้างขณะรัน ไม่มี key หรือข้อมูลบุคคลจริงในไฟล์
- encryption key lifecycle, KMS/secret provider, rotation และ DB mapping ต้องกำหนดต่อก่อนเก็บเลขบัตรจริง

## เงื่อนไขที่ยังขาด

1. docs/design.md ฉบับ authoritative โดยเฉพาะหัวข้อ 4: ชื่อตาราง/PK/FK/area hierarchy/settings/audit และสัญญา can_access()
2. Supabase project ref ที่ยืนยันชัดว่าเป็น dev และอนุญาต connector; ห้ามถือว่า project ที่เว็บเผยแพร่ใช้อยู่เป็น dev โดยอัตโนมัติ
3. สิทธิ์ไฟล์ฟอนต์ TH Sarabun New และข้อกำหนดเอกสารสำหรับ PDF; ไม่นำฟอนต์อื่นมาอ้างแทน

## แหล่งอ้างอิงทางเทคนิค

- Next.js App Router: https://nextjs.org/docs/app
- TypeScript configuration: https://nextjs.org/docs/app/api-reference/config/typescript
- Supabase extensions: https://supabase.com/docs/guides/database/extensions
- ใช้คำสั่ง npm view ตรวจเวอร์ชันก่อน pin dependency; เก็บ package-lock.json


## ผลทดสอบ branch foundation

- `npm run typecheck`: ผ่าน (strict พร้อม noUncheckedIndexedAccess/exactOptionalPropertyTypes)
- `npm run test:core`: Vitest 20 กรณี / 4 ไฟล์ ผ่าน
- `npm run test:legacy`: ผ่าน — smoke harness ระบบ 01–09 และ auth/persistence 7 กรณี (fail 0)
- Playwright เตรียม 6 tests (3 เส้นทาง × desktop/mobile) แต่ไม่มี Chromium executable: ตัวติดตั้งดาวน์โหลดได้ archive ไม่สมบูรณ์ (`End of central directory record signature not found`) จึง **ไม่อ้าง E2E PASS**
- ไม่ส่ง signup/recovery email, ไม่ใช้บัญชีจริง/เลขประจำตัวจริง, ไม่ติดต่อ Supabase ใน test ที่เพิ่ม และไม่เรียก Supabase connector
- Applied migration SHA-256 ไม่เปลี่ยน และไม่มี migration ใหม่ถูกนำไปใช้กับ DB
