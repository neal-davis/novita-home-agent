import {
  extractImages,
  extractAudios,
  getResultType,
} from "@/app/models-console/multimodal-playground/utils/result";

describe("multimodal result helpers (more branches)", () => {
  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: jest.fn((blob) => `blob:${(blob as Blob).type || "raw"}`),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).__pendingAudioConversion;
  });

  it("falls back to image type for image_gen when no media arrays are present", () => {
    expect(getResultType({ task: {} } as any, "image_gen")).toBe("image");
  });

  it("falls back to video type for video_gen when no media arrays are present", () => {
    expect(getResultType({ task: {} } as any, "video_gen")).toBe("video");
  });

  it("returns null for an unknown category with no media arrays", () => {
    expect(getResultType({ task: {} } as any, "text_gen" as any)).toBeNull();
  });

  it("creates a plain object URL for a non-pcm audio blob", () => {
    const mp3Blob = new Blob(["sound"], { type: "audio/mpeg" });
    expect(extractAudios(mp3Blob, "audio_gen")).toEqual(["blob:audio/mpeg"]);
    // non-pcm blob does NOT register a pending conversion
    expect((window as any).__pendingAudioConversion).toBeUndefined();
  });

  it("extracts images from a single-string fallback field (non-array extra prop)", () => {
    expect(
      extractImages(
        { image_urls: "https://cdn.example.test/one.png" },
        "image_gen",
      ),
    ).toEqual(["https://cdn.example.test/one.png"]);
  });

  it("returns empty when the sync data array yields no usable urls", () => {
    // data array present but items have neither url nor b64_json -> falls
    // through, items not array -> empty
    expect(extractImages({ data: [{ nope: true }] }, "image_gen")).toEqual([]);
  });
});
