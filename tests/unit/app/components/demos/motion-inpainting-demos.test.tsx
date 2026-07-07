import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MotionSync from "@/app/components/demos/MotionSync/MotionSync";
import Inpainting from "@/app/components/demos/Inpainting/Inpainting";
import {
  animateAnyone,
  checkProgressV3,
  imageToVideoMotion,
  inpaintingWithProgress,
} from "@/api/api";
import { downloadImage, getImageSize, resizeImage } from "@/lib/utils/media";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { UserState } from "@/store/slice/userSlice";
import { FUNC_NAME } from "@/app/models/constants/funcs";

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
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn((selector) =>
    selector({ user: { state: mockUserState } }),
  ),
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBalanceDetail: jest.fn(() => ({ type: "billing/fetchBalanceDetail" })),
}));

jest.mock("@/api/api", () => ({
  animateAnyone: jest.fn(),
  checkProgressV3: jest.fn(),
  getFailMsgV3: jest.fn((code, reason) => `failed:${code}:${reason || ""}`),
  imageToVideoMotion: jest.fn(),
  inpaintingWithProgress: jest.fn(),
}));

jest.mock("@/api/model", () => ({
  getModelDetail: jest.fn(() =>
    Promise.resolve({
      base_model: "SD 1.5",
      cfg_scale: 8,
      cover_url: "https://cdn.test/model.png",
      model_id: 100000018,
      model_name: "inpaint-model.safetensors",
    }),
  ),
}));

jest.mock("@/app/components/EnterprisePlanTips/componentUtils", () => ({
  __esModule: true,
  default: {
    checkTipsVisible: jest.fn(() => Promise.resolve(false)),
    isUseEnterprise: jest.fn(() => false),
  },
}));

jest.mock("@/lib/utils/pricing", () => ({
  calcPrice: jest.fn(() => ({ discountPrice: "0.002" })),
}));

jest.mock("@/lib/utils/money", () => ({
  formatMoneyDisplay: jest.fn((value) => value),
}));

jest.mock("@/lib/utils/media", () => ({
  downloadImage: jest.fn(),
  getImageSize: jest.fn(() => Promise.resolve({ height: 768, width: 512 })),
  resizeImage: jest.fn(() => Promise.resolve("data:image/png;base64,resized")),
}));

