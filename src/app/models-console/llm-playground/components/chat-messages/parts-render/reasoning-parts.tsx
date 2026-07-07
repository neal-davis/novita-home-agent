"use client";

import React from "react";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { ReasoningPartRenderProps } from "./types";

/**
 * Render reasoning content
 */
export const RenderReasoningPart = ({
  part,
  keyPrefix,
  status,
}: ReasoningPartRenderProps) => (
  <Reasoning
    key={keyPrefix}
    className="w-full"
    isStreaming={
      part.isStreaming !== undefined ? part.isStreaming : status === "streaming"
    }
  >
    <ReasoningTrigger />
    <ReasoningContent>{part.text}</ReasoningContent>
  </Reasoning>
);
