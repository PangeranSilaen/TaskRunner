-- BUG: tasks_set_updated_at calls handle_updated_at() which sets
-- new.updated_at, but the tasks table has no updated_at column. This made
-- EVERY update on tasks fail (accept/start/complete/cancel). The tasks table
-- tracks lifecycle timestamps explicitly (accepted_at, started_at, etc.), so
-- the generic updated_at trigger is unnecessary. Drop it.
drop trigger if exists tasks_set_updated_at on public.tasks;

-- Clean up the temporary debug table used to diagnose the issue.
drop table if exists public._dbg;
