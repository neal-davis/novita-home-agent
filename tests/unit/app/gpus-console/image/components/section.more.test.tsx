import { act, fireEvent, render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import Section from "@/app/gpus-console/image/components/section";
import { reqGpuStorageBaseInfo } from "@/api/gpu-instance/storage";
import {
  reqGpuImagePrewarm,
  reqGpuImagePrewarmQuota,
} from "@/api/gpu-instance/images";
import { usePermission } from "@/lib/hooks/usePermission";

let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/api/gpu-instance/storage", () => ({
  reqGpuStorageBaseInfo: jest.fn(),
}));

jest.mock("@/api/gpu-instance/images", () => ({
  reqEditGpuImagePrewarm: jest.fn(),
  reqGpuImagePrewarm: jest.fn(),
  reqGpuImagePrewarmQuota: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: jest.fn(() => true),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, ...props }: any) => (
    <button disabled={disabled} onClick={onClick} type="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input value={value} onChange={(event) => onChange?.(event)} {...props} />
  ),
  SearchInput: ({ onSearch, placeholder, value }: any) => (
    <button type="button" onClick={() => onSearch("ubuntu")}>
      {value || placeholder}
    </button>
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ onChange, value, ...props }: any) => (
    <textarea
      value={value}
      onChange={(event) => onChange?.(event)}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/select", () => {
  const React = jest.requireActual("react");
  const SelectContext = React.createContext({
    onValueChange: (_value: string) => {},
  });
  return {
    Select: ({ children, onValueChange }: any) => (
      <SelectContext.Provider value={{ onValueChange }}>
        <div>{children}</div>
      </SelectContext.Provider>
    ),
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => {
      const ctx = React.useContext(SelectContext);
      return (
        <button type="button" onClick={() => ctx.onValueChange(value)}>
          {children}
        </button>
      );
    },
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  };
});

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      aria-label="select image prewarm task"
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      type="checkbox"
    />
  ),
}));

jest.mock("@/components/ui/standard/cascade-filter", () => ({
  CascadeFilter: ({ placeholder }: any) => <div>{placeholder}</div>,
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span title={typeof title === "string" ? title : undefined}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/standard/progress", () => ({
  ProgressCircle: ({ percent }: any) => <span>quota {percent}%</span>,
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: ({ title }: any) => <div>{title}</div>,
}));

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, footer, onCancel, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button type="button" onClick={onCancel}>
          close {title}
        </button>
        {children}
        {footer}
      </div>
    ) : null,
}));

