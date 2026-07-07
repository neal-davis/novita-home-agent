import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createAsyncTask,
  createSyncTask,
  getTaskResult,
} from "@/api/multimodal-playground";
import { useTaskExecution } from "@/app/models-console/multimodal-playground/hooks/useTaskExecution";
import { TaskStatus } from "@/types/multimodal-playground";

jest.mock("@/api/multimodal-playground", () => ({
  createAsyncTask: jest.fn(),
  createSyncTask: jest.fn(),
  getTaskResult: jest.fn(),
}));

const mockCreateAsyncTask = createAsyncTask as jest.Mock;
const mockCreateSyncTask = createSyncTask as jest.Mock;
const mockGetTaskResult = getTaskResult as jest.Mock;

const examples = [
  {
    request: { prompt: "example" },
    response: {
      task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
      images: [{ image_url: "https://cdn.example.test/example.png" }],
    },
  },
];

describe("useTaskExecution (more branches)", () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockCreateAsyncTask.mockReset();
    mockCreateSyncTask.mockReset();
    mockGetTaskResult.mockReset();
  });

  it("aborts the in-flight controller and clears the poll timer when the endpoint changes", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-1" });
    // keep polling so a timeout is scheduled and the abortController stays set
    mockGetTaskResult.mockResolvedValue({
      task: { status: TaskStatus.PROCESSING },
    });

    const { result, rerender } = renderHook(
      ({ endpoint }) =>
        useTaskExecution({ endpoint, examples, pollInterval: 100 }),
      { initialProps: { endpoint: "/v1/async" } },
    );

    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    expect(result.current.taskState.status).toBe("polling");
    const abort = result.current.taskState.abortController!;
    expect(abort).toBeTruthy();

    // switching endpoint must abort the controller and reset to idle
    rerender({ endpoint: "/v1/other" });

    await waitFor(() => expect(result.current.taskState.status).toBe("idle"));
    expect(abort.signal.aborted).toBe(true);
    expect(result.current.taskState.result).toEqual(examples[0].response);
  });

  it("updates only the example display when examples change but endpoint stays the same", async () => {
    const newExamples = [
      {
        request: { prompt: "two" },
        response: {
          task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
          images: [{ image_url: "https://cdn.example.test/two.png" }],
        },
      },
    ];

    const { result, rerender } = renderHook(
      ({ ex }) => useTaskExecution({ endpoint: "/v1/same", examples: ex }),
      { initialProps: { ex: [] as typeof examples } },
    );

    // idle, no result yet
    expect(result.current.taskState.result).toBeNull();

    // same endpoint, new examples -> result becomes first example response
    rerender({ ex: newExamples });

    await waitFor(() =>
      expect(result.current.taskState.result).toEqual(newExamples[0].response),
    );
    expect(result.current.taskState.status).toBe("idle");
  });

  it("clears a pending poll timeout when executeTask is invoked again", async () => {
    jest.useFakeTimers();
    mockCreateAsyncTask.mockResolvedValue({ task_id: "task-1" });
    mockGetTaskResult.mockResolvedValue({
      task: { status: TaskStatus.PROCESSING },
    });

    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples, pollInterval: 100 }),
    );

    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    // schedule a poll timeout
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });
    expect(result.current.taskState.status).toBe("polling");

    const clearSpy = jest.spyOn(global, "clearTimeout");
    // second executeTask should clear the pending timeout first
    mockCreateSyncTask.mockResolvedValueOnce({
      task: { status: TaskStatus.SUCCEED },
    });
    await act(async () => {
      await result.current.executeTask({ prompt: "y" }, false);
    });
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
    jest.useRealTimers();
  });

  it("aborts the controller and clears the timer on resetTask while polling", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-1" });
    mockGetTaskResult.mockResolvedValue({
      task: { status: TaskStatus.PROCESSING },
    });

    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples, pollInterval: 100 }),
    );
    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    const abort = result.current.taskState.abortController!;
    expect(abort).toBeTruthy();

    act(() => {
      result.current.resetTask();
    });
    expect(abort.signal.aborted).toBe(true);
    expect(result.current.taskState.status).toBe("idle");
  });

  it("aborts the controller and clears the timer on setExampleResult while polling", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-1" });
    mockGetTaskResult.mockResolvedValue({
      task: { status: TaskStatus.PROCESSING },
    });

    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples, pollInterval: 100 }),
    );
    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    const abort = result.current.taskState.abortController!;

    act(() => {
      result.current.setExampleResult({
        task: { status: TaskStatus.SUCCEED },
        images: [{ image_url: "https://cdn.example.test/manual.png" }],
      });
    });
    expect(abort.signal.aborted).toBe(true);
    expect(result.current.taskState.status).toBe("idle");
    expect(result.current.taskState.result?.images).toEqual([
      { image_url: "https://cdn.example.test/manual.png" },
    ]);
  });
});
