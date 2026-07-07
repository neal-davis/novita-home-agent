import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models-console/multimodal-playground（"use client" 取数页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 已覆盖），而是断言**确定性行为/结构**：
 * 从 mocked 的模型配置驱动整页渲染（loader → playground）、选中模型 = fixture
 * displayName、依 OpenAPI schema 解析出 endpoint → 拼出 Model API docs 链接、
 * 由 required 字段初始化出默认表单（Request JSON）、按 examples 出 Examples tab；
 * 并覆盖**登录门控分支**（uuid 有/无 → Run 按钮在 "Generate"+Reset 与 "Log in to use" 之间切换）；
 * 两态都不触发错误边界。
 *
 * 页面类型与渲染契约（读 src 实测确认）：
 *  - page.tsx 是 "use client"。挂载 dispatch fetchMultimodalConfigs → getEnabledFusionProductConfigs()
 *    打 /v1/product/multimodal-model/list、getBatchPrice() 打 /v1/product/batch-price（客户端 XHR，
 *    可被 page.route 拦截）。
 *  - useModelConfigs 读 state.multimodal.configs，按 fusionConfig.rank 升序后取 [0] 作 selectedModel。
 *    `isLoading || !selectedModel` → 渲染 Loader；故 **list 端点必须注入带合法 openapiSchema 的 config**，
 *    否则 selectedModel 永为 null、卡在 loader（已做变异测试：list={} → #playground 计数 0，见报告）。
 *  - parseRawListItem 要求 config.modelConfig.config.openapiSchema 可解析；parseOpenAPISchema 取
 *    paths 的第一个 key 作 endpoint。ModelSelector 依 endpoint 末段拼
 *    https://novita.ai/docs/api-reference/model-apis-<name>。
 *  - 登录态：uuid 由 ConsoleHeaderWrapper 挂载时 fetch /v1/user/info 注入（updateUserInfo 要求
 *    payload.teams 是数组 → fixture teams:[]）。ParametersPanel 在 isLoggedIn 时多渲染 Reset、
 *    Run 文案 "Generate"；未登录 Run 文案 "Log in to use" 且无 Reset（handleRun 里 !uuid → 推 /user/login）。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。
 *  - 结构锚点：源码硬编码的 section id（#playground / #json / #bash / #examples，TabsSection
 *    里 id="playground" 等字面量，与文案管线无关）、Model API docs 链接的稳定 href（由 endpoint 拼出，
 *    不经 i18n）、#json <pre> 的表单 JSON（由 schema 默认值生成的纯数据）。
 *  - 数据锚点：选中模型 displayName（fixture 合成值 "E2E Remove Background"）、docs href 里的
 *    endpoint 名（fixture schema 路径）。
 *  - Run 按钮的 "Generate" / "Log in to use" / "Reset" 是 ParametersPanel 里源码硬编码字面量
 *    （非 i18n 目录键），仅用于区分登录门控两态 —— 与 console-home 断言硬编码 "ACCOUNT SETUP" 同理。
 * 已在交付报告里建议给 ModelSelector / ParametersPanel 关键节点补 data-testid（见报告）。
 */

const LIST_FIXTURE = "models-console-multimodal-playground-model-list.json";

const DATA_ENDPOINTS = {
  "/v1/product/multimodal-model/list": loadFixture(LIST_FIXTURE),
  "/v1/product/batch-price": loadFixture(
    "models-console-multimodal-playground-batch-price.json",
  ),
  "/v3/stripe/promotion": loadFixture(
    "models-console-multimodal-playground-promotion.json",
  ),
};

const USER_INFO = {
  "/v1/user/info": loadFixture(
    "models-console-multimodal-playground-user-info.json",
  ),
};

const ROUTE = "/models-console/multimodal-playground";

/** fixture 注入的确定性值（locale 无关）。 */
const SELECTED_DISPLAY_NAME = "E2E Remove Background";
const SELECTED_ENDPOINT_NAME = "image-remove-background"; // schema paths 末段
const DOCS_HREF = `https://novita.ai/docs/api-reference/model-apis-${SELECTED_ENDPOINT_NAME}`;

/** 模型选择器触发器：取选中 displayName 文案命中的那个 combobox。 */
const modelTrigger = (page: Page) =>
  page.getByRole("combobox").filter({ hasText: SELECTED_DISPLAY_NAME });

