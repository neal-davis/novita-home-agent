import { renderHook } from "@testing-library/react";
import { usePlaygroundErrorHandler } from "@/app/models-console/llm-playground/hooks/usePlaygroundErrorHandler";
import { LLMErrReason } from "@/app/api/type";
import { notify } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  notify: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockNotify = notify as unknown as {
  error: jest.Mock;
  warning: jest.Mock;
};

describe("usePlaygroundErrorHandler", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does nothing when there is no error", () => {
    renderHook(() => usePlaygroundErrorHandler(undefined));
    expect(mockNotify.error).not.toHaveBeenCalled();
    expect(mockNotify.warning).not.toHaveBeenCalled();
  });

  it("uses the raw message for non-JSON errors", () => {
    renderHook(() => usePlaygroundErrorHandler(new Error("plain failure")));
    expect(mockNotify.error).toHaveBeenCalledWith(
      "Error",
      expect.objectContaining({ description: "plain failure" }),
    );
  });

  it("warns and offers a top-up action for NOT_ENOUGH_BALANCE", () => {
    renderHook(() =>
      usePlaygroundErrorHandler(
        new Error(JSON.stringify({ reason: LLMErrReason.NOT_ENOUGH_BALANCE })),
      ),
    );
    expect(mockNotify.warning).toHaveBeenCalledWith(
      "Not enough balance",
      expect.objectContaining({
        action: expect.objectContaining({ label: "Top up" }),
      }),
    );
  });

  it("shows a model-not-available error", () => {
    renderHook(() =>
      usePlaygroundErrorHandler(
        new Error(JSON.stringify({ reason: LLMErrReason.MODEL_NOT_AVAILABLE })),
      ),
    );
    expect(mockNotify.error).toHaveBeenCalledWith(
      "Model not available",
      expect.objectContaining({ id: "llm-playground-model-not-available" }),
    );
  });

  it("shows an auth error", () => {
    renderHook(() =>
      usePlaygroundErrorHandler(
        new Error(JSON.stringify({ reason: LLMErrReason.FAILED_TO_AUTH })),
      ),
    );
    expect(mockNotify.error).toHaveBeenCalledWith(
      "Failed to authenticate",
      expect.any(Object),
    );
  });

  it("uses the server message for INTERNAL_SERVER_ERROR", () => {
    renderHook(() =>
      usePlaygroundErrorHandler(
        new Error(
          JSON.stringify({
            reason: LLMErrReason.INTERNAL_SERVER_ERROR,
            message: "db down",
          }),
        ),
      ),
    );
    expect(mockNotify.error).toHaveBeenCalledWith(
      "Internal server error",
      expect.objectContaining({ description: "db down" }),
    );
  });

  it("falls back to a generic error for an unknown reason", () => {
    renderHook(() =>
      usePlaygroundErrorHandler(
        new Error(JSON.stringify({ reason: "WAT", message: "weird" })),
      ),
    );
    expect(mockNotify.error).toHaveBeenCalledWith(
      "Error",
      expect.objectContaining({ description: "weird" }),
    );
  });
});
