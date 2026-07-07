import React, { useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { KeyContext } from "@/app/models/lib/context";
import Txt2Img from "@/app/components/demos/Txt2Img";
import Img2Img from "@/app/components/demos/Img2Img";
import SDXL from "@/app/components/demos/SDXL";
import {
  textToImageWithProgressV3,
  imageToImageWithProgressV3,
} from "@/api/api";
import { message } from "@/components/ui/standard/notify";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { UserState } from "@/store/slice/userSlice";
import { APIErrReasonV3, ResponseCodeV3 } from "novita-sdk";

jest.mock("@/store", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn((selector) =>
    selector({ user: { state: mockUserState } }),
  ),
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBalanceDetail: jest.fn(() => ({ type: "billing/fetchBalanceDetail" })),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock("@/api/api", () => ({
  getFailMsgV3: jest.fn((code, reason) => `failed:${code}:${reason || ""}`),
  imageToImageWithProgressV3: jest.fn(),
  textToImageWithProgressV3: jest.fn(),
}));

jest.mock("@vercel/kv", () => ({
  kv: {
    get: jest.fn(),
  },
}));

jest.mock("@/app/components/EnterprisePlanTips/componentUtils", () => ({
  __esModule: true,
  default: {
    checkTipsVisible: jest.fn(() => Promise.resolve(false)),
    isUseEnterprise: jest.fn(() => false),
  },
}));

jest.mock("@/lib/utils/pricing", () => ({
  calcPrice: jest.fn(() => ({ discountPrice: "0.001" })),
}));

jest.mock("@/lib/utils/money", () => ({
  formatMoneyDisplay: jest.fn((value) => value),
}));

jest.mock("@/lib/utils/playground", () => ({
  getDefaultModelParams: jest.fn(() => ({ prompt: "generated default" })),
}));

jest.mock("@/app/models/lib/utils", () => ({
  getSpecifyModelInfo: jest.fn(() => ({
    model_id: 99,
    model_name: "specified",
  })),
}));

jest.mock("@/app/model-api/model/components/modelList/modelList", () => ({
  ModelType: {
    base: "base",
    vae: "vae",
  },
}));

jest.mock("@/app/components/demos/defaultCases", () => ({
  __esModule: true,
  DEFAULT_MODEL_BASE_MODEL: "SDXL",
  DEFAULT_MODEL_IS_SDXL: true,
  default: {
    img2img: [
      {
        height: 512,
        init_images: ["https://cdn.test/case.png"],
        model_id: 2,
        model_name: "img-model",
        prompt: "image example prompt",
        width: 512,
      },
    ],
    SDXL: [
      {
        height: 1024,
        model_id: 99999993,
        model_name: "sd_xl_base_1.0.safetensors",
        prompt: "sdxl example prompt",
        width: 1024,
      },
      {
        height: 768,
        model_id: 99999993,
        model_name: "sd_xl_base_1.0.safetensors",
        prompt: "alternate sdxl prompt",
        width: 768,
      },
    ],
    txt2img: [
      {
        height: 512,
        model_id: 1,
        model_name: "txt-model",
        prompt: "example prompt",
        width: 512,
      },
    ],
  },
}));

jest.mock("@/app/components/demos/components/DemoWrapper/DemoWrapper", () => ({
  __esModule: true,
  default: ({ formContent, formFoot, resultContent }: any) => (
    <section>
      <div data-testid="form-content">{formContent}</div>
      <div data-testid="form-foot">{formFoot}</div>
      <div data-testid="result-content">{resultContent}</div>
    </section>
  ),
}));

jest.mock("@/components/ui/standard/tabs-items", () => ({
  TabsItems: ({ items, activeKey, onChange }: any) => (
    <div>
      {items.map((item: any) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange?.(item.key)}
        >
          {item.label}
        </button>
      ))}
      <div data-testid={`tab-${activeKey}`}>
        {items.find((item: any) => item.key === activeKey)?.children}
      </div>
    </div>
  ),
}));

jest.mock("@/app/models/image/components/FormItem/FormItem", () => ({
  FormItem: ({
    widgetProps,
    value,
    onFocus,
    onBlur,
    onChange,
    fieldProps,
  }: any) => {
    const label =
      widgetProps?.label || widgetProps?.name || widgetProps?.key || "field";
    return (
      <label>
        {label}
        <input
          aria-label={label}
          disabled={fieldProps?.disabled}
          value={Array.isArray(value) ? value[0] || "" : value || ""}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </label>
    );
  },
}));

