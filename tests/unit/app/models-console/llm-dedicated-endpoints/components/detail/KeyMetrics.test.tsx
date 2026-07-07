import { render, screen, waitFor, act } from "@testing-library/react";
import KeyMetrics from "@/app/models-console/llm-dedicated-endpoints/components/detail/KeyMetrics";
import { getLLMDedicatedEndpointMetrics24h } from "@/api/dedicated-endpoint";
import { fireEvent } from "@testing-library/react";

jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedEndpointMetrics24h: jest.fn(),
}));

const mockGet = getLLMDedicatedEndpointMetrics24h as jest.Mock;

describe("KeyMetrics", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows placeholder dashes when not running", () => {
    render(<KeyMetrics status="sleeping" endpointId="ep1" />);
    expect(screen.getByText("TOTAL REQUESTS")).toBeInTheDocument();
    expect(screen.getAllByText("--").length).toBe(2);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("fetches and displays metrics when running", async () => {
    mockGet.mockResolvedValue({ totalRequests24h: 1234, avgTtft24h: 56.7 });
    render(<KeyMetrics status="running" endpointId="ep1" />);
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith(
        expect.objectContaining({ endpointId: "ep1" }),
      ),
    );
    await waitFor(() => expect(screen.getByText("1,234")).toBeInTheDocument());
    expect(screen.getByText("57")).toBeInTheDocument(); // rounded ttft
    expect(screen.getByText("ms")).toBeInTheDocument();
  });

  it("renders View all when running and onViewAll provided, and fires it", async () => {
    mockGet.mockResolvedValue({ totalRequests24h: 0, avgTtft24h: 0 });
    const onViewAll = jest.fn();
    render(
      <KeyMetrics status="running" endpointId="ep1" onViewAll={onViewAll} />,
    );
    const btn = await screen.findByRole("button", { name: "View all" });
    fireEvent.click(btn);
    expect(onViewAll).toHaveBeenCalled();
  });

  it("hides View all when not running", () => {
    render(
      <KeyMetrics status="failed" endpointId="ep1" onViewAll={jest.fn()} />,
    );
    expect(
      screen.queryByRole("button", { name: "View all" }),
    ).not.toBeInTheDocument();
  });

  it("handles fetch error by leaving placeholders", async () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation();
    mockGet.mockRejectedValue(
      Object.assign(new Error("fail"), { name: "Error" }),
    );
    render(<KeyMetrics status="running" endpointId="ep1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await waitFor(() => expect(screen.getAllByText("--").length).toBe(2));
    errSpy.mockRestore();
  });
});
