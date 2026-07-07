// eslint-disable-next-line no-var
var mockNovitaClient: any;
// eslint-disable-next-line no-var
var mockNovitaClientV3: any;

jest.mock("novita-sdk", () => ({
  APIErrReasonV3: {
    ANONYMOUS_ACCESS_QUOTA_EXCEEDS: "ANONYMOUS_ACCESS_QUOTA_EXCEEDS",
    BALANCE_NOT_ENOUGH: "BALANCE_NOT_ENOUGH",
  },
  NovitaError: class NovitaError extends Error {},
  NovitaSDK: jest.fn().mockImplementation(() => {
    mockNovitaClient = {
      img2img: jest.fn(),
      img2ImgV3: jest.fn(),
      img2Video: jest.fn(),
      img2VideoMotion: jest.fn(),
      inpainting: jest.fn(),
      cleanup: jest.fn(),
      mergeFace: jest.fn(),
      outpainting: jest.fn(),
      progress: jest.fn(),
      progressV3: jest.fn(),
      reimagine: jest.fn(),
      removeBackground: jest.fn(),
      removeText: jest.fn(),
      replaceBackground: jest.fn(),
      restoreFace: jest.fn(),
      setBaseUrl: jest.fn(),
      setNovitaKey: jest.fn(),
      txt2Video: jest.fn(),
      txt2Img: jest.fn(),
      txt2ImgV3: jest.fn(),
      upload: jest.fn(),
    };
    return mockNovitaClient;
  }),
  ResponseCodeV2: {
    COST_BALANCE_FAILURE: 1,
    HOST_UNAVAILABLE: 2,
    INTERNAL_ERROR: 7,
    INVALID_AUTH: 3,
    OK: 0,
    PARAM_RANGE_OUT_OF_LIMIT: 4,
    SAMPLER_NOT_EXIST: 5,
    TIMEOUT: 6,
  },
  ResponseCodeV3: {
    CANCELED: 100,
    NETWORK: 101,
    REQUEST_INVALID: 102,
    TOO_MANY_REQ: 103,
  },
  TaskStatus: {
    FAILED: "FAILED",
    PROCESSING: "PROCESSING",
    QUEUED: "QUEUED",
    SUCCEED: "SUCCEED",
  },
}));

jest.mock("novita-sdk-v3", () => ({
  NovitaSDK: jest.fn().mockImplementation(() => {
    if (!mockNovitaClientV3) {
      mockNovitaClientV3 = {
        hunyuanVideoFast: jest.fn(),
        setBaseUrl: jest.fn(),
        setNovitaKey: jest.fn(),
        wanT2v: jest.fn(),
      };
    }
    return mockNovitaClientV3;
  }),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
  },
}));

jest.mock("@/lib/utils/dealError", () => ({
  dealErrorText: jest.fn((text: string, metadata?: string[]) =>
    metadata?.length ? `${text}: ${metadata.join(",")}` : text,
  ),
}));

jest.mock("@/store", () => ({
  reduxStore: {
    store: {
      dispatch: jest.fn(),
    },
  },
}));

jest.mock("@/store/slice/userSlice", () => ({
  logout: jest.fn(() => ({ type: "user/logout" })),
}));

jest.mock("@/constants/urls", () => ({
  LOGIN_REQUIRED_URL: [],
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: jest.fn(
    (path: string, locale: string) => `/${locale}${path}`,
  ),
  getPathnameLocale: jest.fn(() => ({ locale: "en" })),
  getPathnameWithoutLocale: jest.fn((path: string) =>
    path.replace(/^\/[a-z]{2}(?=\/)/, ""),
  ),
}));

jest.mock("@/constants/constants", () => ({
  PERMISSION_ERR_CODE: ["PERMISSION_DENIED"],
}));

jest.mock("@/lib/utils/reporter", () => ({
  reportError: jest.fn(),
}));

