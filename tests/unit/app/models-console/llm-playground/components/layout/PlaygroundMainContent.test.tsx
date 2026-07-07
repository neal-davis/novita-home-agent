import { fireEvent, render, screen } from "@testing-library/react";
import { PlaygroundMainContent } from "@/app/models-console/llm-playground/components/layout/PlaygroundMainContent";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";

let mockChatConfig: any;
let mockUIState: any;

jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({ useChatConfig: () => mockChatConfig }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/UIStateProvider",
  () => ({ useUIState: () => mockUIState }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/chat-tab/chatTab",
  () => ({ ChatTab: () => <div data-testid="chat-tab" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/modes/ChatModeView",
  () => ({ ChatModeView: () => <div data-testid="chat-mode" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/modes/CompletionModeView",
  () => ({ CompletionModeView: () => <div data-testid="completion-mode" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/layout/MaxContainerWrappr",
  () => ({ MaxContainerWrapper: ({ children }: any) => <div>{children}</div> }),
);

beforeEach(() => {
  mockChatConfig = {
    chatMode: ChatMode.Chat,
    setChatMode: jest.fn(),
    clearChatHistory: jest.fn(),
  };
  mockUIState = {
    sidebarCollapsed: false,
    setSidebarCollapsed: jest.fn(),
  };
});

describe("PlaygroundMainContent", () => {
  it("renders the chat mode view when in chat mode", () => {
    render(<PlaygroundMainContent />);
    expect(screen.getByTestId("chat-mode")).toBeInTheDocument();
    expect(screen.queryByTestId("completion-mode")).not.toBeInTheDocument();
  });

  it("renders the completion mode view when in completion mode", () => {
    mockChatConfig.chatMode = ChatMode.Completion;
    render(<PlaygroundMainContent />);
    expect(screen.getByTestId("completion-mode")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-mode")).not.toBeInTheDocument();
  });

  it("toggles the sidebar (collapse label when expanded)", () => {
    render(<PlaygroundMainContent />);
    const btn = screen.getByLabelText("Collapse sidebar");
    fireEvent.click(btn);
    expect(mockUIState.setSidebarCollapsed).toHaveBeenCalledWith(true);
  });

  it("shows the expand label and toggles when collapsed", () => {
    mockUIState.sidebarCollapsed = true;
    render(<PlaygroundMainContent />);
    const btn = screen.getByLabelText("Expand sidebar");
    fireEvent.click(btn);
    expect(mockUIState.setSidebarCollapsed).toHaveBeenCalledWith(false);
  });

  it("clears history on the Clear History button", () => {
    render(<PlaygroundMainContent />);
    fireEvent.click(screen.getByLabelText("Clear history"));
    expect(mockChatConfig.clearChatHistory).toHaveBeenCalled();
  });
});
