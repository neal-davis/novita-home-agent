// Covers the image-operation and video SDK/web wrappers in src/api/api.ts that
// the existing api-core suite does not exercise.

// eslint-disable-next-line no-var
var mockNovitaClient: any;
// eslint-disable-next-line no-var
var mockNovitaClientV3: any;

jest.mock("novita-sdk", () => ({
  APIErrReasonV3: {},
  NovitaError: class NovitaError extends Error {},
  NovitaSDK: jest.fn().mockImplementation(() => {
    mockNovitaClient = {
      setNovitaKey: jest.fn(),
      setBaseUrl: jest.fn(),
      outpainting: jest.fn(),
      removeBackground: jest.fn(),
      replaceBackground: jest.fn(),
      cleanup: jest.fn(),
      replaceSky: jest.fn(),
      replaceObject: jest.fn(),
      mergeFace: jest.fn(),
      removeText: jest.fn(),
      restoreFace: jest.fn(),
      reimagine: jest.fn(),
      removeWatermark: jest.fn(),
      img2Video: jest.fn(),
      img2VideoMotion: jest.fn(),
      txt2Video: jest.fn(),
      progressV3: jest.fn(),
      inpainting: jest.fn(),
      upload: jest.fn(),
    };
    return mockNovitaClient;
  }),
  ResponseCodeV2: { OK: 0 },
  ResponseCodeV3: { CANCELED: 100, NETWORK: 101 },
  TaskStatus: { SUCCEED: "SUCCEED", FAILED: "FAILED" },
}));

jest.mock("novita-sdk-v3", () => ({
  NovitaSDK: jest.fn().mockImplementation(() => {
    if (!mockNovitaClientV3) {
      mockNovitaClientV3 = {
        setBaseUrl: jest.fn(),
        setNovitaKey: jest.fn(),
        wanT2v: jest.fn(),
        hunyuanVideoFast: jest.fn(),
      };
    }
    return mockNovitaClientV3;
  }),
}));

jest.mock("js-cookie", () => ({ get: jest.fn() }));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));
jest.mock("@/lib/utils/dealError", () => ({
  dealErrorText: jest.fn((t: string) => t),
}));
jest.mock("@/store", () => ({
  reduxStore: { store: { dispatch: jest.fn() } },
}));
jest.mock("@/store/slice/userSlice", () => ({ logout: jest.fn() }));
jest.mock("@/constants/urls", () => ({ LOGIN_REQUIRED_URL: [] }));
jest.mock("@/i18n/config", () => ({
  getLocalizedPath: jest.fn((p: string) => p),
  getPathnameLocale: jest.fn(() => ({ locale: "en" })),
  getPathnameWithoutLocale: jest.fn((p: string) => p),
}));
jest.mock("@/constants/constants", () => ({ PERMISSION_ERR_CODE: [] }));
jest.mock("@/lib/utils/reporter", () => ({ reportError: jest.fn() }));

