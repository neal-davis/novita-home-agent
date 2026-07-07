import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/templates-library（客户端取数页）。
 *
 * 深度断言（非仅「不白屏」）：列表态按 fixture 出 N 张模板卡 + 工具栏图标结构；
 * 后端返回 0 条时切到 DataEmpty 空态（/billing/no-data.svg）；两态都不弹登录、不触发错误边界。
 *
 * 渲染契约（读 src 实测确认）：
 *  - page.tsx 是 server component，<Section dist={{}}/> 在 <Suspense> 内。
 *    components/section.tsx（"use client"）按 ?templateId 分支：无 templateId → <List/>（列表态，本 spec 覆盖）。
 *  - components/list.tsx（"use client"）挂载即 useEffect → reqGetOfficialTemplates()
 *    = GET /api/v1/official/templates（service_base_url + /api/v1，pathname 命中 captured 端点）。
 *    注意：官方模板拉取**不依赖** userInfo.uuid（仅 reqGetTemplates 私有模板那条 gate 在 uuid 上）。
 *    仍 seedAuth + mock /v1/user/info 让顶部 Header(page="console") 进登录态、不弹登录。
 *  - 取数返回 { template: [...], total, ... }。list.tsx 对 official 按 sort/collectNum/updatedAt 排序，
 *    favorite 默认 "0" → showTemplateList = templateList（无私有模板）。
 *  - 分支：showTemplateList.length>0 → 标题「All Templates(N)」+ <ItemList/>；否则 → DataEmpty（NoData）。
 *  - ItemList 包裹层 className 含 "card_container_list"（CSS module → itemList_card_container_list__xxx），
 *    每张卡是其直接子 <div>（命中数 == 模板数，实测 4→4）。卡内渲染 item.name / item.image（非 i18n）。
 *
 * 选择器纪律：无 i18n 文案断言。锚点用稳定语义 class 片段（[class*='subContainer']、
 * [class*='card_container_list']）、稳定 Lucide 图标类（svg.lucide-*，工具栏结构）、稳定资源 alt
 * （img[alt='no data']，空态）。卡内 item.name/item.image 是后端业务数据（fixture 注入），非 i18n 文案。
 *
 * 已知确认（探索实测）：
 *  - 首次访问会弹全局「What's New」changelog 对话框（role=dialog），它会拦截 toolbar 点击——
 *    故本 spec 不做需点击工具栏/tab 的交互，只断言两种**数据驱动**的渲染态 + 工具栏结构存在；
 *    rendering 断言不受该 overlay 影响。SearchInput 的 onSearch debounce 因父组件 useCallback 依赖
 *    每渲染重建而被 cancel（组件级脆弱行为，非本路由职责），故也不测搜索过滤。
 *  - 列表卡 / 工具栏均无 data-testid / 稳定 id（见返回 dataTestidSuggestions）。
 */

const baseEndpoints = {
  "/v1/user/info": loadFixture("gpus-console-instances-user-info.json"),
};

const SUB_CONTAINER = '[class*="subContainer"]';
const CARD_LIST = '[class*="card_container_list"]';
const TOOLBAR_ICONS = [
  "lucide-layout-grid", // All Templates
  "lucide-shield-check", // Official
  "lucide-pen-tool", // My Creations
  "lucide-star", // My Favorites
];

test.describe("GPU Console Templates Library（hermetic）", () => {
  test("列表态：按 fixture 出 N 张模板卡 + 工具栏图标，未弹登录、不崩", async ({
    page,
  }) => {
    const list = loadFixture<{ template: { name: string; image: string }[] }>(
      "gpus-console-templates-library-list.json",
    );
    const expectedRows = list.template.length; // 4

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/api/v1/official/templates": list,
      },
    });
    await page.goto("/gpus-console/templates-library");

    // 客户端 fetch + ItemList 渲染完成的信号：卡片包裹层出现
    const cardList = page.locator(CARD_LIST);
    await expect(cardList).toHaveCount(1, { timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- Section 容器渲染 ---
    await expect(page.locator(SUB_CONTAINER)).toHaveCount(1);

    // --- 列表按 fixture 出行：每张卡是 card_container_list 的直接子 div，命中数 == 模板数 ---
    await expect(cardList.locator("> div")).toHaveCount(expectedRows);

    // --- 工具栏结构：4 个 tab 图标 + Create(+) 图标，均唯一存在于 Section 容器内 ---
    const sub = page.locator(SUB_CONTAINER);
    for (const icon of TOOLBAR_ICONS) {
      await expect(sub.locator(`svg.${icon}`)).toHaveCount(1);
    }
    await expect(sub.locator("svg.lucide-plus")).toHaveCount(1);

    // --- 代表性业务数据（fixture 注入的模板名/镜像，非 i18n 文案）渲染进卡片 ---
    await expect(
      page.getByText(list.template[0].name, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(list.template[0].image, { exact: true }).first(),
    ).toBeVisible();

    // --- 空态资源不应出现（与空态用例互斥） ---
    await expect(page.locator('img[alt="no data"]')).toHaveCount(0);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空态：后端返回 0 条时切到 DataEmpty（no-data 资源），无卡片列表、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/api/v1/official/templates": loadFixture(
          "gpus-console-templates-library-list-empty.json",
        ),
      },
    });
    await page.goto("/gpus-console/templates-library");

    // 空态稳定锚点：DataEmpty → NoData 的固定资源图（img alt="no data"，src=/billing/no-data.svg）
    const noData = page.locator('img[alt="no data"]');
    await expect(noData).toBeVisible({ timeout: 30_000 });
    await expect(noData).toHaveAttribute("src", "/billing/no-data.svg");

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- Section 容器仍渲染（工具栏存在），但无卡片列表 ---
    await expect(page.locator(SUB_CONTAINER)).toHaveCount(1);
    await expect(page.locator(CARD_LIST)).toHaveCount(0);

    // --- 工具栏图标结构在空态下仍在 ---
    const sub = page.locator(SUB_CONTAINER);
    for (const icon of TOOLBAR_ICONS) {
      await expect(sub.locator(`svg.${icon}`)).toHaveCount(1);
    }

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
