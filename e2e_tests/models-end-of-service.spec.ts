import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models/end-of-service（公开「服务终止」通告页，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/models/end-of-service/page.tsx 是 server component：Header + <EndOfService/> + FooterBanner + Footer。
 *  - components/error/EndOfService.tsx 是 "use client" 但**完全静态**——无任何 fetch/XHR：
 *      · 通告标题 + /deprecated.png 示例图（alt="end-of-service"）
 *      · "Deprecated APIs" 列表：源自模块内常量 deprecatedAPIs（29 项）→ map → 29 个 <li>（grid-cols-3）
 *      · Impact / Next Steps 两个文本块
 *      · 底部「为你推荐」section（aria-labelledby="end-of-service-suggestions-heading"）含 4 张产品卡：
 *        model-api / serverless / gpu-instance / sandbox，每张是 <Link href>（href 不经 i18n）。
 *  - /models/end-of-service 不在 LOGIN_REQUIRED_URL，未登录不弹登录 → 不 seedAuth、不 mock /v1/user/info。
 *  - 抓取到的唯一后端调用 /v3/stripe/promotion 来自共享导航/促销上下文（非页面主体）；注入脱敏 fixture
 *    让运行确定性、并据此测「促销端点 500 时静态页仍完整渲染」的降级分支。
 *
 * 断言纪律（关键）：本仓库经构建期 i18n 管线会抽取 JSX 文案（EN/ZH… 多变体），连通告正文都可能成 key
 *  ——**绝不断言这些文案**。可断言的锚点必须跨变体恒定：
 *   - 结构：稳定 id（#end-of-service-suggestions-heading）、稳定 alt 属性（"end-of-service"）、
 *     稳定 href（/model-api …，href 不经 i18n）、语义角色/计数。
 *   - 「有牙」数据锚点：API 列表 <li> 数 == 源数组 deprecatedAPIs 长度（29）。该数派生自 src 常量，
 *     若数组增删，此断言 FAIL（变异测试已验证：把数组裁短 → spec FAIL）。
 *  页面无 data-testid（见交付报告「建议补 data-testid」）。
 *
 * DOM 真值（:3101 实测，已写入断言）：
 *   api-list <li>=29 ; img[alt="end-of-service"]×1 ; deprecated.png×1 ;
 *   #end-of-service-suggestions-heading×1 ; suggestions section 内 <a>×4（每个产品 href×1）；
 *   错误边界 heading "Error"×0。
 */

const PROMOTION = "models-end-of-service-stripe-promotion.json";

// 源自 src/app/components/error/EndOfService.tsx 的 deprecatedAPIs 常量长度（实测 29 项）。
// 这是「有牙」的契约值：组件把该数组 map 成 <li>，列表行数 === 数组长度。
const DEPRECATED_API_COUNT = 29;

// 底部「为你推荐」4 张卡的产品 href（顺序即 src 中 cards 数组顺序），href 不经 i18n。
const CARD_HREFS = ["/model-api", "/serverless", "/gpu-instance", "/sandbox"];

