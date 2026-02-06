# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000 (hot reload enabled)
npm run build    # Production build
npm start        # Serve production build
npm run lint     # ESLint (Next.js + Core Web Vitals rules)
```

No test runner is configured yet. If one is added, update this file.

## Git & Commits

- **Commit messages must be short and to the point, no fluff.**
- **NEVER include `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` or any similar attribution lines.**
- Keep messages under 50 characters when possible, focusing on what changed, not why or how.

## Architecture

**Stack:** Next.js 16.1.6 · React 19.2.3 · TypeScript (strict) · Tailwind CSS v4

- **App Router** is used (`src/app/`). All components are Server Components by default — opt into client-side interactivity with `"use client"`.
- **React Compiler** is enabled in `next.config.ts`, so avoid manual `useMemo`/`useCallback` optimizations.
- **Path alias:** `@/*` resolves to `./src/*` (configured in `tsconfig.json`).

## Styling

- Tailwind v4 via PostCSS (`postcss.config.mjs`). No `tailwind.config.js` — theme tokens are defined inline in `src/app/globals.css` using `@theme inline`.
- Dark mode uses `next-themes` with the `.dark` class strategy (`attribute="class"` on `<html>`). Default theme is `system` (respects `prefers-color-scheme`). Use Tailwind's `dark:` variant for dark-mode-specific styles. A `ModeToggle` component (`src/components/ui/mode-toggle.tsx`) provides Light / Dark / System switching.
- Fonts: Geist Sans and Geist Mono loaded via `next/font/google` in `layout.tsx` and exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`).

## UI Components

- **All UI must be built exclusively with shadcn/ui components.** Do not create custom components for anything shadcn already provides (buttons, inputs, dialogs, dropdowns, etc.).
- Components live in `src/components/ui/`. Add new ones via `npx shadcn add <component>`.
- Config is in `components.json` (style: new-york, base color: neutral, icon library: lucide).
- The `cn` utility (`src/lib/utils.ts`) is available for merging Tailwind classes.

## Project State

shadcn/ui is set up with `next-themes` dark mode. `src/app/page.tsx` (home page) and `src/app/layout.tsx` (root layout) exist. There is no backend, API routes, state management, auth, or database integration yet. The `src/app/.env` file is empty.
