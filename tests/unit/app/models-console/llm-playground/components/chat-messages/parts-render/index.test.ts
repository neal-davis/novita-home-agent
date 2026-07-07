jest.mock("@/components/ai-elements/code-block", () => ({
  CodeBlock: () => null,
  CodeBlockCopyButton: () => null,
}));
jest.mock("@/components/ai-elements/tool", () => ({
  Tool: () => null,
  ToolHeader: () => null,
  ToolContent: () => null,
  ToolInput: () => null,
  ToolOutput: () => null,
  ToolMock: () => null,
}));

import * as partsRender from "@/app/models-console/llm-playground/components/chat-messages/parts-render/index";

describe("parts-render index barrel", () => {
  it("re-exports the render component set", () => {
    expect(partsRender.RenderTextPart).toBeDefined();
    expect(partsRender.RenderToolPart).toBeDefined();
    expect(partsRender.RenderReasoningPart).toBeDefined();
    expect(partsRender.preprocessMessageParts).toBeDefined();
    expect(partsRender.shouldRenderPartType).toBeDefined();
  });
});
