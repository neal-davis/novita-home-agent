"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocalizedPath,
  getPathnameLocale,
  normalizeLocale,
  type Locale,
} from "./config";
import { setI18nMessages } from "./runtime";
import { clearLocalePreference, persistLocalePreference } from "./preference";
import { addCookiebotConsentListener } from "@/lib/consent/cookiebot";
import type { I18nMessages, I18nSnapshot } from "./types";

type I18nContextValue = {
  locale: Locale;
  pendingLocale: Locale | null;
  isLocalePending: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  supportedLocales: typeof SUPPORTED_LOCALES;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const clientMessageCache = new Map<Locale, Promise<I18nMessages>>();
const LEGACY_LOCALE_QUERY_PARAM_NAME = "locale";

function LocaleBoundary({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function getClientMessagesUrl(locale: Locale) {
  const buildId =
    typeof window === "undefined"
      ? ""
      : (
          window as Window & {
            __NEXT_DATA__?: { buildId?: string };
          }
        ).__NEXT_DATA__?.buildId || "";

  const version = buildId ? `?v=${encodeURIComponent(buildId)}` : "";
  return `/i18n/${locale}.json${version}`;
}

function getCurrentPathLocale() {
  if (typeof window === "undefined") return null;
  return getPathnameLocale(window.location.pathname).locale;
}

function getCurrentHref() {
  if (typeof window === "undefined") return "";

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function removeLegacyLocaleQueryFromHref(href: string) {
  if (typeof window === "undefined") return href;

  const url = new URL(href, window.location.origin);
  url.searchParams.delete(LEGACY_LOCALE_QUERY_PARAM_NAME);

  return `${url.pathname}${url.search}${url.hash}`;
}

function getLocalizedCurrentHref(locale: Locale) {
  return getLocalizedPath(
    removeLegacyLocaleQueryFromHref(getCurrentHref()),
    locale,
  );
}

async function loadBundledClientMessages(
  locale: Locale,
): Promise<I18nMessages> {
  const { default: messagesByLocale } = await import("./generated/messages");
  const normalizedLocale = normalizeLocale(locale);

  return (
    messagesByLocale[normalizedLocale] || messagesByLocale[DEFAULT_LOCALE] || {}
  );
}

async function fetchClientMessages(locale: Locale): Promise<I18nMessages> {
  // The en catalog equals the fallback text baked into every __t() call site
  // (and every compiled non-en catalog already merges the en fallbacks), so
  // there is never a reason to download it.
  if (locale === DEFAULT_LOCALE) return {};

  const cached = clientMessageCache.get(locale);
  if (cached) return cached;

  // The URL is versioned with the build id, so the browser HTTP cache can
  // serve repeat loads (Cache-Control for /i18n/* is set in next.config).
  const promise = fetch(getClientMessagesUrl(locale))
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${locale} messages`);
      }

      return (await response.json()) as I18nMessages;
    })
    .catch(async (error) => {
      console.warn(
        `[i18n] failed to load public messages for ${locale}, using bundled fallback: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return loadBundledClientMessages(locale);
    })
    .catch((error) => {
      clientMessageCache.delete(locale);
      throw error;
    });

  clientMessageCache.set(locale, promise);
  return promise;
}

/**
 * Warm the message cache for likely switch targets (e.g. when the language
 * menu opens) instead of eagerly downloading every locale for every visitor.
 */
export function prefetchLocaleMessages(locale: Locale) {
  if (typeof window === "undefined") return;
  void fetchClientMessages(normalizeLocale(locale)).catch(() => {});
}

export function I18nProvider({
  children,
  snapshot,
}: {
  children: ReactNode;
  snapshot: I18nSnapshot;
}) {
  const router = useRouter();
  const {
    fallbackMessages: snapshotFallbackMessages,
    locale: snapshotLocale,
    messages: snapshotMessages,
  } = snapshot;
  const [isRefreshPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const desiredLocaleRef = useRef<Locale>(snapshot.locale);
  const explicitSwitchRef = useRef<{
    locale: Locale;
    requestId: number;
  } | null>(null);
  const switchRequestRef = useRef(0);
  const [locale, setLocaleState] = useState<Locale>(() => {
    setI18nMessages(snapshot);
    return snapshot.locale;
  });

  useEffect(() => {
    // If the visitor later withdraws the "preferences" consent category, stop
    // remembering the locale choice and drop what was already recorded. The
    // hasResponse guard matters: the listener also fires before the Cookiebot
    // script has loaded (defaulting every category to false), and clearing on
    // that initial tick would erase a legitimately stored preference.
    return addCookiebotConsentListener((consent) => {
      if (!consent.preferences && window.Cookiebot?.hasResponse) {
        clearLocalePreference();
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pathLocale = getCurrentPathLocale();
    const explicitSwitch = explicitSwitchRef.current;
    const isExplicitSwitchTarget =
      explicitSwitch &&
      (pathLocale === explicitSwitch.locale ||
        (!pathLocale && explicitSwitch.locale === DEFAULT_LOCALE));

    if (explicitSwitch && !isExplicitSwitchTarget) {
      return () => {
        cancelled = true;
      };
    }

    if (isExplicitSwitchTarget) {
      explicitSwitchRef.current = null;
    }

    if (pathLocale && pathLocale !== snapshotLocale) {
      desiredLocaleRef.current = pathLocale;

      if (pathLocale !== locale) {
        const requestId = ++switchRequestRef.current;
        setPendingLocale(pathLocale);
        fetchClientMessages(pathLocale)
          .then((messages) => {
            if (
              cancelled ||
              requestId !== switchRequestRef.current ||
              pathLocale !== desiredLocaleRef.current
            ) {
              return;
            }

            setI18nMessages({
              fallbackMessages: {},
              locale: pathLocale,
              messages,
            });
            setLocaleState(pathLocale);
          })
          .catch((error) => {
            console.warn(
              `[i18n] failed to load path locale ${pathLocale}: ${error.message}`,
            );
            if (
              !cancelled &&
              requestId === switchRequestRef.current &&
              desiredLocaleRef.current === pathLocale
            ) {
              // Revert so a later switch to the same locale is not
              // short-circuited by the idempotency check in setLocale.
              desiredLocaleRef.current = locale;
            }
          })
          .finally(() => {
            if (
              !cancelled &&
              requestId === switchRequestRef.current &&
              pathLocale === desiredLocaleRef.current
            ) {
              setPendingLocale(null);
            }
          });
      }

      return () => {
        cancelled = true;
      };
    }

    if (snapshotLocale !== desiredLocaleRef.current) {
      return () => {
        cancelled = true;
      };
    }

    setI18nMessages({
      fallbackMessages: snapshotFallbackMessages,
      locale: snapshotLocale,
      messages: snapshotMessages,
    });
    setLocaleState(snapshotLocale);
    setPendingLocale((current) =>
      current === snapshotLocale ? null : current,
    );
    return () => {
      cancelled = true;
    };
  }, [locale, snapshotFallbackMessages, snapshotLocale, snapshotMessages]);

  const setLocale = useCallback(
    async (nextLocale: Locale) => {
      const normalizedLocale = normalizeLocale(nextLocale);
      if (normalizedLocale === desiredLocaleRef.current) return;

      const requestId = ++switchRequestRef.current;
      desiredLocaleRef.current = normalizedLocale;
      explicitSwitchRef.current = {
        locale: normalizedLocale,
        requestId,
      };
      setPendingLocale(normalizedLocale);

      try {
        const messages = await fetchClientMessages(normalizedLocale);

        if (
          requestId !== switchRequestRef.current ||
          normalizedLocale !== desiredLocaleRef.current
        ) {
          return;
        }

        setI18nMessages({
          fallbackMessages: {},
          locale: normalizedLocale,
          messages,
        });
        setLocaleState(normalizedLocale);
        // Remember the explicit choice (no-op unless the "preferences"
        // consent category is granted).
        persistLocalePreference(normalizedLocale);
      } catch (error) {
        console.warn(
          `[i18n] failed to switch locale ${normalizedLocale}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        if (
          explicitSwitchRef.current?.requestId === requestId &&
          explicitSwitchRef.current.locale === normalizedLocale
        ) {
          explicitSwitchRef.current = null;
        }
        if (
          requestId === switchRequestRef.current &&
          desiredLocaleRef.current === normalizedLocale
        ) {
          // Revert so retrying the same locale is not short-circuited by the
          // idempotency check at the top of setLocale.
          desiredLocaleRef.current = locale;
        }
        return;
      } finally {
        if (
          requestId === switchRequestRef.current &&
          normalizedLocale === desiredLocaleRef.current
        ) {
          setPendingLocale(null);
        }
      }

      if (
        requestId === switchRequestRef.current &&
        normalizedLocale === desiredLocaleRef.current
      ) {
        const currentHref = getCurrentHref();
        const nextHref = getLocalizedCurrentHref(normalizedLocale);
        if (nextHref && nextHref !== currentHref) {
          router.replace(nextHref);
          return;
        }

        // No URL change (e.g. a non-localizable page): there is no navigation for
        // the path effect to observe, so clear the explicit-switch marker here to
        // avoid it getting stuck and blocking later path-driven locale updates.
        if (explicitSwitchRef.current?.requestId === requestId) {
          explicitSwitchRef.current = null;
        }

        startTransition(() => {
          router.refresh();
        });
      }
    },
    // `locale` only feeds the failure rollback; the context value already
    // changes identity whenever `locale` changes, so this adds no re-renders.
    [locale, router],
  );

  const isLocalePending = Boolean(pendingLocale) || isRefreshPending;

  const value = useMemo<I18nContextValue>(
    () => ({
      isLocalePending,
      locale,
      pendingLocale,
      setLocale,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [isLocalePending, locale, pendingLocale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>
      {/*
        No `key={locale}` here: keying the boundary by locale remounts the
        entire app subtree on every locale change. Doing that while setLocale
        also calls router.replace/refresh tears down the tree mid-navigation,
        throwing "invariant expected app router to be mounted" and
        "removeChild ... not a child" errors. Subscribed components
        (useI18n/useI18nSubscription) re-render from context; the rest are
        refreshed by the router navigation that setLocale performs.
      */}
      <LocaleBoundary>{children}</LocaleBoundary>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

export function useI18nSubscription() {
  useContext(I18nContext);
}
