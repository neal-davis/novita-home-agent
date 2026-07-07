import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddNetworkVolume from "@/app/gpus-console/storage/components/addNetworkVolume";
import {
  reqCreateNetworkStorage,
  reqGpuStorageBaseInfo,
  reqUpdateNetworkStorage,
} from "@/api/gpu-instance/storage";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqBalanceTotal } from "@/api/gpu-instance/billing";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/storage", () => ({
  reqCreateNetworkStorage: jest.fn(),
  reqGpuStorageBaseInfo: jest.fn(),
  reqUpdateNetworkStorage: jest.fn(),
}));
jest.mock("@/api/gpu-instance/explore", () => ({
  reqMarketProducts: jest.fn(),
}));
jest.mock("@/api/gpu-instance/billing", () => ({ reqBalanceTotal: jest.fn() }));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, footer, onCancel, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title || "modal"}>
        <button onClick={onCancel} type="button">
          close-modal
        </button>
        {children}
        {footer}
      </div>
    ) : null,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, id, onClick }: any) => (
    <button
      data-testid={id}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({ className, onChange, placeholder, value }: any) => (
    <input
      className={className}
      onChange={onChange}
      placeholder={placeholder}
      value={value ?? ""}
    />
  ),
}));
jest.mock("@/app/gpus-console/storage/components/addConfirm", () => ({
  __esModule: true,
  default: ({ finishOper, price }: any) => (
    <div role="dialog" aria-label="Confirm Creation">
      <span>price {price}</span>
      <button onClick={() => finishOper(true)} type="button">
        confirm create
      </button>
      <button onClick={() => finishOper(false)} type="button">
        cancel create
      </button>
    </div>
  ),
}));
jest.mock("@/lib/utils/money", () => ({
  dealMoney: jest.fn((value: number) => value),
}));
jest.mock("@/lib/utils/utils", () => ({
  dealParamsText: jest.fn((template: string, params: Record<string, string>) =>
    template.replace(/\$\{0\}/g, String(params[0])),
  ),
}));
jest.mock("@/constants/urls", () => ({
  DISCORD_INVITE_LINK: "https://discord.example.test",
}));
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      STORAGE_CREATE_NETWORK_VOLUME: "storage-create",
      STORAGE_EDIT_STORAGE: "storage-edit",
    },
  },
}));

const mockReqCreateNetworkStorage = reqCreateNetworkStorage as jest.Mock;
const mockReqGpuStorageBaseInfo = reqGpuStorageBaseInfo as jest.Mock;
const mockReqUpdateNetworkStorage = reqUpdateNetworkStorage as jest.Mock;
const mockReqMarketProducts = reqMarketProducts as jest.Mock;
const mockReqBalanceTotal = reqBalanceTotal as jest.Mock;
const mockMessage = message as { error: jest.Mock; success: jest.Mock };

describe("AddNetworkVolume extra branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockReqBalanceTotal.mockResolvedValue({
      credit: "10",
      totalBalance: "10",
      userBalance: "0",
      voucherBalance: "0",
    });
    mockReqGpuStorageBaseInfo.mockResolvedValue({
      clusters: [
        { id: "cluster-a", name: "US East", supportNetStorage: true },
        { id: "cluster-b", name: "EU West", supportNetStorage: true },
      ],
      price: "0.003",
    });
    mockReqMarketProducts.mockResolvedValue({
      products: [
        { productName: "RTX 4090", usableNode: true },
        { productName: "A100", usableNode: false },
      ],
    });
    mockReqCreateNetworkStorage.mockResolvedValue({
      clusterId: "cluster-a",
      storageId: "s-new",
      storageName: "vol",
    });
    mockReqUpdateNetworkStorage.mockResolvedValue({});
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("blocks creation with no cluster selected", async () => {
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );
    // two clusters -> no auto-select, clusterId stays empty
    await screen.findByText("US East");
    fireEvent.click(screen.getByText("Save"));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "Please select a data center",
    );
  });

  it("validates empty name and too-small size", async () => {
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );
    await screen.findByText("US East");
    fireEvent.click(screen.getByText("US East"));

    // name empty -> error
    fireEvent.click(screen.getByText("Save"));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "Please input valid volume name",
    );

    fireEvent.change(screen.getByPlaceholderText("Volume Name"), {
      target: { value: "vol" },
    });
    // size 0 -> too small (changeParams rejects, but default 10 -> set to empty via valid path)
    fireEvent.change(screen.getByDisplayValue("10"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Save"));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "Please input valid volume size must be at least 10 GB",
    );
  });

  it("rejects creation when the balance is not enough", async () => {
    mockReqBalanceTotal.mockResolvedValue({
      credit: "0",
      totalBalance: "0",
      userBalance: "0",
      voucherBalance: "0",
    });
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );
    await screen.findByText("US East");
    fireEvent.click(screen.getByText("US East"));
    fireEvent.change(screen.getByPlaceholderText("Volume Name"), {
      target: { value: "vol" },
    });
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(await screen.findByText("confirm create"));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith("Balance is not enough.");
    });
    expect(mockReqCreateNetworkStorage).not.toHaveBeenCalled();
  });

  it("cancels the confirm dialog without creating", async () => {
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );
    await screen.findByText("US East");
    fireEvent.click(screen.getByText("US East"));
    fireEvent.change(screen.getByPlaceholderText("Volume Name"), {
      target: { value: "vol" },
    });
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(await screen.findByText("cancel create"));
    expect(mockReqCreateNetworkStorage).not.toHaveBeenCalled();
  });

  it("updates an existing volume in edit mode and closes via cancel", async () => {
    const finishOper = jest.fn();
    render(
      <AddNetworkVolume
        finishOper={finishOper}
        info={{
          clusterId: "cluster-a",
          storageId: "s-1",
          storageName: "vol",
          storageSize: 20,
        }}
        mode="Edit"
        openDiag
      />,
    );
    await screen.findByText("US East");
    fireEvent.change(screen.getByDisplayValue("20"), {
      target: { value: "30" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockReqUpdateNetworkStorage).toHaveBeenCalledWith({
        storageId: "s-1",
        storageName: "vol",
        storageSize: 30,
      });
      expect(finishOper).toHaveBeenCalledWith(true);
    });

    fireEvent.click(screen.getByText("Cancel"));
    expect(finishOper).toHaveBeenCalledWith(false);
  });
});
