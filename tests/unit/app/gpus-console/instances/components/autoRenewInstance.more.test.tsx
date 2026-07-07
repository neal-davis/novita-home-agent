import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AutoRenewInstance from "@/app/gpus-console/instances/components/autoRenewInstance";
import { reqGetProductMonthlyPricing } from "@/api/gpu-instance/explore";
import { reqSingleGpuInstance } from "@/api/gpu-instance/instances";

jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetProductMonthlyPricing: jest.fn(),
}));
jest.mock("@/api/gpu-instance/instances", () => ({
  reqSingleGpuInstance: jest.fn(),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div>
      <button type="button" onClick={() => onValueChange("6")}>
        pick 6 months
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
  TableBody: ({ children }: any) => <>{children}</>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));
jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="auto renew"
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));
jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/standard/confirm-dialog", () => ({
  ConfirmDialog: ({ open, onConfirm }: any) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        confirm dialog ok
      </button>
    ) : null,
}));
jest.mock("@/app/gpus-console/instances/components/monthlyPrice", () => ({
  __esModule: true,
  default: () => <div>monthly price details</div>,
}));

const mockReqGetProductMonthlyPricing =
  reqGetProductMonthlyPricing as jest.Mock;
const mockReqSingleGpuInstance = reqSingleGpuInstance as jest.Mock;

const pricing = {
  endTime: "1773791999",
  instanceAmount: "120000",
  storageAmount: "30000",
  instanceMonthPrice: "1000000",
  instanceMonthPricePrecision: 1,
  storagePrice: "5000",
  storagePricePricePrecision: 1,
  gpuNum: 1,
  storageSize: 70,
  month: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockReqGetProductMonthlyPricing.mockResolvedValue(pricing);
  mockReqSingleGpuInstance.mockResolvedValue({
    autoRenewMonth: 1,
    autoRenew: true,
    monthlyPrice: [
      { month: 1, price: "1000000", pricePrecision: "1" },
      { month: 6, price: "5000000", pricePrecision: "1" },
    ],
  });
});

describe("AutoRenewInstance extra branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("renders a discount OFF badge for a low monthly price", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={{
          id: "inst-1",
          productId: "prod-1",
          productName: "RTX 4090",
          gpuNum: 1,
          rootfsSize: 50,
          billingMode: "monthly",
          endTime: "1771113600",
          instanceBasePrice: "100000",
          autoRenewMonth: 1,
          volumeMounts: [{ type: "local", size: 20 }],
          monthlyPrice: [
            { month: 1, price: "1000000", pricePrecision: "1" },
            { month: 6, price: "5000000", pricePrecision: "1" },
          ],
        }}
        finishForm={jest.fn()}
      />,
    );
    // ratio is small -> "% OFF" discount badge is displayed (months > 1 plural too)
    expect((await screen.findAllByText(/% OFF/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/6 months/).length).toBeGreaterThan(0);
  });

  it("omits the discount badge when the monthly price is not discounted", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={{
          id: "inst-1",
          productId: "prod-1",
          productName: "RTX 4090",
          gpuNum: 1,
          rootfsSize: 50,
          billingMode: "monthly",
          endTime: "1771113600",
          instanceBasePrice: "100000",
          autoRenewMonth: 1,
          volumeMounts: [{ type: "local", size: 20 }],
          // price/10000 (1000) >= basePrice-derived denom (720) -> ratio >= 1 -> no badge
          monthlyPrice: [{ month: 1, price: "10000000", pricePrecision: "1" }],
        }}
        finishForm={jest.fn()}
      />,
    );
    await screen.findByText("Manage Auto-renew");
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/1 month/).length).toBeGreaterThan(0);
  });

  it("hides the expiration row for on-demand billing mode", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={{
          id: "inst-1",
          productId: "prod-1",
          productName: "RTX 4090",
          gpuNum: 1,
          rootfsSize: 50,
          billingMode: "onDemand",
          endTime: "0",
          instanceBasePrice: "100000",
          autoRenewMonth: 1,
          volumeMounts: [],
          monthlyPrice: [{ month: 1, price: "1000000", pricePrecision: "1" }],
        }}
        finishForm={jest.fn()}
      />,
    );
    await screen.findByText("Manage Auto-renew");
    expect(
      screen.queryByText("Current expiration time"),
    ).not.toBeInTheDocument();
  });

  it("shows GPU/storage fee as '/' when auto-renew is off", async () => {
    mockReqSingleGpuInstance.mockResolvedValue({
      autoRenewMonth: 1,
      autoRenew: false,
      monthlyPrice: [{ month: 1, price: "1000000", pricePrecision: "1" }],
    });
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={{
          id: "inst-1",
          productId: "prod-1",
          productName: "RTX 4090",
          gpuNum: 1,
          rootfsSize: 50,
          billingMode: "monthly",
          endTime: "1771113600",
          instanceBasePrice: "100000",
          autoRenewMonth: 1,
          volumeMounts: [{ type: "local", size: 20 }],
          monthlyPrice: [{ month: 1, price: "1000000", pricePrecision: "1" }],
        }}
        finishForm={jest.fn()}
      />,
    );
    await screen.findByText("Manage Auto-renew");
    await waitFor(() => {
      expect(screen.getByLabelText("auto renew")).not.toBeChecked();
    });
    // both fee cells render "/"
    expect(screen.getAllByText("/").length).toBeGreaterThanOrEqual(2);
  });
});
