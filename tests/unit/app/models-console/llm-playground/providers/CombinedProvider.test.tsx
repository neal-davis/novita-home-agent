import { render, renderHook, screen } from "@testing-library/react";
import {
  CombinedProvider,
  usePlayground,
} from "@/app/models-console/llm-playground/providers/CombinedProvider";

let mockFetch: any;
const setCurrentModel = jest.fn();
const hideIntercom = jest.fn();

jest.mock(
  "@/app/models-console/llm-playground/hooks/useFetchModelList",
  () => ({ useFetchModelList: () => mockFetch }),
);
jest.mock("@/lib/hooks/useSelectKeys", () => ({
  useSelectKeys: () => ["k1"],
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
    </div>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch = {
    modelList: [{ id: "a" }],
    currentModel: null,
    setCurrentModel,
    isLoading: false,
    error: null,
  };
});

describe("CombinedProvider", () => {
  it("composes all providers and exposes a merged context", () => {
    render(
      <CombinedProvider>
        <Consumer />
      </CombinedProvider>,
    );
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("apiKey")).toHaveTextContent("k1");
    expect(screen.getByTestId("mode")).toHaveTextContent("chat");
  });

  it("renders the intercom handler which hides intercom", () => {
    render(
      <CombinedProvider chatContainerWidth={500} defaultModelId="a">
        <Consumer />
      </CombinedProvider>,
    );
    expect(hideIntercom).toHaveBeenCalled();
  });

  it("throws when usePlayground is used outside the providers", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => usePlayground())).toThrow();
    spy.mockRestore();
  });
});
