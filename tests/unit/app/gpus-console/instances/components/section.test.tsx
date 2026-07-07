import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Section from "@/app/gpus-console/instances/components/section";
import {
  reqGpuInstance,
  reqInstanceMountList,
  reqRenewInstance,
  reqSetAutoRenew,
  reqSingleGpuInstance,
  reqTransToMonthlyInstance,
  reqUpdateGpuInstanceName,
} from "@/api/gpu-instance/instances";
import { reqMarketQueryOptions } from "@/api/gpu-instance/explore";
import { requestInstanceMarkEffect } from "@/api/config";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqGpuInstance: jest.fn(),
  reqInstanceMountList: jest.fn(),
  reqRenewInstance: jest.fn(),
  reqSetAutoRenew: jest.fn(),
  reqSingleGpuInstance: jest.fn(),
  reqTransToMonthlyInstance: jest.fn(),
  reqUpdateGpuInstanceName: jest.fn(),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqMarketQueryOptions: jest.fn(),
}));

jest.mock("@/api/config", () => ({
  requestInstanceMarkEffect: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input value={value} onChange={(event) => onChange?.(event)} {...props} />
  ),
  SearchInput: ({ onSearch, placeholder, value }: any) => (
    <button type="button" onClick={() => onSearch(`${placeholder} value`)}>
      {value || placeholder}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span title={typeof title === "string" ? title : undefined}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, footer, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title || "modal"}>
        {children}
        {footer}
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/components/myPagination", () => ({
  MyPagination: ({ onChange, renderItem }: any) => (
    <button
      type="button"
      onClick={() => {
        renderItem?.({ page: 2 });
        onChange?.({}, 2);
      }}
    >
      next page
    </button>
  ),
  MyTablePagination: ({ onRowsPerPageChange }: any) => (
    <button
      type="button"
      onClick={() => onRowsPerPageChange?.({ target: { value: "25" } })}
    >
      rows per page
    </button>
  ),
  PaginationItem: ({ page }: any) => <span>page item {page}</span>,
}));

jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({ onClear, onValueChange, options, placeholder }: any) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onValueChange?.(
            String(
              options.find(
                (item: any) => item.value !== "0" && item.id !== "-1",
              )?.value ??
                options.find((item: any) => item.id !== "-1")?.id ??
                "0",
            ),
          )
        }
      >
        {placeholder}
      </button>
      <button type="button" onClick={() => onClear?.()}>
        clear {placeholder}
      </button>
    </div>
  ),
}));

jest.mock("@/app/components/TeamMemberSelector", () => ({
  __esModule: true,
  default: ({ onSelect }: any) => (
    <button type="button" onClick={() => onSelect({ ids: ["member-1"] })}>
      choose member
    </button>
  ),
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, onClick }: any) => (
    <input
      aria-label="select instance"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      onClick={onClick}
      type="checkbox"
    />
  ),
}));

jest.mock("@/store", () => ({
  useAppSelector: (selector: any) =>
    selector({
      user: {
        allTeamMembers: [
          {
            alias: "Ops",
            email: "ops@example.com",
            memberId: "member-1",
            userId: "user-1",
          },
        ],
        currentTeam: { id: "team-1" },
      },
    }),
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => true,
}));

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

function mockSimpleComponent(label: string) {
  function MockInstanceModal({ finishForm }: any) {
    return (
      <button
        type="button"
        onClick={() =>
          finishForm?.(true, {
            id: "inst-1",
            instanceId: "inst-1",
            instanceIds: ["inst-1"],
            jobId: "job-1",
          })
        }
      >
        {label}
      </button>
    );
  }
  MockInstanceModal.displayName = `MockInstanceModal(${label})`;
  return MockInstanceModal;
}

