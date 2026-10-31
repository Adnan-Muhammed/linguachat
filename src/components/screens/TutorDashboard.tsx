'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import type { TutorModule } from '../tutor/types';
import { TUTOR_MODULES } from '../tutor/tutorModules';
import TutorExperience from '../tutor/TutorExperience';

export default function TutorDashboard() {
  const { toggleTheme } = useApp();
  const [module, setModule] = useState<TutorModule | null>(null);
  if (module) return <TutorExperience module={module} onBack={() => setModule(null)} />;

  return <main className="tutor-screen tutor-redesign">
    <header className="tutor-header"><div className="tutor-header-main"><h1>AI English Tutor</h1><p className="tutor-subtitle">Build your English, one pattern at a time.</p></div>
      <button className="iconbtn tutor-theme" onClick={toggleTheme} aria-label="Toggle theme">◐</button></header>
    <div className="tutor-content">
      <section className="tutor-hero-banner"><div className="tutor-hero-copy"><span className="tutor-hero-kicker">Your guided learning path</span><h2>Learn English step by step</h2><p>Start with a focused lesson. More modules are on the way.</p></div></section>
      <div className="tutor-redesign-grid" aria-label="Learning modules">
        {TUTOR_MODULES.map((item) => <button key={item.id} type="button" className={`tutor-redesign-card ${item.status === 'soon' ? 'is-soon' : ''}`} disabled={item.status === 'soon'} onClick={() => setModule(item)}>
          <span className="tutor-redesign-number">{String(item.number).padStart(2, '0')}</span>
          <span className="tutor-redesign-copy"><strong>{item.title}</strong><span>{item.description}</span></span>
          <span className={`tutor-redesign-status ${item.status}`}>{item.status === 'active' ? `Priority ${item.number}` : 'Coming Soon'}</span>
        </button>)}
      </div>
    </div>
  </main>;
}
