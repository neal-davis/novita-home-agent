# Model Library Page (`/models`) — v5 Redesign

**Date:** 2026-04-22  
**Route:** `/models` (upgrade in-place, replaces current layout)  
**Figma:** `3nHa4z8enopB5YGSneFZlK`, node `1:15123`  
**Approach:** 方案 A — 就地升级，复用现有 hook 和卡片组件，新增 Hero 和 Sidebar 布局组件

---

## 1. 页面结构

```
/models/page.tsx  (server component, 获取 llmModelList)
├── WebsiteNavbar
├── ModelLibraryHero          ← 新建
├── ModelLibraryContent       ← 改造 Content.tsx
│   ├── SidebarFilter         ← 新建，替代横向 LabelFilters
│   └── 右侧内容区
│       ├── 标题行 + View All 按钮
│       ├── ModelSearch (复用，样式调整)
│       └── 卡片网格 (LLMModelCard / MediaModelCard)
├── FooterBanner              ← 复用首页 FooterBanner 组件
└── FooterSection             ← 复用首页 WebsiteFooter 组件
```

---

## 2. Hero 模块

### 节点

Figma node `1:15385`，尺寸 1512 × 708px

### 背景层次（3 层）

| 层           | 实现                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| 底色         | `bg-[var(--gray-50)]`                                                                                   |
| 右侧装饰图   | `public/models/v5/modelapi-bg.png`，在安全区容器内绝对定位 `right-0 top-0 h-full w-auto object-contain` |
| 底部渐变遮罩 | `absolute bottom-0 left-0 right-0 h-[208px]`，`linear-gradient(to bottom, transparent, var(--gray-50))` |

**安全区容器**：`absolute inset-0 max-w-[1280px] mx-auto`（图片不超出 1280px 居中范围，随页面居中）

### 内容区（`relative z-10`）

```
position: absolute bottom-[131px] left-[124px]
max-width: 560px
padding: py-[80px]
```

- **H1**：`"Browse our supported open source models"`  
  class: `font-miletus font-display-md text-[var(--text-1)]`

- **副标题**：`"Developer-first infrastructure that scales from zero to production."`  
  class: `font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[400px]`

- **CTA 按钮组**（`flex items-center gap-3`）：
  - 主按钮：`Start Building`，黑底白字圆角，复用项目 `Button` 组件，链接 `NOVITA_URL.USER_REGISTER`
  - 文字按钮：`Talk to Us >`，复用项目 `Button type="text"`，链接 `CALENDLY_URL`，右侧 `ChevronRight` 16px

### 新建组件

- `src/app/models/components/ModelLibraryHero.tsx`（client 或 server 均可，无交互）
  - 不复用 homepage `HeroBackground`（那是 WebGL 动画，此处纯静态 PNG）
  - 不复用 `HeroDecoration`（结构不同）

---

## 3. Explore the Library 内容模块

### 节点

Figma node `1:15510`，整体容器 `max_width_container`

### 整体布局

```
flex flex-row gap-[66px] mx-web mt-[60px]
├── SidebarFilter   width: ~256px, flex-shrink-0
└── 右侧内容区       flex-1
```

---

## 4. 左侧 SidebarFilter

### 新建组件

`src/app/components/ModelLibrary/SidebarFilter/index.tsx`（替代 `LabelFilters` 在新版中的位置，`LabelFilters` 本身不删除）

### TASK 段（第一级：模型类型）

- 段标题：`"TASK"`，class `font-mono-13 text-[var(--gray-400)] uppercase tracking-[0.26px]`
- 每行高度 `h-[46px]`（无 token，保留），`border-b border-[var(--border-2)]`，`flex justify-between items-center`
- 左侧：label 文字，class `font-paragraph-14 text-[var(--text-1)] uppercase`
- 右侧：count 数字，同字体，选中时 `text-[var(--brand-0)]`
- **选中态**：左侧绿点 `size-[var(--space-8)] rounded-[var(--radius-2)] bg-[var(--brand-0)]`，数字颜色 `var(--brand-0)`
- **数量来源**：`useModelLibrary` hook 新增 `categoryCounts` useMemo（基于 `allModels`，不受 filter 影响）

分类枚举（按 Figma 顺序）：

