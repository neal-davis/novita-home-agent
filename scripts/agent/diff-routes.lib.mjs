// scripts/agent/diff-routes.lib.mjs —— diff → App Router 路由映射的纯函数核心。
//
// 设计（沿袭 admin-cloudplatform 的 shell/lib 分层）：本文件零 IO、零 git——
// 全部输入（变更文件列表、page 文件清单、反向 import 查询）由 diff-routes.mjs 注入，
// 因此可被 tests/unit/ 下的 Jest 直接单测。
//
// App Router 映射规则：
//   src/app/**/page.tsx                → 自身路由
//   src/app/**/layout|template.tsx    → 子树内所有 page（封顶 layoutCap，根 layout 记 globalScope）
//   src/app/**/error|loading|not-found.tsx → 所在 segment 的 page
//   src/app/**/route.ts               → apiRoutes（同时被 server-impact 捕获）
//   src/app/** 非路由文件（组件/工具）  → 最近祖先 segment 的 page + 其子树
//   src/** 共享文件                    → 有界反向 import BFS（traceToRoutes）
// 动态段 [param] → needsParams，URL 须由 route-samples.json 提供示例，否则 BLOCKED(needs-params)。
// 路由组 (group) 不影响 URL 直接剥掉；@slot / (.) 拦截路由只标记不深究（当前仓库没有，防御性处理）。

const SERVER_IMPACT_PATTERNS = [
  /^(src\/)?middleware\.[tj]sx?$/,
  /^next\.config\.(js|mjs|ts)$/,
  /^src\/app\/(.+\/)?route\.[tj]sx?$/,
  /^(src\/)?instrumentation\.[tj]sx?$/,
  /^scripts\/i18n\//,
  /^scripts\/watcher\//,
  /^package\.json$/,
  /^src\/app\/layout\.tsx$/,
];

export const isServerImpact = (file) =>
  SERVER_IMPACT_PATTERNS.some((re) => re.test(file));

export const isTestFile = (file) =>
  /\.(test|spec)\.[tj]sx?$/.test(file) ||
  file.startsWith("tests/") ||
  file.startsWith("e2e_tests/") ||
  /\/__tests__\//.test(file);

const ROUTE_FILE_RE =
  /^(page|route|layout|template|error|global-error|loading|not-found|default)\.[tj]sx?$/;

// 目录 segment 序列 → URL 模板。返回 { url, needsParams, special }
export function segmentsToUrl(segments) {
  const kept = [];
  const special = [];
  let needsParams = false;
  for (let seg of segments) {
    if (/^\(\.{1,3}\)/.test(seg)) {
      special.push("intercepting");
      seg = seg.replace(/^(\(\.{1,3}\))+/, "");
      if (!seg) continue;
    }
    if (seg.startsWith("(") && seg.endsWith(")")) continue; // route group，不进 URL
    if (seg.startsWith("@")) {
      special.push("parallel");
      continue;
    }
    if (seg.includes("[")) needsParams = true;
    kept.push(seg);
  }
  return { url: "/" + kept.join("/"), needsParams, special };
}

// 仓库相对路径 → 路由描述。非 src/app 文件返回 null；app 内非路由文件 kind="support"。
export function fileToRoute(file) {
  if (!file.startsWith("src/app/")) return null;
  const parts = file.slice("src/app/".length).split("/");
  const base = parts.pop();
  const m = base.match(ROUTE_FILE_RE);
  if (!m) return { kind: "support", segments: parts, file };
  const { url, needsParams, special } = segmentsToUrl(parts);
  return {
    kind: m[1],
    urlTemplate: url,
    needsParams,
    special,
    segments: parts,
    file,
  };
}

export function pageIndex(allPageFiles) {
  const pages = allPageFiles
    .map(fileToRoute)
    .filter((r) => r && r.kind === "page");
  return { pages, byUrl: new Map(pages.map((p) => [p.urlTemplate, p])) };
}

function descendantsOf(url, pages) {
  const prefix = url === "/" ? "/" : url + "/";
  return pages.filter(
    (p) => p.urlTemplate === url || p.urlTemplate.startsWith(prefix),
  );
}

// app 内 support 文件：沿目录向上找最近的、确实存在 page 的 segment URL；找不到返回 null
export function nearestPageUrl(segments, byUrl) {
  for (let i = segments.length; i >= 0; i--) {
    const { url } = segmentsToUrl(segments.slice(0, i));
    if (byUrl.has(url)) return url;
  }
  return null;
}

