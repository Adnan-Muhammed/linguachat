import 'server-only';
import { createHash } from 'node:crypto';
import type { ExpressionLesson, TutorExample, TutorSession } from './types';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash';
const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiTutorError extends Error {
  constructor(message: string, readonly status = 502, readonly inputTokens = 0, readonly outputTokens = 0) {
    super(message);
  }
}

export type GeneratedLesson = {
  examples: TutorExample[];
  expressionLesson: ExpressionLesson | null;
  inputTokens: number;
  outputTokens: number;
};

function getKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiTutorError('The tutor service is not configured yet.', 503);
  return key;
}

function schemaFor(session: TutorSession) {
  const example = {
    type: 'OBJECT' as const,
    properties: {
      english: { type: 'STRING' as const },
      malayalam: { type: 'STRING' as const },
      structure: { type: 'STRING' as const },
    },
    required: ['english', 'malayalam', 'structure'],
  };

  if (session.kind === 'expression') {
    return {
      type: 'OBJECT' as const,
      properties: {
        meaningMalayalam: { type: 'STRING' as const },
        category: { type: 'STRING' as const },
        usageMalayalam: { type: 'STRING' as const },
        examples: { type: 'ARRAY' as const, minItems: 5, maxItems: 5, items: example },
      },
      required: ['meaningMalayalam', 'category', 'usageMalayalam', 'examples'],
    };
  }

  return {
    type: 'OBJECT' as const,
    properties: { examples: { type: 'ARRAY' as const, minItems: 5, maxItems: 5, items: example } },
    required: ['examples'],
  };
}

function promptFor(session: TutorSession, batch: number, prior: TutorExample[]) {
  const previous = prior.length
    ? prior.map((item, index) => `${index + 1}. ${item.english}`).join('\n')
    : '(none)';

  if (session.kind === 'expression') {
    return [
      'You are an English tutor for Malayalam-speaking learners.',
      `Teach the English expression: ${session.expression}.`,
      'Return its meaning in Malayalam, the grammar category, and a short usage explanation in Malayalam.',
      'Give exactly five natural, grammatically correct English examples. For each, give a faithful Malayalam translation and a concise grammar structure template.',
      'Use simple, varied everyday contexts. Do not repeat an example within this response.',
      'Return only the required JSON object.',
    ].join('\n');
  }

  return [
    'You are an English tutor for Malayalam-speaking learners.',
    `The learner's base sentence is: ${session.base_input}`,
    'If it is Malayalam, translate its meaning into natural English. If it is English, correct grammar and wording where needed while preserving the meaning.',
    `Generate batch ${batch} of six. Return exactly five distinct, useful English transformations of the same base meaning.`,
    ...(batch === 1 ? ['The first example must be the natural English translation or corrected version of the base sentence itself; include its Malayalam translation and grammar structure. Use the other four examples for transformations.'] : []),
    'Vary grammatical structures and forms where natural (affirmative, negative, questions, tense/aspect, modals, and useful clause patterns). Do not invent facts or force an unnatural transformation.',
    'For every sentence, provide an accurate Malayalam translation and a concise reusable grammar structure template.',
    `Do not repeat or closely paraphrase any prior example: ${previous}`,
    'Return only the required JSON object.',
  ].join('\n');
}

function readObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new GeminiTutorError('The tutor returned an invalid response. Please try again.');
  }
  return value as Record<string, unknown>;
}

function requiredText(object: Record<string, unknown>, key: string, max: number) {
  const value = object[key];
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new GeminiTutorError('The tutor returned an invalid response. Please try again.');
  }
  return value.trim();
}

function fingerprint(sentence: string) {
  const canonical = sentence.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return createHash('sha256').update(canonical).digest('hex');
}

function validateExamples(value: unknown, prior: TutorExample[]) {
  if (!Array.isArray(value) || value.length !== 5) {
    throw new GeminiTutorError('The tutor returned an invalid set of examples. Please try again.');
  }
  const used = new Set(prior.map((item) => item.fingerprint || fingerprint(item.english)));
  const examples = value.map((entry) => {
    const item = readObject(entry);
    const english = requiredText(item, 'english', 500);
    const result = {
      english,
      malayalam: requiredText(item, 'malayalam', 800),
      structure: requiredText(item, 'structure', 500),
      fingerprint: fingerprint(english),
    };
    if (used.has(result.fingerprint)) {
      throw new GeminiTutorError('The tutor generated a repeated example. Please try again.');
    }
    used.add(result.fingerprint);
    return result;
  });
  return examples;
}

