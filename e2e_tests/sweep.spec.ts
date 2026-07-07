import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mockBackend, seedAuth, isBackendApi } from "./helpers/mockBackend";
import { getActiveProfile } from "./profiles";

/**
 * catalog-driven 全站健康巡检（Phase 1）。
 *
 * 输入：route-catalog.generated.json（由 scripts/agent/route-catalog.mjs 生成；
 *       npm run test:e2e:sweep 会先生成再跑）。
 * 定位：覆盖**广度**（全站每个 page 路由都被导航一次），不覆盖**深度**（具体交互/数据值
 *       的断言交给 verify-task 的逐路由 e2e-test-author）。一个 spec 顶替「139 个手写文件」。
 *
 * 断言纪律（与 e2e-test-author 一致）：**绝不断言 i18n 文案、不断言业务数据值**，只看页面有没有真坏。
 *   硬失败（page 真的坏了）：
 *     - 主文档导航返回 5xx
 *     - 命中错误边界 <h1>Error</h1>（src/app/error.tsx）
 *     - 白屏（body 文本 < 阈值）
 *   软信号（记进 annotation，默认不判失败——139 路由 × 三方脚本噪音，硬判会长红）：
 *     - console error / 后端 5xx（非主文档）
 *     - 设 E2E_STRICT_CONSOLE=1 可把软信号升级为硬失败
 *
 * 后端接法随 profile（见 profiles.ts）：
 *   - mock：mockBackend(page) 确定性化 + seedAuth 假 token（hermetic，CI 门禁，零外部依赖）
 *   - real：storageState 由 config 注入真 token；!allowMutations 时安装只读护栏（abort 非 GET）
 */

const profile = getActiveProfile();
const STRICT_CONSOLE = process.env.E2E_STRICT_CONSOLE === "1";
const WHITE_SCREEN_MIN_CHARS = 60;
// 纯图/canvas/playground/logo 页文本天然很少——光看文本会假阳性。
// 「非白屏」= 有可观文本 **或** 有可观的已渲染可见元素。
const MIN_RENDERED_ELS = 5;

interface CatalogRoute {
  route: string;
  url: string | null;
  blocked: boolean;
  blockReason: string | null;
}

function loadCatalog(): CatalogRoute[] {
  // __dirname 而非 import.meta（CJS，见 profiles.ts 注释）
  const p = join(__dirname, "route-catalog.generated.json");
  try {
    return JSON.parse(readFileSync(p, "utf8")).routes as CatalogRoute[];
  } catch {
    return [];
  }
}

const catalog = loadCatalog();

/** 只读护栏：非 GET 的真实后端请求一律 abort（生产巡检防误写）。复用 mockBackend 的「什么是后端」定义。 */
async function installReadOnlyGuard(page: Page) {
  await page.route(
    (url) => isBackendApi(url),
    (route) => {
      const m = route.request().method().toUpperCase();
      if (m === "GET" || m === "HEAD" || m === "OPTIONS")
        return route.continue();
      return route.abort(); // 写请求：拦下，绝不打到真实后端
    },
  );
}

test.describe(`@sweep 全站健康巡检 [${profile.name}]`, () => {
  if (!catalog.length) {
    test("route catalog 缺失或为空", () => {
      throw new Error(
        "未找到 route-catalog.generated.json——先跑 " +
          "`node scripts/agent/route-catalog.mjs --out e2e_tests/route-catalog.generated.json`" +
          "（或直接 npm run test:e2e:sweep）。",
      );
    });
    return;
  }

  for (const entry of catalog) {
    // 动态无采样 / 平行·拦截路由：跳过并保留原因，不算失败
    if (entry.blocked || !entry.url) {
      test.skip(`${entry.route}（blocked: ${entry.blockReason ?? "unknown"}）`, () => {});
      continue;
    }

    const url = entry.url;
    test(`${entry.route} 健康`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const serverErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error")
          consoleErrors.push(msg.text().slice(0, 300));
      });
      page.on("response", (res) => {
        if (res.status() >= 500)
          serverErrors.push(`${res.status()} ${res.url().slice(0, 200)}`);
      });

      // 后端接法
      if (profile.backendKind === "mock") {
        await mockBackend(page, {});
        await seedAuth(page); // 假 token，需登录页不被弹走
      } else if (!profile.allowMutations) {
        await installReadOnlyGuard(page);
      }

      const resp = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });

      // 1) 主文档 5xx → 硬失败
      const status = resp?.status() ?? 0;
      expect(status, `${url} 主文档返回 ${status}`).toBeLessThan(500);

      // 2) 错误边界未触发 → 硬失败
      await expect(
        page.getByRole("heading", { name: "Error", exact: true }),
        `${url} 命中错误边界`,
      ).toHaveCount(0);

      // 3) 非白屏 → 硬失败：文本 **或** 已渲染可见元素，二者皆缺才算白屏
      const render = await page.evaluate(() => {
        const b = document.body;
        return {
          text: (b?.innerText || "").trim().length,
          els: b
            ? b.querySelectorAll(
                "img,canvas,svg,video,button,a[href],input,textarea,select,h1,h2,h3,[role='button'],[role='img']",
              ).length
            : 0,
        };
      });
      expect(
        render.text > WHITE_SCREEN_MIN_CHARS || render.els >= MIN_RENDERED_ELS,
        `${url} 疑似白屏（文本 ${render.text} 字符 / 可见元素 ${render.els} 个）`,
      ).toBeTruthy();

      // 4) 软信号 → annotation（默认不判失败）
      if (serverErrors.length)
        test.info().annotations.push({
          type: "backend-5xx",
          description: serverErrors.join("; "),
        });
      if (consoleErrors.length)
        test.info().annotations.push({
          type: "console-error",
          description: consoleErrors.slice(0, 5).join(" | "),
        });

      // STRICT 模式：软信号升级为硬失败
      if (STRICT_CONSOLE) {
        expect(serverErrors, `${url} 后端 5xx`).toHaveLength(0);
        expect(consoleErrors, `${url} console error`).toHaveLength(0);
      }
    });
  }
});
