import { act, renderHook } from "@testing-library/react";
import useNavHistory, { LOCATION_CHANGE_EVT } from "@/lib/hooks/useNavHistory";

describe("useNavHistory", () => {
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  beforeEach(() => {
    jest.useFakeTimers();
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    (window as unknown as { insiteReferrer?: string }).insiteReferrer =
      undefined;
    window.history.replaceState({}, "", "/start");
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("records the initial location on mount", () => {
    const { result } = renderHook(() => useNavHistory());
    expect(result.current.history).toEqual([window.location.href]);
  });

  it("appends a new entry and sets referrer when pushState fires locationchange", () => {
    const { result } = renderHook(() => useNavHistory());
    const initialHref = window.location.href;

    act(() => {
      window.history.pushState({}, "", "/next-page");
      jest.runOnlyPendingTimers();
    });

    expect(result.current.history.length).toBe(2);
    expect(result.current.history[0]).toBe(initialHref);
    expect(result.current.referrer).toBe(initialHref);
    expect(
      (window as unknown as { insiteReferrer?: string }).insiteReferrer,
    ).toBe(initialHref);
  });

  it("ignores duplicate hrefs", () => {
    const { result } = renderHook(() => useNavHistory());
    const before = result.current.history.length;

    act(() => {
      // dispatch a locationchange without changing the URL
      window.dispatchEvent(new Event(LOCATION_CHANGE_EVT));
      jest.runOnlyPendingTimers();
    });

    expect(result.current.history.length).toBe(before);
  });

  it("tracks replaceState transitions too", () => {
    const { result } = renderHook(() => useNavHistory());

    act(() => {
      window.history.replaceState({}, "", "/replaced");
      jest.runOnlyPendingTimers();
    });

    expect(result.current.history.some((h) => h.includes("/replaced"))).toBe(
      true,
    );
  });

  it("restores the original history methods on unmount", () => {
    const { unmount } = renderHook(() => useNavHistory());
    expect(window.history.pushState).not.toBe(originalPushState);
    unmount();
    expect(window.history.pushState).toBe(originalPushState);
    expect(window.history.replaceState).toBe(originalReplaceState);
  });
});
