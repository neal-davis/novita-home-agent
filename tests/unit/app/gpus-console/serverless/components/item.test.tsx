import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ServerlessItem from "@/app/gpus-console/serverless/components/item";
import {
  deleteEndpoint,
  ENDPOINT_TYPE,
  SCALE_POLICY,
  STORAGE_TYPE,
  updateEndpoint,
  WORKER_STATE,
} from "@/api/gpu-instance/serverless";
import { message } from "@/components/ui/standard/notify";
import { copyText } from "@/lib/utils/utils";

let mockArrears = false;
let mockAddEndpointError = "";
let mockAddEndpointParams: any = {
  clusterIDs: [""],
  imageAddr: "registry.test/updated:latest",
  maxWorker: 4,
  minWorker: 1,
};
const mockAuthList = [{ id: "auth-1" }];
const mockClusterList = [
  { id: "cluster-a", name: "US East" },
  { id: "cluster-b", name: "EU West" },
];
const mockFormConstraints = { maxWorker: 8 };
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
  ENDPOINT_STATE: {
    SERVING: "serving",
  },
  ENDPOINT_TYPE: {
    SERVERLESS: "serverless",
  },
  SCALE_POLICY: {
    QUEUE_DELAY: "queue_delay",
    REQUEST_COUNT: "request_count",
  },
  STORAGE_TYPE: {
    LOCAL: "local",
    NETWORK: "network",
  },
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
    authList: mockAuthList,
    clusterList: mockClusterList,
    formConstraints: mockFormConstraints,
    products: mockProducts,
  }),
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
      },
    }),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/lib/utils/utils", () => ({
  copyText: jest.fn(),
}));

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
  AppTooltip: ({ children, title }: any) => (
    <span title={typeof title === "string" ? title : undefined}>
      {children}
    </span>
  ),
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
      <div>
        workers shown {workers.map((worker: any) => worker.id).join(",")}
      </div>
    ),
  }),
);

jest.mock("@/app/gpus-console/serverless/components/Logs", () => ({
  __esModule: true,
  default: ({ finishForm, instanceLogAddress }: any) => (
    <div role="dialog" aria-label="logs">
      logs {instanceLogAddress}
      <button type="button" onClick={finishForm}>
        close logs
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/serverless-deploy/components/addEndpoint", () => {
  const React = jest.requireActual("react");
  const MockAddEndpoint = React.forwardRef(
    ({ endpoint, mode, onGetCreateParameter }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        checkValid: () => mockAddEndpointError,
      }));
      React.useEffect(() => {
        onGetCreateParameter(mockAddEndpointParams);
      }, [onGetCreateParameter]);
      return (
        <div>
          add endpoint {mode} {endpoint?.name} {endpoint?.imageAddr}
        </div>
      );
    },
  );
  MockAddEndpoint.displayName = "MockAddEndpoint";
  return {
    __esModule: true,
    default: MockAddEndpoint,
  };
});

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    SETTINGS: {
      TEAM_MEMBER_EDIT_CANCEL: "cancel",
      TEAM_MEMBER_EDIT_SAVE: "save",
    },
  },
}));

const mockDeleteEndpoint = deleteEndpoint as jest.Mock;
const mockUpdateEndpoint = updateEndpoint as jest.Mock;

const endpoint = {
  clusterIDs: ["cluster-a"],
  createdAt: "1700000000",
  creator: "member-1",
  envs: [{ key: "MODEL", value: "sdxl" }],
  healthy: { path: "/health" },
  id: "endpoint-1",
  image: {
    credential: "auth-1",
    imageAddr: "registry.test/app:latest",
    startCmd: "python app.py",
  },
  log: "https://logs.test/endpoint-1",
  name: "serverless-a",
  port: 8000,
  product: { id: "product-a" },
  scalePolicy: { type: SCALE_POLICY.REQUEST_COUNT, value: "5" },
  state: "serving",
  storage: [
    { mountPath: "/workspace", size: 20, type: STORAGE_TYPE.LOCAL },
    { id: "storage-a", mountPath: "/data", type: STORAGE_TYPE.NETWORK },
  ],
  type: ENDPOINT_TYPE.SERVERLESS,
  url: "https://endpoint.test",
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
  workers: [
    { id: "worker-running", state: WORKER_STATE.RUNNING },
    { id: "worker-failed", state: WORKER_STATE.FAILED },
  ],
};

