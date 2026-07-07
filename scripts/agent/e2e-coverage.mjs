#!/usr/bin/env node
// scripts/agent/e2e-coverage.mjs —— e2e 路由覆盖率报告（广度 sweep + 深度 spec 双口径）。
//
// 为什么双口径：本仓库的 e2e 分两层——
//   ① 广度 sweep（sweep.spec.ts）：每个可巡检路由都被导航 + 健康断言（覆盖面，弱断言）。
//   ② 深度 spec（billing-overview / pricing / ...）：针对单路由的交互/数据行为断言（强断言，少而精）。
// 「覆盖率」必须分开报，否则用 sweep 的 93% 冒充「深度覆盖」是自欺。
//
// 用法：
//   node scripts/agent/e2e-coverage.mjs            人类可读 + markdown 到 stdout
//   node scripts/agent/e2e-coverage.mjs --json     结构化
//   node scripts/agent/e2e-coverage.mjs --out <f>  写 markdown 文件（PR 附报告用）
//
// 深度覆盖判定：扫 e2e_tests/**/*.spec.ts（除 sweep.spec.ts）里的 page.goto("<path>")，
// 把命中的 path 映射回 catalog 路由 → 该路由算「深度覆盖」。
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

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../..");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

const catalogPath = join(ROOT, "e2e_tests/route-catalog.generated.json");
if (!existsSync(catalogPath)) {
  console.error(
    "✗ 缺 e2e_tests/route-catalog.generated.json——先跑 `npm run route:catalog -- --out e2e_tests/route-catalog.generated.json`",
  );
  process.exit(1);
}
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

// ---------- 扫深度 spec 的 goto 目标 ----------
function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.spec\.ts$/.test(name) && name !== "sweep.spec.ts") yield p;
  }
}
const GOTO_RE = /goto\(\s*[`"']([^`"'?#]+)/g;
const norm = (u) => (u.length > 1 ? u.replace(/\/+$/, "") : u);

const deepByRoute = new Map(); // route → Set(spec 文件相对路径)
const specFiles = [...walk(join(ROOT, "e2e_tests"))];
const gotoPaths = new Map(); // path → Set(spec)
for (const f of specFiles) {
  const src = readFileSync(f, "utf8");
  const rel = f.slice(ROOT.length + 1);
  for (const m of src.matchAll(GOTO_RE)) {
    const p = norm(m[1]);
    if (!p.startsWith("/")) continue;
    if (!gotoPaths.has(p)) gotoPaths.set(p, new Set());
    gotoPaths.get(p).add(rel);
  }
}

// path → catalog 路由：等于 url / route 模板 / sampleUrl 即命中
for (const r of catalog.routes) {
  const keys = [r.url, r.route, r.sampleUrl].filter(Boolean).map(norm);
  for (const [p, specs] of gotoPaths) {
    if (keys.includes(p)) {
      if (!deepByRoute.has(r.route)) deepByRoute.set(r.route, new Set());
      specs.forEach((s) => deepByRoute.get(r.route).add(s));
    }
  }
}

const total = catalog.summary.total;
const navigable = catalog.summary.navigable;
const blocked = catalog.summary.blocked;
const deep = deepByRoute.size;
const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) : "0.0");

const summary = {
  total,
  navigable,
  blocked,
  sweepCovered: navigable, // sweep 覆盖所有可巡检路由
  deepCovered: deep,
  routeCoveragePct: Number(pct(navigable, total)), // 广度：任意 e2e 触达
  deepCoveragePct: Number(pct(deep, total)), // 深度：专属行为 spec
};

// ---------- markdown ----------
const deepRoutes = [...deepByRoute.entries()]
  .map(([route, specs]) => ({ route, specs: [...specs] }))
  .sort((a, b) => a.route.localeCompare(b.route));

const md = [
  "## E2E 路由覆盖率",
  "",
  `> 双口径：**广度**（sweep 健康巡检，每路由导航+不崩断言）与**深度**（专属行为 spec，断言交互/数据）。`,
  "",
  "| 口径 | 覆盖 | 占比 | 说明 |",
  "| --- | --- | --- | --- |",
  `| **路由覆盖**（≥1 个 e2e 触达） | ${navigable}/${total} | **${summary.routeCoveragePct}%** | sweep 覆盖全部可巡检路由 |`,
  `| **深度行为 spec** | ${deep}/${total} | ${summary.deepCoveragePct}% | 像 billing-overview 那样断言行为 |`,
  `| blocked（无法采样） | ${blocked}/${total} | ${pct(blocked, total)}% | 动态 \`[param]\` 无样例 / needs-context |`,
  "",
  `**目标线 60%**：路由覆盖 ${summary.routeCoveragePct >= 60 ? "✅ 已达成" : "❌ 未达成"}（${summary.routeCoveragePct}%）；深度覆盖 ${summary.deepCoveragePct}%（持续补充中）。`,
  "",
  `### 已有深度 spec 的路由（${deep}）`,
  deep ? "" : "_（暂无）_",
  ...deepRoutes.map((d) => `- \`${d.route}\` — ${d.specs.join(", ")}`),
].join("\n");

if (outPath) {
  mkdirSync(dirname(join(ROOT, outPath)), { recursive: true });
  writeFileSync(join(ROOT, outPath), md + "\n");
  console.error(
    `✓ 覆盖率报告 → ${outPath}（路由覆盖 ${summary.routeCoveragePct}% / 深度 ${summary.deepCoveragePct}%）`,
  );
} else if (asJson) {
  console.log(JSON.stringify({ summary, deepRoutes }, null, 2));
} else {
  console.log(md);
}
