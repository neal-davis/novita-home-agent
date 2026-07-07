import * as React from "react";
import { render } from "@testing-library/react";
import Loading from "@/app/referral/components/Loading";

describe("referral Loading", () => {
  it("renders three skeleton placeholders", () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(3);
  });
});
