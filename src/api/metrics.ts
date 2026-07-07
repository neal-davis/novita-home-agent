import { request } from "./api";

export function getLLMMetrics(params: {
  metricsType: string;
  model?: string;
  startTime: number;
  endTime: number;
  signal?: AbortSignal;
}) {
  if (!params.model) {
    return Promise.resolve([]);
  }
  // let user = localStorage.getItem("_dev_track_user");
  // if (process.env.NODE_ENV === "development" && !user) {
  //   user = "3ace30c5-f68a-4264-a863-d79970119553";
  // }
  return request({
    url: "/v1/metrics/llm",
    query: {
      metricsType: params.metricsType,
      model: params.model,
      startTime: params.startTime,
      endTime: params.endTime,
      // user: user || "",
    },
    signal: params.signal,
  });
}

export function getLLMMetricsModels(params: {
  startTime: number;
  endTime: number;
  signal?: AbortSignal;
}) {
  // let user = localStorage.getItem("_dev_track_user");
  // if (process.env.NODE_ENV === "development" && !user) {
  //   user = "3ace30c5-f68a-4264-a863-d79970119553";
  // }
  return request({
    url: "/v1/metrics/models",
    query: {
      startTime: params.startTime,
      endTime: params.endTime,
      // user: user || "",
    },
    signal: params.signal,
  });
}
