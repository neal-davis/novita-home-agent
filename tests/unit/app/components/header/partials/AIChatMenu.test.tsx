import { act, fireEvent, render, screen } from "@testing-library/react";
import AIChatMenu from "@/app/components/header/partials/AIChatMenu";

let lastOpenChange: ((open: boolean) => void) | undefined;

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, onOpenChange }: any) => {
    lastOpenChange = onOpenChange;
    return <div>{children}</div>;
  },
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/components/Loading/Loading", () => ({
  __esModule: true,
  default: ({ text }: any) => <div data-testid="loading">{text}</div>,
}));

describe("AIChatMenu", () => {
  it("renders the Ask AI trigger and the chatbot iframe", () => {
    render(<AIChatMenu />);
    expect(screen.getByText("Ask AI")).toBeInTheDocument();
    const iframe = document.querySelector("iframe");
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("chatbase.co"),
    );
  });

  it("shows the loading state initially and hides it after the iframe loads", () => {
    render(<AIChatMenu />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
    fireEvent.load(document.querySelector("iframe")!);
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
  });

  it("resets the loading state when the dialog reopens", () => {
    render(<AIChatMenu />);
    fireEvent.load(document.querySelector("iframe")!);
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    // Reopen the dialog -> loading should come back.
    act(() => {
      lastOpenChange?.(true);
    });
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });
});
