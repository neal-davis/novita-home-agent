import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ModelList, {
  getModelId,
  MessageMap,
  ModelType,
} from "@/app/model-api/model/components/modelList/modelList";
import {
  getCivitaiModelDetails,
  getModelDetail,
  getModels,
  searchCivitaiModel,
} from "@/api/model";
import { message } from "@/components/ui/standard/notify";

jest.mock("lodash-es", () => ({
  debounce: (fn: (...args: unknown[]) => unknown) => {
    const debounced = (...args: unknown[]) => fn(...args);
    debounced.cancel = jest.fn();
    return debounced;
  },
}));

jest.mock("@/api/model", () => ({
  getCivitaiModelDetails: jest.fn(),
  getModelDetail: jest.fn(),
  getModels: jest.fn(),
  searchCivitaiModel: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

jest.mock(
  "@/app/model-api/model/components/modelItem/modelItem",
  () =>
    function MockModelItem({
      model,
      onSelect,
      selected,
    }: {
      model: Model;
      onSelect: (details: Model) => void;
      selected: boolean;
    }) {
      return (
        <button
          type="button"
          data-selected={selected}
          onClick={() => onSelect(model)}
        >
          {model.sd_name}
        </button>
      );
    },
);

jest.mock(
  "@/app/model-api/model/components/BaseModelFilter/BaseModelFilter",
  () =>
    function MockBaseModelFilter({
      baseModel,
      disabled,
      setBaseModel,
    }: {
      baseModel: string;
      disabled: boolean;
      setBaseModel: (value: string) => void;
    }) {
      return (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setBaseModel("SDXL")}
        >
          base:{baseModel || "all"}
        </button>
      );
    },
);

jest.mock(
  "@/app/model-api/model/components/SearchBar/SearchBar",
  () =>
    function MockSearchBar({
      loading,
      inputLoading,
      onEmpty,
      onSearch,
      searchModelId,
    }: {
      loading: boolean;
      inputLoading: boolean;
      onEmpty: () => void;
      onSearch: (value?: string) => void;
      searchModelId: string;
    }) {
      return (
        <div>
          <span data-testid="search-state">
            {loading ? "loading" : "idle"}:{inputLoading ? "input" : "ready"}:
            {searchModelId}
          </span>
          <button type="button" onClick={() => onSearch("cat")}>
            search text
          </button>
          <button
            type="button"
            onClick={() =>
              onSearch("https://civitai.com/models/123?modelVersionId=456")
            }
          >
            search version link
          </button>
          <button type="button" onClick={() => onSearch("https://bad.test")}>
            search bad link
          </button>
          <button
            type="button"
            onClick={() => onSearch("https://civitai.com/models/999/broken")}
          >
            search civitai link
          </button>
          <button type="button" onClick={onEmpty}>
            clear search
          </button>
        </div>
      );
    },
);

jest.mock("@/app/model-api/model/components/FloatBtn/FloatBtn", () => ({
  __esModule: true,
  default: () => <div data-testid="float-btn" />,
}));

jest.mock("@/app/components/Loading/Loading_new", () => ({
  __esModule: true,
  default: () => <div data-testid="loading" />,
}));

jest.mock("@/app/model-api/model/components/modelList/Empty", () => ({
  Empty: () => <div data-testid="empty-model-list" />,
}));

const mockGetModels = getModels as jest.Mock;
const mockGetModelDetail = getModelDetail as jest.Mock;
const mockGetCivitaiModelDetails = getCivitaiModelDetails as jest.Mock;
const mockSearchCivitaiModel = searchCivitaiModel as jest.Mock;
const mockMessageError = message.error as jest.Mock;
let consoleError: jest.SpyInstance;

const model = (overrides: Partial<Model> = {}): Model =>
  ({
    base_model: "SDXL",
    base_model_type: "standard",
    categories: [],
    cover_url: "",
    hash_sha256: "hash",
    id: 1,
    is_nsfw: false,
    is_sd3: false,
    is_sdxl: true,
    name: "api-model",
    sd_name: "Display Model",
    sd_name_in_api: "api-model",
    source: "civitai",
    status: 1,
    tags: ["tag"],
    type: { display_name: "Checkpoint", name: "checkpoint" },
    ...overrides,
  }) as Model;

describe("modelList helpers", () => {
  it("parses civitai model ids with and without explicit version ids", () => {
    expect(getModelId("https://civitai.com/models/123/demo")).toEqual({
      modelId: "123",
    });
    expect(
      getModelId("https://civitai.com/models/123?foo=1&modelVersionId=456"),
    ).toEqual({ modelId: "123", versionId: "456" });
    expect(getModelId("https://example.com/models/123")).toEqual({
      modelId: "",
    });
  });
});

describe("ModelList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    mockGetModels.mockResolvedValue({
      fetchId: 0,
      models: [model({ id: 2, sd_name: "Fetched Model" })],
      nextCursor: "c_100",
    });
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.restoreAllMocks();
  });

  it("renders initial models and reports selected model details", () => {
    const onSelect = jest.fn();

    render(
      <ModelList
        initModelList={[model()]}
        modelType={ModelType.base}
        onSelect={onSelect}
        selectedModelId={1}
      />,
    );

    const item = screen.getByRole("button", { name: "Display Model" });
    expect(item).toHaveAttribute("data-selected", "true");

    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it("fetches text search results and clears search back to default results", async () => {
    render(<ModelList initModelList={[]} modelType={ModelType.lora} />);

    await waitFor(() => expect(mockGetModels).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "search text" }));

    await waitFor(() => {
      expect(mockGetModels).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            in_whitelist: true,
            query: "cat",
          }),
          pageIndex: 0,
          type: ModelType.lora,
        }),
      );
      expect(
        screen.getByRole("button", { name: "Fetched Model" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "clear search" }));

    await waitFor(() => {
      expect(mockGetModels).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({ query: "" }),
          pageIndex: 0,
        }),
      );
    });
  });

  it("fetches exact civitai version links through model detail", async () => {
    mockGetModelDetail.mockResolvedValue({
      cover_url: "cover.png",
      hash_sha256: "hash-456",
      is_nsfw: true,
      is_sd3: false,
      is_sdxl: true,
      model_id: 456,
      model_name: "Exact Version",
      name: "exact-version",
      status: 1,
      tags: ["exact"],
      type: "checkpoint",
    });

    render(<ModelList initModelList={[]} modelType={ModelType.base} />);
    fireEvent.click(
      screen.getByRole("button", { name: "search version link" }),
    );

    await waitFor(() => {
      expect(mockGetModelDetail).toHaveBeenCalledWith(456);
      expect(
        screen.getByRole("button", { name: "Exact Version" }),
      ).toBeInTheDocument();
    });
  });

  it("shows errors for missing civitai version details and failed link searches", async () => {
    mockGetModelDetail.mockResolvedValueOnce(null);

    render(<ModelList initModelList={[]} modelType={ModelType.base} />);
    fireEvent.click(
      screen.getByRole("button", { name: "search version link" }),
    );

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith(MessageMap.Model_NOT_FOUND);
      expect(screen.getByTestId("empty-model-list")).toBeInTheDocument();
    });

    mockGetCivitaiModelDetails.mockRejectedValueOnce(new Error("bad civitai"));
    fireEvent.click(
      screen.getByRole("button", { name: "search civitai link" }),
    );

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith(
        MessageMap.Model_Search_Error,
      );
    });
  });

  it("fetches by base model filter and disables the filter when fixed", async () => {
    const { rerender } = render(
      <ModelList initModelList={[]} modelType={ModelType.base} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "base:all" }));

    await waitFor(() => {
      expect(mockGetModels).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({ base_model: "SDXL" }),
          pageIndex: 0,
        }),
      );
    });

    rerender(
      <ModelList
        fixedBaseModel="SD 1.5"
        initModelList={[]}
        modelType={ModelType.base}
      />,
    );

    expect(screen.getByRole("button", { name: "base:SD 1.5" })).toBeDisabled();
  });
});
