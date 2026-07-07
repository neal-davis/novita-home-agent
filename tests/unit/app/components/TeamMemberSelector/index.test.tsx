import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TeamMemberSelector from "@/app/components/TeamMemberSelector/index";

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

// Render shadcn primitives as transparent wrappers so children/handlers work.
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
  CommandItem: ({ children, onSelect }: any) => (
    <div role="option" aria-selected={false} onClick={onSelect}>
      {children}
    </div>
  ),
  CommandLoading: ({ children }: any) => <div>{children}</div>,
}));

const member = (over: any = {}) => ({
  memberIds: ["id-1"],
  email: "alice@example.com",
  phone: "123",
  alias: "Alice",
  status: "Active",
  ...over,
});

describe("TeamMemberSelector (single)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMembers = [];
    mockUnwrap.mockResolvedValue(undefined);
  });

  it("shows the placeholder prompt when nothing is selected", () => {
    render(<TeamMemberSelector onSelect={jest.fn()} />);
    expect(screen.getByText("Select a Member...")).toBeInTheDocument();
  });

  it("shows the selected member's alias", () => {
    render(
      <TeamMemberSelector
        onSelect={jest.fn()}
        selectedMember={member() as any}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders an 'All' option and member rows when members exist", () => {
    mockMembers = [member(), member({ email: "bob@x.com", alias: "" })];
    render(<TeamMemberSelector onSelect={jest.fn()} />);
    expect(screen.getAllByText("All").length).toBeGreaterThan(0);
    expect(screen.getByText("bob@x.com")).toBeInTheDocument();
  });

  it("calls onSelect(null) when 'All' is chosen", () => {
    mockMembers = [member()];
    const onSelect = jest.fn();
    render(<TeamMemberSelector onSelect={onSelect} />);
    const all = screen.getAllByText("All")[0].closest('[role="option"]')!;
    fireEvent.click(all);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("calls onSelect with the chosen member's data", () => {
    mockMembers = [member()];
    const onSelect = jest.fn();
    render(<TeamMemberSelector onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Alice").closest('[role="option"]')!);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ email: "alice@example.com", ids: ["id-1"] }),
    );
  });

  it("shows a Left Team badge for members who left", () => {
    mockMembers = [member({ status: "Left Team", alias: "" })];
    render(<TeamMemberSelector onSelect={jest.fn()} />);
    expect(screen.getByText("Left Team")).toBeInTheDocument();
  });
});
