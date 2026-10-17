# Project Progress

## Vercel / Supabase migration (2026-10-17)

รุ่นย้ายโฮสต์อยู่ใน repository new_9_gpt: ใช้ Supabase Auth และ TEST_ snapshots ต่อบัญชี ดู `HOSTING_MIGRATION.md` และ `AUTHENTICATION.md` สำหรับสถานะปัจจุบัน รายการก่อนหน้านี้เป็นประวัติ Sites prototype.


## ปรับตัวอักษรทุกระบบ — 2026-10-17

- ต่อจาก Site version 23, source commit `8937cc8f976821a875e5b126a5bd849f027c90ec`
- ขยายตัวอักษรเดิม 7–14px เป็น 15–18px และหัวข้อให้ใหญ่ตามลำดับ ใช้ rem รองรับขนาดตัวอักษรที่ผู้ใช้ตั้งในเบราว์เซอร์; ข้อความหลักเริ่มที่ 18px
- โหลด `readability.css` เป็น stylesheet สุดท้ายในทุกหน้า: index/login, forgot-password และ workspace (รวมระบบ 01–09, สิทธิ์, ดาวน์โหลด, modal และจดหมายเวียน)
- ใช้การตัดบรรทัดภาษาไทยตามปกติและ fallback สำหรับรหัส/ข้อความยาว ปลด nowrap ในปุ่ม แท็บ หัวตาราง และสถานะ; เพิ่มระยะบรรทัด พื้นที่กรอก และปุ่มขั้นต่ำ 44px
- ปรับ topbar ให้ขึ้นแถวใหม่, sidebar ยืด/เลื่อนได้, grid ลดคอลัมน์บนจอแคบ, modal ขยายเป็น 760px และตารางเลื่อนเฉพาะภายในกรอบ
- เพิ่มความเข้มข้อความรองในส่วนหลัก และคง branding เดิม
- ตรวจ syntax JavaScript, regression smoke ของทุกระบบ, parse CSS ด้วย PostCSS/Lightning CSS, ขนาดอักษรขั้นต่ำที่ประกาศ 15px, การโหลด stylesheet ในทุก HTML และ git diff --check ผ่าน
- ไม่มี control-browser ใน environment นี้ จึงไม่ได้เริ่ม preview หรือทดสอบภาพจริงบน desktop/mobile; การตรวจ responsive รอบนี้เป็นการตรวจ source/CSS ไม่ใช่หลักฐาน screenshot
- เผยแพร่การแก้ไขโดยคง access policy ของ Site เดิม; ไม่มีการเปลี่ยน workflow/ข้อมูลของระบบงาน

อัปเดต 2026-10-16 · ระบบ 08 จดหมายเวียน TEST_ และ hardening ระบบ 09 · คง access policy เดิมของ Site

