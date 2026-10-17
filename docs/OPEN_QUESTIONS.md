# Open Questions — Systems 04–07 and 09

รายการต่อไปนี้เป็น **TO VERIFY** ทั้งหมด ไม่ถือว่ามีการอนุมัติหรือมอบอำนาจแล้ว

| ID | ประเด็น | เจ้าของที่ต้องยืนยัน | ข้อมูล/หลักฐานที่ต้องได้รับ |
| --- | --- | --- | --- |
| OQ-04-01 | ขั้นตอนและชื่อสถานะคำขอตั้ง/ยุบสำนักเรียน/สำนักศาสนศึกษา | เจ้าของทะเบียนสำนักเรียน/สำนักศาสนศึกษา | ระเบียบ/คำสั่งฉบับปัจจุบัน, ผู้ยื่น, ผู้ตรวจ, ผู้พิจารณา, transition, เอกสาร, SLA, วันที่มีผล |
| OQ-04-02 | ขั้นตอนเปิด/ปิด/ย้ายสนามนักธรรม–ธรรมศึกษา แยกชั้น/รอบ | เจ้าของ ExamSession/สนามสอบ และเจ้าของระเบียบสอบ | แบบคำขอ, เอกสาร, สนามต้นทาง/ปลายทาง, รอบที่เกี่ยวข้อง, ผลกระทบต่อสมัคร/ผลสอบ, ผู้อนุมัติ, SLA |
| OQ-04-03 | รหัสติดตามและการสืบค้นแบบสาธารณะ | เจ้าของทะเบียนและเจ้าของระบบข้อมูล | รูปแบบรหัสที่ไม่เปิดเผยข้อมูล, ข้อมูลขั้นต่ำที่ใช้ค้น, rate limit, retention, ช่องทางช่วยเหลือ |
| OQ-04-04 | เอกสารแนบและชั้นความลับ | เจ้าของสารบรรณ/ความมั่นคงปลอดภัย/ผู้ดูแลข้อมูล | classification, file type/size, malware scan, storage access, retention, download permission |
| OQ-04-05 | ฟิลด์ที่เผยแพร่และวิธีถอนข้อมูล | เจ้าของข้อมูลและผู้มีอำนาจเผยแพร่ | approved field allowlist, ผู้ publish, revision, cache/CDN purge, audit และเหตุถอน release |
| OQ-04-06 | Role, scope, maker-checker | ผู้แทนองค์กร/เจ้าของ policy access | role matrix ที่ได้รับรอง, ขอบเขตภาค/จังหวัด/องค์กร, วันที่มีผล, การแทนกันและการเพิกถอนสิทธิ์ |
| OQ-05-01 | ยืนยันว่าไฟล์ ศ.2 ส่วนกลางที่ผู้ใช้แนบเป็น revision ปัจจุบันและ mapping ช่องสมัคร | เจ้าของแบบบัญชีบาลีสนามหลวง/สำนักเรียนส่วนกลาง | คำยืนยัน version/วันเริ่มใช้, required/optional columns, กติกาตรวจชื่อและคุณสมบัติ; โครงสร้างไฟล์แนบอ่านได้และระบุใน `docs/DOWNLOADABLE_FORMS.md` |
| OQ-05-02 | ความสัมพันธ์ ศ.2 กับ ศ.3 ในส่วนภูมิภาคและการสอบครั้งที่ 2 | เจ้าของทะเบียนบาลี/ผู้ประสานงานสำนักเรียนคณะจังหวัดและส่วนกลาง | คำสั่ง/คู่มือปัจจุบัน, กรณีที่ออก ศ.3, ผู้จัดทำ, รอบสอบ/ชั้นที่ครอบคลุม, ช่องทางและลำดับส่งบัญชี; มีไฟล์ตัวอย่าง ศ.2/ศ.3 แนบแล้วแต่ยังไม่ยืนยันการใช้จริง |
| OQ-05-03 | ผู้สมัครบาลีศึกษาและผลสอบสาธารณะ | เจ้าของข้อมูลบาลีศึกษา/เจ้าของผลสอบ | ประเภทรายการและการเชื่อม Person, ปีการศึกษา/ครั้งสอบ, release source, field allowlist, correction/withdrawal policy และ retention |
| OQ-05-04 | ค้นผลสอบรายปีและข้อความไม่พบ | เจ้าของข้อมูลผลสอบ/เจ้าของ public service | การแยกปีการศึกษา, ชั้น/ประโยค, บาลี/บาลีศึกษา, ปีที่มี release, rate limit, privacy-safe query fields และถ้อยคำตอบเมื่อไม่พบ |
| OQ-09-01 | นักธรรมตรี: คำขอระบุ ศ.1–2 แต่หน้าแบบฟอร์มที่ตรวจพบแสดง ศ.1 | เจ้าของบัญชีและแบบสมัครสอบนักธรรม | คำยืนยันว่าต้องใช้ ศ.1 อย่างเดียวหรือมีบัญชี/รุ่นที่เกี่ยวข้องเป็น ศ.1–2; สำเนา master form ปัจจุบันและวันเริ่มใช้ |
| OQ-09-02 | ยืนยันว่าไฟล์แนบ ศ.1, ศ.2, ศ.5, ศ.6 รุ่น 2568-v3 ยังเป็นแบบที่หน่วยงานรับ และกำหนด mapping | เจ้าของระบบสมัครสอบและแม่กองธรรมสนามหลวง | คำยืนยัน version/วันเริ่มใช้, required/optional columns, format/validation, กฎแยกชั้นโท/เอก และ sample TEST_ ที่อนุมัติ; โครงสร้าง workbook ตรวจแล้วและมีรายการใน `docs/DOWNLOADABLE_FORMS.md` |
| OQ-09-03 | สิทธิ์และการเปลี่ยน/ยกเลิกรายชื่อผู้สมัคร | เจ้าของ ExamSession/เจ้าของ policy และสนามสอบ | role+scope ที่รับรอง, maker-checker, รอบเปิด/ปิด, cutoff, duplicate policy, idempotency, audit, ช่องทางแจ้งผล |
| OQ-09-04 | เลขสอบและผลสอบนักธรรม/ธรรมศึกษา | เจ้าของทะเบียนผลสอบ/เจ้าของการเผยแพร่ | แหล่งเลขและผลสอบที่อนุมัติ, แยกผลกับสถานะสมัคร, release revision, field allowlist, correction/withdrawal และ cache purge |
| OQ-09-05 | การคุ้มครองไฟล์สมัครและข้อมูลผู้เรียน | เจ้าของข้อมูลส่วนบุคคล/เจ้าของระบบจัดเก็บไฟล์ | ฐานอำนาจ/notice, classification, malware scan, retention/deletion, export/download authorization และ incident handling |

