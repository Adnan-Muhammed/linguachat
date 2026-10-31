export type ModuleCategory =
  | 'All'
  | 'Grammar & Structure'
  | 'Speaking & Fluency'
  | 'Core Skills'
  | 'Practice & Games';

export interface TutorModule {
  id: string;
  number: number;
  title: string;
  description: string;
  category: ModuleCategory;
  level: string;
  estimatedTime: string;
  keyTopics: string[];
  features: string[];
  status: 'active' | 'soon';
}

