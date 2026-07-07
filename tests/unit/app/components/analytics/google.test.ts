import { trackBtnClick, trackEvent } from "@/app/components/analytics/google";

jest.mock("@/app/components/analytics/utils", () => ({
  getUTMParams: () => ({ utm_medium: "cpc" }),
}));

describe("analytics/google", () => {
  beforeEach(() => {
    (window as any).gtag = jest.fn();
    (window as any).insiteReferrer = "https://ref.example.com/x";
    Object.defineProperty(window, "location", {
      value: new URL("https://novita.ai/gpus"),
      writable: true,
    });
    document.title = "GPUs";
  });

  it("trackEvent calls window.gtag with event name and data", () => {
    trackEvent("page_view", { page: "home" });
    expect((window as any).gtag).toHaveBeenCalledWith("event", "page_view", {
      page: "home",
    });
  });

  it("trackBtnClick enriches and emits a btn_click event", () => {
    trackBtnClick("g-btn", { extra: 1 });
    expect((window as any).gtag).toHaveBeenCalledWith(
      "event",
      "btn_click",
      expect.objectContaining({
        element_id: "g-btn",
        page_path: "/gpus",
        page_title: "GPUs",
        utm_medium: "cpc",
        extra: 1,
      }),
    );
  });

  it("does not throw when gtag is missing", () => {
    (window as any).gtag = undefined;
    expect(() => trackEvent("noop")).not.toThrow();
  });
});
