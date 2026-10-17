import { notFound } from "next/navigation";
import { allModules } from "@/lib/modules";
import { ModuleWorkspace } from "@/components/module-workspace";
export function generateStaticParams() {
  return allModules.map((m) => ({ module: m.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!allModules.some((m) => m.id === module)) notFound();
  return <ModuleWorkspace moduleId={module} />;
}
