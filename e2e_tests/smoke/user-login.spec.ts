import { test, expect } from "@playwright/test";

/**
 * smoke（真实 dev 后端）：/user/login 是公开登录表单页，无需登录、无 token skip 守卫
 * （照 pricing.spec.ts 范式）。该页无业务取数 XHR（数据来自 searchParams / 三方 OAuth），
 * 故用 page.waitForResponse 对**页面文档导航**强校验真实后端返回 2xx，再做结构断言。
 */
test.describe("@smoke User Login（真实后端）", () => {
  test("页面文档 2xx 返回并渲染出登录表单结构", async ({ page }) => {
    // 强校验：document 导航本身命中真实 server 且 2xx（< 400）
    const [resp] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.request().resourceType() === "document" &&
          /\/user\/login/.test(new URL(r.url()).pathname),
        { timeout: 30_000 },
      ),
      page.goto("/user/login", { waitUntil: "domcontentloaded" }),
    ]);
    expect(resp.status(), "登录页文档应返回 2xx").toBeLessThan(400);

    // 结构断言：三方登录入口 + 邮箱入口的稳定 track id（locale 无关）
    await expect(
      page.locator('[id="main__login__login_form__show-email-login"]'),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator('[id="main__login__login_form__google"]'),
    ).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