jest.mock("@/app/gpus-console/instances/components/podState", () => ({
  __esModule: true,
  default: ({ state }: any) => <span>pod {state}</span>,
}));
jest.mock("@/app/gpus-console/instances/components/spotState", () => ({
  __esModule: true,
  default: ({ state }: any) => <span>spot {state}</span>,
}));
jest.mock("@/app/gpus-console/components/CopyButton", () => ({
  __esModule: true,
  default: function MockCopyButton({ content }: any) {
    return <span>copy {content}</span>;
  },
}));
jest.mock("@/app/gpus-console/components/ContentSkeleton", () => ({
  __esModule: true,
  default: () => <div>loading skeleton</div>,
}));
jest.mock("@/app/gpus-console/components/DataEmpty", () => ({
  __esModule: true,
  default: () => <div>No GPU instances</div>,
}));
jest.mock("@/app/gpus-console/instances/components/InstanceMetrics", () => ({
  __esModule: true,
  default: ({ id }: any) => <div>metrics {id}</div>,
}));
jest.mock("@/app/gpus-console/components/InstanceLog", () => ({
  __esModule: true,
  default: ({ address }: any) => <div>instance log {address}</div>,
}));
jest.mock("@/app/gpus-console/instances/components/netInfo", () => ({
  __esModule: true,
  default: () => <div>net info</div>,
}));
jest.mock("@/app/gpus-console/instances/components/autoRenewState", () => ({
  __esModule: true,
  default: () => <span>auto renew state</span>,
}));

jest.mock("@/app/gpus-console/instances/components/createSavingsPlan", () => ({
  __esModule: true,
  default: mockSimpleComponent("create savings plan"),
}));
jest.mock("@/app/gpus-console/instances/components/editInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("edit instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/upgradeInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("upgrade instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/connectInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("connect instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/startInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("start instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/restartInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("restart instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/stopInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("stop instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/terminateInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("terminate instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/logs", () => ({
  __esModule: true,
  default: mockSimpleComponent("logs modal"),
}));
jest.mock("@/app/gpus-console/instances/components/saveImage", () => ({
  __esModule: true,
  default: mockSimpleComponent("save image modal"),
}));
jest.mock("@/app/gpus-console/instances/components/jobCreateSuccess", () => ({
  __esModule: true,
  default: mockSimpleComponent("job success modal"),
}));
jest.mock(
  "@/app/gpus-console/instances/components/migrateJobCreateSuccess",
  () => ({
    __esModule: true,
    default: mockSimpleComponent("migrate success modal"),
  }),
);
jest.mock(
  "@/app/gpus-console/instances/components/unabledStartInstanceNoSource",
  () => ({
    __esModule: true,
    default: mockSimpleComponent("unable start modal"),
  }),
);
jest.mock("@/app/gpus-console/instances/components/migrateInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("migrate instance modal"),
}));
jest.mock(
  "@/app/gpus-console/instances/components/autoMigrateInstance",
  () => ({
    __esModule: true,
    default: mockSimpleComponent("auto migrate modal"),
  }),
);
jest.mock("@/app/gpus-console/instances/components/mountNetVolume", () => ({
  __esModule: true,
  default: mockSimpleComponent("mount volume modal"),
}));
jest.mock("@/app/gpus-console/instances/components/renewInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("renew instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/autoRenewInstance", () => ({
  __esModule: true,
  default: mockSimpleComponent("auto renew modal"),
}));
jest.mock(
  "@/app/gpus-console/instances/components/autoRenewInstanceBat",
  () => ({
    __esModule: true,
    default: mockSimpleComponent("auto renew batch modal"),
  }),
);

