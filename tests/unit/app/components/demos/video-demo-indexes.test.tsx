import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import localforage from "localforage";
import WanT2V from "@/app/components/demos/Wan-t2v";
import WanI2V from "@/app/components/demos/Wan-i2v";
import Wan26T2V from "@/app/components/demos/Wan26-t2v";
import Wan26I2V from "@/app/components/demos/Wan26-i2v";
import Wan26V2V from "@/app/components/demos/Wan26-v2v";
import HunyuanVideoFast from "@/app/components/demos/Hunyuan-video-fast";
import KlingV16T2V from "@/app/components/demos/KlingV16T2v";
import KlingV16I2V from "@/app/components/demos/KlingV16I2v";
import MinimaxHailuo02 from "@/app/components/demos/MinimaxHailuo02";
import MinimaxVideo01 from "@/app/components/demos/MinimaxVideo01";
import {
  checkProgressV3,
  hunyuanVideoFast,
  klingV16I2v,
  klingV16T2v,
  minimaxHailuo02,
  minimaxVideo01,
  wan26I2v,
  wan26T2v,
  wan26V2v,
  wanI2v,
  wanT2v,
} from "@/api/api";
import { message } from "@/components/ui/standard/notify";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { UserState } from "@/store/slice/userSlice";

jest.mock("localforage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("fake-progress", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    end: jest.fn(),
    progress: 0.42,
  })),
}));

jest.mock("@/store", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBalanceDetail: jest.fn(() => ({ type: "billing/fetchBalanceDetail" })),
}));

jest.mock("@/api/api", () => ({
  checkProgressV3: jest.fn(),
  getFailMsgV3: jest.fn(
    (code, reason, msg) => `failed:${code}:${reason || ""}:${msg || ""}`,
  ),
  hunyuanVideoFast: jest.fn(),
  klingV16I2v: jest.fn(),
  klingV16T2v: jest.fn(),
  minimaxHailuo02: jest.fn(),
  minimaxVideo01: jest.fn(),
  wan26I2v: jest.fn(),
  wan26T2v: jest.fn(),
  wan26V2v: jest.fn(),
  wanI2v: jest.fn(),
  wanT2v: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/app/components/EnterprisePlanTips/componentUtils", () => ({
  __esModule: true,
  default: {
    checkTipsVisible: jest.fn(() => Promise.resolve(false)),
    isUseEnterprise: jest.fn(() => false),
  },
}));

jest.mock("@/constants/constants", () => ({
  getApiSource: jest.fn((rootPage: string) => `source-${rootPage}`),
}));

jest.mock("@/lib/utils/pricing", () => ({
  calcPrice: jest.fn(() => ({ discountPrice: "0.25" })),
}));

jest.mock("@/lib/utils/money", () => ({
  formatMoneyDisplay: jest.fn((value) => `money:${value}`),
}));

jest.mock("@/app/components/demos/components/DemoWrapper/DemoWrapper", () => ({
  __esModule: true,
  default: ({
    formContent,
    formFoot,
    hasStartedGenerate,
    resultContent,
    taskId,
  }: any) => (
    <section>
      <div data-testid="has-started">{String(hasStartedGenerate)}</div>
      <div data-testid="task-id">{taskId}</div>
      {formContent}
      {formFoot}
      {resultContent}
    </section>
  ),
}));

const mockFormContent = ({
  duration,
  imageUrl,
  model,
  prompt,
  referenceVideoUrls,
  resolution,
  setDuration,
  setEnablePromptExpansion,
  setHeight,
  setImageUrl,
  setModel,
  setPrompt,
  setReferenceVideoUrls,
  setResolution,
  setSeed,
  setWidth,
  setMode,
  setNegativePrompt,
  setGuidanceScale,
  onParamBlur,
  onParamChange,
  onParamFocus,
}: any) => (
  <div>
    <div>prompt {prompt}</div>
    <div>model {model}</div>
    <div>image {imageUrl}</div>
    <div>resolution {resolution}</div>
    <div>duration {duration}</div>
    <div>reference {(referenceVideoUrls || []).join(",")}</div>
    <button
      type="button"
      onClick={() => {
        setPrompt?.("updated prompt");
        setImageUrl?.("https://cdn.test/updated.png");
        setReferenceVideoUrls?.(["https://cdn.test/updated.mp4"]);
        setModel?.("updated-model");
        setWidth?.(640);
        setHeight?.(360);
        setSeed?.(123);
        setDuration?.(10);
        setResolution?.("1080P");
        setEnablePromptExpansion?.(false);
        setMode?.("Professional");
        setNegativePrompt?.("updated negative");
        setGuidanceScale?.(0.9);
        onParamFocus?.("prompt");
        onParamChange?.("prompt", "updated prompt");
        onParamBlur?.("prompt");
      }}
    >
      update form
    </button>
  </div>
);

