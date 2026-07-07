import { render, screen, waitFor } from "@testing-library/react";
import Container from "@/app/gpus-console/instances/components/container";
import { reqGpuInstance } from "@/api/gpu-instance/instances";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqGpuInstance: jest.fn(),
}));
jest.mock("@/app/gpus-console/instances/components/section", () => ({
  __esModule: true,
  default: () => <div>instances section</div>,
}));
jest.mock("@/app/gpus-console/instances/components/defaultGuide", () => ({
  __esModule: true,
  default: () => <div>default guide</div>,
}));
jest.mock("@/components/ui/standard/empty-page-loading", () => ({
  __esModule: true,
  default: () => <div>loading page</div>,
}));

let storeState: any;
jest.mock("@/store", () => ({
  useAppSelector: (selector: any) => selector(storeState),
}));

const mockReq = reqGpuInstance as jest.Mock;

describe("instances Container", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
    localStorage.clear();
    storeState = { user: { uuid: "u-1" } };
  });
  afterEach(() => logSpy.mockRestore());

  it("renders the section when instances are returned", async () => {
    mockReq.mockResolvedValue({ instances: [{ id: "i-1" }] });
    render(<Container />);
    expect(await screen.findByText("instances section")).toBeInTheDocument();
  });

  it("renders the default guide when there are no instances", async () => {
    mockReq.mockResolvedValue({ instances: [] });
    render(<Container />);
    expect(await screen.findByText("default guide")).toBeInTheDocument();
  });

  it("stays on the loading screen without fetching for anonymous users", async () => {
    storeState = { user: { uuid: "" } };
    render(<Container />);
    expect(await screen.findByText("loading page")).toBeInTheDocument();
    expect(mockReq).not.toHaveBeenCalled();
  });
});
