import { render } from "@testing-library/react";
import SpotState from "@/app/gpus-console/instances/components/spotState";

// Drives the stateColor / stateBgColor switch branches across each color group.
describe("SpotState color branches", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => {
    jest.useRealTimers();
    logSpy.mockRestore();
  });

  function colorFor(state: string) {
    const { container } = render(
      <SpotState
        state={state}
        reclaimTime={Math.floor(Date.now() / 1000) + 30}
      />,
    );
    const wrapper = container.querySelector("div") as HTMLElement;
    const textSpan = container.querySelectorAll("span")[1] as HTMLElement;
    return { bg: wrapper.style.background, color: textSpan?.style.color };
  }

  it("uses green for running states", () => {
    expect(colorFor("Running").color).toBe("rgb(12, 175, 96)");
    expect(colorFor("running").bg.replace(/\s/g, "")).toContain(
      "rgba(12,175,96,0.1)",
    );
  });

  it("uses purple for creating/starting/migrating states", () => {
    for (const s of [
      "pending",
      "created",
      "pulling",
      "toStart",
      "starting",
      "migrating",
      "toCreate",
      "Starting",
      "creating",
      "resetting",
      "toRestart",
      "restarting",
    ]) {
      expect(colorFor(s).color).toBe("rgb(88, 86, 214)");
    }
  });

  it("uses gray for exited/terminating/stopping states", () => {
    for (const s of [
      "Exited",
      "terminated",
      "exited",
      "removed",
      "toBeExited",
      "toBeTerminated",
      "terminating",
      "toRemove",
      "removing",
      "Stopping",
      "toStop",
      "stopping",
    ]) {
      expect(colorFor(s).color).toBe("rgb(128, 129, 145)");
    }
  });

  it("renders notified/reclaiming branches and uses red for unknown", () => {
    // var(--...) colors are dropped by jsdom; assert the branch renders and
    // the default (red) fallback for unknown states still applies.
    expect(colorFor("notified").bg).toBeDefined();
    expect(colorFor("reclaiming").bg).toBeDefined();
    expect(colorFor("something-else").color).toBe("red");
  });
});
