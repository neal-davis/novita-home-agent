import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom design-token scales that Tailwind exposes via `theme.extend` in
// tailwind.config.ts. tailwind-merge ships matchers for the *default* Tailwind
// scales only; tokens like `text-paragraph-12`, `shadow-1`, `rounded-8`,
// `p-space-16` etc. fall outside those matchers, so without these registrations
// tailwind-merge may either (a) misclassify them or (b) treat conflicting
// design-token utilities as unrelated classes and leave both in the output.

const SPACE_KEYS = [
  "space-0",
  "space-2",
  "space-4",
  "space-6",
  "space-8",
  "space-10",
  "space-12",
  "space-16",
  "space-20",
  "space-24",
  "space-26",
  "space-32",
  "space-40",
  "space-48",
  "space-80",
  "space-120",
] as const;

const spaced = (prefix: string) => SPACE_KEYS.map((k) => `${prefix}-${k}`);

const twMerge = extendTailwindMerge<"custom-typography">({
  extend: {
    classGroups: {
      // Composite typography mixin classes from globals.scss
      // (each sets font-size + line-height + letter-spacing together).
      "custom-typography": [
        // Display
        "font-display-lg",
        "font-display-md",
        "font-display-sm",
        // Heading
        "font-heading-h1",
        "font-heading-h2",
        "font-heading-h3",
        "font-heading-h4",
        "font-heading-h5",
        // Paragraph
        "font-paragraph-20",
        "font-paragraph-20-medium",
        "font-paragraph-18",
        "font-paragraph-18-medium",
        "font-paragraph-16",
        "font-paragraph-16-medium",
        "font-paragraph-15",
        "font-paragraph-15-medium",
        "font-paragraph-14",
        "font-paragraph-14-medium",
        "font-paragraph-13",
        "font-paragraph-13-medium",
        "font-paragraph-12",
        "font-paragraph-12-medium",
        // Mono
        "font-mono-14",
        "font-mono-13",
        "font-mono-12",
        "font-mono-11",
        // Legacy heading scale
        "font-h1",
        "font-h2",
        "font-h3",
        "font-h4-large",
        "font-h4",
        "font-h5",
        "font-h6",
        "font-h7",
        // Legacy body / UI scale
        "font-p",
        "font-p-button",
        "font-body",
        "font-body-medium",
        "font-menu",
        "font-menu-medium",
        "font-table-head",
        "font-table-item",
        "font-subtle",
        "font-subtle-medium",
        "font-subtle-demibold",
        "font-small",
        "font-small-console",
        "font-small-console-medium",
        "font-link-small",
        "font-link",
      ],

      // font-size: custom text-* tokens from tailwind.config.ts → fontSize.
      // Without this, tailwind-merge classifies these as colors (text-color
      // catch-all) and drops them when paired with a real color class.
      "font-size": [
        "text-display-lg",
        "text-display-md",
        "text-display-sm",
        "text-heading-h1",
        "text-heading-h2",
        "text-heading-h3",
        "text-heading-h4",
        "text-heading-h5",
        "text-paragraph-20",
        "text-paragraph-18",
        "text-paragraph-16",
        "text-paragraph-15",
        "text-paragraph-14",
        "text-paragraph-13",
        "text-paragraph-12",
        "text-mono-14",
        "text-mono-13",
        "text-mono-12",
        "text-tremor-label",
        "text-tremor-default",
        "text-tremor-title",
        "text-tremor-metric",
      ],

      // shadow / rounded — numeric custom tokens not matched by default matchers
      shadow: ["shadow-1", "shadow-2", "shadow-3", "shadow-4", "shadow-5"],
      rounded: [
        "rounded-0",
        "rounded-2",
        "rounded-4",
        "rounded-6",
        "rounded-8",
        "rounded-12",
        // legacy aliases
        "rounded-regular",
        "rounded-medium",
        "rounded-large",
        "rounded-round",
        "rounded-button",
        "rounded-input",
        "rounded-form",
        "rounded-dialog",
      ],

      // Spacing (p / m / gap with `space-*` keys + `web`/`console` layout keys)
      p: [...spaced("p"), "p-web", "p-console"],
      px: [...spaced("px"), "px-web", "px-console"],
      py: spaced("py"),
      pt: spaced("pt"),
      pr: spaced("pr"),
      pb: spaced("pb"),
      pl: spaced("pl"),
      m: [...spaced("m"), "m-web", "m-console"],
      mx: [...spaced("mx"), "mx-web", "mx-console"],
      my: spaced("my"),
      mt: spaced("mt"),
      mr: spaced("mr"),
      mb: spaced("mb"),
      ml: spaced("ml"),
      gap: spaced("gap"),
      "gap-x": spaced("gap-x"),
      "gap-y": spaced("gap-y"),

      // Layout sizing tokens
      h: ["h-header", "h-console-header", "h-notice"],
      "min-h": ["min-h-header", "min-h-console-header"],
      "max-w": [
        "max-w-layout-nav",
        "max-w-layout-safe",
        "max-w-layout-content",
      ],

      // Letter-spacing tokens tied to the typography scale
      tracking: [
        "tracking-display-lg",
        "tracking-display-md",
        "tracking-display-sm",
        "tracking-heading-h1",
        "tracking-heading-h2",
        "tracking-heading-h3",
        "tracking-heading-h4",
        "tracking-heading-h5",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformModelIdToPath(id: string) {
  return id ? id.replaceAll("/", "-") : id;
}
