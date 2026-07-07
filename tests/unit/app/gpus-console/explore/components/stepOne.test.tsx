import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import StepOne from "@/app/gpus-console/explore/components/stepOne";
import {
  reqGetMarketNode,
  reqMarketProducts,
  reqMarketQueryOptions,
  reqUploadUserRequestProduct,
} from "@/api/gpu-instance/explore";
import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import {
  reqGetOfficialTemplates,
  reqGetTemplates,
} from "@/api/gpu-instance/templates";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import { message } from "@/components/ui/standard/notify";

const mockDispatch = jest.fn();
const mockPush = jest.fn();
const mockUseAppSelector = jest.fn();
const mockCookieGet = jest.fn();
const mockUsePermission = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/gpus-console/explore",
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (path: string) => path,
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: any) => unknown) =>
    mockUseAppSelector(selector),
}));

jest.mock("@/store/slice/userSlice", () => ({
  setUserState: jest.fn((state) => ({
    payload: state,
    type: "user/setUserState",
  })),
  UserState: { logout: "logout" },
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockUsePermission(),
}));

jest.mock("js-cookie", () => ({
  get: (key: string) => mockCookieGet(key),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetMarketNode: jest.fn(),
  reqMarketProducts: jest.fn(),
  reqMarketQueryOptions: jest.fn(),
  reqUploadUserRequestProduct: jest.fn(),
}));

jest.mock("@/api/gpu-instance/userInfo", () => ({
  reqUserInfo: jest.fn(),
}));

jest.mock("@/api/gpu-instance/templates", () => ({
  reqAddTemplate: jest.fn(),
  reqGetOfficialTemplates: jest.fn(),
  reqGetTemplates: jest.fn(),
}));

jest.mock("@/api/gpu-instance/storage", () => ({
  reqGetStorage: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock("@/config/campaign", () => ({
  __esModule: true,
  default: jest.fn(() => ({ enabled: false })),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <button type="button" onClick={() => onCheckedChange?.(!checked)}>
      secure-cloud-{checked ? "on" : "off"}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
  }) => (
    <div data-testid="select" data-value={value}>
      <button type="button" onClick={() => onValueChange?.("spot")}>
        choose-spot
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SelectValue: () => <span>select-value</span>,
}));

jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({
    getOptionLabel,
    getOptionValue,
    onValueChange,
    options,
    placeholder,
    value,
  }: {
    getOptionLabel: (item: any) => string;
    getOptionValue: (item: any) => string;
    onValueChange: (value: string) => void;
    options: any[];
    placeholder?: string;
    value?: string;
  }) => (
    <div data-testid={`select-filter-${placeholder}`} data-value={value}>
      {options.map((item) => {
        const label = getOptionLabel(item);
        const optionValue = getOptionValue(item);
        return (
          <button
            aria-label={`${placeholder}-${label}`}
            key={optionValue}
            type="button"
            onClick={() => onValueChange(optionValue)}
          >
            {label}
          </button>
        );
      })}
    </div>
  ),
}));

jest.mock("@/components/ui/standard/value-slider", () => ({
  ValueSlider: ({
    onAfterChange,
    onChange,
    value,
  }: {
    onAfterChange?: (value: number) => void;
    onChange?: (value: number) => void;
    value: number;
  }) => (
    <button
      data-value={value}
      type="button"
      onClick={() => {
        onChange?.(3);
        onAfterChange?.(3);
      }}
    >
      gpu-slider
    </button>
  ),
}));

jest.mock("@/app/gpus-console/explore/components/Input", () => ({
  Input: ({
    onChange,
    value,
  }: {
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    value?: string | number;
  }) => <input onChange={onChange} value={value ?? ""} />,
}));

