import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import StopInstance from "@/app/gpus-console/instances/components/stopInstance";
import StartInstance from "@/app/gpus-console/instances/components/startInstance";
import TerminateInstance from "@/app/gpus-console/instances/components/terminateInstance";
import {
  reqDeleteGpuInstance,
  reqStartGpuInstance,
  reqStopGpuInstance,
} from "@/api/gpu-instance/instances";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqDeleteGpuInstance: jest.fn(),
  reqStartGpuInstance: jest.fn(),
  reqStopGpuInstance: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));
jest.mock("@/lib/utils/utils", () => ({
  dealParamsText: (template: string, params: Record<string, unknown>) =>
    Object.entries(params).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
}));
jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: (value: string) => value,
}));

const mockStop = reqStopGpuInstance as jest.Mock;
const mockStart = reqStartGpuInstance as jest.Mock;
const mockDelete = reqDeleteGpuInstance as jest.Mock;

describe("lifecycle actions extra branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("renders the on-demand stop warning with retention details", async () => {
    const finishForm = jest.fn();
    mockStop.mockResolvedValue({});
    render(
      <StopInstance
        finishForm={finishForm}
        instanceInfoObj={{
          billingMode: "onDemand",
          id: "stop-1",
          keepDataDay: 7,
          exitedLocalStoragePrice: 250,
          releaseDataAt: "1771113600",
        }}
      />,
    );

    expect(
      screen.getByText(/When the instance is stopped/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/7 days/).length).toBeGreaterThan(0);
    expect(
      screen.getByText("Are you sure you want to stop your instance?"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    await waitFor(() => expect(mockStop).toHaveBeenCalledWith("stop-1"));
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("cancels the stop dialog without issuing a request", () => {
    const finishForm = jest.fn();
    render(
      <StopInstance
        finishForm={finishForm}
        instanceInfoObj={{ billingMode: "monthly", id: "stop-2" }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalled();
    expect(mockStop).not.toHaveBeenCalled();
  });

  it("renders the monthly start description without pricing", () => {
    render(
      <StartInstance
        finishForm={jest.fn()}
        instanceInfoObj={{ billingMode: "monthly", id: "start-1" }}
      />,
    );
    expect(screen.getByText("Start your Instance.")).toBeInTheDocument();
    expect(
      screen.queryByText(/The current machine price for/),
    ).not.toBeInTheDocument();
  });

  it("ignores repeated terminate clicks while a request is in flight", async () => {
    const finishForm = jest.fn();
    let resolveDelete: (v: unknown) => void = () => {};
    mockDelete.mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = resolve;
      }),
    );
    render(
      <TerminateInstance
        finishForm={finishForm}
        instanceInfoObj={{ id: "del-1" }}
      />,
    );
    const yes = screen.getByRole("button", { name: "Yes" });
    fireEvent.click(yes);
    fireEvent.click(yes); // second click hits the btnLoading guard
    expect(mockDelete).toHaveBeenCalledTimes(1);
    resolveDelete({});
    await waitFor(() => expect(finishForm).toHaveBeenCalledWith(true));
  });
});
