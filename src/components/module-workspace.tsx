"use client";
import { useMemo, useState } from "react";
import {
  type Json,
  type Row,
  type Snapshot,
  text,
  stateRows,
  catalogRows,
  download,
} from "@/lib/model";
import {
  modules,
  allModules,
  findModule,
  labels,
  hiddenFields,
  assetTabs,
  budgetTabs,
} from "@/lib/modules";
import {
  collection,
  saveRecord,
  changeRecord,
  budgetTotals,
  addBudgetDraft,
  assetBalance,
  outstanding,
  addAssetEvent,
  addAssignment,
  mailMerge,
} from "@/lib/domain";
import {
  transitionTestRecord,
  requestStates,
} from "@/core/workflow/test-portal";
import { exportRecords, workbookBytes } from "@/lib/excel";
import { useWorkspace } from "./workspace-provider";
import { FieldForm, recordFields, type Field } from "./field-form";
import { RecordsTable } from "./records-table";
import { Dialog } from "./dialog";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DataTools } from "./data-tools";
import { Downloads } from "./downloads";

const money = (n: number) =>
  (n / 100).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formField = (
  key: string,
  options?: { value: string; label: string }[],
  required = true,
): Field => ({
  key,
  required,
  kind: options
    ? "select"
    : ["quantity", "amountSatang"].includes(key)
      ? "number"
      : ["note", "bodyTemplate", "subjectTemplate"].includes(key)
        ? "textarea"
        : "text",
  ...(options ? { options } : {}),
});
const options = (values: Json | undefined) =>
  Array.isArray(values)
    ? values.map((v) => ({ value: text(v), label: text(v) }))
    : [];
const rowOptions = (rows: Row[]) =>
  rows
    .filter((r) => !r.deleted_at)
    .map((r) => ({ value: r.id, label: text(r.name || r.label || r.id) }));
