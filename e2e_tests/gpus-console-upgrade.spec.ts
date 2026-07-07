import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/upgrade（gpus-console SPA 外壳下的占位/桩路由）。
 *
 * 路由架构（读 src 实测确认，是本路由的关键非显然处）：
 *  - upgrade/page.tsx 本身是 `return <></>`（空 fragment）。实际内容由 gpus-console/layout.tsx
 *    接管：layout 渲染 ConsoleHeaderWrapper（侧边导航 + 顶栏）+ gpus-console/page.tsx
 *    （Main SPA）+ GlobalNotice，**完全忽略 route 的 children**。所以每个 gpus-console/* 子路由
 *    都挂同一个 Main SPA。
 *  - ContextWrapper 用 window.location.pathname 取 segments[1] 作为 func；本路由 func="upgrade"。
 *    Main.tsx 把 func 在 createFuncsNew()（funcs.ts 硬编码列表）里按 link 匹配——**没有
 *    /gpus-console/upgrade 这一项**，故 curFunc 始终 undefined，Main 的 body_content
 *    （`.gpu-container-content`）渲染为空（switch 落到 default: <></>，且 curFunc 守卫全 false）。
 *    实测 .gpu-container-content innerHTML 长度为 0。这是本路由区别于 /explore /instances 等
 *    "真" console 页（那些 body 被 playground 内容填满）的**定义性分支**。
 *  - ConsoleHeaderWrapper 的页标题来自 useSideNavigationItems 里匹配当前 path 的项；本路由
 *    无匹配 → consolePageTitle="" → 顶栏标题 [class*='Header_page_title'] 不渲染（实测 count 0）。
 *  - 本路由不是硬服务端重定向：未登录也渲染外壳、不弹 /login（客户端 SPA，登录态由组件软门禁）。
 *
 * 抓取素材：verify/gpus-console-upgrade-captured.json 只含 /v3/stripe/promotion（全局头部
 *  促销组件消费，非本页；抓到的是 valid:false 的非活跃促销）。本页**无自有数据端点**，
 *  故按「桩路由结构 + GlobalNotice 弹窗分支」断言，不断列表行数。
 *
 * GlobalNotice 分支（globalNotice/index.tsx，确定性数据驱动，实测）：
 *  - 仅当 token cookie 存在 且 localStorage.gpuGlobalNotice3 !== "1" 时弹窗 open。
 *  - 弹窗 OK 按钮带稳定 analytics id `#main__gpus-console__notice-dialog__close`
 *    （CLICK_BTN_IDs.GPUS_CONSOLE.NOTICE_DIALOG_CLOSE = "main__gpus-console__notice-dialog__close"）。
 *  - 点 OK → setOpen(false) + localStorage.setItem("gpuGlobalNotice3","1")（实测 null→"1"）。
 *
 * 选择器纪律：无 i18n 文案断言。锚点全是稳定结构锚：console 外壳稳定 class
 *  (.console-side-navigation)、page.tsx 硬编码字面量 class (.gpu-container-content)、
 *  GlobalNotice 稳定 analytics id (#main__gpus-console__notice-dialog__close)、
 *  错误边界 role+name。GlobalNotice 标题/正文是源码硬编码英文字面量（非 i18n 目录），
 *  但本 spec 刻意不依赖其文案，只用 OK 按钮的稳定 id。
 */

const SIDE_NAV = ".console-side-navigation";
const BODY_CONTENT = ".gpu-container-content";
const NOTICE_OK = "#main__gpus-console__notice-dialog__close";
const PAGE_TITLE = "[class*='Header_page_title']";

const ENDPOINTS = {
  "/v1/user/info": loadFixture("gpus-console-upgrade-user-info.json"),
  "/v3/stripe/promotion": loadFixture("gpus-console-upgrade-promotion.json"),
};

const errorBoundary = (page: import("@playwright/test").Page) =>
  page.getByRole("heading", { name: "Error", exact: true });

