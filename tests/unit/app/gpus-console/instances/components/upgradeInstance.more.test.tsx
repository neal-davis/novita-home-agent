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
  message: { error: jest.fn(), success: jest.fn() },
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
  default: ({ finishForm, expandSize }: any) => (
    <div>
      <span>expand size {expandSize}</span>
      <button onClick={() => finishForm(true)} type="button">
        confirm expansion
      </button>
      <button onClick={() => finishForm(false)} type="button">
        cancel expansion
      </button>
    </div>
  ),
}));
jest.mock("@/app/gpus-console/image/components/addImagePrewarmJob", () => ({
  CurrModal: ({ children, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
}));
jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  default: () => <div>image auth</div>,
}));
jest.mock("lucide-react", () => ({
  ChevronDown: () => <span>chevron</span>,
}));
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: { INSTANCE_UPGRADE_INSTANCE: "upgrade-instance" },
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

const monthlyInstance = {
  billingMode: "monthly",
  command: "python app.py",
  entrypoint: "bash",
  envs: [],
  exitedLocalStoragePrice: 250,
  id: "inst-1",
  imageAuthId: "auth-1",
  imageUrl: "registry.test/app:latest",
  node: { maxLocalVolumeSize: 100 },
  portMappings: [
    { type: "http", port: 8080 },
    { type: "tcp", port: 22 },
  ],
  volumeMounts: [
    { id: "local-1", mountPath: "/workspace", size: 20, type: "local" },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockReqGetImageAuths.mockResolvedValue({
    data: [{ id: "auth-1", name: "Primary" }],
  });
  mockReqUpgradeInstance.mockResolvedValue({});
  mockCheckEnvs.mockReturnValue("");
  mockIsValidDockerImageAddress.mockReturnValue("");
});

describe("UpgradeInstance extra branches", () => {
  let consoleLogSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => consoleLogSpy.mockRestore());

  it("clears the selected credential via the clear control", async () => {
    mockReqSingleGpuInstance.mockResolvedValue(monthlyInstance);
    render(
      <UpgradeInstance
        finishForm={jest.fn()}
        instanceInfoObj={monthlyInstance}
      />,
    );
    await screen.findByText("selected auth auth-1");
    fireEvent.click(screen.getByText("clear auth"));
    expect(screen.getByText("selected auth none")).toBeInTheDocument();
  });

  it("opens the expansion modal for monthly billing when local volume grows and confirms it", async () => {
    const finishForm = jest.fn();
    // prop volume size 20, but the fetched instance reports size 10 -> grow by 10
    mockReqSingleGpuInstance.mockResolvedValue({
      ...monthlyInstance,
      volumeMounts: [
        { id: "local-1", mountPath: "/workspace", size: 10, type: "local" },
      ],
    });
    render(
      <UpgradeInstance
        finishForm={finishForm}
        instanceInfoObj={monthlyInstance}
      />,
    );
    await screen.findByDisplayValue("registry.test/app:latest");
    fireEvent.click(screen.getAllByText("Upgrade").at(-1) as Element);

    expect(await screen.findByText("expand size 10")).toBeInTheDocument();
    fireEvent.click(screen.getByText("confirm expansion"));

    await waitFor(() => {
      expect(mockReqUpgradeInstance).toHaveBeenCalledWith(
        "inst-1",
        expect.objectContaining({ imageUrl: "registry.test/app:latest" }),
      );
    });
    await waitFor(() => {
      expect(screen.queryByText("expand size 10")).not.toBeInTheDocument();
    });
  });

  it("closes the expansion modal without upgrading when cancelled", async () => {
    mockReqSingleGpuInstance.mockResolvedValue({
      ...monthlyInstance,
      volumeMounts: [
        { id: "local-1", mountPath: "/workspace", size: 10, type: "local" },
      ],
    });
    render(
      <UpgradeInstance
        finishForm={jest.fn()}
        instanceInfoObj={monthlyInstance}
      />,
    );
    await screen.findByDisplayValue("registry.test/app:latest");
    fireEvent.click(screen.getAllByText("Upgrade").at(-1) as Element);

    expect(await screen.findByText("expand size 10")).toBeInTheDocument();
    fireEvent.click(screen.getByText("cancel expansion"));

    await waitFor(() => {
      expect(screen.queryByText("expand size 10")).not.toBeInTheDocument();
    });
    expect(mockReqUpgradeInstance).not.toHaveBeenCalled();
  });
});
