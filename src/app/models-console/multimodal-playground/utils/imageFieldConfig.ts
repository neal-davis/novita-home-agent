export type ImageInputMode = "image" | "httpUrl" | "base64";

export const IMAGE_FIELD_INPUT_MODE_BY_NAME: Record<string, ImageInputMode> = {
  image: "image",
  input_image: "image",
  images: "image",
  image_urls: "httpUrl",
  image_base64s: "base64",
};

export function getImageInputMode(fieldName: string): ImageInputMode | null {
  const baseFieldName = fieldName.split(".").pop() || fieldName;
  return IMAGE_FIELD_INPUT_MODE_BY_NAME[baseFieldName] || null;
}
