import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/serverless（客户端取数页）。
 *
 * 渲染管线（见 components/container.tsx → Section.tsx / defaultGuide.tsx）：
 *  - page.tsx 是 server component，但只渲染 <Header>/<Container>/<Footer> 静态壳；
 *    真正的业务数据由 "use client" 的 <Container> 在挂载后发 XHR 取，可被 page.route 拦截。
 *  - Container 的取数门是 Redux state.user.uuid：seedAuth 注入 token cookie → useHeaderAuth
 *    挂载时 dispatch fetchUserInfo()（/v1/user/info，被 fixture 注入并带 uuid）→ uuid 非空 →
 *    Container 调 getEndpoints()（/api/v1/endpoints）。
 *  - getEndpoints 返回 res.endpoints（fixture）→ 非空走 <Section>（端点卡片列表 + Create
 *    Endpoint / 搜索框），空数组走 <DefaultGuide>（Deploy Now / Learn More 引导）。
 *  两条分支都做确定性断言。
 *
 * 选择器纪律（绝不断言 i18n 文案）：
 *  本页用到的标签——"Create Endpoint" / "ENDPOINT ID" / "Deploy Now" / "SERVERLESS READY"
 *  / "Need to deploy cloud resources?" 等——都是组件源码里**硬编码的 JS 字面量**
 *  （item.tsx 的 createCopy()、defaultGuide.tsx 的内联文本），不经 i18n 目录管线，
 *  故跨 EN/ZH 构建变体稳定，可作锚点（与 billing-overview 用硬编码 <th> 字面量同理）。
 *  项目的自定义 <Button>（@/components/ui/button）是 <button> 但不暴露可匹配的
 *  accessible name（图标+span 包裹），故 getByRole("button",{name}) 命中 0 —— 改用
 *  locator("button",{hasText})。已在交付报告建议给关键控件补 data-testid。
 *
 * 数据契约：fixture 给 2 个 endpoint（serving + stopped）→ 每张卡 1 个 "ENDPOINT ID"
 *  标签 → 共 2 处，作为确定性「行数」代理（卡片本身无稳定 data-testid）。
 */

const SPECS = loadFixture("gpus-console-serverless-specs.json");

/** 该页客户端实际消费的端点：必须显式注入，兜底壳子撑不起列表 / 会让无保护的 .map 抛错。 */
const COMMON_ENDPOINTS = {
  "/v1/user/info": loadFixture("gpus-console-serverless-user-info.json"),
  // ServerlessProvider (Context.tsx) 取 GPU specs；getEndpointSpecs 对返回做无保护 res.specs.map，
  // 必须给出 { specs: [...] } 否则抛错（虽被 catch、不崩，但污染控制台且 GPU CONFIG 取不到名）。
  "/serverless/auth/market/specs": SPECS,
  "/serverless/market/specs": SPECS,
  "/product/price": { basePrice0: "1000000", pricePrecision: "1" },
  "/v3/stripe/promotion": loadFixture("gpus-console-serverless-promotion.json"),
};

/** 错误边界不出现（src/app/error.tsx → <h1>Error</h1>），所有用例共用。 */
const assertNoErrorBoundary = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("GPUs Console · Serverless（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
  });

  test("有端点数据：渲染端点卡片列表（确定性 2 张）+ Create Endpoint + 搜索框，未弹登录、不崩", async ({
    page,
  }) => {
    await mockBackend(page, {
      endpoints: {
        ...COMMON_ENDPOINTS,
        "/api/v1/endpoints": loadFixture(
          "gpus-console-serverless-endpoints.json",
        ),
      },
    });
    await page.goto("/gpus-console/serverless");

    // 稳定锚点：第一张端点卡的 "ENDPOINT ID" 标签出现 = 客户端取数 + Section 渲染完成。
    const endpointIdLabels = page.locator("text=ENDPOINT ID");
    await expect(endpointIdLabels.first()).toBeVisible({ timeout: 30_000 });

    // ① 未被弹去登录（seedAuth + mocked /v1/user/info 成功，uuid 非空）。
    await expect(page).not.toHaveURL(/\/login/);

    // ② 确定性行数：fixture 2 个 endpoint → 每卡 1 个 "ENDPOINT ID" → 共 2 处。
    await expect(endpointIdLabels).toHaveCount(2);

    // ③ 两个端点名 / 第一个端点 id 按 fixture 渲染（代表性数据，源码非 i18n）。
    await expect(
      page.getByText("e2e-serving-endpoint", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("e2e-stopped-endpoint", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("ep-e2e000000000001", { exact: true }),
    ).toBeVisible();

    // ④ Section 关键结构控件：Create Endpoint 按钮（自定义 Button → 用 hasText）+ 搜索框。
    await expect(
      page.locator("button", { hasText: "Create Endpoint" }),
    ).toHaveCount(1);
    await expect(
      page.getByPlaceholder("Instance Name/lD Filter/GPU Type"),
    ).toBeVisible();

    // ⑤ 卡片业务区块标签按卡出现（每卡一组 → 各 2 处）。
    await expect(page.locator("text=WORKERS RUNNING")).toHaveCount(2);
    await expect(page.locator("text=GPU CONFIG")).toHaveCount(2);

    // ⑥ 未走到「无端点」引导态（确认确实是数据分支）。
    await expect(page.locator("button", { hasText: "Deploy Now" })).toHaveCount(
      0,
    );

    // ⑦ 不触发错误边界。
    await assertNoErrorBoundary(page);
  });

  test("无端点数据：渲染 DefaultGuide 引导（Deploy Now / Learn More），未弹登录、不崩", async ({
    page,
  }) => {
    await mockBackend(page, {
      endpoints: {
        ...COMMON_ENDPOINTS,
        "/api/v1/endpoints": loadFixture(
          "gpus-console-serverless-endpoints-empty.json",
        ),
      },
    });
    await page.goto("/gpus-console/serverless");

    // 稳定锚点：DefaultGuide 的标题（源码内联字面量 <h1>）。
    const guideHeading = page.locator("h1", { hasText: "Need to deploy" });
    await expect(guideHeading).toBeVisible({ timeout: 30_000 });

    // ① 未被弹去登录。
    await expect(page).not.toHaveURL(/\/login/);

    // ② DefaultGuide 引导按钮（自定义 Button → hasText）。
    await expect(page.locator("button", { hasText: "Deploy Now" })).toHaveCount(
      1,
    );
    await expect(page.locator("button", { hasText: "Learn More" })).toHaveCount(
      1,
    );

    // ③ 引导文案锚点 "SERVERLESS READY"（源码字面量）。
    await expect(page.locator("text=SERVERLESS READY").first()).toBeVisible();

    // ④ 未渲染端点卡片（确认确实是空态分支）。
    await expect(page.locator("text=ENDPOINT ID")).toHaveCount(0);

    // ⑤ 不触发错误边界。
    await assertNoErrorBoundary(page);
  });
});
