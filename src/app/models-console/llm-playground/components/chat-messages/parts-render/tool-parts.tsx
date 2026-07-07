"use client";

import React from "react";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolMock,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { ToolPartRenderProps } from "./types";

/**
 * Render tool-related content
 */
export const RenderToolPart = ({
  part,
  keyPrefix,
  currentTools,
  mockToolOutput,
  setMockToolOutput,
  onSaveTool,
  onMockTool,
}: ToolPartRenderProps) => {
  const toolName = part.type.split("-")[1];
  const tool = currentTools.find((t) => t.name === toolName);

  if (!tool) return null;

  return (
    <Tool
      defaultOpen={true}
      key={`${keyPrefix}-tool`}
      className="min-w-[400px]"
    >
      <ToolHeader type={`tool-${tool.name}`} state={part.state} />
      <ToolContent>
        <ToolInput input={part.input} />
        {part.errorText || part.output ? (
          <ToolOutput
            output={
              <div className="rounded-md bg-muted/50">
                <CodeBlock
                  code={JSON.stringify(part.output, null, 2)}
                  language="json"
                />
              </div>
            }
            errorText={part.errorText}
          />
        ) : (
          <ToolMock
            output={mockToolOutput}
            setOutput={setMockToolOutput}
            onSave={() => onSaveTool(tool.name, part.toolCallId || "")}
            onMock={async () =>
              onMockTool(tool, part.input as Record<string, any>)
            }
          />
        )}
      </ToolContent>
    </Tool>
  );
};
