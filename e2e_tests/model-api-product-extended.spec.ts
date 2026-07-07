import { test, expect, type Page } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：剩余 30 个 /model-api/product/* 路由（在 6 个已有专属 spec —— img2img /
 * inpainting / outpainting / reimagine / remove-background / txt2img —— 之外的全部）。
 *
 * 实测（probe live DOM + 读 src）分三种契约，各给「有牙」断言：
 *  1. deprecated → /models/end-of-service（src/middleware.ts:337-361，funcFilter 驱动的 302，
 *     纯 URL 规则不依赖后端）。契约 = 跳转本身（删规则→渲染产品→waitForURL 超时→FAIL）。
 *  2. retired → /（home，src/urlRedirect.ts 的 NOVITA_URL.HOME 映射）。契约 = 落首页 pathname "/"。
 *  3. live 产品页：Layout_new（Header + hero h1 + Footer，公开无需登录）+ 路由专属非 i18n 锚点
 *     （image 系：/models/image#<slug> + …/model-apis-<slug>；sd3：埋点 data-gtm-product-name=sd3；
 *     voice-cloning：doc <title> 正则，源自 page.tsx metadata 字面量）。
 *
 * 注：每个 test 用**字面量** page.goto("/literal/path")（非模板插值）——既是真实导航，也让
 * scripts/agent/e2e-coverage.mjs 的 goto 静态扫描能把本路由计入深度覆盖。断言逻辑抽到 helper 保持 DRY。
 * 中间件跳转是 server 行为 dev/build 一致；本批断言全部不依赖后端数据，mockBackend 默认壳即可。
 */

const noErrorBoundary = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

async function setup(page: Page) {
  test.setTimeout(90_000);
  await mockBackend(page, {});
}

/** deprecated 产品：中间件 302 → /models/end-of-service。
 *  用 toHaveURL（自带轮询重试）而非 waitForURL——后者在 server 跳转于 goto 期间已 settle 时，
 *  监听器注册晚于导航完成会 racy（与本仓库 waitForResponse 的同类坑一致，高负载下偶发）。 */
async function expectEndOfService(page: Page) {
  await expect(page).toHaveURL(/\/models\/end-of-service/, { timeout: 30_000 });
  await noErrorBoundary(page);
}

/** retired 产品：urlRedirect → 首页（pathname 归一为 "/"，容忍 locale 前缀） */
async function expectHome(page: Page) {
  await expect(page).toHaveURL(
    (url) => /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/?)?$/.test(url.pathname),
    { timeout: 30_000 },
  );
  await noErrorBoundary(page);
}

/** live 产品页公共装配（hero h1 + Footer + 未弹登录 + 无错误边界） */
async function expectLiveShell(page: Page) {
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator("footer").first()).toBeVisible();
  await noErrorBoundary(page);
}

/** image 系 live 产品的路由专属锚点：playground + API-Reference 链接 */
async function expectImageProductAnchors(page: Page, slug: string) {
  await expectLiveShell(page);
  await expect(
    page.locator(`a[href="/models/image#${slug}"]`).first(),
  ).toBeVisible();
  await expect(
    page.locator(`a[href*="model-apis-${slug}"]`).first(),
  ).toBeVisible();
}

test.describe("model-api/product 扩展覆盖：deprecated → end-of-service（hermetic）", () => {
  test("animate-anyone → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/animate-anyone", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("create-tile → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/create-tile", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("doodle → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/doodle", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("img2video-motion → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/img2video-motion", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("lcm-txt2img → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/lcm-txt2img", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("LoRA-training → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/LoRA-training", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("mix-pose → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/mix-pose", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("remove-watermark → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/remove-watermark", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("replace-object → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/replace-object", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("replace-sky → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/replace-sky", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("restore-face → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/restore-face", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("sdxl-turbo → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/sdxl-turbo", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("upscale → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/upscale", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
  test("voice-cloning-instant → end-of-service", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/voice-cloning-instant", {
      waitUntil: "domcontentloaded",
    });
    await expectEndOfService(page);
  });
});

test.describe("model-api/product 扩展覆盖：retired → home（hermetic）", () => {
  test("speech2txt → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/speech2txt", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
  test("speech2txt-translate → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/speech2txt-translate", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
  test("video-magic-cut → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/video-magic-cut", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
  test("video-remove-object → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/video-remove-object", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
  test("video-remove-subtitle → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/video-remove-subtitle", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
  test("video-remove-watermark → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/video-remove-watermark", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
  test("video-translate → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/video-translate", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
  test("video-upscale → home", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/video-upscale", {
      waitUntil: "domcontentloaded",
    });
    await expectHome(page);
  });
});

test.describe("model-api/product 扩展覆盖：live 产品页（hermetic）", () => {
  test("cleanup 渲染产品页 + 路由专属锚点", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/cleanup", {
      waitUntil: "domcontentloaded",
    });
    await expectImageProductAnchors(page, "cleanup");
  });
  test("img2video 渲染产品页 + 路由专属锚点", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/img2video", {
      waitUntil: "domcontentloaded",
    });
    await expectImageProductAnchors(page, "img2video");
  });
  test("merge-face 渲染产品页 + 路由专属锚点", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/merge-face", {
      waitUntil: "domcontentloaded",
    });
    await expectImageProductAnchors(page, "merge-face");
  });
  test("remove-text 渲染产品页 + 路由专属锚点", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/remove-text", {
      waitUntil: "domcontentloaded",
    });
    await expectImageProductAnchors(page, "remove-text");
  });
  test("replace-background 渲染产品页 + 路由专属锚点", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/replace-background", {
      waitUntil: "domcontentloaded",
    });
    await expectImageProductAnchors(page, "replace-background");
  });
  test("txt2video 渲染产品页 + 路由专属锚点", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/txt2video", {
      waitUntil: "domcontentloaded",
    });
    await expectImageProductAnchors(page, "txt2video");
  });
  test("sd3 渲染产品页 + demo 埋点 + doc 链接", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/sd3", {
      waitUntil: "domcontentloaded",
    });
    await expectLiveShell(page);
    const genBtn = page.locator("#btn-product-generate");
    await expect(genBtn).toBeVisible({ timeout: 30_000 });
    await expect(genBtn).toHaveAttribute("data-gtm-product-name", "sd3");
    await expect(
      page.locator('a[href*="stable-diffusion-3-medium"]').first(),
    ).toBeVisible();
  });
  test("voice-cloning 渲染产品页 + 专属 title", async ({ page }) => {
    await setup(page);
    await page.goto("/model-api/product/voice-cloning", {
      waitUntil: "domcontentloaded",
    });
    await expectLiveShell(page);
    await expect(page).toHaveTitle(/voice cloning/i);
  });
});
