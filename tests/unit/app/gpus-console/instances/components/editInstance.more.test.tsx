import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EditInstance from "@/app/gpus-console/instances/components/editInstance";
import {
  reqEditInstance,
  reqSingleGpuInstance,
} from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";
import { checkHttpTcpPortSame, checkPorts } from "@/lib/utils/utils";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqEditInstance: jest.fn(),
  reqSingleGpuInstance: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, id, onClick, ...props }: any) => (
    <button id={id} onClick={onClick} type="button" {...props}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({
    containerClassName,
    disabled,
    onChange,
    suffix,
    value,
    ...props
  }: any) => (
    <label>
      {props.placeholder || props.className}
      <input
        aria-label={props.placeholder || props.className}
        disabled={disabled}
        onChange={(event) => onChange?.(event)}
        value={value}
      />
      {suffix}
      {containerClassName}
    </label>
  ),
}));
jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span>
      {title}
      {children}
    </span>
  ),
}));
jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, onCancel, open }: any) =>
    open ? (
      <div role="dialog" aria-label="expand confirmation">
        <button type="button" onClick={onCancel}>
          close expansion
        </button>
        {children}
      </div>
    ) : null,
}));
jest.mock("@/app/gpus-console/instances/components/expansionInstance", () => ({
  __esModule: true,
  default: ({ finishForm }: any) => (
    <button type="button" onClick={() => finishForm(true)}>
      confirm expansion
    </button>
  ),
}));
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: { GPUS_CONSOLE: { INSTANCE_EDIT_INSTANCE: "edit-save" } },
}));
jest.mock("@/lib/utils/utils", () => ({
  checkHttpTcpPortSame: jest.fn(),
  checkPorts: jest.fn(),
  dealParamsText: (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
}));

const mockReqSingleGpuInstance = reqSingleGpuInstance as jest.Mock;
const mockReqEditInstance = reqEditInstance as jest.Mock;
const mockCheckPorts = checkPorts as jest.Mock;
const mockCheckHttpTcpPortSame = checkHttpTcpPortSame as jest.Mock;

const baseInstance = {
  billingMode: "onDemand",
  diskSize: 20,
  exitedLocalStoragePrice: 250,
  freeStorageSize: 40,
  id: "inst-1",
  node: { maxLocalVolumeSize: 100, maxRootfsSize: 80 },
  portMappings: [
    { port: "3000", type: "http" },
    { port: "22", type: "tcp" },
  ],
  rootfsSize: 30,
  status: "running",
  tools: [{ port: 7860, type: "http" }],
  volumeMounts: [{ size: 20, type: "local" }],
};

function successfulPortParse(values: string[]) {
  return ["", values.filter((value) => value && value.trim())];
}

function renderEdit(instanceOverrides: Record<string, unknown> = {}) {
  const finishForm = jest.fn();
  mockReqSingleGpuInstance.mockResolvedValue({
    ...baseInstance,
    ...instanceOverrides,
  });
  render(
    <EditInstance
      finishForm={finishForm}
      instanceInfoObj={{ ...baseInstance }}
    />,
  );
  return finishForm;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockReqEditInstance.mockResolvedValue({});
  mockCheckPorts.mockImplementation(successfulPortParse);
  mockCheckHttpTcpPortSame.mockReturnValue("");
});

