# Radio Group

**源码**：`src/components/ui/radio-group.tsx`。

| 节点             | 规范                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| `RadioGroup`     | `grid gap-2`。                                                                     |
| `RadioGroupItem` | `aspect-square h-4 w-4 rounded-full border-solid border-[1px]`。                   |
| Console page     | `border-[var(--gray-1)] data-[state=checked]:border-[var(--brand-1)] text-black`。 |
| Web page         | 使用 `text-primary`，边框不额外强设。                                              |
| Indicator        | `Circle h-2.5 w-2.5 fill-current`；Console 使用 `text-[var(--brand-1)]`。          |

## 使用规则

- `page` prop 影响 web/console 视觉，不要忽略当前场景。
- 表单错误态在外层 label/helper 上呈现，不要只依赖颜色变化。
