# JieKou Popover

**源码**：`src/components/ui/popover.tsx`。

- 常规 Popover 使用 `z-50`，表面为 `rounded-md border bg-popover text-popover-foreground shadow-md`。
- 不要用 Popover 承载确认型危险操作，改用 Dialog / AlertDialog。
- 若与 Select、Dialog 同屏叠放，先查 [`z-index.md`](./z-index.md)，不要随意提升到 `9999`。
