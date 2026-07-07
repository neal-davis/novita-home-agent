import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/models-console/llm-dedicated-endpoints/page";
import { getLLMDedicatedEndpointList } from "@/api/dedicated-endpoint";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = "/models-console/llm-dedicated-endpoints";
let mockParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockParams.get(key),
    toString: () => mockParams.toString(),
  }),
}));

jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedEndpointList: jest.fn(),
}));

jest.mock("@/app/components/Permission/PermissionWrapper", () => ({
  __esModule: true,
  default: ({ children, action, resource, resourceGroup }: any) => (
    <section
      data-action={action}
      data-resource={resource}
      data-resource-group={resourceGroup}
    >
      {children}
    </section>
  ),
}));

jest.mock("@/constants/constants", () => ({
  PERMISSION: {
    ACTION: { read: "read" },
    RESOURCE: { llm_dedicated_endpoints: "llm_dedicated_endpoints" },
    RESOURCE_GROUP: { model_api: "model_api" },
  },
}));

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList",
  () => ({
    __esModule: true,
    default: ({
      dedicatedEndpointList,
      filterEndpointName,
      filterStatus,
      goToCreateEndpoint,
      goToDetail,
      loading,
      onEndpointNameChange,
      onStatusChange,
      refreshList,
      totalCount,
    }: any) => (
      <div>
        <h1>endpoint list</h1>
        <span>loading {String(loading)}</span>
        <span>total {totalCount}</span>
        <span>status {filterStatus}</span>
        <span>query {filterEndpointName || "empty"}</span>
        {dedicatedEndpointList.map((endpoint: any) => (
          <div key={endpoint.id}>{endpoint.name}</div>
        ))}
        <button onClick={goToCreateEndpoint} type="button">
          create endpoint
        </button>
        <button onClick={() => onStatusChange("running")} type="button">
          status running
        </button>
        <button onClick={() => onEndpointNameChange("llama")} type="button">
          search llama
        </button>
        <button
          onClick={() =>
            goToDetail(
              {
                baseModel: { modelAlias: "Llama 3", modelId: "llama-3" },
                id: "endpoint-1",
                name: "endpoint one",
                resources: { gpu: "l40s" },
              },
              "metrics",
            )
          }
          type="button"
        >
          open detail
        </button>
        <button onClick={refreshList} type="button">
          refresh list
        </button>
      </div>
    ),
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint",
  () => ({
    __esModule: true,
    default: ({ goToDetail, goToListPage, initialModelId }: any) => (
      <div>
        <h1>create endpoint</h1>
        <span>initial {initialModelId || "none"}</span>
        <button onClick={goToListPage} type="button">
          back to list
        </button>
        <button
          onClick={() =>
            goToDetail({
              baseModel: { modelId: "mixtral" },
              id: "endpoint-created",
              name: "created endpoint",
            })
          }
          type="button"
        >
          created detail
        </button>
      </div>
    ),
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointDetail",
  () => ({
    __esModule: true,
    default: ({
      endpointData,
      goToListPage,
      initialTab,
      syncEndpointData,
    }: any) => (
      <div>
        <h1>endpoint detail</h1>
        <span data-testid="detail-name">detail {endpointData.name}</span>
        <span>tab {initialTab}</span>
        <button onClick={syncEndpointData} type="button">
          sync endpoint
        </button>
        <button onClick={goToListPage} type="button">
          detail back
        </button>
      </div>
    ),
  }),
);

const mockGetEndpointList = getLLMDedicatedEndpointList as jest.Mock;

const endpointOne = {
  baseModel: {
    modelAlias: "Llama 3",
    modelId: "llama-3",
  },
  id: "endpoint-1",
  name: "endpoint one",
  resources: { gpuName: "L40S" },
};

const endpointTwo = {
  baseModel: {
    modelAlias: "Mistral",
    modelId: "mixtral",
  },
  id: "endpoint-2",
  name: "other endpoint",
  resources: { gpuName: "A100" },
};

function setRoute(query = "") {
  mockParams = new URLSearchParams(query);
}

describe("LLM dedicated endpoints page", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockGetEndpointList.mockReset();
    mockPathname = "/models-console/llm-dedicated-endpoints";
    setRoute();
    sessionStorage.clear();
    document.body.innerHTML =
      '<main class="ConsoleHeaderWrapper_main__test"></main>';
    mockGetEndpointList.mockResolvedValue({
      endpoints: [endpointOne, endpointTwo],
    });
  });
  it("loads the list from URL filters, caches initial results, and updates list query params", async () => {
    setRoute("status=running&endpointName=llama");

    render(<Page />);

    expect(await screen.findByText("endpoint list")).toBeInTheDocument();
    expect(mockGetEndpointList).toHaveBeenCalledWith({
      filter: {
        endpointName: "llama",
        status: "running",
      },
      pageNum: 1,
      pageSize: 1000,
      sortKey: "newest",
    });
    expect(await screen.findByText("endpoint one")).toBeInTheDocument();
    expect(screen.queryByText("other endpoint")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "status running" }));
    expect(mockReplace).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints?status=running&endpointName=llama",
    );

    fireEvent.click(screen.getByText("search llama"));
    expect(mockReplace).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints?status=running&endpointName=llama",
    );

    fireEvent.click(screen.getByText("create endpoint"));
    expect(mockPush).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints?page=create",
    );
  });

  it("uses a fresh cache for initial list rendering and refreshes silently", async () => {
    sessionStorage.setItem(
      "llm-dedicated-endpoints-cache",
      JSON.stringify({
        endpoints: [endpointOne],
        timestamp: Date.now(),
      }),
    );
    mockGetEndpointList.mockResolvedValueOnce({
      endpoints: [endpointOne, endpointTwo],
    });

    render(<Page />);

    expect(await screen.findByText("loading false")).toBeInTheDocument();
    expect(await screen.findByText("other endpoint")).toBeInTheDocument();
    expect(
      JSON.parse(sessionStorage.getItem("llm-dedicated-endpoints-cache")!),
    ).toMatchObject({
      endpoints: [endpointOne, endpointTwo],
    });

    fireEvent.click(screen.getByText("refresh list"));
    expect(sessionStorage.getItem("llm-dedicated-endpoints-cache")).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints",
    );
    expect(mockGetEndpointList).toHaveBeenLastCalledWith({
      filter: {
        endpointName: "",
        status: "",
      },
      pageNum: 1,
      pageSize: 1000,
      sortKey: "newest",
    });
  });

  it("opens create mode from modelId and returns to a filtered list", async () => {
    setRoute("modelId=meta-llama");

    render(<Page />);

    expect(screen.getByText("create endpoint")).toBeInTheDocument();
    expect(screen.getByText("initial meta-llama")).toBeInTheDocument();

    fireEvent.click(screen.getByText("back to list"));

    expect(mockGetEndpointList).toHaveBeenCalledWith({
      filter: {
        endpointName: "",
        status: "",
      },
      pageNum: 1,
      pageSize: 1000,
      sortKey: "newest",
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints",
    );
  });

  it("fetches a detail endpoint, syncs it, and falls back to list when missing", async () => {
    setRoute("id=endpoint-1&tab=settings");
    let detailCalls = 0;
    mockGetEndpointList.mockImplementation(({ filter }) => {
      if (filter.id === "endpoint-1") {
        detailCalls += 1;
        return Promise.resolve({
          endpoints: [
            {
              ...endpointOne,
              name: detailCalls === 1 ? "endpoint fetched" : "endpoint synced",
            },
          ],
        });
      }
      if (filter.id === "missing") {
        return Promise.resolve({ endpoints: [] });
      }
      return Promise.resolve({ endpoints: [endpointOne, endpointTwo] });
    });

    const { rerender } = render(<Page />);

    expect(await screen.findByTestId("detail-name")).toHaveTextContent(
      /endpoint (fetched|synced)/,
    );
    expect(screen.getByText("tab settings")).toBeInTheDocument();
    expect(mockGetEndpointList).toHaveBeenCalledWith({
      filter: { id: "endpoint-1" },
      pageNum: 1,
      pageSize: 1,
      sortKey: "newest",
    });

    setRoute("id=missing");
    rerender(<Page />);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        "/models-console/llm-dedicated-endpoints",
      ),
    );
  });

  it("navigates to detail with a selected endpoint and clears cache when returning", async () => {
    render(<Page />);

    expect(await screen.findByText("endpoint one")).toBeInTheDocument();
    sessionStorage.setItem("llm-dedicated-endpoints-cache", "cached");

    fireEvent.click(screen.getByText("open detail"));
    expect(mockPush).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints?id=endpoint-1&tab=metrics",
    );
    expect(
      document.querySelector<HTMLElement>(
        '[class*="ConsoleHeaderWrapper_main"]',
      )?.scrollTop,
    ).toBe(0);

    setRoute("id=endpoint-1&tab=metrics");
    render(<Page />);

    expect(await screen.findByText("endpoint detail")).toBeInTheDocument();
    fireEvent.click(screen.getByText("detail back"));

    expect(sessionStorage.getItem("llm-dedicated-endpoints-cache")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints",
    );
  });
});
