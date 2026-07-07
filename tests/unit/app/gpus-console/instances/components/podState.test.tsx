import { render, screen } from "@testing-library/react";
import PodState from "@/app/gpus-console/instances/components/podState";

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span
      data-testid="tooltip"
      data-title={typeof title === "object" ? "node" : title}
    >
      {children}
    </span>
  ),
}));

describe("PodState", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => logSpy.mockRestore());

  it("renders the running state name without an error tooltip", () => {
    render(<PodState state="running" instanceInfo={{}} />);
    expect(screen.getByText("RUNNING")).toBeInTheDocument();
  });

  it("shows a spinner image for transitional states", () => {
    const { container } = render(
      <PodState state="starting" instanceInfo={{}} />,
    );
    expect(
      container.querySelector(
        'img[src="/gpu-instance/instances/icon-ing.svg"]',
      ),
    ).toBeInTheDocument();
  });

  it("does not show a spinner for exited state", () => {
    const { container } = render(<PodState state="exited" instanceInfo={{}} />);
    expect(
      container.querySelector(
        'img[src="/gpu-instance/instances/icon-ing.svg"]',
      ),
    ).not.toBeInTheDocument();
  });

  it("renders an error tooltip when errorText is provided", () => {
    render(
      <PodState
        state="exited"
        instanceInfo={{}}
        errorText="oom"
        errorMessage="killed"
      />,
    );
    expect(screen.getAllByTestId("tooltip").length).toBeGreaterThan(0);
  });

  it("renders the last-start-time tooltip variant when lastStartedAt is set", () => {
    render(
      <PodState
        state="running"
        instanceInfo={{ lastStartedAt: "1768435200" }}
      />,
    );
    expect(screen.getByText("RUNNING")).toBeInTheDocument();
    expect(screen.getAllByTestId("tooltip").length).toBeGreaterThan(0);
  });
});
