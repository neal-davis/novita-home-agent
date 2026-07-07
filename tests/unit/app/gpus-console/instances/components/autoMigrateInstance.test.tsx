import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AutoMigrateInstance from "@/app/gpus-console/instances/components/autoMigrateInstance";
import { reqSetAutoMigrate } from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqSetAutoMigrate: jest.fn(),
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
jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="auto migrate"
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="migrate system disk"
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

const mockSet = reqSetAutoMigrate as jest.Mock;
const mockSuccess = message.success as jest.Mock;

describe("AutoMigrateInstance modal", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
    mockSet.mockResolvedValue({});
  });
  afterEach(() => logSpy.mockRestore());

  it("shows the manual-migration guidance when auto migrate is off", () => {
    render(
      <AutoMigrateInstance
        instanceInfoObj={{ id: "i-1", autoMigrateOpen: false }}
        finishForm={jest.fn()}
      />,
    );
    expect(
      screen.getByText(/must migrate manually within/),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("migrate system disk"),
    ).not.toBeInTheDocument();
  });

  it("submits auto migrate off by default", async () => {
    render(
      <AutoMigrateInstance
        instanceInfoObj={{ id: "i-1", autoMigrateOpen: false }}
        finishForm={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() =>
      expect(mockSet).toHaveBeenCalledWith({
        instanceId: "i-1",
        autoMigrateOpen: false,
        autoMigrateSystemDisk: false,
      }),
    );
  });

  it("enables auto migrate with system disk and submits", async () => {
    const finishForm = jest.fn();
    render(
      <AutoMigrateInstance
        instanceInfoObj={{ id: "i-2", autoMigrateOpen: false }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByLabelText("auto migrate"));
    expect(screen.getByText(/don't support this feature/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("migrate system disk"));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockSet).toHaveBeenCalledWith({
        instanceId: "i-2",
        autoMigrateOpen: true,
        autoMigrateSystemDisk: true,
      });
      expect(mockSuccess).toHaveBeenCalledWith("success");
      expect(finishForm).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ id: "i-2" }),
      );
    });
  });

  it("cancels via the cancel button", () => {
    const finishForm = jest.fn();
    render(
      <AutoMigrateInstance
        instanceInfoObj={{ id: "i-3", autoMigrateOpen: true }}
        finishForm={finishForm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith(false);
  });
});
