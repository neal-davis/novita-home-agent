import { render, screen } from "@testing-library/react";
import HeroDecoration from "@/app/homepage/components/HeroDecoration";

describe("HeroDecoration", () => {
  it("keeps connection lines hidden before CSS animation starts", () => {
    const { container } = render(<HeroDecoration />);

    const lines = container.querySelectorAll(".hero-decoration-line");
    expect(lines).toHaveLength(3);

    lines.forEach((line) => {
      expect(line).toHaveAttribute("stroke-dasharray", "1");
      expect(line).toHaveAttribute("stroke-dashoffset", "1");
    });
  });

  it("keeps anchor labels hidden before CSS animation starts", () => {
    render(<HeroDecoration />);

    ["Model APIs", "Agent Sandbox", "GPU Cloud"].forEach((label) => {
      expect(screen.getByText(label).parentElement).toHaveStyle({
        opacity: "0",
      });
    });
  });
});
