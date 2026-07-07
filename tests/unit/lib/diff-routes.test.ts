// diff-routes.lib.mjs 纯函数单测——这是 shell/lib 分层的目的：映射规则可机械回归。
import {
  extractImportSpecifiers,
  fileToRoute,
  isServerImpact,
  isTestFile,
  nearestPageUrl,
  pageIndex,
  resolveRoutes,
  resolveSpecifier,
  segmentsToUrl,
  specifierResolvesTo,
  traceToRoutes,
} from "../../../scripts/agent/diff-routes.lib.mjs";

type AffectedRoute = {
  route: string;
  needsParams: boolean;
  sampleUrl: string | null;
  files: string[];
  reasons: string[];
};

type ResolveRoutesResult = {
  affectedRoutes: AffectedRoute[];
  sharedFiles: string[];
  unmappedAppFiles: string[];
  serverImpactFiles: string[];
  apiRoutes: Array<{ path: string; file: string }>;
  globalScopeFiles: string[];
};

const resolveRouteResult = (
  ...args: Parameters<typeof resolveRoutes>
): ResolveRoutesResult =>
  resolveRoutes(...args) as unknown as ResolveRoutesResult;

const PAGES = [
  "src/app/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/billing/page.tsx",
  "src/app/billing/[section]/page.tsx",
  "src/app/billing/budgets/page.tsx",
  "src/app/models/[model_series]/[model_name]/page.tsx",
  "src/app/models-console/llm-playground/page.tsx",
];

describe("segmentsToUrl", () => {
  it("普通段拼 URL，根为 /", () => {
    expect(segmentsToUrl([]).url).toBe("/");
    expect(segmentsToUrl(["pricing"]).url).toBe("/pricing");
  });
  it("剥掉路由组，标记动态段", () => {
    const r = segmentsToUrl(["(marketing)", "models", "[model_series]"]);
    expect(r.url).toBe("/models/[model_series]");
    expect(r.needsParams).toBe(true);
  });
  it("平行/拦截路由不崩溃，只标记 special", () => {
    expect(segmentsToUrl(["@modal", "photo"]).special).toContain("parallel");
    expect(segmentsToUrl(["(.)photo"]).special).toContain("intercepting");
  });
});

describe("fileToRoute", () => {
  it("page → 自身路由", () => {
    expect(fileToRoute("src/app/pricing/page.tsx")).toMatchObject({
      kind: "page",
      urlTemplate: "/pricing",
      needsParams: false,
    });
  });
  it("动态段 page → needsParams", () => {
    expect(fileToRoute("src/app/billing/[section]/page.tsx")).toMatchObject({
      kind: "page",
      urlTemplate: "/billing/[section]",
      needsParams: true,
    });
  });
  it("route handler / layout / 非路由文件分类", () => {
    expect(fileToRoute("src/app/api/chat/route.ts")?.kind).toBe("route");
    expect(fileToRoute("src/app/billing/layout.tsx")?.kind).toBe("layout");
    expect(fileToRoute("src/app/billing/components/Table.tsx")?.kind).toBe(
      "support",
    );
    expect(fileToRoute("src/lib/utils.ts")).toBeNull();
  });
});

describe("isServerImpact / isTestFile", () => {
  it("middleware / next.config / route handler / 根 layout 命中 server-impact", () => {
    expect(isServerImpact("src/middleware.ts")).toBe(true);
    expect(isServerImpact("next.config.js")).toBe(true);
    expect(isServerImpact("src/app/api/chat/route.ts")).toBe(true);
    expect(isServerImpact("src/app/layout.tsx")).toBe(true);
    expect(isServerImpact("src/app/pricing/page.tsx")).toBe(false);
  });
  it("测试文件被排除在风险计算外", () => {
    expect(isTestFile("tests/unit/lib/utils.test.ts")).toBe(true);
    expect(isTestFile("e2e_tests/pricing.spec.ts")).toBe(true);
    expect(isTestFile("src/lib/utils.ts")).toBe(false);
  });
});

