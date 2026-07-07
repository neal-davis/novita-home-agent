import { render, screen, within } from "@testing-library/react";
import SandboxPrice from "@/app/pricing/components/SandboxPrice";
import { DOCS_URL } from "@/constants/urls";

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

describe("SandboxPrice", () => {
  it("renders CPU, memory and storage prices with discounts applied", () => {
    render(
      <SandboxPrice
        sandboxPriceInfo={{
          basePrice0: 200,
          basePrice1: 600,
          discountPrice0: 100,
          discountPrice1: 300,
          pricePrecision: 10,
        }}
        sandboxStorageInfo={{
          basePrice0: 500,
          discountPrice0: 0,
          pricePrecision: 10,
        }}
      />,
    );

    expect(
      screen.getAllByRole("heading", { name: "CPU" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("heading", { name: "Memory" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("heading", { name: "Storage" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Integration Guide" }),
    ).toHaveLength(3);
    screen
      .getAllByRole("link", { name: "Integration Guide" })
      .forEach((link) =>
        expect(link).toHaveAttribute("href", DOCS_URL.SANDBOX_PRICING),
      );

    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("1X CPU")).toBeInTheDocument();
    expect(within(rows[1]).getByText("$0.001/s")).toBeInTheDocument();
    expect(within(rows[1]).getByText("$0.002/s")).toBeInTheDocument();
    expect(within(rows[8]).getByText("8X CPU")).toBeInTheDocument();
    expect(within(rows[8]).getByText("$0.008/s")).toBeInTheDocument();

    expect(
      screen.getAllByText(
        "Valid values: multiples of 512 MiB, from 512 MiB to 8192 MiB",
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("$0.003/GiB/s").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$0.006/GiB/s").length).toBeGreaterThan(0);
    expect(within(rows[11]).getByText("512 MiB")).toBeInTheDocument();
    expect(within(rows[11]).getByText("$0.0015/s")).toBeInTheDocument();
    expect(within(rows[11]).getByText("$0.003/s")).toBeInTheDocument();

    expect(screen.getAllByText(/60 GB of free storage/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$0.005/GB/h").length).toBeGreaterThan(0);

    const cpuMobileCard = screen.getByTestId("sandbox-mobile-card-cpu");
    expect(within(cpuMobileCard).getByText("1X CPU")).toBeInTheDocument();
    expect(within(cpuMobileCard).getByText("$0.001/s")).toBeInTheDocument();
    expect(within(cpuMobileCard).getByText("8X CPU")).toBeInTheDocument();
    expect(
      within(cpuMobileCard).getAllByText("$0.008/s").length,
    ).toBeGreaterThan(0);

    const memoryMobileCard = screen.getByTestId("sandbox-mobile-card-memory");
    expect(
      within(memoryMobileCard).getByText(
        "Valid values: multiples of 512 MiB, from 512 MiB to 8192 MiB",
      ),
    ).toBeInTheDocument();
    expect(
      within(memoryMobileCard).getByText("$0.003/GiB/s"),
    ).toBeInTheDocument();

    const storageMobileCard = screen.getByTestId("sandbox-mobile-card-storage");
    expect(
      within(storageMobileCard).getByText(/60 GB of free storage/),
    ).toBeInTheDocument();
    expect(within(storageMobileCard).getByText("Free")).toBeInTheDocument();
  });

  it("updates displayed prices when incoming price props change", () => {
    const { rerender } = render(
      <SandboxPrice
        sandboxPriceInfo={{
          basePrice0: 100,
          basePrice1: 200,
          discountPrice0: 100,
          discountPrice1: 200,
          pricePrecision: 10,
        }}
        sandboxStorageInfo={{
          basePrice0: 100,
          discountPrice0: 100,
          pricePrecision: 10,
        }}
      />,
    );

    let rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("$0.001/s")).toBeInTheDocument();
    expect(within(rows[10]).getByText("$0.002/GiB/s")).toBeInTheDocument();
    expect(within(rows[15]).getByText("$0.001/GB/h")).toBeInTheDocument();

    rerender(
      <SandboxPrice
        sandboxPriceInfo={{
          basePrice0: 200,
          basePrice1: 400,
          discountPrice0: 200,
          discountPrice1: 400,
          pricePrecision: 10,
        }}
        sandboxStorageInfo={{
          basePrice0: 300,
          discountPrice0: 300,
          pricePrecision: 10,
        }}
      />,
    );

    rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("$0.002/s")).toBeInTheDocument();
    expect(within(rows[10]).getByText("$0.004/GiB/s")).toBeInTheDocument();
    expect(within(rows[15]).getByText("$0.003/GB/h")).toBeInTheDocument();
  });
});