const mockFormFooter = ({ cancelTask, estimatePrice, handleGenerate }: any) => (
  <div>
    <div>price {estimatePrice}</div>
    <button type="button" onClick={handleGenerate}>
      Generate
    </button>
    <button type="button" onClick={cancelTask}>
      Cancel
    </button>
  </div>
);

const mockResultContent = ({
  generating,
  isNsfw,
  queueing,
  resultVideoUrl,
  taskProgress,
}: any) => (
  <div>
    <div>result {resultVideoUrl || "empty"}</div>
    <div>generating {String(generating)}</div>
    <div>queueing {String(queueing)}</div>
    <div>progress {taskProgress}</div>
    <div>nsfw {String(Boolean(isNsfw))}</div>
  </div>
);

jest.mock("@/app/components/demos/Wan-t2v/components/FormContent", () => ({
  __esModule: true,
  default: (props: any) => mockFormContent(props),
}));
jest.mock("@/app/components/demos/Wan-t2v/components/FormFooter", () => ({
  __esModule: true,
  default: (props: any) => mockFormFooter(props),
}));
jest.mock("@/app/components/demos/Wan-t2v/components/ResultContent", () => ({
  __esModule: true,
  default: (props: any) => mockResultContent(props),
}));
jest.mock("@/app/components/demos/Wan-i2v/components/FormContent", () => ({
  __esModule: true,
  default: (props: any) => mockFormContent(props),
}));
jest.mock("@/app/components/demos/Wan-i2v/components/FormFooter", () => ({
  __esModule: true,
  default: (props: any) => mockFormFooter(props),
}));
jest.mock("@/app/components/demos/Wan-i2v/components/ResultContent", () => ({
  __esModule: true,
  default: (props: any) => mockResultContent(props),
}));
jest.mock("@/app/components/demos/Wan26-t2v/components/FormContent", () => ({
  __esModule: true,
  default: (props: any) => mockFormContent(props),
}));
jest.mock("@/app/components/demos/Wan26-t2v/components/FormFooter", () => ({
  __esModule: true,
  default: (props: any) => mockFormFooter(props),
}));
jest.mock("@/app/components/demos/Wan26-t2v/components/ResultContent", () => ({
  __esModule: true,
  default: (props: any) => mockResultContent(props),
}));
jest.mock("@/app/components/demos/Wan26-i2v/components/FormContent", () => ({
  __esModule: true,
  default: (props: any) => mockFormContent(props),
}));
jest.mock("@/app/components/demos/Wan26-i2v/components/FormFooter", () => ({
  __esModule: true,
  default: (props: any) => mockFormFooter(props),
}));
jest.mock("@/app/components/demos/Wan26-i2v/components/ResultContent", () => ({
  __esModule: true,
  default: (props: any) => mockResultContent(props),
}));
jest.mock("@/app/components/demos/Wan26-v2v/components/FormContent", () => ({
  __esModule: true,
  default: (props: any) => mockFormContent(props),
}));
jest.mock("@/app/components/demos/Wan26-v2v/components/FormFooter", () => ({
  __esModule: true,
  default: (props: any) => mockFormFooter(props),
}));
jest.mock("@/app/components/demos/Wan26-v2v/components/ResultContent", () => ({
  __esModule: true,
  default: (props: any) => mockResultContent(props),
}));
jest.mock(
  "@/app/components/demos/Hunyuan-video-fast/components/FormContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockFormContent(props),
  }),
);
jest.mock(
  "@/app/components/demos/Hunyuan-video-fast/components/FormFooter",
  () => ({
    __esModule: true,
    default: (props: any) => mockFormFooter(props),
  }),
);
jest.mock(
  "@/app/components/demos/Hunyuan-video-fast/components/ResultContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockResultContent(props),
  }),
);
jest.mock("@/app/components/demos/KlingV16T2v/components/FormContent", () => ({
  __esModule: true,
  default: (props: any) => mockFormContent(props),
}));
jest.mock("@/app/components/demos/KlingV16T2v/components/FormFooter", () => ({
  __esModule: true,
  default: (props: any) => mockFormFooter(props),
}));
jest.mock(
  "@/app/components/demos/KlingV16T2v/components/ResultContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockResultContent(props),
  }),
);
jest.mock("@/app/components/demos/KlingV16I2v/components/FormContent", () => ({
  __esModule: true,
  default: (props: any) => mockFormContent(props),
}));
jest.mock("@/app/components/demos/KlingV16I2v/components/FormFooter", () => ({
  __esModule: true,
  default: (props: any) => mockFormFooter(props),
}));
jest.mock(
  "@/app/components/demos/KlingV16I2v/components/ResultContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockResultContent(props),
  }),
);
jest.mock(
  "@/app/components/demos/MinimaxHailuo02/components/FormContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockFormContent(props),
  }),
);
jest.mock(
  "@/app/components/demos/MinimaxHailuo02/components/FormFooter",
  () => ({
    __esModule: true,
    default: (props: any) => mockFormFooter(props),
  }),
);
jest.mock(
  "@/app/components/demos/MinimaxHailuo02/components/ResultContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockResultContent(props),
  }),
);
jest.mock(
  "@/app/components/demos/MinimaxVideo01/components/FormContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockFormContent(props),
  }),
);
jest.mock(
  "@/app/components/demos/MinimaxVideo01/components/FormFooter",
  () => ({
    __esModule: true,
    default: (props: any) => mockFormFooter(props),
  }),
);
jest.mock(
  "@/app/components/demos/MinimaxVideo01/components/ResultContent",
  () => ({
    __esModule: true,
    default: (props: any) => mockResultContent(props),
  }),
);

