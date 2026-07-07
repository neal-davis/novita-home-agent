import { render, screen } from "@testing-library/react";
import MonthlyPrice from "@/app/gpus-console/instances/components/monthlyPrice";

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

describe("MonthlyPrice", () => {
  it("renders GPU and storage billing line items", () => {
    render(
      <MonthlyPrice
        monthlyPriceInfo={{
          instanceMonthPrice: 200000,
          instanceMonthPricePrecision: 1,
          instanceAmount: 40000,
          gpuNum: 2,
          month: 3,
          storageMonthPrice: 100000,
          storageMonthPricePrecision: 1,
          storageSize: 100,
          storageAmount: 30000,
          day: 5,
        }}
      />,
    );
    expect(screen.getByText("GPU fee")).toBeInTheDocument();
    expect(screen.getByText(/\$ 20\.00 \/GPU\/month/)).toBeInTheDocument();
    expect(screen.getByText(/2 GPUs/)).toBeInTheDocument();
    expect(screen.getByText("$ 4.00")).toBeInTheDocument();
    expect(
      screen.getByText("Storage fee (beyond free quota)"),
    ).toBeInTheDocument();
    expect(screen.getByText("$ 3.000")).toBeInTheDocument();
  });

  it("renders singular GPU/month labels and zero defaults", () => {
    render(<MonthlyPrice monthlyPriceInfo={{ gpuNum: 1, month: 1, day: 1 }} />);
    expect(screen.getByText(/1 GPU/)).toBeInTheDocument();
    expect(screen.getByText(/\$ 0\.00 \/GPU\/month/)).toBeInTheDocument();
  });
});
