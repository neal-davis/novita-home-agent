# MultiSelect

**源码**：`multi-select.tsx`。

| 部分                        | 规范                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PopoverTrigger / Button** | `rounded-md border`（默认 shadcn `border`）、`min-h-10`、`bg-inherit hover:bg-inherit`（避免 Button 默认 hover，由内部 Badge 承担）。                                        |
| **已选 Badge**              | default：`border-foreground/10 text-foreground bg-card hover:bg-card/80`；secondary / destructive 见源码；「+更多」：`bg-transparent border-foreground/1`（注意 **`/1`**）。 |
| **列表内伪 checkbox**       | `rounded-sm border border-primary`；未选时 `style={{ borderColor: "var(--dark-2)" }}`（与 [Checkbox](./checkbox.md) 的 `border-border-2` 路径不同）。                        |
| **PopoverContent**          | `w-auto p-0` + Command。                                                                                                                                                     |
| **分隔**                    | 选中区右侧 **Separator** 竖线。                                                                                                                                              |
