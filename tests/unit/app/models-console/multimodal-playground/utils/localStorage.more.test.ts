import {
  clearAllPlaygroundFormData,
  loadPlaygroundFormData,
} from "@/app/models-console/multimodal-playground/utils/localStorage";

describe("multimodal playground localStorage helpers (more branches)", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-01-02T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("returns null when stored data is for a different model name", () => {
    localStorage.setItem(
      "multimodal_playground_model-a",
      JSON.stringify({
        modelName: "model-z",
        formData: { prompt: "x" },
        timestamp: Date.now(),
      }),
    );
    // key matches but the embedded modelName differs -> null
    expect(loadPlaygroundFormData("model-a")).toBeNull();
  });

  it("logs a failure when clearAll cannot remove a key", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    localStorage.setItem("multimodal_playground_model-a", "{}");
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    clearAllPlaygroundFormData();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to clear all playground form data:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});
