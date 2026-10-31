import type { TutorModule } from './types';

const definitions = [
  ['sentence-pattern-explorer', 'Sentence Pattern Explorer', 'Explore one base sentence through useful structures, transformations and meanings.', 'active'],
  ['grammar-patterns-expressions', 'Grammar Patterns & Expressions', 'Learn practical expressions, conjunctions, comparisons and sentence patterns.', 'active'],
  ['grammar-structure-analysis', 'Grammar Structure Analysis', 'Understand how sentences are built, one part at a time.', 'soon'],
  ['verb-forms-tenses', 'Verb Forms & Tenses', 'Use verb forms and tenses with confidence.', 'soon'],
  ['modal-verbs-functional-english', 'Modal Verbs & Functional English', 'Express ability, advice, requests and possibility.', 'soon'],
  ['malayalam-natural-english', 'Malayalam to Natural English', 'Turn Malayalam thoughts into natural English.', 'soon'],
  ['smart-sentence-correction', 'Smart Sentence Correction', 'Find common errors and learn how to fix them.', 'soon'],
  ['natural-english-rephrasing', 'Natural English & Rephrasing', 'Express the same idea in a more natural way.', 'soon'],
  ['vocabulary-daily-phrases', 'Vocabulary & Daily Phrases', 'Build useful vocabulary for everyday situations.', 'soon'],
  ['think-in-english', 'Think in English', 'Practice forming thoughts directly in English.', 'soon'],
  ['daily-conversation-practice', 'Daily Conversation Practice', 'Build confidence through everyday conversations.', 'soon'],
  ['real-life-roleplay', 'Real-Life Roleplay', 'Practice English for common real-world situations.', 'soon'],
  ['listening-understanding', 'Listening & Understanding', 'Improve listening skills and understand spoken English.', 'soon'],
  ['speaking-pronunciation', 'Speaking & Pronunciation', 'Practice clear pronunciation and fluent speech.', 'soon'],
  ['writing-reading-practice', 'Writing & Reading Practice', 'Strengthen your English reading and writing skills.', 'soon'],
  ['revision-challenges-progress', 'Revision, Challenges & Progress', 'Review what you have learned and track your progress.', 'soon'],
] as const;

export const TUTOR_MODULES: TutorModule[] = definitions.map(([id, title, description, status], index) => ({
  id, number: index + 1, title, description,
  category: 'Grammar & Structure', level: status === 'active' ? `Priority ${index + 1}` : 'Coming Soon',
  estimatedTime: '', keyTopics: [], features: [], status: status === 'active' ? 'active' : 'soon',
}));
