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
  CLICK_BTN_IDs: { MESSAGE_CENTER: { OPEN: "message_center_open" } },
}));

jest.mock("@/lib/hooks/useIsNoticeShowing", () => ({
  useIsNoticeShowing: jest.fn(() => true),
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

const nowSeconds = 1_800_000_000;

function renderMessageCenter() {
  const view = render(<MessageCenter />);
  const trigger = view.container.querySelector(".relative.cursor-pointer");
  if (!trigger) throw new Error("trigger not found");
  return { ...view, trigger };
}

describe("MessageCenter more branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(nowSeconds * 1000);
    jest.spyOn(console, "error").mockImplementation(() => {});
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: jest.fn(),
    });
    mockIsMobile = false;
    mockGetUnreadCount.mockResolvedValue({ unReadCount: 5 });
    mockGetMessageDetail.mockResolvedValue({ content: "<p>Body</p>" });
    mockMarkMessageAsRead.mockResolvedValue({});
    mockMarkAllMessagesAsRead.mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders numeric unread badge when count is under 100", async () => {
    mockGetMessageList.mockResolvedValue({ messages: [], total: 0 });
    renderMessageCenter();
    await waitFor(() => expect(screen.getByText("5")).toBeInTheDocument());
  });

  it("renders no badge when unread count is zero", async () => {
    mockGetUnreadCount.mockResolvedValue({ unReadCount: 0 });
    mockGetMessageList.mockResolvedValue({ messages: [], total: 0 });
    const { container } = renderMessageCenter();
    await waitFor(() => expect(mockGetUnreadCount).toHaveBeenCalled());
    expect(container.querySelector("span span")).toBeNull();
  });

  it("shows empty state when no messages", async () => {
    mockGetMessageList.mockResolvedValue({ messages: [], total: 0 });
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByText("No messages yet")).toBeInTheDocument(),
    );
  });

  it("formats hours-ago and absolute dates", async () => {
    // formatTime relies on the real wall clock (new Date()), not Date.now mock
    const realNow = Math.floor(new Date().getTime() / 1000);
    mockGetMessageList.mockResolvedValue({
      messages: [
        {
          createdAt: realNow - 3 * 60 * 60,
          id: 10,
          readStatus: false,
          title: "Three hours msg",
        },
        {
          createdAt: realNow - 5 * 24 * 60 * 60,
          id: 11,
          readStatus: true,
          title: "Five days msg",
        },
      ],
      total: 2,
    });
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByText("Three hours msg")).toBeInTheDocument(),
    );
    expect(screen.getByText("3 hours ago")).toBeInTheDocument();
    // absolute date branch (older than 24h) renders a yyyy/mm/dd-ish string
    expect(screen.getAllByText(/\d{4}\/\d{2}\/\d{2}/).length).toBeGreaterThan(
      0,
    );
  });

  it("logs error when unread count fails but still renders", async () => {
    mockGetUnreadCount.mockRejectedValue(new Error("boom"));
    mockGetMessageList.mockResolvedValue({ messages: [], total: 0 });
    renderMessageCenter();
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        "Failed to load unread count:",
        expect.any(Error),
      ),
    );
  });

  it("logs error when message list fails", async () => {
    mockGetMessageList.mockRejectedValue(new Error("list fail"));
    renderMessageCenter();
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        "Failed to load messages:",
        expect.any(Error),
      ),
    );
  });

  it("logs error when message detail fails", async () => {
    mockGetMessageList.mockResolvedValue({
      messages: [
        {
          createdAt: nowSeconds,
          id: 1,
          readStatus: true,
          title: "Already read",
        },
      ],
      total: 1,
    });
    mockGetMessageDetail.mockRejectedValue(new Error("detail fail"));
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() => screen.getByText("Already read"));
    fireEvent.click(screen.getAllByText("Already read").at(-1)!);
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        "Failed to load message detail:",
        expect.any(Error),
      ),
    );
    // already-read message should NOT trigger mark-as-read
    expect(mockMarkMessageAsRead).not.toHaveBeenCalled();
  });

  it("logs error when mark-all-read fails", async () => {
    mockGetMessageList.mockResolvedValue({
      messages: [
        { createdAt: nowSeconds, id: 1, readStatus: false, title: "Msg one" },
      ],
      total: 1,
    });
    mockMarkAllMessagesAsRead.mockRejectedValue(new Error("mark fail"));
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() => screen.getByText("Msg one"));
    fireEvent.click(screen.getByText("Mark all as read"));
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        "Failed to mark all messages as read:",
        expect.any(Error),
      ),
    );
  });

  it("closes via the X button", async () => {
    mockGetMessageList.mockResolvedValue({
      messages: [
        { createdAt: nowSeconds, id: 1, readStatus: false, title: "Msg one" },
      ],
      total: 1,
    });
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() => screen.getByText("Msg one"));
    const closeBtn = screen.getByText("Close").closest("button")!;
    fireEvent.click(closeBtn);
    await waitFor(() =>
      expect(screen.queryByText("Messages")).not.toBeInTheDocument(),
    );
  });

  it("no-ops when clicking the already active tab", async () => {
    mockGetMessageList.mockResolvedValue({
      messages: [
        { createdAt: nowSeconds, id: 1, readStatus: false, title: "Msg one" },
      ],
      total: 1,
    });
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() => screen.getByText("Msg one"));
    const callsBefore = mockGetMessageList.mock.calls.length;
    fireEvent.click(screen.getByText("All")); // already active
    expect(mockGetMessageList.mock.calls.length).toBe(callsBefore);
  });

  it("paginates on scroll and then shows no-more footer", async () => {
    const fullPage = Array.from({ length: 20 }, (_, i) => ({
      createdAt: nowSeconds,
      id: i + 1,
      readStatus: false,
      title: `Page1 #${i + 1}`,
    }));
    mockGetMessageList.mockImplementation(({ pageIndex }: any) =>
      pageIndex === 1
        ? Promise.resolve({ messages: fullPage, total: 40 })
        : Promise.resolve({
            messages: [
              {
                createdAt: nowSeconds,
                id: 99,
                readStatus: false,
                title: "Tail",
              },
            ],
            total: 40,
          }),
    );
    const { trigger, container } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() => screen.getByText("Page1 #1"));

    const list = container.querySelector(
      "[class*='overflow-y-auto']",
    ) as HTMLElement;
    // emulate scrolled-to-bottom
    Object.defineProperty(list, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(list, "clientHeight", {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      value: 100,
    });
    fireEvent.scroll(list);

    await waitFor(() =>
      expect(mockGetMessageList).toHaveBeenCalledWith(
        expect.objectContaining({ pageIndex: 2 }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByText("No more messages")).toBeInTheDocument(),
    );
  });

  it("closes the sheet when a document click lands outside sheet content", async () => {
    mockGetMessageList.mockResolvedValue({
      messages: [
        { createdAt: nowSeconds, id: 1, readStatus: false, title: "Msg one" },
      ],
      total: 1,
    });
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() => screen.getByText("Msg one"));
    // A capture-phase document click outside .msg-center-sheet-content closes it.
    fireEvent.click(document.body);
    await waitFor(() =>
      expect(screen.queryByText("Messages")).not.toBeInTheDocument(),
    );
  });

  it("reopening resets state and reloads from page 1", async () => {
    mockGetMessageList.mockResolvedValue({
      messages: [
        { createdAt: nowSeconds, id: 1, readStatus: false, title: "Msg one" },
      ],
      total: 1,
    });
    const { trigger } = renderMessageCenter();
    fireEvent.click(trigger);
    await waitFor(() => screen.getByText("Msg one"));
    // close via X
    fireEvent.click(screen.getByText("Close").closest("button")!);
    await waitFor(() =>
      expect(screen.queryByText("Messages")).not.toBeInTheDocument(),
    );
    const callsBefore = mockGetMessageList.mock.calls.length;
    // reopen -> handleOpenChange(true) resets + reloads
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(mockGetMessageList.mock.calls.length).toBeGreaterThan(callsBefore),
    );
  });
});