import Cookies from "js-cookie";
import { message } from "@/components/ui/standard/notify";
import { reduxStore } from "@/store";
import { logout } from "@/store/slice/userSlice";
import { reportError } from "@/lib/utils/reporter";
import {
  apiProgress,
  getFailMsg,
  getFailMsgV3,
  imageToImageWithProgress,
  imageToImageWithProgressV3,
  imageToVideoWithProgress,
  imageToVideoMotion,
  inpaintingWithProgress,
  cleanup,
  checkProgressV3,
  hunyuanVideoFast,
  klingV16I2v,
  klingV16T2v,
  mergeFace,
  minimaxHailuo02,
  minimaxVideo01,
  outpainting,
  reimagine,
  removeBackground,
  removeText,
  replaceBackground,
  request,
  requestInServerEnv,
  requestText,
  restoreFace,
  textToImageWithProgress,
  textToImageWithProgressV3,
  textToVideo,
  txt2SpeechFetch,
  upload,
  uploadModel,
  wan26I2v,
  wan26T2v,
  wan26V2v,
  wanI2v,
  wanT2v,
} from "@/api/api";

const mockCookieGet = Cookies.get as jest.Mock;
const mockFetch = global.fetch as jest.Mock;
const mockMessageError = message.error as jest.Mock;
const mockDispatch = reduxStore.store.dispatch as jest.Mock;
const mockLogout = logout as unknown as jest.Mock;
const mockReportError = reportError as jest.Mock;

const flushPromises = async () => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
};

function jsonResponse(body: unknown, status = 200) {
  return {
    json: jest.fn().mockResolvedValue(body),
    status,
  };
}

function textResponse(body: string, status = 200) {
  return {
    status,
    text: jest.fn().mockResolvedValue(body),
  };
}