const mockCheckProgress = checkProgressV3 as jest.Mock;
const mockCheckTipsVisible =
  enterprisePlanTipsUtils.checkTipsVisible as jest.Mock;
const mockDispatch = jest.fn();
const mockGetItem = localforage.getItem as jest.Mock;
const mockRemoveItem = localforage.removeItem as jest.Mock;
const mockSetItem = localforage.setItem as jest.Mock;
const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;

type DemoCase = {
  Component: React.ComponentType<any>;
  api: jest.Mock;
  label: string;
};

const demoCases: DemoCase[] = [
  { Component: WanT2V, api: wanT2v as jest.Mock, label: "wan t2v" },
  { Component: WanI2V, api: wanI2v as jest.Mock, label: "wan i2v" },
  { Component: Wan26T2V, api: wan26T2v as jest.Mock, label: "wan26 t2v" },
  { Component: Wan26I2V, api: wan26I2v as jest.Mock, label: "wan26 i2v" },
  { Component: Wan26V2V, api: wan26V2v as jest.Mock, label: "wan26 v2v" },
  {
    Component: HunyuanVideoFast,
    api: hunyuanVideoFast as jest.Mock,
    label: "hunyuan video fast",
  },
  { Component: KlingV16T2V, api: klingV16T2v as jest.Mock, label: "kling t2v" },
  { Component: KlingV16I2V, api: klingV16I2v as jest.Mock, label: "kling i2v" },
  {
    Component: MinimaxHailuo02,
    api: minimaxHailuo02 as jest.Mock,
    label: "minimax hailuo",
  },
  {
    Component: MinimaxVideo01,
    api: minimaxVideo01 as jest.Mock,
    label: "minimax video 01",
  },
];

function renderDemo(
  Component: React.ComponentType<any>,
  overrides: Record<string, unknown> = {},
) {
  const props = {
    apiKey: "api-key",
    funcInfo: { name: "demo", label: "Demo" },
    onLowBalance: jest.fn(),
    onNeedLogin: jest.fn(),
    onParamBlur: jest.fn(),
    onParamChange: jest.fn(),
    onParamFocus: jest.fn(),
    rootPage: "playground",
    showCancelConfirm: jest.fn((confirmHandler: () => void) =>
      confirmHandler(),
    ),
    ...overrides,
  };
  render(<Component {...props} />);
  return props;
}

