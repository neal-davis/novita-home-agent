import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/templates（GPU 实例模板列表，客户端取数页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 覆盖那个），而是断言**确定性行为**：
 * 列表态按 fixture 出 N 张模板卡 + 工具栏渲染 + 分页出现 + 卡片内容（name/ID/image/
 * channel）正确；空态切到 DataEmpty（NoData）、无卡片、无分页；两态都未被弹去登录、
 * 不触发错误边界。
 *
 * 渲染契约（读 src 实测确认）：
 *  - page.tsx（src/app/gpus-console/templates/page.tsx）是 async server component，但取数全在
 *    客户端：components/section.tsx 是 "use client"，挂载后 useEffect→getTemplateData()→
 *    reqGetTemplates()（GET /api/v1/templates 的 XHR，可被 page.route 拦截）。
 *    实测请求：/api/v1/templates?pageNum=1&pageSize=12&name=&channels=private&...
 *  - reqGetTemplates 返回形状 { template: TemplateItem[], total }（见 section.tsx
 *    setTemplateList(res || { template: [], total: 0 })）。
 *  - 分支：templateList.template.length === 0 → <DataEmpty/>（NoData，默认 title="No Data"
 *    + <img alt="no data">）；length > 0 → 每条渲染一张 [class*='cardFlexContainer'] 卡，
 *    卡内有 item.name / "ID: {item.Id}" / item.image / item.startCommand / channel 标签。
 *  - 分页（MyTablePagination「Rows per page」）仅在 total > 0 时渲染。
 *  - 工具栏「+ New Template」按钮（[class*='addBtnTxt'] 文案 span）与 searchArea 在两态都渲染
 *    （在 loading/empty 分支之外），故用它做「页面主体渲染完成」的稳定锚点。
 *  - 渲染前提：Header 挂载 dispatch fetchUserInfo()；fixture uuid 存在 + teams:[]
 *    → currentTeam=null（TeamMemberSelector 分支关闭，不影响列表加载）。
 *
 * 选择器纪律：无 i18n 文案断言。锚点用稳定语义 class（[class*='subContainer'] /
 * [class*='cardFlexContainer'] / [class*='addBtnTxt'] / [class*='no_data_text']，
 * 均为 CSS-module 哈希前缀，跨 EN/ZH 构建不变）+ 卡片内合成 ID/名（fixture 占位符，非 i18n）。
 * 「No Data」是 NoData 组件默认字面量（title="No Data"，非 i18n 目录），但仍优先 class 锚点。
 * 工具栏「+ New Template」按钮 getByRole("button") 取不到可访问名（文案在内层 span，实测 0），
 * 故未用角色锚点——已在交付报告建议给该按钮补 data-testid。
 */

const SUB_CONTAINER = "[class*='subContainer']";
const TEMPLATE_CARD = "[class*='cardFlexContainer']";
const TOOLBAR_ADD_BTN = "[class*='addBtnTxt']"; // 「+ New Template」文案 span，两态都在
const EMPTY_NO_DATA = "[class*='no_data_text']"; // DataEmpty/NoData 标题 <p>

const baseEndpoints = {
  "/v1/user/info": loadFixture("gpus-console-templates-user-info.json"),
};

test.describe("GPU Console Templates（hermetic）", () => {
  test("列表态：按 fixture 渲染 N 张模板卡 + 工具栏 + 分页，卡片内容正确，未弹登录、不崩", async ({
    page,
  }) => {
    const list = loadFixture<{ template: unknown[]; total: number }>(
      "gpus-console-templates-list.json",
    );
    const expectedRows = list.template.length; // 3

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/api/v1/templates": list,
      },
    });
    await page.goto("/gpus-console/templates");

    // 稳定锚点：工具栏「+ New Template」文案 span（客户端 fetch + Section 渲染完成的信号）。
    const toolbar = page.locator(TOOLBAR_ADD_BTN);
    await expect(toolbar).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- Section 容器渲染 ---
    await expect(page.locator(SUB_CONTAINER)).toHaveCount(1);

    // --- 列表按 fixture 出行：每条一张卡，命中数 == 模板数 ---
    await expect(page.locator(TEMPLATE_CARD)).toHaveCount(expectedRows);

    // --- 空态不应出现（NoData 标题不存在） ---
    await expect(page.locator(EMPTY_NO_DATA)).toHaveCount(0);

    // --- 代表性内容：每条 fixture 合成名 + "ID: {Id}" 渲染进卡片（非 i18n 文案） ---
    await expect(
      page.getByText("e2e-template-pytorch", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/tmpl-aaaa1111/).first()).toBeVisible();
    // community channel 分支的卡也出行（覆盖 channel 标签三分支之一）
    await expect(
      page.getByText("e2e-template-vllm-community", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/tmpl-cccc3333/).first()).toBeVisible();

    // --- 分页：total > 0 → MyTablePagination「Rows per page」出现 ---
    await expect(page.getByText(/Rows per page/).first()).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空态：无模板时切到 DataEmpty（NoData），无卡片、无分页、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/api/v1/templates": loadFixture(
          "gpus-console-templates-list-empty.json",
        ),
      },
    });
    await page.goto("/gpus-console/templates");

    // 工具栏在两态都渲染，先等它出现（页面主体加载完成的信号），再做空态负向断言。
    await expect(page.locator(TOOLBAR_ADD_BTN)).toBeVisible({
      timeout: 30_000,
    });

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 切到 DataEmpty：NoData 标题渲染（稳定 class 锚点） ---
    await expect(page.locator(EMPTY_NO_DATA)).toHaveCount(1);

    // --- 无模板卡、无分页（pagination 仅 total>0 渲染） ---
    await expect(page.locator(TEMPLATE_CARD)).toHaveCount(0);
    await expect(page.getByText(/Rows per page/)).toHaveCount(0);

    // --- Section 容器仍在（区别于整页崩溃/白屏） ---
    await expect(page.locator(SUB_CONTAINER)).toHaveCount(1);

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
