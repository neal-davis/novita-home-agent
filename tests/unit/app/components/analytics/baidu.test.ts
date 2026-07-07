import { trackBtnClick, trackEvent } from "@/app/components/analytics/baidu";

jest.mock("@/app/components/analytics/utils", () => ({
  getUTMParams: () => ({ utm_source: "test" }),
}));

describe("analytics/baidu", () => {
  beforeEach(() => {
    (window as any)._hmt = { push: jest.fn() };
    (window as any).insiteReferrer = "https://ref.example.com/path";
    Object.defineProperty(window, "location", {
      value: new URL("https://novita.ai/pricing?a=1"),
      writable: true,
    });
    document.title = "Pricing";
  });

  it("trackEvent pushes a _trackCustomEvent tuple onto _hmt", () => {
    trackEvent("my_event", { foo: "bar" });
    expect((window as any)._hmt.push).toHaveBeenCalledWith([
      "_trackCustomEvent",
      "my_event",
      { foo: "bar" },
    ]);
  });

  it("trackBtnClick forwards through trackEvent with enriched payload", () => {
    trackBtnClick("btn-1", { extra: 9 });
    const call = (window as any)._hmt.push.mock.calls[0][0];
    expect(call[0]).toBe("_trackCustomEvent");
    expect(call[1]).toBe("btn_click");
    expect(call[2]).toMatchObject({
      element_id: "btn-1",
      referrer: "https://ref.example.com/path",
      page_title: "Pricing",
      page_path: "/pricing",
      utm_source: "test",
      extra: 9,
    });
  });

  it("does not throw when _hmt is undefined", () => {
    (window as any)._hmt = undefined;
    expect(() => trackEvent("safe")).not.toThrow();
  });
});
