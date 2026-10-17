'use client';
import {useState} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import type {DemoRecord} from '@/lib/records';
export function ImportPreview(){
  const [file,setFile]=useState<File|null>(null),[rows,setRows]=useState<DemoRecord[]|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function preview(){if(!file)return;setBusy(true);setRows(null);setMessage('');try{if(!file.name.toLowerCase().endsWith('.xlsx')||file.size>1024*1024)throw new Error('รับไฟล์ .xlsx ขนาดไม่เกิน 1 เมกะไบต์เท่านั้น');const {previewDemoWorkbook}=await import('@/lib/excel');const parsed=await previewDemoWorkbook(await file.arrayBuffer());setRows(parsed);setMessage(`ตรวจพบ ${parsed.length} รายการตัวอย่าง ยังไม่มีการบันทึกข้อมูล`);}catch{setMessage('ตรวจไฟล์ไม่ผ่าน กรุณาใช้แบบ TEST_ ที่ส่งออกจากตาราง ไม่รับสูตร รหัสซ้ำ หรือข้อมูลเกิน 1,000 รายการ');}finally{setBusy(false);}}
  return <Card className="mt-6"><h2 className="mb-2 text-xl font-semibold">ตรวจไฟล์ Excel ตัวอย่าง</h2><p className="mb-4 text-base text-muted-foreground">ใช้ไฟล์ที่ส่งออกจากตารางนี้เพื่อตรวจรูปแบบเท่านั้น ยังไม่มีการบันทึกหรือเขียนทับข้อมูล</p><label htmlFor="import-file" className="mb-2 block">ไฟล์ .xlsx ตัวอย่าง ขนาดไม่เกิน 1 เมกะไบต์</label><div className="flex flex-wrap items-center gap-3"><input id="import-file" type="file" accept=".xlsx" className="w-full max-w-xl" onChange={event=>{setFile(event.target.files?.[0]??null);setRows(null);setMessage('');}}/><Button disabled={!file||busy} onClick={()=>void preview()}>{busy?'กำลังตรวจไฟล์':'ตรวจไฟล์ตัวอย่าง'}</Button></div><p role="status" className="mt-4">{message}</p>{rows&&<p className="mt-2 text-base text-muted-foreground">ผ่านการตรวจรูปแบบ {rows.length} รายการ · ไม่มีรายการถูกเพิ่มเข้าฐานข้อมูล</p>}</Card>;
}
