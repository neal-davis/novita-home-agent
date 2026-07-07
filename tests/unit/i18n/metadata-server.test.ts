const mockHeadersGet = jest.fn();
jest.mock("next/headers", () => ({
  headers: () => ({ get: mockHeadersGet }),
}));

const mockInitRequestI18n = jest.fn();
const mockGetRequestLocale = jest.fn(() => "en");
jest.mock("@/i18n/server", () => ({
  initRequestI18n: (...a: unknown[]) => mockInitRequestI18n(...a),
  getRequestLocale: (...a: unknown[]) => mockGetRequestLocale(...a),
}));

import {
  getRequestMetadataAlternates,
  localizeMetadata,
} from "@/i18n/metadata";

describe("i18n metadata (server-dependent helpers)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRequestLocale.mockReturnValue("en");
    mockHeadersGet.mockReturnValue(null);
  });

  describe("localizeMetadata", () => {
    it("initializes request i18n and deep-resolves metadata values", async () => {
      const meta = {
        title: "Hello",
        openGraph: { title: "OG", images: ["/a.png"] },
        metadataBase: new URL("https://novita.ai"),
      };
      const out = await localizeMetadata(meta as never);
      expect(mockInitRequestI18n).toHaveBeenCalled();
      expect(out.title).toBe("Hello");
      // URL instances pass through untouched
      expect((out as { metadataBase: URL }).metadataBase).toBeInstanceOf(URL);
      // nested structures are cloned
      expect((out as { openGraph: { title: string } }).openGraph.title).toBe(
        "OG",
      );
    });
  });

  describe("getRequestMetadataAlternates", () => {
    it("reads x-pathname from headers and builds alternates", () => {
      mockHeadersGet.mockImplementation((k: string) =>
        k === "x-pathname" ? "/models" : null,
      );
      const alt = getRequestMetadataAlternates("en" as never);
      expect(alt.canonical).toContain("/models");
      expect(alt.languages).toHaveProperty("x-default");
      // every supported locale should have an entry
      expect(alt.languages).toHaveProperty("ja");
    });

    it("defaults the pathname to / when header is missing", () => {
      const alt = getRequestMetadataAlternates("en" as never);
      expect(alt.canonical).toBeTruthy();
    });
  });
});
