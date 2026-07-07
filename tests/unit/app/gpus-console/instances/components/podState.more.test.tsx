import { render } from "@testing-library/react";
import PodState from "@/app/gpus-console/instances/components/podState";
import { PodStatus } from "@/lib/utils/gpuInstance";

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <span>{children}</span>,
}));

const SPINNER = 'img[src="/gpu-instance/instances/icon-ing.svg"]';

// States that render a spinner (showCircle === true)
const spinnerStates = [
  PodStatus.CreatePending,
  PodStatus.pulling,
  PodStatus.starting,
  PodStatus.migrating,
  PodStatus.Starting,
  PodStatus.creating,
  PodStatus.resetting,
  PodStatus.restarting,
  PodStatus.removing,
  PodStatus.Stopping,
  PodStatus.stopping,
];

describe("PodState exhaustive state branches", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => logSpy.mockRestore());

  it.each(Object.values(PodStatus))(
    "renders the state badge for %s",
    (state) => {
      const { container } = render(
        <PodState state={state} instanceInfo={{}} />,
      );
      const hasSpinner = !!container.querySelector(SPINNER);
      expect(hasSpinner).toBe(spinnerStates.includes(state as PodStatus));
    },
  );

  it("falls back to the default color/bg for an unrecognized state", () => {
    const { container } = render(
      <PodState state="totally-unknown" instanceInfo={{}} />,
    );
    // default branch -> no spinner
    expect(container.querySelector(SPINNER)).not.toBeInTheDocument();
  });

  it("treats lastStartedAt of '0' as no start-time tooltip", () => {
    const { container } = render(
      <PodState
        state={PodStatus.running}
        instanceInfo={{ lastStartedAt: "0" }}
      />,
    );
    // still renders the badge in the non-tooltip branch
    expect(container.textContent).toContain("RUNNING");
  });

  it("renders both error tooltip and start-time tooltip together", () => {
    const { container } = render(
      <PodState
        state={PodStatus.Running}
        instanceInfo={{ lastStartedAt: "1768435200" }}
        errorText="oom"
        errorMessage="killed"
      />,
    );
    expect(container.textContent).toContain("RUNNING");
  });
});
