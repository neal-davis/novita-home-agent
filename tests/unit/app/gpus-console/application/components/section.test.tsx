import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import Section from "@/app/gpus-console/application/components/section";
import {
  reqGetApplicationDetail,
  reqGetApplicationTemplates,
} from "@/api/gpu-instance/application";
import {
  reqCreateGpuInstance,
  reqGetProductMonthlyPricing,
} from "@/api/gpu-instance/explore";
import { message } from "@/components/ui/standard/notify";

let mockSearchParams = new URLSearchParams();
let mockUserState: any = { uuid: "user-a" };

jest.mock("next/navigation", () => ({
  usePathname: () => "/gpus-console/application",
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

jest.mock("@/api/gpu-instance/application", () => ({
  reqGetApplicationDetail: jest.fn(),
  reqGetApplicationTemplates: jest.fn(),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqCreateGpuInstance: jest.fn(),
  reqGetProductMonthlyPricing: jest.fn(),
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
  NOVITA_URL: {
    GPU_CONSOLE_APPLICATION: "/gpus-console/application",
    GPU_CONSOLE_EXPLORE: "/gpus-console/explore",
    GPU_CONSOLE_SERVERLESS_DEPLOY: "/gpus-console/serverless-deploy",
    USER_LOGIN: "/user/login",
  },
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));

jest.mock("@/lib/utils/utils", () => ({
  matchLogoForTemplate: jest.fn(() => "/logo.svg"),
}));

jest.mock("@/lib/utils/dealError", () => ({
  dealErrorByObj: jest.fn(() => "GPU limit reached"),
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, placeholder, value }: any) => (
    <button type="button" onClick={() => onSearch("stable diffusion")}>
      {value || placeholder}
    </button>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ asChild, children, onClick, ...props }: any) =>
    asChild ? (
      <span onClick={onClick} {...props}>
        {children}
      </span>
    ) : (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
}));

jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange(2)}>
      next page
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => {
  const React = jest.requireActual("react");
  const SelectContext = React.createContext({
    onValueChange: (_value: any) => {},
  });
  return {
    Select: ({ children, disabled, onValueChange, value }: any) => (
      <SelectContext.Provider value={{ onValueChange }}>
        <div aria-disabled={disabled} data-value={value}>
          {children}
        </div>
      </SelectContext.Provider>
    ),
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => {
      const ctx = React.useContext(SelectContext);
      return (
        <button type="button" onClick={() => ctx.onValueChange?.(value)}>
          {children}
        </button>
      );
    },
    SelectTrigger: ({ children }: any) => <div role="button">{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  };
});

jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, onClick, onValueChange }: any) => (
    <div
      role="button"
      tabIndex={0}
      onClick={(event) => {
        onClick?.(event);
        const text = (event.currentTarget as HTMLElement).textContent || "";
        if (text.includes("Subscription")) onValueChange?.("monthly");
        if (text.includes("Spot")) onValueChange?.("spot");
        if (text.includes("On Demand")) onValueChange?.("onDemand");
      }}
    >
      {children}
    </div>
  ),
  RadioGroupItem: ({ children, value }: any) => (
    <span>{children || value}</span>
  ),
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <button type="button" onClick={() => onCheckedChange?.(!checked)}>
      auto renew {String(checked)}
    </button>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <span>{children}</span>,
  TooltipContent: ({ children }: any) => <span>{children}</span>,
  TooltipProvider: ({ children }: any) => <span>{children}</span>,
  TooltipTrigger: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => <div className={className}>skeleton</div>,
}));

