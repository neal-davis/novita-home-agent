import { render, screen } from "@testing-library/react";
import Container from "@/app/gpus-console/serverless/components/container";
import { getEndpoints } from "@/api/gpu-instance/serverless";

jest.mock("@/api/gpu-instance/serverless", () => ({
  getEndpoints: jest.fn(),
}));
jest.mock("@/app/gpus-console/serverless/components/Section", () => ({
  __esModule: true,
  default: () => <div>serverless section</div>,
}));
jest.mock("@/app/gpus-console/serverless/components/defaultGuide", () => ({
  __esModule: true,
  default: () => <div>serverless guide</div>,
}));
jest.mock("@/components/ui/standard/empty-page-loading", () => ({
  __esModule: true,
  default: () => <div>loading page</div>,
}));

let storeState: any;
jest.mock("@/store", () => ({
  useAppSelector: (selector: any) => selector(storeState),
}));

const mockGet = getEndpoints as jest.Mock;

describe("serverless Container", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storeState = { user: { uuid: "u-1" } };
  });

  it("renders the section when endpoints exist", async () => {
    mockGet.mockResolvedValue([{ id: "ep-1" }]);
    render(<Container />);
    expect(await screen.findByText("serverless section")).toBeInTheDocument();
  });

  it("renders the default guide when there are no endpoints", async () => {
    mockGet.mockResolvedValue([]);
    render(<Container />);
    expect(await screen.findByText("serverless guide")).toBeInTheDocument();
  });

  it("stays loading and does not fetch for anonymous users", async () => {
    storeState = { user: { uuid: "" } };
    render(<Container />);
    expect(await screen.findByText("loading page")).toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
  });
});