jest.mock("@/app/models/lib/widgets", () => ({
  clipSkipWidget: () => ({ label: "Clip Skip" }),
  guidanceScaleWidget: () => ({ label: "Guidance Scale" }),
  heightWidget: () => ({ numberProps: { min: 128, max: 2048 } }),
  imageNumWidget: () => ({ label: "Image Num" }),
  imageWidget: () => ({ label: "Initial Image" }),
  nPromptWidget: () => ({ label: "Negative Prompt" }),
  promptWidget: () => ({ label: "Prompt" }),
  samplerWidget: () => ({ label: "Sampler" }),
  seedWidget: () => ({ label: "Seed" }),
  stepsWidget: () => ({ label: "Steps" }),
  strengthWidget: () => ({ label: "Strength" }),
  widthWidget: () => ({ numberProps: { min: 128, max: 2048 } }),
}));

jest.mock("@/app/components/input/ImgSize/ImgSize", () => ({
  __esModule: true,
  default: ({
    width,
    height,
    onWidthChange,
    onHeightChange,
    fieldProps,
  }: any) => (
    <div>
      <label>
        Width
        <input
          aria-label="Width"
          disabled={fieldProps?.disabled}
          value={width || ""}
          onChange={(event) => onWidthChange?.(Number(event.target.value))}
        />
      </label>
      <label>
        Height
        <input
          aria-label="Height"
          disabled={fieldProps?.disabled}
          value={height || ""}
          onChange={(event) => onHeightChange?.(Number(event.target.value))}
        />
      </label>
    </div>
  ),
}));

jest.mock("@/app/components/input/ModelSelector/ModelSelectorV2", () => ({
  __esModule: true,
  default: ({ value, onModelSelect, fieldProps }: any) => (
    <button
      type="button"
      disabled={fieldProps?.disabled}
      onClick={() =>
        onModelSelect?.({
          base_model: "SDXL",
          is_sdxl: true,
          model_id: 3,
          model_name: "selected-model",
        })
      }
    >
      Model: {value || "none"}
    </button>
  ),
}));

jest.mock("@/app/components/demos/components/LoraForm", () => ({
  __esModule: true,
  default: ({ loading }: any) => (
    <div data-testid="lora-form" data-loading={loading} />
  ),
}));

jest.mock("@/app/components/demos/components/RefinerForm", () => ({
  __esModule: true,
  default: ({ loading }: any) => (
    <div data-testid="refiner-form" data-loading={loading} />
  ),
}));

jest.mock("@/app/components/demos/components/ControlnetForm", () => ({
  __esModule: true,
  default: ({ loading }: any) => (
    <div data-testid="controlnet-form" data-loading={loading} />
  ),
}));

jest.mock("@/app/components/demos/components/IPAdapterForm", () => ({
  __esModule: true,
  default: ({ onChange, loading }: any) => (
    <button
      type="button"
      data-loading={loading}
      onClick={() =>
        onChange?.({
          enable: true,
          modelName: "ip-adapter",
          strength: 0.5,
        })
      }
    >
      Enable invalid IP adapter
    </button>
  ),
}));

jest.mock("@/app/components/demos/ImagePlaceholder/PreviewImage", () => ({
  __esModule: true,
  default: ({ loading, url, withPreview }: any) => (
    <div
      data-testid="preview-image"
      data-loading={loading ? "true" : "false"}
      data-preview={withPreview ? "true" : "false"}
    >
      {url || "placeholder"}
    </div>
  ),
}));

jest.mock("@/app/models/image/components/ShareLinkBtn/ShareLinkBtn", () => ({
  __esModule: true,
  default: ({ seed }: any) => <div data-testid="share-link">seed:{seed}</div>,
}));

