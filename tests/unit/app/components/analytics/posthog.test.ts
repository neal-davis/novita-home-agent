import {
  identifyPostHog,
  capturePostHog,
} from "@/app/components/analytics/posthog";

describe("analytics/posthog", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    delete (window as any).posthog;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("identifyPostHog", () => {
    it("identifies immediately when posthog is ready and id differs", () => {
      const identify = jest.fn();
      (window as any).posthog = {
        identify,
        get_distinct_id: () => "other",
      };

      identifyPostHog({ uuid: "abc" });

      expect(identify).toHaveBeenCalledWith("abc", { name: "abc" });
    });

    it("skips identify when distinct id already matches", () => {
      const identify = jest.fn();
      (window as any).posthog = {
        identify,
        get_distinct_id: () => "abc",
      };

      identifyPostHog({ uuid: "abc" });
      expect(identify).not.toHaveBeenCalled();
    });

    it("does nothing when uuid is empty", () => {
      const identify = jest.fn();
      (window as any).posthog = { identify };
      identifyPostHog({ uuid: "" });
      expect(identify).not.toHaveBeenCalled();
    });

    it("retries on a timer until posthog becomes available", () => {
      identifyPostHog({ uuid: "later" });

      const identify = jest.fn();
      (window as any).posthog = {
        identify,
        get_distinct_id: () => "x",
      };

      jest.advanceTimersByTime(500);
      expect(identify).toHaveBeenCalledWith("later", { name: "later" });
    });

    it("gives up after the max retries without throwing", () => {
      identifyPostHog({ uuid: "never" });
      expect(() => jest.advanceTimersByTime(500 * 31)).not.toThrow();
    });
  });

  describe("capturePostHog", () => {
    it("captures immediately when posthog is ready", () => {
      const capture = jest.fn();
      (window as any).posthog = { capture };
      capturePostHog("evt", { a: 1 });
      expect(capture).toHaveBeenCalledWith("evt", { a: 1 });
    });

    it("does nothing for an empty event name", () => {
      const capture = jest.fn();
      (window as any).posthog = { capture };
      capturePostHog("");
      expect(capture).not.toHaveBeenCalled();
    });

    it("retries capture until posthog is available", () => {
      capturePostHog("delayed", { b: 2 });
      const capture = jest.fn();
      (window as any).posthog = { capture };
      jest.advanceTimersByTime(500);
      expect(capture).toHaveBeenCalledWith("delayed", { b: 2 });
    });
  });
});