// 变更文件列表 → 受影响路由结构（不含共享文件的 import 追踪，那一步见 traceToRoutes）
export function resolveRoutes(changedFiles, allPageFiles, opts = {}) {
  const sampleMap = opts.sampleMap || {};
  const layoutCap = opts.layoutCap ?? 15;
  const { pages, byUrl } = pageIndex(allPageFiles);

  const routes = new Map();
  const out = {
    affectedRoutes: [],
    sharedFiles: [],
    unmappedAppFiles: [],
    serverImpactFiles: [],
    apiRoutes: [],
    globalScopeFiles: [],
  };

  const addRoute = (urlTemplate, file, reason, needsParams) => {
    const entry = routes.get(urlTemplate) || {
      route: urlTemplate,
      needsParams: !!needsParams,
      sampleUrl: sampleMap[urlTemplate] ?? null,
      files: new Set(),
      reasons: new Set(),
    };
    entry.files.add(file);
    entry.reasons.add(reason);
    routes.set(urlTemplate, entry);
  };

  const addSubtree = (url, file, reason) => {
    const subtree = descendantsOf(url, pages);
    for (const pg of subtree.slice(0, layoutCap))
      addRoute(pg.urlTemplate, file, reason, pg.needsParams);
    return subtree.length;
  };

  for (const file of changedFiles) {
    if (isTestFile(file)) continue;
    if (isServerImpact(file)) out.serverImpactFiles.push(file);

    const r = fileToRoute(file);
    if (!r) {
      if (file.startsWith("src/")) out.sharedFiles.push(file);
      continue; // 非 src（next.config/package.json 等）已被 server-impact 捕获
    }
    if (r.kind === "route") {
      out.apiRoutes.push({ path: r.urlTemplate, file });
      continue;
    }
    if (
      r.kind === "global-error" ||
      ((r.kind === "layout" || r.kind === "template") &&
        r.segments.length === 0)
    ) {
      out.globalScopeFiles.push(file); // 根 layout/全局错误页：全局影响，由 analyzer 抽样代表路由
      continue;
    }
    if (r.kind === "layout" || r.kind === "template") {
      if (addSubtree(r.urlTemplate, file, r.kind) === 0)
        out.unmappedAppFiles.push(file);
      continue;
    }
    if (r.kind === "support") {
      const url = nearestPageUrl(r.segments, byUrl);
      if (url == null) out.unmappedAppFiles.push(file);
      else addSubtree(url, file, "ancestor-segment");
      continue;
    }
    // page / error / loading / not-found / default
    const pg = byUrl.get(r.urlTemplate);
    if (r.kind === "page" || pg)
      addRoute(r.urlTemplate, file, r.kind, (pg || r).needsParams);
    else out.unmappedAppFiles.push(file);
  }

  out.affectedRoutes = [...routes.values()]
    .map((e) => ({ ...e, files: [...e.files], reasons: [...e.reasons] }))
    .sort((a, b) => a.route.localeCompare(b.route));
  return out;
}

// ---------- 反向 import 追踪（共享文件 → 路由） ----------

const IMPORT_RE =
  /(?:from\s*|import\s*\(\s*|require\s*\(\s*|jest\.mock\s*\(\s*)["']([^"']+)["']/g;

export function extractImportSpecifiers(source) {
  const specs = [];
  for (const m of source.matchAll(IMPORT_RE)) specs.push(m[1]);
  return specs;
}

// import 说明符 → 仓库相对路径（无扩展名）。裸包名返回 null。纯字符串运算，不触 fs。
export function resolveSpecifier(importerFile, spec) {
  if (spec.startsWith("@/")) return "src/" + spec.slice(2);
  if (spec.startsWith(".")) {
    const parts = importerFile.split("/").slice(0, -1);
    for (const part of spec.split("/")) {
      if (part === "." || part === "") continue;
      if (part === "..") parts.pop();
      else parts.push(part);
    }
    return parts.join("/");
  }
  return null;
}

export function specifierResolvesTo(importerFile, spec, targetFile) {
  const resolved = resolveSpecifier(importerFile, spec);
  if (!resolved) return false;
  const targetNoExt = targetFile.replace(/\.[tj]sx?$/, "");
  return (
    resolved === targetNoExt ||
    resolved === targetFile ||
    `${resolved}/index` === targetNoExt
  );
}

// 共享文件 → 受影响路由集合。findImporters(file) 由 shell 注入（rg/grep + 精确 resolution）。
// 有界 BFS：DEPTH/FANOUT/TOTAL/ROUTECAP 任一越界即 truncated=true（结果是下界而非全集，analyzer 须知）。
// routeCap：命中路由数到顶就提前收手——已追到几十条路由的文件本质是「全局影响」，
// 继续逐文件 rg 只是烧时间（utils.ts 这类热点文件全量追踪要一分钟以上）。
export function traceToRoutes(startFile, deps) {
  const {
    findImporters,
    allPageFiles,
    depth = 4,
    fanout = 40,
    total = 400,
    layoutCap = 15,
    routeCap = 40,
  } = deps;
  const { pages, byUrl } = pageIndex(allPageFiles);
  const visited = new Set([startFile]);
  const routes = new Set();
  let truncated = false;

  const addSubtree = (url) => {
    for (const pg of descendantsOf(url, pages).slice(0, layoutCap))
      routes.add(pg.urlTemplate);
  };

  let queue = [{ file: startFile, d: 0 }];
  while (queue.length) {
    if (routes.size >= routeCap) {
      truncated = true;
      break;
    }
    const { file, d } = queue.shift();
    if (d >= depth) {
      truncated = true;
      continue;
    }
    let importers = findImporters(file);
    if (importers.length > fanout) {
      truncated = true;
      importers = importers.slice(0, fanout);
    }
    for (const imp of importers) {
      if (visited.has(imp) || isTestFile(imp)) continue;
      visited.add(imp);
      if (visited.size > total) {
        truncated = true;
        queue = [];
        break;
      }
      const r = fileToRoute(imp);
      if (!r) {
        queue.push({ file: imp, d: d + 1 }); // src/ 共享文件，继续向上追
      } else if (r.kind === "support") {
        const url = nearestPageUrl(r.segments, byUrl);
        if (url != null) addSubtree(url);
        queue.push({ file: imp, d: d + 1 }); // app 内组件也可能被别处 import
      } else if (r.kind === "page") {
        routes.add(r.urlTemplate);
      } else if (r.kind === "route") {
        routes.add("api:" + r.urlTemplate);
      } else if (r.segments.length === 0 || r.kind === "global-error") {
        routes.add("(global)");
      } else {
        addSubtree(r.urlTemplate); // 子树 layout/template/error/loading
      }
    }
  }
  return { routes: [...routes].sort(), truncated, visitedCount: visited.size };
}
