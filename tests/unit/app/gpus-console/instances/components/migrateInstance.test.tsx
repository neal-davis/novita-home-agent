import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MigrateInstance from "@/app/gpus-console/instances/components/migrateInstance";
import { reqMigrateGpuInstance } from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqMigrateGpuInstance: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));
jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <span>{children}</span>,
}));

const mockMigrate = reqMigrateGpuInstance as jest.Mock;
const mockError = message.error as jest.Mock;
const mockSuccess = message.success as jest.Mock;

describe("MigrateInstance modal", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
    mockMigrate.mockResolvedValue({ jobId: "job-7" });
  });
  afterEach(() => logSpy.mockRestore());

  it("disables confirm until backup is acknowledged for v1 instances", () => {
    render(
      <MigrateInstance
        instanceInfoObj={{ id: "i-1", version: "v1" }}
        finishForm={jest.fn()}
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeDisabled();
  });

  it("migrates a v1 instance after acknowledging backup", async () => {
    const finishForm = jest.fn();
    render(
      <MigrateInstance
        instanceInfoObj={{ id: "i-1", version: "v1" }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockMigrate).toHaveBeenCalledWith("i-1", {});
      expect(mockSuccess).toHaveBeenCalledWith("success");
      expect(finishForm).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ id: "i-1", jobId: "job-7" }),
      );
    });
  });

  it("migrates a v2 instance with the saveData flag toggled", async () => {
    render(
      <MigrateInstance
        instanceInfoObj={{ id: "i-2", version: "v2" }}
        finishForm={jest.fn()}
      />,
    );
    // v2 shows a 'Migrate data' checkbox; toggle it on
    fireEvent.click(screen.getByRole("checkbox"));
    expect(
      screen.getByText(/the Container Disk will be imaged/),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() =>
      expect(mockMigrate).toHaveBeenCalledWith("i-2", { saveData: true }),
    );
  });

  it("surfaces an insufficient-resource error", async () => {
    mockMigrate.mockRejectedValue({ reason: "INSUFFICIENT_RESOURCE" });
    render(
      <MigrateInstance
        instanceInfoObj={{ id: "i-3", version: "v2" }}
        finishForm={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith(
        "No resources available, please try again later or contact customer support!",
      ),
    );
  });

  it("surfaces a CUDA incompatible error", async () => {
    mockMigrate.mockRejectedValue({ reason: "CUDA_VERSION_INCOMPATIBLE" });
    render(
      <MigrateInstance
        instanceInfoObj={{ id: "i-4", version: "v2" }}
        finishForm={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith("CUDA version is incompatible"),
    );
  });

  it("cancels via the cancel button", () => {
    const finishForm = jest.fn();
    render(
      <MigrateInstance
        instanceInfoObj={{ id: "i-5", version: "v2" }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith(false);
  });
});
