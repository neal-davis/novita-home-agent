import { render, screen } from "@testing-library/react";
import TieredPricingTable from "@/app/components/ModelDetail/ModelFeatures/TieredPricingTable";

describe("TieredPricingTable", () => {
  it("renders cache price headers with model detail label copy", () => {
    render(
      <TieredPricingTable
        configs={[
          {
            cache_creation_1_hour_input_pricing: { pricePerM: 2000 },
            cache_creation_input_pricing: { pricePerM: 1000 },
            cache_read_input_pricing: { pricePerM: 500 },
            input_pricing: { pricePerM: 10000 },
            max_tokens: 1000,
            min_tokens: 0,
            output_pricing: { pricePerM: 20000 },
          } as any,
        ]}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: "Cache Write(5m)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Cache Write(1h)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Cache Read" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Cached writes(5m)")).not.toBeInTheDocument();
    expect(screen.queryByText("Cached writes(1h)")).not.toBeInTheDocument();
    expect(screen.queryByText("Cached reads")).not.toBeInTheDocument();
  });
});
