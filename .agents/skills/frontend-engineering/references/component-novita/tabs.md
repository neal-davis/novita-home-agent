# Tabs

**源码**：`src/components/ui/tabs.tsx`、`tabs.module.scss`；业务 wrapper：`standard/tabs-items.tsx`。

| 节点              | 规范                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| `TabsList`        | base `items-center h-10 p-1 text-muted-foreground`。                                                    |
| `tabsStyle=block` | `inline-flex rounded-md bg-muted`。                                                                     |
| `TabsTrigger`     | `rounded-sm px-3 py-1.5 text-sm font-medium`。                                                          |
| active            | `data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm`。 |
| disabled          | `disabled:pointer-events-none disabled:opacity-50`。                                                    |

## standard/TabsItems

- 用于业务 tab 列表：`h-auto flex-wrap p-0 text-[var(--dark-2)]`。
- Trigger 风格为底边线：`rounded-none border-b-2 border-transparent bg-transparent px-0 py-2`，active 时 `text-[var(--black)]`。
