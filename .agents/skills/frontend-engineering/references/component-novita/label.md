# Label

**源码**：`src/components/ui/label.tsx`。

| 维度          | 规范                                                          |
| ------------- | ------------------------------------------------------------- |
| 基础          | `text-sm font-medium leading-none`。                          |
| peer disabled | `peer-disabled:cursor-not-allowed peer-disabled:opacity-70`。 |

## 使用规则

- Label 与 Input/Select/Radio/Checkbox 关联时保持 `htmlFor` / id。
- Required 星号和 helper/error 文案跟随业务表单模式，不要只靠 placeholder 表达字段含义。
