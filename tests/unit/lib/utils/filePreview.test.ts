import { previewUploadedFile } from "@/lib/utils/filePreview";

describe("previewUploadedFile", () => {
  let openSpy: jest.SpyInstance;
  let fakeDoc: Document;
  let fakeWindow: { document: Document; focus: jest.Mock };

  beforeEach(() => {
    const doc = document.implementation.createHTMLDocument("");
    fakeDoc = doc;
    fakeWindow = { document: doc, focus: jest.fn() };
    openSpy = jest.spyOn(window, "open");
  });

  afterEach(() => {
    openSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("renders an <img> for image types", () => {
    openSpy.mockReturnValue(fakeWindow as unknown as Window);
    previewUploadedFile("blob:img", "pic.png", "image/png");

    const img = fakeDoc.body.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("blob:img");
    expect(img?.getAttribute("alt")).toBe("pic.png");
    expect(fakeDoc.querySelector("title")?.textContent).toBe(
      "Preview: pic.png",
    );
    expect(fakeWindow.focus).toHaveBeenCalled();
  });

  it("renders a <video> for video types", () => {
    openSpy.mockReturnValue(fakeWindow as unknown as Window);
    previewUploadedFile("blob:vid", "clip.mp4", "video/mp4");
    const video = fakeDoc.body.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.controls).toBe(true);
  });

  it("renders an <audio> for audio types", () => {
    openSpy.mockReturnValue(fakeWindow as unknown as Window);
    previewUploadedFile("blob:aud", "sound.mp3", "audio/mpeg");
    expect(fakeDoc.body.querySelector("audio")).not.toBeNull();
  });

  it("returns early when the popup is blocked", () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    openSpy.mockReturnValue(null);
    expect(() =>
      previewUploadedFile("blob:x", "x.png", "image/png"),
    ).not.toThrow();
    expect(errSpy).toHaveBeenCalledWith(
      "Failed to open preview window - popup blocked",
    );
  });

  it("falls back to a direct open when rendering throws", () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    // First call returns a window whose document access throws, second is the fallback
    const throwingWindow = {
      get document() {
        throw new Error("boom");
      },
    };
    openSpy
      .mockReturnValueOnce(throwingWindow as unknown as Window)
      .mockReturnValueOnce(fakeWindow as unknown as Window);

    previewUploadedFile("blob:fallback", "f.png", "image/png");
    expect(errSpy).toHaveBeenCalledWith(
      "Error previewing file:",
      expect.any(Error),
    );
    expect(openSpy).toHaveBeenLastCalledWith("blob:fallback", "_blank");
  });
});
