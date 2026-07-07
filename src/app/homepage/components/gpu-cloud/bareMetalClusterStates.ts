/**
 * Bare Metal 卡：3 个 CLUSTER 绿标 × 每个 3 个数据子态。
 * - CLUSTER-01：`1:9946` / `1:10019` / `1:10092`
 * - CLUSTER-02：`1:10165` / `1:10238` / `1:10311`
 * - CLUSTER-03：`1:10384` / `1:10461` / `1:10534`
 * 节点顺序与 DOM 一致：第一行 01–03，第二行 05–07。
 */

export type BareMetalClusterId = 0 | 1 | 2;

export type BareMetalPhaseId = 0 | 1 | 2;

/** `pct: null` = 未占用节点：展示「-」且进度条为空 */
export type BareMetalNodeCell = { node: string; pct: number | null };

export type BareMetalClusterPhase = {
  /** Figma 节点引用，便于对照 */
  figmaRef:
    | "1:9946"
    | "1:10019"
    | "1:10092"
    | "1:10165"
    | "1:10238"
    | "1:10311"
    | "1:10384"
    | "1:10461"
    | "1:10534";
  left: {
    capacityValue: string;
    capacityUnitLabel: string;
    gpuMemoryLabel: string;
    gpuMemoryValue: string;
    gpuLabel: string;
    gpuValue: string;
  };
  right: {
    networkLabel: string;
    networkValue: string;
    interconnectLabel: string;
    interconnectValue: string;
    nodesLabel: string;
    nodesValue: string;
  };
  rows: readonly [readonly BareMetalNodeCell[], readonly BareMetalNodeCell[]];
};

const ROW_A_9946: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 51 },
  { node: "Node-02", pct: 79 },
  { node: "Node-03", pct: 86 },
];
const ROW_B_9946: readonly BareMetalNodeCell[] = [
  { node: "Node-05", pct: 89 },
  { node: "Node-06", pct: 65 },
  { node: "Node-07", pct: 81 },
];

const ROW_A_10019: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 58 },
  { node: "Node-02", pct: 81 },
  { node: "Node-03", pct: 78 },
];
const ROW_B_10019: readonly BareMetalNodeCell[] = [
  { node: "Node-05", pct: 79 },
  { node: "Node-06", pct: 82 },
  { node: "Node-07", pct: 94 },
];

const ROW_A_10092: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 68 },
  { node: "Node-02", pct: 79 },
  { node: "Node-03", pct: 82 },
];
const ROW_B_10092: readonly BareMetalNodeCell[] = [
  { node: "Node-05", pct: 69 },
  { node: "Node-06", pct: 86 },
  { node: "Node-07", pct: 91 },
];

/** CLUSTER-01 三态（与 Figma 导出一致） */
const BARE_METAL_CLUSTER_01_PHASES: readonly BareMetalClusterPhase[] = [
  {
    figmaRef: "1:9946",
    left: {
      capacityValue: "1.128",
      capacityUnitLabel: "TB total",
      gpuMemoryLabel: "GPU Memory ",
      gpuMemoryValue: " 141 GB HBM3e per GPU",
      gpuLabel: "GPU ",
      gpuValue: " 8× NVIDIA H200",
    },
    right: {
      networkLabel: "Network ",
      networkValue: "400 Gb/s RDMA",
      interconnectLabel: "Interconnect ",
      interconnectValue: "NVLink 4th Gen · 900 GB/s",
      nodesLabel: "Nodes ",
      nodesValue: "6 / 6",
    },
    rows: [ROW_A_9946, ROW_B_9946],
  },
  {
    figmaRef: "1:10019",
    left: {
      capacityValue: "640",
      capacityUnitLabel: "GB total",
      gpuMemoryLabel: "GPU Memory ",
      gpuMemoryValue: " 80 GB HBM3 per GPU",
      gpuLabel: "GPU ",
      gpuValue: " 8× NVIDIA H100",
    },
    right: {
      networkLabel: "Network ",
      networkValue: "400 Gb/s RDMA",
      interconnectLabel: "Interconnect ",
      interconnectValue: "NVLink 4th Gen · 900 GB/s",
      nodesLabel: "Nodes ",
      nodesValue: "6/6",
    },
    rows: [ROW_A_10019, ROW_B_10019],
  },
  {
    figmaRef: "1:10092",
    left: {
      capacityValue: "640",
      capacityUnitLabel: "GB total",
      gpuMemoryLabel: "GPU Memory ",
      gpuMemoryValue: " 80 GB HBM3 per GPU",
      gpuLabel: "GPU ",
      gpuValue: " 8× NVIDIA H100",
    },
    right: {
      networkLabel: "Network ",
      networkValue: "400 Gb/s RDMA",
      interconnectLabel: "Interconnect ",
      interconnectValue: "NVLink 4th Gen · 900 GB/s",
      nodesLabel: "Nodes ",
      nodesValue: "6/6",
    },
    rows: [ROW_A_10092, ROW_B_10092],
  },
] as const;

