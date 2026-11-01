import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Please sign in to use the tutor.' }, { status: 401 });

  const { sessionId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return Response.json({ error: 'Tutor session not found.' }, { status: 404 });
  const { data: session, error } = await supabase.from('ai_tutor_sessions')
    .select('id,module_id,kind,title,base_input,expression,expression_meaning,expression_category,expression_usage,created_at')
    .eq('id', sessionId).maybeSingle();
  if (error || !session) return Response.json({ error: 'Tutor session not found.' }, { status: 404 });
  const { data: examples, error: examplesError } = await supabase.from('ai_tutor_examples')
    .select('id,batch_number,english,malayalam,structure,fingerprint,created_at')
    .eq('session_id', sessionId).order('batch_number', { ascending: true }).order('created_at', { ascending: true });
  if (examplesError) return Response.json({ error: 'Could not load lesson examples.' }, { status: 500 });
  return Response.json({ session, examples: examples ?? [] }, { headers: { 'cache-control': 'private, no-store' } });
}
