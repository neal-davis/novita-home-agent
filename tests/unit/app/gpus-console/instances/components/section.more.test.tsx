import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Section from "@/app/gpus-console/instances/components/section";
import {
  reqGpuInstance,
  reqSingleGpuInstance,
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
jest.mock("@/api/config", () => ({ requestInstanceMarkEffect: jest.fn() }));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn(), warning: jest.fn() },
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
  MyPagination: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange?.({}, 2)}>
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
  SelectFilter: ({ placeholder }: any) => <div>{placeholder}</div>,
}));
jest.mock("@/app/components/TeamMemberSelector", () => ({
  __esModule: true,
  default: () => <button type="button">choose member</button>,
}));
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="select instance"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
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
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));
jest.mock("@/lib/hooks/usePermission", () => ({ usePermission: () => true }));
jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

function mockModal(label: string) {
  function MockModal({ finishForm }: any) {
    return (
      <button
        type="button"
        onClick={() =>
          finishForm?.(true, { id: "inst-1", instanceId: "inst-1" })
        }
      >
        {label}
      </button>
    );
  }
  MockModal.displayName = `MockModal(${label})`;
  return MockModal;
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
  default: ({ content }: any) => <span>copy {content}</span>,
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
  default: mockModal("create savings plan"),
}));
jest.mock("@/app/gpus-console/instances/components/editInstance", () => ({
  __esModule: true,
  default: mockModal("edit instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/upgradeInstance", () => ({
  __esModule: true,
  default: mockModal("upgrade instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/connectInstance", () => ({
  __esModule: true,
  default: mockModal("connect instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/startInstance", () => ({
  __esModule: true,
  default: mockModal("start instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/restartInstance", () => ({
  __esModule: true,
  default: mockModal("restart instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/stopInstance", () => ({
  __esModule: true,
  default: mockModal("stop instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/terminateInstance", () => ({
  __esModule: true,
  default: mockModal("terminate instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/logs", () => ({
  __esModule: true,
  default: mockModal("logs modal"),
}));
jest.mock("@/app/gpus-console/instances/components/saveImage", () => ({
  __esModule: true,
  default: mockModal("save image modal"),
}));
jest.mock("@/app/gpus-console/instances/components/jobCreateSuccess", () => ({
  __esModule: true,
  default: mockModal("job success modal"),
}));
jest.mock(
  "@/app/gpus-console/instances/components/migrateJobCreateSuccess",
  () => ({ __esModule: true, default: mockModal("migrate success modal") }),
);
jest.mock(
  "@/app/gpus-console/instances/components/unabledStartInstanceNoSource",
  () => ({ __esModule: true, default: mockModal("unable start modal") }),
);
jest.mock("@/app/gpus-console/instances/components/migrateInstance", () => ({
  __esModule: true,
  default: mockModal("migrate instance modal"),
}));
jest.mock(
  "@/app/gpus-console/instances/components/autoMigrateInstance",
  () => ({ __esModule: true, default: mockModal("auto migrate modal") }),
);
jest.mock("@/app/gpus-console/instances/components/mountNetVolume", () => ({
  __esModule: true,
  default: mockModal("mount volume modal"),
}));
jest.mock("@/app/gpus-console/instances/components/renewInstance", () => ({
  __esModule: true,
  default: mockModal("renew instance modal"),
}));
jest.mock("@/app/gpus-console/instances/components/autoRenewInstance", () => ({
  __esModule: true,
  default: mockModal("auto renew modal"),
}));
jest.mock(
  "@/app/gpus-console/instances/components/autoRenewInstanceBat",
  () => ({ __esModule: true, default: mockModal("auto renew batch modal") }),
);

const mockReqGpuInstance = reqGpuInstance as jest.Mock;
const mockReqSingleGpuInstance = reqSingleGpuInstance as jest.Mock;
const mockReqMarketQueryOptions = reqMarketQueryOptions as jest.Mock;
const mockRequestInstanceMarkEffect = requestInstanceMarkEffect as jest.Mock;
const mockMessageWarning = message.warning as jest.Mock;

const instanceDetails = {
  clusterId: "cluster-a",
  clusterName: "US East",
  id: "inst-1",
  jobs: [],
  monthlyPrice: [{ price: "10" }],
  version: "v1",
  volumeMounts: [],
};

describe("GPU instances section extra branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    localStorage.clear();
    mockRequestInstanceMarkEffect.mockResolvedValue([]);
    mockReqMarketQueryOptions.mockResolvedValue({ clusters: [] });
    mockReqSingleGpuInstance.mockResolvedValue(instanceDetails);
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("renders the spot state badge for instances being reclaimed", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [
        {
          billingMode: "spot",
          createdAt: "1768435200",
          gpuNum: 1,
          id: "inst-1",
          name: "spot-node",
          productName: "RTX 4090",
          rootfsSize: 50,
          spotStatus: "reclaiming",
          spotReclaimTime: "0",
          status: "running",
        },
      ],
      total: 1,
    });

    render(<Section />);
    expect(await screen.findByText("spot reclaiming")).toBeInTheDocument();
  });

  it("warns instead of opening terminate for a marked instance", async () => {
    mockRequestInstanceMarkEffect.mockResolvedValue([
      {
        instanceId: "inst-1",
        effectiveStartDate: "2000-01-01",
        effectiveStartTime: "00:00:00",
        effectiveEndDate: "2100-01-01",
        effectiveEndTime: "00:00:00",
      },
    ]);
    mockReqGpuInstance.mockResolvedValue({
      instances: [
        {
          billingMode: "onDemand",
          createdAt: "1768435200",
          gpuNum: 1,
          id: "inst-1",
          name: "render-node",
          productName: "RTX 4090",
          rootfsSize: 50,
          spotStatus: "",
          status: "running",
        },
      ],
      total: 1,
    });

    render(<Section />);
    fireEvent.click(await screen.findByRole("button", { name: /render-node/ }));
    await screen.findByText("metrics inst-1");
    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Terminate" }));

    await waitFor(() => {
      expect(mockMessageWarning).toHaveBeenCalledWith(
        expect.stringContaining("Reserved instances cannot be stopped"),
      );
    });
    expect(
      screen.queryByText("terminate instance modal"),
    ).not.toBeInTheDocument();
  });

  it("opens the restart modal for a running instance", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [
        {
          billingMode: "onDemand",
          createdAt: "1768435200",
          gpuNum: 1,
          id: "inst-1",
          name: "render-node",
          productName: "RTX 4090",
          rootfsSize: 50,
          spotStatus: "",
          status: "running",
        },
      ],
      total: 1,
    });

    render(<Section />);
    fireEvent.click(await screen.findByRole("button", { name: /render-node/ }));
    await screen.findByText("metrics inst-1");
    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(
      await screen.findByText("restart instance modal"),
    ).toBeInTheDocument();
  });
});
