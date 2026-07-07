import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/affiliate。
 *
 * 路由形状（读 src 确认）：
 *  - src/app/affiliate/page.tsx 是纯 server `redirect("/affiliate-new")`——/affiliate 本身
 *    无 UI，无条件跳转（不依赖登录态）。真正的页面在 /affiliate-new。
 *    （src/app/affiliate/Client*.tsx 是未接线的遗留文件，page.tsx 不渲染它们。）
 *  - /affiliate-new 是营销页（AffiliateNewPage：Header / AffiliateExperience(hero) / Info /
 *    Partners / Questions / Recommend / Footer），页面级无 PermissionWrapper。
 *  - 唯一登录态相关的交互在 hero 客户端组件 AffiliateExperience（"use client"）：读 Redux
 *    state.user.token/email/currentTeam；登录且为 team owner 时渲染 #affiliate-credentials
 *    区块并发 getAffiliateInfo()（GET /v1/user/affiliate，客户端 XHR，可被 page.route 拦截）。
 *
 * 登录态如何在 hermetic 下建立（见 useHeaderAuth + userSlice.updateUserInfo）：
 *  - seedAuth 注入 token cookie → useHeaderAuth 挂载时 dispatch fetchUserInfo() → /v1/user/info。
 *  - /v1/user/info fixture：uid 存在 → UserState.login；teams:[] → currentTeam=null →
 *    isTeamNonOwner=false。于是 AffiliateExperience.isLoggedIn=true 且非 non-owner →
 *    渲染 #affiliate-credentials + 调 getAffiliateInfo()。
 *
 * 确定性数据断言（深度，非健康巡检）：
 *  - getAffiliateInfo() 返回的 referralLink 直接成为 credentials 区块里 <a href>。fixture 给
 *    invitedCode=E2EAFF01 → 断言该 href 落地（证明 /v1/user/affiliate 数据流穿透到 DOM）。
 *  - credentials 区块恰好 3 个 Copy 按钮（Referral Link / Email / Initial Password，aria-label
 *    由源码硬编码 `Copy ${label}` 拼接，非 i18n 目录）。
 *
 * 选择器纪律：无 i18n 文案断言（页面文字经 i18n __t() 管线，见 Partners.tsx 注释）。
 *  锚点用稳定 id #affiliate-credentials、landmark <main>/<footer>、结构角色与 aria-label
 *  前缀。已在交付报告建议给关键区块补 data-testid（src 当前无 data-testid）。
 */

const ENDPOINTS = {
  "/v1/user/info": loadFixture("affiliate-user-info.json"),
  "/v1/user/affiliate": loadFixture("affiliate-info.json"),
  "/v3/stripe/promotion": loadFixture("affiliate-stripe-promotion.json"),
};

test.describe("Affiliate（hermetic）", () => {
  test("/affiliate 服务端跳转到 /affiliate-new", async ({ page }) => {
    // 跳转不依赖登录态：不 seedAuth 也应跳。仍 mock 后端避免真实调用。
    await mockBackend(page, { endpoints: ENDPOINTS });

    await page.goto("/affiliate", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/affiliate-new(?:\?|#|$)/);
    // 落地页 hero 可见（跳转后页面正常渲染，非白屏）
    await expect(page.locator("main h1").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("登录态：跳转后 hero 渲染 affiliate credentials，referral link 来自 mocked /v1/user/affiliate", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });

    // 从 /affiliate 进，验证整条「跳转 → 落地页登录态渲染」链路。
    await page.goto("/affiliate", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/affiliate-new(?:\?|#|$)/);

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 登录态专属区块出现：稳定 id 锚点（hero 客户端组件挂载 + Redux 回填后渲染） ---
    const credentials = page.locator("#affiliate-credentials");
    await expect(credentials).toBeVisible({ timeout: 30_000 });

    // --- 确定性数据：referralLink(href) 来自 mocked getAffiliateInfo()，
    //     带 fixture 里的 invitedCode=E2EAFF01（证明 /v1/user/affiliate 穿透到 DOM） ---
    await expect(
      credentials.locator('a[href*="invitedCode=E2EAFF01"]'),
    ).toHaveCount(1);

    // --- 结构：credentials 区块 3 个 Copy 按钮（Referral Link / Email / Initial Password） ---
    await expect(credentials.locator('button[aria-label^="Copy"]')).toHaveCount(
      3,
    );

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("登录态：/affiliate-new 营销页骨架结构完整渲染", async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });

    await page.goto("/affiliate-new", { waitUntil: "domcontentloaded" });

    // landmark 结构：恰好 1 个 <main> + 1 个 <footer>；hero <h1> 可见。
    await expect(page.locator("main h1").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);

    // 营销主体的 5 个 <section>（含登录态下的 credentials 区块）：
    // hero(AffiliateExperience 含 credentials) / Info / Partners / Questions / Recommend。
    await expect(page.locator("main section")).toHaveCount(5);

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("未登录：credentials 区块被正确门禁隐藏，hero 仍渲染", async ({
    page,
  }) => {
    // 不 seedAuth → AffiliateExperience.isLoggedIn=false → 不渲染 #affiliate-credentials，
    // 也不调用 getAffiliateInfo()。这是与登录态用例的对照，证明条件渲染行为。
    await mockBackend(page, { endpoints: ENDPOINTS });

    await page.goto("/affiliate-new", { waitUntil: "domcontentloaded" });

    // hero 仍在（营销页对游客可见）
    await expect(page.locator("main h1").first()).toBeVisible({
      timeout: 30_000,
    });
    // 登录态专属区块不存在
    await expect(page.locator("#affiliate-credentials")).toHaveCount(0);

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
