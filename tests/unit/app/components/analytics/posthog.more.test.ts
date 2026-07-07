import {
  identifyPostHog,
  capturePostHog,
} from "@/app/components/analytics/posthog";

describe("analytics/posthog more branches", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    delete (window as any).posthog;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("does not schedule a second retry chain for the same pending uuid", () => {
    // First call schedules a retry (posthog not ready).
    identifyPostHog({ uuid: "same" });
    const setTimeoutSpy = jest.spyOn(window, "setTimeout");
    // Second call with the same uuid should early-return (no new timer).
    identifyPostHog({ uuid: "same" });
    expect(setTimeoutSpy).not.toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it("starts a fresh retry chain when a different uuid arrives", () => {
    identifyPostHog({ uuid: "first" });
    const setTimeoutSpy = jest.spyOn(window, "setTimeout");
    identifyPostHog({ uuid: "second" });
    expect(setTimeoutSpy).toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it("clears the pending identify when called with an empty uuid afterwards", () => {
    identifyPostHog({ uuid: "pending" });
    // empty uuid -> clearPendingIdentify branch
    identifyPostHog({ uuid: "" });
    const identify = jest.fn();
    (window as any).posthog = { identify, get_distinct_id: () => "x" };
    jest.advanceTimersByTime(500 * 5);
    expect(identify).not.toHaveBeenCalled();
  });

  it("identify retry succeeds and stops retrying once posthog appears", () => {
    identifyPostHog({ uuid: "u1" });
    const identify = jest.fn();
    (window as any).posthog = { identify, get_distinct_id: () => "diff" };
    jest.advanceTimersByTime(500);
    expect(identify).toHaveBeenCalledTimes(1);
    // further ticks should not re-identify
    jest.advanceTimersByTime(500 * 5);
    expect(identify).toHaveBeenCalledTimes(1);
  });

  it("capture gives up after max retries without throwing", () => {
    capturePostHog("never", { x: 1 });
    expect(() => jest.advanceTimersByTime(500 * 31)).not.toThrow();
  });

  it("identifies immediately when get_distinct_id is absent but identify exists", () => {
    const identify = jest.fn();
    (window as any).posthog = { identify }; // no get_distinct_id
    identifyPostHog({ uuid: "abc" });
    expect(identify).toHaveBeenCalledWith("abc", { name: "abc" });
  });
});
