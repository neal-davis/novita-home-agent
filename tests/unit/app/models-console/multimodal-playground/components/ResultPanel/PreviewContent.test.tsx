import { render, screen } from "@testing-library/react";
import { PreviewContent } from "@/app/models-console/multimodal-playground/components/ResultPanel/PreviewContent";

jest.mock("@/components/ui/standard/preview-image", () => ({
  PreviewImage: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/AudioPlayer",
  () => ({
    AudioPlayer: ({ src }: any) => (
      <div data-testid="audio-player" data-src={src} />
    ),
  }),
);

const empty = { images: [], videos: [], audios: [], texts: [] };

describe("PreviewContent", () => {
  it("renders 'No result yet' when resultType is null", () => {
    render(<PreviewContent {...empty} resultType={null} />);
    expect(screen.getByText("No result yet")).toBeInTheDocument();
  });

  it("normalizes raw base64 image urls with a data prefix", () => {
    render(
      <PreviewContent
        {...empty}
        images={["abc123", "https://x/y.png", "data:image/png;base64,zz"]}
        resultType="image"
      />,
    );
    const imgs = screen.getAllByRole("img") as HTMLImageElement[];
    expect(imgs[0].src).toBe("data:image/png;base64,abc123");
    expect(imgs[1].src).toBe("https://x/y.png");
    expect(imgs[2].src).toBe("data:image/png;base64,zz");
  });

  it("renders video elements for video results", () => {
    const { container } = render(
      <PreviewContent
        {...empty}
        videos={["http://v/1.mp4"]}
        resultType="video"
      />,
    );
    expect(container.querySelector("video")).toHaveAttribute(
      "src",
      "http://v/1.mp4",
    );
  });

  it("renders an AudioPlayer for audio results with audio urls", () => {
    render(
      <PreviewContent
        {...empty}
        audios={["http://a/1.wav"]}
        resultType="audio"
      />,
    );
    expect(screen.getByTestId("audio-player")).toHaveAttribute(
      "data-src",
      "http://a/1.wav",
    );
  });

  it("renders text results when audio is empty but texts exist", () => {
    render(
      <PreviewContent
        {...empty}
        texts={["transcribed text"]}
        resultType="audio"
      />,
    );
    expect(screen.getByText("transcribed text")).toBeInTheDocument();
  });
});
