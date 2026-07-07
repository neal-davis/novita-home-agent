import { fireEvent, render, screen } from "@testing-library/react";
import Header from "@/app/components/header/Header";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useIsInConsole } from "@/hooks/useIsInConsole";
import { useTopNavigationItems } from "@/hooks/useTopNavigationItems";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/i18n/config", () => ({ getLocalizedPath: (p: string) => p }));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) =>
    a
      .flatMap((x) =>
        typeof x === "object" && x !== null
          ? Object.entries(x)
              .filter(([, v]) => v)
              .map(([k]) => k)
          : x,
      )
      .filter(Boolean)
      .join(" "),
}));

jest.mock("@/hooks/useHeaderAuth", () => ({ useHeaderAuth: jest.fn() }));
jest.mock("@/hooks/useIsInConsole", () => ({ useIsInConsole: jest.fn() }));
jest.mock("@/hooks/useTopNavigationItems", () => ({
  useTopNavigationItems: jest.fn(),
}));
jest.mock("@/hooks/useOauthEvent", () => ({ useOauthEvent: jest.fn() }));
jest.mock("@/hooks/useHeaderHeight", () => ({
  useHeaderHeight: () => ({
    headerHeight: 64,
    noticeHeight: 0,
    originalHeaderHeight: 64,
    isNoticeShowing: false,
  }),
}));

// Mock all heavy child components down to identifiable markers.
jest.mock("@/app/components/header/partials/Logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));
jest.mock("@/app/components/header/partials/UserInfoBox", () => ({
  __esModule: true,
  default: () => <div data-testid="user-info" />,
}));
jest.mock("@/app/components/header/partials/TeamSwitcher", () => ({
  __esModule: true,
  default: () => <div data-testid="team-switcher" />,
}));
jest.mock("@/app/components/header/partials/BalanceBox", () => ({
  __esModule: true,
  default: () => <div data-testid="balance-box" />,
}));
jest.mock("@/app/components/header/partials/MessageCenter", () => ({
  __esModule: true,
  default: () => <div data-testid="message-center" />,
}));
jest.mock("@/app/components/header/partials/TopNavigationItems", () => ({
  TopNavigationItems: ({ items }: any) => (
    <div data-testid="top-nav">{items.length}</div>
  ),
}));
jest.mock("@/app/components/header/partials/MobileNavigation", () => ({
  MobileNavigation: ({ isOpen }: any) =>
    isOpen ? <div data-testid="mobile-nav" /> : null,
}));
jest.mock("@/app/components/header/partials/AuthButtons", () => ({
  AuthButtons: () => <div data-testid="auth-buttons" />,
}));
jest.mock("@/app/components/header/partials/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));
jest.mock("@/app/components/Notice/Notice", () => ({
  __esModule: true,
  default: () => <div data-testid="notice" />,
}));
jest.mock("@/app/components/voucherNotification", () => ({
  __esModule: true,
  default: () => <div data-testid="voucher" />,
}));
jest.mock("@/app/components/discountToast/discountToast", () => ({
  __esModule: true,
  default: () => <div data-testid="discount" />,
}));
jest.mock("@/components/ui/standard/info-dialog", () => ({
  __esModule: true,
  default: () => <div data-testid="info-dialog" />,
}));
jest.mock("@/lib/icons/Menu", () => ({
  __esModule: true,
  default: () => <span data-testid="menu-icon" />,
}));

const mockAuth = useHeaderAuth as jest.Mock;
const mockInConsole = useIsInConsole as jest.Mock;
const mockNavItems = useTopNavigationItems as jest.Mock;

const loggedOut = {
  isLogin: false,
  enterprise: false,
  username: "",
  email: "",
  uuid: "",
  availableCredit: 0,
  balanceStatus: null,
  logoutFn: jest.fn(),
};
const loggedIn = {
  ...loggedOut,
  isLogin: true,
  username: "Alice",
  email: "a@b.com",
  uuid: "u1",
  availableCredit: 42,
  balanceStatus: "success",
};

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavItems.mockReturnValue([
      { key: "pricing", title: "Pricing", path: "/pricing" },
      { key: "console", title: "Console", path: "/console" },
    ]);
    mockInConsole.mockReturnValue(false);
  });

  it("shows auth buttons and hides user box when logged out", () => {
    mockAuth.mockReturnValue(loggedOut);
    render(<Header />);
    expect(screen.getByTestId("auth-buttons")).toBeInTheDocument();
    expect(screen.queryByTestId("user-info")).not.toBeInTheDocument();
  });

  it("shows the user box when logged in", () => {
    mockAuth.mockReturnValue(loggedIn);
    render(<Header />);
    expect(screen.getByTestId("user-info")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-buttons")).not.toBeInTheDocument();
  });

  it("renders balance box and message center only when logged in and in console", () => {
    mockAuth.mockReturnValue(loggedIn);
    mockInConsole.mockReturnValue(true);
    render(<Header />);
    expect(screen.getByTestId("balance-box")).toBeInTheDocument();
    expect(screen.getAllByTestId("message-center").length).toBeGreaterThan(0);
  });

  it("renders the team switcher on the console page when logged in", () => {
    mockAuth.mockReturnValue(loggedIn);
    render(<Header page="console" />);
    expect(screen.getByTestId("team-switcher")).toBeInTheDocument();
  });

  it("hides top navigation on the console page", () => {
    mockAuth.mockReturnValue(loggedIn);
    render(<Header page="console" />);
    expect(screen.queryByTestId("top-nav")).not.toBeInTheDocument();
  });

  it("filters nav to only the console item when hideNavigation and logged in", () => {
    mockAuth.mockReturnValue(loggedIn);
    render(<Header hideNavigation />);
    expect(screen.getByTestId("top-nav")).toHaveTextContent("1");
  });

  it("renders an empty nav when hideNavigation and logged out", () => {
    mockAuth.mockReturnValue(loggedOut);
    render(<Header hideNavigation />);
    expect(screen.getByTestId("top-nav")).toHaveTextContent("0");
  });

  it("toggles the mobile navigation when the menu button is clicked", () => {
    mockAuth.mockReturnValue(loggedOut);
    render(<Header />);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("menu-icon").closest("button")!);
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
  });

  it("does not render mobile navigation when noMobile is set", () => {
    mockAuth.mockReturnValue(loggedOut);
    render(<Header noMobile />);
    fireEvent.click(screen.getByTestId("menu-icon").closest("button")!);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });

  it("renders the console page title instead of the logo when provided", () => {
    mockAuth.mockReturnValue(loggedIn);
    render(<Header page="console" consolePageTitle="My Page" />);
    expect(screen.getByText("My Page")).toBeInTheDocument();
    expect(screen.queryByTestId("logo")).not.toBeInTheDocument();
  });
});
