import {
  ChatWidth,
  PLAYGROUND_HEADER_HEIGHT,
  PLAYGROUND_MAX_CONTENT_WIDTH,
  PLAYGROUND_MODEL_SELECTOR_WIDTH,
  PLAYGROUND_SIDEBAR_WIDTH,
} from "@/app/models-console/llm-playground/constants";

describe("playground layout constants", () => {
  it("exposes the fixed layout dimensions", () => {
    expect(PLAYGROUND_HEADER_HEIGHT).toBe(84);
    expect(PLAYGROUND_SIDEBAR_WIDTH).toBe(330);
    expect(PLAYGROUND_MODEL_SELECTOR_WIDTH).toBe(300);
    expect(PLAYGROUND_MAX_CONTENT_WIDTH).toBe(1000);
  });

  it("exposes chat width presets", () => {
    expect(ChatWidth.NoLimit).toBe(0);
    expect(ChatWidth.WindowMax).toBe(1000);
    expect(ChatWidth.WindowMax).toBe(PLAYGROUND_MAX_CONTENT_WIDTH);
  });
});
