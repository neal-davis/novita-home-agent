import React, { createRef } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useRouter } from "next/navigation";
import AddEndpoint, {
  AddEndpointRef,
} from "@/app/gpus-console/serverless-deploy/components/addEndpoint";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { message } from "@/components/ui/standard/notify";

let mockUserState: any = { uuid: "user-a" };

jest.mock("next/navigation", () => ({
  usePathname: () => "/gpus-console/serverless-deploy",
  useRouter: jest.fn(),
}));

jest.mock("@/api/gpu-instance/storage", () => ({
  reqGetStorage: jest.fn(),
}));

jest.mock("@/api/gpu-instance/settings", () => ({
  reqGetImageAuths: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

const mockDispatch = jest.fn();
jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => selector({ user: mockUserState }),
}));

jest.mock("@/store/slice/userSlice", () => ({
  setUserState: jest.fn((payload: string) => ({
    payload,
    type: "user/setUserState",
  })),
  UserState: { logout: "logout" },
}));

jest.mock("@/constants/urls", () => ({
  NOVITA_URL: { USER_LOGIN: "/user/login" },
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));

jest.mock("@/lib/utils/dockerAddress", () => ({
  isValidDockerImageAddress: jest.fn((value: string) =>
    value === "bad image" ? "invalid" : "",
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    containerClassName: _containerClassName,
    onChange,
    value,
    ...props
  }: any) => (
    <input value={value} onChange={(event) => onChange?.(event)} {...props} />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="checkbox"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      type="checkbox"
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

jest.mock("@/components/ui/select", () => {
  const React = jest.requireActual("react");
  const SelectContext = React.createContext({
    onValueChange: (_value: any) => {},
  });
  return {
    Select: ({ children, onValueChange, value }: any) => (
      <SelectContext.Provider value={{ onValueChange }}>
        <div data-value={value}>{children}</div>
      </SelectContext.Provider>
    ),
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, onClick, value }: any) => {
      const ctx = React.useContext(SelectContext);
      return (
        <button
          type="button"
          onClick={(event) => {
            onClick?.(event);
            ctx.onValueChange?.(value);
          }}
        >
          {children}
        </button>
      );
    },
    SelectTrigger: ({ children, icon, id }: any) => (
      <div id={id} role="button" tabIndex={0}>
        {children}
        {icon}
      </div>
    ),
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  };
});

jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, onValueChange, value }: any) => (
    <div data-value={value} onClick={() => onValueChange?.("concurrency")}>
      {children}
    </div>
  ),
  RadioGroupItem: ({ children, value }: any) => (
    <span>{children || value}</span>
  ),
}));

