import { render, screen, within } from "@testing-library/react";
import ReplicasInfo from "@/app/models-console/llm-dedicated-endpoints/components/detail/ReplicasInfo";

describe("ReplicasInfo", () => {
  it("renders ready replica count and min/max range", () => {
    render(
      <ReplicasInfo
        replica={3}
        readyReplica={2}
        minReplicas={1}
        maxReplicas={4}
      />,
    );
    expect(screen.getByText("Running Replicas")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("min:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("max:")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders zero ready replicas", () => {
    render(
      <ReplicasInfo
        replica={0}
        readyReplica={0}
        minReplicas={0}
        maxReplicas={8}
      />,
    );
    expect(screen.getByText("Running Replicas")).toBeInTheDocument();
    expect(screen.getByText("min:")).toBeInTheDocument();
    const root = screen.getByText("Running Replicas")
      .parentElement as HTMLElement;
    expect(
      within(root.children[1] as HTMLElement).getByText("0"),
    ).toBeInTheDocument();
    expect(screen.getByText("max:")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
