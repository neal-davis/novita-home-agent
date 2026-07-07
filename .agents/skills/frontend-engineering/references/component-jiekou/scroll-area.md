# JieKou ScrollArea

**源码**：`src/components/ui/scroll-area.tsx`。

- 使用 Radix ScrollArea。
- 宽表优先用 Table 外层 `overflow-auto scrollBar_container`；内容面板滚动才使用 ScrollArea。
- 避免页面级横向滚动，横向滚动应局部包裹。
