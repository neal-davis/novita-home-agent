import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UpgradeInstance from "@/app/gpus-console/instances/components/upgradeInstance";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import {
  reqSingleGpuInstance,
  reqUpgradeInstance,
} from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";
import { checkEnvs } from "@/lib/utils/utils";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";

jest.mock("@/api/gpu-instance/settings", () => ({
  reqGetImageAuths: jest.fn(),
}));

jest.mock("@/api/gpu-instance/instances", () => ({
  reqSingleGpuInstance: jest.fn(),
  reqUpgradeInstance: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} type="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ className, onChange, placeholder, value }: any) => (
    <input
      aria-label={placeholder || className}
      onChange={(event) => onChange?.(event)}
      placeholder={placeholder}
      value={value ?? ""}
    />
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ onChange, placeholder, value }: any) => (
    <textarea
      aria-label={placeholder}
      onChange={(event) => onChange?.(event)}
      placeholder={placeholder}
      value={value ?? ""}
    />
  ),
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="save data toggle"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      type="checkbox"
    />
  ),
}));

jest.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: any) => <div>{children}</div>,
  CollapsibleContent: ({ children }: any) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({ onClear, onValueChange, options, value }: any) => (
    <div>
      <span>selected auth {value || "none"}</span>
      {options.map((option: any) => (
        <button
          key={option.id}
          onClick={() => onValueChange(option.id)}
          type="button"
        >
          {option.name}
        </button>
      ))}
      <button onClick={onClear} type="button">
        clear auth
      </button>
    </div>
  ),
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, open }: any) =>
    open ? <div role="dialog">{children}</div> : null,
}));

jest.mock("@/app/gpus-console/instances/components/expansionInstance", () => ({
  __esModule: true,
  default: ({ finishForm }: any) => (
    <button onClick={() => finishForm(true)} type="button">
      confirm expansion
    </button>
  ),
}));

