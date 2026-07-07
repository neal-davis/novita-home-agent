# JieKou Dialog

**源码**：`src/components/ui/dialog.tsx`。

- Overlay：`fixed inset-0 z-[1001] bg-black/50`，必须高于 header。
- Content：`z-[1001] grid w-full max-w-lg border bg-background p-6 shadow-lg sm:rounded-lg`。
- Content 默认阻止 `onOpenAutoFocus`，维护时不要随意删除。
- Close：右上 `X`，`right-6 top-6`，hover/focus 使用 `var(--gray-1)`。
- Title：`text-lg font-large leading-none tracking-tight`。
- 长内容优先使用 `DialogContentInner defaultHeight`，内置 `max-h-[60vh] overflow-y-auto`。
