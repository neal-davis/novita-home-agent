# Sheet

**源码**：`src/components/ui/sheet.tsx`。

| 维度         | 规范                                                      |
| ------------ | --------------------------------------------------------- |
| Overlay      | `fixed inset-0 z-50 bg-black/80`。                        |
| Content base | `fixed z-50 gap-4 bg-background p-6 shadow-lg`。          |
| top/bottom   | `inset-x-0` + `border-b` / `border-t`。                   |
| left/right   | `inset-y-0 h-full w-3/4 border-r/l sm:max-w-sm`。         |
| Close        | `right-4 top-4 rounded-sm opacity-70 hover:opacity-100`。 |
| Title        | `text-lg font-semibold text-foreground`。                 |

## 使用规则

- Sheet 默认 `z-50`，低于 Dialog；不要假设它能覆盖所有 modal。
- 需要超过 Dialog 的业务抽屉应确认是否应使用 Drawer 或业务 Modal。
