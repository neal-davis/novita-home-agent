import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import EndpointInstanceInfo from "@/app/models-console/llm-dedicated-endpoints/components/EndpointInstanceInfo";
import {
  getLLMDedicatedSpec,
  getRecommendedEndpointConfig,
} from "@/api/dedicated-endpoint";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedSpec: jest.fn(),
  getRecommendedEndpointConfig: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/InstanceField",
  () => ({
    __esModule: true,
    default: ({
      selectedInstance,
      onChange,
    }: {
      selectedInstance: { gpuName: string } | null;
      onChange: (v: unknown) => void;
    }) => (
      <div>
        <span>selected:{selectedInstance?.gpuName ?? "none"}</span>
        <button
          type="button"
          onClick={() => onChange({ gpuName: "A100", gpuNum: 2 })}
        >
          pick-instance
        </button>
        <button type="button" onClick={() => onChange(null)}>
          clear-instance
        </button>
      </div>
    ),
  }),
);

const mockGetSpec = getLLMDedicatedSpec as jest.Mock;
const mockGetRecommended = getRecommendedEndpointConfig as jest.Mock;

const resources = {
  gpu: { name: "A100", count: 2, cudaVersion: "12.1" },
  cpuNum: 8,
  memory: 32,
  storage: 100,
} as never;

const baseModel = { modelId: "meta/m", token: "tok" } as never;

function setup(props: Record<string, unknown> = {}) {
  const handleUpdate = jest.fn().mockResolvedValue(undefined);
  const syncEndpointData = jest.fn().mockResolvedValue(undefined);
  render(
    <EndpointInstanceInfo
      resources={resources}
      baseModel={baseModel}
      handleUpdate={handleUpdate}
      syncEndpointData={syncEndpointData}
      {...props}
    />,
  );
  return { handleUpdate, syncEndpointData };
}

describe("EndpointInstanceInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSpec.mockResolvedValue({
      specs: [{ gpuName: "A100" }, { gpuName: "H100" }],
    });
    mockGetRecommended.mockResolvedValue({
      engineType: "vllm",
      engineVersion: "1.0",
      resources: [
        { gpuName: "A100", gpuNums: [1, 2, 4] },
        { gpuName: "H100", gpuNums: [1, 2] },
      ],
    });
  });

  it("renders read-only GPU info", async () => {
    setup();
    await waitFor(() => expect(mockGetSpec).toHaveBeenCalled());
    expect(screen.getByText("Instance type")).toBeInTheDocument();
    expect(screen.getByText("GPU")).toBeInTheDocument();
    expect(screen.getAllByText("A100").length).toBeGreaterThan(0);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("fetches recommended config using modelId and token", async () => {
    setup();
    await waitFor(() =>
      expect(mockGetRecommended).toHaveBeenCalledWith({
        modelId: "meta/m",
        hfToken: "tok",
      }),
    );
  });

  it("enters edit mode and shows InstanceField with current selection", async () => {
    setup();
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() =>
      expect(screen.getByText("selected:A100")).toBeInTheDocument(),
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("save without selected instance warns", async () => {
    const { handleUpdate } = setup();
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => screen.getByText("selected:A100"));
    fireEvent.click(screen.getByRole("button", { name: "clear-instance" }));
    // Save button still rendered because instanceList not empty
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(message.warning).toHaveBeenCalledWith("Please select an instance"),
    );
    expect(handleUpdate).not.toHaveBeenCalled();
  });

  it("save with selected instance calls handleUpdate + syncEndpointData and exits edit", async () => {
    const { handleUpdate, syncEndpointData } = setup();
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => screen.getByText("selected:A100"));
    fireEvent.click(screen.getByRole("button", { name: "pick-instance" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    await waitFor(() =>
      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          gpu: expect.objectContaining({ name: "A100", count: 2 }),
        }),
      ),
    );
    expect(syncEndpointData).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument(),
    );
  });

  it("cancel exits edit mode", async () => {
    setup();
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => screen.getByText("selected:A100"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
