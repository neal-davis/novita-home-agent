import { renderHook } from "@testing-library/react";
import { usePlaygroundState } from "@/app/models-console/llm-playground/hooks/usePlaygroundState";
import { LLMModelFeatures } from "@/types/models";

let mockModel: any;
let mockChatConfig: any;
const getTools = jest.fn();

jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => ({ currentModel: mockModel }) }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({
    useChatConfig: () => ({
      chatConfig: mockChatConfig,
      llmToolsRef: { current: { getTools } },
      apiKey: "key-1",
      enableThinking: true,
    }),
  }),
);

beforeEach(() => {
  getTools.mockReset();
  mockChatConfig = { temperature: 0.7 };
  mockModel = { id: "model-a", features: [] };
});

describe("usePlaygroundState", () => {
  it("builds chat params from model, config and tools", () => {
    getTools.mockReturnValue([{ name: "fn" }]);
    const { result } = renderHook(() => usePlaygroundState());
    const params = result.current.getChatParams();
    expect(params.model).toBe("model-a");
    expect(params.temperature).toBe(0.7);
    expect(params.tools).toEqual([{ name: "fn" }]);
    expect(params.enable_thinking).toBeUndefined();
  });

  it("adds reasoning params only for reasoning models", () => {
    getTools.mockReturnValue([]);
    mockModel = {
      id: "reason-1",
      features: [LLMModelFeatures.Reasoning],
    };
    const { result } = renderHook(() => usePlaygroundState());
    const params = result.current.getChatParams();
    expect(params.isReasoningModel).toBe(true);
    expect(params.enable_thinking).toBe(true);
  });

  it("defaults tools to [] and model to '' when nothing is set", () => {
    getTools.mockReturnValue(undefined);
    mockModel = null;
    const { result } = renderHook(() => usePlaygroundState());
    const params = result.current.getChatParams();
    expect(params.model).toBe("");
    expect(params.tools).toEqual([]);
  });

  it("builds completion options from config and model id", () => {
    const { result } = renderHook(() => usePlaygroundState());
    expect(result.current.getCompletionOptions()).toEqual({
      temperature: 0.7,
      model: "model-a",
    });
  });

  it("exposes apiKey and currentModel passthrough", () => {
    const { result } = renderHook(() => usePlaygroundState());
    expect(result.current.apiKey).toBe("key-1");
    expect(result.current.currentModel).toEqual(mockModel);
  });
});