describe("api request core", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    mockCookieGet.mockReturnValue("cookie-token");
    mockFetch.mockResolvedValue(jsonResponse({ code: 0, data: { ok: true } }));
  });

  it("builds JSON requests with query, body, cookie token and custom headers", async () => {
    const signal = new AbortController().signal;

    await expect(
      request({
        base_url: "https://service.example.test",
        data: { name: "instance" },
        headers: { "X-Trace": "trace-1" },
        method: "POST",
        query: { page: 2, q: "gpu" },
        signal,
        url: "/v1/items",
      }),
    ).resolves.toEqual({ code: 0, data: { ok: true } });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://service.example.test/v1/items?page=2&q=gpu",
      expect.objectContaining({
        body: JSON.stringify({ name: "instance" }),
        cache: "no-cache",
        method: "POST",
        mode: "cors",
        signal,
        headers: expect.objectContaining({
          Authorization: "Bearer cookie-token",
          "Content-Type": "application/json",
          "X-Trace": "trace-1",
        }),
      }),
    );
  });

  it("uses explicit token and leaves GET body empty", async () => {
    await request({
      base_url: "https://service.example.test",
      token: "Bearer explicit-token",
      url: "/v1/profile",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://service.example.test/v1/profile",
      expect.objectContaining({
        body: undefined,
        headers: expect.objectContaining({
          Authorization: "Bearer explicit-token",
        }),
        method: "GET",
      }),
    );
  });

  it("dispatches logout and rejects on 401 responses", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 401 }));

    await expect(
      request({
        base_url: "https://service.example.test",
        url: "/v1/profile",
      }),
    ).rejects.toBe("401");

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "user/logout" });
  });

  it("reports unexpected 403 errors and shows resolved error text", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        code: 403,
        metadata: ["gpu"],
        reason: "CREATE_GPU_NUM_LIMIT",
      }),
    );

    await expect(
      request({
        base_url: "https://service.example.test",
        url: "/v1/create",
      }),
    ).rejects.toMatchObject({
      code: 403,
      reason: "CREATE_GPU_NUM_LIMIT",
    });

    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        errorNo: "Unknow 403 code CREATE_GPU_NUM_LIMIT",
        type: "request",
      }),
    );
    expect(mockMessageError).not.toHaveBeenCalled();
  });

  it("shows toast errors for regular failed responses", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        code: 400,
        message: "Backend message",
        reason: "UNKNOWN_REASON",
      }),
    );

    await expect(
      request({
        base_url: "https://service.example.test",
        url: "/v1/fail",
      }),
    ).rejects.toMatchObject({
      code: 400,
      errInfo: "Backend message",
    });

    expect(mockMessageError).toHaveBeenCalledWith("Backend message");
  });

  it("returns structured special errors when ignoreMsg is enabled", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        code: 409,
        reason: "DE_BALANCE_NOT_ENOUGH",
      }),
    );

    await expect(
      request({
        base_url: "https://service.example.test",
        ignoreMsg: true,
        url: "/v1/pay",
      }),
    ).rejects.toMatchObject({
      code: 409,
      errInfo: expect.stringContaining("insufficient"),
      reason: "DE_BALANCE_NOT_ENOUGH",
    });
    expect(mockMessageError).not.toHaveBeenCalled();
  });

  it("rejects the response message for ignored regular errors", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        code: 409,
        message: "Conflict message",
        reason: "CONFLICT",
      }),
    );

    await expect(
      request({
        base_url: "https://service.example.test",
        ignoreMsg: true,
        url: "/v1/conflict",
      }),
    ).rejects.toBe("Conflict message");
  });

  it("rejects locked users directly and suppresses permission toast noise", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        code: 423,
        message: "Locked",
        reason: "USER_IS_LOCKED",
      }),
    );

    await expect(
      request({
        base_url: "https://service.example.test",
        url: "/v1/locked",
      }),
    ).rejects.toEqual({
      code: 423,
      message: "Locked",
      reason: "USER_IS_LOCKED",
    });
    expect(mockMessageError).not.toHaveBeenCalled();

    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        code: 403,
        message: "No permission",
        reason: "PERMISSION_DENIED",
      }),
    );

    await expect(
      request({
        base_url: "https://service.example.test",
        url: "/v1/team",
      }),
    ).rejects.toMatchObject({
      errInfo: "Permission denied",
      reason: "PERMISSION_DENIED",
    });
    expect(mockReportError).not.toHaveBeenCalled();
    expect(mockMessageError).toHaveBeenCalledWith("Permission denied");
  });

  it("maps 404 fetch statuses into the default API error shape", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(
      request({
        base_url: "https://service.example.test",
        url: "/missing",
      }),
    ).rejects.toMatchObject({
      code: 404,
      errInfo: "Unknown error",
      reason: "UNKNOWN_ERROR",
    });
  });

  it("returns raw text responses from requestText", async () => {
    mockFetch.mockResolvedValueOnce(textResponse("plain response"));

    await expect(
      requestText({
        base_url: "https://service.example.test",
        query: { id: "job-1" },
        url: "/v1/logs",
      }),
    ).resolves.toBe("plain response");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://service.example.test/v1/logs?id=job-1",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("builds POST requestText calls and resolves 404 statuses as API error objects", async () => {
    mockFetch.mockResolvedValueOnce(textResponse("created"));

    await expect(
      requestText({
        base_url: "https://service.example.test",
        data: { query: "logs" },
        headers: { "X-Mode": "text" },
        method: "POST",
        token: "Bearer text-token",
        url: "/v1/logs/search",
      }),
    ).resolves.toBe("created");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://service.example.test/v1/logs/search",
      expect.objectContaining({
        body: JSON.stringify({ query: "logs" }),
        headers: expect.objectContaining({
          Authorization: "Bearer text-token",
          "X-Mode": "text",
        }),
        method: "POST",
      }),
    );

    mockFetch.mockResolvedValueOnce(textResponse("missing", 404));

    await expect(
      requestText({
        base_url: "https://service.example.test",
        url: "/missing.txt",
      }),
    ).resolves.toEqual({
      code: 404,
      reason: "UNKNOWN_ERROR",
    });
  });

  it("builds server-side requests and returns parsed JSON", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 0, data: [1] }));

    await expect(
      requestInServerEnv({
        base_url: "https://server.example.test",
        data: { active: true },
        headers: { "X-Server": "1" },
        method: "POST",
        query: { team: "t1" },
        token: "server-token",
        url: "/v1/server",
      }),
    ).resolves.toEqual({ code: 0, data: [1] });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://server.example.test/v1/server?team=t1",
      expect.objectContaining({
        body: JSON.stringify({ active: true }),
        headers: expect.objectContaining({
          Authorization: "Bearer server-token",
          "X-Server": "1",
        }),
        method: "POST",
      }),
    );
  });

  it("reports and swallows server-side fetch failures", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network down"));

    await expect(
      requestInServerEnv({
        base_url: "https://server.example.test",
        token: "server-token",
        url: "/v1/server",
      }),
    ).resolves.toEqual({});

    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        errorNo:
          "requestInServerEnv-error-https://server.example.test/v1/server",
        type: "request",
      }),
    );
  });

  it("uses an empty server-side authorization header when token is absent", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, 404));

    await expect(
      requestInServerEnv({
        base_url: "https://server.example.test",
        token: "",
        url: "/missing",
      }),
    ).resolves.toEqual({
      code: 404,
      reason: "UNKNOWN_ERROR",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://server.example.test/missing",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "",
        }),
      }),
    );
  });
});

