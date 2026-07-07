import { extractValuesFromCELExpr } from "@/lib/utils/dynamic-pricing/cel-expr-extractor";

describe("extractValuesFromCELExpr", () => {
  it("extracts string, number, boolean, in-list, has, and presence values", () => {
    expect(
      extractValuesFromCELExpr(
        'body.parameters.size in ["832*480", "480*832"] && body.duration >= 5 && object.fast_mode == true && has(body.video) && !body.watermark',
      ),
    ).toEqual({
      duration: 5,
      fast_mode: true,
      size: "832*480",
      video: true,
      watermark: false,
    });
  });

  it("uses field mappings to normalize nested paths", () => {
    expect(
      extractValuesFromCELExpr(
        'object.input.generate_audio == false && body.settings.resolution == "720p"',
        {
          audio: "object.input.generate_audio",
          resolution: "body.settings.resolution",
        },
      ),
    ).toEqual({
      audio: false,
      resolution: "720p",
    });
  });

  it.each(["", "   ", "true"])("returns no values for %p", (expr) => {
    expect(extractValuesFromCELExpr(expr)).toEqual({});
  });

  it("uses the first extractable OR condition", () => {
    expect(
      extractValuesFromCELExpr(
        'body.resolution == "480p" || body.resolution == "720p"',
      ),
    ).toEqual({ resolution: "480p" });
  });
});
