# Switch

**源码**：`switch.tsx`。

| 部分     | 圆角 · 边框 · 背景 · 阴影                                                                                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **轨道** | `rounded-full`；未选中 `data-[state=unchecked]:bg-fill-2`；选中 `data-[state=checked]:bg-primary`；`border-transparent` + 尺寸对应 `border-2`。 |
| **滑块** | `rounded-full bg-background shadow-lg`。                                                                                                        |
| **禁用** | `disabled:opacity-50`（整体）。                                                                                                                 |
