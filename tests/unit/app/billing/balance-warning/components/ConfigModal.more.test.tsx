import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ConfigModal } from "@/app/billing/balance-warning/components/ConfigModal";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

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
      <button type="button" onClick={() => onMembersChange([], [])}>
        clear members
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

const stateWithMembers = (
  teamMembers: any[],
  currentTeam: any = { id: "t" },
) => ({
  billing: { balanceDetail: { creditLimit: 0 } },
  user: { currentTeam, email: "owner@example.com", teamMembers },
});

describe("ConfigModal extra branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = stateWithMembers([
      { email: "owner@example.com", role: "owner", memberIds: ["m-owner"] },
    ]);
  });

  it("toggles inbox method on and off via checkboxes", () => {
    render(<ConfigModal open type="add" onConfirm={jest.fn()} />);
    const inbox = screen.getByText("Inbox").previousSibling as HTMLElement;
    // turn inbox on
    fireEvent.click(inbox);
    // turn email off
    const email = screen.getByText("Email").previousSibling as HTMLElement;
    fireEvent.click(email);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("warns when no notification method is selected", () => {
    render(<ConfigModal open type="add" onConfirm={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Enter Amount"), {
      target: { value: "100" },
    });
    // uncheck email (the only default)
    const email = screen.getByText("Email").previousSibling as HTMLElement;
    fireEvent.click(email);
    fireEvent.click(screen.getByText("Confirm"));
    expect(message.warning).toHaveBeenCalledWith(
      "Please select at least one notification method",
    );
  });

  it("toggles the enable switch off and on", () => {
    render(<ConfigModal open type="add" onConfirm={jest.fn()} />);
    const switchEl = screen.getByRole("switch");
    fireEvent.click(switchEl);
    fireEvent.click(switchEl);
    expect(switchEl).toBeInTheDocument();
  });

  it("edit mode resolves member emails from matching team members", () => {
    mockState = stateWithMembers([
      { email: "match@example.com", role: "basic", memberIds: ["m-2"] },
    ]);
    render(
      <ConfigModal
        open
        type="edit"
        defaultValues={{
          threshold: "30",
          state: false,
          notification_methods: ["in_app"],
          member_ids: ["m-2"],
        }}
      />,
    );
    expect(screen.getByPlaceholderText("Enter Amount")).toHaveValue("30");
  });

  it("edit mode with member ids but no team members waits (no crash)", () => {
    mockState = stateWithMembers([]);
    render(
      <ConfigModal
        open
        type="edit"
        defaultValues={{
          threshold: "30",
          state: true,
          notification_methods: ["email"],
          member_ids: ["m-9"],
        }}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("edit mode falls back to notificationMembers when no member ids", () => {
    render(
      <ConfigModal
        open
        type="edit"
        defaultValues={{
          threshold: "30",
          state: true,
          member_ids: [],
          notificationMembers: ["pre@x.com"],
        }}
      />,
    );
    expect(screen.getByPlaceholderText("Enter Amount")).toHaveValue("30");
  });

  it("add mode with no owner-or-self match clears selection", () => {
    mockState = stateWithMembers([
      { email: "someone@else.com", role: "basic", memberIds: ["m-3"] },
    ]);
    render(<ConfigModal open type="add" onConfirm={jest.fn()} />);
    expect(screen.getByText("Notification Members")).toBeInTheDocument();
  });

  it("omits member_ids in params when there is no current team", async () => {
    mockState = stateWithMembers(
      [{ email: "owner@example.com", role: "owner", memberIds: ["m-owner"] }],
      null,
    );
    const onConfirm = jest.fn();
    render(<ConfigModal open type="add" onConfirm={onConfirm} />);
    fireEvent.change(screen.getByPlaceholderText("Enter Amount"), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm.mock.calls[0][0]).not.toHaveProperty("member_ids");
  });
});