/** CLUSTER-02 三态：Figma `1:10165` / `1:10238` / `1:10311` */
const ROW_C02_P0_A: readonly BareMetalNodeCell[] = [
  { node: "Node-05", pct: 75 },
  { node: "Node-06", pct: 62 },
  { node: "Node-07", pct: 97 },
];
const ROW_C02_P0_B: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 47 },
  { node: "Node-02", pct: 67 },
  { node: "Node-03", pct: 89 },
];

const ROW_C02_P1_A: readonly BareMetalNodeCell[] = [
  { node: "Node-05", pct: 82 },
  { node: "Node-06", pct: 57 },
  { node: "Node-07", pct: 89 },
];
const ROW_C02_P1_B: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 58 },
  { node: "Node-02", pct: 73 },
  { node: "Node-03", pct: 81 },
];

const ROW_C02_P2_A: readonly BareMetalNodeCell[] = [
  { node: "Node-05", pct: 79 },
  { node: "Node-06", pct: 64 },
  { node: "Node-07", pct: 80 },
];
const ROW_C02_P2_B: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 62 },
  { node: "Node-02", pct: 68 },
  { node: "Node-03", pct: 76 },
];

const BARE_METAL_CLUSTER_02_LEFT_COMMON = {
  gpuMemoryLabel: "GPU Memory ",
  gpuMemoryValue: " 80 GB HBM3 per GPU",
  gpuLabel: "GPU ",
  gpuValue: " 8× NVIDIA H100",
} as const;

const BARE_METAL_CLUSTER_02_RIGHT = {
  networkLabel: "Network ",
  networkValue: "400 Gb/s RDMA",
  interconnectLabel: "Interconnect ",
  interconnectValue: "NVLink 4th Gen · 900 GB/s",
  nodesLabel: "Nodes ",
  nodesValue: "6/6",
} as const;

const BARE_METAL_CLUSTER_02_PHASES: readonly BareMetalClusterPhase[] = [
  {
    figmaRef: "1:10165",
    left: {
      ...BARE_METAL_CLUSTER_02_LEFT_COMMON,
      capacityValue: "92",
      capacityUnitLabel: "GB total",
    },
    right: BARE_METAL_CLUSTER_02_RIGHT,
    rows: [ROW_C02_P0_B, ROW_C02_P0_A],
  },
  {
    figmaRef: "1:10238",
    left: {
      ...BARE_METAL_CLUSTER_02_LEFT_COMMON,
      capacityValue: "92",
      capacityUnitLabel: "GB total",
    },
    right: BARE_METAL_CLUSTER_02_RIGHT,
    rows: [ROW_C02_P1_B, ROW_C02_P1_A],
  },
  {
    figmaRef: "1:10311",
    left: {
      ...BARE_METAL_CLUSTER_02_LEFT_COMMON,
      capacityValue: "640",
      capacityUnitLabel: "GB total",
    },
    right: BARE_METAL_CLUSTER_02_RIGHT,
    rows: [ROW_C02_P2_B, ROW_C02_P2_A],
  },
] as const;

/** CLUSTER-03 三态：Figma `1:10384` / `1:10461` / `1:10534`（3 节点，下行 05–07 占位） */
const ROW_C03_INACTIVE: readonly BareMetalNodeCell[] = [
  { node: "Node-05", pct: null },
  { node: "Node-06", pct: null },
  { node: "Node-07", pct: null },
];

const ROW_C03_P0_A: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 81 },
  { node: "Node-02", pct: 80 },
  { node: "Node-03", pct: 84 },
];

