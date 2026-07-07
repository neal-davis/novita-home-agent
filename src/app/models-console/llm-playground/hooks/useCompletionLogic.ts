import { useCompletion } from "./use-completion";
import { useCallback, useState } from "react";
import { useLoginGuard } from "./useLoginGuard";

interface UseCompletionLogicProps {
  apiKey: string;
  chatOptions: Record<string, any>;
  deEndpoint?: string;
}

export function useCompletionLogic({
  apiKey,
  chatOptions,
  deEndpoint,
}: UseCompletionLogicProps) {
  const [submitPrompt, setSubmitPrompt] = useState<string>("");
  const { checkLogin } = useLoginGuard();

  const {
    completion,
    input,
    handleInputChange,
    setInput,
    handleSubmit,
    complete,
    isLoading,
    stop,
    error,
    slaMetrics,
  } = useCompletion({
    api: deEndpoint
      ? `/api/completion?endpoint=${deEndpoint}`
      : "/api/completion",
    body: {
      apiKey: apiKey,
      model: chatOptions.model,
      frequency_penalty: chatOptions.frequency_penalty,
      presence_penalty: chatOptions.presence_penalty,
      repetition_penalty: chatOptions.repetition_penalty,
      min_p: chatOptions.min_p,
      top_k: chatOptions.top_k,
      top_p: chatOptions.top_p,
      temperature: chatOptions.temperature,
      max_tokens: chatOptions.max_tokens,
    },
  });

  const handleSubmitPrompt = useCallback(
    (event?: { preventDefault?: () => void }) => {
      // Check if user is logged in
      if (!checkLogin()) return;
      if (isLoading) return;
      handleSubmit(event);
      setSubmitPrompt(input);
    },
    [checkLogin, handleSubmit, input, isLoading],
  );

  const clearHistory = useCallback(() => {
    setInput("");
    setSubmitPrompt("");
  }, [setInput]);

  return {
    completion,
    input,
    setInput,
    isLoading,
    stopCompletion: stop,
    handleInputChange,
    handleSubmit: handleSubmitPrompt,
    error,
    slaMetrics,
    onRegenerate: complete,
    setSubmitPrompt,
    submitPrompt,
    clearHistory,
  };
}
