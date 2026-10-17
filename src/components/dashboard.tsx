"use client";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { modules } from "@/lib/modules";
import { collection, budgetTotals } from "@/lib/domain";
import { stateRows } from "@/lib/model";
import { fiscalYearBE } from "@/core/i18n/thai-date";
import { useWorkspace } from "./workspace-provider";
import { Card } from "./ui/card";
export function Dashboard() {
  const { snapshot } = useWorkspace();
  const data = modules.map((m) => ({
    name: m.number,
    รายการ:
      m.id === "exam-import"
        ? snapshot.examImport &&
          typeof snapshot.examImport === "object" &&
          !Array.isArray(snapshot.examImport) &&
          Array.isArray(snapshot.examImport.rows)
          ? snapshot.examImport.rows.length
          : 0
        : collection(snapshot, m.id).filter((r) => !r.deleted_at).length,
  }));
  const budget = budgetTotals(snapshot);
  return (
    <>
      <h1 className="text-3xl font-bold">ภาพรวมระบบงาน</h1>
      <p className="mb-6 text-muted-foreground">
        ทะเบียน การศึกษา การสอบ และงานบริหาร · ปีงบประมาณ{" "}
        {fiscalYearBE(new Date(), "Asia/Bangkok")}
      </p>
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <Card>
          <p>ระบบงาน</p>
          <strong className="text-4xl">9</strong>
        </Card>
        <Card>
          <p>ยอดจัดสรรจำลอง</p>
          <strong className="text-2xl">
            {(budget.allocated / 100).toLocaleString("th-TH")} บาท
          </strong>
        </Card>
        <Card>
          <p>รายการเคลื่อนไหวพัสดุ</p>
          <strong className="text-4xl">
            {stateRows(snapshot, "assetMovements").length}
          </strong>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.id} href={"/workspace/" + m.id} className="no-underline">
            <Card className="h-full transition hover:border-primary">
              <span className="badge">ระบบ {m.number}</span>
              <h2 className="mt-3 text-2xl font-bold">{m.name}</h2>
              <p className="mt-2 text-muted-foreground">{m.detail}</p>
              <p className="mt-3 font-bold">เปิดระบบ →</p>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-7">
        <h2 className="text-2xl font-bold">จำนวนระเบียน TEST_ แยกตามระบบ</h2>
        <div
          className="mt-5 h-64"
          role="img"
          aria-label={data
            .map((r) => `ระบบ ${r.name} ${r.รายการ} รายการ`)
            .join(", ")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="รายการ" fill="#194c3d" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
