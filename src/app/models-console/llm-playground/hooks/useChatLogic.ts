import { FunctionDefinition } from "@/app/api/type";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, FileUIPart } from "ai";
import { useCallback, useState } from "react";
import { useLoginGuard } from "./useLoginGuard";
import { useSearchParams } from "next/navigation";

interface UseChatLogicProps {
  apiKey: string;
  deEndpoint?: string;
  getChatParams?: () => Record<string, any>;
}

export function useChatLogic({
  apiKey,
  deEndpoint,
  getChatParams,
}: UseChatLogicProps) {
  const [mockToolOutput, setMockToolOutput] = useState<string>("");
  const { checkLogin } = useLoginGuard();
  const search = useSearchParams();
  const endpoint = search.get("endpoint");

  const {
    messages,
    error,
    setMessages,
    stop,
    sendMessage: originalSendMessage,
    status,
    regenerate: originalRegenerate,
    addToolResult,
  } = useChat({
    transport: new DefaultChatTransport({
      api: deEndpoint ? `/api/chat?endpoint=${endpoint}` : "/api/chat",
      body: {
        apiKey,
      },
    }),
  });

  const sendMessage = useCallback(
    (input: string, files: FileUIPart[]) => {
      // Check if user is logged in
      if (!checkLogin()) return;

      const params = getChatParams?.() || {};
      originalSendMessage(
        {
          text: input,
          files: files,
        },
        {
          body: {
            ...params,
          },
        },
      );
    },
    [checkLogin, getChatParams, originalSendMessage],
  );

  const regenerate = useCallback(
    (messageId: string) => {
      // Check if user is logged in
      if (!checkLogin()) return;
      if (status === "streaming") return;

      const params = getChatParams?.() || {};
      originalRegenerate({
        messageId,
        body: {
          ...params,
        },
      });
    },
    [checkLogin, originalRegenerate, getChatParams, status],
  );

  const onSaveTool = useCallback(
    (tool: string, toolCallId: string) => {
      let result = null;
      try {
        const parsed = JSON.parse(mockToolOutput);
        result = parsed;
      } catch (error) {
        result = mockToolOutput;
      }
      addToolResult({
        tool: tool,
        toolCallId: toolCallId,
        output: result,
      });
      const params = getChatParams?.() || {};
      originalSendMessage(undefined, {
        body: {
          ...params,
          enable_thinking: false,
        },
      });
      setMockToolOutput("");
    },
    [mockToolOutput, addToolResult, originalSendMessage, getChatParams],
  );

  const onMockTool = useCallback(
    async (tool: FunctionDefinition, parameters: Record<string, any>) => {
      try {
        const result = await fetch("/api/tool-mock", {
          method: "POST",
          body: JSON.stringify({
            functionDefinition: tool,
            parameters: parameters,
            apiKey,
          }),
        });
        const data = await result.json();
        setMockToolOutput(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error(error);
      }
    },
    [apiKey],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return {
    status,
    mockToolOutput,
    messages,
    error,

    sendMessage,
    regenerate,
    stopChat: stop,
    clearHistory,
    addToolResult,
    setMockToolOutput,
    onSaveTool,
    onMockTool,
  };
}
