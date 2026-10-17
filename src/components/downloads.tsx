import metadata from "@/lib/legacy-metadata.json";
export function Downloads({
  kind = "all",
}: {
  kind?: "all" | "pali" | "dhamma";
}) {
  const rows =
    kind === "all"
      ? [...metadata.downloads.pali, ...metadata.downloads.dhamma]
      : metadata.downloads[kind];
  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 text-2xl font-bold">แบบบัญชีสำหรับดาวน์โหลด</h2>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.asset}>
            {"sourceOnly" in row && row.sourceOnly ? (
              <a
                href="https://www.dhammastudy.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {row.label} · เปิดเว็บไซต์เจ้าของแบบ
              </a>
            ) : (
              <a
                href={"/assets/forms/" + encodeURIComponent(row.asset)}
                download={row.downloadName}
              >
                {row.label}
              </a>
            )}
            <p className="text-base text-muted-foreground">{row.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