function renderItem(endpointOverrides: Record<string, unknown> = {}) {
  const refresh = jest.fn();
  render(
    <ServerlessItem
      endpoint={{ ...endpoint, ...endpointOverrides }}
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
    clusterIDs: [""],
    imageAddr: "registry.test/updated:latest",
    maxWorker: 4,
    minWorker: 1,
  };
  mockDeleteEndpoint.mockResolvedValue({});
  mockUpdateEndpoint.mockResolvedValue({ id: "endpoint-1" });
});

describe("ServerlessItem", () => {
  it("renders endpoint metadata and filters expanded workers by state", () => {
    renderItem();

    expect(screen.getByText("Serving")).toBeInTheDocument();
    expect(screen.getByText("serverless-a")).toBeInTheDocument();
    expect(screen.getByText("Ops")).toBeInTheDocument();
    expect(screen.getByText("date:hour:1700000000")).toBeInTheDocument();
    expect(screen.getByText("endpoint-1")).toBeInTheDocument();
    expect(screen.getByText("https://endpoint.test")).toBeInTheDocument();
    expect(screen.getByText("US East")).toBeInTheDocument();
    expect(screen.getByText("2 * RTX 4090")).toBeInTheDocument();
    expect(screen.getByText("Min 1 - Max 3")).toBeInTheDocument();
    expect(screen.getByText("1 Running")).toBeInTheDocument();
    expect(screen.getByText("1 Failed")).toBeInTheDocument();

    fireEvent.click(screen.getByText("1 Failed"));
    expect(screen.getByText("workers shown worker-failed")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("toggle workers"));
    expect(
      screen.queryByText("workers shown worker-failed"),
    ).not.toBeInTheDocument();
  });

  it("opens endpoint logs and deletes only after the endpoint name is confirmed", async () => {
    const refresh = renderItem();

    fireEvent.click(screen.getByLabelText("toggle workers"));
    fireEvent.click(screen.getByText("Logs"));
    expect(screen.getByRole("dialog", { name: "logs" })).toHaveTextContent(
      "https://logs.test/endpoint-1",
    );
    fireEvent.click(screen.getByText("close logs"));
    expect(
      screen.queryByRole("dialog", { name: "logs" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText(/Deleting your/)).toHaveTextContent("serverless-a");
    fireEvent.click(screen.getAllByText("serverless-a")[1]);
    expect(copyText).toHaveBeenCalledWith("serverless-a");

    const deleteButton = screen
      .getAllByText("Delete")
      .at(-1) as HTMLButtonElement;
    expect(deleteButton).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Your Endpoint Name"), {
      target: { value: "wrong-name" },
    });
    expect(deleteButton).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Your Endpoint Name"), {
      target: { value: "serverless-a" },
    });
    expect(deleteButton).not.toBeDisabled();
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteEndpoint).toHaveBeenCalledWith("endpoint-1");
    });
    expect(message.success).toHaveBeenCalledWith(
      "Delete endpoint successfully",
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("validates and confirms endpoint modification with normalized params", async () => {
    const refresh = renderItem();

    fireEvent.click(screen.getByLabelText("toggle workers"));
    fireEvent.click(screen.getByText("Edit"));
    expect(
      screen.getByText(
        "add endpoint Edit serverless-a registry.test/app:latest",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Save"));
    expect(
      await screen.findByRole("dialog", { name: "Confirm changes" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("confirm modify"));

    await waitFor(() => {
      expect(mockUpdateEndpoint).toHaveBeenCalledWith("endpoint-1", {
        clusterIDs: [],
        cudaVersion: "12.4",
        imageAddr: "registry.test/updated:latest",
        localDiskSize: 20,
        localMountPath: "/workspace",
        maxWorker: 4,
        minWorker: 1,
      });
    });
    expect(message.success).toHaveBeenCalledWith("Endpoint saved successfully");
    expect(refresh).toHaveBeenCalled();
  });

  it("blocks modification when AddEndpoint validation fails", async () => {
    renderItem();
    mockAddEndpointError = "Workers Min is invalid";

    fireEvent.click(screen.getByLabelText("toggle workers"));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Save"));

    expect(message.error).toHaveBeenCalledWith("Workers Min is invalid");
    expect(
      screen.queryByRole("dialog", { name: "Confirm changes" }),
    ).not.toBeInTheDocument();
    expect(mockUpdateEndpoint).not.toHaveBeenCalled();
  });

  it("shows arrears scaling state when no workers are running", () => {
    mockArrears = true;

    renderItem({ workers: [] });

    expect(
      screen.getByText("Your account balance is insufficient, scaled to 0"),
    ).toBeInTheDocument();
  });
});
