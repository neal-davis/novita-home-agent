import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e_tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* 单测超时：默认 30s 对「全站 sweep 130 路由 + workers 并发」下的重路由不够（goto 自身就 45s）——
     重路由首屏在高负载下 >30s 会先撞测试超时。给 60s 头量（sweep config 用 90s，此处 deep+sweep 混跑取中）。 */
  timeout: 60_000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* open: "never" —— agent（test:e2e:agent）跑完不能挂起在 report server 上；人看报告用 npm run test:e2e */
  reporter: [["html", { open: "never" }], ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`.
       E2E_BASE_URL 由 verify-task 编排层透传（:3000 被别的工作区占用时 fallback :3101）。 */
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    /* hermetic（mock 后端）：本配置只跑它；smoke（真实后端）在 playwright.smoke.config.ts */
    {
      name: "chromium",
      // channel: "chromium" → 用全量 chromium 的「新 headless」模式，**不依赖 chromium-headless-shell**
      // 二级产物（CI 上该产物从 Playwright CDN 下载偶发 stall 挂死；全量 chromium 下载可靠）。
      // 实测：移走 headless-shell 后默认 project 报「browser not found」，加 channel 后正常。
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
      testIgnore: /smoke\//,
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
