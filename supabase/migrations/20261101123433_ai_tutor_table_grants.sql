-- Override this project's legacy default grants for the new tutor tables.
revoke all on public.ai_tutor_sessions from public, anon, authenticated, service_role;
revoke all on public.ai_tutor_examples from public, anon, authenticated, service_role;
revoke all on public.ai_tutor_daily_usage from public, anon, authenticated, service_role;
revoke all on public.ai_tutor_generation_reservations from public, anon, authenticated, service_role;

grant select, insert on public.ai_tutor_sessions to authenticated;
grant select on public.ai_tutor_examples to authenticated;
grant select on public.ai_tutor_daily_usage to authenticated;
