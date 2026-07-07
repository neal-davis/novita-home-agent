import { test, expect } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";
import {
  demoChecklist,
  demoPass,
  demoStep,
  demoTitle,
  installDemoHud,
} from "./helpers/demo";

/**
 * `@demo` 模板：演示「带断言 + 验收清单的录屏」长这样（e2e-test-author 以此为样板复制改写）。
 *
 * - 路由选 public hermetic /pricing（无需鉴权、永远可用）。
 * - **既是回归用例**（断言真实结构，进 test:e2e:agent 全量回归）**又是演示脚本**
 *   （DEMO=1 时 HUD 叠标题卡/验收清单/步骤字幕/✅ 戳；DEMO 未置位则 HUD no-op、当普通快用例跑）。
 * - 每个验收点（AC）= 一个 test.step：demoStep 打字幕 → 断言 → demoPass(msg, "ACn") 打戳并勾绿清单。
 *   AC 编号必须与 plan.md 的「验收标准」对齐（check-report.mjs 会机械校验对齐）。
 *
 * 录制：node scripts/agent/record-demo.mjs --task <id> --spec demo-sample
 * 人工预览：npm run test:e2e:demo -- demo-sample
 */
test.describe("Pricing 验收演示", () => {
  test.beforeEach(async ({ page }) => {
    await installDemoHud(page);
    await mockBackend(page, {});
  });

  test("@demo 价格页结构验收", async ({ page }) => {
    await page.goto("/pricing");
    await demoTitle(page, {
      title: "验收：定价页",
      lines: [
        "改动：定价页 tab 结构",
        "环境：hermetic mock · en",
        "判据：见左下验收清单",
      ],
    });
    await demoChecklist(page, [
      { id: "AC1", label: "首屏价格 tab 渲染（sandbox & gpus）" },
      { id: "AC2", label: "未触发错误边界 / 非白屏" },
    ]);

    await test.step("AC1 首屏价格 tab 渲染", async () => {
      await demoStep(page, {
        n: 1,
        total: 2,
        label: "打开 /pricing",
        expected: "sandbox & gpus tab 可见",
      });
      await expect(page.locator('[id$="sandbox-tab"]').first()).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.locator('[id$="gpus-tab"]').first()).toBeVisible();
      await demoPass(page, "AC1 tab 结构 OK", "AC1");
    });

    await test.step("AC2 未触发错误边界 / 非白屏", async () => {
      await demoStep(page, {
        n: 2,
        total: 2,
        label: "校验页面健康度",
        expected: "无 <h1>Error</h1>，主体有内容",
      });
      await expect(
        page.getByRole("heading", { name: "Error", exact: true }),
      ).toHaveCount(0);
      expect(
        (await page.locator("body").innerText()).trim().length,
      ).toBeGreaterThan(100);
      await demoPass(page, "AC2 页面健康 OK", "AC2");
    });
  });
});
