import * as React from "react";
import { createRef } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import StepTwo from "@/app/gpus-console/explore/components/stepTwo";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import {
  reqGetOfficialTemplates,
  reqGetTemplateById,
  reqGetTemplates,
} from "@/api/gpu-instance/templates";

const mockUseAppSelector = jest.fn();

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    mockUseAppSelector(selector),
}));

jest.mock("@/api/gpu-instance/storage", () => ({
  reqGetStorage: jest.fn(),
}));

jest.mock("@/api/gpu-instance/templates", () => ({
  reqGetOfficialTemplates: jest.fn(),
  reqGetTemplateById: jest.fn(),
  reqGetTemplates: jest.fn(),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetMarketNode: jest.fn(),
}));

jest.mock("@/lib/utils/utils", () => ({
  checkPorts: jest.fn((ports: string[]) => {
    const invalid = ports.find((port) => Number(port) > 65535);
    return invalid
      ? ["Port can not be greater than 65535", ports]
      : ["", ports];
  }),
  dealParamsText: jest.fn((template: string, params: Record<string, unknown>) =>
    Object.entries(params).reduce(
      (text, [key, value]) => text.replace(`\${${key}}`, String(value)),
      template,
    ),
  ),
  matchLogoForTemplate: jest.fn(() => "/template.svg"),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(() => "token"),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    onBlur,
    onChange,
    placeholder,
    value,
  }: {
    onBlur?: () => void;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    value?: string | number;
  }) => (
    <input
      aria-label={placeholder}
      onBlur={onBlur}
      onChange={onChange}
      placeholder={placeholder}
      value={value ?? ""}
    />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
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
      type="button"
      onClick={() => onCheckedChange?.(!checked)}
    >
      checkbox-{checked ? "on" : "off"}
    </button>
  ),
}));

