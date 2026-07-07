import { render } from "@testing-library/react";
import GpuChipPathDrawAnimation from "@/app/gpus-console/instances/components/animation/animation";

describe("GpuChipPathDrawAnimation", () => {
  it("renders the animated GPU chip svg scene", () => {
    const { container } = render(<GpuChipPathDrawAnimation />);
    expect(container.querySelector("svg.gpu-svg")).toBeInTheDocument();
    expect(container.querySelectorAll(".draw-pin").length).toBeGreaterThan(0);
  });
});