| ระบบ/งาน | สถานะ | หลักฐาน |
| --- | --- | --- |
| Systems 01–07 | ไม่เปลี่ยนขอบเขตในงานนี้; regression smoke suite ยังตรวจเส้นทางหลัก | source base ก่อนเริ่ม `80cd3ea6336b0cceac869ba200c37343a96bbec4`; ข้อจำกัด runtime ดู `docs/ADR-001-prototype-runtime.md` |
| System 08 — สารบรรณออนไลน์ | เพิ่มกล่องรับ/ส่ง/ร่าง/แจ้งงาน, จดหมายเวียน preview และสร้างร่าง TEST_ แยกผู้รับ, mask restricted content, metadata-only CSV/XLSX, TEST_ audit | `dist/assets/app.js`; `dist/assets/controls.css`; `docs/SYSTEM_08_CORRESPONDENCE.md`; `docs/SYSTEM_08_SOURCE_PROFILE.md`; OQ-08-01…10; `tests/smoke.cjs` |
| System 07 — พัสดุและครุภัณฑ์ | เพิ่มทะเบียน, stock card, ขอจัดซื้อที่อ้างถึงงบ TEST_, รับ/เบิก/คืน/โอน/ยืม/คืนยืม/ซ่อม/ตรวจนับ/จำหน่าย; stock คำนวณจาก movement; Excel ไม่เขียนทับจำนวน | `dist/assets/app.js`; `dist/assets/controls.css`; `docs/SYSTEM_07_ASSET_MANAGEMENT.md`; `docs/SYSTEM_07_SOURCE_PROFILE.md`; `docs/OPEN_QUESTIONS.md`; smoke tests |
| System 06 — งบประมาณ | เพิ่ม 8 ขั้นตอน; คำนวณ summary จากแถว TEST_; เพิ่ม integer-satang draft validation, over-commit/payment/refund guards, period filter, pagination, Excel plan controls | `dist/assets/app.js`; `dist/assets/controls.css`; `docs/SYSTEM_06_BUDGET.md`; `docs/SYSTEM_06_SOURCE_PROFILE.md`; smoke tests |
| System 05 — สมัครบาลี/บาลีศึกษา | Implemented locally: แยกประเภทผู้สมัครและสายสอบ, ร่างสมัคร TEST_, ส่วนกลาง/ภูมิภาค, แท็บค้นผลสอบรายปี, field allowlist note, TEST_ export | `dist/assets/app.js`; `docs/SYSTEM_05_PALI_REGISTRATION_RESULTS.md`; `docs/SYSTEM_05_SOURCE_PROFILE.md` |
| System 09 — แบบบัญชีนักธรรม/ธรรมศึกษา | เลือก ศ.1/ศ.2/ศ.5/ศ.6; เพิ่ม strict header allowlist, ปฏิเสธคอลัมน์ซ้ำ/ไม่รู้จักและค่าที่ไม่มีหัวคอลัมน์; preview/confirm เฉพาะ memory | `dist/assets/app.js`; `docs/SYSTEM_09_REGISTRATION_FORMS.md`; `docs/SYSTEM_09_SOURCE_PROFILE.md` |
| ดาวน์โหลดแบบบัญชีต้นฉบับ | ตรวจและเพิ่มไฟล์แนบ 8 ไฟล์: บาลี 2, นักธรรม/ธรรมศึกษา 6; เพิ่ม cards/ลิงก์ดาวน์โหลดและคำเตือนข้อมูลกรอก; คง access mode เจ้าของเท่านั้น | `dist/assets/forms/`; `docs/DOWNLOADABLE_FORMS.md`; smoke assertions |
| Decisions / open items / คู่มือ | Updated; ไม่มีมติหรืออำนาจอนุมัติสมมติ; บันทึกความต่าง ศ.1–2 ที่ต้องถามเจ้าของ | `docs/DECISIONS.md`; `docs/OPEN_QUESTIONS.md`; `docs/TEST_GUIDE_TH.md` |
| Validation | PASS ใน local test harness | `node --check dist/assets/app.js`; `node --check tests/smoke.cjs`; `node tests/smoke.cjs`; `git diff --check` |
| Production readiness | Not ready / TO VERIFY | ไม่มี production backend/auth/RLS/audit/storage, official form mappings, approved result releases หรือ role policy |

## หน้าบัญชีเว็บไซต์ (2026-10-16)

- เพิ่ม login landing ที่ `/`, `/login.html`, หน้า recovery และย้าย dashboard เดิมไป `/workspace.html`
- เชื่อม Sites native sign-in/sign-out; ปุ่มปิดโหมดทดสอบแยกจาก sign-out จริง
- recovery เป็น provider-managed email reset ไม่มีบริการส่งอีเมล/บัญชีอีเมลแยกของแอป; ไม่ได้ทดสอบส่งอีเมลจริง
- หลักฐานและข้อจำกัด: `docs/AUTHENTICATION.md`; audience owner-private เดิม

## System 08 update

### จดหมายเวียนออนไลน์

- เพิ่มปุ่มจดหมายเวียนที่ระบบ 08 ให้เลือกหน่วยงาน TEST_ จาก System 02, ใช้ placeholder แบบ allowlist, ตรวจ preview รายผู้รับ, กลับไปแก้แม่แบบ และสร้างร่างแยกต่อผู้รับ
- ร่างและ audit อยู่ใน browser memory เท่านั้น; ไม่ส่งอีเมล/LINE/dConnect, ไม่อัปโหลดไฟล์, ไม่ลงนามหรือออกเลขทะเบียน
- Validation: `node --check dist/assets/app.js`, `node --check tests/smoke.cjs`, `node tests/smoke.cjs`, `git diff --check` PASS; ทดสอบตัวแปรไม่รู้จัก, preview แยกหน่วยงาน, กลับไปแก้แม่แบบ และสร้างร่างแยก

