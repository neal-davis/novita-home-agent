import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import ApiKeyEditModal from "@/app/billing/budgets/components/ApiKeyEditModal";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, value }: any) => (
    <select
      aria-label="budget-type"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="Unlimited">Unlimited</option>
      <option value="One-time">One-time</option>
      <option value="Recurring">Recurring</option>
    </select>
  ),
  SelectContent: () => null,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectItem: () => null,
}));

describe("ApiKeyEditModal extra branches", () => {
  beforeEach(() => jest.clearAllMocks());

  it("prefills the limit from an existing non-unlimited budget", () => {
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={{
          id: "key-2",
          name: "Key Two",
          createdAt: "",
          budget: 100000, // /10000 -> 10
          used: 0,
          budget_type: "One-time",
        }}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByPlaceholderText("Enter amount")).toHaveValue(10);
  });

  it("resets the limit to 0 when switching back to Unlimited", () => {
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={{
          id: "key-3",
          name: "Key Three",
          createdAt: "",
          budget: 0,
          used: 0,
          budget_type: "One-time",
        }}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    const input = screen.getByPlaceholderText("Enter amount");
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "Unlimited" },
    });
    expect(input).toHaveValue(0);
    expect(input).toBeDisabled();
  });

  it("closes the confirmation modal via its Cancel button", () => {
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={{
          id: "key-4",
          name: "Key Four",
          createdAt: "",
          budget: 0,
          used: 0,
          budget_type: "Unlimited",
        }}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "One-time" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Confirm API Key Budget")).toBeInTheDocument();
    // confirmation modal Cancel (handleConfirmCancel)
    const cancels = screen.getAllByRole("button", { name: "Cancel" });
    fireEvent.click(cancels[cancels.length - 1]);
    expect(
      screen.queryByText("Confirm API Key Budget"),
    ).not.toBeInTheDocument();
  });

  it("shows a success toast after a successful save", async () => {
    jest.useFakeTimers();
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={{
          id: "key-5",
          name: "Key Five",
          createdAt: "",
          budget: 0,
          used: 0,
          budget_type: "Unlimited",
        }}
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "One-time" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(message.success).toHaveBeenCalledWith(
      "API Key budget saved successfully",
    );
    jest.useRealTimers();
  });

  it("logs and stops saving when onSave rejects", async () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const onSave = jest.fn().mockRejectedValue(new Error("boom"));
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={{
          id: "key-6",
          name: "Key Six",
          createdAt: "",
          budget: 0,
          used: 0,
          budget_type: "Unlimited",
        }}
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "One-time" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(errSpy).toHaveBeenCalled());
    errSpy.mockRestore();
  });
});
