"use client";

import React from "react";
import { Response } from "@/components/ai-elements/response";
import { Actions, Action } from "@/components/ai-elements/actions";
import { SlaMetrics } from "@/components/ai-elements/sla-metrics";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { message } from "@/components/ui/standard/notify";
import {
  TextContentRenderProps,
  TextPartRenderProps,
  ActionsRenderProps,
  SlaMetricsRenderProps,
} from "./types";

/**
 * Render regular text content - uses different components for user vs assistant
 */
export const RenderTextContent = ({
  text,
  keyPrefix,
  role,
}: TextContentRenderProps) => {
  // User messages should use plain div to avoid markdown auto-completion
  if (role === "user") {
    return (
      <div key={`${keyPrefix}-text`} className="whitespace-pre-wrap">
        {text}
      </div>
    );
  }

  // Assistant messages can use Response component for markdown support
  return (
    <Response
      key={`${keyPrefix}-response`}
      className="
    [&_[data-streamdown='code-block']]:bg-[#fff] 
      [&_[data-streamdown='code-block']~button:hover]:bg-common-gray-2"
    >
      {text}
    </Response>
  );
};

/**
 * Main text part renderer - now simplified since preprocessing handles thinking content
 */
export const RenderTextPart = ({
  part,
  keyPrefix,
  role,
}: TextPartRenderProps) => {
  // Since preprocessing already extracts thinking content,
  // text parts should only contain regular content
  return (
    <RenderTextContent
      key={`${keyPrefix}-plain-text`}
      text={part.text}
      keyPrefix={keyPrefix}
      role={role}
    />
  );
};

/**
 * Render SLA metrics if available
 */
export const RenderSlaMetrics = ({
  part,
  keyPrefix,
}: SlaMetricsRenderProps) => {
  const slaData: { tps?: number; ttft_ms?: number } | undefined =
    part.providerMetadata?.provider;

  if (!slaData) return null;

  return (
    <SlaMetrics
      key={`${keyPrefix}-sla`}
      tps={slaData.tps}
      ttft_ms={slaData.ttft_ms}
    />
  );
};

/**
 * Render action buttons for assistant messages
 */
export const RenderActions = ({
  part,
  keyPrefix,
  onRegenerate,
}: ActionsRenderProps) => {
  const handleCopyText = () => {
    navigator.clipboard.writeText(part.text);
    message.success("Copied to clipboard");
  };

  return (
    <Actions key={`${keyPrefix}-actions`}>
      <Action
        onClick={handleCopyText}
        label="Copy"
        className="p-0 size-5 border-none text-common-dark-2"
      >
        <CopyIcon className="size-4" />
      </Action>
      <Action
        onClick={onRegenerate}
        label="Retry"
        className="p-0 size-5 border-none text-common-dark-2"
      >
        <RefreshCcwIcon className="size-4" />
      </Action>
    </Actions>
  );
};
