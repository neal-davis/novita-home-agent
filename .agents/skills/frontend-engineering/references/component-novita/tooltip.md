# Tooltip

**源码**：`src/components/ui/tooltip.tsx`；业务 wrapper：`standard/tooltip.tsx`。

| 节点             | 规范                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `TooltipContent` | `z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md`。 |
| 动画             | 使用 Radix state/side 的 fade/zoom/slide。                                                                  |

## AppTooltip

- `import { AppTooltip } from "@/components/ui/standard/tooltip"`。
- wrapper 默认包一层 `inline-flex` trigger。
- overlay 支持 `overlayClassName` 和 inline style；不要为普通 tooltip 重写一套浮层。
