import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import localforage from "localforage";
import Txt2Video from "@/app/components/demos/Txt2Video/Txt2Video";
import { checkProgressV3, textToVideo } from "@/api/api";
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
  textToVideo: jest.fn(),
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

jest.mock("@/app/components/analytics/constants", () => ({
  getGenBtnId: jest.fn((rootPage: string) => `generate-${rootPage}`),
}));

jest.mock("@/lib/utils/pricing", () => ({
  calcPrice: jest.fn(() => ({ discountPrice: "0.12" })),
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
      <div>{formContent}</div>
      <div>{formFoot}</div>
      <div>{resultContent}</div>
    </section>
  ),
}));

jest.mock("@/components/ui/standard/warning-dialog", () => ({
  WarningDialog: ({ description, onOpenChange, open, title }: any) =>
    open ? (
      <div role="alertdialog">
        <h2>{title}</h2>
        <div>{description}</div>
        <button type="button" onClick={() => onOpenChange(false)}>
          close warning
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span title={title}>{children}</span>
  ),
}));

jest.mock("lucide-react", () => ({
  CircleHelp: ({ size }: { size?: number }) => <span>help {size}</span>,
  X: () => <span>close icon</span>,
}));

jest.mock("@/components/ui/standard/legacy-button", () => ({
  LegacyButton: ({ children, disabled, icon, onClick }: any) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children || icon || "legacy button"}
    </button>
  ),
}));

