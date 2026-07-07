import { cn } from "@/lib/utils";
import { ModelCapabilities, ModelFeatures } from "../../types/types";
import { Button, ButtonArrow } from "@/components/ui/button";
import {
  SendHorizontal,
  Square,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Music,
  Video,
  Atom,
} from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { FileUIPart } from "ai";
import { useFileUpload, type UploadedFile } from "../../hooks/useFileUpload";
import { useModel } from "../../providers/ModelProvider";
import { useChatConfig } from "../../providers/ChatConfigProvider";
import { LLMModelFeatures, LLMModelModality } from "@/types/models";
import {
  getModelConstraints,
  type PromptTemplate,
} from "../../types/modelConstraints";
import { PromptTemplateSelector } from "./prompt-template-selector";

interface ChatInputProps {
  className?: string;
  modelInputCapabilities?: ModelCapabilities[];
  modelFeatures?: ModelFeatures[];
  isLoading: boolean;
  onSubmit: (input: string, files: FileUIPart[]) => void;
  stopChat: () => void;
}

const FileTypeIcon = ({ type }: { type: "image" | "audio" | "video" }) => {
  switch (type) {
    case "image":
      return <ImageIcon className="w-4 h-4" />;
    case "audio":
      return <Music className="w-4 h-4" />;
    case "video":
      return <Video className="w-4 h-4" />;
  }
};

interface FilePreviewItemProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
}

