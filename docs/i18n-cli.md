# Build-time i18n CLI

This project keeps source components readable in English and uses a build-time
i18n transform plus a runtime locale provider for localized builds.

Supported runtime locales:

```txt
en, zh-CN, es, pt-BR, fr, de, ja
```

## Source Style

Write user-facing copy directly in TSX:

```tsx
<Button>Start Building</Button>
<Input placeholder="Search" />
```

During build, `scripts/i18n/loader.js` transforms extracted text to runtime
lookups:

```tsx
<Button>{__t("src/app/example/Button.startBuilding", "Start Building")}</Button>
```

The source file is not rewritten.

## Commands

```bash
npm run i18n:scan
npm run i18n:scan:full
npm run i18n:scan -- --dir src/app/gpu-baremetal
npm run i18n:report -- --top 40
npm run i18n:lint
npm run i18n:lint:update-baseline
npm run i18n:compile
npm run i18n:compile:all
npm run i18n:translate -- --locale zh-CN
npm run i18n:translate:all -- --dry-run
npm run i18n:translate -- --locale zh-CN --dir src/app/legal --dry-run
npm run i18n:translate -- --locale zh-CN --dir src/app/legal --base-url https://api.openai.com/v1 --model gpt-4o-mini
```

`scan` extracts English messages into:

```txt
locales/en/messages/<source-file-path>.json
```

Keys are derived from the first words of the text. When several texts in one
file share the same derived base, every member of the group gets a
content-hash suffix (`noData-4d968a`) instead of an order-dependent counter
(`noData2`), so inserting or reordering copy never re-points existing
translations at a different source text. If the key scheme ever changes
again, `scripts/i18n/migrate-keys.js` renames keys inside
`locales/<locale>/messages/**` by matching source-text hashes between the old
manifest and a fresh extraction — run it before `scan` rewrites the manifest.

Shared copy should also stay in source as English text. Prefer plain strings in
components, configuration objects, or small typed helpers, and extend the
scanner when a repeated source pattern needs coverage. Do not add new
dictionary modules, `@/dictionaries/*.json` imports, or
`src/localized-dictionaries/*` files; those legacy paths have been removed.

`compile` generates all supported locale bundles:

```txt
src/i18n/generated/messages.ts
public/i18n/<locale>.json
locales/en/public/i18n/<locale>.json
```

Server rendering loads `public/i18n/<locale>.json` on demand and caches it in
the Node.js process. The same JSON files are loaded by the browser when the
user switches language at runtime (warmed when the language menu opens; the
files are served with immutable cache headers because their URLs carry the
build id). English is special-cased: the compiled en catalog is identical to
the fallback text baked into every `__t()` call site, so en requests ship an
empty catalog instead of ~790KB of redundant JSON. `src/i18n/generated/
messages.ts` is still generated as a compiled artifact, but it is only used
as a fallback when the public JSON cannot be loaded.

`translate` currently scaffolds a target locale by copying missing English
values into the target files when `--scaffold` is passed. Without `--scaffold`,
it calls an OpenAI-compatible chat completions provider and translates only
missing target keys. Existing target values are preserved so reviewed
translations are not overwritten.

Provider configuration is read from CLI flags first, then `.env.local`, then
`.env`. Prefer `.env.local` for provider secrets because the existing
`resourceCopy` build step rewrites `.env` from `locales/<locale>/.env`.

```bash
I18N_LLM_API_KEY=...
I18N_LLM_BASE_URL=https://api.openai.com/v1
I18N_LLM_MODEL=gpt-4o-mini
I18N_LLM_TEMPERATURE=0
I18N_TRANSLATE_CHUNK_SIZE=40
I18N_TRANSLATE_LOCALE_CONCURRENCY=6
I18N_PROTECTED_TERMS=Novita AI,Hugging Face,CUDA
```

Equivalent flags:

```bash
npm run i18n:translate -- --locale zh-CN --dir src/hooks \
  --api-key "$I18N_LLM_API_KEY" \
  --base-url "$I18N_LLM_BASE_URL" \
  --model "$I18N_LLM_MODEL"
```

Use `--dry-run` to inspect missing counts without creating files. Use
`--scaffold` to initialize missing keys from English without calling an LLM.