test.describe("End-of-Service 通告页（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    const promo = loadFixture<{ valid: boolean }>(PROMOTION);
    // 守卫：fixture 形态即测试前提（无 active promotion 的确定性基线）
    expect(promo.valid).toBe(false);
    await mockBackend(page, { endpoints: { "/v3/stripe/promotion": promo } });
  });

  test("静态通告页结构完整：示例图 + 弃用列表(29 行) + 4 张推荐卡，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/models/end-of-service", {
      waitUntil: "domcontentloaded",
    });

    // --- 公开页：未被弹去登录（未 seedAuth 仍可访问） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 顶部示例图（稳定 alt 属性，非 i18n 文案；等它可见作为页面就绪信号） ---
    const heroImg = page.locator('img[alt="end-of-service"]');
    await expect(heroImg).toHaveCount(1, { timeout: 30_000 });
    await expect(heroImg).toBeVisible();
    // 图源是 next/image 优化后的 URL，但底层 /deprecated.png 必出现在 src 里
    await expect(heroImg).toHaveAttribute("src", /deprecated\.png/);

    // --- 弃用 API 列表：29 行（== 源数组 deprecatedAPIs 长度，对 src 常量有牙） ---
    // grid-cols-3 是该 <ul> 的稳定布局类片段；用它隔离掉 footer 等其它 <li>。
    const apiList = page.locator("ul.grid-cols-3");
    await expect(apiList).toHaveCount(1);
    await expect(apiList.locator("li")).toHaveCount(DEPRECATED_API_COUNT);

    // --- 底部「为你推荐」区块（稳定 id 锚定，结构角色 region） ---
    const suggestions = page.locator(
      'section[aria-labelledby="end-of-service-suggestions-heading"]',
    );
    await expect(suggestions).toHaveCount(1);
    // 区块标题用稳定 id 锚（不断言其文案）
    await expect(
      page.locator("#end-of-service-suggestions-heading"),
    ).toHaveCount(1);

    // --- 4 张产品卡：区块内恰 4 个 <a>，每个对应一个产品 href（href 不经 i18n，有牙） ---
    await expect(suggestions.locator("a")).toHaveCount(4);
    for (const href of CARD_HREFS) {
      await expect(suggestions.locator(`a[href="${href}"]`)).toHaveCount(1);
    }

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("推荐卡导航契约：点击「model-api」卡离开通告页、解析重定向后落地 /models", async ({
    page,
  }) => {
    // 注意：卡片 href="/model-api"（DOM 实测），但 next.config.js 把 /model-api 配成 308 → /models，
    // 故点击后浏览器最终落在 /models（实测确认，非 bug，是产品路由约定）。本用例校验「卡片可点 +
    // 站内跳转 + 重定向解析正确」这条端到端契约，而非 href 字面值（字面值已在结构用例里断过）。
    await page.goto("/models/end-of-service", {
      waitUntil: "domcontentloaded",
    });

    const suggestions = page.locator(
      'section[aria-labelledby="end-of-service-suggestions-heading"]',
    );
    const modelApiCard = suggestions.locator('a[href="/model-api"]');
    await expect(modelApiCard).toHaveCount(1, { timeout: 30_000 });
    await expect(modelApiCard).toBeVisible();

    // 一条真实交互：点击卡片 → next/link 站内跳转 → /model-api 308 重定向到 /models。
    await modelApiCard.click();
    await expect(page).toHaveURL(/\/models(\/|$|\?)/, { timeout: 30_000 });
    // 已离开通告页（不再停留在 /models/end-of-service）
    await expect(page).not.toHaveURL(/\/models\/end-of-service/);
    // 跳转后未被弹去登录、目标页也不崩
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("促销端点 500：静态通告页主体不依赖它，仍完整渲染、不崩、未弹登录", async ({
    page,
  }) => {
    // 页面主体（EndOfService）无 XHR，唯一后端调用 /v3/stripe/promotion 来自共享 promo 上下文。
    // 即使它 500，通告内容/列表/推荐卡都应照常渲染，错误边界不触发 —— 锁死「页面不依赖该端点」。
    await mockBackend(page, {
      failEndpoints: { "/v3/stripe/promotion": 500 },
    });
    await page.goto("/models/end-of-service", {
      waitUntil: "domcontentloaded",
    });

    await expect(page).not.toHaveURL(/\/login/);

    // 示例图 + 弃用列表 + 推荐区块在促销失败分支下仍齐全
    await expect(page.locator('img[alt="end-of-service"]')).toHaveCount(1, {
      timeout: 30_000,
    });
    await expect(page.locator("ul.grid-cols-3 li")).toHaveCount(
      DEPRECATED_API_COUNT,
    );
    await expect(
      page.locator(
        'section[aria-labelledby="end-of-service-suggestions-heading"] a',
      ),
    ).toHaveCount(4);

    // 促销失败不应触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
