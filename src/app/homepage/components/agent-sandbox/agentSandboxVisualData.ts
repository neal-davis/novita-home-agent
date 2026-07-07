/**
 * Agent Sandbox：第二枚绿标 4 态轮播，文案对齐 Figma
 * `1:10608`（coding agents）、`1:10694`（computer use）、`1:10780`（data analytics）、`1:10866`（rl environments）。
 * 资源目录：`public/home/product/sandbox/<folder>`；`coding-agent` / `compute-use` → `Icon1.png`…；`rl-env` / `data-analyise` → `icon1.png`…。
 */

export type AgentSandboxVariantId =
  | "coding-agents"
  | "computer-use"
  | "rl-environments"
  | "data-analysis";

export type AgentSandboxTaskStatus = "queued" | "running" | "done";

export type AgentSandboxMetricTone = "default" | "brand";

export type AgentSandboxTaskRow = {
  /** 行内主文案 */
  text: string;
  status: AgentSandboxTaskStatus;
};

export type AgentSandboxMetric = {
  label: string;
  value: string;
  tone?: AgentSandboxMetricTone;
};

export type AgentSandboxVariant = {
  id: AgentSandboxVariantId;
  /** 绿标轮播展示名（含引号，与 Bare Metal 绿标风格一致） */
  greenTagDisplay: string;
  /** `locales/en/public/home/product/sandbox/` 下子目录 */
  assetFolder: string;
  /** 摘要行左 */
  summaryLeft: string;
  /** 摘要行右 */
  summaryRight: string;
  /** 四条任务（自上而下）；第 n 条使用对应 icon */
  tasks: readonly [
    AgentSandboxTaskRow,
    AgentSandboxTaskRow,
    AgentSandboxTaskRow,
    AgentSandboxTaskRow,
  ];
  /** 底栏四列指标 */
  metrics: readonly [
    AgentSandboxMetric,
    AgentSandboxMetric,
    AgentSandboxMetric,
    AgentSandboxMetric,
  ];
};

export const AGENT_SANDBOX_STEP_MS = 2800;

export function createAgentSandboxVariants(): readonly AgentSandboxVariant[] {
  const codingAgent: AgentSandboxVariant = {
    id: "coding-agents",
    greenTagDisplay: '"coding agents"',
    assetFolder: "coding-agent",
    summaryLeft: "coding agent · active",
    summaryRight: "sandbox runtime",
    tasks: [
      { text: "Run test suite · pytest", status: "queued" },
      { text: "Write fix · patch applied", status: "running" },
      { text: "Identify bug · null pointer line 84", status: "done" },
      { text: "Read codebase · src/api/routes.py", status: "done" },
    ],
    metrics: [
      { label: "startup", value: "~200ms", tone: "brand" },
      { label: "isolation", value: "Full" },
      { label: "billing", value: "per second" },
      { label: "status", value: "RUNNING", tone: "brand" },
    ],
  };

  /** Figma `1:10694`（computer use） */
  const computerUse: AgentSandboxVariant = {
    id: "computer-use",
    greenTagDisplay: '"computer use"',
    assetFolder: "compute-use",
    summaryLeft: "computer use · active",
    summaryRight: "sandbox runtime",
    tasks: [
      { text: "Submit · await confirmation", status: "queued" },
      { text: "Enter data · form populated", status: "running" },
      { text: "Click element · form field located", status: "done" },
      { text: "Open browser · nagivate to target", status: "done" },
    ],
    metrics: [
      { label: "startup", value: "~200ms", tone: "brand" },
      { label: "isolation", value: "Full" },
      { label: "billing", value: "per second" },
      { label: "status", value: "RUNNING", tone: "brand" },
    ],
  };

  /** Figma `1:10866`（rl environments）；摘要用语与绿标一致（稿中 1:10931 曾误写 data analytics） */
  const rlEnv: AgentSandboxVariant = {
    id: "rl-environments",
    greenTagDisplay: '"rl environments"',
    assetFolder: "rl-env",
    summaryLeft: "rl environments · active",
    summaryRight: "sandbox runtime",
    tasks: [
      { text: "Reset · next episode queued", status: "queued" },
      { text: "Reward · +2.4 · state updated", status: "running" },
      { text: "Step · action sampled from policy", status: "done" },
      { text: "Init environment · episode 1,248", status: "done" },
    ],
    metrics: [
      { label: "startup", value: "~200ms", tone: "brand" },
      { label: "isolation", value: "Full" },
      { label: "billing", value: "per second" },
      { label: "status", value: "RUNNING", tone: "brand" },
    ],
  };

  /** Figma `1:10780`（data analytics）；目录仍为 `data-analyise` */
  const dataAnalysis: AgentSandboxVariant = {
    id: "data-analysis",
    greenTagDisplay: '"data analytics"',
    assetFolder: "data-analyise",
    summaryLeft: "data analytics · active",
    summaryRight: "sandbox runtime",
    tasks: [
      { text: "Generate report · markdown output", status: "queued" },
      { text: "Analyse · correlation matrix", status: "running" },
      { text: "Transform · clean + normalize", status: "done" },
      { text: "Load dataset · 2.4M rows ingested", status: "done" },
    ],
    metrics: [
      { label: "startup", value: "~200ms", tone: "brand" },
      { label: "isolation", value: "Full" },
      { label: "billing", value: "per second" },
      { label: "status", value: "RUNNING", tone: "brand" },
    ],
  };

  return [codingAgent, computerUse, rlEnv, dataAnalysis] as const;
}

export function agentSandboxTaskIconSrc(
  folder: string,
  rowIndex: 0 | 1 | 2 | 3,
): string {
  const n = rowIndex + 1;
  if (folder === "coding-agent" || folder === "compute-use") {
    return `/home/product/sandbox/${folder}/Icon${n}.png`;
  }
  return `/home/product/sandbox/${folder}/icon${n}.png`;
}

export function nextAgentSandboxVariantIndex(i: number, total: number): number {
  return (i + 1) % total;
}
