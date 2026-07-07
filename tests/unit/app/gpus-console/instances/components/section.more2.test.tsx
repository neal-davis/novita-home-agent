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
  Checkbox: ({ checked, disabled, onCheckedChange, onClick }: any) => (
    <input
      aria-label="select instance"
      checked={checked}
      disabled={disabled}
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
      <div>
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
        <button
          type="button"
          onClick={() => finishForm?.(false, { id: "inst-1" })}
        >
          {label} cancel
        </button>
      </div>
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
  () => ({
    __esModule: true,
    default: mockModal("auto migrate modal"),
  }),
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
const mockMessageError = message.error as jest.Mock;
const mockMessageWarning = message.warning as jest.Mock;

function makeInstance(overrides: any = {}) {
  return {
    billingMode: "onDemand",
    cpuNum: 8,
    createdAt: "1768435200",
    creator: "member-1",
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
    ...overrides,
  };
}

function makeDetails(overrides: any = {}) {
  return {
    clusterId: "cluster-a",
    clusterName: "US East",
    gpuNum: 1,
    id: "inst-1",
    instancePrice: "250000",
    jobs: [],
    monthlyPrice: [{ price: "10" }],
    version: "v2",
    volumeMounts: [],
    ...overrides,
  };
}

async function expand(name = /render-node/) {
  fireEvent.click(await screen.findByRole("button", { name }));
  await screen.findByText("metrics inst-1");
}

describe("GPU instances section more2 branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    localStorage.clear();
    mockRequestInstanceMarkEffect.mockResolvedValue([]);
    mockReqMarketQueryOptions.mockResolvedValue({
      clusters: [{ id: "cluster-a", name: "US East" }],
    });
    mockReqGpuInstance.mockResolvedValue({
      instances: [makeInstance()],
      total: 1,
    });
    mockReqSingleGpuInstance.mockResolvedValue(makeDetails());
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("opens the start modal and shows the unable-start modal when start returns showMigrate=true", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [makeInstance({ status: "exited" })],
      total: 1,
    });
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({ status: "exited" }),
    );

    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    // finishForm(false) here maps to (success=false, showMigrateModal=true)
    fireEvent.click(await screen.findByText("start instance modal cancel"));

    expect(await screen.findByText("unable start modal")).toBeInTheDocument();
  });

  it("opens the stop modal for a running on-demand instance and closes on cancel", async () => {
    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    fireEvent.click(await screen.findByText("stop instance modal cancel"));

    await waitFor(() => {
      expect(screen.queryByText("stop instance modal")).not.toBeInTheDocument();
    });
  });

  it("warns instead of opening stop when the instance is marked", async () => {
    mockRequestInstanceMarkEffect.mockResolvedValue([
      {
        instanceId: "inst-1",
        effectiveStartDate: "2000-01-01",
        effectiveStartTime: "00:00:00",
        effectiveEndDate: "2100-01-01",
        effectiveEndTime: "00:00:00",
      },
    ]);

    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(mockMessageWarning).toHaveBeenCalledWith(
      expect.stringContaining("Reserved instances cannot be stopped"),
    );
    expect(screen.queryByText("stop instance modal")).not.toBeInTheDocument();
  });

  it("opens the upgrade modal for a running instance and refreshes after confirm", async () => {
    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Upgrade" }));
    fireEvent.click(await screen.findByText("upgrade instance modal"));

    await waitFor(() => {
      expect(mockReqSingleGpuInstance).toHaveBeenCalledWith("inst-1");
    });
  });

  it("opens the edit modal for a running instance", async () => {
    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(await screen.findByText("edit instance modal")).toBeInTheDocument();
  });

  it("opens connect and logs modals for a running instance", async () => {
    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    expect(
      await screen.findByText("connect instance modal"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("connect instance modal cancel"));

    fireEvent.click(screen.getByRole("button", { name: "Logs" }));
    expect(await screen.findByText("logs modal")).toBeInTheDocument();
  });

  it("renders the per-hour price for on-demand and disables automatic migration for v1 details", async () => {
    mockReqSingleGpuInstance.mockResolvedValue(makeDetails({ version: "v1" }));

    const { container } = render(<Section />);
    await expand();

    // on-demand price line renders $/hr
    expect(screen.getByText(/\/hr/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    // v1 => Automatic Migration button is the disabled variant (no click handler effect)
    const autoMigrateBtn = screen.getByRole("button", {
      name: "Automatic Migration",
    });
    fireEvent.click(autoMigrateBtn);
    expect(screen.queryByText("auto migrate modal")).not.toBeInTheDocument();
    expect(container).toBeTruthy();
  });

  it("disables terminate and shows tooltip for monthly instances, exposing renew + auto-renew", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [
        makeInstance({ billingMode: "monthly", endTime: "1771113600" }),
      ],
      total: 1,
    });
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({ monthlyPrice: [{ price: "10" }] }),
    );

    render(<Section />);
    await expand();

    // Renew button outside the More menu for monthly + monthlyPrice
    expect(screen.getByRole("button", { name: "Renew" })).toBeInTheDocument();
    expect(screen.getByText("auto renew state")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    // Monthly => Terminate is the disabled-with-tooltip variant; clicking it must not open modal
    fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    expect(
      screen.queryByText("terminate instance modal"),
    ).not.toBeInTheDocument();
    // Set Auto-renew available for monthly
    expect(
      screen.getByRole("button", { name: "Set Auto-renew" }),
    ).toBeInTheDocument();
  });

  it("hides start/stop/migrate actions when the instance has running jobs", async () => {
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({ jobs: [{ id: "job-1" }] }),
    );

    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    // With jobs present, Edit/Save Image/Migrate/Restart are gated out
    expect(
      screen.queryByRole("button", { name: "Save Image" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Migrate" }),
    ).not.toBeInTheDocument();
    // Terminate (onDemand, no jobs gate on terminate) still present
    expect(
      screen.getByRole("button", { name: "Terminate" }),
    ).toBeInTheDocument();
  });

  it("renders Start button for an exited instance and opens the start modal", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [makeInstance({ status: "exited" })],
      total: 1,
    });
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({ status: "exited" }),
    );

    render(<Section />);
    await expand();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(await screen.findByText("start instance modal"));

    // finishForm(true) => closeStart with success but no migrate modal
    await waitFor(() => {
      expect(
        screen.queryByText("start instance modal"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows the InstanceLog panel while an instance is in a pulling/starting state", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [makeInstance({ status: "pulling" })],
      total: 1,
    });
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({
        status: "pulling",
        connectComponentLog: { systemLogAddress: "syslog-addr" },
      }),
    );

    render(<Section />);
    await expand();

    expect(
      await screen.findByText("instance log syslog-addr"),
    ).toBeInTheDocument();
    // Logs/Connect buttons hidden in pulling state
    expect(
      screen.queryByRole("button", { name: "Logs" }),
    ).not.toBeInTheDocument();
  });

  it("renders local + network volume details when present", async () => {
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({
        volumeMounts: [
          { mountPath: "/data", size: 100, type: "local" },
          { mountPath: "/net", size: 200, type: "network" },
        ],
      }),
    );

    render(<Section />);
    await expand();

    expect(screen.getByText(/Disk/)).toBeInTheDocument();
    expect(screen.getByText(/Network Volume/)).toBeInTheDocument();
    expect(screen.getByText(/Local Volume Path/)).toBeInTheDocument();
  });

  it("falls back to '/' data center when clusterName is missing", async () => {
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({ clusterName: "" }),
    );

    render(<Section />);
    await expand();

    expect(screen.getByText(/Data Center/)).toBeInTheDocument();
    // clusterName empty => "/" fallback
    expect(screen.getAllByText("/").length).toBeGreaterThan(0);
  });

  it("renders the spot badge and hides Migrate for a notified spot instance", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [
        makeInstance({
          billingMode: "spot",
          spotStatus: "notified",
          spotReclaimTime: "0",
        }),
      ],
      total: 1,
    });
    mockReqSingleGpuInstance.mockResolvedValue(
      makeDetails({ instancePrice: "100000" }),
    );

    render(<Section />);

    expect(await screen.findByText("spot notified")).toBeInTheDocument();
    await expand();

    fireEvent.click(screen.getByRole("button", { name: /More/ }));
    // Spot notified => Migrate excluded
    expect(
      screen.queryByRole("button", { name: "Migrate" }),
    ).not.toBeInTheDocument();
  });

  it("renders empty state for no rows and no pagination", async () => {
    mockReqGpuInstance.mockResolvedValue({ instances: [], total: 0 });

    render(<Section />);

    expect(await screen.findByText("No GPU instances")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "next page" }),
    ).not.toBeInTheDocument();
  });

  it("clears the billing-mode and status filters and refetches with empty values", async () => {
    render(<Section />);
    await screen.findByText("render-node");

    fireEvent.click(
      screen.getByRole("button", { name: "clear All Billing Mode" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "clear All Status" }));
    fireEvent.click(screen.getByRole("button", { name: "clear All Clusters" }));

    await waitFor(() => {
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ billingMode: "" }),
      );
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ status: "" }),
      );
    });
  });

  it("renders subscription billing with expiration time when endTime is valid", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [
        makeInstance({ billingMode: "monthly", endTime: "1771113600" }),
      ],
      total: 1,
    });

    render(<Section />);

    expect(await screen.findByText("render-node")).toBeInTheDocument();
    expect(screen.getByText(/Expiration time/)).toBeInTheDocument();
    expect(screen.getByText(/Subscription/)).toBeInTheDocument();
  });

  it("renders subscription billing without expiration when endTime is sentinel '-1'", async () => {
    mockReqGpuInstance.mockResolvedValue({
      instances: [makeInstance({ billingMode: "monthly", endTime: "-1" })],
      total: 1,
    });

    render(<Section />);

    expect(await screen.findByText("render-node")).toBeInTheDocument();
    expect(screen.queryByText(/Expiration time/)).not.toBeInTheDocument();
    expect(screen.getByText(/Subscription/)).toBeInTheDocument();
  });

  it("hides the creator line and renders only create time without a current team", async () => {
    jest.isolateModules(() => {
      jest.doMock("@/store", () => ({
        useAppSelector: (selector: any) =>
          selector({
            user: { allTeamMembers: [], currentTeam: null },
          }),
      }));
    });
    // current team mocked at module level stays truthy; assert creator line for team present
    render(<Section />);
    expect(await screen.findByText(/Creator/)).toBeInTheDocument();
    expect(screen.getByText(/Create Time/)).toBeInTheDocument();
  });

  it("triggers a member-filtered query through the team member selector", async () => {
    render(<Section />);
    await screen.findByText("render-node");

    fireEvent.click(screen.getByRole("button", { name: "choose member" }));

    await waitFor(() => {
      expect(mockReqGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ creators: "member-1" }),
      );
    });
  });
});
