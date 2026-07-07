import {
  NON_RENDERABLE_PART_TYPES,
  parseThinkingContent,
  preprocessMessageParts,
  shouldRenderPartType,
} from "@/app/models-console/llm-playground/components/chat-messages/parts-render/utils";

describe("parseThinkingContent", () => {
  it("returns null when there is no <think> tag", () => {
    expect(parseThinkingContent("just plain text")).toBeNull();
  });

  it("returns null for an unterminated <think> (no closing tag)", () => {
    expect(parseThinkingContent("<think>still thinking")).toBeNull();
  });

  it("splits reasoning and regular text from a complete block", () => {
    const result = parseThinkingContent(
      "<think>  reasoning here </think>  answer ",
    );
    expect(result).toEqual({
      reasoningText: "reasoning here",
      regularText: "answer",
    });
  });
});

describe("shouldRenderPartType", () => {
  it("filters out internal/non-visual part types", () => {
    expect(shouldRenderPartType("step-start")).toBe(false);
    expect(shouldRenderPartType("metadata")).toBe(false);
    expect(NON_RENDERABLE_PART_TYPES.has("debug-info")).toBe(true);
  });

  it("renders ordinary part types", () => {
    expect(shouldRenderPartType("text")).toBe(true);
    expect(shouldRenderPartType("reasoning")).toBe(true);
  });
});

describe("preprocessMessageParts", () => {
  it("leaves non-text parts untouched", () => {
    const parts = [{ type: "image", url: "x" }];
    expect(preprocessMessageParts(parts)).toEqual(parts);
  });

  it("keeps a text part with no thinking content as-is", () => {
    const parts = [{ type: "text", text: "hello" }];
    expect(preprocessMessageParts(parts)).toEqual(parts);
  });

  it("splits a completed think block into reasoning + text and orders reasoning first", () => {
    const parts = [{ type: "text", text: "<think>why</think>final answer" }];
    const out = preprocessMessageParts(parts);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ type: "reasoning", text: "why" });
    expect(out[1]).toMatchObject({ type: "text", text: "final answer" });
  });

  it("converts a streaming (unterminated) think block to a streaming reasoning part", () => {
    const parts = [{ type: "text", text: "<think>partial reasoning" }];
    const out = preprocessMessageParts(parts);
    expect(out).toEqual([
      { type: "reasoning", text: "partial reasoning", isStreaming: true },
    ]);
  });

  it("sorts reasoning parts ahead of text parts overall", () => {
    const parts = [
      { type: "text", text: "answer" },
      { type: "reasoning", text: "r" },
    ];
    const out = preprocessMessageParts(parts);
    expect(out[0].type).toBe("reasoning");
    expect(out[1].type).toBe("text");
  });
});
