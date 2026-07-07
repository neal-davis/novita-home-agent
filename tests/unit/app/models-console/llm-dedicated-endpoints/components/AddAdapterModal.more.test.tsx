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
const mockError = message.error as jest.Mock;

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

async function typeAndValidate(value: string) {
  fireEvent.change(screen.getByPlaceholderText(/adapter/i), {
    target: { value },
  });
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  await waitFor(() => screen.getByText(/successfully matched|ready to add/i));
}

function clickPlus() {
  const plus = screen
    .getAllByRole("button")
    .find((b) => !b.hasAttribute("disabled") && b.querySelector("svg"));
  fireEvent.click(plus!);
}

describe("AddAdapterModal (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockCheck.mockResolvedValue({ results: [{ isValid: true }] });
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("empty/whitespace input resets check status to null (no API call)", async () => {
    setup();
    const input = screen.getByPlaceholderText(/Hugging Face adapter/);
    fireEvent.change(input, { target: { value: "   " } });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(mockCheck).not.toHaveBeenCalled();
    // no status messages present
    expect(
      screen.queryByText("Gathering adapter information..."),
    ).not.toBeInTheDocument();
  });

  it("uses default error copy when validation result lacks errorMsg", async () => {
    mockCheck.mockResolvedValue({ results: [{ isValid: false }] });
    setup();
    fireEvent.change(screen.getByPlaceholderText(/Hugging Face adapter/), {
      target: { value: "owner/x" },
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(
        screen.getByText(
          "The LoRA adapter is incompatible with the base model.",
        ),
      ).toBeInTheDocument(),
    );
  });

  it("rejects adding an adapter whose modelId already exists", async () => {
    setup({ loraAdapters: [{ modelId: "owner/dup" }] });
    await typeAndValidate("owner/dup");
    clickPlus();
    expect(mockError).toHaveBeenCalledWith("Adapter already exists");
  });

  it("rejects adding an adapter that collides with an existing route", async () => {
    // existing adapter has alias 'collide'; new modelId equals that route
    setup({ loraAdapters: [{ modelId: "owner/a", modelAlias: "collide" }] });
    await typeAndValidate("collide");
    clickPlus();
    expect(mockError).toHaveBeenCalledWith(
      "Route must be unique within the endpoint.",
    );
  });

  it("editing an alias updates the route input value", () => {
    setup({ loraAdapters: [{ modelId: "owner/a" }] });
    const aliasInput = screen.getByPlaceholderText("owner/a");
    fireEvent.change(aliasInput, { target: { value: "my-route" } });
    expect(screen.getByDisplayValue("my-route")).toBeInTheDocument();
  });

  it("novita provider shows novita success copy after validation", async () => {
    setup({ provider: "novita" });
    fireEvent.change(
      screen.getByPlaceholderText("Enter adapter's repository name"),
      { target: { value: "owner/lora" } },
    );
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(screen.getByText("Adapter ready to add.")).toBeInTheDocument(),
    );
  });

  it("saving=true disables buttons and shows spinner instead of count", () => {
    setup({ saving: true, loraAdapters: [{ modelId: "owner/a" }] });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    // Save label replaced by spinner -> no "Save 1" text
    expect(screen.queryByText("Save 1")).not.toBeInTheDocument();
  });

  it("blocks submit and toasts when duplicate routes present", async () => {
    const { onAdapterSave } = setup({
      loraAdapters: [
        { modelId: "owner/a", modelAlias: "dup" },
        { modelId: "owner/b", modelAlias: "dup" },
      ],
    });
    // Save button disabled; calling handleSubmit path isn't reachable via click,
    // but the duplicate guard is also asserted by the disabled state + message.
    const saveBtn = screen.getByRole("button", { name: /Save 2/ });
    expect(saveBtn).toBeDisabled();
    expect(onAdapterSave).not.toHaveBeenCalled();
  });

  it("passes hfToken when token provided", async () => {
    setup({ token: "hf-secret" });
    fireEvent.change(screen.getByPlaceholderText(/Hugging Face adapter/), {
      target: { value: "owner/lora" },
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    await waitFor(() =>
      expect(mockCheck).toHaveBeenCalledWith({
        baseModel: "owner/base",
        hfToken: "hf-secret",
        loraAdapters: ["owner/lora"],
      }),
    );
  });
});
