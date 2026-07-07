# Dialog

**源码**：`src/components/ui/dialog.tsx`。

| 维度            | 规范                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| Overlay         | `fixed inset-0 z-[1001] bg-black/50`，支持 `overlayClassName` / `overlayStyle`。                          |
| Content         | `fixed left-[50%] top-[50%] z-[1001] grid w-full max-w-lg ... gap-4 border bg-background p-6 shadow-lg`。 |
| 圆角            | `sm:rounded-lg`。                                                                                         |
| Close           | `right-6 top-6 p-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-[var(--gray-1)]`。                    |
| Title           | `text-lg font-h6 leading-none tracking-tight`。                                                           |
| Header / Footer | Header `space-y-1.5 pb-4`；Footer `sm:justify-end`。                                                      |

## Modal 业务约定

- Dialog 内 Select/DateRange/Popover 要确认层级高于 Dialog；Select 已内联 10002。
- `DialogContentInner` 用于内部滚动区域：`overflow-y-auto scrollBar_container_new pr-2`，默认 `maxHeight: calc(90vh - 12rem)`。
- 不要用 AlertDialog 替代普通信息展示；危险确认使用 AlertDialog 或 standard confirm/warning。
