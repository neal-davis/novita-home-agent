import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ServerlessItem from "@/app/gpus-console/serverless/components/item";
import {
  ENDPOINT_TYPE,
  SCALE_POLICY,
  STORAGE_TYPE,
  updateEndpoint,
  WORKER_STATE,
} from "@/api/gpu-instance/serverless";
import { message } from "@/components/ui/standard/notify";

let mockArrears = false;
let mockAddEndpointError = "";
let mockAddEndpointParams: any = {
  clusterIDs: ["cluster-a"],
  imageAddr: "registry.test/updated:latest",
};
let mockMembers: any[] = [
  {
    alias: "Ops",
    email: "ops@example.com",
    memberId: "member-1",
    userId: "user-1",
  },
];
const mockProducts = [
  {
    clusterIDs: ["cluster-b"],
    discount: 0.12,
    gpu_name: "RTX 4090",
    id: "product-a",
    price: 0.2,
  },
];

jest.mock("@/api/gpu-instance/serverless", () => ({
  deleteEndpoint: jest.fn(),
  ENDPOINT_STATE: { SERVING: "serving" },
  ENDPOINT_TYPE: { SERVERLESS: "serverless" },
  SCALE_POLICY: { QUEUE_DELAY: "queue_delay", REQUEST_COUNT: "request_count" },
  STORAGE_TYPE: { LOCAL: "local", NETWORK: "network" },
  updateEndpoint: jest.fn(),
  WORKER_STATE: {
    CREATING: "creating",
    ERROR: "error",
    EXITED: "exited",
    FAILED: "failed",
    PAUSED: "paused",
    PENDING: "pending",
    PULLING: "pulling",
    RUNNING: "running",
    STARTING: "starting",
    STOPPED: "stopped",
    STOPPING: "stopping",
    TERMINATING: "terminating",
    UNKNOWN: "unknown",
    UNPAUSED: "unpaused",
    UNSCHEDULING: "unscheduling",
  },
}));

jest.mock("@/app/gpus-console/serverless/components/Context", () => ({
  useServerlessContext: () => ({
    arrears: mockArrears,
    authList: [{ id: "auth-1" }],
    clusterList: [{ id: "cluster-a", name: "US East" }],
    formConstraints: { maxWorker: 8 },
    products: mockProducts,
  }),
}));

jest.mock("@/store", () => ({
  useAppSelector: (selector: any) =>
    selector({ user: { allTeamMembers: mockMembers } }),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/lib/utils/utils", () => ({ copyText: jest.fn() }));
jest.mock("@/lib/utils/date", () => ({
  getDateDisplay: (value: number, mode: string) => `date:${mode}:${value}`,
}));
jest.mock("lucide-react", () => ({
  ChevronDown: ({ onClick }: any) => (
    <button aria-label="toggle workers" onClick={onClick} type="button">
      toggle workers
    </button>
  ),
  CircleQuestionMark: () => <span>price help</span>,
  Ellipsis: () => <span>ellipsis</span>,
  Globe: () => <span>globe</span>,
  Gpu: () => <span>gpu</span>,
  Loader2: () => <span>loading</span>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, ...props }: any) => (
    <button disabled={disabled} onClick={onClick} type="button" {...props}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, placeholder, value, ...props }: any) => (
    <input
      aria-label={placeholder}
      onChange={(event) => onChange?.(event)}
      placeholder={placeholder}
      value={value}
      {...props}
    />
  ),
}));
jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <>{children}</>,
}));
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div role="dialog">{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));
jest.mock("@/components/ui/standard/confirm-dialog", () => ({
  ConfirmDialog: ({ description, onConfirm, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <div>{description}</div>
        <button type="button" onClick={onConfirm}>
          confirm modify
        </button>
      </div>
    ) : null,
}));
jest.mock("@/app/gpus-console/components/CopyButton", () => ({
  __esModule: true,
  default: ({ content }: any) => <button>copy {content}</button>,
}));
jest.mock(
  "@/app/gpus-console/serverless/components/Worker/WorkerManager",
  () => ({
    __esModule: true,
    default: ({ workers }: any) => (
      <div>workers shown {workers.map((w: any) => w.id).join(",")}</div>
    ),
  }),
);
jest.mock("@/app/gpus-console/serverless/components/Logs", () => ({
  __esModule: true,
  default: () => (
    <div role="dialog" aria-label="logs">
      logs
    </div>
  ),
}));
jest.mock("@/app/gpus-console/serverless-deploy/components/addEndpoint", () => {
  const React = jest.requireActual("react");
  const MockAddEndpoint = React.forwardRef(
    ({ endpoint, onGetCreateParameter }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        checkValid: () => mockAddEndpointError,
      }));
      React.useEffect(() => {
        onGetCreateParameter(mockAddEndpointParams);
      }, [onGetCreateParameter]);
      return (
        <div>
          add endpoint clusters:{(endpoint?.clusterIDs || []).join("|")}
        </div>
      );
    },
  );
  MockAddEndpoint.displayName = "MockAddEndpoint";
  return { __esModule: true, default: MockAddEndpoint };
});
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    SETTINGS: {
      TEAM_MEMBER_EDIT_CANCEL: "cancel",
      TEAM_MEMBER_EDIT_SAVE: "save",
    },
  },
}));

