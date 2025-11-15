import { defineConfig } from '@playwright/test';
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  testDir: "./tests",

  globalSetup: "./globalSetup.ts",

  use: {
    baseURL: process.env.API_URL,
    ignoreHTTPSErrors: true,
  },

  reporter: "html",

  workers: 1,
  fullyParallel: false,
});
