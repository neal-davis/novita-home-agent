import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import MountNetVolume from "@/app/gpus-console/instances/components/mountNetVolume";
import { reqInstanceMount } from "@/api/gpu-instance/instances";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqInstanceMount: jest.fn(),
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

const instanceInfoObj = { clusterId: "cluster-a", id: "instance-a" };
const allVolumeList = [
  { id: "vol-a", name: "Volume A" },
  { id: "vol-b", name: "Volume B" },
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

describe("MountNetVolume — more branches", () => {
  it("rejects a path that does not start with a slash and a bare slash path", () => {
    renderMount([{ id: "vol-a", path: "data" }]);
    confirm();
    expect(message.error).toHaveBeenCalledWith(
      "Please enter a valid cloud storage mount path",
    );

    cleanup();
    (message.error as jest.Mock).mockClear();
    renderMount([{ id: "vol-a", path: "/" }]);
    confirm();
    expect(message.error).toHaveBeenCalledWith(
      "Please enter a valid cloud storage mount path",
    );
    expect(mockReqInstanceMount).not.toHaveBeenCalled();
  });

  it("opens the confirm dialog for an empty list change (rows removed)", () => {
    renderMount([{ id: "vol-a", path: "/data" }]);

    // remove the only row -> newBindList empty, differs from bindList
    fireEvent.click(document.querySelector(".icon-delete") as Element);
    expect(screen.getByText("Storage Configuration (0)")).toBeInTheDocument();

    confirm();
    // empty list skips the per-row validation loop and opens confirmation
    expect(screen.getByRole("dialog", { name: "Tips" })).toHaveTextContent(
      "Cloud storage mounts will be changed to 0 (from 1)",
    );
  });

  it("treats both empty lists as unchanged and refuses to open confirmation", () => {
    renderMount([]);
    confirm();
    expect(message.error).toHaveBeenCalledWith(
      "There is no change in the existing cloud storage data, please confirm",
    );
    expect(
      screen.queryByRole("dialog", { name: "Tips" }),
    ).not.toBeInTheDocument();
  });

  it("scrolls to bottom when a new mount row is appended", () => {
    renderMount([{ id: "vol-a", path: "/data" }]);
    fireEvent.click(screen.getByText("Add Mount"));
    expect(screen.getByText("Storage Configuration (2)")).toBeInTheDocument();
    // requestAnimationFrame callback runs scrollTo on the list container
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalled();
  });

  it("changes a selected volume and closes the confirm dialog without submitting", () => {
    renderMount([{ id: "vol-a", path: "/old" }]);

    // select a different volume, change path -> list now differs
    fireEvent.click(screen.getByText("Volume B"));
    fireEvent.change(screen.getByLabelText("mount path"), {
      target: { value: "/new" },
    });
    confirm();
    expect(screen.getByRole("dialog", { name: "Tips" })).toBeInTheDocument();

    // dismiss confirmation -> no mount request
    fireEvent.click(screen.getByText("close confirm"));
    expect(mockReqInstanceMount).not.toHaveBeenCalled();
  });
});
