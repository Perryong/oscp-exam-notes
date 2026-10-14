import {defineConfig} from 'vitest/config';
export default defineConfig({resolve:{dedupe:['firebase','@firebase/app','@firebase/auth','@firebase/firestore']},test:{include:['tests/integration/**/*.test.ts'],environment:'node',fileParallelism:false,testTimeout:20000,env:{VITE_FIREBASE_MODE:'emulator'}}});
