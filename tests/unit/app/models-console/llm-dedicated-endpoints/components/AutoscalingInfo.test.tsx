import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import AutoscalingInfo from "@/app/models-console/llm-dedicated-endpoints/components/AutoscalingInfo";

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/AutoscalingConfig",
  () => ({
    __esModule: true,
    default: ({
      value,
      onChange,
      error,
    }: {
      value: { minReplicas: number; maxReplicas: number };
      onChange: (v: Record<string, unknown>) => void;
      error?: string;
    }) => (
      <div>
        <span>config-min-{value.minReplicas}</span>
        {error ? <span>err:{error}</span> : null}
        <button
          type="button"
          onClick={() =>
            onChange({
              enabled: true,
              minReplicas: 1,
              maxReplicas: 3,
              cooldownPeriod: 60,
            })
          }
        >
          change-config
        </button>
      </div>
    ),
  }),
);

const parseMock = jest.fn();
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/validation",
  () => ({
    createAutoscalingSchema: () => ({ parse: parseMock }),
  }),
);

const basePolicy = {
  enable: true,
  minReplicas: 1,
  maxReplicas: 4,
  coolDownPeriod: 120,
  scaleDownWindow: 30,
  stableWindow: 60,
} as never;

function setup(props: Record<string, unknown> = {}) {
  const handleUpdate = jest.fn().mockResolvedValue(undefined);
  const syncEndpointData = jest.fn().mockResolvedValue(undefined);
  render(
    <AutoscalingInfo
      scalingPolicy={basePolicy}
      singleInstanceGpuNum={1}
      endpointName="ep-test"
      handleUpdate={handleUpdate}
      syncEndpointData={syncEndpointData}
      {...props}
    />,
  );
  return { handleUpdate, syncEndpointData };
}

describe("AutoscalingInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    parseMock.mockReturnValue(undefined);
  });

  it("renders read-only view with policy values", () => {
    setup();
    expect(screen.getByText("Autoscaling Configuration")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument(); // max replicas
    expect(screen.getByText("120s")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument(); // minReplicas !== 0
  });

  it("shows Scale-to-Zero Enabled when minReplicas is 0", () => {
    setup({ scalingPolicy: { ...basePolicy, minReplicas: 0 } });
    expect(screen.getByText("Enabled")).toBeInTheDocument();
  });

  it("Edit button enters editing mode and shows warning", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.getByText("Autoscaling changes take effect within 5 minutes"),
    ).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("Cancel exits editing mode", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("Edit disabled when isLocked", () => {
    setup({ isLocked: true });
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
  });

  it("save with validation error keeps editing, does not call handleUpdate", async () => {
    const { handleUpdate } = setup();
    parseMock.mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const z = require("zod");
      throw new z.ZodError([
        { message: "min too low", path: [], code: "custom" },
      ]);
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "change-config" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(screen.getByText(/err:min too low/)).toBeInTheDocument(),
    );
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it("successful save calls handleUpdate, syncEndpointData and starts cooldown", async () => {
    const { handleUpdate, syncEndpointData } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "change-config" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    await waitFor(() => expect(handleUpdate).toHaveBeenCalledTimes(1));
    expect(syncEndpointData).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("autoscaling_cooldown_ep-test")).toBeTruthy();
    // After cooldown started, Edit button shows clock countdown and is disabled
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Edit \(/ })).toBeDisabled(),
    );
  });

  it("reads existing cooldown from localStorage on mount", () => {
    localStorage.setItem(
      "autoscaling_cooldown_ep-test",
      String(Date.now() + 60000),
    );
    setup();
    expect(screen.getByRole("button", { name: /Edit \(/ })).toBeDisabled();
  });
});
