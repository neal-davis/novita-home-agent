import { act, fireEvent, render, screen } from "@testing-library/react";
import CopyBtn from "@/components/ui/standard/code-with-btn";

const trackClick = jest.fn();
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: (...args: any[]) => trackClick(...args) },
}));

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

describe("code-with-btn CopyBtn", () => {
  it("renders a Copy button with the copy icon", () => {
    const { container } = render(<CopyBtn content="abc" />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(container.querySelector(".icon-copy")).toBeInTheDocument();
  });

  it("shows the success state on copy then reverts", () => {
    const { container } = render(<CopyBtn content="abc" />);
    fireEvent.click(container.querySelector("span")!);
    expect(container.querySelector(".icon-copy")).not.toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(container.querySelector(".icon-copy")).toBeInTheDocument();
  });

  it("tracks analytics when an id is provided", () => {
    const { container } = render(<CopyBtn content="abc" id="cwb" />);
    fireEvent.click(container.querySelector("span")!);
    expect(trackClick).toHaveBeenCalledWith("cwb");
  });
});
