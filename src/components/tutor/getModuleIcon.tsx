import type { ReactNode } from 'react';
import { TutorIcons } from './TutorIcons';

export function getModuleIcon(id: string): ReactNode {
  switch (id) {
    case 'vocabulary-daily-phrases':
      return TutorIcons.vocabulary;
    case 'verb-forms-tenses':
      return TutorIcons.verbs;
    case 'sentence-formation':
      return TutorIcons.formation;
    case 'sentence-transformation':
      return TutorIcons.transformation;
    case 'gerunds-infinitives':
      return TutorIcons.gerunds;
    case 'modal-verbs-functional-english':
      return TutorIcons.modal;
    case 'smart-sentence-correction':
      return TutorIcons.correction;
    case 'natural-english-rephrasing':
      return TutorIcons.rephrase;
    case 'think-in-english':
      return TutorIcons.thinking;
    case 'daily-conversation-practice':
      return TutorIcons.conversation;
    case 'real-life-roleplay':
      return TutorIcons.roleplay;
    case 'question-answer-practice':
      return TutorIcons.qa;
    case 'listening-understanding':
      return TutorIcons.listening;
    case 'speaking-pronunciation':
      return TutorIcons.speaking;
    case 'writing-practice':
      return TutorIcons.writing;
    case 'reading-comprehension':
      return TutorIcons.reading;
    case 'daily-challenges-games':
      return TutorIcons.challenges;
    case 'revision-learning-progress':
      return TutorIcons.progress;
    default:
      return TutorIcons.sparkles;
  }
}

