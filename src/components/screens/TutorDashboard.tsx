'use client';
import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';

const FEATURES = [
  { title: 'AI Tutor Chat', subtitle: 'Practice English conversation', icon: Icons.tutor, soon: true },
  { title: 'Sentence Structures', subtitle: '“I went to London” · 19 patterns', icon: Icons.structures },
  { title: 'Malayalam → English', subtitle: 'Say it naturally in English', icon: Icons.translate, soon: true },
  { title: 'English → Malayalam', subtitle: 'Meaning and correction', icon: Icons.translate, soon: true },
  { title: 'Sentence Correction', subtitle: 'Fix grammar with explanations', icon: Icons.edit, soon: true },
  { title: 'Phrases & Usage', subtitle: 'Learn how words are used', icon: Icons.message, soon: true },
];

export default function TutorDashboard() {
  const { toggleTheme } = useApp();

  return (
    <div className="tutor-screen">
      <header className="tutor-header">
        <h1>AI Tutor</h1>
        <button className="iconbtn tutor-theme" onClick={toggleTheme} aria-label="Toggle theme">
          {Icons.moon}
        </button>
      </header>
      <div className="tutor-content">
        <section className="tutor-intro">
          <div className="tutor-intro-icon">{Icons.tutor}</div>
          <div>
            <h2>Your AI English Tutor</h2>
            <p>Learn through conversation and structured practice.</p>
          </div>
        </section>
        <div className="tutor-features" aria-label="Tutor features">
          {FEATURES.map((feature) => (
            <div className="tutor-feature" key={feature.title}>
              <div className="tutor-feature-icon">{feature.icon}</div>
              <div className="tutor-feature-copy">
                <h3>{feature.title}</h3>
                <p>{feature.subtitle}</p>
              </div>
              {feature.soon && <span className="tutor-soon">Soon</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
