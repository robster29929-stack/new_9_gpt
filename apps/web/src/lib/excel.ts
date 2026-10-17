import {demoRecordSchema,type DemoRecord} from './records';
import {z} from 'zod';

const rowsSchema=z.array(demoRecordSchema).max(1000);
const headers=['รหัส','รายการ','ประเภท','สถานะ'];
export async function exportDemoWorkbook(records:DemoRecord[]):Promise<ArrayBuffer>{
  const rows=rowsSchema.parse(records);
  const {Workbook}=await import('exceljs');
  const workbook=new Workbook();
  workbook.creator='TEST_';
  const sheet=workbook.addWorksheet('TEST_ข้อมูลสาธิต');
  sheet.addRow(headers);
  rows.forEach(row=>sheet.addRow([row.id,row.name,row.type,row.status]));
  sheet.columns.forEach(column=>{column.width=36;});
  sheet.getRow(1).font={bold:true};
  const bytes=await workbook.xlsx.writeBuffer();
  const copy=new Uint8Array(bytes.byteLength);copy.set(new Uint8Array(bytes));return copy.buffer;
}

// This is a bounded TEST_ preview, not the production secure upload pipeline.
// Formula cells and unrecognized columns are refused; no rows are persisted.
export async function previewDemoWorkbook(data:ArrayBuffer):Promise<DemoRecord[]>{
  if(data.byteLength>1024*1024)throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 1 เมกะไบต์');
  const {Workbook}=await import('exceljs');const workbook=new Workbook();
  await workbook.xlsx.load(data);
  if(workbook.worksheets.length!==1)throw new Error('ไฟล์ตัวอย่างต้องมีเพียงหนึ่งชีต');
  const sheet=workbook.worksheets[0];if(!sheet||sheet.rowCount>1001||sheet.columnCount>4)throw new Error('โครงสร้างหรือจำนวนรายการไม่ถูกต้อง');
  if(headers.some((header,index)=>sheet.getRow(1).getCell(index+1).value!==header))throw new Error('หัวตารางไม่ตรงกับแบบตัวอย่าง');
  const rows:DemoRecord[]=[];
  for(let i=2;i<=sheet.rowCount;i++){
    const values=[1,2,3,4].map(column=>sheet.getRow(i).getCell(column).value);
    if(values.some(value=>typeof value!=='string'))throw new Error('รับเฉพาะข้อความ ไม่รับสูตรหรือเซลล์ชนิดอื่น');
    const parsed=demoRecordSchema.safeParse({id:values[0],name:values[1],type:values[2],status:values[3]});
    if(!parsed.success)throw new Error('พบข้อมูลที่ไม่ใช่ TEST_ หรือไม่ตรงกับแบบตัวอย่าง');
    rows.push(parsed.data);
  }
  if(new Set(rows.map(row=>row.id)).size!==rows.length)throw new Error('พบรหัสซ้ำในไฟล์ กรุณาตรวจสอบก่อนนำเข้า');
  return rowsSchema.parse(rows);
}
