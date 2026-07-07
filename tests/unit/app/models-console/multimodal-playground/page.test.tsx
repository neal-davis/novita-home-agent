import { fireEvent, render, screen } from "@testing-library/react";
import MultimodalPlaygroundPage from "@/app/models-console/multimodal-playground/page";

const mockDispatch = jest.fn();
let mockUuid: string | null = "user-1";
jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => sel({ user: { uuid: mockUuid } }),
}));

jest.mock("@/store/slice/multimodalSlice", () => ({
  fetchMultimodalConfigs: jest.fn(() => ({ type: "fetch" })),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("model=old"),
}));

let modelConfigs: any;
const mockSetSelectedModel = jest.fn();
jest.mock(
  "@/app/models-console/multimodal-playground/hooks/useModelConfigs",
  () => ({
    useModelConfigs: () => modelConfigs,
  }),
);

const mockExecuteTask = jest.fn();
const mockResetTask = jest.fn();
const mockCancelTask = jest.fn();
const mockSetExampleResult = jest.fn();
jest.mock(
  "@/app/models-console/multimodal-playground/hooks/useTaskExecution",
  () => ({
    useTaskExecution: () => ({
      taskState: { status: "idle", taskId: null, result: null, error: null },
      executeTask: mockExecuteTask,
      resetTask: mockResetTask,
      cancelTask: mockCancelTask,
      setExampleResult: mockSetExampleResult,
    }),
  }),
);

let validateResult = true;
const mockHandleFieldChange = jest.fn();
const mockResetForm = jest.fn();
const mockGetFilteredData = jest.fn(() => ({ prompt: "x" }));
const mockSetFormData = jest.fn();
jest.mock(
  "@/app/models-console/multimodal-playground/hooks/usePlaygroundForm",
  () => ({
    usePlaygroundForm: () => ({
      formData: { prompt: "x" },
      errors: {},
      handleFieldChange: mockHandleFieldChange,
      handleReset: mockResetForm,
      validateForm: () => validateResult,
      getFilteredData: mockGetFilteredData,
      setFormData: mockSetFormData,
    }),
  }),
);

const mockSave = jest.fn();
jest.mock(
  "@/app/models-console/multimodal-playground/utils/localStorage",
  () => ({ savePlaygroundFormData: (...a: any[]) => mockSave(...a) }),
);

jest.mock(
  "@/app/models-console/multimodal-playground/utils/schemaParser",
  () => ({
    parseOpenAPISchema: () => ({
      requestSchema: { prompt: { type: "string" } },
      endpoint: "/v1/x",
      method: "post",
      requiredFields: ["prompt"],
    }),
    parseRawListItem: (raw: any) => ({ name: raw?.fusionConfig?.name }),
  }),
);

jest.mock(
  "@/app/models-console/multimodal-playground/components/ModelSelector",
  () => ({
    ModelSelector: ({ onModelChange }: any) => (
      <button data-testid="model-selector" onClick={() => onModelChange("new")}>
        select
      </button>
    ),
  }),
);

jest.mock(
  "@/app/models-console/multimodal-playground/components/TabsSection",
  () => ({
    TabsSection: ({ onRun, onReset, onExampleSelect }: any) => (
      <div data-testid="tabs-section">
        <button onClick={onRun}>run</button>
        <button onClick={onReset}>reset</button>
        <button
          onClick={() =>
            onExampleSelect({ request: { a: 1 }, response: { b: 2 } })
          }
        >
          example
        </button>
      </div>
    ),
  }),
);

const selectedModel = {
  name: "model-a",
  category: "image_gen",
  description: "d",
  async: true,
  openapiSchema: { x: 1 },
  examples: [],
  markdown: "",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUuid = "user-1";
  validateResult = true;
  modelConfigs = {
    modelList: [{ fusionConfig: { name: "new" } }],
    selectedModel,
    isLoading: false,
    error: null,
    setSelectedModel: mockSetSelectedModel,
  };
});

describe("MultimodalPlaygroundPage", () => {
  it("dispatches config fetch on mount", () => {
    render(<MultimodalPlaygroundPage />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("shows a loading state when loading", () => {
    modelConfigs = { ...modelConfigs, isLoading: true, selectedModel: null };
    render(<MultimodalPlaygroundPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state when error is set", () => {
    modelConfigs = { ...modelConfigs, error: "boom" };
    render(<MultimodalPlaygroundPage />);
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("renders selector and tabs when loaded", () => {
    render(<MultimodalPlaygroundPage />);
    expect(screen.getByTestId("model-selector")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-section")).toBeInTheDocument();
  });

  it("executes the task on run when logged in and valid", () => {
    render(<MultimodalPlaygroundPage />);
    fireEvent.click(screen.getByText("run"));
    expect(mockExecuteTask).toHaveBeenCalledWith({ prompt: "x" }, true);
  });

  it("redirects to login and saves form data when not logged in", () => {
    mockUuid = null;
    render(<MultimodalPlaygroundPage />);
    fireEvent.click(screen.getByText("run"));
    expect(mockSave).toHaveBeenCalledWith("model-a", { prompt: "x" });
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/user/login?redirect="),
    );
    expect(mockExecuteTask).not.toHaveBeenCalled();
  });

  it("does not execute when validation fails", () => {
    validateResult = false;
    render(<MultimodalPlaygroundPage />);
    fireEvent.click(screen.getByText("run"));
    expect(mockExecuteTask).not.toHaveBeenCalled();
  });

  it("resets form and task on reset", () => {
    render(<MultimodalPlaygroundPage />);
    fireEvent.click(screen.getByText("reset"));
    expect(mockResetForm).toHaveBeenCalled();
    expect(mockResetTask).toHaveBeenCalled();
  });

  it("changes model and updates the URL", () => {
    render(<MultimodalPlaygroundPage />);
    fireEvent.click(screen.getByTestId("model-selector"));
    expect(mockSetSelectedModel).toHaveBeenCalledWith({ name: "new" });
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("model=new"));
  });

  it("selects an example, setting form data and result", () => {
    render(<MultimodalPlaygroundPage />);
    fireEvent.click(screen.getByText("example"));
    expect(mockSetFormData).toHaveBeenCalledWith({ a: 1 });
    expect(mockSetExampleResult).toHaveBeenCalledWith({ b: 2 });
  });
});