jest.mock("@/app/components/button/Button", () => ({
  __esModule: true,
  default: ({ children, disabled, loading, onClick }: any) => (
    <button
      type="button"
      disabled={disabled}
      data-loading={loading ? "true" : "false"}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/legacy-button", () => ({
  LegacyButton: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/app/components/Tips/Tips", () => ({
  __esModule: true,
  default: () => <span data-testid="tips" />,
}));

jest.mock("@/lib/utils/media", () => ({
  getImgBase64FromPath: jest.fn(() => Promise.resolve("converted-base64")),
  isImgBase64: jest.fn((value: string) => value?.startsWith("data:image")),
}));

let mockUserState = UserState.login;

const baseParams = {
  batch_size: 2,
  cfg_scale: 7,
  clip_skip: 0,
  guidance_scale: 7.5,
  height: 512,
  init_images: ["data:image/png;base64,input"],
  loras: [],
  model_id: 1,
  model_name: "demo-model",
  negative_prompt: "",
  prompt: "",
  sampler_name: "Euler",
  seed: -1,
  steps: 20,
  strength: 0.7,
  width: 512,
};

function renderWithKeyContext(
  children: React.ReactElement,
  initialParams: Record<string, any> = {},
) {
  const clearParams = jest.fn();
  const setActiveCodeLine = jest.fn();
  const setCodeType = jest.fn();
  const setFunc = jest.fn();

  function Wrapper() {
    const [params, setParamsState] = useState({
      ...baseParams,
      ...initialParams,
    });
    const setParams = jest.fn((next: any) => {
      setParamsState((current) =>
        typeof next === "function" ? next(current) : { ...current, ...next },
      );
    });

    return (
      <KeyContext.Provider
        value={{
          activeCodeLine: [],
          allFuncs: [],
          clearParams,
          codeType: "javascript",
          func: "txt2img",
          params,
          setActiveCodeLine,
          setCodeType,
          setFunc,
          setParams,
        }}
      >
        {children}
      </KeyContext.Provider>
    );
  }

  return render(<Wrapper />);
}

const demoProps = {
  apiKey: "test-key",
  funcInfo: {
    displayName: "Text to Image",
    name: "txt2img",
  } as any,
  onLowBalance: jest.fn(),
  onNeedLogin: jest.fn(),
  rootPage: "playground" as const,
  showCancelConfirm: jest.fn((callback: () => void) => callback()),
};

describe("Txt2Img demo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (textToImageWithProgressV3 as jest.Mock).mockReset();
    mockUserState = UserState.login;
    window.history.replaceState({}, "", "/playground");
    (enterprisePlanTipsUtils.checkTipsVisible as jest.Mock)
      .mockReset()
      .mockResolvedValue(false);
    (enterprisePlanTipsUtils.isUseEnterprise as jest.Mock)
      .mockReset()
      .mockReturnValue(false);
  });

  it("renders placeholder slots and keeps generate disabled until a prompt exists", async () => {
    renderWithKeyContext(<Txt2Img {...demoProps} />, { prompt: "" });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Generate" })).toBeDisabled(),
    );
    expect(screen.getAllByTestId("preview-image")).toHaveLength(2);
    expect(screen.getByText("Estimated cost:")).toBeInTheDocument();
  });

  it("submits text-to-image params and renders progress then finished output", async () => {
    (textToImageWithProgressV3 as jest.Mock).mockImplementation(
      (
        _apiKey,
        _request,
        onProgress,
        onFinish,
        _onFail,
        onSubmitTaskSuccess,
      ) => {
        onSubmitTaskSuccess("task-txt");
        onProgress(["https://cdn.test/progress.png"]);
        onFinish(["https://cdn.test/final.png"], undefined, { seed: 123 });
      },
    );

    renderWithKeyContext(<Txt2Img {...demoProps} />, {
      batch_size: 1,
      prompt: "a detailed castle",
    });

    fireEvent.click(await screen.findByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(textToImageWithProgressV3).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          request: expect.objectContaining({
            height: 512,
            image_num: 1,
            model_name: "txt-model",
            prompt: "a detailed castle",
            width: 512,
          }),
        }),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ source: "playground-novita" }),
      ),
    );
    expect(screen.getByText("https://cdn.test/final.png")).toBeInTheDocument();
    expect(screen.getByTestId("share-link")).toHaveTextContent("seed:123");
  });

  it("asks logged-out users to sign in instead of calling the API", async () => {
    mockUserState = UserState.logout;
    const onNeedLogin = jest.fn();

    renderWithKeyContext(<Txt2Img {...demoProps} onNeedLogin={onNeedLogin} />, {
      prompt: "a prompt",
    });

    fireEvent.click(await screen.findByRole("button", { name: "Generate" }));

    await waitFor(() => expect(onNeedLogin).toHaveBeenCalledTimes(1));
    expect(textToImageWithProgressV3).not.toHaveBeenCalled();
  });

  it("shows a prompt length error before submitting overlong prompts", async () => {
    renderWithKeyContext(<Txt2Img {...demoProps} />, {
      prompt: "x".repeat(1025),
    });

    fireEvent.click(await screen.findByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "Prompt length should be less than 1024",
      ),
    );
    expect(textToImageWithProgressV3).not.toHaveBeenCalled();
  });
});

