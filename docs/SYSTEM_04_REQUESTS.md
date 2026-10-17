# ระบบ 04 — คำขอและสถานะ

## เป้าหมาย

ให้ผู้ที่มีสิทธิ์ค้นหาความคืบหน้าของคำขอในเว็บไซต์เดียว โดยผูกข้อมูลกับ `Organization` กลาง และผูกคำขอสนามสอบกับระเบียนสนาม/`ExamSession` ที่เกี่ยวข้อง ไม่ทำสำเนาทำเนียบสถานที่หรือข้อมูลติดต่อไว้ในคำขอ

## ประเภทคำขอที่ต้นแบบรองรับ

ข้อมูลในหน้าจอและแบบฟอร์มทุกแถวเป็น `TEST_` เท่านั้น รายการต่อไปนี้เป็นขอบเขตที่ผู้ใช้ระบุ ไม่ใช่ชื่อคำขอที่รับรองตามระเบียบ:

| กลุ่ม | การดำเนินการ |
| --- | --- |
| สำนักเรียน / สำนักศาสนศึกษา | จัดตั้ง หรือยุบ |
| สนามสอบนักธรรมชั้นตรี | เปิด ปิด หรือย้าย |
| สนามสอบนักธรรมชั้นโท–เอก | เปิด ปิด หรือย้าย |
| สนามสอบธรรมศึกษา | เปิด ปิด หรือย้าย |

หน้า TEST_ มีตัวกรองหมวด ประเภท จังหวัด และสถานะ รวมทั้งช่องค้นหาและหน้ารายละเอียดพร้อมลำดับเหตุการณ์ ปุ่มสร้างคำขอสร้างได้เพียงร่างจำลองในหน่วยความจำของ browser ไม่มีการส่งคำขอหรือไฟล์แนบออกไป และไม่สร้างผลอนุมัติ

## Use case

### UC-04A ค้นหาคำขอ

- **Actor:** ผู้ใช้สาธารณะหรือเจ้าหน้าที่ที่ได้รับสิทธิ์ (สิทธิ์จริง `TO VERIFY`)
- **Trigger:** เปิดเมนู “คำขอและสถานะ”
- **Precondition:** production ต้องตรวจสิทธิ์ `read` และ scope ที่ server/DB; prototype ใช้รายการ `TEST_` โดยไม่มี authentication
- **Main flow:** ค้นด้วยเลขอ้างอิง/ชื่อหน่วยงาน → กรองหมวดและประเภท → กรองจังหวัด/สถานะ → เปิดรายละเอียดและ timeline
- **Exception:** ไม่มีรายการตรงเงื่อนไข ให้แสดงว่างโดยไม่อนุมานว่าคำขอถูกปฏิเสธหรือไม่ผ่าน; ผู้ไม่มีสิทธิ์ให้ปฏิเสธที่ server และ DB
- **Acceptance:** ตัวกรองทำงานร่วมกัน, หน้าไม่แสดงข้อมูลส่วนบุคคล/เอกสารภายในใน public view, ระเบียน TEST_ ที่ไม่พบไม่แปลว่าถูกปฏิเสธ, การเรียกซ้ำไม่ทำให้ข้อมูลเปลี่ยน

### UC-04B สร้างและส่งคำขอ

- **Actor:** ผู้ยื่นแทนสำนัก/หน่วยงานหรือสนามสอบ (หน่วยงานผู้ยื่นและอำนาจ `TO VERIFY`)
- **Trigger:** เลือกสร้างคำขอ
- **Precondition:** production ต้องเข้าสู่ระบบ, เลือก `Organization` ที่มีสิทธิ์ตาม scope, เลือกรอบ `ExamSession` เมื่อเกี่ยวข้อง และผ่านการตรวจสิทธิ์ใหม่ก่อน commit
- **Main flow:** เลือกประเภท → เลือกหน่วยงาน/สนามและพื้นที่ → กรอกข้อมูลตามแบบฟอร์มที่องค์กรรับรอง → แนบเอกสารตาม policy → preview → บันทึกร่าง → ผู้ยื่นตรวจและส่ง → ระบบสร้างเลขอ้างอิงแบบ transaction/idempotency
- **Exception:** ข้อมูล/เอกสารไม่ครบหรือไม่ตรงชนิดคำขอให้แจ้งรายฟิลด์และไม่ commit; การส่งซ้ำด้วย idempotency key เดิมต้องไม่สร้างคำขอซ้ำ; ผู้ไม่มีสิทธิ์/นอก scope ต้องถูกปฏิเสธ
- **Acceptance:** ต้นแบบปัจจุบันสร้างเฉพาะร่าง `TEST_` ใน memory เพื่อทดสอบ UX; ยังไม่ถือว่ารองรับการส่งคำขอจริง

### UC-04C ตรวจรับ ตรวจสอบ และบันทึกเหตุการณ์

