import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddImagePrewarmJob from "@/app/gpus-console/image/components/addImagePrewarmJob";
import { reqAddGpuImagePrewarm } from "@/api/gpu-instance/images";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqGpuStorageBaseInfo } from "@/api/gpu-instance/storage";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import { usePermission } from "@/lib/hooks/usePermission";
import { showPermissionMessage } from "@/lib/utils/permission";
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
  default: ({ onClose, onConfirm }: any) => (
    <div>
      <button
        onClick={() =>
          onConfirm?.({ image: "tpl/app:1", imageAuth: "auth-tpl" })
        }
        type="button"
      >
        choose-template
      </button>
      <button onClick={onClose} type="button">
        close-template
      </button>
    </div>
  ),
}));
jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  default: ({ addModelValue }: any) => (
    <button onClick={() => addModelValue(true, "auth-new")} type="button">
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

describe("AddImagePrewarmJob extra branches", () => {
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

  it("rejects an invalid docker image address", async () => {
    const { container } = renderJob({ imageUrl: "bad image" });
    await screen.findByText("RTX 4090");
    mockIsValidDockerImageAddress.mockReturnValue(
      "The container image is not valid",
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "The container image is not valid",
    );
    expect(container).toBeTruthy();
  });

  it("requires a region selection", async () => {
    renderJob({ imageUrl: "registry/app:latest" });
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));
    expect(mockMessage.error).toHaveBeenCalledWith("Please select the region");
  });

  it("blocks submission when no GPU is usable in the region", async () => {
    mockReqMarketProducts.mockResolvedValue({
      products: [
        { productId: "gpu-b", productName: "A100", usableNode: false },
      ],
    });
    renderJob({ imageUrl: "registry/app:latest" });
    await screen.findByText("US East");
    fireEvent.click(screen.getByRole("button", { name: "US East" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "The GPU in the selected region is temporarily unavailable, please select other regions",
    );
  });

  it("rejects remarks longer than 100 characters", async () => {
    const { container } = renderJob({ imageUrl: "registry/app:latest" });
    await screen.findByText("US East");
    fireEvent.click(screen.getByRole("button", { name: "US East" }));
    await screen.findByText("RTX 4090");
    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[1], { target: { value: "x".repeat(101) } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));
    expect(mockMessage.error).toHaveBeenCalledWith(
      "Remarks length cannot exceed 100 characters",
    );
  });

  it("fills image fields from a selected template", async () => {
    const { container } = renderJob();
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Select Template" }));
    fireEvent.click(screen.getByRole("button", { name: "choose-template" }));
    await waitFor(() => {
      const inputs = container.querySelectorAll("input");
      expect((inputs[0] as HTMLInputElement).value).toBe("tpl/app:1");
    });
  });

  it("shows a permission message when adding credentials is not allowed", async () => {
    mockUsePermission.mockReturnValue(false);
    renderJob();
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Add Authentication" }));
    expect(showPermissionMessage).toHaveBeenCalled();
  });

  it("opens add-credential modal and refreshes auths after adding", async () => {
    renderJob();
    await screen.findByText("RTX 4090");
    fireEvent.click(screen.getByRole("button", { name: "Add Authentication" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "image-auth-form" }),
    );
    await waitFor(() => {
      expect(mockReqGetImageAuths).toHaveBeenCalledTimes(2);
    });
  });

  it("selects an existing credential from the list", async () => {
    renderJob();
    await screen.findByText("Registry auth");
    fireEvent.click(screen.getByRole("button", { name: "Registry auth" }));
    // no error, selection accepted
    expect(mockMessage.error).not.toHaveBeenCalled();
  });
});
