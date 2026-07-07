import { fireEvent, render, screen } from "@testing-library/react";
import SideNavigationItems from "@/app/components/header/partials/SideNavigationItems";

let mockPathname = "/models-console/library";
let mockState: any = { user: { isQuestionnaire: true } };
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (p: string) => p,
  getPathnameWithoutLocale: (p: string) => p,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) => a.filter(Boolean).join(" "),
}));

jest.mock("@/lib/navigationStack", () => ({
  getPreviousMainPagePath: jest.fn(),
}));

jest.mock("@/app/components/header/partials/Logo", () => ({
  Logo: () => <div data-testid="logo" />,
}));
jest.mock("@/app/components/header/partials/ConsoleNavSwitcher", () => ({
  __esModule: true,
  default: () => <div data-testid="nav-switcher" />,
}));
jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: any) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: any) => <div>{children}</div>,
  HoverCardContent: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/app/components/button/Button", () => ({
  __esModule: true,
  default: ({ children }: any) => <button>{children}</button>,
}));

describe("SideNavigationItems more branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/models-console/library";
    mockState = { user: { isQuestionnaire: true } };
  });

  it("renders the sandbox 'Update' badge and hover card on the main product", () => {
    const items: any[] = [
      { key: "sandbox", title: "Sandbox", path: "/sandbox" },
      { key: "docs", title: "Docs", path: "/docs", openInNewTab: true },
    ];
    render(<SideNavigationItems items={items} product="main" />);
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("Check Your Sandbox Quotas")).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  it("renders the bottom free-credits item for sandbox when not questionnaire", () => {
    mockState = { user: { isQuestionnaire: false } };
    const items: any[] = [
      { key: "overview", title: "Overview", path: "/sandbox-console" },
      { key: "docs", title: "Docs", path: "/docs", openInNewTab: true },
    ];
    render(<SideNavigationItems items={items} product="sandbox" />);
    expect(screen.getByText("Get $101 Free Credits")).toBeInTheDocument();
  });

  it("renders the Discord item on a dedicated-endpoints (DE) page", () => {
    mockPathname = "/models-console/llm-dedicated-endpoints";
    const items: any[] = [
      {
        key: "library",
        title: "Model Library",
        path: "/models-console/library",
      },
      { key: "docs", title: "Docs", path: "/docs", openInNewTab: true },
    ];
    render(<SideNavigationItems items={items} product="model-api" />);
    expect(screen.getByText("Discord")).toBeInTheDocument();
  });

  it("marks a nav item active via altPaths", () => {
    mockPathname = "/alt-route";
    const items: any[] = [
      {
        key: "library",
        title: "Model Library",
        path: "/models-console/library",
        altPaths: ["/alt-route"],
      },
      { key: "docs", title: "Docs", path: "/docs", openInNewTab: true },
    ];
    render(<SideNavigationItems items={items} product="model-api" />);
    expect(screen.getByText("Model Library").closest("a")?.className).toContain(
      "active",
    );
  });

  it("invokes item.onClick when an item link is clicked", () => {
    const onClick = jest.fn();
    const items: any[] = [
      { key: "action", title: "Action", path: "/x", onClick },
      { key: "docs", title: "Docs", path: "/docs", openInNewTab: true },
    ];
    render(<SideNavigationItems items={items} product="model-api" />);
    fireEvent.click(screen.getByText("Action"));
    expect(onClick).toHaveBeenCalled();
  });

  it("triggers onClick via keyboard Enter and respects disabled tabIndex", () => {
    const onClick = jest.fn();
    const items: any[] = [
      { key: "action", title: "Action", path: "/x", onClick },
      { key: "muted", title: "Muted", path: "/y", disabled: true },
      { key: "docs", title: "Docs", path: "/docs", openInNewTab: true },
    ];
    render(<SideNavigationItems items={items} product="model-api" />);
    fireEvent.keyDown(screen.getByText("Action"), { key: "Enter" });
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByText("Muted").closest("a")).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("renders without a docs section when no docs item exists", () => {
    const items: any[] = [
      {
        key: "library",
        title: "Model Library",
        path: "/models-console/library",
      },
    ];
    render(<SideNavigationItems items={items} product="model-api" />);
    expect(screen.queryByText("Docs")).not.toBeInTheDocument();
  });
});
