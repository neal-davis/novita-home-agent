import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import StepThree from "@/app/gpus-console/explore/components/stepThree";
import {
  reqGetProductMonthlyPricing,
  reqGetProductPricing,
} from "@/api/gpu-instance/explore";

jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetProductMonthlyPricing: jest.fn(),
  reqGetProductPricing: jest.fn(),
}));

jest.mock("@/lib/utils/money", () => ({
  dealMoney: jest.fn((value: number) => value),
}));

jest.mock("@/lib/utils/utils", () => ({
  dealParamsText: jest.fn((template: string, params: Record<string, unknown>) =>
    Object.entries(params).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
  ),
}));

jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: jest.fn((value: string) => value),
}));

jest.mock("@/config/campaign", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    enabled: false,
    gpuExploreDisplayName: "Campaign",
    gpuExploreOnDemandDesc: "Campaign on-demand description",
  })),
}));

jest.mock("@/app/components/buildMonth", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

jest.mock("@/app/gpus-console/instances/components/monthlyPrice", () => ({
  __esModule: true,
  default: () => <div>monthly-price-details</div>,
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-testid="radio-group">
      <button type="button" onClick={() => onValueChange?.("monthly")}>
        choose-monthly
      </button>
      <button type="button" onClick={() => onValueChange?.("spot")}>
        choose-spot
      </button>
      {children}
    </div>
  ),
  RadioGroupItem: ({ value }: { value: string }) => (
    <span data-testid={`radio-${value}`} />
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
      <button type="button" onClick={() => onValueChange?.("3")}>
        choose-3-months
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
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
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
      switch-{checked ? "on" : "off"}
    </button>
  ),
}));

const mockReqGetProductPricing = reqGetProductPricing as jest.Mock;
const mockReqGetProductMonthlyPricing =
  reqGetProductMonthlyPricing as jest.Mock;

describe("StepThree", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockReqGetProductPricing.mockResolvedValue({
      basePrice: 2.5,
      discountPrice: 1.75,
    });
    mockReqGetProductMonthlyPricing.mockResolvedValue({
      endTime: "1735689600",
      instanceAmount: "1234500",
      storageAmount: "67800",
      instanceMonthPrice: "1200000",
      instanceMonthPricePrecision: 10000,
      storagePrice: "67800",
      storagePricePricePrecision: 10000,
      gpuNum: 2,
      storageSize: 120,
      month: 1,
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  function createInstanceInfo(overrides: Record<string, unknown> = {}) {
    return {
      autoRenew: false,
      autoRenewMonth: "1",
      billingMode: "onDemand",
      cpuNum: 16,
      currProduct: {
        instanceSpotPrice: true,
        monthlyPrice: [
          { month: 1, price: 720000000, pricePrecision: 10000 },
          { month: 3, price: 1800000000, pricePrecision: 10000 },
        ],
        storagePrice: { discount: 25 },
      },
      freeStorage: 20,
      gpuNum: 2,
      imageUrl: "registry.example.com/novita/gpu:latest",
      memory: 64,
      month: 1,
      mountLocal: true,
      priceInfos: {
        instancePrice: { discount: 1.5, price: 2 },
        instanceSpotPrice: { discount: 0.75, price: 1.25 },
      },
      productId: "product-a",
      productName: "RTX 4090",
      rootfsSize: 80,
      volumeMounts: [{ type: "local", size: 40 }],
      ...overrides,
    };
  }

  it("requests current product pricing and renders the on-demand summary", async () => {
    render(
      <StepThree
        createInstanceInfoOut={{
          createInstanceInfo: createInstanceInfo(),
        }}
      />,
    );

    await waitFor(() => {
      expect(mockReqGetProductPricing).toHaveBeenCalledWith({
        productId: "product-a",
      });
    });
    expect(mockReqGetProductMonthlyPricing).toHaveBeenCalledWith({
      productId: "product-a",
      month: 1,
      gpuNum: 2,
      storageSize: 120,
    });

    expect(screen.getByText("Billing Method")).toBeInTheDocument();
    expect(screen.getByText("On-Demand")).toBeInTheDocument();
    expect(screen.getByText("2x RTX 4090 GPU Cost")).toBeInTheDocument();
    expect(screen.getByText("$3.50 /hr")).toBeInTheDocument();
    expect(screen.getByText("Total Disk: 120 GB")).toBeInTheDocument();
    expect(
      screen.getByText("registry.example.com/novita/gpu:latest"),
    ).toBeInTheDocument();
    const pricingSummary = screen
      .getByText("Pricing Summary")
      .closest("div")?.parentElement;
    expect(pricingSummary).toBeTruthy();
    expect(pricingSummary).toHaveTextContent("16 vCPU");
    expect(pricingSummary).toHaveTextContent("64");
    expect(pricingSummary).toHaveTextContent("GB");
    expect(pricingSummary).toHaveTextContent("RAM");
  });

  it("exposes launch parameters and monthly fee through the forwarded ref", async () => {
    const ref = createRef<{
      getCreateParameter: () => Record<string, unknown>;
      getMonthluSumFee: () => string;
    }>();
    const createInfo = createInstanceInfo({
      billingMode: "monthly",
      month: 3,
    });

    render(
      <StepThree
        ref={ref}
        createInstanceInfoOut={{
          createInstanceInfo: createInfo,
        }}
      />,
    );

    await waitFor(() => {
      expect(ref.current?.getMonthluSumFee()).toBe("130.230");
    });

    expect(ref.current?.getCreateParameter()).toMatchObject({
      billingMode: "monthly",
      month: 1,
      productId: "product-a",
    });
    expect(screen.getByText("Subscription /1 Month")).toBeInTheDocument();
    expect(screen.getByText("$123.45")).toBeInTheDocument();
  });
});
