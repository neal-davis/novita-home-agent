import { useState, useCallback, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import {
  createAsyncTask,
  createSyncTask,
  getTaskResult,
} from "@/api/multimodal-playground";
import {
  TaskStatus,
  TaskResultResponse,
  MultimodalTaskResult,
} from "@/types/multimodal-playground";

export interface TaskState {
  status: "idle" | "creating" | "polling" | "success" | "error";
  taskId: string | null;
  result: MultimodalTaskResult | null;
  error: string | null;
  traceId?: string;
  abortController: AbortController | null;
}

interface UseTaskExecutionOptions {
  endpoint: string;
  examples: {
    request: Record<string, any>;
    response: Record<string, any>;
  }[];
  method?: string;
  maxPollAttempts?: number;
  pollInterval?: number;
}

/**
 * Hook for executing API tasks and polling for results
 */
export function useTaskExecution({
  endpoint,
  examples,
  method = "POST",
  maxPollAttempts = 450, // 15 minutes with 1s interval
  pollInterval = 2000,
}: UseTaskExecutionOptions) {
  const [taskState, setTaskState] = useState<TaskState>({
    status: "idle",
    taskId: null,
    result: null,
    error: null,
    abortController: null,
  });

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);
  const prevEndpointRef = useRef<string>(endpoint);
  const prevExamplesRef = useRef(examples);

  // Reset when endpoint changes (model switch) and update examples display
  useEffect(() => {
    const endpointChanged = prevEndpointRef.current !== endpoint;
    const examplesChanged = prevExamplesRef.current !== examples;

    if (endpointChanged) {
      prevEndpointRef.current = endpoint;
      prevExamplesRef.current = examples;

      // Clear any ongoing tasks
      if (taskState.abortController) {
        taskState.abortController.abort();
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }

      // Reset to idle state with new model's first example (if available)
      const initialResult =
        examples.length > 0
          ? (examples[0].response as TaskResultResponse)
          : null;

      setTaskState({
        status: "idle",
        taskId: null,
        result: initialResult,
        error: null,
        abortController: null,
      });
    } else if (examplesChanged) {
      // Examples changed but endpoint didn't (shouldn't happen normally, but handle it)
      prevExamplesRef.current = examples;

      // Only update if we're in idle state with no result
      if (
        taskState.status === "idle" &&
        !taskState.result &&
        examples.length > 0
      ) {
        setTaskState((prev) => ({
          ...prev,
          result: examples[0].response as TaskResultResponse,
        }));
      }
    }
  }, [
    endpoint,
    examples,
    taskState.abortController,
    taskState.status,
    taskState.result,
  ]);

  /**
   * Execute a synchronous task
   */
  const executeSyncTask = useCallback(
    async (params: Record<string, any>) => {
      const abortController = new AbortController();
      try {
        setTaskState({
          status: "creating",
          taskId: null,
          result: null,
          error: null,
          abortController,
        });

        const result = await createSyncTask(endpoint, params, {
          abortSignal: abortController.signal,
        });
        setTaskState({
          status: "success",
          taskId: null,
          result,
          error: null,
          abortController: null,
        });
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.message?.includes("abort")) {
          setTaskState({
            status: "idle",
            taskId: null,
            result: null,
            error: null,
            abortController: null,
          });
        } else {
          setTaskState({
            status: "error",
            traceId: err?.metadata?.trace_id,
            taskId: null,
            result: null,
            error: err?.errInfo || err?.message || "Unknown error",
            abortController: null,
          });
        }
      }
    },
    [endpoint],
  );

  /**
   * Poll for async task result
   */
  const pollTaskResult = useCallback(
    async (taskId: string) => {
      try {
        pollAttemptsRef.current += 1;

        // Check if max attempts reached
        if (pollAttemptsRef.current > maxPollAttempts) {
          throw new Error("Task timeout: exceeded maximum polling attempts");
        }

        const tokenString =
          typeof window !== "undefined" ? Cookies.get("token") : "";
        const { task, images, audios, videos } = await getTaskResult(taskId);

        // Check task status
        if (task.status === TaskStatus.SUCCEED) {
          setTaskState({
            status: "success",
            taskId,
            result: { task, images, audios, videos },
            error: null,
            abortController: null,
          });
        } else if (task.status === TaskStatus.FAILED) {
          throw new Error(task.reason || "Task failed");
        } else {
          // Task still processing, continue polling
          pollTimeoutRef.current = setTimeout(() => {
            pollTaskResult(taskId);
          }, pollInterval);
        }
      } catch (err: any) {
        setTaskState({
          status: "error",
          traceId: err?.metadata?.trace_id,
          taskId,
          result: null,
          error: err.message || "Unknown error",
          abortController: null,
        });
      }
    },
    [maxPollAttempts, pollInterval],
  );

  /**
   * Execute an asynchronous task
   */
  const executeAsyncTask = useCallback(
    async (params: Record<string, any>) => {
      const abortController = new AbortController();
      try {
        setTaskState({
          status: "creating",
          taskId: null,
          result: null,
          error: null,
          abortController,
        });

        // Submit task
        const result = await createAsyncTask(endpoint, params, {
          abortSignal: abortController.signal,
        });

        const taskId = result.task_id;

        if (!taskId) {
          throw new Error("No task_id returned from API");
        }

        setTaskState({
          status: "polling",
          taskId,
          result: null,
          error: null,
          abortController,
        });

        // Reset poll attempts and start polling
        pollAttemptsRef.current = 0;
        pollTaskResult(taskId);
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.message?.includes("abort")) {
          setTaskState({
            status: "idle",
            taskId: null,
            result: null,
            error: null,
            abortController: null,
          });
        } else {
          setTaskState({
            status: "error",
            taskId: null,
            result: null,
            error: err?.errInfo || err?.message || "Unknown error",
            traceId: err?.metadata?.trace_id,
            abortController: null,
          });
        }
      }
    },
    [endpoint, pollTaskResult],
  );

  /**
   * Execute task (sync or async based on config)
   */
  const executeTask = useCallback(
    async (params: Record<string, any>, isAsyncTask: boolean) => {
      // Clear any existing poll timeout
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }

      if (isAsyncTask) {
        await executeAsyncTask(params);
      } else {
        await executeSyncTask(params);
      }
    },
    [executeAsyncTask, executeSyncTask],
  );

  /**
   * Cancel current task
   */
  const cancelTask = useCallback(() => {
    if (taskState.abortController) {
      taskState.abortController.abort();
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setTaskState({
      status: "idle",
      taskId: null,
      result: null,
      error: null,
      abortController: null,
    });
  }, [taskState.abortController]);

  /**
   * Reset task state
   */
  const resetTask = useCallback(() => {
    if (taskState.abortController) {
      taskState.abortController.abort();
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }

    setTaskState({
      status: "idle",
      taskId: null,
      result: null,
      error: null,
      abortController: null,
    });
  }, [taskState.abortController]);

  /**
   * Set example result (for displaying example without executing)
   */
  const setExampleResult = useCallback(
    (response: Record<string, any>) => {
      if (taskState.abortController) {
        taskState.abortController.abort();
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }

      setTaskState({
        status: "idle",
        taskId: null,
        result: response as TaskResultResponse,
        error: null,
        abortController: null,
      });
    },
    [taskState.abortController],
  );

  return {
    taskState,
    executeTask,
    resetTask,
    cancelTask,
    setExampleResult,
  };
}
