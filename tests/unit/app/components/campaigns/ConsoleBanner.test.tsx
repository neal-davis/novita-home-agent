import { act, fireEvent, render, screen } from "@testing-library/react";
import { ConsoleBanner } from "@/app/components/campaigns/ConsoleBanner";

let mockBannerItems: any[];
let mockPathname = "/console";

jest.mock("react-redux", () => ({
  useSelector: (sel: any) =>
    sel({
      config: { campaignConfig: { consoleCampaignBanner: mockBannerItems } },
    }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (link: string) => link,
  getPathnameWithoutLocale: (p: string) => p,
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

const banner = (over: any = {}) => ({
  buttonHref: "/promo",
  badgeText: "NEW",
  headingPart1: "Heading ",
  headingPart2: "Gradient",
  description: "Desc",
  buttonText: "View",
  ...over,
});

describe("ConsoleBanner", () => {
  beforeEach(() => {
    mockBannerItems = [];
    mockPathname = "/console";
  });

  it("renders nothing when there are no banner items", () => {
    const { container } = render(<ConsoleBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a single banner without pagination", () => {
    mockBannerItems = [banner()];
    render(<ConsoleBanner />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
    expect(screen.getByText("Gradient")).toBeInTheDocument();
    expect(screen.queryByLabelText("Next banner")).not.toBeInTheDocument();
  });

  it("filters out banners whose href matches the current pathname", () => {
    mockPathname = "/console";
    mockBannerItems = [banner({ buttonHref: "/console", badgeText: "HIDE" })];
    const { container } = render(<ConsoleBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows pagination and navigates with next/prev for multiple banners", () => {
    jest.useFakeTimers();
    mockBannerItems = [
      banner({ badgeText: "ONE", buttonHref: "/a" }),
      banner({ badgeText: "TWO", buttonHref: "/b" }),
    ];
    render(<ConsoleBanner />);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("ONE")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Next banner"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("TWO")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Previous banner"));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    jest.useRealTimers();
  });

  it("auto-rotates banners on the interval timer", () => {
    jest.useFakeTimers();
    mockBannerItems = [
      banner({ badgeText: "ONE", buttonHref: "/a" }),
      banner({ badgeText: "TWO", buttonHref: "/b" }),
    ];
    render(<ConsoleBanner />);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    jest.useRealTimers();
  });
});
