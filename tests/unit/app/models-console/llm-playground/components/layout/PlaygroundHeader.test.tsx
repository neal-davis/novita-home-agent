import { fireEvent, render, screen } from "@testing-library/react";
import { PlaygroundHeader } from "@/app/models-console/llm-playground/components/layout/PlaygroundHeader";

let mockModel: any = { currentModel: null };
let mockChatConfig: any = { chatMode: "chat", chatConfig: {} };
let mockUIState: any = { codeDrawerOpen: false, setCodeDrawerOpen: jest.fn() };

jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => mockModel }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({ useChatConfig: () => mockChatConfig }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/UIStateProvider",
  () => ({ useUIState: () => mockUIState }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/model-selector/ModelSelector",
  () => ({ ModelSelector: () => <div data-testid="model-selector" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/code-drawer/CodeDrawer",
  () => ({
    CodeDrawer: ({ open }: any) => (
      <div data-testid="code-drawer">{String(open)}</div>
    ),
  }),
);
jest.mock("@/components/ui/standard/code-copy-btn", () => ({
  __esModule: true,
  default: () => <div data-testid="copy-btn" />,
}));
jest.mock("@/app/components/ModelLibrary/PartnerTag", () => ({
  __esModule: true,
  default: () => <div data-testid="partner-tag" />,
}));
jest.mock("@/app/components/buildMonth", () => ({
  __esModule: true,
  default: () => <div data-testid="build-month" />,
}));
jest.mock("@/config/campaign", () => ({
  __esModule: true,
  default: () => ({ enabled: false }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockModel = { currentModel: { id: "m/x", linkPath: "m-x" } };
  mockChatConfig = { chatMode: "chat", chatConfig: {} };
  mockUIState = { codeDrawerOpen: false, setCodeDrawerOpen: jest.fn() };
});

describe("PlaygroundHeader", () => {
  it("renders model id, selector, and view code button", () => {
    render(<PlaygroundHeader />);
    expect(screen.getByTestId("model-selector")).toBeInTheDocument();
    expect(screen.getByText("m/x")).toBeInTheDocument();
    expect(screen.getByText("View Code")).toBeInTheDocument();
    expect(screen.getByText("Model Detail")).toBeInTheDocument();
  });

  it("opens the code drawer on View Code click", () => {
    render(<PlaygroundHeader />);
    fireEvent.click(screen.getByText("View Code"));
    expect(mockUIState.setCodeDrawerOpen).toHaveBeenCalledWith(true);
  });

  it("shows Create Endpoint when a hf_mirror_url is present and opens a new tab", () => {
    mockModel = {
      currentModel: { id: "m/x", linkPath: "m-x", hf_mirror_url: "https://hf" },
    };
    const openSpy = jest.spyOn(window, "open").mockImplementation();
    render(<PlaygroundHeader />);
    const btn = screen.getByText("Create Endpoint");
    fireEvent.click(btn);
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("modelId=m%2Fx"),
      "_blank",
    );
    openSpy.mockRestore();
  });

  it("hides Create Endpoint when no hf_mirror_url", () => {
    render(<PlaygroundHeader />);
    expect(screen.queryByText("Create Endpoint")).not.toBeInTheDocument();
  });

  it("renders the PartnerTag for partner models", () => {
    mockModel = {
      currentModel: {
        id: "m/x",
        linkPath: "m-x",
        labels: [{ key: "Partner", value: "Partner" }],
      },
    };
    render(<PlaygroundHeader />);
    expect(screen.getByTestId("partner-tag")).toBeInTheDocument();
  });
});
