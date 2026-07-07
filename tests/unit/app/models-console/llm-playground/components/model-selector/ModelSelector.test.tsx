import { fireEvent, render, screen } from "@testing-library/react";
import { ModelSelector } from "@/app/models-console/llm-playground/components/model-selector/ModelSelector";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const router = { push: mockPush, replace: mockReplace };
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

let mockModel: any;
const clearChatHistory = jest.fn();
const setCurrentModel = jest.fn();

jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => mockModel }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({ useChatConfig: () => ({ clearChatHistory }) }),
);
jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  transformModelIdToPath: (id: string) => id.replace(/\//g, "-"),
}));
jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: () => <div data-testid="model-logo" />,
}));
// Render the SelectFilter as a simple select that exposes onValueChange
let capturedOnValueChange: (v: string) => void = () => {};
jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({ options, onValueChange, getOptionValue }: any) => {
    capturedOnValueChange = onValueChange;
    return (
      <select
        data-testid="select"
        onChange={(e) => onValueChange(e.target.value)}
      >
        {options.map((o: any) => (
          <option key={getOptionValue(o)} value={getOptionValue(o)}>
            {getOptionValue(o)}
          </option>
        ))}
      </select>
    );
  },
}));

const modelList = [
  { id: "openai/gpt-4", displayName: "GPT 4" },
  { id: "meta/llama", displayName: "Llama" },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockModel = {
    modelList,
    currentModel: modelList[0],
    setCurrentModel,
    isModelDetailPage: false,
  };
});

describe("ModelSelector (llm)", () => {
  it("on console playground: clears history, sets model, and pushes URL", () => {
    render(<ModelSelector />);
    fireEvent.change(screen.getByTestId("select"), {
      target: { value: "meta/llama" },
    });
    expect(clearChatHistory).toHaveBeenCalled();
    expect(setCurrentModel).toHaveBeenCalledWith(modelList[1]);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("model=meta-llama"),
    );
  });

  it("on model detail page: uses router.replace and does not set current model", () => {
    mockModel.isModelDetailPage = true;
    render(<ModelSelector />);
    fireEvent.change(screen.getByTestId("select"), {
      target: { value: "meta/llama" },
    });
    expect(mockReplace).toHaveBeenCalledWith("/models/llm/meta-llama");
    expect(setCurrentModel).not.toHaveBeenCalled();
    expect(clearChatHistory).not.toHaveBeenCalled();
  });

  it("ignores a value that does not match any model", () => {
    render(<ModelSelector />);
    capturedOnValueChange("unknown");
    expect(setCurrentModel).not.toHaveBeenCalled();
  });
});
