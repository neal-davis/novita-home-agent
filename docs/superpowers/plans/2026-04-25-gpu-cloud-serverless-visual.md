# GPU Cloud Serverless 卡片前景还原 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 [`docs/superpowers/specs/2026-04-25-gpu-cloud-serverless-visual-design.md`](../specs/2026-04-25-gpu-cloud-serverless-visual-design.md) 重排并动画化首页 `ProductGpuCloudSection` 中 **Serverless GPU** 行右侧视觉卡片的前景（`GpuCloudServerlessVisual`），不更换背景图、不改 `GpuCloudRow` 外壳。

**Architecture:** 单一 **三阶段状态机**（`0 → 1 → 2 → 0`）驱动指标、JOB 行 pill 高亮与宽度、连接线长度、对称说明行、进度条与百分比。阶段表抽到 **纯数据模块** 便于 Jest 锁定与 Figma 表一致；组件内 `useEffect` + `setInterval` 循环，`prefers-reduced-motion` 关闭位宽/位移动画。连接线用 **相对内容区的百分比常量**（按 Dev Mode 调参）或 `absolute` 覆盖层，避免依赖 MCP 临时图片 URL。

**Tech Stack:** Next.js App Router、`"use client"`、React 18、TypeScript、Tailwind、项目 CSS 变量（`var(--brand-0)`、`var(--element-disabled)` 等）、`next/image`（测试 mock）、Jest + `@testing-library/react` + `jest-dom`。

**Design spec:** [`docs/superpowers/specs/2026-04-25-gpu-cloud-serverless-visual-design.md`](../specs/2026-04-25-gpu-cloud-serverless-visual-design.md)

---

## File map

| Action    | Path                                                                          | Responsibility                                                                              |
| --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Create    | `src/app/homepage/components/gpu-cloud/serverlessJobPhases.ts`                | 三阶段配置：激活 tag key、左右文案、进度 0–100、duration/cost 字符串；导出停留/过渡毫秒常量 |
| Create    | `src/app/homepage/components/gpu-cloud/__tests__/serverlessJobPhases.test.ts` | 断言阶段表与 spec 第 3 节一致                                                               |
| Modify    | `src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx`          | 重排 DOM（指标→分割线→JOB 行→说明行→进度行）、状态循环、动画与降级                          |
| Unchanged | `src/app/homepage/components/gpu-cloud/gpuCloudVisualFrame.ts`                | 保持 `aspect-[651/480]` 画板                                                                |
| Unchanged | `src/app/homepage/components/ProductGpuCloudSection.tsx`                      | 不改 `GpuCloudRow`                                                                          |
| Optional  | `src/app/homepage/components/gpu-cloud/GpuMicroTag.tsx`                       | 仅当 Figma `JOB` 图标与现 `GpuMicroTag` 不一致时再改                                        |

---

### Task 1: 纯数据模块 + 单元测试（TDD 数据层）

**Files:**

- Create: `src/app/homepage/components/gpu-cloud/serverlessJobPhases.ts`
- Create: `src/app/homepage/components/gpu-cloud/__tests__/serverlessJobPhases.test.ts`

- [ ] **Step 1: 新增 `serverlessJobPhases.ts`（完整内容）**

```typescript
export type ServerlessActiveTag = "queued" | "running" | "complete";

export type ServerlessJobPhase = {
  activeTag: ServerlessActiveTag;
  leftCaption: string;
  rightStatus: string;
  progressPercent: 12 | 50 | 100;
  durationLabel: string;
  costLabel: string;
};

/** 与 spec 表一致；顺序即循环顺序 */
export const SERVERLESS_JOB_PHASES: readonly ServerlessJobPhase[] = [
  {
    activeTag: "queued",
    leftCaption: "allocating gpu resources",
    rightStatus: "allocating",
    progressPercent: 12,
    durationLabel: "0.1s",
    costLabel: "$0.0001",
  },
  {
    activeTag: "running",
    leftCaption: "processing job",
    rightStatus: "running",
    progressPercent: 50,
    durationLabel: "1.24s",
    costLabel: "$0.0003",
  },
  {
    activeTag: "complete",
    leftCaption: "processing job",
    rightStatus: "complete",
    progressPercent: 100,
    durationLabel: "3.00s",
    costLabel: "$0.0008",
  },
] as const;

export const SERVERLESS_PHASE_COUNT = SERVERLESS_JOB_PHASES.length;

/** 每阶段停留（均匀轮播） */
export const SERVERLESS_STEP_DWELL_MS = 1200;

/** pill 宽度、连接线、进度条、文案过渡统一用该时长（可与 dwell 同阶；实现时可 ±20ms 微调） */
export const SERVERLESS_STEP_TRANSITION_MS = 300;

export const nextServerlessPhaseIndex = (current: number): number =>
  (current + 1) % SERVERLESS_PHASE_COUNT;
```