```
Featured | All Models | LLM | Serverless | Image | Video | Embedding | Reranker
```

对应 `ModelType` 枚举值：`Featured / All / Chat / Serverless / Images / Video / Embedding / Reranker`

### PROVIDER 段（第二级：Provider）

- 段标题：`"PROVIDER"`，同 TASK 段标题样式（`font-mono-13`）
- 两段**始终同时显示**，非 accordion 展开
- 每行高度 `h-[56px]`（无 token，保留），`flex justify-between items-center`，`border-b border-[var(--border-2)]`
- 左侧：`ModelLogo`（`size-[var(--height-24)]`）+ provider name，class `font-paragraph-14 text-[var(--text-1)]`
- 右侧：count 数字，同字体
- Provider 列表可滚动（内容超出时，`overflow-y-auto`）
- **数量来源**：`useModelLibrary` hook 新增 `providerCounts: Record<string, number>` useMemo（基于 `allModels` 按 `series` 分组计数）
- **选中态**：同 TASK 段，左侧绿点 + 数字变色

### SidebarFilter Props

```typescript
interface SidebarFilterProps {
  allModels: AnyModel[];
  selectedCategory: ModelType | "";
  selectedProvider: string;
  categoryCounts: Record<string, number>;
  providerCounts: Record<string, number>;
  onCategoryChange: (category: ModelType | "") => void;
  onProviderChange: (provider: string) => void;
}
```

---

## 5. 右侧内容区

### 标题行（`flex justify-between items-start`）

- 左侧：
  - 主标题：`"Explore the library"`，`font-heading-h2 text-[var(--text-1)]`
  - 副标题：`"Browse our supported open source models and deploy in dedicated endpoints"`，`text-[var(--text-3)]`
- 右侧：
  - `"VIEW ALL 150+ MODELS →"` 按钮
  - 样式：`variant="link"`，`text-[var(--brand-0)] uppercase font-mono text-[14px]`，右侧 `ChevronRight` 16px
  - **点击行为**：调用 `clearFilter()`，重置 category → `All`，provider → `""`

### 搜索栏

- 复用 `ModelSearch` 组件逻辑（`onSearch` 等），替换 UI 外壳：
  - 全宽，`w-full`，`h-[46px]`，**方形无圆角**（`rounded-none`）
  - `border border-[var(--border-2)]`
  - placeholder：`"SEARCH MODELS (e.g. Llama 3)"`，uppercase，`font-mono text-[13px] text-[var(--text-3)]`
  - 左侧 Lucide `Search` 图标 20px

### 卡片网格

- `grid grid-cols-3 gap-x-[18px] gap-y-[var(--space-12)] mt-4`（gap-x 无对应 token，保留 18px）
- 每卡尺寸：306 × 252px（内容撑高）
- 显示逻辑：flat grid，**不再按 section 分组**（去掉 `ModelSectionRenderer`）
- 组件：`LLMModelCard`（displayMode="block"）/ `MediaModelCard`

---

## 6. 模型卡片样式更新

现有 `BaseModelCard` 有圆角，新设计**无圆角**（方形）、tags footer 背景/样式不同。

**方案**：在 `BaseModelCard` 新增 `variant?: "default" | "square"` prop，避免破坏其他页面用法。

### square variant 差异点

| 属性             | 当前 default    | 新 square                                               |
| ---------------- | --------------- | ------------------------------------------------------- |
| 卡片圆角         | 有（SCSS 定义） | `rounded-none`                                          |
| Tags footer 背景 | 无特殊背景      | `bg-[var(--fill-4)]`                                    |
| Tag 样式         | 有圆角          | 方形，`rounded-none`，`font-mono text-[12px] uppercase` |
| Tag 背景         | 现有配色        | `bg-[var(--white)]`                                     |

### 卡片三层结构（square variant）

**上层 — Header**（`p-[var(--space-16)]`）

- `flex flex-col gap-[var(--space-8)]` — ModelLogo (36px) 在上，模型名在下
- ModelLogo：`size-[var(--height-36)]`
- 模型名：class `font-paragraph-20-medium text-[var(--text-1)]`
- 可选 badge（New / Hot / Free）右上角绝对定位保留

**分隔线**

- `border-b border-[var(--border-2)] mx-[var(--space-16)]`

