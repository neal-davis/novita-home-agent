import { render, screen } from "@testing-library/react";
import HealthStatus from "@/app/models-console/llm-dedicated-endpoints/components/detail/HealthStatus";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

describe("HealthStatus", () => {
  it("renders Healthy for running", () => {
    render(<HealthStatus status={LLM_DE_STATUS.RUNNING} />);
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("All systems operational")).toBeInTheDocument();
  });

  it("renders Failed config", () => {
    render(<HealthStatus status={LLM_DE_STATUS.FAILED} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(
      screen.getByText("Deployment failed. Check logs or redeploy."),
    ).toBeInTheDocument();
  });

  it("renders Sleeping config", () => {
    render(<HealthStatus status={LLM_DE_STATUS.SLEEPING} />);
    expect(screen.getByText("Sleeping")).toBeInTheDocument();
  });

  it("falls back to Pending config for unknown status", () => {
    render(<HealthStatus status="bogus" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Waiting for resources...")).toBeInTheDocument();
  });

  it("uses phase-specific subtitle when deploying", () => {
    render(
      <HealthStatus
        status={LLM_DE_STATUS.DEPLOYING}
        phase="downloading_model"
      />,
    );
    expect(screen.getByText("Deploying")).toBeInTheDocument();
    expect(
      screen.getByText("Downloading model weights..."),
    ).toBeInTheDocument();
  });

  it("uses default subtitle for unknown deploying phase", () => {
    render(<HealthStatus status={LLM_DE_STATUS.DEPLOYING} phase="weird" />);
    expect(
      screen.getByText("Initial deployment in progress..."),
    ).toBeInTheDocument();
  });
});
