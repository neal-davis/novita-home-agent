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
    default: ({
      onClose,
      onTokenChange,
      show,
    }: {
      onClose: () => void;
      onTokenChange: (token: string) => void;
      show: boolean;
    }) =>
      show ? (
        <div>
          <button
            onClick={() => onTokenChange("hf-token-updated")}
            type="button"
          >
            save hf token
          </button>
          <button onClick={onClose} type="button">
            close hf token
          </button>
        </div>
      ) : null,
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/AddAdapterModal",
  () => ({
    __esModule: true,
    default: ({
      onAdapterSave,
      onClose,
      show,
    }: {
      onAdapterSave: (adapters: ModelFieldValue["loraAdapters"]) => void;
      onClose: () => void;
      show: boolean;
    }) =>
      show ? (
        <div>
          <button
            onClick={() =>
              onAdapterSave([
                { modelAlias: "route-a", modelId: "owner/lora-a" },
              ])
            }
            type="button"
          >
            save adapter
          </button>
          <button onClick={onClose} type="button">
            close adapter
          </button>
        </div>
      ) : null,
  }),
);

const mockGetHfModel = getHfModel as jest.Mock;
const mockCheckHfBaseModel = checkHfBaseModel as jest.Mock;
const mockGetFullLLMModelsWithCache = getFullLLMModelsWithCache as jest.Mock;

const emptyValue: ModelFieldValue = {
  loraAdapters: [],
  modelId: "",
  provider: "huggingface",
  token: "",
};

describe("ModelField", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockGetHfModel.mockResolvedValue({
      models: [{ modelId: "meta-llama/Llama-3.1-8B" }],
    });
    mockCheckHfBaseModel.mockResolvedValue({});
    mockGetFullLLMModelsWithCache.mockResolvedValue([
      {
        displayName: "Llama 3.1 8B",
        hf_mirror_url: "novita/llama-3-1-8b",
        id: "meta-llama/Llama-3.1-8B",
        name: "llama",
      },
      {
        displayName: "No Mirror Model",
        hf_mirror_url: "",
        id: "no-mirror",
        name: "no-mirror",
      },
    ]);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("selects a Hugging Face model, validates access, and updates the token", async () => {
    const onChange = jest.fn();
    const setCheckStatus = jest.fn();
    const { rerender } = render(
      <ModelField
        checkStatus={null}
        onChange={onChange}
        setCheckStatus={setCheckStatus}
        value={emptyValue}
      />,
    );

    await waitFor(() =>
      expect(mockGetHfModel).toHaveBeenCalledWith({
        modelId: "",
        token: "",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /meta-llama/ }));
    expect(onChange).toHaveBeenLastCalledWith({
      loraAdapters: [],
      modelId: "meta-llama/Llama-3.1-8B",
      provider: "huggingface",
      token: "",
    });

    rerender(
      <ModelField
        checkStatus={null}
        onChange={onChange}
        setCheckStatus={setCheckStatus}
        value={{
          ...emptyValue,
          modelId: "meta-llama/Llama-3.1-8B",
          token: "hf-token",
        }}
      />,
    );

    await waitFor(() =>
      expect(mockCheckHfBaseModel).toHaveBeenCalledWith({
        modelId: "meta-llama/Llama-3.1-8B",
        token: "hf-token",
      }),
    );
    await waitFor(() => expect(setCheckStatus).toHaveBeenCalledWith("success"));

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "save hf token" }));

    expect(onChange).toHaveBeenLastCalledWith({
      loraAdapters: [],
      modelId: "meta-llama/Llama-3.1-8B",
      provider: "huggingface",
      token: "hf-token-updated",
    });
  });

  it("switches to Novita models, filters deployable models, and stores the mirror model id", async () => {
    const onChange = jest.fn();
    const setCheckStatus = jest.fn();
    const { rerender } = render(
      <ModelField
        checkStatus={null}
        onChange={onChange}
        setCheckStatus={setCheckStatus}
        value={emptyValue}
      />,
    );

    fireEvent.click(screen.getByText("Novita AI"));
    expect(onChange).toHaveBeenLastCalledWith({
      loraAdapters: [],
      modelId: "",
      provider: "novita",
      token: "",
    });

    rerender(
      <ModelField
        checkStatus={null}
        onChange={onChange}
        setCheckStatus={setCheckStatus}
        value={{ ...emptyValue, provider: "novita" }}
      />,
    );

    await waitFor(() =>
      expect(mockGetFullLLMModelsWithCache).toHaveBeenCalledWith([
        "chat",
        "embedding",
        "reranker",
      ]),
    );
    expect(screen.getByText("Llama 3.1 8B")).toBeInTheDocument();
    expect(screen.queryByText("No Mirror Model")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Llama 3.1 8B/ }));
    expect(onChange).toHaveBeenLastCalledWith({
      loraAdapters: [],
      modelId: "novita/llama-3-1-8b",
      provider: "novita",
      token: "",
    });

    rerender(
      <ModelField
        checkStatus={null}
        onChange={onChange}
        setCheckStatus={setCheckStatus}
        value={{
          ...emptyValue,
          modelId: "novita/llama-3-1-8b",
          provider: "novita",
        }}
      />,
    );

    await waitFor(() => expect(setCheckStatus).toHaveBeenCalledWith("success"));
    expect(mockCheckHfBaseModel).not.toHaveBeenCalledWith(
      expect.objectContaining({ modelId: "novita/llama-3-1-8b" }),
    );
  });

  it("edits, removes, and adds LoRA adapters while surfacing duplicate routes", () => {
    const onChange = jest.fn();
    render(
      <ModelField
        checkStatus="success"
        onChange={onChange}
        setCheckStatus={jest.fn()}
        value={{
          loraAdapters: [
            { modelAlias: "same-route", modelId: "owner/lora-a" },
            { modelAlias: "same-route", modelId: "owner/lora-b" },
          ],
          modelId: "owner/base-model",
          provider: "huggingface",
          token: "",
        }}
      />,
    );

    expect(
      screen.getByText("Route must be unique within the endpoint."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getAllByDisplayValue("same-route")[0], {
      target: { value: "route-a" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      loraAdapters: [
        { modelAlias: "route-a", modelId: "owner/lora-a" },
        { modelAlias: "same-route", modelId: "owner/lora-b" },
      ],
      modelId: "owner/base-model",
      provider: "huggingface",
      token: "",
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[1]);
    expect(onChange).toHaveBeenLastCalledWith({
      loraAdapters: [{ modelAlias: "same-route", modelId: "owner/lora-a" }],
      modelId: "owner/base-model",
      provider: "huggingface",
      token: "",
    });

    fireEvent.click(screen.getByRole("button", { name: /Add LoRA Adapter/ }));
    fireEvent.click(screen.getByRole("button", { name: "save adapter" }));

    expect(onChange).toHaveBeenLastCalledWith({
      loraAdapters: [{ modelAlias: "route-a", modelId: "owner/lora-a" }],
      modelId: "owner/base-model",
      provider: "huggingface",
      token: "",
    });
  });
});