jest.mock("@/app/model-api/model/components/modelList/modelList", () => ({
  ModelType: {
    base: "base",
    vae: "vae",
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

jest.mock("@/app/components/dragger/Dragger", () => {
  const ReactActual = jest.requireActual<typeof import("react")>("react");
  const MockDragger = ReactActual.forwardRef(function MockDragger(
    { disabled, onExternalUpload, onUpload, text = "Upload image", type }: any,
    ref: any,
  ) {
    ReactActual.useImperativeHandle(ref, () => ({ clear: jest.fn() }));
    const label = type === "video" ? "Upload motion video" : text;
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onUpload?.(
            type === "video"
              ? "https://cdn.test/uploaded-motion.mp4"
              : "data:image/png;base64,uploaded-image",
          );
          onExternalUpload?.(
            type === "video" ? "uploaded-motion-asset" : "uploaded-image-asset",
          );
        }}
      >
        {label}
      </button>
    );
  });
  return {
    __esModule: true,
    default: MockDragger,
  };
});

jest.mock("@/app/components/demos/MotionSync/BaseImage", () => ({
  __esModule: true,
  default: ({ onSelect, selected, src }: any) => (
    <button type="button" aria-pressed={selected} onClick={onSelect}>
      Base {src}
    </button>
  ),
}));

jest.mock("@/app/components/demos/MotionSync/MotionVideo", () => ({
  __esModule: true,
  default: ({ onSelect, selected, src }: any) => (
    <button type="button" aria-pressed={selected} onClick={onSelect}>
      Motion {src}
    </button>
  ),
}));

jest.mock("@/app/components/demos/AutoHeightImage", () => ({
  __esModule: true,
  default: ({ alt = "img", src }: any) => <img alt={alt} src={src} />,
}));

jest.mock("@/app/components/demos/ImagePlaceholder/ImagePlaceholder", () => ({
  __esModule: true,
  default: () => <div data-testid="image-placeholder">placeholder</div>,
}));

jest.mock("@/app/components/Loading/Loading", () => ({
  __esModule: true,
  default: ({ desc, text }: any) => (
    <div>
      <div>{text}</div>
      <div>{desc}</div>
    </div>
  ),
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

jest.mock("@/components/ui/standard/legacy-button", () => ({
  LegacyButton: ({ children, disabled, onClick, title }: any) => (
    <button
      type="button"
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
    >
      {children || title}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/number-input", () => ({
  NumberInput: ({ disabled, onBlur, onChange, onFocus, value }: any) => (
    <input
      aria-label="number-input"
      disabled={disabled}
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={(event) => onChange?.(Number(event.target.value))}
    />
  ),
}));

jest.mock("@/components/ui/standard/select-items", () => ({
  SelectItems: ({ disabled, onChange, options, value }: any) => (
    <select
      aria-label="select"
      disabled={disabled}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock("@/components/ui/standard/tabs-items", () => ({
  TabsItems: ({ activeKey, items, onChange }: any) => (
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
      <div>{items.find((item: any) => item.key === activeKey)?.children}</div>
    </div>
  ),
}));

jest.mock("@/app/components/input/Slider/Slider", () => ({
  __esModule: true,
  default: ({ disabled, label, onBlur, onChange, onFocus, value }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        disabled={disabled}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    </label>
  ),
}));

jest.mock("@/app/components/input/PromptInput/PromptInput", () => ({
  __esModule: true,
  default: ({ disabled, onBlur, onChange, onFocus, setValue, value }: any) => (
    <textarea
      aria-label="Prompt input"
      disabled={disabled}
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.(event.target.value);
      }}
    />
  ),
}));

jest.mock("@/app/components/Drawer/Drawer", () => {
  const ReactActual = jest.requireActual<typeof import("react")>("react");
  const MockDrawer = ReactActual.forwardRef(function MockDrawer(
    { baseImage, disabled, loading, onBack, resultImage, setCanGenerate }: any,
    ref: any,
  ) {
    ReactActual.useImperativeHandle(ref, () => ({
      clear: jest.fn(),
      getMaskImg: jest.fn(() => Promise.resolve("data:image/png;base64,mask")),
      redo: jest.fn(),
      setBrushSize: jest.fn(),
      setDragMode: jest.fn(),
      setScale: jest.fn(),
      setShowResult: jest.fn(),
      undo: jest.fn(),
    }));
    ReactActual.useEffect(() => {
      setCanGenerate?.(true);
    }, [setCanGenerate]);
    return (
      <div>
        <img alt="drawer-base" src={baseImage} />
        {resultImage && <img alt="drawer-result" src={resultImage} />}
        <button type="button" disabled={disabled || loading} onClick={onBack}>
          Back
        </button>
      </div>
    );
  });
  return {
    __esModule: true,
    default: MockDrawer,
  };
});

jest.mock("@/app/components/input/ModelSelector/ModelSelector", () => ({
  __esModule: true,
  default: ({ fieldProps, value }: any) => (
    <button
      type="button"
      disabled={fieldProps?.disabled}
      onClick={fieldProps?.onClick}
    >
      Model {value}
    </button>
  ),
}));

jest.mock("@/app/components/input/ModelSelector/ModelSelectorLite", () => ({
  __esModule: true,
  default: ({ fieldProps, value }: any) => (
    <button
      type="button"
      disabled={fieldProps?.disabled}
      onClick={fieldProps?.onClick}
    >
      Lite {value}
    </button>
  ),
}));

jest.mock("@/app/components/modals/ModelList", () => {
  const ReactActual = jest.requireActual<typeof import("react")>("react");
  const MockModelListModal = ReactActual.forwardRef(function MockModelListModal(
    { onModelSelect, show }: any,
    ref: any,
  ) {
    ReactActual.useImperativeHandle(ref, () => ({
      close: jest.fn(),
      open: jest.fn(),
    }));
    if (!show) {
      return null;
    }
    return (
      <button
        type="button"
        onClick={() =>
          onModelSelect?.({
            base_model: "SDXL",
            cfg_scale: 9,
            cover_url: "https://cdn.test/selected.png",
            model_id: 77,
            model_name: "selected-inpaint.safetensors",
            name: "selected-inpaint.safetensors",
          })
        }
      >
        Select model
      </button>
    );
  });
  return {
    __esModule: true,
    default: MockModelListModal,
  };
});

jest.mock("@/app/components/demos/components/LoraForm", () => ({
  __esModule: true,
  default: () => <div data-testid="lora-form" />,
}));

jest.mock("@/app/components/demos/components/EmbeddingForm", () => ({
  __esModule: true,
  default: () => <div data-testid="embedding-form" />,
}));

jest.mock("@/app/components/input/Switcher/Switcher", () => ({
  __esModule: true,
  default: ({ disabled, label, onChange, value }: any) => (
    <label>
      {label}
      <input
        aria-label={label}
        checked={value}
        disabled={disabled}
        type="checkbox"
        onChange={(event) => onChange?.(event.target.checked)}
      />
    </label>
  ),
}));

let mockUserState = UserState.login;

const baseProps = {
  apiKey: "test-key",
  funcInfo: {
    displayName: "Motion Sync",
    name: FUNC_NAME.MOTIONSYNC,
  } as any,
  onLowBalance: jest.fn(),
  onNeedLogin: jest.fn(),
  rootPage: "playground" as const,
  showCancelConfirm: jest.fn((callback: () => void) => callback()),
};

describe("MotionSync demo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserState = UserState.login;
    (enterprisePlanTipsUtils.checkTipsVisible as jest.Mock).mockResolvedValue(
      false,
    );
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        example_images: [
          { assets_id: "base-1", url: "https://cdn.test/base-1.png" },
        ],
        example_motion_videos: [
          { assets_id: "motion-1", url: "https://cdn.test/motion-1.mp4" },
        ],
        example_pose_videos: [
          { assets_id: "pose-1", url: "https://cdn.test/pose-1.mp4" },
        ],
      }),
    });
  });

  it("loads presets, enables generation, queues, and renders the finished motion video", async () => {
    (imageToVideoMotion as jest.Mock).mockImplementation(
      (_apiKey, _request, onFinish) => onFinish("motion-task"),
    );
    (checkProgressV3 as jest.Mock).mockImplementation(
      (_apiKey, _taskId, _options, callbacks) => {
        callbacks.onQueue();
        callbacks.onFinish(["https://cdn.test/result.mp4"]);
      },
    );

    render(<MotionSync {...baseProps} funcName={FUNC_NAME.MOTIONSYNC} />);

    expect(
      await screen.findByText("Base https://cdn.test/base-1.png"),
    ).toBeInTheDocument();
    const generate = screen.getByRole("button", { name: "Generate" });
    expect(generate).toBeEnabled();

    fireEvent.click(generate);

    await waitFor(() =>
      expect(imageToVideoMotion).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          image_assets_id: "base-1",
          motion_video_assets_id: "motion-1",
          seed: -1,
        }),
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ source: "playground-novita" }),
      ),
    );
    expect(checkProgressV3).toHaveBeenCalledWith(
      "test-key",
      "motion-task",
      expect.objectContaining({ source: "playground-novita" }),
      expect.objectContaining({
        onFail: expect.any(Function),
        onFinish: expect.any(Function),
        onProgress: expect.any(Function),
        onQueue: expect.any(Function),
      }),
    );
    await waitFor(() =>
      expect(document.querySelector("video.result_video")).toHaveAttribute(
        "src",
        "https://cdn.test/result.mp4",
      ),
    );
  });

  it("sends Animate Anyone dimensions and pose asset ids", async () => {
    (animateAnyone as jest.Mock).mockImplementation(
      (_apiKey, _request, onFinish) => onFinish("animate-task"),
    );
    (checkProgressV3 as jest.Mock).mockImplementation(
      (_apiKey, _taskId, _options, callbacks) => {
        callbacks.onFinish(["https://cdn.test/animate.mp4"]);
      },
    );

    render(
      <MotionSync
        {...baseProps}
        funcInfo={{ ...baseProps.funcInfo, name: FUNC_NAME.ANIMATE_ANYONE }}
        funcName={FUNC_NAME.ANIMATE_ANYONE}
      />,
    );

    expect(await screen.findByLabelText("Width")).toHaveValue("512");
    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "640" },
    });
    fireEvent.change(screen.getByLabelText("Heigh"), {
      target: { value: "832" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(animateAnyone).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          height: 832,
          image_assets_id: "base-1",
          pose_video_assets_id: "pose-1",
          steps: 20,
          width: 640,
        }),
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ source: "playground-novita" }),
      ),
    );
  });
});

