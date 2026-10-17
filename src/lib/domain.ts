import { z } from "zod";
import {
  type Row,
  type Snapshot,
  type Json,
  cloneSnapshot,
  stateRows,
  testId,
  assertTestText,
  text,
  snapshotSchema,
} from "./model";
import metadata from "./legacy-metadata.json";
import {
  initialStatus,
  transitionTestRecord,
  softDeleteTestRecord,
  restoreTestRecord,
} from "@/core/workflow/test-portal";
export const importConfigs: Record<
  string,
  { fields: string[][]; numeric?: string[]; optionalFields?: string[] }
> = metadata.imports;
importConfigs.learning = importConfigs.pali!;
export function audit(
  s: Snapshot,
  action: string,
  module: string,
  recordId: string,
) {
  const rows = stateRows(s, "migrationAudit");
  rows.push({
    id: "TEST_EVENT_" + crypto.randomUUID(),
    action,
    module,
    recordId,
    actorId: "TEST_เจ้าของพื้นที่",
    at: new Date().toISOString(),
  });
  s.state.migrationAudit = rows;
}
export function collection(s: Snapshot, module: string): Row[] {
  if (module === "learning") return (s.catalogs.courses || []) as Row[];
  if (module === "access-control") return stateRows(s, "permissionAssignments");
  if (module === "activity") return stateRows(s, "migrationAudit");
  return s.moduleRows[module] || [];
}
export function saveRecord(
  s: Snapshot,
  module: string,
  record: Row,
  creating = false,
): Snapshot {
  if (
    ![
      "people",
      "organizations",
      "requests",
      "admissions",
      "assets",
      "correspondence",
    ].includes(module)
  )
    throw new Error("รายการนี้ไม่อนุญาตให้แก้ไขผ่านทะเบียน");
  const copy = cloneSnapshot(s),
    rows = collection(copy, module);
  const index = rows.findIndex((row) => row.id === record.id),
    old = rows[index];
  testId.parse(record.id);
  if (creating && old) throw new Error("รหัสระเบียนซ้ำ กรุณาใช้รหัสใหม่");
  if (old?.deleted_at) throw new Error("กรุณาคืนสถานะรายการก่อนแก้ไข");
  const allowed = new Set([
    ...(importConfigs[module]?.fields
      .map((f) => f[1])
      .filter((v): v is string => !!v) || []),
    ...Object.keys(rows[0] || {}),
    "summary",
    "direction",
    "urgency",
    "educationPositions",
    "sanghaRegion",
    "changeType",
    "changeSummary",
    "temple",
    "office",
    "section",
    "region",
    "subdistrict",
    "district",
    "phone",
    "email",
    "lineId",
    "effectiveDate",
    "recordedDate",
    "evidence",
  ]);
  const excluded = new Set([
    "status",
    "sub",
    "tone",
    "timeline",
    "currentStep",
    "officialOutcome",
    "deleted_at",
    "revision",
    "previousStatus",
    "createdAt",
    "updatedAt",
  ]);
  const result: Row = old
    ? { ...old }
    : { id: record.id, status: initialStatus(module) };
  for (const [key, value] of Object.entries(record)) {
    if (key === "id" || excluded.has(key)) continue;
    if (!allowed.has(key)) throw new Error("พบช่องข้อมูลที่ไม่ได้รับอนุญาต");
    if (JSON.stringify(old?.[key]) === JSON.stringify(value)) continue;
    if (
      [
        "citizenId",
        "citizen_id",
        "national_id",
        "encryptedIdentifier",
      ].includes(key)
    )
      throw new Error("ยังไม่เปิดรับเลขประจำตัวประชาชน");
    if (typeof value === "string") {
      if (value.length > 5000) throw new Error("ข้อความยาวเกินกำหนด");
      if (key === "direction") {
        if (!["incoming", "outgoing", "notice"].includes(value))
          throw new Error("ประเภทหนังสือไม่ถูกต้อง");
      } else assertTestText(value);
      if (
        /email/i.test(key) &&
        value &&
        !/^TEST_.*@(example\.test|[^@]+\.invalid)$/.test(value)
      )
        throw new Error(
          "ใช้เฉพาะอีเมล TEST_ ที่ลงท้าย example.test หรือ .invalid",
        );
    }
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v !== "string")
          throw new Error("ข้อมูลรายการเลือกไม่ถูกต้อง");
        assertTestText(v);
      });
    }
    if (typeof value === "number" && !Number.isSafeInteger(value))
      throw new Error("ใช้จำนวนเต็มเท่านั้น");
    result[key] = value;
  }
  if (!text(result.name).startsWith("TEST_"))
    throw new Error("ชื่อหรือรายการต้องขึ้นต้นด้วย TEST_");
  if (
    module === "people" &&
    result.sanghaRegion &&
    !/^TEST_ภาค_([1-9]|1[0-8])$/.test(text(result.sanghaRegion))
  )
    throw new Error("เลือกภาค 1–18");
  if (module === "correspondence") {
    if (!old && record.direction === "incoming")
      result.status = initialStatus("incoming-correspondence");
    result.direction ||= "outgoing";
    result.classification ||= "TEST_ทั่วไป";
  }
  if (index >= 0) rows[index] = result;
  else rows.unshift(result);
  audit(
    copy,
    old ? "แก้ไขระเบียน TEST_" : "สร้างระเบียน TEST_",
    module,
    result.id,
  );
  return snapshotSchema.parse(copy);
}
export function changeRecord(
  s: Snapshot,
  module: string,
  id: string,
  to: "delete" | "restore" | string,
): Snapshot {
  const copy = cloneSnapshot(s),
    rows = collection(copy, module),
    i = rows.findIndex((row) => row.id === id),
    row = rows[i];
  if (!row) throw new Error("ไม่พบระเบียน");
  if (module === "learning")
    throw new Error("คลังรายวิชายังไม่เปิดเปลี่ยนสถานะ");
  if (
    to === "delete" &&
    module === "assets" &&
    stateRows(s, "assetMovements").some((m) => m.assetId === id)
  )
    throw new Error("ทะเบียนนี้มีรายการเคลื่อนไหวแล้ว จึงยังยกเลิกไม่ได้");
  rows[i] =
    to === "delete"
      ? softDeleteTestRecord(row, new Date().toISOString())
      : to === "restore"
        ? restoreTestRecord(row)
        : transitionTestRecord(row, to);
  audit(copy, "เปลี่ยนสถานะ TEST_", module, id);
  return copy;
}
export function budgetTotals(s: Snapshot) {
  return collection(s, "budget").reduce(
    (a, r) => ({
      allocated: a.allocated + Number(r.allocatedSatang || 0),
      committed: a.committed + Number(r.committedSatang || 0),
      paid: a.paid + Number(r.paidSatang || 0),
    }),
    { allocated: 0, committed: 0, paid: 0 },
  );
}
const budgetSchema = z.object({
  id: testId,
  stage: z.enum([
    "plan",
    "transfer",
    "commitment",
    "disbursement",
    "refund",
    "reconcile",
    "close",
  ]),
  period: testId,
  label: z.string().startsWith("TEST_"),
  unit: z.string().startsWith("TEST_"),
  amountSatang: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER),
});
export function addBudgetDraft(
  s: Snapshot,
  input: Record<string, unknown>,
): Snapshot {
  const row = budgetSchema.parse(input);
  const copy = cloneSnapshot(s),
    drafts = stateRows(copy, "budgetDrafts");
  if (
    drafts.some((r) => r.id === row.id) ||
    collection(s, "budget").some((r) => r.id === row.id)
  )
    throw new Error("รหัสรายการซ้ำ");
  const totals = budgetTotals(s);
  const reserve = (stage: string) =>
    drafts
      .filter((r) => r.stage === stage && !r.deleted_at)
      .reduce((sum, r) => sum + Number(r.amountSatang || 0), 0);
  const limit =
    row.stage === "commitment"
      ? totals.allocated - totals.committed - reserve("commitment")
      : row.stage === "disbursement"
        ? totals.committed - totals.paid - reserve("disbursement")
        : row.stage === "refund"
          ? totals.paid - reserve("refund")
          : Number.MAX_SAFE_INTEGER;
  if (row.amountSatang > limit)
    throw new Error("ยอดร่างเกินยอดคงเหลือที่ใช้ทำรายการได้");
  drafts.push({ ...row, status: initialStatus("budget") });
  copy.state.budgetDrafts = drafts;
  audit(copy, "สร้างร่างงบประมาณ TEST_", "budget", row.id);
  return copy;
}
export function assetBalance(s: Snapshot, id: string, location?: string) {
  return stateRows(s, "assetMovements")
    .filter((r) => r.assetId === id && (!location || r.location === location))
    .reduce((sum, r) => sum + Number(r.quantityDelta || 0), 0);
}
export function outstanding(s: Snapshot, reference: string) {
  const source = stateRows(s, "assetMovements")
    .filter(
      (r) =>
        r.reference === reference && ["issue", "loan"].includes(text(r.type)),
    )
    .reduce((sum, r) => sum - Math.min(0, Number(r.quantityDelta || 0)), 0);
  const returned = stateRows(s, "assetMovements")
    .filter((r) => r.sourceReference === reference)
    .reduce((sum, r) => sum + Math.max(0, Number(r.quantityDelta || 0)), 0);
  return source - returned;
}
const assetEventSchema = z.object({
  reference: testId,
  assetId: testId,
  note: z.string().startsWith("TEST_"),
  quantity: z.coerce.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  location: z.string().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  sourceReference: z.string().optional(),
  borrower: z.string().optional(),
  budgetReference: z.string().optional(),
  mode: z.enum(["lend", "return"]).optional(),
});
export function addAssetEvent(
  s: Snapshot,
  stage: string,
  input: Record<string, unknown>,
): Snapshot {
  const row = assetEventSchema.parse(input),
    copy = cloneSnapshot(s);
  if (
    !collection(s, "assets").some((r) => r.id === row.assetId && !r.deleted_at)
  )
    throw new Error("ไม่พบทะเบียนพัสดุ");
  const keys = [
    "assetMovements",
    "assetLoans",
    "assetMaintenance",
    "assetCounts",
    "assetDisposals",
    "assetPurchases",
  ];
  if (
    keys.some((key) =>
      stateRows(s, key).some(
        (r) => r.reference === row.reference || r.id === row.reference,
      ),
    )
  )
    throw new Error("รหัสอ้างอิงซ้ำ");
  if (stage !== "count" && row.quantity < 1)
    throw new Error("จำนวนต้องเป็นจำนวนเต็มมากกว่า 0");
  const locations = (s.catalogs.assetLocations || []) as string[];
  const origin = stage === "transfer" ? row.fromLocation : row.location;
  if (stage !== "purchase" && !locations.includes(origin || ""))
    throw new Error("เลือกคลังที่กำหนด");
  const base = {
    reference: row.reference,
    assetId: row.assetId,
    note: row.note,
    status: initialStatus("assets"),
  };
  const movements = stateRows(copy, "assetMovements");
  const move = (
    type: string,
    quantityDelta: number,
    location: string,
    extra: Record<string, Json> = {},
  ) => {
    movements.push({
      ...base,
      id: "TEST_MOVEMENT_" + crypto.randomUUID(),
      type,
      quantityDelta,
      location,
      ...extra,
    });
  };
  const available = assetBalance(s, row.assetId, origin);
  const at = origin || "";
  if (
    ["issue", "transfer"].includes(stage) ||
    (stage === "loans" && row.mode !== "return") ||
    stage === "disposal"
  ) {
    if (available < row.quantity) throw new Error("ยอดคงเหลือในคลังไม่เพียงพอ");
  }
  if (stage === "receive") move("receive", row.quantity, at);
  else if (stage === "issue") move("issue", -row.quantity, at);
  else if (stage === "transfer") {
    if (
      !locations.includes(row.toLocation || "") ||
      row.fromLocation === row.toLocation
    )
      throw new Error("คลังต้นทางและปลายทางต้องต่างกัน");
    move("transfer_out", -row.quantity, at, {
      counterpartLocation: row.toLocation!,
    });
    move("transfer_in", row.quantity, row.toLocation!, {
      counterpartLocation: at,
    });
  } else if (
    stage === "return" ||
    (stage === "loans" && row.mode === "return")
  ) {
    const type = stage === "return" ? "issue" : "loan";
    const source = stateRows(s, "assetMovements").find(
      (r) =>
        r.reference === row.sourceReference &&
        r.type === type &&
        r.assetId === row.assetId,
    );
    if (!source || outstanding(s, row.sourceReference || "") < row.quantity)
      throw new Error("จำนวนคืนเกินยอดคงค้างหรือรายการต้นทางไม่ตรง");
    move(stage === "return" ? "return" : "loan_return", row.quantity, at, {
      sourceReference: row.sourceReference!,
    });
  } else if (stage === "loans") {
    assertTestText(row.borrower || "");
    if (!row.borrower) throw new Error("ระบุผู้ยืม");
    move("loan", -row.quantity, at);
    copy.state.assetLoans = [
      ...stateRows(copy, "assetLoans"),
      {
        ...base,
        id: row.reference,
        quantity: row.quantity,
        borrower: row.borrower,
        location: at,
        status: "TEST_ยืมคงค้าง",
      },
    ];
  } else if (stage === "purchase") {
    if (!collection(s, "budget").some((r) => r.id === row.budgetReference))
      throw new Error("เลือกแผนงบประมาณ");
    copy.state.assetPurchases = [
      ...stateRows(copy, "assetPurchases"),
      {
        ...base,
        id: row.reference,
        quantity: row.quantity,
        budgetReference: row.budgetReference!,
      },
    ];
  } else if (stage === "maintenance")
    copy.state.assetMaintenance = [
      ...stateRows(copy, "assetMaintenance"),
      { ...base, id: row.reference, location: at },
    ];
  else if (stage === "count")
    copy.state.assetCounts = [
      ...stateRows(copy, "assetCounts"),
      {
        ...base,
        id: row.reference,
        location: at,
        expected: available,
        counted: row.quantity,
        variance: row.quantity - available,
      },
    ];
  else if (stage === "disposal")
    copy.state.assetDisposals = [
      ...stateRows(copy, "assetDisposals"),
      { ...base, id: row.reference, location: at, quantity: row.quantity },
    ];
  else throw new Error("ขั้นตอนพัสดุไม่ถูกต้อง");
  copy.state.assetMovements = movements;
  audit(copy, "บันทึก" + stage + " TEST_", "assets", row.reference);
  return copy;
}
export function addAssignment(
  s: Snapshot,
  input: Record<string, Json>,
): Snapshot {
  const copy = cloneSnapshot(s);
  for (const key of ["userId", "role", "scopeType", "scopeValue"]) {
    if (typeof input[key] !== "string" || !text(input[key]).startsWith("TEST_"))
      throw new Error("เลือกผู้ใช้ บทบาท และขอบเขต TEST_ ให้ครบ");
  }
  const users = (s.catalogs.testUsers || []) as Record<string, Json>[];
  if (
    !users.some((u) => u.id === input.userId) ||
    !((s.catalogs.testRoles || []) as Json[]).includes(input.role!)
  )
    throw new Error("ผู้ใช้หรือบทบาทไม่อยู่ในชุดทดสอบ");
  const permissions = input.permissions;
  if (!Array.isArray(permissions) || !permissions.length)
    throw new Error("เลือกสิทธิ์อย่างน้อยหนึ่งรายการ");
  const allowed = (s.catalogs.permissions || []) as Json[][];
  if (permissions.some((p) => !allowed.some((a) => a[0] === p)))
    throw new Error("สิทธิ์ไม่ถูกต้อง");
  const id = "TEST_ASSIGN_" + crypto.randomUUID();
  copy.state.permissionAssignments = [
    ...stateRows(copy, "permissionAssignments"),
    { ...input, id, status: initialStatus("access-control") },
  ];
  audit(copy, "กำหนดสิทธิ์จำลอง", "access-control", id);
  return copy;
}
export function mailMerge(
  s: Snapshot,
  senderId: string,
  recipientIds: string[],
  subject: string,
  body: string,
): Snapshot {
  assertTestText(subject);
  assertTestText(body);
  if (!subject || !body || !recipientIds.length)
    throw new Error("ระบุเรื่อง ข้อความ และผู้รับ");
  const copy = cloneSnapshot(s),
    orgs = collection(s, "organizations");
  if (!orgs.some((r) => r.id === senderId && !r.deleted_at))
    throw new Error("หน่วยงานผู้ส่งไม่ถูกต้อง");
  const ids = [...new Set(recipientIds)];
  for (const id of ids) {
    const recipient = orgs.find((r) => r.id === id && !r.deleted_at);
    if (!recipient) throw new Error("หน่วยงานผู้รับไม่ถูกต้อง");
    const subjectValue = subject.replaceAll(
        "{{recipient}}",
        text(recipient.name),
      ),
      bodyValue = body.replaceAll("{{recipient}}", text(recipient.name));
    const row: Row = {
      id: "TEST_DOC_" + crypto.randomUUID(),
      name: subjectValue,
      summary: bodyValue,
      type: "TEST_หนังสือส่งออก",
      classification: "TEST_ทั่วไป",
      direction: "outgoing",
      senderOrganizationId: senderId,
      recipientOrganizationId: id,
      status: initialStatus("correspondence"),
      attachmentLabel: "TEST_ไม่มีไฟล์แนบ",
    };
    copy.moduleRows.correspondence!.unshift(row);
    audit(copy, "สร้างร่างจดหมายเวียน TEST_", "correspondence", row.id);
  }
  return copy;
}
