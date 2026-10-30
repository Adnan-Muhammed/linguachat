import type { TutorModule } from './types';

export const TUTOR_MODULES: TutorModule[] = [
  {
    id: 'vocabulary-daily-phrases',
    number: 1,
    title: 'Vocabulary & Daily Phrases',
    description: 'Learn useful English words and everyday expressions.',
    category: 'Grammar & Structure',
    level: 'Beginner to Advanced',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'High-frequency daily vocabulary',
      'Common conversational idioms',
      'Contextual phrase matching',
      'Word associations and collocations'
    ],
    features: [
      'Vocabulary flashcards with audio',
      'Real-world sentence examples',
      'Active recall drills'
    ]
  },
  {
    id: 'verb-forms-tenses',
    number: 2,
    title: 'Verb Forms & Tenses',
    description: 'Understand verbs and use different tenses correctly.',
    category: 'Grammar & Structure',
    level: 'All Levels',
    estimatedTime: '20 mins/day',
    keyTopics: [
      'Present, Past & Future Simple',
      'Continuous and Perfect Tenses',
      'Irregular verb mastery',
      'Time markers and conditional contexts'
    ],
    features: [
      'Interactive tense timeline',
      'Verb conjugation coach',
      'Contextual tense-switching practice'
    ]
  },
  {
    id: 'sentence-formation',
    number: 3,
    title: 'Sentence Formation',
    description: 'Learn how to build correct English sentences.',
    category: 'Grammar & Structure',
    level: 'Beginner & Intermediate',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Subject-Verb-Object (SVO) foundations',
      'Compound and complex clauses',
      'Prepositional and adverbial placement',
      'Connecting words and transitions'
    ],
    features: [
      'Drag & arrange sentence builder',
      'Structure visualization maps',
      'Guided pattern repetition'
    ]
  },
  {
    id: 'sentence-transformation',
    number: 4,
    title: 'Sentence Transformation',
    description: 'Express the same idea using different sentence structures.',
    category: 'Grammar & Structure',
    level: 'Intermediate & Advanced',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Active to Passive voice',
      'Direct to Reported speech',
      'Affirmative, negative and interrogative shifts',
      'Emphatic and inverted structures'
    ],
    features: [
      'Reconstruction exercises',
      'Style variety analysis',
      'Formality level adjustments'
    ]
  },
  {
    id: 'gerunds-infinitives',
    number: 5,
    title: 'Gerunds & Infinitives',
    description: 'Understand how to use verb + ing and to + verb.',
    category: 'Grammar & Structure',
    level: 'Intermediate',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Verbs followed strictly by Gerunds',
      'Verbs followed strictly by Infinitives',
      'Meaning changes (Stop doing vs Stop to do)',
      'Prepositions followed by Gerunds'
    ],
    features: [
      'Dual-rule cheat sheet',
      'Decision matrix drills',
      'Common pitfall corrections'
    ]
  },
  {
    id: 'modal-verbs-functional-english',
    number: 6,
    title: 'Modal Verbs & Functional English',
    description: 'Learn can, could, should, must, have to, need to and more.',
    category: 'Grammar & Structure',
    level: 'All Levels',
    estimatedTime: '20 mins/day',
    keyTopics: [
      'Ability & Permission (can, could, may)',
      'Advice & Obligation (should, must, have to)',
      'Deduction & Probability (might, could, must)',
      'Polite requests and offers'
    ],
    features: [
      'Situation-based modal picker',
      'Nuance and tone calibration',
      'Functional dialogue templates'
    ]
  },
  {
    id: 'smart-sentence-correction',
    number: 7,
    title: 'Smart Sentence Correction',
    description: 'Improve your English by identifying and correcting mistakes.',
    category: 'Grammar & Structure',
    level: 'All Levels',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Subject-verb agreement traps',
      'Common article errors (a, an, the)',
      'Preposition mismatches',
      'Spelling and punctuation precision'
    ],
    features: [
      'Instant mistake highlighter',
      'Step-by-step rule breakdowns',
      'Error explanation logs'
    ]
  },
  {
    id: 'natural-english-rephrasing',
    number: 8,
    title: 'Natural English & Rephrasing',
    description: 'Learn to express your thoughts in natural everyday English.',
    category: 'Grammar & Structure',
    level: 'Intermediate & Advanced',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Replacing textbook phrases with native phrasing',
      'Tone adjustments (Casual vs Professional)',
      'Concise vs Elaborate communication',
      'Modern conversational rhythms'
    ],
    features: [
      'Side-by-side phrasing comparison',
      'Polite rephrasing generator',
      'Tone shift selector'
    ]
  },
  {
    id: 'think-in-english',
    number: 9,
    title: 'Think in English',
    description: 'Train your mind to think directly in English without translating.',
    category: 'Speaking & Fluency',
    level: 'All Levels',
    estimatedTime: '10 mins/day',
    keyTopics: [
      'Direct object-to-thought association',
      'Internal monologue practice',
      'Overcoming translation lag',
      'Quick reaction prompts'
    ],
    features: [
      'Rapid-fire image description',
      'Stream-of-consciousness coaching',
      'Mental reaction timer'
    ]
  },
  {
    id: 'daily-conversation-practice',
    number: 10,
    title: 'Daily Conversation Practice',
    description: 'Practice realistic English conversations.',
    category: 'Speaking & Fluency',
    level: 'All Levels',
    estimatedTime: '20 mins/day',
    keyTopics: [
      'Greetings and casual check-ins',
      'Sharing hobbies, routines and plans',
      'Expressing opinions and feelings',
      'Keeping conversations flowing smoothly'
    ],
    features: [
      'Topic card generator',
      'Turn-by-turn dialogue assistant',
      'Conversation starter bank'
    ]
  },
  {
    id: 'real-life-roleplay',
    number: 11,
    title: 'Real-Life Roleplay',
    description: 'Practice interviews, office conversations, shopping, travel and more.',
    category: 'Speaking & Fluency',
    level: 'All Levels',
    estimatedTime: '25 mins/day',
    keyTopics: [
      'Job interview simulations',
      'Workplace meetings and emails',
      'Airport, hotel and travel scenarios',
      'Shopping, dining and customer service'
    ],
    features: [
      'Scenario selector with avatars',
      'Dynamic situational goals',
      'Custom roleplay environments'
    ]
  },
  {
    id: 'question-answer-practice',
    number: 12,
    title: 'Question & Answer Practice',
    description: 'Improve your ability to ask and answer questions.',
    category: 'Speaking & Fluency',
    level: 'All Levels',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Wh- questions vs Yes/No questions',
      'Tag questions and polite inquiries',
      'Providing elaborate, thoughtful answers',
      'Clarification questions when listening'
    ],
    features: [
      'Instant Q&A drills',
      'Question generator prompts',
      'Response depth analyzer'
    ]
  },
  {
    id: 'listening-understanding',
    number: 13,
    title: 'Listening & Understanding',
    description: 'Improve English listening and comprehension skills.',
    category: 'Core Skills',
    level: 'All Levels',
    estimatedTime: '20 mins/day',
    keyTopics: [
      'Accents & connected speech',
      'Key idea and tone extraction',
      'Short dialog comprehension',
      'Contextual clues and inference'
    ],
    features: [
      'Variable speed audio player',
      'Interactive comprehension checks',
      'Audio transcript toggle'
    ]
  },
  {
    id: 'speaking-pronunciation',
    number: 14,
    title: 'Speaking & Pronunciation',
    description: 'Improve pronunciation, speaking confidence and fluency.',
    category: 'Speaking & Fluency',
    level: 'All Levels',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Vowel sounds and diphthongs',
      'Word stress and rhythm',
      'Intonation patterns',
      'Tongue twisters and pacing'
    ],
    features: [
      'Phonetic sound guides',
      'Pronunciation comparison wave',
      'Fluency meter'
    ]
  },
  {
    id: 'writing-practice',
    number: 15,
    title: 'Writing Practice',
    description: 'Practice writing messages, emails and paragraphs.',
    category: 'Core Skills',
    level: 'All Levels',
    estimatedTime: '20 mins/day',
    keyTopics: [
      'Professional email formatting',
      'Short messages and notes',
      'Storytelling and paragraphs',
      'Punctuation and paragraph transitions'
    ],
    features: [
      'Writing prompt library',
      'Drafting workspace with suggestions',
      'Vocabulary enhancement hints'
    ]
  },
  {
    id: 'reading-comprehension',
    number: 16,
    title: 'Reading & Comprehension',
    description: 'Improve reading skills and understand English passages.',
    category: 'Core Skills',
    level: 'All Levels',
    estimatedTime: '20 mins/day',
    keyTopics: [
      'Short stories and cultural articles',
      'Skimming and scanning methods',
      'Vocabulary in context',
      'Main idea vs supporting details'
    ],
    features: [
      'Interactive bilingual reader',
      'Instant word definition lookup',
      'Reading speed tracker'
    ]
  },
  {
    id: 'daily-challenges-games',
    number: 17,
    title: 'Daily Challenges & Games',
    description: 'Learn English through interactive challenges and exercises.',
    category: 'Practice & Games',
    level: 'Fun & Casual',
    estimatedTime: '10 mins/day',
    keyTopics: [
      'Daily 5-minute streak challenges',
      'Word scramble and crossword puzzles',
      'Speed grammar quiz',
      'Idiom matching games'
    ],
    features: [
      'Daily streak tracker',
      'Mini-game badges',
      'Challenge milestone rewards'
    ]
  },
  {
    id: 'revision-learning-progress',
    number: 18,
    title: 'Revision & Learning Progress',
    description: 'Review previously learned topics and view learning progress.',
    category: 'Practice & Games',
    level: 'Personalized',
    estimatedTime: '15 mins/day',
    keyTopics: [
      'Spaced repetition system (SRS)',
      'Personal error notebook',
      'Vocabulary retention cards',
      'Module mastery milestones'
    ],
    features: [
      'Progress analytics dashboard',
      'Mistakes revisit queue',
      'Mastery percentage breakdown'
    ]
  }
];

