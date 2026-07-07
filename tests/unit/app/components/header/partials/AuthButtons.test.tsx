import { fireEvent, render, screen } from "@testing-library/react";
import { AuthButtons } from "@/app/components/header/partials/AuthButtons";

jest.mock("next/navigation", () => ({
  usePathname: () => "/pricing",
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

describe("AuthButtons", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("renders both Log In and Get Started buttons", () => {
    render(<AuthButtons onLogin={jest.fn()} onGetStarted={jest.fn()} />);
    expect(screen.getByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("calls onLogin with the current path when no hash present", () => {
    const onLogin = jest.fn();
    render(<AuthButtons onLogin={onLogin} onGetStarted={jest.fn()} />);
    fireEvent.click(screen.getByText("Log In"));
    expect(onLogin).toHaveBeenCalledWith("/pricing");
  });

  it("calls onGetStarted with path + hash when a hash is present", () => {
    window.location.hash = "#section";
    const onGetStarted = jest.fn();
    render(<AuthButtons onLogin={jest.fn()} onGetStarted={onGetStarted} />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(onGetStarted).toHaveBeenCalledWith("/pricing#section");
  });
});