- Baseline: Site version 19, commit `80cd3ea6336b0cceac869ba200c37343a96bbec4`; Site owner-only `custom` access, allowed users 1, role `owner`; no policy change
- เพิ่มกล่องทั้งหมด/รับ/ส่ง/ร่าง/แจ้งงาน, ค้นหา, pagination และสร้างร่างโดยอ้าง Organization จาก System 02
- เพิ่มจดหมายเวียน: แม่แบบ TEST_ และตัวแปร allowlist, เลือกผู้รับจาก Organization TEST_, preview แยกรายผู้รับ และสร้างร่างแยกหนึ่งรายการต่อผู้รับ
- ส่งและรับทราบเปลี่ยนสถานะ TEST_ ใน memory; ไม่มี email/LINE/dConnect, file upload, เลขทะเบียน, ลายเซ็น, approval หรือการส่งเอกสารจริง
- restricted document mask เรื่อง/เนื้อหา/ไฟล์ใน list/detail/search/CSV/XLSX; export มี metadata allowlist เท่านั้น; audit event เก็บ TEST_ ใน session
- ใช้ e-Office/คู่มือเป็น reference ด้าน UX: draft/attach, send for review/sign, receive/send/reject, reports/export; ไม่ได้ตีความว่า policy หรืออำนาจขององค์กรนี้
- OQ-08-01…10 รอเจ้าของสารบรรณ, ผู้มีอำนาจ, Organization/data owner, IT/security, Storage, privacy และ records-management ส่งหลักฐาน; ห้าม migrate หรือรับเอกสารจริงก่อนยืนยัน
- ก่อนเริ่มตรวจ `README.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md`, `docs/SYSTEM_06_BUDGET.md`, `docs/SYSTEM_07_ASSET_MANAGEMENT.md`, `docs/ADR-001-prototype-runtime.md`, source code และ smoke tests; `MASTER_PROMPT.md`, `BLUEPRINT.md`, `GLOSSARY.md`, `ERD.md`, `DATA_DICTIONARY.md`, และ System 08 source profile ยังไม่มี ณ ก่อนงานนี้; สร้างเอกสาร System 08 ด้านบน ไม่มีการอ้างว่าอ่านไฟล์ที่ไม่มี
- Validation ณ 2026-10-16: `node --check dist/assets/app.js`, `node --check tests/smoke.cjs`, `node tests/smoke.cjs`, `git diff --check` PASS; smoke ตรวจ status flow, prefix TEST_, masking restricted content ใน list/detail/CSV/XLSX และ metadata import/export
- SHA-256 `dist/assets/app.js`: `908f86764b5bed7d705628f353d51f2d0cc82c1b9edaf039e57001d1578f07d7`
- SHA-256 `dist/assets/controls.css`: `db80da506c1d385eff8a9f396b7163fd612f5fd1564bfd7576739ef984b0eb79`
- SHA-256 `tests/smoke.cjs`: `d54ef130aed9f4f00a2f3c4660f09036cff7b9cae3e893f9867aa8a903f428f0`
- SHA-256 `docs/SYSTEM_08_CORRESPONDENCE.md`: `4ba6d3659d64f862c096c2f48560b47e545942519c46c053dbecb8386fa10f79`
- SHA-256 `docs/SYSTEM_08_SOURCE_PROFILE.md`: `16df49e5af735a44c416baa8977f5cc9ca680f23f3d70bd814039a736386c374`
- SHA-256 `docs/OPEN_QUESTIONS.md`: `fc4fdc38442a8cff49c21724f72e71c8807b026ab81786e00ea30dc1f536066b`
- SHA-256 `docs/DECISIONS.md`: `ca68e9ae9c47afbd1e1cca479c5aba4253d75e7c8ef2885acfe1d30544275f35`
- SHA-256 `docs/TEST_GUIDE_TH.md`: `24ac7b7e3902645b40d66c2970940086944d006a01b3f8d71eeb4790750ad379`
- SHA-256 `README.md`: `7840c0431835efe5bb85858a0094674ef88659e23136c29c28b9a1df310f6caf`
- สถานะ ณ จบงาน System 08: live Site version 19 ที่ commit `80cd3ea6336b0cceac869ba200c37343a96bbec4`; version 20 ถูกบันทึกแต่ยังไม่ deploy; access เป็น `custom` เจ้าของเท่านั้น. สถานะนี้เป็น checkpoint ก่อนงาน hardening ระบบ 09 ด้านล่าง

