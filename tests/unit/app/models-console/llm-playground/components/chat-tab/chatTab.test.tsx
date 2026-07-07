import { fireEvent, render, screen } from "@testing-library/react";
import { ChatTab } from "@/app/models-console/llm-playground/components/chat-tab/chatTab";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";

let mockModel: any;
jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => mockModel }),
);

beforeEach(() => {
  mockModel = { currentModel: { id: "m", isCompletion: false } };
});

describe("ChatTab", () => {
  it("shows only the Chat mode for non-completion models", () => {
    render(<ChatTab chatMode={ChatMode.Chat} setChatMode={jest.fn()} />);
    expect(screen.getByText("chat")).toBeInTheDocument();
    expect(screen.queryByText("completion")).not.toBeInTheDocument();
  });

  it("shows the Completion mode when the model supports completions", () => {
    mockModel = {
      currentModel: { id: "m", endpoints: ["completions"] },
    };
    render(<ChatTab chatMode={ChatMode.Chat} setChatMode={jest.fn()} />);
    expect(screen.getByText("completion")).toBeInTheDocument();
  });

  it("calls setChatMode when a mode button is clicked", () => {
    const setChatMode = jest.fn();
    mockModel = { currentModel: { id: "m", isCompletion: true } };
    render(<ChatTab chatMode={ChatMode.Chat} setChatMode={setChatMode} />);
    fireEvent.click(screen.getByText("completion"));
    expect(setChatMode).toHaveBeenCalledWith(ChatMode.Completion);
  });

  it("auto-switches to Chat when current mode is Completion but unsupported", () => {
    const setChatMode = jest.fn();
    mockModel = { currentModel: { id: "m", isCompletion: false } };
    render(
      <ChatTab chatMode={ChatMode.Completion} setChatMode={setChatMode} />,
    );
    expect(setChatMode).toHaveBeenCalledWith(ChatMode.Chat);
  });
});
