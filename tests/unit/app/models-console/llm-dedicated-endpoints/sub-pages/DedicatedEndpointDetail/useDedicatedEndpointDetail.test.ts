import { act, renderHook, waitFor } from "@testing-library/react";
import {
  getLLMDedicatedEndpointChangeHistory,
  restartLLMDedicatedEndpoint,
  updateLLMDedicatedEndpoint,
} from "@/api/dedicated-endpoint";
import { message } from "@/components/ui/standard/notify";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";
import { useDedicatedEndpointDetail } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointDetail/useDedicatedEndpointDetail";

jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedEndpointChangeHistory: jest.fn(),
  restartLLMDedicatedEndpoint: jest.fn(),
  updateLLMDedicatedEndpoint: jest.fn(),
}));

jest.mock("@/lib/utils/date", () => ({
  formatRelativeTime: jest.fn(() => "2 hours ago"),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockGetChangeHistory = getLLMDedicatedEndpointChangeHistory as jest.Mock;
const mockRestartEndpoint = restartLLMDedicatedEndpoint as jest.Mock;
const mockUpdateEndpoint = updateLLMDedicatedEndpoint as jest.Mock;
const mockMessageSuccess = message.success as jest.Mock;
const mockMessageError = message.error as jest.Mock;

function createEndpoint(
  status = LLM_DE_STATUS.RUNNING,
  overrides: Partial<LLMDedicatedEndpoint> = {},
): LLMDedicatedEndpoint {
  return {
    baseModel: {
      modelAlias: "Llama Alias",
      modelId: "owner/base-model",
      provider: "huggingface",
      token: "",
    },
    createTime: "2026-01-15T10:00:00Z",
    id: "endpoint-1",
    name: "endpoint one",
    resources: {
      gpu: {
        count: 1,
        name: "L40S",
      },
    },
    scalingPolicy: {
      coolDownPeriod: 300,
      enable: true,
      maxReplicas: 2,
      minReplicas: 1,
    },
    status,
    ...overrides,
  } as LLMDedicatedEndpoint;
}

describe("useDedicatedEndpointDetail", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    document.body.innerHTML =
      '<main class="ConsoleHeaderWrapper_main__test"></main>';
    const main = document.querySelector("main") as HTMLElement;
    main.scrollTop = 48;
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockGetChangeHistory.mockResolvedValue({
      records: [{ id: "history-1" }, { id: "history-2" }],
      total: 2,
    });
    mockRestartEndpoint.mockResolvedValue({});
    mockUpdateEndpoint.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  it("initializes detail state, loads change history, and auto-syncs endpoint data", async () => {
    const syncEndpointData = jest.fn().mockResolvedValue(undefined);
    const { result, unmount } = renderHook(() =>
      useDedicatedEndpointDetail({
        endpointData: createEndpoint(),
        initialTab: "metrics",
        syncEndpointData,
      }),
    );

    expect(result.current.activeTab).toBe("metrics");
    expect(document.querySelector("main")?.scrollTop).toBe(0);
    expect(result.current.modelDisplayName).toBe("Llama Alias");
    expect(result.current.formattedCreateTime).toBe("2 hours ago");
    expect(result.current.statusText).toBe("Running");
    expect(result.current.canTerminate).toBe(true);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canPlayground).toBe(true);
    expect(result.current.primaryActions).toEqual([]);

    await waitFor(() =>
      expect(mockGetChangeHistory).toHaveBeenCalledWith({
        endpointId: "endpoint-1",
        pageNum: 1,
        pageSize: 5,
        sortKey: "newest",
      }),
    );
    await waitFor(() =>
      expect(result.current.changeHistoryRecords).toEqual([
        { id: "history-1" },
        { id: "history-2" },
      ]),
    );
    expect(result.current.changeHistoryTotal).toBe(2);
    expect(result.current.isChangeHistoryLoading).toBe(false);

    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(syncEndpointData).toHaveBeenCalledTimes(1);

    unmount();
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(syncEndpointData).toHaveBeenCalledTimes(1);
  });

  it("loads more change history and skips paging when all rows are loaded", async () => {
    mockGetChangeHistory
      .mockResolvedValueOnce({
        records: [
          { id: "history-1" },
          { id: "history-2" },
          { id: "history-3" },
          { id: "history-4" },
          { id: "history-5" },
        ],
        total: 6,
      })
      .mockResolvedValueOnce({
        records: [{ id: "history-6" }],
        total: 6,
      });
    const { result } = renderHook(() =>
      useDedicatedEndpointDetail({
        endpointData: createEndpoint(),
        syncEndpointData: jest.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.changeHistoryRecords).toHaveLength(5),
    );

    await act(async () => {
      await result.current.loadMoreChangeHistory();
    });

    expect(mockGetChangeHistory).toHaveBeenLastCalledWith({
      endpointId: "endpoint-1",
      pageNum: 2,
      pageSize: 5,
      sortKey: "newest",
    });
    expect(result.current.changeHistoryRecords).toEqual([
      { id: "history-1" },
      { id: "history-2" },
      { id: "history-3" },
      { id: "history-4" },
      { id: "history-5" },
      { id: "history-6" },
    ]);

    await act(async () => {
      await result.current.loadMoreChangeHistory();
    });
    expect(mockGetChangeHistory).toHaveBeenCalledTimes(2);
  });

  it("builds update payloads and refreshes change history after successful updates", async () => {
    const { result } = renderHook(() =>
      useDedicatedEndpointDetail({
        endpointData: createEndpoint(),
        syncEndpointData: jest.fn(),
      }),
    );

    await waitFor(() => expect(mockGetChangeHistory).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.handleUpdate({
        baseModel: {
          modelId: "owner/new-base",
          provider: "huggingface",
          token: "hf-token",
        },
        endpointName: "renamed-endpoint",
        engine: {
          config: {
            maxNumSeqs: 32,
          },
        },
        isSuffixDecodingEnable: false,
        loras: [{ modelId: "owner/lora", provider: "huggingface" }],
        resources: {
          gpu: {
            count: 2,
            name: "A100",
          },
        },
        scalingPolicy: {
          coolDownPeriod: 600,
          enable: true,
          maxReplicas: 4,
          minReplicas: 1,
        },
      });
    });

    expect(mockUpdateEndpoint).toHaveBeenCalledWith({
      id: "endpoint-1",
      updateData: {
        baseModel: {
          modelId: "owner/new-base",
          provider: "huggingface",
          token: "hf-token",
        },
        engine: {
          config: {
            maxNumSeqs: 32,
          },
        },
        isSuffixDecodingEnable: false,
        lora: {
          data: [{ modelId: "owner/lora", provider: "huggingface" }],
        },
        name: "renamed-endpoint",
        resources: {
          gpu: {
            count: 2,
            name: "A100",
          },
        },
        scalingPolicy: {
          coolDownPeriod: 600,
          enable: true,
          maxReplicas: 4,
          minReplicas: 1,
        },
      },
    });
    expect(mockGetChangeHistory).toHaveBeenCalledTimes(2);
  });

  it("derives primary actions and modal capabilities from endpoint status", async () => {
    const syncEndpointData = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDedicatedEndpointDetail({
        endpointData: createEndpoint(LLM_DE_STATUS.SLEEPING, {
          baseModel: { modelId: "owner/fallback-model" } as any,
        }),
        syncEndpointData,
      }),
    );

    await waitFor(() => expect(mockGetChangeHistory).toHaveBeenCalled());
    expect(result.current.modelDisplayName).toBe("fallback-model");
    expect(result.current.canTerminate).toBe(true);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canPlayground).toBe(false);
    expect(result.current.primaryActions).toEqual([
      expect.objectContaining({ key: "wake", label: "Wake Up" }),
    ]);

    await act(async () => {
      await result.current.primaryActions[0].onClick();
    });

    expect(mockMessageSuccess).toHaveBeenCalledWith("Endpoint is waking up");
    expect(mockRestartEndpoint).toHaveBeenCalledWith({ id: "endpoint-1" });
    expect(syncEndpointData).toHaveBeenCalledTimes(1);

    mockRestartEndpoint.mockRejectedValueOnce(new Error("restart failed"));
    await act(async () => {
      await result.current.primaryActions[0].onClick();
    });
    expect(mockMessageError).toHaveBeenCalledWith("Failed to wake up endpoint");
  });

  it("uses redeploy for failed endpoints and allows delete but not terminate", async () => {
    const syncEndpointData = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDedicatedEndpointDetail({
        endpointData: createEndpoint(LLM_DE_STATUS.FAILED),
        syncEndpointData,
      }),
    );

    await waitFor(() => expect(mockGetChangeHistory).toHaveBeenCalled());
    expect(result.current.canTerminate).toBe(false);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.primaryActions).toEqual([
      expect.objectContaining({ key: "redeploy", label: "Redeploy" }),
    ]);

    await act(async () => {
      await result.current.primaryActions[0].onClick();
    });

    expect(mockRestartEndpoint).toHaveBeenCalledWith({ id: "endpoint-1" });
    expect(syncEndpointData).toHaveBeenCalledTimes(1);
  });
});