## System 09 update — import schema hardening

- ปรับตัวตรวจ Excel/CSV ให้รับเฉพาะหัวคอลัมน์กลาง 5 ช่องที่รู้จัก; ปฏิเสธหัวคอลัมน์ซ้ำหลัง normalization, คอลัมน์นอกแม่แบบ และค่าที่ไม่มีหัวคอลัมน์โดยไม่แสดงค่าที่ถูกปฏิเสธใน preview
- ทดสอบกรณีคอลัมน์ข้อมูลประจำตัวเพิ่มเข้ามา, header ซ้ำ, cell เกินจาก header, ข้อมูลไม่ใช่ TEST_, ชื่อซ้ำ, ชั้นไม่ตรง, ทั้งสี่ประเภทบัญชี และ XLSX/CSV valid; `node --check`, `node tests/smoke.cjs`, `git diff --check` ผ่าน
- Source baseline ก่อนแก้: Site version 20 ที่บันทึกไว้ (commit `f98657d23d644bdb5bfa6274e242d9380f83fcc0`); ตอนเริ่มงาน production live เป็น version 19; access policy `custom` เจ้าของคนเดียว ไม่มีผู้ชมภายนอก
- การปิดหัวคอลัมน์เป็น strict schema ของ TEST_ prototype ไม่ใช่การยืนยัน field mapping ทางการ; OQ-09-01…05 ยังต้องยืนยันก่อนรับข้อมูลสมัครจริง; ไม่มี backend/ฐานข้อมูลและ commit หายเมื่อ reload
- รุ่นเว็บไซต์ต่อจาก source ที่บันทึกไว้คง site access policy เดิม; production readiness สำหรับการสมัครสอบจริงยัง `NOT READY / TO VERIFY`

## System 07 update

- เพิ่มหน้า System 07 จำนวน 11 แท็บ: ทะเบียน/คงเหลือ, Stock card, ขอจัดซื้อ, รับเข้า, เบิก, คืน, โอน, ยืม/คืนยืม, ซ่อมบำรุง, ตรวจนับ และคำขอจำหน่าย
- ยอดแสดงจาก TEST_ StockMovement ต่อพัสดุ/คลัง; transfer สร้างคู่ movement, เบิก/โอน/ยืมเกินยอดถูกปฏิเสธ, คืนยืม derive คงค้างจากประวัติคืน และป้องกัน reference ซ้ำ
- การตรวจนับไม่ปรับยอด; งานซ่อมไม่แก้จำนวน; ขอจัดซื้อเชื่อมเพียง TEST_BUDGET_ และไม่ผูกพันงบ; คำขอจำหน่ายไม่ตัดยอด
- Excel import/export มีเฉพาะข้อมูลทะเบียน master; จำนวนคงเหลือไม่ใช่ input และมี export Stock card CSV แยก
- แหล่ง UX: `docs/SYSTEM_07_SOURCE_PROFILE.md`; ดัชนีของ Pasadu แสดงแนวคิดคลังหลายระดับ, เบิกหลายรายการ, Stock Card และซ่อมบำรุง; เปิดหน้าโดยตรงไม่สำเร็จ จึงไม่ใช้เป็น policy
- TO VERIFY: OQ-07-01…OQ-07-10; production ต้องมีเจ้าของข้อมูล, policy, transaction, unique/idempotency, optimistic lock, audit, authorization/RLS และ maker-checker ที่องค์กรยืนยัน
- Base Site version 18, commit `3694291c85e691f025fb21c5296b4e14fb47d166`; access mode เดิม `custom`, allowed users 1, current user `owner`
- Validation ณ local: `node --check dist/assets/app.js`, `node --check tests/smoke.cjs`, `node tests/smoke.cjs`, `git diff --check`; PASS รวม over-return, reference retry, transfer balance, purchase, count variance, maintenance, disposal, loan/return และ master-only Excel; `python3 -m http.server --help` แสดง usage ตามคู่มือ
- SHA-256 `dist/assets/app.js`: `1a16ee0789809f05e45f5e9b74931498a4c6cf563d9a78d1576c5ae779c84116`
- SHA-256 `dist/assets/controls.css`: `8019f27196bdb3cdc5d8b21bdc6bdc1d8b10c7ad13c70e512241ba06be64c331`
- SHA-256 `tests/smoke.cjs`: `2ad8cd879508cf7ee3a65f7fdee525d613d97457e59ceb7ba9dc38f2db73a65d`
- SHA-256 `docs/SYSTEM_07_ASSET_MANAGEMENT.md`: `7adb4214ecda39342f3c86fc2b84da76c9c82908a917b0034c2758906c2a5d28`
- SHA-256 `docs/SYSTEM_07_SOURCE_PROFILE.md`: `e9aa0b40fa2a4941523ed61989c1084407bd7cb57a5c6b58e6cd09a03abd265f`
- SHA-256 `docs/OPEN_QUESTIONS.md`: `44d29f583249163f884fcb1b1dbc0342ce20ed52d66d97ccfce5449cdadb4c18`
- SHA-256 `docs/DECISIONS.md`: `124f0a96d50aae8ba90903d50caf5edef18aea639ba99b6715aed9d75f91a532`
- SHA-256 `docs/TEST_GUIDE_TH.md`: `fb835825e5457d81663a76a9e94363be583bc7e62d52f2666e084e3ac90e2f81`
- Next lesson: System 08 — สารบรรณออนไลน์; verify its existing source profile and document handling/privacy policy, then create OQ-08 if missing before any real document workflow

