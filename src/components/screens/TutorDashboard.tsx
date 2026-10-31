'use client';
import { Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TUTOR_MODULES } from '../tutor/tutorModules';
import TutorExperience from '../tutor/TutorExperience';

export default function TutorDashboard() {
  return <Suspense fallback={<main className="tutor-screen tutor-redesign" />}><TutorDashboardRoute /></Suspense>;
}

function TutorDashboardRoute() {
  const { toggleTheme } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const route = pathname.split('/').filter(Boolean);
  const selectedId = route[0] === 'tutor' ? route[1] : null;
  const sessionId = route[2] === 'chat' ? route[3] ?? null : null;
  const activeModule = TUTOR_MODULES.find((item) => item.id === selectedId) ?? null;
  if (activeModule) return <TutorExperience module={activeModule} onBack={() => router.push('/')} sessionId={sessionId} onBackSessions={() => router.replace(`/tutor/${encodeURIComponent(activeModule.id)}`)} onOpenSession={(id) => router.push(`/tutor/${encodeURIComponent(activeModule.id)}/chat/${encodeURIComponent(id)}`)} onSwitchSession={(id) => router.replace(`/tutor/${encodeURIComponent(activeModule.id)}/chat/${encodeURIComponent(id)}`)} />;

  return <main className="tutor-screen tutor-redesign">
    <header className="tutor-header"><div className="tutor-header-main"><h1>AI English Tutor</h1><p className="tutor-subtitle">Build your English, one pattern at a time.</p></div>
      <button className="iconbtn tutor-theme" onClick={toggleTheme} aria-label="Toggle theme">◐</button></header>
    <div className="tutor-content">
      <section className="tutor-hero-banner"><div className="tutor-hero-copy"><span className="tutor-hero-kicker">Your guided learning path</span><h2>Learn English step by step</h2><p>Start with a focused lesson. More modules are on the way.</p></div></section>
      <div className="tutor-redesign-grid" aria-label="Learning modules">
        {TUTOR_MODULES.map((item) => <button key={item.id} type="button" className={`tutor-redesign-card ${item.status === 'soon' ? 'is-soon' : ''}`} disabled={item.status === 'soon'} onClick={() => router.push(`/tutor/${encodeURIComponent(item.id)}`)}>
          <span className="tutor-redesign-number">{String(item.number).padStart(2, '0')}</span>
          <span className="tutor-redesign-copy"><strong>{item.title}</strong><span>{item.description}</span></span>
          <span className={`tutor-redesign-status ${item.status}`}>{item.status === 'active' ? `Priority ${item.number}` : 'Coming Soon'}</span>
        </button>)}
      </div>
    </div>
  </main>;
}
