import { render, screen, waitFor } from "@testing-library/react";
import {
  ServerlessProvider,
  useServerlessContext,
} from "@/app/gpus-console/serverless/components/Context";
import {
  getEndpointSpecs,
  getCreateEndpointConstraints,
  getServerlessProductPrice,
} from "@/api/gpu-instance/serverless";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqBalanceTotal } from "@/api/gpu-instance/billing";
import { reqMarketQueryOptions } from "@/api/gpu-instance/explore";

jest.mock("@/api/gpu-instance/serverless", () => ({
  getEndpointSpecs: jest.fn(),
  getCreateEndpointConstraints: jest.fn(),
  getServerlessProductPrice: jest.fn(),
}));
jest.mock("@/api/gpu-instance/settings", () => ({
  reqGetImageAuths: jest.fn(),
}));
jest.mock("@/api/gpu-instance/billing", () => ({
  reqBalanceTotal: jest.fn(),
}));
jest.mock("@/api/gpu-instance/explore", () => ({
  reqMarketQueryOptions: jest.fn(),
}));

let permission = true;
jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => permission,
}));

let storeState: any;
jest.mock("@/store", () => ({
  useAppSelector: (selector: any) => selector(storeState),
}));

const mockSpecs = getEndpointSpecs as jest.Mock;
const mockConstraints = getCreateEndpointConstraints as jest.Mock;
const mockPrice = getServerlessProductPrice as jest.Mock;
const mockAuths = reqGetImageAuths as jest.Mock;
const mockBalance = reqBalanceTotal as jest.Mock;
const mockClusters = reqMarketQueryOptions as jest.Mock;

function Consumer() {
  const ctx = useServerlessContext();
  return (
    <div>
      <span>products:{ctx.products.length}</span>
      <span>price:{String(ctx.storagePrice)}</span>
      <span>loading:{String(ctx.productsLoading)}</span>
      <span>clusters:{ctx.clusterList.length}</span>
      <span>auths:{ctx.authList.length}</span>
      <span>arrears:{String(ctx.arrears)}</span>
    </div>
  );
}

describe("ServerlessProvider context", () => {
  let logSpy: jest.SpyInstance;
  let errSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    permission = true;
    storeState = {
      user: { mobilePhone: "123", uuid: "u-1", email: "e@x.com" },
    };
    logSpy = jest.spyOn(console, "log").mockImplementation();
    errSpy = jest.spyOn(console, "error").mockImplementation();
    mockSpecs.mockResolvedValue([{ id: "spec-1" }]);
    mockPrice.mockResolvedValue({ basePrice0: 30000, pricePrecision: 1 });
    mockConstraints.mockResolvedValue({ minWorkerNum: 2 });
    mockClusters.mockResolvedValue({ clusters: [{ id: "c1", name: "C1" }] });
    mockAuths.mockResolvedValue({ data: [{ id: "a1", name: "A1" }] });
    mockBalance.mockResolvedValue({
      credit: 0,
      userBalance: 0,
      voucherBalance: 0,
    });
  });
  afterEach(() => {
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it("throws when used outside of a provider", () => {
    const guard = jest.spyOn(console, "error").mockImplementation();
    expect(() => render(<Consumer />)).toThrow(
      "useServerlessContext must be used within a ServerlessProvider",
    );
    guard.mockRestore();
  });

  it("loads all data for a logged-in user with permission and detects arrears", async () => {
    render(
      <ServerlessProvider>
        <Consumer />
      </ServerlessProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("products:1")).toBeInTheDocument(),
    );
    expect(screen.getByText("clusters:1")).toBeInTheDocument();
    expect(screen.getByText("auths:1")).toBeInTheDocument();
    expect(screen.getByText("arrears:true")).toBeInTheDocument();
    expect(screen.getByText("loading:false")).toBeInTheDocument();
    expect(screen.getByText("price:3.000")).toBeInTheDocument();
  });

  it("skips auth fetching when the user lacks permission", async () => {
    permission = false;
    mockBalance.mockResolvedValue({
      credit: 100,
      userBalance: 0,
      voucherBalance: 0,
    });

    render(
      <ServerlessProvider>
        <Consumer />
      </ServerlessProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("products:1")).toBeInTheDocument(),
    );
    expect(mockAuths).not.toHaveBeenCalled();
    expect(screen.getByText("auths:0")).toBeInTheDocument();
    expect(screen.getByText("arrears:false")).toBeInTheDocument();
  });

  it("only fetches specs/price for an anonymous user", async () => {
    storeState = { user: { mobilePhone: "", uuid: "", email: "" } };

    render(
      <ServerlessProvider>
        <Consumer />
      </ServerlessProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("products:1")).toBeInTheDocument(),
    );
    expect(mockConstraints).not.toHaveBeenCalled();
    expect(mockClusters).not.toHaveBeenCalled();
    expect(screen.getByText("clusters:0")).toBeInTheDocument();
  });

  it("stops loading when fetching fails", async () => {
    mockSpecs.mockRejectedValue(new Error("boom"));

    render(
      <ServerlessProvider>
        <Consumer />
      </ServerlessProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("loading:false")).toBeInTheDocument(),
    );
    expect(screen.getByText("products:0")).toBeInTheDocument();
  });
});
