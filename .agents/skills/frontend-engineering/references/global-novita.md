---
name: novita-tailwind-tokens
description: >
  Novita AI 的 Tailwind CSS 与 design-token 编码规范；唯一权威映射见 tailwind.config.ts。
  在编写或审查 className、新增/修改样式、SCSS 与 Tailwind 混用、对接 shadcn/ui、Tremor、
  Radix Accordion、Headless UI、响应式与暗色类、Safelist 动态色、或需避免「Tailwind 默认调色盘」
  假设时触发。变量分散在 src/styles/_design-tokens.scss、src/styles/theme.scss、src/app/globals.scss。
---

# Novita AI Tailwind & Design Tokens

本文件只在当前工作区路径、仓库名或上层目录包含 `novita` 时加载。不要把这里的 token、字体、场景规则应用到 PPIO 或 JieKou。

完整 token 表见 [`novita-design-tokens.md`](./novita-design-tokens.md)。写样式前先判断场景：`website_app` 和 `console_app` 的容器、字号和布局规则不同。真实项目约定以 `novita-home/CLAUDE.md`、`tailwind.config.ts`、`src/styles/_design-tokens.scss`、`src/styles/theme.scss`、`src/app/globals.scss` 为准。

## 场景架构

| 项           | Website (`website_app`)                    | Console (`console_app`)       |
| ------------ | ------------------------------------------ | ----------------------------- |
| Header       | 80px                                       | 54px                          |
| Sidebar      | 无                                         | 218px fixed left              |
| 容器         | `max_width_container`                      | `console-card`                |
| 大标题       | 允许 `font-h1/h2/h3` 或 display/heading 类 | 禁止 `font-h1/h2/h3`          |
| Console 字体 | 禁止 `font-h6`                             | `font-h6` 可用于卡片/弹窗标题 |

**先识别场景再写 markup。** 场景混用是 Novita 页面最常见的视觉错误。

`src/app/globals.scss` 的样式加载顺序是 `iconfont` → `_design-tokens` → `theme` → `animate.css` → Tailwind layers。`html.console_app` 会覆盖部分字体指标，Console 页面要优先跟随现有 console 组件模式。

## Token 优先级

1. 优先使用能直接表达设计意图的 Tailwind utility，包括项目扩展类：`flex`、`gap-4`、`bg-white`、`border`、`shadow-sm`、`p-space-20`、`rounded-8`。
2. 当 Figma 值映射到 Novita token 且没有自然 utility 时，用 token class 或 CSS 变量：`bg-brand-0`、`bg-fill-4`、`text-status-error`、`text-[var(--text-1)]`、`border-[var(--border-subtle)]`。
3. 禁止硬编码 hex/rgb；当设计明确要求项目 token 时，不要用未映射的 Tailwind 默认色、随意 arbitrary spacing/radius/font。

```tsx
// 正确
className =
  "flex items-center gap-4 bg-white text-[var(--text-1)] border border-[var(--border-subtle)] p-space-20";

// 禁止
className = "bg-[#23d57c] text-[#333] rounded-[7px] p-[19px]";
```

## 视觉语言

- Brand green `#23d57c` 是唯一高能量色，只用于 CTA、确认、active/success 状态，避免大面积装饰。
- 页面底色偏向 `--bg-default` / `#fafafa`，卡片和输入表面保持克制。
- 边框优先 alpha token：`--border-subtle`、`--border-default`、`--border-strong`。
- 阴影优先使用项目 `shadow-1` 到 `shadow-5` 或现有组件内的 `shadow-sm` 等既有模式；不要为新 elevation 硬编码大段 `box-shadow`。
- Miletus 用于正文、标题和 UI 文案；TT Mono 只用于机器语义标签、eyebrow、code-adjacent 内容，不在一个文本节点内混用。

## 字体规则

优先使用项目语义字体类；现有 shadcn 基础组件里的 `text-sm`、`font-medium` 不需要为了迁移而改。新业务 UI 遇到明确 Figma 字号时，映射到 `font-*` 或 `text-*` token，避免散落 `text-[14px] leading-[18px]`。

| 类别                 | 推荐                                                         |
| -------------------- | ------------------------------------------------------------ |
| Website hero/section | `text-display-*`、`text-heading-*` 或 legacy `font-h1/h2/h3` |
| Console 标题         | `font-h6`、`font-paragraph-16-medium`                        |
| 正文                 | `font-paragraph-16`、`font-paragraph-14`、legacy `font-body` |
| 表格                 | `font-table-head`、`font-table-item`                         |
| 机器标签             | `font-mono-*` + TT Mono 语义                                 |

## 硬约束

- 禁止 hardcoded hex：`#23d57c`、`#fafafa` 等必须转 token。
- Tailwind generic colors 只在它们来自 `tailwind.config.ts` 的项目 palette 且符合设计意图时使用；设计指定 `var(--dark-*)`、`var(--text-*)`、`var(--fill-*)` 时必须映射 token。
- Radius 优先用项目 token：`rounded-4`、`rounded-6`、`rounded-8`、`rounded-12`、`rounded-full`；`rounded-lg` 等默认/legacy 类只在复用 shadcn 或项目既有组件模式时保留。
- Spacing 可直接使用普通 Tailwind 间距和项目扩展 spacing：`gap-4`、`p-6`、`p-space-20`、`pb-space-48`；Figma 精确值没有对应类时再使用 `var(--space-*)` 或合理 arbitrary value。
- 禁止直接 `import { Button } from "antd"`，使用项目 Button wrapper。
- Redux 必须使用 `useAppSelector` / `useAppDispatch`，不要直接用 `useSelector` / `useDispatch`。

## Figma 到代码

Figma 输出只代表设计意图，落地前必须映射到 Novita token。

| Figma 值             | 代码                                                |
| -------------------- | --------------------------------------------------- |
| `#23D57C` fill       | `bg-brand-0`                                        |
| `14px/18px Regular`  | `font-miletus text-paragraph-14` 或项目 legacy font |
| `border-radius: 6px` | `rounded-6` / `rounded-regular`                     |
| 轻量 card shadow     | `shadow-1` 或既有组件的 `shadow-sm`                 |

## 英文内容质量

Novita UI 文案必须保持专业、准确、一致。

- 拼写错误立即修正：例如 `recieve` → `receive`、`seperate` → `separate`、`occured` → `occurred`。
- Page title 使用 Title Case；说明文、helper text 使用 Sentence case。
- 同一操作不要混用不同动词，例如同一删除语义不要一处写 `Delete`、另一处写 `Remove`。
- 避免 casual language，例如 `stuff`、`gonna`。
- 术语固定：`Novita AI`、`GPU`、`API key`、`inference`、`deployment`、`repository`、`authentication`、`configuration`、`maintenance`。

Mock 数据也要像真实 SaaS 数据：使用真实感英文名称和描述；状态词使用 `Active`、`Inactive`、`Pending`、`Failed`、`Running` 等标准表达；至少包含一个长名称用于截断验证；mock 注释用英文 `TODO`。

## 组件入口

组件选择和封装规则见 [`component-novita.md`](./component-novita.md)。涉及 `src/components/ui`、Dialog/Popover/Select/Table/Button、antd fallback 或 z-index 时必须加载。
