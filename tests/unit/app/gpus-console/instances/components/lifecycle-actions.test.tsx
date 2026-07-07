import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import StartInstance from "@/app/gpus-console/instances/components/startInstance";
import StopInstance from "@/app/gpus-console/instances/components/stopInstance";
import TerminateInstance from "@/app/gpus-console/instances/components/terminateInstance";
import UnabledStartInstanceNoSource from "@/app/gpus-console/instances/components/unabledStartInstanceNoSource";
import {
  reqDeleteGpuInstance,
  reqMigrateGpuInstance,
  reqStartGpuInstance,
  reqStopGpuInstance,
} from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqDeleteGpuInstance: jest.fn(),
  reqMigrateGpuInstance: jest.fn(),
  reqStartGpuInstance: jest.fn(),
  reqStopGpuInstance: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button
      data-variant={variant}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <button
      aria-pressed={checked}
      onClick={() => onCheckedChange?.(!checked)}
      type="button"
    >
      checkbox-{checked ? "checked" : "unchecked"}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title?: React.ReactNode;
  }) => (
    <span>
      <span data-testid="tooltip-title">{title}</span>
      {children}
    </span>
  ),
}));

jest.mock("@/lib/utils/utils", () => ({
  dealParamsText: jest.fn((template: string, params: Record<string, unknown>) =>
    Object.entries(params).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
  ),
}));

jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: jest.fn((value: string) => value),
}));

const mockStart = reqStartGpuInstance as jest.Mock;
const mockStop = reqStopGpuInstance as jest.Mock;
const mockDelete = reqDeleteGpuInstance as jest.Mock;
const mockMigrate = reqMigrateGpuInstance as jest.Mock;
const mockMessage = message as {
  error: jest.Mock;
  success: jest.Mock;
};

describe("GPU instance lifecycle action components", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("starts an on-demand instance and reports the success refresh state", async () => {
    const finishForm = jest.fn();
    mockStart.mockResolvedValue({ ok: true });

    render(
      <StartInstance
        finishForm={finishForm}
        instanceInfoObj={{
          billingMode: "onDemand",
          gpuNum: 2,
          id: "instance-start",
          instancePrice: 175000,
          productName: "RTX 4090",
        }}
      />,
    );

    expect(screen.getByText("Start Instance")).toBeInTheDocument();
    expect(document.body).toHaveTextContent("The current machine price for");
    expect(screen.getByText("2x RTX 4090 is $3.50/hr")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalledWith("instance-start");
    });
    expect(mockMessage.success).toHaveBeenCalledWith("success");
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("surfaces start failures through finishForm with the backend reason", async () => {
    const finishForm = jest.fn();
    mockStart.mockRejectedValue({ reason: "INSUFFICIENT_RESOURCE" });

    render(
      <StartInstance
        finishForm={finishForm}
        instanceInfoObj={{
          billingMode: "monthly",
          id: "instance-start-error",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    await waitFor(() => {
      expect(finishForm).toHaveBeenCalledWith(false, "INSUFFICIENT_RESOURCE");
    });
  });

  it("stops monthly instances without showing spot-retention warnings", async () => {
    const finishForm = jest.fn();
    mockStop.mockResolvedValue({ ok: true });

    render(
      <StopInstance
        finishForm={finishForm}
        instanceInfoObj={{
          billingMode: "monthly",
          id: "instance-stop",
        }}
      />,
    );

    expect(
      screen.getByText("Stop your instance. You can start the instance later."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/When the instance is stopped/),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));

    await waitFor(() => {
      expect(mockStop).toHaveBeenCalledWith("instance-stop");
    });
    expect(mockMessage.success).toHaveBeenCalledWith("success");
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("terminates an instance after confirmation and cancels without a request", async () => {
    const finishForm = jest.fn();
    mockDelete.mockResolvedValue({ ok: true });

    render(
      <TerminateInstance
        finishForm={finishForm}
        instanceInfoObj={{ id: "instance-delete" }}
      />,
    );

    expect(screen.getByText("Delete your instance.")).toBeInTheDocument();
    expect(screen.getByText("This is irreversible! Do you want to proceed?"));

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith(false);
    expect(mockDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("instance-delete");
    });
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("requires backup acknowledgement before migrating legacy instances", async () => {
    const finishForm = jest.fn();
    mockMigrate.mockResolvedValue({ jobId: "job-legacy" });

    render(
      <UnabledStartInstanceNoSource
        finishForm={finishForm}
        instanceInfoObj={{
          id: "instance-legacy",
          version: "v1",
        }}
      />,
    );

    const migrateButton = screen.getByRole("button", { name: "Migrate now" });
    expect(migrateButton).toBeDisabled();
    expect(
      screen.getByText(/I understand that current data will not be retained/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /I understand that current data will not be retained/,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Migrate now" }));

    await waitFor(() => {
      expect(mockMigrate).toHaveBeenCalledWith("instance-legacy", {});
    });
    expect(finishForm).toHaveBeenCalledWith(true, {
      id: "instance-legacy",
      jobId: "job-legacy",
      version: "v1",
    });
  });

  it("passes the v2 migrate-data choice and shows insufficient-resource errors", async () => {
    const finishForm = jest.fn();
    mockMigrate
      .mockRejectedValueOnce({ reason: "MIGRATE_INSUFFICIENT_RESOURCE" })
      .mockResolvedValueOnce({ jobId: "job-v2" });

    render(
      <UnabledStartInstanceNoSource
        finishForm={finishForm}
        instanceInfoObj={{
          id: "instance-v2",
          version: "v2",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Migrate now" }));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith(
        "No resources available, please try again later or contact customer support!",
      );
    });
    expect(finishForm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Migrate data" }));
    fireEvent.click(screen.getByRole("button", { name: "Migrate now" }));

    await waitFor(() => {
      expect(mockMigrate).toHaveBeenLastCalledWith("instance-v2", {
        saveData: true,
      });
    });
    expect(finishForm).toHaveBeenCalledWith(true, {
      id: "instance-v2",
      jobId: "job-v2",
      version: "v2",
    });
  });
});
