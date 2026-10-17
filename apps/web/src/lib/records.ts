import {z} from 'zod';

// DTO allowlist only. Never export raw snapshot/contact/person identity fields.
export const demoRecordSchema=z.object({
  id:z.string().startsWith('TEST_').max(160),
  name:z.string().min(1).max(500),
  type:z.string().max(200),
  status:z.string().max(200),
}).strict();
export type DemoRecord=z.infer<typeof demoRecordSchema>;
export const searchSchema=z.object({query:z.string().trim().max(200,'ค้นหาได้ไม่เกิน 200 ตัวอักษร')}).strict();
export function selectDemoRecords(values:unknown):DemoRecord[]{
  return z.array(z.unknown()).parse(values).map(value=>{
    const row=z.record(z.string(),z.unknown()).parse(value);
    return demoRecordSchema.parse({id:row.id??row.key,name:row.name??row.label??row.subject,type:row.type??row.domain??row.program??'ข้อมูลสาธิต',status:row.status??'รอตรวจข้อมูล'});
  });
}
export function filterRecords(rows:readonly DemoRecord[],query:string):DemoRecord[]{
  const validated=searchSchema.parse({query}).query.normalize('NFC').toLocaleLowerCase('th-TH');
  return rows.filter(row=>Object.values(row).join(' ').normalize('NFC').toLocaleLowerCase('th-TH').includes(validated));
}
