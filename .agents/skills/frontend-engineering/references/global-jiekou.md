---
name: jiekou-tailwind-tokens
description: >
  jiekou-home 的 Tailwind CSS 与 design-token 编码规范；唯一权威映射见 tailwind.config.ts。
  在编写或审查 className、新增/修改样式、SCSS 与 Tailwind 混用、对接 shadcn/ui、Tremor、
  Radix Accordion、Headless UI、响应式与暗色类、Safelist 动态色、或需避免「Tailwind 默认调色盘」
  假设时触发。变量分散在 src/styles/_design-tokens.scss、src/styles/theme.scss、src/app/globals.scss。
---

# JieKou AI Tailwind & Design Tokens

本文件只在当前工作区路径、仓库名或上层目录包含 `jiekou` 时加载。不要把 JieKou 的紫色 brand、AI components、字体类或场景约束应用到 PPIO / Novita。

## 双场景架构

| 项             | Website                                 | Console                         |
| -------------- | --------------------------------------- | ------------------------------- |
| Header         | 60px，1040px 以下 48px                  | 54px                            |
| Sidebar        | 无                                      | 左侧导航                        |
| 容器           | `max_width_container`，max-width 1280px | Console card layout             |
| 大标题         | `font-h0/h1/h2/h3` 允许                 | 禁止 `font-h0/h1/h2/h3`         |
| Console header | 禁止                                    | `--console-header-height: 54px` |
| Button         | `@/app/components/button/Button`        | 同 Website                      |

先判断 Website 还是 Console，再选择容器、字体和组件密度。

## CSS 变量系统

JieKou 使用 CSS 变量作为主要 token 入口。写业务样式时优先使用 `var(--*)` 和项目语义类，不使用 Tailwind 默认色。

```tsx
// 正确
className = "text-[var(--dark-1)] bg-[var(--gray-3)] border-[var(--gray-2)]";

// 禁止
className =
  "text-gray-800 bg-gray-100 border-gray-200 rounded-md text-sm font-semibold";
```

关键 token：

- Brand：`--brand-0`、`--brand-1`，其中 `--brand-1` 是 JieKou 紫色主品牌。
- Text：`--dark-1/2/3/4`。
- Surface：`--gray-1/2/3`、`--fill-1~5`。
- Status：`--error-color`、`--warn-color`、`--init-color`、`--inactive-color`，以及 `--red-*`、`--green-*`、`--yellow-*`、`--orange-*`。
- Console spacing：`--spacing-console-4/6/8/12/16/24`。
- Website spacing：`--spacing-layout-x`、`--spacing-block-y`、`--spacing-web-text`。
- Radius：`--radius-button`、`--radius-input`、`--small-radius`、`--radius-dialog`。

## 字体绑定

每个可见文本元素必须使用一个语义字体类，不能用裸 `text-sm`、`text-lg`、`font-medium`、`font-semibold` 拼装。

| Class                                       | 场景         | 用途                      |
| ------------------------------------------- | ------------ | ------------------------- |
| `font-h0`                                   | Website only | Landing hero title        |
| `font-h1` / `font-h2` / `font-h3`           | Website only | Landing 大标题 / 分区标题 |
| `font-h4-large` / `font-h4`                 | Both         | 大卡片 / 页面标题         |
| `font-h5` / `font-h6`                       | Both         | section / 卡片或弹窗标题  |
| `font-body` / `font-body-medium` / `font-p` | Both         | 正文                      |
| `font-table-head` / `font-table-item`       | Both         | 表格                      |
| `font-subtle*` / `font-small*`              | Both         | helper、badge、注释       |
| `font-link` / `font-link-small`             | Both         | 链接                      |

Console 页面禁止 `font-h0/h1/h2/h3`。

## 硬约束

- 禁止 hardcoded colors：使用 `var(--brand-1)`，不要 `#6d28d9` 或 `bg-violet-700`。
- 禁止 Tailwind generic colors：`text-gray-*`、`bg-blue-*` 等默认 palette。
- 禁止默认 radius：`rounded-md`、`rounded-lg`、`rounded-xl`，使用 CSS 变量或项目 radius 类。
- 禁止默认 shadow：`shadow-sm`、`shadow-lg`，使用 `shadow-1~5`、`module-shadow`、`drop-menu-shadow`、`pop-up-shadow`。
- Redux 必须使用 `useAppSelector` / `useAppDispatch`。
- Icons 优先 `lucide-react`，其次 iconfont 或 `@/lib/icons/`。

## 权限域

涉及权限、导航或菜单可见性时，资源组应来自既有 RBAC 体系：

`account | billing | gpu_setting | image | instance | jobs | key_management | model_api | serverless | storage | team | template | vpc | playground | quota`

不要臆造新的权限组。

## 数据域参考

如果当前仓库保留了产品数据表或模块配置，优先查既有数据，不要臆造模块、路由或组件能力。

| Domain              | 用途                                                |
| ------------------- | --------------------------------------------------- |
| `jiekou-variables`  | CSS variables、spacing、shadow、z-index、breakpoint |
| `jiekou-colors`     | brand、dark、gray、fill、status 色                  |
| `jiekou-components` | shadcn/custom/AI component 选择                     |
| `jiekou-fonts`      | 语义字体类和使用场景                                |
| `jiekou-checklist`  | 代码约定检查                                        |
| `jiekou-modules`    | 业务模块、路由、sidebar 信息                        |

这些域名来自源 UI skill 的搜索体系；在当前合并后的 frontend-engineering 中不要自动执行外部搜索脚本。若用户明确要求使用源数据，再按源仓库工具查询。

## 组件入口

组件库、AI components、antd fallback 和浮层规则见 [`component-jiekou.md`](./component-jiekou.md)。
