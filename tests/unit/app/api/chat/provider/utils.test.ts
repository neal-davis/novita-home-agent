import { isBase64OnlyImageModel } from "@/app/api/chat/provider/utils";

describe("isBase64OnlyImageModel", () => {
  it("is true for claude models", () => {
    expect(isBase64OnlyImageModel("anthropic/claude-3-5-sonnet")).toBe(true);
  });

  it("is false for non-claude models", () => {
    expect(isBase64OnlyImageModel("openai/gpt-oss-120b")).toBe(false);
    expect(isBase64OnlyImageModel("")).toBe(false);
  });
});
