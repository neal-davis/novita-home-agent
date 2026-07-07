import { act, renderHook } from "@testing-library/react";
import { useCampaignCarousel } from "@/app/components/campaigns/useCampaignCarousel";

describe("useCampaignCarousel more branches", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    act(() => jest.runOnlyPendingTimers());
    jest.useRealTimers();
  });

  it("goPrev and goNext are no-ops with a single item", () => {
    const { result } = renderHook(() =>
      useCampaignCarousel({ items: [{ id: "only" }], intervalMs: 3000 }),
    );
    act(() => result.current.goPrev());
    expect(result.current.currentIndex).toBe(0);
    act(() => result.current.goNext());
    expect(result.current.currentIndex).toBe(0);
  });

  it("goPrev and goNext are no-ops with an empty list", () => {
    const { result } = renderHook(() =>
      useCampaignCarousel({ items: [], intervalMs: 3000 }),
    );
    act(() => result.current.goPrev());
    act(() => result.current.goNext());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.currentItem).toBeUndefined();
  });
});
