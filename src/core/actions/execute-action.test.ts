import { describe, expect, it } from "vitest";
import { z } from "zod";
import { executeAction, type ActionDependencies } from "./execute-action.js";
type Input = { id: string };
type Tx = { writes: string[]; audits: string[] };
function setup(allow = true, failAudit = false) {
  const order: string[] = [],
    committed: Tx = { writes: [], audits: [] };
  const deps: ActionDependencies<Input, Input, Tx> = {
    schema: z.object({ id: z.string().startsWith("TEST_") }).strict(),
    authorize: async () => {
      order.push("authorize");
      return allow ? { actorId: "TEST_ACTOR_001" } : null;
    },
    transaction: async (run) => {
      order.push("transaction");
      const tx: Tx = { writes: [], audits: [] };
      const result = await run(tx);
      committed.writes.push(...tx.writes);
      committed.audits.push(...tx.audits);
      return result;
    },
    write: async (tx, input) => {
      order.push("write");
      tx.writes.push(input.id);
      return input;
    },
    describeAudit: (result, actorId) => ({
      actorId,
      action: "TEST_UPDATE",
      entityId: result.id,
      summary: "TEST_แก้รายการจำลอง",
    }),
    appendAudit: async (tx, event) => {
      order.push("audit");
      if (failAudit) throw Error("TEST_AUDIT_FAILED");
      tx.audits.push(event.entityId);
    },
  };
  return { deps, order, committed };
}
describe("action pipeline", () => {
  it("Zod ปฏิเสธข้อมูลผิดก่อน authorize/write", async () => {
    const { deps, order } = setup();
    await expect(executeAction({ id: "invalid" }, deps)).rejects.toThrow();
    expect(order).toEqual([]);
  });
  it("ผู้ไม่มีสิทธิ์ไม่เปิด transaction", async () => {
    const { deps, order } = setup(false);
    await expect(executeAction({ id: "TEST_ROW_001" }, deps)).rejects.toThrow(
      "ไม่มีสิทธิ์",
    );
    expect(order).toEqual(["authorize"]);
  });
  it("write และ audit อยู่ใน transaction เดียว", async () => {
    const { deps, order, committed } = setup();
    await executeAction({ id: "TEST_ROW_001" }, deps);
    expect(order).toEqual(["authorize", "transaction", "write", "audit"]);
    expect(committed).toEqual({
      writes: ["TEST_ROW_001"],
      audits: ["TEST_ROW_001"],
    });
  });
  it("adapter rollback ทั้งรายการเมื่อ audit ล้มเหลว", async () => {
    const { deps, committed } = setup(true, true);
    await expect(executeAction({ id: "TEST_ROW_001" }, deps)).rejects.toThrow(
      "TEST_AUDIT_FAILED",
    );
    expect(committed).toEqual({ writes: [], audits: [] });
  });
});
