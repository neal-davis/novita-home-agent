import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/explore（GPU 实例创建表单页）。
 *
 * 路由架构（读 src 实测确认，是本路由的关键非显然处）：
 *  - 该路由的 explore/page.tsx 主体被注释掉了；实际内容由 gpus-console/layout.tsx →
 *    gpus-console/page.tsx → components/Main/Main.tsx 接管：Main 用 usePathname() 做客户端
 *    路由分发，对 /gpus-console/explore 用 dynamic(() => import("explore/components/section"),
 *    { ssr:false }) 客户端挂载创建表单。所以这是「客户端取数」页（page.route 可拦），
 *    不是 RSC 数据页。
 *  - section.tsx 挂载即 reqUserInfo()/reqBalanceTotal()；其 StepOne 子组件用
 *    `auth: userInfo.uuid` 发 /market/(auth/)query_options 与 /market/(auth/)products
 *    取 GPU 产品列表 + /official/templates 取模板。**uuid 必须存在** fixture 才走 auth 列表
 *    分支并渲染产品卡（user-info fixture 注入非空 uuid）。
 *  - StepOne 产品区按 `originDatas[0].canBuy` 过滤后渲染 stepOne_productContainer →
 *    有可买产品才出 container；空产品 → 不出 container 但表单外壳仍渲染。这是数据驱动分支。
 *
 * 选择器纪律：无 i18n 文案断言。锚点用稳定 analytics id（CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_*
 * → #main__gpus-console__explore__readme / __change-template，实测稳定渲染）、console 外壳
 * 稳定 class（.console-side-navigation / [class*='Header_page_title'] /
 * [class*='section_subContainer'] / [class*='stepOne_productContainer']）。
 * 唯一文案锚点是 GPU 产品规格名（"RTX 4090 24GB"，来自注入 fixture 的产品数据，非 i18n 文案）——
 * 经空产品变异测试证实它是数据驱动断言（空列表时该文本计数为 0）。
 */

const SIDE_NAV = ".console-side-navigation";
const PAGE_TITLE = "[class*='Header_page_title']";
const SECTION_CONTAINER = "[class*='section_subContainer']";
const PRODUCT_CONTAINER = "[class*='stepOne_productContainer']";
const STEPONE_FILTER = "[class*='stepOne_filterArea']";
const README_ID = "#main__gpus-console__explore__readme";
const CHANGE_TEMPLATE_ID = "#main__gpus-console__explore__change-template";

const balanceFixture = {
  code: 0,
  balance: "12345600",
  credit: "0",
  voucher: "0",
};

const baseEndpoints = () => ({
  "/v1/user/info": loadFixture("gpus-console-explore-user-info.json"),
  "/billing/balance/total": balanceFixture,
  // pathname-片段匹配：覆盖 auth 与非 auth 两个变体
  // (/market/query_options、/market/auth/query_options 都含 "/query_options")。
  "/query_options": loadFixture("gpus-console-explore-query-options.json"),
  "/official/templates": loadFixture("gpus-console-explore-templates.json"),
});

test.describe("GPU Console Explore（hermetic）", () => {
  test("有产品：创建表单挂载，产品卡按 fixture 渲染，未弹登录、不崩", async ({
    page,
  }) => {
    const products = loadFixture<{ products: { productName: string }[] }>(
      "gpus-console-explore-products.json",
    );
    // fixture 第一条产品规格名（非 i18n 文案，来自后端产品数据）
    const firstProductName = products.products[0].productName; // "RTX 4090 24GB"

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints(),
        "/products": products, // /market/products + /market/auth/products
      },
    });
    await page.goto("/gpus-console/explore");

    // --- console 外壳渲染（侧边导航 + 顶栏标题） ---
    await expect(page.locator(SIDE_NAV)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(PAGE_TITLE)).toBeVisible();

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功 + uuid） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- explore 创建表单（section.tsx）客户端挂载：稳定容器 + StepOne 过滤区 ---
    await expect(page.locator(SECTION_CONTAINER)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(STEPONE_FILTER).first()).toBeVisible();

    // --- explore 专属稳定 analytics id（readme / change-template 动作按钮）渲染 ---
    await expect(page.locator(README_ID)).toHaveCount(1);
    await expect(page.locator(CHANGE_TEMPLATE_ID)).toHaveCount(1);

    // --- 产品列表按 fixture 出卡：productContainer 可见 + 第一条产品规格名渲染 ---
    await expect(page.locator(PRODUCT_CONTAINER)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(firstProductName).first()).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空产品：表单外壳仍渲染，无产品卡，不崩（数据驱动分支，证断言有牙）", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints(),
        "/products": { products: [] },
      },
    });
    await page.goto("/gpus-console/explore");

    // 表单外壳照常挂载（StepOne 过滤区是「已加载」信号），先等到它再做空态负向断言
    await expect(page.locator(SECTION_CONTAINER)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator(STEPONE_FILTER).first()).toBeVisible();

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 空产品分支：productContainer 不渲染（canBuy 过滤后为空） ---
    await expect(page.locator(PRODUCT_CONTAINER)).toHaveCount(0);
    // 上个用例的产品规格名在空列表下不出现（证明它是数据驱动、非静态文案）
    await expect(page.getByText("RTX 4090 24GB")).toHaveCount(0);

    // --- 表单动作锚点仍在（外壳不依赖产品数据） ---
    await expect(page.locator(README_ID)).toHaveCount(1);

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
