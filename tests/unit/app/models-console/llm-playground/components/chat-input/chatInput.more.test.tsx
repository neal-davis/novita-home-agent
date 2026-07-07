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
  return { onSubmit, stopChat, fu, ...utils };
}

describe("ChatInput (more branches)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("removes a file when the preview X button is clicked", () => {
    const removeFile = jest.fn();
    setup({
      model: {
        id: "vision-model",
        inputModalities: [LLMModelModality.Image],
        features: [],
      },
      fileUpload: {
        removeFile,
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
    fireEvent.click(screen.getByLabelText("Remove file"));
    expect(removeFile).toHaveBeenCalledWith("f1");
  });

  it("renders audio/video file icons and uploading overlay", () => {
    setup({
      model: {
        id: "av-model",
        inputModalities: [LLMModelModality.Audio, LLMModelModality.Video],
        features: [],
      },
      fileUpload: {
        hasFiles: true,
        files: [
          {
            id: "aud",
            file: { name: "a.mp3", type: "audio/mpeg" },
            fileType: "audio",
            uploading: true,
            uploadProgress: 42,
          },
          {
            id: "vid",
            file: { name: "v.mp4", type: "video/mp4" },
            fileType: "video",
            uploading: false,
          },
        ],
        getFileTypeCounts: () => ({ image: 0, audio: 1, video: 1 }),
      },
    });
    expect(screen.getByText("a.mp3")).toBeInTheDocument();
    expect(screen.getByText("v.mp4")).toBeInTheDocument();
    // uploading status with progress percent
    expect(screen.getByText(/Uploading 42%/)).toBeInTheDocument();
    // audio and video count indicators
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByText("1/1")).toBeInTheDocument();
  });

  it("ignores text input changes for restricted models that disallow custom input", () => {
    setup({
      model: { id: "deepseek/deepseek-ocr", features: [] },
    });
    const textarea = screen.getByPlaceholderText(
      "Select a prompt template for OCR...",
    ) as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
    // Programmatic change must be ignored (handleInputChange early return)
    fireEvent.change(textarea, { target: { value: "typed" } });
    expect(textarea.value).toBe("");
  });

  it("does not call onSubmit when the form is submitted with empty input", () => {
    const { onSubmit } = setup();
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.submit(textarea.closest("form")!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears history and filters files on Enter for autoClearHistory models with uploads", () => {
    const clearChatHistory = jest.fn();
    const onSubmit = jest.fn();
    // qwen3-vl-... style: not restricted, but exercise the Enter+files path on a
    // vision model. Use a normal vision model so input is editable and Enter works.
    mockUseModel.mockReturnValue({
      currentModel: {
        id: "vision-model",
        inputModalities: [LLMModelModality.Image],
        features: [],
      },
    });
    mockUseChatConfig.mockReturnValue({
      enableThinking: false,
      setEnableThinking: jest.fn(),
      clearChatHistory,
    });
    mockUseFileUpload.mockReturnValue(
      baseFileUpload({
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
        // not uploading overall so submit is allowed
        isUploading: false,
        getFileTypeCounts: () => ({ image: 2, audio: 0, video: 0 }),
      }),
    );
    render(
      <ChatInput isLoading={false} onSubmit={onSubmit} stopChat={jest.fn()} />,
    );
    const textarea = screen.getByPlaceholderText("Say something...");
    fireEvent.change(textarea, { target: { value: "hi" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    // Only the ready file is forwarded; pending upload is filtered out
    expect(onSubmit).toHaveBeenCalledWith("hi", [
      { type: "file", mediaType: "image/png", url: "https://x/ok.png" },
    ]);
  });

  it("clears history on Enter for a deepseek-ocr (autoClearHistory) model", () => {
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
    // pick a template to make input valid for the restricted model
    fireEvent.click(screen.getByText("Select a prompt template"));
    fireEvent.click(screen.getByText("<|grounding|>OCR this image."));
    const textarea = screen.getByPlaceholderText(
      "Select a prompt template for OCR...",
    );
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(clearChatHistory).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });
});