describe("api sdk progress helpers", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNovitaClientV3 = {
      hunyuanVideoFast: jest.fn(),
      setBaseUrl: jest.fn(),
      setNovitaKey: jest.fn(),
      wanT2v: jest.fn(),
    };
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("submits txt2img tasks and finishes when v2 progress succeeds", async () => {
    const onProgress = jest.fn();
    const onFinish = jest.fn();
    const onFail = jest.fn();
    const onSubmitTaskSuccess = jest.fn();

    mockNovitaClient.txt2Img.mockResolvedValueOnce({ task_id: "task-1" });
    mockNovitaClient.progress.mockResolvedValueOnce({
      imgs: ["https://img.test/final.png"],
      info: "done",
      status: 2,
    });

    textToImageWithProgress(
      "api-key",
      { prompt: "cat" } as any,
      onProgress,
      onFinish,
      onFail,
      onSubmitTaskSuccess,
      { source: "unit-test" },
    );

    await flushPromises();
    await flushPromises();

    expect(mockNovitaClient.setNovitaKey).toHaveBeenCalledWith("api-key");
    expect(mockNovitaClient.txt2Img).toHaveBeenCalledWith(
      { prompt: "cat" },
      { source: "unit-test" },
    );
    expect(onSubmitTaskSuccess).toHaveBeenCalledWith("task-1");
    expect(mockNovitaClient.progress).toHaveBeenCalledWith(
      { task_id: "task-1" },
      { source: "unit-test" },
    );
    expect(onFinish).toHaveBeenCalledWith(
      ["https://img.test/final.png"],
      "done",
    );
    expect(onProgress).not.toHaveBeenCalled();
    expect(onFail).not.toHaveBeenCalled();
  });

  it("reports txt2img submission failures without polling progress", async () => {
    const onFail = jest.fn();

    mockNovitaClient.txt2Img.mockResolvedValueOnce({});

    textToImageWithProgress(
      "api-key",
      {} as any,
      jest.fn(),
      jest.fn(),
      onFail,
      jest.fn(),
    );

    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(-1, "task failed");
    expect(mockNovitaClient.progress).not.toHaveBeenCalled();
  });

  it("maps v2 image progress images and ignores transient network failures", async () => {
    jest.useFakeTimers();
    const onProgress = jest.fn();
    const onFinish = jest.fn();
    const onFail = jest.fn();
    const syncTaskId = jest.fn();

    mockNovitaClient.img2img.mockResolvedValueOnce({ task_id: "img-task" });
    mockNovitaClient.progress
      .mockResolvedValueOnce({
        current_images: ["base64-a", ""],
        status: 1,
      })
      .mockRejectedValueOnce({
        code: 101,
        reason: "ERR_NETWORK",
      });

    imageToImageWithProgress(
      "api-key",
      { image: "input" } as any,
      onProgress,
      onFinish,
      onFail,
      syncTaskId,
    );

    await flushPromises();
    await flushPromises();

    expect(syncTaskId).toHaveBeenCalledWith("img-task");
    expect(onProgress).toHaveBeenCalledWith([
      "data:image/jpeg;base64,base64-a",
      "",
    ]);

    jest.advanceTimersByTime(1000);
    await flushPromises();
    await flushPromises();

    expect(onFail).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("continues v2 polling from initializing state and fails on terminal task errors", async () => {
    jest.useFakeTimers();
    const onProgress = jest.fn();
    const onFinish = jest.fn();
    const onFail = jest.fn();

    mockNovitaClient.txt2Img.mockResolvedValueOnce({ task_id: "task-fail" });
    mockNovitaClient.progress
      .mockResolvedValueOnce({
        status: 0,
      })
      .mockResolvedValueOnce({
        failed_reason: "bad prompt",
        status: 3,
      });

    textToImageWithProgress(
      "api-key",
      { prompt: "bad" } as any,
      onProgress,
      onFinish,
      onFail,
      jest.fn(),
    );

    await flushPromises();
    await flushPromises();

    expect(onProgress).toHaveBeenCalledWith([]);
    expect(onFail).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    await flushPromises();
    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(0, "bad prompt", 3);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("maps v2 single current image progress and rejected non-network errors", async () => {
    jest.useFakeTimers();
    const onProgress = jest.fn();
    const onFail = jest.fn();

    mockNovitaClient.img2img.mockResolvedValueOnce({ task_id: "img-task" });
    mockNovitaClient.progress
      .mockResolvedValueOnce({
        current_images: "base64-single",
        status: 1,
      })
      .mockRejectedValueOnce({
        code: 500,
        msg: "poll failed",
        reason: "POLL_FAILED",
      });

    imageToImageWithProgress(
      "api-key",
      { image: "input" } as any,
      onProgress,
      jest.fn(),
      onFail,
      jest.fn(),
    );

    await flushPromises();
    await flushPromises();

    expect(onProgress).toHaveBeenCalledWith([
      "data:image/jpeg;base64,base64-single",
    ]);

    jest.advanceTimersByTime(1000);
    await flushPromises();
    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(500, "POLL_FAILED", undefined);
  });

  it("schedules v3 txt2img polling and returns image urls with extra metadata", async () => {
    jest.useFakeTimers();
    const onFinish = jest.fn();
    const onFail = jest.fn();
    const onSubmitTaskSuccess = jest.fn();

    mockNovitaClient.txt2ImgV3.mockResolvedValueOnce({ task_id: "v3-task" });
    mockNovitaClient.progressV3.mockResolvedValueOnce({
      extra: { seed: 123 },
      images: [{ image_url: "https://img.test/v3.png" }],
      task: { status: "SUCCEED" },
    });

    textToImageWithProgressV3(
      "api-key",
      { prompt: "v3" } as any,
      jest.fn(),
      onFinish,
      onFail,
      onSubmitTaskSuccess,
    );

    await flushPromises();
    expect(onSubmitTaskSuccess).toHaveBeenCalledWith("v3-task");
    expect(mockNovitaClient.progressV3).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    await flushPromises();
    await flushPromises();

    expect(mockNovitaClient.progressV3).toHaveBeenCalledWith(
      { task_id: "v3-task" },
      undefined,
    );
    expect(onFinish).toHaveBeenCalledWith(["https://img.test/v3.png"], "", {
      seed: 123,
    });
    expect(onFail).not.toHaveBeenCalled();
  });

  it("schedules v3 img2img polling and surfaces failed task reasons", async () => {
    jest.useFakeTimers();
    const onFail = jest.fn();
    const onSubmitTaskSuccess = jest.fn();

    mockNovitaClient.img2ImgV3.mockResolvedValueOnce({ task_id: "img-v3" });
    mockNovitaClient.progressV3.mockResolvedValueOnce({
      task: { reason: "BAD_INPUT", status: "FAILED" },
    });

    imageToImageWithProgressV3(
      "api-key",
      { image: "input" } as any,
      jest.fn(),
      jest.fn(),
      onFail,
      onSubmitTaskSuccess,
    );

    await flushPromises();
    expect(onSubmitTaskSuccess).toHaveBeenCalledWith("img-v3");

    jest.advanceTimersByTime(1000);
    await flushPromises();
    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(0, "BAD_INPUT");
  });

  it("exposes v3 progress, queue, video finish and rejected error callbacks", async () => {
    const callbacks = {
      onFail: jest.fn(),
      onFinish: jest.fn(),
      onProgress: jest.fn(),
      onQueue: jest.fn(),
    };

    mockNovitaClient.progressV3.mockResolvedValueOnce({
      images: [{ image_url: "https://img.test/processing.png" }],
      task: { progress_percent: 55, status: "PROCESSING" },
    });
    checkProgressV3(
      "api-key",
      "progress-task",
      { source: "unit-test" },
      callbacks,
    );
    await flushPromises();
    expect(callbacks.onProgress).toHaveBeenCalledWith(
      ["https://img.test/processing.png"],
      55,
    );

    mockNovitaClient.progressV3.mockResolvedValueOnce({
      extra: { codec: "h264" },
      task: { status: "SUCCEED" },
      videos: [{ video_url: "https://video.test/final.mp4" }],
    });
    checkProgressV3("api-key", "video-task", undefined, callbacks);
    await flushPromises();
    expect(callbacks.onFinish).toHaveBeenCalledWith(
      ["https://video.test/final.mp4"],
      "",
      { codec: "h264" },
    );

    mockNovitaClient.progressV3.mockResolvedValueOnce({
      task: { status: "QUEUED" },
    });
    checkProgressV3("api-key", "queued-task", undefined, callbacks);
    await flushPromises();
    expect(callbacks.onQueue).toHaveBeenCalledTimes(1);

    mockNovitaClient.progressV3.mockResolvedValueOnce({
      task: { status: "UNKNOWN" },
    });
    checkProgressV3("api-key", "unknown-task", undefined, callbacks);
    await flushPromises();
    expect(callbacks.onQueue).toHaveBeenCalledTimes(2);

    mockNovitaClient.progressV3.mockRejectedValueOnce({
      code: 502,
      msg: "gateway",
      reason: "BAD_GATEWAY",
    });
    checkProgressV3("api-key", "error-task", undefined, callbacks);
    await flushPromises();
    expect(callbacks.onFail).toHaveBeenCalledWith(
      502,
      "BAD_GATEWAY",
      "gateway",
    );
  });

  it.each([
    ["outpainting", outpainting, "jpeg"],
    ["removeBackground", removeBackground, "png"],
    ["replaceBackground", replaceBackground, "webp"],
    ["cleanup", cleanup, "png"],
    ["mergeFace", mergeFace, "jpg"],
    ["removeText", removeText, "png"],
    ["restoreFace", restoreFace, "png"],
    ["reimagine", reimagine, "png"],
  ])(
    "finishes %s with a base64 data URL and task id",
    async (methodName, apiFn, imageType) => {
      const onFinish = jest.fn();
      const onFail = jest.fn();

      mockNovitaClient[methodName as string].mockResolvedValueOnce({
        image_file: "base64-image",
        image_type: imageType,
        task: { task_id: `${methodName}-task` },
      });

      (apiFn as any)("api-key", { prompt: "edit" }, onFinish, onFail, {
        source: "unit-test",
      });

      await flushPromises();

      expect(mockNovitaClient.setNovitaKey).toHaveBeenCalledWith("api-key");
      expect(mockNovitaClient[methodName as string]).toHaveBeenCalledWith(
        { prompt: "edit" },
        { source: "unit-test" },
      );
      expect(onFinish).toHaveBeenCalledWith(
        `data:image/${imageType};base64,base64-image`,
        `${methodName}-task`,
      );
      expect(onFail).not.toHaveBeenCalled();
    },
  );

  it("surfaces sdk wrapper business failures with response metadata", async () => {
    const onFail = jest.fn();

    mockNovitaClient.removeBackground.mockResolvedValueOnce({
      code: 422,
      message: "No subject",
      metadata: { task_id: "failed-task" },
      reason: "NO_SUBJECT",
    });

    removeBackground("api-key", {} as any, jest.fn(), onFail);

    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(
      422,
      "NO_SUBJECT",
      "No subject",
      "failed-task",
    );
  });

  it("surfaces sdk wrapper rejected errors with response metadata", async () => {
    const onFail = jest.fn();

    mockNovitaClient.cleanup.mockRejectedValueOnce({
      code: 500,
      metadata: { task_id: "error-task" },
      msg: "SDK failed",
      reason: "SDK_ERROR",
    });

    cleanup("api-key", {} as any, jest.fn(), onFail);

    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(
      500,
      "SDK_ERROR",
      "SDK failed",
      "error-task",
    );
  });

  it.each([
    ["wanI2v", wanI2v, "/v3/async/wan-i2v"],
    ["wan26T2v", wan26T2v, "/v3/async/wan2.6-t2v"],
    ["wan26I2v", wan26I2v, "/v3/async/wan2.6-i2v"],
    ["wan26V2v", wan26V2v, "/v3/async/wan2.6-v2v"],
    ["klingV16T2v", klingV16T2v, "/v3/async/kling-v1.6-t2v"],
    ["klingV16I2v", klingV16I2v, "/v3/async/kling-v1.6-i2v"],
    ["minimaxVideo01", minimaxVideo01, "/v3/async/minimax-video-01"],
    ["minimaxHailuo02", minimaxHailuo02, "/v3/async/minimax-hailuo-02"],
  ])(
    "submits %s through the web request helper",
    async (_, apiFn, endpoint) => {
      const onFinish = jest.fn();
      const onFail = jest.fn();
      mockFetch.mockResolvedValueOnce(jsonResponse({ task_id: "web-task" }));

      (apiFn as any)("api-key", { prompt: "video" }, onFinish, onFail, {
        source: "unit-test",
      });

      await flushPromises();
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`${endpoint}$`)),
        expect.objectContaining({
          body: JSON.stringify({ prompt: "video" }),
          headers: expect.objectContaining({
            Authorization: "Bearer api-key",
          }),
          method: "POST",
        }),
      );
      expect(onFinish).toHaveBeenCalledWith("web-task");
      expect(onFail).not.toHaveBeenCalled();
    },
  );

  it("reports web request wrapper failures when task id is missing", async () => {
    const onFail = jest.fn();
    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 0 }));

    wanI2v("api-key", {} as any, jest.fn(), onFail);

    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(-1, "no task id");
  });

  it("submits v3 sdk video tasks and respects aborted responses", async () => {
    const onFinish = jest.fn();
    const onFail = jest.fn();
    const abortController = new AbortController();

    mockNovitaClientV3.wanT2v.mockResolvedValueOnce({ task_id: "wan-task" });

    wanT2v("api-key", { prompt: "wan" } as any, onFinish, onFail, {
      abortSignal: abortController.signal,
      source: "unit-test",
    });

    await flushPromises();

    expect(mockNovitaClientV3.setBaseUrl).toHaveBeenCalledWith(
      expect.stringContaining("api.novita.ai"),
    );
    expect(mockNovitaClientV3.wanT2v).toHaveBeenCalledWith(
      { prompt: "wan" },
      { signal: abortController.signal, source: "unit-test" },
    );
    expect(onFinish).toHaveBeenCalledWith("wan-task");

    mockNovitaClientV3.hunyuanVideoFast.mockResolvedValueOnce({
      task_id: "ignored-task",
    });
    abortController.abort();

    hunyuanVideoFast(
      "api-key",
      { prompt: "hunyuan" } as any,
      onFinish,
      onFail,
      { abortSignal: abortController.signal },
    );

    await flushPromises();

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFail).not.toHaveBeenCalled();
  });

  it("handles sdk video task success, missing task id and rejected errors", async () => {
    const onFinish = jest.fn();
    const onFail = jest.fn();

    mockNovitaClient.txt2Video.mockResolvedValueOnce({ task_id: "txt-video" });
    textToVideo("api-key", { prompt: "video" } as any, onFinish, onFail);
    await flushPromises();

    expect(onFinish).toHaveBeenCalledWith("txt-video");

    mockNovitaClient.img2VideoMotion.mockResolvedValueOnce({});
    imageToVideoMotion("api-key", { image: "input" } as any, jest.fn(), onFail);
    await flushPromises();
    expect(onFail).toHaveBeenCalledWith(-1, "no task id");

    mockNovitaClient.txt2Video.mockRejectedValueOnce({
      code: 500,
      msg: "boom",
      reason: "VIDEO_ERROR",
    });
    textToVideo("api-key", {} as any, onFinish, onFail);
    await flushPromises();

    expect(onFail).toHaveBeenCalledWith(500, "VIDEO_ERROR", "boom");
  });

  it("polls image-to-video progress and returns completed video urls", async () => {
    jest.useFakeTimers();
    const onProgress = jest.fn();
    const onFinish = jest.fn();
    const onFail = jest.fn();
    const syncTaskId = jest.fn();

    mockNovitaClient.img2Video.mockResolvedValueOnce({
      task_id: "img-video-task",
    });
    mockNovitaClient.progressV3.mockResolvedValueOnce({
      extra: { duration: 5 },
      task: { status: "SUCCEED" },
      videos: [{ video_url: "https://video.test/final.mp4" }],
    });

    imageToVideoWithProgress(
      "api-key",
      { image_file: "asset" } as any,
      onProgress,
      onFinish,
      onFail,
      syncTaskId,
      { source: "unit-test" },
    );

    await flushPromises();
    expect(syncTaskId).toHaveBeenCalledWith("img-video-task");

    jest.advanceTimersByTime(1000);
    await flushPromises();
    await flushPromises();

    expect(mockNovitaClient.progressV3).toHaveBeenCalledWith(
      { task_id: "img-video-task" },
      { signal: undefined, source: "unit-test" },
    );
    expect(onFinish).toHaveBeenCalledWith(
      ["https://video.test/final.mp4"],
      "",
      {
        duration: 5,
      },
    );
    expect(onProgress).not.toHaveBeenCalled();
    expect(onFail).not.toHaveBeenCalled();
  });

  it("submits inpainting tasks and surfaces polling failures", async () => {
    jest.useFakeTimers();
    const callbacks = {
      onFail: jest.fn(),
      onFinish: jest.fn(),
      onProgress: jest.fn(),
      onSubmitTaskSuccess: jest.fn(),
    };

    mockNovitaClient.inpainting.mockResolvedValueOnce({
      task_id: "paint-task",
    });
    mockNovitaClient.progressV3.mockResolvedValueOnce({
      task: { reason: "MASK_INVALID", status: "FAILED" },
    });

    inpaintingWithProgress(
      "api-key",
      { image_file: "input", mask_file: "mask" } as any,
      callbacks,
    );

    await flushPromises();
    expect(callbacks.onSubmitTaskSuccess).toHaveBeenCalledWith("paint-task");

    jest.advanceTimersByTime(1000);
    await flushPromises();
    await flushPromises();

    expect(callbacks.onFail).toHaveBeenCalledWith(0, "MASK_INVALID");
    expect(callbacks.onFinish).not.toHaveBeenCalled();
  });

  it("uploads assets through the sdk and rethrows upload failures", async () => {
    const asset = new Blob(["image"]);
    mockNovitaClient.upload.mockResolvedValueOnce({ assets_id: "asset-1" });

    await expect(upload(asset, "image", { source: "unit-test" })).resolves.toBe(
      "asset-1",
    );

    expect(mockNovitaClient.upload).toHaveBeenCalledWith(
      { data: asset, type: "image" },
      { signal: undefined, source: "unit-test" },
    );

    const uploadError = new Error("upload failed");
    mockNovitaClient.upload.mockRejectedValueOnce(uploadError);

    await expect(upload(asset, "video")).rejects.toBe(uploadError);
  });

  it("builds txt2speech and async task progress requests", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ code: 0, task_id: "speech-task" }),
    );

    await expect(
      txt2SpeechFetch({
        key: "speech-key",
        language: "en-US",
        texts: "hello\nworld",
        voice_id: "voice-1",
      }),
    ).resolves.toEqual({ code: 0, task_id: "speech-task" });

    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/v3\/async\/txt2speech$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer speech-key",
        }),
        method: "POST",
      }),
    );
    expect(JSON.parse(mockFetch.mock.calls.at(-1)![1].body)).toEqual({
      request: {
        language: "en-US",
        texts: ["hello", "world"],
        voice_id: "voice-1",
      },
    });

    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 0, status: "DONE" }));

    await expect(apiProgress("task-1", "progress-key")).resolves.toEqual({
      code: 0,
      status: "DONE",
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      expect.stringMatching(/\/v3\/async\/task-result\?task_id=task-1$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer progress-key",
        }),
        method: "GET",
      }),
    );
  });

  it("uploads models through the authenticated API request helper", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 0, model: "m1" }));

    await expect(
      uploadModel("Bearer model-token", { name: "checkpoint" }),
    ).resolves.toEqual({ code: 0, model: "m1" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/v3\/model$/),
      expect.objectContaining({
        body: JSON.stringify({ name: "checkpoint" }),
        headers: expect.objectContaining({
          Authorization: "Bearer model-token",
        }),
        method: "POST",
      }),
    );
  });
});

