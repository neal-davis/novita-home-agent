import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/serverless-deploy（serverless 部署向导 · 客户端取数页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 覆盖那个），而是断言**确定性行为**：
 * GPU 规格按 fixture 出 N 张卡、第一张自动选中并回填到「Selection」摘要条、提交页脚渲染；
 * 空规格态退化为「容器在但 0 卡」且不崩；两态都未被弹去登录、不触发错误边界。
 *
 * 渲染契约（读 src 实测确认）：
 *  - page.tsx 是 server component，但只渲染 Header/Footer + <ServerlessDeploy/>(section.tsx，
 *    "use client")。取数全在客户端：Context.tsx 挂载后 fetchData() 无条件发
 *    getEndpointSpecs()(/serverless/market/specs 的 XHR) 与 getServerlessProductPrice()
 *    (/product/price)，可被 page.route 拦截。未登录(无 Redux uuid)时只走这两个公开端点
 *    （capture 实测 :3101 未登录就是这条路径），故无需让 /v1/user/info 成功——seedAuth 仅为
 *    避免被意外弹登录。
 *  - GPUCardList: productsLoading 期出骨架；resolve 后每条 spec 渲染一张 [class*='productItem']，
 *    命中数 == specs 数（实测 3→3 / 0→0），是干净的「卡数」锚点；且 useEffect 自动 onDeploy(products[0])
 *    选中首卡。
 *  - section.tsx「Selection:」摘要条回填选中卡的 gpu_name —— 首卡 gpu_name 因此在页面出现两次
 *    （卡内 + 摘要条），是「自动选中首卡」这一行为的可断言信号。
 *  - ⚠ 陷阱：addEndpoint.tsx 挂载即 reqGetStorage()(/networkstorages/list)，把 res.data 当数组
 *    .map()。mockBackend 兜底 {code:0,data:{}} 会让 data={} → .map 抛错 → 触错误边界(实测)。
 *    故 /networkstorages/list 必须显式注入「data 为数组」的壳 fixture。已做变异测试：把该 fixture
 *    换成 {} 时本 spec FAIL（错误边界出现），证明断言有牙。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点为稳定语义 class 片段（[class*='productItem']/
 * [class*='productContainer']）+ section.tsx/gpuCardList.tsx 里**源码硬编码的 JSX 字面量**
 * （"Select GPU Type" / "Selection:" / "On Demand" / "NVIDIA"，非 t() 目录键，locale 无关——
 * 同 console-pricing-console 断言硬编码 <th>Specification 的范式）+ fixture 注入的具体 gpu_name。
 * 卡片无 data-testid（见交付报告「建议补 data-testid」）。
 */

const SPECS = "/serverless/market/specs";
const PRODUCT_PRICE = "/product/price";
const NETWORK_STORAGES = "/networkstorages/list";

const PRICE_FIX = "gpus-console-serverless-deploy-product-price.json";
const STORAGE_FIX = "gpus-console-serverless-deploy-networkstorages.json";

const CARD = "[class*='productItem']";
const CARD_CONTAINER = "[class*='productContainer']";

const NO_ERROR_BOUNDARY = async (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("GPU Console Serverless Deploy（hermetic）", () => {
  test("数据态：按 fixture 渲染 N 张 GPU 规格卡，首卡自动选中并回填 Selection、提交页脚渲染，未弹登录、不崩", async ({
    page,
  }) => {
    const specs = loadFixture<{ specs: { gpu_name: string }[] }>(
      "gpus-console-serverless-deploy-specs.json",
    );
    const expectedCards = specs.specs.length; // 3
    const firstGpuName = specs.specs[0].gpu_name; // "H100 SXM 80GB"

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        [SPECS]: specs,
        [PRODUCT_PRICE]: loadFixture(PRICE_FIX),
        [NETWORK_STORAGES]: loadFixture(STORAGE_FIX),
      },
    });
    await page.goto("/gpus-console/serverless-deploy");

    // 稳定锚点：GPU 卡容器（客户端 fetch + GPUCardList 渲染完成、骨架退场的信号），自带重试等待。
    const container = page.locator(CARD_CONTAINER);
    await expect(container).toBeVisible({ timeout: 30_000 });

    // --- 未被意外弹去登录（serverless-deploy 是 console 路由；seedAuth 后应留在原路由） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 确定性数据：每条 spec 一张卡 → 命中数 == fixture specs 数 ---
    await expect(page.locator(CARD)).toHaveCount(expectedCards);

    // --- 代表性数据值：三个 gpu_name 各自渲染进卡片（fixture 注入，非 i18n） ---
    await expect(page.getByText("RTX 5090", { exact: true })).toBeVisible();
    await expect(page.getByText("L40S", { exact: true })).toBeVisible();

    // --- 卡片结构：每卡硬编码 "NVIDIA" 品牌标 + "On Demand" 计价行（源码 JSX 字面量，非 i18n） ---
    await expect(page.getByText("NVIDIA", { exact: true })).toHaveCount(
      expectedCards,
    );
    await expect(page.getByText("On Demand", { exact: true })).toHaveCount(
      expectedCards,
    );

    // --- 行为：首卡自动选中(onDeploy(products[0]))→「Selection:」摘要条回填首卡 gpu_name。
    //     故首卡 gpu_name 在页面出现 ≥2 次（卡内 + 摘要条），是「自动选中首卡」的可断言信号。 ---
    await expect(page.getByText("Selection:", { exact: true })).toBeVisible();
    await expect(page.getByText(firstGpuName, { exact: true })).toHaveCount(2);

    // --- 提交页脚渲染（section.tsx 的 CommitFooter，带稳定 data 属性） ---
    await expect(page.locator("[data-commit-footer]")).toHaveCount(1);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await NO_ERROR_BOUNDARY(page);
  });

  test("空规格态：specs 为空时容器仍在但 0 卡，结构(标题/Selection/页脚)不崩、未弹登录", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        [SPECS]: loadFixture("gpus-console-serverless-deploy-specs-empty.json"),
        [PRODUCT_PRICE]: loadFixture(PRICE_FIX),
        [NETWORK_STORAGES]: loadFixture(STORAGE_FIX),
      },
    });
    await page.goto("/gpus-console/serverless-deploy");

    // 结构锚点：「Select GPU Type」section 标题（section.tsx 硬编码 JSX 字面量，非 i18n），
    // 加载完成后即可见——空规格不影响外层结构渲染。
    await expect(
      page.getByText("Select GPU Type", { exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 空态：容器渲染但 0 张卡（区别于数据态的 3 张），证明列表受 fixture 驱动 ---
    await expect(page.locator(CARD_CONTAINER)).toHaveCount(1);
    await expect(page.locator(CARD)).toHaveCount(0);

    // --- 外层结构仍完整：Selection 摘要条 + 提交页脚都在（空 specs 不致结构崩塌） ---
    await expect(page.getByText("Selection:", { exact: true })).toBeVisible();
    await expect(page.locator("[data-commit-footer]")).toHaveCount(1);

    // --- 不触发错误边界 ---
    await NO_ERROR_BOUNDARY(page);
  });
});
