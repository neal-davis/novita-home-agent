import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import MountNetVolume from "@/app/gpus-console/instances/components/mountNetVolume";
import { reqInstanceMount } from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqInstanceMount: jest.fn(),
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
  Input: ({ className, onChange, value }: any) => (
    <input
      aria-label="mount path"
      className={className}
      onChange={(event) => onChange?.(event)}
      value={value ?? ""}
    />
  ),
}));

jest.mock("@/components/ui/standard/confirm-dialog", () => ({
  ConfirmDialog: ({
    description,
    onConfirm,
    onOpenChange,
    open,
    title,
  }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {description}
        <button onClick={onConfirm} type="button">
          apply mount changes
        </button>
        <button onClick={() => onOpenChange(false)} type="button">
          close confirm
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/select", () => {
  let selectValueChange = (_: string) => {};

  return {
    Select: ({ children, onValueChange, value }: any) => {
      selectValueChange = onValueChange;
      return <div data-value={value}>{children}</div>;
    },
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => (
      <button onClick={() => selectValueChange(value)} type="button">
        {children}
      </button>
    ),
    SelectTrigger: ({ children, className }: any) => (
      <div className={className}>{children}</div>
    ),
    SelectValue: () => <span>selected storage</span>,
  };
});

const mockReqInstanceMount = reqInstanceMount as jest.Mock;

const instanceInfoObj = {
  clusterId: "cluster-a",
  id: "instance-a",
};

const allVolumeList = [
  { id: "vol-a", name: "Volume A" },
  { id: "vol-b", name: "Volume B" },
  { id: "vol-c", name: "Volume C" },
];

function renderMount(bindList: Array<{ id?: string; path?: string }> = []) {
  const finishForm = jest.fn();
  render(
    <MountNetVolume
      allVolumeList={allVolumeList}
      bindList={bindList}
      finishForm={finishForm}
      instanceInfoObj={instanceInfoObj}
    />,
  );
  return finishForm;
}

function confirm() {
  fireEvent.click(screen.getAllByText("Confirm").at(-1) as Element);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockReqInstanceMount.mockResolvedValue({ ok: true });
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 1;
  };
  HTMLElement.prototype.scrollTo = jest.fn();
});

describe("MountNetVolume", () => {
  it("rejects empty storage, invalid mount paths, duplicate storage, and duplicate paths", () => {
    renderMount([{ id: "", path: "/data" }]);
    confirm();
    expect(message.error).toHaveBeenCalledWith(
      "Please select the cloud storage to mount",
    );

    cleanup();
    renderMount([{ id: "vol-a", path: "data path" }]);
    confirm();
    expect(message.error).toHaveBeenCalledWith(
      "Please enter a valid cloud storage mount path",
    );

    cleanup();
    renderMount([
      { id: "vol-a", path: "/data-a" },
      { id: "vol-a", path: "/data-b" },
    ]);
    confirm();
    expect(message.error).toHaveBeenCalledWith(
      "Please select a different cloud storage",
    );

    cleanup();
    renderMount([
      { id: "vol-a", path: "/data" },
      { id: "vol-b", path: "/data" },
    ]);
    confirm();
    expect(message.error).toHaveBeenCalledWith(
      "Please enter a different cloud storage mount path",
    );
    expect(mockReqInstanceMount).not.toHaveBeenCalled();
  });

  it("rejects unchanged storage configuration before opening confirmation", () => {
    renderMount([{ id: "vol-a", path: "/data" }]);

    confirm();

    expect(message.error).toHaveBeenCalledWith(
      "There is no change in the existing cloud storage data, please confirm",
    );
    expect(
      screen.queryByRole("dialog", { name: "Tips" }),
    ).not.toBeInTheDocument();
  });

  it("adds, removes, cancels, and enforces the 30 mount limit", () => {
    const finishForm = renderMount();

    fireEvent.click(screen.getByText("Add Mount"));
    expect(screen.getByText("Storage Configuration (1)")).toBeInTheDocument();

    fireEvent.click(document.querySelector(".icon-delete") as Element);
    expect(screen.getByText("Storage Configuration (0)")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(finishForm).toHaveBeenCalledWith(false);

    cleanup();
    const thirtyMounts = Array.from({ length: 30 }, (_, index) => ({
      id: `vol-${index}`,
      path: `/data-${index}`,
    }));
    renderMount(thirtyMounts);
    fireEvent.click(screen.getAllByText("Add Mount").at(-1) as Element);
    expect(message.error).toHaveBeenCalledWith(
      "Maximum 30 mounts allowed. Please unmount some storage first",
    );
  });

  it("confirms changed mounts and submits instance mount payload", async () => {
    const finishForm = renderMount([{ id: "vol-a", path: "/old" }]);

    fireEvent.click(screen.getByText("Volume B"));
    fireEvent.change(screen.getByLabelText("mount path"), {
      target: { value: "/new-data" },
    });
    confirm();

    expect(screen.getByRole("dialog", { name: "Tips" })).toHaveTextContent(
      "Cloud storage mounts will be changed to 1 (from 1)",
    );
    fireEvent.click(screen.getByText("apply mount changes"));

    await waitFor(() => {
      expect(mockReqInstanceMount).toHaveBeenCalledWith({
        clusterId: "cluster-a",
        instanceId: "instance-a",
        mountPath: ["/new-data"],
        volumeIds: ["vol-b"],
      });
    });
    expect(message.success).toHaveBeenCalledWith("success");
    expect(finishForm).toHaveBeenCalledWith(true);
  });
});
