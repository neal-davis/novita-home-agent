import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EnterpriseTable from "@/app/models-console/image-dedicated-endpoints/components/EnterpriseTable";

let mockState: any;
const mockDispatch = jest.fn();
const mockCardsInfo = [
  {
    id: "pm_1",
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2030,
  },
];

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock("@/store", () => ({
  useAppSelector: (selector: any) => selector(mockState),
}));

jest.mock("@/api/enterprise", () => ({
  cancelEnterprisePlan: jest.fn(() => Promise.resolve()),
  queryEnterprisePlanRecord: jest.fn(() =>
    Promise.resolve({ enterprisePlanRecordList: [] }),
  ),
  updateEnterprisePlanBillingMethod: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/api/buy", () => ({
  bindPaymentMethod: jest.fn(() => Promise.resolve({ url: "" })),
}));

jest.mock("@/app/billing/lib/hooks/paymentMethods", () => ({
  usePaymentMethod: () => ({
    cardsInfo: mockCardsInfo,
    isLoading: false,
  }),
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => true,
}));

jest.mock("@/store/slice/configSlice", () => ({
  fetchEnterprise: () => ({ type: "config/fetchEnterprise" }),
}));

jest.mock("@/lib/icons/VISA", () => ({
  __esModule: true,
  default: () => <span>VISA</span>,
}));

describe("EnterpriseTable", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockState = {
      user: {
        uuid: "user-1",
        currentTeam: { role: "owner" },
      },
      config: {
        enterprise: {
          billingMethod: 1,
        },
      },
      billing: {
        balanceDetail: {
          accountBalance: 100,
        },
      },
    };
  });

  it("opens billing method dialog without triggering a render loop", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<EnterpriseTable />);

    fireEvent.click(screen.getByRole("button", { name: "Billing Method" }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Change Billing Methods" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Credit Card")).toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toHaveClass("rounded-full");
    expect(saveButton.className).not.toContain("console_button");
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Maximum update depth exceeded"),
    );

    errorSpy.mockRestore();
  });
});
