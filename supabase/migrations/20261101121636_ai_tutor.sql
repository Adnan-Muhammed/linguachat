-- AI Tutor sessions, generated examples, and atomic daily token accounting.

create table public.ai_tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id text not null check (module_id in ('sentence-pattern-explorer', 'grammar-patterns-expressions')),
  kind text not null check (kind in ('sentence', 'expression')),
  title text not null check (char_length(title) between 1 and 180),
  base_input text not null check (char_length(base_input) between 1 and 180),
  expression text,
  expression_meaning text,
  expression_category text,
  expression_usage text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind = 'sentence' and module_id = 'sentence-pattern-explorer' and expression is null)
      or (kind = 'expression' and module_id = 'grammar-patterns-expressions' and expression is not null))
);

create index ai_tutor_sessions_user_module_created_idx
  on public.ai_tutor_sessions (user_id, module_id, created_at desc);

alter table public.ai_tutor_sessions enable row level security;
grant select, insert, update, delete on public.ai_tutor_sessions to authenticated;

create policy "Users can view their own tutor sessions"
  on public.ai_tutor_sessions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can create their own tutor sessions"
  on public.ai_tutor_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update their own tutor sessions"
  on public.ai_tutor_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own tutor sessions"
  on public.ai_tutor_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

create table public.ai_tutor_examples (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_tutor_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  batch_number smallint not null check (batch_number between 1 and 6),
  english text not null check (char_length(english) between 1 and 500),
  malayalam text not null check (char_length(malayalam) between 1 and 800),
  structure text not null check (char_length(structure) between 1 and 500),
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  unique (session_id, fingerprint),
  unique (session_id, batch_number, english)
);

create index ai_tutor_examples_session_batch_idx
  on public.ai_tutor_examples (session_id, batch_number, created_at);

alter table public.ai_tutor_examples enable row level security;
grant select on public.ai_tutor_examples to authenticated;
create policy "Users can view their own tutor examples"
  on public.ai_tutor_examples for select to authenticated
  using ((select auth.uid()) = user_id);

create table public.ai_tutor_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  reserved_tokens integer not null default 0 check (reserved_tokens >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.ai_tutor_daily_usage enable row level security;
grant select on public.ai_tutor_daily_usage to authenticated;
create policy "Users can view their own tutor usage"
  on public.ai_tutor_daily_usage for select to authenticated
  using ((select auth.uid()) = user_id);

create table public.ai_tutor_generation_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.ai_tutor_sessions(id) on delete cascade,
  usage_date date not null,
  batch_number smallint not null check (batch_number between 1 and 6),
  reserved_input_tokens integer not null check (reserved_input_tokens between 0 and 6000),
  reserved_output_tokens integer not null check (reserved_output_tokens between 1 and 2500),
  actual_input_tokens integer,
  actual_output_tokens integer,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'expired')),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create unique index ai_tutor_one_live_generation_per_batch
  on public.ai_tutor_generation_reservations (session_id, batch_number)
  where status in ('pending', 'completed');
create index ai_tutor_reservations_user_date_status_idx
  on public.ai_tutor_generation_reservations (user_id, usage_date, status);

alter table public.ai_tutor_generation_reservations enable row level security;
-- No table access is granted to clients; only the narrowly scoped RPCs below mutate reservations.

