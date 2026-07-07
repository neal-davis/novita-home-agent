import type { Locale } from "./config";

export type I18nMessages = Record<string, string>;

export type I18nSnapshot = {
  fallbackMessages?: I18nMessages;
  locale: Locale;
  messages: I18nMessages;
};
