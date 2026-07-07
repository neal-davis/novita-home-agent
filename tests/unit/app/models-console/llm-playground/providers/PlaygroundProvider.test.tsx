import { render, renderHook, screen } from "@testing-library/react";
import {
  PlaygroundProvider,
  usePlayground,
} from "@/app/models-console/llm-playground/providers/PlaygroundProvider";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";

let mockFetch: any;
const setCurrentModel = jest.fn();
const hideIntercom = jest.fn();
let mockKeys: any = ["key-1"];

jest.mock(
  "@/app/models-console/llm-playground/hooks/useFetchModelList",
  () => ({ useFetchModelList: () => mockFetch }),
);
jest.mock("@/lib/hooks/useSelectKeys", () => ({
  useSelectKeys: () => mockKeys,
}));
jest.mock(
  "@/app/models-console/llm-playground/hooks/use-hide-intercom",
  () => ({ useHideIntercom: () => hideIntercom() }),
);

function Consumer() {
  const ctx = usePlayground();
  return (
    <div>
      <span data-testid="count">{ctx.modelList.length}</span>
      <span data-testid="apiKey">{ctx.apiKey}</span>
      <span data-testid="mode">{ctx.chatMode}</span>
      <span data-testid="detail">{String(ctx.isModelDetailPage)}</span>
      <span data-testid="thinking">{String(ctx.enableThinking)}</span>
      <span data-testid="width">{ctx.chatWidth}</span>
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockKeys = ["key-1"];
  mockFetch = {
    modelList: [],
    currentModel: null,
    setCurrentModel,
    isLoading: false,
    error: null,
  };
});

describe("PlaygroundProvider", () => {
  it("provides default context values and hides intercom", () => {
    mockFetch.modelList = [{ id: "a" }, { id: "b" }];
    render(
      <PlaygroundProvider>
        <Consumer />
      </PlaygroundProvider>,
    );
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByTestId("apiKey")).toHaveTextContent("key-1");
    expect(screen.getByTestId("mode")).toHaveTextContent(ChatMode.Chat);
    expect(screen.getByTestId("detail")).toHaveTextContent("false");
    expect(screen.getByTestId("thinking")).toHaveTextContent("true");
    expect(hideIntercom).toHaveBeenCalled();
  });

  it("falls back to empty apiKey when keys is not an array", () => {
    mockKeys = null;
    render(
      <PlaygroundProvider>
        <Consumer />
      </PlaygroundProvider>,
    );
    expect(screen.getByTestId("apiKey")).toHaveTextContent("");
  });

  it("marks isModelDetailPage true with a defaultModelId and uses chatContainerWidth", () => {
    render(
      <PlaygroundProvider defaultModelId="x" chatContainerWidth={1000}>
        <Consumer />
      </PlaygroundProvider>,
    );
    expect(screen.getByTestId("detail")).toHaveTextContent("true");
    expect(screen.getByTestId("width")).toHaveTextContent("1000");
  });

  it("auto-selects a model matching defaultModelId", () => {
    mockFetch.modelList = [{ id: "openai/gpt-4" }, { id: "meta/llama" }];
    render(
      <PlaygroundProvider defaultModelId="llama">
        <Consumer />
      </PlaygroundProvider>,
    );
    expect(setCurrentModel).toHaveBeenCalled();
    const updater = setCurrentModel.mock.calls[0][0];
    expect(updater(null)).toEqual({ id: "meta/llama" });
    // already-selected same model returns prev unchanged
    expect(updater({ id: "meta/llama" })).toEqual({ id: "meta/llama" });
  });

  it("does not auto-select with a dedicated endpoint", () => {
    mockFetch.modelList = [{ id: "openai/gpt-4" }];
    render(
      <PlaygroundProvider defaultModelId="gpt-4" dedicatedEndpointId="ep">
        <Consumer />
      </PlaygroundProvider>,
    );
    expect(setCurrentModel).not.toHaveBeenCalled();
  });

  it("throws when usePlayground is used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => usePlayground())).toThrow(
      "usePlayground must be used within PlaygroundProvider",
    );
    spy.mockRestore();
  });
});
