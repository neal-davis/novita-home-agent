import { test, expect, type Locator, type Page } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/user/register（公开注册表单页）。
 *
 * 页面类型：page.tsx 是 server component 但**不取任何后端数据**（仅读 headers 取
 * searchParams）；SignupForm 是 "use client"，挂载后也不发 XHR（register 仅在提交时触发）。
 * 因此 verify 抓取产物为空字典 `{}`——无数据端点可注入，断言对象是**表单结构 / 交互分支 /
 * 客户端校验**，而非数据行。这正是「抓取端点为 0 → 断言关键结构 + 表单字段 + 分支」的合格深度。
 *
 * 不 seedAuth：这是公开页，种假 token 反而可能把会话带向 console。以**未登录态**断言。
 *
 * 渲染前提：
 *  - mockBackend 仍挂上（endpoints:{}）以保证 hermetic——拦掉一切真实后端/三方打点
 *    （含 challenges.cloudflare 的 turnstile 脚本走 204），消除环境噪音、提速、确定化。
 *    页面初始无 XHR，故空 endpoints 足够；不依赖任何 fixture 数据。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。全部锚点 locale 无关：
 *  - 稳定 id：第三方注册按钮 / 「Create with an Email」开关 / 「Log in」链接 / 提交按钮，
 *    均来自源码硬编码的分析 track id（CLICK_BTN_IDs.USER.*，经 id={...} 落到 DOM）：
 *      main__login__signup_form__{google,github,huggingface,show-email-signup,signup,signup-go-to-login}
 *  - 表单输入稳定 id：LabelInput / PasswordStrengthInput 把 name 当 <input id>，
 *    故 #email / #password / #invite-code。
 *  - 结构信号：左栏 logo <img alt="logo">、校验错误的 div.text-red-500（出现/消失），
 *    Log in 链接的 href=/user/login（makeLoginRegisterUrl 在无 invite/campaign 参数时返回裸路径）。
 *
 * ⚠ dev-server 水合时序：注册按钮由 SSR HTML 立即可见，但 React 把 onClick 挂上需数秒
 *   （dev 懒编译客户端 chunk，实测 ~3s）。单次 .click() 若落在水合前是 no-op 且不会自动重试，
 *   故用 clickUntil()——重试点击直到后置条件成立（参见 admin 范式：重试动作而非只重试断言）。
 *   这不是 bug：足够等待后交互必成（已实测 login 兄弟页同样特征）。
 */

const ID = {
  google: "main__login__signup_form__google",
  github: "main__login__signup_form__github",
  huggingface: "main__login__signup_form__huggingface",
  showEmail: "main__login__signup_form__show-email-signup",
  submit: "main__login__signup_form__signup",
  goToLogin: "main__login__signup_form__signup-go-to-login",
};

const byId = (page: Page, id: string) => page.locator(`[id="${id}"]`);

/**
 * 重试点击 trigger，直到 expect 成立。dev 水合前的点击是 no-op、不会自动重试，
 * Playwright 的自动重试只作用于断言不作用于动作——故显式重试动作。
 */
async function clickUntil(
  trigger: Locator,
  assertion: () => Promise<void>,
  { tries = 40, gap = 500 }: { tries?: number; gap?: number } = {},
) {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    await trigger.click().catch(() => {});
    try {
      await assertion();
      return;
    } catch (e) {
      lastErr = e;
      await trigger.page().waitForTimeout(gap);
    }
  }
  throw lastErr;
}

