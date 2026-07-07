import {
  clearFacetValue,
  createEmptyFacetFilterState,
  toggleFacetValue,
} from "@/lib/model-library/filters";

describe("model-library facet filters", () => {
  it("creates an empty facet filter state", () => {
    expect(createEmptyFacetFilterState()).toEqual({
      modalities: [],
      series: [],
      features: [],
    });
  });

  it("toggles a value on when absent", () => {
    const start = createEmptyFacetFilterState();
    const next = toggleFacetValue(start, "series", "llama");
    expect(next.series).toEqual(["llama"]);
    // original is untouched (immutability)
    expect(start.series).toEqual([]);
  });

  it("toggles a value off when present", () => {
    const start = {
      ...createEmptyFacetFilterState(),
      series: ["llama", "qwen"],
    };
    const next = toggleFacetValue(start, "series", "llama");
    expect(next.series).toEqual(["qwen"]);
  });

  it("handles toggling on a key that has no array yet", () => {
    const next = toggleFacetValue({} as never, "modalities", "text");
    expect(next.modalities).toEqual(["text"]);
  });

  it("clears a specific value while leaving others", () => {
    const start = {
      ...createEmptyFacetFilterState(),
      features: ["a", "b", "c"],
    };
    const next = clearFacetValue(start, "features", "b");
    expect(next.features).toEqual(["a", "c"]);
  });

  it("clearing a value on a missing key yields an empty array", () => {
    const next = clearFacetValue({} as never, "features", "x");
    expect(next.features).toEqual([]);
  });
});
