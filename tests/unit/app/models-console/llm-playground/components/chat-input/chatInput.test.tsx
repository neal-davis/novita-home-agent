import { fireEvent, render, screen } from "@testing-library/react";
import { ChatInput } from "@/app/models-console/llm-playground/components/chat-input/chatInput";
import { LLMModelFeatures, LLMModelModality } from "@/types/models";

const mockUseModel = jest.fn();
const mockUseChatConfig = jest.fn();
const mockUseFileUpload = jest.fn();

jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({
    useModel: () => mockUseModel(),
  }),
);

jest.mock(
  "@/app/models-console/llm-playground/providers/ChatConfigProvider",
  () => ({
    useChatConfig: () => mockUseChatConfig(),
  }),
);

jest.mock("@/app/models-console/llm-playground/hooks/useFileUpload", () => ({
  useFileUpload: (...args: any[]) => mockUseFileUpload(...args),
}));

function baseFileUpload(overrides: Record<string, any> = {}) {
  return {
    files: [],
    removeFile: jest.fn(),
    clearFiles: jest.fn(),
    openFileDialog: jest.fn(),
    fileInputElement: <input data-testid="file-input" />,
    isUploading: false,
    hasFiles: false,
    getFileTypeCounts: () => ({ image: 0, audio: 0, video: 0 }),
    ...overrides,
  };
}

function setup({
  model = null as any,
  config = {} as Record<string, any>,
  fileUpload = {} as Record<string, any>,
  props = {} as Record<string, any>,
} = {}) {
  mockUseModel.mockReturnValue({ currentModel: model });
  mockUseChatConfig.mockReturnValue({
    enableThinking: false,
    setEnableThinking: jest.fn(),
    clearChatHistory: jest.fn(),
    ...config,
  });
  const fu = baseFileUpload(fileUpload);
  mockUseFileUpload.mockReturnValue(fu);
  const onSubmit = jest.fn();
  const stopChat = jest.fn();
  const utils = render(
    <ChatInput
      isLoading={false}
      onSubmit={onSubmit}
      stopChat={stopChat}
      {...props}
    />,
  );
  return { onSubmit, stopChat, fu, config, ...utils };
}

describe("ChatInput", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the textarea and disables submit when input is empty", () => {
    setup();
    const submit = screen.getByRole("button");
    expect(submit).toBeDisabled();
    expect(screen.getByPlaceholderText("Say something...")).toBeInTheDocument();
  });

  it("enables submit when text is typed and calls onSubmit on form submit", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const submit = screen.getByRole("button");
    expect(submit).not.toBeDisabled();
    fireEvent.submit(textarea.closest("form")!);
    expect(onSubmit).toHaveBeenCalledWith("hello", []);
  });

  it("submits on Enter key without shift and clears input", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.change(textarea, { target: { value: "via enter" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).toHaveBeenCalledWith("via enter", []);
  });

  it("does not submit on Shift+Enter", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.change(textarea, { target: { value: "keep typing" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when canSubmit is false (empty input)", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows upload button and file count indicators for image-capable models", () => {
    setup({
      model: {
        id: "vision-model",
        inputModalities: [LLMModelModality.Image],
        features: [],
      },
      fileUpload: {
        hasFiles: true,
        files: [
          {
            id: "f1",
            file: { name: "a.png", type: "image/png" },
            fileType: "image",
            preview: "data:image/png;base64,x",
            url: "https://x/a.png",
            uploading: false,
          },
        ],
        getFileTypeCounts: () => ({ image: 1, audio: 0, video: 0 }),
      },
    });
    expect(screen.getByText("Upload Files")).toBeInTheDocument();
    expect(screen.getByText("a.png")).toBeInTheDocument();
    // image count indicator shows 1/5
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("opens the file dialog when upload button clicked", () => {
    const openFileDialog = jest.fn();
    setup({
      model: {
        id: "vision-model",
        inputModalities: [LLMModelModality.Image],
        features: [],
      },
      fileUpload: { openFileDialog },
    });
    fireEvent.click(screen.getByText("Upload Files"));
    expect(openFileDialog).toHaveBeenCalled();
  });

  it("renders a spinner and disables upload while uploading, blocking submit", () => {
    const { onSubmit } = setup({
      model: {
        id: "vision-model",
        inputModalities: [LLMModelModality.Image],
        features: [],
      },
      fileUpload: { isUploading: true, hasFiles: true },
    });
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.change(textarea, { target: { value: "x" } });
    // submit blocked because isUploading
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("toggles thinking for reasoning-capable models", () => {
    const setEnableThinking = jest.fn();
    setup({
      model: { id: "r-model", features: [LLMModelFeatures.Reasoning] },
      config: { enableThinking: false, setEnableThinking },
    });
    fireEvent.click(screen.getByText("Enable Thinking"));
    expect(setEnableThinking).toHaveBeenCalledWith(true);
  });

  it("only sends uploaded (non-uploading, url-present) files on submit", () => {
    const { onSubmit } = setup({
      model: {
        id: "vision-model",
        inputModalities: [LLMModelModality.Image],
        features: [],
      },
      fileUpload: {
        hasFiles: true,
        files: [
          {
            id: "ready",
            file: { name: "ok.png", type: "image/png" },
            fileType: "image",
            url: "https://x/ok.png",
            uploading: false,
          },
          {
            id: "pending",
            file: { name: "no.png", type: "image/png" },
            fileType: "image",
            url: undefined,
            uploading: true,
          },
        ],
        getFileTypeCounts: () => ({ image: 2, audio: 0, video: 0 }),
      },
    });
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.change(textarea, { target: { value: "files" } });
    fireEvent.submit(textarea.closest("form")!);
    expect(onSubmit).toHaveBeenCalledWith("files", [
      { type: "file", mediaType: "image/png", url: "https://x/ok.png" },
    ]);
  });

  it("renders stop button when loading and calls stopChat", () => {
    const stopChat = jest.fn();
    mockUseModel.mockReturnValue({ currentModel: null });
    mockUseChatConfig.mockReturnValue({
      enableThinking: false,
      setEnableThinking: jest.fn(),
      clearChatHistory: jest.fn(),
    });
    mockUseFileUpload.mockReturnValue(baseFileUpload());
    render(
      <ChatInput isLoading={true} onSubmit={jest.fn()} stopChat={stopChat} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(stopChat).toHaveBeenCalled();
  });

  it("clears history on submit for autoClearHistory models (deepseek-ocr) and uses template selection", () => {
    const clearChatHistory = jest.fn();
    const onSubmit = jest.fn();
    mockUseModel.mockReturnValue({
      currentModel: { id: "deepseek/deepseek-ocr", features: [] },
    });
    mockUseChatConfig.mockReturnValue({
      enableThinking: false,
      setEnableThinking: jest.fn(),
      clearChatHistory,
    });
    mockUseFileUpload.mockReturnValue(baseFileUpload());
    render(
      <ChatInput isLoading={false} onSubmit={onSubmit} stopChat={jest.fn()} />,
    );
    // restricted prompt placeholder
    expect(
      screen.getByPlaceholderText("Select a prompt template for OCR..."),
    ).toBeInTheDocument();
    // selecting a template enables submit
    fireEvent.click(screen.getByText("Select a prompt template"));
    fireEvent.click(screen.getByText("<|grounding|>OCR this image."));
    fireEvent.submit(
      screen
        .getByPlaceholderText("Select a prompt template for OCR...")
        .closest("form")!,
    );
    expect(clearChatHistory).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });
});
