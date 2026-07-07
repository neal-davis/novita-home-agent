import { render, screen } from "@testing-library/react";
import ConsentControlledVercelInsights from "@/app/components/consent/ConsentControlledVercelInsights";
import { useCookieConsent } from "@/hooks/useCookiebotConsent";

jest.mock("@/hooks/useCookiebotConsent", () => ({
  useCookieConsent: jest.fn(),
}));

jest.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

jest.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="vercel-speed" />,
}));

const mockConsent = useCookieConsent as jest.Mock;

describe("ConsentControlledVercelInsights", () => {
  it("renders nothing without statistics consent", () => {
    mockConsent.mockReturnValue(false);
    const { container } = render(<ConsentControlledVercelInsights />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders analytics and speed insights with statistics consent", () => {
    mockConsent.mockReturnValue(true);
    render(<ConsentControlledVercelInsights />);
    expect(screen.getByTestId("vercel-analytics")).toBeInTheDocument();
    expect(screen.getByTestId("vercel-speed")).toBeInTheDocument();
  });
});
