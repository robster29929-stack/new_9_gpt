import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/e2e',workers:1,reporter:'list',use:{baseURL:process.env.BASE_URL??'http://terminal.local:4173'},projects:[{name:'desktop',use:{browserName:'chromium',viewport:{width:1366,height:900}}},{name:'mobile',use:{browserName:'chromium',viewport:{width:390,height:844}}}]});
