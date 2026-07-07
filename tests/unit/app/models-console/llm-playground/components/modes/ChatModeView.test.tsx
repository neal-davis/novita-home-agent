import { render, screen } from "@testing-library/react";
import { ChatModeView } from "@/app/models-console/llm-playground/components/modes/ChatModeView";

let mockChatLogic: any;
const onClearHistoryChange = jest.fn();
const errorHandler = jest.fn();

jest.mock("@/app/models-console/llm-playground/hooks/useChatLogic", () => ({
  useChatLogic: () => mockChatLogic,
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
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => ({ dedicatedEndpointId: undefined }) }),
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
  mockChatLogic = {
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

describe("ChatModeView", () => {
  it("shows TryModel and input when there are no messages", () => {
    render(<ChatModeView />);
    expect(screen.getByTestId("try-model")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-message")).not.toBeInTheDocument();
  });

  it("shows messages and bottom input once a conversation starts", () => {
    mockChatLogic.messages = [{ id: "1", role: "user", parts: [] }];
    render(<ChatModeView />);
    expect(screen.getByTestId("chat-message")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.queryByTestId("try-model")).not.toBeInTheDocument();
  });

  it("does not show TryModel while streaming even with no messages", () => {
    mockChatLogic.status = "streaming";
    render(<ChatModeView />);
    expect(screen.queryByTestId("try-model")).not.toBeInTheDocument();
  });

  it("registers the clearHistory callback and forwards errors", () => {
    mockChatLogic.error = new Error("x");
    render(<ChatModeView />);
    expect(onClearHistoryChange).toHaveBeenCalledWith(
      mockChatLogic.clearHistory,
    );
    expect(errorHandler).toHaveBeenCalledWith(mockChatLogic.error);
  });
});
