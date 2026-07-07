import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import CelebrateModal from "@/app/components/loginModal/CelebrateModal";
import { getActivityConfig } from "@/api/config";
import party from "party-js";

let mockIsReg = false;
const mockDispatch = jest.fn();

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel({ config: { isReg: mockIsReg } }),
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/store/slice/configSlice", () => ({
  setIsReg: (v: boolean) => ({ type: "setIsReg", payload: v }),
}));

jest.mock("@/api/config", () => ({ getActivityConfig: jest.fn() }));

jest.mock("party-js", () => ({
  __esModule: true,
  default: { confetti: jest.fn() },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// Dialog mock that wires onOpenChange so the close branch runs.
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children, onOpenChange }: any) =>
    open ? (
      <div>
        <button
          data-testid="dialog-close"
          onClick={() => onOpenChange?.(false)}
        >
          x
        </button>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

const mockActivity = getActivityConfig as jest.Mock;
const mockConfetti = (party as any).confetti as jest.Mock;

describe("CelebrateModal more branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReg = false;
  });

  it("calls window.Intercom when present on Intercom click", async () => {
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: false });
    const intercom = jest.fn();
    (window as any).Intercom = intercom;
    render(<CelebrateModal />);
    await waitFor(() => screen.getByText("Intercom"));
    fireEvent.click(screen.getByText("Intercom"));
    expect(intercom).toHaveBeenCalledWith("showNewMessage");
    delete (window as any).Intercom;
  });

  it("does not throw on Intercom click when Intercom is absent", async () => {
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: false });
    delete (window as any).Intercom;
    render(<CelebrateModal />);
    await waitFor(() => screen.getByText("Intercom"));
    expect(() => fireEvent.click(screen.getByText("Intercom"))).not.toThrow();
  });

  it("fires confetti after the open delay", async () => {
    jest.useFakeTimers();
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: false });
    render(<CelebrateModal />);
    // flush the getActivityConfig promise chain
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(mockConfetti).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("dispatches setIsReg(false) when the dialog is closed", async () => {
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: false });
    render(<CelebrateModal />);
    await waitFor(() => screen.getByTestId("dialog-close"));
    fireEvent.click(screen.getByTestId("dialog-close"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "setIsReg",
      payload: false,
    });
  });
});