งาน fixture, UX, เอกสาร และ test ที่ไม่ขึ้นกับคำตอบเหล่านี้ทำต่อได้ใน `TEST_` เท่านั้น; งานเชื่อมข้อมูลจริง/อนุมัติ/เผยแพร่ต้องรอหลักฐานจากเจ้าของที่ระบุ

## System 06 — งบประมาณ

ยังไม่มีเจ้าของงบ/ผู้แทนองค์กรยืนยัน policy ของระบบ 06; ประเด็นต่อไปนี้เป็น `TO VERIFY` ทั้งหมดและไม่มีอำนาจอนุมัติสมมติ

| ID | ประเด็น | เจ้าของที่ต้องยืนยัน | ข้อมูล/หลักฐานที่ต้องได้รับ |
| --- | --- | --- | --- |
| OQ-06-01 | ประเภทเงินที่ระบบครอบคลุมและระบบบัญชีต้นทาง; NBMS อาจเป็น scope เงินนอกงบประมาณตามชื่อรายการหนังสือเวียน | เจ้าของนโยบายการเงิน/งบประมาณ | ระบุเงินงบ/นอกงบ/เงินบริจาค/เงินเฉพาะกิจที่ใช้จริง, หน่วยงานเจ้าของยอด, ระบบหลัก, หนังสืออำนาจ/กฎที่ยังมีผล |
| OQ-06-02 | ปีงบประมาณ มิติแผน แหล่งเงิน ผังบัญชี หน่วยงาน/โครงการ และการปรับวงเงิน | เจ้าของแผนและทะเบียนบัญชี | Data dictionary, รหัสและ revision, cutoff, วันมีผล/วันบันทึก, แบบแผน/จัดสรร และตัวอย่าง `TEST_` ที่อนุมัติ |
| OQ-06-03 | การโอน เปลี่ยนแปลง และผูกพัน: ใครสร้าง ตรวจ อนุมัติ และเมื่อใดมีผล | เจ้าของนโยบาย/ผู้มีอำนาจตามคำสั่งจริง | workflow/state transition, role+scope, delegation, maker-checker, limit, หลักฐาน, transaction/idempotency และ audit ที่อนุมัติ |
| OQ-06-04 | การเบิก/จ่าย คืนเงิน ยกเลิก กลับรายการ และเชื่อมจัดซื้อ/พัสดุ | เจ้าของการเงิน การบัญชี และเจ้าของ System 07 | จุดเชื่อม FM/PO/AP หรือระบบจริง, เอกสารประกอบ, แหล่ง truth ของยอด, การกันยอด/จ่ายซ้ำ, refunded/returned semantics, retry/idempotency |
| OQ-06-05 | วิธีเทียบยอดและปิดงวด/ปี, การ lock และเปิดงวดแก้ไข | เจ้าของบัญชีและผู้ตรวจสอบ | แหล่ง statement/บัญชีแยกประเภท, tolerance, timing, checklist, ผู้รับรอง, การปรับปรุง/เปิดงวด, retention และ audit trail |
| OQ-06-06 | รายงาน ส่งออก และข้อมูลที่เปิดเผย/จำกัดสิทธิ์ | เจ้าของข้อมูลการเงิน เจ้าของ privacy/security และผู้มีอำนาจเผยแพร่ | report inventory, field allowlist, classification, role matrix, retention, export/download permission, release revision และ cache/revocation plan |
| OQ-06-07 | การเชื่อมต่อ NBMS/New GFMIS Thai หรือระบบอื่น | เจ้าของ IT integration และเจ้าของการเงิน | ยืนยันระบบที่ใช้งานจริง, API/file interface, environment, service owner, authentication, reconciliation contract, rate/availability, sandbox และ test evidence |