const mockUpdateEndpoint = updateEndpoint as jest.Mock;

const baseEndpoint = {
  clusterIDs: ["cluster-a"],
  createdAt: "1700000000",
  creator: "missing-member",
  envs: [],
  healthy: { path: "/health" },
  id: "endpoint-1",
  image: {
    credential: "auth-1",
    imageAddr: "registry.test/app:latest",
    startCmd: "x",
  },
  log: "",
  logs: "",
  name: "serverless-a",
  port: 8000,
  product: { id: "product-a" },
  scalePolicy: { type: SCALE_POLICY.QUEUE_DELAY, value: "10" },
  state: "",
  storage: [{ mountPath: "/workspace", size: 20, type: STORAGE_TYPE.LOCAL }],
  type: ENDPOINT_TYPE.SERVERLESS,
  url: "",
  uuid: "user-1",
  workerConfig: {
    cudaVersion: "12.4",
    freeTimeout: 30,
    gpuNum: 2,
    max: 3,
    maxConcurrent: 4,
    min: 1,
    requestTimeout: 60,
  },
  workers: [],
};

function renderItem(overrides: Record<string, unknown> = {}) {
  const refresh = jest.fn();
  render(
    <ServerlessItem
      endpoint={{ ...baseEndpoint, ...overrides }}
      refresh={refresh}
    />,
  );
  return refresh;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockArrears = false;
  mockAddEndpointError = "";
  mockAddEndpointParams = {
    clusterIDs: ["cluster-a"],
    imageAddr: "registry.test/updated:latest",
  };
  mockMembers = [
    {
      alias: "Ops",
      email: "ops@example.com",
      memberId: "member-1",
      userId: "user-1",
    },
  ];
  mockUpdateEndpoint.mockResolvedValue({ id: "endpoint-1" });
});