const ROW_C03_P1_A: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 84 },
  { node: "Node-02", pct: 76 },
  { node: "Node-03", pct: 91 },
];

const ROW_C03_P2_A: readonly BareMetalNodeCell[] = [
  { node: "Node-01", pct: 79 },
  { node: "Node-02", pct: 87 },
  { node: "Node-03", pct: 96 },
];

const BARE_METAL_CLUSTER_03_LEFT_COMMON = {
  gpuMemoryLabel: "GPU Memory ",
  gpuMemoryValue: " 80 GB HBM3 per GPU",
  gpuLabel: "GPU ",
  gpuValue: " 8× NVIDIA H100",
} as const;

const BARE_METAL_CLUSTER_03_RIGHT = {
  networkLabel: "Network ",
  networkValue: "400 Gb/s RDMA",
  interconnectLabel: "Interconnect ",
  interconnectValue: "NVLink 4th Gen · 900 GB/s",
  nodesLabel: "Nodes ",
  nodesValue: "3/3",
} as const;

const BARE_METAL_CLUSTER_03_PHASES: readonly BareMetalClusterPhase[] = [
  {
    figmaRef: "1:10384",
    left: {
      ...BARE_METAL_CLUSTER_03_LEFT_COMMON,
      capacityValue: "540",
      capacityUnitLabel: "GB total",
    },
    right: BARE_METAL_CLUSTER_03_RIGHT,
    rows: [ROW_C03_P0_A, ROW_C03_INACTIVE],
  },
  {
    figmaRef: "1:10461",
    left: {
      ...BARE_METAL_CLUSTER_03_LEFT_COMMON,
      capacityValue: "640",
      capacityUnitLabel: "GB total",
    },
    right: BARE_METAL_CLUSTER_03_RIGHT,
    rows: [ROW_C03_P1_A, ROW_C03_INACTIVE],
  },
  {
    figmaRef: "1:10534",
    left: {
      ...BARE_METAL_CLUSTER_03_LEFT_COMMON,
      capacityValue: "640",
      capacityUnitLabel: "GB total",
    },
    right: BARE_METAL_CLUSTER_03_RIGHT,
    rows: [ROW_C03_P2_A, ROW_C03_INACTIVE],
  },
] as const;

export const BARE_METAL_CLUSTER_GREEN_NAMES = [
  '"Cluster-01"',
  '"cluster-02"',
  '"cluster-03"',
] as const;

export const BARE_METAL_CLUSTER_SUMMARY_LEFT: readonly string[] = [
  "CLUSTER-01 · 6 nodes",
  "CLUSTER-02 · 12 nodes",
  "CLUSTER-03 · 3 nodes",
] as const;

export const BARE_METAL_CLUSTER_SUMMARY_RIGHT: readonly string[] = [
  "NVLink · GPUDirect RDMA · PCIe",
  "NVLink · GPUDirect RDMA · PCIe",
  "PCIe · 10GbE",
] as const;

export const BARE_METAL_STEP_MS = 2500;

const BARE_METAL_TRANSITION_MS = 500;

function bareMetalLinearIndex(
  cluster: BareMetalClusterId,
  phase: BareMetalPhaseId,
): number {
  return cluster * 3 + phase;
}

export function bareMetalFromLinearIndex(index: number): {
  cluster: BareMetalClusterId;
  phase: BareMetalPhaseId;
} {
  const i = ((index % 9) + 9) % 9;
  return {
    cluster: Math.floor(i / 3) as BareMetalClusterId,
    phase: (i % 3) as BareMetalPhaseId,
  };
}

export function nextBareMetalLinearIndex(index: number): number {
  return (index + 1) % 9;
}

export function getBareMetalPhase(
  cluster: BareMetalClusterId,
  phase: BareMetalPhaseId,
): BareMetalClusterPhase {
  const table: readonly [
    readonly BareMetalClusterPhase[],
    readonly BareMetalClusterPhase[],
    readonly BareMetalClusterPhase[],
  ] = [
    BARE_METAL_CLUSTER_01_PHASES,
    BARE_METAL_CLUSTER_02_PHASES,
    BARE_METAL_CLUSTER_03_PHASES,
  ];
  return table[cluster][phase];
}
