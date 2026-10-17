import {describe,it,expect} from 'vitest';
import {selectDemoRecords,filterRecords,searchSchema} from '../../src/lib/records';
import {modules,findModule} from '../../src/lib/modules';
import {recordsForModule} from '../../src/lib/demo';

describe('ข้อมูลสาธิตและการค้นหา',()=>{
  it('ใช้ allowlist และไม่ส่งข้อมูลติดต่อหรือฟิลด์เพิ่มเติมออกไป',()=>{
    const rows=selectDemoRecords([{id:'TEST_001',name:'TEST_ข้อมูล',type:'TEST_ประเภท',status:'TEST_รอตรวจ',phone:'TEST_PHONE',nationalId:'TEST_IDENTIFIER'}]);
    expect(rows).toEqual([{id:'TEST_001',name:'TEST_ข้อมูล',type:'TEST_ประเภท',status:'TEST_รอตรวจ'}]);
  });
  it('ปฏิเสธรหัสที่ไม่ใช่ข้อมูล TEST_',()=>{expect(()=>selectDemoRecords([{id:'OTHER_001',name:'TEST_ข้อมูล'}])).toThrow();});
  it('ค้นหาได้ทุกฟิลด์ที่อนุญาตและไม่แก้รายการต้นฉบับ',()=>{
    const rows=selectDemoRecords([{id:'TEST_001',name:'TEST_บาลี',type:'TEST_เรียน',status:'TEST_รอตรวจ'},{id:'TEST_002',name:'TEST_ธรรม',type:'TEST_เรียน',status:'TEST_พร้อม'}]);
    expect(filterRecords(rows,' บาลี ')).toEqual([rows[0]]);
    expect(filterRecords(rows,'test_พร้อม')).toEqual([rows[1]]);
    expect(filterRecords(rows,'ไม่พบ')).toEqual([]);expect(rows).toHaveLength(2);
  });
  it('จำกัดคำค้น 200 ตัวอักษร',()=>{expect(searchSchema.safeParse({query:'ก'.repeat(201)}).success).toBe(false);});
  it('ใช้รหัสเมนูไม่ซ้ำและไม่รับ path ที่ไม่รู้จัก',()=>{expect(new Set(modules.map(module=>module.id)).size).toBe(9);expect(findModule('../people')).toBeUndefined();});
  for(const module of modules)it(`ระบบ ${module.number} สร้าง DTO ที่ถูกต้องจาก fixture เดิม`,()=>{
    const rows=recordsForModule(module.id);expect(rows.length).toBeGreaterThan(0);expect(rows.every(row=>row.id.startsWith('TEST_'))).toBe(true);
    expect(rows.every(row=>Object.keys(row).sort().join(',')==='id,name,status,type')).toBe(true);
  });
});
