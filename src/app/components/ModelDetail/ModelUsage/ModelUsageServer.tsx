import { LLMModelWithStatus } from "@/types/models";
import ModelUsageClient from "./ModelUsageClient";

interface ModelUsageServerProps {
  className?: string;
  model?: LLMModelWithStatus;
  initialReadmeContent?: { [key: string]: string };
  modelConfig?: any;
}

export default function ModelUsageServer({
  className,
  model,
  initialReadmeContent = {},
  modelConfig,
}: ModelUsageServerProps) {
  return (
    <div>
      <ModelUsageClient
        className={className}
        model={model}
        initialContent={initialReadmeContent}
        modelConfig={modelConfig}
      />
    </div>
  );
}
