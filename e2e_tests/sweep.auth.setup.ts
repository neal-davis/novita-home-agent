import { test as setup, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { getActiveProfile, SWEEP_AUTH_FILE } from "./profiles";

/**
 * sweep 真机 profile（local-live / online-staging / online-prod）的登录态准备。
 * 泛化自 e2e_tests/smoke/auth.setup.ts：按 active profile 的 tokenEnvVar 读 JWT
 * （手动粘贴进 .env.e2e，gitignored）→ 种 token cookie（app 读 Cookies.get("token")）
 * → 落 storageState 供 sweep 项目复用（见 playwright.sweep.config.ts 的 dependencies）。
 *
 * 无 token：落「空登录态」文件（不报错），需登录页在巡检里自然表现为被弹去 /login，
 * 由健康断言体现——不在这里硬失败（营销页巡检不需要登录态）。
 *
 * 只有 real profile 才会挂这个 setup（mock profile 用 helpers/mockBackend 的 seedAuth 假 token）。
 */
setup("seed profile token → storageState", async ({ page, baseURL }) => {
  mkdirSync(dirname(SWEEP_AUTH_FILE), { recursive: true });
  const profile = getActiveProfile();
  const token = profile.tokenEnvVar
    ? process.env[profile.tokenEnvVar]
    : undefined;

  if (!token) {
    await page.context().storageState({ path: SWEEP_AUTH_FILE }); // 空态：营销页可跑
    console.warn(
      `[sweep auth] profile "${profile.name}" 无 token（${profile.tokenEnvVar ?? "n/a"} 未设），以未登录态巡检。`,
    );
    return;
  }

  const host = new URL(baseURL ?? profile.baseURL).hostname;
  await page
    .context()
    .addCookies([
      { name: "token", value: token, domain: host, path: "/", sameSite: "Lax" },
    ]);

  // 验证 token 真有效：导航探针页，等它发出的鉴权 XHR 并断言 200。
  // ⚠ 不能靠 URL 判鉴权——console 页未登录不做 URL 重定向、只在客户端显示登出态，
  //   URL 探针（not toHaveURL /login）对真假 token 都「绿」（实测假阳性）。只有看接口状态码才可靠。
  const probePage = profile.authProbe ?? "/billing";
  const probeApi = profile.authProbeApi ?? "/v1/user/info";
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes(probeApi), {
      timeout: 25_000,
    }),
    page.goto(probePage, { waitUntil: "domcontentloaded" }),
  ]);
  expect(
    resp.status(),
    `${profile.tokenEnvVar} 鉴权失败：${probeApi} 返回 ${resp.status()}（token 过期/无效？）`,
  ).toBe(200);

  await page.context().storageState({ path: SWEEP_AUTH_FILE });
});
