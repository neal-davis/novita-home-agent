# JieKou ButtonGroup

**源码**：`src/components/ui/button-group.tsx`。

- 用于相邻按钮组合或分段动作，先复用现有 Button variant。
- 不要在 ButtonGroup 内重写按钮高度、圆角和禁用逻辑。
- 如果是互斥选项，优先评估 Tabs / ToggleGroup 是否更符合语义。
