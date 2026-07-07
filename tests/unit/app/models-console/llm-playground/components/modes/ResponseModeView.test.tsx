import { render, screen } from "@testing-library/react";
import { ResponseModeView } from "@/app/models-console/llm-playground/components/modes/ResponseModeView";

let mockResponseLogic: any;
const onClearHistoryChange = jest.fn();
const errorHandler = jest.fn();

jest.mock("@/app/models-console/llm-playground/hooks/useResponseLogic", () => ({
  useResponseLogic: () => mockResponseLogic,
}));
jest.mock(
  "@/app/models-console/llm-playground/hooks/usePlaygroundState",
  () => ({
    usePlaygroundState: () => ({
      apiKey: "k",
      getChatParams: jest.fn(),
      llmToolsRef: { current: { getTools: () => [] } },
    }),
  }),
);
jest.mock(
  "@/app/models-console/llm-playground/hooks/usePlaygroundErrorHandler",
  () => ({ usePlaygroundErrorHandler: (e: any) => errorHandler(e) }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({ useChatConfig: () => ({ onClearHistoryChange }) }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/chat-input/chatInput",
  () => ({ ChatInput: () => <div data-testid="chat-input" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/chat-messages/ui-message",
  () => ({
    __esModule: true,
    default: () => <div data-testid="chat-message" />,
  }),
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
  mockResponseLogic = {
    messages: [],
    status: "ready",
    regenerate: jest.fn(),
    mockToolOutput: "",
    setMockToolOutput: jest.fn(),
    onSaveTool: jest.fn(),
    onMockTool: jest.fn(),
    sendMessage: jest.fn(),
    stopChat: jest.fn(),
    clearHistory: jest.fn(),
    error: null,
  };
});

describe("ResponseModeView", () => {
  it("shows TryModel and input when empty", () => {
    render(<ResponseModeView />);
    expect(screen.getByTestId("try-model")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });

  it("shows messages once a conversation starts", () => {
    mockResponseLogic.messages = [{ id: "1", role: "user", parts: [] }];
    render(<ResponseModeView />);
    expect(screen.getByTestId("chat-message")).toBeInTheDocument();
    expect(screen.queryByTestId("try-model")).not.toBeInTheDocument();
  });

  it("registers clearHistory and forwards errors", () => {
    mockResponseLogic.error = new Error("e");
    render(<ResponseModeView />);
    expect(onClearHistoryChange).toHaveBeenCalledWith(
      mockResponseLogic.clearHistory,
    );
    expect(errorHandler).toHaveBeenCalledWith(mockResponseLogic.error);
  });
});
