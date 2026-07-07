import { renderHook } from "@testing-library/react";

const mockReportInternalEvent = jest.fn();
const mockDataLayerPushEvent = jest.fn();
const mockMessageError = jest.fn();
let searchParams = new URLSearchParams();
const mockState = { user: { uid: 0 as number | string, uuid: "" } };

jest.mock("@/api/config", () => ({
  reportInternalEvent: (...args: unknown[]) => mockReportInternalEvent(...args),
}));
jest.mock("@/lib/event", () => ({
  dataLayerPushEvent: (...args: unknown[]) => mockDataLayerPushEvent(...args),
  GA_ENVENT: {
    SIGN_UP_SUCCESS: "sign_up_success",
    SIGN_IN_SUCCESS: "sign_in_success",
  },
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: (...args: unknown[]) => mockMessageError(...args) },
}));
jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
}));
jest.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

import { useOauthEvent } from "@/hooks/useOauthEvent";

describe("useOauthEvent", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockState.user = { uid: 0, uuid: "" };
    searchParams = new URLSearchParams();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("pushes sign-up event when auth succeeds for a new register", () => {
    searchParams = new URLSearchParams({ auth_res: "success", is_reg: "true" });
    renderHook(() => useOauthEvent());
    jest.advanceTimersByTime(900);
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: "sign_up_success",
    });
  });

  it("pushes sign-in event for a returning user", () => {
    searchParams = new URLSearchParams({
      auth_res: "success",
      is_reg: "false",
    });
    renderHook(() => useOauthEvent());
    jest.advanceTimersByTime(900);
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: "sign_in_success",
    });
  });

  it("shows the mapped error message on a known failure reason", () => {
    searchParams = new URLSearchParams({
      auth_res: "failed",
      failed_reason: "FORBIDDEN",
    });
    renderHook(() => useOauthEvent());
    expect(mockMessageError).toHaveBeenCalledWith("No permissions");
  });

  it("shows a generic error for an unknown failure reason", () => {
    searchParams = new URLSearchParams({
      auth_res: "failed",
      failed_reason: "SOMETHING_ELSE",
    });
    renderHook(() => useOauthEvent());
    expect(mockMessageError).toHaveBeenCalledWith("Auth failed");
  });

  it("reports an internal login event when uid and uuid are present", () => {
    mockState.user = { uid: 42, uuid: "abc" };
    searchParams = new URLSearchParams({
      auth_res: "success",
      is_reg: "false",
    });
    renderHook(() => useOauthEvent());
    jest.runOnlyPendingTimers();
    expect(mockReportInternalEvent).toHaveBeenCalledWith({
      uid: "42",
      action: "LOGIN",
    });
  });

  it("does nothing without an auth_result", () => {
    renderHook(() => useOauthEvent());
    jest.runOnlyPendingTimers();
    expect(mockDataLayerPushEvent).not.toHaveBeenCalled();
    expect(mockMessageError).not.toHaveBeenCalled();
    expect(mockReportInternalEvent).not.toHaveBeenCalled();
  });
});
