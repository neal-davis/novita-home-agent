import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page, Route } from "@playwright/test";

/**
 * 读取 e2e_tests/fixtures/<name> 并 JSON.parse。
 * 不用 `import x from "./x.json"`（需 import attribute，Playwright loader 不稳定支持）；
 * 也不用 `import.meta.url`——本仓库 package.json 无 "type":"module"（CJS），import.meta
 * 会把 Playwright 的转译切到 ESM 输出、报 "exports is not defined"（实测）。用 __dirname。
 */
export function loadFixture<T = unknown>(name: string): T {
  return JSON.parse(
    readFileSync(join(__dirname, "../fixtures", name), "utf8"),
  ) as T;
}

/**
 * hermetic e2e 的后端拦截层（移植自 admin-cloudplatform）。
 *
 * 本应用的后端是 *.novita.ai（dev：dev-api.novita.ai / dev-api-server.novita.ai，
 * 见 src/api/api.ts 的 BASE_API_URL/service_base_url），另有本仓库自己的 route handler
 * （同源 /api/*）。hermetic 层把这些全部 mock 成确定性 fixture。
 *
 * 关键（admin 的「Vite 模块白屏陷阱」在 App Router 的对应物）：绝不能拦截 Next 自身的
 * 资源——/_next/*（编译产物/RSC payload/HMR）、/sw.js、字体、以及 localhost 的页面文档
 * 导航请求，否则页面直接白屏。因此用 URL 谓词精确判定：只拦 novita.ai 域 + 同源 /api/*。
 */

export interface MockOptions {
  /**
   * 按 pathname 片段精确注入的响应：{ "/v1/billing/summary": {...fixture} }。
   * 命中即返回该 body（status 200）。这是 e2e-test-author 的主要注入口——
   * 新功能涉及的端点直接以抓取并脱敏后的 fixture 注入，不用每加一个端点改本文件。
   */
  endpoints?: Record<string, unknown>;
  /** 指定 pathname 片段返回错误：{ "/v1/billing/summary": 500 }（测错误分支用） */
  failEndpoints?: Record<string, number>;
  /**
   * 未命中 endpoints 的后端调用的兜底 body。默认 { code: 0, data: {} }
   * （本仓库 src/api/api.ts 按 res.code >= 400 判错，code 0 视为成功）。
   * 注意：列表类组件常要求 { list, total } / { data } 形状——兜底壳子撑不起表格，
   * 该路由真正消费的端点务必显式注入，别依赖兜底（admin 实测 fetchAllPages 会因
   * total 形状不对而 hang）。
   */
  fallback?: unknown;
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

/** 判断一个 URL 是否是「真实后端 API 调用」（而非 Next 内部资源/页面导航/三方脚本）。 */
export function isBackendApi(url: URL): boolean {
  const p = url.pathname;
  // Next 内部 / 静态资源 —— 一律放行（拦了就白屏）
  if (
    p.startsWith("/_next/") ||
    p.startsWith("/__nextjs") ||
    p === "/sw.js" ||
    p.startsWith("/workbox-") ||
    /\.(js|css|map|png|jpg|jpeg|webp|svg|ico|woff2?|ttf)$/.test(p)
  ) {
    return false;
  }
  // 后端：novita.ai 全域（dev-api / dev-api-server / api / api-server）
  if (url.hostname.endsWith("novita.ai")) return true;
  // 本仓库自己的 route handler（同源 /api/*，如 /api/chat-models）
  if (/^localhost$|^127\./.test(url.hostname) && p.startsWith("/api/"))
    return true;
  return false;
}

/**
 * 三方分析/打点/同意域：mock 模式统一 204，保证确定性 + 提速（不算后端信号）。
 * cookiebot：layout.tsx 客户端注入 https://consent.cookiebot.com/uc.js，会渲染 role="dialog"
 * 的同意弹窗（id=CybotCookiebotDialog）——它既污染 getByRole("dialog")（strict-mode 命中 2 个），
 * 又用全屏遮罩 intercept pointer events 卡死点击。build:test+start 下必现（dev 常因 geo/时序不弹，
 * 故本地验证看不到）。与其余三方脚本一样 204 掉，让 hermetic 交互用例确定性化。
 */
const ANALYTICS_HOSTS =
  /amplitude|segment|sentry|datadog|vercel-insights|vercel-analytics|tapfiliate|challenges\.cloudflare|googletagmanager|google-analytics|clarity|hotjar|cookiebot/;

export async function mockBackend(page: Page, opts: MockOptions = {}) {
  const {
    endpoints = {},
    failEndpoints = {},
    fallback = { code: 0, data: {} },
  } = opts;

  await page.route(
    (url) => isBackendApi(url) || ANALYTICS_HOSTS.test(url.hostname),
    (route) => {
      const u = new URL(route.request().url());
      if (ANALYTICS_HOSTS.test(u.hostname))
        return route.fulfill({ status: 204, body: "" });

      const p = u.pathname;
      for (const [frag, status] of Object.entries(failEndpoints)) {
        if (p.includes(frag))
          return json(
            route,
            { code: status, message: "e2e mock error" },
            status,
          );
      }
      for (const [frag, body] of Object.entries(endpoints)) {
        if (p.includes(frag)) return json(route, body);
      }
      return json(route, fallback);
    },
  );
}

/** 注入 token cookie，让应用视作已登录会话（src/api/api.ts 读 Cookies.get("token")）。 */
export async function seedAuth(page: Page, token = "e2e-fake-token") {
  await page
    .context()
    .addCookies([
      { name: "token", value: token, domain: "localhost", path: "/" },
    ]);
}
