import * as icons from "@/lib/icons";
import { render } from "@testing-library/react";

describe("lib/icons barrel", () => {
  it("re-exports all icon components", () => {
    for (const name of [
      "Affiliate",
      "Safari",
      "Clock",
      "Chart",
      "CircleCheck",
      "Menu",
    ]) {
      expect((icons as Record<string, unknown>)[name]).toBeDefined();
    }
  });

  it("each icon renders without crashing", () => {
    Object.values(icons).forEach((Icon) => {
      const Comp = Icon as React.ComponentType;
      const { unmount } = render(<Comp />);
      unmount();
    });
  });
});
