import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/model-api/product/reimagine（已弃用产品，公开页、无需登录）。
 *
 * 页面类型 / 真实行为（读 src 实测确认，与同批其它 demo 页不同！）：
 *  - Reimagine 是「Low Usage API Product Deprecation Plan」里被弃用的产品
 *    （FUNCS.REIMAGINE.productpageReady === false，funcs.ts:867；DOCS_URL.REIMAGINE 注释 "end of service"）。
 *  - middleware.ts:338-361「deprecated product pages」分支命中：businessPathname 含 `/product/`，
 *    取末段 `reimagine` 找到 FUNCS.REIMAGINE，`!funcFilter(func,"product")` 为真 → **302 重定向到
 *    `/models/end-of-service`**（实测 final URL = /models/end-of-service，status 200）。
 *  - 因此 `app/model-api/product/reimagine/page.tsx`（Case → CaseWrapper → Reimagine demo）**永不渲染**；
 *    门禁要断的是「重定向落地 + 弃用页结构」，不是 demo 控件（实测 #btn-product-generate count = 0）。
 *    这是该路由当前**正确的预期行为**，不是 bug。
 *  - 弃用页 app/models/end-of-service/page.tsx 渲染 <EndOfService/>（components/error/EndOfService.tsx，
 *    "use client"）：纯静态，挂载时无业务列表 XHR（Header 会发 /v3/stripe/promotion，已注入 fixture）。
 *
 * 断言「牙」从哪来（无 i18n 文案断言）：
 *  - 重定向落地：page.url() 命中 /models/end-of-service（middleware 行为，强信号）。
 *  - 结构锚点（稳定 id/aria/img-alt/href，均非 i18n 管线文案）：
 *    · 弃用插图 `img[alt="end-of-service"]`（alt 为源码字面量，next/image 优化后 src 变形故锚 alt）；
 *    · 推荐位 `section[aria-labelledby="end-of-service-suggestions-heading"]` + `#end-of-service-suggestions-heading`；
 *    · 4 张推荐卡 href 恰为 `/model-api` `/serverless` `/gpu-instance` `/sandbox`（源码常量 link，scope 到 section）。
 *  - 确定性数据（对 src 弃用清单有牙）：弃用 API 列表 `ul.list-none.grid.grid-cols-3 > li`
 *    恰 29 项（= EndOfService.tsx `deprecatedAPIs` 数组长度），且其中**有一项是 "Reimagine"**
 *    （= FUNC_DISPLAY_NAME.REIMAGINE，纯 JS 常量、非 i18n JSX；这是本路由弃用身份的负向控制锚点：
 *    若该路由被错误地从弃用清单移除/改名，count!=29 或 Reimagine 项消失 → FAIL）。
 *
 * 交互/分支覆盖：
 *  - 主用例：弃用页落地 + 全结构断言（默认壳 + promotion fixture）。
 *  - 分支用例：/v3/stripe/promotion 返回 500（Header 取数失败降级）→ 重定向仍发生、弃用页结构仍渲染、
 *    错误边界不触发（证明弃用页/重定向不依赖该后端取数）。
 *  - 此页无可输入控件（demo 不渲染），交互覆盖以「重定向 + 后端降级分支 + 数据计数」承担。
 *
 * 变异测试（assertions have teeth，已实测）：
 *  - 把弃用列表计数断言 29 → 28 ⇒ FAIL（真实 29）。
 *  - 把「Reimagine 列表项可见」断言改成不存在的 "Reimagine-XYZ" ⇒ FAIL。
 *  - 把重定向落地断言 /models/end-of-service 改成 /model-api/product/reimagine ⇒ FAIL
 *    （证明该断言真在校验重定向，而非恒真）。
 *  此页不消费后端列表端点（无数组壳 fixture），故无「把 fixture 改回 {} 看是否 FAIL」的标的；
 *  断言的牙由「与 middleware 重定向行为 + src 弃用清单常量耦合」的负向控制承担。
 */

