// replace ai-sdk useCompletion hook
// parse sla_metrics from response

import {
  consumeStream,
  UIMessageChunk,
  uiMessageChunkSchema,
  CompletionRequestOptions,
} from "ai";
import { useCallback, useState, useMemo } from "react";
import { parseJsonEventStream, ParseResult } from "@ai-sdk/provider-utils";
import { throttle } from "lodash";

interface UseCompletionProps {
  api: string;
  throttleMs?: number;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  initialInput?: string;
  onFinish?: ((prompt: string, completion: string) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

export function useCompletion({
  api,
  headers,
  body,
  initialInput,
  onFinish,
  onError,
  throttleMs = 100,
}: UseCompletionProps) {
  const [input, setInput] = useState(initialInput || "");
  const [completion, setCompletion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [slaMetrics, setSlaMetrics] = useState<Record<string, any> | undefined>(
    undefined,
  );

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // 创建持久的 throttled 函数
  const throttledSetCompletion = useMemo(
    () => throttle((value: string) => setCompletion(value), throttleMs),
    [throttleMs],
  );

  const throttledSetSlaMetrics = useMemo(
    () =>
      throttle(
        (metrics: Record<string, any>) => setSlaMetrics(metrics),
        throttleMs,
      ),
    [throttleMs],
  );

  const callCompletionApi = useCallback(
    async (prompt: string, options?: CompletionRequestOptions) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const abortController = new AbortController();
        setAbortController(abortController);

        const body = {
          ...(options?.body || {}),
          prompt,
        };

        // Empty the completion immediately.
        setCompletion("");
        setSlaMetrics(undefined);

        const response = await fetch(api, {
          method: "POST",
          body: JSON.stringify(body),
          signal: abortController.signal,
        }).catch((err) => {
          throw err;
        });

        if (!response.body) {
          throw new Error("The response body is empty.");
        }

        if (!response.ok) {
          throw new Error(
            (await response.text()) ?? "Failed to fetch the chat response.",
          );
        }

        let result = "";

        await consumeStream({
          stream: parseJsonEventStream({
            stream: response.body,
            schema: uiMessageChunkSchema,
          }).pipeThrough(
            new TransformStream<ParseResult<UIMessageChunk>, UIMessageChunk>({
              async transform(part) {
                if (!part.success) {
                  throw part.error;
                }
                const streamPart = part.value;
                if (streamPart.type === "text-delta") {
                  result += streamPart.delta;
                  throttledSetCompletion(result);
                  const meta = streamPart.providerMetadata?.provider;
                  if (meta?.tps && meta?.ttft_ms) {
                    throttledSetSlaMetrics({
                      tps: meta.tps,
                      ttft_ms: meta.ttft_ms,
                    });
                  }
                } else if (streamPart.type === "error") {
                  throw new Error(streamPart.errorText);
                }
              },
            }),
          ),
          onError(error) {
            throw error;
          },
        });

        if (onFinish) {
          onFinish(prompt, result);
        }

        setAbortController(null);

        return result;
      } catch (err) {
        // Ignore abort errors as they are expected.
        if ((err as any).name === "AbortError") {
          setAbortController(null);
          return null;
        }

        if (err instanceof Error) {
          if (onError) {
            onError(err);
          }
        }

        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [api, onFinish, onError, throttledSetCompletion, throttledSetSlaMetrics],
  );

  const triggerRequest = useCallback(
    async (prompt: string, options?: CompletionRequestOptions) => {
      callCompletionApi(prompt, {
        headers: {
          ...headers,
          ...options?.headers,
        },
        body: {
          ...body,
          ...options?.body,
        },
      });
    },
    [callCompletionApi, headers, body],
  );

  const handleInputChange = useCallback(
    (e: any) => {
      setInput(e.target.value);
    },
    [setInput],
  );

  const complete = useCallback(
    async (prompt: string, options?: CompletionRequestOptions) => {
      return triggerRequest(prompt, options);
    },
    [triggerRequest],
  );

  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }, [abortController]);

  const handleSubmit = useCallback(
    (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      return input ? complete(input) : undefined;
    },
    [input, complete],
  );

  return {
    input,
    slaMetrics,
    isLoading,
    error,
    completion,
    setInput,
    handleInputChange,
    handleSubmit,
    complete,
    stop,
  };
}
