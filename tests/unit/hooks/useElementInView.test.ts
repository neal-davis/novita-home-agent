import { act, renderHook } from "@testing-library/react";
import { useElementInView } from "@/hooks/useElementInView";

describe("useElementInView", () => {
  let observeMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let triggerIntersect: (entries: { isIntersecting: boolean }[]) => void;

  beforeEach(() => {
    observeMock = jest.fn();
    disconnectMock = jest.fn();
    class IO {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        triggerIntersect = cb;
      }
      observe = observeMock;
      disconnect = disconnectMock;
      unobserve = jest.fn();
      takeRecords = () => [];
    }
    (
      window as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = IO;
    (
      global as unknown as { IntersectionObserver: unknown }
    ).IntersectionObserver = IO;
  });

  it("returns false and does not observe when element is null", () => {
    const { result } = renderHook(() => useElementInView(null));
    expect(result.current).toBe(false);
    expect(observeMock).not.toHaveBeenCalled();
  });

  it("observes the element and reflects intersection state", () => {
    const el = document.createElement("div");
    const { result } = renderHook(() => useElementInView(el));
    expect(observeMock).toHaveBeenCalledWith(el);

    act(() => triggerIntersect([{ isIntersecting: true }]));
    expect(result.current).toBe(true);

    act(() => triggerIntersect([{ isIntersecting: false }]));
    expect(result.current).toBe(false);
  });

  it("disconnects the observer on unmount", () => {
    const el = document.createElement("div");
    const { unmount } = renderHook(() => useElementInView(el));
    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
