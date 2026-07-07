"use client";

import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2, RotateCw } from "lucide-react";
import { ChatTab } from "../chat-tab/chatTab";
import { ChatMode } from "../../types/types";
import { ChatModeView } from "../modes/ChatModeView";
import { CompletionModeView } from "../modes/CompletionModeView";
import { useChatConfig } from "../../providers/ChatConfigProvider";
import { useUIState } from "../../providers/UIStateProvider";
import { MaxContainerWrapper } from "./MaxContainerWrappr";

export function PlaygroundMainContent() {
  const { chatMode, setChatMode, clearChatHistory } = useChatConfig();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIState();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleClearHistory = () => {
    clearChatHistory();
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="relative flex items-center py-2 shrink-0 justify-between border-b border-common-gray-2">
        <MaxContainerWrapper className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              className="w-6 h-6 p-0 focus:bg-transparent focus-visible:bg-transparent"
              variant="outline"
              onClick={handleToggleSidebar}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {sidebarCollapsed ? (
                <Maximize2 className="w-4 h-4 text-sm" />
              ) : (
                <Minimize2 className="w-4 h-4 text-sm" />
              )}
            </Button>
            <ChatTab chatMode={chatMode} setChatMode={setChatMode} />
          </div>
          <Button
            variant="noborderoutline"
            className="bg-common-gray-3 border border-common-gray-2 hover:bg-common-gray-2"
            onClick={handleClearHistory}
            aria-label="Clear history"
          >
            <div className="flex items-center gap-1 text-black">
              <RotateCw className="w-4 h-4" />
              <span className="text-sm">Clear History</span>
            </div>
          </Button>
        </MaxContainerWrapper>
      </div>
      <div className="flex flex-col flex-1 pt-3 pb-5 min-h-0">
        {chatMode === ChatMode.Chat && <ChatModeView />}
        {chatMode === ChatMode.Completion && <CompletionModeView />}
      </div>
    </div>
  );
}
