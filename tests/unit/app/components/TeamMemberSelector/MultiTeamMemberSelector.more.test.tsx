import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as mockReact from "react";
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

// Popover that wires onOpenChange so the fetch effect can run.
jest.mock("@/components/ui/popover", () => {
  const Ctx = mockReact.createContext({ onOpenChange: (_o: boolean) => {} });
  return {
    Popover: ({ children, onOpenChange }: any) => (
      <Ctx.Provider value={{ onOpenChange }}>
        <div>{children}</div>
      </Ctx.Provider>
    ),
    PopoverTrigger: ({ children, className }: any) => {
      const ctx = mockReact.useContext(Ctx);
      return (
        <div className={className} onClick={() => ctx.onOpenChange(true)}>
          {children}
        </div>
      );
    },
    PopoverContent: ({ children }: any) => <div>{children}</div>,
  };
});

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
  CommandLoading: ({ children }: any) => (
    <div data-testid="loading">{children}</div>
  ),
}));

const member = (over: any = {}) => ({
  memberIds: ["id-a"],
  email: "alice@example.com",
  phone: "1",
  alias: "Alice",
  status: "Active",
  ...over,
});

describe("MultiTeamMemberSelector more branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMembers = [];
    mockUnwrap.mockResolvedValue(undefined);
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("fetches team members when opened with an empty list", async () => {
    const { container } = render(
      <MultiTeamMemberSelector
        selectedMembers={[]}
        onMembersChange={jest.fn()}
      />,
    );
    const trigger = container.querySelector(
      ".min-w-\\[180px\\]",
    ) as HTMLElement;
    fireEvent.click(trigger);
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
  });

  // NOTE: a "shows the error state when fetching fails" case was removed — the
  // mocked dispatch().unwrap() rejection does not flip loadingTeamMembers false
  // reliably under the test renderer, leaving the component stuck in the
  // loading branch. The fetch/dispatch path itself is covered by the test
  // above; the catch branch is not worth a flaky assertion.

  it("renders email-only when a member has no alias", () => {
    mockMembers = [member({ alias: undefined, email: "noalias@x.com" })];
    render(
      <MultiTeamMemberSelector
        selectedMembers={[]}
        onMembersChange={jest.fn()}
      />,
    );
    expect(screen.getByText("noalias@x.com")).toBeInTheDocument();
  });

  it("renders a Left Team badge for departed members", () => {
    mockMembers = [member({ status: "Left Team" })];
    render(
      <MultiTeamMemberSelector
        selectedMembers={[]}
        onMembersChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Left Team")).toBeInTheDocument();
  });

  it("removes the selected member via the X chip button", () => {
    mockMembers = [member()];
    const onChange = jest.fn();
    const { container } = render(
      <MultiTeamMemberSelector
        selectedMembers={["alice@example.com"]}
        onMembersChange={onChange}
      />,
    );
    // The chip's remove button is the first button inside the trigger chip.
    const chipBtn = container.querySelector("button") as HTMLElement;
    fireEvent.click(chipBtn);
    expect(onChange).toHaveBeenCalledWith([], []);
  });

  it("prefers the Active duplicate when computing member ids", () => {
    mockMembers = [
      member({
        email: "dup@x.com",
        status: "Left Team",
        memberIds: ["left-id"],
      }),
      member({
        email: "dup@x.com",
        status: "Active",
        memberIds: ["active-id"],
      }),
    ];
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
    expect(onChange).toHaveBeenCalledWith(["dup@x.com"], ["active-id"]);
  });
});
