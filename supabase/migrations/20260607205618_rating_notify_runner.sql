-- Item 9: notify the runner when they receive a new rating/review.
create or replace function public.on_rating_inserted()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_avg numeric;
begin
  select avg(rating)::numeric(3,2) into v_avg
    from public.ratings where runner_id = new.runner_id;

  insert into public.runner_profiles (user_id, average_rating)
  values (new.runner_id, coalesce(v_avg, 0))
  on conflict (user_id) do update
    set average_rating = coalesce(v_avg, 0), updated_at = now();

  -- Notify the runner about the new rating (+ review text when present).
  perform public.push_notification(
    new.runner_id,
    'new_rating',
    'Kamu dapat rating baru',
    'Kamu menerima rating ' || new.rating || ' bintang' ||
      case
        when new.review is not null and length(trim(new.review)) > 0
        then ': "' || new.review || '"'
        else '.'
      end,
    new.task_id);

  return new;
end;
$function$;
