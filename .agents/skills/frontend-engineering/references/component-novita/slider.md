# Slider

**源码**：`src/components/ui/slider.tsx`；业务 wrapper：`standard/value-slider.tsx`。

| 部分             | 规范                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| Root             | `relative flex w-full touch-none select-none items-center`。                  |
| Track            | `h-2 w-full overflow-hidden rounded-full bg-secondary slider-track`。         |
| Range            | `absolute h-full bg-primary slider-range`。                                   |
| Thumb            | `h-5 w-5 rounded-full border-2 border-primary bg-background`。                |
| Focus / disabled | `focus-visible:ring-2 ... disabled:pointer-events-none disabled:opacity-50`。 |

## 使用规则

- 业务数值滑块优先 `import { ValueSlider } from "@/components/ui/standard/value-slider"`。
- 需要直接输入数值时配合 `NumberInput`，不要只提供拖拽。
