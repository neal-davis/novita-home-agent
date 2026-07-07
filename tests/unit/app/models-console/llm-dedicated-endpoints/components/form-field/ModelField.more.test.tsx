import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { checkHfBaseModel, getHfModel } from "@/api/dedicated-endpoint";
import { getFullLLMModelsWithCache } from "@/api/model";
import ModelField, {
  ModelFieldValue,
} from "@/app/models-console/llm-dedicated-endpoints/components/form-field/ModelField";

jest.mock("@/api/dedicated-endpoint", () => ({
  checkHfBaseModel: jest.fn(),
  getHfModel: jest.fn(),
}));

jest.mock("@/api/model", () => ({
  getFullLLMModelsWithCache: jest.fn(),
}));

jest.mock("@/app/components/Tooltip", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CommandEmpty: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CommandGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CommandInput: ({
    onValueChange,
    placeholder,
    value,
  }: {
    onValueChange: (value: string) => void;
    placeholder: string;
    value: string;
  }) => (
    <input
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={placeholder}
      value={value}
    />
  ),
  CommandItem: ({
    children,
    onSelect,
    value,
  }: {
    children: React.ReactNode;
    onSelect: (value: string) => void;
    value: string;
  }) => (
    <button onClick={() => onSelect(value)} type="button">
      {children}
    </button>
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/HFTokenIntegrationModal",
  () => ({
    __esModule: true,
    default: ({ show }: { show: boolean }) =>
      show ? <div>hf-token-modal</div> : null,
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/AddAdapterModal",
  () => ({
    __esModule: true,
    default: ({ show }: { show: boolean }) =>
      show ? <div>add-adapter-modal</div> : null,
  }),
);

const mockGetHfModel = getHfModel as jest.Mock;
const mockCheckHfBaseModel = checkHfBaseModel as jest.Mock;
const mockGetFullLLMModelsWithCache = getFullLLMModelsWithCache as jest.Mock;

const base: ModelFieldValue = {
  loraAdapters: [],
  modelId: "",
  provider: "huggingface",
  token: "",
};

describe("ModelField (more branches)", () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockGetHfModel.mockResolvedValue({ models: [] });
    mockCheckHfBaseModel.mockResolvedValue({});
    mockGetFullLLMModelsWithCache.mockResolvedValue([]);
  });
  afterEach(() => consoleErrorSpy.mockRestore());

  it("hideToken=true: skips validation and reports success, hides token UI", async () => {
    const setCheckStatus = jest.fn();
    render(
      <ModelField
        checkStatus={null}
        hideToken
        onChange={jest.fn()}
        setCheckStatus={setCheckStatus}
        value={{ ...base, modelId: "owner/m" }}
      />,
    );
    await waitFor(() => expect(setCheckStatus).toHaveBeenCalledWith("success"));
    expect(mockCheckHfBaseModel).not.toHaveBeenCalled();
    // token section not rendered
    expect(screen.queryByText("Token:")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Required for private & gated models"),
    ).not.toBeInTheDocument();
  });

  it("renders Integrate button when huggingface selected and no token", () => {
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={base}
      />,
    );
    expect(
      screen.getByText("Required for private & gated models"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Integrate" }),
    ).toBeInTheDocument();
  });

  it("opens HF token modal from Integrate button", () => {
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={base}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Integrate" }));
    expect(screen.getByText("hf-token-modal")).toBeInTheDocument();
  });

  it("error state: gated model WITH token shows access-request link", async () => {
    mockCheckHfBaseModel.mockRejectedValue({ reason: "HUGGING_FACE_GATED" });
    const setCheckStatus = jest.fn();
    render(
      <ModelField
        checkStatus="error"
        onChange={jest.fn()}
        setCheckStatus={setCheckStatus}
        value={{ ...base, modelId: "owner/gated", token: "tok" }}
      />,
    );
    await waitFor(() => expect(setCheckStatus).toHaveBeenCalledWith("error"));
    expect(screen.getByText(/submit an access request/i)).toBeInTheDocument();
  });

  it("error state: gated model WITHOUT token shows integrate-token message", async () => {
    mockCheckHfBaseModel.mockRejectedValue({ reason: "HUGGING_FACE_GATED" });
    const setCheckStatus = jest.fn();
    render(
      <ModelField
        checkStatus="error"
        onChange={jest.fn()}
        setCheckStatus={setCheckStatus}
        value={{ ...base, modelId: "owner/gated" }}
      />,
    );
    await waitFor(() => expect(setCheckStatus).toHaveBeenCalledWith("error"));
    expect(
      screen.getByText("Please integrate a Hugging Face token."),
    ).toBeInTheDocument();
  });

  it("error state: unsupported model reason", async () => {
    mockCheckHfBaseModel.mockRejectedValue({
      reason: "LLM_DEDICATED_ENDPOINT_MODEL_NOT_SUPPORTED",
    });
    const setCheckStatus = jest.fn();
    render(
      <ModelField
        checkStatus="error"
        onChange={jest.fn()}
        setCheckStatus={setCheckStatus}
        value={{ ...base, modelId: "owner/x" }}
      />,
    );
    await waitFor(() => expect(setCheckStatus).toHaveBeenCalledWith("error"));
    expect(
      screen.getByText(
        "This model is not supported for LLM Dedicated Endpoints.",
      ),
    ).toBeInTheDocument();
  });

  it("error state: unknown/no reason falls back to default message", async () => {
    mockCheckHfBaseModel.mockRejectedValue({});
    const setCheckStatus = jest.fn();
    render(
      <ModelField
        checkStatus="error"
        onChange={jest.fn()}
        setCheckStatus={setCheckStatus}
        value={{ ...base, modelId: "owner/x" }}
      />,
    );
    await waitFor(() => expect(setCheckStatus).toHaveBeenCalledWith("error"));
    expect(
      screen.getByText("You don't have access to this model."),
    ).toBeInTheDocument();
  });

  it("loading status shows validating message", () => {
    render(
      <ModelField
        checkStatus="loading"
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, modelId: "owner/x" }}
      />,
    );
    expect(screen.getByText("Validating model...")).toBeInTheDocument();
  });

  it("success status for novita shows novita success copy", () => {
    render(
      <ModelField
        checkStatus="success"
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, modelId: "owner/x", provider: "novita" }}
      />,
    );
    expect(screen.getByText("Model selected successfully")).toBeInTheDocument();
  });

  it("success status for huggingface shows access-granted copy", () => {
    render(
      <ModelField
        checkStatus="success"
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, modelId: "owner/x", provider: "huggingface" }}
      />,
    );
    expect(
      screen.getByText("You have been granted access to this model"),
    ).toBeInTheDocument();
  });

  it("HF empty search shows 'No models found' contact support", async () => {
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={base}
      />,
    );
    const input = screen.getByPlaceholderText("Search Hugging Face models...");
    fireEvent.change(input, { target: { value: "nothing" } });
    await waitFor(() =>
      expect(screen.getByText(/No models found/)).toBeInTheDocument(),
    );
  });

  it("getHfModel failure clears the available models list", async () => {
    mockGetHfModel.mockRejectedValue(new Error("net"));
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={base}
      />,
    );
    await waitFor(() => expect(mockGetHfModel).toHaveBeenCalled());
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("novita loading spinner shown while fetching", async () => {
    let resolveModels: (v: any) => void = () => {};
    mockGetFullLLMModelsWithCache.mockReturnValue(
      new Promise((res) => {
        resolveModels = res;
      }),
    );
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, provider: "novita" }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("Loading models...")).toBeInTheDocument(),
    );
    resolveModels([]);
  });

  it("novita fetch failure logs error and shows empty", async () => {
    mockGetFullLLMModelsWithCache.mockRejectedValue(new Error("boom"));
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, provider: "novita" }}
      />,
    );
    await waitFor(() =>
      expect(mockGetFullLLMModelsWithCache).toHaveBeenCalled(),
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("novita: selecting a model WITHOUT hf_mirror_url keeps original id", async () => {
    mockGetFullLLMModelsWithCache.mockResolvedValue([
      {
        id: "plain-id",
        name: "Plain",
        displayName: "Plain Model",
        hf_mirror_url: "mirror/url",
      },
    ]);
    const onChange = jest.fn();
    render(
      <ModelField
        checkStatus={null}
        onChange={onChange}
        setCheckStatus={jest.fn()}
        value={{ ...base, provider: "novita" }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("Plain Model")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Plain Model/ }));
    // hf_mirror_url exists so it is used
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ modelId: "mirror/url", provider: "novita" }),
    );
  });

  it("novita search filters by name/displayName/id", async () => {
    mockGetFullLLMModelsWithCache.mockResolvedValue([
      {
        id: "alpha-id",
        name: "alpha",
        displayName: "Alpha",
        hf_mirror_url: "m/a",
      },
      {
        id: "beta-id",
        name: "beta",
        displayName: "Beta",
        hf_mirror_url: "m/b",
      },
    ]);
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, provider: "novita" }}
      />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    const input = screen.getByPlaceholderText("Search Novita models...");
    fireEvent.change(input, { target: { value: "beta" } });
    await waitFor(() =>
      expect(screen.queryByText("Alpha")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("novita empty search results show contact support", async () => {
    mockGetFullLLMModelsWithCache.mockResolvedValue([
      {
        id: "alpha-id",
        name: "alpha",
        displayName: "Alpha",
        hf_mirror_url: "m/a",
      },
    ]);
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, provider: "novita" }}
      />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText("Search Novita models..."), {
      target: { value: "zzzz" },
    });
    await waitFor(() =>
      expect(screen.getByText(/No models found/)).toBeInTheDocument(),
    );
  });

  it("Add LoRA Adapter disabled without modelId; enabled and opens modal with modelId", () => {
    const { rerender } = render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={base}
      />,
    );
    const addBtn = screen.getByRole("button", { name: /Add LoRA Adapter/ });
    expect(addBtn).toBeDisabled();

    rerender(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, modelId: "owner/m" }}
      />,
    );
    const enabled = screen.getByRole("button", { name: /Add LoRA Adapter/ });
    expect(enabled).not.toBeDisabled();
    fireEvent.click(enabled);
    expect(screen.getByText("add-adapter-modal")).toBeInTheDocument();
  });

  it("shows token preview + Edit when token present", () => {
    render(
      <ModelField
        checkStatus={null}
        onChange={jest.fn()}
        setCheckStatus={jest.fn()}
        value={{ ...base, token: "hf_abcdefghijklmnop" }}
      />,
    );
    expect(screen.getByText("Token:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
