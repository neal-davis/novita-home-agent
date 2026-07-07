import type { ChatStatus, FileUIPart, TextUIPart, ToolUIPart } from "ai";
import { FunctionDefinition } from "@/app/api/type";

// Types for better type safety
export type MessageRole = "user" | "assistant";
export type KeyPrefix = string;

export interface ThinkingContent {
  reasoningText: string;
  regularText: string;
}

export interface TextPartRenderProps {
  part: TextUIPart;
  keyPrefix: KeyPrefix;
  role: MessageRole;
}

export interface ActionsRenderProps {
  part: TextUIPart;
  keyPrefix: KeyPrefix;
  onRegenerate: () => void;
}

export interface ToolPartRenderProps {
  part: ToolUIPart;
  keyPrefix: KeyPrefix;
  currentTools: FunctionDefinition[];
  mockToolOutput: string;
  setMockToolOutput: (output: string) => void;
  onSaveTool: (tool: string, toolCallId: string) => void;
  onMockTool: (
    tool: FunctionDefinition,
    parameters: Record<string, any>,
  ) => Promise<void>;
}

export interface FilePartRenderProps {
  part: any; // File part type
  keyPrefix: KeyPrefix;
}

export interface ReasoningPartRenderProps {
  part: any; // Reasoning part type
  keyPrefix: KeyPrefix;
  status: ChatStatus;
}

export interface AudioPartsRenderProps {
  parts: FileUIPart[];
  keyPrefix?: KeyPrefix;
}

export interface SlaMetricsRenderProps {
  part: TextUIPart;
  keyPrefix: KeyPrefix;
}

export interface TextContentRenderProps {
  text: string;
  keyPrefix: KeyPrefix;
  role: MessageRole;
}
