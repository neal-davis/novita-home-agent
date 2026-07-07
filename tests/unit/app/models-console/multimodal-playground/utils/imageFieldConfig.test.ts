import {
  getImageInputMode,
  IMAGE_FIELD_INPUT_MODE_BY_NAME,
} from "@/app/models-console/multimodal-playground/utils/imageFieldConfig";

describe("getImageInputMode", () => {
  it("maps known image field names to their input modes", () => {
    expect(getImageInputMode("image")).toBe("image");
    expect(getImageInputMode("input_image")).toBe("image");
    expect(getImageInputMode("images")).toBe("image");
    expect(getImageInputMode("image_urls")).toBe("httpUrl");
    expect(getImageInputMode("image_base64s")).toBe("base64");
  });

  it("uses only the last dotted segment of the field name", () => {
    expect(getImageInputMode("payload.input.image_urls")).toBe("httpUrl");
  });

  it("returns null for unknown field names", () => {
    expect(getImageInputMode("prompt")).toBeNull();
    expect(getImageInputMode("foo.bar")).toBeNull();
  });

  it("exposes the mapping table", () => {
    expect(IMAGE_FIELD_INPUT_MODE_BY_NAME.image_urls).toBe("httpUrl");
  });
});
