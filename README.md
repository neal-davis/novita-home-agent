This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
# 本地调试
npm run dev
# 测试环境调试
npm run dev:test
# 生产环境调试
npm run dev:prod
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Testing

Unit tests must live under `tests/unit/**`. Do not add `.test.ts`,
`.test.tsx`, `.spec.ts`, `.spec.tsx`, or `__tests__` under `src/**`.

Core logic should be covered with real assertions for inputs, outputs, state
changes, and error paths. Page and display-only components may use focused render
smoke tests when that is the useful behavior, but coverage-only smoke tests
should not be the primary strategy.

Common commands:

```bash
npm run test:location
npm run test:unit
npm run test:unit:coverage
npm run pre-build-check
```

`test:unit:coverage` measures coverage for `src/**/*.{ts,tsx}` and enforces
these global thresholds: statements `90%`, branches `80%`, functions `80%`, and
lines `80%`. Critical Path Coverage should reach `95%`; critical paths include
billing, pricing, authentication/session handling, API wrappers, store state
transitions, request orchestration, and console workflows that affect creation,
renewal, payment, quota, or resource lifecycle changes. `pre-build-check` runs
the test location guard, lint, i18n checks, unit tests, coverage, and
TypeScript. Vercel builds run `pre-build-check` before entering the
environment-specific build command, so coverage below the configured thresholds
blocks both Preview and Production builds.

## Deploy

### Clean unused branch

- Delete remote branches that are no longer used [LINK](https://github.com/novitalabs/novita-home/branches)
- Execute `npm run git:clean` in the project root directory

1. Press prompt to select the branch you want to keep. (By default, keep the local "main" "dev" "current" branch.)
2. Press the enter key

For Spec
Pricing Principles

1. discountPrice 后端返回 0，则说明为免费；未配置折扣价，后端 discountPrice 返回原价。