- [ ] **Step 2: 新增单测文件（完整内容）**

```typescript
import {
  SERVERLESS_JOB_PHASES,
  SERVERLESS_PHASE_COUNT,
  nextServerlessPhaseIndex,
} from "../serverlessJobPhases";

describe("serverlessJobPhases", () => {
  it("exports three phases aligned with design spec", () => {
    expect(SERVERLESS_PHASE_COUNT).toBe(3);
    expect(SERVERLESS_JOB_PHASES[0]).toMatchObject({
      activeTag: "queued",
      leftCaption: "allocating gpu resources",
      rightStatus: "allocating",
      progressPercent: 12,
      durationLabel: "0.1s",
      costLabel: "$0.0001",
    });
    expect(SERVERLESS_JOB_PHASES[1]).toMatchObject({
      activeTag: "running",
      leftCaption: "processing job",
      rightStatus: "running",
      progressPercent: 50,
      durationLabel: "1.24s",
      costLabel: "$0.0003",
    });
    expect(SERVERLESS_JOB_PHASES[2]).toMatchObject({
      activeTag: "complete",
      leftCaption: "processing job",
      rightStatus: "complete",
      progressPercent: 100,
      durationLabel: "3.00s",
      costLabel: "$0.0008",
    });
  });

  it("nextServerlessPhaseIndex cycles 0→1→2→0", () => {
    expect(nextServerlessPhaseIndex(0)).toBe(1);
    expect(nextServerlessPhaseIndex(1)).toBe(2);
    expect(nextServerlessPhaseIndex(2)).toBe(0);
  });
});
```

- [ ] **Step 3: 运行测试，期望全部通过**

Run:

```bash
npm run test:unit -- --testPathPattern=serverlessJobPhases
```

Expected: `PASS` for `serverlessJobPhases.test.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/app/homepage/components/gpu-cloud/serverlessJobPhases.ts \
  src/app/homepage/components/gpu-cloud/__tests__/serverlessJobPhases.test.ts
git commit -m "test(homepage): add serverless GPU job phase table"
```

---

### Task 2: `GpuCloudServerlessVisual` — 布局重排 + 状态循环 + 进度与指标

**Files:**

- Modify: `src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx`

- [ ] **Step 1: 确认 `next/image` 在 Jest 下可渲染**

优先检查 **`next/jest`** 是否已为 `next/image` 提供默认 mock（许多 Next 项目无需手写）。若运行 Task 5 报 `next/image` / `priority` 相关错，再在 **`GpuCloudServerlessVisual.test.tsx` 顶部**（任何 import 之前）添加 `jest.mock("next/image", ...)` 映射为 `<img />`（见 Task 5 Step 1）。**不要**把 `jest.mock` 写进 `GpuCloudServerlessVisual.tsx` 业务组件。

- [ ] **Step 2: 引入状态与 interval**

- `import { useEffect, useMemo, useState } from "react"`。
- `import { SERVERLESS_JOB_PHASES, SERVERLESS_STEP_DWELL_MS, nextServerlessPhaseIndex, } from "./serverlessJobPhases"`。
- `const [phaseIndex, setPhaseIndex] = useState(0)`。
- `useEffect`：`const id = window.setInterval(() => setPhaseIndex(nextServerlessPhaseIndex), SERVERLESS_STEP_DWELL_MS)`；`return () => window.clearInterval(id)`；依赖数组 `[]`。
- `const phase = useMemo(() => SERVERLESS_JOB_PHASES[phaseIndex], [phaseIndex])`。

- [ ] **Step 3: 重排绝对定位内容区子 DOM 顺序（自上而下）**

在现有 `style={{ left: CONTENT_LEFT_PCT%, width: CONTENT_W_PCT%, top: ... }}` 容器内，按 spec **严格顺序** 渲染：

