# 首页 Product — GPU Cloud「Serverless」卡片前景设计说明

**Figma**

- 首页 GPU Cloud 区整体（含本卡）：[node `309-17280`](https://www.figma.com/design/3nHa4z8enopB5YGSneFZlK/Novita-2026---v5.0%E9%87%8D%E6%9E%84?node-id=309-17280&m=dev)
- Serverless 卡三态参考（阶段 1→2→3 文案、进度、指标、标签激活态）：[node `1-9815`](https://www.figma.com/design/3nHa4z8enopB5YGSneFZlK/Novita-2026---v5.0%E9%87%8D%E6%9E%84?node-id=1-9815&t=HWDGr1rF94bekQNw-0)

**日期:** 2026-04-25  
**范围（已确认）:** 仅 **Serverless GPU** 行右侧视觉卡片内 **前景 UI**（不替换/重导背景位图 `gpu-cloud02.png`）；**不**改 `GpuCloudRow` 两栏布局与文案区；实现落点以 [`GpuCloudServerlessVisual.tsx`](../../../src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx) 为主，可抽极小内部子组件或常量，避免扩散。

---

## 1. 问题与目标

**现状：** 前景块使用近似 Figma 的百分比定位，但 **纵向区块顺序与 Figma 参考组件不一致**，且 `JOB → QUEUED → RUNNING → COMPLETE` 使用 `flex-wrap`，易换行；进度条、说明行、流程行拆散，与「一行流程 + 中间对称文案 + 下方进度」的叙事不符。

**目标：** 在保持现有 **651×480 比例画板**（[`gpuCloudVisualFrame.ts`](../../../src/app/homepage/components/gpu-cloud/gpuCloudVisualFrame.ts)）与内容区宽度/左边距比例（约 `left 126/651`、`width 400/651`）的前提下，将前景还原为：

1. 顶部四列指标
2. 分割线
3. **第一行：** `JOB` 在左，右侧 **同一行** 三个状态 tag（`QUEUED` / `RUNNING` / `COMPLETE`），`JOB` 与当前激活 tag 之间 **连接线长度随阶段变化**
4. **第二行：** 左右对称文案；左侧阶段说明、右侧状态词（带 **显隐过渡**，非硬切）
5. **第三行：** 进度条 + 百分比，填充与数字随阶段 **12% → 50% → 100%** 过渡

顶部指标数值与 Figma 三态一致（见下表）。

---

## 2. 垂直结构（自上而下）

| #   | 区块       | 说明                                                                                                                                      |
| --- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A   | 四列指标   | `ALLOCATED` / `DURATION` / `COST` / `IDLE TIME`，样式沿用现有 token + `font-tt-mono`                                                      |
| B   | 分割线     | 全宽 1px，`var(--alpha-dark-10)` 或与 Figma 一致 token                                                                                    |
| C   | JOB 流程行 | 单行：`JOB`（沿用 [`GpuMicroTag`](../../../src/app/homepage/components/gpu-cloud/GpuMicroTag.tsx) 或等价结构）+ 连接器 + 三个 `Step` pill |
| D   | 对称说明行 | `justify-between`：左阶段长文案，右「圆点 + 状态词」                                                                                      |
| E   | 进度行     | 槽 + 填充 + 右侧百分比                                                                                                                    |

与 Figma 组件 `1-9815` 画布上的 **绝对 y 顺序**（metrics → line → progress → detail → job）不同；**以本 spec 与用户确认的叙事顺序为准**（流程在上、说明居中、进度在下、指标最上）。若 Dev Mode 像素对位时发现与 `309-17280` 整页帧冲突，以 **整页帧 `309-17280`** 微调纵向 offset，不改变上述叙事顺序。

---

## 3. 三阶段状态模型（单一数据源）

用 `activeStepIndex ∈ {0,1,2}` 循环驱动 UI，每阶段一条配置对象，避免文案、高亮、进度、指标脱节。

| 阶段 | 激活 tag   | 左文案                     | 右文案（带点） | 进度 | DURATION | COST      | 其余                                  |
| ---- | ---------- | -------------------------- | -------------- | ---- | -------- | --------- | ------------------------------------- |
| 0    | `QUEUED`   | `allocating gpu resources` | `allocating`   | 12%  | `0.1s`   | `$0.0001` | `ALLOCATED: auto`，`IDLE TIME: $0.00` |
| 1    | `RUNNING`  | `processing job`           | `running`      | 50%  | `1.24s`  | `$0.0003` | 同上                                  |
| 2    | `COMPLETE` | `processing job`           | `complete`     | 100% | `3.00s`  | `$0.0008` | 同上                                  |

**循环：** `0 → 1 → 2 → 0`，无限循环。

**节奏（已确认）：** 三阶段 **停留时长相同**。建议实现为可配置常量，默认例如每阶段 **1200ms**；阶段切换时过渡时长默认 **280–320ms**（实现阶段可微调，但三阶段一致）。

---

## 4. JOB 行：布局、高亮与「宽度接力」

- **布局：** `JOB` 固定左侧；右侧三个 pill **固定顺序占位**，禁止 `wrap`；整体 `min-w-0` 防溢出，必要时略缩字间距或字号以项目现有规范为界。
- **激活态：** 当前阶段 pill — 黑框 + 主色文字 + 小方块/圆点（与现有 `StepPill` 视觉一致）；非当前 — 灰边框 + `var(--element-disabled)` 文字。
- **宽度接力：** 每个 pill 在「非激活」与「激活」两种宽度间过渡（`transition` 统一时长/曲线）。切换阶段时，**上一 pill 从 active 宽收回到 default 宽**，**下一 pill 从 default 扩到 active 宽**，时间重叠，使视觉上「缩与扩刚好接上」。非相邻 pill 保持 default 宽，减少「第三个在动」的感觉。
- **连接线：** 从 `JOB` 右缘到 **当前激活 pill 左缘**（或设计稿约定的内边）之间的水平线段；长度随 `activeStepIndex` 变化，与 pill 宽度动画 **同一过渡窗口**，避免脱节。Figma 使用贴图线段时可改为 **div + 背景/token** 实现，不依赖远程 MCP 资产 URL。

---

## 5. 第二行：对称文案与右侧显隐动画

- **左：** 阶段说明，全大写、mono、低强调色（与现 `text-[var(--element-low-em)]` 一致）。
- **右：** 状态词 + 前导状态点（与现 `AllocatingStatusDot` 同类）；**切换阶段时**：旧文案 **opacity 下降 + 轻微垂直位移（如 translateY）**，新文案 **opacity 上升 + 回位**，两阶段时长与 JOB 行过渡一致或可略短 40ms；**禁止**无过渡直接换字符串。

---

## 6. 进度行与指标

- **进度槽：** `var(--alpha-dark-5)`；**填充：** `var(--brand-0)`，宽度与阶段百分比一致，使用 CSS 过渡与阶段切换同步。
- **百分比：** 与填充同一数值源；字色 `var(--element-low-em)`，mono。
- **指标：** 仅数值随阶段表更新；`IDLE TIME` 始终 `$0.00` 且保持 disabled 色。

---

## 7. 无障碍与降级

- 整个卡片为 `pointer-events-none` 装饰性展示时，保持 **无键盘焦点陷阱**；若后续改为可聚焦，需另 spec。
- **`prefers-reduced-motion: reduce`：** 关闭宽度「接力」与位移动画；可保留 **短时 opacity** 或直接 **瞬时切换** 三态；循环可保留或改为静态首帧（实现时二选一，优先 **瞬时切换 + 仍循环或停首帧** 以不误导进度语义）。

---

## 8. 验收标准（实现完成后自检）

1. 视觉卡片比例仍为 `aspect-[651/480]`，背景图不更换。
2. 纵向顺序为：**指标 → 分割线 → JOB 行 → 对称说明行 → 进度行**（与第 2 节一致）。
3. `JOB` 与 `QUEUED/RUNNING/COMPLETE` **同一行**，不换行。
4. 三阶段循环，每阶段停留相等；激活 pill 与连接线、进度、指标、左右文案 **同一时刻** 切到该阶段数据。
5. 存在可感知的 **pill 宽度接力** 与 **右侧状态词显隐过渡**。
6. 样式以项目 **Tailwind + design token** 为主（[`CLAUDE.md`](../../../CLAUDE.md)），不引入裸 hex 作为常规色。

---

## 9. 非目标

- 不改 `GpuCloudInstanceVisual` / `GpuCloudBareMetalVisual`。
- 不在本任务中优化 LCP、不替换 `next/image` 背景策略。
- 不把该动画抽成全局通用库（除非二次需求明确）。

---

## 10. 实现落点（供后续 writing-plans 引用）

| 文件                                                                                                          | 动作                                                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [`GpuCloudServerlessVisual.tsx`](../../../src/app/homepage/components/gpu-cloud/GpuCloudServerlessVisual.tsx) | 重组 DOM 顺序；引入 `useState` + `useEffect`/`useInterval` 循环；统一阶段配置；pill 宽度与连接线动画；右侧文案过渡 |
| [`GpuMicroTag.tsx`](../../../src/app/homepage/components/gpu-cloud/GpuMicroTag.tsx)                           | 仅当 `JOB` 标签需与 Figma 图标一致时最小改动；否则不动                                                             |
| [`gpuCloudVisualFrame.ts`](../../../src/app/homepage/components/gpu-cloud/gpuCloudVisualFrame.ts)             | 通常不动                                                                                                           |
