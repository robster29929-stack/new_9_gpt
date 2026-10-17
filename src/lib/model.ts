import { z } from "zod";
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
export type Row = { [key: string]: Json } & { id: string };
export interface Snapshot {
  schemaVersion: 1;
  moduleRows: Record<string, Row[]>;
  state: Record<string, Json>;
  catalogs: Record<string, Json>;
  budgetSampleEvents: Record<string, Row[]>;
  examImport: Json;
  [key: string]: Json;
}
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ]),
);
const requiredModules = [
  "people",
  "organizations",
  "requests",
  "admissions",
  "budget",
  "assets",
  "correspondence",
];
export const snapshotSchema = jsonSchema
  .refine((value) => {
    if (
      !value ||
      Array.isArray(value) ||
      typeof value !== "object" ||
      value.schemaVersion !== 1
    )
      return false;
    const m = value.moduleRows,
      s = value.state;
    if (
      !m ||
      Array.isArray(m) ||
      typeof m !== "object" ||
      !s ||
      Array.isArray(s) ||
      typeof s !== "object"
    )
      return false;
    return (
      requiredModules.every(
        (key) =>
          Array.isArray(m[key]) &&
          (m[key] as Json[]).every(
            (row) =>
              !!row &&
              typeof row === "object" &&
              !Array.isArray(row) &&
              typeof row.id === "string" &&
              row.id.startsWith("TEST_"),
          ),
      ) && new TextEncoder().encode(JSON.stringify(value)).length <= 4194304
    );
  }, "พื้นที่ทำงานมีรูปแบบไม่ถูกต้องหรือมีขนาดเกิน 4 MB")
  .transform((value) => value as Snapshot);
export function text(value: Json | undefined): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map(text).join(" · ");
  if (typeof value === "object")
    return Object.values(value).map(text).join(" · ");
  return String(value);
}
export function stateRows(s: Snapshot, key: string): Row[] {
  const values = s.state[key];
  return Array.isArray(values)
    ? values.filter(
        (v): v is Row =>
          !!v &&
          typeof v === "object" &&
          !Array.isArray(v) &&
          typeof v.id === "string",
      )
    : [];
}
export function catalogRows(s: Snapshot, key: string): Row[] {
  const values = s.catalogs[key];
  return Array.isArray(values)
    ? values.filter(
        (v): v is Row =>
          !!v &&
          typeof v === "object" &&
          !Array.isArray(v) &&
          typeof v.id === "string",
      )
    : [];
}
export function cloneSnapshot(s: Snapshot): Snapshot {
  return structuredClone(s);
}
export const testId = z
  .string()
  .regex(/^TEST_[^\s]{1,150}$/, "รหัสต้องขึ้นต้นด้วย TEST_ และไม่มีช่องว่าง");
export function assertTestText(value: string) {
  if (value && !value.startsWith("TEST_"))
    throw new Error("ข้อความที่เพิ่มหรือแก้ไขต้องขึ้นต้นด้วย TEST_");
}
export function download(data: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
