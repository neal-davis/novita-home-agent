# Sonner

**源码**：`sonner.tsx`。

| 维度            | 规范                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **实现方式**    | 与 Radix **Toast** 并行；根 `className="toaster group"`，图标 Lucide。                                                                                      |
| **inline 变量** | `--normal-bg` → `var(--popover)`；`--normal-text` → `var(--popover-foreground)`；`--normal-border` → `var(--border)`；`--border-radius` → `var(--radius)`。 |

新增全局 Toast 前确认业务用 **`<Toaster />`（Sonner）** 还是 **`toaster.tsx`（Radix）**。
