"use client";

import { CompletionInput } from "../chat-input/completionInput";
import { UICompletion } from "../chat-messages/ui-completion";
import { useCompletionLogic } from "../../hooks/useCompletionLogic";
import { usePlaygroundState } from "../../hooks/usePlaygroundState";
import { TryModel } from "../try-model/tryModel";
import { useModel } from "../../providers/ModelProvider";
import { useChatConfig } from "../../providers/ChatConfigProvider";
import { useEffect } from "react";
import { usePlaygroundErrorHandler } from "../../hooks/usePlaygroundErrorHandler";
import { MaxContainerWrapper } from "../layout/MaxContainerWrappr";

export function CompletionModeView() {
  const { apiKey, getCompletionOptions } = usePlaygroundState();
  const { dedicatedEndpointId } = useModel();
  const { onClearHistoryChange } = useChatConfig();

  const {
    completion,
    input,
    handleInputChange,
    setInput,
    handleSubmit,
    isLoading,
    stopCompletion,
    slaMetrics,
    onRegenerate,
    submitPrompt,
    error,
    clearHistory,
  } = useCompletionLogic({
    apiKey,
    chatOptions: getCompletionOptions(),
    deEndpoint: dedicatedEndpointId,
  });

  usePlaygroundErrorHandler(error);

  // Register clearHistory callback
  useEffect(() => {
    onClearHistoryChange(clearHistory);
  }, [clearHistory, onClearHistoryChange]);

  const isShowTryModel = completion.length === 0 && !isLoading;

  return (
    <MaxContainerWrapper className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 pb-4 flex flex-col justify-center items-center">
        {isShowTryModel && (
          <div className="flex flex-col gap-3 items-center m-auto w-full max-w-[700px]">
            <TryModel />
            <CompletionInput
              input={input}
              handleInputChange={handleInputChange}
              isLoading={false}
              handleSubmit={handleSubmit}
              className="shrink-0"
              setInput={setInput}
              stopCompletion={stopCompletion}
            />
          </div>
        )}
        {!isShowTryModel && (
          <UICompletion
            isLoading={isLoading}
            completion={completion}
            slaMetrics={slaMetrics}
            onRegenerate={() => {
              onRegenerate(input);
            }}
            submitPrompt={submitPrompt}
          />
        )}
      </div>
      {!isShowTryModel && (
        <CompletionInput
          input={input}
          handleInputChange={handleInputChange}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          className="shrink-0"
          setInput={setInput}
          stopCompletion={stopCompletion}
        />
      )}
    </MaxContainerWrapper>
  );
}
