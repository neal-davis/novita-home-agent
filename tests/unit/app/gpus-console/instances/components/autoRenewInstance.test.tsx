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

const waitForInitialFetch = async () => {
  await waitFor(() => {
    expect(mockReqSingleGpuInstance).toHaveBeenCalledWith("inst-1");
    expect(mockReqGetProductMonthlyPricing).toHaveBeenCalled();
  });
};

const instanceInfoObj = {
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
};

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

describe("AutoRenewInstance modal", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockReqGetProductMonthlyPricing.mockResolvedValue(pricing);
    mockReqSingleGpuInstance.mockResolvedValue({
      autoRenewMonth: 1,
      autoRenew: false,
      monthlyPrice: instanceInfoObj.monthlyPrice,
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("renders the instance summary and fetches the single instance on mount", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={instanceInfoObj}
        finishForm={jest.fn()}
      />,
    );

    expect(screen.getByText("Manage Auto-renew")).toBeInTheDocument();
    expect(screen.getByText("inst-1")).toBeInTheDocument();
    expect(screen.getByText(/RTX 4090/)).toBeInTheDocument();
    expect(screen.getByText("Current expiration time")).toBeInTheDocument();

    await waitForInitialFetch();
  });

  it("reveals renewal duration / fee rows when auto-renew is switched on", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={instanceInfoObj}
        finishForm={jest.fn()}
      />,
    );

    expect(screen.queryByText("Renewal duration")).not.toBeInTheDocument();

    await waitForInitialFetch();

    fireEvent.click(screen.getByLabelText("auto renew"));

    expect(screen.getByText("Renewal duration")).toBeInTheDocument();
    expect(screen.getByText("Unit price")).toBeInTheDocument();
    expect(
      screen.getByText("We will attempt charge 3 days before expiration"),
    ).toBeInTheDocument();
  });

  it("does not reset a local auto-renew toggle when the initial detail request resolves", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={instanceInfoObj}
        finishForm={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("auto renew"));

    await waitForInitialFetch();

    await waitFor(() => {
      expect(mockReqSingleGpuInstance).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByLabelText("auto renew")).toBeChecked();
    expect(screen.getByText("Renewal duration")).toBeInTheDocument();
  });

  it("re-fetches pricing when the renewal duration changes", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={instanceInfoObj}
        finishForm={jest.fn()}
      />,
    );

    await waitForInitialFetch();

    fireEvent.click(screen.getByLabelText("auto renew"));
    mockReqGetProductMonthlyPricing.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "pick 6 months" }));

    await waitFor(() => {
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalledWith(
        expect.objectContaining({ month: 6, instanceId: "inst-1" }),
      );
    });
  });

  it("confirms via the confirm dialog and finishes the form", async () => {
    const finishForm = jest.fn();
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={instanceInfoObj}
        finishForm={finishForm}
      />,
    );

    await waitForInitialFetch();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: "confirm dialog ok" }));

    expect(finishForm).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ instanceId: undefined }),
    );
  });

  it("cancels via the cancel button", async () => {
    const finishForm = jest.fn();
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={instanceInfoObj}
        finishForm={finishForm}
      />,
    );

    await waitForInitialFetch();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it("shows a processing button when btnLoading is set", async () => {
    render(
      <AutoRenewInstance
        instanceIds={["inst-1"]}
        instanceInfoObj={instanceInfoObj}
        btnLoading
        finishForm={jest.fn()}
      />,
    );
    expect(screen.getByText("Processing")).toBeInTheDocument();
    await waitForInitialFetch();
  });
});