test.describe("Multimodal Playground（hermetic）", () => {
  test("登录态：从 mocked 模型配置驱动整页（选中模型 / docs 链接 / 默认表单 / Examples），未弹登录、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: { ...DATA_ENDPOINTS, ...USER_INFO },
    });
    await page.goto(ROUTE);

    // 稳定锚点：playground section 出现 = loader 已结束、模型配置已驱动渲染。
    // 若 list 端点没驱动出 selectedModel（如返回 {}），#playground 永不出现（变异测试已证）。
    await expect(page.locator("#playground")).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（uuid 由 /v1/user/info 注入） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 结构：四个 section（playground / examples / json / bash）按 TabsSection 渲染 ---
    await expect(page.locator("#playground")).toHaveCount(1);
    await expect(page.locator("#json")).toHaveCount(1);
    await expect(page.locator("#bash")).toHaveCount(1);
    // examples 仅在 selectedModel.examples.length>0 时渲染；fixture 给 2 条 → 出现
    await expect(page.locator("#examples")).toHaveCount(1);

    // --- 数据：选中模型 = fixture rank 最小者的 displayName ---
    await expect(modelTrigger(page)).toBeVisible();

    // --- 数据：Model API docs 链接 href 由 OpenAPI schema 的 endpoint 拼出（证明 schema 解析成功） ---
    await expect(
      page.getByRole("link", { name: "Model API docs" }),
    ).toHaveAttribute("href", DOCS_HREF);

    // --- 数据：Request JSON 由 required 字段(image)初始化出默认表单（schema → form 端到端） ---
    const jsonPre = page.locator("#json pre");
    await expect(jsonPre).toContainText('"image"');

    // --- 行为：bash/API section 渲染出 endpoint 路径 ---
    await expect(page.locator("#bash")).toContainText(SELECTED_ENDPOINT_NAME);

    // --- 登录门控：登录态 Run 按钮 = "Generate" 且渲染 Reset ---
    await expect(
      page.getByRole("button", { name: "Generate", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reset", exact: true }),
    ).toBeVisible();
    // 未登录态的 "Log in to use" 不应出现
    await expect(
      page.getByRole("button", { name: "Log in to use", exact: true }),
    ).toHaveCount(0);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("未登录态：Run 按钮切到登录门控（无 Reset），页面仍正常渲染、不崩", async ({
    page,
  }) => {
    // 不 mock /v1/user/info → uuid 保持空 → 走未登录分支。seedAuth 只是 cookie，
    // 该页 uuid 取自 redux（依赖 /v1/user/info 回填），故仍是未登录态。
    await mockBackend(page, { endpoints: DATA_ENDPOINTS });
    await page.goto(ROUTE);

    await expect(page.locator("#playground")).toBeVisible({ timeout: 30_000 });

    // 选中模型与结构仍正常（数据驱动与登录态无关）
    await expect(modelTrigger(page)).toBeVisible();
    await expect(page.locator("#json pre")).toContainText('"image"');

    // --- 登录门控：未登录 Run 文案 = "Log in to use"，且不渲染 Reset ---
    await expect(
      page.getByRole("button", { name: "Log in to use", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reset", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Generate", exact: true }),
    ).toHaveCount(0);

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("配置缺失分支：模型列表为空时停在 loader（不渲染 playground），不崩、不弹登录", async ({
    page,
  }) => {
    // 变异/分支：list 端点返回空对象 → getEnabledFusionProductConfigs 得 []，
    // selectedModel 永为 null → 页面停在 Loader（#playground 不出现），但不应崩或弹登录。
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...USER_INFO,
        "/v1/product/batch-price": loadFixture(
          "models-console-multimodal-playground-batch-price.json",
        ),
        "/v3/stripe/promotion": loadFixture(
          "models-console-multimodal-playground-promotion.json",
        ),
        "/v1/product/multimodal-model/list": {},
      },
    });
    await page.goto(ROUTE);

    // Loader 自身没有稳定 testid；用 spinner 的 lucide class 作锚点等其出现，
    // 再断言 playground section 始终不出现（区别于「数据驱动成功」态）。
    await expect(page.locator("svg.animate-spin").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("#playground")).toHaveCount(0);

    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
