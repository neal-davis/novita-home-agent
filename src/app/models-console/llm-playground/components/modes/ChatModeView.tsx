"use client";

import { ChatInput } from "../chat-input/chatInput";
import ChatMessage from "../chat-messages/ui-message";
import { useChatLogic } from "../../hooks/useChatLogic";
import { usePlaygroundState } from "../../hooks/usePlaygroundState";
import { TryModel } from "../try-model/tryModel";
import { useModel } from "../../providers/ModelProvider";
import { useChatConfig } from "../../providers/ChatConfigProvider";
import { useEffect } from "react";
import { usePlaygroundErrorHandler } from "../../hooks/usePlaygroundErrorHandler";
import { MaxContainerWrapper } from "../layout/MaxContainerWrappr";

export function ChatModeView() {
  const { apiKey, getChatParams, llmToolsRef } = usePlaygroundState();
  const { dedicatedEndpointId } = useModel();
  const { onClearHistoryChange } = useChatConfig();

  const {
    messages,
    status,
    regenerate,
    mockToolOutput,
    setMockToolOutput,
    onSaveTool,
    onMockTool,
    sendMessage,
    stopChat,
    clearHistory,
    error,
  } = useChatLogic({
    apiKey,
    deEndpoint: dedicatedEndpointId,
    getChatParams,
  });

  usePlaygroundErrorHandler(error);

  // Register clearHistory callback
  useEffect(() => {
    onClearHistoryChange(clearHistory);
  }, [clearHistory, onClearHistoryChange]);

  const isShowTryModel =
    messages.length === 0 && status !== "submitted" && status !== "streaming";

  return (
    <MaxContainerWrapper className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 pb-4 flex flex-col justify-center items-center">
        {isShowTryModel && (
          <div className="flex flex-col gap-3 items-center m-auto w-full max-w-[700px]">
            <TryModel />
            <ChatInput
              className="shrink-0"
              onSubmit={sendMessage}
              isLoading={false}
              stopChat={stopChat}
            />
          </div>
        )}
        {!isShowTryModel && (
          <ChatMessage
            messages={messages}
            status={status}
            regenerate={regenerate}
            currentTools={llmToolsRef.current?.getTools() || []}
            mockToolOutput={mockToolOutput}
            setMockToolOutput={setMockToolOutput}
            onSaveTool={onSaveTool}
            onMockTool={onMockTool}
          />
        )}
      </div>
      {!isShowTryModel && (
        <ChatInput
          className="shrink-0"
          onSubmit={sendMessage}
          isLoading={status === "submitted" || status === "streaming"}
          stopChat={stopChat}
        />
      )}
    </MaxContainerWrapper>
  );
}
