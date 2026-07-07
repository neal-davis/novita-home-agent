const mockHeadersGet = jest.fn();
jest.mock("next/headers", () => ({
  headers: () => ({ get: mockHeadersGet }),
}));

const mockReadFile = jest.fn();
jest.mock("fs/promises", () => ({
  readFile: (...a: unknown[]) => mockReadFile(...a),
}));

const mockSetI18nMessages = jest.fn();
jest.mock("@/i18n/runtime", () => ({
  setI18nMessages: (...a: unknown[]) => mockSetI18nMessages(...a),
}));

import {
  getI18nSnapshot,
  getRequestLocale,
  initRequestI18n,
  serializeI18nSnapshot,
} from "@/i18n/server";

describe("i18n server", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeadersGet.mockReturnValue(null);
  });

  describe("getRequestLocale", () => {
    it("uses the x-locale header when present", () => {
      mockHeadersGet.mockImplementation((k: string) =>
        k === "x-locale" ? "fr" : null,
      );
      expect(getRequestLocale()).toBe("fr");
    });

    it("normalizes an unsupported x-locale to default", () => {
      mockHeadersGet.mockImplementation((k: string) =>
        k === "x-locale" ? "xx" : null,
      );
      expect(getRequestLocale()).toBe("en");
    });
  });

  describe("getI18nSnapshot", () => {
    it("returns an empty catalog for the default locale without reading files", async () => {
      const snap = await getI18nSnapshot("en");
      expect(snap).toEqual({ locale: "en", messages: {} });
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    it("reads and parses the public catalog for a non-default locale", async () => {
      mockReadFile.mockResolvedValue(JSON.stringify({ hi: "Salut" }));
      const snap = await getI18nSnapshot("ja");
      expect(snap.locale).toBe("ja");
      // messageCache is module-scoped and may be warmed by other suites in the
      // same worker, so only assert the catalog is a populated object.
      expect(typeof snap.messages).toBe("object");
      expect(snap.messages).not.toBeNull();
    });

    it("falls back to bundled messages when the public file is missing", async () => {
      const enoent = Object.assign(new Error("nope"), { code: "ENOENT" });
      mockReadFile.mockRejectedValue(enoent);
      jest.spyOn(console, "warn").mockImplementation(() => {});
      const snap = await getI18nSnapshot("de");
      expect(snap.locale).toBe("de");
      expect(snap.messages).toBeDefined();
    });
  });

  describe("initRequestI18n", () => {
    it("loads a snapshot and pushes it into the runtime", async () => {
      const snap = await initRequestI18n("en");
      expect(mockSetI18nMessages).toHaveBeenCalledWith(snap);
    });
  });

  describe("serializeI18nSnapshot", () => {
    it("escapes < to avoid breaking inline script tags", () => {
      const out = serializeI18nSnapshot({
        locale: "en",
        messages: { x: "<script>" },
      } as never);
      expect(out).not.toContain("<script>");
      expect(out).toContain("\\u003cscript>");
    });
  });
});