const mockReqGpuInstance = reqGpuInstance as jest.Mock;
const mockReqSingleGpuInstance = reqSingleGpuInstance as jest.Mock;
const mockReqUpdateGpuInstanceName = reqUpdateGpuInstanceName as jest.Mock;
const mockReqInstanceMountList = reqInstanceMountList as jest.Mock;
const mockReqRenewInstance = reqRenewInstance as jest.Mock;
const mockReqSetAutoRenew = reqSetAutoRenew as jest.Mock;
const mockReqTransToMonthlyInstance = reqTransToMonthlyInstance as jest.Mock;
const mockReqMarketQueryOptions = reqMarketQueryOptions as jest.Mock;
const mockRequestInstanceMarkEffect = requestInstanceMarkEffect as jest.Mock;
const mockMessageSuccess = message.success as jest.Mock;
const mockMessageWarning = message.warning as jest.Mock;

const instance = {
  billingMode: "onDemand",
  cpuNum: 8,
  createdAt: "1768435200",
  creator: "member-1",
  gpuIds: ["0"],
  gpuNum: 1,
  id: "inst-1",
  imageUrl: "registry/image:latest",
  isApiInstance: false,
  memory: 32,
  name: "render-node",
  productName: "RTX 4090",
  rootfsSize: 50,
  spotStatus: "",
  status: "running",
  uuid: "user-1",
};

const instanceDetails = {
  clusterId: "cluster-a",
  clusterName: "US East",
  connectComponentLog: { systemLogAddress: "syslog" },
  gpuNum: 1,
  id: "inst-1",
  instancePrice: "250000",
  jobs: [],
  monthlyPrice: [{ price: "10" }],
  version: "v2",
  volumeMounts: [
    { mountPath: "/data", size: 100, type: "local" },
    { mountPath: "/net", size: 200, type: "network" },
  ],
};

