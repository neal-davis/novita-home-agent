import { render, screen } from "@testing-library/react";
import { CompletionModeView } from "@/app/models-console/llm-playground/components/modes/CompletionModeView";

let mockCompletionLogic: any;
const onClearHistoryChange = jest.fn();
const errorHandler = jest.fn();

jest.mock(
  "@/app/models-console/llm-playground/hooks/useCompletionLogic",
  () => ({ useCompletionLogic: () => mockCompletionLogic }),
);
jest.mock(
  "@/app/models-console/llm-playground/hooks/usePlaygroundState",
  () => ({
    usePlaygroundState: () => ({
      apiKey: "k",
      getCompletionOptions: () => ({}),
    }),
  }),
);
jest.mock(
  "@/app/models-console/llm-playground/hooks/usePlaygroundErrorHandler",
  () => ({ usePlaygroundErrorHandler: (e: any) => errorHandler(e) }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => ({ dedicatedEndpointId: undefined }) }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({ useChatConfig: () => ({ onClearHistoryChange }) }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/chat-input/completionInput",
  () => ({ CompletionInput: () => <div data-testid="completion-input" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/chat-messages/ui-completion",
  () => ({ UICompletion: () => <div data-testid="ui-completion" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/try-model/tryModel",
  () => ({ TryModel: () => <div data-testid="try-model" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/layout/MaxContainerWrappr",
  () => ({ MaxContainerWrapper: ({ children }: any) => <div>{children}</div> }),
);

beforeEach(() => {
  jest.clearAllMocks();
  mockCompletionLogic = {
    completion: "",
    input: "",
    handleInputChange: jest.fn(),
    setInput: jest.fn(),
    handleSubmit: jest.fn(),
    isLoading: false,
    stopCompletion: jest.fn(),
    slaMetrics: null,
    onRegenerate: jest.fn(),
    submitPrompt: jest.fn(),
    error: null,
    clearHistory: jest.fn(),
  };
});

describe("CompletionModeView", () => {
  it("shows TryModel and input when there is no completion", () => {
    render(<CompletionModeView />);
    expect(screen.getByTestId("try-model")).toBeInTheDocument();
    expect(screen.getByTestId("completion-input")).toBeInTheDocument();
    expect(screen.queryByTestId("ui-completion")).not.toBeInTheDocument();
  });

  it("shows the completion view once there is output", () => {
    mockCompletionLogic.completion = "result text";
    render(<CompletionModeView />);
    expect(screen.getByTestId("ui-completion")).toBeInTheDocument();
    expect(screen.queryByTestId("try-model")).not.toBeInTheDocument();
  });

  it("hides TryModel while loading even with empty completion", () => {
    mockCompletionLogic.isLoading = true;
    render(<CompletionModeView />);
    expect(screen.queryByTestId("try-model")).not.toBeInTheDocument();
  });

  it("registers clearHistory and forwards errors", () => {
    mockCompletionLogic.error = new Error("e");
    render(<CompletionModeView />);
    expect(onClearHistoryChange).toHaveBeenCalledWith(
      mockCompletionLogic.clearHistory,
    );
    expect(errorHandler).toHaveBeenCalledWith(mockCompletionLogic.error);
  });
});
