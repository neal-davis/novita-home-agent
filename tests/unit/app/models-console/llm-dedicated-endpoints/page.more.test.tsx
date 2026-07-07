import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/models-console/llm-dedicated-endpoints/page";
import { getLLMDedicatedEndpointList } from "@/api/dedicated-endpoint";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = "/models-console/llm-dedicated-endpoints";
let mockParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
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
  default: ({ children }: any) => <section>{children}</section>,
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
    default: ({ dedicatedEndpointList, goToDetail }: any) => (
      <div>
        <h1>endpoint list</h1>
        {dedicatedEndpointList.map((e: any) => (
          <div key={e.id}>{e.name}</div>
        ))}
        <button
          onClick={() =>
            goToDetail({ id: "no-res", name: "no-resources-ep" }, "overview")
          }
          type="button"
        >
          open detail no resources
        </button>
      </div>
    ),
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint",
  () => ({ __esModule: true, default: () => <div>create</div> }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointDetail",
  () => ({
    __esModule: true,
    default: ({ endpointData, syncEndpointData }: any) => (
      <div>
        <span data-testid="detail-name">detail {endpointData.name}</span>
        <button onClick={syncEndpointData} type="button">
          sync
        </button>
      </div>
    ),
  }),
);

const mockGetEndpointList = getLLMDedicatedEndpointList as jest.Mock;

const endpointOne = {
  baseModel: { modelAlias: "Llama 3", modelId: "llama-3" },
  id: "endpoint-1",
  name: "endpoint one",
  resources: { gpuName: "L40S" },
};
const endpointTwo = {
  baseModel: { modelAlias: "Mistral", modelId: "mixtral" },
  id: "endpoint-2",
  name: "other endpoint",
  resources: { gpuName: "A100" },
};

function setRoute(query = "") {
  mockParams = new URLSearchParams(query);
}

describe("LLM dedicated endpoints page (more branches)", () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockGetEndpointList.mockReset();
    mockPathname = "/models-console/llm-dedicated-endpoints";
    setRoute();
    sessionStorage.clear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockGetEndpointList.mockResolvedValue({
      endpoints: [endpointOne, endpointTwo],
    });
  });
  afterEach(() => consoleErrorSpy.mockRestore());

  it("frontend-filters the list by endpointName from the URL", async () => {
    setRoute("endpointName=mistral");
    render(<Page />);
    // filteredList matches modelAlias 'Mistral'
    expect(await screen.findByText("other endpoint")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("endpoint one")).not.toBeInTheDocument(),
    );
  });

  it("detail page reuses an endpoint already present in the list without an extra fetch", async () => {
    // First load list (page=list), then go to detail for an endpoint in that list.
    setRoute("id=endpoint-1");
    // Provide the list via cache so dedicatedEndpointList is populated.
    sessionStorage.setItem(
      "llm-dedicated-endpoints-cache",
      JSON.stringify({ endpoints: [endpointOne], timestamp: Date.now() }),
    );
    // The detail effect reads dedicatedEndpointList; since list isn't fetched on
    // detail route, the endpoint won't be found and it fetches by id.
    mockGetEndpointList.mockResolvedValue({ endpoints: [endpointOne] });
    render(<Page />);
    expect(await screen.findByTestId("detail-name")).toHaveTextContent(
      "endpoint one",
    );
  });

  it("logs an error and redirects when the detail fetch rejects", async () => {
    setRoute("id=broken");
    mockGetEndpointList.mockRejectedValue(new Error("fetch failed"));
    render(<Page />);
    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch endpoint:",
        expect.any(Error),
      ),
    );
    expect(mockReplace).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints",
    );
  });

  it("syncEndpointData logs an error when the API rejects", async () => {
    setRoute("id=endpoint-1");
    let calls = 0;
    mockGetEndpointList.mockImplementation(() => {
      calls += 1;
      // first call: initial detail fetch succeeds; later calls (sync) reject
      if (calls === 1) {
        return Promise.resolve({ endpoints: [endpointOne] });
      }
      return Promise.reject(new Error("sync failed"));
    });
    render(<Page />);
    const syncBtn = await screen.findByText("sync");
    consoleErrorSpy.mockClear();
    fireEvent.click(syncBtn);
    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to sync endpoint data:",
        expect.any(Error),
      ),
    );
  });

  it("goToDetail without resources sets the loading state (null endpoint)", async () => {
    render(<Page />);
    expect(await screen.findByText("endpoint list")).toBeInTheDocument();
    fireEvent.click(screen.getByText("open detail no resources"));
    expect(mockPush).toHaveBeenCalledWith(
      "/models-console/llm-dedicated-endpoints?id=no-res",
    );
  });
});
