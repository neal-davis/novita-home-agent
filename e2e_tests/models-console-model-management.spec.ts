import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models-console/model-management（私有模型管理）。
 *
 * 页面结构（读 src 确认）：
 *  - page.tsx 是 async server component，仅渲染 <PermissionWrapper><PrivateModel/></PermissionWrapper>。
 *    取数发生在 client（PrivateModel/ModelTable），故 page.route 可拦截 → 本层是 fixture 注入主场。
 *  - PermissionWrapper(upload_model)：state.user.uuid 由全局 Header 的 useHeaderAuth → fetchUserInfo()
 *    → /v1/user/info 客户端 XHR 填充。fixture uuid 存在 + teams:[] → currentTeam=null →
 *    checkPermission() 返回 true（uuid 非空），渲染 PrivateModel；不依赖单独 permissions-config 端点。
 *  - PrivateModel：usePermission(billing/warning/all) 同理（currentTeam=null）返回 true；
 *    seedAuth 设了 token cookie → useSelectKeys 产出一个 key（避开 1s 后的 Type.NO_KEY）→ Type.SHOW_MODEL。
 *  - ModelTable：getModel() → GET /v3/model，读 res.models 渲染表格（mock 直接回 body，故 fixture 即 {models:[]}）。
 *
 * 选择器纪律：无 i18n 文案断言。
 *  - 模型表唯一锚点：<th> "MODEL NAME In API" —— ModelTable.tsx 源码硬编码字面量（非 i18n 目录），
 *    其祖先 <table> 即模型表（页面共 6 张表，shadcn <th> 不暴露 columnheader role，故用 xpath ancestor）。
 *  - Upload Model 按钮 / Model List 链接：id 来自 CLICK_BTN_IDs（源码硬编码分析打点 id，非 i18n）→
 *    用 id 子串 [id*="__upload-model"] / [id*="__model-list"] 定位。
 *  - 空态：NoData 组件渲染默认 title "No Data"（源码字面量，非 i18n）。
 * 已在交付报告里建议给 PrivateModel/ModelTable 补 data-testid（src 不可改）。
 */

const ENDPOINTS = {
  "/v1/user/info": loadFixture(
    "models-console-model-management-user-info.json",
  ),
  "/v3/model": loadFixture("models-console-model-management-models.json"),
  "/v3/stripe/promotion": loadFixture(
    "models-console-model-management-promotion.json",
  ),
};

const ROUTE = "/models-console/model-management";

/** 模型表定位：<th> "MODEL NAME In API" 锚点 → 其祖先 <table>（shadcn th 无 columnheader role，用 xpath）。 */
const modelTable = (page: Page) =>
  page
    .locator("th", { hasText: "MODEL NAME In API" })
    .first()
    .locator("xpath=ancestor::table[1]");

test.describe("Model Management（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("已登录 + 有权限 → 渲染私有模型表，按 fixture 出 3 行、含运行态、未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto(ROUTE);

    // 稳定锚点：模型表表头出现（client fetch + SHOW_MODEL 渲染完成）。
    const table = modelTable(page);
    await expect(
      page.locator("th", { hasText: "MODEL NAME In API" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功）---
    await expect(page).not.toHaveURL(/\/login/);

    // --- SHOW_MODEL 关键结构：Upload Model 按钮 + Model List 链接（源码 id，非 i18n）---
    await expect(page.locator('[id*="__upload-model"]')).toHaveCount(1);
    await expect(page.locator('[id*="__model-list"]')).toHaveCount(1);
    await expect(page.locator('[id*="__upload-model"]')).toBeVisible();

    // --- 表按 fixture 出行（3 条 → 3 行）---
    await expect(table.locator("tbody tr")).toHaveCount(3);

    // --- 代表性单元格内容（合成模型名，非 i18n）---
    await expect(
      table.getByText("e2e_lora_alpha_api", { exact: true }),
    ).toBeVisible();
    await expect(
      table.getByText("e2e_lora_gamma_api", { exact: true }),
    ).toBeVisible();

    // --- 状态渲染：status:1 → "running"（2 条），status:0 → "unavailable"（1 条）---
    await expect(table.getByText("running", { exact: true })).toHaveCount(2);
    await expect(table.getByText("unavailable", { exact: true })).toHaveCount(
      1,
    );

    // --- 每行一个 Delete 操作按钮（源码 id 锚定，避免命中文案）---
    await expect(table.locator('[id*="__delete-model"]')).toHaveCount(3);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>）---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("点击 Upload Model 打开上传弹窗（行为：dialog 出现）", async ({
    page,
  }) => {
    await page.goto(ROUTE);

    const uploadBtn = page.locator('[id*="__upload-model"]');
    await expect(uploadBtn).toBeVisible({ timeout: 30_000 });

    // 初始无 dialog
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await uploadBtn.click();

    // 点击后上传弹窗出现（Modal → shadcn DialogContent role="dialog"，结构锚点不依赖文案）
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("模型列表为空 → 渲染空态、表 0 行、未弹登录、不崩", async ({ page }) => {
    // 覆盖空 /v3/model 分支：复写该端点为空列表（其余沿用 ENDPOINTS）。
    await mockBackend(page, {
      endpoints: {
        ...ENDPOINTS,
        "/v3/model": loadFixture(
          "models-console-model-management-models-empty.json",
        ),
      },
    });

    await page.goto(ROUTE);

    const table = modelTable(page);
    await expect(
      page.locator("th", { hasText: "MODEL NAME In API" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    await expect(page).not.toHaveURL(/\/login/);

    // 表头在但 tbody 0 行
    await expect(table.locator("tbody tr")).toHaveCount(0);

    // 空态组件（NoData 默认 title "No Data"，源码字面量）
    await expect(page.getByText("No Data", { exact: true })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
