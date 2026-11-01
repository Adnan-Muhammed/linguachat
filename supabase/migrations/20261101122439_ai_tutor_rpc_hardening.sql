-- Keep privileged quota operations outside the exposed Data API schema.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.reserve_ai_tutor_generation(uuid, integer, integer) set schema private;
alter function public.finish_ai_tutor_generation(uuid, jsonb, jsonb, integer, integer) set schema private;
alter function public.cancel_ai_tutor_generation(uuid, integer, integer) set schema private;

revoke all on function private.reserve_ai_tutor_generation(uuid, integer, integer) from public, anon;
revoke all on function private.finish_ai_tutor_generation(uuid, jsonb, jsonb, integer, integer) from public, anon;
revoke all on function private.cancel_ai_tutor_generation(uuid, integer, integer) from public, anon;
grant execute on function private.reserve_ai_tutor_generation(uuid, integer, integer) to authenticated;
grant execute on function private.finish_ai_tutor_generation(uuid, jsonb, jsonb, integer, integer) to authenticated;
grant execute on function private.cancel_ai_tutor_generation(uuid, integer, integer) to authenticated;

create or replace function public.reserve_ai_tutor_generation(
  p_session_id uuid,
  p_input_tokens integer,
  p_output_tokens integer
)
returns table (reservation_id uuid, batch_number smallint, daily_limit integer)
language sql
security invoker
set search_path = pg_catalog, public
as $$ select * from private.reserve_ai_tutor_generation(p_session_id, p_input_tokens, p_output_tokens) $$;

create or replace function public.finish_ai_tutor_generation(
  p_reservation_id uuid,
  p_examples jsonb,
  p_expression_lesson jsonb,
  p_actual_input_tokens integer,
  p_actual_output_tokens integer
)
returns table (usage_date date, input_tokens integer, output_tokens integer, daily_limit integer)
language sql
security invoker
set search_path = pg_catalog, public
as $$ select * from private.finish_ai_tutor_generation(
  p_reservation_id, p_examples, p_expression_lesson, p_actual_input_tokens, p_actual_output_tokens
) $$;

create or replace function public.cancel_ai_tutor_generation(
  p_reservation_id uuid,
  p_actual_input_tokens integer default 0,
  p_actual_output_tokens integer default 0
)
returns void
language sql
security invoker
set search_path = pg_catalog, public
as $$ select private.cancel_ai_tutor_generation(p_reservation_id, p_actual_input_tokens, p_actual_output_tokens) $$;

revoke all on function public.reserve_ai_tutor_generation(uuid, integer, integer) from public, anon;
revoke all on function public.finish_ai_tutor_generation(uuid, jsonb, jsonb, integer, integer) from public, anon;
revoke all on function public.cancel_ai_tutor_generation(uuid, integer, integer) from public, anon;
grant execute on function public.reserve_ai_tutor_generation(uuid, integer, integer) to authenticated;
grant execute on function public.finish_ai_tutor_generation(uuid, jsonb, jsonb, integer, integer) to authenticated;
grant execute on function public.cancel_ai_tutor_generation(uuid, integer, integer) to authenticated;

-- The reservation table remains ungranted to clients; this policy also keeps its RLS intent explicit.
create policy "Users can view their own tutor reservations"
  on public.ai_tutor_generation_reservations for select to authenticated
  using ((select auth.uid()) = user_id);
