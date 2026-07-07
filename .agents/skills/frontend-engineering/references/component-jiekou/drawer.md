# JieKou Drawer

**源码**：`src/components/ui/drawer.tsx`。

- Overlay / Content 层级为 `z-1000`。
- 适合底部或侧向抽屉式任务流；与 Dialog 同屏时注意 Dialog 为 `z-[1001]`。
- 不要把 Select Content 层级降到 Drawer 下方，Select 当前为 `10002`。
