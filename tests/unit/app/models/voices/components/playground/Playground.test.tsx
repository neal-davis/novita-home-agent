import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Playground, {
  VoiceItem,
} from "@/app/models/voices/components/playground/Playground";
import { apiProgress, txt2SpeechFetch } from "@/api/api";

const mockPush = jest.fn();
let mockUser = { email: "user@example.com" };

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/models/voices",
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (asChild ? <>{children}</> : <button type="button">{children}</button>),
}));

jest.mock("@/store", () => ({
  useAppSelector: (selector: any) => selector({ user: mockUser }),
}));

jest.mock("@/lib/hooks/useSelectKeys", () => ({
  useSelectKeys: () => ["key-1"],
}));

jest.mock("@/app/components/modals/Modals", () => ({
  LowBalanceModal: ({ show, close }: { show: boolean; close: () => void }) =>
    show ? (
      <div role="dialog">
        Low balance
        <button type="button" onClick={close}>
          close modal
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
  },
}));

jest.mock("@/api/api", () => ({
  txt2SpeechFetch: jest.fn(),
  apiProgress: jest.fn(),
}));

const mockTxt2SpeechFetch = txt2SpeechFetch as jest.Mock;
const mockApiProgress = apiProgress as jest.Mock;

function installMediaMocks() {
  const requestAnimationFrameMock = jest.fn(() => 1);
  const cancelAnimationFrameMock = jest.fn();
  Object.defineProperty(global, "requestAnimationFrame", {
    configurable: true,
    writable: true,
    value: requestAnimationFrameMock,
  });
  Object.defineProperty(global, "cancelAnimationFrame", {
    configurable: true,
    writable: true,
    value: cancelAnimationFrameMock,
  });
  Object.defineProperty(window, "requestAnimationFrame", {
    configurable: true,
    writable: true,
    value: requestAnimationFrameMock,
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    configurable: true,
    writable: true,
    value: cancelAnimationFrameMock,
  });
  jest
    .spyOn(HTMLMediaElement.prototype, "play")
    .mockImplementation(() => Promise.resolve());
  jest
    .spyOn(HTMLMediaElement.prototype, "pause")
    .mockImplementation(() => undefined);
}

function getGenerateButton(container: HTMLElement) {
  const button = container.querySelector("[class*='g_btn']");
  if (!button) {
    throw new Error("generate button not found");
  }
  return button;
}

describe("Voice Playground", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUser = { email: "user@example.com" };
    installMediaMocks();
    mockTxt2SpeechFetch.mockResolvedValue({ task_id: "task-1" });
    mockApiProgress.mockResolvedValue({
      task: { status: "TASK_STATUS_SUCCEEDED" },
      audios: [{ audio_url: "https://cdn.test/output.wav" }],
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    cleanup();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("redirects logged out users to login before generating", () => {
    mockUser = { email: "" };
    const { container } = render(<Playground />);

    fireEvent.click(getGenerateButton(container));

    expect(mockPush).toHaveBeenCalledWith(
      "/user/login?redirect=/models/voices",
    );
    expect(mockTxt2SpeechFetch).not.toHaveBeenCalled();
  });

  it("generates speech, polls progress, and writes the output audio source", async () => {
    const { container } = render(<Playground />);

    fireEvent.click(getGenerateButton(container));

    expect(mockTxt2SpeechFetch).toHaveBeenCalledWith({
      language: "en-US",
      voice_id: "Sarah",
      texts: expect.stringContaining("Hey there"),
      key: "key-1",
    });

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockApiProgress).toHaveBeenCalledWith("task-1", "key-1");
    });
    const audio = container.querySelector(
      "audio[src='https://cdn.test/output.wav']",
    );
    expect(audio).toBeInTheDocument();
  });

  it("shows low balance modal when billing fails and can close it", async () => {
    mockTxt2SpeechFetch.mockRejectedValue("failed to billing");
    const { container } = render(<Playground />);

    fireEvent.click(getGenerateButton(container));

    expect(await screen.findByRole("dialog")).toHaveTextContent("Low balance");
    fireEvent.click(screen.getByRole("button", { name: "close modal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("switches language defaults and stops a pending polling task", async () => {
    const clearIntervalSpy = jest.spyOn(window, "clearInterval");
    const { container } = render(<Playground />);
    fireEvent.click(getGenerateButton(container));
    await Promise.resolve();

    fireEvent.click(screen.getByText("Chinese"));

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(screen.getByDisplayValue(/你好，最近怎么样/)).toBeInTheDocument();
  });

  it("selects and previews voice items", () => {
    const onSelected = jest.fn();
    render(
      <VoiceItem
        img="/voice.png"
        title="Preview Voice"
        desc="Narrator"
        voiceId="preview"
        voiceSrc="/voice.wav"
        isSelected={false}
        onSelected={onSelected}
      />,
    );

    fireEvent.click(screen.getByText("Preview Voice"));
    expect(onSelected).toHaveBeenCalledWith("Preview Voice");

    fireEvent.click(
      screen.getByText("Narrator").parentElement!.nextElementSibling!,
    );
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });
});
