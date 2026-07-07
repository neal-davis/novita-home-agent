import { render, screen, waitFor } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import DetailContent from "@/app/pricing/components/DetailContent";
import { ModelType } from "@/types/models";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqHomeProductsStorage } from "@/api/gpu-instance/storage";
import { reqSandboxPrice, reqSandboxStoragePrice } from "@/api/sandbox";
import { fetchMultimodalConfigs } from "@/store/slice/multimodalSlice";

const mockDispatch = jest.fn();
const mockModelApiProps: any[] = [];
const mockGpuPriceProps: any[] = [];
const mockStorePriceProps: any[] = [];
const mockSandboxPriceProps: any[] = [];
const mockDynamicModelConfigs = [{ id: "dynamic-config" }];
const mockDynamicPriceMap = { "dynamic-config": { price: 1 } };

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: () => unknown) => selector(),
}));

jest.mock("@/store/slice/multimodalSlice", () => ({
  fetchMultimodalConfigs: jest.fn((refresh: boolean) => ({
    payload: refresh,
    type: "multimodal/fetch",
  })),
  selectMultimodalConfigs: jest.fn(() => mockDynamicModelConfigs),
  selectMultimodalPriceMap: jest.fn(() => mockDynamicPriceMap),
}));

jest.mock("@/hooks/useHeaderHeight", () => ({
  ORI_HEADER_HEIGHT: 64,
  useHeaderHeight: () => ({ noticeHeight: 8 }),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqMarketProducts: jest.fn(),
}));

jest.mock("@/api/gpu-instance/storage", () => ({
  reqHomeProductsStorage: jest.fn(),
}));

jest.mock("@/api/sandbox", () => ({
  reqSandboxPrice: jest.fn(),
  reqSandboxStoragePrice: jest.fn(),
}));

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <section data-testid={`tab-${value}`}>{children}</section>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <button data-value={value}>{children}</button>,
}));

jest.mock("@/app/pricing/components/ModelAPIPrice", () => ({
  __esModule: true,
  default: (props: any) => {
    mockModelApiProps.push(props);
    return <div data-testid="model-api-price">model-api-price</div>;
  },
}));

jest.mock("@/app/pricing/components/GpuPrice", () => ({
  __esModule: true,
  default: (props: any) => {
    mockGpuPriceProps.push(props);
    return <div data-testid="gpu-price">gpu-price</div>;
  },
}));

jest.mock("@/app/pricing/components/StorePrice", () => ({
  __esModule: true,
  default: (props: any) => {
    mockStorePriceProps.push(props);
    return <div data-testid="store-price">store-price</div>;
  },
}));

jest.mock("@/app/pricing/components/SandboxPrice", () => ({
  __esModule: true,
  default: (props: any) => {
    mockSandboxPriceProps.push(props);
    return <div data-testid="sandbox-price">sandbox-price</div>;
  },
}));

jest.mock("@/app/pricing/components/DePage", () => ({
  __esModule: true,
  default: ({ isConsole }: { isConsole?: boolean }) => (
    <div data-testid="de-page" data-console={String(Boolean(isConsole))} />
  ),
}));

describe("DetailContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModelApiProps.length = 0;
    mockGpuPriceProps.length = 0;
    mockStorePriceProps.length = 0;
    mockSandboxPriceProps.length = 0;

    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("gpu=1"),
    );
    (reqMarketProducts as jest.Mock).mockResolvedValue({
      products: [{ productId: "gpu-a", productName: "A100" }],
    });
    (reqHomeProductsStorage as jest.Mock).mockResolvedValue({
      localStoragePrice: 10000,
    });
    (reqSandboxPrice as jest.Mock).mockResolvedValue({
      discountPrice0: 100,
    });
    (reqSandboxStoragePrice as jest.Mock).mockResolvedValue({
      products: [{ productId: "sandbox-storage", discountPrice0: 0 }],
    });
  });

  it("filters models, dispatches dynamic pricing fetch and passes async price data to tab panes", async () => {
    render(
      <DetailContent
        isConsole
        initialFullLLMModels={
          [
            {
              features: ["serverless"],
              id: "free-chat",
              input_token_price_per_m: 0,
              output_token_price_per_m: 0,
              type: ModelType.Chat,
            },
            {
              features: "serverless",
              id: "partial-free-chat",
              input_token_price_per_m: 0,
              output_token_price_per_m: 1000,
              type: ModelType.Chat,
            },
            {
              features: ["dedicated"],
              id: "dedicated-chat",
              input_token_price_per_m: 1000,
              output_token_price_per_m: 1000,
              type: ModelType.Chat,
            },
            {
              features: ["serverless"],
              id: "embedding",
              type: ModelType.Embedding,
            },
          ] as any
        }
      />,
    );

    expect(screen.getByTestId("tabs")).toHaveAttribute("data-value", "gpu");
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: false,
      type: "multimodal/fetch",
    });
    expect(fetchMultimodalConfigs).toHaveBeenCalledWith(false);
    expect(reqMarketProducts).toHaveBeenCalledWith({
      cpuModel: 4,
      memoryModel: 8,
    });
    expect(reqSandboxStoragePrice).toHaveBeenCalledWith({
      businessType: "cloud_sandbox",
      productIds: ["sandbox-storage"],
    });

    expect(mockModelApiProps.at(-1)).toMatchObject({
      dynamicModelConfigs: mockDynamicModelConfigs,
      dynamicPriceMap: mockDynamicPriceMap,
      isConsole: true,
    });
    expect(
      mockModelApiProps.at(-1).llmList.map((model: any) => model.id),
    ).toEqual(["free-chat", "partial-free-chat"]);
    expect(
      mockModelApiProps.at(-1).embeddingList.map((model: any) => model.id),
    ).toEqual(["embedding"]);

    await waitFor(() => {
      expect(mockGpuPriceProps.at(-1)).toMatchObject({
        gpuPriceList: [{ productId: "gpu-a", productName: "A100" }],
        isConsole: true,
        loading: false,
      });
      expect(mockStorePriceProps.at(-1)).toMatchObject({
        isConsole: true,
        price: { localStoragePrice: 10000 },
      });
      expect(mockSandboxPriceProps.at(-1)).toMatchObject({
        isConsole: true,
        sandboxPriceInfo: { discountPrice0: 100 },
        sandboxStorageInfo: {
          discountPrice0: 0,
          productId: "sandbox-storage",
        },
      });
    });
  });
});
