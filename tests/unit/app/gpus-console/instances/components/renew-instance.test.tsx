import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RenewInstance from "@/app/gpus-console/instances/components/renewInstance";
import { reqGetProductMonthlyPricing } from "@/api/gpu-instance/explore";

jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetProductMonthlyPricing: jest.fn(),
}));

jest.mock("@/app/gpus-console/instances/components/monthlyPrice", () => ({
  __esModule: true,
  default: ({ monthlyPriceInfo }: { monthlyPriceInfo: { month: number } }) => (
    <div>monthly-price-details-{monthlyPriceInfo.month}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
  }) => (
    <div data-testid="select" data-value={value}>
      <button type="button" onClick={() => onValueChange?.("3")}>
        choose-3-months
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TableCell: ({ children }: { children: React.ReactNode }) => (
    <td>{children}</td>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
  ),
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <button type="button" onClick={() => onCheckedChange?.(!checked)}>
      switch-{checked ? "on" : "off"}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/confirm-dialog", () => ({
  ConfirmDialog: ({
    onConfirm,
    open,
  }: {
    onConfirm: () => void;
    open: boolean;
  }) =>
    open ? (
      <div role="dialog">
        <button onClick={onConfirm} type="button">
          dialog-confirm
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: React.ReactNode;
  }) => (
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

describe("RenewInstance", () => {
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
      storagePrice: "67800",
      storagePricePricePrecision: 10000,
      storageSize: 120,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  function createInstanceInfo(overrides: Record<string, unknown> = {}) {
    return {
      autoRenew: false,
      autoRenewMonth: 1,
      endTime: "1733000000",
      gpuNum: 2,
      id: "renew-instance",
      instanceBasePrice: 200000,
      monthlyPrice: [
        { month: 1, price: 720000000, pricePrecision: 10000 },
        { month: 3, price: 1800000000, pricePrecision: 10000 },
      ],
      productId: "product-a",
      productName: "RTX 4090",
      rootfsSize: 80,
      volumeMounts: [{ size: 40, type: "local" }],
      ...overrides,
    };
  }

  it("loads monthly pricing and confirms renewal without auto-renew fields", async () => {
    const finishForm = jest.fn();

    render(
      <RenewInstance
        finishForm={finishForm}
        instanceInfoObj={createInstanceInfo()}
      />,
    );

    await waitFor(() => {
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalledWith({
        gpuNum: 2,
        instanceId: "renew-instance",
        month: 1,
        productId: "product-a",
        storageSize: 120,
      });
    });

    expect(screen.getByText("Renew Subscription Instance")).toBeInTheDocument();
    expect(screen.getByText("renew-instance")).toBeInTheDocument();
    expect(screen.getByText("$ 123.45")).toBeInTheDocument();
    expect(screen.getByText("$ 6.780")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: "dialog-confirm" }));

    expect(finishForm).toHaveBeenCalledWith(true, {
      autoRenew: undefined,
      autoRenewMonth: undefined,
      instanceId: "renew-instance",
      month: 1,
    });
  });

  it("updates selected renewal duration and keeps auto-renew choices for subscription conversion", async () => {
    const finishForm = jest.fn();

    render(
      <RenewInstance
        finishForm={finishForm}
        instanceInfoObj={createInstanceInfo()}
        type="transToMonthly"
      />,
    );

    await screen.findByText("Switch to Subscription");

    fireEvent.click(
      screen.getAllByRole("button", { name: "choose-3-months" })[0],
    );

    await waitFor(() => {
      expect(mockReqGetProductMonthlyPricing).toHaveBeenLastCalledWith({
        gpuNum: 2,
        instanceId: "renew-instance",
        month: 3,
        productId: "product-a",
        storageSize: 120,
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "switch-off" }));
    expect(
      screen.getByText("We will attempt charge 3 days before expiration"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: "dialog-confirm" }));

    expect(finishForm).toHaveBeenCalledWith(true, {
      autoRenew: true,
      autoRenewMonth: 3,
      instanceId: "renew-instance",
      month: 3,
    });
  });

  it("renders the processing state instead of allowing confirmation", () => {
    const finishForm = jest.fn();

    render(
      <RenewInstance
        btnLoading
        finishForm={finishForm}
        instanceInfoObj={createInstanceInfo()}
      />,
    );

    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Confirm" }),
    ).not.toBeInTheDocument();
  });
});
