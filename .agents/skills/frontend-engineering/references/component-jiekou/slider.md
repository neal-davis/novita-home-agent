# JieKou Slider

**源码**：`src/components/ui/slider.tsx`、`src/components/ui/standard/value-slider.tsx`。

- 基础 Slider 使用 Radix Slider。
- 业务数值滑块优先使用 `ValueSlider`，不要在页面里重新拼 track、thumb、输入框联动。
- 禁用态要同步禁用拖拽、输入与提交按钮。
