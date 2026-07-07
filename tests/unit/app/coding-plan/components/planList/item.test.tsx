import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Item from "@/app/coding-plan/components/planList/item";
import { purchaseResourcePack, upgradeResourcePack } from "@/api/coding-plan";
import { message } from "@/components/ui/standard/notify";
import { showPermissionMessage } from "@/lib/utils/permission";

const mockDispatch = jest.fn();
const mockPush = jest.fn();
const mockCookieGet = jest.fn();
const mockUseAppSelector = jest.fn();
const mockUsePermission = jest.fn();
const mockResourcePackContext = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/coding-plan",
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("js-cookie", () => ({
  get: (key: string) => mockCookieGet(key),
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: any) => unknown) =>
    mockUseAppSelector(selector),
}));

jest.mock("@/store/slice/userSlice", () => ({
  setUserState: jest.fn((state) => ({
    payload: state,
    type: "user/setUserState",
  })),
  UserState: { logout: "logout" },
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockUsePermission(),
}));

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

jest.mock("@/lib/utils/format", () => ({
  formatTokens: jest.fn(
    (value: number) => `${value.toLocaleString()} formatted`,
  ),
}));

jest.mock("@/api/coding-plan", () => ({
  purchaseResourcePack: jest.fn(),
  upgradeResourcePack: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
  },
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PopoverContent: ({
    children,
    onMouseEnter,
    onMouseLeave,
  }: {
    children: React.ReactNode;
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  }) => (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock(
  "@/app/coding-plan/components/planList/ConfirmSubscriptionModal",
  () => ({
    __esModule: true,
    default: ({
      modelList,
      onConfirm,
      open,
      tierName,
    }: {
      modelList: string[];
      onConfirm: () => void;
      open: boolean;
      tierName: string;
    }) =>
      open ? (
        <div role="dialog" aria-label={`confirm ${tierName}`}>
          <span>{modelList.join(",")}</span>
          <button type="button" onClick={onConfirm}>
            confirm subscription
          </button>
        </div>
      ) : null,
  }),
);

jest.mock("@/app/coding-plan/components/planList", () => ({
  useResourcePackContext: () => mockResourcePackContext(),
}));

const mockPurchaseResourcePack = purchaseResourcePack as jest.Mock;
const mockUpgradeResourcePack = upgradeResourcePack as jest.Mock;
const mockMessageError = message.error as jest.Mock;
const mockShowPermissionMessage = showPermissionMessage as jest.Mock;

function codingPlanData(overrides: Record<string, unknown> = {}) {
  return {
    billingCycle: "cycle-based",
    deductRules: [
      { displayName: "GPT-5" },
      { displayName: "GPT-5" },
      { displayName: "Claude" },
    ],
    id: "101",
    name: "Pro monthly",
    orderData: {
      instanceId: "inst-1",
      isFirstOrder: true,
      snapshotPrice: 390000,
      tier: "Lite",
    },
    tierInfo: {
      discountPrice: 490000,
      price: 590000,
      quota: 30000000,
      rpm: 120,
      tier: "Pro",
    },
    ...overrides,
  };
}

function renderItem(props: Record<string, unknown> = {}) {
  render(
    <Item
      canBuy
      data={codingPlanData()}
      index={0}
      isFirstBuy
      isReBuy={false}
      {...props}
    />,
  );
}

describe("coding plan item", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    localStorage.clear();
    mockCookieGet.mockReturnValue("token");
    mockUsePermission.mockReturnValue(true);
    mockResourcePackContext.mockReturnValue({
      failTargetUrl: "/failed",
      loading: false,
      targetUrl: "/success",
    });
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ user: { email: "ada@example.com", uuid: "user-1" } }),
    );
    mockPurchaseResourcePack.mockResolvedValue({ sessionUrl: "#checkout" });
    mockUpgradeResourcePack.mockResolvedValue({ sessionUrl: "#upgrade" });
  });

  it("renders plan details, model access, and starts a first purchase checkout", async () => {
    renderItem();

    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("17% discount")).toBeInTheDocument();
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText(/Performance up to 120/)).toBeInTheDocument();
    expect(screen.getByText("GPT-5")).toBeInTheDocument();
    expect(screen.getByText("Claude")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Subscribe"));
    fireEvent.click(
      screen.getByRole("button", { name: "confirm subscription" }),
    );

    await waitFor(() => {
      expect(mockPurchaseResourcePack).toHaveBeenCalledWith({
        failedUrl: "/failed",
        packSpecId: 101,
        returnUrl: "/success",
        successUrl: "/success",
        tier: "Pro",
      });
    });
  });

  it("starts an upgrade checkout for existing cycle-based plans", async () => {
    renderItem({
      data: codingPlanData({
        orderData: {
          instanceId: "inst-upgrade",
          isFirstOrder: true,
          snapshotPrice: 390000,
          tier: "Lite",
        },
      }),
      isFirstBuy: false,
    });

    fireEvent.click(screen.getByText("Subscribe"));
    fireEvent.click(
      screen.getByRole("button", { name: "confirm subscription" }),
    );

    await waitFor(() => {
      expect(mockUpgradeResourcePack).toHaveBeenCalledWith({
        failedUrl: "/failed",
        instanceId: "inst-upgrade",
        newTier: "Pro",
        returnUrl: "/success",
        successUrl: "/success",
      });
    });
  });

  it("blocks unsupported decrement upgrades before opening checkout", () => {
    renderItem({
      data: codingPlanData({ billingCycle: "decrement-based" }),
      index: 1,
      isFirstBuy: false,
    });

    fireEvent.click(screen.getByText("Subscribe"));

    expect(mockMessageError).toHaveBeenCalledWith(
      "Decrement coding plan does not support upgrade subscription",
    );
    expect(mockUpgradeResourcePack).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users and records the coding-plan source", () => {
    jest.useFakeTimers();
    mockCookieGet.mockReturnValue(undefined);
    mockUseAppSelector.mockImplementation((selector) =>
      selector({ user: { email: "", uuid: "" } }),
    );

    renderItem();

    fireEvent.click(screen.getByText("Subscribe"));

    expect(mockMessageError).toHaveBeenCalledWith("Please login first");

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "logout",
      type: "user/setUserState",
    });
    expect(localStorage.getItem("source")).toBe("coding-plan");
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/user/login?utm_source=coding-plan"),
    );
  });

  it("shows the permission message instead of opening checkout", () => {
    mockUsePermission.mockReturnValue(false);

    renderItem();

    fireEvent.click(screen.getByText("Subscribe"));

    expect(mockShowPermissionMessage).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does nothing while context loading or the item cannot be bought", () => {
    mockResourcePackContext.mockReturnValue({
      failTargetUrl: "/failed",
      loading: true,
      targetUrl: "/success",
    });

    renderItem({ canBuy: false });

    fireEvent.click(screen.getByText("Subscribe"));

    expect(mockPurchaseResourcePack).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