## System 06 update

- เพิ่มหน้าแผน/จัดสรร โอน ผูกพัน เบิกจ่าย/จ่ายจริง คืนเงิน กระทบยอด และปิดงวด; แบบร่างเก็บเฉพาะ memory ของ browser
- ยอด TEST_ ในแผนรวมได้จัดสรร 1,600,000.00 บาท ผูกพัน 540,000.00 บาท จ่ายจริง 270,000.00 บาท ยังไม่ผูกพัน 1,060,000.00 บาท และค้างจ่ายในยอดผูกพัน 270,000.00 บาท; แก้สรุปตัวเลขที่เดิมไม่ตรงผลรวมรายการ
- เพิ่มข้อจำกัด integer satang, TEST_ IDs/text, รหัสซ้ำ, ยอดผูกพันเกินวงเงิน, จ่ายเกินยอดค้างจ่าย และคืนเงินเกินยอดจ่ายตัวอย่าง; ไม่มีปุ่มอนุมัติ/ปิดงวดจริง
- แหล่งอ้างอิง: หน้า NBMS direct fetch timeout และ official CGD result identifies NBMS circular on extra-budgetary funds; official New GFMIS Thai training page separately lists FM/PO/AP/RP/FA/GL/MIS. Details and limits: `docs/SYSTEM_06_SOURCE_PROFILE.md`; policy remains TO VERIFY
- ข้อค้างทั้งหมดระบุเจ้าของและหลักฐานที่ต้องส่งใน OQ-06-01…OQ-06-07

## Version/hash evidence

- Local iteration label: `System 06 budget workflow revision 1`; source base Site version 17, commit `2e9f811de8a5ab992aad2e2af3175094af26f213`.
- SHA-256 `dist/assets/app.js`: `4e728f9260cfd57b3f82e93f4e9ed4ff60a18e0d5d5e3778ec228013d1625e9e`.
- SHA-256 `dist/assets/controls.css`: `c11593aa9dee26b9fa301c0988c0a300d47755363d9d784f9139cf4a91e9a381`.
- SHA-256 `tests/smoke.cjs`: `0fb1115dc1a4fe36e07e5b569276aca41bc1b58550fef3c115d4eff75a1ce711`.
- SHA-256 `docs/SYSTEM_06_BUDGET.md`: `eac52ac95112ec6ad3a93e6a92ab16a21aeb088dd876bae25f26b698ed02ad1b`.
- SHA-256 `docs/SYSTEM_06_SOURCE_PROFILE.md`: `16db5cb48476d459cbd7492f3d9a4fdab698ac21e5f20492dc3bde50c42a3cf3`.
- SHA-256 `docs/OPEN_QUESTIONS.md`: `e0a4916dadb67a007b1901d126f18fab09c432405b759fba173610e64e659dd0`.
- SHA-256 `docs/DECISIONS.md`: `16b9cedbbd46fe8f7cddf708716f6fb7fe2e8831c22d5d61d2d07f5d598b9887`.
- SHA-256 `docs/TEST_GUIDE_TH.md`: `e4a3165f84b6f05c12483660df44c260d251e86c365a1401cef23e71db6fb86f`.
- `node --check dist/assets/app.js`, `node --check tests/smoke.cjs`, `node tests/smoke.cjs`, and `git diff --check` PASS locally; includes all System 06 stages, exact integer-satang validation, period filters, pagination, over-commit/payment guards and TEST_-only drafts.
- Site deployment version/commit is recorded in the completion report; baseline opened for this update was Site version 17.