const FilePreviewItem = ({ file, onRemove }: FilePreviewItemProps) => {
  return (
    <div className="relative inline-flex flex-col gap-1 border border-common-gray-2 rounded-md p-2 bg-common-gray-3 min-w-[100px]">
      {/* File preview or icon */}
      <div className="relative w-20 h-20 rounded overflow-hidden bg-common-gray-2 flex items-center justify-center">
        {file.fileType === "image" && file.preview ? (
          <img
            src={file.preview}
            alt={file.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FileTypeIcon type={file.fileType} />
        )}

        {/* Upload progress overlay */}
        {file.uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* File name */}
      <div className="text-xs text-common-dark-3 truncate max-w-[100px]">
        {file.file.name}
      </div>

      {/* Upload status */}
      {file.uploading && (
        <div className="text-xs text-common-dark-3">
          Uploading{file.uploadProgress ? ` ${file.uploadProgress}%` : "..."}
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="absolute -top-1 -right-1 w-5 h-5 bg-common-dark-1 rounded-full flex items-center justify-center hover:bg-common-dark-2 transition-colors"
        aria-label="Remove file"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
};

export function ChatInput({
  className,
  isLoading,
  onSubmit,
  stopChat,
}: ChatInputProps) {
  const { currentModel } = useModel();
  const { enableThinking, setEnableThinking, clearChatHistory } =
    useChatConfig();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);

  // Get model constraints
  const modelConstraints = getModelConstraints(currentModel?.id);

  // Check model capabilities for file input
  const supportInputImage =
    currentModel?.inputModalities?.includes(LLMModelModality.Image) ||
    currentModel?.features?.includes(LLMModelFeatures.Vision);
  const supportInputVideo =
    currentModel?.inputModalities?.includes(LLMModelModality.Video) ||
    currentModel?.features?.includes(LLMModelFeatures.Video);
  const supportInputAudio = currentModel?.inputModalities?.includes(
    LLMModelModality.Audio,
  );
  const supportAnyFileInput =
    supportInputImage || supportInputVideo || supportInputAudio;

  // Support Reasoning
  const supportReasoning = currentModel?.features?.includes(
    LLMModelFeatures.Reasoning,
  );

  // Apply model constraints or use default capabilities
  const fileConstraints = modelConstraints?.fileUploadConstraints;

  // Build accepted types based on constraints or model capabilities
  const acceptedTypes = fileConstraints?.acceptedTypes || [
    ...(supportInputImage
      ? ["image/jpeg", "image/jpg", "image/png", "image/webp"]
      : []),
    ...(supportInputVideo ? ["video/mp4"] : []),
    ...(supportInputAudio
      ? ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"]
      : []),
  ];

  // Build file type limits based on constraints or model capabilities
  const fileTypeLimits = fileConstraints?.fileTypeLimits || {
    image: supportInputImage ? 5 : 0,
    audio: supportInputAudio ? 3 : 0,
    video: supportInputVideo ? 1 : 0,
  };

  // Calculate max files
  const maxFiles =
    fileConstraints?.maxFiles ||
    (fileTypeLimits.image || 0) +
      (fileTypeLimits.audio || 0) +
      (fileTypeLimits.video || 0);

  // Initialize file upload hook with limits
  const {
    files,
    removeFile,
    clearFiles,
    openFileDialog,
    fileInputElement,
    isUploading,
    hasFiles,
    getFileTypeCounts,
  } = useFileUpload(textareaRef, {
    maxFiles,
    maxFileSize: fileConstraints?.maxFileSize || 100 * 1024 * 1024, // Default 100MB
    acceptedTypes,
    enablePaste: supportAnyFileInput,
    enableClick: supportAnyFileInput,
    enableDrop: supportAnyFileInput,
    fileTypeLimits,
  });

  // Determine if user input is valid
  const hasValidInput = modelConstraints?.restrictedPrompts
    ? selectedTemplate !== null
    : inputValue.trim() !== "";

  const canSubmit = (hasValidInput || hasFiles) && !isUploading && !isLoading;

  // Handle template selection
  const handleSelectTemplate = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template);
    setInputValue(template.prompt);
  }, []);

  // Reset selected template when model changes
  useEffect(() => {
    setSelectedTemplate(null);
    setInputValue("");
  }, [currentModel?.id]);

  const handleAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const minHeight = 58;
      const maxHeight = 200;
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight <= maxHeight) {
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`;
        textarea.style.overflowY = "hidden";
      } else {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      }
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // If model has restricted prompts and doesn't allow custom input, prevent changes
      if (
        modelConstraints?.restrictedPrompts &&
        !modelConstraints?.allowCustomInput
      ) {
        return;
      }
      setInputValue(e.target.value);
      handleAutoResize();
    },
    [handleAutoResize, modelConstraints],
  );

  useEffect(() => {
    handleAutoResize();
  }, [inputValue, handleAutoResize]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!canSubmit) {
        return;
      }

      if (modelConstraints?.autoClearHistory) {
        // Clear history after a short delay to ensure the current message is added
        clearChatHistory();
      }

      // Convert uploaded files to FileUIPart format
      const fileUIParts: FileUIPart[] = files
        .filter((f) => f.url && !f.uploading)
        .map((f) => ({
          type: "file" as const,
          mediaType: f.file.type,
          url: f.url!,
        }));

      onSubmit(inputValue, fileUIParts);
      setInputValue("");
      setSelectedTemplate(null);
      clearFiles();
      handleAutoResize();
    },
    [
      inputValue,
      files,
      onSubmit,
      handleAutoResize,
      clearFiles,
      canSubmit,
      modelConstraints,
      clearChatHistory,
    ],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        if (!canSubmit) {
          return;
        }

        // Auto clear history if model constraint requires it
        if (modelConstraints?.autoClearHistory) {
          // Clear history after a short delay to ensure the current message is added
          clearChatHistory();
        }

        // Convert uploaded files to FileUIPart format
        const fileUIParts: FileUIPart[] = files
          .filter((f) => f.url && !f.uploading)
          .map((f) => ({
            type: "file" as const,
            mediaType: f.file.type,
            url: f.url!,
          }));

        onSubmit(inputValue, fileUIParts);
        setInputValue("");
        setSelectedTemplate(null);
        clearFiles();
        handleAutoResize();
      }
    },
    [
      inputValue,
      files,
      canSubmit,
      onSubmit,
      handleAutoResize,
      clearFiles,
      modelConstraints,
      clearChatHistory,
    ],
  );

  const handleUploadClick = useCallback(() => {
    openFileDialog();
  }, [openFileDialog]);

  return (
    <div
      className={cn(
        "ring-1 ring-common-gray-1 rounded-xl p-3 w-full focus-within:ring-2 focus-within:ring-[var(--brand-1)]",
        className,
      )}
    >
      {/* Prompt Template Selector */}
      {modelConstraints?.restrictedPrompts &&
        modelConstraints.promptTemplates &&
        modelConstraints.promptTemplates.length > 0 && (
          <div className="mb-3">
            <PromptTemplateSelector
              templates={modelConstraints.promptTemplates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>
        )}

      {/* File preview area */}
      {hasFiles && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file) => (
            <FilePreviewItem key={file.id} file={file} onRemove={removeFile} />
          ))}
        </div>
      )}

      <form className="relative pr-10" onSubmit={handleSubmit}>
        {supportAnyFileInput && fileInputElement}
        <textarea
          name="message"
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          className="w-full resize-none outline-none border-none min-h-[58px] placeholder:text-common-dark-2"
          placeholder={modelConstraints?.inputPlaceholder || "Say something..."}
          rows={1}
          onKeyDown={handleKeyDown}
          disabled={
            modelConstraints?.restrictedPrompts &&
            !modelConstraints?.allowCustomInput
          }
        />
        {(supportAnyFileInput || supportReasoning) && (
          <div className="flex items-center gap-2 mt-2">
            {supportAnyFileInput && (
              <>
                <Button
                  type="button"
                  variant="noborderghost"
                  className="h-auto px-2 py-[6px] bg-common-gray-3 rounded-sm text-common-dark-1 gap-1"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span className="text-sm">Upload Files</span>
                </Button>

                {/* File count indicators */}
                {hasFiles && (
                  <div className="flex items-center gap-2 text-xs text-common-dark-3">
                    {(fileTypeLimits.image || 0) > 0 &&
                      getFileTypeCounts().image > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {getFileTypeCounts().image}/{fileTypeLimits.image}
                        </span>
                      )}
                    {(fileTypeLimits.audio || 0) > 0 &&
                      getFileTypeCounts().audio > 0 && (
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {getFileTypeCounts().audio}/{fileTypeLimits.audio}
                        </span>
                      )}
                    {(fileTypeLimits.video || 0) > 0 &&
                      getFileTypeCounts().video > 0 && (
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {getFileTypeCounts().video}/{fileTypeLimits.video}
                        </span>
                      )}
                  </div>
                )}
              </>
            )}

            {/* Reasoning Switch */}
            {supportReasoning && (
              <Button
                type="button"
                onClick={() => setEnableThinking(!enableThinking)}
                className={cn(
                  "flex items-center gap-1 cursor-pointer transition-colors h-[32px] rounded-lg text-black",
                  enableThinking
                    ? "bg-[var(--brand-2)] border-1 border-[var(--brand-0)]"
                    : "bg-transparent border border-common-gray-1 text-common-dark-2",
                )}
              >
                <Atom size={12} />{" "}
                <span className="text-xs">Enable Thinking</span>
              </Button>
            )}
          </div>
        )}

        {isLoading ? (
          <Button
            type="button"
            variant="noborderghost"
            className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-full bg-common-gray-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopChat();
            }}
          >
            <Square
              className="h-4 w-4 animate-pulse opacity-80"
              fill="var(--dark-1)"
            />
          </Button>
        ) : (
          <Button
            type="submit"
            variant="default"
            className={cn(
              "absolute right-0 top-0",
              !canSubmit && "bg-common-dark-4 !text-white",
            )}
            disabled={!canSubmit}
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
