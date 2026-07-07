import { test, expect } from "@playwright/test";

/**
 * smoke（真实后端/真实构建）：/user/register 是公开注册页，无需登录、无 token skip 守卫
 * （照 pricing.spec.ts 范式）。
 *
 * 该页初始不发数据 XHR（register 仅在提交时触发），故 smoke 的「真相」信号是：
 *  - 真实路由的文档响应 2xx（page.goto 返回值校验）——证明真实构建/SSR 正常出页；
 *  - 真实构建把注册表单骨架渲染出来（稳定 track id 锚点），未塌成白屏/错误边界。
 * 选择器与 hermetic 同源（locale 无关的 main__login__signup_form__* id）。
 */
test.describe("@smoke User Register（真实后端）", () => {
  test("公开注册页从真实构建渲染出表单骨架，文档 2xx、不崩", async ({
    page,
  }) => {
    const resp = await page.goto("/user/register", {
      waitUntil: "domcontentloaded",
    });
    // 真实路由文档响应 2xx（真相源：真实构建/SSR 出页正常）
    expect(resp?.ok()).toBeTruthy();

    // 真实构建渲染出第三方注册入口（稳定 id），证明表单骨架真实可见
    await expect(
      page.locator('[id="main__login__signup_form__google"]'),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator('[id="main__login__signup_form__show-email-signup"]'),
    ).toBeVisible();

    // 未塌成错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
