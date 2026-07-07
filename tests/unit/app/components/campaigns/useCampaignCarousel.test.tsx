import { act, renderHook } from "@testing-library/react";
import { useCampaignCarousel } from "@/app/components/campaigns/useCampaignCarousel";

describe("useCampaignCarousel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("does not rotate when there is only one item", () => {
    const { result } = renderHook(() =>
      useCampaignCarousel({
        items: [{ id: "only" }],
        intervalMs: 3000,
      }),
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isCarousel).toBe(false);
    expect(result.current.total).toBe(1);

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("auto-rotates and supports previous / next when there are multiple items", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const { result } = renderHook(() =>
      useCampaignCarousel({
        items,
        intervalMs: 3000,
      }),
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isCarousel).toBe(true);
    expect(result.current.total).toBe(3);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.goNext();
    });

    expect(result.current.currentIndex).toBe(2);

    act(() => {
      result.current.goPrev();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("wraps around when navigating manually across the ends of the list", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const { result } = renderHook(() =>
      useCampaignCarousel({
        items,
        intervalMs: 3000,
      }),
    );

    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.goPrev();
    });

    expect(result.current.currentIndex).toBe(2);

    act(() => {
      result.current.goNext();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("resets out-of-range index when the item list shrinks", () => {
    const { result, rerender } = renderHook(
      ({ items }) =>
        useCampaignCarousel({
          items,
          intervalMs: 3000,
        }),
      {
        initialProps: {
          items: [{ id: "a" }, { id: "b" }, { id: "c" }],
        },
      },
    );

    act(() => {
      result.current.goNext();
      result.current.goNext();
    });

    expect(result.current.currentIndex).toBe(2);

    rerender({
      items: [{ id: "a" }],
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isCarousel).toBe(false);
  });
});
