# Button

**源码**：`src/components/ui/button.tsx`、`button.module.scss`；业务 wrapper：`src/app/components/button/Button.tsx`。

| 维度                                  | 规范                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 基础形态                              | `select-none inline-flex ... rounded-full text-sm font-medium`。                                              |
| 禁用                                  | 原生 `disabled` 与 `data-disabled=true` 都使用 `cursor-not-allowed opacity-50`。                              |
| `default`                             | `bg-[var(--dark-1)] text-white shadow-none hover:bg-[var(--element-low-em)] hover:text-white`。               |
| `secondary`                           | `border border-[var(--border-strong)] bg-white text-[var(--dark-1)] shadow-none`；hover 反转为 dark surface。 |
| `outline`                             | `border-[1px] border-border-dark-1 bg-background text-accent-foreground hover:bg-accent-hover`。              |
| `ghost`                               | `border border-input hover:bg-accent-hover hover:text-accent-foreground`。                                    |
| `link` / `text`                       | `link` 使用 `text-text-1`；`text` 叠 `button.module.scss` 的文本样式和 `font-subtle`。                        |
| `warn` / `green` / `disabled` variant | 使用 `bg-warn`、`bg-green`、`bg-primary-disabled` 等项目语义色。                                              |

## Size 与场景

| size      | Web                                   | Console compound override |
| --------- | ------------------------------------- | ------------------------- |
| `default` | `h-9 px-4 py-[6px] font-paragraph-14` | `h-8 px-3 py-[6px]`       |
| `sm`      | `h-6 px-2 font-small-console`         | `h-6 px-2 py-1`           |
| `sl`      | `h-8 px-4 font-subtle`                | `h-7 px-[10px] py-1`      |
| `lg`      | `h-10 px-6 font-body`                 | `h-9 px-4 py-3`           |
| `icon`    | `w-8 h-8`                             | 同默认 variant            |

## 业务使用

- 业务代码优先 `import Button from "@/app/components/button/Button"`；维护基础 variant 才用 `import { Button } from "@/components/ui/button"`。
- `src/app/components/button/Button.tsx` 会把 `type` 映射到基础 variant，并内置 loading 防重复点击。
- 禁止直接 `import { Button } from "antd"`。
- icon-only button 必须补 `aria-label`。
