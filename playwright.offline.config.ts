import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',testMatch:'offline.spec.ts',use:{baseURL:'http://127.0.0.1:4174',headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'},webServer:{command:'npm run preview -- --port 4174',url:'http://127.0.0.1:4174',reuseExistingServer:false},reporter:'list'});
