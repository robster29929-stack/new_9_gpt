# พื้นที่ทำงาน 9 ระบบ — Next.js

เว็บหลักใช้ **Next.js App Router 16.4.2, React 19.3.1, TypeScript strict และ Tailwind CSS 4.3.3** แล้ว ไม่มีการโหลด `dist/assets/app.js` หรือฝังหน้าเก่าผ่าน iframe ในเส้นทางใหม่

## เริ่มต้น

ใช้ Node.js 22 ขึ้นไปและ npm:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm start
```

สำหรับพัฒนา: `npm run dev` หลังตรวจการตั้งค่าสภาพแวดล้อมแล้ว

- `/login`, `/signup`, `/forgot-password`, `/reset-password`: หน้าบัญชี React
- `/workspace`: ภาพรวม
- `/workspace/people`, `organizations`, `learning`, `requests`, `admissions`, `budget`, `assets`, `correspondence`, `exam-import`: ระบบ 01–09
- `/workspace/access-control`, `data-tools`, `activity`: สิทธิ์จำลอง, Excel และประวัติ TEST_
- ลิงก์เก่า `/login.html`, `/signup.html`, `/forgot-password.html`, `/reset-password.html`, `/workspace.html` เปลี่ยนเส้นทางไปหน้าใหม่ เพื่อให้ลิงก์เดิมและ callback ในอีเมลยังใช้ต่อได้

## บัญชีและข้อมูลเดิม

ใช้ `@supabase/supabase-js` **2.118.0** กับ Supabase Auth และฐานข้อมูลเดิม `ffgedvyumiyujlfuimrj` โดยใช้ `portal_workspaces`, `portal_seed` และ RPC `portal_save_workspace` เดิม สัญญา snapshot ยังเป็น schemaVersion 1; ฟิลด์ที่ไม่ได้แก้ไขและฟิลด์เพิ่มเติมยังถูกเก็บไว้ การบันทึกใช้ expected revision ป้องกันการเขียนทับจากหลายหน้าต่าง

**การย้ายหน้าเว็บไม่เปลี่ยน schema, migration, RLS หรือบัญชีผู้ใช้ และไม่ได้ใช้ Supabase connector กับโปรเจกต์ที่ยังไม่ยืนยันว่าเป็น dev**

ตั้งค่า public configuration ด้วย `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` หรือใช้ public config เดิมใน `config/supabase.public.json` ตัวแปร `NEXT_PUBLIC_` ถูกส่งเข้า browser จึงใช้ได้เฉพาะ URL/publishable key เท่านั้น ห้ามใส่ secret/service-role key

ระบบใช้ storage key ของ Supabase เดิม บัญชีที่เข้าสู่ระบบบน origin เดิมจึงอ่าน session และพื้นที่เดิมต่อได้ หน้าสมัครไม่สร้าง admin อัตโนมัติ การส่งอีเมลยังต้องใช้ Auth URL/SMTP ที่ตั้งค่าถูกต้อง ไม่มีการสร้างบัญชีหรือส่งอีเมลจริงระหว่างทดสอบการย้าย

## ขอบเขต TEST_

ทุกระบบงานยังเป็นต้นแบบ TEST_ เช่นเดิม สิทธิ์งาน การเปลี่ยนสถานะ ผลสอบ ยอดเงิน เอกสาร และการส่งหนังสือยังไม่ใช่การดำเนินงานทางการ ประวัติใหม่เป็นเหตุการณ์ TEST_ ที่บันทึกใน snapshot ของบัญชี ไม่ใช่ตาราง `audit_logs` สำหรับ production

การใช้งานจริงหลายหน่วยงานยังต้องมี `docs/design.md` หัวข้อ 4 ที่ยืนยันแล้ว, project dev, canonical schema, settings, `can_access()`, audit/RLS และชุดทดสอบสิทธิ์ตามพื้นที่ การย้ายเทคโนโลยีครั้งนี้ไม่ได้รับรองว่าข้อกำหนดเหล่านั้นเสร็จแล้ว

## ทดสอบ

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright รันกับ production build ผ่าน `next start` และจำลองเฉพาะ Supabase HTTP API ด้วยข้อมูล TEST_ ไม่เขียนฐานจริง ไม่ส่งอีเมลจริง ผลนี้ตรวจการทำงานของ client และสัญญา API ไม่ได้แทนการทดสอบ RLS หรือ SMTP บนฐานจริง

ฟอนต์ TH Sarabun New ใช้ไฟล์เดิมแบบ self-hosted ผ่าน `next/font/local` พร้อมใบอนุญาตใน `public/assets/fonts/OFL.txt` ปุ่มและแบบฟอร์มสืบทอดฟอนต์เดียวกัน

โค้ด static เดิมใน `dist` ถูกเก็บเป็น reference และ regression fixture; Vercel build เว็บหลักด้วย `next build` และใช้ `.next` ดูรายละเอียดใน [รายงานการย้าย](docs/MIGRATION_NEXT_REACT.md)
