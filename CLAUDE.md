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

## Architecture

**Stack:** Next.js 16.1.6 · React 19.2.3 · TypeScript (strict) · Tailwind CSS v4

- **App Router** is used (`src/app/`). All components are Server Components by default — opt into client-side interactivity with `"use client"`.
- **React Compiler** is enabled in `next.config.ts`, so avoid manual `useMemo`/`useCallback` optimizations.
- **Path alias:** `@/*` resolves to `./src/*` (configured in `tsconfig.json`).

## Styling

- Tailwind v4 via PostCSS (`postcss.config.mjs`). No `tailwind.config.js` — theme tokens are defined inline in `src/app/globals.css` using `@theme inline`.
- Dark mode is handled via `prefers-color-scheme` media query on CSS custom properties (`--background`, `--foreground`), not Tailwind's `dark:` class strategy.
- Fonts: Geist Sans and Geist Mono loaded via `next/font/google` in `layout.tsx` and exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`).

## Project State

This is a freshly bootstrapped project. Only `src/app/page.tsx` (home page) and `src/app/layout.tsx` (root layout) exist. There is no backend, API routes, state management, auth, or database integration yet. The `src/app/.env` file is empty.
