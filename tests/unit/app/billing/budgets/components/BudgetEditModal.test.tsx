import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BudgetEditModal from "@/app/billing/budgets/components/BudgetEditModal";
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
  Select: ({ children, onValueChange, value }: any) => (
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

const memberData = {
  id: "m-1",
  name: "Member One",
  phone: "13800138000",
  budget: 0,
  budget_type: "Unlimited",
};

describe("BudgetEditModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when closed", () => {
    render(
      <BudgetEditModal
        isOpen={false}
        memberData={memberData}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.queryByText("Budget Settings")).not.toBeInTheDocument();
  });

  it("renders member name (phone) and defaults to Unlimited with disabled input", () => {
    render(
      <BudgetEditModal
        isOpen
        memberData={memberData}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );
    expect(screen.getByText("Budget Settings")).toBeInTheDocument();
    expect(screen.getByText("13800138000")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter amount")).toBeDisabled();
  });

  it("disables Save until a value changes", () => {
    render(
      <BudgetEditModal
        isOpen
        memberData={memberData}
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

  it("calls onClose from Cancel", () => {
    const onClose = jest.fn();
    render(
      <BudgetEditModal
        isOpen
        memberData={memberData}
        onClose={onClose}
        onSave={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("opens confirmation and saves with amount converted to *10000", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <BudgetEditModal
        isOpen
        memberData={memberData}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "One-time" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter amount"), {
      target: { value: "25" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Confirmation modal appears
    expect(screen.getByText("Confirm Budget Settings")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        budgetType: "One-time",
        budgetAmount: 250000,
        memberName: "13800138000",
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("resets budget limit to 0 when switching back to Unlimited", () => {
    render(
      <BudgetEditModal
        isOpen
        memberData={{ ...memberData, budget_type: "One-time", budget: 100000 }}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Enter amount",
    ) as HTMLInputElement;
    expect(input).not.toBeDisabled();

    fireEvent.change(screen.getByLabelText("budget-type"), {
      target: { value: "Unlimited" },
    });
    expect(input.value).toBe("0");
    expect(input).toBeDisabled();
  });
});
