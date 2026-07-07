import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Logs from "@/app/gpus-console/instances/components/logs";
import { reqSingleGpuInstance } from "@/api/gpu-instance/instances";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqSingleGpuInstance: jest.fn(),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/toggle-group", () => ({
  ToggleGroup: ({ children, onValueChange }: any) => (
    <div>
      <button type="button" onClick={() => onValueChange("right")}>
        switch right
      </button>
      <button type="button" onClick={() => onValueChange("left")}>
        switch left
      </button>
      <button type="button" onClick={() => onValueChange("")}>
        switch none
      </button>
      {children}
    </div>
  ),
  ToggleGroupItem: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/app/gpus-console/components/InstanceLog", () => ({
  __esModule: true,
  default: ({ address }: any) => <div>log addr {address || "none"}</div>,
}));

const mockSingle = reqSingleGpuInstance as jest.Mock;

describe("Logs modal", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
    mockSingle.mockResolvedValue({
      id: "i-1",
      connectComponentLog: {
        systemLogAddress: "sys-addr",
        instanceLogAddress: "ins-addr",
      },
      portMappings: [
        { type: "http", port: 80 },
        { type: "tcp", port: 22 },
      ],
    });
  });
  afterEach(() => {
    logSpy.mockRestore();
  });

  it("fetches details on mount and renders system log by default", async () => {
    render(<Logs instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />);
    await waitFor(() => expect(mockSingle).toHaveBeenCalledWith("i-1"));
    expect(screen.getByText("log addr sys-addr")).toBeInTheDocument();
  });

  it("switches to the instance log tab", async () => {
    render(<Logs instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />);
    await waitFor(() => expect(mockSingle).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "switch right" }));
    expect(screen.getByText("log addr ins-addr")).toBeInTheDocument();
  });

  it("calls finishForm when closing", async () => {
    const finishForm = jest.fn();
    render(<Logs instanceInfoObj={{ id: "i-1" }} finishForm={finishForm} />);
    await waitFor(() => expect(mockSingle).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(finishForm).toHaveBeenCalled();
  });

  it("falls back to empty instance info when detail fetch fails", async () => {
    mockSingle.mockRejectedValueOnce(new Error("boom"));
    render(<Logs instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />);
    await waitFor(() => expect(mockSingle).toHaveBeenCalled());
    expect(screen.getByText("log addr none")).toBeInTheDocument();
  });
});