jest.mock("@/app/gpus-console/explore/components/segmente", () => ({
  __esModule: true,
  default: ({
    onChange,
    options,
    value,
  }: {
    onChange?: (value: string) => void;
    options: string[];
    value?: string;
  }) => (
    <div data-testid="memory-segment" data-value={value}>
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange?.(option)}>
          {option}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/app/gpus-console/components/ContentSkeletonDeep", () => ({
  __esModule: true,
  default: () => <div>loading-products</div>,
}));

jest.mock("@/app/gpus-console/components/addTemplate", () => ({
  __esModule: true,
  default: () => <div>add-template-modal</div>,
}));

jest.mock("@/app/gpus-console/explore/components/changeNewTemplate", () => ({
  __esModule: true,
  default: ({ onConfirm }: { onConfirm: (template: any) => void }) => (
    <button
      type="button"
      onClick={() =>
        onConfirm({
          Id: "private-template",
          channel: "private",
          image: "registry.example.com/private:1",
        })
      }
    >
      confirm-private-template
    </button>
  ),
}));

jest.mock("@/app/gpus-console/explore/components/readMe", () => ({
  __esModule: true,
  default: ({ readMe }: { readMe: string }) => <div>{readMe}</div>,
}));

jest.mock("@/app/gpus-console/components/DataEmpty", () => ({
  __esModule: true,
  default: () => <div>No GPU products</div>,
}));

jest.mock("@/app/gpus-console/storage/components/addNetworkVolume", () => ({
  __esModule: true,
  default: () => <div>add-network-volume</div>,
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/app/components/buildMonth", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} />,
}));

jest.mock("@/lib/utils/utils", () => ({
  dealParamsText: jest.fn((template: string, params: Record<string, unknown>) =>
    Object.entries(params).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
  ),
  matchLogoForTemplate: jest.fn(() => "/template.svg"),
}));

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

const mockReqGetMarketNode = reqGetMarketNode as jest.Mock;
const mockReqMarketProducts = reqMarketProducts as jest.Mock;
const mockReqMarketQueryOptions = reqMarketQueryOptions as jest.Mock;
const mockReqUploadUserRequestProduct =
  reqUploadUserRequestProduct as jest.Mock;
const mockReqUserInfo = reqUserInfo as jest.Mock;
const mockReqGetOfficialTemplates = reqGetOfficialTemplates as jest.Mock;
const mockReqGetTemplates = reqGetTemplates as jest.Mock;
const mockReqGetStorage = reqGetStorage as jest.Mock;
const mockMessageError = message.error as jest.Mock;

function template(overrides: Record<string, unknown> = {}) {
  return {
    Id: "official-template",
    channel: "official",
    clusterIds: ["cluster-a"],
    image: "registry.example.com/official:1",
    minCudaVersion: "12.1",
    name: "Official GPU Template",
    ports: [],
    readme: "Template readme",
    recommendCards: [{ cardNum: 2, gpuSpecId: "L40S" }],
    rootfsSize: 80,
    volumes: [{ mountPath: "/data", size: 20, type: "local" }],
    ...overrides,
  };
}

function product(overrides: Record<string, unknown> = {}) {
  return {
    activityProduct: false,
    availableGpuNumber: 4,
    billingMethods: ["onDemand", "spot"],
    canBuy: true,
    cloudServiceType: "Center",
    cpuNum: 16,
    cudaVersion: "12.4",
    gpuMemory: 48,
    gpuNum: 1,
    gpuSpecId: "L40S",
    instancePrice: {
      dayPrice: 2400000,
      discount: 150000,
      monthPrice: 72000000,
      price: 200000,
      weekPrice: 16800000,
    },
    instanceSpotPrice: {
      discount: 90000,
      price: 120000,
    },
    inventoryState: "high",
    maxAvailableGpuNumber: 4,
    memory: 64,
    monthlyPrice: [{ month: 1, price: 100000000, pricePrecision: 10000 }],
    productId: "gpu-a",
    productName: "L40S",
    storagePrice: {
      dayPrice: 10000,
      discount: 8000,
      monthPrice: 300000,
      price: 10000,
      weekPrice: 70000,
    },
    usableNode: true,
    ...overrides,
  };
}

