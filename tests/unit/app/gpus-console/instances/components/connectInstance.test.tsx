import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ConnectInstance from "@/app/gpus-console/instances/components/connectInstance";
import {
  reqSingleGpuInstance,
  reqStartInstanceTerminal,
  reqStopInstanceTerminal,
} from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";
import { copyText } from "@/lib/utils/utils";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqSingleGpuInstance: jest.fn(),
  reqStartInstanceTerminal: jest.fn(),
  reqStopInstanceTerminal: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    success: jest.fn(),
  },
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
  NOVITA_URL: {
    GPU_CONSOLE_SETTINGS: "/gpus-console/settings",
  },
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (path: string, locale: string) => `/${locale}${path}`,
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

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
const mockReqStartInstanceTerminal = reqStartInstanceTerminal as jest.Mock;
const mockReqStopInstanceTerminal = reqStopInstanceTerminal as jest.Mock;
const mockCopyText = copyText as jest.Mock;

const runningInstance = {
  connectComponentJupyter: {
    address: "https://jupyter.test",
    port: "8888",
  },
  connectComponentSSH: {
    sshCommand: "ssh user@gpu.test",
  },
  connectComponentWebTerminal: {
    address: "https://terminal.test",
    isRunning: true,
    password: "supersecret",
    username: "root",
  },
  id: "instance-a",
  portMappings: [
    { endpoint: "https://http.test", port: "7860", type: "http" },
    { endpoint: "tcp.test:2200", port: "22", type: "tcp" },
  ],
};

function renderConnect(instanceInfoObj: any = runningInstance) {
  const finishForm = jest.fn();
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
  jest.spyOn(console, "error").mockImplementation();
  mockReqSingleGpuInstance.mockResolvedValue(runningInstance);
  mockReqStartInstanceTerminal.mockResolvedValue({});
  mockReqStopInstanceTerminal.mockResolvedValue({});
  Object.defineProperty(window, "open", {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { href: "" },
  });
});

afterEach(() => {
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

describe("ConnectInstance", () => {
  it("opens and copies HTTP, Jupyter, web terminal, SSH, and password connection values", async () => {
    renderConnect();

    expect(
      await screen.findByText("Connect to HTTP Service [Port 7860]"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Connect to Jupyter Lab [Port 8888]"),
    ).toBeInTheDocument();
    expect(screen.getByText("username: root")).toBeInTheDocument();
    expect(screen.getByText(/password:/)).toHaveTextContent(
      "password: su*******et",
    );
    expect(screen.getByText("ssh user@gpu.test")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Connect to HTTP Service [Port 7860]"));
    expect(window.open).toHaveBeenCalledWith("https://http.test");

    fireEvent.click(document.getElementById("copy-http") as Element);
    expect(mockCopyText).toHaveBeenCalledWith("https://http.test");

    fireEvent.click(screen.getByText("Connect to Jupyter Lab [Port 8888]"));
    expect(window.open).toHaveBeenCalledWith("https://jupyter.test");
    fireEvent.click(document.getElementById("copy-jupyter") as Element);
    expect(mockCopyText).toHaveBeenCalledWith("https://jupyter.test");

    fireEvent.click(screen.getByText("Connect to Web Terminal"));
    expect(window.open).toHaveBeenCalledWith("https://terminal.test");
    fireEvent.click(document.getElementById("copy-password") as Element);
    expect(mockCopyText).toHaveBeenCalledWith("supersecret");
    fireEvent.click(screen.getByText("ssh user@gpu.test"));
    expect(mockCopyText).toHaveBeenCalledWith("ssh user@gpu.test");
  });

  it("starts and stops the web terminal and refreshes instance state", async () => {
    mockReqSingleGpuInstance.mockResolvedValue({
      ...runningInstance,
      connectComponentWebTerminal: { isRunning: false },
    });
    renderConnect({
      ...runningInstance,
      connectComponentWebTerminal: { isRunning: false },
    });

    fireEvent.click(await screen.findByText("Start Web Terminal"));
    await waitFor(() => {
      expect(mockReqStartInstanceTerminal).toHaveBeenCalledWith("instance-a");
    });
    expect(message.success).toHaveBeenCalledWith("success");
    expect(screen.getByText("Starting").closest("button")).toBeDisabled();

    mockReqSingleGpuInstance.mockResolvedValue(runningInstance);
    renderConnect();
    fireEvent.click(await screen.findByText("Stop Web Terminal"));
    await waitFor(() => {
      expect(mockReqStopInstanceTerminal).toHaveBeenCalledWith("instance-a");
    });
    expect(message.success).toHaveBeenCalledWith("success");
  });

  it("shows TCP mappings, docs links, key setup, settings navigation, and close callback", async () => {
    const finishForm = renderConnect();

    await screen.findByText("Connect to HTTP Service [Port 7860]");
    fireEvent.click(screen.getByText("TCP Port Mappings"));
    expect(
      screen.getByText("Internal: 22 External: tcp.test:2200"),
    ).toBeInTheDocument();
    const createDocsLink = screen.getByText("Click Here to Learn More");
    expect(createDocsLink).toHaveAttribute("href", "https://docs.test/create");
    expect(createDocsLink).toHaveAttribute("target", "_blank");

    fireEvent.click(screen.getByText("Configure Public Key"));
    expect(
      screen.getByText('ssh-keygen -t ed25519 -C "your_email@example.com"'),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByText('ssh-keygen -t ed25519 -C "your_email@example.com"'),
    );
    expect(mockCopyText).toHaveBeenCalledWith(
      'ssh-keygen -t ed25519 -C "your_email@example.com"',
    );

    expect(screen.getByText("Settings")).toHaveAttribute(
      "href",
      "/en/gpus-console/settings",
    );
    const connectDocsLink = screen.getByText("generating SSH keys");
    expect(connectDocsLink).toHaveAttribute(
      "href",
      "https://docs.test/connect",
    );
    expect(connectDocsLink).toHaveAttribute("target", "_blank");

    fireEvent.click(screen.getByText("Close"));
    expect(finishForm).toHaveBeenCalledWith();
  });
});