jest.mock("@/app/gpus-console/image/components/addImagePrewarmJob", () => ({
  __esModule: true,
  default: ({ imageUrl, regionList }: any) => (
    <div>
      <span>add image prewarm {imageUrl || "manual"}</span>
      <span>regions {regionList.length}</span>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/image/components/deleteImagePrewarmJob", () => ({
  __esModule: true,
  default: ({ ids }: any) => <span>delete ids {ids.join(",")}</span>,
}));

jest.mock("@/app/gpus-console/components/addTemplateInPrewarm", () => ({
  __esModule: true,
  default: ({ finishForm }: any) => (
    <div>
      <button type="button" onClick={() => finishForm(true)}>
        finish template success
      </button>
      <button type="button" onClick={() => finishForm(false)}>
        finish template cancel
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/image/components/jobState", () => ({
  __esModule: true,
  default: ({ reason, state }: any) => (
    <span>
      job {state} {reason}
    </span>
  ),
}));

jest.mock("@/app/gpus-console/components/myPagination", () => ({
  MyPagination: () => <span>pagination</span>,
  MyTablePagination: () => <span>table pagination</span>,
  PaginationItem: ({ page }: any) => <span>page item {page}</span>,
}));

jest.mock("@/lib/utils/date", () => ({
  sliceUTCString: (value: string) => `date:${value}`,
}));

jest.mock("@/constants/urls", () => ({
  DOCS_URL: {
    GPU_INSTANCE_FEE: "https://docs.test/gpu-fee",
    IMAGE_PRE_WARM: "https://docs.test/image-prewarm",
  },
  SUPPORT_EMAIL_LINK: "support@example.com",
}));

const mockReqGpuStorageBaseInfo = reqGpuStorageBaseInfo as jest.Mock;
const mockReqGpuImagePrewarm = reqGpuImagePrewarm as jest.Mock;
const mockReqGpuImagePrewarmQuota = reqGpuImagePrewarmQuota as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;
const mockUsePermission = usePermission as jest.Mock;

const baseJob = {
  clusterName: "US East",
  completeTime: "0",
  createTime: "1700000000",
  id: "job-1",
  imageName: "ubuntu base",
  imageSize: 1024 * 1024 * 1024 * 1.5,
  imageUrl: "registry.test/ubuntu:latest",
  note: "initial note",
  products: [{ productName: "RTX 4090" }, { productName: "A100" }],
  reason: "",
  repositoryAuth: "auth-1",
  state: "Succeeded",
};

async function clickAndFlush(element: Element) {
  await act(async () => {
    fireEvent.click(element);
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockSearchParams = new URLSearchParams();
  mockUseSearchParams.mockImplementation(() => mockSearchParams);
  mockUsePermission.mockReturnValue(true);
  jest.spyOn(window.history, "replaceState").mockImplementation(jest.fn());
  jest.spyOn(window, "open").mockImplementation(jest.fn());
  mockReqGpuStorageBaseInfo.mockResolvedValue({
    clusters: [
      {
        continent: "North America",
        id: "cluster-us",
        name: "US East",
        version: "v2",
      },
      { continent: "Asia", id: "cluster-old", name: "Legacy", version: "v1" },
    ],
  });
  mockReqGpuImagePrewarm.mockResolvedValue({ data: [baseJob], total: 1 });
  mockReqGpuImagePrewarmQuota.mockResolvedValue({
    limit: 5,
    perImageSize: 20,
    total: 1,
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("GPU image prewarm section — extra branches", () => {
  it("disables create button and shows 100% quota when the limit is reached", async () => {
    mockReqGpuImagePrewarmQuota.mockResolvedValue({
      limit: 5,
      perImageSize: 20,
      total: 5,
    });
    render(<Section />);

    // quota total>=limit -> create button is disabled and quota ring at 100%
    await screen.findByText("ubuntu base");
    await screen.findByText("quota 100%");
    const createBtn = screen.getByText("Create Image Prewarm Task");
    expect(createBtn).toBeDisabled();
    // clicking the disabled button is a no-op (still no modal)
    fireEvent.click(createBtn);
    expect(screen.queryByText(/add image prewarm/)).not.toBeInTheDocument();
  });

  it("maps missing quota fields to dashes", async () => {
    mockReqGpuImagePrewarmQuota.mockResolvedValue({});
    render(<Section />);

    await screen.findByText("ubuntu base");
    // total/limit/perImageSize all render as "-"
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    // perImageSize falls back to "-" rendered before the "GB" suffix
    expect(
      screen.getByText((_content, node) => node?.textContent === "-GB"),
    ).toBeInTheDocument();
  });

  it("formats integer and zero-byte sizes and renders single/no product and time variants", async () => {
    mockReqGpuImagePrewarm.mockResolvedValue({
      data: [
        {
          ...baseJob,
          id: "job-int",
          imageName: "integer image",
          imageSize: 2 * 1024 * 1024 * 1024,
          products: [{ productName: "RTX 4090" }],
          createTime: "0",
          completeTime: "1700000000",
        },
        {
          ...baseJob,
          id: "job-zero",
          imageName: "zero image",
          imageSize: 0,
          products: [],
          createTime: "0",
          completeTime: "0",
        },
      ],
      total: 2,
    });
    render(<Section />);

    await screen.findByText("integer image");
    // integer GB -> no decimal
    expect(screen.getByText("Image Size: 2 GB")).toBeInTheDocument();
    // zero bytes
    expect(screen.getByText("Image Size: 0 B")).toBeInTheDocument();
    // single product -> "US East - RTX 4090", no ellipsis tooltip
    expect(
      screen.getByText("Region/ GPU type: US East - RTX 4090"),
    ).toBeInTheDocument();
    // empty products -> just cluster name
    expect(screen.getByText("Region/ GPU type: US East")).toBeInTheDocument();
    expect(screen.queryByText("...")).not.toBeInTheDocument();
    // createTime "0" -> "-", completeTime valid -> formatted date
    expect(screen.getAllByText(/Creation Time: -/).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Completion Time: date:/).length,
    ).toBeGreaterThan(0);
  });

  it("hides create, batch, edit, and row action controls when permissions are absent", async () => {
    mockUsePermission.mockReturnValue(false);
    render(<Section />);

    await screen.findByText("ubuntu base");
    expect(
      screen.queryByText("Create Image Prewarm Task"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Batch Operation")).not.toBeInTheDocument();
    expect(screen.queryByText("Save as Template")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(document.querySelector(".icon-pencil-line")).toBeNull();
  });

  it("opens the add modal from the create button and cancels it", async () => {
    render(<Section />);

    await screen.findByText("ubuntu base");
    await clickAndFlush(screen.getByText("Create Image Prewarm Task"));

    // opened in manual mode and forwards the v2-filtered region list (1 region)
    expect(screen.getByText("add image prewarm manual")).toBeInTheDocument();
    expect(screen.getByText("regions 1")).toBeInTheDocument();

    await clickAndFlush(screen.getByText("close Create Image Prewarm Task"));
    expect(
      screen.queryByText("add image prewarm manual"),
    ).not.toBeInTheDocument();
  });

  it("opens a single-row delete dialog and cancels it without refetching quota", async () => {
    render(<Section />);

    await screen.findByText("ubuntu base");
    const quotaCallsBefore = mockReqGpuImagePrewarmQuota.mock.calls.length;

    await clickAndFlush(screen.getByText("Delete"));
    expect(screen.getByText("delete ids job-1")).toBeInTheDocument();

    await clickAndFlush(screen.getByText("close Delete Confirmation"));
    expect(screen.queryByText("delete ids job-1")).not.toBeInTheDocument();
    // cancel path does not trigger a quota refresh
    expect(mockReqGpuImagePrewarmQuota.mock.calls.length).toBe(
      quotaCallsBefore,
    );
  });

  it("cancels the save-template flow without a success message", async () => {
    const { message } = jest.requireMock("@/components/ui/standard/notify");
    render(<Section />);

    await screen.findByText("ubuntu base");
    await clickAndFlush(screen.getByText("Save as Template"));
    await clickAndFlush(screen.getByText("finish template cancel"));

    expect(message.success).not.toHaveBeenCalled();
    expect(
      screen.queryByText("finish template cancel"),
    ).not.toBeInTheDocument();
  });

  it("closes the edit-remarks modal via the Cancel button", async () => {
    render(<Section />);

    await screen.findByText("ubuntu base");
    fireEvent.click(document.querySelector(".icon-pencil-line") as Element);
    expect(screen.getByPlaceholderText("Input Remarks")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByPlaceholderText("Input Remarks"),
    ).not.toBeInTheDocument();
  });
});
