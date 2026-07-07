import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RenewInstance from "@/app/gpus-console/instances/components/renewInstance";
import { reqGetProductMonthlyPricing } from "@/api/gpu-instance/explore";

jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetProductMonthlyPricing: jest.fn(),
}));

jest.mock("@/app/gpus-console/instances/components/monthlyPrice", () => ({
  __esModule: true,
  default: ({ monthlyPriceInfo }: any) => (
    <div>monthly-price-details-{monthlyPriceInfo.month}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <div data-testid="select" data-value={value}>
      <button type="button" onClick={() => onValueChange?.("3")}>
        choose-3-months
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
  TableBody: ({ children }: any) => <>{children}</>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <button type="button" onClick={() => onCheckedChange?.(!checked)}>
      switch-{checked ? "on" : "off"}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/confirm-dialog", () => ({
  ConfirmDialog: ({ onConfirm, open }: any) =>
    open ? (
      <div role="dialog">
        <button onClick={onConfirm} type="button">
          dialog-confirm
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span>
      <span data-testid="tooltip-title">{title}</span>
      {children}
    </span>
  ),
}));

jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: jest.fn((value: string) => `formatted:${value}`),
}));

const mockReqGetProductMonthlyPricing =
  reqGetProductMonthlyPricing as jest.Mock;

describe("RenewInstance more branches", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockReqGetProductMonthlyPricing.mockResolvedValue({
      endTime: "1735689600",
      gpuNum: 2,
      instanceAmount: "1234500",
      instanceMonthPrice: "720000000",
      instanceMonthPricePrecision: 10000,
      month: 1,
      storageAmount: "67800",
      storageSize: 120,
    });
  });

  afterEach(() => consoleErrorSpy.mockRestore());

  // monthlyPrice entries here yield an effective discount < 10x (i.e. < full price),
  // so renderMonthValue should render the "% OFF" discount badge.
  function discountedInstanceInfo(overrides: Record<string, unknown> = {}) {
    return {
      autoRenew: false,
      autoRenewMonth: 1,
      endTime: "1733000000",
      gpuNum: 2,
      id: "renew-instance",
      instanceBasePrice: 200000,
      monthlyPrice: [
        // base monthly = (200000/100000)*24*30 = 1440; price/precision/10000 below that => discount
        { month: 1, price: 100000000, pricePrecision: 10000 },
        { month: 3, price: 250000000, pricePrecision: 10000 },
      ],
      productId: "product-a",
      productName: "RTX 4090",
      rootfsSize: 80,
      volumeMounts: [{ size: 40, type: "local" }],
      ...overrides,
    };
  }

  it("shows a discount badge when the effective monthly price is below full price", async () => {
    render(
      <RenewInstance
        finishForm={jest.fn()}
        instanceInfoObj={discountedInstanceInfo()}
      />,
    );
    await waitFor(() =>
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalled(),
    );
    expect(screen.getAllByText(/% OFF/).length).toBeGreaterThan(0);
  });

  it("omits the discount badge when price equals full monthly price", async () => {
    // price/precision/10000 == base monthly (1440) => ratio == 10 => no badge
    const fullPrice = {
      autoRenew: false,
      autoRenewMonth: 1,
      endTime: "1733000000",
      gpuNum: 2,
      id: "renew-instance",
      instanceBasePrice: 200000,
      monthlyPrice: [{ month: 1, price: 144000000000, pricePrecision: 10000 }],
      productId: "product-a",
      rootfsSize: 80,
      volumeMounts: [],
    };
    render(
      <RenewInstance finishForm={jest.fn()} instanceInfoObj={fullPrice} />,
    );
    await waitFor(() =>
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalled(),
    );
    expect(screen.queryAllByText(/% OFF/)).toHaveLength(0);
  });

  it("cancels and passes current params back to finishForm", async () => {
    const finishForm = jest.fn();
    render(
      <RenewInstance
        finishForm={finishForm}
        instanceInfoObj={discountedInstanceInfo()}
      />,
    );
    await waitFor(() =>
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalled(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ instanceId: "renew-instance", month: 1 }),
    );
  });

  it("skips state update when the pricing response is falsy", async () => {
    mockReqGetProductMonthlyPricing.mockResolvedValue(null);
    render(
      <RenewInstance
        finishForm={jest.fn()}
        instanceInfoObj={discountedInstanceInfo()}
      />,
    );
    await waitFor(() =>
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalled(),
    );
    // endTime stays "" -> Number("") = 0 -> not > 0 -> sliceUTCString never called for that row
    // unit price falls back to 0
    expect(screen.getByText("$ 0.00 /month")).toBeInTheDocument();
  });

  it("does not render expiration time when endTime is zero", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { sliceUTCString } = require("@/lib/utils/date");
    render(
      <RenewInstance
        finishForm={jest.fn()}
        instanceInfoObj={discountedInstanceInfo({ endTime: "0" })}
      />,
    );
    await waitFor(() =>
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalled(),
    );
    // current expiration row exists (type renew) but value is blank since endTime=0
    expect(screen.getByText("Current expiration time")).toBeInTheDocument();
    // sliceUTCString called only for monthlyPrice.endTime (>0), not the instance endTime=0
    const calledWithInstanceEnd = (sliceUTCString as jest.Mock).mock.calls.some(
      (c: any[]) => String(c[0]).includes("1970"),
    );
    expect(calledWithInstanceEnd).toBe(false);
  });

  it("renders the raw selected value when no matching month item exists", async () => {
    // monthlyPrice has only month 1; force select month 3 which is absent -> renderMonthValue else branch
    const info = {
      autoRenew: false,
      autoRenewMonth: 1,
      endTime: "1733000000",
      gpuNum: 1,
      id: "renew-instance",
      instanceBasePrice: 200000,
      monthlyPrice: [{ month: 1, price: 100000000, pricePrecision: 10000 }],
      productId: "product-a",
      rootfsSize: 80,
      volumeMounts: [],
    };
    render(<RenewInstance finishForm={jest.fn()} instanceInfoObj={info} />);
    await waitFor(() =>
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalled(),
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: "choose-3-months" })[0],
    );
    // raw "3" shown in trigger because month 3 not in monthlyPrice list
    await waitFor(() =>
      expect(screen.getByTestId("select")).toHaveAttribute("data-value", "3"),
    );
  });
});