ทำ UI/สูตร/validation ของ fixture ต่อได้ แต่ยังไม่ทำ migration, เงินจริง, การอนุมัติ, ปิดงวด หรือเชื่อมระบบบัญชีจนเจ้าของที่ระบุส่งหลักฐานครบและอนุมัติ policy

## System 07 — พัสดุและครุภัณฑ์

ยังไม่มีเจ้าของพัสดุ/ผู้แทนองค์กรยืนยัน policy และ data dictionary ของระบบ 07; ประเด็นด้านล่างเป็น `TO VERIFY` ทั้งหมด ไม่มีการสร้างอำนาจหรือคำอนุมัติขึ้นเอง

| ID | ประเด็น | เจ้าของที่ต้องยืนยัน | ข้อมูล/หลักฐานที่ต้องได้รับ |
| --- | --- | --- | --- |
| OQ-07-01 | ประเภทพัสดุ รหัสกลาง หน่วยนับ สินทรัพย์รายชิ้น/วัสดุเป็นจำนวน และฟิลด์ทะเบียน | เจ้าของทะเบียนพัสดุ/ครุภัณฑ์และผู้ดูแลข้อมูลหลัก | data dictionary, หมวด/หน่วยนับ, unique key, serial/tag, ครุภัณฑ์ต่ำกว่าเกณฑ์, ต้นทุน/แหล่งที่มา/วันที่ได้มา, effective date และตัวอย่าง TEST_ ที่อนุมัติ |
| OQ-07-02 | คลังกลาง คลังย่อย หน่วยงาน/วัด/สำนักและขอบเขตการมองเห็น | เจ้าของพัสดุและเจ้าของ Organization/Directory | hierarchy ที่ได้รับรอง, รหัสคลังและผู้ดูแล, การย้ายที่เก็บ, ระดับภาค/จังหวัด/องค์กร, ข้อยกเว้นและวันมีผล |
| OQ-07-03 | ซื้อ รับ ตรวจรับ เบิก คืน โอน และการอนุมัติแบบรายการ/แบบชุด | เจ้าของจัดซื้อ เจ้าของคลัง การเงิน และผู้มีอำนาจตามคำสั่ง | ระเบียบและแบบฟอร์มฉบับใช้จริง, ขั้นตอน/transition, รายการหลายบรรทัด, ผู้เสนอ/ตรวจ/อนุมัติ, delegation/วงเงิน, หลักฐาน, cancellation/reversal และวันที่มีผล |
| OQ-07-04 | การผูกพันงบ ซื้อ และจ่ายจริงที่เชื่อม System 06/08 | เจ้าของงบ การบัญชี พัสดุ และสารบรรณ | source of truth, PO/สัญญา/ใบรับ/ใบเบิก, reference, mapping budget line, ป้องกันยอดซ้ำ, idempotency, transaction และการ reconcile |
| OQ-07-05 | ยืม คืนยืม ผู้รับผิดชอบ สภาพ และของสูญหาย/เสียหาย | เจ้าของคลังและเจ้าของ policy พัสดุ | แบบยืม/หลักประกัน/กำหนดคืน, ผู้ยืมและ scope, แจ้งเตือน, partial return, สภาพและการชดใช้, retention และ audit |
| OQ-07-06 | ซ่อมบำรุง ค่าใช้จ่าย ประวัติอุปกรณ์ และค่าเสื่อม | เจ้าของทะเบียนครุภัณฑ์ การเงิน และช่าง/ผู้ดูแล | สถานะงานซ่อม/ผู้รับงาน/ผู้ตรวจรับ, maintenance vendor, ต้นทุน, useful life, depreciation method, accounting policy และ revision |
| OQ-07-07 | ตรวจนับ ส่วนต่าง และการปรับยอด | เจ้าของคลังและผู้ตรวจสอบ | รอบตรวจนับ, snapshot/as-of, ผู้ตรวจอิสระ, tolerance, reason codes, evidence, maker-checker, adjustment movement และ audit |
| OQ-07-08 | จำหน่าย โอนออก บริจาค สูญหาย และการตัดบัญชี | เจ้าของพัสดุ การเงิน/บัญชี และผู้มีอำนาจตามคำสั่ง | กฎหมาย/ระเบียบ/คำสั่ง, หลักฐาน, workflow, ผู้อนุมัติ, วันที่มีผล, disposal valuation, accounting entry และการเผยแพร่ |
| OQ-07-09 | Excel import/export, Stock Card, เอกสาร และข้อมูลส่วนบุคคล/ราคา | เจ้าของข้อมูล พัสดุ สารบรรณ ความมั่นคงปลอดภัย และ privacy | template/revision, overwrite policy, field allowlist, export/download permission, classification, file scan, retention, audit, withdrawal/cache plan |
| OQ-07-10 | Role + scope, maker-checker, retry และ concurrency สำหรับทุก movement | ผู้แทนองค์กร เจ้าของ access policy และ IT/security | role matrix ที่อนุมัติ, action แยก read/edit/import/export/approve, scope และ effective date, revocation, separation-of-duties, transaction/optimistic lock และ security test evidence |