- **Actor:** ผู้ตรวจ/ผู้พิจารณาที่องค์กรแต่งตั้งตามอำนาจ (ชื่อ role และอำนาจ `TO VERIFY`)
- **Trigger:** มีคำขอในคิวของ scope ที่รับผิดชอบ
- **Precondition:** ตรวจสิทธิ์ `read/edit/approve` แยกกันตาม role+scope+วันมีผล; maker-checker และผู้มีอำนาจต้องอ้างระเบียบจริง
- **Main flow:** เปิดคำขอ → ตรวจเอกสาร/ขอข้อมูลเพิ่ม → บันทึกเหตุการณ์แบบ immutable → ส่งต่อผู้มีอำนาจ → บันทึกคำสั่ง/ผลจากหลักฐานทางการ → แจ้งผู้ยื่นตามช่องทางที่ได้รับรอง
- **Exception:** หลักฐานขาด, สิทธิ์ถูกถอน, คำขอซ้ำ, หรือสถานะถูกแก้ไขพร้อมกัน ให้หยุด/แจ้งผู้ใช้และบันทึก audit; ห้ามสร้างผลพิจารณาขึ้นเอง
- **Acceptance:** สถานะไม่เปลี่ยนโดยไม่มี actor, เวลา recorded, provenance และหลักฐาน; การพิจารณาขั้นสุดท้ายไม่มีใน prototype

### UC-04D เผยแพร่สถานะที่อนุมัติแล้ว

- **Actor:** เจ้าหน้าที่เผยแพร่ที่ได้รับมอบหมาย (อำนาจ `TO VERIFY`)
- **Trigger:** มีผลที่องค์กรอนุมัติให้เปิดเผย
- **Precondition:** มี approved release และ field allowlist; ตรวจสิทธิ์ `publish` และขอบเขตอีกครั้ง
- **Main flow:** สร้าง release revision → ตรวจทานฟิลด์สาธารณะ → เผยแพร่เลขติดตามและสถานะที่อนุญาต → มีแผนถอน release/cache
- **Exception:** สิทธิ์/แหล่งหลักฐานไม่ครบให้ปฏิเสธการเผยแพร่; ถอน release แล้วต้องล้าง cache ตามกำหนด
- **Acceptance:** public view แสดงเฉพาะฟิลด์ allowlist ไม่เปิดชื่อผู้ยื่น ที่อยู่ เบอร์โทร อีเมล เอกสาร หรือบันทึกภายในโดยปริยาย

## โครงข้อมูลที่เสนอสำหรับ production

| Entity | ฟิลด์สำคัญ | ข้อกำหนด |
| --- | --- | --- |
| `request_case` | `id`, `request_type`, `target_org_id`, `exam_session_id`, `province_id`, `status_code`, `current_revision_id`, `created_by`, `idempotency_key` | FK ไป `Organization`/`ExamSession`; unique/idempotency; status policy ยัง `TO VERIFY` |
| `request_revision` | `case_id`, `revision_no`, `payload`, `recorded_at`, `effective_at`, `provenance` | revision immutable; แยกวันมีผลกับวันบันทึก |
| `request_event` | `case_id`, `event_type`, `from_status`, `to_status`, `actor_id`, `recorded_at`, `evidence_ref`, `scope_snapshot` | append-only audit; transaction; ไม่เขียนทับประวัติ |
| `request_artifact` | `case_id`, `storage_key`, `classification`, `scan_state`, `retention_policy` | private storage; ตรวจสิทธิ์ download; quarantine/scan ก่อนเปิด |
| `request_release` | `case_id`, `revision_id`, `approved_by`, `allowlist`, `published_at`, `withdrawn_at` | public อ่านเฉพาะ release ที่อนุมัติ; ถอนและ revalidate cache ได้ |

ชื่อสถานะ/flow ใน UI ปัจจุบันเป็นตัวอย่าง `TEST_` ทั้งหมด ไม่ใช่ state machine ทางการ; ก่อนทำฐานข้อมูลจริงให้สร้าง migration หลังเจ้าของงานยืนยัน transition และผู้อนุมัติ

## Security / audit / reliability

- ปฏิเสธโดยปริยาย; authorize ที่ server/API/RPC, RLS และ Storage โดยแยก read, edit, export, download, approve, publish และตรวจ role+scope+วันที่มีผล
- ไม่ใช้ `user_metadata` กำหนดสิทธิ์; ตรวจสิทธิ์ซ้ำก่อน commit/อนุมัติ/เผยแพร่/ดาวน์โหลด; key ลับห้ามอยู่ใน client
- ข้อมูลบุคคลและเอกสารแนบเป็น restricted; public status ใช้เลขติดตามแบบสุ่มและ field allowlist ที่ผ่านอนุมัติ
- เขียน revision/event/audit พร้อมกันใน transaction; optimistic lock, unique constraint, idempotency และ outbox สำหรับส่งแจ้งเตือนหลัง commit
- แสดงเวลาตาม timezone ที่องค์กรกำหนดภายหลัง และเก็บ `recorded_at` แยก `effective_at`; ห้ามใช้วันที่ placeholder เป็นเหตุการณ์จริง

## ขอบเขตต้นแบบและการทดสอบ

ดู [คู่มือทดสอบภาษาไทย](TEST_GUIDE_TH.md) หัวข้อระบบ 04 และ [โปรไฟล์แหล่งข้อมูล](SYSTEM_04_SOURCE_PROFILE.md) ต้นแบบนี้ไม่มี backend, authentication, RLS, audit หรือการส่งคำขอ/การอนุมัติจริง การทดสอบทั้งหมดใช้ `TEST_` เท่านั้น
