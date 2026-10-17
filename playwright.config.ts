import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL:'http://127.0.0.1:4178', headless:true },
  projects: [
    {name:'desktop',use:{browserName:'chromium',viewport:{width:1280,height:900}}},
    {name:'mobile',use:{browserName:'chromium',viewport:{width:390,height:844}}},
  ],
  webServer: {command:'npm run build && node scripts/static-test-server.cjs',url:'http://127.0.0.1:4178',reuseExistingServer:false,timeout:60000},
});
