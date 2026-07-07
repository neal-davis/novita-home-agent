"use client";

import { Fragment } from "react";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import type {
  ChatStatus,
  FileUIPart,
  TextUIPart,
  ToolUIPart,
  UIMessage,
} from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { FunctionDefinition } from "@/app/api/type";
import {
  MessageRole,
  preprocessMessageParts,
  RenderActions,
  RenderAudioParts,
  RenderFilePart,
  RenderReasoningPart,
  RenderSlaMetrics,
  RenderTextPart,
  RenderToolPart,
  shouldRenderPartType,
} from "./parts-render";
import avatar from "./logo.svg";

// render order
const RENDER_ORDER = {
  reasoning: 1,
  tool: 2,
  text: 3,
  file: 4,
  audio: 5,
  sla: 6,
  action: 7,
};

function ChatMessage({
  messages,
  status,
  regenerate,
  currentTools,
  mockToolOutput,
  setMockToolOutput,
  onSaveTool,
  onMockTool,
}: {
  messages: UIMessage[];
  status: ChatStatus;
  regenerate: (id: string) => void;
  currentTools: FunctionDefinition[];
  mockToolOutput: string;
  setMockToolOutput: (output: string) => void;
  onSaveTool: (tool: string, toolCallId: string) => void;
  onMockTool: (
    tool: FunctionDefinition,
    parameters: Record<string, any>,
  ) => Promise<void>;
}) {
  return (
    <Conversation className="w-full h-full ">
      <ConversationContent className="w-full py-0 px-0">
        {messages.map((message) => {
          const { role, parts, id } = message;

          // Preprocess parts to extract reasoning content and ensure proper ordering
          const processedParts = preprocessMessageParts(parts);

          const isMessageDone = parts.every(
            (part) => !("state" in part) || part.state === "done",
          );

          const audioParts: FileUIPart[] = parts?.filter(
            (part) => part.type === "file" && part.mediaType === "audio-raw",
          ) as FileUIPart[];

          // console.debug("message", message);

          return (
            <Message from={role} key={id} className="mx-auto">
              <MessageContent>
                <div className="flex flex-col">
                  {processedParts
                    .filter((part) => shouldRenderPartType(part.type))
                    .map((part, partIndex) => {
                      const keyPrefix = `${id}-${partIndex}-${part.type}`;
                      const PartElement = (() => {
                        if (part.type === "reasoning") {
                          return (
                            <div
                              key={`${keyPrefix}-reasoning`}
                              style={{ order: RENDER_ORDER.reasoning }}
                            >
                              <RenderReasoningPart
                                part={part}
                                keyPrefix={keyPrefix}
                                status={status}
                              />
                            </div>
                          );
                        } else if (part.type.includes("tool-")) {
                          return (
                            <div
                              key={`${keyPrefix}-tool`}
                              style={{ order: RENDER_ORDER.tool }}
                            >
                              <RenderToolPart
                                part={part as ToolUIPart}
                                keyPrefix={keyPrefix}
                                currentTools={currentTools}
                                mockToolOutput={mockToolOutput}
                                setMockToolOutput={setMockToolOutput}
                                onSaveTool={onSaveTool}
                                onMockTool={onMockTool}
                              />
                            </div>
                          );
                        } else if (part.type === "text") {
                          return (
                            <div
                              key={`${keyPrefix}-text`}
                              style={{ order: RENDER_ORDER.text }}
                            >
                              <RenderTextPart
                                part={part as TextUIPart}
                                keyPrefix={keyPrefix}
                                role={role as MessageRole}
                              />
                            </div>
                          );
                        } else if (part.type === "file") {
                          if (part.mediaType !== "audio-raw") {
                            return (
                              <div
                                key={`${keyPrefix}-file`}
                                style={{ order: RENDER_ORDER.file }}
                              >
                                <RenderFilePart
                                  part={part as FileUIPart}
                                  keyPrefix={keyPrefix}
                                />
                              </div>
                            );
                          }
                        }
                      })();

                      return (
                        <Fragment key={`${keyPrefix}-fragment`}>
                          {PartElement}
                        </Fragment>
                      );
                    })}
                  {/* Render audio parts once per message for assistant messages */}
                  {audioParts.length > 0 && (
                    <div
                      key={`audio-parts`}
                      style={{ order: RENDER_ORDER.audio }}
                    >
                      <RenderAudioParts parts={audioParts} />
                    </div>
                  )}
                  {/* Render SLA metrics once per message for assistant messages */}
                  {role === "assistant" &&
                    (() => {
                      // Find the first text part that has SLA data
                      const partWithSlaData = processedParts.find(
                        (p) =>
                          p.type === "text" && p.providerMetadata?.provider,
                      ) as TextUIPart;

                      return (
                        <div
                          key={`${id}-sla`}
                          style={{ order: RENDER_ORDER.sla }}
                          className="flex items-center gap-3 mt-2"
                        >
                          {isMessageDone && (
                            <RenderActions
                              part={
                                (processedParts.find(
                                  (p) => p.type === "text",
                                ) as TextUIPart) ||
                                (processedParts[0] as TextUIPart)
                              }
                              keyPrefix={`${id}-actions`}
                              onRegenerate={() => regenerate(id)}
                            />
                          )}
                          {partWithSlaData && (
                            <RenderSlaMetrics
                              key={`${id}-sla-metrics`}
                              part={partWithSlaData}
                              keyPrefix={`${id}-sla`}
                            />
                          )}
                        </div>
                      );
                    })()}
                </div>
              </MessageContent>
              {role === "assistant" && (
                <MessageAvatar
                  src={"/logo/logo_small.svg"}
                  className="bg-[var(--brand-2)] rounded-sm"
                />
              )}
            </Message>
          );
        })}
        <div className="mx-auto">{status === "submitted" && <Loader />}</div>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}

export default ChatMessage;
