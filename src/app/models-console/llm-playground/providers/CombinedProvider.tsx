"use client";

import { ReactNode } from "react";
import { ModelProvider, useModel } from "./ModelProvider";
import { ChatConfigProvider, useChatConfig } from "./ChatConfigProvider";
import { UIStateProvider, useUIState } from "./UIStateProvider";
import { useHideIntercom } from "../hooks/use-hide-intercom";

export interface PlaygroundConfig {
  chatContainerWidth?: number;
  defaultModelId?: string;
  dedicatedEndpointId?: string;
}

interface CombinedProviderProps extends PlaygroundConfig {
  children: ReactNode;
}

function IntercomHandler() {
  useHideIntercom();
  return null;
}

export function CombinedProvider({
  children,
  defaultModelId,
  chatContainerWidth,
  dedicatedEndpointId,
}: CombinedProviderProps) {
  return (
    <ModelProvider
      defaultModelId={defaultModelId}
      dedicatedEndpointId={dedicatedEndpointId}
    >
      <ChatConfigProvider>
        <UIStateProvider chatContainerWidth={chatContainerWidth}>
          <IntercomHandler />
          {children}
        </UIStateProvider>
      </ChatConfigProvider>
    </ModelProvider>
  );
}

// Convenience hook to use all contexts at once (for backward compatibility during migration)
export function usePlayground() {
  const model = useModel();
  const chatConfig = useChatConfig();
  const uiState = useUIState();

  return {
    ...model,
    ...chatConfig,
    ...uiState,
  };
}
