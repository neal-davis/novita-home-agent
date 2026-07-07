import { readFile } from "fs/promises";
import path from "path";

import { headers } from "next/headers";

import {
  DEFAULT_LOCALE,
  detectPreferredLocaleFromHeaders,
  normalizeLocale,
  type Locale,
} from "./config";
import { setI18nMessages } from "./runtime";
import type { I18nMessages, I18nSnapshot } from "./types";

const messageCache = new Map<Locale, Promise<I18nMessages>>();

function getHeaderLocale(): Locale {
  const headersList = headers();
  const requestLocale = headersList.get("x-locale");
  if (requestLocale) return normalizeLocale(requestLocale);

  return detectPreferredLocaleFromHeaders(headersList);
}

export function getRequestLocale(): Locale {
  return getHeaderLocale();
}

function getPublicMessagePath(locale: Locale) {
  return path.join(process.cwd(), "public", "i18n", `${locale}.json`);
}

async function loadBundledMessages(locale: Locale): Promise<I18nMessages> {
  const { default: messagesByLocale } = await import("./generated/messages");
  const normalizedLocale = normalizeLocale(locale);
  return (
    messagesByLocale[normalizedLocale] || messagesByLocale[DEFAULT_LOCALE] || {}
  );
}

async function readLocaleMessages(locale: Locale): Promise<I18nMessages> {
  try {
    const content = await readFile(getPublicMessagePath(locale), "utf8");
    return JSON.parse(content) as I18nMessages;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    console.warn(
      `[i18n] missing public messages for ${locale}, using bundled messages fallback`,
    );
    return loadBundledMessages(locale);
  }
}

async function loadServerMessages(locale: Locale): Promise<I18nMessages> {
  const cached = messageCache.get(locale);
  if (cached) return cached;

  const promise = readLocaleMessages(locale).catch(async (error) => {
    messageCache.delete(locale);

    if (locale !== DEFAULT_LOCALE) {
      console.warn(
        `[i18n] failed to load ${locale}, falling back to ${DEFAULT_LOCALE}: ${error.message}`,
      );
      return loadServerMessages(DEFAULT_LOCALE);
    }

    throw error;
  });
  messageCache.set(locale, promise);
  return promise;
}

export async function getI18nSnapshot(
  locale = getRequestLocale(),
): Promise<I18nSnapshot> {
  const normalizedLocale = normalizeLocale(locale);

  // The compiled en catalog is identical to the English fallback argument
  // baked into every __t() call site, so loading and serializing it (inline
  // window snapshot + provider props, ~790KB each) is pure overhead. An empty
  // catalog renders the exact same text through the fallback path.
  if (normalizedLocale === DEFAULT_LOCALE) {
    return {
      locale: normalizedLocale,
      messages: {},
    };
  }

  const messages = await loadServerMessages(normalizedLocale);

  return {
    locale: normalizedLocale,
    messages,
  };
}

export async function initRequestI18n(locale = getRequestLocale()) {
  const snapshot = await getI18nSnapshot(locale);
  setI18nMessages(snapshot);
  return snapshot;
}

export function serializeI18nSnapshot(snapshot: I18nSnapshot) {
  return JSON.stringify(snapshot).replace(/</g, "\\u003c");
}
