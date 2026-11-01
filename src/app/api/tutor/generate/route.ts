import { createClient } from '@/lib/supabase/server';
import { countTutorPrompt, generateTutorLesson, GeminiTutorError } from '@/lib/tutor/gemini';
import type { TutorExample, TutorSession } from '@/lib/tutor/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status, headers: { 'cache-control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return errorResponse('Please sign in to use the tutor.', 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request.', 400);
  }
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) return errorResponse('Tutor session not found.', 404);

  const { data: session, error: sessionError } = await supabase.from('ai_tutor_sessions')
    .select('id,module_id,kind,title,base_input,expression,expression_meaning,expression_category,expression_usage,created_at')
    .eq('id', sessionId).maybeSingle();
  if (sessionError || !session) return errorResponse('Tutor session not found.', 404);
  const tutorSession = session as TutorSession;

  const { data: priorRows, error: priorError } = await supabase.from('ai_tutor_examples')
    .select('english,malayalam,structure,fingerprint,batch_number')
    .eq('session_id', sessionId).order('batch_number', { ascending: true });
  if (priorError) return errorResponse('Could not load prior examples.', 500);
  const prior = (priorRows ?? []) as TutorExample[];
  if (prior.length >= (tutorSession.kind === 'expression' ? 5 : 30)) {
    return errorResponse('There are no more examples available for this session.', 409);
  }
  if (prior.length % 5 !== 0) return errorResponse('This session is not ready for another batch.', 409);

  let reservationId: string | null = null;
  let actualInput = 0;
  let actualOutput = 0;
  try {
    const batch = prior.length / 5 + 1;
    const prepared = await countTutorPrompt(tutorSession, batch, prior);
    // Leave room for small tokenizer differences when generation uses the fallback model.
    const reservedInputTokens = prepared.inputTokens + 128;
    if (reservedInputTokens > 6000) {
      return errorResponse('This lesson is too large to process. Please shorten the input.', 413);
    }
    const { data: reservation, error: reservationError } = await supabase.rpc('reserve_ai_tutor_generation', {
      p_session_id: sessionId,
      p_input_tokens: reservedInputTokens,
      p_output_tokens: 2500,
    });
    if (reservationError || !Array.isArray(reservation) || !reservation[0]) {
      const message = reservationError?.message ?? '';
      if (/limit reached/i.test(message)) return errorResponse('You have reached today’s tutor token limit. It resets at midnight UTC.', 429);
      if (/in progress|duplicate key/i.test(message)) return errorResponse('A batch is already being generated. Please wait a moment.', 409);
      if (/no next batch/i.test(message)) return errorResponse('There are no more examples available for this session.', 409);
      return errorResponse('Could not reserve tutor usage. Please try again.', 500);
    }
    reservationId = reservation[0].reservation_id as string;

    const lesson = await generateTutorLesson(tutorSession, prior, prepared);
    actualInput = lesson.inputTokens;
    actualOutput = lesson.outputTokens;
    const { data: completed, error: completeError } = await supabase.rpc('finish_ai_tutor_generation', {
      p_reservation_id: reservationId,
      p_examples: lesson.examples,
      p_expression_lesson: lesson.expressionLesson,
      p_actual_input_tokens: actualInput,
      p_actual_output_tokens: actualOutput,
    });
    if (completeError || !Array.isArray(completed) || !completed[0]) {
      throw new GeminiTutorError('The generated lesson could not be saved. Please try again.', 500, actualInput, actualOutput);
    }
    return Response.json({
      batch: batch,
      examples: lesson.examples.map((example) => ({ ...example, batch_number: batch })),
      expressionLesson: lesson.expressionLesson,
      usage: {
        inputTokens: completed[0].input_tokens,
        outputTokens: completed[0].output_tokens,
        dailyLimit: completed[0].daily_limit,
        usageDate: completed[0].usage_date,
      },
    }, { headers: { 'cache-control': 'private, no-store' } });
  } catch (error) {
    if (reservationId) {
      await supabase.rpc('cancel_ai_tutor_generation', {
        p_reservation_id: reservationId,
        p_actual_input_tokens: error instanceof GeminiTutorError ? error.inputTokens : actualInput,
        p_actual_output_tokens: error instanceof GeminiTutorError ? error.outputTokens : actualOutput,
      });
    }
    if (error instanceof GeminiTutorError) return errorResponse(error.message, error.status);
    return errorResponse('The tutor could not complete this lesson. Please try again.', 502);
  }
}
