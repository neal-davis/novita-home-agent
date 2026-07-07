import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import OnDemandModelList from "@/app/models-console/llm-dedicated-endpoints/components/OnDemandModelList";
import { getLLMOnDemandModels } from "@/api/model";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("@/api/model", () => ({
  getLLMOnDemandModels: jest.fn(),
}));

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/OnDemandModelCard",
  () => ({
    __esModule: true,
    default: ({
      modelName,
      onClick,
    }: {
      modelName: string;
      onClick: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        card:{modelName}
      </button>
    ),
  }),
);

const mockGet = getLLMOnDemandModels as jest.Mock;

describe("OnDemandModelList", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders skeletons before data loads", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<OnDemandModelList />);
    expect(screen.getByText("Explore On-Demand Models")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });

  it("renders model cards once loaded", async () => {
    mockGet.mockResolvedValue([
      { id: "meta/m1", displayName: "M1" },
      { id: "meta/m2", displayName: "M2" },
    ]);
    render(<OnDemandModelList />);
    await waitFor(() =>
      expect(screen.getByText("card:meta/m1")).toBeInTheDocument(),
    );
    expect(screen.getByText("card:meta/m2")).toBeInTheDocument();
  });

  it("clicking a card navigates to its detail path", async () => {
    mockGet.mockResolvedValue([{ id: "meta/m1", displayName: "M1" }]);
    render(<OnDemandModelList />);
    fireEvent.click(await screen.findByText("card:meta/m1"));
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining("/models-console/model-detail"),
    );
  });

  it("handles null response gracefully", async () => {
    mockGet.mockResolvedValue(null);
    render(<OnDemandModelList />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    // still shows skeleton placeholders since list empty
    expect(screen.getByText("Explore On-Demand Models")).toBeInTheDocument();
  });
});
