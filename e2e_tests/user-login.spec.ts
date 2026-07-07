import { test, expect, type Page } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/user/login（公开登录表单页）。
 *
 * 页面类型：RSC server component（async Page 读 headers() 的 x-search → searchParams）
 * 套一层客户端 <LoginForm>。**数据全部来自 searchParams / 三方 OAuth 跳转，无后端取数 XHR**
 * （prod 抓取文件 user-login-captured.json 为空 {} 印证了这一点）。因此本 spec **不注入
 * 任何业务 fixture、也不 seedAuth**——登录页种假 token 反而可能被重定向去 console。
 *
 * 这一层不只断言「不白屏」（全站 sweep 已覆盖），而是断言**确定性结构/行为**：
 *  - 初始态：3 个三方登录入口 + "Login with Email" 入口 + "Sign up" 链接，均以
 *    源码硬编码的稳定 track id（main__login__login_form__*，经 id={...} 落到 <button>/<a>）
 *    + <img alt> 定位（locale 无关）。
 *  - 交互分支：点 "Login with Email" → 表单展开出 email/password 输入框 + 提交按钮，
 *    入口按钮消失（isShowEmailLogin 状态翻转）。
 *  - 服务端 notice 分支：?notice_type=active 时 FormNotice 服务端渲染出 notice 区块，
 *    plain 页不渲染（变异式对照，证明断言有牙）。
 *  - 全程不触发错误边界。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点全部 locale 无关——
 *  - 结构：稳定 track id <button id>/<a id>、<img alt="google|github|huggingface">、
 *    输入框稳定 id（LabelInput 把 name 透传成 id → #email / #password）、
 *    notice 区块的 CSS-module 稳定类前缀 [class*="LoginForm_notice__"]。
 *  - 链接目标：Sign up 的 href="/user/register"（路由常量，非文案）。
 * 已在交付报告里建议给 src 关键块补 data-testid（见报告）。
 *
 * 确定性前提（探索实测）：
 *  - 第三方 Cookiebot 同意弹窗（#CybotCookiebotDialog，consent.cookiebot.com）会**非
 *    确定性**地浮层拦截点击 → 在 spec 内 route-abort 该三方脚本（mockBackend 只拦
 *    novita.ai + 同源 /api/*，不碰它），消除浮层、保证交互可点。
 *  - 展开交互依赖 React 水合完成（"Login with Email" 是 form 内 submit 型 <button>，
 *    水合前点击会触发原生表单提交→ ?导航丢状态）；故点击前 waitForLoadState("networkidle")
 *    等水合稳定（实测 4/4 可靠、无导航）。
 */

/** 阻断第三方同意弹窗脚本，消除非确定性浮层拦截（不属于本应用后端，mockBackend 不管它）。 */
const blockCookiebot = (page: Page) =>
  page.route(/cookiebot\.com/, (r) => r.abort());

/** 初始态稳定 track id（源码硬编码，非 i18n）。 */
const ID = {
  google: "main__login__login_form__google",
  github: "main__login__login_form__github",
  huggingface: "main__login__login_form__huggingface",
  showEmail: "main__login__login_form__show-email-login",
  submit: "main__login__login_form__login",
  goToSignUp: "main__login__login_form__login-go-to-signup",
};

const byId = (page: Page, id: string) => page.locator(`[id="${id}"]`);

test.describe("User Login（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, { endpoints: {} });
    await blockCookiebot(page);
  });

  test("初始态渲染三方登录入口 + 邮箱入口 + 注册链接，不弹错误边界", async ({
    page,
  }) => {
    await page.goto("/user/login", { waitUntil: "domcontentloaded" });

    // 稳定锚点：邮箱登录入口按钮（表单初始态渲染完成的信号），自带重试等待
    const showEmail = byId(page, ID.showEmail);
    await expect(showEmail).toBeVisible({ timeout: 30_000 });

    // --- 公开页：未被意外弹去登录（仍停在 /user/login） ---
    await expect(page).toHaveURL(/\/user\/login/);

    // --- 结构：3 个三方登录入口的稳定 <a/button id> 可见 ---
    await expect(byId(page, ID.google)).toBeVisible();
    await expect(byId(page, ID.github)).toBeVisible();
    await expect(byId(page, ID.huggingface)).toBeVisible();

    // --- 结构：每个三方入口都带对应 logo（<img alt>，locale 无关） ---
    await expect(page.locator('img[alt="google"]')).toBeVisible();
    await expect(page.locator('img[alt="github"]')).toBeVisible();
    await expect(page.locator('img[alt="huggingface"]')).toBeVisible();

    // --- 结构：Sign up 链接指向注册路由（href 是路由常量，非文案） ---
    const signUp = byId(page, ID.goToSignUp);
    await expect(signUp).toBeVisible();
    await expect(signUp).toHaveAttribute("href", /\/user\/register/);

    // --- 初始态下邮箱/密码输入框尚未展开（isShowEmailLogin=false） ---
    await expect(page.locator("#email")).toHaveCount(0);
    await expect(page.locator("#password")).toHaveCount(0);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("点 Login with Email 展开邮箱表单：出现 email/password 输入框 + 提交按钮，入口按钮消失", async ({
    page,
  }) => {
    await page.goto("/user/login", { waitUntil: "domcontentloaded" });

    const showEmail = byId(page, ID.showEmail);
    await expect(showEmail).toBeVisible({ timeout: 30_000 });

    // 等水合稳定再交互——否则 submit 型按钮的点击在水合前会触发原生表单提交、丢状态
    await page.waitForLoadState("networkidle").catch(() => {});

    await showEmail.click();

    // 展开后：email + password 输入框 + 提交按钮出现（LabelInput name→id）
    const email = page.locator("#email");
    await expect(email).toBeVisible({ timeout: 10_000 });
    const pwd = page.locator("#password");
    await expect(pwd).toBeVisible();
    await expect(byId(page, ID.submit)).toBeVisible();

    // 入口按钮翻转消失（isShowEmailLogin=true → !isShowEmailLogin 分支不再渲染）
    await expect(showEmail).toHaveCount(0);

    // 受控输入：填值后回显，password 字段类型为 password（默认隐藏）
    await email.fill("e2e@example.com");
    await pwd.fill("e2e-not-a-real-secret");
    await expect(email).toHaveValue("e2e@example.com");
    await expect(pwd).toHaveValue("e2e-not-a-real-secret");
    await expect(pwd).toHaveAttribute("type", "password");

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("服务端 notice 分支：?notice_type=active 渲染 notice 区块，plain 页不渲染", async ({
    page,
  }) => {
    // FormNotice 由 searchParams 服务端渲染（无 XHR、无水合竞争）：notice 区块的
    // CSS-module 稳定类前缀作为 locale 无关锚点。
    const noticeBlock = page.locator('[class*="LoginForm_notice__"]');

    // plain 页：无 notice 区块（对照基线）
    await page.goto("/user/login", { waitUntil: "domcontentloaded" });
    await expect(byId(page, ID.showEmail)).toBeVisible({ timeout: 30_000 });
    await expect(noticeBlock).toHaveCount(0);

    // 带 notice_type=active：服务端渲染出 notice 区块
    await page.goto("/user/login?notice_type=active&email=e2e%40example.com", {
      waitUntil: "domcontentloaded",
    });
    await expect(byId(page, ID.showEmail)).toBeVisible({ timeout: 30_000 });
    await expect(noticeBlock.first()).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
