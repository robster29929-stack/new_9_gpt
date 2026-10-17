import {test,expect} from '@playwright/test';
import {modules} from '../../src/lib/modules';

test.beforeEach(async({page})=>{await page.route('**/*.supabase.co/**',route=>route.abort());});
test('ภาพรวมแสดง 9 ระบบและไม่ล้นหน้าจอ',async({page})=>{
  await page.goto('/workspace/');
  await expect(page.getByRole('heading',{name:'เลือกเข้าสู่ระบบงาน'})).toBeVisible();
  for(const module of modules)await expect(page.getByRole('heading',{name:module.name,exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
for(const module of modules)test(`ระบบ ${module.number} ค้นหาและแสดงตารางได้`,async({page})=>{
  await page.goto('/workspace/'+module.id+'/');await expect(page.getByRole('heading',{name:module.name,exact:true})).toBeVisible();
  await page.getByLabel('ค้นหาข้อมูลสาธิต',{exact:true}).fill('TEST_ไม่พบรายการ_ทดสอบ');await page.getByRole('button',{name:'ค้นหา',exact:true}).click();
  await expect(page.getByRole('cell',{name:'ไม่พบรายการที่ตรงกับคำค้น'})).toBeVisible();
  await page.getByRole('button',{name:'ล้างคำค้น'}).click();await expect(page.locator('tbody tr')).not.toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('รายวิชาเปลี่ยนหน้า เรียงลำดับ และส่งออก Excel ได้',async({page})=>{
  await page.goto('/workspace/learning/');
  await page.getByRole('button',{name:'ถัดไป',exact:true}).click();await expect(page.getByRole('spinbutton',{name:'ไปหน้าที่'})).toHaveValue('2');
  await page.getByRole('button',{name:'รหัส',exact:false}).click();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'ส่งออก Excel'}).click();
  const download=await downloadPromise;expect(download.suggestedFilename()).toBe('TEST_workspace.xlsx');
});
test('ไฟล์ที่ไม่ใช่ xlsx ถูกปฏิเสธโดยไม่มีการบันทึก',async({page})=>{
  await page.goto('/workspace/exam-import/');await page.getByLabel('ไฟล์ .xlsx ตัวอย่าง ขนาดไม่เกิน 1 เมกะไบต์').setInputFiles({name:'TEST_invalid.txt',mimeType:'text/plain',buffer:Buffer.from('TEST_')});
  await page.getByRole('button',{name:'ตรวจไฟล์ตัวอย่าง'}).click();await expect(page.getByRole('status').filter({hasText:'ตรวจไฟล์ไม่ผ่าน'})).toBeVisible();
});
