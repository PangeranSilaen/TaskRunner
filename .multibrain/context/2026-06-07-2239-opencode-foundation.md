# Task Runner — Phase 1 Foundation

## Goal

Bootstrap the Task Runner PWA (mobile-first, campus task marketplace for ITK)
with a solid foundation: project scaffold, design system, Supabase backend for
auth/profiles, and the auth flow with route guards.

## Summary

Phase 1 (Foundation) complete and building cleanly (`tsc --noEmit` + `vite build`).
Login/register with ITK campus-email validation, Supabase session wired through a
Zustand store, protected routes, and a basic app shell with bottom navigation.

## Stack

- Vite 8 + React 19 + TypeScript (strict), path alias `@/* -> src/*`
- Tailwind CSS v4 (CSS `@theme` tokens in `src/index.css`, premium teal palette)
- React Router v7, Zustand (auth store), TanStack Query (provider ready)
- React Hook Form + Zod (auth schemas)
- Supabase JS v2, Leaflet (installed, not yet used), lucide-react
- vite-plugin-pwa (manifest + autoUpdate SW; static-only precache)

## Database (Supabase)

Migration `init_profiles_auth_foundation` applied:
- `public.profiles` (1:1 with auth.users) — full_name, email, phone_number,
  avatar_url, role (user/admin), verification_status
  (incomplete/pending/verified/rejected), is_runner_enabled, timestamps.
- Trigger `on_auth_user_created` -> `handle_new_user()` auto-creates a profile
  row, copying `full_name` from sign-up metadata.
- Trigger `profiles_set_updated_at` -> `handle_updated_at()`.
- `public.is_admin()` SECURITY DEFINER helper (avoids RLS recursion).
- RLS enabled: read own / read all as admin / update own / admin update any.

## Important Decisions

- `create-vite@9` ignored `--template react-ts` (scaffolded vanilla); fixed by
  installing react/react-dom/@vitejs/plugin-react and removing vanilla files.
- TS 6 deprecates `baseUrl`; rely on `paths` only (bundler resolution).
- Env access centralised + validated in `src/lib/env.ts`. Campus domain is
  configurable via `VITE_CAMPUS_EMAIL_DOMAIN` (default `student.itk.ac.id`).
- Users CAN log in while unverified, but gated features are disabled in the UI
  (and must be enforced by RLS in later phases — NOT done yet).
- Verification route is standalone (no bottom nav).

## Files

- `src/lib/{env.ts,constants.ts,supabase/client.ts,utils/*}`
- `src/types/{database.ts,app.ts}`
- `src/features/auth/{schemas.ts,api.ts,guards.tsx}`
- `src/stores/auth-store.ts`
- `src/components/{ui,layout}/*`
- `src/app/routes/{auth,home,profile}/*`
- `src/App.tsx`, `src/main.tsx`, `src/index.css`, `vite.config.ts`

## Verification

- `npx tsc --noEmit` — clean
- `npx vite build` — success (CSS 33.6 KB, JS 592 KB / 172 KB gzip; SW generated)
- Auth flow NOT yet manually tested against live Supabase (no test user yet).

## Next (later phases)

- Phase 2: verification module (KTM upload to `ktm-photos` bucket, phone form,
  admin verification page) + RLS enforcement for verified-only actions.
- Add remaining tables: verification_requests, tasks, task_messages,
  payment_records, ratings, runner_profiles, runner_availability_sessions,
  notifications, reports.
- Storage buckets: avatars, ktm-photos, payment-proofs.
- Code-split to reduce main bundle (>500 KB warning).
- Generate real PWA icons (placeholders for now).
