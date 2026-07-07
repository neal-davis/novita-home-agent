import { fireEvent, render, screen } from "@testing-library/react";
import DEModelCard from "@/app/models-console/llm-dedicated-endpoints/components/DEModelCard";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

jest.mock("@/lib/utils/date", () => ({
  formatRelativeTime: () => "2 hours ago",
}));

function makeData(overrides: Record<string, unknown> = {}) {
  return {
    name: "my-endpoint",
    status: LLM_DE_STATUS.RUNNING,
    phase: "",
    resources: { gpu: { name: "A100", count: 2 } },
    createUserName: "alice",
    createTime: 1700000000,
    baseModel: { modelId: "meta-llama/Llama-3.1-8B", provider: "huggingface" },
    scalingPolicy: { enable: true, minReplicas: 1, maxReplicas: 4 },
    ...overrides,
  } as never;
}

describe("DEModelCard", () => {
  it("renders core info: name, model, gpu, replicas range, creator, time, source", () => {
    render(<DEModelCard data={makeData()} />);

    expect(screen.getByText("my-endpoint")).toBeInTheDocument();
    expect(screen.getByText("meta-llama/Llama-3.1-8B")).toBeInTheDocument();
    expect(screen.getByText("A100 ×2")).toBeInTheDocument();
    expect(screen.getByText("1-4 replicas")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    expect(screen.getByText("HuggingFace")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("falls back to modelAlias then Unknown Model", () => {
    const { rerender } = render(
      <DEModelCard data={makeData({ baseModel: { modelAlias: "alias-x" } })} />,
    );
    expect(screen.getByText("alias-x")).toBeInTheDocument();

    rerender(<DEModelCard data={makeData({ baseModel: {} })} />);
    expect(screen.getByText("Unknown Model")).toBeInTheDocument();
  });

  it("shows replica '1' when scaling policy disabled", () => {
    render(
      <DEModelCard data={makeData({ scalingPolicy: { enable: false } })} />,
    );
    expect(screen.getByText("1 replicas")).toBeInTheDocument();
  });

  it("labels Novita provider source", () => {
    render(
      <DEModelCard
        data={makeData({
          baseModel: { modelId: "m", provider: "Novita" },
        })}
      />,
    );
    expect(screen.getByText("Novita")).toBeInTheDocument();
  });

  it("invokes onClick when card is clicked", () => {
    const onClick = jest.fn();
    render(<DEModelCard data={makeData()} onClick={onClick} />);
    fireEvent.click(screen.getByText("my-endpoint"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("running status shows Terminate action and calls onPause without bubbling", () => {
    const onPause = jest.fn();
    const onClick = jest.fn();
    render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.RUNNING })}
        onPause={onPause}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("sleeping status shows Wake Up + Terminate", () => {
    const onWake = jest.fn();
    const onPause = jest.fn();
    render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.SLEEPING })}
        onWake={onWake}
        onPause={onPause}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Wake Up" }));
    expect(onWake).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("terminated status shows Redeploy + Delete and wires handlers", () => {
    const onRedeploy = jest.fn();
    const onDelete = jest.fn();
    render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.TERMINATED })}
        onRedeploy={onRedeploy}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Redeploy" }));
    expect(onRedeploy).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("pending and deploying show Terminate", () => {
    const onPause = jest.fn();
    const { rerender } = render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.PENDING })}
        onPause={onPause}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Terminate" }),
    ).toBeInTheDocument();

    rerender(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.DEPLOYING })}
        onPause={onPause}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Terminate" }),
    ).toBeInTheDocument();
  });

  it("rolling and scaling allow Terminate", () => {
    const onPause = jest.fn();
    const { rerender } = render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.ROLLING })}
        onPause={onPause}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Terminate" }),
    ).toBeInTheDocument();
    rerender(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.SCALING })}
        onPause={onPause}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Terminate" }),
    ).toBeInTheDocument();
  });

  it("terminating status shows no action buttons", () => {
    const onPause = jest.fn();
    render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.TERMINATING })}
        onPause={onPause}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("delete only allowed for terminated/failed, not running", () => {
    render(
      <DEModelCard
        data={makeData({ status: LLM_DE_STATUS.RUNNING })}
        onDelete={jest.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("toggles hover state on mouse enter/leave", () => {
    render(<DEModelCard data={makeData()} onPause={jest.fn()} />);
    const card = screen.getByText("my-endpoint").closest("div");
    // hovering the outer card container
    const outer = card?.parentElement?.parentElement?.parentElement as Element;
    fireEvent.mouseEnter(outer);
    fireEvent.mouseLeave(outer);
    // Terminate button still present regardless (visibility is CSS only)
    expect(
      screen.getByRole("button", { name: "Terminate" }),
    ).toBeInTheDocument();
  });
});