describe("api failure message mapping", () => {
  it.each([
    [0, undefined, "Task Success!"],
    [1, undefined, "Low balance."],
    [2, undefined, "Host unavailable."],
    [3, undefined, "Auth failed."],
    [4, undefined, "Invalid params."],
    [5, undefined, "Sampler not exist."],
    [6, undefined, "Task timeout."],
    [7, undefined, "Task failed."],
    [999, undefined, "Task failed."],
    [0, 1, "Task failed."],
  ])("maps v2 code %s and status %s", (code, taskStatus, expected) => {
    expect(getFailMsg(code, taskStatus)).toBe(expected);
  });

  it.each([
    [100, undefined, undefined, "Task canceled."],
    [102, "BALANCE_NOT_ENOUGH", undefined, "Low balance."],
    [103, "ANONYMOUS_ACCESS_QUOTA_EXCEEDS", undefined, "Need login."],
    [403, "NOT_ENOUGH_BUDGET", undefined, "Insufficient budget"],
    [403, "NOT_ENOUGH_BALANCE", undefined, "Insufficient account balance"],
    [500, "UNKNOWN", "Backend failed", "Backend failed"],
    [500, "UNKNOWN", undefined, "Task failed."],
  ])("maps v3 code %s and reason %s", (code, reason, msg, expected) => {
    expect(getFailMsgV3(code, reason, msg)).toBe(expected);
  });
});
