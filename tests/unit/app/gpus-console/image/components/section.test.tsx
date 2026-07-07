import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import Section from "@/app/gpus-console/image/components/section";
import { reqGpuStorageBaseInfo } from "@/api/gpu-instance/storage";
import {
  reqEditGpuImagePrewarm,
  reqGpuImagePrewarm,
  reqGpuImagePrewarmQuota,
} from "@/api/gpu-instance/images";
import { message } from "@/components/ui/standard/notify";

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
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => true,
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
  CascadeFilter: ({ onClear, onValueChange, placeholder }: any) => (
    <div>
      <button type="button" onClick={() => onValueChange("cluster-us")}>
        {placeholder}
      </button>
      <button type="button" onClick={() => onClear()}>
        clear {placeholder}
      </button>
    </div>
  ),
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
  default: ({ finishForm, imageUrl, regionList }: any) => (
    <div>
      <span>add image prewarm {imageUrl || "manual"}</span>
      <span>regions {regionList.length}</span>
      <button type="button" onClick={() => finishForm(true)}>
        finish add prewarm
      </button>
    </div>
  ),
}));

jest.mock("@/app/gpus-console/image/components/deleteImagePrewarmJob", () => ({
  __esModule: true,
  default: ({ finishForm, ids }: any) => (
    <button type="button" onClick={() => finishForm(true)}>
      delete ids {ids.join(",")}
    </button>
  ),
}));

