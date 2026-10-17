/** Simulation states only. Real authority remains in Supabase RLS; no role claims from this UI authorize business operations. */
import { type Row } from "@/lib/model";
export const requestStates = [
  "TEST_ร่างคำขอจำลอง",
  "TEST_รับข้อมูลจำลอง",
  "TEST_ตรวจความครบถ้วนจำลอง",
  "TEST_รอข้อมูลเพิ่มเติมจำลอง",
  "TEST_อยู่ระหว่างดำเนินการจำลอง",
] as const;
export function initialStatus(module: string) {
  return module === "incoming-correspondence"
    ? "TEST_รอรับจำลอง"
    : module === "correspondence"
      ? "TEST_ร่าง"
      : module === "requests"
        ? requestStates[0]
        : "TEST_ร่าง";
}
export function transitionTestRecord(row: Row, to: string): Row {
  const from = String(row.status || "");
  let allowed: string[] = [];
  if (to === "TEST_ยกเลิกจำลอง" && !row.deleted_at) allowed = [to];
  else if (from === "TEST_ยกเลิกจำลอง" && row.deleted_at)
    allowed = [String(row.previousStatus || "TEST_ร่าง")];
  else if (row.direction === "outgoing" && from === "TEST_ร่าง")
    allowed = ["TEST_ส่งจำลอง"];
  else if (row.direction === "incoming" && from === "TEST_รอรับจำลอง")
    allowed = ["TEST_รับทราบจำลอง"];
  else if (requestStates.includes(from as (typeof requestStates)[number]))
    allowed =
      from === requestStates[3]
        ? [requestStates[2]]
        : from === requestStates[2]
          ? [requestStates[3], requestStates[4]]
          : from === requestStates[0]
            ? [requestStates[1]]
            : from === requestStates[1]
              ? [requestStates[2]]
              : [];
  if (!allowed.includes(to))
    throw new Error("ไม่อนุญาตให้เปลี่ยนไปยังสถานะที่เลือก");
  return {
    ...row,
    status: to,
    ...(requestStates.includes(to as (typeof requestStates)[number])
      ? {
          timeline: [...(Array.isArray(row.timeline) ? row.timeline : []), to],
          currentStep: to,
        }
      : {}),
  };
}
export function softDeleteTestRecord(row: Row, now: string): Row {
  return {
    ...transitionTestRecord(row, "TEST_ยกเลิกจำลอง"),
    previousStatus: row.status || "TEST_ร่าง",
    deleted_at: now,
  };
}
export function restoreTestRecord(row: Row): Row {
  return {
    ...transitionTestRecord(row, String(row.previousStatus || "TEST_ร่าง")),
    deleted_at: null,
  };
}
