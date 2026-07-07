import { render, screen } from "@testing-library/react";
import { PlaygroundSidebar } from "@/app/models-console/llm-playground/components/layout/PlaygroundSidebar";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";

let mockModel: any;
let mockChatConfig: any;
let mockUIState: any;

jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => mockModel }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({ useChatConfig: () => mockChatConfig }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/UIStateProvider",
  () => ({ useUIState: () => mockUIState }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/chat-options/config",
  () => ({ LLMConfig: () => <div data-testid="llm-config" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/chat-options/tools",
  () => ({
    LLMTools: () => <div data-testid="llm-tools" />,
  }),
);

beforeEach(() => {
  mockModel = { currentModel: { id: "m" }, dedicatedEndpointId: undefined };
  mockChatConfig = {
    chatMode: ChatMode.Chat,
    setChatConfig: jest.fn(),
    llmToolsRef: { current: null },
  };
  mockUIState = { sidebarCollapsed: false };
});

describe("PlaygroundSidebar", () => {
  it("renders config and tools in chat mode", () => {
    render(<PlaygroundSidebar />);
    expect(screen.getByTestId("llm-config")).toBeInTheDocument();
    expect(screen.getByTestId("llm-tools")).toBeInTheDocument();
  });

  it("hides tools in completion mode", () => {
    mockChatConfig.chatMode = ChatMode.Completion;
    render(<PlaygroundSidebar />);
    expect(screen.getByTestId("llm-config")).toBeInTheDocument();
    expect(screen.queryByTestId("llm-tools")).not.toBeInTheDocument();
  });

  it("renders tools in response mode", () => {
    mockChatConfig.chatMode = ChatMode.Response;
    render(<PlaygroundSidebar />);
    expect(screen.getByTestId("llm-tools")).toBeInTheDocument();
  });

  it("renders nothing when the sidebar is collapsed", () => {
    mockUIState.sidebarCollapsed = true;
    const { container } = render(<PlaygroundSidebar />);
    expect(container).toBeEmptyDOMElement();
  });
});
