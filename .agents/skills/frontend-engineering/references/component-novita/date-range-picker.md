# DateRangePicker

**源码**：

- `src/components/ui/standard/date-range-picker.tsx`
- `src/components/ui/standard/date-range-picker-utc.tsx`
- `src/components/ui/standard/date-range-picker-utc-common.tsx`
- `src/components/ui/standard/dayjs-range-picker.tsx`
- 对应 `.module.scss`

| 场景       | 入口                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| 普通区间   | `import DateRangePicker from "@/components/ui/standard/date-range-picker"`            |
| UTC 区间   | `import DateRangePicker from "@/components/ui/standard/date-range-picker-utc"`        |
| UTC common | `import DateRangePicker from "@/components/ui/standard/date-range-picker-utc-common"` |
| Dayjs      | `import { DayjsRangePicker } from "@/components/ui/standard/dayjs-range-picker"`      |

## 视觉与层级

- Trigger 使用 `Button`，基础类包含 `w-[300px] justify-start text-left font-normal`。
- UTC 版本显示 `UTC+0` 标签：`font-subtle-demibold text-[var(--dark-4)]`。
- 分隔线使用 `bg-[var(--gray-1)]`。
- PopoverContent 使用 `className="w-auto p-0 z-1000"`，依赖 Tailwind 扩展 zIndex 1000。
- Footer 样式在 module 中，维护时要同时查看 `.module.scss`。

## 使用规则

- 日期筛选栏不要手写两个 input + calendar icon。
- UTC 账单/日志/用量类数据优先 UTC 版本。
- 在 Dialog / Drawer 中使用时确认 `z-1000` 是否满足遮挡关系。
