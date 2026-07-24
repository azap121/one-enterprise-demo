import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './playwright/tests',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:9000',
  },
  fullyParallel: true,
  reporter: 'list',
});