describe("resolveRoutes", () => {
  it("page 变更映射自身；app 内组件映射最近祖先 segment 的子树", () => {
    const out = resolveRouteResult(
      ["src/app/pricing/page.tsx", "src/app/billing/components/Table.tsx"],
      PAGES,
    );
    const routes = out.affectedRoutes.map((r) => r.route);
    expect(routes).toContain("/pricing");
    // billing 子树：/billing、/billing/[section]、/billing/budgets
    expect(routes).toEqual(
      expect.arrayContaining([
        "/billing",
        "/billing/[section]",
        "/billing/budgets",
      ]),
    );
  });
  it("layout 变更展开子树；根 layout 记 globalScope", () => {
    const out = resolveRouteResult(
      ["src/app/billing/layout.tsx", "src/app/layout.tsx"],
      PAGES,
    );
    expect(out.affectedRoutes.map((r) => r.route)).toContain(
      "/billing/budgets",
    );
    expect(out.globalScopeFiles).toContain("src/app/layout.tsx");
    expect(out.serverImpactFiles).toContain("src/app/layout.tsx");
  });
  it("route handler 记 apiRoutes + serverImpact；共享文件进 sharedFiles；测试文件被忽略", () => {
    const out = resolveRouteResult(
      [
        "src/app/api/chat/route.ts",
        "src/lib/utils.ts",
        "tests/unit/lib/x.test.ts",
      ],
      PAGES,
    );
    expect(out.apiRoutes).toEqual([
      { path: "/api/chat", file: "src/app/api/chat/route.ts" },
    ]);
    expect(out.serverImpactFiles).toContain("src/app/api/chat/route.ts");
    expect(out.sharedFiles).toEqual(["src/lib/utils.ts"]);
    expect(out.affectedRoutes).toHaveLength(0);
  });
  it("动态路由带上 sampleUrl", () => {
    const out = resolveRouteResult(
      ["src/app/billing/[section]/page.tsx"],
      PAGES,
      {
        sampleMap: { "/billing/[section]": "/billing/overview" },
      },
    );
    expect(out.affectedRoutes[0]).toMatchObject({
      route: "/billing/[section]",
      needsParams: true,
      sampleUrl: "/billing/overview",
    });
  });
});

describe("import 解析", () => {
  it("extractImportSpecifiers 取 import/require/动态 import", () => {
    const src = `
      import a from "@/lib/utils";
      import { b } from "../hooks/useFoo";
      const c = await import("@/api/user");
      const d = require("./local");
    `;
    expect(extractImportSpecifiers(src)).toEqual([
      "@/lib/utils",
      "../hooks/useFoo",
      "@/api/user",
      "./local",
    ]);
  });
  it("resolveSpecifier：@ 别名与相对路径；裸包名返回 null", () => {
    expect(resolveSpecifier("src/app/pricing/page.tsx", "@/lib/utils")).toBe(
      "src/lib/utils",
    );
    expect(
      resolveSpecifier("src/app/pricing/page.tsx", "../../lib/utils"),
    ).toBe("src/lib/utils");
    expect(resolveSpecifier("src/app/pricing/page.tsx", "react")).toBeNull();
  });
  it("specifierResolvesTo 支持 index 桶文件", () => {
    expect(
      specifierResolvesTo(
        "src/app/a/page.tsx",
        "@/lib/utils",
        "src/lib/utils.ts",
      ),
    ).toBe(true);
    expect(
      specifierResolvesTo(
        "src/app/a/page.tsx",
        "@/components/foo",
        "src/components/foo/index.tsx",
      ),
    ).toBe(true);
    expect(
      specifierResolvesTo(
        "src/app/a/page.tsx",
        "@/lib/other",
        "src/lib/utils.ts",
      ),
    ).toBe(false);
  });
});

describe("traceToRoutes", () => {
  // 合成 import 图：utils ← useFoo ← pricing/page；utils ← billing/components/Table
  const graph: Record<string, string[]> = {
    "src/lib/utils.ts": [
      "src/hooks/useFoo.ts",
      "src/app/billing/components/Table.tsx",
    ],
    "src/hooks/useFoo.ts": ["src/app/pricing/page.tsx"],
  };
  const findImporters = (f: string) => graph[f] || [];

  it("共享文件追到 page 与祖先 segment 子树", () => {
    const out = traceToRoutes("src/lib/utils.ts", {
      findImporters,
      allPageFiles: PAGES,
    });
    expect(out.routes).toEqual(
      expect.arrayContaining([
        "/pricing",
        "/billing",
        "/billing/budgets",
        "/billing/[section]",
      ]),
    );
    expect(out.truncated).toBe(false);
  });
  it("深度越界标 truncated", () => {
    const chain: Record<string, string[]> = {
      "src/lib/a.ts": ["src/lib/b.ts"],
      "src/lib/b.ts": ["src/lib/c.ts"],
      "src/lib/c.ts": ["src/app/pricing/page.tsx"],
    };
    const out = traceToRoutes("src/lib/a.ts", {
      findImporters: (f: string) => chain[f] || [],
      allPageFiles: PAGES,
      depth: 2,
    });
    expect(out.truncated).toBe(true);
  });
  it("扇出越界截断并标记", () => {
    const out = traceToRoutes("src/lib/utils.ts", {
      findImporters: (f: string) =>
        f === "src/lib/utils.ts"
          ? Array.from({ length: 50 }, (_, i) => `src/lib/dep${i}.ts`)
          : [],
      allPageFiles: PAGES,
      fanout: 10,
    });
    expect(out.truncated).toBe(true);
  });
});

describe("nearestPageUrl", () => {
  it("沿目录向上找最近有 page 的 segment", () => {
    const { byUrl } = pageIndex(PAGES);
    expect(nearestPageUrl(["billing", "components", "deep"], byUrl)).toBe(
      "/billing",
    );
    expect(nearestPageUrl(["nonexistent"], byUrl)).toBe("/");
  });
});
