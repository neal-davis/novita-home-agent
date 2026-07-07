import { render } from "@testing-library/react";
import { ListSkeleton } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList/ListSkeleton";

describe("ListSkeleton", () => {
  it("renders 5 skeleton card rows with skeleton placeholders", () => {
    const { container } = render(<ListSkeleton />);
    // 5 card rows
    const cards = container.querySelectorAll(".rounded-lg.border");
    expect(cards.length).toBe(5);
    // many skeleton blocks present
    expect(container.querySelectorAll("div").length).toBeGreaterThan(10);
  });
});