function thinkingConfigFor(model: string) {
  if (model.includes('flash-lite')) {
    return { thinkingConfig: { thinkingLevel: 'minimal' } };
  }
  if (model.startsWith('gemini-3.') || model.startsWith('gemini-4.')) {
    return { thinkingConfig: { thinkingLevel: 'low' } };
  }
  if (model.startsWith('gemini-2.5')) {
    return { thinkingConfig: { thinkingBudget: 0 } };
  }
  return {};
}

async function postGemini(action: string, body: unknown, model = MODEL, maxAttempts = 2, customTimeoutMs?: number) {
  const key = getKey();
  let response: Response | undefined;
  const timeoutMs = customTimeoutMs ?? (action === 'countTokens' ? 10_000 : 30_000);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      response = await fetch(`${API_ROOT}/${encodeURIComponent(model)}:${action}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const timedOut = error instanceof Error && error.name === 'TimeoutError';
      if (timedOut) {
        console.error('[Gemini Tutor] request timed out', { action, model, timeoutMs });
        throw new GeminiTutorError('Gemini took too long to respond. Please try again.', 504);
      }
      console.error('[Gemini Tutor] request could not reach provider', { action, model });
      throw new GeminiTutorError('The tutor service could not be reached. Please try again.', 502);
    }
    if (response.status !== 503 || attempt === maxAttempts - 1) break;
    const backoffMs = 500 + Math.floor(Math.random() * 500);
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
  }

  if (!response?.ok) {
    const status = response?.status ?? 502;
    // Log only safe diagnostics; never log the API key or provider response body.
    console.error('[Gemini Tutor] request failed', { action, model, status });
    const message = status === 400
      ? 'Gemini rejected the request configuration. Check the model and structured-output settings.'
      : status === 403
        ? 'Gemini denied this key or model access. Check that the Infisical key is valid and enabled for the Gemini API.'
        : status === 404
          ? 'The configured Gemini model was not found. Check GEMINI_MODEL in Infisical or Vercel.'
          : status === 429
            ? 'Gemini rate limit or quota reached. Check the Google AI project quota and try again later.'
            : status === 503
              ? 'Gemini is temporarily overloaded. Please try again in a moment.'
              : 'The tutor service could not complete this request. Please try again.';
    throw new GeminiTutorError(message, status === 429 || status === 503 ? status : 502);
  }
  return response.json() as Promise<Record<string, unknown>>;
}

export async function countTutorPrompt(session: TutorSession, batch: number, prior: TutorExample[]) {
  const prompt = promptFor(session, batch, prior);
  const content = { parts: [{ text: prompt }] };
  let model = MODEL;
  let counted: Record<string, unknown>;
  try {
    counted = await postGemini('countTokens', { contents: [content] }, model);
  } catch (error) {
    if (!(error instanceof GeminiTutorError) || (error.status !== 503 && error.status !== 504) || MODEL === FALLBACK_MODEL) throw error;
    model = FALLBACK_MODEL;
    counted = await postGemini('countTokens', { contents: [content] }, model);
  }
  const inputTokens = Number(counted.totalTokens);
  if (!Number.isInteger(inputTokens) || inputTokens < 0 || inputTokens > 6000) {
    throw new GeminiTutorError('This lesson is too large to process. Please shorten the input.', 413);
  }
  return { prompt, inputTokens, model };
}

export async function generateTutorLesson(session: TutorSession, prior: TutorExample[], prepared: { prompt: string; inputTokens: number; model: string }): Promise<GeneratedLesson> {
  const content = { parts: [{ text: prepared.prompt }] };
  const makeRequest = (model: string, timeoutMs: number) => postGemini('generateContent', {
    contents: [content],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schemaFor(session),
      maxOutputTokens: 2500,
      ...thinkingConfigFor(model),
    },
  }, model, 1, timeoutMs);
  let response: Record<string, unknown>;
  const hasFallback = prepared.model !== FALLBACK_MODEL;
  const primaryTimeout = hasFallback ? 25_000 : 45_000;
  const fallbackTimeout = 25_000;
  try {
    response = await makeRequest(prepared.model, primaryTimeout);
  } catch (error) {
    if (!(error instanceof GeminiTutorError) || (error.status !== 503 && error.status !== 504) || !hasFallback) throw error;
    console.warn(`[Gemini Tutor] Primary model ${prepared.model} failed (${error.status}), falling back to ${FALLBACK_MODEL}`);
    response = await makeRequest(FALLBACK_MODEL, fallbackTimeout);
  }
  const usage = readObject(response.usageMetadata);
  const actualInput = Number(usage.promptTokenCount);
  const actualOutput = Number(usage.candidatesTokenCount) + Number(usage.thoughtsTokenCount || 0);
  if (!Number.isInteger(actualInput) || !Number.isInteger(actualOutput) || actualInput < 0 || actualOutput < 0) {
    throw new GeminiTutorError('The tutor did not return token usage data. Please try again.');
  }

  try {
    const candidates = response.candidates;
    const candidate = Array.isArray(candidates) ? readObject(candidates[0]) : null;
    const candidateContent = candidate ? readObject(candidate.content) : null;
    const parts = candidateContent?.parts;
    const textPart = Array.isArray(parts) ? readObject(parts[0]).text : null;
    if (typeof textPart !== 'string') throw new GeminiTutorError('The tutor returned an empty response. Please try again.');
    const parsed = readObject(JSON.parse(textPart));
    const examples = validateExamples(parsed.examples, prior);
    let expressionLesson: ExpressionLesson | null = null;
    if (session.kind === 'expression') {
      expressionLesson = {
        meaningMalayalam: requiredText(parsed, 'meaningMalayalam', 500),
        category: requiredText(parsed, 'category', 120),
        usageMalayalam: requiredText(parsed, 'usageMalayalam', 1000),
      };
    }
    return { examples, expressionLesson, inputTokens: actualInput, outputTokens: actualOutput };
  } catch (error) {
    if (error instanceof GeminiTutorError) {
      throw new GeminiTutorError(error.message, error.status, actualInput, actualOutput);
    }
    throw new GeminiTutorError('The tutor returned invalid JSON. Please try again.', 502, actualInput, actualOutput);
  }
}
export function isMalayalam(text: string): boolean {
  return /[\u0D00-\u0D7F]/.test(text);
}

export function hasEnglishLetters(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

export function formatSentenceTitle(original: string, corrected?: string | null): string {
  const cleanOriginal = original.trim();
  const cleanCorrected = corrected?.trim();
  if (!cleanCorrected) return cleanOriginal;

  const canonicalOrig = cleanOriginal.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const canonicalCorr = cleanCorrected.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  if (canonicalOrig === canonicalCorr) return cleanOriginal;

  const combined = `${cleanOriginal} / ${cleanCorrected}`;
  if (combined.length <= 180) {
    return combined;
  }
  return cleanOriginal;
}

export async function detectSentenceCorrection(input: string): Promise<{ hasMistake: boolean; corrected: string | null } | null> {
  const trimmed = input.trim();
  if (!trimmed || isMalayalam(trimmed) || !hasEnglishLetters(trimmed)) {
    return null;
  }

  const prompt = [
    'You are an expert English grammar assistant.',
    `Analyze this English sentence provided by a learner: "${trimmed}"`,
    'Determine if the sentence contains any grammatical errors, wrong pronouns, subject-verb agreement problems, incorrect tense/aspect, awkward phrasing, or spelling mistakes.',
    'If the sentence contains any mistakes or needs correction:',
    '- Set "hasMistake": true',
    '- Set "corrected": the accurate, grammatically correct and natural English version (keep the same meaning and intended tone).',
    'If the sentence is already grammatically correct and natural English:',
    '- Set "hasMistake": false',
    '- Set "corrected": ""',
    'Return only the required JSON object.',
  ].join('\n');

  try {
    const response = await postGemini('generateContent', {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            hasMistake: { type: 'BOOLEAN' },
            corrected: { type: 'STRING' },
          },
          required: ['hasMistake'],
        },
        maxOutputTokens: 250,
        ...thinkingConfigFor(MODEL),
      },
    }, MODEL, 1, 6000);

    const candidates = response?.candidates;
    const candidate = Array.isArray(candidates) ? candidates[0] : null;
    const candidateContent = candidate ? (candidate as Record<string, unknown>).content : null;
    const parts = candidateContent ? (candidateContent as Record<string, unknown>).parts : null;
    const textPart = Array.isArray(parts) ? (parts[0] as Record<string, unknown>)?.text : null;
    if (typeof textPart !== 'string') return null;

    const parsed = JSON.parse(textPart) as { hasMistake?: boolean; corrected?: string | null };
    const hasMistake = Boolean(parsed.hasMistake);
    const corrected = typeof parsed.corrected === 'string' ? parsed.corrected.trim() : null;

    if (!hasMistake || !corrected) {
      return { hasMistake: false, corrected: null };
    }

    const canonicalOriginal = trimmed.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const canonicalCorrected = corrected.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

    if (canonicalOriginal === canonicalCorrected) {
      return { hasMistake: false, corrected: null };
    }

    return { hasMistake: true, corrected };
  } catch (error) {
    console.warn('[Gemini Tutor] detectSentenceCorrection failed or timed out:', error);
    return null;
  }
}
