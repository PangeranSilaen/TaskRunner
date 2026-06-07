-- Enable realtime on tasks so the tracking page reflects status changes
-- (accept -> start -> complete/cancel) live without a manual refresh.
-- RLS still applies to realtime: only task participants receive changes.
alter publication supabase_realtime add table public.tasks;
