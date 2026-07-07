import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CelebrateModal from "@/app/components/loginModal/CelebrateModal";
import { getActivityConfig } from "@/api/config";

let mockIsReg = false;
const mockDispatch = jest.fn();

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel({ config: { isReg: mockIsReg } }),
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/store/slice/configSlice", () => ({
  setIsReg: (v: boolean) => ({ type: "setIsReg", payload: v }),
}));

jest.mock("@/api/config", () => ({
  getActivityConfig: jest.fn(),
}));

jest.mock("party-js", () => ({
  __esModule: true,
  default: { confetti: jest.fn() },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

const mockActivity = getActivityConfig as jest.Mock;

describe("CelebrateModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReg = false;
  });

  it("does not open the modal when the user is not newly registered", () => {
    mockActivity.mockResolvedValue({ isOn: false });
    render(<CelebrateModal />);
    expect(screen.queryByText("Start Now")).not.toBeInTheDocument();
  });

  it("opens with the standard credit message when activity is off", async () => {
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: false });
    render(<CelebrateModal />);
    await waitFor(() =>
      expect(screen.getByText("Start Now")).toBeInTheDocument(),
    );
    expect(screen.getByText(/100 image generations/)).toBeInTheDocument();
  });

  it("opens with the boosted credit message when activity is on", async () => {
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: true });
    render(<CelebrateModal />);
    await waitFor(() =>
      expect(screen.getByText(/150 image generations/)).toBeInTheDocument(),
    );
  });

  it("falls back to standard message when activity config fails", async () => {
    mockIsReg = true;
    mockActivity.mockRejectedValue(new Error("nope"));
    render(<CelebrateModal />);
    await waitFor(() =>
      expect(screen.getByText(/100 image generations/)).toBeInTheDocument(),
    );
  });

  it("dispatches setIsReg(false) when Start Now is clicked", async () => {
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: false });
    render(<CelebrateModal />);
    await waitFor(() => screen.getByText("Start Now"));
    fireEvent.click(screen.getByText("Start Now"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "setIsReg",
      payload: false,
    });
  });

  it("opens discord in a new tab when Join Discord is clicked", async () => {
    mockIsReg = true;
    mockActivity.mockResolvedValue({ isOn: false });
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<CelebrateModal />);
    await waitFor(() => screen.getByText("Join Discord"));
    fireEvent.click(screen.getByText("Join Discord"));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("discord.com"),
      "_blank",
    );
    openSpy.mockRestore();
  });
});
