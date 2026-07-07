# Separator

**源码**：`src/components/ui/separator.tsx`。

| 场景       | 规范                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| horizontal | `shrink-0 bg-border h-[1px] w-full`。                                      |
| vertical   | `shrink-0 bg-border h-full w-[1px]`。                                      |
| 带 label   | label 用 `bg-background px-2 text-xs text-muted-foreground` 居中覆盖线条。 |

## 使用规则

- 分割线颜色来自 `bg-border`；不要硬编码灰色。
- 带 label 的 separator 要确认背景与父容器一致，否则会出现断层。
