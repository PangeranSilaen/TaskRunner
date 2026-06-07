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

## Language (MANDATORY)

- All user-facing UI copy MUST be in Bahasa Indonesia. This is non-negotiable.
- Common technical terms MAY stay in English when they read more naturally:
  `runner`, `task`, `status`, `filter`, `dashboard`, `chat`, `urgent`.
- Error/empty/loading messages shown to users must be human, friendly Indonesian
  (see `dokumentasi/plan/03-...` §15) — never raw database/API errors.
- Agents MUST reply to the user (chat, summaries, plans, docs) in Bahasa
  Indonesia, except for English technical terms. Code identifiers and code
  comments stay in English.

## Docs Index

- `docs/plan/2026-06-07-mvp-phases.md` — full MVP implementation plan (Phase 2-6),
  DB schema, RLS, per-phase file lists.
- `docs/browser-testing.md` — how to smoke-test the UI with `agent-browser`
  (React Hook Form + Supabase localStorage gotchas, demo accounts, login recipe,
  troubleshooting). READ THIS before any browser automation on this repo.

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

MVP complete (Phase 1-6), deployed to production and smoke-tested:
- Phase 1: scaffold, design system, `profiles` + auth trigger + RLS, login/register
  (ITK email), route guards, app shell.
- Phase 2: verification (`verification_requests`, KTM upload to `ktm-photos`,
  admin approve/reject, status flow).
- Phase 3: tasks core (`tasks` + `public_code`, buat task w/ Leaflet picker,
  My Tasks, runner dashboard, accept/start/complete/cancel via RPC).
- Phase 4: realtime chat (`task_messages`), payment record (`payment_records`,
  transfer proof to `payment-proofs`, runner confirm), WhatsApp deep-link.
- Phase 5: `ratings` + `runner_profiles` (+ availability sessions), stat triggers,
  tracking page, rating modal, profile stats, settings.
- Phase 6: `notifications` (realtime + bell) + lifecycle triggers, `reports`,
  admin dashboard/monitoring/reports.

Seed: 5 demo accounts (pwd `TaskRunner123`) + 4 sample tasks + runner stats.
See `docs/browser-testing.md` for accounts. Live: https://taskrunner-swart.vercel.app

Intentional Supabase advisor WARNs (not errors): `profiles`/`runner_profiles`
readable by authenticated (needed to show names/runner discovery); SECURITY
DEFINER RPCs callable by authenticated (gated internally + via RLS); anon access
revoked on all app tables/functions. See `.multibrain/indexes/foundation.md`.
