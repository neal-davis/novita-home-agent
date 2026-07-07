import { defineConfig, devices } from "@playwright/test";

/**
 * smoke 套件：打真实后端（dev-api.novita.ai）的 e2e，与 hermetic（playwright.config.ts）
 * 分离成独立配置——`playwright test` 默认只跑 hermetic，smoke 必须显式
 * `npm run test:e2e:smoke` 运行（双配置方案移植自 admin-cloudplatform）。
 *
 * console/账单类路由需要 .env.e2e 的 E2E_NOVITA_TOKEN（dev 环境用户 JWT）；
 * auth.setup.ts 把它落成 storageState。无 token 时鉴权用例自行 skip，营销页用例照跑。
 */
export default defineConfig({
  testDir: "./e2e_tests/smoke",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: Number(process.env.E2E_RETRIES ?? (process.env.CI ? 2 : 0)),
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report-smoke" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "smoke",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chromium",
        storageState: "e2e_tests/.auth/user.json",
      },
      testMatch: /.*\.spec\.ts/,
      dependencies: ["setup"],
    },
  ],
});
