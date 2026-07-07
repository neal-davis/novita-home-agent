import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const apiKeyData = {
  id: "key-1",
  name: "Production key",
  createdAt: "",
  budget: 0,
  used: 0,
  budget_type: "Unlimited",
};

describe("ApiKeyEditModal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    render(
      <ApiKeyEditModal
        isOpen={false}
        apiKeyData={apiKeyData}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(
      screen.queryByText("API Key Budget Settings"),
    ).not.toBeInTheDocument();
  });

  it("renders the key name and defaults to Unlimited (input disabled)", () => {
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={apiKeyData}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByText("API Key Budget Settings")).toBeInTheDocument();
    expect(screen.getByText("Production key")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter amount")).toBeDisabled();
  });

  it("enables Save only after a change", () => {
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={apiKeyData}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "One-time" },
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("confirms and saves with the apiKeyId and *10000 amount", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={apiKeyData}
        onClose={onClose}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "One-time" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter amount"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Confirm API Key Budget")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        budgetType: "One-time",
        budgetAmount: 100000,
        apiKeyId: "key-1",
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("calls onClose from Cancel", () => {
    const onClose = jest.fn();
    render(
      <ApiKeyEditModal
        isOpen
        apiKeyData={apiKeyData}
        onClose={onClose}
        onSave={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });
});