**中层 — Pricing**（`px-[var(--space-16)] py-[var(--space-12)]`）

- 两行分组：
  - 第一行：Input / Cache Read / Output，`flex flex-wrap gap-x-[16px] gap-y-[8px]`，每列 `w-[80px]`
  - 第二行：Context / Max Output，`flex flex-wrap gap-x-[46px] gap-y-[8px]`
  - value: `font-paragraph-14 text-[var(--text-1)]`（注意：非 medium，Figma 为 Regular weight）
  - label: `font-paragraph-12 text-[var(--text-3)]`
  - 两行间距：`gap-[20px]`（flex-col on outer wrapper）
- 直接使用现有 `LLMLibraryInfo` 数据结构，无需新增字段

**下层 — Tags Footer**（`p-[var(--space-16)] bg-[var(--fill-4)]`）

- `flex gap-[var(--space-12)] flex-wrap`
- 每个 tag：`bg-[var(--white)] px-[var(--space-6)] py-[var(--space-4)] font-mono-12 uppercase text-[var(--text-1)] rounded-none`

---

### 实现方式

新增 `renderInfoContentSquare()` 函数专门渲染 square variant 的 pricing，与 default variant 的 `renderInfoContent()` 共存，不影响其他页面。

---

## 7. 数据流 & Hook 改造

### `useModelLibrary.ts` 新增导出

```typescript
// 新增：各 ModelType 的模型总数（基于 allModels，不受 filter 影响）
categoryCounts: Record<string, number>

// 新增：各 provider (series) 的模型总数（基于 allModels）
providerCounts: Record<string, number>

// 新增（或已有）：清除所有筛选
clearFilter: () => void
```

两个 counts 均用 `useMemo` 计算，依赖 `allModels`（不依赖 `filteredModels`）。

### `/models/page.tsx` 改造

- 保持 server component，继续通过 `getFullLLMModels` 获取 `llmModelList`
- 将 `ModelLibraryHero` 和改造后的 `ModelLibraryContent` 替换现有渲染内容

### `Content.tsx` 改造要点

- 布局：从单列 → `flex flex-row gap-[66px]`（左 sidebar + 右内容区）
- 移除 `ModelFilter`（横向 pill filter）
- 渲染逻辑：去掉 `ModelSectionRenderer` 分组，统一用 flat grid
- 接收 `useModelLibrary` 扩展后的所有返回值

---

## 8. 文件改动清单

### 新建

- `src/app/models/components/ModelLibraryHero.tsx`
- `src/app/components/ModelLibrary/SidebarFilter/index.tsx`
- `src/app/components/ModelLibrary/SidebarFilter/index.module.scss`（如需）

### 改造

- `src/app/models/model-library/Content.tsx` — 布局重构
- `src/hooks/useModelLibrary.ts` — 新增 `categoryCounts`、`providerCounts`、`clearFilter`
- `src/app/components/ModelLibrary/BaseModelCard/index.tsx` — 新增 `variant="square"`
- `src/app/models/page.tsx` — 引入新 Hero，保持 server component 结构

### 不动

- `src/app/components/ModelLibrary/LabelFilters/` — 保留，其他页面可能使用
- `src/app/components/ModelLibrary/LLMModelCard.tsx` — 直接复用
- `src/app/components/ModelLibrary/MediaModelCard.tsx` — 直接复用
- `src/app/components/ModelLibrary/ModelLogo/` — 直接复用
- `src/hooks/useModelLibrary.ts` 现有逻辑 — 只追加，不修改现有逻辑

---

## 9. 注意事项

1. **图片资源**：`public/models/v5/modelapi-bg.png` 已就绪，直接用 `next/image` 引入，`priority` 设为 true（首屏）
2. **BaseModelCard variant**：新增 prop 需确认不影响 `models-console/library` 等其他使用页面
3. **"VIEW ALL 150+ MODELS" 数字**：150+ 暂时硬编码，后续可从 `allModels.length` 动态生成
4. **Audio / Vision 分类**：Figma 设计中未展示，但 `ModelType` 枚举中存在。初版按 Figma 枚举实现（不含 Audio、Vision），后续根据产品需求补充
5. **字体 `Miletus Grotesk Trial`**：项目 `globals.scss` 已加载，直接使用 `font-miletus` class
