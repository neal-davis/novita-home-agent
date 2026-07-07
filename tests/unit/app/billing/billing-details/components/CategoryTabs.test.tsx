import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CategoryTabs from "@/app/billing/billing-details/components/CategoryTabs";

const mockDispatch = jest.fn();
let mockBillingInfo: any = null;

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    selector({ billing: { billingInfo: mockBillingInfo } }),
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBillingInfo: jest.fn(() => ({ type: "billing/fetchBillingInfo" })),
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    BILLING: {
      BILLING_DETAIL_USAGE_BASED_TAB: "usage",
      BILLING_DETAIL_FIXED_TERM_TAB: "fixed",
      BILLING_DETAIL_AGGREGATED_TAB: "aggregated",
      BILLING_DETAIL_ENTERPRISE_TAB: "enterprise",
    },
  },
}));

describe("CategoryTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBillingInfo = null;
  });

  it("renders the base team tabs and dispatches fetch when billing info missing", () => {
    render(<CategoryTabs onChange={jest.fn()} />);

    expect(screen.getByText("Usage-based Billing")).toBeInTheDocument();
    expect(screen.getByText("Fixed-term Billing")).toBeInTheDocument();
    expect(screen.getByText("Aggregated Billing")).toBeInTheDocument();
    expect(screen.queryByText("Enterprise Billing")).not.toBeInTheDocument();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("appends the enterprise tab when billingInfo.isEnterprise is true", () => {
    mockBillingInfo = { isEnterprise: true };

    render(<CategoryTabs onChange={jest.fn()} />);

    expect(screen.getByText("Enterprise Billing")).toBeInTheDocument();
    // billingInfo present -> no fetch dispatched
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("calls onChange with the tab value when a tab is clicked", () => {
    const onChange = jest.fn();
    render(<CategoryTabs onChange={onChange} />);

    fireEvent.click(screen.getByText("Fixed-term Billing"));
    expect(onChange).toHaveBeenCalledWith("Monthly");

    fireEvent.click(screen.getByText("Aggregated Billing"));
    expect(onChange).toHaveBeenCalledWith("MultiDimension");
  });
});
