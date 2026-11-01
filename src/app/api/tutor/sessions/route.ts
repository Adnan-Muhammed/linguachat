import { createClient } from '@/lib/supabase/server';
import {
  EXPRESSION_MODULE_ID,
  SENTENCE_MODULE_ID,
  SUPPORTED_EXPRESSIONS,
} from '@/lib/tutor/types';
import {
  detectSentenceCorrection,
  formatSentenceTitle,
  hasEnglishLetters,
  isMalayalam,
} from '@/lib/tutor/gemini';

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

  const sessions = data ?? [];

  if (moduleId === SENTENCE_MODULE_ID && sessions.length > 0) {
    const uncorrectedSessions = sessions.filter(
      (s) => s.kind === 'sentence' && !s.title.includes(' / ') && !isMalayalam(s.base_input) && hasEnglishLetters(s.base_input)
    );

    if (uncorrectedSessions.length > 0) {
      const candidateIds = uncorrectedSessions.map((s) => s.id);
      const { data: firstExamples } = await supabase
        .from('ai_tutor_examples')
        .select('session_id,english')
        .in('session_id', candidateIds)
        .eq('batch_number', 1)
        .order('created_at', { ascending: true });

      if (firstExamples && firstExamples.length > 0) {
        const exampleMap = new Map<string, string>();
        for (const ex of firstExamples) {
          if (!exampleMap.has(ex.session_id)) {
            exampleMap.set(ex.session_id, ex.english);
          }
        }

        for (const s of uncorrectedSessions) {
          const exEnglish = exampleMap.get(s.id);
          if (exEnglish) {
            const canonicalBase = s.base_input.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
            const canonicalEx = exEnglish.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
            if (canonicalBase !== canonicalEx) {
              const formatted = formatSentenceTitle(s.base_input, exEnglish);
              if (formatted !== s.title) {
                s.title = formatted;
                void supabase.from('ai_tutor_sessions').update({ title: formatted }).eq('id', s.id);
              }
            }
          }
        }
      }
    }
  }

  return Response.json({ sessions }, { headers: { 'cache-control': 'private, no-store' } });
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
    const correction = await detectSentenceCorrection(input);
    if (correction?.hasMistake && correction.corrected) {
      title = formatSentenceTitle(input, correction.corrected);
    }
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