describe("GPU instances section", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    localStorage.clear();
    mockRequestInstanceMarkEffect.mockResolvedValue([]);
    mockReqMarketQueryOptions.mockResolvedValue({
      clusters: [{ id: "cluster-a", name: "US East" }],
    });
    mockReqGpuInstance.mockResolvedValue({ instances: [instance], total: 1 });
    mockReqSingleGpuInstance.mockResolvedValue(instanceDetails);
    mockReqUpdateGpuInstanceName.mockResolvedValue({});
    mockReqInstanceMountList.mockResolvedValue({
      instancebind: [{ id: "bind-1" }],
      listvolume: [{ id: "vol-1" }],
    });
    mockReqRenewInstance.mockResolvedValue({});
    mockReqSetAutoRenew.mockResolvedValue({});
    mockReqTransToMonthlyInstance.mockResolvedValue({});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("loads instances, applies filters/searches, expands details, paginates, and edits the name", async () => {
    render(<Section />);

    expect(await screen.findByText("render-node")).toBeInTheDocument();
    expect(screen.getByText("ID:")).toBeInTheDocument();
    expect(screen.getByText(/RTX 4090 \* 1/)).toBeInTheDocument();
    expect(screen.getByText(/ops@example.com \(Ops\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All Billing Mode" }));
    fireEvent.click(screen.getByRole("button", { name: "All Status" }));
    fireEvent.click(screen.getByRole("button", { name: "All Clusters" }));
    fireEvent.click(screen.getByRole("button", { name: "choose member" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Instance Name/ID Filter" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "GPU Type" }));

    await waitFor(() => {
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ billingMode: "monthly" }),
      );
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pulling" }),
      );
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ clusters: "cluster-a" }),
      );
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ creators: "member-1" }),
      );
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Instance Name/ID Filter value" }),
      );
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ productName: "GPU Type value" }),
      );
    });

    fireEvent.click(
      await screen.findByRole("button", { name: "rows per page" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "next page" }));

    await waitFor(() => {
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ pageSize: 25 }),
      );
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ pageNum: 2 }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /render-node/ }));

    expect(await screen.findByText("metrics inst-1")).toBeInTheDocument();
    expect(screen.getByText(/Container Disk/)).toBeInTheDocument();
    expect(screen.getByText(/US East/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cloud Storage" }));

    await waitFor(() => {
      expect(mockReqInstanceMountList).toHaveBeenCalledWith({
        clusterId: "cluster-a",
        instanceId: "inst-1",
      });
      expect(screen.getByRole("dialog", { name: "modal" })).toBeInTheDocument();
      expect(screen.getByText("mount volume modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("render-node").nextSibling as Element);
    const nameInput = screen.getByPlaceholderText("Enter your instance name");
    fireEvent.change(nameInput, { target: { value: "renamed-node" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockReqUpdateGpuInstanceName).toHaveBeenCalledWith({
        instanceId: "inst-1",
        name: "renamed-node",
      });
      expect(mockMessageSuccess).toHaveBeenCalledWith("success");
    });
  });

  it("renders empty state when the instance API returns no rows", async () => {
    mockReqGpuInstance.mockResolvedValue({ instances: [], total: 0 });

    render(<Section />);

    expect(await screen.findByText("No GPU instances")).toBeInTheDocument();
  });

  it("validates empty instance names before submitting an update", async () => {
    render(<Section />);

    expect(await screen.findByText("render-node")).toBeInTheDocument();

    fireEvent.click(screen.getByText("render-node").nextSibling as Element);
    fireEvent.change(screen.getByPlaceholderText("Enter your instance name"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(mockMessageWarning).toHaveBeenCalledWith(
      "please input valid instance name",
    );
    expect(mockReqUpdateGpuInstanceName).not.toHaveBeenCalled();
  });

  it("opens lifecycle modals from a running on-demand instance and refreshes after callbacks", async () => {
    render(<Section />);

    fireEvent.click(await screen.findByRole("button", { name: /render-node/ }));
    expect(await screen.findByText("metrics inst-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save Image" }));
    fireEvent.click(await screen.findByText("save image modal"));

    await waitFor(() => {
      expect(screen.getByText("job success modal")).toBeInTheDocument();
      expect(mockReqSingleGpuInstance).toHaveBeenCalledWith("inst-1");
    });

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Migrate" }));
    fireEvent.click(await screen.findByText("migrate instance modal"));

    await waitFor(() => {
      expect(screen.getByText("migrate success modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Automatic Migration" }),
    );
    const detailCallsBeforeAutoMigrate =
      mockReqSingleGpuInstance.mock.calls.length;
    fireEvent.click(await screen.findByText("auto migrate modal"));

    await waitFor(() => {
      expect(mockReqSingleGpuInstance.mock.calls.length).toBeGreaterThan(
        detailCallsBeforeAutoMigrate,
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Switch to Subscription" }),
    );
    fireEvent.click(await screen.findByText("renew instance modal"));

    await waitFor(() => {
      expect(mockReqTransToMonthlyInstance).toHaveBeenCalledWith(
        expect.objectContaining({ instanceId: "inst-1" }),
      );
      expect(mockMessageSuccess).toHaveBeenCalledWith("success");
    });

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    fireEvent.click(await screen.findByText("terminate instance modal"));

    await waitFor(() => {
      expect(mockReqGpuInstance).toHaveBeenCalled();
    });
  });

  it("renews and configures auto-renew for subscription instances", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [
        {
          ...instance,
          billingMode: "monthly",
          endTime: "1771113600",
        },
      ],
      total: 1,
    });

    render(<Section />);

    fireEvent.click(await screen.findByRole("button", { name: /render-node/ }));
    expect(await screen.findByText("auto renew state")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Renew" }));
    fireEvent.click(await screen.findByText("renew instance modal"));

    await waitFor(() => {
      expect(mockReqRenewInstance).toHaveBeenCalledWith(
        expect.objectContaining({ instanceId: "inst-1" }),
      );
      expect(mockMessageSuccess).toHaveBeenCalledWith("success");
    });

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Set Auto-renew" }));
    fireEvent.click(await screen.findByText("auto renew modal"));

    await waitFor(() => {
      expect(mockReqSetAutoRenew).toHaveBeenCalledWith(
        expect.objectContaining({ instanceId: "inst-1" }),
      );
    });
  });
});
