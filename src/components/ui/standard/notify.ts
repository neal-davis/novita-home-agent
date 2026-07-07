"use client";

import type { MouseEvent, ReactNode } from "react";
import { toast } from "sonner";

type NotifyContent = ReactNode;

type NotifyOptions = {
  description?: ReactNode;
  duration?: number;
  id?: string;
  className?: string;
  action?: {
    label: ReactNode;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  };
};

type LegacyNotificationOptions = NotifyOptions & {
  message?: ReactNode;
  key?: string;
  placement?: string;
  icon?: ReactNode;
  onClose?: () => void;
};

function normalizeMessage(message: NotifyContent, fallback: string) {
  if (message === null || message === undefined) {
    return fallback;
  }

  if (
    typeof message === "string" ||
    typeof message === "number" ||
    typeof message === "boolean"
  ) {
    return String(message);
  }

  if (message instanceof Error) {
    return message.message || fallback;
  }

  if (typeof message === "object" && "message" in message) {
    const possibleMessage = (message as { message?: unknown }).message;
    if (possibleMessage) {
      return String(possibleMessage);
    }
  }

  return message;
}

function normalizeOptions(options?: NotifyOptions) {
  if (!options) {
    return undefined;
  }

  const { id, ...rest } = options;
  return {
    ...rest,
    id,
  };
}

type ToastType = "success" | "error" | "warning" | "info" | "loading";

// Shared id so message.* calls reuse one toast slot instead of stacking.
const MESSAGE_SINGLETON_ID = "novita-message-singleton";

function callToast(
  type: ToastType,
  message: NotifyContent,
  options: ReturnType<typeof normalizeOptions>,
) {
  const fallback = type === "error" ? "Error" : "Notification";
  const content = normalizeMessage(message, fallback);
  return String(toast[type](content, options));
}

function messageWithType(
  type: ToastType,
  message: NotifyContent,
  options?: NotifyOptions,
) {
  const normalized = normalizeOptions(options);
  const withSingleton =
    normalized?.id != null
      ? normalized
      : { ...(normalized ?? {}), id: MESSAGE_SINGLETON_ID };
  return callToast(type, message, withSingleton);
}

function notificationWithType(
  type: ToastType,
  message: NotifyContent,
  options?: NotifyOptions,
) {
  return callToast(type, message, normalizeOptions(options));
}

export const notify = {
  success(message: NotifyContent, options?: NotifyOptions) {
    return messageWithType("success", message, options);
  },
  error(message: NotifyContent, options?: NotifyOptions) {
    return messageWithType("error", message, options);
  },
  warning(message: NotifyContent, options?: NotifyOptions) {
    return messageWithType("warning", message, options);
  },
  warn(message: NotifyContent, options?: NotifyOptions) {
    return messageWithType("warning", message, options);
  },
  info(message: NotifyContent, options?: NotifyOptions) {
    return messageWithType("info", message, options);
  },
  loading(message: NotifyContent, options?: NotifyOptions) {
    return messageWithType("loading", message, options);
  },
  open(options: LegacyNotificationOptions) {
    // i18n-disable-next-line
    const message = options.message ?? options.description ?? "Notification";
    return messageWithType("info", message, {
      description: options.description,
      duration: options.duration,
      id: options.id ?? options.key,
    });
  },
  dismiss(id?: string) {
    toast.dismiss(id ?? MESSAGE_SINGLETON_ID);
  },
  destroy(id?: string) {
    toast.dismiss(id ?? MESSAGE_SINGLETON_ID);
  },
  config(_options?: Record<string, unknown>) {},
};

export const message = notify;

// Notifications are distinct from messages: they keep sonner's default
// stacking behavior (no shared singleton id) so they don't clobber each
// other or the message singleton.
function legacyNotification(
  type: ToastType,
  fallback: string,
  options: LegacyNotificationOptions,
) {
  return notificationWithType(type, options.message ?? fallback, {
    description: options.description,
    duration: options.duration,
    id: options.id ?? options.key,
  });
}

export const notification = {
  success(options: LegacyNotificationOptions) {
    return legacyNotification("success", "Success", options);
  },
  error(options: LegacyNotificationOptions) {
    return legacyNotification("error", "Error", options);
  },
  warning(options: LegacyNotificationOptions) {
    return legacyNotification("warning", "Warning", options);
  },
  warn(options: LegacyNotificationOptions) {
    return notification.warning(options);
  },
  info(options: LegacyNotificationOptions) {
    return legacyNotification("info", "Info", options);
  },
  open(options: LegacyNotificationOptions) {
    // i18n-disable-next-line
    const message = options.message ?? options.description ?? "Notification";
    return notificationWithType("info", message, {
      description: options.description,
      duration: options.duration,
      id: options.id ?? options.key,
    });
  },
  destroy(id?: string) {
    toast.dismiss(id);
  },
};

export type { NotifyOptions };