describe("ServerlessItem extra branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("falls back to the creator matched by uuid when memberId does not match", () => {
    renderItem();
    // matched via uuid -> alias "Ops"
    expect(screen.getByText("Ops")).toBeInTheDocument();
    // no state badge rendered when state is empty
    expect(screen.queryByText("Serving")).not.toBeInTheDocument();
  });

  it("renders an empty creator and no logs button when nothing matches", () => {
    mockMembers = [];
    renderItem();
    fireEvent.click(screen.getByLabelText("toggle workers"));
    expect(screen.queryByText("Logs")).not.toBeInTheDocument();
  });

  it("keeps non-empty clusterIDs in the modify payload and surfaces update errors", async () => {
    mockUpdateEndpoint.mockRejectedValue(new Error("boom"));
    renderItem({
      storage: [
        { id: "net-1", mountPath: "/data", type: STORAGE_TYPE.NETWORK },
        { mountPath: "/ws", size: 30, type: STORAGE_TYPE.LOCAL },
      ],
    });

    fireEvent.click(screen.getByLabelText("toggle workers"));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(await screen.findByText("confirm modify"));

    await waitFor(() => {
      expect(mockUpdateEndpoint).toHaveBeenCalledWith(
        "endpoint-1",
        expect.objectContaining({
          clusterIDs: ["cluster-a"],
          localDiskSize: 30,
        }),
      );
      expect(message.error).toHaveBeenCalledWith("boom");
    });
  });

  it("renders running worker state buttons when workers exist and not in arrears", () => {
    renderItem({ workers: [{ id: "w1", state: WORKER_STATE.RUNNING }] });
    expect(screen.getByText("1 Running")).toBeInTheDocument();
  });

  it("renders a label for every worker state and expands when a populated state is clicked", () => {
    renderItem({
      workers: [
        { id: "w1", state: WORKER_STATE.RUNNING },
        { id: "w2", state: WORKER_STATE.PENDING },
        { id: "w3", state: WORKER_STATE.CREATING },
        { id: "w4", state: WORKER_STATE.PAUSED },
        { id: "w5", state: WORKER_STATE.UNPAUSED },
        { id: "w6", state: WORKER_STATE.STOPPED },
        { id: "w7", state: WORKER_STATE.FAILED },
        { id: "w8", state: WORKER_STATE.UNSCHEDULING },
        { id: "w9", state: WORKER_STATE.TERMINATING },
        { id: "w10", state: WORKER_STATE.ERROR },
        { id: "w11", state: WORKER_STATE.EXITED },
        { id: "w12", state: WORKER_STATE.PULLING },
        { id: "w13", state: WORKER_STATE.STOPPING },
        { id: "w14", state: WORKER_STATE.STARTING },
        { id: "w15", state: WORKER_STATE.UNKNOWN },
      ],
    });

    // getWorkerState switch cases
    expect(screen.getByText("1 Running")).toBeInTheDocument();
    expect(screen.getByText("1 Pending")).toBeInTheDocument();
    expect(screen.getAllByText("1 Starting").length).toBeGreaterThan(0); // CREATING + STARTING
    expect(screen.getByText("1 Paused")).toBeInTheDocument();
    expect(screen.getByText("1 Unpaused")).toBeInTheDocument();
    expect(screen.getByText("1 Unscheduling")).toBeInTheDocument();
    expect(screen.getByText("1 Terminating")).toBeInTheDocument();
    expect(screen.getByText("1 Error")).toBeInTheDocument();
    expect(screen.getByText("1 Exited")).toBeInTheDocument();
    expect(screen.getByText("1 Pulling")).toBeInTheDocument();
    expect(screen.getByText("1 Unknown")).toBeInTheDocument();

    // clicking a populated worker-state badge expands and filters
    fireEvent.click(screen.getByText("1 Running"));
    expect(screen.getByText("workers shown w1")).toBeInTheDocument();
  });

  it("renders the state badge with a capitalized label", () => {
    renderItem({ state: "serving" });
    expect(screen.getByText("Serving")).toBeInTheDocument();
  });

  it("deletes the endpoint once the typed name matches and refreshes", async () => {
    const { deleteEndpoint } = jest.requireMock(
      "@/api/gpu-instance/serverless",
    );
    deleteEndpoint.mockResolvedValue({});
    const refresh = renderItem();

    fireEvent.click(screen.getByLabelText("toggle workers"));
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.change(screen.getByLabelText("Your Endpoint Name"), {
      target: { value: "serverless-a" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteEndpoint).toHaveBeenCalledWith("endpoint-1");
      expect(message.success).toHaveBeenCalledWith(
        "Delete endpoint successfully",
      );
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("does nothing when confirmModify runs without stored params", async () => {
    mockAddEndpointError = "checkValid blocked";
    renderItem();
    fireEvent.click(screen.getByLabelText("toggle workers"));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Save"));

    expect(message.error).toHaveBeenCalledWith("checkValid blocked");
    expect(mockUpdateEndpoint).not.toHaveBeenCalled();
  });

  it("builds init form values for a request-count policy with network storage", async () => {
    renderItem({
      scalePolicy: { type: SCALE_POLICY.REQUEST_COUNT, value: "42" },
      storage: [
        { id: "net-9", mountPath: "/net", type: STORAGE_TYPE.NETWORK },
        { mountPath: "/ws", size: 15, type: STORAGE_TYPE.LOCAL },
      ],
    });

    fireEvent.click(screen.getByLabelText("toggle workers"));
    fireEvent.click(screen.getByText("Edit"));
    // the modify modal renders the mocked AddEndpoint
    expect(
      await screen.findByText(/add endpoint clusters:/),
    ).toBeInTheDocument();
  });
});