import * as api from "@/api/api";

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("api.ts image-operation SDK wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  const imageOps: [string, string][] = [
    ["outpainting", "outpainting"],
    ["removeBackground", "removeBackground"],
    ["replaceBackground", "replaceBackground"],
    ["cleanup", "cleanup"],
    ["mergeFace", "mergeFace"],
    ["removeText", "removeText"],
    ["restoreFace", "restoreFace"],
    ["reimagine", "reimagine"],
  ];

  it.each(imageOps)(
    "%s calls onFinish with a data URL on success",
    async (fnName, clientMethod) => {
      mockNovitaClient[clientMethod].mockResolvedValue({
        image_file: "BASE64DATA",
        image_type: "png",
        task: { task_id: "t-1" },
      });
      const onFinish = jest.fn();
      const onFail = jest.fn();
      (api as any)[fnName]("key", {}, onFinish, onFail);
      await flush();
      expect(mockNovitaClient.setNovitaKey).toHaveBeenCalledWith("key");
      expect(onFinish).toHaveBeenCalledWith(
        "data:image/png;base64,BASE64DATA",
        "t-1",
      );
      expect(onFail).not.toHaveBeenCalled();
    },
  );

  it.each(imageOps)(
    "%s calls onFail when the response has no image_file",
    async (fnName, clientMethod) => {
      mockNovitaClient[clientMethod].mockResolvedValue({
        code: 42,
        reason: "BAD",
        message: "nope",
        metadata: { task_id: "t-2" },
      });
      const onFinish = jest.fn();
      const onFail = jest.fn();
      (api as any)[fnName]("key", {}, onFinish, onFail);
      await flush();
      expect(onFinish).not.toHaveBeenCalled();
      expect(onFail).toHaveBeenCalledWith(42, "BAD", "nope", "t-2");
    },
  );

  it.each(imageOps)(
    "%s calls onFail when the SDK rejects",
    async (fnName, clientMethod) => {
      mockNovitaClient[clientMethod].mockRejectedValue({
        code: 7,
        reason: "ERR",
      });
      const onFinish = jest.fn();
      const onFail = jest.fn();
      (api as any)[fnName]("key", {}, onFinish, onFail);
      await flush();
      expect(onFinish).not.toHaveBeenCalled();
      expect(onFail).toHaveBeenCalledWith(7, "ERR", undefined, undefined);
    },
  );

  it("mixpose and doodle and createTile are no-ops", () => {
    expect(api.mixpose("k", {}, jest.fn(), jest.fn())).toBeUndefined();
    expect(api.doodle("k", {}, jest.fn(), jest.fn())).toBeUndefined();
    expect(api.createTile("k", {}, jest.fn(), jest.fn())).toBeUndefined();
  });

  it("replaceSky and replaceObjectWithProgress are no-ops", () => {
    expect(api.replaceSky("k", {}, jest.fn(), jest.fn())).toBeUndefined();
    expect(
      api.replaceObjectWithProgress(
        "k",
        {},
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
      ),
    ).toBeUndefined();
  });

  it("removeWatermark, animateAnyone and lcm wrappers are no-ops", () => {
    expect(api.removeWatermark("k", {}, jest.fn(), jest.fn())).toBeUndefined();
    expect(api.animateAnyone("k", {}, jest.fn(), jest.fn())).toBeUndefined();
    expect(
      api.lcmTxt2Img("k", {} as never, jest.fn(), jest.fn()),
    ).toBeUndefined();
    expect(
      api.lcmImg2Img("k", {} as never, jest.fn(), jest.fn()),
    ).toBeUndefined();
  });

  it("imageToVideoMotion resolves a task id via the SDK", async () => {
    mockNovitaClient.img2VideoMotion.mockResolvedValue({ task_id: "mot-1" });
    const onFinish = jest.fn();
    const onFail = jest.fn();
    api.imageToVideoMotion("k", {} as never, onFinish, onFail);
    await flush();
    expect(onFinish).toHaveBeenCalledWith("mot-1");
  });

  it("imageToVideoMotion fails on a rejected SDK call", async () => {
    mockNovitaClient.img2VideoMotion.mockRejectedValue({
      code: 9,
      reason: "X",
    });
    const onFail = jest.fn();
    api.imageToVideoMotion("k", {} as never, jest.fn(), onFail);
    await flush();
    expect(onFail).toHaveBeenCalledWith(9, "X", undefined, undefined);
  });

  it("textToVideo resolves a task id via the SDK", async () => {
    mockNovitaClient.txt2Video.mockResolvedValue({ task_id: "vid-7" });
    const onFinish = jest.fn();
    const onFail = jest.fn();
    api.textToVideo("k", {} as never, onFinish, onFail);
    await flush();
    expect(onFinish).toHaveBeenCalledWith("vid-7");
  });

  it("textToVideo fails when no task id is returned", async () => {
    mockNovitaClient.txt2Video.mockResolvedValue({});
    const onFail = jest.fn();
    api.textToVideo("k", {} as never, jest.fn(), onFail);
    await flush();
    expect(onFail).toHaveBeenCalledWith(-1, "no task id");
  });
});

describe("api.ts video web-request wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  const webVideoOps = [
    "wanI2v",
    "wan26T2v",
    "wan26I2v",
    "wan26V2v",
    "klingV16T2v",
    "klingV16I2v",
    "minimaxVideo01",
    "minimaxHailuo02",
  ];

  it.each(webVideoOps)(
    "%s posts to the API and resolves a task id",
    async (fnName) => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ task_id: "task-123" }),
        headers: new Headers(),
      });
      const onFinish = jest.fn();
      const onFail = jest.fn();
      (api as any)[fnName]("api-key", { prompt: "hi" }, onFinish, onFail);
      await flush();
      await flush();
      expect(onFinish).toHaveBeenCalledWith("task-123");
      expect(onFail).not.toHaveBeenCalled();
    },
  );

  it("calls onFail when the web response lacks a task id", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: new Headers(),
    });
    const onFinish = jest.fn();
    const onFail = jest.fn();
    api.wanI2v("key", {}, onFinish, onFail);
    await flush();
    await flush();
    expect(onFinish).not.toHaveBeenCalled();
    expect(onFail).toHaveBeenCalledWith(-1, "no task id");
  });
});

describe("api.ts video SDK-v3 wrappers", () => {
  beforeAll(() => {
    // Instantiate the mocked SDK once so the shared client singleton exists
    // and its methods can be stubbed before api.wanT2v dereferences them.
    const { NovitaSDK } = jest.requireMock("novita-sdk-v3");
    new NovitaSDK("seed");
  });
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("wanT2v resolves a task id on success", async () => {
    const onFinish = jest.fn();
    const onFail = jest.fn();
    mockNovitaClientV3.wanT2v.mockResolvedValue({ task_id: "v3-1" });
    api.wanT2v("key", {} as never, onFinish, onFail);
    await flush();
    expect(onFinish).toHaveBeenCalledWith("v3-1");
  });

  it("wanT2v fails when no task id returned", async () => {
    const onFinish = jest.fn();
    const onFail = jest.fn();
    mockNovitaClientV3.wanT2v.mockResolvedValue({});
    api.wanT2v("key", {} as never, onFinish, onFail);
    await flush();
    expect(onFail).toHaveBeenCalledWith(-1, "no task id");
  });
});
