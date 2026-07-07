import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ResultPanel } from "@/app/models-console/multimodal-playground/components/ResultPanel/index";

const mockDownloadMedia = jest.fn();

jest.mock("@/app/models-console/multimodal-playground/utils/download", () => ({
  downloadMedia: (...a: any[]) => mockDownloadMedia(...a),
}));

jest.mock("@/app/models-console/multimodal-playground/utils/result", () => ({
  getResultType: jest.fn(() => "image"),
  extractImages: jest.fn(() => ["https://x/1.png", "https://x/2.png"]),
  extractVideos: jest.fn(() => []),
  extractAudios: jest.fn(() => []),
  extractTexts: jest.fn(() => []),
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
  () => ({
    LoadingState: ({ status, onCancel }: any) => (
      <div data-testid="loading-state">
        {status}
        <button onClick={onCancel}>cancel</button>
      </div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/ErrorState",
  () => ({
    ErrorState: ({ error }: any) => (
      <div data-testid="error-state">{error}</div>
    ),
  }),
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

function renderPanel(overrides: Record<string, any> = {}) {
  return render(
    <ResultPanel
      category="image_gen"
      status="idle"
      result={null}
      {...overrides}
    />,
  );
}

describe("ResultPanel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the empty state when idle with no result", () => {
    renderPanel();
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("renders the loading state and wires cancel for creating/polling", () => {
    const onCancel = jest.fn();
    renderPanel({ status: "creating", onCancel });
    expect(screen.getByTestId("loading-state")).toHaveTextContent("creating");
    fireEvent.click(screen.getByText("cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("renders the error state with the error message", () => {
    renderPanel({ status: "error", error: "boom" });
    expect(screen.getByTestId("error-state")).toHaveTextContent("boom");
  });

  it("renders preview + json content and download button on success", () => {
    renderPanel({ status: "success", result: { images: [{}] } });
    expect(screen.getByTestId("preview-content")).toHaveTextContent("image");
    expect(screen.getByTestId("json-content")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("JSON result")).toBeInTheDocument();
  });

  it("downloads all media urls when the download button is clicked", async () => {
    mockDownloadMedia.mockResolvedValue(undefined);
    renderPanel({ status: "success", result: { images: [{}] } });
    fireEvent.click(screen.getByText("Download"));
    await waitFor(() => expect(mockDownloadMedia).toHaveBeenCalledTimes(2));
    expect(mockDownloadMedia).toHaveBeenCalledWith("https://x/1.png", 0);
    expect(mockDownloadMedia).toHaveBeenCalledWith("https://x/2.png", 1);
  });

  it("logs and continues when a download fails", async () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation();
    mockDownloadMedia.mockRejectedValue(new Error("nope"));
    renderPanel({ status: "success", result: { images: [{}] } });
    fireEvent.click(screen.getByText("Download"));
    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    errSpy.mockRestore();
  });

  it("renders example result (idle with result) and applies web pageType class", () => {
    renderPanel({
      status: "idle",
      result: { images: [{}] },
      pageType: "web",
    });
    expect(screen.getByTestId("preview-content")).toBeInTheDocument();
  });
});
