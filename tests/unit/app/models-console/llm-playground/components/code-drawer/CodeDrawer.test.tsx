import { fireEvent, render, screen } from "@testing-library/react";
import { CodeDrawer } from "@/app/models-console/llm-playground/components/code-drawer/CodeDrawer";
import { ChatMode } from "@/app/models-console/llm-playground/types/types";
import { message } from "@/components/ui/standard/notify";
import * as codeMod from "@/app/models-console/llm-playground/components/code-drawer/code";

jest.mock(
  "@/app/models-console/llm-playground/components/code-drawer/code",
  () => ({
    curlChatCompletions: jest.fn(() => "curl-chat"),
    jsChatCompletions: jest.fn(() => "js-chat"),
    pythonChatCompletions: jest.fn(() => "py-chat"),
    curlCompletions: jest.fn(() => "curl-comp"),
    jsCompletions: jest.fn(() => "js-comp"),
    pythonCompletions: jest.fn(() => "py-comp"),
    curlResponse: jest.fn(() => "curl-resp"),
    jsResponse: jest.fn(() => "js-resp"),
    pythonResponse: jest.fn(() => "py-resp"),
  }),
);

const codeMocks = codeMod as unknown as Record<string, jest.Mock>;

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children, language }: any) => (
    <pre data-testid="code" data-lang={language}>
      {children}
    </pre>
  ),
}));

jest.mock(
  "react-syntax-highlighter/dist/cjs/styles/prism",
  () => ({ vs: {} }),
  { virtual: true },
);

jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ children, onCopy }: any) => (
    <div data-testid="copy-wrap" onClick={onCopy}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn() },
}));

const model = { id: "m/x" } as any;

function renderDrawer(overrides: Record<string, any> = {}) {
  return render(
    <CodeDrawer
      open={true}
      onOpenChange={jest.fn()}
      model={model}
      chatParams={{ system_content: "sys" }}
      chatMode={ChatMode.Chat}
      {...overrides}
    />,
  );
}

describe("CodeDrawer", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the Chat title and HTTP code by default", () => {
    renderDrawer();
    expect(screen.getByText("Chat Completions API")).toBeInTheDocument();
    expect(screen.getByTestId("code")).toHaveTextContent("curl-chat");
    expect(screen.getByTestId("code")).toHaveAttribute("data-lang", "bash");
  });

  it("switches to Python tab and language", () => {
    renderDrawer();
    fireEvent.click(screen.getByText("Python"));
    expect(codeMocks.pythonChatCompletions).toHaveBeenCalled();
    expect(screen.getByTestId("code")).toHaveAttribute("data-lang", "python");
  });

  it("switches to JavaScript tab and language", () => {
    renderDrawer();
    fireEvent.click(screen.getByText("JavaScript"));
    expect(codeMocks.jsChatCompletions).toHaveBeenCalled();
    expect(screen.getByTestId("code")).toHaveAttribute(
      "data-lang",
      "javascript",
    );
  });

  it("uses completion code generators in Completion mode", () => {
    renderDrawer({ chatMode: ChatMode.Completion });
    expect(screen.getByText("Completions API")).toBeInTheDocument();
    expect(screen.getByTestId("code")).toHaveTextContent("curl-comp");
    fireEvent.click(screen.getByText("Python"));
    expect(codeMocks.pythonCompletions).toHaveBeenCalled();
    fireEvent.click(screen.getByText("JavaScript"));
    expect(codeMocks.jsCompletions).toHaveBeenCalled();
  });

  it("uses response code generators in Response mode", () => {
    renderDrawer({ chatMode: ChatMode.Response });
    expect(screen.getByText("Response API")).toBeInTheDocument();
    expect(screen.getByTestId("code")).toHaveTextContent("curl-resp");
    fireEvent.click(screen.getByText("Python"));
    expect(codeMocks.pythonResponse).toHaveBeenCalled();
    fireEvent.click(screen.getByText("JavaScript"));
    expect(codeMocks.jsResponse).toHaveBeenCalled();
  });

  it("renders empty code when there is no model", () => {
    renderDrawer({ model: null });
    expect(screen.getByTestId("code")).toHaveTextContent("");
    expect(codeMocks.curlChatCompletions).not.toHaveBeenCalled();
  });

  it("shows a success toast when copying", () => {
    renderDrawer();
    fireEvent.click(screen.getByTestId("copy-wrap"));
    expect(message.success).toHaveBeenCalledWith("Copied to clipboard");
  });

  it("handles empty system_content via single-line fallback", () => {
    renderDrawer({ chatParams: {} });
    // params passed include system_content '""' fallback
    const call = codeMocks.curlChatCompletions.mock.calls[0][0];
    expect(call.system_content).toBe('""');
  });
});
