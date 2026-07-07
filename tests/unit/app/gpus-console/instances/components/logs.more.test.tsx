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

describe("Logs modal more branches", () => {
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
  afterEach(() => logSpy.mockRestore());

  it("ignores an empty toggle value and keeps the current tab", async () => {
    render(<Logs instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />);
    await waitFor(() => expect(mockSingle).toHaveBeenCalled());
    // switch to right, then send an empty value which must NOT change alignment
    fireEvent.click(screen.getByRole("button", { name: "switch right" }));
    expect(screen.getByText("log addr ins-addr")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "switch none" }));
    // still on instance log because empty value was ignored
    expect(screen.getByText("log addr ins-addr")).toBeInTheDocument();
  });

  it("can switch back to system logs after viewing instance logs", async () => {
    render(<Logs instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />);
    await waitFor(() => expect(mockSingle).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "switch right" }));
    expect(screen.getByText("log addr ins-addr")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "switch left" }));
    expect(screen.getByText("log addr sys-addr")).toBeInTheDocument();
  });

  it("does not fetch details when the instance has no id", async () => {
    render(<Logs instanceInfoObj={{}} finishForm={jest.fn()} />);
    // no id -> getSingleGpuInstance never called; system log address falls back to none
    await waitFor(() =>
      expect(screen.getByText("log addr none")).toBeInTheDocument(),
    );
    expect(mockSingle).not.toHaveBeenCalled();
  });
});
