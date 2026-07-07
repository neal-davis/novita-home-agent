import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RestartInstance from "@/app/gpus-console/instances/components/restartInstance";
import { reqRestartGpuInstance } from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqRestartGpuInstance: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn() },
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockRestart = reqRestartGpuInstance as jest.Mock;
const mockSuccess = message.success as jest.Mock;

describe("RestartInstance modal", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
    mockRestart.mockResolvedValue({});
  });
  afterEach(() => logSpy.mockRestore());

  it("restarts the instance and finishes successfully", async () => {
    const finishForm = jest.fn();
    render(
      <RestartInstance
        instanceInfoObj={{ id: "i-1" }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));

    await waitFor(() => {
      expect(mockRestart).toHaveBeenCalledWith("i-1");
      expect(mockSuccess).toHaveBeenCalledWith("success");
      expect(finishForm).toHaveBeenCalledWith(true);
    });
  });

  it("does not restart twice while a request is in flight", async () => {
    let resolve!: (v: unknown) => void;
    mockRestart.mockReturnValue(new Promise((r) => (resolve = r)));
    render(
      <RestartInstance
        instanceInfoObj={{ id: "i-1" }}
        finishForm={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(mockRestart).toHaveBeenCalledTimes(1);
    resolve({});
    await waitFor(() => expect(mockSuccess).toHaveBeenCalled());
  });

  it("cancels via the cancel button", () => {
    const finishForm = jest.fn();
    render(
      <RestartInstance
        instanceInfoObj={{ id: "i-1" }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalled();
  });
});
