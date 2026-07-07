import { render, screen } from "@testing-library/react";
import CodingPlanPage from "@/app/billing/coding-plan/index";
import { isCodingPlanCampaignActive } from "@/lib/utils/codingPlanCampaign";

const replaceMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

jest.mock("@/lib/utils/codingPlanCampaign", () => ({
  isCodingPlanCampaignActive: jest.fn(),
}));

jest.mock("@/app/components/Permission/PermissionWrapper", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="perm">{children}</div>,
}));

jest.mock("@/app/billing/coding-plan/components/CodingPlanClient", () => ({
  __esModule: true,
  default: () => <div data-testid="coding-plan-client" />,
}));

jest.mock("@/constants/constants", () => ({
  PERMISSION: {
    RESOURCE_GROUP: { billing: "billing" },
    RESOURCE: { details: "details" },
    ACTION: { read: "read" },
  },
}));

jest.mock("@/constants/urls", () => ({
  NOVITA_URL: { CONSOLE: "/console" },
}));

const activeMock = isCodingPlanCampaignActive as jest.Mock;

describe("CodingPlanPage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the client inside the permission wrapper when active", () => {
    activeMock.mockReturnValue(true);
    render(<CodingPlanPage />);
    expect(screen.getByTestId("coding-plan-client")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects to the console when the campaign is inactive", () => {
    activeMock.mockReturnValue(false);
    const { container } = render(<CodingPlanPage />);
    expect(container).toBeEmptyDOMElement();
    expect(replaceMock).toHaveBeenCalledWith("/console");
  });
});
