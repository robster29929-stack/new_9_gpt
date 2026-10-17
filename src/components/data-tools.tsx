"use client";
import { useState } from "react";
import { type Row, type Json, text, download } from "@/lib/model";
import { importConfigs, collection } from "@/lib/domain";
import {
  readWorkbook,
  exportRecords,
  previewRecords,
  applyImport,
  type ImportPreview,
  workbookBytes,
  examHeaders,
  previewExam,
  commitExam,
} from "@/lib/excel";
import { useWorkspace } from "./workspace-provider";
import { findModule } from "@/lib/modules";
import { Dialog } from "./dialog";
import { Button } from "./ui/button";
import { RecordsTable } from "./records-table";
import { Downloads } from "./downloads";
export function DataTools({
  exam = false,
  initialModule = "people",
}: {
  exam?: boolean;
  initialModule?: string;
}) {
  const { snapshot, mutate, setMessage } = useWorkspace();
  const [module, setModule] = useState(initialModule),
    [formKey, setFormKey] = useState(""),
    [raw, setRaw] = useState<string[][]>([]),
    [fileName, setFileName] = useState(""),
    [preview, setPreview] = useState<ImportPreview | null>(null),
    [errors, setErrors] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  const profiles = (snapshot.catalogs.examForms || []) as Record<
    string,
    Json
  >[];
  const examPreview =
    exam && raw.length && formKey
      ? (() => {
          try {
            return previewExam(snapshot, formKey, raw);
          } catch {
            return null;
          }
        })()
      : null;
  async function exportFile(template: boolean) {
    setBusy(true);
    try {
      const bytes = exam
        ? await workbookBytes(examHeaders, [])
        : await exportRecords(snapshot, module, template);
      download(
        bytes.buffer as ArrayBuffer,
        exam
          ? "TEST_บัญชีสมัคร.xlsx"
          : `TEST_${module}${template ? "_แม่แบบ" : ""}.xlsx`,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "ส่งออกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  const records: Row[] = exam
    ? examPreview?.rows.map((row, i) => ({
        id: `TEST_ROW_${i + 1}`,
        ...row,
        status: examPreview.rowErrors[i]?.join(" · ") || "TEST_ผ่านการตรวจ",
      })) || []
    : preview?.rows || [];
  const allowed = exam
    ? !!examPreview?.rows.length && !examPreview.errors.length
    : !!preview?.rows.length && !preview.errors.length;
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        {exam ? (
          <label className="min-w-0 max-w-full">
            ประเภทบัญชี
            <select
              aria-label="ประเภทบัญชี"
              className="mt-1 block w-full max-w-full"
              value={formKey}
              onChange={(e) => {
                setFormKey(e.target.value);
                setRaw([]);
                setErrors([]);
              }}
            >
              <option value="">เลือกประเภทบัญชี</option>
              {profiles.map((p) => (
                <option key={text(p.key)} value={text(p.key)}>
                  {text(p.label)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="min-w-0 max-w-full">
            ระบบข้อมูล
            <select
              aria-label="ระบบข้อมูล"
              className="mt-1 block w-full max-w-full"
              value={module}
              onChange={(e) => {
                setModule(e.target.value);
                setPreview(null);
                setRaw([]);
                setErrors([]);
              }}
            >
              {Object.entries(importConfigs)
                .filter(([id]) => id !== "pali")
                .map(([id]) => (
                  <option key={id} value={id === "pali" ? "learning" : id}>
                    {findModule(id)?.name || "คลังรายวิชา"}
                  </option>
                ))}
            </select>
          </label>
        )}
        {!exam && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void exportFile(false)}
          >
            ส่งออก Excel
          </Button>
        )}
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => void exportFile(true)}
        >
          ดาวน์โหลดแม่แบบ Excel
        </Button>
        <label className="min-w-0 max-w-full">
          เลือกไฟล์ .xlsx หรือ .csv
          <input
            className="mt-1 block max-w-full"
            type="file"
            accept=".xlsx,.csv"
            disabled={busy || (exam && !formKey)}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setPreview(null);
              setRaw([]);
              setErrors([]);
              try {
                const data = await readWorkbook(file);
                setFileName(file.name);
                if (exam) {
                  const result = previewExam(snapshot, formKey, data);
                  setRaw(data);
                  setErrors(result.errors);
                } else {
                  const target = module === "learning" ? "pali" : module;
                  const next = previewRecords(snapshot, target, data);
                  setPreview({ ...next, module });
                  setErrors(next.errors);
                }
              } catch (e) {
                setErrors([
                  e instanceof Error ? e.message : "อ่านไฟล์ไม่สำเร็จ",
                ]);
              } finally {
                setBusy(false);
                event.target.value = "";
              }
            }}
          />
        </label>
      </div>
      <p className="test-note mb-5">
        ใช้ข้อมูล TEST_ เท่านั้น · ตรวจตัวอย่างก่อนยืนยัน · ไม่รับสูตร มาโคร
        ไฟล์เข้ารหัส หรือลิงก์ภายนอก · สูงสุด 5 MB
      </p>
      {busy && <p role="status">กำลังประมวลผลไฟล์…</p>}
      {fileName && <p className="mb-3">ไฟล์: {fileName}</p>}
      {errors.length > 0 && (
        <div role="alert" className="error mb-5">
          <p>พบปัญหา {errors.length} รายการ</p>
          <ul className="list-disc pl-6">
            {errors.slice(0, 30).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {records.length > 0 && (
        <>
          <RecordsTable
            rows={records}
            {...(exam ? { columns: [...examHeaders, "status"] } : {})}
            caption="ตัวอย่างก่อนนำเข้า"
          />
          {preview && (
            <p className="my-4">
              เพิ่ม {preview.inserts} รายการ · เขียนทับ {preview.updates} รายการ
            </p>
          )}
          <Button
            className="my-5"
            disabled={!allowed || busy}
            onClick={() => setConfirm(true)}
          >
            ตรวจสอบและยืนยันนำเข้า
          </Button>
        </>
      )}
      {confirm && (
        <Dialog
          title="ยืนยันนำเข้าข้อมูล TEST_"
          onClose={() => setConfirm(false)}
        >
          <p className="mb-4">
            จะบันทึก {records.length} รายการในพื้นที่ทดสอบของบัญชีนี้
            {preview?.updates
              ? ` และเขียนทับข้อมูลเดิม ${preview.updates} รายการ`
              : ""}
          </p>
          <Button
            onClick={() => {
              try {
                mutate((s) =>
                  exam
                    ? commitExam(s, formKey, fileName, raw)
                    : applyImport(s, preview!, true),
                );
                setConfirm(false);
                setRaw([]);
                setPreview(null);
                setFileName("");
              } catch {
                setConfirm(false);
              }
            }}
          >
            {preview?.updates ? "ยืนยันนำเข้าและเขียนทับ" : "ยืนยันนำเข้า"}
          </Button>
        </Dialog>
      )}
      {exam &&
        snapshot.examImport &&
        typeof snapshot.examImport === "object" &&
        !Array.isArray(snapshot.examImport) && (
          <p className="my-4">
            บัญชีที่บันทึกล่าสุด: {text(snapshot.examImport.fileName)} ·{" "}
            {Array.isArray(snapshot.examImport.rows)
              ? snapshot.examImport.rows.length
              : 0}{" "}
            รายการ
          </p>
        )}
      <Downloads kind={exam ? "dhamma" : "all"} />
    </section>
  );
}
