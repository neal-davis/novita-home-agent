import { test as setup, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * smoke 套件的登录态准备（移植自 admin-cloudplatform 的 auth.setup 模式）。
 *
 * E2E_NOVITA_TOKEN（.env.e2e，dev 环境用户 JWT）→ 种 token cookie → 落 storageState，
 * 供 smoke 项目的所有 spec 复用（见 playwright.smoke.config.ts 的 dependencies）。
 *
 * 无 token 时也要落一个「空登录态」文件——否则 storageState 加载直接报错，
 * 连不需要登录的营销页 smoke 都跑不起来。console 类用例自行 skip（见各 spec 守卫）。
 */
const AUTH_FILE = "e2e_tests/.auth/user.json";

setup("seed token → storageState", async ({ page, baseURL }) => {
  mkdirSync(dirname(AUTH_FILE), { recursive: true });
  const token = process.env.E2E_NOVITA_TOKEN;

  if (!token) {
    await page.context().storageState({ path: AUTH_FILE }); // 空态：营销页 smoke 可跑
    return;
  }

  const host = new URL(baseURL ?? "http://localhost:3000").hostname;
  await page
    .context()
    .addCookies([
      { name: "token", value: token, domain: host, path: "/", sameSite: "Lax" },
    ]);

  // 快速失败：token 过期会被重定向去登录——早死早超生，别让每个 smoke 各超时一遍
  await page.goto("/settings", { waitUntil: "domcontentloaded" });
  await expect(page, "E2E_NOVITA_TOKEN 可能已过期（被弹去登录）").not.toHaveURL(
    /login/,
  );

  await page.context().storageState({ path: AUTH_FILE });
});