ทำ UX และ regression ด้วย TEST_ ต่อได้ แต่ยังไม่ทำ migration/นำเข้าทะเบียนจริง, ผูกงบจริง, รับ-เบิก, approve, ตัดบัญชี, เชื่อม System 06/08 หรือเปิดเผยข้อมูลจริง จนเจ้าของที่ระบุยืนยันหลักฐานครบ; ผู้รับผิดชอบโครงการต้องมอบหมายชื่อเจ้าของแต่ละข้อ

## OQ-08 — สารบรรณออนไลน์

รายการต่อไปนี้เป็น `TO VERIFY`; รายการสถานะและระดับชั้นใน prototype เป็น TEST_ สำหรับ UX เท่านั้น ไม่มีอำนาจอนุมัติหรือการยืนยันระเบียบขึ้นเอง

| ID | ประเด็น | เจ้าของที่ต้องยืนยัน | ข้อมูล/หลักฐานที่ต้องได้รับ |
| --- | --- | --- | --- |
| OQ-08-01 | ประเภทหนังสือ, ทะเบียนรับ/ส่ง, รูปแบบเลข, ช่วงเลขและการเปลี่ยนปี/หน่วยงาน | เจ้าของสารบรรณและทะเบียนหนังสือ | ระเบียบ/คู่มือฉบับใช้จริง, schema เลขทะเบียน, หน่วยออกเลข, unique scope, วันที่มีผล, การยกเลิก/แก้เลข และตัวอย่างปกปิดข้อมูล |
| OQ-08-02 | วงจรร่าง ตรวจทาน เสนอ ลงนาม ส่ง รับ ตีกลับ รับทราบ และปิดเรื่อง | เจ้าของสารบรรณและผู้แทนหน่วยงานรับ-ส่ง | workflow/transition ที่อนุมัติ, actor ต่อขั้น, delegation, maker-checker, SLA/การส่งกลับ และหลักฐานการรับ |
| OQ-08-03 | ผู้มีอำนาจลงนามและลายมือชื่ออิเล็กทรอนิกส์ | ผู้มีอำนาจตามคำสั่ง, นิติการ/ผู้ดูแลกฎหมาย และ IT/security | คำสั่งมอบอำนาจ, provider/มาตรฐาน, การพิสูจน์ตัวตน, timestamp, การตรวจสอบ/เพิกถอน, retention และผลทดสอบลายมือชื่อ |
| OQ-08-04 | ชั้นข้อมูล, ข้อมูลบุคคล, การส่งต่อ/เปิดเผยและรายชื่อผู้รับ | เจ้าของข้อมูล, privacy และผู้ดูแลความมั่นคงปลอดภัย | taxonomy/classification, field allowlist, basis/notice, scope, กฎ redaction, การอนุมัติเปิดเผย และแผนถอน release/cache |
| OQ-08-05 | ไฟล์แนบและการใช้ File/Storage กลาง | เจ้าของสารบรรณ, Storage และ IT/security | ชนิด/ขนาดไฟล์, malware scan, encryption, hash, preview/download, signed URL TTL, version, backup, quarantine, retention และการลบ |
| OQ-08-06 | หน่วยงานผู้ส่ง/ผู้รับ และการเชื่อม e-mail, LINE, dConnect หรือระบบอื่น | เจ้าของ Organization, สารบรรณ และ IT/integration | source of truth ของรหัสองค์กร, ช่องทางที่อนุมัติ, endpoint/credential owner, delivery receipt, retry/dead-letter, idempotency และ outbox |
| OQ-08-07 | Role + scope, read/edit/export/download/route/approve/sign/register และการถอนสิทธิ์ | ผู้แทนองค์กรและ access-policy/IT security owner | role matrix ที่รับรอง, scope ส่วนกลาง/ภาค/จังหวัด/องค์กร, effective date, server/API/RLS/Storage/worker rules, separation-of-duties และ test evidence |
| OQ-08-08 | Revision, วันมีผล/วันบันทึก, audit, archive, retention, legal hold และทำลายเอกสาร | เจ้าของสารบรรณ, audit, privacy และ records-management owner | revision policy, immutable audit, recorded/effective timestamp, retention schedule, legal hold, disposition, export trail และผู้รับรองการทำลาย |
| OQ-08-09 | รายงาน/Excel, การค้น, export, การแจ้งเตือนและ audit ของการเข้าถึง | เจ้าของสารบรรณ, data owner และ privacy/security | ฟิลด์ที่ส่งออกได้, permission แยก read/export/download, redaction, audit access, notification recipient/consent และแผนถอน/ล้าง cache |
| OQ-08-10 | จดหมายเวียน, แม่แบบ, ตัวแปร, กลุ่มผู้รับและการตรวจทานก่อนส่ง | เจ้าของสารบรรณ, Organization/data owner, privacy และ IT/security | แหล่งรายชื่อผู้รับและวันมีผล, field allowlist, revision/ผู้อนุมัติแม่แบบ, การจำกัดจำนวนผู้รับ, preview/ตรวจรายการซ้ำ, permission, audit, ช่องทางส่งและหลักฐานการส่ง |

ทำ prototype/test ด้วย TEST_ ต่อได้ แต่ห้ามรับเอกสารจริง, สร้างเลขทะเบียนจริง, ส่งข้อความ/อีเมล, ให้สถานะรับหนังสือทางการ, ลงนาม, อนุมัติ, migration หรือเปิดให้ผู้ใช้นอกเจ้าของเว็บไซต์จนผู้รับผิดชอบจริงส่งหลักฐานครบและมีอำนาจมอบหมาย
