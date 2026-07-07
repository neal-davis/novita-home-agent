import { render } from "@testing-library/react";
import {
  RenderAudioParts,
  RenderFilePart,
} from "@/app/models-console/llm-playground/components/chat-messages/parts-render/media-parts";

const addBase64Chunk = jest.fn();
const generateWAVFile = jest.fn(() =>
  Promise.resolve({ blob: new Blob(), url: "blob:audio" }),
);
const stop = jest.fn(() => Promise.resolve());
jest.mock(
  "@/app/models-console/llm-playground/components/chat-messages/parts-render/AudioStreamPlayer",
  () => ({
    __esModule: true,
    default: class {
      addBase64Chunk = addBase64Chunk;
      generateWAVFile = generateWAVFile;
      stop = stop;
    },
  }),
);

describe("RenderFilePart", () => {
  it("renders an img for image media types", () => {
    const { container } = render(
      <RenderFilePart
        part={{ mediaType: "image/png", url: "u", filename: "f.png" } as any}
        keyPrefix="k"
      />,
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "u");
    expect(img).toHaveAttribute("alt", "f.png");
  });

  it("renders a video for video media types", () => {
    const { container } = render(
      <RenderFilePart
        part={{ mediaType: "video/mp4", url: "v" } as any}
        keyPrefix="k"
      />,
    );
    expect(container.querySelector("video")).toHaveAttribute("src", "v");
  });

  it("renders an audio element for audio media types", () => {
    const { container } = render(
      <RenderFilePart
        part={{ mediaType: "audio/wav", url: "a" } as any}
        keyPrefix="k"
      />,
    );
    expect(container.querySelector("audio")).toHaveAttribute("src", "a");
  });

  it("returns null for unsupported media types", () => {
    const { container } = render(
      <RenderFilePart
        part={{ mediaType: "application/pdf", url: "x" } as any}
        keyPrefix="k"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("returns null when no mediaType is present", () => {
    const { container } = render(
      <RenderFilePart part={{ url: "x" } as any} keyPrefix="k" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("RenderAudioParts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a loading spinner while streaming (no [end] marker)", () => {
    const { container } = render(
      <RenderAudioParts
        parts={[{ url: "base64chunk" }] as any}
        keyPrefix="k"
      />,
    );
    // spinner present, audio element rendered
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(container.querySelector("audio")).toBeInTheDocument();
  });

  it("enqueues base64 chunks but skips [start]/[end] markers", () => {
    render(
      <RenderAudioParts
        parts={
          [{ url: "[start]" }, { url: "chunk-1" }, { url: "[end]" }] as any
        }
        keyPrefix="k"
      />,
    );
    expect(addBase64Chunk).toHaveBeenCalledTimes(1);
    expect(addBase64Chunk).toHaveBeenCalledWith("chunk-1");
  });
});
