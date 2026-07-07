import { act, render, screen } from "@testing-library/react";
import SpotState from "@/app/gpus-console/instances/components/spotState";

describe("SpotState", () => {
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

  it("renders the notified state label and a countdown", () => {
    const reclaim = Math.floor(Date.now() / 1000) + 125; // 2m05s ahead
    render(<SpotState state="notified" reclaimTime={reclaim} />);

    expect(screen.getByText("NOTIFIED")).toBeInTheDocument();
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("renders the reclaiming state label", () => {
    const reclaim = Math.floor(Date.now() / 1000) + 5;
    render(<SpotState state="reclaiming" reclaimTime={reclaim} />);
    expect(screen.getByText("RECLAIMING")).toBeInTheDocument();
    expect(screen.getByText("00:05")).toBeInTheDocument();
  });

  it("clamps the countdown to 00:00 once the reclaim time has passed", () => {
    const reclaim = Math.floor(Date.now() / 1000) - 10;
    render(<SpotState state="notified" reclaimTime={reclaim} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("ticks the countdown down as time advances", () => {
    const reclaim = Math.floor(Date.now() / 1000) + 70;
    render(<SpotState state="notified" reclaimTime={reclaim} />);
    expect(screen.getByText("01:10")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(screen.getByText("01:00")).toBeInTheDocument();
  });

  it("falls back to 'other' for unknown states", () => {
    const reclaim = Math.floor(Date.now() / 1000) + 30;
    render(<SpotState state="unknown" reclaimTime={reclaim} />);
    expect(screen.getByText("other")).toBeInTheDocument();
  });
});