1. 四列指标：`allocated` / `duration` / `cost` / `idle time`；其中 `duration`、`cost` 用 `phase.durationLabel`、`phase.costLabel`；`allocated` 固定 `auto`；`idle time` 固定 `$0.00` + disabled 色。
2. `h-px` 分割线。
3. **占位：** JOB 行（Task 3 填满）；本步可先渲染静态 `GpuMicroTag label="job"` + 三个占位 `div` 防止布局塌缩。
4. 对称说明行：左 `phase.leftCaption`，右为 Task 4 的动画占位；本步可先静态渲染 `phase.rightStatus` + `AllocatingStatusDot`。
5. 进度行：`flex-1` 槽 + 内层 `div` 宽 `w-[${phase.progressPercent}%]`（用 inline `style={{ width: \`${phase.progressPercent}%\` }}`或 Tailwind arbitrary + style），右侧文本`{phase.progressPercent}%`。

- [ ] **Step 4: 运行 TypeScript**

Run:

```bash
npx tsc --noEmit
```

Expected: exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx
git commit -m "feat(homepage): reorder serverless GPU visual and phase-driven metrics"
```

---

### Task 3: JOB 行 — 三 pill、宽度接力、连接线

**Files:**

- Modify: `src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx`

- [ ] **Step 1: 定义 pill 与连接线常量（与 `phase.activeTag` 联动）**

在同一文件内（`StepPill` 旁）增加：

- `const PILL_IDS = ["queued", "running", "complete"] as const`（显示文案 `uppercase`）。
- 每个 pill：`transition-[min-width] duration-[300ms]`（或 `SERVERLESS_STEP_TRANSITION_MS` 同步的任意值 class）；`active` 时 `min-w-[…]` 较大，`inactive` 时 `min-w-[…]` 较小（具体 px 在 Dev Mode 下对齐 Figma，建议 active `min-w-[96px]`、inactive `min-w-[76px]` 为起点，可迭代）。
- `activeTag === id` 时：`border-black`、`text-element-high-em`、显示小绿块（与现 `StepPill` 一致）；否则 `border-[var(--element-disabled)]`、`text-[var(--element-disabled)]`。

- [ ] **Step 2: JOB 行 flex 结构**

```tsx
<div className="flex items-center gap-2 w-full min-w-0 shrink-0">
  <GpuMicroTag label="job" />
  {/* 连接线：相对本行 position-relative */}
  <div className="relative flex-1 min-w-[12px] h-[3px] self-center">
    <div
      className="absolute left-0 top-0 h-full rounded-full bg-[var(--element-high-em)] motion-safe:transition-[width] motion-safe:duration-300"
      style={{ width: `${CONNECTOR_WIDTH_PCT_BY_TAG[phase.activeTag]}%` }}
      aria-hidden
    />
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {/* 三个 StepPill，按 PILL_IDS map */}
  </div>
</div>
```

在文件中定义 `CONNECTOR_WIDTH_PCT_BY_TAG: Record<ServerlessActiveTag, number>`，初值可设为 `{ queued: 38, running: 62, complete: 86 }`（**占位**），实现后在浏览器对照 Figma `1-9815` / `309-17280` 调参，直到线段末端落在当前激活 pill 左缘附近。

- [ ] **Step 3: `prefers-reduced-motion`**

使用 `window.matchMedia("(prefers-reduced-motion: reduce)")` 在 `useEffect` 同步到 `useState`，或对连接线 / pill 使用 `motion-reduce:transition-none`（Tailwind v3 `motion-reduce:` 若未配置则用 `useState` + class 条件）。

- [ ] **Step 4: 自检 + Commit**

浏览器打开首页 GPU Cloud 第二行：JOB 与三 tag 单行、换阶段时 pill 宽度与线长变化连贯。

```bash
git add src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx
git commit -m "feat(homepage): serverless JOB row pills and connector animation"
```

---

### Task 4: 第二行右侧状态文案 — 显隐过渡（非硬切）

**Files:**

- Modify: `src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx`

- [ ] **Step 1: 右侧使用双缓冲层叠**

结构示例（完整逻辑在实现中补全 class）：

```tsx
<div className="relative h-[18px] min-w-[120px] shrink-0 overflow-hidden">
  {SERVERLESS_JOB_PHASES.map((p, i) => (
    <div
      key={p.rightStatus}
      className={[
        "absolute inset-0 flex items-center justify-end gap-2",
        "motion-safe:transition-all motion-safe:duration-300",
        i === phaseIndex
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-1 pointer-events-none",
      ].join(" ")}
      aria-hidden={i !== phaseIndex}
    >
      <AllocatingStatusDot />
      <span className="font-tt-mono text-[11px] ... uppercase text-element-mid-em">
        {p.rightStatus}
      </span>
    </div>
  ))}
