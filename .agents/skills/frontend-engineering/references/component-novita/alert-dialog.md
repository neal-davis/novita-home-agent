# AlertDialog

**源码**：`src/components/ui/alert-dialog.tsx`；业务确认封装：`standard/confirm-dialog.tsx`、`standard/warning-dialog.tsx`。

| 维度                | 规范                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| Overlay             | `fixed inset-0 z-[10003] bg-black/40`。                                      |
| Content             | `z-[10004] grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg`。  |
| 圆角                | `sm:rounded-lg`。                                                            |
| Title / Description | Title `text-lg font-semibold`；Description `text-sm text-muted-foreground`。 |
| Action / Cancel     | 复用 `buttonVariants()` 与 `buttonVariants({ variant: "outline" })`。        |

## standard confirm/warning

- `ConfirmDialog` / `WarningDialog` 使用 `AlertDialogContent className="max-w-[520px] rounded-[var(--radius-dialog)] border-[var(--border)] bg-[var(--white)]"`。
- 主按钮高 `h-8`，确认态使用 `bg-[var(--brand-0)] text-[var(--black)]`；危险态使用 `bg-[var(--red-1)] text-white`。
