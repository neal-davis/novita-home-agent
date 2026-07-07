import { act, renderHook } from "@testing-library/react";
import { useCompletionLogic } from "@/app/models-console/llm-playground/hooks/useCompletionLogic";

const completionApi = {
  completion: "result text",
  input: "my prompt",
  handleInputChange: jest.fn(),
  setInput: jest.fn(),
  handleSubmit: jest.fn(),
  complete: jest.fn(),
  isLoading: false,
  stop: jest.fn(),
  error: undefined,
  slaMetrics: { tps: 1 },
};

let lastCompletionConfig: any;
jest.mock("@/app/models-console/llm-playground/hooks/use-completion", () => ({
  useCompletion: (config: any) => {
    lastCompletionConfig = config;
    return completionApi;
  },
}));

let checkLoginResult = true;
jest.mock("@/app/models-console/llm-playground/hooks/useLoginGuard", () => ({
  useLoginGuard: () => ({ checkLogin: () => checkLoginResult }),
}));

const chatOptions = {
  model: "c-model",
  temperature: 0.8,
  max_tokens: 256,
  top_p: 0.9,
};

beforeEach(() => {
  jest.clearAllMocks();
  checkLoginResult = true;
  completionApi.isLoading = false;
});

describe("useCompletionLogic", () => {
  it("configures the /api/completion endpoint with chat options in the body", () => {
    renderHook(() => useCompletionLogic({ apiKey: "k", chatOptions }));
    expect(lastCompletionConfig.api).toBe("/api/completion");
    expect(lastCompletionConfig.body).toMatchObject({
      apiKey: "k",
      model: "c-model",
      temperature: 0.8,
      max_tokens: 256,
    });
  });

  it("uses the dedicated endpoint URL when deEndpoint is provided", () => {
    renderHook(() =>
      useCompletionLogic({ apiKey: "k", chatOptions, deEndpoint: "ep-9" }),
    );
    expect(lastCompletionConfig.api).toBe("/api/completion?endpoint=ep-9");
  });

  it("passes through completion text, input and slaMetrics", () => {
    const { result } = renderHook(() =>
      useCompletionLogic({ apiKey: "k", chatOptions }),
    );
    expect(result.current.completion).toBe("result text");
    expect(result.current.input).toBe("my prompt");
    expect(result.current.slaMetrics).toEqual({ tps: 1 });
  });

  it("submits the prompt and records it when logged in and idle", () => {
    const { result } = renderHook(() =>
      useCompletionLogic({ apiKey: "k", chatOptions }),
    );
    act(() => result.current.handleSubmit());
    expect(completionApi.handleSubmit).toHaveBeenCalled();
    expect(result.current.submitPrompt).toBe("my prompt");
  });

  it("does not submit when not logged in", () => {
    checkLoginResult = false;
    const { result } = renderHook(() =>
      useCompletionLogic({ apiKey: "k", chatOptions }),
    );
    act(() => result.current.handleSubmit());
    expect(completionApi.handleSubmit).not.toHaveBeenCalled();
  });

  it("does not submit while loading", () => {
    completionApi.isLoading = true;
    const { result } = renderHook(() =>
      useCompletionLogic({ apiKey: "k", chatOptions }),
    );
    act(() => result.current.handleSubmit());
    expect(completionApi.handleSubmit).not.toHaveBeenCalled();
  });

  it("clearHistory resets the input and submitted prompt", () => {
    const { result } = renderHook(() =>
      useCompletionLogic({ apiKey: "k", chatOptions }),
    );
    act(() => result.current.clearHistory());
    expect(completionApi.setInput).toHaveBeenCalledWith("");
    expect(result.current.submitPrompt).toBe("");
  });
});
