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
  SelectFilter: ({ onValueChange, options }: any) => (
    <div>
      {options.map((o: any) => (
        <button key={o.id} type="button" onClick={() => onValueChange?.(o.id)}>
          select {o.name}
        </button>
      ))}
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
  default: ({ addModelValue }: any) => (
    <button type="button" onClick={() => addModelValue(true, "auth-new")}>
      add auth confirm
    </button>
  ),
}));

const mockGetAuths = reqGetImageAuths as jest.Mock;
const mockSaveImage = reqSaveImageInstance as jest.Mock;
const mockValidDocker = isValidDockerImageAddress as jest.Mock;
const mockError = message.error as jest.Mock;
const mockSuccess = message.success as jest.Mock;

describe("SaveImage modal", () => {
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

  it("errors when the image path is empty", async () => {
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mockError).toHaveBeenCalledWith(
      "The image path can not be empty, and can not contain whitespace characters",
    );
    expect(mockSaveImage).not.toHaveBeenCalled();
  });

  it("errors when docker address is invalid", async () => {
    mockValidDocker.mockReturnValue("bad image");
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalled());

    fireEvent.change(
      screen.getByPlaceholderText("Please input your Image address"),
      { target: { value: "registry/x:1" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mockError).toHaveBeenCalledWith("bad image");
    expect(mockSaveImage).not.toHaveBeenCalled();
  });

  it("errors when credentials are missing", async () => {
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={jest.fn()} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalled());

    fireEvent.change(
      screen.getByPlaceholderText("Please input your Image address"),
      { target: { value: "registry/x:1" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mockError).toHaveBeenCalledWith(
      "The container registry credentials can not be empty",
    );
  });

  it("submits successfully with valid image and credentials", async () => {
    const finishForm = jest.fn();
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={finishForm} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalled());

    fireEvent.change(
      screen.getByPlaceholderText("Please input your Image address"),
      { target: { value: "registry/x:1" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "select cred-1" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockSaveImage).toHaveBeenCalledWith({
        instanceId: "i-1",
        image: "registry/x:1",
        registryAuthId: "auth-1",
      });
      expect(mockSuccess).toHaveBeenCalledWith("success");
      expect(finishForm).toHaveBeenCalledWith(
        true,
        expect.objectContaining({ id: "i-1", jobId: "job-9" }),
      );
    });
  });

  it("opens the add-credential modal and refreshes auths after adding", async () => {
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

    fireEvent.click(screen.getByRole("button", { name: "add auth confirm" }));
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalledTimes(2));
  });

  it("closes via cancel button", async () => {
    const finishForm = jest.fn();
    render(
      <SaveImage instanceInfoObj={{ id: "i-1" }} finishForm={finishForm} />,
    );
    await waitFor(() => expect(mockGetAuths).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith();
  });
});
