import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Response } from "@/components/ai-elements/response";
import { SlaMetrics } from "@/components/ai-elements/sla-metrics";
import { RenderActions } from "./parts-render";

export function UICompletion({
  submitPrompt,
  isLoading,
  completion,
  slaMetrics,
  onRegenerate,
}: {
  submitPrompt?: string;
  isLoading?: boolean;
  completion: string;
  slaMetrics?: { tps?: number; ttft_ms?: number };
  onRegenerate?: () => void;
}) {
  return (
    <Conversation className="w-full h-full">
      <ConversationContent className="w-full p-2">
        {submitPrompt && (
          <div className="flex flex-col w-full mb-4">
            <div className="text-sm text-common-dark-3 uppercase font-medium mb-1">
              Prompt
            </div>
            <div>{submitPrompt}</div>
          </div>
        )}
        <div className="mx-auto">
          {isLoading && completion.length === 0 && <Loader />}
        </div>
        <Response>{completion}</Response>
        <div className="mt-2 flex items-center gap-3">
          {!isLoading && completion.length > 0 && (
            <RenderActions
              part={{ text: completion, type: "text" }}
              keyPrefix={`actions`}
              onRegenerate={onRegenerate || (() => {})}
            />
          )}
          {slaMetrics && (
            <SlaMetrics tps={slaMetrics?.tps} ttft_ms={slaMetrics?.ttft_ms} />
          )}
        </div>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
