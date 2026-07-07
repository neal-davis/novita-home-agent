import { test, expect, type Page } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：4 个剩余 /models/video/* 视频模型营销/demo 页（在已覆盖的 kling-t2v /
 * minimax-hailuo / wan-2.1 之外）。公开页无需登录，与 kling-v1.6-t2v 同模板（Header + hero +
 * 「Try …」demo（#btn-product-generate）+ playground/API-Reference 链接 + Footer）。
 *
 * 断言「牙」（非 i18n）：
 *  - 路由专属 doc <title>（page.tsx metadata 字面量，确定身份）；
 *  - demo 控件 #btn-product-generate（埋点 id，稳定，hydration 完成信号）；
 *  - playground 链接 href（probe 实测每路由 hash 不同：wan-2.1-i2v→#wan-i2v 等，逐路由用真实值）；
 *  - 未弹登录 + 无错误边界。
 * 静态 + 交互 demo 挂载不发数据 XHR，mockBackend 默认壳即可。
 */

async function assertVideoDemo(
  page: Page,
  opts: { titleRe: RegExp; playgroundHref: string },
) {
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page).toHaveTitle(opts.titleRe);
  await expect(page.locator("#btn-product-generate")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(
    page.locator(`a[href="${opts.playgroundHref}"]`).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Error", exact: true }),
  ).toHaveCount(0);
}

test.describe("models/video 扩展覆盖（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await mockBackend(page, {});
  });

  test("kling-v1.6-i2v 视频 demo 页", async ({ page }) => {
    await page.goto("/models/video/kling-v1.6-i2v", {
      waitUntil: "domcontentloaded",
    });
    await assertVideoDemo(page, {
      titleRe: /Kling V1\.6 Image to Video/i,
      playgroundHref: "/models/image#kling-v1.6-i2v",
    });
  });

  test("minimax-video-01 视频 demo 页", async ({ page }) => {
    await page.goto("/models/video/minimax-video-01", {
      waitUntil: "domcontentloaded",
    });
    await assertVideoDemo(page, {
      titleRe: /MiniMax.*Video 01/i,
      playgroundHref: "/models/image#minimax-video-01",
    });
  });

  test("wan-2.1-i2v 视频 demo 页", async ({ page }) => {
    await page.goto("/models/video/wan-2.1-i2v", {
      waitUntil: "domcontentloaded",
    });
    await assertVideoDemo(page, {
      titleRe: /Wan2\.1 Image-to-Video/i,
      playgroundHref: "/models/image#wan-i2v",
    });
  });

  test("wan-2.6 视频 demo 页", async ({ page }) => {
    await page.goto("/models/video/wan-2.6", {
      waitUntil: "domcontentloaded",
    });
    await assertVideoDemo(page, {
      titleRe: /Wan2\.6/i,
      playgroundHref: "/models/image#wan-2.6-t2v",
    });
  });
});
