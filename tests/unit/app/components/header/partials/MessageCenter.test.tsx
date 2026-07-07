import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as mockReact from "react";
import MessageCenter from "@/app/components/header/partials/MessageCenter";
import {
  getMessageDetail,
  getMessageList,
  getUnreadCount,
  markAllMessagesAsRead,
  markMessageAsRead,
} from "@/api/message";
import analytics from "@/app/components/analytics/analytics";

let mockIsMobile = false;

jest.mock("@/api/message", () => ({
  getMessageDetail: jest.fn(),
  getMessageList: jest.fn(),
  getUnreadCount: jest.fn(),
  markAllMessagesAsRead: jest.fn(),
  markMessageAsRead: jest.fn(),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    MESSAGE_CENTER: {
      OPEN: "message_center_open",
    },
  },
}));

jest.mock("@/lib/hooks/useIsNoticeShowing", () => ({
  useIsNoticeShowing: jest.fn(() => false),
}));

jest.mock("@/hooks/useIsMobile", () => ({
  useIsMobile: jest.fn(() => mockIsMobile),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/standard/loading", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: ({ description }: any) => <div>{description}</div>,
}));

jest.mock("@/components/ui/sheet", () => {
  const SheetContext = mockReact.createContext({
    onOpenChange: (_open: boolean) => {},
    open: false,
  });

  return {
    Sheet: ({ children, onOpenChange, open }: any) => (
      <SheetContext.Provider value={{ onOpenChange, open }}>
        <div>{children}</div>
      </SheetContext.Provider>
    ),
    SheetContent: ({ children, className }: any) => {
      const context = mockReact.useContext(SheetContext);
      return context.open ? (
        <section className={className}>{children}</section>
      ) : null;
    },
    SheetHeader: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    SheetTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    SheetTrigger: ({ children }: any) => {
      const context = mockReact.useContext(SheetContext);
      return mockReact.cloneElement(children, {
        onClick: (event: MouseEvent) => {
          children.props.onClick?.(event);
          context.onOpenChange(true);
        },
      });
    },
  };
});

jest.mock("@/components/ui/tabs", () => {
  const TabsContext = mockReact.createContext({
    onValueChange: (_value: string) => {},
    value: "all",
  });

  return {
    Tabs: ({ children, onValueChange, value }: any) => (
      <TabsContext.Provider value={{ onValueChange, value }}>
        <div>{children}</div>
      </TabsContext.Provider>
    ),
    TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    TabsTrigger: ({ children, value, ...props }: any) => {
      const context = mockReact.useContext(TabsContext);
      return (
        <button
          {...props}
          data-state={context.value === value ? "active" : "inactive"}
          onClick={() => context.onValueChange(value)}
        >
          {children}
        </button>
      );
    },
  };
});

const mockGetMessageList = getMessageList as jest.Mock;
const mockGetUnreadCount = getUnreadCount as jest.Mock;
const mockGetMessageDetail = getMessageDetail as jest.Mock;
const mockMarkMessageAsRead = markMessageAsRead as jest.Mock;
const mockMarkAllMessagesAsRead = markAllMessagesAsRead as jest.Mock;
const mockTrackClick = analytics.trackClick as jest.Mock;

const nowSeconds = 1_800_000_000;
const messages = [
  {
    createdAt: nowSeconds,
    id: 1,
    readStatus: false,
    title: "Unread invoice update",
  },
  {
    createdAt: nowSeconds - 600,
    id: 2,
    readStatus: true,
    title: "Read deployment notice",
  },
];

function renderMessageCenter() {
  const view = render(<MessageCenter />);
  const trigger = view.container.querySelector(".relative.cursor-pointer");
  if (!trigger) throw new Error("message center trigger not found");
  return { ...view, trigger };
}

describe("MessageCenter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(nowSeconds * 1000);
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: jest.fn(),
    });
    mockIsMobile = false;
    mockGetUnreadCount.mockResolvedValue({ unReadCount: 120 });
    mockGetMessageList.mockResolvedValue({
      messages,
      total: messages.length,
    });
    mockGetMessageDetail.mockResolvedValue({
      content:
        "<p>Invoice details</p><table><tbody><tr><td>A</td></tr></tbody></table>",
    });
    mockMarkMessageAsRead.mockResolvedValue({});
    mockMarkAllMessagesAsRead.mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads unread count, opens the sheet and renders messages", async () => {
    const { trigger } = renderMessageCenter();

    await waitFor(() => expect(screen.getByText("99+")).toBeInTheDocument());

    fireEvent.click(trigger);

    expect(mockTrackClick).toHaveBeenCalledWith("message_center_open");
    await waitFor(() =>
      expect(screen.getByText("Unread invoice update")).toBeInTheDocument(),
    );
    expect(screen.getByText("Read deployment notice")).toBeInTheDocument();
    expect(mockGetMessageList).toHaveBeenCalledWith(
      expect.objectContaining({
        pageIndex: 1,
        pageSize: 20,
        readStatus: undefined,
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("loads message detail, wraps tables and marks unread messages as read", async () => {
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);

    await waitFor(() => screen.getByText("Unread invoice update"));
    fireEvent.click(screen.getAllByText("Unread invoice update").at(-1)!);

    await waitFor(() =>
      expect(mockGetMessageDetail).toHaveBeenCalledWith({ id: 1 }),
    );
    expect(mockMarkMessageAsRead).toHaveBeenCalledWith({ id: 1 });
    await waitFor(() =>
      expect(screen.getByText("Invoice details")).toBeInTheDocument(),
    );
    expect(document.querySelector(".table-wrapper table")).toBeInTheDocument();
    expect(screen.getAllByText("Read").length).toBeGreaterThanOrEqual(2);
    expect(mockGetUnreadCount).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getAllByText("Unread invoice update").at(-1)!);
    await waitFor(() =>
      expect(screen.queryByText("Invoice details")).not.toBeInTheDocument(),
    );
  });

  it("refreshes tab queries and marks all messages as read", async () => {
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);

    await waitFor(() => screen.getByText("Unread invoice update"));

    fireEvent.click(screen.getByText("Unread"));
    await waitFor(() =>
      expect(mockGetMessageList).toHaveBeenLastCalledWith(
        expect.objectContaining({ readStatus: false }),
      ),
    );

    fireEvent.click(screen.getByText("Read"));
    await waitFor(() =>
      expect(mockGetMessageList).toHaveBeenLastCalledWith(
        expect.objectContaining({ readStatus: true }),
      ),
    );

    fireEvent.click(screen.getByText("Mark all as read"));
    await waitFor(() => expect(mockMarkAllMessagesAsRead).toHaveBeenCalled());
    expect(screen.getAllByText("Read").length).toBeGreaterThanOrEqual(2);
  });

  it("uses a mobile detail panel with a back action", async () => {
    mockIsMobile = true;
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);

    await waitFor(() => screen.getByText("Unread invoice update"));
    fireEvent.click(screen.getByText("Unread invoice update"));

    await waitFor(() => expect(screen.getByText("Back")).toBeInTheDocument());
    expect(screen.getByText("Invoice details")).toBeInTheDocument();

    fireEvent.click(
      screen.getByText("Back").parentElement!.querySelector("button")!,
    );
    await waitFor(() =>
      expect(screen.queryByText("Invoice details")).not.toBeInTheDocument(),
    );
  });
});
