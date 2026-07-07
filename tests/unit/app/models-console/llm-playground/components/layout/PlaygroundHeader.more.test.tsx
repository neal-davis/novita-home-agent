import { fireEvent, render, screen } from "@testing-library/react";
import { PlaygroundHeader } from "@/app/models-console/llm-playground/components/layout/PlaygroundHeader";

let mockModel: any = { currentModel: null };
let mockChatConfig: any = { chatMode: "chat", chatConfig: {} };
let mockUIState: any = { codeDrawerOpen: false, setCodeDrawerOpen: jest.fn() };
let campaignConfig: any = { enabled: false };

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
  default: ({ text }: any) => <div data-testid="build-month">{text}</div>,
}));
jest.mock("@/config/campaign", () => ({
  __esModule: true,
  default: () => campaignConfig,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockModel = { currentModel: { id: "m/x", linkPath: "m-x" } };
  mockChatConfig = { chatMode: "chat", chatConfig: {} };
  mockUIState = { codeDrawerOpen: false, setCodeDrawerOpen: jest.fn() };
  campaignConfig = { enabled: false };
});

describe("PlaygroundHeader (more branches)", () => {
  it("does not open a tab when Create Endpoint is clicked without a model id", () => {
    mockModel = {
      currentModel: { id: "", linkPath: "m-x", hf_mirror_url: "https://hf" },
    };
    const openSpy = jest.spyOn(window, "open").mockImplementation();
    render(<PlaygroundHeader />);
    fireEvent.click(screen.getByText("Create Endpoint"));
    // early return because currentModel.id is falsy
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("renders the campaign discount tag when enabled and prices differ", () => {
    campaignConfig = { enabled: true, modelPageDiscountLabel: "Save 20%" };
    mockModel = {
      currentModel: {
        id: "m/x",
        linkPath: "m-x",
        input_pricing: { originPricePerM: 10, pricePerM: 8 },
      },
    };
    render(<PlaygroundHeader />);
    expect(screen.getByTestId("build-month")).toHaveTextContent("Save 20%");
  });

  it("hides the discount tag when prices are equal even if campaign is enabled", () => {
    campaignConfig = { enabled: true, modelPageDiscountLabel: "Save 20%" };
    mockModel = {
      currentModel: {
        id: "m/x",
        linkPath: "m-x",
        input_pricing: { originPricePerM: 8, pricePerM: 8 },
      },
    };
    render(<PlaygroundHeader />);
    expect(screen.queryByTestId("build-month")).not.toBeInTheDocument();
  });

  it("reflects an open code drawer state", () => {
    mockUIState = { codeDrawerOpen: true, setCodeDrawerOpen: jest.fn() };
    render(<PlaygroundHeader />);
    expect(screen.getByTestId("code-drawer")).toHaveTextContent("true");
  });
});
