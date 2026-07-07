import { render } from "@testing-library/react";
import { ModelSelector } from "@/app/models-console/llm-playground/components/model-selector/ModelSelector";

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => mockModel }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({ useChatConfig: () => ({ clearChatHistory: jest.fn() }) }),
);
jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({ modelName }: any) => (
    <div data-testid="model-logo">{modelName}</div>
  ),
}));

// Capture the render props passed to SelectFilter so we can exercise the
// renderOption fallback chain and getOptionSearchText directly.
let captured: any = {};
jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: (props: any) => {
    captured = props;
    return <div data-testid="select-filter" />;
  },
}));

let mockModel: any;
const modelList = [
  { id: "openai/gpt-4", displayName: "GPT 4", name: "gpt4", series: "openai" },
];

beforeEach(() => {
  captured = {};
  mockModel = {
    modelList,
    currentModel: modelList[0],
    setCurrentModel: jest.fn(),
    isModelDetailPage: false,
  };
});

describe("ModelSelector renderOption & accessors", () => {
  it("renders a logo using displayName and exposes value/label/search accessors", () => {
    render(<ModelSelector />);
    expect(captured.getOptionValue(modelList[0])).toBe("openai/gpt-4");
    expect(captured.getOptionLabel(modelList[0])).toBe("GPT 4");
    expect(captured.getOptionSearchText(modelList[0])).toEqual([
      "GPT 4",
      "openai/gpt-4",
    ]);
    const { getByTestId } = render(captured.renderOption(modelList[0]) as any);
    expect(getByTestId("model-logo")).toHaveTextContent("GPT 4");
  });

  it("falls back to name then id for the logo when displayName is missing", () => {
    const noName = { id: "x/y", series: "x" };
    render(<ModelSelector />);
    const { getByTestId } = render(captured.renderOption(noName) as any);
    // displayName and name absent -> uses id.toString()
    expect(getByTestId("model-logo")).toHaveTextContent("x/y");
  });
});
