import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { getActiveProfile, SWEEP_AUTH_FILE } from "./e2e_tests/profiles";

// Playwright 不自动加载 .env——显式加载 .env.e2e（gitignored），让真机 profile 的 token
// （E2E_TOKEN_*）进 process.env。本文件被每个 worker 加载，故 setup/worker 内也读得到。
// E2E_PROFILE / E2E_CONFIRM_PROD 仍只走命令行（不放 .env.e2e），保持每次跑 prod 显式确认。
dotenv.config({ path: path.resolve(__dirname, ".env.e2e") });

/**
 * 全站健康巡检配置（catalog-driven，第三个独立配置——不碰 playwright.config.ts[hermetic 门禁]
 * 与 playwright.smoke.config.ts[真相源]）。目标环境由 E2E_PROFILE 选择（见 e2e_tests/profiles.ts）：
 *
 *   E2E_PROFILE=local-hermetic（默认）  localhost + mock 后端，CI 门禁，零外部依赖、零 token
 *   E2E_PROFILE=local-live              localhost(build:test) + 真实 dev 后端（需 .env.e2e 的 E2E_TOKEN_DEV）
 *   E2E_PROFILE=online-prod             https://novita.ai 真机只读（需 E2E_TOKEN_PROD + E2E_CONFIRM_PROD=1）
 *
 * 跑：npm run test:e2e:sweep（会先生成 route-catalog.generated.json，再按 active profile 巡检）。
 * real profile 才挂 setup 项目（注入 token → storageState）；mock profile 不需要。
 */
const profile = getActiveProfile();
const isReal = profile.backendKind === "real";

export default defineConfig({
  testDir: "./e2e_tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: Number(process.env.E2E_RETRIES ?? 0),
  workers: process.env.CI ? 1 : undefined,
  // 单测超时须 > goto 的 45s：next dev 重路由首访按需编译可达数十秒，
  // 默认 30s 会先把 goto 砍掉造成假超时（prod 预编译站用不满，无害）。
  timeout: 90_000,
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report-sweep" }],
    ["list"],
  ],
  use: {
    baseURL: profile.baseURL,
    trace: "on-first-retry",
  },
  projects: isReal
    ? [
        { name: "setup", testMatch: /sweep\.auth\.setup\.ts/ },
        {
          name: "sweep",
          use: {
            ...devices["Desktop Chrome"],
            channel: "chromium",
            storageState: SWEEP_AUTH_FILE,
          },
          testMatch: /sweep\.spec\.ts/,
          dependencies: ["setup"],
        },
      ]
    : [
        {
          name: "sweep",
          use: { ...devices["Desktop Chrome"], channel: "chromium" },
          testMatch: /sweep\.spec\.ts/,
        },
      ],
});