jest.mock("@/app/components/button/Button", () => ({
  __esModule: true,
  default: ({ children, disabled, id, loading, onClick }: any) => (
    <button
      id={id}
      type="button"
      disabled={disabled}
      data-loading={String(Boolean(loading))}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/number-input", () => ({
  NumberInput: ({ disabled, onBlur, onChange, onFocus, value }: any) => (
    <input
      aria-label="Seed"
      disabled={disabled}
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  ),
}));

jest.mock("@/components/ui/standard/select-items", () => ({
  SelectItems: ({
    disabled,
    onBlur,
    onChange,
    onFocus,
    options,
    value,
  }: any) => (
    <select
      aria-label="Model"
      disabled={disabled}
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock("@/app/components/input/PromptInput/PromptInput", () => ({
  __esModule: true,
  default: ({ disabled, onBlur, onChange, onFocus, setValue, value }: any) => (
    <textarea
      aria-label="Negative Prompt"
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
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  ),
}));

jest.mock("@/app/components/Loading/Loading", () => ({
  __esModule: true,
  default: ({ desc, extra, text }: any) => (
    <div>
      <div>{text}</div>
      <div>{desc}</div>
      {extra}
    </div>
  ),
}));

jest.mock("@/app/components/demos/ImagePlaceholder/ImagePlaceholder", () => ({
  __esModule: true,
  default: () => <div>image placeholder</div>,
}));

jest.mock("@/app/components/demos/Txt2Video/Txt2VideoPrompt", () => ({
  __esModule: true,
  TOTAL_MAX_FRAME: 129,
  MIN_CLIP_FRAME: 16,
  MAX_CLIP_FRAME: 80,
  default: ({ loading, onBlur, onChange, onFocus, params }: any) => (
    <div>
      <div>prompt count {params.length}</div>
      <div>prompt loading {String(Boolean(loading))}</div>
      <button
        type="button"
        onClick={() => {
          onFocus?.();
          onChange([{ prompt: "updated prompt", frames: 32 }]);
          onBlur?.();
        }}
      >
        valid prompts
      </button>
      <button
        type="button"
        onClick={() => onChange([{ prompt: "", frames: 32 }])}
      >
        empty prompt
      </button>
      <button
        type="button"
        onClick={() => onChange([{ prompt: "too many", frames: 130 }])}
      >
        too many frames
      </button>
      <button
        type="button"
        onClick={() => onChange([{ prompt: "zero", frames: 0 }])}
      >
        zero frames
      </button>
    </div>
  ),
}));

const mockCheckProgress = checkProgressV3 as jest.Mock;
const mockCheckTipsVisible =
  enterprisePlanTipsUtils.checkTipsVisible as jest.Mock;
const mockDispatch = jest.fn();
const mockGetItem = localforage.getItem as jest.Mock;
const mockRemoveItem = localforage.removeItem as jest.Mock;
const mockSetItem = localforage.setItem as jest.Mock;
const mockTextToVideo = textToVideo as jest.Mock;
const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;

function mockStore(state = UserState.login) {
  mockUseAppSelector.mockImplementation(
    (selector: (store: unknown) => unknown) => selector({ user: { state } }),
  );
}

function renderTxt2Video(overrides: Record<string, unknown> = {}) {
  const props = {
    apiKey: "api-key",
    funcInfo: { name: "txt2video" },
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
  render(<Txt2Video {...props} />);
  return props;
}

describe("Txt2Video demo workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockStore();
    mockGetItem.mockResolvedValue(null);
    mockCheckTipsVisible.mockResolvedValue(false);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("updates parameters, starts generation, tracks progress, and renders the finished video", async () => {
    mockTextToVideo.mockImplementation((_apiKey, _data, onFinish) => {
      onFinish("txt-task");
    });
    mockCheckProgress.mockImplementation(
      (_apiKey, _taskId, _options, handlers) => {
        handlers.onProgress([], 45);
        handlers.onFinish(["https://cdn.test/txt2video.mp4"]);
      },
    );
    const props = renderTxt2Video();

    fireEvent.change(screen.getByLabelText("Model"), {
      target: { value: "dreamshaper_8_93211.safetensors" },
    });
    fireEvent.click(screen.getByRole("button", { name: "valid prompts" }));
    fireEvent.change(screen.getByLabelText("Negative Prompt"), {
      target: { value: "new negative" },
    });
    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "512" },
    });
    fireEvent.change(screen.getByLabelText("Heigh"), {
      target: { value: "768" },
    });
    fireEvent.change(screen.getByLabelText("Guidance Scale"), {
      target: { value: "8.5" },
    });
    fireEvent.change(screen.getByLabelText("Steps"), {
      target: { value: "24" },
    });
    fireEvent.change(screen.getByLabelText("Seed"), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => expect(mockTextToVideo).toHaveBeenCalled());
    expect(mockTextToVideo).toHaveBeenCalledWith(
      "api-key",
      expect.objectContaining({
        guidance_scale: 8.5,
        height: 768,
        model_name: "dreamshaper_8_93211.safetensors",
        negative_prompt: "new negative",
        prompts: [{ frames: 32, prompt: "updated prompt" }],
        seed: 123,
        steps: 24,
        width: 512,
      }),
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ source: "source-playground" }),
    );
    expect(mockSetItem).toHaveBeenCalledWith("txt2video_task_id", "txt-task");
    expect(mockDispatch).toHaveBeenCalledWith(fetchBalanceDetail());
    expect(await screen.findByTestId("has-started")).toHaveTextContent("true");
    expect(document.querySelector("video")).toHaveAttribute(
      "src",
      "https://cdn.test/txt2video.mp4",
    );
    expect(props.onParamChange).toHaveBeenCalledWith("txt2video_prompts", [
      { frames: 32, prompt: "updated prompt" },
    ]);
  });

  it("restores saved task progress on mount", async () => {
    mockGetItem
      .mockResolvedValueOnce("restored-txt-task")
      .mockResolvedValueOnce(42);
    mockCheckProgress.mockImplementation(
      (_apiKey, _taskId, _options, handlers) => {
        handlers.onFinish(["https://cdn.test/restored-txt.mp4"]);
      },
    );

    renderTxt2Video();

    await waitFor(() => {
      expect(mockCheckProgress).toHaveBeenCalledWith(
        "api-key",
        "restored-txt-task",
        expect.any(Object),
        expect.any(Object),
      );
    });
    expect(document.querySelector("video")).toHaveAttribute(
      "src",
      "https://cdn.test/restored-txt.mp4",
    );
  });

  it("shows prompt validation warnings before calling the API", async () => {
    renderTxt2Video();

    fireEvent.click(screen.getByRole("button", { name: "empty prompt" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(await screen.findByText("Prompts invalid!")).toBeInTheDocument();
    expect(
      screen.getByText("There are empty prompt values."),
    ).toBeInTheDocument();
    expect(mockTextToVideo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "close warning" }));
    fireEvent.click(screen.getByRole("button", { name: "too many frames" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(
      await screen.findByText(
        "The sum of the frames should be less than or equal to 129",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "close warning" }));
    fireEvent.click(screen.getByRole("button", { name: "zero frames" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(
      await screen.findByText("The sum of the frames should be greater than 0"),
    ).toBeInTheDocument();
  });

  it("blocks logged-out and enterprise-tip controlled generations", async () => {
    mockStore(UserState.logout);
    const logoutProps = renderTxt2Video();

    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(logoutProps.onNeedLogin).toHaveBeenCalled();
    expect(mockTextToVideo).not.toHaveBeenCalled();

    jest.clearAllMocks();
    mockStore(UserState.login);
    mockCheckTipsVisible.mockResolvedValue(true);
    renderTxt2Video();

    fireEvent.click(screen.getAllByRole("button", { name: "Generate" })[1]);

    await waitFor(() => expect(mockCheckTipsVisible).toHaveBeenCalled());
    expect(mockTextToVideo).not.toHaveBeenCalled();
  });

  it("maps API failures and cancel actions to cleanup side effects", async () => {
    mockTextToVideo.mockImplementation((_apiKey, _data, _onFinish, onFail) => {
      onFail(500, "SERVER_ERROR", "broken");
    });
    renderTxt2Video();

    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith(
        "failed:500:SERVER_ERROR:broken",
      );
    });
    expect(mockRemoveItem).toHaveBeenCalledWith("txt2video_task_id");
    expect(mockRemoveItem).toHaveBeenCalledWith("txt2video_task_progress");

    jest.clearAllMocks();
    mockTextToVideo.mockImplementation((_apiKey, _data, onFinish) => {
      onFinish("queued-task");
    });
    mockCheckProgress.mockImplementation(
      (_apiKey, _taskId, _options, handlers) => {
        handlers.onQueue();
      },
    );
    renderTxt2Video();

    fireEvent.click(screen.getAllByRole("button", { name: "Generate" })[1]);
    expect(await screen.findByText("Queueing...")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockRemoveItem).toHaveBeenCalledWith("txt2video_task_id");
    expect(mockRemoveItem).toHaveBeenCalledWith("txt2video_task_progress");
  });
});
