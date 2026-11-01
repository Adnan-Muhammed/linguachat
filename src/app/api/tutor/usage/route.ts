import { createClient } from '@/lib/supabase/server';
import { DAILY_TOKEN_LIMIT } from '@/lib/tutor/types';

export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Please sign in to use the tutor.' }, { status: 401 });
  const usageDate = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.from('ai_tutor_daily_usage')
    .select('input_tokens,output_tokens,reserved_tokens,usage_date')
    .eq('user_id', user.id).eq('usage_date', usageDate).maybeSingle();
  if (error) return Response.json({ error: 'Could not load tutor usage.' }, { status: 500 });
  return Response.json({
    usage: {
      inputTokens: data?.input_tokens ?? 0,
      outputTokens: data?.output_tokens ?? 0,
      reservedTokens: data?.reserved_tokens ?? 0,
      dailyLimit: DAILY_TOKEN_LIMIT,
      usageDate,
    },
  }, { headers: { 'cache-control': 'private, no-store' } });
}
