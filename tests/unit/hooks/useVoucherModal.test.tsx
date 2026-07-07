const mockUsePermission = jest.fn();
const mockGetVoucherList = jest.fn();
const mockQueryVoucherNum = jest.fn();
const mockShowPermissionMessage = jest.fn();

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: (...a: unknown[]) => mockUsePermission(...a),
}));
jest.mock("@/api/user", () => ({
  getVoucherList: (...a: unknown[]) => mockGetVoucherList(...a),
}));
jest.mock("@/api/buy", () => ({
  queryBillingGetVoucherNum: (...a: unknown[]) => mockQueryVoucherNum(...a),
}));
jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: (...a: unknown[]) => mockShowPermissionMessage(...a),
}));
jest.mock("@/constants/constants", () => ({
  PERMISSION: {
    RESOURCE_GROUP: { main_console: "main_console" },
    RESOURCE: { billing: "billing" },
    ACTION: { read: "read" },
  },
}));
jest.mock("@/app/billing/overview/components/voucher/VoucherModal", () => ({
  VoucherModal: () => null,
}));

import { useVoucherModal } from "@/hooks/useVoucherModal";
import { act, renderHook, waitFor } from "@testing-library/react";

describe("useVoucherModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryVoucherNum.mockResolvedValue({ num: 3 });
    mockGetVoucherList.mockResolvedValue({
      totalBalance: 100,
      data: [{ status: "valid" }, { status: "valid" }, { status: "expired" }],
    });
  });

  it("fetches voucher num and list when permission is granted", async () => {
    mockUsePermission.mockReturnValue(true);
    const { result } = renderHook(() => useVoucherModal());
    await waitFor(() => expect(mockQueryVoucherNum).toHaveBeenCalled());
    expect(mockGetVoucherList).toHaveBeenCalled();
    expect(result.current.hasBillingPermission).toBe(true);
    // 2 valid out of 3
    await waitFor(() => expect(result.current.voucherNum).toEqual({ num: 2 }));
  });

  it("opens the modal and refetches when permitted", async () => {
    mockUsePermission.mockReturnValue(true);
    const { result } = renderHook(() => useVoucherModal());
    await waitFor(() => expect(mockGetVoucherList).toHaveBeenCalled());
    mockGetVoucherList.mockClear();
    act(() => result.current.handleVoucherModalOpen());
    expect(result.current.voucherModalOpen).toBe(true);
    expect(mockGetVoucherList).toHaveBeenCalled();
  });

  it("shows a permission message and does not open when not permitted", () => {
    mockUsePermission.mockReturnValue(false);
    const { result } = renderHook(() => useVoucherModal());
    act(() => result.current.handleVoucherModalOpen());
    expect(mockShowPermissionMessage).toHaveBeenCalled();
    expect(result.current.voucherModalOpen).toBe(false);
  });

  it("does not fetch voucher num without permission", () => {
    mockUsePermission.mockReturnValue(false);
    renderHook(() => useVoucherModal());
    expect(mockQueryVoucherNum).not.toHaveBeenCalled();
  });
});
