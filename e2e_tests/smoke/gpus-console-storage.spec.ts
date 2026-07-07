import { test, expect } from "@playwright/test";

/**
 * smoke（真相源，真实 dev 后端 dev-api.novita.ai）：/gpus-console/storage。
 * console 路由需登录 → 无 E2E_NOVITA_TOKEN 时整体 skip（见 auth.setup.ts / smoke config）。
 *
 * 强校验：等真实 GET /api/v1/networkstorages/list（reqGetStorage）2xx，确认存储列表后端契约
 * 仍可用；再断言页面结构（Section 容器 + 不触发错误边界）。不断言具体数据值（真实账号存储
 * 列表可能为空，空/非空都合法），也不断言 i18n 文案。
 */
test.describe("@smoke GPU Console Storage（真实后端）", () => {
  test("真实 networkstorages/list 返回 2xx，页面渲染存储区块、不崩", async ({
    page,
  }) => {
    test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

    const listResp = page.waitForResponse(
      (r) =>
        r.url().includes("/networkstorages/list") &&
        r.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/storage", { waitUntil: "domcontentloaded" });

    const res = await listResp;
    expect(res.status(), "networkstorages/list should be 2xx").toBeLessThan(
      300,
    );

    // Section 容器渲染（结构锚点，非数据值）。
    await expect(page.locator("[class*='subContainer']")).toHaveCount(1, {
      timeout: 30_000,
    });

    // 未被弹去登录 + 不触发错误边界。
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
