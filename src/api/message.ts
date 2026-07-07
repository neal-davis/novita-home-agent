import { request } from "./api";

// Type definitions based on OpenAPI schema
export interface UserMessage {
  id: number;
  createdAt: number; // timestamp
  title: string;
  readStatus: boolean;
}

export interface UserMessageDetail {
  id: number;
  createdAt: number; // timestamp
  title: string;
  readStatus: boolean;
  content: string; // html content
}

export interface MessageListResponse {
  messages: UserMessage[];
  total: number;
  unReadCount: number;
}

export interface UnreadCountResponse {
  unReadCount: number;
}

// Get paginated message list
export function getMessageList(params: {
  readStatus?: boolean; // false: unread, true: read, undefined: all
  pageIndex?: number;
  pageSize?: number;
  signal?: AbortSignal;
}): Promise<MessageListResponse> {
  const queryParams: Record<string, string> = {};

  if (params.readStatus !== undefined) {
    queryParams.readStatus = params.readStatus.toString();
  }
  if (params.pageIndex !== undefined) {
    queryParams.pageIndex = params.pageIndex.toString();
  }
  if (params.pageSize !== undefined) {
    queryParams.pageSize = params.pageSize.toString();
  }
  return request({
    url: "/v1/message/inbox/list",
    method: "GET",
    query: queryParams,
    signal: params.signal,
  });
}

// Get unread message count
export function getUnreadCount(params?: {
  signal?: AbortSignal;
}): Promise<UnreadCountResponse> {
  return request({
    url: "/v1/message/inbox/unread-count",
    method: "GET",
    signal: params?.signal,
  });
}

// Get message detail
export function getMessageDetail(params: {
  id: number;
  signal?: AbortSignal;
}): Promise<UserMessageDetail> {
  return request({
    url: "/v1/message/inbox",
    method: "GET",
    query: { id: params.id.toString() },
    signal: params.signal,
  });
}

// Mark message as read
export function markMessageAsRead(params: {
  id: number;
  signal?: AbortSignal;
}): Promise<Record<string, never>> {
  return request({
    url: "/v1/message/inbox/read",
    method: "PUT",
    query: { id: params.id.toString() },
    signal: params.signal,
  });
}

// Mark all messages as read
export function markAllMessagesAsRead(params?: {
  signal?: AbortSignal;
}): Promise<Record<string, never>> {
  return request({
    url: "/v1/message/inbox/read-all",
    method: "PUT",
    signal: params?.signal,
  });
}

// Delete (hide) message
export function deleteMessage(params: {
  id: number;
  signal?: AbortSignal;
}): Promise<Record<string, never>> {
  return request({
    url: "/v1/message/inbox",
    method: "DELETE",
    query: { id: params.id.toString() },
    signal: params.signal,
  });
}
