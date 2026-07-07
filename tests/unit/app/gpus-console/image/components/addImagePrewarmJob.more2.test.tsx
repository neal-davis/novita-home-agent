import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddImagePrewarmJob from "@/app/gpus-console/image/components/addImagePrewarmJob";
import { reqAddGpuImagePrewarm } from "@/api/gpu-instance/images";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqGpuStorageBaseInfo } from "@/api/gpu-instance/storage";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import { usePermission } from "@/lib/hooks/usePermission";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/images", () => ({
  reqAddGpuImagePrewarm: jest.fn(),
}));
jest.mock("@/api/gpu-instance/explore", () => ({
  reqMarketProducts: jest.fn(),
}));
jest.mock("@/api/gpu-instance/settings", () => ({
  reqGetImageAuths: jest.fn(),
}));
jest.mock("@/api/gpu-instance/storage", () => ({
  reqGpuStorageBaseInfo: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, placeholder, value }: any) => (
    <input onChange={onChange} placeholder={placeholder} value={value ?? ""} />
  ),
}));
jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/standard/progress", () => ({
  ProgressCircle: ({ percent }: any) => <div>{percent}</div>,
}));
jest.mock("@/components/ui/standard/cascade-filter", () => ({
  CascadeFilter: ({
    childOptions,
    getChildLabel,
    getChildValue,
    onValueChange,
  }: any) => (
    <div>
      {childOptions.map((item: any) => (
        <button
          key={getChildValue(item)}
          onClick={() => onValueChange(getChildValue(item))}
          type="button"
        >
          {getChildLabel(item)}
        </button>
      ))}
    </div>
  ),
}));
jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({
    getOptionLabel,
    getOptionValue,
    onValueChange,
    options,
  }: any) => (
    <div>
      {options.map((item: any) => (
        <button
          key={getOptionValue(item)}
          onClick={() => onValueChange?.(getOptionValue(item))}
          type="button"
        >
          {getOptionLabel(item)}
        </button>
      ))}
    </div>
  ),
}));
jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, onCancel, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title || "modal"}>
        <button onClick={onCancel} type="button">
          close-modal
        </button>
        {children}
      </div>
    ) : null,
}));
jest.mock("@/app/gpus-console/image/components/changeTemplate", () => ({
  __esModule: true,
  default: ({ onClose }: any) => (
    <button onClick={onClose} type="button">
      close-template
    </button>
  ),
}));
// imageAuth mock calls addModelValue with NO args to exercise the mark/id=false branch
jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  default: ({ addModelValue }: any) => (
    <button onClick={() => addModelValue()} type="button">
      image-auth-form
    </button>
  ),
}));
jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: jest.fn(() => true),
}));
jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));
jest.mock("@/constants/constants", () => ({
  PERMISSION: {
    ACTION: { create: "create" },
    RESOURCE: { container_registry_auth: "container_registry_auth" },
    RESOURCE_GROUP: { gpu_setting: "gpu_setting" },
  },
}));
jest.mock("@/lib/utils/dockerAddress", () => ({
  isValidDockerImageAddress: jest.fn(() => ""),
}));

const mockReqAddGpuImagePrewarm = reqAddGpuImagePrewarm as jest.Mock;
const mockReqMarketProducts = reqMarketProducts as jest.Mock;
const mockReqGetImageAuths = reqGetImageAuths as jest.Mock;
const mockReqGpuStorageBaseInfo = reqGpuStorageBaseInfo as jest.Mock;
const mockIsValidDockerImageAddress = isValidDockerImageAddress as jest.Mock;
const mockUsePermission = usePermission as jest.Mock;
const mockMessage = message as { error: jest.Mock; success: jest.Mock };

const regions = [
  {
    continent: "North America",
    id: "cluster-a",
    name: "US East",
    version: "v2",
  },
];

function renderJob(props: any = {}) {
  return render(
    <AddImagePrewarmJob
      finishForm={jest.fn()}
      regionList={regions}
      tooltipInfo={{ limit: 5, perImageSize: 100, total: 1 }}
      {...props}
    />,
  );
}

