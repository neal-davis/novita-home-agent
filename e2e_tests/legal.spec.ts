import { test, expect, type Page } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/legal 及其子页（静态法务文档页，公开无需登录）。
 *
 * 页面类型（读 src 确认）：legal/layout.tsx = WebsiteNavbar + Nav + <Suspense>{children} +
 * FooterSection；每个子页是纯静态内容组件，自身不取数（mockBackend 默认壳即可）。
 *  - /legal 直接 `return <Privacy/>`（= /legal/privacy-policy 同一组件）。
 *
 * 断言「牙」：每页有其专属的**法务文档 H1 标题**（page.tsx 硬编码的英文法律文档名，非 i18n UI
 * chrome——法律文本只有英文版不随 locale 变；是「该法务页确实渲染了对应文档」的内容身份锚点）。
 * 再断 layout 装配（Footer 可见）+ 不进错误边界。每个 test 用字面量 goto（供 e2e-coverage 静态扫描计入）。
 */

async function assertLegalDoc(page: Page, h1: string | RegExp) {
  await expect(page).not.toHaveURL(/\/login/);
  const heading =
    typeof h1 === "string"
      ? page.getByRole("heading", { level: 1, name: h1, exact: true })
      : page.getByRole("heading", { level: 1, name: h1 });
  await expect(heading).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("footer").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Error", exact: true }),
  ).toHaveCount(0);
}

test.describe("Legal 法务静态页（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await mockBackend(page, {});
  });

  test("/legal 渲染 Privacy Policy", async ({ page }) => {
    await page.goto("/legal", { waitUntil: "domcontentloaded" });
    await assertLegalDoc(page, "Privacy Policy");
  });
  test("/legal/privacy-policy 渲染 Privacy Policy", async ({ page }) => {
    await page.goto("/legal/privacy-policy", { waitUntil: "domcontentloaded" });
    await assertLegalDoc(page, "Privacy Policy");
  });
  test("/legal/cookie-policy 渲染 Cookie Policy", async ({ page }) => {
    await page.goto("/legal/cookie-policy", { waitUntil: "domcontentloaded" });
    await assertLegalDoc(page, "Cookie Policy");
  });
  test("/legal/terms-of-service 渲染 Terms of Service", async ({ page }) => {
    await page.goto("/legal/terms-of-service", {
      waitUntil: "domcontentloaded",
    });
    await assertLegalDoc(page, "Terms of Service");
  });
  test("/legal/dedicated-endpoints-sla 渲染 SLA", async ({ page }) => {
    await page.goto("/legal/dedicated-endpoints-sla", {
      waitUntil: "domcontentloaded",
    });
    await assertLegalDoc(page, /Service Level Agreement/);
  });
});
