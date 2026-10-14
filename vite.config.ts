import { defineConfig } from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react(),VitePWA({registerType:'prompt',injectRegister:false,manifest:{name:'OSCP Fieldnotes',short_name:'Fieldnotes',start_url:'/study-plan',display:'standalone',background_color:'#f5f6f2',theme_color:'#183d39'},workbox:{globPatterns:['**/*.{js,css,html,svg,png,woff2}'],maximumFileSizeToCacheInBytes:4000000,navigateFallback:'/index.html',runtimeCaching:[]}})],build:{outDir:'dist'}});
