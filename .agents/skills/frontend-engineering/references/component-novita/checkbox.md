# Checkbox

**源码**：`src/components/ui/checkbox.tsx`。

| 维度        | 规范                                                                                 |
| ----------- | ------------------------------------------------------------------------------------ |
| 尺寸 / 圆角 | `h-4 w-4 rounded-sm`。                                                               |
| 未选中      | `border border-[var(--dark-1)]`。                                                    |
| 选中        | `data-[state=checked]:bg-[var(--dark-1)] data-[state=checked]:text-[var(--white)]`。 |
| 焦点        | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`。         |
| 禁用        | `disabled:cursor-not-allowed disabled:opacity-50`。                                  |

## 使用规则

- 不要用 div 手写 checkbox。
- 列表批量选择保持与 Table 行 hover/selected 状态兼容。
