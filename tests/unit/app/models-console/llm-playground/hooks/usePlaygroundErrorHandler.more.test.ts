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

describe("usePlaygroundErrorHandler (more branches)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("navigates to billing when the top-up action is clicked", () => {
    renderHook(() =>
      usePlaygroundErrorHandler(
        new Error(JSON.stringify({ reason: LLMErrReason.NOT_ENOUGH_BALANCE })),
      ),
    );
    const opts = mockNotify.warning.mock.calls[0][1];
    // invoke the action onClick to cover the navigation callback
    const originalHref = window.location.href;
    const hrefSetter = jest.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return originalHref;
        },
        set href(v: string) {
          hrefSetter(v);
        },
      },
    });
    opts.action.onClick();
    expect(hrefSetter).toHaveBeenCalled();
  });

  it("does nothing for an error with an empty message", () => {
    renderHook(() => usePlaygroundErrorHandler(new Error("")));
    expect(mockNotify.error).not.toHaveBeenCalled();
    expect(mockNotify.warning).not.toHaveBeenCalled();
  });

  it("recovers via the outer catch when notify throws", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    // First notify.error call (non-JSON path) throws, forcing the outer catch.
    mockNotify.error
      .mockImplementationOnce(() => {
        throw new Error("notify exploded");
      })
      .mockImplementation(() => {});
    renderHook(() => usePlaygroundErrorHandler(new Error("plain failure")));
    expect(consoleError).toHaveBeenCalledWith(
      "Error handling error:",
      expect.any(Error),
    );
    // outer-catch fallback notify is invoked
    expect(mockNotify.error).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
