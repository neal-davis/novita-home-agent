import { defineConfig, devices } from "@playwright/test";

/**
 * `@demo` 录制配置：把「带断言的验收流程」录成可上线评审的演示视频。
 *
 * 与 hermetic（playwright.config.ts）/ smoke（playwright.smoke.config.ts）的关系：
 * - 只跑打了 `@demo` 标签的用例（grep），video:'on' 全程录像，单 worker 保证叙事顺序确定。
 * - **复用普通 e2e spec**：同一个 `@demo` 用例在 `test:e2e:agent` 里是快回归
 *   （DEMO 未置位 → HUD 自动 no-op，见 e2e_tests/helpers/demo.ts）；在这里 DEMO=1 时
 *   叠加 标题卡/步骤字幕/✅ 戳。一份用例，两个用途，零重复维护。
 * - 由 scripts/agent/record-demo.mjs 调用，把产物归档到 <taskDir>/video/demo.webm。
 *
 * baseURL / storageState 由编排层透传：E2E_BASE_URL（:3000 被占用时 fallback :3101）、
 * E2E_DEMO_STORAGE_STATE（console 路由进 demo 时带上鉴权 state）。
 */
const storageState = process.env.E2E_DEMO_STORAGE_STATE || undefined;

export default defineConfig({
  testDir: "./e2e_tests",
  testIgnore: /smoke\//,
  grep: /@demo/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // 含 HUD 停顿（标题卡 ~2.4s + 每步 ~1s + 每个 pass ~1.5s），给足头量。
  timeout: 120_000,
  reporter: [["list"]],
  outputDir: "test-results-demo",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    viewport: { width: 1280, height: 720 },
    video: { mode: "on", size: { width: 1280, height: 720 } },
    trace: "on",
    ...(storageState ? { storageState } : {}),
  },
  projects: [
    {
      name: "demo",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
});
