#!/usr/bin/env node
// scripts/agent/diff-routes.mjs —— 本次改动影响了哪些前端路由（App Router 版，shell 壳）。
//
// 职责：取 git diff 文件清单 + 枚举 src/app 的 page 文件 + 提供反向 import 查询，
// 映射逻辑全部委托给 diff-routes.lib.mjs 的纯函数（可单测）。
//
// 用法：
//   node scripts/agent/diff-routes.mjs                     人类可读输出
//   node scripts/agent/diff-routes.mjs --base origin/main --json   给 agent 的结构化输出
// diff 口径：base...HEAD（三点，merge-base）∪ 工作区未暂存 ∪ 已暂存。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractImportSpecifiers,
  isServerImpact,
  isTestFile,
  resolveRoutes,
  specifierResolvesTo,
  traceToRoutes,
} from "./diff-routes.lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const json = args.includes("--json");
const baseIdx = args.indexOf("--base");
const base = baseIdx >= 0 ? args[baseIdx + 1] : "origin/main";

function git(...a) {
  try {
    return execFileSync("git", a, { encoding: "utf8" });
  } catch (e) {
    return e.stdout || "";
  }
}

const RELEVANT =
  /^(src\/|scripts\/|next\.config\.|package\.json$|middleware\.)/;
const changed = [
  ...new Set(
    [
      ...git("diff", "--name-only", "--diff-filter=d", `${base}...HEAD`).split(
        "\n",
      ),
      ...git("diff", "--name-only", "--diff-filter=d").split("\n"),
      ...git("diff", "--name-only", "--diff-filter=d", "--cached").split("\n"),
    ]
      .map((s) => s.trim())
      .filter((f) => f && RELEVANT.test(f)),
  ),
];

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

const sampleMapPath = join(HERE, "route-samples.json");
const sampleMap = existsSync(sampleMapPath)
  ? JSON.parse(readFileSync(sampleMapPath, "utf8"))
  : {};

// ---------- 反向 import 查询：rg/grep 找候选，再用 lib 的精确 resolution 过滤 ----------
let hasRg = true;
try {
  execFileSync("rg", ["--version"], { stdio: "ignore" });
} catch {
  hasRg = false;
}

function grepCandidates(name) {
  const pattern = `["'][^"']*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
  const cmd = hasRg
    ? ["rg", ["-l", "--no-messages", "-g", "*.{ts,tsx,js,jsx}", pattern, "src"]]
    : [
        "grep",
        [
          "-rEl",
          "--include=*.ts",
          "--include=*.tsx",
          "--include=*.js",
          "--include=*.jsx",
          pattern,
          "src",
        ],
      ];
  try {
    return execFileSync(cmd[0], cmd[1], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch (e) {
    return (e.stdout || "").split("\n").filter(Boolean); // 无匹配时 exit 1
  }
}

const importerCache = new Map();
function findImporters(target) {
  if (importerCache.has(target)) return importerCache.get(target);
  const baseName = target
    .split("/")
    .pop()
    .replace(/\.[tj]sx?$/, "");
  // index 文件按目录名搜（import "@/components/foo" 实指 foo/index.ts）
  const searchName =
    baseName === "index" ? target.split("/").slice(-2, -1)[0] : baseName;
  const importers = grepCandidates(searchName).filter((candidate) => {
    if (candidate === target) return false;
    let source;
    try {
      source = readFileSync(candidate, "utf8");
    } catch {
      return false;
    }
    return extractImportSpecifiers(source).some((spec) =>
      specifierResolvesTo(candidate, spec, target),
    );
  });
  importerCache.set(target, importers);
  return importers;
}

// ---------- 组装 ----------
const result = resolveRoutes(changed, allPageFiles, { sampleMap });

const sharedFiles = result.sharedFiles.map((file) => {
  const { routes, truncated } = traceToRoutes(file, {
    findImporters,
    allPageFiles,
  });
  return { file, routes, truncated };
});

// 追踪到的路由并入 affectedRoutes（reason: import-trace），analyzer 拿到统一清单。
// 例外：truncated 且命中 30+ 路由的热点文件（utils.ts 之类）本质是全局影响——
// 枚举几十条路由对 analyzer 无意义，归入 globalScopeFiles 由其抽样代表路由。
const GLOBALISH_ROUTES = 30;
const byRoute = new Map(result.affectedRoutes.map((r) => [r.route, r]));
for (const sf of sharedFiles) {
  if (sf.truncated && sf.routes.length >= GLOBALISH_ROUTES) {
    sf.effectivelyGlobal = true;
    result.globalScopeFiles.push(sf.file);
    continue;
  }
  for (const route of sf.routes) {
    if (route.startsWith("api:") || route === "(global)") continue;
    const entry = byRoute.get(route) || {
      route,
      needsParams: route.includes("["),
      sampleUrl: sampleMap[route] ?? null,
      files: [],
      reasons: [],
    };
    if (!entry.files.includes(sf.file)) entry.files.push(sf.file);
    if (!entry.reasons.includes("import-trace"))
      entry.reasons.push("import-trace");
    byRoute.set(route, entry);
  }
}

const output = {
  base,
  changedFiles: changed,
  affectedRoutes: [...byRoute.values()].sort((a, b) =>
    a.route.localeCompare(b.route),
  ),
  sharedFiles,
  apiRoutes: result.apiRoutes,
  serverImpactFiles: result.serverImpactFiles,
  serverImpact: result.serverImpactFiles.length > 0,
  globalScopeFiles: result.globalScopeFiles,
  unmappedAppFiles: result.unmappedAppFiles,
  unmappedSharedFiles: sharedFiles
    .filter((s) => s.routes.length === 0)
    .map((s) => s.file),
};

if (json) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`base: ${base}，变更 ${changed.length} 个相关文件\n`);
  if (!output.affectedRoutes.length) console.log("（没有映射到任何前端路由）");
  for (const r of output.affectedRoutes) {
    const tag = r.needsParams
      ? r.sampleUrl
        ? `  → 示例 ${r.sampleUrl}`
        : "  ⚠ 需要参数（无示例）"
      : "";
    console.log(`  ${r.route}${tag}`);
    for (const f of r.files) console.log(`      ${f} (${r.reasons.join(",")})`);
  }
  if (output.serverImpactFiles.length)
    console.log(
      `\n⚠ server-impact 文件（dev 验证可能不够，考虑 build:test）：\n  ${output.serverImpactFiles.join("\n  ")}`,
    );
  if (output.globalScopeFiles.length)
    console.log(
      `\n⚠ 全局影响文件（根 layout 等，需抽样代表路由）：\n  ${output.globalScopeFiles.join("\n  ")}`,
    );
  if (output.unmappedSharedFiles.length)
    console.log(
      `\n? 未追踪到路由的共享文件：\n  ${output.unmappedSharedFiles.join("\n  ")}`,
    );
  if (output.unmappedAppFiles.length)
    console.log(
      `\n? 未映射的 app 内文件：\n  ${output.unmappedAppFiles.join("\n  ")}`,
    );
}
