import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { getModelActionLinks } from "@/lib/model-library/actions";
import type { AnyModel } from "@/lib/model-library/capabilities";

interface ConsoleModelSearchComboboxProps {
  models: AnyModel[];
}

function matchesModelName(model: AnyModel, query: string) {
  const queryWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  if (queryWords.length === 0) {
    return true;
  }

  const searchableText = [model.name, model.displayName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return queryWords.every((word) => searchableText.includes(word));
}

export function ConsoleModelSearchCombobox({
  models,
}: ConsoleModelSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    return models
      .filter((model) => matchesModelName(model, normalizedQuery))
      .slice(0, 8);
  }, [models, query]);

  return (
    <div
      className="relative w-full"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setShowSuggestions(false);
        }
      }}
    >
      <Input
        value={query}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setShowSuggestions(Boolean(value.trim()));
        }}
        onFocus={() => setShowSuggestions(Boolean(query.trim()))}
        className="h-[var(--height-32)] rounded-6 border border-[var(--border-2)] bg-fill-white px-space-8 font-miletus text-paragraph-13 text-[var(--text-1)] outline-none transition-colors duration-200 placeholder:text-[var(--text-3)] hover:border-[var(--border-1)] focus:border-brand-0 focus-visible:outline-none"
        // i18n-disable-next-line
        containerClassName="w-full"
        placeholder="search models"
      />

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-space-4 max-h-[256px] overflow-y-auto rounded-8 border border-[var(--border-3)] bg-fill-white shadow-3 scrollbar-overlay">
          {suggestions.map((model) => {
            const detailsHref = getModelActionLinks(model).detailsHref;
            const content = (
              <span className="truncate">
                {model.displayName || model.name}
              </span>
            );

            return detailsHref ? (
              <Link
                key={model.id}
                href={detailsHref}
                onMouseDown={(event) => event.preventDefault()}
                className="flex w-full cursor-pointer items-center px-space-12 py-[7px] text-left font-miletus text-paragraph-14 text-[var(--text-1)] transition-colors duration-200 hover:bg-fill-4 focus-visible:bg-fill-4 focus-visible:outline-none"
              >
                {content}
              </Link>
            ) : (
              <div
                key={model.id}
                className="flex w-full items-center px-space-12 py-[7px] text-left font-miletus text-paragraph-14 text-[var(--text-3)]"
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
