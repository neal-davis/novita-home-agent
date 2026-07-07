"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChatMode } from "../types/types";
import { useFetchModelList } from "../hooks/useFetchModelList";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import { useHideIntercom } from "../hooks/use-hide-intercom";
import { LLMToolsRef } from "../components/chat-options/tools";
import { LLMModelWithStatus } from "@/types/models";

const Chat_Width = {
  NoLimit: 0,
  WindowMax: 1000,
};

export interface ClearHistoryRef {
  clearHistory: () => void;
}

interface PlaygroundContextValue {
  // Model related
  modelList: LLMModelWithStatus[];
  currentModel: LLMModelWithStatus | null;
  setCurrentModel: (model: any) => void;
  isLoadingModels: boolean;
  modelError: Error | null;

  // Dedicated endpoint
  dedicatedEndpointId?: string;

  // Mode: whether this is a model detail page (has defaultModelId)
  isModelDetailPage: boolean;

  // Chat mode
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;

  // Config
  chatConfig: Record<string, any>;
  setChatConfig: (config: Record<string, any>) => void;

  // Tools
  llmToolsRef: React.RefObject<LLMToolsRef>;

  // API Key
  apiKey: string;

  // Code drawer
  codeDrawerOpen: boolean;
  setCodeDrawerOpen: (open: boolean) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Clear history
  clearHistoryRef: React.RefObject<ClearHistoryRef>;

  // Reasoning
  enableThinking: boolean;
  setEnableThinking: (enabled: boolean) => void;

  // Chat width
  chatWidth: number;
  setChatWidth: (width: number) => void;
}

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

export function PlaygroundProvider({
  children,
  defaultModelId,
  chatContainerWidth,
  dedicatedEndpointId,
}: {
  children: React.ReactNode;
} & PlaygroundConfig) {
  const { modelList, currentModel, setCurrentModel, isLoading, error } =
    useFetchModelList({ dedicatedEndpointId });
  const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.Chat);
  const [chatConfig, setChatConfig] = useState<Record<string, any>>({});
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [enableThinking, setEnableThinking] = useState(true);
  const [chatWidth, setChatWidth] = useState(Chat_Width.NoLimit);
  const llmToolsRef = useRef<LLMToolsRef>(null);
  const clearHistoryRef = useRef<ClearHistoryRef>(null);
  const keys = useSelectKeys();
  const apiKey = Array.isArray(keys) ? keys[0] : "";

  useHideIntercom();

  const value: PlaygroundContextValue = useMemo(
    () => ({
      modelList,
      currentModel,
      setCurrentModel,
      isLoadingModels: isLoading,
      modelError: error,
      dedicatedEndpointId,
      isModelDetailPage: !!defaultModelId,
      chatMode,
      setChatMode,
      chatConfig,
      setChatConfig,
      llmToolsRef,
      apiKey,
      codeDrawerOpen,
      setCodeDrawerOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      clearHistoryRef,
      enableThinking,
      setEnableThinking,
      chatWidth,
      setChatWidth,
    }),
    [
      modelList,
      currentModel,
      setCurrentModel,
      isLoading,
      error,
      dedicatedEndpointId,
      defaultModelId,
      chatMode,
      chatConfig,
      apiKey,
      codeDrawerOpen,
      sidebarCollapsed,
      enableThinking,
      chatWidth,
    ],
  );

  useEffect(() => {
    if (chatContainerWidth !== undefined) {
      setChatWidth(chatContainerWidth);
    }
  }, [chatContainerWidth]);

  useEffect(() => {
    if (defaultModelId && modelList.length > 0 && !dedicatedEndpointId) {
      const model = modelList.find((model: LLMModelWithStatus) =>
        model.id.includes(defaultModelId),
      );
      setCurrentModel((pre) => {
        if (model && model.id !== pre?.id) {
          return model;
        }
        return pre;
      });
    }
  }, [defaultModelId, modelList, dedicatedEndpointId, setCurrentModel]);

  return (
    <PlaygroundContext.Provider value={value}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export interface PlaygroundConfig {
  chatContainerWidth?: number;
  defaultModelId?: string;
  dedicatedEndpointId?: string;
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error("usePlayground must be used within PlaygroundProvider");
  }
  return context;
}
