# JieKou Select

**源码**：`src/components/ui/select.tsx`。

- Trigger：`h-9 rounded-[6px] border-[var(--gray-2)] bg-background py-2 pl-3 pr-9 text-sm`。
- Trigger hover/focus：`hover:border-input-hover focus:border-input-hover`；右侧 icon 默认 `ChevronDown`。
- Content：`rounded-md border bg-popover text-popover-foreground shadow-md scrollBar_container_new`。
- Content 使用 inline `style={{ zIndex: 10002 }}`，这是 Select 高于普通浮层和 Dialog 的项目特例。
- Item：`cursor-pointer rounded-sm py-1.5 text-sm`；选中/hover 使用 `bg-[var(--gray-3)]`。
- 支持 `topSlot`、`disableScrollButton`、`collisionPadding`、`autoAvoidObstacles`；复杂固定 footer 场景不要自行重写 Popper 逻辑。
