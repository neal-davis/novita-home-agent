import { fireEvent, render, screen } from "@testing-library/react";
import SideNavigationItems from "@/app/components/header/partials/SideNavigationItems";
import { getPreviousMainPagePath } from "@/lib/navigationStack";

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

const mockPrevPath = getPreviousMainPagePath as jest.Mock;

const items: any[] = [
  { key: "back", isBack: true },
  { key: "manage", title: "Manage", isCategory: true },
  { key: "library", title: "Model Library", path: "/models-console/library" },
  { key: "settings", title: "Settings", path: "/models-console/settings" },
  { key: "docs", title: "Docs", path: "/docs", openInNewTab: true },
];

describe("SideNavigationItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/models-console/library";
    mockState = { user: { isQuestionnaire: true } };
  });

  it("renders the logo, category, nav links and docs item", () => {
    render(<SideNavigationItems items={items} product="model-api" />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByText("Manage")).toBeInTheDocument();
    expect(screen.getByText("Model Library")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
  });

  it("renders the console nav switcher for non-main products", () => {
    render(<SideNavigationItems items={items} product="model-api" />);
    expect(screen.getByTestId("nav-switcher")).toBeInTheDocument();
  });

  it("omits the console nav switcher on the main product", () => {
    render(<SideNavigationItems items={items} product="main" />);
    expect(screen.queryByTestId("nav-switcher")).not.toBeInTheDocument();
  });

  it("marks the link matching the current path as active", () => {
    render(<SideNavigationItems items={items} product="model-api" />);
    expect(screen.getByText("Model Library").closest("a")?.className).toContain(
      "active",
    );
  });

  it("navigates back to the previous main page on Back click", () => {
    mockPrevPath.mockReturnValue("/gpus-console");
    render(<SideNavigationItems items={items} product="model-api" />);
    fireEvent.click(screen.getByText("Back"));
    expect(mockPush).toHaveBeenCalledWith("/gpus-console");
  });

  it("falls back to the console route when there is no previous page", () => {
    mockPrevPath.mockReturnValue(null);
    render(<SideNavigationItems items={items} product="model-api" />);
    fireEvent.click(screen.getByText("Back"));
    expect(mockPush).toHaveBeenCalledWith("/console");
  });
});
