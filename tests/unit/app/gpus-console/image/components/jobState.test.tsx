import { render, screen } from "@testing-library/react";
import JobState from "@/app/gpus-console/image/components/jobState";

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

describe("JobState", () => {
  it.each([
    ["Succeeded", "SUCCEEDED"],
    ["Failed", "FAILED"],
    ["Running", "RUNNING"],
    ["Pending", "PENDING"],
    ["Whatever", "UNKNOWN"],
  ])("renders %s as %s", (state, text) => {
    render(<JobState state={state} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("shows the reason tooltip for a failed job with reasons", () => {
    render(<JobState state="Failed" reason={["disk full", "oom"]} />);
    expect(screen.getByText("FAILED")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("does not show a tooltip for a failed job without reasons", () => {
    render(<JobState state="Failed" reason={[]} />);
    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });
});
