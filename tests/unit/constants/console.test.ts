import {
  CONSOLE_PAGE_INFO,
  CONSOLE_PAGE_PATH_MAP,
  DOC_LIST,
  LLM_MODEL_FEATURE_MAP,
} from "@/constants/console";

describe("console constants", () => {
  it("builds a path->key map covering every declared path", () => {
    for (const [key, info] of Object.entries(CONSOLE_PAGE_INFO)) {
      for (const path of info.paths) {
        expect(CONSOLE_PAGE_PATH_MAP[path]).toBe(key);
      }
    }
  });

  it("exposes LLM feature labels", () => {
    expect(LLM_MODEL_FEATURE_MAP["function-calling"]).toBe("Function Calling");
    expect(LLM_MODEL_FEATURE_MAP["structured-outputs"]).toBe(
      "Structured Outputs",
    );
  });

  it("lists docs with displayName and path", () => {
    expect(DOC_LIST.length).toBeGreaterThan(0);
    DOC_LIST.forEach((doc) => {
      expect(doc.displayName).toBeTruthy();
      expect(typeof doc.path).toBe("string");
    });
  });
});
