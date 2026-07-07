#!/usr/bin/env node
// scripts/agent/warm-routes.mjs —— 真机验证前的路由预热。
//
// 为什么：next dev 按需编译，重路由首次访问可达数十秒。若不预热，ui-live-runner 会把
// 「编译中」误判成白屏/超时（假 BUG_FOUND）。预热也顺带验证 route-samples.json 的示例
// 是否还存在（404 会被标出）。
//
// 用法：node scripts/agent/warm-routes.mjs --routes /pricing,/billing/overview \
//         [--base http://localhost:3000] [--timeout 120000]
// 输出：逐路由 JSON 行 {route,status,ms,ok}；末尾汇总。
// 退出码：0 = 全部预热成功（HTTP < 500）；1 = 有路由编译失败/超时（4xx 算预热成功但 ok=false 标出）。
const args = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : dflt;
};
const base = get("--base", process.env.E2E_BASE_URL || "http://localhost:3000");
const budget = Number(get("--timeout", 120000)); // 每路由预算
const routes = (get("--routes", "") || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!routes.length) {
  console.error(
    "用法：warm-routes.mjs --routes /a,/b [--base url] [--timeout ms]",
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let warmFailed = 0;
const results = [];

for (const route of routes) {
  const started = Date.now();
  let status = 0;
  let lastErr = "";
  while (Date.now() - started < budget) {
    try {
      // 单次请求给足编译时间（预算的剩余量），跟随 middleware 的 locale 跳转
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), budget - (Date.now() - started));
      const res = await fetch(base + route, {
        signal: ctl.signal,
        redirect: "follow",
      });
      clearTimeout(t);
      status = res.status;
      if (status < 500) break; // 编译完成（404 也说明 server 已应答，单独标 ok=false）
    } catch (e) {
      lastErr = String(e && e.cause ? e.cause.code || e.cause : e.message || e);
    }
    await sleep(3000);
  }
  const ms = Date.now() - started;
  const warmed = status > 0 && status < 500;
  const ok = status > 0 && status < 400;
  if (!warmed) warmFailed++;
  const line = { route, status, ms, ok };
  if (!warmed && lastErr) line.error = lastErr;
  results.push(line);
  console.log(JSON.stringify(line));
}

const notFound = results.filter((r) => r.status >= 400 && r.status < 500);
if (notFound.length)
  console.error(
    `⚠ ${notFound.length} 个路由返回 4xx（示例 URL 失效或路由不存在）：${notFound.map((r) => r.route).join(", ")}`,
  );
if (warmFailed) {
  console.error(`✗ ${warmFailed} 个路由预热失败（编译失败或超时 ${budget}ms）`);
  process.exit(1);
}
console.error(`✓ ${routes.length} 个路由预热完成`);