jest.mock("@/app/gpus-console/components/addTemplateInPrewarm", () => ({
  __esModule: true,
  default: ({ authId, finishForm, imageUrl, mode }: any) => (
    <button type="button" onClick={() => finishForm(true)}>
      {mode} template from {imageUrl} with {authId}
    </button>
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
  MyPagination: ({ onChange, renderItem }: any) => (
    <button
      type="button"
      onClick={() => {
        renderItem?.({ page: 2 });
        onChange?.({}, 2);
      }}
    >
      next page
    </button>
  ),
  MyTablePagination: ({ onRowsPerPageChange }: any) => (
    <button
      type="button"
      onClick={() => onRowsPerPageChange?.({ target: { value: "25" } })}
    >
      rows per page
    </button>
  ),
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
const mockReqEditGpuImagePrewarm = reqEditGpuImagePrewarm as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;

const imageJobs = [
  {
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
  },
];

function renderSection() {
  render(<Section />);
}

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
  mockReqGpuImagePrewarm.mockResolvedValue({
    data: imageJobs,
    total: 1,
  });
  mockReqGpuImagePrewarmQuota.mockResolvedValue({
    limit: 5,
    perImageSize: 20,
    total: 1,
  });
  mockReqEditGpuImagePrewarm.mockResolvedValue({});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("GPU image prewarm section", () => {
  it("loads jobs and sends filters, pagination, and docs actions with API params", async () => {
    renderSection();

    expect(await screen.findByText("ubuntu base")).toBeInTheDocument();
    expect(screen.getByText("Image Size: 1.5 GB")).toBeInTheDocument();
    expect(screen.getByText("job Succeeded")).toBeInTheDocument();
    expect(screen.getByText(/quota 20%/)).toBeInTheDocument();
    expect(mockReqGpuStorageBaseInfo).toHaveBeenCalledWith({});
    expect(mockReqGpuImagePrewarmQuota).toHaveBeenCalledWith({});
    expect(mockReqGpuImagePrewarm).toHaveBeenCalledWith({
      clusterId: "",
      name: "",
      page: 1,
      pageSize: 10,
      state: "",
    });

    await clickAndFlush(screen.getByText("Image Name/Remarks"));
    expect(mockReqGpuImagePrewarm).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "ubuntu", page: 1, pageSize: 10 }),
    );

    await clickAndFlush(screen.getByText("Region"));
    expect(mockReqGpuImagePrewarm).toHaveBeenLastCalledWith(
      expect.objectContaining({ clusterId: "cluster-us", page: 1 }),
    );

    await clickAndFlush(screen.getByText("clear Region"));
    expect(mockReqGpuImagePrewarm).toHaveBeenLastCalledWith(
      expect.objectContaining({ clusterId: "", page: 1 }),
    );

    await clickAndFlush(screen.getByText("Running"));
    expect(mockReqGpuImagePrewarm).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, state: "Running" }),
    );

    await clickAndFlush(screen.getAllByText("All Status")[1]);
    expect(mockReqGpuImagePrewarm).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, state: "" }),
    );

    await clickAndFlush(screen.getByText("rows per page"));
    expect(mockReqGpuImagePrewarm).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, pageSize: 25 }),
    );

    await clickAndFlush(screen.getByText("next page"));
    expect(mockReqGpuImagePrewarm).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, pageSize: 25 }),
    );

    fireEvent.click(screen.getByText("standard storage fees"));
    fireEvent.click(screen.getByText("View the help docs"));
    expect(window.open).toHaveBeenCalledWith(
      "https://docs.test/gpu-fee",
      "_blank",
    );
    expect(window.open).toHaveBeenCalledWith(
      "https://docs.test/image-prewarm",
      "_blank",
    );
  });

  it("opens the prewarm dialog from query params and refreshes after child success", async () => {
    mockSearchParams = new URLSearchParams(
      "prewarm=1&imageId=registry.test/app:1",
    );
    mockUseSearchParams.mockImplementation(() => mockSearchParams);

    renderSection();

    expect(
      await screen.findByText("add image prewarm registry.test/app:1"),
    ).toBeInTheDocument();
    expect(screen.getByText("regions 0")).toBeInTheDocument();
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      "",
      expect.stringMatching(/^[^?]*$/),
    );

    const callsBeforeFinish = mockReqGpuImagePrewarm.mock.calls.length;
    await clickAndFlush(screen.getByText("finish add prewarm"));

    await waitFor(() => {
      expect(mockReqGpuImagePrewarm.mock.calls.length).toBeGreaterThan(
        callsBeforeFinish,
      );
    });
    expect(mockReqGpuImagePrewarmQuota).toHaveBeenCalledTimes(2);
  });

  it("validates and saves remarks through the edit modal", async () => {
    renderSection();

    await screen.findByText("ubuntu base");
    fireEvent.click(document.querySelector(".icon-pencil-line") as Element);
    const textarea = screen.getByPlaceholderText("Input Remarks");

    fireEvent.change(textarea, { target: { value: "x".repeat(101) } });
    await clickAndFlush(screen.getByText("Confirm"));
    expect(message.error).toHaveBeenCalledWith(
      "Remarks length cannot exceed 100 characters",
    );
    expect(mockReqEditGpuImagePrewarm).not.toHaveBeenCalled();

    fireEvent.change(textarea, { target: { value: "  production image  " } });
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(mockReqEditGpuImagePrewarm).toHaveBeenCalledWith({
        id: "job-1",
        note: "production image",
      });
    });
    expect(message.success).toHaveBeenCalledWith("Operation successful");
    expect(mockReqGpuImagePrewarmQuota).toHaveBeenCalledTimes(2);
  });

  it("handles batch delete and save-template completion paths", async () => {
    renderSection();

    await screen.findByText("ubuntu base");
    fireEvent.click(screen.getByText("Batch Operation"));
    fireEvent.click(screen.getByText("Confirm Delete"));
    expect(message.error).toHaveBeenCalledWith(
      "Please select the data to be deleted.",
    );

    fireEvent.click(screen.getByLabelText("select image prewarm task"));
    fireEvent.click(screen.getByText("Confirm Delete"));
    expect(
      screen.getByRole("dialog", { name: "Delete Confirmation" }),
    ).toBeInTheDocument();
    await clickAndFlush(screen.getByText("delete ids job-1"));

    await waitFor(() => {
      expect(mockReqGpuImagePrewarmQuota).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText("Batch Operation")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Save as Template"));
    await clickAndFlush(
      screen.getByText(
        "Create template from registry.test/ubuntu:latest with auth-1",
      ),
    );
    expect(message.success).toHaveBeenCalledWith("Operation successful");
  });

  it("clears stale batch selections when refreshed data no longer contains them", async () => {
    renderSection();

    await screen.findByText("ubuntu base");
    fireEvent.click(screen.getByText("Batch Operation"));
    fireEvent.click(screen.getByLabelText("select image prewarm task"));

    mockReqGpuImagePrewarm.mockResolvedValueOnce({
      data: [{ ...imageJobs[0], id: "job-2", imageName: "replacement image" }],
      total: 1,
    });
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await screen.findByText("replacement image");
    fireEvent.click(screen.getByText("Confirm Delete"));
    expect(message.error).toHaveBeenCalledWith(
      "Please select the data to be deleted.",
    );
  });
});