describe("Img2Img demo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (textToImageWithProgressV3 as jest.Mock).mockReset();
    mockUserState = UserState.login;
    window.history.replaceState({}, "", "/playground");
    (enterprisePlanTipsUtils.checkTipsVisible as jest.Mock)
      .mockReset()
      .mockResolvedValue(false);
    (enterprisePlanTipsUtils.isUseEnterprise as jest.Mock)
      .mockReset()
      .mockReturnValue(false);
  });

  it("renders showcase images and sends the init image when generating", async () => {
    (imageToImageWithProgressV3 as jest.Mock).mockImplementation(
      (_apiKey, _request, onProgress, onFinish) => {
        onProgress(["https://cdn.test/img-progress.png"]);
        onFinish(["https://cdn.test/img-final.png"]);
      },
    );

    renderWithKeyContext(
      <Img2Img
        {...demoProps}
        funcInfo={{ ...demoProps.funcInfo, name: "img2img" }}
      />,
      { batch_size: 1, model_id: 2, prompt: "restyle portrait" },
    );

    expect(await screen.findByText("Showcase")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(imageToImageWithProgressV3).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          request: expect.objectContaining({
            image_base64: "data:image/png;base64,input",
            model_name: "img-model",
            prompt: "restyle portrait",
            strength: 0.7,
          }),
        }),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ source: "playground-novita" }),
      ),
    );
    expect(
      screen.getByText("https://cdn.test/img-final.png"),
    ).toBeInTheDocument();
  });

  it("blocks generation when an enabled IP adapter has no uploaded image", async () => {
    renderWithKeyContext(
      <Img2Img
        {...demoProps}
        funcInfo={{ ...demoProps.funcInfo, name: "img2img" }}
      />,
      { prompt: "restyle portrait" },
    );

    fireEvent.click(screen.getByRole("button", { name: "Advanced" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Enable invalid IP adapter" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "Image in IP-Adapter is required.",
      ),
    );
    expect(imageToImageWithProgressV3).not.toHaveBeenCalled();
  });
});

