"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { ChatMode } from "../types/types";
import { LLMToolsRef } from "../components/chat-options/tools";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";

interface ChatConfigContextValue {
  // Chat mode
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;

  // Chat configuration
  chatConfig: Record<string, any>;
  setChatConfig: (config: Record<string, any>) => void;

  // Tools
  llmToolsRef: React.RefObject<LLMToolsRef>;

  // API Key
  apiKey: string;

  // Reasoning/Thinking
  enableThinking: boolean;
  setEnableThinking: (enabled: boolean) => void;

  // Chat history management
  clearChatHistory: () => void;
  onClearHistoryChange: (callback: () => void) => void;
}

const ChatConfigContext = createContext<ChatConfigContextValue | null>(null);

interface ChatConfigProviderProps {
  children: ReactNode;
}

export function ChatConfigProvider({ children }: ChatConfigProviderProps) {
  const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.Chat);
  const [chatConfig, setChatConfig] = useState<Record<string, any>>({});
  const [enableThinking, setEnableThinking] = useState(true);
  const llmToolsRef = useRef<LLMToolsRef>(null);
  const clearHistoryCallbackRef = useRef<(() => void) | null>(null);

  const keys = useSelectKeys();
  const apiKey = Array.isArray(keys) ? keys[0] : "";

  const clearChatHistory = useCallback(() => {
    clearHistoryCallbackRef.current?.();
  }, []);

  const onClearHistoryChange = useCallback((callback: () => void) => {
    clearHistoryCallbackRef.current = callback;
  }, []);

  const value: ChatConfigContextValue = {
    chatMode,
    setChatMode,
    chatConfig,
    setChatConfig,
    llmToolsRef,
    apiKey,
    enableThinking,
    setEnableThinking,
    clearChatHistory,
    onClearHistoryChange,
  };

  return (
    <ChatConfigContext.Provider value={value}>
      {children}
    </ChatConfigContext.Provider>
  );
}

export function useChatConfig() {
  const context = useContext(ChatConfigContext);
  if (!context) {
    throw new Error("useChatConfig must be used within ChatConfigProvider");
  }
  return context;
}
