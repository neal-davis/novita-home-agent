"use client";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, RefreshCw, X } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./MessageCenter.module.scss";
import {
  getMessageList,
  getUnreadCount,
  markMessageAsRead,
  markAllMessagesAsRead,
  getMessageDetail,
  type UserMessage,
  type UserMessageDetail,
} from "@/api/message";
import analytics from "../../analytics/analytics";
import { CLICK_BTN_IDs } from "../../analytics/constants";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/standard/loading";
import { NoData } from "@/components/ui/standard/no-data";
import { useIsNoticeShowing } from "@/lib/hooks/useIsNoticeShowing";
import { useIsMobile } from "@/hooks/useIsMobile";

// Message type definition - extends API UserMessage interface
interface Message {
  id: number; // Changed from string to number to match API
  title: string;
  content?: string; // Optional, will be loaded separately
  type?: "system" | "billing" | "service" | "promotion"; // Optional, not from API
  isRead: boolean; // Maps to readStatus from API
  tempRead: boolean; // Temporary read status, used for UI only
  createdAt: number; // Changed from string to number (timestamp)
  actionUrl?: string;
  actionText?: string;
}

// Helper function to convert API UserMessage to local Message interface
const convertUserMessageToMessage = (userMessage: UserMessage): Message => ({
  id: userMessage.id,
  title: userMessage.title,
  isRead: userMessage.readStatus,
  tempRead: userMessage.readStatus,
  createdAt: userMessage.createdAt,
});

const PAGE_SIZE = 20;

