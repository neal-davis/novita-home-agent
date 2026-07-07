# JieKou Calendar / Calendar UTC

**源码**：`src/components/ui/calendar.tsx`、`src/components/ui/calendar-utc.tsx`。

- 基于 `react-day-picker`。
- `calendar.tsx` 选中日期使用 `!text-[var(--white)]`，区间中间态使用 `aria-selected:!text-accent-foreground`。
- `calendar-utc.tsx` 保持 UTC 场景差异，不要用普通 Calendar 替换。
- 日期范围场景优先用 `standard/date-range-picker*`。
