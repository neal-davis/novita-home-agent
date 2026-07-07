import {
  extractFieldMappingFromSKUMappings,
  extractFieldsFromCEL,
  extractFieldsFromCELs,
} from "@/lib/utils/dynamic-pricing/cel-field-extractor";

describe("CEL field extraction", () => {
  it("extracts body/object fields and keeps the more specific parameters path", () => {
    expect(
      extractFieldsFromCEL(
        'body.fast_mode == true && object.parameters.size == "832*480" && has(body.video)',
      ),
    ).toEqual({
      fast_mode: "body.fast_mode",
      size: "object.parameters.size",
      video: "body.video",
    });
  });

  it("merges fields from multiple CEL expressions", () => {
    expect(
      extractFieldsFromCELs([
        'body.size == "832*480"',
        "body.parameters.size == '1280*720' && object.duration >= 5",
      ]),
    ).toEqual({
      duration: "object.duration",
      size: "body.parameters.size",
    });
  });

  it("handles empty SKU mappings", () => {
    expect(extractFieldMappingFromSKUMappings([])).toEqual({});
    expect(extractFieldMappingFromSKUMappings(null as any)).toEqual({});
  });
});
