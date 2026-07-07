import { render, screen, within } from "@testing-library/react";
import GpuPrice from "@/app/pricing/components/GpuPrice";
import { NOVITA_URL } from "@/constants/urls";

jest.mock("@/app/components/button/Button", () => ({
  __esModule: true,
  default: ({
    children,
    link,
  }: {
    children: React.ReactNode;
    link?: string;
  }) => <a href={link}>{children}</a>,
}));

describe("GpuPrice", () => {
  it("renders on-demand discounts, 8x pricing and spot rows", () => {
    render(
      <GpuPrice
        gpuPriceList={[
          {
            gpuMemory: 80,
            instancePrice: {
              discount: "200000",
              price: "300000",
            },
            instanceSpotPrice: {
              discount: "100000",
            },
            productId: "a100",
            productName: "A100 SXM",
          },
        ]}
      />,
    );

    expect(screen.getAllByText("1x A100 SXM").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute(
      "href",
      NOVITA_URL.GPU_CONSOLE_EXPLORE,
    );
    expect(
      screen
        .getAllByRole("link", { name: "Spot Instance Info" })
        .some((link) => link.getAttribute("href") === NOVITA_URL.GPUS_SPOT),
    ).toBe(true);

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(5);
    expect(within(rows[1]).getByText("80 GB VRAM")).toBeInTheDocument();
    expect(within(rows[1]).getByText("$2.00/hr")).toBeInTheDocument();
    expect(within(rows[1]).getByText("$3.00/hr")).toBeInTheDocument();
    expect(within(rows[2]).getByText("$16.00/hr")).toBeInTheDocument();
    expect(within(rows[2]).getByText("$24.00/hr")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Spot")).toBeInTheDocument();
    expect(within(rows[3]).getByText("$1.00/hr")).toBeInTheDocument();
    expect(within(rows[4]).getByText("$8.00/hr")).toBeInTheDocument();

    const mobileCard = screen.getByTestId("gpu-price-mobile-card-a100");
    expect(within(mobileCard).getByText("Specification")).toBeInTheDocument();
    expect(within(mobileCard).getByText("80 GB VRAM")).toBeInTheDocument();
    expect(
      within(mobileCard).getByText("On-Demand · 1x GPU"),
    ).toBeInTheDocument();
    expect(within(mobileCard).getByText("$2.00/hr")).toBeInTheDocument();
    expect(within(mobileCard).getByText("Spot · 8x GPU")).toBeInTheDocument();
    expect(within(mobileCard).getByText("$8.00/hr")).toBeInTheDocument();
  });

  it("renders dash prices when on-demand discount is missing and omits spot rows", () => {
    render(
      <GpuPrice
        isConsole
        gpuPriceList={[
          {
            gpuMemory: 0,
            instancePrice: {
              price: "300000",
            },
            instanceSpotPrice: {
              discount: "0",
            },
            productId: "empty",
            productName: "Empty GPU",
          },
        ]}
      />,
    );

    expect(screen.queryByText("Spot")).not.toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(3);
    expect(
      within(screen.getByTestId("gpu-price-mobile-card-empty")).getAllByText(
        "-",
      ),
    ).toHaveLength(3);
  });
});