test.describe("GPU Console Upgrade（hermetic）", () => {
  test("登录态：console 外壳渲染、SPA body 为空（桩路由）、GlobalNotice 弹窗可开关，未弹登录、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
    await page.goto("/gpus-console/upgrade");

    // --- console 外壳渲染（侧边导航是「外壳已挂载」的稳定锚点） ---
    await expect(page.locator(SIDE_NAV)).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功 + uuid） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 桩路由定义性分支：SPA body 内容区存在但为空（无 func 匹配 → 无 playground 内容）。
    //     断言 .gpu-container-content 无任何直接子元素——真 console 页（explore/instances）
    //     这里会被 playground 填满，故此断言是数据驱动、有牙的（见下个用例的对照非负向证明）。
    await expect(page.locator(BODY_CONTENT)).toHaveCount(1);
    await expect(page.locator(`${BODY_CONTENT} > *`)).toHaveCount(0);
    // 顶栏页标题不渲染（无匹配侧边导航项 → consolePageTitle 为空）
    await expect(page.locator(PAGE_TITLE)).toHaveCount(0);

    // --- GlobalNotice 分支：token 存在 + localStorage 未置位 → 弹窗 open，OK 按钮可见 ---
    const okBtn = page.locator(NOTICE_OK);
    await expect(okBtn).toBeVisible({ timeout: 20_000 });

    // 关闭前 localStorage 未置位
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("gpuGlobalNotice3")))
      .toBeNull();

    // 点 OK → 弹窗关闭（OK 按钮脱离 DOM）+ localStorage 置 "1"（交互分支，有副作用断言）
    await okBtn.click();
    await expect(okBtn).toHaveCount(0, { timeout: 10_000 });
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("gpuGlobalNotice3")))
      .toBe("1");

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(errorBoundary(page)).toHaveCount(0);
  });

  test("登录态 + localStorage 已置位：GlobalNotice 不弹（负向分支），外壳照常渲染、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
    // 导航前预置 localStorage 标志 → GlobalNotice 的 open 条件不成立
    await page.addInitScript(() => {
      try {
        localStorage.setItem("gpuGlobalNotice3", "1");
      } catch {
        /* noop */
      }
    });
    await page.goto("/gpus-console/upgrade");

    // 外壳照常挂载（先等到稳定锚点再做负向断言，避免抢跑）
    await expect(page.locator(SIDE_NAV)).toBeVisible({ timeout: 30_000 });
    await expect(page).not.toHaveURL(/\/login/);

    // 弹窗不出现（OK 按钮不渲染）——证明上个用例的弹窗断言由 localStorage 数据驱动、非恒真
    await expect(page.locator(NOTICE_OK)).toHaveCount(0);

    // body 仍为空（桩路由与 localStorage 无关）
    await expect(page.locator(BODY_CONTENT)).toHaveCount(1);
    await expect(page.locator(`${BODY_CONTENT} > *`)).toHaveCount(0);

    await expect(errorBoundary(page)).toHaveCount(0);
  });

  test("未登录态：console 外壳仍渲染、不弹登录、GlobalNotice 不弹（无 token）、不崩", async ({
    page,
  }) => {
    // 不 seedAuth：无 token cookie
    await mockBackend(page, { endpoints: ENDPOINTS });
    await page.goto("/gpus-console/upgrade");

    // 外壳仍渲染（本路由非硬服务端重定向）
    await expect(page.locator(SIDE_NAV)).toBeVisible({ timeout: 30_000 });
    // 不被弹去登录页
    await expect(page).not.toHaveURL(/\/login/);

    // 无 token → GlobalNotice 不弹（token 守卫分支，与 localStorage 分支互补）
    await expect(page.locator(NOTICE_OK)).toHaveCount(0);

    // body 仍为空
    await expect(page.locator(BODY_CONTENT)).toHaveCount(1);
    await expect(page.locator(`${BODY_CONTENT} > *`)).toHaveCount(0);

    await expect(errorBoundary(page)).toHaveCount(0);
  });
});
