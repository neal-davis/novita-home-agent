import { fireEvent, render, screen } from "@testing-library/react";
import { MobileNavigation } from "@/app/components/header/partials/MobileNavigation";

let mockPathname = "/pricing";
let mockFrom: string | null = null;

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => ({ get: () => mockFrom }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (p: string) => p,
  getPathnameWithoutLocale: (p: string) => p,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/app/components/header/partials/UserInfoBox", () => ({
  __esModule: true,
  default: ({ email }: any) => <div data-testid="user-info">{email}</div>,
}));

jest.mock("@/app/components/header/partials/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

const navMenuItems: any[] = [
  { key: "pricing", title: "Pricing", path: "/pricing", elmId: "m-pricing" },
  {
    key: "gpus",
    title: "GPUs",
    dropdown: [
      {
        key: "gi",
        title: "GPU Instance",
        path: "/gpu-instance",
        elmId: "m-gi",
      },
    ],
  },
];

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  navMenuItems,
  isLogin: false,
  enterprise: false,
  uuid: "u1",
  email: "a@b.com",
  username: "Alice",
  balance: 10,
  logout: jest.fn(),
  noticeHeight: 0,
  originalHeaderHeight: 64,
};

describe("MobileNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/pricing";
    mockFrom = null;
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <MobileNavigation {...baseProps} isOpen={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders login/get-started buttons when logged out", () => {
    render(<MobileNavigation {...baseProps} isLogin={false} />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByTestId("user-info")).not.toBeInTheDocument();
  });

  it("renders the user info box and logout when logged in", () => {
    render(<MobileNavigation {...baseProps} isLogin={true} />);
    expect(screen.getByTestId("user-info")).toHaveTextContent("a@b.com");
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders nav links including dropdown sub-items", () => {
    render(<MobileNavigation {...baseProps} />);
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("GPU Instance")).toBeInTheDocument();
  });

  it("calls onClose when the overlay is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(
      <MobileNavigation {...baseProps} onClose={onClose} />,
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls logout when the logout button is clicked", () => {
    const logout = jest.fn();
    render(<MobileNavigation {...baseProps} isLogin={true} logout={logout} />);
    fireEvent.click(screen.getByText("Logout"));
    expect(logout).toHaveBeenCalled();
  });
});
