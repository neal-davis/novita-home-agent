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
      task: {
        status: TaskStatus.SUCCEED,
        progress_percent: 100,
      },
      images: [{ image_url: "https://cdn.example.test/example.png" }],
    },
  },
];

describe("useTaskExecution", () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockCreateAsyncTask.mockReset();
    mockCreateSyncTask.mockReset();
    mockGetTaskResult.mockReset();
  });

  it("executes sync tasks and stores the returned result", async () => {
    const syncResult = {
      task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
      images: [{ image_url: "https://cdn.example.test/result.png" }],
    };
    mockCreateSyncTask.mockResolvedValueOnce(syncResult);

    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/sync", examples }),
    );

    await act(async () => {
      await result.current.executeTask({ prompt: "hello" }, false);
    });

    expect(mockCreateSyncTask).toHaveBeenCalledWith(
      "/v1/sync",
      { prompt: "hello" },
      { abortSignal: expect.any(AbortSignal) },
    );
    expect(result.current.taskState).toMatchObject({
      status: "success",
      taskId: null,
      result: syncResult,
      error: null,
    });
  });

  it("stores sync task errors and trace ids", async () => {
    mockCreateSyncTask.mockRejectedValueOnce({
      errInfo: "Bad request",
      metadata: { trace_id: "trace-1" },
    });

    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/sync", examples }),
    );

    await act(async () => {
      await result.current.executeTask({ prompt: "bad" }, false);
    });

    expect(result.current.taskState).toMatchObject({
      status: "error",
      error: "Bad request",
      traceId: "trace-1",
    });
  });

  it("executes async tasks and stores successful poll results", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-1" });
    mockGetTaskResult.mockResolvedValueOnce({
      task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
      videos: [{ video_url: "https://cdn.example.test/result.mp4" }],
    });

    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples }),
    );

    await act(async () => {
      await result.current.executeTask({ prompt: "hello" }, true);
    });

    await waitFor(() =>
      expect(result.current.taskState.status).toBe("success"),
    );
    expect(mockCreateAsyncTask).toHaveBeenCalledWith(
      "/v1/async",
      { prompt: "hello" },
      { abortSignal: expect.any(AbortSignal) },
    );
    expect(mockGetTaskResult).toHaveBeenCalledWith("task-1");
    expect(result.current.taskState.result?.videos).toEqual([
      { video_url: "https://cdn.example.test/result.mp4" },
    ]);
  });

  it("reports an error when async task creation does not return a task id", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({});

    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples }),
    );

    await act(async () => {
      await result.current.executeTask({ prompt: "hello" }, true);
    });

    expect(result.current.taskState).toMatchObject({
      status: "error",
      error: "No task_id returned from API",
    });
  });

  it("continues polling queued tasks and stops at success", async () => {
    jest.useFakeTimers();
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-1" });
    mockGetTaskResult
      .mockResolvedValueOnce({
        task: { status: TaskStatus.PROCESSING, progress_percent: 50 },
      })
      .mockResolvedValueOnce({
        task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
        audios: [{ audio_url: "https://cdn.example.test/result.mp3" }],
      });

    const { result } = renderHook(() =>
      useTaskExecution({
        endpoint: "/v1/async",
        examples,
        pollInterval: 100,
      }),
    );

    await act(async () => {
      await result.current.executeTask({ prompt: "hello" }, true);
    });

    expect(result.current.taskState.status).toBe("polling");

    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(result.current.taskState.status).toBe("success"),
    );
    expect(result.current.taskState.result?.audios).toEqual([
      { audio_url: "https://cdn.example.test/result.mp3" },
    ]);
    jest.useRealTimers();
  });

  it("sets example results and resets task state", () => {
    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/sync", examples }),
    );

    act(() => {
      result.current.setExampleResult({
        task: { status: TaskStatus.SUCCEED, progress_percent: 100 },
        images: [{ image_url: "https://cdn.example.test/manual.png" }],
      });
    });
    expect(result.current.taskState.result?.images).toEqual([
      { image_url: "https://cdn.example.test/manual.png" },
    ]);

    act(() => {
      result.current.resetTask();
    });
    expect(result.current.taskState).toMatchObject({
      status: "idle",
      taskId: null,
      result: null,
      error: null,
    });
  });

  it("loads the first example result when the endpoint changes", async () => {
    const { result, rerender } = renderHook(
      ({ endpoint, hookExamples }) =>
        useTaskExecution({ endpoint, examples: hookExamples }),
      {
        initialProps: {
          endpoint: "/v1/old",
          hookExamples: [] as typeof examples,
        },
      },
    );

    rerender({ endpoint: "/v1/new", hookExamples: examples });

    await waitFor(() =>
      expect(result.current.taskState.result).toEqual(examples[0].response),
    );
  });

  it("resets to idle when a sync task is aborted", async () => {
    mockCreateSyncTask.mockRejectedValueOnce({ name: "AbortError" });
    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/sync", examples }),
    );
    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, false);
    });
    expect(result.current.taskState.status).toBe("idle");
    expect(result.current.taskState.error).toBeNull();
  });

  it("resets to idle when an async task is aborted", async () => {
    mockCreateAsyncTask.mockRejectedValueOnce({
      message: "the operation was abort",
    });
    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples }),
    );
    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    expect(result.current.taskState.status).toBe("idle");
  });

  it("reports an error when a polled task fails", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-x" });
    mockGetTaskResult.mockResolvedValueOnce({
      task: { status: TaskStatus.FAILED, reason: "render failed" },
    });
    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples }),
    );
    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    await waitFor(() => expect(result.current.taskState.status).toBe("error"));
    expect(result.current.taskState.error).toBe("render failed");
  });

  it("errors out when max polling attempts are exceeded", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-x" });
    mockGetTaskResult.mockResolvedValue({
      task: { status: TaskStatus.PROCESSING },
    });
    const { result } = renderHook(() =>
      useTaskExecution({
        endpoint: "/v1/async",
        examples,
        maxPollAttempts: 0,
      }),
    );
    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    await waitFor(() => expect(result.current.taskState.status).toBe("error"));
    expect(result.current.taskState.error).toContain("Task timeout");
  });

  it("cancels an in-flight task back to idle", async () => {
    mockCreateAsyncTask.mockResolvedValueOnce({ task_id: "task-x" });
    mockGetTaskResult.mockResolvedValue({
      task: { status: TaskStatus.PROCESSING },
    });
    const { result } = renderHook(() =>
      useTaskExecution({ endpoint: "/v1/async", examples }),
    );
    await act(async () => {
      await result.current.executeTask({ prompt: "x" }, true);
    });
    act(() => {
      result.current.cancelTask();
    });
    expect(result.current.taskState.status).toBe("idle");
  });
});
