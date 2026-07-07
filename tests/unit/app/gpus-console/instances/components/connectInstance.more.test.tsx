import { fireEvent, render, screen } from "@testing-library/react";
import ConnectInstance from "@/app/gpus-console/instances/components/connectInstance";
import {
  reqSingleGpuInstance,
  reqStartInstanceTerminal,
  reqStopInstanceTerminal,
} from "@/api/gpu-instance/instances";
import { copyText } from "@/lib/utils/utils";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqSingleGpuInstance: jest.fn(),
  reqStartInstanceTerminal: jest.fn(),
  reqStopInstanceTerminal: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn() },
}));
jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, id, onClick, ...props }: any) => (
    <button
      disabled={disabled}
      id={id}
      onClick={onClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/toggle-group", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const ToggleContext = React.createContext({
    onValueChange: (_: string) => {},
    value: "",
  });
  return {
    ToggleGroup: ({ children, onValueChange, value }: any) => (
      <ToggleContext.Provider value={{ onValueChange, value }}>
        <div>{children}</div>
      </ToggleContext.Provider>
    ),
    ToggleGroupItem: ({ children, value }: any) => {
      const { onValueChange } = React.useContext(ToggleContext);
      return (
        <button onClick={() => onValueChange(value)} type="button">
          {children}
        </button>
      );
    },
  };
});
jest.mock("@/constants/urls", () => ({
  DOCS_URL: {
    CONNECTTOINSTANCE: "https://docs.test/connect",
    CREATEINSTANCES: "https://docs.test/create",
  },
  NOVITA_URL: { GPU_CONSOLE_SETTINGS: "/gpus-console/settings" },
}));
jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (path: string, locale: string) => `/${locale}${path}`,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      INSTANCE_CONFIGURE_TO_DOCS: "configure-docs",
      INSTANCE_CONFIGURE_TO_SETTINGS: "configure-settings",
      INSTANCE_CONNECT_COPY_HTTP: "copy-http",
      INSTANCE_CONNECT_COPY_JUPYTER: "copy-jupyter",
      INSTANCE_CONNECT_TO_HTTP: "connect-http",
      INSTANCE_CONNECT_TO_JUPYTER: "connect-jupyter",
      INSTANCE_CONNECT_WEB_TERMINAL: "connect-terminal",
      INSTANCE_COPY_KEY_PAIR: "copy-key-pair",
      INSTANCE_COPY_PASSWORD: "copy-password",
      INSTANCE_COPY_SSH_TERMINAL: "copy-ssh",
      INSTANCE_START_WEB_TERMINAL: "start-terminal",
      INSTANCE_STOP_WEB_TERMINAL: "stop-terminal",
      INSTANCE_TCP_TO_DOCS: "tcp-docs",
    },
  },
}));
jest.mock("@/lib/utils/utils", () => ({
  copyText: jest.fn(),
  dealParamsText: (template: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
}));

const mockReqSingleGpuInstance = reqSingleGpuInstance as jest.Mock;
const mockCopyText = copyText as jest.Mock;

function renderConnect(instanceInfoObj: any) {
  const finishForm = jest.fn();
  mockReqSingleGpuInstance.mockResolvedValue(instanceInfoObj);
  render(
    <ConnectInstance
      finishForm={finishForm}
      instanceInfoObj={instanceInfoObj}
    />,
  );
  return finishForm;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation();
  (reqStartInstanceTerminal as jest.Mock).mockResolvedValue({});
  (reqStopInstanceTerminal as jest.Mock).mockResolvedValue({});
  Object.defineProperty(window, "open", {
    configurable: true,
    value: jest.fn(),
  });
});

afterEach(() => (console.log as jest.Mock).mockRestore());

describe("ConnectInstance extra branches", () => {
  it("masks a short password as all stars and hides jupyter/username when absent", async () => {
    renderConnect({
      id: "instance-a",
      connectComponentWebTerminal: {
        isRunning: true,
        address: "https://terminal.test",
        password: "abcd", // length 4 -> "********"
      },
      connectComponentSSH: { sshCommand: "ssh x@y" },
      portMappings: [],
    });

    await screen.findByText("Stop Web Terminal");
    expect(screen.getByText(/password:/)).toHaveTextContent(
      "password: ********",
    );
    // no jupyter button, no username row
    expect(
      screen.queryByText(/Connect to Jupyter Lab/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/username:/)).not.toBeInTheDocument();
  });

  it("renders the disabled connect button and start terminal when not running", async () => {
    renderConnect({
      id: "instance-a",
      connectComponentWebTerminal: { isRunning: false },
      connectComponentSSH: { sshCommand: "" },
      portMappings: [],
    });

    expect(await screen.findByText("Start Web Terminal")).toBeInTheDocument();
    // disabled "Connect to Web Terminal" variant
    expect(
      screen.getByText("Connect to Web Terminal").closest("button"),
    ).toBeDisabled();
  });

  it("copies an empty ssh command when ssh info is missing", async () => {
    renderConnect({
      id: "instance-a",
      connectComponentWebTerminal: { isRunning: false },
      portMappings: [],
    });
    await screen.findByText("Basic SSH Terminal:");
    // ssh command div is empty but still copyable
    fireEvent.click(document.getElementById("copy-ssh") as Element);
    expect(mockCopyText).toHaveBeenCalledWith("");
  });
});