test.describe("User Register（hermetic）", () => {
  // dev 共享 server 负载高时客户端 chunk 编译/水合可能数十秒，放宽单测超时给 clickUntil
  // 与首锚点 toBeVisible 留足重试预算（hermetic 无真实网络，超时纯由水合延迟决定）。
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // 第三方 Cookiebot CMP（consent.cookiebot.com/uc.js）会注入「We use cookies」同意弹窗，
    // 它是 fixed 覆盖层、会拦截 pointer 事件 → 阻断对注册表单的点击（实测在共享 dev server
    // 负载高时间歇出现，致 reveal 点击被吞）。它不在 mockBackend 的 ANALYTICS_HOSTS 名单内，
    // 且本仓库禁改 mockBackend.ts，故在 spec 本地 abort 掉它的脚本——同意层是环境噪音、
    // 与注册功能无关，屏蔽它让 hermetic 完全确定（与 mockBackend 204 三方打点同一思路）。
    await page.route(/cookiebot\.com/, (r) => r.abort());
    // 公开页，不 seedAuth。仍挂 mockBackend 保证 hermetic（拦真实后端 + 204 三方）。
    await mockBackend(page, { endpoints: {} });
  });

  test("公开注册页渲染表单骨架（第三方按钮 + 邮箱开关 + 登录链接），未弹意外登录、不崩", async ({
    page,
  }) => {
    await page.goto("/user/register", { waitUntil: "domcontentloaded" });

    // 稳定锚点：Google 注册按钮（SSR 即在），作为页面就位信号、自带重试。
    await expect(byId(page, ID.google)).toBeVisible({ timeout: 30_000 });

    // --- 公开页：未被弹去 login/console（停在 /user/register） ---
    await expect(page).toHaveURL(/\/user\/register/);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);

    // --- 结构：3 个第三方注册入口的稳定 id 可见 ---
    await expect(byId(page, ID.github)).toBeVisible();
    await expect(byId(page, ID.huggingface)).toBeVisible();
    // 三方按钮各自带 logo <img alt>（locale 无关），佐证三个入口各自渲染
    await expect(page.locator('img[alt="google"]')).toBeVisible();
    await expect(page.locator('img[alt="github"]')).toBeVisible();
    await expect(page.locator('img[alt="huggingface"]')).toBeVisible();

    // --- 结构：「Create with an Email」开关 + 「Log in」链接可见 ---
    await expect(byId(page, ID.showEmail)).toBeVisible();
    const loginLink = byId(page, ID.goToLogin);
    await expect(loginLink).toBeVisible();
    // 链接指向登录路由（makeLoginRegisterUrl 无 invite/campaign 参数 → 裸 /user/login）
    await expect(loginLink).toHaveAttribute("href", "/user/login");

    // --- 结构：左栏品牌 logo（PageWithBg 渲染成功的稳定锚点） ---
    await expect(page.locator('img[alt="logo"]').first()).toBeVisible();

    // --- 初始分支：邮箱表单未展开 → 邮箱/密码/提交按钮均不在 DOM ---
    await expect(page.locator("#email")).toHaveCount(0);
    await expect(page.locator("#password")).toHaveCount(0);
    await expect(byId(page, ID.submit)).toHaveCount(0);
  });

  test("交互分支：点「Create with an Email」展开邮箱注册表单（email/password/invite + 提交按钮）", async ({
    page,
  }) => {
    await page.goto("/user/register", { waitUntil: "domcontentloaded" });

    const showEmail = byId(page, ID.showEmail);
    await expect(showEmail).toBeVisible({ timeout: 30_000 });

    // 展开前：邮箱字段不存在
    await expect(page.locator("#email")).toHaveCount(0);

    // 重试点击（容忍 dev 水合延迟），直到邮箱输入出现
    await clickUntil(showEmail, async () => {
      await expect(page.locator("#email")).toBeVisible({ timeout: 1000 });
    });

    // 展开后：三个表单字段 + 提交按钮均出现（稳定 id）
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#invite-code")).toBeVisible();
    await expect(byId(page, ID.submit)).toBeVisible();
    // 字段标签 <label for>（结构，非文案）
    await expect(page.locator("label[for='email']")).toBeVisible();
    await expect(page.locator("label[for='password']")).toBeVisible();
    // 开关按钮被替换掉（isShowEmailRegister=true 后不再渲染该按钮）
    await expect(showEmail).toHaveCount(0);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("客户端校验分支：展开后输入非法邮箱并失焦 → 出现校验错误，纠正后消失", async ({
    page,
  }) => {
    await page.goto("/user/register", { waitUntil: "domcontentloaded" });

    const showEmail = byId(page, ID.showEmail);
    await expect(showEmail).toBeVisible({ timeout: 30_000 });
    await clickUntil(showEmail, async () => {
      await expect(page.locator("#email")).toBeVisible({ timeout: 1000 });
    });

    const email = page.locator("#email");
    // 校验前：无错误提示 div
    await expect(page.locator("div.text-red-500")).toHaveCount(0);

    // 输入非法邮箱并失焦 → onBlur 触发 validateForm("email")，渲染 div.text-red-500
    // （断言「错误提示出现」这一结构信号，不断言其 i18n 无关的硬编码文案）
    await email.fill("not-an-email");
    await email.blur();
    await expect(page.locator("div.text-red-500").first()).toBeVisible();
    // 输入框进入 error 态（status==="error" → !border-red-500）
    await expect(email).toHaveClass(/border-red-500/);

    // 纠正为合法邮箱并失焦 → 错误提示消失
    await email.fill("e2e-user@example.com");
    await email.blur();
    await expect(page.locator("div.text-red-500")).toHaveCount(0);

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
