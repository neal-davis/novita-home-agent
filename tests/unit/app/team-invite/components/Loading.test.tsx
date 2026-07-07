import * as React from "react";
import { render } from "@testing-library/react";
import Loading from "@/app/team-invite/components/Loading";

describe("team-invite Loading", () => {
  it("renders three skeleton rows", () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(3);
  });
});
