import { describe, it, expect } from "vitest";
import seed from "../../supabase/seed_snapshot.json";
import { snapshotSchema, stateRows, text, type Row, type Json } from "./model";
import {
  collection,
  saveRecord,
  changeRecord,
  addBudgetDraft,
  assetBalance,
  addAssetEvent,
  outstanding,
  mailMerge,
  addAssignment,
} from "./domain";
import {
  previewRecords,
  applyImport,
  parseCsv,
  previewExam,
  commitExam,
  examHeaders,
  exportRecords,
  readWorkbook,
} from "./excel";
import metadata from "./legacy-metadata.json";
import { validateAuth } from "./auth";
const fresh = () => snapshotSchema.parse(structuredClone(seed));
const assetInput = {
  reference: "TEST_NEW_001",
  assetId: "TEST_ASSET_001",
  note: "TEST_ทดสอบ",
  quantity: 1,
  location: "TEST_สำนักงานตัวอย่าง",
};
describe("existing data contract", () => {
  it("round-trips all legacy snapshot fields without loss", () =>
    expect(fresh()).toEqual(seed));
  it("preserves unknown future fields", () => {
    const s = fresh();
    s.state.future = { value: "TEST_ค่า" };
    expect(snapshotSchema.parse(s).state.future).toEqual({ value: "TEST_ค่า" });
  });
  it.each([
    "people",
    "organizations",
    "requests",
    "admissions",
    "budget",
    "assets",
    "correspondence",
  ])("rejects non-test ids in %s", (module) => {
    const s = fresh();
    s.moduleRows[module]![0]!.id = "REAL_001";
    expect(() => snapshotSchema.parse(s)).toThrow();
  });
  it("contains 68 course records and four exam forms", () => {
    expect(collection(fresh(), "learning")).toHaveLength(68);
    expect(fresh().catalogs.examForms).toHaveLength(4);
  });
});
describe("record editing", () => {
  it("preserves fields that were not edited and records an event", () => {
    const s = fresh(),
      row = s.moduleRows.people![0]!;
    const next = saveRecord(s, "people", { id: row.id, name: "TEST_ชื่อใหม่" });
    expect(next.moduleRows.people![0]).toEqual({
      ...row,
      name: "TEST_ชื่อใหม่",
    });
    expect(stateRows(next, "migrationAudit")).toHaveLength(1);
    expect(s.moduleRows.people![0]!.name).toBe(row.name);
  });
  it("rejects real names and real contact data", () => {
    expect(() =>
      saveRecord(fresh(), "people", { id: "TEST_NEW", name: "ชื่อจริง" }),
    ).toThrow();
    expect(() =>
      saveRecord(fresh(), "people", {
        id: "TEST_NEW",
        name: "TEST_ชื่อ",
        email: "TEST_user@gmail.com",
      }),
    ).toThrow();
  });
  it("enforces region 1 through 18", () =>
    expect(() =>
      saveRecord(fresh(), "people", {
        id: "TEST_NEW",
        name: "TEST_ชื่อ",
        sanghaRegion: "TEST_ภาค_19",
      }),
    ).toThrow());
  it("rejects fields outside the allowlist", () =>
    expect(() =>
      saveRecord(fresh(), "people", {
        id: "TEST_NEW",
        name: "TEST_ชื่อ",
        service_role: "TEST_ไม่อนุญาต",
      }),
    ).toThrow());
  it("soft deletes and restores without losing record content", () => {
    const s = fresh(),
      row = s.moduleRows.people![0]!;
    const deleted = changeRecord(s, "people", row.id, "delete");
    expect(deleted.moduleRows.people![0]!.deleted_at).toBeTruthy();
    const restored = changeRecord(deleted, "people", row.id, "restore");
    expect(restored.moduleRows.people![0]!.status).toBe(row.status);
    expect(restored.moduleRows.people![0]!.name).toBe(row.name);
  });
  it("prevents deleting assets with stock history", () =>
    expect(() =>
      changeRecord(fresh(), "assets", "TEST_ASSET_001", "delete"),
    ).toThrow());
  it("restricts correspondence transitions", () => {
    const s = fresh();
    const next = changeRecord(
      s,
      "correspondence",
      "TEST_DOC_001",
      "TEST_ส่งจำลอง",
    );
    expect(next.moduleRows.correspondence![0]!.status).toBe("TEST_ส่งจำลอง");
    expect(() =>
      changeRecord(next, "correspondence", "TEST_DOC_001", "TEST_ส่งจำลอง"),
    ).toThrow();
  });
  it("does not allow arbitrary request approvals", () =>
    expect(() =>
      changeRecord(fresh(), "requests", "TEST_REQ_001", "TEST_อนุมัติจริง"),
    ).toThrow());
});
describe("budget drafts", () => {
  const base = {
    id: "TEST_BUDGET_NEW",
    stage: "commitment",
    period: "TEST_PERIOD_01",
    label: "TEST_ชื่อ",
    unit: "TEST_หน่วยงาน",
    amountSatang: 100,
  };
  it("accepts a valid draft without changing ledger totals", () => {
    const s = fresh(),
      next = addBudgetDraft(s, base);
    expect(next.moduleRows.budget).toEqual(s.moduleRows.budget);
    expect(stateRows(next, "budgetDrafts")).toHaveLength(1);
  });
  it.each([1.5, -1, 0, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid satang %s",
    (amountSatang) =>
      expect(() =>
        addBudgetDraft(fresh(), { ...base, amountSatang }),
      ).toThrow(),
  );
  it("accounts for reserved drafts when checking limits", () => {
    const s = addBudgetDraft(fresh(), { ...base, amountSatang: 80000000 });
    expect(() =>
      addBudgetDraft(s, {
        ...base,
        id: "TEST_ANOTHER",
        amountSatang: 80000000,
      }),
    ).toThrow();
  });
  it("rejects duplicate references", () => {
    const s = addBudgetDraft(fresh(), base);
    expect(() => addBudgetDraft(s, base)).toThrow();
  });
});
describe("stock transactions", () => {
  it("records a balanced transfer with no change in total stock", () => {
    const s = fresh(),
      next = addAssetEvent(s, "transfer", {
        ...assetInput,
        fromLocation: "TEST_สำนักงานตัวอย่าง",
        toLocation: "TEST_คลังตัวอย่าง",
        quantity: 2,
      });
    expect(assetBalance(next, "TEST_ASSET_001")).toBe(
      assetBalance(s, "TEST_ASSET_001"),
    );
    expect(assetBalance(next, "TEST_ASSET_001", "TEST_คลังตัวอย่าง")).toBe(
      assetBalance(s, "TEST_ASSET_001", "TEST_คลังตัวอย่าง") + 2,
    );
  });
  it("rejects insufficient stock and leaves source untouched", () => {
    const s = fresh();
    expect(() =>
      addAssetEvent(s, "issue", { ...assetInput, quantity: 999 }),
    ).toThrow();
    expect(s).toEqual(seed);
  });
  it("rejects duplicate references", () => {
    const next = addAssetEvent(fresh(), "receive", assetInput);
    expect(() => addAssetEvent(next, "receive", assetInput)).toThrow();
  });
  it("caps returns by the remaining source issue", () => {
    const s = addAssetEvent(fresh(), "issue", { ...assetInput, quantity: 2 });
    const returned = addAssetEvent(s, "return", {
      ...assetInput,
      reference: "TEST_RETURN",
      sourceReference: assetInput.reference,
      quantity: 1,
    });
    expect(outstanding(returned, assetInput.reference)).toBe(1);
    expect(() =>
      addAssetEvent(returned, "return", {
        ...assetInput,
        reference: "TEST_RETURN_TWO",
        sourceReference: assetInput.reference,
        quantity: 2,
      }),
    ).toThrow();
  });
  it("does not adjust stock for count or purchase drafts", () => {
    const s = fresh();
    const count = addAssetEvent(s, "count", { ...assetInput, quantity: 0 });
    expect(assetBalance(count, "TEST_ASSET_001")).toBe(
      assetBalance(s, "TEST_ASSET_001"),
    );
    const buy = addAssetEvent(s, "purchase", {
      ...assetInput,
      budgetReference: "TEST_BUDGET_001",
    });
    expect(assetBalance(buy, "TEST_ASSET_001")).toBe(
      assetBalance(s, "TEST_ASSET_001"),
    );
  });
  it("loan returns cannot exceed the borrowed quantity", () => {
    const s = addAssetEvent(fresh(), "loans", {
      ...assetInput,
      borrower: "TEST_ผู้ยืม",
      mode: "lend",
    });
    expect(() =>
      addAssetEvent(s, "loans", {
        ...assetInput,
        reference: "TEST_LOAN_RETURN",
        mode: "return",
        sourceReference: assetInput.reference,
        quantity: 2,
      }),
    ).toThrow();
  });
});
describe("correspondence and role simulations", () => {
  it("mail merge creates one unsent draft per recipient and deduplicates recipients", () => {
    const s = fresh(),
      next = mailMerge(
        s,
        "TEST_ORG_001",
        ["TEST_ORG_002", "TEST_ORG_002", "TEST_ORG_003"],
        "TEST_เรื่อง {{recipient}}",
        "TEST_ข้อความ {{recipient}}",
      );
    expect(next.moduleRows.correspondence).toHaveLength(
      s.moduleRows.correspondence!.length + 2,
    );
    expect(
      next.moduleRows
        .correspondence!.slice(0, 2)
        .every((r) => r.status === "TEST_ร่าง"),
    ).toBe(true);
    expect(JSON.stringify(next)).not.toContain("{{recipient}}");
  });
  it("rejects unknown recipients", () =>
    expect(() =>
      mailMerge(
        fresh(),
        "TEST_ORG_001",
        ["TEST_MISSING"],
        "TEST_เรื่อง",
        "TEST_ข้อความ",
      ),
    ).toThrow());
  it("restricts role permission values to the existing catalog", () =>
    expect(() =>
      addAssignment(fresh(), {
        userId: "TEST_USER_001",
        role: "TEST_ผู้ดูแล",
        scopeType: "TEST_จังหวัด",
        scopeValue: "TEST_จังหวัด",
        module: "all",
        permissions: ["service_role"],
      }),
    ).toThrow());
});
describe("Excel and exam validation", () => {
  it("handles quoted CSV values and embedded newlines", () =>
    expect(parseCsv('a,b\n"TEST_a,b","TEST_line\nnext"')).toEqual([
      ["a", "b"],
      ["TEST_a,b", "TEST_line\nnext"],
    ]));
  it("rejects malformed quoted CSV", () =>
    expect(() => parseCsv('a\n"broken')).toThrow());
  it("requires explicit overwrite and preserves unexported person fields", () => {
    const s = fresh(),
      cfg = metadata.imports.people;
    const r = s.moduleRows.people![0]!;
    const values = cfg.fields.map(([, key]) =>
      key === "name"
        ? "TEST_เปลี่ยนชื่อ"
        : Array.isArray(r[key!])
          ? (r[key!] as Json[]).join(";")
          : text(r[key!]),
    );
    const preview = previewRecords(s, "people", [
      cfg.fields.map((f) => f[0]!),
      values,
    ]);
    expect(preview.errors).toEqual([]);
    expect(() => applyImport(s, preview, false)).toThrow();
    const next = applyImport(s, preview, true);
    expect(next.moduleRows.people![0]!.phone).toBe(r.phone);
    expect(next.moduleRows.people![0]!.name).toBe("TEST_เปลี่ยนชื่อ");
  });
  it("rejects duplicate headers", () =>
    expect(() =>
      previewRecords(fresh(), "people", [["รหัสระเบียน", "รหัสระเบียน"]]),
    ).toThrow());
  it("rejects changing status through Excel", () => {
    const cfg = metadata.imports.assets,
      r = fresh().moduleRows.assets![0]!;
    const preview = previewRecords(fresh(), "assets", [
      cfg.fields.map((f) => f[0]!),
      cfg.fields.map(([, k]) =>
        k === "status" ? "TEST_อนุมัติ" : text(r[k!]),
      ),
    ]);
    expect(preview.errors.length).toBeGreaterThan(0);
  });
  it("validates exam class, applicant kind and duplicate names", () => {
    const raw = [
      examHeaders,
      [
        "TEST_ผู้สมัคร",
        "TEST_บรรพชิต",
        "TEST_นักธรรมชั้นตรี",
        "TEST_สำนักเรียน",
        "TEST_SESSION",
      ],
    ];
    const result = previewExam(fresh(), "TEST_FORM_NAKTHAM_TRI", raw);
    expect(result.errors).toEqual([]);
    expect(
      previewExam(fresh(), "TEST_FORM_DHAMMA_TRI", raw).errors.length,
    ).toBeGreaterThan(0);
    expect(
      previewExam(fresh(), "TEST_FORM_NAKTHAM_TRI", [...raw, raw[1]!]).errors,
    ).toContain("ชื่อซ้ำ");
    expect(
      commitExam(fresh(), "TEST_FORM_NAKTHAM_TRI", "TEST.csv", raw).examImport,
    ).toMatchObject({ committed: true });
  });
  it("exports real XLSX without private person contact columns", async () => {
    const data = await exportRecords(fresh(), "people");
    const file = new File([data.buffer as ArrayBuffer], "TEST_people.xlsx");
    const rows = await readWorkbook(file);
    expect(rows).toHaveLength(5);
    expect(rows[0]).not.toContain("โทรศัพท์");
    expect(JSON.stringify(rows)).not.toContain("TEST_PHONE_");
  });
  it("rejects formula cells", async () => {
    const { Workbook } = await import("exceljs");
    const b = new Workbook();
    const sheet = b.addWorksheet("TEST_");
    sheet.getCell("A1").value = { formula: "1+1", result: 2 };
    const bytes = await b.xlsx.writeBuffer();
    await expect(
      readWorkbook(
        new File([new Uint8Array(bytes).buffer], "TEST_formula.xlsx"),
      ),
    ).rejects.toThrow();
  });
});
describe("account input", () => {
  it("requires an email username", () =>
    expect(() =>
      validateAuth("signup", {
        email: "TEST_USER",
        password: "TEST_password_123",
        confirmPassword: "",
      }),
    ).toThrow());
  it("enforces 12 characters for new passwords", () =>
    expect(() =>
      validateAuth("signup", {
        email: "TEST_user@example.test",
        password: "short",
        confirmPassword: "",
      }),
    ).toThrow());
  it("checks password confirmation", () =>
    expect(() =>
      validateAuth("reset", {
        email: "",
        password: "TEST_password_123",
        confirmPassword: "different",
      }),
    ).toThrow());
});

it("rejects duplicate ids in a new-record form", () => {
  const s = fresh();
  expect(() =>
    saveRecord(s, "people", { id: "TEST_PERSON_001", name: "TEST_ชื่อ" }, true),
  ).toThrow("รหัสระเบียนซ้ำ");
});
it("rejects an Excel preview when the target record changed after preview", () => {
  const s = fresh(),
    cfg = metadata.imports.assets,
    r = s.moduleRows.assets![0]!;
  const preview = previewRecords(s, "assets", [
    cfg.fields.map((f) => f[0]!),
    cfg.fields.map(([, k]) => text(r[k!])),
  ]);
  const changed = saveRecord(s, "assets", {
    id: r.id,
    name: "TEST_เปลี่ยนหลังตรวจ",
  });
  expect(() => applyImport(changed, preview, true)).toThrow("ข้อมูลเปลี่ยน");
});
