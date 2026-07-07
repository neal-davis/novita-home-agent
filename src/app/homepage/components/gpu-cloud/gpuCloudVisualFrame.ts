/**
 * 首页 Product「GPU Cloud」三图：与 Figma 画板 651×480 同比例（如 Serverless 卡 `1:9330`）。
 * 桌面列宽由 `ProductGpuCloudSection` 的 Row（Figma `1:9320`）按 651fr : 346fr 分配；本容器 `w-full`
 * 填满图列后高度 = width ÷ (651/480)。
 */
const GPU_CLOUD_FIGMA_ASPECT_CLASS = "aspect-[651/480]";

export const gpuCloudVisualFrameClassName = [
  "relative mx-auto w-full max-w-full",
  GPU_CLOUD_FIGMA_ASPECT_CLASS,
  "overflow-hidden",
  "bg-[var(--fill-3)]",
].join(" ");
