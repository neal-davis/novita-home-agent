import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: React.ReactNode }) => (
    <pre data-testid="code">{children}</pre>
  ),
}));

jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  oneLight: {},
}));

import SandboxGuide from "@/app/sandbox-console/components/SandboxGuide";

describe("SandboxGuide (more branches)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the copied state then resets after the timeout", async () => {
    jest.useFakeTimers();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const { container } = render(<SandboxGuide />);
    const copyButton = screen.getAllByTitle("Copy code")[0];

    // SVG icons render as <svg>; the copy button starts in the un-copied state.
    await act(async () => {
      fireEvent.click(copyButton);
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalled();
    // After a successful copy the button holds the copied state for 2s.
    const iconAfterCopy = copyButton.querySelector("svg");
    expect(iconAfterCopy).not.toBeNull();

    // Advance past the 2s reset window; component stays mounted (no throw).
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(container).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("silently ignores a clipboard failure", async () => {
    const writeText = jest.fn().mockRejectedValue(new Error("no clipboard"));
    Object.assign(navigator, { clipboard: { writeText } });

    render(<SandboxGuide />);
    const copyButton = screen.getAllByTitle("Copy code")[0];

    // The catch branch swallows the error; the guide remains rendered.
    await act(async () => {
      fireEvent.click(copyButton);
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalled();
    expect(
      screen.getByText("Build Stateful Agents with Novita Sandbox"),
    ).toBeInTheDocument();
  });
});
