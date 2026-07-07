# ButtonGroup

**源码**：`src/components/ui/button-group.tsx`。

| 节点       | 规范                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| Group      | `flex w-fit items-stretch`，focus-visible 子项提到 `z-10`。                               |
| horizontal | 非首项 `rounded-l-none border-l-0`；非末项 `rounded-r-none`。                             |
| vertical   | 非首项 `rounded-t-none border-t-0`；非末项 `rounded-b-none`。                             |
| Text       | `bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs`。 |
| Separator  | `bg-input relative !m-0 self-stretch`。                                                   |

## 使用规则

- 用于组合 Button/Input/Select；不要用 margin 拼接导致双边框。
- 组内含 SelectTrigger 时保持宽度规则，不要覆盖导致布局跳动。
