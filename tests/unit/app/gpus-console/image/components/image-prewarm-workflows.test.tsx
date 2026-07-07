import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddImagePrewarmJob from "@/app/gpus-console/image/components/addImagePrewarmJob";
import DeleteImagePrewarmJob from "@/app/gpus-console/image/components/deleteImagePrewarmJob";
import JobState from "@/app/gpus-console/image/components/jobState";
import {
  reqAddGpuImagePrewarm,
  reqDeleteGpuImagePrewarm,
} from "@/api/gpu-instance/images";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqGpuStorageBaseInfo } from "@/api/gpu-instance/storage";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/images", () => ({
  reqAddGpuImagePrewarm: jest.fn(),
  reqDeleteGpuImagePrewarm: jest.fn(),
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
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button
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
    onChange,
    placeholder,
    value,
  }: {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: string | number;
  }) => (
    <input onChange={onChange} placeholder={placeholder} value={value ?? ""} />
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

jest.mock("@/components/ui/standard/progress", () => ({
  ProgressCircle: ({ percent }: { percent: number }) => (
    <div data-testid="progress-circle">{percent}</div>
  ),
}));

jest.mock("@/components/ui/standard/cascade-filter", () => ({
  CascadeFilter: ({
    childOptions,
    getChildLabel,
    getChildValue,
    onValueChange,
    value,
  }: {
    childOptions: any[];
    getChildLabel: (item: any) => string;
    getChildValue: (item: any) => string;
    onValueChange: (value: string) => void;
    value?: string;
  }) => (
    <div data-testid="cascade-filter" data-value={value || ""}>
      {childOptions.map((item) => (
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
    value,
  }: {
    getOptionLabel: (item: any) => string;
    getOptionValue: (item: any) => string;
    onValueChange?: (value: string) => void;
    options: any[];
    value?: string;
  }) => (
    <div data-testid="select-filter" data-value={value || ""}>
      {options.map((item) => (
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
  default: ({
    children,
    onCancel,
    open,
    title,
  }: {
    children: React.ReactNode;
    onCancel?: () => void;
    open: boolean;
    title?: string;
  }) =>
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
  default: ({ onConfirm }: { onConfirm?: (template: any) => void }) => (
    <button
      onClick={() =>
        onConfirm?.({
          image: "selected/template:latest",
          imageAuth: "auth-selected",
        })
      }
      type="button"
    >
      choose-template
    </button>
  ),
}));

jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  default: ({ addModelValue }: { addModelValue?: () => void }) => (
    <button onClick={addModelValue} type="button">
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

jest.mock("lucide-react", () => ({
  CircleHelp: ({ size }: { size: number }) => (
    <span data-testid="circle-help">help-{size}</span>
  ),
}));

const mockReqAddGpuImagePrewarm = reqAddGpuImagePrewarm as jest.Mock;
const mockReqDeleteGpuImagePrewarm = reqDeleteGpuImagePrewarm as jest.Mock;
const mockReqMarketProducts = reqMarketProducts as jest.Mock;
const mockReqGetImageAuths = reqGetImageAuths as jest.Mock;
const mockReqGpuStorageBaseInfo = reqGpuStorageBaseInfo as jest.Mock;
const mockMessage = message as {
  error: jest.Mock;
  success: jest.Mock;
};

const regions = [
  {
    continent: "North America",
    id: "cluster-a",
    name: "US East",
    version: "v2",
  },
];

describe("image prewarm workflows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReqAddGpuImagePrewarm.mockResolvedValue({ id: "prewarm-job" });
    mockReqDeleteGpuImagePrewarm.mockResolvedValue({});
    mockReqGpuStorageBaseInfo.mockResolvedValue({ clusters: regions });
    mockReqGetImageAuths.mockResolvedValue({
      data: [{ id: "auth-1", name: "Registry auth" }],
    });
    mockReqMarketProducts.mockResolvedValue({
      products: [
        {
          productId: "gpu-a",
          productName: "RTX 4090",
          usableNode: true,
        },
        {
          productId: "gpu-b",
          productName: "A100 reserved",
          usableNode: false,
        },
      ],
    });
  });

  it("validates required image address before creating a prewarm job", async () => {
    render(
      <AddImagePrewarmJob
        finishForm={jest.fn()}
        regionList={regions}
        tooltipInfo={{ limit: 5, perImageSize: 100, total: 1 }}
      />,
    );

    await screen.findByText("RTX 4090");

    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));

    expect(mockMessage.error).toHaveBeenCalledWith(
      "Please enter the image address",
    );
    expect(mockReqAddGpuImagePrewarm).not.toHaveBeenCalled();
  });

  it("submits trimmed image prewarm params for the selected region and GPU", async () => {
    const finishForm = jest.fn();
    const { container } = render(
      <AddImagePrewarmJob
        finishForm={finishForm}
        regionList={regions}
        tooltipInfo={{ limit: 5, perImageSize: 100, total: 1 }}
      />,
    );

    await screen.findByText("US East");

    fireEvent.click(screen.getByRole("button", { name: "US East" }));

    await waitFor(() => {
      expect(mockReqMarketProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({
          clusterId: "cluster-a",
          clusterIds: ["cluster-a"],
        }),
        expect.any(AbortSignal),
      );
    });

    await screen.findByText("RTX 4090");

    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0], {
      target: { value: " private.registry/team/app:latest " },
    });
    fireEvent.click(screen.getByText("RTX 4090"));
    fireEvent.change(inputs[1], { target: { value: " nightly cache " } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm Create" }));

    await waitFor(() => {
      expect(mockReqAddGpuImagePrewarm).toHaveBeenCalledWith({
        clusterId: "cluster-a",
        imageUrl: "private.registry/team/app:latest",
        note: "nightly cache",
        productIds: ["gpu-a"],
        repositoryAuth: "",
      });
    });
    expect(mockMessage.success).toHaveBeenCalledWith("Operation successful");
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("deletes selected prewarm task ids after confirmation", async () => {
    const finishForm = jest.fn();

    render(
      <DeleteImagePrewarmJob
        ids={["job-1", "job-2"]}
        finishForm={finishForm}
      />,
    );

    expect(screen.getByText("job-1,job-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockReqDeleteGpuImagePrewarm).toHaveBeenCalledWith({
        ids: ["job-1", "job-2"],
      });
    });
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("shows failed job reasons next to the failed state", () => {
    render(
      <JobState
        reason={["Layer download failed", "Registry auth denied"]}
        state="Failed"
      />,
    );

    expect(screen.getByText("FAILED")).toBeInTheDocument();
    expect(screen.getByText("Layer download failed")).toBeInTheDocument();
    expect(screen.getByText("Registry auth denied")).toBeInTheDocument();
  });
});
