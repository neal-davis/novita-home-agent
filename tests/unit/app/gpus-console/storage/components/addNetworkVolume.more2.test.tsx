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

describe("AddNetworkVolume — more uncovered branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(window, "open").mockImplementation(jest.fn());
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

  it("auto-selects the only storage-capable cluster and splits available/unavailable products", async () => {
    mockReqGpuStorageBaseInfo.mockResolvedValue({
      clusters: [
        { id: "cluster-a", name: "US East", supportNetStorage: true },
        { id: "cluster-b", name: "EU West", supportNetStorage: false },
      ],
      price: "0.003",
    });
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );

    await screen.findByText("US East");
    // products split: usableNode true under Available, false under None
    expect(await screen.findByText("RTX 4090")).toBeInTheDocument();
    expect(screen.getByText("A100")).toBeInTheDocument();
    // only one capable cluster -> getProducts called with its id (auto-selected)
    await waitFor(() => {
      expect(mockReqMarketProducts).toHaveBeenCalledWith(
        expect.objectContaining({ clusterId: "cluster-a" }),
        expect.anything(),
      );
    });
  });

  it("falls back to empty cluster when base info has no clusters", async () => {
    mockReqGpuStorageBaseInfo.mockResolvedValue({ clusters: [], price: "" });
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );

    await waitFor(() => {
      expect(mockReqMarketProducts).toHaveBeenCalledWith(
        expect.objectContaining({ clusterId: "" }),
        expect.anything(),
      );
    });
    // no cluster selected, save reports the cluster error
    fireEvent.click(screen.getByText("Save"));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "Please select a data center",
    );
  });

  it("rejects non-numeric and zero-leading size keystrokes via the size regex", async () => {
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );
    await screen.findByText("US East");
    const sizeInput = screen.getByDisplayValue("10");

    // letters rejected -> value stays 10
    fireEvent.change(sizeInput, { target: { value: "abc" } });
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    // leading zero rejected -> value stays 10
    fireEvent.change(sizeInput, { target: { value: "05" } });
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    // valid number accepted
    fireEvent.change(sizeInput, { target: { value: "50" } });
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });

  it("blocks shrinking below the original size in edit mode and shows the size error", async () => {
    render(
      <AddNetworkVolume
        finishOper={jest.fn()}
        info={{
          clusterId: "cluster-a",
          storageId: "s-1",
          storageName: "vol",
          storageSize: 50,
        }}
        mode="Edit"
        openDiag
      />,
    );
    await screen.findByText("US East");
    fireEvent.change(screen.getByDisplayValue("50"), {
      target: { value: "30" },
    });

    // inline size error appears (checkSizeError edit branch)
    expect(
      await screen.findByText(
        "New volume size can not be smaller than the original size (50 GB)",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Save"));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "New volume size can not be smaller than the original size (50 GB)",
    );
    expect(mockReqUpdateNetworkStorage).not.toHaveBeenCalled();
  });

  it("creates a volume successfully via the confirm dialog and forwards the new ids", async () => {
    const finishOper = jest.fn();
    render(
      <AddNetworkVolume
        finishOper={finishOper}
        info={{}}
        mode="Add"
        openDiag
      />,
    );
    await screen.findByText("US East");
    fireEvent.click(screen.getByText("US East"));
    fireEvent.change(screen.getByPlaceholderText("Volume Name"), {
      target: { value: "myvol" },
    });
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(await screen.findByText("confirm create"));

    await waitFor(() => {
      expect(mockReqCreateNetworkStorage).toHaveBeenCalledWith({
        clusterId: "cluster-a",
        storageName: "myvol",
        storageSize: 10,
      });
      expect(finishOper).toHaveBeenCalledWith(true, {
        clusterId: "cluster-a",
        storageId: "s-new",
        storageName: "vol",
      });
    });
  });

  it("keeps the submit button stable when the create request rejects", async () => {
    mockReqCreateNetworkStorage.mockRejectedValue(new Error("boom"));
    const finishOper = jest.fn();
    render(
      <AddNetworkVolume
        finishOper={finishOper}
        info={{}}
        mode="Add"
        openDiag
      />,
    );
    await screen.findByText("US East");
    fireEvent.click(screen.getByText("US East"));
    fireEvent.change(screen.getByPlaceholderText("Volume Name"), {
      target: { value: "myvol" },
    });
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(await screen.findByText("confirm create"));

    await waitFor(() => {
      expect(mockReqCreateNetworkStorage).toHaveBeenCalled();
    });
    // error path: finishOper(true) never fires
    expect(finishOper).not.toHaveBeenCalledWith(true, expect.anything());
  });

  it("recovers when base info fails by still loading products with empty cluster", async () => {
    mockReqGpuStorageBaseInfo.mockRejectedValue(new Error("nope"));
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );

    await waitFor(() => {
      expect(mockReqMarketProducts).toHaveBeenCalledWith(
        expect.objectContaining({ clusterId: "" }),
        expect.anything(),
      );
    });
  });

  it("opens contact support link from the size tip", async () => {
    render(
      <AddNetworkVolume finishOper={jest.fn()} info={{}} mode="Add" openDiag />,
    );
    await screen.findByText("US East");
    fireEvent.click(screen.getByText("contact support"));
    expect(window.open).toHaveBeenCalledWith("https://discord.example.test");
  });
});
