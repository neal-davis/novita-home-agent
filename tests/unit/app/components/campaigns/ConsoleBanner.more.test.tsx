import { fireEvent, render, screen } from "@testing-library/react";
import { ConsoleBanner } from "@/app/components/campaigns/ConsoleBanner";

let mockBannerItems: any;
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

describe("ConsoleBanner more branches", () => {
  beforeEach(() => {
    mockBannerItems = [];
    mockPathname = "/console";
  });

  it("renders nothing when the config is not an array", () => {
    mockBannerItems = { not: "array" };
    const { container } = render(<ConsoleBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps a banner with no buttonHref", () => {
    mockBannerItems = [banner({ buttonHref: undefined, badgeText: "KEEP" })];
    render(<ConsoleBanner />);
    expect(screen.getByText("KEEP")).toBeInTheDocument();
  });

  it("filters an absolute-URL banner whose pathname matches", () => {
    mockPathname = "/promo";
    mockBannerItems = [
      banner({ buttonHref: "https://example.com/promo", badgeText: "HIDE" }),
    ];
    const { container } = render(<ConsoleBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps an absolute-URL banner whose pathname differs", () => {
    mockPathname = "/console";
    mockBannerItems = [
      banner({ buttonHref: "https://example.com/other", badgeText: "SHOW" }),
    ];
    render(<ConsoleBanner />);
    expect(screen.getByText("SHOW")).toBeInTheDocument();
  });

  it("keeps a banner with a malformed http URL (catch branch)", () => {
    mockBannerItems = [
      banner({ buttonHref: "http://[bad-url", badgeText: "BADURL" }),
    ];
    render(<ConsoleBanner />);
    expect(screen.getByText("BADURL")).toBeInTheDocument();
  });

  it("wraps from the first banner to the last on Previous", () => {
    mockBannerItems = [
      banner({ badgeText: "ONE", buttonHref: "/a" }),
      banner({ badgeText: "TWO", buttonHref: "/b" }),
      banner({ badgeText: "THREE", buttonHref: "/c" }),
    ];
    render(<ConsoleBanner />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Previous banner"));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.getByText("THREE")).toBeInTheDocument();
  });

  it("renders empty strings gracefully when fields are missing", () => {
    mockBannerItems = [{ buttonHref: "/x" }];
    const { container } = render(<ConsoleBanner />);
    // banner still rendered (a link exists) even with all optional fields absent
    expect(container.querySelector("a")).toBeInTheDocument();
  });
});
