# 2026-04-24 /gpus route redesign

## Goal

Refactor the `/gpus` route to match the v5 Figma design using project design tokens and FE skill conventions, while aligning the page shell with the newer marketing-page pattern already used by the GPU bare metal page.

## Scope

- Replace the current `/gpus` page shell with `WebsiteNavbar + FooterSection`
- Rebuild the page middle content into:
  1. Hero section
  2. Content section 1: title + subtitle + table
  3. Content section 2: multi-language code showcase rebuilt from Figma
  4. Content section 3: capability / content block based on the provided Figma node
- Reuse existing content concepts where useful, especially code examples from the earlier “Develop with Our Simple APIs” module
- Follow project design-token and Tailwind-first styling rules

## Out of scope

- Porting all historical `/gpus` sections into the new page
- Preserving old `/gpus` DOM structure or legacy styling approach
- Introducing new product interactions not required by Figma
- Deleting old unused components during the first implementation pass

## Page shell

The new `/gpus` page should follow the same high-level shell pattern as `src/app/gpu-baremetal/page.tsx`:

- `WebsiteNavbar`
- `GpusHero`
- `GpusPageContent`
- `FooterSection`

This replaces the current `/gpus` shell that uses `Header`, `FooterBanner`, and `Footer`.

## Proposed component structure

### `src/app/gpus/page.tsx`

Responsibilities:

- Keep metadata for the route
- Assemble the new shell only
- Avoid containing detailed section logic

### `src/app/gpus/components/GpusHero.tsx`

Responsibilities:

- Render hero heading, description, CTA, and hero background media
- Keep the hero self-contained
- Use a safe-area container rather than a full-viewport background treatment

### `src/app/gpus/components/GpusPageContent.tsx`

Responsibilities:

- Compose the three middle sections in order
- Avoid owning complex state

### `src/app/gpus/components/GpusSpecsSection.tsx`

Responsibilities:

- Render module 1
- Structure: main title, subtitle, table
- Keep table content local unless implementation shows a strong reason to extract shared constants

### `src/app/gpus/components/GpusCodeShowcaseSection.tsx`

Responsibilities:

- Render module 2
- Rebuild the UI from Figma rather than reusing the old GPUCode DOM/component structure
- Own the small amount of UI state for language switching

### `src/app/gpus/components/GpusCapabilitiesSection.tsx`

Responsibilities:

- Render module 3 from the provided Figma section
- Stay primarily presentational

## Hero design requirements

- The hero background image must live inside the safe content area, not stretch across the entire viewport width
- The background treatment should prioritize height coverage while allowing width to adapt naturally
- Overflow outside the intended safe area may be clipped, but the image must not be distorted
- Foreground content should remain readable over the background
- The hero should not absorb downstream sections or become a page-length visual container

## Module 1 requirements: specs/table section

Source: Figma node `478:26082`

Confirmed structure:

- Main title
- Subtitle
- Table below the heading block

Implementation guidance:

- Treat this as an information section, not a marketing card grid
- Use a clean section header followed by a table container
- Prefer a token-driven table surface for borders, row dividers, header styles, spacing, and background layers
- Keep responsiveness conservative and readable; if necessary, support horizontal overflow instead of inventing complex mobile table transformations not specified by design

## Module 2 requirements: code showcase section

Source: provided Figma node for the second middle module

Confirmed intent:

- Use the earlier “Develop with Our Simple APIs” concept as reference only
- Rebuild the component according to the new v5 UI

Implementation guidance:

- Do not reuse the old `GPUCode` component structure as the main implementation
- Reuse only the useful code examples, language labels, and content concepts where appropriate
- Keep interaction minimal and focused: language switching plus code-panel display
- The new visual structure should be driven by Figma, likely as a split layout with descriptive content and a code panel

## Module 3 requirements

Source: provided Figma node `478:26250`

Implementation guidance:

- Build as an isolated presentational section
- Favor project primitives and existing visual patterns where they fit the design
- Avoid introducing unnecessary state or behavior unless the design clearly requires it

## Styling strategy

- Tailwind-first for layout and common presentation
- Use project design tokens for colors, typography mappings, spacing, borders, and shadows
- Avoid raw hex colors and generic Tailwind grays when a project token applies
- Avoid creating a new page-level SCSS-module layout system unless a narrow, local styling need cannot be expressed cleanly with existing Tailwind and token patterns

## State and data boundaries

- `GpusPageContent` should stay mostly stateless
- Only the code showcase section should own lightweight UI state for active language selection
- Static section content should remain local to each section unless there is an obvious shared need
- Do not introduce unnecessary abstraction layers for fixed marketing content

## Legacy code handling

- Existing `/gpus` modules are not the target architecture for the new page
- Legacy sections such as `FirstPage`, `GPUPricing`, `SaveCost`, `AutoScale`, `Deployment`, `ScalablePart`, and `GlobalPart` are not part of the first-pass redesign unless later clarified otherwise
- Old sections or helpers that become unused should be identified after implementation and reviewed with the user before deletion

## Parallel implementation split

Recommended team split:

1. Main-shell integration
   - Update `src/app/gpus/page.tsx`
   - Add new shell and section composition
2. Hero implementation
   - Build `GpusHero`
   - Handle safe-area background behavior
3. Content implementation A
   - Build `GpusSpecsSection`
   - Build `GpusCapabilitiesSection`
4. Content implementation B
   - Build `GpusCodeShowcaseSection`
   - Extract/reuse only the needed code example content from the older module

## Verification expectations

Before calling the implementation complete, verify:

- `/gpus` uses `WebsiteNavbar + FooterSection`
- Hero background behavior matches the safe-area requirement and does not distort across common desktop widths
- Module 1 table remains readable on both desktop and smaller widths
- Module 2 language switching works correctly
- Visual order and spacing of the three middle sections match the approved structure
- The implemented page is exercised in a browser rather than only by static review

## Risks / open items

- The first module Figma node could not be fetched via MCP because of a certificate verification error during brainstorming, so the section design is currently based on user-confirmed structure rather than live node extraction
- Module 3 details remain intentionally high-level until implementation-time Figma extraction succeeds or the existing screenshot/context is inspected

## Recommended next step

After user review of this spec, write a detailed implementation plan and then execute the work in parallel using an agent team.
