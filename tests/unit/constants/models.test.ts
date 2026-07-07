import { isQwen3Model, isThinkingModel } from "@/constants/models";

describe("isQwen3Model", () => {
  it("matches qwen3 model ids", () => {
    expect(isQwen3Model("qwen/qwen3-8b")).toBe(true);
  });
  it("rejects non-qwen3 ids", () => {
    expect(isQwen3Model("meta-llama/llama-3")).toBe(false);
    expect(isQwen3Model("qwen/qwen2")).toBe(false);
  });
});

describe("isThinkingModel", () => {
  it("matches glm-4.5 models", () => {
    expect(isThinkingModel("zai-org/glm-4.5")).toBe(true);
  });
  it("matches deepseek-v3.1 exactly", () => {
    expect(isThinkingModel("deepseek/deepseek-v3.1")).toBe(true);
  });
  it("matches generic qwen3 models", () => {
    expect(isThinkingModel("qwen/qwen3-32b")).toBe(true);
  });
  it("excludes the specific non-thinking qwen3 instruct/coder ids", () => {
    expect(isThinkingModel("qwen/qwen3-235b-a22b-instruct-2507")).toBe(false);
    expect(isThinkingModel("qwen/qwen3-coder-480b-a35b-instruct")).toBe(false);
  });
  it("rejects unrelated models", () => {
    expect(isThinkingModel("meta-llama/llama-3")).toBe(false);
  });
});
