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
    key: "models",
    title: "Model APIs",
    path: "/models-console",
    elmId: "m-models",
  },
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

describe("MobileNavigation more branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/pricing";
    mockFrom = null;
    localStorage.clear();
  });

  it("highlights Pricing as active on the pricing path", () => {
    mockPathname = "/pricing";
    render(<MobileNavigation {...baseProps} />);
    const pricing = screen.getByText("Pricing");
    expect(pricing.className).toContain("active");
  });

  it("highlights Model APIs when on a playground path", () => {
    mockPathname = "/playground/chat";
    render(<MobileNavigation {...baseProps} />);
    expect(screen.getByText("Model APIs").className).toContain("active");
  });

  it("highlights Model APIs when on an llm path", () => {
    mockPathname = "/llm/gpt";
    render(<MobileNavigation {...baseProps} />);
    expect(screen.getByText("Model APIs").className).toContain("active");
  });

  it("on model-detail with from=pricing only Pricing is active", () => {
    mockPathname = "/models/model-detail/abc";
    mockFrom = "pricing";
    render(<MobileNavigation {...baseProps} />);
    expect(screen.getByText("Pricing").className).toContain("active");
    expect(screen.getByText("Model APIs").className).not.toContain("active");
  });

  it("on model-detail with from=home nothing is active", () => {
    mockPathname = "/models/model-detail/abc";
    mockFrom = "home";
    render(<MobileNavigation {...baseProps} />);
    expect(screen.getByText("Pricing").className).not.toContain("active");
    expect(screen.getByText("Model APIs").className).not.toContain("active");
  });

  it("redirects and stores redirect on Get Started click", () => {
    const setItem = jest.spyOn(Storage.prototype, "setItem");
    delete (window as any).location;
    (window as any).location = { href: "", hash: "#section" };
    mockPathname = "/pricing";
    render(<MobileNavigation {...baseProps} isLogin={false} />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(window.location.href).toContain("/user/login?redirect=");
    expect(setItem).toHaveBeenCalledWith("redirect", "/pricing#section");
  });

  it("uses plain path (no hash) on Login click", () => {
    const setItem = jest.spyOn(Storage.prototype, "setItem");
    delete (window as any).location;
    (window as any).location = { href: "", hash: "" };
    mockPathname = "/pricing";
    render(<MobileNavigation {...baseProps} isLogin={false} />);
    fireEvent.click(screen.getByText("Login"));
    expect(window.location.href).toContain("/user/login?redirect=");
    expect(setItem).toHaveBeenCalledWith("redirect", "/pricing");
  });
});
