# Drawer

**源码**：`src/components/ui/drawer.tsx`。

| 节点        | 规范                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Overlay     | `fixed inset-0 z-[1001] bg-black/80`。                                                                 |
| Content     | `fixed inset-x-0 bottom-0 z-[1001] mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background`。 |
| Handle      | `mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted`。                                                   |
| Header      | `grid gap-1.5 p-4 text-center sm:text-left`。                                                          |
| Footer      | `mt-auto flex flex-col gap-2 p-4`。                                                                    |
| Title       | `text-lg font-semibold leading-none tracking-tight`。                                                  |
| Description | `text-sm text-muted-foreground`。                                                                      |

## 使用规则

- Drawer 与 Dialog 同为 `z-[1001]`；与 AlertDialog/Select 的层级关系见 [`z-index.md`](./z-index.md)。
- 移动端底部抽屉优先 Drawer，不要用固定 div 手写。
