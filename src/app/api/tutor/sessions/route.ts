import { createClient } from '@/lib/supabase/server';
import {
  EXPRESSION_MODULE_ID,
  SENTENCE_MODULE_ID,
  SUPPORTED_EXPRESSIONS,
} from '@/lib/tutor/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Please sign in to use the tutor.' }, { status: 401 });

  const moduleId = new URL(request.url).searchParams.get('module');
  if (moduleId !== SENTENCE_MODULE_ID && moduleId !== EXPRESSION_MODULE_ID) {
    return Response.json({ error: 'Unknown tutor module.' }, { status: 400 });
  }
  const { data, error } = await supabase.from('ai_tutor_sessions')
    .select('id,module_id,kind,title,base_input,expression,expression_meaning,expression_category,expression_usage,created_at')
    .eq('module_id', moduleId).order('created_at', { ascending: false }).limit(100);
  if (error) return Response.json({ error: 'Could not load tutor sessions.' }, { status: 500 });
  return Response.json({ sessions: data ?? [] }, { headers: { 'cache-control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Please sign in to use the tutor.' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const moduleId = body.moduleId;
  const input = typeof body.input === 'string' ? body.input.trim() : '';
  if (input.length < 1 || input.length > 180) {
    return Response.json({ error: 'Enter a sentence or expression up to 180 characters.' }, { status: 400 });
  }

  let kind: 'sentence' | 'expression';
  let title = input;
  let expression: string | null = null;
  if (moduleId === SENTENCE_MODULE_ID) {
    kind = 'sentence';
  } else if (moduleId === EXPRESSION_MODULE_ID) {
    const normalized = input.toLocaleLowerCase().replace(/[.…]/g, '').replace(/\s+/g, ' ').trim();
    const match = SUPPORTED_EXPRESSIONS.find((item) => item.toLocaleLowerCase().replace(/[.…]/g, '').replace(/\s+/g, ' ').trim() === normalized);
    if (!match) {
      return Response.json({ error: `Choose one of the supported expressions: ${SUPPORTED_EXPRESSIONS.join(', ')}.` }, { status: 400 });
    }
    kind = 'expression';
    expression = match;
    title = match;
  } else {
    return Response.json({ error: 'Unknown tutor module.' }, { status: 400 });
  }

  const { data, error } = await supabase.from('ai_tutor_sessions').insert({
    user_id: user.id,
    module_id: moduleId,
    kind,
    title,
    base_input: input,
    expression,
  }).select('id,module_id,kind,title,base_input,expression,expression_meaning,expression_category,expression_usage,created_at').single();
  if (error || !data) return Response.json({ error: 'Could not create the tutor session.' }, { status: 500 });
  return Response.json({ session: data }, { status: 201, headers: { 'cache-control': 'private, no-store' } });
}
