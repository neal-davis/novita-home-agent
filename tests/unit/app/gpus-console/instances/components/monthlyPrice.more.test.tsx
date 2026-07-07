import { render, screen } from "@testing-library/react";
import MonthlyPrice from "@/app/gpus-console/instances/components/monthlyPrice";

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

describe("MonthlyPrice more branches", () => {
  it("renders plural months/days and applies storage precision", () => {
    render(
      <MonthlyPrice
        monthlyPriceInfo={{
          instanceMonthPrice: 200000,
          instanceMonthPricePrecision: 1,
          instanceAmount: 40000,
          gpuNum: 4,
          month: 6,
          storageMonthPrice: 600000,
          storageMonthPricePrecision: 2,
          storageSize: 250,
          storageAmount: 90000,
          day: 12,
        }}
      />,
    );
    // gpuNum > 1 -> "GPUs", month > 1 -> "months"
    expect(screen.getByText(/4 GPUs/)).toBeInTheDocument();
    expect(screen.getAllByText(/months/).length).toBeGreaterThan(0);
    // day > 1 -> "days"
    expect(screen.getByText(/days/)).toBeInTheDocument();
    // storage unit price: 600000 / 2 / 10000 = 30.000
    expect(screen.getByText(/\$ 30\.000\/GB\/day/)).toBeInTheDocument();
    // storage size shown
    expect(screen.getByText(/250GB/)).toBeInTheDocument();
  });

  it("falls back to defaults for missing storage size, day and singular labels", () => {
    render(<MonthlyPrice monthlyPriceInfo={{ month: 1 }} />);
    // missing gpuNum -> renders "undefined GPU" with singular "GPU" label
    expect(screen.getByText(/undefined GPU/)).toBeInTheDocument();
    // month=1 -> "month" singular; day missing -> 0 -> "day" singular
    expect(screen.getByText(/0GB\*1/)).toBeInTheDocument();
    // GPU unit price default -> $ 0.00 /GPU/month
    expect(screen.getByText(/\$ 0\.00 \/GPU\/month/)).toBeInTheDocument();
    // storage amount default -> $ 0.000
    expect(screen.getByText("$ 0.000")).toBeInTheDocument();
  });

  it("uses '-' for month when month is falsy", () => {
    render(<MonthlyPrice monthlyPriceInfo={{ gpuNum: 2, storageSize: 50 }} />);
    // month undefined -> storage usage uses "-" fallback ("...50GB*-")
    expect(screen.getByText(/50GB\*-/)).toBeInTheDocument();
  });
});
