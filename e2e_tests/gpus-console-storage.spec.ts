import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/storage（Network Volume 列表，客户端取数页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 覆盖那个），而是断言**确定性行为**：
 * 列表态按 fixture 出 N 张存储卡 + 卡片渲染出 storageName/storageId；空态切到 DataEmpty
 * （NoData）且无卡片；两态都未被弹去登录、不触发错误边界。
 *
 * 渲染契约（读 src 实测确认，src/app/gpus-console/storage/）：
 *  - page.tsx 是 server component，取数全在客户端：components/section.tsx 是 "use client"，
 *    挂载即无条件 getTableData(1) → reqGetStorage()（GET /api/v1/networkstorages/list 的 XHR，
 *    可被 page.route 拦截，mockBackend 按 pathname 片段 "/networkstorages/list" 命中）。
 *    与 instances 不同，这里不读 Redux uuid 守卫——但仍 seedAuth + mock /v1/user/info 让
 *    Header 进登录态、不弹 /login。fixture teams:[] → currentTeam=null → 走个人版布局
 *    （无 TeamMemberSelector、无 Creator/Create Time 块）。
 *  - reqGetStorage 契约（storage.ts）：res.data: Storage[]、res.total。Section 分支：
 *    !tableLoading && total > 0 → 渲染卡片列表；total === 0 → <DataEmpty>（NoData，
 *    img[alt="no data"]）；loading 期 → <ContentSkeleton>。
 *  - 每张卡有一个 Deploy 按钮 id=CLICK_BTN_IDs.GPUS_CONSOLE.STORAGE_DEPLOY
 *    （= "main__gpus-console__storage__deploy"）。该 id 每卡渲染一次 →
 *    locator("#main__gpus-console__storage__deploy") 命中数 == 存储行数（实测 3→3 / 空→0），
 *    是干净的「行数」锚点。
 *  - Section 根容器是稳定语义 class [class*='subContainer']（两态都在，区别于「页面没渲染」）。
 *
 * 选择器纪律：无 i18n 文案断言。锚点用稳定 id（#main__gpus-console__storage__deploy）、
 * 稳定语义 class（[class*='subContainer']）、img[alt='no data'] 属性，以及 fixture 合成
 * storageName/storageId（合成串，非 i18n 目录）。
 * 卡片本身无 data-testid（见交付报告「建议补 data-testid」），故用 Deploy 按钮 id 数行。
 *
 * 注：Header 的 notices/messages 侧挂件会打到本测兜底 {code:0,data:{}} 的端点、其 .forEach/.map
 * 在兜底壳上抛错——但被 catch（仅 console.error，未 throw），页面照常渲染、错误边界不触发，
 * 与 instances/billing 等兄弟 spec 一致，属预期 mock 噪音，不影响存储页断言。
 */

const STORAGE_LIST_PATH = "/networkstorages/list";
const DEPLOY_BTN = "#main__gpus-console__storage__deploy";
const SECTION = "[class*='subContainer']";
const NO_DATA_IMG = "img[alt='no data']";

const baseEndpoints = {
  "/v1/user/info": loadFixture("gpus-console-storage-user-info.json"),
};

test.describe("GPU Console Storage（hermetic）", () => {
  test("列表态：按 fixture 渲染 N 张存储卡 + 卡片内容，未弹登录、不崩", async ({
    page,
  }) => {
    const list = loadFixture<{ data: unknown[]; total: number }>(
      "gpus-console-storage-list.json",
    );
    const expectedRows = list.data.length; // 3

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: { ...baseEndpoints, [STORAGE_LIST_PATH]: list },
    });
    await page.goto("/gpus-console/storage");

    // 稳定锚点：客户端 fetch 完成 + 卡片渲染后，每卡一个 Deploy 按钮。
    // 先等首个 Deploy 按钮可见（渲染完成信号），再做后续断言，避免 loading 期抢跑。
    const deployBtns = page.locator(DEPLOY_BTN);
    await expect(deployBtns.first()).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- Section 容器渲染（区别于「页面没起来」） ---
    await expect(page.locator(SECTION)).toHaveCount(1);

    // --- 列表按 fixture 出行：每卡一个 Deploy 按钮，命中数 == 存储行数 ---
    await expect(deployBtns).toHaveCount(expectedRows);

    // --- 列表态不出空态占位 ---
    await expect(page.locator(NO_DATA_IMG)).toHaveCount(0);

    // --- 代表性内容：fixture 合成 storageName / storageId 渲染进卡片（非 i18n 文案） ---
    await expect(
      page.getByText("e2e-volume-alpha", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("e2e-volume-gamma", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("stor-e2e-aaaa1111").first()).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空态：无存储时切到 DataEmpty（NoData），无卡片、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        [STORAGE_LIST_PATH]: loadFixture(
          "gpus-console-storage-list-empty.json",
        ),
      },
    });
    await page.goto("/gpus-console/storage");

    // 空态稳定锚点：DataEmpty → NoData 渲染 <img alt="no data">。
    // 先等它出现（loading→空态结算完成的信号），再做负向断言，避免 loading 期抢跑。
    await expect(page.locator(NO_DATA_IMG)).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- Section 容器仍渲染（工具栏在，只是列表为空） ---
    await expect(page.locator(SECTION)).toHaveCount(1);

    // --- 空态：无任何存储卡（Deploy 按钮数 == 0） ---
    await expect(page.locator(DEPLOY_BTN)).toHaveCount(0);

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
