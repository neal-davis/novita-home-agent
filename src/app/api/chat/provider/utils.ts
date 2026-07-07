export function isBase64OnlyImageModel(modelId: string): boolean {
  return modelId.includes("claude");
}
