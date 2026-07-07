import { forwardRef, useImperativeHandle } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Section from "@/app/gpus-console/explore/components/section";
import { reqCreateGpuInstance } from "@/api/gpu-instance/explore";
import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import { reqBalanceTotal } from "@/api/gpu-instance/billing";
import { message } from "@/components/ui/standard/notify";
import { showPermissionMessage } from "@/lib/utils/permission";

let mockHasPermission = true;
let mockStepOnePayload: any;
let mockStepTwoPayload: any;
let mockStepThreePayload: any;
let mockMonthlySumFee = "12.34";

jest.mock("next/navigation", () => ({
  usePathname: () => "/gpus-console/explore",
  useRouter: jest.fn(),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqCreateGpuInstance: jest.fn(),
}));

jest.mock("@/api/gpu-instance/userInfo", () => ({
  reqUserInfo: jest.fn(),
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

const mockDispatch = jest.fn();
jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/store/slice/userSlice", () => ({
  setUserState: jest.fn((payload: string) => ({
    payload,
    type: "user/setUserState",
  })),
  UserState: { logout: "logout" },
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockHasPermission,
}));

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));

jest.mock("@/constants/urls", () => ({
  NOVITA_URL: { USER_LOGIN: "/user/login" },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      EXPLORE_DEPLOY_CONFIRM: "deploy-confirm",
      EXPLORE_NEXT: "deploy-next",
    },
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => <div title={title}>{children}</div>,
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, onCancel, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title || "modal"}>
        {children}
        <button type="button" onClick={onCancel}>
          close modal
        </button>
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/explore/components/customerInfo", () => ({
  __esModule: true,
  default: ({ finishForm }: any) => (
    <button type="button" onClick={finishForm}>
      finish customer info
    </button>
  ),
}));

jest.mock("@/app/gpus-console/explore/components/createComplish", () => ({
  __esModule: true,
  default: ({ finishForm }: any) => (
    <button type="button" onClick={finishForm}>
      created successfully
    </button>
  ),
}));