</div>
```

左侧 `phase.leftCaption` 可只做 **短 fade**（`transition-opacity`）或静态切换，避免与右侧抢动效。

- [ ] **Step 2: Commit**

```bash
git add src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx
git commit -m "feat(homepage): crossfade serverless status caption"
```

---

### Task 5: RTL + fake timers（组件级回归）

**Files:**

- Create: `src/app/homepage/components/gpu-cloud/__tests__/GpuCloudServerlessVisual.test.tsx`

- [ ] **Step 1: 文件顶部 mock `next/image`（若未全局 mock）**

```typescript
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"img">) => <img {...props} alt="" />,
}));
```

- [ ] **Step 2: 测试初始阶段与推进**

```typescript
import { render, screen, act } from "@testing-library/react";
import { GpuCloudServerlessVisual } from "../GpuCloudServerlessVisual";
import {
  SERVERLESS_JOB_PHASES,
  SERVERLESS_STEP_DWELL_MS,
} from "../serverlessJobPhases";

describe("GpuCloudServerlessVisual", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows first phase metrics and advances to second phase after dwell", () => {
    render(<GpuCloudServerlessVisual />);

    expect(screen.getByText(SERVERLESS_JOB_PHASES[0].durationLabel)).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(SERVERLESS_STEP_DWELL_MS);
    });

    expect(screen.getByText(SERVERLESS_JOB_PHASES[1].durationLabel)).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
```

若 `12%` / `50%` 文案在实现里带空格或拆节点，用 `screen.getByText(/12%/)` 替换。

- [ ] **Step 3: 运行测试**

Run:

```bash
npm run test:unit -- --testPathPattern=GpuCloudServerlessVisual
```

Expected: `PASS`.

- [ ] **Step 4: Commit**

```bash
git add src/app/homepage/components/gpu-cloud/__tests__/GpuCloudServerlessVisual.test.tsx
git commit -m "test(homepage): cover serverless visual phase advance"
```

---

### Task 6: 收尾与 spec 对照

**Files:**

- Modify: `src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx`（仅调参）
- Readonly: `docs/superpowers/specs/2026-04-25-gpu-cloud-serverless-visual-design.md`

- [ ] **Step 1: 对照 spec 第 8 节验收清单逐项勾选**（纵向顺序、单行 JOB、均匀循环、动效、`prefers-reduced-motion`）。

- [ ] **Step 2: 全量单测（或至少 homepage 相关）**

Run:

```bash
npm run test:unit
```

Expected: 全部 `PASS`。

- [ ] **Step 3: Commit（若有调参）**

```bash
git add src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx
git commit -m "fix(homepage): tune serverless visual connector and motion"
```

---

## Plan self-review

| Spec 章节                     | 对应 Task                                         |
| ----------------------------- | ------------------------------------------------- |
| 垂直结构 A–E                  | Task 2 Step 3                                     |
| 三阶段表 + 均匀停留           | Task 1 + Task 2                                   |
| JOB 行 + 宽度接力 + 连接线    | Task 3                                            |
| 右侧文案显隐                  | Task 4                                            |
| 进度与指标                    | Task 2 + Task 1 数据                              |
| `prefers-reduced-motion`      | Task 3 Step 3 + Task 4 `motion-safe` / 条件 class |
| 非目标（不改 Row / 不换背景） | File map + Task 范围                              |

**Placeholder scan:** 连接线百分比初值为调参起点，已在 Task 3 标明需在浏览器对齐 Figma；非 `TBD` 式留空。

**Type consistency:** `ServerlessActiveTag` 在 `serverlessJobPhases.ts` 定义，`CONNECTOR_WIDTH_PCT_BY_TAG` 必须使用同一联合类型键集。

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-25-gpu-cloud-serverless-visual.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 每个 Task 派独立子代理执行，Task 之间人工复核，迭代快。

**2. Inline Execution** — 本会话内按 Task 顺序执行，配合 executing-plans 的批量检查点。

你想用哪一种？
