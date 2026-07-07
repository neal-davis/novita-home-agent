import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TimeInterval } from "@/app/user/components/time-interval";

describe("TimeInterval", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders children when idle and triggers onClick on click", () => {
    const onClick = jest.fn();
    render(<TimeInterval onClick={onClick}>Send code</TimeInterval>);
    expect(screen.getByText("Send code")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Send code"));
    expect(onClick).toHaveBeenCalled();
  });

  it("counts down after a click and ignores further clicks while counting", () => {
    const onClick = jest.fn();
    render(
      <TimeInterval max={3} onClick={onClick}>
        Send code
      </TimeInterval>,
    );
    fireEvent.click(screen.getByText("Send code"));
    expect(screen.getByText("3s")).toBeInTheDocument();

    fireEvent.click(screen.getByText("3s"));
    expect(onClick).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("2s")).toBeInTheDocument();
  });

  it("starts the countdown immediately when immediate is set", () => {
    render(
      <TimeInterval max={5} immediate>
        Resend
      </TimeInterval>,
    );
    expect(screen.getByText("5s")).toBeInTheDocument();
  });
});
