# Checkbox

**源码**：`checkbox.tsx`。

| 维度       | 规范                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| **圆角**   | `rounded-sm`。                                                                                   |
| **未选中** | 边框 `border-[1px] border-border-2`；背景透明（无 `bg-*`）。                                     |
| **选中**   | 边框由主题继承；`data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground`。 |
| **焦点**   | `focus-visible:ring-2 ring-ring ring-offset-2`。                                                 |
| **禁用**   | `disabled:opacity-50`。                                                                          |
