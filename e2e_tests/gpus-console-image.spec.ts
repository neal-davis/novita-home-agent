import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/image（Image Prewarm 任务列表，console 鉴权页 + 客户端取数）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 覆盖那个），而是断言**确定性行为**：
 * 列表态按 fixture 出 N 张任务卡 + 每卡渲染 imageName/Task ID/imageUrl/状态徽章；空态切到
 * NoData 且无卡片；两态都未被弹去登录、不触发错误边界。
 *
 * 渲染契约（读 src 实测确认，src/app/gpus-console/image/）：
 *  - page.tsx 是 server component；取数全在客户端：components/section.tsx 是 "use client"，
 *    挂载即调三个 GET（均可被 page.route 拦截，mockBackend 按 pathname 片段命中）：
 *      reqGpuImagePrewarm      → GET /api/v1/image/prewarm        → { total, data: Job[] }   ← 列表
 *      reqGpuImagePrewarmQuota → GET /api/v1/image/prewarm/quota  → { total, limit, perImageSize } ← 配额条
 *      reqGpuStorageBaseInfo   → GET /api/v1/gpu/storage/base_info → { clusters: [...] }      ← Region 级联
 *    端点片段顺序敏感：mockBackend 用 p.includes(frag) 首命中返回，"/image/prewarm" 是
 *    "/image/prewarm/quota" 的子串 → quota 必须排在 list **之前**注入（见 baseEndpoints 顺序）。
 *  - 登录态：seedAuth 写 token cookie + mock /v1/user/info（payload.uuid 非空 → Redux user.uuid
 *    被 setUser 置上）。fixture teams:[] → currentTeam=null → checkPermission 对所有
 *    image/template 权限返回 true → Create/Batch/Delete/Save-as-Template 控件渲染。
 *  - Section 列表分支（section.tsx）：dataInfo.data.map() 渲染每行一个 [class*='itemContainer']；
 *    !dataInfo.total → <NoData>（img[alt='no data']）。两态工具栏的 help 图标 img[src*='help.svg'] 都在。
 *  - 行内状态徽章 JobState：文案 SUCCEEDED/RUNNING/FAILED/PENDING/UNKNOWN 是组件内**硬编码**
 *    （非 i18n 目录，jobState.tsx getText 写死），可安全做内容锚点。
 *
 * 选择器纪律：无 i18n 文案断言。锚点用稳定 CSS-module 类片段（[class*='itemContainer']，
 * 行数锚点）、img 属性（img[alt='no data'] / img[src*='help.svg']）、JobState 硬编码状态文案、
 * 以及 fixture 合成的 imageName/任务 id/imageUrl（合成串，非 i18n 目录）。卡片/工具栏无 data-testid
 * （见交付报告「建议补 data-testid」），故用 itemContainer 类片段数行。
 *
 * 注：Header 的 notices/messages 侧挂件会打到本测兜底 {code:0,data:{}} 的端点、其 .forEach/.map
 * 在兜底壳上抛错——但被 catch（仅 console.error，未 throw），页面照常渲染、错误边界不触发，
 * 与 storage/instances/billing 等兄弟 spec 一致，属预期 mock 噪音，不影响本页断言。
 */

const PREWARM_QUOTA_PATH = "/image/prewarm/quota";
const PREWARM_LIST_PATH = "/image/prewarm";
const STORAGE_BASE_INFO_PATH = "/gpu/storage/base_info";

const ITEM = "[class*='itemContainer']";
const NO_DATA_IMG = "img[alt='no data']";
const HELP_IMG = "img[src*='help.svg']";

// 顺序敏感：quota 必须在 list 之前（"/image/prewarm" 是 "/image/prewarm/quota" 的子串）。
const baseEndpoints = {
  "/v1/user/info": loadFixture("gpus-console-image-user-info.json"),
  [PREWARM_QUOTA_PATH]: loadFixture("gpus-console-image-prewarm-quota.json"),
  [STORAGE_BASE_INFO_PATH]: loadFixture(
    "gpus-console-image-storage-base-info.json",
  ),
};

test.describe("GPU Console Image Prewarm（hermetic）", () => {
  test("列表态：按 fixture 渲染 N 张任务卡 + 卡片内容 + 状态徽章，未弹登录、不崩", async ({
    page,
  }) => {
    const list = loadFixture<{ data: unknown[]; total: number }>(
      "gpus-console-image-prewarm-list.json",
    );
    const expectedRows = list.data.length; // 3

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: { ...baseEndpoints, [PREWARM_LIST_PATH]: list },
    });
    await page.goto("/gpus-console/image");

    // 稳定锚点：客户端 fetch 完成 + 卡片渲染后，每任务一个 itemContainer。
    // 先等首张卡可见（渲染完成信号），再做后续断言，避免 loading 期抢跑。
    const items = page.locator(ITEM);
    await expect(items.first()).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 工具栏渲染（配额条 help 图标，区别于「页面没起来」） ---
    await expect(page.locator(HELP_IMG)).toBeVisible();

    // --- 列表按 fixture 出行：每任务一个 itemContainer，命中数 == 任务行数 ---
    await expect(items).toHaveCount(expectedRows);

    // --- 列表态不出空态占位 ---
    await expect(page.locator(NO_DATA_IMG)).toHaveCount(0);

    // --- 代表性内容：fixture 合成 imageName / 任务 id / imageUrl 渲染进卡片（非 i18n 文案） ---
    await expect(
      page.getByText("e2e-image-alpha", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("e2e-image-gamma", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("prewarm-e2e-0001")).toBeVisible();
    await expect(
      page.getByText("registry.example.com/e2e/alpha:latest"),
    ).toBeVisible();

    // --- 行内状态徽章（JobState 硬编码文案，按 fixture 的 state 字段确定性出现） ---
    await expect(page.getByText("SUCCEEDED", { exact: true })).toBeVisible();
    await expect(page.getByText("RUNNING", { exact: true })).toBeVisible();
    await expect(page.getByText("FAILED", { exact: true })).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空态：无任务时切到 NoData，无卡片，工具栏仍在、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        [PREWARM_LIST_PATH]: loadFixture(
          "gpus-console-image-prewarm-list-empty.json",
        ),
      },
    });
    await page.goto("/gpus-console/image");

    // 空态稳定锚点：NoData 渲染 <img alt="no data">。
    // 先等它出现（loading→空态结算完成的信号），再做负向断言，避免 loading 期抢跑。
    await expect(page.locator(NO_DATA_IMG)).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 工具栏仍渲染（配额条在，只是列表为空） ---
    await expect(page.locator(HELP_IMG)).toBeVisible();

    // --- 空态：无任何任务卡 ---
    await expect(page.locator(ITEM)).toHaveCount(0);

    // --- 空态不出状态徽章 ---
    await expect(page.getByText("SUCCEEDED", { exact: true })).toHaveCount(0);

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
