import { describe, expect, it } from "vitest";
import { transitionWorkflow, WorkflowError } from "./index.js";
const graph = {
  TEST_DRAFT: ["TEST_REVIEW"],
  TEST_REVIEW: ["TEST_DONE"],
  TEST_DONE: [],
} as const;
const input = {
  from: "TEST_DRAFT",
  to: "TEST_REVIEW",
  expectedRevision: 1,
  actualRevision: 1,
  actorId: "TEST_ACTOR_001",
  permissionGranted: true,
};
describe("workflow กลาง", () => {
  it("เปลี่ยนได้ตาม graph พร้อมเพิ่ม revision", () => {
    const result = transitionWorkflow(input, graph);
    expect(result.to).toBe("TEST_REVIEW");
    expect(result.nextRevision).toBe(2);
    expect(Object.isFrozen(result)).toBe(true);
  });
  it("ปฏิเสธผู้ไม่มีสิทธิ์", () =>
    expect(() =>
      transitionWorkflow({ ...input, permissionGranted: false }, graph),
    ).toThrow(WorkflowError));
  it("ปฏิเสธ stale revision", () =>
    expect(() =>
      transitionWorkflow({ ...input, actualRevision: 2 }, graph),
    ).toThrow("ข้อมูลถูกแก้ไขแล้ว"));
  it("ปฏิเสธทางลัดและ self transition ที่ไม่ได้กำหนด", () => {
    expect(() =>
      transitionWorkflow({ ...input, to: "TEST_DONE" }, graph),
    ).toThrow("ไม่อนุญาต");
    expect(() =>
      transitionWorkflow({ ...input, to: "TEST_DRAFT" }, graph),
    ).toThrow("ไม่อนุญาต");
  });
  it("ไม่อ่านชื่อ state จาก prototype chain", () =>
    expect(() =>
      transitionWorkflow({ ...input, from: "toString" }, graph),
    ).toThrow("ไม่อนุญาต"));
  it("reject invalid schema before authorization graph", () =>
    expect(() =>
      transitionWorkflow({ ...input, expectedRevision: -1 }, graph),
    ).toThrow());
});
