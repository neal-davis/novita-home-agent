jest.mock("@/api/api", () => ({
  BASE_API_URL: "https://api.example.test",
  request: jest.fn(),
  requestInServerEnv: jest.fn(),
  service_base_url: "https://service.example.test",
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

import {
  TEST_API_BASE_URL,
  TEST_SANDBOX_DEV_BASE_URL,
  TEST_SANDBOX_PROD_BASE_URL,
  TEST_SERVICE_BASE_URL,
  loadWithEnv,
} from "../helpers/env";
import Cookies from "js-cookie";
import { request, requestInServerEnv } from "@/api/api";
import {
  MODEL_API_USAGE_KEY_SORT_FIELD,
  MODEL_API_USAGE_MODEL_SORT_FIELD,
  MODEL_API_USAGE_SCOPE_TYPE,
  MODEL_API_USAGE_SORT_DIRECTION,
  MODEL_API_USAGE_TIME_PRESET,
  getModelAPIUsageCostTrend,
  getModelAPIUsageKeyRanks,
  getModelAPIUsageModelRanks,
  getModelAPIUsageScopes,
  getModelAPIUsageSummary,
} from "@/api/model-api-usage";
import {
  createAsyncTask,
  createSyncTask,
  getTaskResult,
} from "@/api/multimodal-playground";
import {
  deleteMessage,
  getMessageDetail,
  getMessageList,
  getUnreadCount,
  markAllMessagesAsRead,
  markMessageAsRead,
} from "@/api/message";
import {
  getRolePermissions,
  getRolePermissionsInServerEnv,
} from "@/api/permission";
import {
  reqGetSandboxQuotaList,
  reqOfficialTemplateList,
  reqSandboxList,
  reqSandboxMetrics,
  reqSandboxPrice,
  reqSandboxRunningCount,
  reqSandboxStats,
  reqSandboxStoragePrice,
  reqSandboxStorageRealTime,
  reqSandboxStorageStats,
  reqSandboxTemplateList,
  reqSandboxUsage,
} from "@/api/sandbox";

const mockRequest = request as jest.Mock;
const mockRequestInServerEnv = requestInServerEnv as jest.Mock;
const mockCookieGet = Cookies.get as jest.Mock;
const expectedSandboxBaseUrl =
  (process.env.NEXT_PUBLIC_BASE_URL || "").indexOf("dev") <= -1
    ? TEST_SANDBOX_PROD_BASE_URL
    : TEST_SANDBOX_DEV_BASE_URL;

async function loadSandboxApiWithEnv(nextPublicBaseUrl?: string) {
  return loadWithEnv({ NEXT_PUBLIC_BASE_URL: nextPublicBaseUrl }, async () => {
    const requestMock = jest.fn();

    jest.doMock("@/api/api", () => ({
      request: requestMock,
      service_base_url: TEST_SERVICE_BASE_URL,
    }));

    const sandboxApi = await import("@/api/sandbox");

    return { requestMock, sandboxApi };
  });
}

describe("model API usage wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({});
  });

  it("exports stable numeric query constants", () => {
    expect(MODEL_API_USAGE_SCOPE_TYPE).toEqual({ key: 3, member: 2, team: 1 });
    expect(MODEL_API_USAGE_TIME_PRESET).toEqual({
      "30d": 3,
      "7d": 2,
      "90d": 4,
      custom: 5,
      today: 1,
    });
    expect(MODEL_API_USAGE_SORT_DIRECTION).toEqual({ asc: 1, desc: 2 });
    expect(MODEL_API_USAGE_MODEL_SORT_FIELD).toEqual({
      cacheTokens: 4,
      cost: 1,
      inputTokens: 3,
      outputTokens: 5,
      requests: 2,
    });
    expect(MODEL_API_USAGE_KEY_SORT_FIELD).toEqual({
      cost: 1,
      requests: 2,
      totalTokens: 6,
    });
  });

  it("builds usage requests with query and abort signal", () => {
    const signal = new AbortController().signal;
    const query = {
      "scope.scopeType": MODEL_API_USAGE_SCOPE_TYPE.key,
      "time.timePreset": MODEL_API_USAGE_TIME_PRESET["7d"],
    };
    const sortQuery = {
      ...query,
      "sort.direction": MODEL_API_USAGE_SORT_DIRECTION.desc,
      "sort.field": MODEL_API_USAGE_MODEL_SORT_FIELD.cost,
    };

    getModelAPIUsageScopes(signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      signal,
      url: "/v1/billing/model-api/usage/scopes",
    });

    getModelAPIUsageSummary(query, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query,
      signal,
      url: "/v1/billing/model-api/usage/summary",
    });

    getModelAPIUsageCostTrend(query, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query,
      signal,
      url: "/v1/billing/model-api/usage/cost-trend",
    });

    getModelAPIUsageModelRanks(sortQuery, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query: sortQuery,
      signal,
      url: "/v1/billing/model-api/usage/model-ranks",
    });

    getModelAPIUsageKeyRanks(
      {
        ...query,
        "sort.field": MODEL_API_USAGE_KEY_SORT_FIELD.totalTokens,
      },
      signal,
    );
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query: {
        ...query,
        "sort.field": MODEL_API_USAGE_KEY_SORT_FIELD.totalTokens,
      },
      signal,
      url: "/v1/billing/model-api/usage/key-ranks",
    });
  });
});