create or replace function public.reserve_ai_tutor_generation(
  p_session_id uuid,
  p_input_tokens integer,
  p_output_tokens integer
)
returns table (reservation_id uuid, batch_number smallint, daily_limit integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_usage_date date := (now() at time zone 'utc')::date;
  v_batch smallint;
  v_example_count integer;
  v_reserved record;
  v_limit constant integer := 20000;
  v_reservation_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_input_tokens < 0 or p_input_tokens > 6000 or p_output_tokens < 1 or p_output_tokens > 2500 then
    raise exception 'Invalid token reservation' using errcode = '22023';
  end if;

  perform 1 from public.ai_tutor_sessions s where s.id = p_session_id and s.user_id = v_user_id for update;
  if not found then raise exception 'Tutor session not found' using errcode = 'P0002'; end if;

  insert into public.ai_tutor_daily_usage (user_id, usage_date)
  values (v_user_id, v_usage_date)
  on conflict (user_id, usage_date) do nothing;
  perform 1 from public.ai_tutor_daily_usage u
    where u.user_id = v_user_id and u.usage_date = v_usage_date for update;

  -- Release abandoned reservations after a timed-out server invocation.
  for v_reserved in
    update public.ai_tutor_generation_reservations r
      set status = 'expired', finished_at = now()
      where r.user_id = v_user_id and r.usage_date = v_usage_date
        and r.status = 'pending' and r.created_at < now() - interval '5 minutes'
      returning r.reserved_input_tokens + r.reserved_output_tokens as amount
  loop
    update public.ai_tutor_daily_usage u
      set reserved_tokens = greatest(0, u.reserved_tokens - v_reserved.amount), updated_at = now()
      where u.user_id = v_user_id and u.usage_date = v_usage_date;
  end loop;

  select count(*)::integer into v_example_count
    from public.ai_tutor_examples e where e.session_id = p_session_id;
  if v_example_count >= 30 or v_example_count % 5 <> 0 then
    raise exception 'No next batch is available' using errcode = '22023';
  end if;
  v_batch := (v_example_count / 5 + 1)::smallint;
  if exists (
    select 1 from public.ai_tutor_generation_reservations r
    where r.session_id = p_session_id and r.batch_number = v_batch and r.status = 'pending'
  ) then raise exception 'Generation already in progress' using errcode = '55P03'; end if;

  update public.ai_tutor_daily_usage u
    set reserved_tokens = u.reserved_tokens + p_input_tokens + p_output_tokens, updated_at = now()
    where u.user_id = v_user_id and u.usage_date = v_usage_date
      and u.input_tokens + u.output_tokens + u.reserved_tokens + p_input_tokens + p_output_tokens <= v_limit;
  if not found then raise exception 'Daily tutor token limit reached' using errcode = 'P0001'; end if;

  insert into public.ai_tutor_generation_reservations (
    user_id, session_id, usage_date, batch_number, reserved_input_tokens, reserved_output_tokens
  ) values (v_user_id, p_session_id, v_usage_date, v_batch, p_input_tokens, p_output_tokens)
  returning id into v_reservation_id;

  return query select v_reservation_id, v_batch, v_limit;
end;
$$;

create or replace function public.finish_ai_tutor_generation(
  p_reservation_id uuid,
  p_examples jsonb,
  p_expression_lesson jsonb,
  p_actual_input_tokens integer,
  p_actual_output_tokens integer
)
returns table (usage_date date, input_tokens integer, output_tokens integer, daily_limit integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_res public.ai_tutor_generation_reservations%rowtype;
  v_session_id uuid;
  v_item jsonb;
  v_english text;
  v_fingerprint text;
  v_limit constant integer := 20000;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_actual_input_tokens < 0 or p_actual_output_tokens < 0 then raise exception 'Invalid token usage' using errcode = '22023'; end if;

  select r.session_id, r.usage_date into v_session_id, v_res.usage_date
    from public.ai_tutor_generation_reservations r
    where r.id = p_reservation_id and r.user_id = v_user_id and r.status = 'pending';
  if not found then raise exception 'Generation reservation not found' using errcode = 'P0002'; end if;
  perform 1 from public.ai_tutor_sessions s where s.id = v_session_id and s.user_id = v_user_id for update;
  if not found then raise exception 'Tutor session not found' using errcode = 'P0002'; end if;
  perform 1 from public.ai_tutor_daily_usage u
    where u.user_id = v_user_id and u.usage_date = v_res.usage_date for update;
  select * into v_res from public.ai_tutor_generation_reservations r
    where r.id = p_reservation_id and r.user_id = v_user_id and r.status = 'pending' for update;
  if not found then raise exception 'Generation reservation not found' using errcode = 'P0002'; end if;
  if p_actual_input_tokens > v_res.reserved_input_tokens or p_actual_output_tokens > v_res.reserved_output_tokens then
    raise exception 'Actual usage exceeded the reserved amount' using errcode = '22023';
  end if;
  if jsonb_typeof(p_examples) <> 'array' or jsonb_array_length(p_examples) <> 5 then
    raise exception 'Exactly five examples are required' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_examples)
  loop
    v_english := btrim(v_item->>'english');
    v_fingerprint := v_item->>'fingerprint';
    if v_english = '' or v_fingerprint !~ '^[a-f0-9]{64}$'
      or coalesce(btrim(v_item->>'malayalam'), '') = ''
      or coalesce(btrim(v_item->>'structure'), '') = '' then
      raise exception 'Invalid example payload' using errcode = '22023';
    end if;
    insert into public.ai_tutor_examples (session_id, user_id, batch_number, english, malayalam, structure, fingerprint)
      values (v_res.session_id, v_user_id, v_res.batch_number, v_english,
        btrim(v_item->>'malayalam'), btrim(v_item->>'structure'), v_fingerprint);
  end loop;

  if p_expression_lesson is not null then
    update public.ai_tutor_sessions s set
      expression_meaning = p_expression_lesson->>'meaningMalayalam',
      expression_category = p_expression_lesson->>'category',
      expression_usage = p_expression_lesson->>'usageMalayalam',
      updated_at = now()
    where s.id = v_res.session_id and s.user_id = v_user_id;
  end if;

  update public.ai_tutor_daily_usage u set
    input_tokens = u.input_tokens + p_actual_input_tokens,
    output_tokens = u.output_tokens + p_actual_output_tokens,
    reserved_tokens = greatest(0, u.reserved_tokens - v_res.reserved_input_tokens - v_res.reserved_output_tokens),
    updated_at = now()
  where u.user_id = v_user_id and u.usage_date = v_res.usage_date;
  update public.ai_tutor_generation_reservations r set
    actual_input_tokens = p_actual_input_tokens,
    actual_output_tokens = p_actual_output_tokens,
    status = 'completed', finished_at = now()
  where r.id = v_res.id;

  return query select u.usage_date, u.input_tokens, u.output_tokens, v_limit
    from public.ai_tutor_daily_usage u where u.user_id = v_user_id and u.usage_date = v_res.usage_date;
end;
$$;

create or replace function public.cancel_ai_tutor_generation(
  p_reservation_id uuid,
  p_actual_input_tokens integer default 0,
  p_actual_output_tokens integer default 0
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
  v_res public.ai_tutor_generation_reservations%rowtype;
  v_session_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select r.session_id, r.usage_date into v_session_id, v_res.usage_date
    from public.ai_tutor_generation_reservations r
    where r.id = p_reservation_id and r.user_id = v_user_id and r.status = 'pending';
  if not found then return; end if;
  perform 1 from public.ai_tutor_sessions s where s.id = v_session_id and s.user_id = v_user_id for update;
  perform 1 from public.ai_tutor_daily_usage u
    where u.user_id = v_user_id and u.usage_date = v_res.usage_date for update;
  select * into v_res from public.ai_tutor_generation_reservations r
    where r.id = p_reservation_id and r.user_id = v_user_id and r.status = 'pending' for update;
  if not found then return; end if;
  update public.ai_tutor_daily_usage u set
    input_tokens = u.input_tokens + greatest(0, coalesce(p_actual_input_tokens, 0)),
    output_tokens = u.output_tokens + greatest(0, coalesce(p_actual_output_tokens, 0)),
    reserved_tokens = greatest(0, u.reserved_tokens - v_res.reserved_input_tokens - v_res.reserved_output_tokens),
    updated_at = now()
  where u.user_id = v_user_id and u.usage_date = v_res.usage_date;
  update public.ai_tutor_generation_reservations r set
    actual_input_tokens = greatest(0, coalesce(p_actual_input_tokens, 0)),
    actual_output_tokens = greatest(0, coalesce(p_actual_output_tokens, 0)),
    status = 'failed', finished_at = now()
  where r.id = v_res.id;
end;
$$;

revoke all on function public.reserve_ai_tutor_generation(uuid, integer, integer) from public, anon;
revoke all on function public.finish_ai_tutor_generation(uuid, jsonb, jsonb, integer, integer) from public, anon;
revoke all on function public.cancel_ai_tutor_generation(uuid, integer, integer) from public, anon;
grant execute on function public.reserve_ai_tutor_generation(uuid, integer, integer) to authenticated;
grant execute on function public.finish_ai_tutor_generation(uuid, jsonb, jsonb, integer, integer) to authenticated;
grant execute on function public.cancel_ai_tutor_generation(uuid, integer, integer) to authenticated;
