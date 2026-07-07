import {
  convertFlatToNested,
  extractAudios,
  extractImages,
  extractTexts,
  extractVideos,
  getResultType,
  truncateLongStrings,
} from "@/app/models-console/multimodal-playground/utils/result";
import { TaskStatus } from "@/types/multimodal-playground";

describe("multimodal result helpers", () => {
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

  it("detects explicit result type before falling back to category", () => {
    expect(getResultType(null, "image_gen")).toBeNull();
    expect(
      getResultType(
        {
          task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
          images: [{ image_url: "https://cdn.example.test/image.png" }],
        },
        "video_gen",
      ),
    ).toBe("image");
    expect(
      getResultType(
        {
          task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
          videos: [{ video_url: "https://cdn.example.test/video.mp4" }],
        },
        "image_gen",
      ),
    ).toBe("video");
    expect(
      getResultType(
        {
          task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
          audios: [{ audio_url: "https://cdn.example.test/audio.mp3" }],
        },
        "image_gen",
      ),
    ).toBe("audio");
    expect(
      getResultType(
        { task: { status: TaskStatus.SUCCEED, progress_percent: 100 } },
        "audio_gen",
      ),
    ).toBe("audio");
  });

  it("extracts images from task results, sync data arrays and fallback fields", () => {
    expect(
      extractImages(
        {
          images: [
            { image_url: "https://cdn.example.test/a.png" },
            "https://cdn.example.test/b.png",
            { image_url: "" },
          ],
        },
        "image_gen",
      ),
    ).toEqual([
      "https://cdn.example.test/a.png",
      "https://cdn.example.test/b.png",
    ]);

    expect(
      extractImages(
        {
          data: [
            { url: "https://cdn.example.test/sync.png" },
            { b64_json: "base64" },
          ],
        },
        "image_gen",
      ),
    ).toEqual(["https://cdn.example.test/sync.png", "base64"]);

    expect(
      extractImages(
        { image_urls: ["https://cdn.example.test/fallback.png"] },
        "image_gen",
      ),
    ).toEqual(["https://cdn.example.test/fallback.png"]);
  });

  it("extracts videos, audios and text payloads", () => {
    expect(
      extractVideos(
        {
          videos: [
            { video_url: "https://cdn.example.test/a.mp4" },
            "https://cdn.example.test/b.mp4",
          ],
        },
        "video_gen",
      ),
    ).toEqual([
      "https://cdn.example.test/a.mp4",
      "https://cdn.example.test/b.mp4",
    ]);

    expect(
      extractAudios(
        { audios: [{ audio_url: "https://cdn.example.test/a.mp3" }] },
        "audio_gen",
      ),
    ).toEqual(["https://cdn.example.test/a.mp3"]);
    expect(extractAudios("data:audio/mp3;base64,abc", "audio_gen")).toEqual([
      "data:audio/mp3;base64,abc",
    ]);

    const pcmBlob = new Blob(["pcm"], { type: "application/octet-stream" });
    expect(extractAudios(pcmBlob, "audio_gen")).toEqual([
      "blob:application/octet-stream",
    ]);
    expect((window as any).__pendingAudioConversion).toEqual({
      "blob:application/octet-stream": pcmBlob,
    });

    expect(extractTexts({ text: "transcript" }, "audio_gen")).toEqual([
      "transcript",
    ]);
    expect(extractTexts({ text: "ignored" }, "image_gen")).toEqual([]);
  });

  it("converts flat form data to nested payload and removes empty fields", () => {
    expect(
      convertFlatToNested({
        "input.prompt": "hello",
        "input.options.seed": 0,
        "input.empty": "",
        "input.emptyArray": [],
        simple: "value",
      }),
    ).toEqual({
      input: {
        prompt: "hello",
        options: {
          seed: 0,
        },
      },
      simple: "value",
    });
  });

  it("recursively truncates long strings while preserving non-string values", () => {
    const long = "x".repeat(501);

    expect(truncateLongStrings(null)).toBeNull();
    expect(truncateLongStrings(undefined)).toBeUndefined();
    expect(truncateLongStrings(1)).toBe(1);
    expect(truncateLongStrings("short")).toBe("short");
    expect(truncateLongStrings(long)).toBe(
      `${"x".repeat(500)}... (truncated, total length: 501 chars)`,
    );
    expect(
      truncateLongStrings({
        nested: [{ value: long }],
      }),
    ).toEqual({
      nested: [
        {
          value: `${"x".repeat(500)}... (truncated, total length: 501 chars)`,
        },
      ],
    });
  });
});
