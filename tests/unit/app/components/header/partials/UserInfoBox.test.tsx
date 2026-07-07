import { fireEvent, render, screen } from "@testing-library/react";
import UserInfoBox from "@/app/components/header/partials/UserInfoBox";
import { usePermission } from "@/lib/hooks/usePermission";

let mockState: any;
const mockUsePermission = usePermission as jest.Mock;

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

jest.mock("@/lib/hooks/usePermission", () => ({ usePermission: jest.fn() }));

jest.mock("@/lib/utils/user", () => ({
  getSanitizedUserId: (id: string) => `sanitized-${id}`,
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (href: string) => href,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ children, onCopy }: any) => (
    <span onClick={onCopy}>{children}</span>
  ),
}));

const baseProps = {
  balance: 25,
  enterprise: false,
  username: "Alice",
  uuid: "uuid-1",
  email: "alice@example.com",
  logout: jest.fn(),
};

function setUser(user: any) {
  mockState = { user };
}

describe("UserInfoBox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUser({ currentTeam: null });
  });

  it("renders the desktop dropdown with email, sanitized uuid and menu links", () => {
    mockUsePermission.mockReturnValue(true);
    render(<UserInfoBox {...baseProps} />);
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("sanitized-uuid-1")).toBeInTheDocument();
    expect(screen.getByText("Account Settings")).toBeInTheDocument();
    expect(screen.getByText("API Keys")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("shows the current team role badge when in a team context", () => {
    mockUsePermission.mockReturnValue(true);
    setUser({ currentTeam: { role: "admin" } });
    render(<UserInfoBox {...baseProps} />);
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("calls logout when the Log Out link is clicked", () => {
    mockUsePermission.mockReturnValue(true);
    const logout = jest.fn();
    render(<UserInfoBox {...baseProps} logout={logout} />);
    fireEvent.click(screen.getByText("Log Out"));
    expect(logout).toHaveBeenCalled();
  });

  it("renders the mobile layout with a balance link when permitted", () => {
    mockUsePermission.mockReturnValue(true);
    render(<UserInfoBox {...baseProps} isMobile />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Balance:")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
  });

  it("hides the balance link in mobile layout without balance permission", () => {
    mockUsePermission.mockReturnValue(false);
    render(<UserInfoBox {...baseProps} isMobile />);
    expect(screen.queryByText("Balance:")).not.toBeInTheDocument();
  });
});
