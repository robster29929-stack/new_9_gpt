import Link from 'next/link';
import {notFound} from 'next/navigation';
import {modules,findModule} from '@/lib/modules';
import {recordsForModule} from '@/lib/demo';
import {RecordsTable} from '@/components/records-table';
import {ImportPreview} from '@/components/import-preview';
export const dynamicParams=false;
export function generateStaticParams(){return modules.map(module=>({module:module.id}));}
export default async function ModulePage({params}:{params:Promise<{module:string}>}){
  const {module:id}=await params;const module=findModule(id);if(!module)notFound();
  return <><Link href="/workspace" className="mb-5 inline-block text-base">← กลับภาพรวม</Link><p className="mb-2 text-base text-muted-foreground">ระบบ {module.number} / ข้อมูลสาธิต</p><h1 className="text-3xl font-semibold md:text-4xl">{module.name}</h1><p className="mt-3 mb-7 max-w-3xl text-muted-foreground">{module.detail}</p><RecordsTable records={recordsForModule(module.id)}/>{module.id==='exam-import'&&<ImportPreview/>}</>;
}
