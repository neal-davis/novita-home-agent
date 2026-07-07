import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import ServerlessDeploy from "@/app/gpus-console/serverless/components/Section";
import { getEndpointsWithTotal } from "@/api/gpu-instance/serverless";

jest.mock("@/api/gpu-instance/serverless", () => ({
  getEndpointsWithTotal: jest.fn(),
}));
jest.mock("@/app/gpus-console/serverless/components/Context", () => ({
  ServerlessProvider: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  SearchInput: ({ onSearch, placeholder }: any) => (
    <button type="button" onClick={() => onSearch("search-text")}>
      {placeholder}
    </button>
  ),
}));
jest.mock("@/app/gpus-console/serverless/components/item", () => ({
  __esModule: true,
  default: ({ endpoint }: any) => <div>endpoint {endpoint.id}</div>,
}));
jest.mock("@/components/ui/standard/pagination", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange(2)}>
      page 2
    </button>
  ),
}));
jest.mock("@/app/gpus-console/components/DataEmpty", () => ({
  __esModule: true,
  default: () => <div>No endpoints</div>,
}));
jest.mock("@/app/components/TeamMemberSelector", () => ({
  __esModule: true,
  default: ({ onSelect }: any) => (
    <button type="button" onClick={() => onSelect({ ids: ["m-1"] })}>
      choose member
    </button>
  ),
}));
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

let storeState: any;
jest.mock("@/store", () => ({
  useAppSelector: (selector: any) => selector(storeState),
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (url: string, locale: string) => `/${locale}${url}`,
}));

const mockEndpoints = getEndpointsWithTotal as jest.Mock;
const initData = [{ id: "ep-1" }];

describe("ServerlessDeploy section", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storeState = { user: { uuid: "u-1", currentTeam: { id: "t-1" } } };
    mockEndpoints.mockResolvedValue({
      endpoints: [{ id: "ep-2" }, { id: "ep-3" }],
      total: 30,
    });
  });

  it("renders the initial endpoints passed in", () => {
    render(<ServerlessDeploy initData={initData} />);
    expect(screen.getByText("endpoint ep-1")).toBeInTheDocument();
  });

  it("refreshes endpoints from the API on the refresh button", async () => {
    render(<ServerlessDeploy initData={initData} />);

    fireEvent.click(screen.getAllByRole("button")[2]);
    await waitFor(() => expect(mockEndpoints).toHaveBeenCalled());
    expect(await screen.findByText("endpoint ep-2")).toBeInTheDocument();
    expect(screen.getByText("endpoint ep-3")).toBeInTheDocument();
  });

  it("searches and resets to page one", async () => {
    render(<ServerlessDeploy initData={initData} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Instance Name/lD Filter/GPU Type",
      }),
    );
    await waitFor(() =>
      expect(mockEndpoints).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({ searchMsg: "search-text" }),
        }),
      ),
    );
  });

  it("filters by team member", async () => {
    render(<ServerlessDeploy initData={initData} />);

    fireEvent.click(screen.getByRole("button", { name: "choose member" }));
    await waitFor(() =>
      expect(mockEndpoints).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({ creators: "m-1" }),
        }),
      ),
    );
  });

  it("changes page through pagination when total exceeds page size", async () => {
    render(<ServerlessDeploy initData={initData} />);
    // trigger refresh to load total=30
    fireEvent.click(screen.getAllByRole("button")[2]);
    await screen.findByText("endpoint ep-2");

    fireEvent.click(await screen.findByRole("button", { name: "page 2" }));
    await waitFor(() =>
      expect(mockEndpoints).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({ pageNum: 2 }),
        }),
      ),
    );
  });

  it("clears endpoints when there is no logged-in user", async () => {
    storeState = { user: { uuid: "", currentTeam: null } };
    render(<ServerlessDeploy initData={initData} />);

    await waitFor(() =>
      expect(screen.getByText("No endpoints")).toBeInTheDocument(),
    );
  });
});
