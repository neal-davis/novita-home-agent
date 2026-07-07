import {
  downloadImage,
  getImageSize,
  getImgBase64FromPath,
  getImgFileBase64,
  getVideoFirstFrame,
  isImgBase64,
  resizeImage,
} from "@/lib/utils/media";

class MockFileReader {
  result = "";
  onload: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;

  readAsDataURL(file: File) {
    this.result = `data:${file.type};base64,${file.name}`;
    setTimeout(() => {
      this.onload?.();
    }, 0);
  }
}

class MockImage {
  width = 320;
  height = 180;
  onload: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  private currentSrc = "";

  set src(value: string) {
    this.currentSrc = value;
    setTimeout(() => {
      this.onload?.();
    }, 0);
  }

  get src() {
    return this.currentSrc;
  }
}

describe("media utils", () => {
  let clickSpy: jest.Mock;
  let drawImageSpy: jest.Mock;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    jest.clearAllMocks();
    clickSpy = jest.fn();
    drawImageSpy = jest.fn();
    originalCreateElement = document.createElement.bind(document);
    Object.defineProperty(global, "FileReader", {
      configurable: true,
      value: MockFileReader,
    });
    Object.defineProperty(window, "FileReader", {
      configurable: true,
      value: MockFileReader,
    });
    Object.defineProperty(global, "Image", {
      configurable: true,
      value: MockImage,
    });
    Object.defineProperty(window, "Image", {
      configurable: true,
      value: MockImage,
    });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: jest.fn(() => "blob:object-url"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: jest.fn(),
    });
    Object.defineProperty(HTMLAnchorElement.prototype, "click", {
      configurable: true,
      value: clickSpy,
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: jest.fn(() => ({
        drawImage: drawImageSpy,
      })),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
      configurable: true,
      value: jest.fn(() => "data:image/png;base64,resized"),
    });
    document.createElement = ((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "img") {
        Object.defineProperties(element, {
          height: {
            configurable: true,
            value: 180,
          },
          src: {
            configurable: true,
            set() {
              setTimeout(() => {
                (element as HTMLImageElement).onload?.(new Event("load"));
              }, 0);
            },
          },
          width: {
            configurable: true,
            value: 320,
          },
        });
      }
      return element;
    }) as typeof document.createElement;
    (global.fetch as jest.Mock).mockResolvedValue({
      blob: jest.fn().mockResolvedValue(new Blob(["image"])),
    });
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  it("downloads local images directly and remote images through object URLs", async () => {
    await downloadImage("/static/image.png", "jpg");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(global.fetch).not.toHaveBeenCalled();

    await downloadImage("https://cdn.test/image.png", "webp");

    expect(global.fetch).toHaveBeenCalledWith("https://cdn.test/image.png");
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:object-url");
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it("falls back to opening remote images when blob download fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    await downloadImage("https://cdn.test/fallback.png", "png");

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("reads image sizes and resizes images when dimensions differ", async () => {
    await expect(getImageSize("https://cdn.test/image.png")).resolves.toEqual({
      height: 180,
      width: 320,
    });

    expect(await resizeImage("same-size", { h: 180, w: 320 })).toBe(
      "same-size",
    );

    const sourceImage = document.createElement("img");
    expect(
      await resizeImage("resize-me", { h: 100, w: 100 }, sourceImage),
    ).toBe("data:image/png;base64,resized");
    expect(drawImageSpy).toHaveBeenCalledWith(sourceImage, 0, 0, 100, 100);
  });

  it("captures the first video frame and handles play failures", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const play = jest.fn().mockRejectedValue(new Error("autoplay blocked"));
    const pause = jest.fn();
    document.createElement = ((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "canvas") {
        Object.defineProperties(element, {
          getContext: {
            configurable: true,
            value: jest.fn(() => ({
              drawImage: drawImageSpy,
            })),
          },
        });
      }
      if (tagName === "video") {
        Object.defineProperties(element, {
          pause: {
            configurable: true,
            value: pause,
          },
          play: {
            configurable: true,
            value: play,
          },
          readyState: {
            configurable: true,
            value: 2,
          },
          videoHeight: {
            configurable: true,
            value: 720,
          },
          videoWidth: {
            configurable: true,
            value: 1280,
          },
        });
      }
      return element;
    }) as typeof document.createElement;

    getVideoFirstFrame("https://video.test/movie.mp4");
    const video = document.querySelector("video") as HTMLVideoElement;
    video.dispatchEvent(new Event("loadeddata"));
    await Promise.resolve();
    await Promise.resolve();

    expect(play).toHaveBeenCalledTimes(1);
    expect(pause).not.toHaveBeenCalled();
    expect(drawImageSpy).toHaveBeenCalledWith(video, 0, 0, 1280, 720);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "视频播放失败",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it("converts files and image paths to base64 strings", async () => {
    await expect(
      getImgFileBase64(new File(["abc"], "avatar.png", { type: "image/png" })),
    ).resolves.toBe("data:image/png;base64,avatar.png");

    await expect(getImgBase64FromPath("/image/path.png")).resolves.toBe(
      "data:image/png;base64,resized",
    );
  });

  it("recognizes image base64 strings", () => {
    expect(isImgBase64("data:image/png;base64,abc")).toBe(true);
    expect(isImgBase64("https://cdn.test/image.png")).toBe(false);
  });
});
