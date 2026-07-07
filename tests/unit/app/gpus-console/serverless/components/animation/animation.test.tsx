import { render, screen, act } from "@testing-library/react";
import ServerlessReadyAnimation from "@/app/gpus-console/serverless/components/animation/animation";

describe("ServerlessReadyAnimation", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders the status label and an initial 0.0% value", () => {
    render(<ServerlessReadyAnimation />);
    expect(screen.getByText("Serverless Ready")).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("advances the percentage after the start delay and animation ticks", () => {
    // performance.now: first read (t0) is small, subsequent reads are past duration
    let calls = 0;
    const perfSpy = jest
      .spyOn(performance, "now")
      .mockImplementation(() => (calls++ === 0 ? 0 : 100000));
    const rafSpy = jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(performance.now());
        return 1 as unknown as number;
      });

    render(
      <ServerlessReadyAnimation target={50} durationMs={1000} delayMs={100} />,
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // p clamps to 1, so the value reaches the target (50.0%)
    expect(screen.getByText("50.0%")).toBeInTheDocument();

    rafSpy.mockRestore();
    perfSpy.mockRestore();
  });

  it("cleans up timers/raf on unmount without throwing", () => {
    const { unmount } = render(<ServerlessReadyAnimation />);
    expect(() => unmount()).not.toThrow();
  });
});
