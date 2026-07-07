import { render, screen } from "@testing-library/react";
import DEModelStatus, {
  LLM_DE_STATUS,
} from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

jest.mock("@/app/components/Tooltip", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

describe("DEModelStatus", () => {
  it("renders the raw status (uppercased) for running", () => {
    render(<DEModelStatus status={LLM_DE_STATUS.RUNNING} />);
    expect(screen.getByText("RUNNING")).toBeInTheDocument();
    // no rolling tooltip
    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("renders CircleStop icon only for terminated", () => {
    const { container } = render(
      <DEModelStatus status={LLM_DE_STATUS.TERMINATED} />,
    );
    expect(screen.getByText("TERMINATED")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows phase display name when deploying with a known phase", () => {
    render(
      <DEModelStatus
        status={LLM_DE_STATUS.DEPLOYING}
        phase="downloading_model"
      />,
    );
    expect(screen.getByText("DOWNLOADING MODEL")).toBeInTheDocument();
  });

  it("falls back to status when deploying phase is unknown", () => {
    render(
      <DEModelStatus
        status={LLM_DE_STATUS.DEPLOYING}
        phase="some-unknown-phase"
      />,
    );
    expect(screen.getByText("DEPLOYING")).toBeInTheDocument();
  });

  it("falls back to status when deploying without a phase", () => {
    render(<DEModelStatus status={LLM_DE_STATUS.DEPLOYING} />);
    expect(screen.getByText("DEPLOYING")).toBeInTheDocument();
  });

  it("shows the rolling tooltip only for rolling status", () => {
    render(<DEModelStatus status={LLM_DE_STATUS.ROLLING} />);
    expect(screen.getByText("ROLLING")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("applies the className passed in", () => {
    const { container } = render(
      <DEModelStatus status={LLM_DE_STATUS.SLEEPING} className="extra-class" />,
    );
    expect(container.querySelector(".extra-class")).toBeInTheDocument();
    expect(screen.getByText("SLEEPING")).toBeInTheDocument();
  });
});
