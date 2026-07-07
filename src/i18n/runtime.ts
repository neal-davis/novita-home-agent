import * as React from "react";

import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "./config";
import type { I18nMessages, I18nSnapshot } from "./types";

declare global {
  interface Window {
    __NOVITA_I18N__?: I18nSnapshot;
  }
}

type I18nStore = {
  locale: Locale;
  messages: I18nMessages;
  fallbackMessages: I18nMessages;
};

function createStore(): I18nStore {
  return {
    fallbackMessages: {},
    locale: DEFAULT_LOCALE,
    messages: {},
  };
}

const moduleStore = createStore();

// cache() is only exported by the React canary builds that Next bundles for
// the App Router; the npm react@18 used by tsc/jest does not have it.
const reactCache = (
  React as typeof React & {
    cache?: <T extends () => I18nStore>(fn: T) => T;
  }
).cache;

// In the RSC server layer React's cache() memoizes per request, which gives
// every request its own isolated store. A plain module variable is shared by
// all concurrently rendered requests, so locales bleed between requests at
// every await point. In the browser and in the SSR pass of client components
// cache() does not memoize — it returns a fresh value per call or throws
// ("Not implemented." from the fizz cache dispatcher) — which getStore()
// detects so those layers keep using the module store populated from
// window.__NOVITA_I18N__ / the provider snapshot.
let getRequestScopedStore: (() => I18nStore) | null =
  typeof window === "undefined" && typeof reactCache === "function"
    ? reactCache(createStore)
    : null;

function getStore(): I18nStore {
  if (getRequestScopedStore) {
    try {
      const store = getRequestScopedStore();
      // Memoized (same object on a second call) means we are inside a request
      // scope; otherwise fall back to the module store.
      if (store === getRequestScopedStore()) {
        return store;
      }
    } catch {
      // cache() only throws in renderers that can never memoize per request
      // (e.g. react-dom/server), so stop probing in this module instance.
      getRequestScopedStore = null;
    }
  }
  return moduleStore;
}

function getBrowserSnapshot() {
  if (typeof window === "undefined") return null;
  return window.__NOVITA_I18N__ || null;
}

function ensureBrowserSnapshotLoaded() {
  const snapshot = getBrowserSnapshot();
  if (!snapshot) return;
  if (
    snapshot.locale === moduleStore.locale &&
    moduleStore.messages === snapshot.messages
  )
    return;

  moduleStore.locale = normalizeLocale(snapshot.locale);
  moduleStore.messages = snapshot.messages || {};
  moduleStore.fallbackMessages = snapshot.fallbackMessages || {};
}

ensureBrowserSnapshotLoaded();

function interpolate(value: string, params?: Record<string, string | number>) {
  if (!params) return value;

  return value.replace(/\{(\w+)\}/g, (match, key) => {
    const next = params[key];
    return next === undefined ? match : String(next);
  });
}

export function setI18nMessages(snapshot: I18nSnapshot) {
  const store = getStore();
  store.locale = normalizeLocale(snapshot.locale);
  store.messages = snapshot.messages || {};
  store.fallbackMessages = snapshot.fallbackMessages || {};

  if (typeof window !== "undefined") {
    window.__NOVITA_I18N__ = {
      locale: store.locale,
      messages: store.messages,
    };
    if (Object.keys(store.fallbackMessages).length > 0) {
      window.__NOVITA_I18N__.fallbackMessages = store.fallbackMessages;
    }
    document.documentElement.lang = store.locale;
  }
}

export function getI18nLocale() {
  ensureBrowserSnapshotLoaded();
  return getStore().locale;
}

export function getI18nMessages() {
  ensureBrowserSnapshotLoaded();
  return getStore().messages;
}

export function __t(
  key: string,
  fallback: string,
  params?: Record<string, string | number>,
) {
  ensureBrowserSnapshotLoaded();
  const store = getStore();
  return interpolate(
    store.messages[key] || store.fallbackMessages[key] || fallback,
    params,
  );
}
