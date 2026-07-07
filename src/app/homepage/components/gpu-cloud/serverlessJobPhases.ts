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

/** 每阶段停留（均匀轮播）— 与首页 MODEL APIS `InferenceVizCard` 标签轮播 2.5s 一致 */
export const SERVERLESS_STEP_DWELL_MS = 2500;

/** pill / 连线 / 进度条 / 文案过渡时长（略慢于原先 300ms，便于阅读） */
const SERVERLESS_STEP_TRANSITION_MS = 500;

export const nextServerlessPhaseIndex = (current: number): number =>
  (current + 1) % SERVERLESS_PHASE_COUNT;
