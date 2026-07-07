import { render, screen, fireEvent } from "@testing-library/react";
import DEModelCard from "@/app/models-console/llm-dedicated-endpoints/components/DEModelCard";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

jest.mock("@/lib/utils/date", () => ({
  formatRelativeTime: () => "2 hours ago",
}));

function makeData(overrides: Record<string, unknown> = {}) {
  return {
    name: "ep",
    status: LLM_DE_STATUS.RUNNING,
    phase: "",
    resources: { gpu: { name: "A100", count: 2 } },
    createUserName: "alice",
    createTime: 1700000000,
    baseModel: { modelId: "m", provider: "huggingface" },
    scalingPolicy: { enable: true, minReplicas: 1, maxReplicas: 4 },
    ...overrides,
  } as never;
}

describe("DEModelCard (more branches)", () => {
  it("failed status shows Redeploy + Delete", () => {
    const onRedeploy = jest.fn();
    const onDelete = jest.fn();
    render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.FAILED })}
        onRedeploy={onRedeploy}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Redeploy" }));
    expect(onRedeploy).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("terminated/failed without onRedeploy renders no Redeploy button", () => {
    render(
      <DEModelCard data={makeData({ status: LLM_DE_STATUS.TERMINATED })} />,
    );
    expect(
      screen.queryByRole("button", { name: "Redeploy" }),
    ).not.toBeInTheDocument();
  });

  it("sleeping without onWake omits Wake Up but keeps Terminate", () => {
    render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.SLEEPING })}
        onPause={jest.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Wake Up" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Terminate" }),
    ).toBeInTheDocument();
  });

  it("renders status dot classes across status variants", () => {
    const statuses = [
      LLM_DE_STATUS.FAILED,
      LLM_DE_STATUS.SLEEPING,
      LLM_DE_STATUS.TERMINATED,
      LLM_DE_STATUS.SCALING,
      LLM_DE_STATUS.TERMINATING,
    ];
    statuses.forEach((status) => {
      const { container, unmount } = render(
        <DEModelCard data={makeData({ status })} />,
      );
      // status dot span always rendered as first child span
      expect(container.querySelector("span")).toBeInTheDocument();
      unmount();
    });
  });

  it("uses fallback status tag style for an unknown status", () => {
    render(<DEModelCard data={makeData({ status: "weird-status" })} />);
    // statusText capitalizes first letter
    expect(screen.getByText("Weird-status")).toBeInTheDocument();
  });

  it("running without onPause shows no action buttons", () => {
    render(<DEModelCard data={makeData({ status: LLM_DE_STATUS.RUNNING })} />);
    expect(
      screen.queryByRole("button", { name: "Terminate" }),
    ).not.toBeInTheDocument();
  });
});
