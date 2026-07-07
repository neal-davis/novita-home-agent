import { request, BASE_API_URL } from "./api";
import {
  TaskResultResponse,
  MultimodalTaskResult,
} from "@/types/multimodal-playground";
import Cookies from "js-cookie";

export function createAsyncTask(
  endpoint: string,
  params: Record<string, any>,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): Promise<{ task_id: string }> {
  const token = typeof window !== "undefined" ? Cookies.get("token") : "";
  return request({
    base_url: BASE_API_URL,
    url: endpoint,
    method: "POST",
    data: params,
    headers: {
      Authorization: "Bearer " + `session_${token}`,
    },
    signal: opts?.abortSignal,
  });
}

export function createSyncTask(
  endpoint: string,
  params: Record<string, any>,
  opts?: {
    abortSignal?: AbortSignal;
  },
): Promise<MultimodalTaskResult> {
  const token = typeof window !== "undefined" ? Cookies.get("token") : "";
  return request({
    base_url: BASE_API_URL,
    url: endpoint,
    method: "POST",
    data: params,
    headers: {
      Authorization: "Bearer " + `session_${token}`,
    },
    signal: opts?.abortSignal,
    responseType: "auto",
  });
}

export function getTaskResult(task_id: string): Promise<TaskResultResponse> {
  const token = typeof window !== "undefined" ? Cookies.get("token") : "";
  return request({
    base_url: BASE_API_URL,
    url: `/v3/async/task-result?task_id=${task_id}`,
    method: "GET",
    headers: {
      Authorization: "Bearer " + `session_${token}`,
    },
  });
}