describe("multimodal playground API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieGet.mockReturnValue("token-1");
  });

  it("builds authenticated async, sync and task result requests", () => {
    const signal = new AbortController().signal;

    createAsyncTask(
      "/v3/async/model",
      { prompt: "hello" },
      { abortSignal: signal },
    );
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: TEST_API_BASE_URL,
      data: { prompt: "hello" },
      headers: { Authorization: "Bearer session_token-1" },
      method: "POST",
      signal,
      url: "/v3/async/model",
    });

    createSyncTask(
      "/v3/sync/model",
      { prompt: "hello" },
      { abortSignal: signal },
    );
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: TEST_API_BASE_URL,
      data: { prompt: "hello" },
      headers: { Authorization: "Bearer session_token-1" },
      method: "POST",
      responseType: "auto",
      signal,
      url: "/v3/sync/model",
    });

    getTaskResult("task-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: TEST_API_BASE_URL,
      headers: { Authorization: "Bearer session_token-1" },
      method: "GET",
      url: "/v3/async/task-result?task_id=task-1",
    });
  });
});

describe("message API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("serializes message list query params and passes signals", () => {
    const signal = new AbortController().signal;

    getMessageList({ pageIndex: 2, pageSize: 20, readStatus: false, signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query: {
        pageIndex: "2",
        pageSize: "20",
        readStatus: "false",
      },
      signal,
      url: "/v1/message/inbox/list",
    });

    getMessageList({});
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query: {},
      signal: undefined,
      url: "/v1/message/inbox/list",
    });
  });

  it("builds unread, detail, read and delete requests", () => {
    const signal = new AbortController().signal;

    getUnreadCount({ signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      signal,
      url: "/v1/message/inbox/unread-count",
    });

    getMessageDetail({ id: 10, signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "GET",
      query: { id: "10" },
      signal,
      url: "/v1/message/inbox",
    });

    markMessageAsRead({ id: 11, signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "PUT",
      query: { id: "11" },
      signal,
      url: "/v1/message/inbox/read",
    });

    markAllMessagesAsRead({ signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "PUT",
      signal,
      url: "/v1/message/inbox/read-all",
    });

    deleteMessage({ id: 12, signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      method: "DELETE",
      query: { id: "12" },
      signal,
      url: "/v1/message/inbox",
    });
  });
});

describe("permission API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("builds client and server permission requests", () => {
    getRolePermissions();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/user/team/role-permissions",
    });

    getRolePermissionsInServerEnv({ token: "server-token" });
    expect(mockRequestInServerEnv).toHaveBeenLastCalledWith({
      token: "server-token",
      url: "/v1/user/team/role-permissions",
    });
  });
});

describe("sandbox API wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    [
      "price",
      reqSandboxPrice,
      "/v1/product/agent-sandbox/price",
      "GET",
      "query",
    ],
    [
      "storage price",
      reqSandboxStoragePrice,
      "/v1/product/batch-price",
      "POST",
      "data",
    ],
    [
      "running count",
      reqSandboxRunningCount,
      "/v1/billing/sandbox/running-count",
      "GET",
      "query",
    ],
    ["stats", reqSandboxStats, "/v1/billing/sandbox/stats", "GET", "query"],
    ["usage", reqSandboxUsage, "/v1/billing/sandbox/usage", "GET", "query"],
    [
      "storage stats",
      reqSandboxStorageStats,
      "/v1/billing/sandbox/storage/stats",
      "GET",
      "query",
    ],
    ["metrics", reqSandboxMetrics, "/v1/metrics/sandbox", "GET", "query"],
  ])(
    "builds service sandbox request for %s",
    (_label, fn, url, method, payloadKey) => {
      fn({ from: "2024-01-01" });

      expect(mockRequest).toHaveBeenLastCalledWith({
        base_url: TEST_SERVICE_BASE_URL,
        method,
        [payloadKey as string]: { from: "2024-01-01" },
        url,
      });
    },
  );

  it("builds storage real-time request with an empty query", () => {
    reqSandboxStorageRealTime();

    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: TEST_SERVICE_BASE_URL,
      method: "GET",
      query: {},
      url: "/v1/billing/sandbox/storage/real-time",
    });
  });

  it.each([
    ["sandbox list", reqSandboxList, "/v1/sandboxes"],
    ["template list", reqSandboxTemplateList, "/v1/templates"],
    [
      "official template list",
      reqOfficialTemplateList,
      "/v1/templates/official",
    ],
    ["quota list", reqGetSandboxQuotaList, "/v1/sandbox/user/tier"],
  ])("builds sandbox service request for %s", (_label, fn, url) => {
    fn({ page: 1 });

    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: expectedSandboxBaseUrl,
      method: "GET",
      query: { page: 1 },
      url,
    });
  });

  it.each([
    [
      "dev service host",
      "https://dev-api-server.novita.ai",
      TEST_SANDBOX_DEV_BASE_URL,
    ],
    [
      "prod service host",
      "https://api-server.novita.ai",
      TEST_SANDBOX_PROD_BASE_URL,
    ],
    ["empty service host", undefined, TEST_SANDBOX_PROD_BASE_URL],
  ])(
    "resolves sandbox base URL from %s at module load",
    async (_label, nextPublicBaseUrl, expectedBaseUrl) => {
      const { requestMock, sandboxApi } =
        await loadSandboxApiWithEnv(nextPublicBaseUrl);

      sandboxApi.reqSandboxList({ page: 1 });

      expect(requestMock).toHaveBeenLastCalledWith({
        base_url: expectedBaseUrl,
        method: "GET",
        query: { page: 1 },
        url: "/v1/sandboxes",
      });
    },
  );
});
