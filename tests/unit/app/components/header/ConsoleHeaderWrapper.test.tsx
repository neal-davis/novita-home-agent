import { render, screen } from "@testing-library/react";
import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import { useIsNoticeShowing } from "@/lib/hooks/useIsNoticeShowing";
import { useSideNavigationItems } from "@/hooks/useSideNavigationItems";

let mockPathname = "/models-console/library";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("@/hooks/useHeaderHeight", () => ({
  CONSOLE_ORI_HEADER_HEIGHT: 56,
  useNoticeHeight: () => 40,
}));

jest.mock("@/lib/hooks/useIsNoticeShowing", () => ({
  useIsNoticeShowing: jest.fn(),
}));

jest.mock("@/hooks/useSideNavigationItems", () => ({
  useSideNavigationItems: jest.fn(),
}));

jest.mock("@/i18n/config", () => ({
  getPathnameWithoutLocale: (p: string) => p,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) => a.filter(Boolean).join(" "),
}));

jest.mock("@/app/components/Notice/Notice", () => ({
  __esModule: true,
  default: () => <div data-testid="notice" />,
}));

jest.mock("@/app/components/header/partials/SideNavigationItems", () => ({
  __esModule: true,
  default: ({ items }: any) => (
    <div data-testid="side-nav">{items.length} items</div>
  ),
}));

jest.mock("@/app/components/header/Header", () => ({
  __esModule: true,
  default: ({ consolePageTitle }: any) => (
    <div data-testid="header">{consolePageTitle}</div>
  ),
}));

const mockNotice = useIsNoticeShowing as jest.Mock;
const mockSideNav = useSideNavigationItems as jest.Mock;

describe("ConsoleHeaderWrapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/models-console/library";
    mockSideNav.mockReturnValue([
      {
        key: "library",
        title: "Model Library",
        path: "/models-console/library",
      },
    ]);
  });

  it("renders side nav, header and children with the notice when showing", () => {
    mockNotice.mockReturnValue(true);
    render(
      <ConsoleHeaderWrapper product="model-api">
        <div>page content</div>
      </ConsoleHeaderWrapper>,
    );
    expect(screen.getByTestId("notice")).toBeInTheDocument();
    expect(screen.getByTestId("side-nav")).toHaveTextContent("1 items");
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("derives the console page title from the matching side nav item", () => {
    mockNotice.mockReturnValue(false);
    render(
      <ConsoleHeaderWrapper product="model-api">
        <div>content</div>
      </ConsoleHeaderWrapper>,
    );
    expect(screen.getByTestId("header")).toHaveTextContent("Model Library");
  });

  it("omits the notice when it is not showing", () => {
    mockNotice.mockReturnValue(false);
    render(
      <ConsoleHeaderWrapper product="model-api">
        <div>content</div>
      </ConsoleHeaderWrapper>,
    );
    expect(screen.queryByTestId("notice")).not.toBeInTheDocument();
  });
});
