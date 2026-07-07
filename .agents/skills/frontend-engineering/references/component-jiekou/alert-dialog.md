# JieKou AlertDialog

**源码**：`src/components/ui/alert-dialog.tsx`。

- Overlay：`fixed inset-0 z-999 bg-black/40`。
- Content：居中定位，`z-1000 grid w-full max-w-lg border bg-background p-6 shadow-lg sm:rounded-lg`。
- 标题、描述、footer 沿用 Radix AlertDialog 结构；危险操作优先使用这个组件或 `standard/confirm-dialog`。
- 与 Dialog 的差异：AlertDialog 层级为 999/1000，Dialog 为 1001；不要混用层级。
