import {it,expect} from 'vitest';
import {Workbook} from 'exceljs';
import {exportDemoWorkbook,previewDemoWorkbook} from '../../src/lib/excel';

const rows=[{id:'TEST_001',name:'TEST_บาลี',type:'TEST_เรียน',status:'TEST_รอตรวจ'}];
async function buffer(workbook:Workbook){const bytes=await workbook.xlsx.writeBuffer();const copy=new Uint8Array(bytes.byteLength);copy.set(new Uint8Array(bytes));return copy.buffer;}
it('ส่งออกและตรวจไฟล์ TEST_ กลับมาโดยไม่เปลี่ยนข้อมูล',async()=>{expect(await previewDemoWorkbook(await exportDemoWorkbook(rows))).toEqual(rows);});
it('ปฏิเสธ header ที่ไม่ใช่แบบสาธิต',async()=>{const workbook=new Workbook();workbook.addWorksheet('TEST_').addRow(['OTHER']);await expect(previewDemoWorkbook(await buffer(workbook))).rejects.toThrow('หัวตาราง');});
it('ปฏิเสธสูตร Excel',async()=>{const workbook=new Workbook();const sheet=workbook.addWorksheet('TEST_');sheet.addRow(['รหัส','รายการ','ประเภท','สถานะ']);sheet.addRow(['TEST_001',{formula:'1+1',result:2},'TEST_','TEST_']);await expect(previewDemoWorkbook(await buffer(workbook))).rejects.toThrow('ไม่รับสูตร');});
it('ปฏิเสธรหัสซ้ำ',async()=>{await expect(previewDemoWorkbook(await exportDemoWorkbook([...rows,...rows]))).rejects.toThrow('รหัสซ้ำ');});
it('ปฏิเสธไฟล์เกินขนาดก่อนเปิด workbook',async()=>{await expect(previewDemoWorkbook(new ArrayBuffer(1024*1024+1))).rejects.toThrow('1 เมกะไบต์');});
it('ไม่ส่งออกรหัสนอก TEST_',async()=>{await expect(exportDemoWorkbook([{...rows[0]!,id:'OTHER_001'}])).rejects.toThrow();});
