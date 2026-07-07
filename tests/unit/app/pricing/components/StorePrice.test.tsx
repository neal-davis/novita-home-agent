import { render, screen, within } from "@testing-library/react";
import StorePrice from "@/app/pricing/components/StorePrice";

describe("StorePrice", () => {
  it("renders storage billing rows with precision-adjusted prices", () => {
    render(
      <StorePrice
        isConsole
        price={{
          localStoragePrice: 25000,
          networkStoragePrice: 75000,
          pricePrecision: 5,
          rootfsStorageFreeSize: 30,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Storage Resources" }),
    ).toHaveClass("text-sm");

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(4);
    expect(
      within(rows[0]).getByRole("columnheader", { name: "Billing Item" }),
    ).toBeInTheDocument();

    expect(within(rows[1]).getByText("Container Disk")).toBeInTheDocument();
    expect(
      within(rows[1]).getByText(/Supports 30GB free quota/),
    ).toBeInTheDocument();
    expect(
      within(rows[1]).getByText(/capacity: \$0.5\/GB\/day/),
    ).toBeInTheDocument();

    expect(within(rows[2]).getByText("Volume Disk")).toBeInTheDocument();
    expect(
      within(rows[2]).getByText("Unit price: $0.5/GB/day"),
    ).toBeInTheDocument();

    expect(within(rows[3]).getByText("Network Volume")).toBeInTheDocument();
    expect(
      within(rows[3]).getByText("Unit price: $1.5/GB/day"),
    ).toBeInTheDocument();

    const mobileCards = screen.getAllByTestId("store-price-mobile-card");
    expect(mobileCards).toHaveLength(3);
    expect(
      within(mobileCards[0]).getByText("Container Disk"),
    ).toBeInTheDocument();
    expect(
      within(mobileCards[0]).getByText(/Supports 30GB free quota/),
    ).toBeInTheDocument();
    expect(
      within(mobileCards[0]).getByText(/capacity: \$0.5\/GB\/day/),
    ).toBeInTheDocument();
    expect(
      within(mobileCards[2]).getByText("Network Volume"),
    ).toBeInTheDocument();
    expect(
      within(mobileCards[2]).getByText("Unit price: $1.5/GB/day"),
    ).toBeInTheDocument();
  });

  it("falls back to a dash when rootfs free quota is missing", () => {
    render(
      <StorePrice
        price={{
          localStoragePrice: 10000,
          networkStoragePrice: 20000,
          pricePrecision: 10,
        }}
      />,
    );

    expect(
      screen.getAllByText(/Supports -GB free quota/).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Unit price/).length).toBeGreaterThanOrEqual(3);
  });
});
