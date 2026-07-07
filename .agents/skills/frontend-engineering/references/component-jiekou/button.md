# JieKou Button

**源码**：`src/components/ui/button.tsx`；业务入口优先 `@/app/components/button/Button`。

- 基础类：`inline-flex items-center justify-center shrink-0 whitespace-nowrap rounded-lg text-sm font-medium transition-colors`。
- 禁用：`disabled:pointer-events-none disabled:opacity-50`；显式 `disabled` variant 为 `bg-primary-disabled text-primary-foreground cursor-not-allowed opacity-50`。
- variant：`default` 用 `bg-primary text-background hover:bg-primary-hover`；`secondary`、`warn`、`green` 均有 token hover；`link` 保留 underline 行为。
- `outline` 与 `ghost` 源码仍使用 legacy `#BBB9B6` 边框；维护旧组件可保留，新 UI 不要继续扩散硬编码色。
- `text` variant 依赖 `button.module.scss`，并按 `page="web" | "console"` 覆盖 `text-primary` / `text-black`。
- `ButtonArrow` 使用 `iconfont icon-right-arrow text-common-dark-1`，不要手写 SVG path。