jest.mock("@/app/gpus-console/image/components/addImagePrewarmJob", () => ({
  CurrModal: ({ children, onCancel, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
        <button onClick={onCancel} type="button">
          close credential
        </button>
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  default: ({ addModelValue }: any) => (
    <button onClick={() => addModelValue(true, "auth-new")} type="button">
      create credential
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  ChevronDown: () => <span>chevron</span>,
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      INSTANCE_UPGRADE_INSTANCE: "upgrade-instance",
    },
  },
}));

jest.mock("@/lib/utils/utils", () => ({
  checkEnvs: jest.fn(),
  cn: (...values: string[]) => values.filter(Boolean).join(" "),
  dealParamsText: (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
}));

jest.mock("@/lib/utils/dockerAddress", () => ({
  isValidDockerImageAddress: jest.fn(),
}));

const mockReqGetImageAuths = reqGetImageAuths as jest.Mock;
const mockReqSingleGpuInstance = reqSingleGpuInstance as jest.Mock;
const mockReqUpgradeInstance = reqUpgradeInstance as jest.Mock;
const mockCheckEnvs = checkEnvs as jest.Mock;
const mockIsValidDockerImageAddress = isValidDockerImageAddress as jest.Mock;

const baseInstance = {
  billingMode: "onDemand",
  command: "python app.py",
  entrypoint: "bash",
  envs: [{ key: "MODEL", value: "sdxl" }],
  exitedLocalStoragePrice: 250,
  id: "inst-1",
  imageAuthId: "auth-1",
  imageUrl: "registry.test/app:latest",
  node: { maxLocalVolumeSize: 100 },
  portMappings: [],
  volumeMounts: [
    { id: "local-1", mountPath: "/workspace", size: 20, type: "local" },
  ],
};

function renderUpgrade(overrides: Record<string, unknown> = {}) {
  const finishForm = jest.fn();
  const instance = { ...baseInstance, ...overrides };
  mockReqSingleGpuInstance.mockResolvedValue(instance);
  render(
    <UpgradeInstance finishForm={finishForm} instanceInfoObj={instance} />,
  );
  return finishForm;
}

function clickUpgradeButton() {
  fireEvent.click(screen.getAllByText("Upgrade").at(-1) as Element);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockReqGetImageAuths.mockResolvedValue({
    data: [
      { id: "auth-1", name: "Primary credential" },
      { id: "auth-2", name: "Backup credential" },
    ],
  });
  mockReqUpgradeInstance.mockResolvedValue({});
  mockCheckEnvs.mockReturnValue("");
  mockIsValidDockerImageAddress.mockReturnValue("");
});

describe("UpgradeInstance", () => {
  it("loads instance details, image auths, and opens add-credential flow", async () => {
    renderUpgrade();

    expect(
      await screen.findByDisplayValue("registry.test/app:latest"),
    ).toBeInTheDocument();
    expect(mockReqSingleGpuInstance).toHaveBeenCalledWith("inst-1");
    expect(mockReqGetImageAuths).toHaveBeenCalledWith({});
    expect(await screen.findByText("Primary credential")).toBeInTheDocument();

    fireEvent.click(screen.getByText("+ Add Credentials"));
    expect(
      screen.getByRole("dialog", { name: "Add Credential" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("create credential"));

    await waitFor(() => {
      expect(mockReqGetImageAuths).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText("selected auth auth-new")).toBeInTheDocument();
  });

  it("validates image address, entrypoint length, local mount, and envs before submit", async () => {
    renderUpgrade();

    const imageInput = await screen.findByDisplayValue(
      "registry.test/app:latest",
    );
    fireEvent.change(imageInput, { target: { value: "" } });
    clickUpgradeButton();
    expect(message.error).toHaveBeenCalledWith(
      "Please input valid image, max length 500",
    );

    fireEvent.change(imageInput, { target: { value: "bad image" } });
    mockIsValidDockerImageAddress.mockReturnValue(
      "The container image is not valid",
    );
    clickUpgradeButton();
    expect(message.error).toHaveBeenCalledWith(
      "The container image is not valid",
    );

    mockIsValidDockerImageAddress.mockReturnValue("");
    fireEvent.change(imageInput, { target: { value: "registry.test/app:2" } });
    fireEvent.change(screen.getByLabelText("Please input the entrypoint"), {
      target: { value: "x".repeat(2048) },
    });
    clickUpgradeButton();
    expect(message.error).toHaveBeenCalledWith(
      "Entrypoint length cannot exceed 2047 characters",
    );

    fireEvent.change(screen.getByLabelText("Please input the entrypoint"), {
      target: { value: "bash" },
    });
    mockCheckEnvs.mockReturnValue("Key can not be empty");
    clickUpgradeButton();
    expect(message.error).toHaveBeenCalledWith("Key can not be empty");
    expect(mockReqUpgradeInstance).not.toHaveBeenCalled();
  });

  it("updates envs, command, auth, save flag, and submits upgrade params", async () => {
    const finishForm = renderUpgrade();

    fireEvent.click(await screen.findByText("Backup credential"));
    fireEvent.change(screen.getByDisplayValue("registry.test/app:latest"), {
      target: { value: "registry.test/new:latest" },
    });
    fireEvent.change(
      screen.getByLabelText("Enter your Container Start Command"),
      {
        target: { value: "python serve.py" },
      },
    );
    fireEvent.change(screen.getByLabelText("Please input the entrypoint"), {
      target: { value: "  /bin/bash  " },
    });
    fireEvent.change(screen.getByPlaceholderText("key"), {
      target: { value: "TOKEN" },
    });
    fireEvent.change(screen.getByPlaceholderText("value"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByLabelText("save data toggle"));
    clickUpgradeButton();

    await waitFor(() => {
      expect(mockReqUpgradeInstance).toHaveBeenCalledWith("inst-1", {
        command: "python serve.py",
        entrypoint: "/bin/bash",
        envs: [{ key: "TOKEN", value: "secret" }],
        imageAuthId: "auth-2",
        imageUrl: "registry.test/new:latest",
        localVolume: undefined,
        save: false,
      });
    });
    expect(message.success).toHaveBeenCalledWith("success");
    expect(finishForm).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ id: "inst-1" }),
    );
  });

  it("adds and removes environment variables and supports cancel", async () => {
    const finishForm = renderUpgrade({ envs: [] });

    await screen.findByDisplayValue("registry.test/app:latest");
    fireEvent.click(screen.getByText("+ Add Environment Variable"));
    expect(screen.getByPlaceholderText("key")).toBeInTheDocument();
    fireEvent.click(document.querySelector(".icon-delete") as Element);
    expect(screen.queryByPlaceholderText("key")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(finishForm).toHaveBeenCalledWith();
  });
});
