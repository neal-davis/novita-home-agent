#!/usr/bin/env node
// scripts/agent/route-catalog.mjs —— 全站 App Router 路由目录（catalog-driven 健康巡检的输入）。
//
// 与 diff-routes.mjs 的分工：
//   diff-routes  = 「改了什么 → 测什么」（增量，verify-task 用，深度）
//   route-catalog= 「全站有哪些 page 路由 → 全量健康巡检」（广度，sweep.spec.ts 用）
// 两者共用 diff-routes.lib.mjs 的纯函数映射（pageIndex/segmentsToUrl），
// 保证「一个文件 → 是什么路由」只有一处定义，不会两套规则漂移。
//
// 用法：
//   node scripts/agent/route-catalog.mjs               人类可读
//   node scripts/agent/route-catalog.mjs --json        结构化到 stdout
//   node scripts/agent/route-catalog.mjs --out <file>  写 JSON 文件（供 sweep.spec.ts 读取）
//
// 每条：{ route, url, needsParams, sampleUrl, blocked, blockReason, special }
//   静态路由           → url = route，可直接巡检
//   动态 [param] 路由  → url = route-samples.json 的示例；无示例 → blocked:"needs-params"
//   平行/拦截路由       → 无法直接导航（@slot /(.)）→ blocked:"special-route"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pageIndex } from "./diff-routes.lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

// 与 diff-routes.mjs 同款的 page 文件枚举（不引第三方，避免新增依赖）。
function* walk(dir, filter) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p, filter);
    else if (filter(p)) yield p;
  }
}

const allPageFiles = [...walk("src/app", (p) => /\/page\.[tj]sx?$/.test(p))];
const { pages } = pageIndex(allPageFiles);

const sampleMapPath = join(HERE, "route-samples.json");
const sampleMap = existsSync(sampleMapPath)
  ? JSON.parse(readFileSync(sampleMapPath, "utf8"))
  : {};

// 运行时依赖 query 参数才有内容的路由（文件系统无 [param] 信号，需显式列）。
// sweep 无法提供真实参数 → 标 blocked(needs-context)，与动态无采样路由同等对待，避免假白屏。
const NEEDS_CONTEXT = {
  "/team-invite": "需 ?token=（邀请链接，无法采样）",
};

const seen = new Set();
const catalog = [];
for (const p of pages) {
  if (seen.has(p.urlTemplate)) continue; // 同一 urlTemplate 只收一次
  seen.add(p.urlTemplate);

  const sampleUrl = sampleMap[p.urlTemplate] ?? null;
  let url = p.urlTemplate;
  let blocked = false;
  let blockReason = null;

  if (p.special && p.special.length) {
    blocked = true;
    blockReason = "special-route"; // @slot / 拦截路由：不能直接 goto
    url = null;
  } else if (NEEDS_CONTEXT[p.urlTemplate]) {
    blocked = true;
    blockReason = "needs-context"; // 依赖 query 参数（如 ?token=），无法采样
    url = null;
  } else if (p.needsParams) {
    if (sampleUrl) {
      url = sampleUrl;
    } else {
      blocked = true;
      blockReason = "needs-params"; // 动态段无采样 URL → 补 route-samples.json 才能巡检
      url = null;
    }
  }

  catalog.push({
    route: p.urlTemplate,
    url,
    needsParams: p.needsParams,
    sampleUrl,
    blocked,
    blockReason,
    special: p.special && p.special.length ? p.special : undefined,
  });
}
catalog.sort((a, b) => a.route.localeCompare(b.route));

const summary = {
  total: catalog.length,
  navigable: catalog.filter((c) => !c.blocked).length,
  blocked: catalog.filter((c) => c.blocked).length,
};
const payload = { generatedFrom: "src/app", summary, routes: catalog };

if (outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");
  console.error(
    `✓ route catalog → ${outPath}（${summary.total} 路由：${summary.navigable} 可巡检 / ${summary.blocked} blocked）`,
  );
} else if (asJson) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(
    `全站 ${summary.total} 个 page 路由：${summary.navigable} 可巡检 / ${summary.blocked} blocked\n`,
  );
  for (const c of catalog) {
    const tag = c.blocked
      ? `  ⚠ blocked(${c.blockReason})`
      : c.needsParams
        ? `  → 示例 ${c.url}`
        : "";
    console.log(`  ${c.route}${tag}`);
  }
}
