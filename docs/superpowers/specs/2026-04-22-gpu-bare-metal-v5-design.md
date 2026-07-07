# GPU Bare Metal — Novita 2026 v5.0 重构设计说明

**Figma**

- Hero：[node `212-10578`](https://www.figma.com/design/3nHa4z8enopB5YGSneFZlK/Novita-2026---v5.0%E9%87%8D%E6%9E%84?node-id=212-10578&m=dev)
- 页中主体（Hero 与 Footer 之间）：[node `214-11372`](https://www.figma.com/design/3nHa4z8enopB5YGSneFZlK/Novita-2026---v5.0%E9%87%8D%E6%9E%84?node-id=214-11372&m=dev)

**日期:** 2026-04-22  
**范围（已确认）:** v5 营销顶栏 + **Hero（212）** + **中间主体（214）** + **Footer**；中间区为 **Solutions 双栏卡** UI（左对齐区标、分段、对比卡），**不再**在本页挂载库存 `BaremetalList`（组件仍保留在仓库，待 Figma 含列表或单独路由时再接入）。

**实现状态：** [`GpuBareMetalPageContent.tsx`](../../../src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx) 对应 Figma **214-11372**（当前为占位 Solutions 双列卡，待按 6 区块完整重建）；Hero 图 `locales/…/gpu-bare-metal-hero-bg.png` → **`/gpus/v5/gpu-bare-metal-hero-bg.png`**。

---

## 1. 实现后页面结构（当前）

| 区域        | 实现                                                                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 顶栏        | [`WebsiteNavbar`](../../../src/app/components/website-navbar/WebsiteNavbar.tsx)                                                                                             |
| Hero（212） | [`GpuBareMetalHero.tsx`](../../../src/app/gpu-baremetal/components/GpuBareMetalHero.tsx)                                                                                    |
| 页中（214） | [`GpuBareMetalPageContent.tsx`](../../../src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx)：Solutions 区标 + 左对齐标题 + 双列卡 + 分段线（与 Dev Mode 对齐中） |
| 页脚        | [`FooterSection`](../../../src/app/components/footer-section/FooterSection.tsx)                                                                                             |

---

## 1a. Figma `214-11372` — 中间主体完整结构（6 区块）

Figma 截图确认共 **6 个区块**，从上到下：

### 区块 M1 — Section Header（无卡片）

- `SOLUTIONS` kicker（绿色方块 + 大写文字）
- H2: **"The Right GPU for Every Workload"**
- 副文案: "Four core AI scenarios, each matched with purpose-built bare-metal GPU configurations."
- 无卡片，纯文字区块，作为整段的语义锚点

### 区块 M2–M5 — 4 组工作负载卡片

每组结构一致：`SOLUTIONS` kicker + H3 标题 + 副文案 + **2 列卡片 × 2 张**，各组之间以 `border-[var(--border-2)]` 分割线隔开。

| #   | 标题                             | 左卡                                   | 右卡                                        |
| --- | -------------------------------- | -------------------------------------- | ------------------------------------------- |
| M2  | The Right GPU for Every Workload | H100 SXM（8×/节点，$1.70，BEST VALUE） | B200 SXM（8×/节点，$4.77，TOP PERFORMANCE） |
| M3  | AI Inference                     | H200 SXM（Contact us，LARGE CONTEXT）  | RTX 5090（Contact us，COST EFFICIENT）      |
| M4  | Rendering & Simulation           | RTX 5000（Contact us，BEST PICK）      | RTX 4090（Contact us，BATTLE TESTED）       |
| M5  | Scientific Computing             | H100 SXM（$1.70，HPC READY）           | H200 SXM（Contact us，NO READY?）           |

**卡片设计（关键变化）：**

- **背景图：** `gpu-card-bg.png`（`/gpus/v5/gpu-card-bg.png`）用 CSS `background-image` 实现（卡片高度可变，不适合 `next/image` fill）
- **顶部：** GPU 名（H4）+ per-node 副标题（paragraph-16）
- **中间：** bullet 列表，每项前置圆形 Check 勾（`border-[var(--border-default)]` + `text-[var(--brand-1)]`）
- **底部互斥：**
  - 若 `price` 存在 → 左侧显示价格 + `/GPU/hr`，右侧显示 badge pill
  - 若 `ctaLabel` 存在 → 显示 "Contact us" 按钮（链接至 `BREVO_BOOK_LINK` 或 `mailto:gpu@novita.ai`），右侧仍显示 badge pill

**Badge tones（各组 pill 颜色）：**

| Tone          | 样式                                                                                | 示例            |
| ------------- | ----------------------------------------------------------------------------------- | --------------- |
| `best-value`  | 绿→黄渐变 `from-[var(--brand-1)] to-[var(--yellow-300)]`                            | BEST VALUE      |
| `performance` | 蓝→紫渐变 `from-[var(--blue-500)] to-[var(--purple-500)]`                           | TOP PERFORMANCE |
| `context`     | 同 performance                                                                      | LARGE CONTEXT   |
| `efficient`   | 绿→青 `from-[var(--green-500)] to-[var(--brand-1)]`                                 | COST EFFICIENT  |
| `pick`        | 橙→琥珀 `from-[var(--yellow-400)] to-[var(--yellow-600)]`（或以 Dev Mode 数值为准） | BEST PICK       |
| `tested`      | 灰深色 `from-[var(--gray-500)] to-[var(--gray-700)]`                                | BATTLE TESTED   |
| `hpc`         | 同 best-value                                                                       | HPC READY       |

### 区块 M6 — Why NOVITA

- `WHY NOVITA` kicker（绿色方块 + 大写文字）
- H2: **"Purpose-Built for AI Workloads"**
- 副文案: "Every feature designed to minimize GPU performance and minimize operational overhead."
- **4 个特性磁贴**（桌面 4 列，移动 2 列），每块：图标（深色小方块）+ 标题 + 描述
  1. Zero Virtualization Overhead
  2. Ready-to-Run Environment
  3. Guaranteed Delivery
  4. Physically Isolated Infrastructure
- 磁贴无背景图，使用 `var(--fill-4)` 浅色底 + 圆角

---

### 组件结构

```
GpuBareMetalPageContent.tsx
  ├── SectionHeader           — M1，SOLUTIONS kicker + H2 + 描述
  ├── WorkloadSection × 4     — M2–M5，data-driven via WORKLOAD_SECTIONS[]
  │     └── GpuCard           — 接受 backgroundImage prop；底部 price | cta 二选一
  └── WhyNovitaSection        — M6，WHY NOVITA kicker + H2 + 4 列特性磁贴
```

**`GpuCard` props 接口：**

```ts
type GpuCardProps = {
  backgroundImage: string; // URL，如 "/gpus/v5/gpu-card-bg.png"
  title: string; // GPU 型号，如 "H100 SXM"
  subtitle: string; // "8x NVIDIA H100 SXM per node"
  bullets: string[]; // 规格列表
  badge: { label: string; tone: BadgeTone };
  price?: string; // "$1.70"，有则显示价格
  ctaLabel?: string; // "Contact us"，有则替代 price 显示按钮
  ctaHref?: string; // 按钮跳转链接
};
```

`price` 和 `ctaLabel` 互斥（有 `ctaLabel` 则忽略 `price`）。

---

### 排版与间距

| 元素               | Token                                                             |
| ------------------ | ----------------------------------------------------------------- |
| 区标 kicker 间距   | `mb-[var(--space-12)]`，方块与文字 `gap-[var(--space-8)]`         |
| H2/H3 与副文案间距 | `mt-[var(--space-16)]`                                            |
| 标题到卡片区间距   | `mt-[var(--space-32)]`                                            |
| 卡片列间距         | `gap-[var(--space-24)]`（mobile）/ `gap-[var(--space-32)]`（lg+） |
| 区块间分割线       | `mt-space-24 border-t border-[var(--border-2)] pt-space-24`       |
| 无障碍             | 仅 Hero 有 `h1`；M1 用 `h2`，M2–M5 用 `h3`，卡片内用 `h4`         |

---

## 1b. 历史参考（重构前）

曾使用 `Header`、`ReadyStart`、`FooterBanner`、旧 [`Footer`](../../../src/app/components/footer/Footer.tsx)，以及已删除的 `index.module.scss`（`100vh` + 内层滚动）。

---

## 2. 目标状态（信息架构）

与 [`models/page.tsx`](../../../src/app/models/page.tsx) 同构：

1. **WebsiteNavbar** — v5 营销顶栏
2. **GPU Bare Metal Hero** — Figma `212-10578`，背景图 + 安全区 `h1` + CTA
3. **GpuBareMetalPageContent** — Figma **`214-11372`**，中间营销主体（当前为 Solutions 双栏卡；以 Dev Mode 为准迭代）
4. **FooterSection** — v5 页脚

（**`BaremetalList`** 暂不挂本页；需要时在 `page.tsx` 中于 `GpuBareMetalPageContent` 下方恢复或迁入 214 框架内。）

**移除（本页范围内）:** 当前页的 `ReadyStart`、`FooterBanner`、旧 `Header`、旧 `Footer` 引用，除非 Figma 或产品明确要求等价区块（若 Banner 已覆盖转化诉求，则不再堆叠旧组件）。

**页面根布局:** 与 models 一致：`flex flex-col min-h-screen bg-[var(--gray-50)]`。若列表极长需恢复「固定顶栏 + 内区滚动」，再在实现中单独论证（当前为自然文档流）。

---

## 3. Hero — 背景与「安全区」

### 3.1 需求（来自产品/设计）

- 背景图占满 **Hero 区域高度**（随 `min-height` / 内边距定义的 Hero 盒子变化）。
- **宽度自适应**：不同视口下背景始终覆盖 Hero，不拉伸变形；使用 `object-fit: cover` 语义。
- **安全区**：文案与按钮落在与全站 v5 一致的横向安全区内（与 Model Library 一致：`max_width_container` / `mx-web` / 或 Figma 标注的 `max-w-[1512px]` + 响应式 `px-*` —— **以实现阶段 Figma Dev 数值为准**，优先复用已有 token：`var(--spacing-layout-x)`、`var(--spacing-layout-inner-x)`、`var(--max-width)`，见 [`globals.scss`](../../../src/app/globals.scss)）。
- **背景可全宽出血**：背景层 `absolute inset-0`，宽为 `100vw`，与内层「安全区」内容解耦；用户期望「安全区可以占满」理解为：**在常见桌面宽度下，构图关键区域落在可视安全区内**，通过 `object-position`（如 `center` / `right top`，以 Figma 为准）微调。

### 3.2 推荐实现模式（与现有 v5 一致）

对齐 [`ModelLibraryHero.tsx`](../../../src/app/models/components/ModelLibraryHero.tsx)：

- 外层 `<section className="relative w-full overflow-hidden min-h-[…] bg-[…]">`（`min-h`、底色取自 Figma）。
- 背景：`<div className="absolute inset-0 pointer-events-none">` + `next/image` `fill`、`sizes="100vw"`、`className="object-cover object-…"`、`priority`、`alt=""` + `aria-hidden`。
- 可选：底部渐变蒙层（若 Figma 有），用 token 色写 `linear-gradient`，勿写死未映射 hex（或先查 `_design-tokens.scss` / `theme.scss` 映射）。
- 文案层：`relative`/`absolute` + `z-10`，内层 **`max_width_container` 或 `max-w-[1512px] mx-auto` + 与 Figma 一致的 padding**，保证 **所有 Hero 文本与 CTA 在安全区内**。

### 3.3 备选方案（权衡）

| 方案          | 做法                                              | 优点                             | 缺点                                              |
| ------------- | ------------------------------------------------- | -------------------------------- | ------------------------------------------------- |
| **A（推荐）** | `next/image` + `fill` + `object-cover`            | LCP、占位、与 Model Library 一致 | 需为 `min-height`/`object-position` 与 Figma 对齐 |
| **B**         | CSS `background-image` + `background-size: cover` | 实现快                           | 无自动优化、与项目 v5 惯例不一致                  |
| **C**         | 多分辨率 `<picture>` 源                           | 极致画质                         | 资产与构建成本高，非必要                          |

---

## 4. 前端工程约束（FE SKILL / CLAUDE）

- **样式：** 以 **Tailwind** 为主，颜色/字体用 **`var(--*)`** 与已有 **`font-*`** 类（见 `globals.scss` / `mixins.scss`），避免硬编码色值；映射不到的先查 `_design-tokens.scss`。
- **按钮：** 项目 [`Button`](../../../src/app/components/button/Button.tsx)。
- **新 Hero：** 优先 **Tailwind 单文件组件**（如 `GpuBareMetalHero.tsx`），避免为 Hero 新增 `.module.scss`（与 CLAUDE.md 一致）。
- **可访问性：** 装饰背景 `aria-hidden`；真实标题用页面级 `h1`（通常一处，放在 Hero 内）。
- **Figma：** 实现前从 Dev Mode 提取间距、字号、圆角；若无法访问 Figma，则暂停视觉还原并反馈，不凭猜测硬编码。

---

## 5. 数据与行为

- **本页：**中间区当前为静态 `SOLUTION_BLOCKS`（[`GpuBareMetalPageContent.tsx`](../../../src/app/gpu-baremetal/components/GpuBareMetalPageContent.tsx)），可接 CMS/API。
- **库存列表：**[`BaremetalList`](../../../src/app/gpu-baremetal/components/BaremetalList.tsx) 等 API/抽屉/埋点逻辑**仍在仓库**，本页未渲染；若产品要求与 Figma 214 合并展示，再挂载。
- **SEO：** `generateMetadata` 保留；随 Hero/主体文案更新 `title`/`description`。

---

## 6. 测试与验收

- [ ] 常见视口（390 / 768 / 1280 / 1512+）：Hero 高度与 Figma 一致感、背景无露底、无横向意外滚动条（`overflow-hidden` 于 section）。
- [ ] 文案与按钮不超出安全区；与 Model Library 页左右对齐观感一致。
- [ ] Lighthouse：Hero 图 `priority` 合理；无障碍：单 `h1`、按钮可聚焦。
- [ ] 列表加载/空态/抽屉与重构前行为一致。

---

## 7. 后续步骤（流程）

本设计经评审通过后，使用 **writing-plans** 技能编写实现计划（文件级改动清单、与 Figma 对齐的检查表），再进入编码。

---

## 8. 自检（spec review）

- 无 TBD：Figma 精确数值在实现计划中用 Dev Mode 补齐。
- 背景 URL 已明确：`/gpus/v5/gpu-bare-metal-hero-bg.png`。
- 范围：整页 v5 外壳 + Hero；列表逻辑保留、视觉随 Figma 在实现中落地。
- 与「仅 Hero」方案不冲突：已根据选型扩展为整页。
