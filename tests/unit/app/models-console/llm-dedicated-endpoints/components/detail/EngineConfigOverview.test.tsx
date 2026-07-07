import { fireEvent, render, screen } from "@testing-library/react";
import EngineConfigOverview from "@/app/models-console/llm-dedicated-endpoints/components/detail/EngineConfigOverview";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

jest.mock("@/components/ui/standard/code-copy-btn", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <button type="button">copy:{content}</button>
  ),
}));

function makeData(over: Record<string, unknown> = {}) {
  return {
    id: "ep-123",
    baseModel: { modelId: "meta/m" },
    engine: { type: "vllm", version: "1.0" },
    scalingPolicy: {
      enable: true,
      minReplicas: 1,
      maxReplicas: 4,
      coolDownPeriod: 300,
    },
    resources: { gpu: { name: "A100", count: 2 } },
    status: LLM_DE_STATUS.RUNNING,
    loras: [{ modelId: "a" }],
    ...over,
  } as never;
}

describe("EngineConfigOverview", () => {
  it("renders model id, gpu, engine, autoscaling, endpoint id and lora count", () => {
    render(<EngineConfigOverview endpointData={makeData()} />);
    expect(screen.getByText("meta/m")).toBeInTheDocument();
    expect(screen.getByText("A100 ×2")).toBeInTheDocument();
    expect(screen.getByText("vllm 1.0")).toBeInTheDocument();
    expect(
      screen.getByText("Enabled · 1-4 replicas · 5min cooldown"),
    ).toBeInTheDocument();
    expect(screen.getByText("ep-123")).toBeInTheDocument();
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("prefers modelAlias over modelId", () => {
    render(
      <EngineConfigOverview
        endpointData={makeData({
          baseModel: { modelAlias: "alias-y", modelId: "x" },
        })}
      />,
    );
    expect(screen.getByText("alias-y")).toBeInTheDocument();
  });

  it("shows Disabled when autoscaling off and dashes for missing data", () => {
    render(
      <EngineConfigOverview
        endpointData={makeData({
          scalingPolicy: { enable: false },
          resources: {},
          engine: {},
          baseModel: {},
        })}
      />,
    );
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    // model id, gpu, engine all dash
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(2);
  });

  it("autoscaling edit calls onEditAutoscaling when not locked (running)", () => {
    const onEditAutoscaling = jest.fn();
    render(
      <EngineConfigOverview
        endpointData={makeData()}
        onEditAutoscaling={onEditAutoscaling}
      />,
    );
    // The autoscaling box has a pencil action button
    const pencilBtn = screen
      .getAllByRole("button")
      .find((b) => b.querySelector("svg") && !b.textContent?.includes("LoRA"));
    fireEvent.click(pencilBtn!);
    expect(onEditAutoscaling).toHaveBeenCalled();
  });

  it("LoRA button calls onEditLora and is enabled when running", () => {
    const onEditLora = jest.fn();
    render(
      <EngineConfigOverview
        endpointData={makeData()}
        onEditLora={onEditLora}
      />,
    );
    const loraBtn = screen.getByRole("button", { name: /LoRA/ });
    expect(loraBtn).not.toBeDisabled();
    fireEvent.click(loraBtn);
    expect(onEditLora).toHaveBeenCalled();
  });

  it("LoRA button disabled in locked transitioning state", () => {
    render(
      <EngineConfigOverview
        endpointData={makeData({ status: LLM_DE_STATUS.DEPLOYING })}
        onEditLora={jest.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /LoRA/ })).toBeDisabled();
  });
});