const promotion = loadFixture(
  "model-api-product-reimagine-stripe-promotion.json",
);

// EndOfService.tsx `deprecatedAPIs` 数组当前长度（实测渲染 29 个 <li>）。
const DEPRECATED_COUNT = 29;
// 推荐位 4 张卡的目标 href（EndOfService.tsx `cards`，源码常量）。
const SUGGESTION_CARD_HREFS = [
  "/model-api",
  "/serverless",
  "/gpu-instance",
  "/sandbox",
];

test.describe("Reimagine deprecated product page → end-of-service（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 弃用页无业务列表取数；仅 Header 的 promotion 调用注入 fixture，其余走默认壳。
    await mockBackend(page, {
      endpoints: { "/v3/stripe/promotion": promotion },
    });
  });

  test("弃用产品路由 302 重定向到 end-of-service，渲染弃用清单(29)+Reimagine+4 推荐卡，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/model-api/product/reimagine", {
      waitUntil: "domcontentloaded",
    });

    // --- 重定向落地（middleware 行为，强信号；等弃用页稳定锚点出现以确保客户端就绪） ---
    await expect(
      page.locator("#end-of-service-suggestions-heading"),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/models\/end-of-service/);

    // --- 公开页：未被弹去登录（且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 弃用插图（alt 为源码字面量；next/image 优化后 src 变形，故锚 alt） ---
    await expect(page.locator('img[alt="end-of-service"]')).toHaveCount(1);

    // --- 推荐位 section（aria 锚点，结构角色，非 i18n 文案） ---
    const suggestions = page.locator(
      'section[aria-labelledby="end-of-service-suggestions-heading"]',
    );
    await expect(suggestions).toBeVisible();
    // 4 张推荐卡 href（源码常量 link，scope 到 section，避免命中 Header/Footer 同名链接）
    for (const href of SUGGESTION_CARD_HREFS) {
      await expect(suggestions.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    await expect(suggestions.locator("a[href]")).toHaveCount(
      SUGGESTION_CARD_HREFS.length,
    );

    // --- 确定性数据：弃用 API 列表恰 29 项（对 deprecatedAPIs 数组有牙） ---
    const deprecatedItems = page.locator("ul.list-none.grid.grid-cols-3 > li");
    await expect(deprecatedItems).toHaveCount(DEPRECATED_COUNT);
    // 本路由弃用身份的负向控制锚点：清单中必有 "Reimagine"（FUNC_DISPLAY_NAME.REIMAGINE）
    await expect(
      page.locator("ul.list-none.grid.grid-cols-3 > li", {
        hasText: "Reimagine",
      }),
    ).toHaveCount(1);

    // --- demo 永不渲染（重定向已发生）：生成按钮埋点 id 不应存在 ---
    await expect(page.locator("#btn-product-generate")).toHaveCount(0);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("后端 promotion 取数失败(500)：重定向仍发生、弃用页结构仍渲染、错误边界不触发", async ({
    page,
  }) => {
    // 弃用页/重定向不依赖任何后端取数；让 Header 的 /v3/stripe/promotion 返回 500，
    // 验证重定向落地 + 弃用清单(29) + 推荐位仍渲染，且不触发错误边界。
    // 后注册的 route 在 Playwright 中优先匹配，覆盖 beforeEach 的 promotion fixture。
    await mockBackend(page, {
      failEndpoints: { "/v3/stripe/promotion": 500 },
    });

    await page.goto("/model-api/product/reimagine", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.locator("#end-of-service-suggestions-heading"),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/models\/end-of-service/);
    await expect(page).not.toHaveURL(/\/login/);

    await expect(
      page.locator("ul.list-none.grid.grid-cols-3 > li"),
    ).toHaveCount(DEPRECATED_COUNT);
    await expect(
      page.locator(
        'section[aria-labelledby="end-of-service-suggestions-heading"]',
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
