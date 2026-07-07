import * as React from "react";
import { render, screen } from "@testing-library/react";

const isShowRegistrationCampaign = jest.fn();
const getRegistrationCampaign = jest.fn();
jest.mock("@/lib/utils/registrationCampaign", () => ({
  isShowRegistrationCampaign: (...a: unknown[]) =>
    isShowRegistrationCampaign(...a),
  getRegistrationCampaign: (...a: unknown[]) => getRegistrationCampaign(...a),
}));

const getCampaignConfig = jest.fn();
jest.mock("@/config/campaign", () => ({
  __esModule: true,
  default: (...a: unknown[]) => getCampaignConfig(...a),
}));

jest.mock("@/components/ui/standard/md-docs", () => ({
  __esModule: true,
  default: ({ content }: any) => <div data-testid="md">{content}</div>,
}));

import { PageWithBg } from "@/app/user/components/common-background";

describe("PageWithBg", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the default marketing content when no campaign is active", () => {
    isShowRegistrationCampaign.mockReturnValue(false);
    getRegistrationCampaign.mockReturnValue(null);
    getCampaignConfig.mockReturnValue({ enabled: false });
    render(
      <PageWithBg rootPage="login">
        <div>form</div>
      </PageWithBg>,
    );
    expect(
      screen.getByText("The AI-Native Cloud for Builders and Agents"),
    ).toBeInTheDocument();
    expect(screen.getByText("form")).toBeInTheDocument();
  });

  it("renders the registration campaign content when active", () => {
    isShowRegistrationCampaign.mockReturnValue(true);
    getRegistrationCampaign.mockReturnValue({
      title: "Big Promo",
      description: "save now",
      logo: "/logo.png",
    });
    getCampaignConfig.mockReturnValue({ enabled: false });
    render(
      <PageWithBg rootPage="signup">
        <div>form</div>
      </PageWithBg>,
    );
    expect(screen.getByText("save now")).toBeInTheDocument();
    expect(
      screen.queryByText("The AI-Native Cloud for Builders and Agents"),
    ).not.toBeInTheDocument();
  });
});
