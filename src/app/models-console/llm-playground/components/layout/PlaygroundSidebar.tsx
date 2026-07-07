"use client";

import { LLMConfig } from "../chat-options/config";
import { LLMTools } from "../chat-options/tools";
import { ChatMode } from "../../types/types";
import { useModel } from "../../providers/ModelProvider";
import { useChatConfig } from "../../providers/ChatConfigProvider";
import { useUIState } from "../../providers/UIStateProvider";
import { PLAYGROUND_SIDEBAR_WIDTH } from "../../constants";

export function PlaygroundSidebar() {
  const { currentModel, dedicatedEndpointId } = useModel();
  const { chatMode, setChatConfig, llmToolsRef } = useChatConfig();
  const { sidebarCollapsed } = useUIState();

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div
      className="shrink-0 px-6 py-4 border-r border-common-gray-2 h-full overflow-y-auto min-h-0"
      style={{ width: `${PLAYGROUND_SIDEBAR_WIDTH}px` }}
    >
      <LLMConfig
        chatMode={chatMode}
        currentModel={currentModel}
        onParamsChange={setChatConfig}
        isDeEndpoint={!!dedicatedEndpointId}
      />
      {(chatMode === ChatMode.Chat || chatMode === ChatMode.Response) && (
        <LLMTools ref={llmToolsRef} />
      )}
    </div>
  );
}
