import { fireEvent, render, waitFor } from "@testing-library/react";
import { RenderAudioParts } from "@/app/models-console/llm-playground/components/chat-messages/parts-render/media-parts";

const addBase64Chunk = jest.fn();
const generateWAVFile = jest.fn(() =>
  Promise.resolve({ blob: new Blob(), url: "blob:audio" }),
);
let stopImpl = jest.fn(() => Promise.resolve());
jest.mock(
  "@/app/models-console/llm-playground/components/chat-messages/parts-render/AudioStreamPlayer",
  () => ({
    __esModule: true,
    default: class {
      addBase64Chunk = addBase64Chunk;
      generateWAVFile = generateWAVFile;
      stop = (...args: any[]) => stopImpl(...args);
    },
  }),
);

describe("RenderAudioParts (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopImpl = jest.fn(() => Promise.resolve());
  });

  it("does not re-enqueue a chunk that was already added on re-render", () => {
    const { rerender } = render(
      <RenderAudioParts parts={[{ url: "chunk-1" }] as any} keyPrefix="k" />,
    );
    expect(addBase64Chunk).toHaveBeenCalledTimes(1);
    // Re-render with the same chunk: the enqueMap guard should skip it
    rerender(
      <RenderAudioParts parts={[{ url: "chunk-1" }] as any} keyPrefix="k" />,
    );
    expect(addBase64Chunk).toHaveBeenCalledTimes(1);
  });

  it("generates a WAV file and sets the audio src once [end] arrives", async () => {
    const { container } = render(
      <RenderAudioParts
        parts={[{ url: "chunk-1" }, { url: "[end]" }] as any}
        keyPrefix="k"
      />,
    );
    await waitFor(() => expect(generateWAVFile).toHaveBeenCalled());
    await waitFor(() =>
      expect(container.querySelector("audio")).toHaveAttribute(
        "src",
        "blob:audio",
      ),
    );
    // no spinner once ended
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("stops the player on the audio play event", async () => {
    const { container } = render(
      <RenderAudioParts parts={[{ url: "chunk-1" }] as any} keyPrefix="k" />,
    );
    const audio = container.querySelector("audio")!;
    fireEvent.play(audio);
    await waitFor(() => expect(stopImpl).toHaveBeenCalled());
  });

  it("logs an error when stopping the player fails on play", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    stopImpl = jest.fn(() => Promise.reject(new Error("audio ctx closed")));
    const { container } = render(
      <RenderAudioParts parts={[{ url: "chunk-1" }] as any} keyPrefix="k" />,
    );
    fireEvent.play(container.querySelector("audio")!);
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error resuming audio:",
        expect.any(Error),
      ),
    );
    consoleError.mockRestore();
  });
});
