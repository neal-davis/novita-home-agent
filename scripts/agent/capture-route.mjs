#!/usr/bin/env node
// scripts/agent/capture-route.mjs —— 只读抓取若干 prod 路由的真实后端响应，作 hermetic fixture 素材。
//
// 设计：deep e2e 的 fixture 需要真实响应「形状」。这里在真实浏览器上下文（带预取 token cookie）
// 导航 prod 路由，收集其客户端发出的后端 JSON 响应（/v1 /v3 /api）。**只读**——只 GET 导航，
// 不点击/提交。抓到的 raw（含 PII）落 gitignored 任务档案，由 e2e-test-author 脱敏成 fixture。
//
// 用法：
//   node scripts/agent/capture-route.mjs --manifest <routes.json> --outdir <dir> [--base https://novita.ai]
//   manifest：[{ "slug": "billing-budgets", "url": "/billing/budgets" }, ...]
//   产物：<outdir>/<slug>-captured.json = { "<pathname>": { status, body } }
// token：.env.e2e 的 E2E_TOKEN_PROD。
import { chromium } from "@playwright/test";
import dotenv from "dotenv";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

dotenv.config({ path: ".env.e2e" });
const args = process.argv.slice(2);
const get = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : d;
};
const manifestPath = get("--manifest");
const outdir = get("--outdir");
const base = get("--base", "https://novita.ai");
if (!manifestPath || !outdir) {
  console.error("用法：--manifest <routes.json> --outdir <dir> [--base url]");
  process.exit(1);
}
const tok = process.env.E2E_TOKEN_PROD || "";
if (!tok) {
  console.error("✗ 无 E2E_TOKEN_PROD（.env.e2e）——console 路由抓不到鉴权数据。");
  process.exit(1);
}

const routes = JSON.parse(readFileSync(manifestPath, "utf8"));
mkdirSync(outdir, { recursive: true });
const host = new URL(base).hostname;

const collectable = (u) =>
  u.hostname.endsWith("novita.ai") && /\/(v1|v3|api)\//.test(u.pathname);

const browser = await chromium.launch();
const ctx = await browser.newContext();
await ctx.addCookies([
  { name: "token", value: tok, domain: host, path: "/", sameSite: "Lax" },
]);

const summary = [];
for (const { slug, url } of routes) {
  const page = await ctx.newPage();
  const cap = {};
  page.on("response", async (r) => {
    try {
      const u = new URL(r.url());
      if (!collectable(u)) return;
      if (!(r.headers()["content-type"] || "").includes("json")) return;
      const body = await r.json().catch(() => null);
      if (body != null) cap[u.pathname] = { status: r.status(), body };
    } catch {}
  });
  await page
    .goto(base + url, { waitUntil: "domcontentloaded", timeout: 45000 })
    .catch((e) => console.log(`  ${slug} goto:`, e.message));
  await page.waitForTimeout(6000);
  const out = join(outdir, `${slug}-captured.json`);
  writeFileSync(out, JSON.stringify(cap, null, 2));
  const n = Object.keys(cap).length;
  summary.push({ slug, url, endpoints: n });
  console.log(`✓ ${slug} (${url}) → ${n} endpoints`);
  await page.close();
}
await browser.close();
console.log("\n抓取汇总：");
summary.forEach((s) =>
  console.log(`  ${s.endpoints.toString().padStart(2)} ep  ${s.url}`),
);
