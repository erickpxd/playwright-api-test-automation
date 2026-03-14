import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const suiteFilter = process.env.TEST_SUITE?.toLowerCase();
const grep =
  suiteFilter === "smoke"
    ? /Smoke/
    : suiteFilter === "regression"
      ? /Regression/
      : undefined;

export default defineConfig({
  testDir: "./tests",

  globalSetup: "./globalSetup.ts",
  globalTeardown: "./globalTeardown.ts",

  maxFailures: process.env.FAIL_FAST === "1" ? 1 : undefined,

  use: {
    baseURL: process.env.API_URL,
    ignoreHTTPSErrors: true,
  },

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["./framework/reporters/statusReporter.ts"],
  ],

  grep,

  workers: 1,
  fullyParallel: false,
});
