"use client";

import { useCallback } from "react";
import { useModel } from "../providers/ModelProvider";
import { useChatConfig } from "../providers/ChatConfigProvider";
import { LLMModelFeatures } from "@/types/models";

export function usePlaygroundState() {
  const { currentModel } = useModel();
  const { chatConfig, llmToolsRef, apiKey, enableThinking } = useChatConfig();

  const getChatParams = useCallback(() => {
    const model = currentModel?.id || "";
    const tools = llmToolsRef.current?.getTools() || [];
    const isReasoningModel = currentModel?.features?.includes(
      LLMModelFeatures.Reasoning,
    );

    const params: Record<string, any> = {
      ...chatConfig,
      model: model,
      tools: tools,
    };

    // Only add enable_thinking for reasoning models
    if (isReasoningModel) {
      params.isReasoningModel = true;
      params.enable_thinking = enableThinking;
    }

    return params;
  }, [llmToolsRef, currentModel, chatConfig, enableThinking]);

  const getCompletionOptions = useCallback(() => {
    return {
      ...chatConfig,
      model: currentModel?.id || "",
    };
  }, [chatConfig, currentModel]);

  return {
    apiKey,
    currentModel,
    chatConfig,
    getChatParams,
    getCompletionOptions,
    llmToolsRef,
  };
}
