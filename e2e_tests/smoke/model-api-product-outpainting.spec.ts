import { test, expect } from "@playwright/test";

/**
 * smoke（真实 dev 后端）：/model-api/product/outpainting 是已退役的产品 demo 路由，
 * src/middleware.ts 对其做服务端 302 → /models/end-of-service（productpageReady=false）。
 * 公开页，无需 token，照 pricing 范本随时可跑。
 *
 * 强校验：真实服务端对 end-of-service 文档请求返回 2xx（重定向链路打通、目标页真实可达），
 * 再做 i18n 免疫的结构断言（标题 id / 推荐卡 href / 不触发错误边界）。
 */
test.describe("@smoke Outpainting product page 退役重定向（真实后端）", () => {
  test("访问退役路由 → 真实后端把文档跳到 end-of-service 并 2xx 渲染", async ({
    page,
  }) => {
    const resp = await page.goto("/model-api/product/outpainting", {
      waitUntil: "domcontentloaded",
    });

    // 跟随重定向后，最终 end-of-service 文档真实 2xx
    expect(resp?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/models\/end-of-service$/, {
      timeout: 30_000,
    });

    // 结构锚点（i18n 免疫）
    await expect(
      page.locator("#end-of-service-suggestions-heading"),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator(
        'section[aria-labelledby="end-of-service-suggestions-heading"] a[href="/model-api"]',
      ),
    ).toHaveCount(1);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
