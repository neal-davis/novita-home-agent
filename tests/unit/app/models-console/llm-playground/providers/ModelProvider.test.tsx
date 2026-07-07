import { render, renderHook, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import {
  ModelProvider,
  useModel,
} from "@/app/models-console/llm-playground/providers/ModelProvider";

let mockFetch: any;
const setCurrentModel = jest.fn();

jest.mock(
  "@/app/models-console/llm-playground/hooks/useFetchModelList",
  () => ({ useFetchModelList: () => mockFetch }),
);
jest.mock("@/lib/utils", () => ({
  ...jest.requireActual("@/lib/utils"),
  transformModelIdToPath: (id: string) => id.replace(/\//g, "-"),
}));

function Consumer() {
  const { currentModel, modelList, isLoadingModels, isModelDetailPage } =
    useModel();
  return (
    <div>
      <span data-testid="current">{currentModel?.id ?? "none"}</span>
      <span data-testid="count">{modelList.length}</span>
      <span data-testid="loading">{String(isLoadingModels)}</span>
      <span data-testid="detail">{String(isModelDetailPage)}</span>
    </div>
  );
}

beforeEach(() => {
  setCurrentModel.mockClear();
  mockFetch = {
    modelList: [],
    currentModel: null,
    setCurrentModel,
    isLoading: false,
    error: null,
  };
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
});

describe("ModelProvider", () => {
  it("provides model list, loading and detail-page flag", () => {
    mockFetch.modelList = [{ id: "a" }, { id: "b" }];
    mockFetch.isLoading = true;
    render(
      <ModelProvider defaultModelId="a">
        <Consumer />
      </ModelProvider>,
    );
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(screen.getByTestId("detail")).toHaveTextContent("true");
  });

  it("isModelDetailPage is false without a defaultModelId", () => {
    render(
      <ModelProvider>
        <Consumer />
      </ModelProvider>,
    );
    expect(screen.getByTestId("detail")).toHaveTextContent("false");
  });

  it("auto-selects a model matching defaultModelId", () => {
    mockFetch.modelList = [{ id: "openai/gpt-4" }, { id: "meta/llama" }];
    render(
      <ModelProvider defaultModelId="llama">
        <Consumer />
      </ModelProvider>,
    );
    expect(setCurrentModel).toHaveBeenCalled();
    // run the functional updater to see which model it picks
    const updater = setCurrentModel.mock.calls[0][0];
    expect(updater(null)).toEqual({ id: "meta/llama" });
  });

  it("does not auto-select for a dedicated endpoint", () => {
    mockFetch.modelList = [{ id: "openai/gpt-4" }];
    render(
      <ModelProvider defaultModelId="gpt-4" dedicatedEndpointId="ep-1">
        <Consumer />
      </ModelProvider>,
    );
    expect(setCurrentModel).not.toHaveBeenCalled();
  });

  it("throws when useModel is used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useModel())).toThrow(
      "useModel must be used within ModelProvider",
    );
    spy.mockRestore();
  });
});