describe("Inpainting demo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserState = UserState.login;
    (enterprisePlanTipsUtils.checkTipsVisible as jest.Mock).mockResolvedValue(
      false,
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("requires image, prompt, and drawable mask before generation", async () => {
    const onParamChange = jest.fn();

    render(<Inpainting {...baseProps} onParamChange={onParamChange} />);

    expect(screen.getByRole("button", { name: "Generate" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Upload image" }));
    await waitFor(() =>
      expect(screen.getByAltText("drawer-base")).toHaveAttribute(
        "src",
        "data:image/png;base64,uploaded-image",
      ),
    );
    fireEvent.change(
      screen.getByPlaceholderText(
        "Description of what you want to generate...",
      ),
      {
        target: { value: "remove the object" },
      },
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Generate" })).toBeEnabled(),
    );
    expect(onParamChange).toHaveBeenCalledWith(
      "image_base64",
      "data:image/png;base64,uploaded-image",
    );
  });

  it("submits resized image and mask, then exposes result download", async () => {
    (inpaintingWithProgress as jest.Mock).mockImplementation(
      (_apiKey, _request, callbacks) => {
        callbacks.onSubmitTaskSuccess("inpaint-task");
        callbacks.onProgress();
        callbacks.onFinish(["https://cdn.test/inpaint-result.png"]);
      },
    );

    render(<Inpainting {...baseProps} onParamChange={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Upload image" }));
    fireEvent.change(
      await screen.findByPlaceholderText(
        "Description of what you want to generate...",
      ),
      {
        target: { value: "replace the sky" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() =>
      expect(inpaintingWithProgress).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          request: expect.objectContaining({
            image_base64: "resized",
            mask_image_base64: "mask",
            model_name: "inpaint-model.safetensors",
            prompt: "replace the sky",
          }),
        }),
        expect.objectContaining({
          onFail: expect.any(Function),
          onFinish: expect.any(Function),
          onProgress: expect.any(Function),
          onSubmitTaskSuccess: expect.any(Function),
        }),
        expect.objectContaining({ source: "playground-novita" }),
      ),
    );
    expect(resizeImage).toHaveBeenCalledWith(
      "data:image/png;base64,uploaded-image",
      {
        h: 768,
        w: 512,
      },
    );
    expect(screen.getByAltText("drawer-result")).toHaveAttribute(
      "src",
      "https://cdn.test/inpaint-result.png",
    );

    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(downloadImage).toHaveBeenCalledWith(
      "https://cdn.test/inpaint-result.png",
    );
  });

  it("asks logged-out users to sign in before submitting inpainting", async () => {
    mockUserState = UserState.logout;
    const onNeedLogin = jest.fn();

    render(<Inpainting {...baseProps} onNeedLogin={onNeedLogin} />);

    fireEvent.click(screen.getByRole("button", { name: "Upload image" }));
    fireEvent.change(
      await screen.findByPlaceholderText(
        "Description of what you want to generate...",
      ),
      {
        target: { value: "replace the sky" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => expect(onNeedLogin).toHaveBeenCalledTimes(1));
    expect(inpaintingWithProgress).not.toHaveBeenCalled();
    expect(getImageSize).toHaveBeenCalled();
  });
});
