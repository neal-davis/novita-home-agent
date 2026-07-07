import { fireEvent, render, screen } from "@testing-library/react";
import { AudioPlayer } from "@/app/models-console/multimodal-playground/components/ResultPanel/AudioPlayer";

describe("AudioPlayer", () => {
  beforeEach(() => {
    delete (window as any).__pendingAudioConversion;
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("renders an audio element with the given src", () => {
    const { container } = render(<AudioPlayer src="http://a/clip.wav" />);
    expect(container.querySelector("audio")).toHaveAttribute(
      "src",
      "http://a/clip.wav",
    );
  });

  it("shows an error message when the audio fails to load", () => {
    const { container } = render(<AudioPlayer src="http://a/clip.wav" />);
    const audio = container.querySelector("audio")!;
    fireEvent.error(audio);
    expect(screen.getByText("Failed to load audio")).toBeInTheDocument();
  });

  it("calls onLoadedMetadata without setting an error", () => {
    const { container } = render(<AudioPlayer src="http://a/clip.wav" />);
    const audio = container.querySelector("audio")!;
    fireEvent.loadedMetadata(audio);
    expect(screen.queryByText("Failed to load audio")).not.toBeInTheDocument();
    expect(container.querySelector("audio")).toBeInTheDocument();
  });

  it("converts a pending PCM blob to WAV and updates the src", async () => {
    const { waitFor } = await import("@testing-library/react");
    const pcm = {
      size: 4,
      type: "audio/pcm",
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
    };
    // make instanceof Blob pass for our stub
    Object.setPrototypeOf(pcm, Blob.prototype);
    (window as any).__pendingAudioConversion = { "blob:orig": pcm };
    (URL as any).createObjectURL = jest.fn(() => "blob:converted");
    (URL as any).revokeObjectURL = jest.fn();

    const { container } = render(<AudioPlayer src="blob:orig" />);

    await waitFor(() =>
      expect((URL as any).createObjectURL).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(container.querySelector("audio")).toHaveAttribute(
        "src",
        "blob:converted",
      ),
    );
  });
});
