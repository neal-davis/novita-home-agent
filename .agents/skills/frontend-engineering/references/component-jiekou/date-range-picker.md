# JieKou DateRangePicker

**源码**：`src/components/ui/standard/date-range-picker.tsx`、`date-range-picker-utc.tsx`、`date-range-picker-utc-common.tsx`、`dayjs-range-picker.tsx`。

- 默认业务入口：`@/components/ui/standard/date-range-picker`。
- UTC 场景使用 `date-range-picker-utc` 或 `date-range-picker-utc-common`，不要用本地时区组件替代。
- Dayjs 场景使用 `import { DayjsRangePicker } from "@/components/ui/standard/dayjs-range-picker"`。
- PopoverContent 常见 `w-auto p-0 z-1000`，与 Select `10002`、Dialog `1001` 分清。