export function ModuleWorkspace({ moduleId }: { moduleId: string }) {
  return <ModuleBody key={moduleId} moduleId={moduleId} />;
}
function ModuleBody({ moduleId }: { moduleId: string }) {
  const { snapshot, mutate, setMessage } = useWorkspace();
  const module = findModule(moduleId)!;
  const [tab, setTab] = useState(
      moduleId === "assets"
        ? "inventory"
        : moduleId === "budget"
          ? "plan"
          : moduleId === "admissions"
            ? "applications"
            : "all",
    ),
    [filter, setFilter] = useState<Record<string, string>>({}),
    [tools, setTools] = useState(false),
    [selected, setSelected] = useState<Row | null>(null),
    [editing, setEditing] = useState<Row | null>(null),
    [form, setForm] = useState<
      "record" | "budget" | "asset" | "assignment" | "mail" | null
    >(null),
    [pending, setPending] = useState<{ id: string; to: string } | null>(null),
    [mailDraft, setMailDraft] = useState<Record<string, Json> | null>(null),
    [resultSearch, setResultSearch] = useState(false);
  const originalRows = collection(snapshot, moduleId);
  const columns = useMemo(
    () =>
      moduleId === "people"
        ? [
            "name",
            "type",
            "governancePosition",
            "educationPositions",
            "temple",
            "province",
            "sanghaRegion",
            "changeType",
            "status",
          ]
        : moduleId === "organizations"
          ? [
              "name",
              "type",
              "province",
              "examType",
              "examSessionLabel",
              "chairName",
              "receiverName",
              "status",
            ]
          : moduleId === "learning"
            ? ["domain", "level", "subject", "lessons", "questionBank"]
            : moduleId === "requests"
              ? ["id", "type", "category", "target", "province", "status"]
              : moduleId === "admissions"
                ? [
                    "name",
                    "applicantKind",
                    "paliTrack",
                    "level",
                    "formType",
                    "unit",
                    "status",
                  ]
                : moduleId === "correspondence"
                  ? [
                      "id",
                      "name",
                      "direction",
                      "classification",
                      "senderOrganizationId",
                      "recipientOrganizationId",
                      "status",
                    ]
                  : moduleId === "access-control"
                    ? [
                        "userId",
                        "role",
                        "module",
                        "scopeType",
                        "scopeValue",
                        "permissions",
                      ]
                    : moduleId === "activity"
                      ? ["action", "module", "recordId", "at"]
                      : ["id", "name", "type", "status"],
    [moduleId],
  );
  let rows = originalRows;
  if (moduleId === "budget") {
    rows =
      tab === "plan" || tab === "overview"
        ? originalRows
        : [
            ...(snapshot.budgetSampleEvents[tab] || []),
            ...stateRows(snapshot, "budgetDrafts").filter(
              (r) => r.stage === tab,
            ),
          ];
  }
  if (moduleId === "assets") {
    const map: Record<string, string> = {
      movement: "assetMovements",
      purchase: "assetPurchases",
      loans: "assetLoans",
      maintenance: "assetMaintenance",
      count: "assetCounts",
      disposal: "assetDisposals",
    };
    if (tab === "inventory")
      rows = originalRows.map((row) => ({
        ...row,
        balance: assetBalance(snapshot, row.id, filter.location || undefined),
      }));
    else if (map[tab])
      rows = stateRows(snapshot, map[tab]!).map((row) =>
        tab === "loans"
          ? { ...row, outstanding: outstanding(snapshot, text(row.reference)) }
          : row,
      );
    else
      rows = stateRows(snapshot, "assetMovements").filter((r) =>
        tab === "transfer"
          ? text(r.type).startsWith("transfer_")
          : r.type === tab,
      );
  }
  if (moduleId === "correspondence")
    rows = rows.filter(
      (r) =>
        tab === "all" ||
        (tab === "inbox" && r.direction === "incoming") ||
        (tab === "sent" &&
          r.direction === "outgoing" &&
          r.status !== "TEST_ร่าง") ||
        (tab === "drafts" && r.status === "TEST_ร่าง") ||
        (tab === "notices" && r.direction === "notice"),
    );
  rows = rows.filter((row) =>
    Object.entries(filter).every(
      ([key, value]) =>
        !value ||
        (moduleId === "assets" && tab === "inventory" && key === "location") ||
        text(row[key]) === value,
    ),
  );
  const activeColumns =
    moduleId === "budget"
      ? tab === "plan" || tab === "overview"
        ? [
            "id",
            "name",
            "allocatedSatang",
            "committedSatang",
            "paidSatang",
            "status",
          ]
        : ["id", "period", "amountSatang", "unit", "status"]
      : moduleId === "assets"
        ? tab === "inventory"
          ? ["id", "name", "type", "unit", "balance", "status"]
          : [
              "reference",
              "assetId",
              "type",
              "location",
              "quantityDelta",
              "quantity",
              "outstanding",
              "status",
            ].filter((key) => rows.some((r) => r[key] !== undefined))
        : columns;
  const canEdit =
    selected &&
    !selected.deleted_at &&
    [
      "people",
      "organizations",
      "requests",
      "admissions",
      "assets",
      "correspondence",
    ].includes(moduleId) &&
    (moduleId !== "assets" || tab === "inventory") &&
    (moduleId !== "correspondence" || selected.status === "TEST_ร่าง") &&
    (!selected.classification || selected.classification === "TEST_ทั่วไป");
  function run(action: (s: Snapshot) => Snapshot) {
    try {
      mutate(action);
      return true;
    } catch {
      return false;
    }
  }
  function closeForm() {
    setForm(null);
    setEditing(null);
    setMailDraft(null);
  }
  function add() {
    setNewId(
      `TEST_${moduleId.replaceAll("-", "_").toUpperCase()}_${crypto.randomUUID()}`,
    );
    setEditing(null);
    if (moduleId === "budget") setForm("budget");
    else if (moduleId === "assets" && tab !== "inventory") setForm("asset");
    else if (moduleId === "access-control") setForm("assignment");
    else setForm("record");
  }
  const [newId, setNewId] = useState(
    () =>
      `TEST_${moduleId.replaceAll("-", "_").toUpperCase()}_${crypto.randomUUID()}`,
  );
  const initialRecord: Row = editing || {
    id: newId,
    name: "",
    ...(moduleId === "people"
      ? { educationPositions: [], sanghaRegion: "TEST_ภาค_1" }
      : {}),
    ...(moduleId === "correspondence"
      ? {
          direction: "outgoing",
          classification: "TEST_ทั่วไป",
          senderOrganizationId:
            snapshot.moduleRows.organizations?.[0]?.id || "",
          recipientOrganizationId:
            snapshot.moduleRows.organizations?.[1]?.id || "",
        }
      : {}),
  };
  const editableFields = recordFields(
    moduleId,
    originalRows,
    editing || undefined,
  ).map((f) =>
    [
      "relatedOrgId",
      "senderOrganizationId",
      "recipientOrganizationId",
    ].includes(f.key)
      ? {
          ...f,
          kind: "select" as const,
          options: rowOptions(snapshot.moduleRows.organizations || []),
        }
      : f,
  );
  const catalogFields: Field[] = [
    formField(
      "userId",
      catalogRows(snapshot, "testUsers").map((u) => ({
        value: u.id,
        label: text(u.label),
      })),
    ),
    formField("role", options(snapshot.catalogs.testRoles)),
    formField("module", [
      { value: "all", label: "ทุกระบบ" },
      ...modules.map((m) => ({ value: m.id, label: m.name })),
    ]),
    formField(
      "scopeType",
      options([
        "TEST_ส่วนกลาง",
        "TEST_ภาค",
        "TEST_จังหวัด",
        "TEST_สำนักเรียน",
        "TEST_สนามสอบ",
      ]),
    ),
    formField("scopeValue"),
    {
      key: "permissions",
      kind: "multi",
      required: true,
      options: ((snapshot.catalogs.permissions as Json[][]) || []).map((p) => ({
        value: text(p[0]),
        label: text(p[1]),
      })),
    },
  ];
  const assetFields: Field[] = [
    formField("reference"),
    formField("assetId", rowOptions(snapshot.moduleRows.assets || [])),
    ...(tab === "transfer"
      ? [
          formField("fromLocation", options(snapshot.catalogs.assetLocations)),
          formField("toLocation", options(snapshot.catalogs.assetLocations)),
        ]
      : tab === "purchase"
        ? []
        : [formField("location", options(snapshot.catalogs.assetLocations))]),
    ...(tab === "loans"
      ? [
          formField("mode", [
            { value: "lend", label: "ยืมออก" },
            { value: "return", label: "คืนยืม" },
          ]),
          formField("borrower", undefined, false),
        ]
      : []),
    ...(["return", "loans"].includes(tab)
      ? [
          formField(
            "sourceReference",
            stateRows(snapshot, "assetMovements")
              .filter(
                (r) =>
                  ["issue", "loan"].includes(text(r.type)) &&
                  outstanding(snapshot, text(r.reference)) > 0,
              )
              .map((r) => ({
                value: text(r.reference),
                label:
                  text(r.reference) +
                  " · คงค้าง " +
                  outstanding(snapshot, text(r.reference)),
              })),
            false,
          ),
        ]
      : []),
    ...(tab === "purchase"
      ? [
          formField(
            "budgetReference",
            rowOptions(snapshot.moduleRows.budget || []),
          ),
        ]
      : []),
    formField("quantity"),
    formField("note"),
  ];
  const budgetFields: Field[] = [
    formField("id"),
    formField("period", options(["TEST_PERIOD_01", "TEST_PERIOD_02"])),
    formField("label"),
    formField("unit"),
    formField("amountSatang"),
  ];
  const mailFields: Field[] = [
    formField(
      "senderOrganizationId",
      rowOptions(snapshot.moduleRows.organizations || []),
    ),
    {
      key: "recipientIds",
      kind: "multi",
      required: true,
      options: rowOptions(snapshot.moduleRows.organizations || []),
    },
    formField("subjectTemplate"),
    formField("bodyTemplate"),
  ];
  const showCreate =
    !["learning", "activity", "data-tools", "exam-import"].includes(moduleId) &&
    !(moduleId === "assets" && tab === "movement") &&
    !(moduleId === "budget" && tab === "overview") &&
    !(moduleId === "admissions" && tab === "results");
  const requestTargets =
    selected && moduleId === "requests"
      ? requestStates.filter((to) => {
          try {
            transitionTestRecord(selected, to);
            return true;
          } catch {
            return false;
          }
        })
      : [];
  const filters =
    moduleId === "learning"
      ? ["track", "level"]
      : moduleId === "people"
        ? ["changeType", "province", "status"]
        : moduleId === "organizations"
          ? ["type", "province", "examType"]
          : moduleId === "requests"
            ? ["category", "type", "province", "status"]
            : moduleId === "admissions"
              ? ["paliTrack", "level", "formType"]
              : moduleId === "budget"
                ? ["period"]
                : moduleId === "assets"
                  ? ["location"]
                  : [];
  const aggregate = moduleId === "budget" ? budgetTotals(snapshot) : null;
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{module.name}</h1>
          <p className="text-muted-foreground">
            {"detail" in module
              ? module.detail
              : "ข้อมูลและการทำรายการในพื้นที่ TEST_"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showCreate && (
            <Button onClick={add}>
              {moduleId === "budget"
                ? "สร้างร่างงบประมาณ"
                : moduleId === "assets" && tab !== "inventory"
                  ? "บันทึกรายการพัสดุ"
                  : moduleId === "access-control"
                    ? "กำหนดสิทธิ์จำลอง"
                    : "เพิ่มข้อมูล TEST_"}
            </Button>
          )}
          {moduleId === "correspondence" && (
            <Button variant="outline" onClick={() => setForm("mail")}>
              จดหมายเวียนออนไลน์
            </Button>
          )}
          {[
            "people",
            "organizations",
            "learning",
            "requests",
            "admissions",
            "budget",
            "assets",
            "correspondence",
          ].includes(moduleId) && (
            <Button variant="outline" onClick={() => setTools(!tools)}>
              {tools ? "ปิดเครื่องมือ Excel" : "นำเข้า/ส่งออก Excel"}
            </Button>
          )}
        </div>
      </div>
      {moduleId === "data-tools" ? (
        <DataTools />
      ) : moduleId === "exam-import" ? (
        <DataTools exam />
      ) : (
        <>
          {tools && (
            <Card className="mb-6">
              <DataTools initialModule={moduleId} />
            </Card>
          )}
          {moduleId === "budget" && aggregate && (
            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["จัดสรร", aggregate.allocated],
                ["ผูกพัน", aggregate.committed],
                ["จ่ายแล้ว", aggregate.paid],
                ["ยังไม่ผูกพัน", aggregate.allocated - aggregate.committed],
              ].map(([label, value]) => (
                <Card key={String(label)}>
                  <p>{label}</p>
                  <strong className="text-2xl">
                    {money(Number(value))} บาท
                  </strong>
                </Card>
              ))}
            </div>
          )}
          {moduleId === "budget" && (
            <p className="mb-4 text-muted-foreground">
              ร่างไม่เปลี่ยนยอดเงินจริง ยอดรายการรับเป็นจำนวนเต็มสตางค์
            </p>
          )}
          {moduleId === "assets" && (
            <p className="mb-4 text-muted-foreground">
              ยอดคงเหลือคำนวณจาก Stock card · การโอนบันทึกคู่เข้า–ออก · คำขอซื้อ
              ตรวจนับ และจำหน่ายยังไม่ปรับยอด
            </p>
          )}
          {moduleId === "access-control" && (
            <p className="test-note mb-5">
              การกำหนดสิทธิ์หน้านี้เป็นแบบจำลอง TEST_ เท่านั้น
              ไม่เปลี่ยนสิทธิ์บัญชี Supabase และไม่ทำให้บัญชีเป็น admin
            </p>
          )}
          {(moduleId === "budget" ||
            moduleId === "assets" ||
            moduleId === "correspondence" ||
            moduleId === "admissions") && (
            <div className="tabs" role="tablist" aria-label="หมวดรายการ">
              {(moduleId === "budget"
                ? budgetTabs
                : moduleId === "assets"
                  ? assetTabs
                  : moduleId === "admissions"
                    ? [
                        ["applications", "บัญชีสมัคร"],
                        ["results", "สืบค้นผลสอบ"],
                      ]
                    : [
                        ["all", "เอกสารทั้งหมด"],
                        ["inbox", "กล่องรับ"],
                        ["sent", "กล่องส่ง"],
                        ["drafts", "ร่าง"],
                        ["notices", "แจ้งงานออนไลน์"],
                      ]
              ).map(([id, label]) => (
                <Button
                  key={id}
                  variant="outline"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => {
                    setTab(id!);
                    setFilter({});
                    setSelected(null);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
          {moduleId === "admissions" && tab === "results" ? (
            <Card>
              <h2 className="mb-4 text-2xl font-bold">
                สืบค้นผลสอบจากข้อมูลที่เผยแพร่แล้ว
              </h2>
              <p className="test-note mb-5">
                ยังไม่มีชุดผลสอบที่ได้รับการยืนยันและเผยแพร่ · ใช้คำค้น TEST_
                เท่านั้น
              </p>
              <FieldForm
                fields={["year", "name", "temple", "school", "number"].map(
                  (key) => ({
                    key,
                    label:
                      (
                        {
                          year: "ปีการศึกษา",
                          school: "สำนักเรียน",
                          number: "เลขที่สอบ",
                        } as Record<string, string>
                      )[key] ||
                      labels[key] ||
                      "คำค้น",
                    required: false,
                  }),
                )}
                initial={{}}
                onSave={(values) => {
                  if (
                    Object.values(values).some(
                      (v) => v && !text(v).startsWith("TEST_"),
                    )
                  )
                    throw new Error("ใช้เฉพาะคำค้น TEST_");
                  setResultSearch(true);
                }}
                submitLabel="ค้นผลสอบ"
              />
              {resultSearch && (
                <p role="status" className="mt-5">
                  ไม่พบชุดผลสอบที่เผยแพร่ในพื้นที่ทดสอบนี้
                </p>
              )}
            </Card>
          ) : (
            <>
              {filters.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-3">
                  {filters.map((key) => {
                    const values =
                      moduleId === "assets" && key === "location"
                        ? options(snapshot.catalogs.assetLocations)
                        : [
                            ...new Set(
                              (moduleId === "budget" ? rows : originalRows)
                                .map((r) => text(r[key]))
                                .filter(Boolean),
                            ),
                          ].map((value) => ({ value, label: value }));
                    return (
                      <label key={key} className="min-w-0">
                        {labels[key] || "หมวด"}
                        <select
                          className="ml-2 max-w-72"
                          aria-label={"กรอง" + (labels[key] || "หมวด")}
                          value={filter[key] || ""}
                          onChange={(e) =>
                            setFilter({ ...filter, [key]: e.target.value })
                          }
                        >
                          <option value="">ทั้งหมด</option>
                          {values.map((v) => (
                            <option key={v.value} value={v.value}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
              )}
              {moduleId === "learning" && (
                <p className="test-note mb-5">
                  ครอบคลุม 68 รายวิชา นักธรรม ธรรมศึกษา 9 ช่วงชั้น และบาลี ·
                  บทเรียน ข้อสอบ และ rubric ยังรอเจ้าของวิชายืนยัน
                  จึงยังไม่เปิดสอบหรือสร้างคะแนน
                </p>
              )}
              <Card>
                <RecordsTable
                  rows={rows}
                  columns={activeColumns}
                  onOpen={(row) => setSelected(row)}
                  caption={module.name}
                />
              </Card>
              {moduleId === "assets" && tab === "movement" && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const keys = [
                        "reference",
                        "assetId",
                        "type",
                        "quantityDelta",
                        "location",
                        "sourceReference",
                      ];
                      const bytes = await workbookBytes(
                        keys.map((k) => labels[k] || k),
                        rows.map((r) => keys.map((k) => r[k] || "")),
                      );
                      download(
                        bytes.buffer as ArrayBuffer,
                        "TEST_stock_card.xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      );
                    } catch {
                      setMessage("ส่งออกไม่สำเร็จ");
                    }
                  }}
                >
                  ส่งออก Stock card
                </Button>
              )}
            </>
          )}
          {moduleId === "admissions" && <Downloads kind="pali" />}
        </>
      )}
      {selected && (
        <Dialog
          title={
            moduleId === "learning"
              ? "รายละเอียดรายวิชา"
              : "รายละเอียดรายการ TEST_"
          }
          onClose={() => setSelected(null)}
        >
          <dl className="detail-grid">
            {Object.entries(selected)
              .filter(([key]) => !hiddenFields.has(key))
              .map(([key, value]) => (
                <div key={key} className="contents">
                  <dt>{labels[key] || "ข้อมูลเพิ่มเติม"}</dt>
                  <dd>
                    {selected.classification &&
                    selected.classification !== "TEST_ทั่วไป" &&
                    ["name", "summary", "attachmentLabel", "contact"].includes(
                      key,
                    )
                      ? "TEST_ปกปิดข้อมูลจำกัดสิทธิ์"
                      : text(value) || "—"}
                  </dd>
                </div>
              ))}
          </dl>
          {moduleId === "learning" && (
            <div className="test-note mt-5">
              แบบทดสอบก่อนเรียนและหลังเรียนยังไม่เปิด
              เพราะยังไม่มีชุดข้อสอบที่ผ่านการรับรอง
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {canEdit && (
              <Button
                onClick={() => {
                  setEditing(selected);
                  setSelected(null);
                  setForm("record");
                }}
              >
                แก้ไขข้อมูล
              </Button>
            )}
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => setPending({ id: selected.id, to: "delete" })}
              >
                ยกเลิกรายการ
              </Button>
            )}
            {selected.deleted_at && (
              <Button
                variant="outline"
                onClick={() => setPending({ id: selected.id, to: "restore" })}
              >
                คืนสถานะรายการ
              </Button>
            )}
            {requestTargets.map((to) => (
              <Button
                key={to}
                variant="outline"
                onClick={() => setPending({ id: selected.id, to })}
              >
                {to.replace("TEST_", "")}
              </Button>
            ))}
            {moduleId === "correspondence" &&
              selected.direction === "outgoing" &&
              selected.status === "TEST_ร่าง" && (
                <Button
                  onClick={() =>
                    setPending({ id: selected.id, to: "TEST_ส่งจำลอง" })
                  }
                >
                  ส่งเข้ากล่องตัวอย่าง
                </Button>
              )}
            {moduleId === "correspondence" &&
              selected.direction === "incoming" &&
              selected.status === "TEST_รอรับจำลอง" && (
                <Button
                  onClick={() =>
                    setPending({ id: selected.id, to: "TEST_รับทราบจำลอง" })
                  }
                >
                  รับทราบตัวอย่าง
                </Button>
              )}
          </div>
        </Dialog>
      )}
      {pending && (
        <Dialog
          title="ยืนยันเปลี่ยนสถานะ TEST_"
          onClose={() => setPending(null)}
        >
          <p className="mb-5">
            รายการ {pending.id} ·{" "}
            {pending.to === "delete"
              ? "ยกเลิกโดยเก็บประวัติไว้"
              : pending.to === "restore"
                ? "คืนสถานะรายการ"
                : pending.to}{" "}
            การทำรายการนี้ไม่มีผลเป็นคำสั่งหรือการอนุมัติจริง
          </p>
          <Button
            onClick={() => {
              const ok = run((s) =>
                changeRecord(s, moduleId, pending.id, pending.to),
              );
              if (ok) setSelected(null);
              setPending(null);
            }}
          >
            ยืนยันเปลี่ยนสถานะ
          </Button>
        </Dialog>
      )}
      {form && (
        <Dialog
          title={
            form === "record"
              ? editing
                ? "แก้ไขข้อมูล TEST_"
                : "เพิ่มข้อมูล TEST_"
              : form === "budget"
                ? "สร้างร่างงบประมาณ TEST_"
                : form === "asset"
                  ? "บันทึกรายการพัสดุ TEST_"
                  : form === "assignment"
                    ? "กำหนดสิทธิ์จำลอง"
                    : "จดหมายเวียนออนไลน์ TEST_"
          }
          onClose={closeForm}
        >
          <p className="test-note mb-5">
            ใช้ข้อมูล TEST_ เท่านั้น ·
            การยืนยันจะบันทึกในพื้นที่ทดสอบของบัญชีนี้
          </p>
          {form === "record" && (
            <FieldForm
              fields={editableFields}
              initial={initialRecord}
              onSave={(values) => {
                if (
                  run((s) =>
                    saveRecord(
                      s,
                      moduleId,
                      {
                        ...initialRecord,
                        ...values,
                        id: editing ? editing.id : text(values.id),
                      },
                      !editing,
                    ),
                  )
                )
                  closeForm();
                else throw new Error("บันทึกไม่สำเร็จ โปรดตรวจข้อความด้านบน");
              }}
            />
          )}
          {form === "budget" && (
            <FieldForm
              fields={budgetFields}
              initial={{
                id: "TEST_BUDGET_DRAFT_" + crypto.randomUUID(),
                period: "TEST_PERIOD_01",
                unit: "TEST_",
                label: "",
                amountSatang: 1,
              }}
              onSave={(values) => {
                if (run((s) => addBudgetDraft(s, { ...values, stage: tab })))
                  closeForm();
                else
                  throw new Error(
                    "ยอดร่างเกินยอดที่ใช้ได้หรือข้อมูลไม่ถูกต้อง",
                  );
              }}
            />
          )}
          {form === "asset" && (
            <FieldForm
              fields={assetFields}
              initial={{
                reference: "TEST_ASSET_EVENT_" + crypto.randomUUID(),
                assetId: snapshot.moduleRows.assets?.[0]?.id || "",
                quantity: tab === "count" ? 0 : 1,
                note: "TEST_รายการทดสอบ",
                mode: "lend",
                borrower: "TEST_ผู้ยืมตัวอย่าง",
                location: text(
                  (snapshot.catalogs.assetLocations as Json[])?.[0],
                ),
                fromLocation: text(
                  (snapshot.catalogs.assetLocations as Json[])?.[0],
                ),
                toLocation: text(
                  (snapshot.catalogs.assetLocations as Json[])?.[1],
                ),
              }}
              onSave={(values) => {
                if (run((s) => addAssetEvent(s, tab, values))) closeForm();
                else
                  throw new Error(
                    "โปรดตรวจยอดคงเหลือ รายการต้นทาง และข้อมูลที่จำเป็น",
                  );
              }}
            />
          )}
          {form === "assignment" && (
            <FieldForm
              fields={catalogFields}
              initial={{ scopeValue: "TEST_" }}
              onSave={(values) => {
                if (run((s) => addAssignment(s, values))) closeForm();
                else throw new Error("ข้อมูลกำหนดสิทธิ์ไม่ครบ");
              }}
            />
          )}
          {form === "mail" &&
            (mailDraft ? (
              <>
                <h3 className="mb-3 text-2xl font-bold">
                  ตัวอย่างก่อนสร้างร่างแยกผู้รับ
                </h3>
                <div className="space-y-3">
                  {(mailDraft.recipientIds as string[]).map((id) => {
                    const name = text(
                      snapshot.moduleRows.organizations?.find(
                        (r) => r.id === id,
                      )?.name,
                    );
                    return (
                      <Card key={id}>
                        <p>ถึง: {name}</p>
                        <h4 className="font-bold">
                          {text(mailDraft.subjectTemplate).replaceAll(
                            "{{recipient}}",
                            name,
                          )}
                        </h4>
                        <p className="whitespace-pre-wrap">
                          {text(mailDraft.bodyTemplate).replaceAll(
                            "{{recipient}}",
                            name,
                          )}
                        </p>
                      </Card>
                    );
                  })}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setMailDraft(null)}>
                    กลับไปแก้ไข
                  </Button>
                  <Button
                    onClick={() => {
                      if (
                        run((s) =>
                          mailMerge(
                            s,
                            text(mailDraft.senderOrganizationId),
                            mailDraft.recipientIds as string[],
                            text(mailDraft.subjectTemplate),
                            text(mailDraft.bodyTemplate),
                          ),
                        )
                      ) {
                        closeForm();
                        setTab("drafts");
                      }
                    }}
                  >
                    ยืนยันสร้างร่างแยกผู้รับ
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4">
                  ใช้ {"{{recipient}}"} แทนชื่อหน่วยงานผู้รับ
                  ไม่มีการส่งอีเมลหรือแจ้งผู้รับภายนอก
                </p>
                <FieldForm
                  fields={mailFields}
                  initial={{
                    subjectTemplate: "TEST_เรียน {{recipient}}",
                    bodyTemplate: "TEST_ข้อความถึง {{recipient}}",
                    recipientIds: [],
                    senderOrganizationId:
                      snapshot.moduleRows.organizations?.[0]?.id || "",
                  }}
                  onSave={(values) => {
                    mailMerge(
                      snapshot,
                      text(values.senderOrganizationId),
                      values.recipientIds as string[],
                      text(values.subjectTemplate),
                      text(values.bodyTemplate),
                    );
                    setMailDraft(values);
                  }}
                  submitLabel="ดูตัวอย่างจดหมายเวียน"
                />
              </>
            ))}
        </Dialog>
      )}
    </>
  );
}
