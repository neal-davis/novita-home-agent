import { fireEvent, render, screen } from "@testing-library/react";
import { PricingBanner } from "@/app/components/campaigns/PricingBanner";
import getCampaignConfig from "@/config/campaign";

jest.mock("@/config/campaign", () => jest.fn());

jest.mock("@/app/components/buildMonth", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

const mockConfig = getCampaignConfig as unknown as jest.Mock;

describe("PricingBanner", () => {
  it("renders nothing when campaign disabled", () => {
    mockConfig.mockReturnValue({ enabled: false });
    const { container } = render(<PricingBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders banner content when campaign enabled", () => {
    mockConfig.mockReturnValue({ enabled: true });
    render(<PricingBanner />);
    expect(
      screen.getByText("Build Month Pricing Is Here!"),
    ).toBeInTheDocument();
    expect(screen.getByText("up to 20% OFF")).toBeInTheDocument();
    expect(screen.getByText("See event terms →")).toBeInTheDocument();
  });

  it("opens the black friday url when the banner is clicked", () => {
    mockConfig.mockReturnValue({ enabled: true });
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<PricingBanner />);
    fireEvent.click(screen.getByText("Build Month Pricing Is Here!"));
    expect(openSpy).toHaveBeenCalledWith("/build-month");
    openSpy.mockRestore();
  });

  it("opens the questions anchor when 'See event terms' is clicked", () => {
    mockConfig.mockReturnValue({ enabled: true });
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<PricingBanner />);
    fireEvent.click(screen.getByText("See event terms →"));
    expect(openSpy).toHaveBeenCalledWith("/build-month#questions");
    openSpy.mockRestore();
  });
});
