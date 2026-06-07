# AGENTS.md — Task Runner

Guidance for AI coding agents (OpenCode, Claude Code, Codex, etc.) working in
this repository. Read this before making changes.

## Multi Brain (MANDATORY)

- Read `.multibrain/session.md` before starting work.
- Use `.multibrain/session.md` as the master index only.
- Open only the `.multibrain/indexes/*.md` bucket files that match the current task.
- Open `.multibrain/context/*.md` only when the selected bucket points to deeper
  context that matters.
- After meaningful work, update the relevant named bucket and refresh the master
  index if needed. Write a full context file in `.multibrain/context/` when the
  work has details worth preserving.

Skills live in `.agents/skills/`. The `multi-brain` skill documents the full
memory workflow.

## What This Project Is

Task Runner — a mobile-first PWA that connects ITK campus students who need small
errands done (customers) with students willing to run them (runners). Backend is
Supabase (Auth, Postgres, Storage, Realtime). The full product spec lives in
`../dokumentasi/plan/` (product requirements, UI/userflow, tech guide). Honour
that scope; avoid feature creep (no payment gateway, wallet, real-time GPS, or
auto-settlement on MVP).

## Tech Stack

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4 — design tokens via `@theme` in `src/index.css`
- React Router v7, Zustand (UI/auth state), TanStack Query (server data)
- React Hook Form + Zod (forms/validation)
- Supabase JS v2, Leaflet + OpenStreetMap (maps), lucide-react (icons)
- vite-plugin-pwa

## Conventions

- Path alias: import from `@/...` (maps to `src/...`).
- Keep UI in Indonesian; technical terms (runner, task, status) may stay English.
- Server data (tasks, chat, profiles) comes from Supabase via TanStack Query —
  do NOT persist important server state only in Zustand.
- Centralise env access in `src/lib/env.ts`; never hardcode keys.
- Use the design tokens (primary teal, etc.); avoid neon colors.
- Money math goes through `src/lib/utils/fees.ts` (platform fee = 10%).
- Folder layout: `app/routes` (pages), `components/{ui,layout,...}`,
  `features/<domain>` (api, schemas, guards, hooks), `lib`, `stores`, `types`.

## Supabase

- An MCP Supabase connection is configured; use it for migrations and schema work.
- ALWAYS use migrations for DDL. Enable RLS on every new table — never leave a
  table public without policies.
- Regenerate `src/types/database.ts` after schema changes.
- Run security/performance advisors after DDL changes.

## Verification Before Done

- `npx tsc --noEmit` must pass.
- `npx vite build` must succeed.
- Don't claim a feature works without verifying.

## Environment

- Copy `.env.example` to `.env.local` and fill in Supabase values. `.env.local`
  is gitignored and must never be committed.

## Current State

Phase 1 (Foundation) is complete: scaffold, design system, `profiles` table +
auth trigger + RLS, login/register with ITK email validation, route guards, and
the app shell. See `.multibrain/indexes/foundation.md` for details and the
remaining phase roadmap.