function mockLoggedInStore(state = UserState.login) {
  mockUseAppSelector.mockImplementation(
    (selector: (store: unknown) => unknown) => selector({ user: { state } }),
  );
}

function mockSuccessfulApi(api: jest.Mock) {
  api.mockImplementation((_apiKey, _data, onFinish) => {
    onFinish("task-success");
  });
  mockCheckProgress.mockImplementation(
    (_apiKey, _taskId, _options, handlers) => {
      handlers.onProgress([""], 45);
      handlers.onFinish(["https://cdn.test/result.mp4"], undefined, {
        has_nsfw_contents: [true],
      });
    },
  );
}

describe("video demo index workflows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockLoggedInStore();
    mockCheckTipsVisible.mockResolvedValue(false);
    mockGetItem.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it.each(demoCases)(
    "starts, tracks, and finishes $label generation",
    async ({ Component, api }) => {
      mockSuccessfulApi(api);
      const props = renderDemo(Component);

      fireEvent.click(screen.getByRole("button", { name: "update form" }));
      fireEvent.click(screen.getByRole("button", { name: "Generate" }));

      await waitFor(() => expect(api).toHaveBeenCalled());
      expect(api.mock.calls[0][0]).toBe("api-key");
      expect(JSON.stringify(api.mock.calls[0][1])).toContain("updated prompt");
      expect(mockCheckProgress).toHaveBeenCalledWith(
        "api-key",
        "task-success",
        expect.objectContaining({ source: "source-playground" }),
        expect.any(Object),
      );
      expect(mockSetItem).toHaveBeenCalledWith(
        expect.stringContaining("task_id"),
        "task-success",
      );
      expect(mockDispatch).toHaveBeenCalledWith(fetchBalanceDetail());
      expect(
        await screen.findByText("result https://cdn.test/result.mp4"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("has-started")).toHaveTextContent("true");
      expect(props.onParamFocus).toHaveBeenCalledWith("prompt");
      expect(props.onParamChange).toHaveBeenCalled();
      expect(props.onParamBlur).toHaveBeenCalledWith("prompt");
    },
  );

  it("restores a saved Wan task and resumes progress polling", async () => {
    mockGetItem
      .mockResolvedValueOnce("restored-task")
      .mockResolvedValueOnce(42);
    mockCheckProgress.mockImplementation(
      (_apiKey, _taskId, _options, handlers) => {
        handlers.onFinish(["https://cdn.test/restored.mp4"]);
      },
    );

    renderDemo(WanT2V);

    await waitFor(() => {
      expect(mockCheckProgress).toHaveBeenCalledWith(
        "api-key",
        "restored-task",
        expect.any(Object),
        expect.any(Object),
      );
    });
    expect(
      await screen.findByText("result https://cdn.test/restored.mp4"),
    ).toBeInTheDocument();
  });

  it("blocks generation when logged out or when enterprise tips take over", async () => {
    mockLoggedInStore(UserState.logout);
    const logoutProps = renderDemo(WanT2V);

    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(logoutProps.onNeedLogin).toHaveBeenCalled();
    expect(wanT2v).not.toHaveBeenCalled();

    cleanup();
    jest.clearAllMocks();
    mockLoggedInStore(UserState.login);
    mockCheckTipsVisible.mockResolvedValue(true);
    renderDemo(WanI2V);

    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => expect(mockCheckTipsVisible).toHaveBeenCalled());
    expect(wanI2v).not.toHaveBeenCalled();
  });

  it("maps API failures, cancels active work, and clears persisted task state", async () => {
    minimaxHailuo02.mockImplementation((_apiKey, _data, _onFinish, onFail) => {
      onFail(500, "SERVER_ERROR", "broken");
    });
    renderDemo(MinimaxHailuo02);

    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "failed:500:SERVER_ERROR:broken",
      );
    });
    expect(mockRemoveItem).toHaveBeenCalledWith("minimax_hailuo_02_task_id");
    expect(mockRemoveItem).toHaveBeenCalledWith(
      "minimax_hailuo_02_task_progress",
    );
    expect(screen.getByText("result empty")).toBeInTheDocument();
  });
});
