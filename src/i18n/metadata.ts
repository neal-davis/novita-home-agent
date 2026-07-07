import type { Metadata } from "next";
import { headers } from "next/headers";

import { NOVITA_SITE_ORIGIN } from "@/constants/urls";
import { getRequestLocale, initRequestI18n } from "./server";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getLocalePathPrefix,
  getPathnameLocale,
  normalizeLocale,
  type Locale,
} from "./config";

type MetadataAlternates = NonNullable<Metadata["alternates"]>;

const X_DEFAULT_HREFLANG = "x-default";

function resolveMetadataValue(
  value: unknown,
  seen = new WeakSet<object>(),
): unknown {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date || value instanceof URL) return value;
  if (seen.has(value)) return value;

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => resolveMetadataValue(item, seen));
  }

  const output: Record<PropertyKey, unknown> = {};
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable) continue;
    output[key] = resolveMetadataValue(
      (value as Record<PropertyKey, unknown>)[key],
      seen,
    );
  }

  return output;
}

export async function localizeMetadata<T extends Metadata>(
  metadata: T,
): Promise<T> {
  await initRequestI18n();
  return resolveMetadataValue(metadata) as T;
}

function normalizeBusinessPathname(pathname: string) {
  const normalizedPathname = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;
  const { pathname: businessPathname } = getPathnameLocale(normalizedPathname);
  const trimmedPathname = businessPathname.replace(/\/+$/, "");

  return trimmedPathname || "/";
}

function resolveSiteUrl(value: string | URL) {
  return value instanceof URL
    ? new URL(value.toString())
    : new URL(value, NOVITA_SITE_ORIGIN);
}

export function getLocalizedCanonicalUrl(
  canonical: string | URL,
  locale: Locale,
) {
  const canonicalUrl = resolveSiteUrl(canonical);
  if (canonicalUrl.origin !== NOVITA_SITE_ORIGIN) {
    return canonicalUrl.toString();
  }

  const normalizedLocale = normalizeLocale(locale);
  const businessPathname = normalizeBusinessPathname(canonicalUrl.pathname);
  const pathnameWithoutLocale =
    businessPathname === "/" ? "" : businessPathname;
  const localizedPathname =
    normalizedLocale === DEFAULT_LOCALE
      ? pathnameWithoutLocale
      : `/${getLocalePathPrefix(normalizedLocale)}${pathnameWithoutLocale}`;

  return `${NOVITA_SITE_ORIGIN}${localizedPathname}${canonicalUrl.search}`;
}

export function getLocalizedMetadataAlternates(
  canonical: string | URL,
): MetadataAlternates;
export function getLocalizedMetadataAlternates(
  canonical: string | URL,
  locale: Locale,
): MetadataAlternates;
export function getLocalizedMetadataAlternates(
  canonical: string | URL,
  locale?: Locale,
): MetadataAlternates {
  const resolvedLocale = locale ? normalizeLocale(locale) : getRequestLocale();
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((supportedLocale) => [
      supportedLocale,
      getLocalizedCanonicalUrl(canonical, supportedLocale),
    ]),
  );

  return {
    canonical: getLocalizedCanonicalUrl(canonical, resolvedLocale),
    languages: {
      ...languages,
      [X_DEFAULT_HREFLANG]: getLocalizedCanonicalUrl(canonical, DEFAULT_LOCALE),
    },
  };
}

export function getRequestMetadataAlternates(locale: Locale) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "/";

  return getLocalizedMetadataAlternates(pathname, locale);
}
