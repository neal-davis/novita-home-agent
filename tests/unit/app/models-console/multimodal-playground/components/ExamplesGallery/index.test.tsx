import { fireEvent, render, screen } from "@testing-library/react";
import { ExamplesGallery } from "@/app/models-console/multimodal-playground/components/ExamplesGallery/index";

jest.mock("@/app/models-console/multimodal-playground/utils/result", () => {
  const actual = jest.requireActual(
    "@/app/models-console/multimodal-playground/utils/result",
  );
  return {
    ...actual,
    getResultType: jest.fn(actual.getResultType),
    extractImages: jest.fn(actual.extractImages),
    extractVideos: jest.fn(actual.extractVideos),
    extractAudios: jest.fn(actual.extractAudios),
  };
});

import * as resultUtils from "@/app/models-console/multimodal-playground/utils/result";

const imageExample = {
  request: { prompt: "a red car" },
  response: { images: [{ image_url: "http://img/1.png" }] },
};
const placeholderExample = {
  request: {},
  response: {},
};

describe("ExamplesGallery", () => {
  it("renders the empty state when there are no examples", () => {
    render(
      <ExamplesGallery
        examples={[]}
        category="image_gen"
        onExampleClick={jest.fn()}
      />,
    );
    expect(screen.getByText("No examples yet")).toBeInTheDocument();
  });

  it("renders an image thumbnail and the prompt as the title", () => {
    render(
      <ExamplesGallery
        examples={[imageExample] as any}
        category="image_gen"
        onExampleClick={jest.fn()}
      />,
    );
    expect(screen.getByText("a red car")).toBeInTheDocument();
    const img = screen.getByAltText("Example preview") as HTMLImageElement;
    expect(img.src).toContain("http://img/1.png");
  });

  it("truncates long prompt titles", () => {
    const long = "x".repeat(60);
    render(
      <ExamplesGallery
        examples={[{ request: { prompt: long }, response: {} }] as any}
        category="image_gen"
        onExampleClick={jest.fn()}
      />,
    );
    expect(screen.getByText(`${"x".repeat(50)}...`)).toBeInTheDocument();
  });

  it("falls back to a placeholder title when no prompt text exists", () => {
    render(
      <ExamplesGallery
        examples={[placeholderExample] as any}
        category="image_gen"
        onExampleClick={jest.fn()}
      />,
    );
    // "Example 1" appears both as the thumbnail placeholder and the title
    expect(screen.getAllByText("Example 1").length).toBeGreaterThanOrEqual(1);
  });

  it("invokes onExampleClick with the clicked example", () => {
    const onExampleClick = jest.fn();
    render(
      <ExamplesGallery
        examples={[imageExample, placeholderExample] as any}
        category="image_gen"
        onExampleClick={onExampleClick}
      />,
    );
    fireEvent.click(screen.getByLabelText("Load example 2"));
    expect(onExampleClick).toHaveBeenCalledWith(placeholderExample);
  });

  it("renders a video thumbnail for video results", () => {
    (resultUtils.getResultType as jest.Mock).mockReturnValue("video");
    (resultUtils.extractVideos as jest.Mock).mockReturnValue([
      "http://vid/1.mp4",
    ]);
    const { container } = render(
      <ExamplesGallery
        examples={[{ request: { text: "clip" }, response: {} }] as any}
        category="video_gen"
        onExampleClick={jest.fn()}
      />,
    );
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video?.getAttribute("src")).toBe("http://vid/1.mp4");
    // request.text used as the title
    expect(screen.getByText("clip")).toBeInTheDocument();
    jest.clearAllMocks();
  });

  it("renders an audio thumbnail for audio results", () => {
    (resultUtils.getResultType as jest.Mock).mockReturnValue("audio");
    (resultUtils.extractAudios as jest.Mock).mockReturnValue([
      "http://aud/1.mp3",
    ]);
    render(
      <ExamplesGallery
        examples={
          [{ request: { input: { prompt: "song" } }, response: {} }] as any
        }
        category="audio_gen"
        onExampleClick={jest.fn()}
      />,
    );
    expect(screen.getByText("Audio")).toBeInTheDocument();
    // request.input.prompt used as the title
    expect(screen.getByText("song")).toBeInTheDocument();
    jest.clearAllMocks();
  });
});