jest.mock("@/app/gpus-console/explore/components/confirmCreate", () => ({
  __esModule: true,
  default: ({ createInstanceInfo, finishForm, sumFee }: any) => (
    <div>
      <span>confirm monthly {sumFee}</span>
      <button
        type="button"
        onClick={() => finishForm(true, createInstanceInfo)}
      >
        confirm create
      </button>
      <button type="button" onClick={() => finishForm(false)}>
        cancel create
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/explore/components/stepOne", () => ({
  __esModule: true,
  default: ({ createInstanceInfoOut, emitDataFun }: any) => (
    <div>
      <span>step one {createInstanceInfoOut.billingMode}</span>
      <button type="button" onClick={() => emitDataFun(mockStepOnePayload)}>
        choose gpu
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/explore/components/stepTwo", () => ({
  __esModule: true,
  default: forwardRef(function MockStepTwo({ onLocalVolumeChange }: any, ref) {
    useImperativeHandle(ref, () => ({
      getCreateParameter: () => mockStepTwoPayload,
    }));
    return (
      <button type="button" onClick={() => onLocalVolumeChange(true)}>
        step two ready
      </button>
    );
  }),
}));

jest.mock("@/app/gpus-console/explore/components/stepThree", () => ({
  __esModule: true,
  default: forwardRef(function MockStepThree(_props: any, ref) {
    useImperativeHandle(ref, () => ({
      getCreateParameter: () => mockStepThreePayload,
      getMonthluSumFee: () => mockMonthlySumFee,
    }));
    return <div>step three ready</div>;
  }),
}));

jest.mock("@/lib/utils/utils", () => {
  const actual = jest.requireActual("@/lib/utils/utils");
  return {
    ...actual,
    getUserCollect: jest.fn(() => ({
      campaignName: "template-a",
      medium: "page",
      source: "templates",
    })),
  };
});

jest.mock("@/lib/utils/dockerAddress", () => ({
  isValidDockerImageAddress: jest.fn(() => ""),
}));

jest.mock("@/lib/utils/dealError", () => ({
  dealErrorByObj: jest.fn(() => "GPU limit reached"),
}));

const mockRouter = { push: jest.fn() };
const mockReqCreateGpuInstance = reqCreateGpuInstance as jest.Mock;
const mockReqUserInfo = reqUserInfo as jest.Mock;
const mockReqBalanceTotal = reqBalanceTotal as jest.Mock;
const mockMessageError = message.error as jest.Mock;
const mockMessageSuccess = message.success as jest.Mock;
const mockShowPermissionMessage = showPermissionMessage as jest.Mock;
const mockCookiesGet = Cookies.get as jest.Mock;

function product(overrides: Record<string, unknown> = {}) {
  return {
    cpuNum: 8,
    freeLocalStorage: 40,
    freeRootFS: 20,
    freeStorage: 0,
    maxLocalStorage: 100,
    maxRootFS: 100,
    memory: 32,
    minLocalStorage: 10,
    minRootFS: 10,
    nodeID: "node-a",
    productName: "RTX 4090",
    usableNode: true,
    ...overrides,
  };
}

function baseStepOne(overrides: Record<string, unknown> = {}) {
  return {
    billingMode: "onDemand",
    billingMethods: ["onDemand"],
    clusterId: "cluster-a",
    cudaVersion: "12.4",
    currProduct: product(),
    envs: [],
    filterRootFSSize: 24,
    gpuNum: 1,
    imageID: "template-a",
    imageObj: {
      envs: [{ key: "MODEL", value: "sdxl" }],
      image: "registry.example.com/ns/image:tag",
      imageAuth: "auth-a",
      name: "Template A",
      ports: [
        { ports: ["7860"], type: "http" },
        { ports: ["22"], type: "tcp" },
      ],
      rootfsSize: 24,
      startCommand: "python app.py",
      tools: [{ port: 7860, type: "http" }],
      volumes: [{ mountPath: "/workspace", size: 20, type: "local" }],
    },
    productId: "gpu-product",
    storageId: "storage-a",
    storageName: "Network Storage",
    templateId: "template-a",
    ...overrides,
  };
}

function baseStepTwo(overrides: Record<string, unknown> = {}) {
  return {
    command: "python app.py",
    currProduct: product(),
    entrypoint: "bash",
    envs: [{ key: "MODEL", value: "sdxl" }],
    httpPorts: "7860",
    imageAuth: "auth-a",
    imageObj: { imageAuth: "auth-a", name: "Template A", tools: [] },
    imageUrl: "registry.example.com/ns/image:tag",
    mountLocal: true,
    rootfsSize: 24,
    tcpPorts: "22",
    tools: [],
    volumeMounts: [
      { mountPath: "/workspace", size: 20, type: "local" },
      { id: "storage-a", mountPath: "/network", size: 0, type: "network" },
    ],
    ...overrides,
  };
}

function baseStepThree(overrides: Record<string, unknown> = {}) {
  return {
    ...baseStepOne(),
    ...baseStepTwo(),
    autoRenew: true,
    autoRenewMonth: "2",
    billingMode: "monthly",
    month: 3,
    ...overrides,
  };
}

function renderSection() {
  return render(<Section />);
}

describe("GPU explore section", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, "", "/gpus-console/explore?sharer=user-a");
    localStorage.clear();
    mockHasPermission = true;
    mockStepOnePayload = baseStepOne();
    mockStepTwoPayload = baseStepTwo();
    mockStepThreePayload = baseStepThree();
    mockMonthlySumFee = "12.34";
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockReqUserInfo.mockResolvedValue({
      completeInfoTmpTmp: true,
      uuid: "user-a",
    });
    mockReqBalanceTotal.mockResolvedValue({
      credit: "10",
      totalBalance: "10",
      userBalance: "0",
      voucherBalance: "0",
    });
    mockReqCreateGpuInstance.mockResolvedValue({ id: "instance-a" });
  });

  it("normalizes selected GPU data, confirms monthly billing, and creates an instance", async () => {
    renderSection();

    await waitFor(() => expect(mockReqUserInfo).toHaveBeenCalledWith({}));
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));

    expect(await screen.findByText("step two ready")).toBeInTheDocument();
    expect(screen.getByText("step three ready")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deploy" }));

    expect(
      await screen.findByText("confirm monthly 12.34"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "confirm create" }));

    await waitFor(() => {
      expect(mockReqCreateGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          autoRenew: true,
          autoRenewMonth: 2,
          billingMethod: "monthly",
          billingMode: "monthly",
          imageAuth: undefined,
          imageAuthId: "auth-a",
          month: 3,
          name: "Template A",
          nodeId: "node-a",
          referrer: "http://localhost/templates/template-a",
          sharer: "user-a",
          volumeMounts: expect.arrayContaining([
            expect.objectContaining({ mountPath: "/workspace", type: "local" }),
            expect.objectContaining({ id: "storage-a", type: "network" }),
          ]),
        }),
      );
      expect(mockMessageSuccess).toHaveBeenCalledWith("success");
      expect(localStorage.getItem("templateId")).toBe("template-a");
    });

    expect(
      await screen.findByRole("button", { name: "created successfully" }),
    ).toBeInTheDocument();
  });

  it("redirects anonymous users to login and records logout state", async () => {
    mockReqUserInfo.mockResolvedValue({});
    mockCookiesGet.mockReturnValue(undefined);

    renderSection();

    await waitFor(() => expect(mockReqUserInfo).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));

    expect(mockMessageError).toHaveBeenCalledWith("Please log in first");
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "logout",
      type: "user/setUserState",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining("/en/user/login?redirect=/gpus-console/explore"),
    );
    expect(mockReqCreateGpuInstance).not.toHaveBeenCalled();
  });

  it("blocks creation when permission or balance checks fail", async () => {
    mockHasPermission = false;
    const { unmount } = renderSection();

    await waitFor(() => expect(mockReqUserInfo).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));

    expect(mockShowPermissionMessage).toHaveBeenCalled();
    expect(mockReqCreateGpuInstance).not.toHaveBeenCalled();

    unmount();
    jest.clearAllMocks();
    mockHasPermission = true;
    mockReqUserInfo.mockResolvedValue({
      completeInfoTmpTmp: true,
      uuid: "user-a",
    });
    mockReqBalanceTotal.mockResolvedValue({
      credit: "0",
      totalBalance: "0",
      userBalance: "0",
      voucherBalance: "0",
    });

    renderSection();
    await waitFor(() => expect(mockReqBalanceTotal).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));

    expect(mockMessageError).toHaveBeenCalledWith("Balance is not enough.");
    expect(mockReqCreateGpuInstance).not.toHaveBeenCalled();
  });

  it("validates step selections before showing the deploy controls", async () => {
    renderSection();

    await waitFor(() => expect(mockReqUserInfo).toHaveBeenCalled());

    mockStepOnePayload = baseStepOne({ imageID: "" });
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));
    expect(mockMessageError).toHaveBeenCalledWith(
      "A template must be selected or created first",
    );

    mockStepOnePayload = baseStepOne({ productId: "" });
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));
    expect(mockMessageError).toHaveBeenCalledWith("Please choose a product");

    mockStepOnePayload = baseStepOne({
      currProduct: product({ usableNode: false }),
    });
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));
    expect(mockMessageError).toHaveBeenCalledWith("GPU stock is insufficient");

    mockStepOnePayload = baseStepOne({ filterRootFSSize: 1 });
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));
    expect(mockMessageError).toHaveBeenCalledWith(
      "Container disk must be at least 10GB",
    );
    expect(mockReqCreateGpuInstance).not.toHaveBeenCalled();
  });

  it("surfaces step two validation failures before creating", async () => {
    renderSection();

    await waitFor(() => expect(mockReqUserInfo).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));
    expect(await screen.findByText("step two ready")).toBeInTheDocument();

    mockStepThreePayload = baseStepThree({ billingMode: "onDemand" });
    mockStepTwoPayload = baseStepTwo({ imageUrl: " " });

    fireEvent.click(screen.getByRole("button", { name: "Deploy" }));

    expect(mockMessageError).toHaveBeenCalledWith("Please enter valid image");
    expect(mockReqCreateGpuInstance).not.toHaveBeenCalled();
  });

  it("maps create failures to user-facing messages", async () => {
    mockReqCreateGpuInstance.mockRejectedValueOnce({
      reason: "INSUFFICIENT_RESOURCE",
    });
    mockStepThreePayload = baseStepThree({ billingMode: "spot" });

    renderSection();

    await waitFor(() => expect(mockReqUserInfo).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "choose gpu" }));
    fireEvent.click(await screen.findByRole("button", { name: "Deploy" }));

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith(
        "No available Spot instances in this region. Try On-Demand instead.",
      );
    });
  });

  it("shows and closes the customer info modal after login completion is required", async () => {
    localStorage.setItem("fromLogin", "1");
    mockReqUserInfo.mockResolvedValue({
      completeInfoTmpTmp: false,
      uuid: "user-a",
    });

    renderSection();

    expect(
      await screen.findByRole("button", { name: "finish customer info" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "finish customer info" }),
    );

    expect(localStorage.getItem("fromLogin")).toBe("2");
    expect(
      screen.queryByRole("button", { name: "finish customer info" }),
    ).not.toBeInTheDocument();
  });
});
