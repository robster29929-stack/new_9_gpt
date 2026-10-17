import {
  type Json,
  type Row,
  type Snapshot,
  cloneSnapshot,
  snapshotSchema,
  text,
  testId,
} from "./model";
import { collection, importConfigs, saveRecord, audit } from "./domain";
import { initialStatus } from "@/core/workflow/test-portal";
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') {
      if (quoted && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (!quoted && cell.length)
        throw new Error("รูปแบบ CSV ไม่ถูกต้อง");
      else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("รูปแบบ CSV มีเครื่องหมายคำพูดไม่ครบ");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}
export interface ZipEntry {
  offset: number;
  compressed: number;
  expected: number;
  method: number;
}
export function checkXlsxArchive(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer),
    entries: ZipEntry[] = [];
  let total = 0;
  const decoder = new TextDecoder();
  for (let i = 0; i + 46 <= view.byteLength; i++) {
    if (view.getUint32(i, true) !== 0x02014b50) continue;
    const flags = view.getUint16(i + 8, true),
      method = view.getUint16(i + 10, true),
      compressed = view.getUint32(i + 20, true),
      size = view.getUint32(i + 24, true),
      nameSize = view.getUint16(i + 28, true),
      extra = view.getUint16(i + 30, true),
      comment = view.getUint16(i + 32, true),
      local = view.getUint32(i + 42, true);
    if (
      i + 46 + nameSize + extra + comment > view.byteLength ||
      local + 30 > view.byteLength ||
      view.getUint32(local, true) !== 0x04034b50
    )
      throw new Error("ไฟล์ Excel เสียหาย");
    const name = decoder
      .decode(new Uint8Array(buffer, i + 46, nameSize))
      .toLowerCase();
    if (
      flags & 1 ||
      name.includes("vbaproject") ||
      name.includes("externallinks/") ||
      name.includes("..") ||
      name.includes("embeddings/")
    )
      throw new Error("ไม่รองรับไฟล์เข้ารหัส มาโคร ลิงก์ภายนอก หรือไฟล์ฝัง");
    if (![0, 8].includes(method))
      throw new Error("รูปแบบการบีบอัด Excel ไม่รองรับ");
    const offset =
      local +
      30 +
      view.getUint16(local + 26, true) +
      view.getUint16(local + 28, true);
    if (offset + compressed > view.byteLength)
      throw new Error("ไฟล์ Excel เสียหาย");
    entries.push({ offset, compressed, expected: size, method });
    total += size;
    if (
      entries.length > 1500 ||
      total > 32 * 1024 * 1024 ||
      size > 16 * 1024 * 1024
    )
      throw new Error("ขนาดข้อมูลภายใน Excel เกินกำหนด");
    i += 45 + nameSize + extra + comment;
  }
  if (!entries.length) throw new Error("ไฟล์ไม่ใช่ Excel .xlsx ที่รองรับ");
  return entries;
}
/** Check actual inflated byte counts before ExcelJS allocates workbook objects. */
export async function preflightXlsx(buffer: ArrayBuffer) {
  const entries = checkXlsxArchive(buffer);
  let total = 0;
  for (const entry of entries) {
    let size = 0;
    if (entry.method === 0) size = entry.compressed;
    else {
      const reader = new Blob([
        buffer.slice(entry.offset, entry.offset + entry.compressed),
      ])
        .stream()
        .pipeThrough(new DecompressionStream("deflate-raw"))
        .getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > entry.expected || size > 16 * 1024 * 1024) {
            await reader.cancel();
            throw new Error("ขนาดข้อมูล Excel ที่ขยายจริงเกินกำหนด");
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
    total += size;
    if (size !== entry.expected || total > 32 * 1024 * 1024)
      throw new Error("ขนาดข้อมูล Excel ไม่ตรงกับข้อมูลไฟล์");
  }
}
export async function readWorkbook(file: File): Promise<string[][]> {
  if (file.size > 5 * 1024 * 1024) throw new Error("เลือกไฟล์ไม่เกิน 5 MB");
  if (/\.csv$/i.test(file.name)) {
    const rows = parseCsv(await file.text());
    if (rows.length > 10001 || rows.some((row) => row.length > 100))
      throw new Error("ข้อมูลเกิน 10,000 แถวหรือ 100 คอลัมน์");
    return rows;
  }
  if (!/\.xlsx$/i.test(file.name))
    throw new Error("รองรับเฉพาะ .xlsx และ .csv");
  const buffer = await file.arrayBuffer();
  await preflightXlsx(buffer);
  const { Workbook } = await import("exceljs");
  const book = new Workbook();
  await book.xlsx.load(buffer);
  if (book.worksheets.length !== 1)
    throw new Error("ใช้ไฟล์นำเข้าหนึ่งชีตตามแม่แบบกลาง");
  const sheet = book.worksheets[0];
  if (!sheet) throw new Error("ไฟล์ไม่มีชีต");
  if (sheet.rowCount > 10001 || sheet.columnCount > 100)
    throw new Error("ข้อมูลเกิน 10,000 แถวหรือ 100 คอลัมน์");
  const rows: string[][] = [];
  sheet.eachRow({ includeEmpty: true }, (row) => {
    const values: string[] = [];
    for (let i = 1; i <= sheet.columnCount; i++) {
      const v = row.getCell(i).value;
      if (v && typeof v === "object")
        throw new Error("ไม่รองรับสูตร ลิงก์ หรือชนิดข้อมูลพิเศษในไฟล์นำเข้า");
      values.push(String(v ?? "").trim());
    }
    rows.push(values);
  });
  return rows;
}
export async function workbookBytes(headers: string[], rows: Json[][]) {
  const { Workbook } = await import("exceljs");
  const book = new Workbook();
  book.creator = "TEST_ระบบทดสอบ";
  const sheet = book.addWorksheet("TEST_ข้อมูล");
  sheet.addRow(headers);
  rows.forEach((row) =>
    sheet.addRow(
      row.map((v) =>
        Array.isArray(v)
          ? v.map(text).join(";")
          : typeof v === "object"
            ? text(v)
            : v,
      ),
    ),
  );
  sheet.getRow(1).font = { bold: true, name: "TH Sarabun New", size: 16 };
  sheet.columns.forEach((col) => {
    col.width = 28;
  });
  const result = await book.xlsx.writeBuffer();
  return new Uint8Array(result);
}
export async function exportRecords(
  s: Snapshot,
  module: string,
  template = false,
) {
  const config = importConfigs[module];
  if (!config) throw new Error("ยังไม่มีแม่แบบสำหรับรายการนี้");
  const fields = config.fields.map((f) => f[1]!);
  const rows = template
    ? []
    : collection(s, module)
        .filter(
          (r) =>
            !r.deleted_at &&
            (module !== "correspondence" || r.classification === "TEST_ทั่วไป"),
        )
        .map((r) => fields.map((key) => r[key] ?? ""));
  return workbookBytes(
    config.fields.map((f) => f[0]!),
    rows,
  );
}
export interface ImportPreview {
  rows: Row[];
  errors: string[];
  updates: number;
  inserts: number;
  module: string;
  baseline: Record<string, string>;
}
export function previewRecords(
  s: Snapshot,
  module: string,
  raw: string[][],
): ImportPreview {
  module = module === "pali" ? "learning" : module;
  const config = importConfigs[module];
  if (!config) throw new Error("เลือกประเภทข้อมูล");
  const headers = (raw[0] || []).map((h) => h.replace(/^\uFEFF/, "").trim());
  const expected = config.fields.map((f) => f[0]!);
  if (
    new Set(headers).size !== headers.length ||
    headers.some((h) => !expected.includes(h))
  )
    throw new Error("หัวคอลัมน์ซ้ำหรืออยู่นอกแม่แบบ");
  const optional = config.optionalFields || [];
  if (
    config.fields.some(
      ([label, key]) => !optional.includes(key!) && !headers.includes(label!),
    )
  )
    throw new Error("หัวคอลัมน์ไม่ครบ กรุณาใช้แม่แบบของระบบที่เลือก");
  const rows: Row[] = [],
    errors: string[] = [],
    seen = new Set<string>();
  const baseline: Record<string, string> = {};
  let updates = 0;
  for (const [index, values] of raw.slice(1).entries()) {
    if (!values.some(Boolean)) continue;
    try {
      if (values.slice(headers.length).some(Boolean))
        throw new Error("มีข้อมูลที่ไม่มีหัวคอลัมน์");
      const row: Row = { id: "" };
      for (const [label, key] of config.fields) {
        const i = headers.indexOf(label!),
          value = i < 0 ? "" : (values[i] || "").trim();
        if (config.numeric?.includes(key!)) {
          const n = Number(value);
          if (!/^\d+$/.test(value) || !Number.isSafeInteger(n))
            throw new Error("จำนวนต้องเป็นจำนวนเต็มไม่ติดลบ");
          row[key!] = n;
        } else
          row[key!] =
            key === "educationPositions"
              ? value.split(/[;|]/).filter(Boolean)
              : value;
      }
      testId.parse(row.id);
      if (seen.has(row.id)) throw new Error("รหัสซ้ำในไฟล์");
      seen.add(row.id);
      const old = collection(s, module).find((r) => r.id === row.id);
      if (old?.deleted_at) throw new Error("ระเบียนนี้ถูกยกเลิกอยู่");
      if (
        row.status &&
        row.status !== old?.status &&
        row.status !== initialStatus(module)
      )
        throw new Error("เปลี่ยนสถานะผ่านขั้นตอนของระบบเท่านั้น");
      if (module === "learning" || module === "pali") {
        const original = collection(s, "learning").find((r) => r.id === row.id);
        if (
          !original ||
          ["track", "domain", "level", "subject"].some(
            (key) => row[key] !== original[key],
          )
        )
          throw new Error("รหัสและหมวดรายวิชาต้องตรงกับคลังเดิม");
        for (const key of ["lessons", "questionBank", "rubric"])
          if (
            row[key] !== original[key] &&
            text(row[key]) &&
            !text(row[key]).startsWith("TEST_")
          )
            throw new Error("ใช้เนื้อหา TEST_ เท่านั้น");
      } else if (module === "budget") {
        for (const key of ["name", "type"])
          if (!text(row[key]).startsWith("TEST_"))
            throw new Error("ข้อความต้องขึ้นต้น TEST_");
        if (
          Number(row.paidSatang) > Number(row.committedSatang) ||
          Number(row.committedSatang) > Number(row.allocatedSatang)
        )
          throw new Error("ต้องมี จ่าย ≤ ผูกพัน ≤ จัดสรร");
      } else saveRecord(s, module, row);
      baseline[row.id] = JSON.stringify(old ?? null);
      rows.push(row);
      if (old) updates++;
    } catch (e) {
      errors.push(
        `แถว ${index + 2}: ${e instanceof Error && e.name !== "ZodError" ? e.message : "ข้อมูลไม่ตรงรูปแบบ TEST_"}`,
      );
    }
  }
  if (!rows.length && !errors.length) errors.push("ไฟล์ไม่มีข้อมูล");
  return {
    rows,
    errors,
    updates,
    inserts: rows.length - updates,
    module,
    baseline,
  };
}
export function applyImport(
  s: Snapshot,
  preview: ImportPreview,
  overwrite: boolean,
): Snapshot {
  if (preview.errors.length || !preview.rows.length)
    throw new Error("ไฟล์ยังไม่ผ่านการตรวจสอบ");
  if (preview.updates && !overwrite)
    throw new Error("กรุณายืนยันเขียนทับข้อมูลเดิม");
  for (const row of preview.rows) {
    const current = collection(s, preview.module).find((r) => r.id === row.id);
    if (JSON.stringify(current ?? null) !== preview.baseline[row.id])
      throw new Error(
        "ข้อมูลเปลี่ยนหลังตรวจตัวอย่าง กรุณาเลือกไฟล์และตรวจใหม่",
      );
  }
  let copy = cloneSnapshot(s);
  for (const row of preview.rows) {
    if (preview.module === "learning" || preview.module === "pali") {
      const rows = collection(copy, "learning"),
        i = rows.findIndex((r) => r.id === row.id);
      if (i < 0) throw new Error("ไม่พบรายวิชา");
      rows[i] = { ...rows[i]!, ...row };
    } else if (preview.module === "budget") {
      const rows = collection(copy, "budget"),
        i = rows.findIndex((r) => r.id === row.id);
      const result = {
        ...(rows[i] || {}),
        ...row,
        status: rows[i]?.status || initialStatus("budget"),
      };
      if (i >= 0) rows[i] = result;
      else rows.push(result);
    } else copy = saveRecord(copy, preview.module, row);
  }
  audit(
    copy,
    "นำเข้า Excel TEST_",
    preview.module,
    String(preview.rows.length) + " รายการ",
  );
  return snapshotSchema.parse(copy);
}
export const examHeaders = [
  "ชื่อผู้สมัคร",
  "ประเภทผู้สมัคร",
  "ชั้น",
  "หน่วยงาน",
  "รหัสรอบสอบ",
];
export function previewExam(s: Snapshot, formKey: string, raw: string[][]) {
  const profiles = (s.catalogs.examForms || []) as Record<string, Json>[];
  const profile = profiles.find((r) => r.key === formKey);
  if (!profile) throw new Error("เลือกประเภทบัญชีก่อน");
  const alias: Record<string, string> = {
    name: "ชื่อผู้สมัคร",
    applicant_type: "ประเภทผู้สมัคร",
    type: "ประเภทผู้สมัคร",
    level: "ชั้น",
    unit: "หน่วยงาน",
    exam_session_id: "รหัสรอบสอบ",
  };
  const headers = (raw[0] || []).map(
    (h) =>
      alias[
        h
          .replace(/^\uFEFF/, "")
          .trim()
          .toLowerCase()
      ] || h.replace(/^\uFEFF/, "").trim(),
  );
  if (
    headers.length !== examHeaders.length ||
    new Set(headers).size !== headers.length ||
    examHeaders.some((h) => !headers.includes(h))
  )
    throw new Error("ใช้หัวคอลัมน์ห้าช่องตามแม่แบบกลาง");
  const rows: Record<string, string>[] = [],
    rowErrors: string[][] = [],
    seen = new Set<string>();
  for (const values of raw.slice(1)) {
    if (!values.some(Boolean)) continue;
    const row = Object.fromEntries(
      headers.map((h, i) => [h, (values[i] || "").trim()]),
    );
    const errors: string[] = [];
    if (values.slice(headers.length).some(Boolean))
      errors.push("มีค่าที่ไม่มีหัวคอลัมน์");
    for (const h of examHeaders)
      if (!row[h]?.startsWith("TEST_")) errors.push(h + "ต้องขึ้นต้น TEST_");
    const grade = row["ชั้น"] || "",
      kind = row["ประเภทผู้สมัคร"] || "";
    if (
      !grade.includes(text(profile.program)) ||
      (profile.grade === "ตรี" ? !grade.includes("ตรี") : !/โท|เอก/.test(grade))
    )
      errors.push("ชั้นไม่ตรงกับประเภทบัญชี");
    if (
      profile.program === "นักธรรม"
        ? !/บรรพชิต|สามเณร/.test(kind)
        : !/คฤหัสถ์|นักเรียน|นักศึกษา/.test(kind)
    )
      errors.push("ประเภทผู้สมัครไม่ตรงกับบัญชี");
    if (seen.has(row["ชื่อผู้สมัคร"] || "")) errors.push("ชื่อซ้ำ");
    seen.add(row["ชื่อผู้สมัคร"] || "");
    rows.push(row);
    rowErrors.push(errors);
  }
  return { rows, rowErrors, errors: rowErrors.flat() };
}
export function commitExam(
  s: Snapshot,
  formKey: string,
  fileName: string,
  raw: string[][],
) {
  const result = previewExam(s, formKey, raw);
  if (result.errors.length || !result.rows.length)
    throw new Error("ไฟล์ยังไม่ผ่านการตรวจสอบ");
  const copy = cloneSnapshot(s);
  copy.examImport = { ...result, formKey, fileName, committed: true };
  audit(copy, "ยืนยันบัญชีสมัคร TEST_", "exam-import", formKey);
  return copy;
}
