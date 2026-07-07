import {
  getFileUploadConstraints,
  getModelConstraints,
  getPromptTemplates,
  hasRestrictedPrompts,
  shouldAutoClearHistory,
} from "@/app/models-console/llm-playground/types/modelConstraints";

describe("getModelConstraints", () => {
  it("returns null for empty/undefined model ids", () => {
    expect(getModelConstraints(undefined)).toBeNull();
    expect(getModelConstraints(null)).toBeNull();
    expect(getModelConstraints("")).toBeNull();
  });

  it("matches the deepseek OCR model by exact id", () => {
    const c = getModelConstraints("deepseek/deepseek-ocr");
    expect(c).not.toBeNull();
    expect(c!.restrictedPrompts).toBe(true);
    expect(c!.autoClearHistory).toBe(true);
  });

  it("returns null for an unknown model", () => {
    expect(getModelConstraints("openai/gpt-4")).toBeNull();
  });
});

describe("derived constraint helpers", () => {
  it("hasRestrictedPrompts reflects the config", () => {
    expect(hasRestrictedPrompts("deepseek/deepseek-ocr")).toBe(true);
    expect(hasRestrictedPrompts("openai/gpt-4")).toBe(false);
    expect(hasRestrictedPrompts(null)).toBe(false);
  });

  it("getPromptTemplates returns templates for OCR and [] otherwise", () => {
    const templates = getPromptTemplates("deepseek/deepseek-ocr");
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.map((t) => t.id)).toContain("document");
    expect(getPromptTemplates("openai/gpt-4")).toEqual([]);
  });

  it("getFileUploadConstraints returns limits for OCR, null otherwise", () => {
    const fc = getFileUploadConstraints("deepseek/deepseek-ocr");
    expect(fc).not.toBeNull();
    expect(fc!.maxFiles).toBe(1);
    expect(fc!.fileTypeLimits).toEqual({ image: 1, audio: 0, video: 0 });
    expect(getFileUploadConstraints("openai/gpt-4")).toBeNull();
  });

  it("shouldAutoClearHistory is true only for OCR", () => {
    expect(shouldAutoClearHistory("deepseek/deepseek-ocr")).toBe(true);
    expect(shouldAutoClearHistory("openai/gpt-4")).toBe(false);
  });
});