describe("EditInstance extra branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("saves directly when the local volume size is unchanged", async () => {
    renderEdit({ volumeMounts: [{ size: 50, type: "local" }] });
    // diskSize is initialized from the existing local mount (50) and the
    // volume-size input is not user-editable here, so save proceeds.
    await screen.findByDisplayValue("3000");
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(mockReqEditInstance).toHaveBeenCalled());
  });

  it("rejects rootfs expansion beyond the node max", async () => {
    renderEdit();
    const rootInput = await screen.findByLabelText(
      "Enter your container disk expand size",
    );
    fireEvent.change(rootInput, { target: { value: "100" } });
    fireEvent.click(screen.getByText("Save"));
    expect(message.error).toHaveBeenCalledWith(
      "Please enter a valid size, current size after expanding can not be greater than 80 GB",
    );
  });

  it("disables the rootfs input and warns when the instance is exited", async () => {
    renderEdit({ status: "exited" });
    const rootInput = await screen.findByLabelText(
      "Enter your container disk expand size",
    );
    expect(rootInput).toBeDisabled();
    expect(
      screen.getByText(/The current instance has been shut down/),
    ).toBeInTheDocument();
  });

  it("shows the single-port-in-use message when one tool port exists", async () => {
    renderEdit({ tools: [{ port: 7860, type: "http" }] });
    await screen.findByDisplayValue("3000");
    expect(
      screen.getByText("Port: 7860 is already in use"),
    ).toBeInTheDocument();
  });

  it("surfaces a tcp port validation error", async () => {
    renderEdit();
    const tcpInput = await screen.findByDisplayValue("22");
    mockCheckPorts.mockImplementation((values: string[]) =>
      values.includes("99999") ? ["tcp bad port"] : successfulPortParse(values),
    );
    fireEvent.change(tcpInput, { target: { value: "99999" } });
    fireEvent.click(screen.getByText("Save"));
    expect(message.error).toHaveBeenCalledWith("tcp bad port");
  });

  it("rejects more than 10 http ports", async () => {
    renderEdit();
    const httpInput = await screen.findByDisplayValue("3000");
    const manyPorts = Array.from({ length: 12 }, (_, i) =>
      String(8000 + i),
    ).join(",");
    mockCheckPorts.mockImplementation((values: string[]) => [
      "",
      values.filter((v) => v && v.trim()),
    ]);
    fireEvent.change(httpInput, { target: { value: manyPorts } });
    fireEvent.click(screen.getByText("Save"));
    expect(message.error).toHaveBeenCalledWith(
      "HttpPort field must have less than or equal to 10 items.",
    );
  });

  it("renders a monthly instance with no additional storage cost", async () => {
    renderEdit({ billingMode: "monthly", freeStorageSize: 1000 });
    await screen.findByDisplayValue("3000");
    expect(screen.getByText("No additional storage costs")).toBeInTheDocument();
  });

  it("shows the multi-port-in-use message when several tool ports exist", async () => {
    renderEdit({
      tools: [
        { port: 7860, type: "http" },
        { port: 8888, type: "tcp" },
      ],
    });
    await screen.findByDisplayValue("3000");
    expect(
      screen.getByText("Ports: 7860,8888 are already in use"),
    ).toBeInTheDocument();
  });

  it("surfaces an http port validation error returned by checkPorts", async () => {
    renderEdit();
    const httpInput = await screen.findByDisplayValue("3000");
    mockCheckPorts.mockImplementation((values: string[]) =>
      values.includes("70000")
        ? ["http bad port"]
        : successfulPortParse(values),
    );
    fireEvent.change(httpInput, { target: { value: "70000" } });
    fireEvent.click(screen.getByText("Save"));
    expect(message.error).toHaveBeenCalledWith("http bad port");
  });

  it("blocks save when http and tcp ports overlap", async () => {
    renderEdit();
    await screen.findByDisplayValue("3000");
    mockCheckHttpTcpPortSame.mockReturnValue(
      "Exposed http ports and tcp ports cannot be same.",
    );
    fireEvent.click(screen.getByText("Save"));
    expect(message.error).toHaveBeenCalledWith(
      "Exposed http ports and tcp ports cannot be same.",
    );
    expect(mockReqEditInstance).not.toHaveBeenCalled();
  });

  it("opens the subscription expansion modal and cancels without saving", async () => {
    renderEdit({ billingMode: "monthly" });
    const rootInput = await screen.findByLabelText(
      "Enter your container disk expand size",
    );
    fireEvent.change(rootInput, { target: { value: "10" } });
    fireEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByRole("dialog", { name: "expand confirmation" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("close expansion"));
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "expand confirmation" }),
      ).not.toBeInTheDocument();
    });
    expect(mockReqEditInstance).not.toHaveBeenCalled();
  });

  it("confirms the subscription expansion and submits the edit", async () => {
    const finishForm = renderEdit({ billingMode: "monthly" });
    const rootInput = await screen.findByLabelText(
      "Enter your container disk expand size",
    );
    fireEvent.change(rootInput, { target: { value: "10" } });
    fireEvent.click(screen.getByText("Save"));

    fireEvent.click(await screen.findByText("confirm expansion"));
    await waitFor(() => {
      expect(mockReqEditInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          instanceId: "inst-1",
          instanceParams: expect.objectContaining({ expandRootDisk: 10 }),
        }),
      );
      expect(finishForm).toHaveBeenCalledWith(true, expect.any(Object));
    });
  });
});