describe("AddImagePrewarmJob more branches (round 2)", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockUsePermission.mockReturnValue(true);
    mockIsValidDockerImageAddress.mockReturnValue("");
    mockReqAddGpuImagePrewarm.mockResolvedValue({ id: "job" });
    mockReqGpuStorageBaseInfo.mockResolvedValue({ clusters: regions });
    mockReqGetImageAuths.mockResolvedValue({
      data: [{ id: "auth-1", name: "Registry auth" }],
    });
    mockReqMarketProducts.mockResolvedValue({
      products: [
        { productId: "gpu-a", productName: "RTX 4090", usableNode: true },
        { productId: "gpu-b", productName: "A100", usableNode: false },
      ],
    });
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("rejects a whitespace-only image address", async () => {
    renderJob({ imageUrl: "   " });
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "Please enter the image address",
    );
    expect(mockReqAddGpuImagePrewarm).not.toHaveBeenCalled();
  });

  it("passes the selected credential through on a successful submit", async () => {
    const finishForm = jest.fn();
    renderJob({ imageUrl: "registry/app:latest", finishForm });
    await screen.findByText("US East");
    fireEvent.click(screen.getByRole("button", { name: "US East" }));
    await screen.findByText("RTX 4090");
    // select an existing (non "-1") credential
    fireEvent.click(screen.getByRole("button", { name: "Registry auth" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));
    await waitFor(() => {
      expect(mockReqAddGpuImagePrewarm).toHaveBeenCalledWith(
        expect.objectContaining({
          clusterId: "cluster-a",
          imageUrl: "registry/app:latest",
          repositoryAuth: "auth-1",
        }),
      );
    });
    expect(mockMessage.success).toHaveBeenCalledWith("Operation successful");
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("recovers when the create request rejects", async () => {
    mockReqAddGpuImagePrewarm.mockRejectedValue(new Error("boom"));
    const finishForm = jest.fn();
    renderJob({ imageUrl: "registry/app:latest", finishForm });
    await screen.findByText("US East");
    fireEvent.click(screen.getByRole("button", { name: "US East" }));
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));
    await waitFor(() => expect(mockReqAddGpuImagePrewarm).toHaveBeenCalled());
    // submit reset -> finishForm never called, button still active
    expect(finishForm).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("button", { name: "Confirm Create" }),
    ).toBeInTheDocument();
  });

  it("recovers when the products request rejects (non-cancel)", async () => {
    mockReqMarketProducts.mockRejectedValue(new Error("network"));
    const { container } = renderJob();
    await waitFor(() => expect(mockReqMarketProducts).toHaveBeenCalled());
    // no crash, component still renders
    expect(container).toBeTruthy();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("toggles a GPU selection off when clicked twice", async () => {
    renderJob({ imageUrl: "registry/app:latest" });
    await screen.findByText("US East");
    fireEvent.click(screen.getByRole("button", { name: "US East" }));
    const gpu = await screen.findByText("RTX 4090");
    fireEvent.click(gpu); // select
    fireEvent.click(screen.getByText("RTX 4090")); // deselect
    // still present and clickable after toggle round-trip
    expect(screen.getByText("RTX 4090")).toBeInTheDocument();
  });

  it("closes the template modal via its close handler", async () => {
    renderJob();
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Select Template" }));
    fireEvent.click(screen.getByRole("button", { name: "close-template" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "close-template" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("refreshes auths without selecting when add returns no id", async () => {
    renderJob();
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Add Authentication" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "image-auth-form" }),
    );
    await waitFor(() => expect(mockReqGetImageAuths).toHaveBeenCalledTimes(2));
  });

  it("closes the add-credential modal via cancel", async () => {
    renderJob();
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Add Authentication" }));
    await screen.findByRole("button", { name: "image-auth-form" });
    fireEvent.click(screen.getByRole("button", { name: "close-modal" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "image-auth-form" }),
      ).not.toBeInTheDocument(),
    );
  });
});
