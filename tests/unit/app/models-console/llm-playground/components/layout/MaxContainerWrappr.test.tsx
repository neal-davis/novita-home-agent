import { render, screen } from "@testing-library/react";
import { MaxContainerWrapper } from "@/app/models-console/llm-playground/components/layout/MaxContainerWrappr";

describe("MaxContainerWrapper", () => {
  it("renders children with a default 100% max width", () => {
    render(
      <MaxContainerWrapper>
        <span>child</span>
      </MaxContainerWrapper>,
    );
    const child = screen.getByText("child");
    const wrapper = child.parentElement as HTMLElement;
    expect(wrapper).toHaveStyle({ maxWidth: "100%" });
    expect(wrapper.className).toContain("mx-auto");
  });

  it("applies a numeric width and extra className", () => {
    render(
      <MaxContainerWrapper width={700} className="extra">
        <span>child</span>
      </MaxContainerWrapper>,
    );
    const wrapper = screen.getByText("child").parentElement as HTMLElement;
    expect(wrapper).toHaveStyle({ maxWidth: "700px" });
    expect(wrapper.className).toContain("extra");
  });
});