export default function MessageCenter() {
  const [open, setOpen] = useState(false);
  const [hasEverOpened, setHasEverOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] =
    useState<UserMessageDetail | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [unreadCount, setUnreadCount] = useState(0);
  const isNoticeShowing = useIsNoticeShowing();

  // Ref for the message list container
  const messageListRef = useRef<HTMLDivElement>(null);

  // Ref for the message detail container
  const messageDetailRef = useRef<HTMLDivElement>(null);

  // Ref for the current AbortController to cancel ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const isMobile = useIsMobile();

  // Mobile detail view state
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Add click event listener to close Sheet when clicking on Header
  useEffect(() => {
    if (!open) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element;
      // Find the closest sheet content element (Radix Dialog content)
      const sheetContent = target.closest(".msg-center-sheet-content");

      // If clicked on header and not on sheet content or trigger, close the sheet
      if (!sheetContent) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [open]);

  // Load unread count function
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.unReadCount);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  }, []);

  // Initial load unread count
  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // Polling for unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  // Load initial messages
  const loadMessages = useCallback(
    async (pageNum: number, readStatus?: boolean | undefined) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);

      try {
        const response = await getMessageList({
          readStatus: readStatus,
          pageIndex: pageNum,
          pageSize: PAGE_SIZE,
          signal: abortController.signal,
        });

        // Check if the request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        const convertedMessages = response.messages.map(
          convertUserMessageToMessage,
        );

        if (pageNum === 1) {
          setMessages(convertedMessages);
        } else {
          setMessages((prev) => [...prev, ...convertedMessages]);
        }

        setPage(pageNum);
        // setTotal(response.total);
        setHasMore(convertedMessages.length === PAGE_SIZE);
      } catch (error) {
        // Don't log error if request was cancelled
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to load messages:", error);
        }
      } finally {
        // Only update loading state if this is still the current request
        if (abortControllerRef.current === abortController) {
          setLoading(false);
        }
      }
    },
    [],
  );
  useEffect(() => {
    loadMessages(1);
  }, [loadMessages]);

  // Filter messages based on active tab and set first message as selected
  useEffect(() => {
    let filtered: Message[] = [];
    switch (activeTab) {
      case "unread":
        filtered = messages.filter((msg) => !msg.isRead);
        break;
      case "read":
        filtered = messages.filter((msg) => msg.isRead);
        break;
      default:
        filtered = messages;
    }
    setFilteredMessages(filtered);
  }, [messages, activeTab, selectedMessage]);

  const syncReadStatus = useCallback(() => {
    setMessages((prev) =>
      prev.map((msg) => ({ ...msg, isRead: msg.tempRead })),
    );
  }, []);

  useEffect(() => {
    syncReadStatus();
  }, [activeTab, syncReadStatus]);

  // Wrap tables in scrollable wrapper after content loads
  useEffect(() => {
    const container = messageDetailRef.current;
    if (!container || !selectedMessageDetail) return;

    const tables = container.querySelectorAll("table");
    tables.forEach((table) => {
      // Skip if already wrapped
      if (table.parentElement?.classList.contains("table-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }, [selectedMessageDetail]);

  // Cleanup AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop <= clientHeight + 100 &&
        hasMore &&
        !loading
      ) {
        loadMessages(page + 1);
      }
    },
    [hasMore, loading, page, loadMessages],
  );

  const handleMessageClick = useCallback(
    async (message: Message) => {
      // Toggle: clicking the currently selected message collapses the detail
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
        setSelectedMessageDetail(null);
        setShowMobileDetail(false);
        return;
      }

      setSelectedMessage(message);

      // Show mobile detail view if on mobile
      if (isMobile) {
        setShowMobileDetail(true);
      }

      try {
        // Load message detail
        const detail = await getMessageDetail({ id: message.id });
        setSelectedMessageDetail(detail);

        // Mark as read if not already read
        if (!message.isRead) {
          await markMessageAsRead({ id: message.id });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === message.id ? { ...msg, tempRead: true } : msg,
            ),
          );
          // Update unread count after marking as read
          loadUnreadCount();
        }
      } catch (error) {
        console.error("Failed to load message detail:", error);
      }
    },
    [loadUnreadCount, isMobile, selectedMessage],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllMessagesAsRead();
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      // Update unread count after marking all as read
      loadUnreadCount();
    } catch (error) {
      console.error("Failed to mark all messages as read:", error);
    }
  }, [loadUnreadCount]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );
    if (diffInMinutes < 3) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return date
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, "$3/$1/$2");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Mark as ever opened
      if (!hasEverOpened) {
        setHasEverOpened(true);
      }

      // Reset everything when opening the sheet
      setMessages([]);
      setFilteredMessages([]);
      setSelectedMessage(null);
      setSelectedMessageDetail(null);
      setShowMobileDetail(false);
      setPage(1);
      setHasMore(true);
      setLoading(false);
      setRefreshing(false);

      // Scroll to top of the list
      const container = messageListRef.current;
      if (container) {
        container.scrollTop = 0;
      }

      // Load fresh messages from the beginning
      loadMessages(1);
    } else {
      // Cancel any ongoing requests when closing the sheet
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Reset detail state so the next open starts collapsed
      setSelectedMessage(null);
      setSelectedMessageDetail(null);
      setShowMobileDetail(false);
    }
    setOpen(newOpen);
  };

  // Common refresh logic that can be reused
  const refreshMessages = useCallback(
    async (
      readStatus?: boolean | undefined,
      options?: { updateUnreadCount?: boolean },
    ) => {
      const container = messageListRef.current;
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      try {
        await loadMessages(1, readStatus);
        if (options?.updateUnreadCount) {
          loadUnreadCount();
        }
      } catch (error) {
        // Don't log error if request was cancelled
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to refresh messages:", error);
        }
      }
    },
    [loadMessages, loadUnreadCount],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMessages(undefined, { updateUnreadCount: true });
    } finally {
      setRefreshing(false);
    }
  }, [refreshMessages]);

  const handleTabChange = useCallback(
    (newTab: string) => {
      // Only refresh if tab is actually changing
      if (newTab === activeTab) return;

      // Cancel any ongoing requests first
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Set new active tab first
      setActiveTab(newTab);

      // Reset selected message state when switching tabs
      setSelectedMessage(null);
      setSelectedMessageDetail(null);
      setShowMobileDetail(false); // Hide mobile detail when switching tabs

      // Reset messages and pagination state
      setMessages([]);
      setFilteredMessages([]);
      setPage(1);
      setHasMore(true);
      setLoading(false);

      // Determine readStatus based on the new tab
      let readStatus: boolean | undefined;
      if (newTab === "read") {
        readStatus = true;
      } else if (newTab === "unread") {
        readStatus = false;
      }
      // newTab === "all" means readStatus = undefined (get all)

      // Use the common refresh logic
      refreshMessages(readStatus);
    },
    [activeTab, refreshMessages],
  );

  // Handle mobile back button
  const handleMobileBack = useCallback(() => {
    setShowMobileDetail(false);
    setSelectedMessage(null);
    setSelectedMessageDetail(null);
  }, []);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <div
          className="relative cursor-pointer px-2"
          onClick={() => {
            analytics.trackClick(CLICK_BTN_IDs.MESSAGE_CENTER.OPEN);
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-2 text-center rounded-full px-1 font-small-console !text-white tabular-nums select-none justify-center items-center"
              style={{
                height: "1.125rem",
                minWidth: "1.125rem",
              }}
            >
              <span>{unreadCount > 99 ? "99+" : unreadCount}</span>
            </Badge>
          )}
        </div>
      </SheetTrigger>

      {(open || hasEverOpened) && (
        <SheetContent
          className={cn(
            "p-0 flex flex-col overflow-hidden",
            isMobile
              ? "w-full"
              : selectedMessage
                ? "w-[840px] !max-w-[840px]"
                : "w-[420px] !max-w-[420px]",
            isNoticeShowing ? "pt-[var(--notice-height)]" : "",
            !open && hasEverOpened && styles.sheetContentHidden,
          )}
          overlayClassname="bg-black/50"
          showCloseButton={false}
        >
          <div className="msg-center-sheet-content h-full flex-1 flex flex-col gap-0">
            {/* Main Content - Two Column Layout */}
            <div className="flex-1 flex min-h-0 relative">
              {/* Left Panel - Message Detail */}
              {selectedMessage && (!isMobile || showMobileDetail) && (
                <div
                  className={cn(
                    "flex flex-col overflow-y-auto bg-[var(--gray-3)]",
                    isMobile ? "w-full" : "w-[420px] flex-shrink-0",
                    styles.customScrollbar,
                    isMobile && showMobileDetail && "absolute inset-0 z-10",
                  )}
                >
                  {/* Detail Header */}
                  <div className="flex-shrink-0 px-6 pt-6 pb-5">
                    {/* Mobile Back Button */}
                    {isMobile && (
                      <div className="flex items-center gap-1 mb-4 -ml-2">
                        <button
                          onClick={handleMobileBack}
                          className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-[var(--gray-3)] transition-colors"
                        >
                          <ArrowLeft size={18} color="var(--dark-2)" />
                        </button>
                        <span className="font-subtle-medium text-[var(--dark-2)]">
                          Back
                        </span>
                      </div>
                    )}
                    <h5 className="font-h5 text-[var(--dark-1)] mb-3">
                      {selectedMessage.title}
                    </h5>
                    <p className="font-small-console text-[var(--dark-4)]">
                      {formatTime(selectedMessage.createdAt)}
                    </p>
                  </div>

                  {/* Detail Content */}
                  <div className="flex-1 px-6 pb-12">
                    {selectedMessageDetail ? (
                      <div
                        ref={messageDetailRef}
                        className={cn(
                          "font-subtle text-[var(--dark-1)] leading-[22px]",
                          styles.messageDetailContainer,
                        )}
                        dangerouslySetInnerHTML={{
                          __html: selectedMessageDetail.content,
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-40">
                        <p className="font-subtle text-[var(--font-color-sub)]">
                          Loading...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Right Panel - Message List */}
              <div
                className={cn(
                  "flex flex-col overflow-x-hidden bg-white",
                  isMobile ? "w-full flex-1" : "w-[420px] flex-shrink-0",
                  selectedMessage &&
                    !isMobile &&
                    "border-l border-[var(--gray-1)]",
                  isMobile && showMobileDetail && "hidden",
                )}
              >
                {/* Header */}
                <SheetHeader
                  className={cn(
                    "h-12 flex-shrink-0 flex-row items-center justify-between px-6 py-3 border-b border-[var(--gray-1)]",
                  )}
                >
                  <SheetTitle className="font-subtle-medium">
                    Messages
                  </SheetTitle>
                  <div className="!mt-0 flex items-center gap-1">
                    <Button
                      variant="text"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <RefreshCw
                        size={14}
                        className={refreshing ? "animate-spin" : ""}
                      />
                    </Button>
                    <button
                      className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </button>
                  </div>
                </SheetHeader>

                {/* Filter Tabs */}
                <div className="flex-shrink-0 px-4 py-4 border-b border-[var(--gray-1)]">
                  <div className="flex items-center gap-[18px]">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                      <TabsList className="bg-[var(--gray-3)] rounded-md p-1 h-auto">
                        <TabsTrigger
                          value="all"
                          className="px-3 py-1.5 w-15 h-7 rounded-md font-subtle transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--brand-1)] data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--dark-3)] data-[state=active]:font-subtle-medium"
                        >
                          All
                        </TabsTrigger>
                        <TabsTrigger
                          value="unread"
                          className="px-3 py-1.5 w-15 h-7 rounded-md font-subtle transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--brand-1)] data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--dark-3)] data-[state=active]:font-subtle-medium"
                        >
                          Unread
                        </TabsTrigger>
                        <TabsTrigger
                          value="read"
                          className="px-3 py-1.5 w-15 h-7 rounded-md font-subtle transition-all data-[state=active]:bg-white data-[state=active]:text-[var(--brand-1)] data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--dark-3)] data-[state=active]:font-subtle-medium"
                        >
                          Read
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <button
                      className="ml-auto flex items-center gap-1 font-small-console"
                      onClick={handleMarkAllRead}
                    >
                      <span className="text-[var(--brand-1)] whitespace-nowrap">
                        Mark all as read
                      </span>
                    </button>
                  </div>
                </div>

                {/* Message List */}
                <div
                  ref={messageListRef}
                  className={cn(
                    "flex-1 overflow-y-auto",
                    styles.customScrollbar,
                  )}
                  onScroll={handleScroll}
                >
                  {loading && refreshing && (
                    <div className="flex items-center justify-center py-6 relative">
                      <Loading
                        className="bg-transparent flex flex-row items-center gap-2"
                        color="var(--dark-4)"
                        spinSize={20}
                      >
                        <p className="font-small-console text-[var(--dark-4)]">
                          Loading messages...
                        </p>
                      </Loading>
                    </div>
                  )}
                  {filteredMessages.length === 0 && !loading ? (
                    <NoData
                      className="mt-[56px]"
                      title=""
                      description="No messages yet"
                    />
                  ) : (
                    <>
                      {filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex items-start gap-3 px-6 py-3 cursor-pointer transition-colors hover:bg-[var(--gray-3)]",
                            selectedMessage?.id === message.id &&
                              "bg-[var(--gray-3)]",
                          )}
                          onClick={() => handleMessageClick(message)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-[6px] min-w-0 flex-1">
                                {!message.isRead && !message.tempRead && (
                                  <span className="block w-[6px] h-[6px] bg-[var(--brand-0)] rounded-full flex-shrink-0" />
                                )}
                                <p
                                  className={cn(
                                    "truncate",
                                    message.isRead || message.tempRead
                                      ? "font-subtle text-[var(--dark-4)]"
                                      : "font-subtle-medium text-[var(--dark-1)]",
                                  )}
                                >
                                  {message.title}
                                </p>
                              </div>
                              {(message.isRead || message.tempRead) && (
                                <span className="font-small-console bg-[var(--gray-3)] px-1 py-0.5 rounded-sm text-[var(--dark-3)] flex-shrink-0">
                                  Read
                                </span>
                              )}
                            </div>
                            <p className="font-small-console text-[var(--dark-4)]">
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {loading && !refreshing && (
                        <div className="flex items-center justify-center py-6 relative">
                          <Loading
                            className="bg-transparent flex flex-row items-center gap-2"
                            color="var(--dark-4)"
                            spinSize={20}
                          >
                            <p className="font-small-console text-[var(--dark-4)]">
                              Loading...
                            </p>
                          </Loading>
                        </div>
                      )}

                      {!hasMore && filteredMessages.length > 0 && (
                        <div className="flex items-center justify-center py-6">
                          <div className="font-subtle text-[var(--font-color-sub2)]">
                            No more messages
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
