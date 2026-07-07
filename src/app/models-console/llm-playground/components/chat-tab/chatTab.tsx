import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { ChatMode } from "../../types/types";
import { useModel } from "../../providers/ModelProvider";
import { useEffect, useMemo } from "react";

export function ChatTab({
  chatMode,
  setChatMode,
}: {
  chatMode: ChatMode;
  setChatMode: (chatMode: ChatMode) => void;
}) {
  const { currentModel } = useModel();

  // Check if the current model supports completion
  const supportsCompletion = useMemo(() => {
    return (
      currentModel?.isCompletion ||
      currentModel?.endpoints?.includes("completions") ||
      currentModel?.endpoints?.includes("completion")
    );
  }, [currentModel]);

  // Available modes based on model capabilities
  const availableModes = useMemo(() => {
    const modes = [ChatMode.Chat];
    if (supportsCompletion) {
      modes.push(ChatMode.Completion);
    }
    return modes;
  }, [supportsCompletion]);

  // Auto-switch to Chat mode if current mode is Completion but model doesn't support it
  useEffect(() => {
    if (chatMode === ChatMode.Completion && !supportsCompletion) {
      setChatMode(ChatMode.Chat);
    }
  }, [chatMode, supportsCompletion, setChatMode]);

  return (
    <div>
      <ButtonGroup className="bg-common-gray-3 p-1 rounded-md">
        {availableModes.map((mode) => (
          <Button
            variant="noborderghost"
            onClick={() => setChatMode(mode)}
            className={cn(
              "text-common-dark-2 text-sm !rounded-sm",
              chatMode === mode &&
                "bg-white shadow-sm text-black hover:bg-white",
            )}
            key={mode}
          >
            {mode}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}
