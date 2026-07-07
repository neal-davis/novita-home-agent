import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import AddAdapterModal from "@/app/models-console/llm-dedicated-endpoints/components/AddAdapterModal";
import { checkLoraAdapters } from "@/api/dedicated-endpoint";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/dedicated-endpoint", () => ({
  checkLoraAdapters: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/app/components/Tooltip", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockCheck = checkLoraAdapters as jest.Mock;

function setup(props: Record<string, unknown> = {}) {
  const onClose = jest.fn();
  const onAdapterSave = jest.fn().mockResolvedValue(undefined);
  const utils = render(
    <AddAdapterModal
      show
      onClose={onClose}
      onAdapterSave={onAdapterSave}
      baseModel="owner/base"
      loraAdapters={[]}
      {...props}
    />,
  );
  return { onClose, onAdapterSave, ...utils };
}

describe("AddAdapterModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockCheck.mockResolvedValue({ results: [{ isValid: true }] });
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("does not render when show is false", () => {
    setup({ show: false });
    expect(screen.queryByText("Add adapter")).not.toBeInTheDocument();
  });

  it("renders title and empty state", () => {
    setup();
    expect(screen.getByText("Add adapter")).toBeInTheDocument();
    expect(screen.getByText("No adapter added")).toBeInTheDocument();
  });

  it("validates input via debounce and shows success", async () => {
    setup();
    const input = screen.getByPlaceholderText(/Hugging Face adapter/);
    fireEvent.change(input, { target: { value: "owner/lora-a" } });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(mockCheck).toHaveBeenCalledWith({
        baseModel: "owner/base",
        hfToken: undefined,
        loraAdapters: ["owner/lora-a"],
      }),
    );
    expect(
      screen.getByText(
        "LoRA adapter successfully matched with the base model.",
      ),
    ).toBeInTheDocument();
  });

  it("shows error message on invalid adapter", async () => {
    mockCheck.mockResolvedValue({
      results: [{ isValid: false, errorMsg: "bad adapter" }],
    });
    setup();
    fireEvent.change(screen.getByPlaceholderText(/Hugging Face adapter/), {
      target: { value: "owner/lora-bad" },
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(screen.getByText("bad adapter")).toBeInTheDocument(),
    );
  });

  it("shows generic error when check throws", async () => {
    mockCheck.mockRejectedValue(new Error("network"));
    setup();
    fireEvent.change(screen.getByPlaceholderText(/Hugging Face adapter/), {
      target: { value: "owner/x" },
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(
        screen.getByText("Failed to validate adapter. Please try again."),
      ).toBeInTheDocument(),
    );
  });

  it("adds an adapter after successful validation", async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText(/Hugging Face adapter/), {
      target: { value: "owner/lora-a" },
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() => screen.getByText(/successfully matched/));
    // The + button enabled now
    const addBtn = screen.getByRole("button", { name: "" }); // icon-only plus is first
    // Find plus by its enabled state among buttons
    const plus = screen
      .getAllByRole("button")
      .find((b) => !b.hasAttribute("disabled") && b.querySelector("svg"));
    fireEvent.click(plus || addBtn);
    expect(screen.getByText("owner/lora-a")).toBeInTheDocument();
    // save count reflects 1
    expect(screen.getByText("Save 1")).toBeInTheDocument();
  });

  it("renders preexisting adapters and removes one", () => {
    setup({
      loraAdapters: [{ modelId: "owner/lora-a" }, { modelId: "owner/lora-b" }],
    });
    expect(screen.getByText("owner/lora-a")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(screen.queryByText("owner/lora-a")).not.toBeInTheDocument();
    expect(screen.getByText("owner/lora-b")).toBeInTheDocument();
  });

  it("submits cleaned adapters and closes", async () => {
    const { onAdapterSave, onClose } = setup({
      loraAdapters: [{ modelId: "owner/lora-a", modelAlias: " route-a " }],
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Save 1/ }));
    });
    await waitFor(() =>
      expect(onAdapterSave).toHaveBeenCalledWith([
        { modelId: "owner/lora-a", modelAlias: "route-a" },
      ]),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("blocks submit and toasts on duplicate routes", async () => {
    setup({
      loraAdapters: [
        { modelId: "owner/a", modelAlias: "dup" },
        { modelId: "owner/b", modelAlias: "dup" },
      ],
    });
    // duplicate route disables submit; error message rendered
    expect(
      screen.getAllByText("Route must be unique within the endpoint.").length,
    ).toBeGreaterThan(0);
    const saveBtn = screen.getByRole("button", { name: /Save 2/ });
    expect(saveBtn).toBeDisabled();
  });

  it("cancel triggers onClose", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("uses novita placeholder and empty-state copy for novita provider", () => {
    setup({ provider: "novita" });
    expect(
      screen.getByPlaceholderText("Enter adapter's repository name"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Click the button above to add adapters."),
    ).toBeInTheDocument();
  });
});
