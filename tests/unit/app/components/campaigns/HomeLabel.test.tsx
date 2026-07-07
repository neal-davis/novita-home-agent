import { render, screen } from "@testing-library/react";
import { HomeCampaignLabel } from "@/app/components/campaigns/HomeLabel";
import getCampaignConfig from "@/config/campaign";

jest.mock("@/config/campaign", () => jest.fn());

jest.mock("@/components/ui/button", () => ({
  ButtonArrow: () => <span data-testid="arrow" />,
}));

const mockConfig = getCampaignConfig as unknown as jest.Mock;

describe("HomeCampaignLabel", () => {
  it("renders nothing when the campaign is disabled", () => {
    mockConfig.mockReturnValue({ enabled: false });
    const { container } = render(<HomeCampaignLabel />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the badge and link using campaign defaults", () => {
    mockConfig.mockReturnValue({
      enabled: true,
      HomeCampaignLabelText: "Badge!",
      HomeCampaignLabelLinkText: "Join now",
      campaignUrl: "/build-month",
    });
    render(<HomeCampaignLabel />);
    expect(screen.getByText("Badge!")).toBeInTheDocument();
    const link = screen.getByText("Join now").closest("a");
    expect(link).toHaveAttribute("href", "/build-month");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("overrides defaults with passed props and respects openInNewTab=false", () => {
    mockConfig.mockReturnValue({
      enabled: true,
      HomeCampaignLabelText: "default",
      HomeCampaignLabelLinkText: "default-link",
      campaignUrl: "/x",
    });
    render(
      <HomeCampaignLabel
        badgeText="Custom"
        linkText="Custom Link"
        href="/custom"
        openInNewTab={false}
      />,
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
    const link = screen.getByText("Custom Link").closest("a");
    expect(link).toHaveAttribute("href", "/custom");
    expect(link).not.toHaveAttribute("target");
  });
});
