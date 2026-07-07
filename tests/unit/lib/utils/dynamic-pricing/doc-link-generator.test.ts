import {
  generateDocLink,
  generateDocLinks,
} from "@/lib/utils/dynamic-pricing/doc-link-generator";

const makeConfig = (id: number, path: string) =>
  ({
    fusionConfig: { id },
    modelConfig: {
      config: {
        openapiSchema: JSON.stringify({
          openapi: "3.0.0",
          paths: { [path]: { post: {} } },
        }),
      },
    },
  }) as any;

describe("doc link generator", () => {
  it("builds docs links from the first OpenAPI path endpoint", () => {
    expect(generateDocLink(makeConfig(1, "/v3/async/wan2.5-t2v"))).toBe(
      "/docs/api-reference/model-apis-wan2.5-t2v",
    );
  });

  it("skips configs with invalid or empty schemas", () => {
    const warn = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(
      generateDocLinks([
        makeConfig(1, "/v3/async/model-a"),
        {
          fusionConfig: { id: 2 },
          modelConfig: { config: { openapiSchema: "{bad-json" } },
        } as any,
        {
          fusionConfig: { id: 3 },
          modelConfig: {
            config: { openapiSchema: JSON.stringify({ paths: {} }) },
          },
        } as any,
      ]),
    ).toEqual(new Map([[1, "/docs/api-reference/model-apis-model-a"]]));

    warn.mockRestore();
  });
});