jest.mock("@/app/gpus-console/application/components/templateDetail", () => ({
  __esModule: true,
  default: ({ deployApplication, templateId }: any) => (
    <div>
      <span>template detail {templateId}</span>
      <button
        type="button"
        onClick={() =>
          deployApplication({
            Id: "app-detail",
            enableApplicationInstance: true,
            image: "registry/detail:latest",
            name: "Detail App",
          })
        }
      >
        deploy detail app
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/application/components/banner", () => ({
  __esModule: true,
  default: ({ closeBanner }: any) => (
    <button type="button" onClick={closeBanner}>
      close banner
    </button>
  ),
}));

jest.mock("@/app/gpus-console/application/components/createComplish", () => ({
  __esModule: true,
  default: ({ finishForm }: any) => (
    <button type="button" onClick={finishForm}>
      application created
    </button>
  ),
}));

jest.mock("@/app/gpus-console/components/ContentSkeletonDeep", () => ({
  __esModule: true,
  default: () => <div>loading applications</div>,
}));

jest.mock("@/app/gpus-console/components/DataEmpty", () => ({
  __esModule: true,
  default: () => <div>No applications</div>,
}));

const mockRouter = { push: jest.fn() };
const mockReqGetApplicationTemplates = reqGetApplicationTemplates as jest.Mock;
const mockReqGetApplicationDetail = reqGetApplicationDetail as jest.Mock;
const mockReqCreateGpuInstance = reqCreateGpuInstance as jest.Mock;
const mockReqGetProductMonthlyPricing =
  reqGetProductMonthlyPricing as jest.Mock;
const mockMessageError = message.error as jest.Mock;
const mockMessageSuccess = message.success as jest.Mock;

const appA = {
  Id: "app-a",
  enableApplicationInstance: true,
  enableApplicationServerless: true,
  envs: [{ key: "MODEL", value: "sdxl" }],
  image: "registry/app-a:latest",
  instanceApplicationConfig: {
    recommendCards: [{ gpuName: "RTX 4090", gpuNum: 1 }],
  },
  minCudaVersion: "12.4",
  name: "Dream App",
  ports: [{ ports: ["7860"], type: "http" }],
  rootfsSize: 40,
  startCommand: "python app.py",
  tools: [{ name: "web", port: 7860 }],
  volumes: [{ size: 10, type: "local" }],
};

const appB = {
  ...appA,
  Id: "app-b",
  enableApplicationInstance: false,
  image: "registry/app-b:latest",
  name: "Video App",
};

const detail = {
  clusters: [
    { clusterId: "cluster-a", clusterName: "US East" },
    { clusterId: "cluster-b", clusterName: "US West" },
  ],
  product: {
    freeStorage: 20,
    gpuMemory: 24,
    instancePrice: { discount: "120000", price: "180000" },
    instanceSpotPrice: { discount: "60000", price: "120000" },
    monthlyPrice: [{ month: 1, price: "900000", pricePrecision: 100 }],
    productId: "gpu-product",
    storagePrice: { discount: "30" },
  },
  recommendCard: { gpuName: "RTX 4090", gpuNum: 1 },
};

function renderSection() {
  return render(<Section gpuBannerSlides={[{ image: "banner.jpg" } as any]} />);
}

describe("GPU application section", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    };
    window.scrollTo = jest.fn();
    mockSearchParams = new URLSearchParams();
    mockUserState = { uuid: "user-a" };
    (useSearchParams as jest.Mock).mockImplementation(() => mockSearchParams);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockReqGetApplicationTemplates.mockResolvedValue({
      templates: [appA, appB],
      total: 13,
    });
    mockReqGetApplicationDetail.mockResolvedValue(detail);
    mockReqCreateGpuInstance.mockResolvedValue({ id: "instance-a" });
    mockReqGetProductMonthlyPricing.mockResolvedValue({
      endTime: "1893456000",
      instanceAmount: "9",
      instanceMonthPrice: "9",
      instanceMonthPricePrecision: 1,
      month: 1,
      storageAmount: "1",
      storagePrice: "1",
      storagePricePricePrecision: 1,
    });
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  it("loads applications, filters, searches, paginates, switches template detail, and deploys on demand", async () => {
    renderSection();

    expect(await screen.findByText("Dream App")).toBeInTheDocument();
    expect(screen.getByText("Video App")).toBeInTheDocument();
    expect(mockReqGetApplicationTemplates).toHaveBeenCalledWith({
      pageNum: 1,
      pageSize: 12,
      searchMsg: "",
    });
    expect(mockReqGetApplicationDetail).toHaveBeenCalledWith(
      expect.objectContaining({
        configType: "instance",
        templateId: "app-a",
      }),
    );

    fireEvent.click(screen.getByText("Image"));
    await waitFor(() => {
      expect(mockReqGetApplicationTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ applicationType: "image", pageNum: 1 }),
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Search templates..." }),
    );
    await waitFor(() => {
      expect(mockReqGetApplicationTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ searchMsg: "stable diffusion" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "next page" }));
    await waitFor(() => {
      expect(mockReqGetApplicationTemplates).toHaveBeenCalledWith(
        expect.objectContaining({ pageNum: 2 }),
      );
    });

    fireEvent.click(screen.getByText("Video App"));
    await waitFor(() => {
      expect(mockReqGetApplicationDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          configType: "serverless",
          templateId: "app-b",
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "US West" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Deploy" }).at(-1)!);

    await waitFor(() => {
      expect(mockReqCreateGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          billingMode: "onDemand",
          clusterId: "cluster-b",
          command: "python app.py",
          cudaVersion: "12.4",
          gpuNum: 1,
          imageUrl: "registry/app-b:latest",
          name: "Video App",
          ports: [{ port: "7860", type: "http" }],
          productId: "gpu-product",
          rootfsSize: 40,
        }),
      );
      expect(mockMessageSuccess).toHaveBeenCalledWith("Deploy successfully");
    });

    expect(
      await screen.findByRole("button", { name: "application created" }),
    ).toBeInTheDocument();
  });

  it("supports monthly pricing and maps spot capacity errors", async () => {
    mockReqCreateGpuInstance.mockRejectedValueOnce({
      reason: "INSUFFICIENT_RESOURCE",
    });

    renderSection();

    expect(await screen.findByText("Dream App")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Subscription"));

    await waitFor(() => {
      expect(mockReqGetProductMonthlyPricing).toHaveBeenCalledWith(
        expect.objectContaining({ month: 1, productId: "gpu-product" }),
      );
    });

    fireEvent.click(screen.getByText("Spot"));
    fireEvent.click(screen.getAllByRole("button", { name: "Deploy" }).at(-1)!);

    await waitFor(() => {
      expect(mockReqCreateGpuInstance).toHaveBeenCalledWith(
        expect.objectContaining({ billingMode: "spot" }),
      );
      expect(mockMessageError).toHaveBeenCalledWith(
        "No available Spot instances in this region. Try On-Demand instead.",
      );
    });
  });

  it("redirects anonymous users instead of deploying", async () => {
    mockUserState = {};

    renderSection();

    expect(await screen.findByText("Dream App")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Deploy" }).at(-1)!);

    expect(mockMessageError).toHaveBeenCalledWith("Please login first");
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "logout",
      type: "user/setUserState",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining("/en/user/login?redirect="),
    );
    expect(mockReqCreateGpuInstance).not.toHaveBeenCalled();
  });

  it("shows empty state and detail-mode handoff", async () => {
    mockReqGetApplicationTemplates.mockResolvedValueOnce({
      templates: [],
      total: 0,
    });
    const { unmount } = renderSection();

    expect(await screen.findByText("No applications")).toBeInTheDocument();
    expect(mockReqGetApplicationDetail).not.toHaveBeenCalled();

    unmount();
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams("applicationId=app-detail");
    mockReqGetApplicationTemplates.mockResolvedValue({
      templates: [appA],
      total: 1,
    });
    mockReqGetApplicationDetail.mockResolvedValue(detail);
    renderSection();

    expect(
      await screen.findByText("template detail app-detail"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "deploy detail app" }));

    await waitFor(() => {
      expect(mockReqGetApplicationDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          configType: "instance",
          templateId: "app-detail",
        }),
      );
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/en/gpus-console/application",
      );
    });
  });

  it("hides the banner when dismissed and flips the serverless card", async () => {
    renderSection();

    expect(
      await screen.findByRole("button", { name: "close banner" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "close banner" }));
    expect(
      screen.queryByRole("button", { name: "close banner" }),
    ).not.toBeInTheDocument();

    const serverlessCard = screen.getByRole("button", { name: /Serverless/ });
    fireEvent.click(serverlessCard);
    expect(serverlessCard).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(serverlessCard, { key: "Enter" });
    expect(serverlessCard).toHaveAttribute("aria-pressed", "false");
  });
});
