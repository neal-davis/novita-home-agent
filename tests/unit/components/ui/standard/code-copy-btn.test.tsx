import { act, fireEvent, render, screen } from "@testing-library/react";
import CopyBtn from "@/components/ui/standard/code-copy-btn";

const trackClick = jest.fn();
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: (...args: any[]) => trackClick(...args) },
}));

// react-copy-to-clipboard renders children and fires onCopy on click.
jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ children, onCopy }: any) => (
    <span onClick={onCopy}>{children}</span>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("CopyBtn", () => {
  it("renders the copy icon initially", () => {
    const { container } = render(<CopyBtn content="hello" />);
    expect(container.querySelector(".icon-copy")).toBeInTheDocument();
  });

  it("swaps to the success icon on copy then reverts after the timeout", () => {
    const { container } = render(<CopyBtn content="hello" />);
    fireEvent.click(container.querySelector("span")!);
    // success icon present, copy icon gone
    expect(container.querySelector(".icon-copy")).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(container.querySelector(".icon-copy")).toBeInTheDocument();
  });

  it("tracks analytics when an id is provided and calls onCopySuccess", () => {
    const onCopySuccess = jest.fn();
    const { container } = render(
      <CopyBtn content="x" id="copy-id" onCopySuccess={onCopySuccess} />,
    );
    fireEvent.click(container.querySelector("span")!);
    expect(trackClick).toHaveBeenCalledWith("copy-id");
    expect(onCopySuccess).toHaveBeenCalled();
  });

  it("does not track analytics when no id is provided", () => {
    const { container } = render(<CopyBtn content="x" />);
    fireEvent.click(container.querySelector("span")!);
    expect(trackClick).not.toHaveBeenCalled();
  });
});
