import { render, screen } from "@testing-library/react";
import MultimodalPricingTable from "@/app/components/ModelDetail/ModelFeatures/MultimodalPricingTable";

describe("MultimodalPricingTable", () => {
  it("renders text and audio pricing with static modal labels", () => {
    render(
      <MultimodalPricingTable
        pricing={{
          input_price: [
            {
              modals: ["text"],
              input_token_base_price: 20000,
              input_token_discount_price: 10000,
            },
            {
              modals: ["audio"],
              input_token_base_price: 40000,
              input_token_discount_price: 30000,
            },
          ],
          output_price: [
            {
              modals: ["text"],
              output_token_base_price: 60000,
              output_token_discount_price: 50000,
            },
            {
              modals: ["audio"],
              output_token_base_price: 80000,
              output_token_discount_price: 70000,
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: "Text" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Audio" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$1 /M tokens")).toBeInTheDocument();
    expect(screen.getByText("$5 /M tokens")).toBeInTheDocument();
    expect(screen.getByText("$3 /M tokens")).toBeInTheDocument();
    expect(screen.getByText("$7 /M tokens")).toBeInTheDocument();
    expect(screen.queryAllByText("/")).toHaveLength(1);
  });
});
