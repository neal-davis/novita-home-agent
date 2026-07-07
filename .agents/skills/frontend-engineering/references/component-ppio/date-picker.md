# DatePicker

**源码**：`date-picker.tsx`、`date-picker.module.scss`。

| 维度                                     | 规范                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| **触发器**                               | `Button variant="outline"` + `styles.date_button`。                                       |
| **Hover / Focus（SCSS）**                | `border-color: var(--brand-0)`；hover 时 `background-color: var(--white)`。               |
| **打开 / 已选**（`.date_button_active`） | `border-color: var(--brand-0)`。                                                          |
| **未选提示**（`.date_button_warning`）   | `border-color: var(--red-1)`，图标同色。                                                  |
| **PopoverContent**                       | `w-auto p-0`。                                                                            |
| **底部快捷**（`.date_footer`）           | `border-top: 1px solid var(--border-3)`；链接 `var(--brand-0)` / hover `var(--brand-2)`。 |

## 单日选择规则

- 禁止手写 date input；使用 `Calendar` + `Popover` 或项目已有 DatePicker。
- `Calendar mode="single"` 必须传 `locale={zhCN}`。
- lucide `Calendar` 图标 import 时重命名为 `CalendarIcon`，避免和组件名冲突。
- Modal 内的日期 Popover 要确认层级高于 Dialog 内容，必要时使用项目 z-index token 或既有 `z-[1002]` 兼容写法。
- 未选择状态使用 `text-[var(--text-3)]`，已选择状态使用 `text-[var(--text-1)]`。
