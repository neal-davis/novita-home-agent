import { act, renderHook, waitFor } from "@testing-library/react";
import { useDedicatedEndpointList } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList/useDedicatedEndpointList";
import { restartLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/dedicated-endpoint", () => ({
  restartLLMDedicatedEndpoint: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

const mockRestart = restartLLMDedicatedEndpoint as jest.Mock;

function setup(
  overrides: Partial<Parameters<typeof useDedicatedEndpointList>[0]> = {},
) {
  const opts = {
    dedicatedEndpointList: [] as never[],
    loading: false,
    filterStatus: "",
    filterEndpointName: "",
    refreshList: jest.fn(),
    goToCreateEndpoint: jest.fn(),
    ...overrides,
  };
  return {
    opts,
    ...renderHook((p) => useDedicatedEndpointList(p), { initialProps: opts }),
  };
}

describe("useDedicatedEndpointList", () => {
  beforeEach(() => jest.clearAllMocks());

  it("clears initial load once not loading", () => {
    const { result } = setup({ loading: false });
    expect(result.current.isInitialLoad).toBe(false);
  });

  it("keeps initial load true while loading with empty list", () => {
    const { result } = setup({ loading: true, dedicatedEndpointList: [] });
    expect(result.current.isInitialLoad).toBe(true);
  });

  it("isShowGetStarted true only when empty, not loading, no filters", () => {
    const { result } = setup({
      dedicatedEndpointList: [],
      loading: false,
      filterStatus: "",
      filterEndpointName: "",
    });
    expect(result.current.isShowGetStarted).toBe(true);
  });

  it("isShowGetStarted false when a status filter is active", () => {
    const { result } = setup({ filterStatus: "running" });
    expect(result.current.isShowGetStarted).toBe(false);
  });

  it("isShowGetStarted false when list is populated", () => {
    const { result } = setup({ dedicatedEndpointList: [{ id: "1" }] as never });
    expect(result.current.isShowGetStarted).toBe(false);
  });

  it("handleTerminate opens modal and stores target", () => {
    const { result } = setup();
    act(() => result.current.handleTerminate({ id: "ep1" } as never));
    expect(result.current.showTerminateModal).toBe(true);
    expect(result.current.targetEndpoint).toEqual({ id: "ep1" });
  });

  it("closeTerminateModal resets state", () => {
    const { result } = setup();
    act(() => result.current.handleTerminate({ id: "ep1" } as never));
    act(() => result.current.closeTerminateModal());
    expect(result.current.showTerminateModal).toBe(false);
    expect(result.current.targetEndpoint).toBeNull();
  });

  it("handleDelete opens delete confirm and closeDeleteConfirm resets", () => {
    const { result } = setup();
    act(() => result.current.handleDelete({ id: "ep2" } as never));
    expect(result.current.showDeleteConfirm).toBe(true);
    expect(result.current.targetEndpoint).toEqual({ id: "ep2" });
    act(() => result.current.closeDeleteConfirm());
    expect(result.current.showDeleteConfirm).toBe(false);
    expect(result.current.targetEndpoint).toBeNull();
  });

  it("handleCreateEndpoint delegates to goToCreateEndpoint", () => {
    const goToCreateEndpoint = jest.fn();
    const { result } = setup({ goToCreateEndpoint });
    act(() => result.current.handleCreateEndpoint());
    expect(goToCreateEndpoint).toHaveBeenCalledTimes(1);
  });

  it("handleRedeploy success calls API, toasts, refreshes", async () => {
    mockRestart.mockResolvedValueOnce({});
    const refreshList = jest.fn();
    const { result } = setup({ refreshList });
    await act(async () => {
      await result.current.handleRedeploy({ id: "ep3" } as never);
    });
    expect(mockRestart).toHaveBeenCalledWith({ id: "ep3" });
    expect(message.success).toHaveBeenCalledWith(
      "Endpoint is being redeployed",
    );
    expect(refreshList).toHaveBeenCalled();
  });

  it("handleRedeploy failure shows error toast", async () => {
    mockRestart.mockRejectedValueOnce(new Error("boom"));
    const errSpy = jest.spyOn(console, "error").mockImplementation();
    const refreshList = jest.fn();
    const { result } = setup({ refreshList });
    await act(async () => {
      await result.current.handleRedeploy({ id: "ep3" } as never);
    });
    expect(message.error).toHaveBeenCalledWith("Failed to redeploy endpoint");
    expect(refreshList).not.toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it("handleWake toasts immediately, calls API, refreshes on success", async () => {
    mockRestart.mockResolvedValueOnce({});
    const refreshList = jest.fn();
    const { result } = setup({ refreshList });
    await act(async () => {
      await result.current.handleWake({ id: "ep4" } as never);
    });
    expect(message.success).toHaveBeenCalledWith("Endpoint is waking up");
    expect(mockRestart).toHaveBeenCalledWith({ id: "ep4" });
    expect(refreshList).toHaveBeenCalled();
  });

  it("handleWake failure shows error toast", async () => {
    mockRestart.mockRejectedValueOnce(new Error("nope"));
    const errSpy = jest.spyOn(console, "error").mockImplementation();
    const { result } = setup();
    await act(async () => {
      await result.current.handleWake({ id: "ep4" } as never);
    });
    expect(message.error).toHaveBeenCalledWith("Failed to wake up endpoint");
    errSpy.mockRestore();
  });
});
