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
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
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
    <span title={typeof title === "string" ? title : undefined}>
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
  default: ({ expandSize, finishForm, instanceInfoObj }: any) => (
    <div>
      <span>
        expand {instanceInfoObj.id} by {expandSize}
      </span>
      <button type="button" onClick={() => finishForm(false)}>
        cancel expansion
      </button>
      <button type="button" onClick={() => finishForm(true)}>
        confirm expansion
      </button>
    </div>
  ),
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      INSTANCE_EDIT_INSTANCE: "edit-instance-save",
    },
  },
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
  node: {
    maxLocalVolumeSize: 100,
    maxRootfsSize: 80,
  },
  portMappings: [
    { port: "3000", type: "http" },
    { port: "22", type: "tcp" },
  ],
  rootfsSize: 30,
  status: "running",
  tools: [
    { port: 7860, type: "http" },
    { port: 2222, type: "tcp" },
  ],
  volumeMounts: [{ size: 20, type: "local" }],
};

function successfulPortParse(values: string[]) {
  return ["", values.filter((value) => value && value.trim())];
}

function renderEditInstance(
  instanceOverrides: Record<string, unknown> = {},
  propsOverrides: Record<string, unknown> = {},
) {
  const finishForm = jest.fn();
  mockReqSingleGpuInstance.mockResolvedValue({
    ...baseInstance,
    ...instanceOverrides,
  });
  render(
    <EditInstance
      finishForm={finishForm}
      instanceInfoObj={{ ...baseInstance, id: "inst-1", ...propsOverrides }}
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

describe("EditInstance", () => {
  it("loads instance details and initializes disk and port fields", async () => {
    renderEditInstance();

    expect(await screen.findByDisplayValue("3000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("22")).toBeInTheDocument();
    expect(
      screen.getByText("Ports: 7860,2222 are already in use"),
    ).toBeInTheDocument();
    expect(mockReqSingleGpuInstance).toHaveBeenCalledWith("inst-1");
    expect(
      screen.getByText("Additional storage costs: $0.025 /day"),
    ).toBeInTheDocument();
  });

  it("validates disk expansion against max rootfs size before saving", async () => {
    renderEditInstance();

    const rootInput = await screen.findByLabelText(
      "Enter your container disk expand size",
    );
    fireEvent.change(rootInput, { target: { value: "60" } });
    fireEvent.click(screen.getByText("Save"));

    expect(message.error).toHaveBeenCalledWith(
      "Please enter a valid size, current size after expanding can not be greater than 80 GB",
    );
    expect(mockReqEditInstance).not.toHaveBeenCalled();
  });

  it("surfaces invalid port and cross-protocol duplicate errors", async () => {
    renderEditInstance();

    const httpInput = await screen.findByDisplayValue("3000");
    mockCheckPorts.mockImplementation((values: string[]) =>
      values.includes("bad") ? ["bad port"] : successfulPortParse(values),
    );
    fireEvent.change(httpInput, { target: { value: "bad" } });
    fireEvent.click(screen.getByText("Save"));
    expect(message.error).toHaveBeenCalledWith("bad port");
    expect(mockReqEditInstance).not.toHaveBeenCalled();

    mockCheckPorts.mockImplementation(successfulPortParse);
    mockCheckHttpTcpPortSame.mockReturnValue("Exposed http and tcp overlap");
    fireEvent.change(httpInput, { target: { value: "22" } });
    fireEvent.click(screen.getByText("Save"));
    expect(message.error).toHaveBeenCalledWith("Exposed http and tcp overlap");
  });

  it("saves on-demand edits directly with expanded root disk and explicit ports", async () => {
    const finishForm = renderEditInstance();

    fireEvent.change(
      await screen.findByLabelText("Enter your container disk expand size"),
      { target: { value: "5" } },
    );
    fireEvent.change(screen.getByDisplayValue("3000"), {
      target: { value: "8080" },
    });
    fireEvent.change(screen.getByDisplayValue("22"), {
      target: { value: "2223" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockReqEditInstance).toHaveBeenCalledWith({
        instanceId: "inst-1",
        instanceParams: {
          expandDataDisk: 0,
          expandRootDisk: 5,
          ports: [
            { port: "8080", type: "http" },
            { port: "2223", type: "tcp" },
          ],
        },
      });
    });
    expect(message.success).toHaveBeenCalledWith("Success");
    expect(finishForm).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ id: "inst-1" }),
    );
  });

  it("requires subscription expansion confirmation before saving", async () => {
    renderEditInstance({ billingMode: "monthly", freeStorageSize: 35 });

    fireEvent.change(
      await screen.findByLabelText("Enter your container disk expand size"),
      { target: { value: "8" } },
    );
    expect(
      screen.getByText("Additional storage costs: $0.020 /day"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));

    expect(
      await screen.findByRole("dialog", { name: "expand confirmation" }),
    ).toBeInTheDocument();
    expect(mockReqEditInstance).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("cancel expansion"));
    expect(
      screen.queryByRole("dialog", { name: "expand confirmation" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Save"));
    fireEvent.click(await screen.findByText("confirm expansion"));

    await waitFor(() => {
      expect(mockReqEditInstance).toHaveBeenCalledWith({
        instanceId: "inst-1",
        instanceParams: {
          expandDataDisk: 0,
          expandRootDisk: 8,
          ports: [
            { port: "3000", type: "http" },
            { port: "22", type: "tcp" },
          ],
        },
      });
    });
  });

  it("handles load failure and cancel without submitting", async () => {
    const finishForm = jest.fn();
    mockReqSingleGpuInstance.mockRejectedValue(new Error("not found"));

    render(
      <EditInstance
        finishForm={finishForm}
        instanceInfoObj={{ id: "missing" }}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByDisplayValue(",")).toHaveLength(2);
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(finishForm).toHaveBeenCalledWith();
    expect(mockReqEditInstance).not.toHaveBeenCalled();
  });
});
