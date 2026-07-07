# Calendar / Calendar UTC

**源码**：`src/components/ui/calendar.tsx`、`calendar-utc.tsx`。

两个文件视觉结构基本一致；UTC 版本用于 UTC range picker。

| 节点          | 规范                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| Root          | `p-3`。                                                                    |
| caption label | `text-sm font-medium`。                                                    |
| nav button    | `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100`。                |
| table         | `w-full border-collapse space-y-1`。                                       |
| head cell     | `text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]`。         |
| day           | `h-9 w-9 p-0 font-normal rounded-md`。                                     |
| selected      | `bg-primary text-primary-foreground hover:bg-primary`。                    |
| today         | `text-primary`。                                                           |
| range middle  | `aria-selected:bg-calendar-rangeBg aria-selected:text-accent-foreground`。 |

## 使用规则

- 日期区间入口优先 [`date-range-picker.md`](./date-range-picker.md)，不要直接拼 Calendar + Popover。
- UTC 场景使用 `calendar-utc.tsx` 对应封装，避免本地时区误差。