Use `--all` to apply translation checks or translation generation to every
non-English supported locale. By default, all target locales run concurrently.
Use `--locale-concurrency` or `I18N_TRANSLATE_LOCALE_CONCURRENCY` to throttle
provider traffic:

```bash
npm run i18n:translate -- --all --dry-run
npm run i18n:translate -- --all --dir src/app/components/footer
npm run i18n:translate -- --all --locale-concurrency 2
```

## Runtime Locale Switching

The active locale is resolved in this order:

1. Locale path prefix, such as `/zh/models` or `/ja/pricing`
2. Unprefixed paths, such as `/` or `/models`, render as English
3. First document requests without a locale prefix are redirected to the
   preferred non-English locale from browser `Accept-Language`
4. If the browser language is unsupported, IP/edge country headers such as
   `x-vercel-ip-country` or `cf-ipcountry` choose the redirect target
5. If nothing matches, English is used

The middleware writes the resolved locale into `x-locale`. The root layout uses
that value to load the matching JSON messages, initialize
`src/i18n/runtime.ts`, serialize the initial messages into
`window.__NOVITA_I18N__`, and wrap the app with `I18nProvider`.

Client components can switch language with:

```tsx
"use client";

import { useI18n } from "@/i18n/provider";

export function LanguageButton() {
  const { setLocale } = useI18n();

  return <button onClick={() => setLocale("ja")}>Japanese</button>;
}
```

`setLocale` loads `/i18n/<locale>.json`, updates the URL for the selected
locale, and calls `router.refresh()` so Server Components render with the same
locale. English stays unprefixed, so switching back to English navigates to `/`
or the equivalent unprefixed path. Locale choices are not persisted.

## SEO Metadata

Canonical URLs and `hreflang` alternates are generated by
`src/i18n/metadata.ts`. English canonical URLs stay unprefixed, while
non-default locales use their runtime path prefixes, for example:

```txt
en: https://novita.ai/models
zh-CN: https://novita.ai/zh/models
pt-BR: https://novita.ai/pt/models
```

Pages with custom canonical targets should call
`getLocalizedMetadataAlternates(...)` from `generateMetadata()`. Pages without a
custom target inherit the request-aware fallback from the root layout.

`report` performs a read-only scan and writes `.i18n/report.json`. Use it before
expanding a migration slice so noisy files can be reviewed first.

`lint` scans source files for likely user-facing copy that the automatic
extractor cannot safely translate. It compares findings against
`.i18n/lint-baseline.json`, so existing debt does not block builds, but newly
introduced unsupported patterns fail CI and pre-commit checks.

Common failures include assigning copy to variables before rendering, using
unsupported object property names, arrays of UI strings, and template literals
with interpolated values. Prefer inline JSX text, supported props/properties, or
extend the extractor when a repeated pattern is intentional.

## Generated State

`.i18n/manifest.json` stores source file hashes and extracted entries. It is
used for incremental scans.

`.i18n/lint-baseline.json` stores the current set of unsupported extraction
patterns. Update it only after reviewing and accepting existing findings:

```bash
npm run i18n:lint:update-baseline
```

## Current Extraction Coverage

The first pass extracts:

- JSX text nodes
- JSX string expressions and conditional branches, such as
  `{isLoading ? "Submitting..." : "Confirm"}`
- String values for `placeholder`, `title`, `aria-label`, `alt`, `label`, and
  `description`
- String values in common UI object properties: `label`, `text`, `caption`,
  `subtitle`, `subTitle`, `helperText`, `emptyText`, and `tooltip`
- First string argument in feedback calls like `message.success("Saved")` and
  `toast.error("Failed")`
- Metadata `title` and `description` properties
- Zod-style validation messages in calls such as `.min(1, "Required")` and
  `.email("Invalid email")`

It intentionally does not extract arbitrary string literals, object `name`
fields, routes, analytics identifiers, or template literals with interpolated
variables. Those need more context-aware rules to avoid translating API fields,
model names, URLs, and tracking constants.

## Ignore Strategy

The scanner skips generated i18n files:

```txt
src/i18n/generated
```

For source-level exceptions, keep non-user-facing strings out of JSX text and
translatable attributes where possible. You can also skip extraction with:

```tsx
<span data-i18n-ignore>GPU</span>

// i18n-disable-next-line
message.success("Do not extract this string");

<span>Visible copy</span> {/* i18n-disable-line */}
```
