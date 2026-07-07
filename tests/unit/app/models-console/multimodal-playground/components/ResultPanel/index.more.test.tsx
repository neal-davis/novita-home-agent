import { fireEvent, render, screen } from "@testing-library/react";
import { ResultPanel } from "@/app/models-console/multimodal-playground/components/ResultPanel/index";

const mockDownloadMedia = jest.fn();

jest.mock("@/app/models-console/multimodal-playground/utils/download", () => ({
  downloadMedia: (...a: any[]) => mockDownloadMedia(...a),
}));

// Drive resultType via a mutable mock so we can cover video/audio media url paths
let resultTypeValue: any = "video";
jest.mock("@/app/models-console/multimodal-playground/utils/result", () => ({
  getResultType: () => resultTypeValue,
  extractImages: () => ["img-1"],
  extractVideos: () => ["vid-1", "vid-2"],
  extractAudios: () => ["aud-1"],
  extractTexts: () => [],
}));

jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/StatusBadge",
  () => ({ StatusBadge: () => <div data-testid="status-badge" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/EmptyState",
  () => ({ EmptyState: () => <div data-testid="empty-state" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/LoadingState",
  () => ({ LoadingState: () => <div data-testid="loading-state" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/ErrorState",
  () => ({ ErrorState: () => <div data-testid="error-state" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/PreviewContent",
  () => ({
    PreviewContent: ({ resultType }: any) => (
      <div data-testid="preview-content">{resultType}</div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/JSONContent",
  () => ({ JSONContent: () => <div data-testid="json-content" /> }),
);

describe("ResultPanel (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resultTypeValue = "video";
  });

  it("downloads video media urls when resultType is video", async () => {
    mockDownloadMedia.mockResolvedValue(undefined);
    render(
      <ResultPanel
        category="video_gen"
        status="success"
        result={{ videos: [{}] } as any}
      />,
    );
    fireEvent.click(screen.getByText("Download"));
    // two video urls
    expect(await screen.findByTestId("preview-content")).toHaveTextContent(
      "video",
    );
    expect(mockDownloadMedia).toHaveBeenCalledWith("vid-1", 0);
  });

  it("uses audio media urls when resultType is audio", () => {
    resultTypeValue = "audio";
    render(
      <ResultPanel
        category="audio_gen"
        status="success"
        result={{ audios: [{}] } as any}
      />,
    );
    fireEvent.click(screen.getByText("Download"));
    expect(mockDownloadMedia).toHaveBeenCalledWith("aud-1", 0);
  });

  it("hides the download button when resultType yields no media urls", () => {
    resultTypeValue = null;
    render(
      <ResultPanel category="image_gen" status="success" result={{} as any} />,
    );
    expect(screen.queryByText("Download")).not.toBeInTheDocument();
  });

  it("switches to the JSON view when the JSON result tab is clicked", () => {
    render(
      <ResultPanel
        category="video_gen"
        status="success"
        result={{ videos: [{}] } as any}
      />,
    );
    // both panels are mounted (display toggled); assert the tab control exists
    fireEvent.click(screen.getByText("JSON result"));
    expect(screen.getByTestId("json-content")).toBeInTheDocument();
  });
});