- Source baseline before this update: `4736c055e1a42949b891d5817b90882b80b99db7` (saved Site version 15).
- Local iteration label: `System 05/09 downloadable forms revision 1`.
- SHA-256 `dist/assets/app.js`: `687890a0dde2f2f403e0ba75097a2e0c6ee866f2a65e7cb3677118f59515e32e`.
- SHA-256 `dist/assets/styles.css`: `ce89823bbcf67f78e665132388adc18acd55b7ea993dfbb12e59d0850197defc`.
- SHA-256 `tests/smoke.cjs`: `268d14cf89e9cdc660f46f7a8a79f9b76f5b0914cda3c615f4ff0e2554ac33ff`.
- SHA-256 `docs/DOWNLOADABLE_FORMS.md`: `ba10152e5567e427b9ee556db0acd062c879b475228261ae51b5959d8f528746`.
- SHA-256 `docs/SYSTEM_05_PALI_REGISTRATION_RESULTS.md`: `5fdda9aa3cfac1cd2bc374347908e1a7f260aa39bf44593d1a5be9cbf131e39a`.
- SHA-256 `docs/SYSTEM_09_REGISTRATION_FORMS.md`: `47519ae11a7ff7ca74dc1c1658406c91657f794b8c09394e601a3026f2a1cacc`.
- `node tests/smoke.cjs` PASS: verifies both System 05 Pali download links and all six System 09 download links/assets/signatures, plus central/region filters, Pali/Pali-studies labels, year search, rejection of non-TEST_ query, no invented result, four form routes, class mismatch, preview reset, valid/invalid Excel/CSV, confirmation, and prior system flows.

## Sources / limitations

- System 05 online source profile records InfoPali form pages and Pali result-search example; attached central/regional workbooks were parsed locally for sheet names and dimensions. Field meaning/version remains TO VERIFY.
- System 09 official download list labels ศ.1 for Naktham Tri, ศ.2 for Naktham Tho/Ek, ศ.5 for Dhamma Studies Tri, ศ.6 for Dhamma Studies Tho/Ek; six user-provided class workbooks have now been parsed for sheet names and dimensions. Current version/mapping remains TO VERIFY.
- User asked for Naktham Tri ศ.1–2; source currently lists ศ.1. UI follows the page evidence and records OQ-09-01 rather than claiming the conflict is settled.
- No applicant record was added to app fixtures/database. The eight user-supplied workbooks are copied unchanged as downloadable files; each contains values in list rows and is available only under the existing owner-only site access.
- `MASTER_PROMPT.md`, `BLUEPRINT.md`, `GLOSSARY.md`, `ERD.md`, `DATA_DICTIONARY.md`, and L001/L002 artifacts were absent from this checkout before this change; this log does not claim to have read them.

## Open items and owners

- OQ-05-01/02: owner confirmation of Pali workbook version, field map and ศ.2/ศ.3 responsibility — owner: Pali registration/forms owner, central school and regional coordinators (`TO VERIFY`).
- OQ-05-03/04: result release, public fields, corrections, and year/level semantics — owner: Pali/Pali Studies result-data owner (`TO VERIFY`).
- OQ-09-01/02: clarify Naktham Tri ศ.1 vs requested ศ.1–2; confirm 2568-v3 workbook currency and header maps — owner: Naktham/Dhamma Studies form owner (`TO VERIFY`).
- OQ-09-03/04/05: submit/correction/approval/numbering/result/privacy/file policies — owner: exam-registration policy and personal-data owners (`TO VERIFY`).

**Next:** obtain the budget data owner and policy evidence in OQ-06-01…OQ-06-07 before production data, approvals, accounting integration, close-period actions, migrations or publication of budget reports. Existing System 05/09 form items also remain open; attached workbooks stay under existing owner-only access.
