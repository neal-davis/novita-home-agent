# HoverCard

**源码**：`src/components/ui/hover-card.tsx`。

| 节点    | 规范                                                                                          |
| ------- | --------------------------------------------------------------------------------------------- |
| Content | `z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none`。 |
| 动画    | Radix state/side 的 fade/zoom/slide。                                                         |

## 使用规则

- HoverCard 只用于补充信息；关键操作不要只放在 hover 内。
- 移动端 hover 不可靠，重要内容需有点击/展开替代。
