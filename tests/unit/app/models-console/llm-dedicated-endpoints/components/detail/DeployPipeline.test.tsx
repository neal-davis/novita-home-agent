import { render, screen } from "@testing-library/react";
import DeployPipeline from "@/app/models-console/llm-dedicated-endpoints/components/detail/DeployPipeline";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

describe("DeployPipeline", () => {
  it("returns null for non-pipeline states like running", () => {
    const { container } = render(
      <DeployPipeline status={LLM_DE_STATUS.RUNNING} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all stages for deploying", () => {
    render(
      <DeployPipeline
        status={LLM_DE_STATUS.DEPLOYING}
        phase="downloading_model"
      />,
    );
    expect(screen.getByText("Deployment Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Resource Scheduling")).toBeInTheDocument();
    expect(screen.getByText("Model & Image Pull")).toBeInTheDocument();
    expect(screen.getByText("Engine Startup")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("shows Waiting... for pending state", () => {
    render(<DeployPipeline status={LLM_DE_STATUS.PENDING} />);
    expect(screen.getByText("Waiting...")).toBeInTheDocument();
  });

  it("shows step count based on phase", () => {
    render(
      <DeployPipeline
        status={LLM_DE_STATUS.DEPLOYING}
        phase="engine_initializing"
      />,
    );
    // engine_initializing is index 2 -> Step 3 of 4
    expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
  });

  it("defaults to first step when deploying without phase", () => {
    render(<DeployPipeline status={LLM_DE_STATUS.SCALING} />);
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });
});