function renderStepOne(overrides: Record<string, unknown> = {}) {
  const emitDataFun = jest.fn();
  render(
    <StepOne
      createInstanceInfoOut={{
        clusterId: "",
        cudaVersion: "",
        initPg: 0,
        volumeMounts: [],
        ...overrides,
      }}
      emitDataFun={emitDataFun}
    />,
  );
  return { emitDataFun };
}

describe("StepOne", () => {
  let consoleLogSpy: jest.SpyInstance;
  let scrollIntoViewSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    scrollIntoViewSpy = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewSpy;
    mockCookieGet.mockReturnValue("token");
    mockUsePermission.mockReturnValue(true);
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ user: { email: "ada@example.com", uuid: "user-1" } }),
    );
    mockReqGetTemplates.mockResolvedValue({
      template: [
        template({
          Id: "private-template",
          channel: "private",
          image: "registry.example.com/private:1",
          name: "Private Template",
        }),
      ],
    });
    mockReqGetOfficialTemplates.mockResolvedValue({
      template: [template()],
    });
    mockReqUserInfo.mockResolvedValue({ uuid: "user-1" });
    mockReqGetStorage.mockResolvedValue({ data: [] });
    mockReqMarketQueryOptions.mockResolvedValue({
      clusters: [
        { id: "cluster-a", name: "Cluster A", supportNetStorage: true },
      ],
      cpuModels: ["8 vCPU", "16 vCPU"],
      cudaVersions: ["12.1", "12.4"],
      memoryModels: ["32 GB", "64 GB"],
    });
    mockReqMarketProducts.mockResolvedValue({
      products: [product()],
    });
    mockReqGetMarketNode.mockResolvedValue({
      product: product({ gpuNum: 2 }),
    });
    mockReqUploadUserRequestProduct.mockResolvedValue({});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("loads filters/templates/products and deploys a usable product with recommended GPU count", async () => {
    const { emitDataFun } = renderStepOne();

    await waitFor(() => {
      expect(mockReqMarketProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: "user-1",
          clusterId: "cluster-a",
          cudaVersion: "12.1",
          recommendCards: "L40S-1",
          rootFSSize: 80,
          localVolumeSize: 20,
        }),
        expect.any(AbortSignal),
      );
    });

    expect(
      await screen.findByText("Official GPU Template"),
    ).toBeInTheDocument();
    expect(screen.getByText("Featured GPUs")).toBeInTheDocument();
    expect(screen.getAllByText("L40S").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText("L40S"));

    await waitFor(() => {
      expect(mockReqGetMarketNode).toHaveBeenCalledWith(
        expect.objectContaining({
          gpuNum: 2,
          productId: "gpu-a",
          rootFSSize: 80,
          localVolumeSize: 20,
        }),
      );
    });
    await waitFor(() => {
      expect(emitDataFun).toHaveBeenCalledWith(
        expect.objectContaining({
          gpuNum: 2,
          imageID: "official-template",
          imageUrl: "registry.example.com/official:1",
          productId: "gpu-a",
          currProduct: expect.objectContaining({ productId: "gpu-a" }),
        }),
      );
    });
  });

  it("updates selected GPU count through the slider and emits the refreshed node", async () => {
    const { emitDataFun } = renderStepOne({
      currProduct: product(),
      GpuNumOptions: [1, 2, 3, 4],
      gpuNum: 2,
      imageID: "official-template",
      imageObj: template(),
      productId: "gpu-a",
    });

    await screen.findByRole("button", { name: "gpu-slider" });
    mockReqGetMarketNode.mockResolvedValueOnce({
      product: product({ productId: "gpu-a-3", productName: "L40S x3" }),
    });

    fireEvent.click(screen.getByRole("button", { name: "gpu-slider" }));

    await waitFor(() => {
      expect(mockReqGetMarketNode).toHaveBeenCalledWith(
        expect.objectContaining({
          gpuNum: 3,
          productId: "gpu-a",
        }),
        expect.any(AbortSignal),
      );
    });
    await waitFor(() => {
      expect(emitDataFun).toHaveBeenCalledWith(
        expect.objectContaining({
          gpuNum: 3,
          currProduct: expect.objectContaining({
            productId: "gpu-a-3",
            productName: "L40S x3",
          }),
        }),
      );
    });
  });

  it("requests unavailable GPUs once and remembers the request per user", async () => {
    mockReqMarketProducts.mockResolvedValue({
      products: [
        product({
          canBuy: true,
          inventoryState: "none",
          productId: "gpu-empty",
          productName: "A100",
          usableNode: false,
        }),
      ],
    });

    renderStepOne();

    fireEvent.click(await screen.findByText("A100"));

    await waitFor(() => {
      expect(mockReqUploadUserRequestProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          cardNum: 1,
          product: "A100",
          userId: "ada@example.com",
        }),
      );
    });
    expect(JSON.parse(localStorage.getItem("hasRequested") || "{}")).toEqual({
      A100_1: "user-1",
    });

    fireEvent.click(screen.getByText("A100"));

    await waitFor(() => {
      expect(mockReqUploadUserRequestProduct).toHaveBeenCalledTimes(1);
    });
  });

  it("shows the empty state when no returned product can be purchased", async () => {
    mockReqMarketProducts.mockResolvedValue({
      products: [product({ canBuy: false, productId: "hidden-gpu" })],
    });

    renderStepOne();

    expect(await screen.findByText("No GPU products")).toBeInTheDocument();
  });

  it("changes templates through the picker and reloads product filters from the new template", async () => {
    const { emitDataFun } = renderStepOne();

    expect(
      await screen.findByText("Official GPU Template"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Change Template" }));
    fireEvent.click(
      screen.getByRole("button", { name: "confirm-private-template" }),
    );

    await waitFor(() => {
      expect(emitDataFun).toHaveBeenCalledWith(
        expect.objectContaining({
          imageObj: expect.objectContaining({
            Id: "private-template",
            image: "registry.example.com/private:1",
          }),
          productId: null,
          currProduct: null,
          gpuNum: 1,
        }),
        false,
      );
    });
    expect(localStorage.getItem("templateId")).toBe("private-template");
    expect(mockReqMarketProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        clusterId: "cluster-a",
        rootFSSize: 80,
      }),
      expect.any(AbortSignal),
    );
  });

  it("selects an existing network volume and clears the selected product", async () => {
    mockReqGetStorage.mockResolvedValue({
      data: [
        {
          clusterId: "cluster-a",
          size: 200,
          storageId: "nas-1",
          storageName: "NAS One",
        },
      ],
    });

    const { emitDataFun } = renderStepOne();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Network Volume-NAS One",
      }),
    );

    await waitFor(() => {
      expect(emitDataFun).toHaveBeenCalledWith(
        expect.objectContaining({
          currProduct: null,
          gpuNum: 1,
          productId: null,
          storageId: "nas-1",
          storageName: "NAS One",
          volumeMounts: expect.arrayContaining([
            expect.objectContaining({
              id: "nas-1",
              mountPath: "/network",
              type: "network",
            }),
          ]),
        }),
        false,
      );
    });
    expect(mockReqMarketProducts).toHaveBeenCalledWith(
      expect.objectContaining({ clusterId: "cluster-a", storageId: "nas-1" }),
      expect.any(AbortSignal),
    );
  });

  it("redirects unauthenticated users when creating a template", async () => {
    mockCookieGet.mockReturnValue(undefined);
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ user: { email: "", uuid: "" } }),
    );

    renderStepOne();

    expect(
      await screen.findByText("Official GPU Template"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "+ Create Template" }));

    expect(mockMessageError).toHaveBeenCalledWith("Please log in first");
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "logout",
      type: "user/setUserState",
    });
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/user/login?redirect="),
    );
  });
});
