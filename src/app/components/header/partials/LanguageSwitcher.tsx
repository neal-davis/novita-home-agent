"use client";

import { Globe } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LOCALE_LABELS, type Locale } from "@/i18n/config";
import { prefetchLocaleMessages, useI18n } from "@/i18n/provider";

import styles from "../Header.module.scss";

export function LanguageSwitcher({
  className,
  mode = "desktop",
  variant = "legacy",
}: {
  className?: string;
  mode?: "desktop" | "mobile";
  variant?: "legacy" | "pill";
}) {
  const {
    isLocalePending,
    locale,
    pendingLocale,
    setLocale,
    supportedLocales,
  } = useI18n();
  const activeLocale = pendingLocale || locale;

  async function handleChange(value: string) {
    const nextLocale = value as Locale;
    if (nextLocale === activeLocale) return;

    await setLocale(nextLocale);
  }

  function handleOpenChange(open: boolean) {
    if (!open) return;
    // Opening the menu signals switch intent: warm the catalogs now so the
    // actual switch is instant, instead of preloading them for every visitor.
    for (const supportedLocale of supportedLocales) {
      if (supportedLocale !== activeLocale) {
        prefetchLocaleMessages(supportedLocale);
      }
    }
  }

  const isPill = variant === "pill";
  const showTriggerLabel = mode === "mobile";
  const isIconOnly = !showTriggerLabel;

  return (
    <Select
      value={activeLocale}
      onValueChange={handleChange}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger
        aria-label="Language"
        aria-busy={isLocalePending}
        icon={
          showTriggerLabel ? undefined : (
            <span className="hidden" aria-hidden="true" />
          )
        }
        className={cn(
          isPill
            ? isIconOnly
              ? [
                  "h-[44px] !w-[44px] !min-w-[44px] !max-w-[44px] !justify-center !gap-0 rounded-[999px] border-transparent bg-transparent !px-0 !py-0 !pl-0 !pr-0",
                  "font-paragraph-15 text-element-high-em shadow-none ring-offset-0",
                  "transition-colors hover:border-transparent hover:bg-black/[0.04]",
                  "focus:border-transparent focus:ring-0 focus:ring-offset-0",
                  "data-[state=open]:bg-black/[0.04]",
                  "[&>span:first-of-type]:!inline-flex [&>span:first-of-type]:!flex-none [&>span:first-of-type]:!grow-0 [&>span:first-of-type]:!basis-auto [&>span:first-of-type]:!items-center",
                ]
              : [
                  "h-[44px] !w-full !justify-between rounded-[999px] border-transparent bg-transparent px-5",
                  "font-paragraph-15 text-element-high-em shadow-none ring-offset-0",
                  "transition-colors hover:border-transparent hover:bg-black/[0.04]",
                  "focus:border-transparent focus:ring-0 focus:ring-offset-0",
                  "data-[state=open]:bg-black/[0.04]",
                  "[&>span]:!inline-flex [&>span]:!items-center [&>span]:!gap-2",
                ]
            : [
                styles.language_switcher,
                isLocalePending && styles.language_switcher_pending,
                mode === "mobile" && styles.language_switcher_mobile,
                showTriggerLabel
                  ? "!w-full !justify-between"
                  : [
                      "!h-8 !w-8 !min-w-8 !max-w-8 !justify-center !gap-0 !px-0 !py-0 !pl-0 !pr-0",
                      "[&>span:first-of-type]:!flex-none [&>span:first-of-type]:!grow-0 [&>span:first-of-type]:!basis-auto",
                    ],
              ],
          isLocalePending && isPill && "cursor-progress opacity-70",
          className,
        )}
        disabled={isLocalePending}
      >
        <span
          className={cn(
            isPill
              ? "inline-flex min-w-0 items-center gap-2 overflow-visible"
              : styles.language_switcher_label,
          )}
        >
          <Globe
            className={cn(
              isPill
                ? "size-4 shrink-0 text-element-high-em"
                : styles.language_switcher_icon,
            )}
          />
          {isPill && showTriggerLabel ? (
            <span
              className="min-w-0 truncate whitespace-nowrap leading-none"
              aria-hidden="true"
            >
              {LOCALE_LABELS[activeLocale]}
            </span>
          ) : !isPill && showTriggerLabel ? (
            <SelectValue>
              <span className={styles.language_switcher_value}>
                {LOCALE_LABELS[activeLocale]}
              </span>
            </SelectValue>
          ) : null}
        </span>
      </SelectTrigger>
      <SelectContent
        className={cn(
          isPill
            ? "w-[160px] max-h-[min(340px,calc(100vh-96px))] rounded-[8px] border-[0.5px] border-subtle bg-[var(--fill-white)] p-2 shadow-[0px_25px_50px_-33px_rgba(0,0,0,0.25)]"
            : styles.language_switcher_content,
        )}
        align="end"
      >
        {supportedLocales.map((item) => {
          return (
            <SelectItem
              key={item}
              value={item}
              className={cn(
                isPill
                  ? "min-h-9 rounded-[100px] font-paragraph-15 text-[var(--text-1)]"
                  : styles.language_switcher_item,
              )}
            >
              <span
                className={cn(
                  isPill
                    ? "block min-w-0 truncate"
                    : styles.language_switcher_item_text,
                )}
              >
                {LOCALE_LABELS[item]}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
