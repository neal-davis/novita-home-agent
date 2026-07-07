import { fireEvent, render, screen } from "@testing-library/react";
import { MultiTeamMemberSelector } from "@/app/components/TeamMemberSelector/MultiTeamMemberSelector";

let mockMembers: any[] = [];
const mockUnwrap = jest.fn();
const mockDispatch = jest.fn(() => ({ unwrap: mockUnwrap }));

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel({ user: {} }),
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/store/slice/userSlice", () => ({
  fetchAllTeamMembers: () => ({ type: "fetchAllTeamMembers" }),
  selectTeamMembers: () => mockMembers,
  TeamMemberStatus: { leftTeam: "Left Team", active: "Active" },
}));

jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) => a.filter(Boolean).join(" "),
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/command", () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandInput: (props: any) => <input {...props} />,
  CommandList: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandItem: ({ children, onSelect, disabled }: any) => (
    <div
      role="option"
      aria-selected={false}
      aria-disabled={disabled}
      onClick={onSelect}
    >
      {children}
    </div>
  ),
  CommandLoading: ({ children }: any) => <div>{children}</div>,
}));

const member = (over: any = {}) => ({
  memberIds: ["id-a"],
  email: "alice@example.com",
  phone: "1",
  alias: "Alice",
  status: "Active",
  ...over,
});

describe("MultiTeamMemberSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMembers = [];
    mockUnwrap.mockResolvedValue(undefined);
  });

  it("renders the placeholder when no members are selected", () => {
    render(
      <MultiTeamMemberSelector
        selectedMembers={[]}
        onMembersChange={jest.fn()}
        placeholder="Pick people"
      />,
    );
    expect(screen.getByText("Pick people")).toBeInTheDocument();
  });

  it("adds a member on toggle and reports email + memberId", () => {
    mockMembers = [member()];
    const onChange = jest.fn();
    render(
      <MultiTeamMemberSelector
        selectedMembers={[]}
        onMembersChange={onChange}
      />,
    );
    fireEvent.click(
      screen.getAllByText("Alice")[0].closest('[role="option"]')!,
    );
    expect(onChange).toHaveBeenCalledWith(["alice@example.com"], ["id-a"]);
  });

  it("removes an already-selected member on toggle", () => {
    mockMembers = [member()];
    const onChange = jest.fn();
    render(
      <MultiTeamMemberSelector
        selectedMembers={["alice@example.com"]}
        onMembersChange={onChange}
      />,
    );
    // The option row toggles off the already-selected member.
    fireEvent.click(
      screen.getAllByText("Alice")[1].closest('[role="option"]')!,
    );
    expect(onChange).toHaveBeenCalledWith([], []);
  });

  it("shows the +N indicator and a limit warning at 10 selections", () => {
    mockMembers = Array.from({ length: 11 }, (_, i) =>
      member({ email: `u${i}@x.com`, alias: `U${i}`, memberIds: [`id-${i}`] }),
    );
    const selected = mockMembers.slice(0, 10).map((m) => m.email);
    render(
      <MultiTeamMemberSelector
        selectedMembers={selected}
        onMembersChange={jest.fn()}
      />,
    );
    expect(screen.getByText("+9...")).toBeInTheDocument();
    expect(
      screen.getByText("Recipient limit reached (10 max)"),
    ).toBeInTheDocument();
  });

  it("does not add beyond the 10-member limit", () => {
    mockMembers = Array.from({ length: 11 }, (_, i) =>
      member({ email: `u${i}@x.com`, alias: `U${i}`, memberIds: [`id-${i}`] }),
    );
    const selected = mockMembers.slice(0, 10).map((m) => m.email);
    const onChange = jest.fn();
    render(
      <MultiTeamMemberSelector
        selectedMembers={selected}
        onMembersChange={onChange}
      />,
    );
    // The 11th member is disabled; clicking it should not fire onChange.
    const lastOption = screen
      .getByText("U10")
      .closest('[role="option"]') as HTMLElement;
    fireEvent.click(lastOption);
    expect(onChange).not.toHaveBeenCalled();
  });
});
