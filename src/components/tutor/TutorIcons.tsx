import type { ReactNode } from 'react';

const S = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const TutorIcons = {
  // 1. Vocabulary & Daily Phrases
  vocabulary: (
    <S>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M8 7h8M8 11h6M8 15h4" />
    </S>
  ),

  // 2. Verb Forms & Tenses
  verbs: (
    <S>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
      <path d="M12 3V1M12 23v-2M3 12H1M23 12h-2" />
    </S>
  ),

  // 3. Sentence Formation
  formation: (
    <S>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <path d="M10 6.5h4M6.5 10v4M14 17.5h7" />
    </S>
  ),

  // 4. Sentence Transformation
  transformation: (
    <S>
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </S>
  ),

  // 5. Gerunds & Infinitives
  gerunds: (
    <S>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </S>
  ),

  // 6. Modal Verbs & Functional English
  modal: (
    <S>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </S>
  ),

  // 7. Smart Sentence Correction
  correction: (
    <S>
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </S>
  ),

  // 8. Natural English & Rephrasing
  rephrase: (
    <S>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </S>
  ),

  // 9. Think in English
  thinking: (
    <S>
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
      <path d="M9 21h6" />
      <path d="M10 9l2-2 2 2" />
    </S>
  ),

  // 10. Daily Conversation Practice
  conversation: (
    <S>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="8" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
    </S>
  ),

  // 11. Real-Life Roleplay
  roleplay: (
    <S>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </S>
  ),

  // 12. Question & Answer Practice
  qa: (
    <S>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </S>
  ),

  // 13. Listening & Understanding
  listening: (
    <S>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </S>
  ),

  // 14. Speaking & Pronunciation
  speaking: (
    <S>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
      <line x1="8" x2="16" y1="22" y2="22" />
    </S>
  ),

  // 15. Writing Practice
  writing: (
    <S>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </S>
  ),

  // 16. Reading & Comprehension
  reading: (
    <S>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </S>
  ),

  // 17. Daily Challenges & Games
  challenges: (
    <S>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </S>
  ),

  // 18. Revision & Learning Progress
  progress: (
    <S>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
      <circle cx="19" cy="9" r="1.5" />
    </S>
  ),

  // General UI Icons
  sparkles: (
    <S>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
    </S>
  ),
  chevronRight: (
    <S>
      <path d="m9 18 6-6-6-6" />
    </S>
  ),
  arrowLeft: (
    <S>
      <path d="m15 18-6-6 6-6" />
    </S>
  ),
  search: (
    <S>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </S>
  ),
  checkCircle: (
    <S>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </S>
  ),
  clock: (
    <S>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </S>
  ),
  award: (
    <S>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </S>
  ),
  layers: (
    <S>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </S>
  ),
};

