import { act, fireEvent, render, screen } from "@testing-library/react";
import { CopyButton } from "@/app/models-console/multimodal-playground/components/CopyButton";

describe("CopyButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows 'Copy' initially", () => {
    render(<CopyButton content="hello" />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("writes content to clipboard and flips to 'Copied' on click", () => {
    render(<CopyButton content="hello" />);
    fireEvent.click(screen.getByRole("button"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
    expect(screen.getByText("Copied")).toBeInTheDocument();
  });

  it("reverts to 'Copy' after the 2s timeout", () => {
    render(<CopyButton content="hello" />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Copied")).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });
});
