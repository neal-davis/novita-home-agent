# Dialog

**源码**：`dialog.tsx`。

| 维度         | 规范                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **内容区**   | `border bg-background p-6 shadow-lg`；**`sm:rounded-lg`**。                                                                                 |
| **遮罩**     | `bg-mask`；**`z-[1001]`**（Overlay 与 Content）。                                                                                           |
| **关闭按钮** | `rounded-sm opacity-70`、`hover:opacity-100`、`focus:ring-2 ring-ring`、`disabled:pointer-events-none`；**`data-[state=open]:bg-accent`**。 |

## Modal 业务约定

- 普通业务 Modal 默认宽度 480px，内容最大高度 `80vh`。
- Overlay 使用项目遮罩 token；若按源业务规范需要 `bg-black/40`，必须确认是否与当前 `bg-mask` 等价或是业务特例。
- Modal 内 Popover/DatePicker/Select 需要确认层级高于 Dialog，避免被遮罩或内容裁剪。
