import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SaveImage from "@/app/gpus-console/instances/components/saveImage";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqSaveImageInstance } from "@/api/gpu-instance/instances";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/settings", () => ({
  reqGetImageAuths: jest.fn(),
}));
jest.mock("@/api/gpu-instance/instances", () => ({
  reqSaveImageInstance: jest.fn(),
}));
jest.mock("@/lib/utils/dockerAddress", () => ({
  isValidDockerImageAddress: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: ({ onChange, value, placeholder }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e)}
    />
  ),
}));
jest.mock("@/components/ui/standard/selectFilter", () => ({
  SelectFilter: ({ onValueChange, onClear, options }: any) => (
    <div>
      {options.map((o: any) => (
        <button key={o.id} type="button" onClick={() => onValueChange?.(o.id)}>
          select {o.name}
        </button>
      ))}
      <button type="button" onClick={() => onClear?.()}>
        clear-cred
      </button>
    </div>
  ),
}));
jest.mock("@/app/gpus-console/image/components/addImagePrewarmJob", () => ({
  CurrModal: ({ children, open, title, onCancel }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button type="button" onClick={onCancel}>
          close-modal
        </button>
        {children}
      </div>
    ) : null,
}));
jest.mock("@/app/gpus-console/settings/components/imageAuth", () => ({
  __esModule: true,
  // call with no args to exercise the mark/id=false branch of addAuthValue
  default: ({ addModelValue }: any) => (
    <button type="button" onClick={() => addModelValue()}>
      add auth no-id
    </button>
  ),
}));

const mockGetAuths = reqGetImageAuths as jest.Mock;
const mockSaveImage = reqSaveImageInstance as jest.Mock;
const mockValidDocker = isValidDockerImageAddress as jest.Mock;
const mockError = message.error as jest.Mock;

describe("SaveImage more branches", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
    mockGetAuths.mockResolvedValue({
      data: [{ id: "auth-1", name: "cred-1" }],
    });
    mockSaveImage.mockResolvedValue({ jobId: "job-9" });
    mockValidDocker.mockReturnValue("");
  });
  afterEach(() => logSpy.mockRestore());

  it("errors when the image path contains a whitespace character", async () => {
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalled());
    fireEvent.change(
      screen.getByPlaceholderText("Please input your Image address"),
      { target: { value: "registry/ x:1" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(mockError).toHaveBeenCalledWith(
      "The image path can not be empty, and can not contain whitespace characters",
    );
    expect(mockSaveImage).not.toHaveBeenCalled();
  });

  it("clears the selected credential via onClear", async () => {
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalled());
    // select then clear -> credential becomes "" -> save then errors on missing cred
    fireEvent.click(screen.getByRole("button", { name: "select cred-1" }));
    fireEvent.click(screen.getByRole("button", { name: "clear-cred" }));
    fireEvent.change(
      screen.getByPlaceholderText("Please input your Image address"),
      { target: { value: "registry/x:1" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(mockError).toHaveBeenCalledWith(
      "The container registry credentials can not be empty",
    );
  });

  it("refreshes auths without selecting when add returns no id, then closes modal", async () => {
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalledTimes(1));
    fireEvent.click(
      screen.getByRole("button", { name: "select + Add Credentials" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Add Credential" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "add auth no-id" }));
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalledTimes(2));
    // modal closed after add
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Add Credential" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes the add-credential modal via cancel without refreshing", async () => {
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalledTimes(1));
    fireEvent.click(
      screen.getByRole("button", { name: "select + Add Credentials" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "close-modal" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Add Credential" }),
      ).not.toBeInTheDocument(),
    );
    // cancel path does not re-fetch auths
    expect(mockGetAuths).toHaveBeenCalledTimes(1);
  });
});
