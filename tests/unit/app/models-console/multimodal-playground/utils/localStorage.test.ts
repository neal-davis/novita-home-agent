import {
  clearAllPlaygroundFormData,
  clearPlaygroundFormData,
  loadPlaygroundFormData,
  savePlaygroundFormData,
} from "@/app/models-console/multimodal-playground/utils/localStorage";

describe("multimodal playground localStorage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-01-02T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("saves and loads form data for the matching model", () => {
    savePlaygroundFormData("model-a", {
      prompt: "hello",
      width: 1024,
    });

    expect(loadPlaygroundFormData("model-a")).toEqual({
      prompt: "hello",
      width: 1024,
    });
    expect(loadPlaygroundFormData("model-b")).toBeNull();
  });

  it("clears expired form data when loading", () => {
    localStorage.setItem(
      "multimodal_playground_model-a",
      JSON.stringify({
        modelName: "model-a",
        formData: { prompt: "old" },
        timestamp: new Date("2025-12-31T00:00:00Z").getTime(),
      }),
    );

    expect(loadPlaygroundFormData("model-a")).toBeNull();
    expect(localStorage.getItem("multimodal_playground_model-a")).toBeNull();
  });

  it("returns null for malformed stored data and logs the parse error", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    localStorage.setItem("multimodal_playground_model-a", "{bad json");

    expect(loadPlaygroundFormData("model-a")).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to load playground form data:",
      expect.any(SyntaxError),
    );
  });

  it("clears one model or all playground keys without touching other storage", () => {
    savePlaygroundFormData("model-a", { prompt: "a" });
    savePlaygroundFormData("model-b", { prompt: "b" });
    localStorage.setItem("other", "keep");

    clearPlaygroundFormData("model-a");
    expect(loadPlaygroundFormData("model-a")).toBeNull();
    expect(loadPlaygroundFormData("model-b")).toEqual({ prompt: "b" });

    clearAllPlaygroundFormData();
    expect(localStorage.getItem("multimodal_playground_model-b")).toBeNull();
    expect(localStorage.getItem("other")).toBe("keep");
  });

  it("logs storage write and remove failures", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    savePlaygroundFormData("model-a", { prompt: "a" });
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to save playground form data:",
      expect.any(Error),
    );

    jest.restoreAllMocks();
    const consoleErrorAgain = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    clearPlaygroundFormData("model-a");
    expect(consoleErrorAgain).toHaveBeenCalledWith(
      "Failed to clear playground form data:",
      expect.any(Error),
    );
  });
});
