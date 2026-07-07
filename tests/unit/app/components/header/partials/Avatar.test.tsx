import { render } from "@testing-library/react";
import Avatar from "@/app/components/header/partials/Avatar";

describe("Avatar", () => {
  it("renders a single-user icon by default with the default size", () => {
    const { container } = render(<Avatar />);
    const span = container.querySelector("span")!;
    expect(span).toHaveStyle({ width: "40px", height: "40px" });
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies a custom size", () => {
    const { container } = render(<Avatar size={60} />);
    const span = container.querySelector("span")!;
    expect(span).toHaveStyle({ width: "60px", height: "60px" });
  });

  it("merges a custom className", () => {
    const { container } = render(<Avatar className="extra-class" />);
    expect(container.querySelector("span")!.className).toContain("extra-class");
  });

  it("renders a team icon when team prop is set", () => {
    const { container: solo } = render(<Avatar />);
    const { container: team } = render(<Avatar team />);
    // The team and solo variants render different lucide icons.
    expect(team.querySelector("svg")?.outerHTML).not.toBe(
      solo.querySelector("svg")?.outerHTML,
    );
  });
});
