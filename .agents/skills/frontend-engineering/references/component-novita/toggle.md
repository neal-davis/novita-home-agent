# Toggle / ToggleGroup

**源码**：`src/components/ui/toggle.tsx`、`toggle-group.tsx`。

| 组件           | 规范                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| Toggle root    | `rounded-[4px] text-sm font-medium transition-colors`。                             |
| Toggle default | `bg-transparent`。                                                                  |
| Toggle outline | `border border-input bg-transparent hover:bg-accent hover:text-accent-foreground`。 |
| Toggle active  | `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground`。                |
| ToggleGroup    | `flex items-center justify-center gap-1 text-groupbtn-foreground`。                 |
| 禁用           | `disabled:pointer-events-none disabled:opacity-50`。                                |

## 使用规则

- 单个二元开关优先 Switch；ToggleGroup 用于一组选项模式。
- icon-only Toggle 必须补 accessible label。