describe("SDXL demo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserState = UserState.login;
    window.history.replaceState({}, "", "/playground");
    (enterprisePlanTipsUtils.checkTipsVisible as jest.Mock).mockResolvedValue(
      false,
    );
  });

  it("initializes SDXL defaults, rotates examples, and submits advanced params", async () => {
    const mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.6);
    (textToImageWithProgressV3 as jest.Mock).mockImplementation(
      (
        _apiKey,
        _request,
        onProgress,
        onFinish,
        _onFail,
        onSubmitTaskSuccess,
      ) => {
        onSubmitTaskSuccess("task-sdxl");
        onProgress(["https://cdn.test/sdxl-progress.png"]);
        onFinish(["https://cdn.test/sdxl-final.png"], undefined, {
          seed: 456,
        });
      },
    );

    renderWithKeyContext(
      <SDXL
        {...demoProps}
        funcInfo={{ ...demoProps.funcInfo, name: "sdxl" }}
      />,
      {
        batch_size: 1,
        clip_skip: 2,
        loras: [{ modelName: "lora-a", weight: 0.7 }],
        prompt: "cinematic mountain",
        sd_refiner: { switchAt: 0.8 },
      },
    );

    expect(await screen.findByText("Try an example")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Try an example"));
    await waitFor(() =>
      expect(
        screen.getByDisplayValue("alternate sdxl prompt"),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(textToImageWithProgressV3).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          extra: {
            enterprise_plan: {
              enabled: false,
            },
          },
          request: expect.objectContaining({
            clip_skip: 2,
            height: 768,
            image_num: 1,
            loras: [{ model_name: "lora-a", strength: 0.7 }],
            model_name: "sd_xl_base_1.0.safetensors",
            prompt: "alternate sdxl prompt",
            refiner: { switch_at: 0.8 },
            width: 768,
          }),
        }),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ source: "playground-novita" }),
      ),
    );
    expect(
      screen.getByText("https://cdn.test/sdxl-final.png"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("share-link")).toHaveTextContent("seed:456");

    mathRandomSpy.mockRestore();
  });

  it("blocks logged-out users, enterprise prompts, and overlong prompts before submitting", async () => {
    mockUserState = UserState.logout;
    const onNeedLogin = jest.fn();

    renderWithKeyContext(
      <SDXL
        {...demoProps}
        onNeedLogin={onNeedLogin}
        funcInfo={{ ...demoProps.funcInfo, name: "sdxl" }}
      />,
      { prompt: "cinematic mountain" },
    );

    fireEvent.click(await screen.findByRole("button", { name: "Generate" }));
    await waitFor(() => expect(onNeedLogin).toHaveBeenCalledTimes(1));
    expect(textToImageWithProgressV3).not.toHaveBeenCalled();

    cleanup();
    mockUserState = UserState.login;
    (
      enterprisePlanTipsUtils.checkTipsVisible as jest.Mock
    ).mockResolvedValueOnce(true);
    renderWithKeyContext(
      <SDXL
        {...demoProps}
        onNeedLogin={onNeedLogin}
        funcInfo={{ ...demoProps.funcInfo, name: "sdxl" }}
      />,
      { prompt: "cinematic mountain" },
    );

    fireEvent.click(await screen.findByRole("button", { name: "Generate" }));
    await waitFor(() =>
      expect(enterprisePlanTipsUtils.checkTipsVisible).toHaveBeenCalled(),
    );
    expect(textToImageWithProgressV3).not.toHaveBeenCalled();

    cleanup();
    (enterprisePlanTipsUtils.checkTipsVisible as jest.Mock).mockResolvedValue(
      false,
    );
    renderWithKeyContext(
      <SDXL
        {...demoProps}
        funcInfo={{ ...demoProps.funcInfo, name: "sdxl" }}
      />,
      { prompt: "x".repeat(1025) },
    );

    fireEvent.click(
      screen.getAllByRole("button", { name: "Generate" }).at(-1)!,
    );
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "Prompt length should be less than 1024",
      ),
    );
    expect(textToImageWithProgressV3).not.toHaveBeenCalled();
  });

  it("handles cancel and V3 failure reasons", async () => {
    const onNeedLogin = jest.fn();
    const onLowBalance = jest.fn();
    let failTask: ((code: number, reason: string) => void) | undefined;
    (textToImageWithProgressV3 as jest.Mock).mockImplementation(
      (_apiKey, _request, _onProgress, _onFinish, onFail) => {
        failTask = onFail;
      },
    );

    renderWithKeyContext(
      <SDXL
        {...demoProps}
        onLowBalance={onLowBalance}
        onNeedLogin={onNeedLogin}
        funcInfo={{ ...demoProps.funcInfo, name: "sdxl" }}
      />,
      { prompt: "cinematic mountain" },
    );

    fireEvent.click(await screen.findByRole("button", { name: "Generate" }));
    await waitFor(() => expect(textToImageWithProgressV3).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(demoProps.showCancelConfirm).toHaveBeenCalled();

    act(() => {
      failTask?.(
        ResponseCodeV3.TOO_MANY_REQ,
        APIErrReasonV3.ANONYMOUS_ACCESS_QUOTA_EXCEEDS,
      );
    });
    expect(onNeedLogin).toHaveBeenCalledTimes(1);

    act(() => {
      failTask?.(
        ResponseCodeV3.REQUEST_INVALID,
        APIErrReasonV3.BALANCE_NOT_ENOUGH,
      );
    });
    expect(onLowBalance).toHaveBeenCalledTimes(1);

    act(() => {
      failTask?.(ResponseCodeV3.CANCELED, "");
    });
    expect(message.warning).toHaveBeenCalledWith("Task canceled");

    act(() => {
      failTask?.(500, "SERVER_ERROR");
    });
    expect(message.error).toHaveBeenCalledWith("failed:500:SERVER_ERROR");
  });
});
