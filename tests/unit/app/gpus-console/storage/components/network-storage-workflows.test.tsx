import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddConfirm from "@/app/gpus-console/storage/components/addConfirm";
import AddNetworkVolume from "@/app/gpus-console/storage/components/addNetworkVolume";
import DeleteStorage from "@/app/gpus-console/storage/components/deleteStorage";
import {
  reqCreateNetworkStorage,
  reqDeleteNetworkStorage,
  reqGpuStorageBaseInfo,
  reqUpdateNetworkStorage,
} from "@/api/gpu-instance/storage";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqBalanceTotal } from "@/api/gpu-instance/billing";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/storage", () => ({
  reqCreateNetworkStorage: jest.fn(),
  reqDeleteNetworkStorage: jest.fn(),
  reqGpuStorageBaseInfo: jest.fn(),
  reqUpdateNetworkStorage: jest.fn(),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqMarketProducts: jest.fn(),
}));

jest.mock("@/api/gpu-instance/billing", () => ({
  reqBalanceTotal: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({
    children,
    footer,
    onCancel,
    open,
    title,
  }: {
    children: React.ReactNode;
    footer?: React.ReactNode;
    onCancel?: () => void;
    open: boolean;
    title?: string;
  }) =>
    open ? (
      <div role="dialog" aria-label={title || "modal"}>
        <button onClick={onCancel} type="button">
          close-modal
        </button>
        {title && <h2>{title}</h2>}
        {children}
        {footer}
      </div>
    ) : null,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    id,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    id?: string;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button
      data-testid={id}
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    className,
    onChange,
    placeholder,
    value,
  }: {
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: string | number;
  }) => (
    <input
      className={className}
      onChange={onChange}
      placeholder={placeholder}
      value={value ?? ""}
    />
  ),
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

jest.mock("@/lib/utils/money", () => ({
  dealMoney: jest.fn((value: number) => value),
}));

jest.mock("@/lib/utils/utils", () => ({
  copyText: jest.fn(),
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
      STORAGE_DELETE_STORAGE: "storage-delete",
      STORAGE_EDIT_STORAGE: "storage-edit",
    },
  },
}));

const mockReqCreateNetworkStorage = reqCreateNetworkStorage as jest.Mock;
const mockReqDeleteNetworkStorage = reqDeleteNetworkStorage as jest.Mock;
const mockReqGpuStorageBaseInfo = reqGpuStorageBaseInfo as jest.Mock;
const mockReqUpdateNetworkStorage = reqUpdateNetworkStorage as jest.Mock;
const mockReqMarketProducts = reqMarketProducts as jest.Mock;
const mockReqBalanceTotal = reqBalanceTotal as jest.Mock;
const mockMessage = message as {
  error: jest.Mock;
  success: jest.Mock;
};

describe("network storage workflows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReqBalanceTotal.mockResolvedValue({
      credit: "10",
      totalBalance: "10",
      userBalance: "0",
      voucherBalance: "0",
    });
    mockReqGpuStorageBaseInfo.mockResolvedValue({
      clusters: [
        {
          continent: "North America",
          id: "cluster-a",
          name: "US East",
          supportNetStorage: true,
        },
      ],
      price: "0.003",
    });
    mockReqMarketProducts.mockResolvedValue({
      products: [
        { productName: "RTX 4090", usableNode: true },
        { productName: "A100 reserved", usableNode: false },
      ],
    });
    mockReqCreateNetworkStorage.mockResolvedValue({
      clusterId: "cluster-a",
      storageId: "storage-new",
      storageName: "training-cache",
    });
    mockReqUpdateNetworkStorage.mockResolvedValue({});
    mockReqDeleteNetworkStorage.mockResolvedValue({});
  });

  it("confirms or cancels network volume creation from the billing warning modal", () => {
    const finishOper = jest.fn();

    render(<AddConfirm finishOper={finishOper} openDiag price="0.030" />);

    expect(
      screen.getByText(/Network Volume is billed at \$0.030\/day/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishOper).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(finishOper).toHaveBeenCalledWith(true);
  });

  it("creates a network volume after validation and creation confirmation", async () => {
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
    await screen.findByText("RTX 4090");

    fireEvent.change(screen.getByPlaceholderText("Volume Name"), {
      target: { value: " training-cache " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("dialog", { name: "Confirm Creation" }));

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockReqCreateNetworkStorage).toHaveBeenCalledWith({
        clusterId: "cluster-a",
        storageName: "training-cache",
        storageSize: 10,
      });
    });
    expect(finishOper).toHaveBeenCalledWith(true, {
      clusterId: "cluster-a",
      storageId: "storage-new",
      storageName: "training-cache",
    });
  });

  it("prevents shrinking an existing network volume during edit", async () => {
    render(
      <AddNetworkVolume
        finishOper={jest.fn()}
        info={{
          clusterId: "cluster-a",
          storageId: "storage-existing",
          storageName: "training-cache",
          storageSize: 50,
        }}
        mode="Edit"
        openDiag
      />,
    );

    await screen.findByText("US East");

    fireEvent.change(screen.getByDisplayValue("50"), {
      target: { value: "20" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mockMessage.error).toHaveBeenCalledWith(
      "New volume size can not be smaller than the original size (50 GB)",
    );
    expect(mockReqUpdateNetworkStorage).not.toHaveBeenCalled();
  });

  it("requires the exact storage name before deleting a network volume", async () => {
    const finishForm = jest.fn();

    render(
      <DeleteStorage
        finishForm={finishForm}
        storageId="storage-1"
        storageName="training-cache"
      />,
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your storage name to delete"),
      {
        target: { value: "wrong-name" },
      },
    );
    expect(confirmButton).toBeDisabled();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your storage name to delete"),
      {
        target: { value: "training-cache" },
      },
    );
    expect(confirmButton).toBeEnabled();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockReqDeleteNetworkStorage).toHaveBeenCalledWith({
        storageId: "storage-1",
      });
    });
    expect(finishForm).toHaveBeenCalledWith(true);
  });
});
