import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ConfigModal } from "@/app/billing/balance-warning/components/ConfigModal";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    warning: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

// Modal: render children only when open
jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ open, title, children }: any) =>
    open ? (
      <div role="dialog" aria-label={String(title)}>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children }: any) => <>{children}</>,
}));

jest.mock(
  "@/app/components/TeamMemberSelector/MultiTeamMemberSelector",
  () => ({
    MultiTeamMemberSelector: ({ onMembersChange }: any) => (
      <button
        type="button"
        onClick={() => onMembersChange(["a@x.com"], ["m-1", "m-1", "m-2"])}
      >
        change members
      </button>
    ),
  }),
);

let mockState: any;
jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: any) => unknown) => sel(mockState),
}));

jest.mock("@/store/slice/userSlice", () => ({
  selectTeamMembers: (state: any) => state.user.teamMembers,
}));

const baseState = () => ({
  billing: { balanceDetail: { creditLimit: 0 } },
  user: {
    currentTeam: { id: "team-1" },
    email: "owner@example.com",
    teamMembers: [
      {
        email: "owner@example.com",
        role: "owner",
        memberIds: ["m-owner"],
      },
      {
        email: "member@example.com",
        role: "basic",
        memberIds: ["m-2"],
      },
    ],
  },
});

describe("ConfigModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = baseState();
  });

  it("does not render when closed", () => {
    render(<ConfigModal open={false} type="add" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders add mode with Add Alert title", () => {
    render(<ConfigModal open type="add" />);
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Add Alert",
    );
    expect(screen.getByText("Warning Amount")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("renders edit mode title and prefills threshold", () => {
    render(
      <ConfigModal
        open
        type="edit"
        defaultValues={{
          threshold: "50",
          state: true,
          notification_methods: ["email"],
          member_ids: [],
        }}
      />,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Edit Alert",
    );
    expect(screen.getByPlaceholderText("Enter Amount")).toHaveValue("50");
  });

  it("shows credit limit hint when creditLimit > 0", () => {
    mockState.billing.balanceDetail.creditLimit = 200;
    render(<ConfigModal open type="add" />);
    expect(
      screen.getByText(/Your current credit limit is: \$200/),
    ).toBeInTheDocument();
  });

  it("warns when threshold is empty", () => {
    render(<ConfigModal open type="add" onConfirm={jest.fn()} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(message.warning).toHaveBeenCalledWith(
      "Please enter the warning amount",
    );
  });

  it("warns when threshold is not an integer", () => {
    render(<ConfigModal open type="add" onConfirm={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Enter Amount"), {
      target: { value: "12.5" },
    });
    fireEvent.click(screen.getByText("Confirm"));
    expect(message.warning).toHaveBeenCalledWith(
      "Threshold must be an integer",
    );
  });

  it("warns when threshold is out of range", () => {
    render(<ConfigModal open type="add" onConfirm={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Enter Amount"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByText("Confirm"));
    expect(message.warning).toHaveBeenCalledWith(
      "Threshold must be between 1 and 10000000",
    );
  });

  it("confirms with valid params and deduped member ids", async () => {
    const onConfirm = jest.fn();
    render(<ConfigModal open type="add" onConfirm={onConfirm} />);

    fireEvent.change(screen.getByPlaceholderText("Enter Amount"), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByText("change members"));
    fireEvent.click(screen.getByText("Confirm"));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        threshold: "100",
        state: true,
        notification_methods: ["email"],
        member_ids: ["m-1", "m-2"],
      }),
    );
  });

  it("calls onClose from the Cancel button", () => {
    const onClose = jest.fn();
    render(<ConfigModal open type="add" onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
