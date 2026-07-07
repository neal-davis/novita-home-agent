# Switch

**源码**：`src/components/ui/switch.tsx`。

| 部分   | 规范                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| 轨道   | `inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors`。 |
| 选中   | `data-[state=checked]:bg-primary`。                                                                             |
| 未选中 | `data-[state=unchecked]:bg-input`。                                                                             |
| 焦点   | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`。                                    |
| 禁用   | `disabled:cursor-not-allowed disabled:opacity-50`。                                                             |
| 滑块   | `rounded-full bg-background shadow-lg ring-0 transition-transform`。                                            |

## 使用规则

- 用 Switch 表达二元设置；不要用 Button group 模拟开关。
- 文案说明放在相邻 Label/Description，避免只靠 on/off 色表达含义。
