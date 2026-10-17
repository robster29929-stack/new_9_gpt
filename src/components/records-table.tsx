"use client";
import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type Row, text } from "@/lib/model";
import { labels, hiddenFields, findModule } from "@/lib/modules";
import { Button } from "./ui/button";
export function RecordsTable({
  rows,
  columns,
  onOpen,
  caption = "รายการข้อมูล TEST_",
}: {
  rows: Row[];
  columns?: string[];
  onOpen?: (r: Row) => void;
  caption?: string;
}) {
  const [query, setQuery] = useState(""),
    [sorting, setSorting] = useState<SortingState>([]),
    [includeDeleted, setIncludeDeleted] = useState(false);
  const keys = columns || ["id", "name", "type", "status"];
  const safeRows = useMemo(
    () =>
      rows.map((row) =>
        row.classification && row.classification !== "TEST_ทั่วไป"
          ? {
              ...row,
              name: "TEST_เอกสารจำกัดสิทธิ์",
              summary: "",
              attachmentLabel: "",
            }
          : row,
      ),
    [rows],
  );
  const data = useMemo(
    () =>
      safeRows.filter(
        (r) =>
          (includeDeleted || !r.deleted_at) &&
          Object.entries(r)
            .filter(([key]) => !hiddenFields.has(key))
            .map(([, value]) => value)
            .map(text)
            .join(" ")
            .normalize("NFC")
            .toLocaleLowerCase("th-TH")
            .includes(query.normalize("NFC").toLocaleLowerCase("th-TH")),
      ),
    [safeRows, query, includeDeleted],
  );
  const definitions = useMemo<ColumnDef<Row>[]>(
    () => [
      ...keys.map((key) => ({
        id: key,
        accessorFn: (r: Row) =>
          typeof r[key] === "number" ? r[key] : text(r[key]),
        header: labels[key] || "ข้อมูลเพิ่มเติม",
        cell: ({ row }: { row: { original: Row } }) => {
          const value = row.original[key];
          return key === "status" ? (
            <span className="badge">{text(value)}</span>
          ) : key === "at" && value ? (
            <span>
              {new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Bangkok",
              }).format(new Date(text(value)))}
            </span>
          ) : (
            text(value) || "—"
          );
        },
      })),
      ...(onOpen
        ? [
            {
              id: "actions",
              header: "รายละเอียด",
              enableSorting: false,
              cell: ({ row }: { row: { original: Row } }) => (
                <Button
                  variant="outline"
                  onClick={() =>
                    onOpen(
                      rows.find((r) => r.id === row.original.id) ||
                        row.original,
                    )
                  }
                >
                  เปิดรายการ
                </Button>
              ),
            },
          ]
        : []),
    ],
    [keys.join("|"), onOpen, rows],
  );
  const table = useReactTable({
    data,
    columns: definitions,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true,
    initialState: { pagination: { pageSize: 10 } },
  });
  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <label className="min-w-0 flex-1">
          ค้นหาในรายการ
          <input
            className="mt-1 w-full"
            type="search"
            maxLength={200}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหารหัส ชื่อ ประเภท หรือสถานะ"
          />
        </label>
        <Button variant="outline" onClick={() => setQuery("")}>
          ล้างคำค้น
        </Button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
          />
          รวมรายการที่ยกเลิก
        </label>
      </div>
      <p role="status" className="mb-3 text-muted-foreground">
        พบ {data.length.toLocaleString("th-TH")} รายการ
      </p>
      <div
        className="table-scroll rounded-xl border border-border"
        role="region"
        aria-label={caption}
        tabIndex={0}
      >
        <table className="data-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}{" "}
                        {header.column.getIsSorted() === "asc"
                          ? "↑"
                          : header.column.getIsSorted() === "desc"
                            ? "↓"
                            : "↕"}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan={definitions.length} className="py-12 text-center">
                  ไม่พบรายการที่ตรงกับคำค้น
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav
        aria-label="แบ่งหน้าตาราง"
        className="mt-4 flex flex-wrap items-center justify-end gap-2"
      >
        <span>
          หน้า {table.getState().pagination.pageIndex + 1} /{" "}
          {Math.max(1, table.getPageCount())}
        </span>
        <Button
          variant="outline"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
        >
          แรกสุด
        </Button>
        <Button
          variant="outline"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          ก่อนหน้า
        </Button>
        <Button
          variant="outline"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          ถัดไป
        </Button>
        <Button
          variant="outline"
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        >
          ท้ายสุด
        </Button>
        <label className="sr-only" htmlFor="page-number">
          ไปหน้าที่
        </label>
        <input
          id="page-number"
          aria-label="ไปหน้าที่"
          className="w-24"
          type="number"
          min={1}
          max={Math.max(1, table.getPageCount())}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = Number(e.target.value);
            if (
              Number.isInteger(page) &&
              page >= 1 &&
              page <= table.getPageCount()
            )
              table.setPageIndex(page - 1);
          }}
        />
        <select
          aria-label="จำนวนรายการต่อหน้า"
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>
              {n} รายการ
            </option>
          ))}
        </select>
      </nav>
    </section>
  );
}