jest.mock("@/components/ui/collapsible", () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
    value,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
  }) => (
    <div data-testid="select" data-value={value}>
      <button type="button" onClick={() => onValueChange?.("storage-a")}>
        choose-storage-a
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("@/app/gpus-console/explore/components/changeNewTemplate", () => ({
  __esModule: true,
  default: ({ onConfirm }: { onConfirm: (template: any) => void }) => (
    <button
      type="button"
      onClick={() => onConfirm({ Id: "official-alt", channel: "official" })}
    >
      confirm-template
    </button>
  ),
}));

jest.mock("@/app/gpus-console/components/addTemplate", () => ({
  __esModule: true,
  default: () => <div>add-template-modal</div>,
}));

jest.mock("@/app/gpus-console/explore/components/invalidModal", () => ({
  __esModule: true,
  default: ({ finishForm }: { finishForm: (mark: boolean) => void }) => (
    <button type="button" onClick={() => finishForm(true)}>
      fix-template
    </button>
  ),
}));

jest.mock("@/app/gpus-console/templates/components/section", () => ({
  MyModal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/app/gpus-console/storage/components/addNetworkVolume", () => ({
  __esModule: true,
  default: ({
    finishOper,
  }: {
    finishOper: (mark: boolean, info?: any) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        finishOper(true, {
          storageId: "storage-new",
          storageName: "New storage",
          storageSize: 80,
        })
      }
    >
      finish-volume
    </button>
  ),
}));

const mockReqGetStorage = reqGetStorage as jest.Mock;
const mockReqGetOfficialTemplates = reqGetOfficialTemplates as jest.Mock;
const mockReqGetTemplateById = reqGetTemplateById as jest.Mock;
const mockReqGetTemplates = reqGetTemplates as jest.Mock;

function baseCreateInstanceInfo(overrides: Record<string, unknown> = {}) {
  return {
    command: "python app.py",
    clusterId: "cluster-a",
    currProduct: {
      freeRootFS: 20,
      maxRootFS: 200,
      minRootFS: 40,
      storagePrice: { discount: 1234 },
    },
    entrypoint: "/bin/bash",
    envs: [{ key: "API_KEY", value: "secret" }],
    httpPorts: "8080",
    imageID: "official-a",
    imageObj: {
      Id: "official-a",
      entrypoint: "/start",
      envs: [{ key: "MODEL", value: "sdxl" }],
      image: "registry.example.com/official:1",
      ports: [
        { type: "http", ports: ["3000"] },
        { type: "tcp", ports: ["22"] },
      ],
      rootfsSize: 90,
      startCommand: "serve",
      tools: [
        { describe: "Jupyter", name: "jupyter", port: 8888, type: "http" },
      ],
      volumes: [{ mountPath: "/data", size: 10, type: "local" }],
    },
    imageUrl: " registry.example.com/custom:latest ",
    rootfsSize: 80,
    volumeMounts: [
      { mountPath: "/workspace", size: "20", type: "local" },
      { id: "storage-a", mountPath: "/network", type: "network" },
    ],
    ...overrides,
  };
}

function renderStepTwo(createInfo = baseCreateInstanceInfo()) {
  const emitDataFun = jest.fn();
  const onLocalVolumeChange = jest.fn();
  const ref = createRef<{
    getCreateParameter: () => Record<string, unknown>;
    showInvalidTips: () => () => void;
  }>();

  render(
    <StepTwo
      ref={ref}
      createInstanceInfoOut={{
        createInstanceInfo: createInfo,
        emitDataFun,
      }}
      onLocalVolumeChange={onLocalVolumeChange}
    />,
  );

  return { emitDataFun, onLocalVolumeChange, ref };
}

describe("StepTwo", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ user: { email: "ada@example.com", uuid: "user-1" } }),
    );
    mockReqGetStorage.mockResolvedValue({
      data: [
        { storageId: "storage-a", storageName: "Team NAS", storageSize: 50 },
      ],
    });
    mockReqGetOfficialTemplates.mockResolvedValue({
      template: [
        baseCreateInstanceInfo().imageObj,
        {
          Id: "official-alt",
          image: "registry.example.com/alt:1",
          name: "Alt",
          ports: [],
          rootfsSize: 60,
          tools: [],
          volumes: [],
        },
      ],
    });
    mockReqGetTemplateById.mockResolvedValue({
      template: { Id: "official-a", name: "Official A" },
    });
    mockReqGetTemplates.mockResolvedValue({
      template: [
        {
          Id: "private-a",
          image: "registry.example.com/private:1",
          name: "Private",
          ports: [{ type: "http", ports: ["7860"] }],
          rootfsSize: 70,
          tools: [],
          volumes: [],
        },
      ],
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("returns trimmed launch parameters with selected tools and resolved network volume size", async () => {
    localStorage.setItem("jupyter", "1");
    const { ref } = renderStepTwo();

    await waitFor(() => {
      expect(mockReqGetStorage).toHaveBeenCalled();
    });

    expect(ref.current?.getCreateParameter()).toMatchObject({
      imageUrl: "registry.example.com/custom:latest",
      tools: [{ name: "jupyter", port: 8888, type: "http" }],
      volumeMounts: [
        { mountPath: "/workspace", size: "20", type: "local" },
        {
          id: "storage-a",
          mountPath: "/network",
          size: 50,
          type: "network",
        },
      ],
    });
  });

  it("updates form state and validates user-visible configuration errors", async () => {
    const { emitDataFun, ref } = renderStepTwo();

    const imageInput = await screen.findByDisplayValue(
      /registry\.example\.com\/custom:latest/,
    );

    fireEvent.change(screen.getByDisplayValue("80"), {
      target: { value: "20" },
    });
    fireEvent.blur(screen.getByDisplayValue("20"));
    expect(
      screen.getByText("Container disk must be at least 40 GB"),
    ).toBeInTheDocument();

    fireEvent.change(imageInput, {
      target: { value: "" },
    });
    fireEvent.blur(imageInput);
    expect(
      screen.getByText("Please enter valid image,max length 500"),
    ).toBeInTheDocument();

    expect(ref.current?.getCreateParameter()).toMatchObject({
      imageUrl: "",
      rootfsSize: "20",
    });
    expect(emitDataFun).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: "" }),
      false,
    );
  });

  it("adds environment variables, flags empty keys, and includes edited envs in launch parameters", async () => {
    const { ref } = renderStepTwo();

    await screen.findByRole("button", { name: "+ Add Environment Variable" });

    fireEvent.click(
      screen.getByRole("button", { name: "+ Add Environment Variable" }),
    );
    expect(
      screen.getByText("Environment variables key can not be empty."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText("key")[1], {
      target: { value: "TOKEN" },
    });
    fireEvent.change(screen.getAllByLabelText("value")[1], {
      target: { value: "abc" },
    });

    expect(ref.current?.getCreateParameter()).toMatchObject({
      envs: [
        { key: "API_KEY", value: "secret" },
        { key: "TOKEN", value: "abc" },
      ],
    });
  });

  it("validates invalid HTTP port input when image settings are valid", async () => {
    renderStepTwo();

    await screen.findByDisplayValue("8080");

    fireEvent.change(screen.getByDisplayValue("8080"), {
      target: { value: "70000" },
    });
    fireEvent.blur(screen.getByDisplayValue("70000"));

    expect(
      screen.getByText("Port can not be greater than 65535"),
    ).toBeInTheDocument();
  });

  it("adds a network volume and includes selected tools in launch parameters", async () => {
    const { ref } = renderStepTwo({
      ...baseCreateInstanceInfo(),
      storageId: "storage-a",
    });

    await screen.findByRole("button", { name: "+ Create Volume" });

    fireEvent.click(screen.getByRole("button", { name: "+ Create Volume" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "finish-volume" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Jupyter.*http: 8888/ }),
    );

    expect(localStorage.getItem("jupyter")).toBe("1");
    expect(ref.current?.getCreateParameter()).toMatchObject({
      tools: [{ name: "jupyter", port: 8888, type: "http" }],
      volumeMounts: expect.arrayContaining([
        expect.objectContaining({
          id: "storage-new",
          mountPath: "/network",
          size: 80,
          type: "network",
        }),
      ]),
    });
  });

  it("validates TCP ports", async () => {
    renderStepTwo({
      ...baseCreateInstanceInfo(),
      tcpPorts: "22",
    });

    fireEvent.change(await screen.findByDisplayValue("22"), {
      target: { value: "70000" },
    });
    fireEvent.blur(screen.getByDisplayValue("70000"));

    expect(
      screen.getByText("Port can not be greater than 65535"),
    ).toBeInTheDocument();
  });

  it("validates entrypoint length", async () => {
    renderStepTwo();

    fireEvent.change(screen.getByDisplayValue("/bin/bash"), {
      target: { value: "x".repeat(2048) },
    });
    fireEvent.blur(screen.getByDisplayValue("x".repeat(2048)));

    expect(
      screen.getByText("Entrypoint length cannot exceed 2047 characters"),
    ).toBeInTheDocument();
  });

  it("opens the invalid template flow from the ref and loads the editable template", async () => {
    const { ref } = renderStepTwo();

    await waitFor(() => {
      expect(ref.current).toBeTruthy();
    });

    act(() => {
      ref.current?.showInvalidTips()();
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "fix-template" }),
    );

    await waitFor(() => {
      expect(mockReqGetTemplateById).toHaveBeenCalledWith("official-a");
    });
    expect(screen.getByText("add-template-modal")).toBeInTheDocument();
  });
});