jest.mock("@/app/gpus-console/image/components/addImagePrewarmJob", () => ({
  CurrModal: ({ children, onCancel, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title || "modal"}>
        {children}
        <button type="button" onClick={onCancel}>
          close credential modal
        </button>
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  default: ({ addModelValue }: any) => (
    <button type="button" onClick={() => addModelValue(true, "auth-new")}>
      save credential
    </button>
  ),
}));

jest.mock("@/app/gpus-console/storage/components/addNetworkVolume", () => ({
  __esModule: true,
  default: ({ finishOper, openDiag }: any) =>
    openDiag ? (
      <button
        type="button"
        onClick={() =>
          finishOper(true, { clusterId: "cluster-b", storageId: "storage-new" })
        }
      >
        save network volume
      </button>
    ) : null,
}));

const mockRouter = { push: jest.fn() };
const mockReqGetStorage = reqGetStorage as jest.Mock;
const mockReqGetImageAuths = reqGetImageAuths as jest.Mock;
const mockMessageError = message.error as jest.Mock;

const formConstraints = {
  cudaVersionList: ["12.1", "12.4"],
  freeLocalVolumeSize: 20,
  freeRootfsSize: 30,
  maxConcurrencyNum: 16,
  maxFreeTimeout: 600,
  maxLocalVolumeSize: 200,
  maxQueueWaitTime: 120,
  maxRequestNum: 100,
  maxRequestTimeout: 300,
  maxRootfsSize: 200,
  maxWorkerNum: 10,
  minConcurrencyNum: 1,
  minFreeTimeout: 10,
  minLocalVolumeSize: 10,
  minQueueWaitTime: 1,
  minRequestNum: 1,
  minRequestTimeout: 30,
  minRootfsSize: 10,
  minWorkerNum: 0,
};

const clusterList = [
  { id: "cluster-a", name: "US East" },
  { id: "cluster-b", name: "US West" },
];

function renderAddEndpoint(
  props: Partial<React.ComponentProps<typeof AddEndpoint>> = {},
) {
  const ref = createRef<AddEndpointRef>();
  const onGetCreateParameter = jest.fn();
  const onGpuCountChange = jest.fn();
  render(
    <AddEndpoint
      ref={ref}
      authList={[{ id: "auth-a", name: "primary credential" }]}
      clusterList={clusterList}
      formConstraints={formConstraints}
      onGetCreateParameter={onGetCreateParameter}
      onGpuCountChange={onGpuCountChange}
      {...props}
    />,
  );
  return { onGetCreateParameter, onGpuCountChange, ref };
}

function setInput(id: string, value: string) {
  fireEvent.change(document.getElementById(id) as HTMLInputElement, {
    target: { value },
  });
}

function check(ref: React.RefObject<AddEndpointRef>) {
  let result = "";
  act(() => {
    result = ref.current?.checkValid() || "";
  });
  return result;
}

describe("AddEndpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState(
      {},
      "",
      "/gpus-console/serverless-deploy?from=test",
    );
    Element.prototype.scrollIntoView = jest.fn();
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    };
    mockUserState = { uuid: "user-a" };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockReqGetStorage.mockResolvedValue({
      data: [
        {
          clusterId: "cluster-a",
          storageId: "storage-a",
          storageName: "volume-a",
        },
      ],
    });
    mockReqGetImageAuths.mockResolvedValue({
      data: [{ id: "auth-new", name: "new credential" }],
    });
  });

  it("validates required fields, reports the first visible error, and emits valid parameters", async () => {
    const { onGetCreateParameter, onGpuCountChange, ref } = renderAddEndpoint();

    await waitFor(() => expect(mockReqGetStorage).toHaveBeenCalledWith({}));
    expect(check(ref)).toBe("CUDA Version is required");
    expect(
      await screen.findByText("CUDA Version is required"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "12.4" }));
    setInput("serverless_imageAddr", "registry.example.com/app:latest");
    setInput("serverless_httpPort", "8000");
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(onGpuCountChange).toHaveBeenCalledWith(2);
      expect(onGetCreateParameter).toHaveBeenLastCalledWith(
        expect.objectContaining({
          clusterIDs: ["cluster-a"],
          cudaVersion: "12.4",
          gpusPerWorker: 2,
          httpPort: 8000,
          imageAddr: "registry.example.com/app:latest",
          osDiskSize: 30,
        }),
      );
    });
    expect(check(ref)).toBe("");
  });

  it("validates app names, image syntax, scaling limits, and environment keys", async () => {
    const { ref } = renderAddEndpoint();

    await waitFor(() => expect(mockReqGetStorage).toHaveBeenCalled());
    setInput("serverless_appName", "Bad_App");
    expect(check(ref)).toBe(
      "App name can only contain lowercase letters, numbers, and hyphens (-), and must start and end with a letter or number",
    );

    setInput("serverless_appName", "valid-app");
    setInput("serverless_minWorker", "9");
    setInput("serverless_maxWorker", "3");
    expect(check(ref)).toBe(
      "Minimum workers cannot be greater than maximum workers",
    );

    setInput("serverless_minWorker", "1");
    fireEvent.click(screen.getByRole("button", { name: "12.1" }));
    fireEvent.click(screen.getByText("Async"));
    setInput("serverless_maxReqCount", "101");
    expect(check(ref)).toBe(
      "Worker Max Request Count must be less than or equal to 100",
    );

    setInput("serverless_maxReqCount", "10");
    setInput("serverless_imageAddr", "bad image");
    expect(check(ref)).toBe("The container image is not valid");

    setInput("serverless_imageAddr", "registry.example.com/app:latest");
    setInput("serverless_httpPort", "8000");
    fireEvent.click(
      screen.getByRole("button", { name: "+ Add Environment Variable" }),
    );
    expect(check(ref)).toBe("Environment Variables key is required");
  });

  it("opens credential and network-volume creation flows and applies returned selections", async () => {
    const { onGetCreateParameter } = renderAddEndpoint();

    await waitFor(() => expect(mockReqGetStorage).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Add Credentials" }));
    expect(
      await screen.findByRole("dialog", { name: "Add Credential" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "save credential" }));

    await waitFor(() => {
      expect(mockReqGetImageAuths).toHaveBeenCalledWith({});
      expect(onGetCreateParameter).toHaveBeenLastCalledWith(
        expect.objectContaining({ imageCredential: "auth-new" }),
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Create Network Volume" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "save network volume" }),
    );

    await waitFor(() => {
      expect(mockReqGetStorage).toHaveBeenCalledTimes(2);
      expect(onGetCreateParameter).toHaveBeenLastCalledWith(
        expect.objectContaining({
          clusterIDs: ["cluster-b"],
          networkStorageId: "storage-new",
        }),
      );
    });
  });

  it("redirects unauthenticated users when protected creation actions are selected", async () => {
    mockUserState = {};
    renderAddEndpoint();

    await waitFor(() => expect(mockReqGetStorage).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Add Credentials" }));

    expect(mockMessageError).toHaveBeenCalledWith("Please log in first");
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "logout",
      type: "user/setUserState",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining(
        "/en/user/login?redirect=/gpus-console/serverless-deploy",
      ),
    );
    expect(
      screen.getByRole("dialog", { name: "Add Credential" }),
    ).toBeInTheDocument();
  });

  it("uses edit-mode endpoint values without create-only CUDA and disk validation", async () => {
    const endpoint = {
      appName: "existing-app",
      clusterIDs: ["cluster-b"],
      envs: [],
      healthCheckPath: "/health",
      httpPort: 9000,
      idleTimeout: 60,
      imageAddr: "registry.example.com/existing:latest",
      imageCredential: "auth-a",
      maxConcurrency: 2,
      maxReqCount: 5,
      maxWorker: 4,
      minWorker: 1,
      name: "existing-endpoint",
      networkStorageId: "",
      networkStorageMountPath: "/network",
      requestTimeout: 120,
      scalePolicy: "concurrency",
      startCmd: "python app.py",
      type: "async",
    };
    const { onGetCreateParameter, ref } = renderAddEndpoint({
      endpoint,
      mode: "Edit",
    });

    await waitFor(() => {
      expect(onGetCreateParameter).toHaveBeenLastCalledWith(endpoint);
    });
    expect(check(ref)).toBe("");
    expect(
      screen.queryByText("CUDA Version is required"),
    ).not.toBeInTheDocument();
  });
});
