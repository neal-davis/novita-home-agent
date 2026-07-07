import { fireEvent, render, screen } from "@testing-library/react";
import Header from "@/app/components/header/Header";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useIsInConsole } from "@/hooks/useIsInConsole";
import { useTopNavigationItems } from "@/hooks/useTopNavigationItems";

const mockPush = jest.fn();
let mockSearch = "";
let mockNotice = false;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockSearch),
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
    noticeHeight: 40,
    originalHeaderHeight: 64,
    isNoticeShowing: mockNotice,
  }),
}));

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
// AuthButtons mock that actually invokes the handlers passed by Header.
jest.mock("@/app/components/header/partials/AuthButtons", () => ({
  AuthButtons: ({ onLogin, onGetStarted }: any) => (
    <div>
      <button data-testid="do-login" onClick={() => onLogin("/dashboard")}>
        login
      </button>
      <button
        data-testid="do-getstarted"
        onClick={() => onGetStarted("/welcome")}
      >
        start
      </button>
    </div>
  ),
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

describe("Header more branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch = "";
    mockNotice = false;
    mockNavItems.mockReturnValue([
      { key: "pricing", title: "Pricing", path: "/pricing" },
    ]);
    mockInConsole.mockReturnValue(false);
    localStorage.clear();
  });

  it("login handler appends the query string when present", () => {
    mockSearch = "foo=bar&x=1";
    mockAuth.mockReturnValue(loggedOut);
    render(<Header />);
    fireEvent.click(screen.getByTestId("do-login"));
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("/dashboard?foo=bar&x=1")),
    );
    expect(localStorage.getItem("redirect")).toBe("/dashboard");
  });

  it("login handler uses the bare path when no query string", () => {
    mockSearch = "";
    mockAuth.mockReturnValue(loggedOut);
    render(<Header />);
    fireEvent.click(screen.getByTestId("do-login"));
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("/dashboard")),
    );
  });

  it("get-started handler pushes the login route and stores redirect", () => {
    mockAuth.mockReturnValue(loggedOut);
    render(<Header />);
    fireEvent.click(screen.getByTestId("do-getstarted"));
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("/welcome")),
    );
    expect(localStorage.getItem("redirect")).toBe("/welcome");
  });

  it("renders the notice when isNoticeShowing is true", () => {
    mockNotice = true;
    mockAuth.mockReturnValue(loggedOut);
    render(<Header />);
    expect(screen.getByTestId("notice")).toBeInTheDocument();
  });

  it("closes the mobile menu on a second menu-button click", () => {
    mockAuth.mockReturnValue(loggedOut);
    render(<Header />);
    const btn = screen.getByTestId("menu-icon").closest("button")!;
    fireEvent.click(btn);
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });

  it("does not render mobile navigation on the playground page", () => {
    mockAuth.mockReturnValue(loggedOut);
    render(<Header page="playground" />);
    expect(screen.queryByTestId("menu-icon")).toBeInTheDocument();
    // playground suppresses MobileNavigation entirely
    fireEvent.click(screen.getByTestId("menu-icon").closest("button")!);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });
});
