import * as providers from "@/app/models-console/llm-playground/providers/index";

jest.mock(
  "@/app/models-console/llm-playground/hooks/useFetchModelList",
  () => ({
    useFetchModelList: () => ({
      modelList: [],
      currentModel: null,
      setCurrentModel: jest.fn(),
      isLoading: false,
      error: null,
    }),
  }),
);
jest.mock("@/lib/hooks/useSelectKeys", () => ({ useSelectKeys: () => [] }));
jest.mock(
  "@/app/models-console/llm-playground/hooks/use-hide-intercom",
  () => ({ useHideIntercom: () => {} }),
);

describe("providers index barrel", () => {
  it("re-exports all providers and hooks", () => {
    expect(typeof providers.ModelProvider).toBe("function");
    expect(typeof providers.useModel).toBe("function");
    expect(typeof providers.ChatConfigProvider).toBe("function");
    expect(typeof providers.useChatConfig).toBe("function");
    expect(typeof providers.UIStateProvider).toBe("function");
    expect(typeof providers.useUIState).toBe("function");
    expect(typeof providers.CombinedProvider).toBe("function");
    expect(typeof providers.usePlayground).toBe("function");
  });
});
