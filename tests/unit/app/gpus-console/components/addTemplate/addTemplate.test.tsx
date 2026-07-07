import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddTemplate from "@/app/gpus-console/components/addTemplate";
import {
  reqAddTemplate,
  reqStorageLocalFree,
  reqUpdateTemplate,
} from "@/api/gpu-instance/templates";
import { reqMarketQueryOptions } from "@/api/gpu-instance/explore";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/templates", () => ({
  reqAddTemplate: jest.fn(),
  reqStorageLocalFree: jest.fn(),
  reqUpdateTemplate: jest.fn(),
}));

jest.mock("@/api/gpu-instance/explore", () => ({
  reqMarketQueryOptions: jest.fn(),
}));

jest.mock("@/api/gpu-instance/settings", () => ({
  reqGetImageAuths: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({
    children,
    onCancel,
    open,
  }: {
    children: React.ReactNode;
    onCancel?: () => void;
    open: boolean;
  }) =>
    open ? (
      <div role="dialog">
        <button onClick={onCancel} type="button">
          close-modal
        </button>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    id,
    onClick,
    type = "button",
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    id?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
  }) => (
    <button data-testid={id} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    className,
    onChange,
    placeholder,
    value,
  }: {
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    value?: string | number;
  }) => (
    <input
      className={className}
      onChange={onChange}
      placeholder={placeholder}
      value={value ?? ""}
    />
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    onChange,
    value,
  }: {
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    value?: string;
  }) => <textarea onChange={onChange} value={value ?? ""} />,
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
  }: {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <button onClick={() => onCheckedChange?.(!checked)} type="button">
      checkbox-{checked ? "checked" : "unchecked"}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
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
    <>{children}</>
  ),
}));

jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({
    getOptionLabel,
    onClear,
    onValueChange,
    options,
    value,
  }: {
    getOptionLabel?: (item: any) => string;
    onClear?: () => void;
    onValueChange?: (value: string) => void;
    options: any[];
    value?: string;
  }) => (
    <div data-testid="select-filter" data-value={value || ""}>
      {options.map((item) => {
        const label = getOptionLabel ? getOptionLabel(item) : String(item);
        const optionValue = item?.id ?? item;
        return (
          <button
            key={String(optionValue)}
            onClick={() => onValueChange?.(String(optionValue))}
            type="button"
          >
            {label}
          </button>
        );
      })}
      <button onClick={onClear} type="button">
        clear-select
      </button>
    </div>
  ),
}));

jest.mock("md-editor-rt", () => ({
  MdEditor: ({ modelValue }: { modelValue?: string }) => (
    <div data-testid="md-editor">{modelValue}</div>
  ),
}));

jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  default: ({ addModelValue }: { addModelValue?: () => void }) => (
    <button onClick={addModelValue} type="button">
      image-auth-form
    </button>
  ),
}));

jest.mock("@/lib/utils/utils", () => ({
  checkEnvs: jest.fn(() => ""),
  checkHttpTcpPortSame: jest.fn(() => ""),
  checkPorts: jest.fn((ports: string[]) => {
    const cleaned = ports.map((port) => port.trim()).filter(Boolean);
    return ["", cleaned];
  }),
  dealParamsText: jest.fn((template: string, params: Record<string, string>) =>
    template.replace(/\$\{0\}/g, String(params[0])),
  ),
  generateRandomString: jest.fn(() => "tmpl-1234"),
}));

jest.mock("@/lib/utils/dockerAddress", () => ({
  isValidDockerImageAddress: jest.fn(() => ""),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    GPUS_CONSOLE: {
      EXPLORE_CREATE_MY_TEMPLATE_CANCEL: "cancel-template",
      EXPLORE_CREATE_MY_TEMPLATE_SAVE: "save-template-out",
      TEMPLATES_CREATE_TEMPLATE: "create-template",
      TEMPLATES_EDIT_TEMPLATE: "edit-template",
    },
  },
}));

jest.mock("lucide-react", () => ({
  ChevronDown: () => <span data-testid="chevron-down" />,
}));

const mockReqAddTemplate = reqAddTemplate as jest.Mock;
const mockReqUpdateTemplate = reqUpdateTemplate as jest.Mock;
const mockReqStorageLocalFree = reqStorageLocalFree as jest.Mock;
const mockReqMarketQueryOptions = reqMarketQueryOptions as jest.Mock;
const mockReqGetImageAuths = reqGetImageAuths as jest.Mock;
const mockMessage = message as {
  error: jest.Mock;
  success: jest.Mock;
};

describe("AddTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReqAddTemplate.mockResolvedValue({ templateId: "template-created" });
    mockReqUpdateTemplate.mockResolvedValue({ templateId: "template-updated" });
    mockReqStorageLocalFree.mockResolvedValue({
      freeLocalStorage: 60,
      freeRootFS: 30,
      maxLocalStorage: 200,
      maxRootFS: 100,
      minLocalStorage: 0,
      minRootFS: 10,
    });
    mockReqMarketQueryOptions.mockResolvedValue({ cudaVersions: ["12.1"] });
    mockReqGetImageAuths.mockResolvedValue({
      data: [{ id: "auth-1", name: "Private registry" }],
    });
  });

  it("blocks create when the required image field is empty", async () => {
    render(
      <AddTemplate
        finishForm={jest.fn()}
        mode="Create"
        updateList={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockReqStorageLocalFree).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Template" }));

    expect(mockMessage.error).toHaveBeenCalledWith(
      "Please input the template image, max length 500",
    );
    expect(mockReqAddTemplate).not.toHaveBeenCalled();
  });

  it("updates an edited template with parsed ports, envs, and registry auth", async () => {
    const finishForm = jest.fn();
    const templateObj = {
      Id: "template-1",
      channel: "private",
      entrypoint: " /bin/bash ",
      envs: [{ key: "TOKEN", value: "secret" }],
      image: "novitalabs/pytorch:latest",
      imageAuth: "auth-1",
      minCudaVersion: "12.1",
      name: "CUDA Template",
      ports: [
        { type: "http", ports: ["8080"] },
        { type: "tcp", ports: ["6006"] },
      ],
      readme: "Usage notes",
      rootfsSize: "40",
      startCommand: "python train.py",
      volumes: [],
    };

    render(
      <AddTemplate
        finishForm={finishForm}
        mode="Edit"
        templateObj={templateObj}
      />,
    );

    await waitFor(() => {
      expect(mockReqStorageLocalFree).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Template" }));

    await waitFor(() => {
      expect(mockReqUpdateTemplate).toHaveBeenCalledWith({
        template: expect.objectContaining({
          Id: "template-1",
          channel: "private",
          entrypoint: "/bin/bash",
          envs: [{ key: "TOKEN", value: "secret" }],
          image: "novitalabs/pytorch:latest",
          imageAuth: "auth-1",
          name: "CUDA Template",
          ports: [
            { type: "http", ports: ["8080"] },
            { type: "tcp", ports: ["6006"] },
          ],
          rootfsSize: "40",
          startCommand: "python train.py",
          volumes: [],
        }),
      });
    });
    expect(finishForm).toHaveBeenCalledWith(true);
  });
});
