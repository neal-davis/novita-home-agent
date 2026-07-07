import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("react-redux", () => ({ useSelector: jest.fn() }));

jest.mock("next/image", () => {
  const MockNextImage = ({ alt, src, ...props }: any) => (
    <img alt={alt} src={src} {...props} />
  );
  MockNextImage.displayName = "MockNextImage";
  return MockNextImage;
});

jest.mock("@/app/components/layout/LayoutSafeRail", () => ({
  LayoutSafeRail: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock("@/app/components/button/Button", () => {
  const MockButton = ({ children, link, renderTag, elAttrs, ...props }: any) =>
    renderTag === "link" ? (
      <a href={link} data-testid="mock-button" {...elAttrs} {...props}>
        {children}
      </a>
    ) : (
      <button data-testid="mock-button" {...props}>
        {children}
      </button>
    );
  MockButton.displayName = "MockButton";
  return MockButton;
});

jest.mock("@/i18n/config", () => ({ getLocalizedPath: (h: string) => h }));
jest.mock("@/i18n/provider", () => ({ useI18n: jest.fn() }));

import { HomeCampaignBanner } from "@/app/components/campaigns/HomeCampaignBanner";
import { useI18n } from "@/i18n/provider";

const { useSelector } = jest.requireMock("react-redux") as {
  useSelector: jest.Mock;
};

const setItems = (items: any) =>
  useSelector.mockImplementation((sel: any) =>
    sel({ config: { campaignConfig: { homeCampaignBanner: items } } }),
  );

describe("HomeCampaignBanner more branches", () => {
  beforeEach(() => {
    (useI18n as jest.Mock).mockReturnValue({ locale: "en" });
  });
  afterEach(() => jest.clearAllMocks());

  it("returns null when config value is not an array", () => {
    setItems({ not: "array" });
    const { container } = render(<HomeCampaignBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders empty-string fallbacks when item fields are missing", () => {
    setItems([{}]);
    const { container } = render(<HomeCampaignBanner />);
    const heading = screen.getByRole("heading", { level: 2 });
    // both segments fall back to "" so the combined title is empty
    expect(heading).toHaveAttribute("title", "");
    expect(container.querySelector(".badge")).toBeInTheDocument();
  });

  it("adds external target/rel for an http buttonHref", () => {
    setItems([{ buttonHref: "https://ext.example.com/go", buttonText: "Go" }]);
    render(<HomeCampaignBanner />);
    const link = screen.getByTestId("mock-button");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("omits external attrs for an internal buttonHref", () => {
    setItems([{ buttonHref: "/internal", buttonText: "Go" }]);
    render(<HomeCampaignBanner />);
    const link = screen.getByTestId("mock-button");
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAttribute("href", "/internal");
  });

  it("wraps to the last banner when clicking Previous", () => {
    setItems([
      { badgeText: "A", buttonHref: "/a", buttonText: "Go" },
      { badgeText: "B", buttonHref: "/b", buttonText: "Go" },
    ]);
    render(<HomeCampaignBanner />);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Previous banner"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
