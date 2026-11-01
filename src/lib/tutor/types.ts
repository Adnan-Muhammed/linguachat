export const SENTENCE_MODULE_ID = 'sentence-pattern-explorer';
export const EXPRESSION_MODULE_ID = 'grammar-patterns-expressions';
export const DAILY_TOKEN_LIMIT = 20_000;
export const EXAMPLES_PER_BATCH = 5;
export const MAX_SENTENCE_BATCHES = 6;

export const SUPPORTED_EXPRESSIONS = [
  'Until',
  'As soon as',
  'Since',
  'Neither...nor',
  'Either...or',
  'Onwards',
] as const;

export type TutorExample = {
  english: string;
  malayalam: string;
  structure: string;
  fingerprint?: string;
  batch_number?: number;
};

export type ExpressionLesson = {
  meaningMalayalam: string;
  category: string;
  usageMalayalam: string;
};

export type TutorSession = {
  id: string;
  module_id: string;
  kind: 'sentence' | 'expression';
  title: string;
  base_input: string;
  expression: string | null;
  expression_meaning: string | null;
  expression_category: string | null;
  expression_usage: string | null;
  created_at: string;
};
