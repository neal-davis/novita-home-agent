import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/jobs（GPU 控制台 Jobs 路由）。
 *
 * 渲染契约（读 src 实测确认 — 这是本路由与其它 console 页的关键差异）：
 *  - src/app/gpus-console/jobs/page.tsx 是「壳页」：只渲染 <Header page="console"> + <Footer>，
 *    真正的 Jobs 表格 <Section/>（components/section.tsx → mainTable.tsx，里面才有
 *    reqGetJobs/搜索/筛选/分页/Logs/StopJob）在源码里被 JSX 注释掉了（page.tsx 第 14 行
 *    的 Section 被包在 JSX 块注释里）。所以此路由当前**不渲染任何 jobs 数据表**，也不发
 *    /gpu/job 类 XHR——抓取文件里没有 jobs 端点正因如此。
 *  - 实际渲染树 = layout.tsx 的 <ConsoleHeaderWrapper product="gpus">（左侧 SideNavigation +
 *    顶部 console Header）包住壳页。因此「深度」断言落在**真正会渲染的 console 框架**上：
 *    侧边导航存在、Jobs 导航项被标为 active（证明路由被识别）、console header 存在、
 *    且 /gpus-console/jobs 在 LOGIN_REQUIRED_URL 中——未登录会被 useHeaderAuth 弹去
 *    /user/login，已登录则停留。两态都覆盖。
 *
 * 鉴权前提：
 *  - seedAuth 注入 token cookie + mock /v1/user/info（uuid 存在、teams:[]）→ 视作已登录会话，
 *    不被弹去 /user/login。
 *  - 不 seedAuth → useHeaderAuth 检测 LOGIN_REQUIRED_URL 命中 + 无 token → router.push 到
 *    /user/login?redirect=%2Fgpus-console%2Fjobs（实测立即触发，稳定）。
 *
 * 选择器纪律：**绝不断言 i18n 文案**（侧栏 Jobs 标题经 __t() 管线，文字会随 EN/ZH 变体碎）。
 * 锚点全部 locale 无关：
 *  - 侧边导航容器稳定 class `.console-side-navigation`（ConsoleHeaderWrapper 硬编码）。
 *  - 侧栏导航项是 <a href>，href 为确定性路由路径（/gpus-console/jobs 等，与文案无关）。
 *  - active 态用稳定 class 片段 [class*="active"]（CSS Module 哈希前的语义名）。
 *  - 错误边界 src/app/error.tsx → <h1>Error</h1>，用 role+exact name 断言不存在。
 *
 * data-testid 建议（见交付报告）：壳页本身无业务锚点；侧边导航项 / console header 标题区
 * 无 data-testid，目前靠 href + 稳定 class 锚定。
 */

const ROUTE = "/gpus-console/jobs";
const SIDE_NAV = ".console-side-navigation";
const JOBS_NAV_LINK = `${SIDE_NAV} a[href$="/gpus-console/jobs"]`;
const ACTIVE_NAV_LINK = `${SIDE_NAV} a[class*="active"]`;

const ENDPOINTS = {
  "/v1/user/info": loadFixture("gpus-console-jobs-user-info.json"),
  "/v3/stripe/promotion": loadFixture("gpus-console-jobs-promotion.json"),
};

test.describe("GPU Console Jobs（hermetic）", () => {
  test("已登录：渲染 console 框架（侧栏 + header），Jobs 导航项 active，未弹登录、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
    await page.goto(ROUTE);

    // 稳定锚点：侧边导航容器（ConsoleHeaderWrapper 渲染完成的信号），自带重试等待。
    const sideNav = page.locator(SIDE_NAV);
    await expect(sideNav).toHaveCount(1, { timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功）：仍停在 jobs 路由 ---
    await expect(page).not.toHaveURL(/\/user\/login/);
    await expect(page).toHaveURL(/\/gpus-console\/jobs/);

    // --- 顶部 console Header 渲染（登录态 chrome） ---
    await expect(page.locator("header")).toHaveCount(1);

    // --- 侧边导航里存在唯一一条 Jobs 导航项（href 确定性，非 i18n 文案） ---
    await expect(page.locator(JOBS_NAV_LINK)).toHaveCount(1);

    // --- 路由被识别：侧栏唯一的 active 项就是 Jobs（active 态由 businessPathname 匹配驱动） ---
    const activeLinks = page.locator(ACTIVE_NAV_LINK);
    await expect(activeLinks).toHaveCount(1);
    await expect(activeLinks).toHaveAttribute("href", /\/gpus-console\/jobs$/);

    // --- 侧栏暴露 GPU console 的多条导航入口（结构完整，非只有 jobs 一条） ---
    await expect(
      page.locator(`${SIDE_NAV} a[href*="/gpus-console/"]`).first(),
    ).toBeVisible();
    expect(
      await page.locator(`${SIDE_NAV} a[href*="/gpus-console/"]`).count(),
    ).toBeGreaterThanOrEqual(3);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("鉴权门：未登录访问 jobs 被重定向到 /user/login（带 redirect 回跳），不崩", async ({
    page,
  }) => {
    // 不 seedAuth：无 token。mock 后端（仍要拦截，避免真实请求 / 三方脚本噪音）。
    await mockBackend(page, { endpoints: ENDPOINTS });
    await page.goto(ROUTE);

    // useHeaderAuth 命中 LOGIN_REQUIRED_URL + 无 token → router.push(/user/login?redirect=...)。
    // 实测立即触发；用 URL 正则 + 自带重试等待，不硬等。
    await expect(page).toHaveURL(/\/user\/login/, { timeout: 30_000 });
    // 回跳参数指回 jobs 路由（encodeURIComponent("/gpus-console/jobs")）。
    await expect(page).toHaveURL(/redirect=%2Fgpus-console%2Fjobs/);

    // 登录页本身不触发错误边界。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
