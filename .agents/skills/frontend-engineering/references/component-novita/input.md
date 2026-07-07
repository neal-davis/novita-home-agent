# Input

**源码**：`src/components/ui/input.tsx`。

| 维度          | 规范                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| Input 主体    | `h-10 w-full rounded-md border bg-background px-3 py-2 text-sm`。                        |
| Hover / Focus | `hover:border-input-hover`、`focus:border-input-hover`、`focus-visible:outline-none`。   |
| 禁用          | `disabled:cursor-not-allowed disabled:opacity-50`。                                      |
| 文件输入      | `file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground`。 |
| placeholder   | `placeholder:text-muted-foreground`。                                                    |

## allowClear

- 清除按钮为绝对定位：`right-2 top-1/2 h-5 w-5 rounded-full bg-gray-100 hover:bg-gray-200`。
- 图标 `X` 使用 `style={{ color: "var(--dark-2)" }}`。
- 清空时模拟 change event；不要在业务层再叠一套清空状态。

## SearchInput

- 在 Input 上追加 `pl-8` 与 `hover:border-input-hover`。
- 搜索 icon 使用 `iconfont icon-search absolute left-2.5 ... text-muted-foreground`。
- 支持 debounce；筛选栏重置如需清空内部状态，优先通过 key remount。
