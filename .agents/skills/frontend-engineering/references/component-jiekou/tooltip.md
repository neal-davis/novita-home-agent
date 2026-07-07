# JieKou Tooltip

**源码**：`src/components/ui/tooltip.tsx`、`src/components/ui/standard/tooltip.tsx`。

- 基础 Tooltip 用 `@/components/ui/tooltip`；业务 wrapper 用 `AppTooltip`。
- 常规层级为 `z-50`。
- Tooltip 只放短说明，不承载复杂交互；复杂内容使用 Popover / HoverCard。
- icon-only button 需要 `aria-label`，不能只依赖 Tooltip。
