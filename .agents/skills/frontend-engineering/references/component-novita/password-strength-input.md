# PasswordStrengthInput

**源码**：`src/components/ui/password-strength-input.tsx`。

| 节点              | 规范                                                           |
| ----------------- | -------------------------------------------------------------- |
| wrapper           | `flex flex-col gap-1.5`。                                      |
| label             | `leading-[20px] text-sm font-normal text-common-dark-1`。      |
| required star     | 当前源码 `text-red-500 mr-1`。                                 |
| input             | 基于 Input，追加 `h-[42px] leading-none rounded-[4px] pr-10`。 |
| error             | `status === "error"` 时 `!border-red-500`。                    |
| visibility toggle | `absolute right-2 top-1/2 ... cursor-pointer z-10`。           |
| rules panel       | `mt-2 p-3 bg-gray-50 rounded-md border`。                      |

## 使用规则

- 密码规则展示必须配文字，不只靠绿/灰图标。
- 新增状态色优先 token；当前 legacy generic red/gray/green 只在维护原组件时保留。
