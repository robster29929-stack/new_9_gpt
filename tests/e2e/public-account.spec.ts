import { test, expect } from '@playwright/test';

test.beforeEach(async ({page})=>{
  // No tests may access the currently deployed Supabase project or send email.
  await page.route('**/*.supabase.co/**',route=>route.abort());
});

test('หน้าเข้าสู่ระบบอ่านภาษาไทยได้และไม่ล้นกรอบ',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'เข้าสู่ระบบ',exact:true})).toBeVisible();
  await expect(page.getByLabel('อีเมล',{exact:true})).toBeVisible();
  await expect(page.getByLabel('รหัสผ่าน',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('ลิงก์ลืมรหัสผ่านเปิดฟอร์มโดยไม่ส่งอีเมล',async({page})=>{
  await page.goto('/');
  await page.getByRole('link',{name:'ลืมรหัสผ่าน?',exact:true}).click();
  await expect(page.getByRole('heading',{name:'ลืมรหัสผ่าน',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'ขอลิงก์รีเซ็ตรหัสผ่าน',exact:true})).toBeVisible();
});

test('ผู้ไม่เข้าสู่ระบบกลับไปหน้าบัญชีก่อนแสดงพื้นที่ TEST_',async({page})=>{
  await page.goto('/workspace.html');
  await expect(page).toHaveURL(/\/login\.html$/);
  await expect(page.getByRole('heading',{name:'เข้าสู่ระบบ',exact:true})).toBeVisible();
});
