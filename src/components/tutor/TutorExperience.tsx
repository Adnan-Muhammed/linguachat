'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { TutorModule } from './types';
import {
  EXPRESSION_MODULE_ID,
  MAX_SENTENCE_BATCHES,
  SUPPORTED_EXPRESSIONS,
  type TutorExample,
  type TutorSession,
} from '@/lib/tutor/types';

type SessionWithExamples = TutorSession & { examples: TutorExample[] };
type Usage = { inputTokens: number; outputTokens: number; reservedTokens?: number; dailyLimit: number; usageDate: string };

export function SessionTitle({ title }: { title: string }) {
  const match = title.match(/^(.+?)\s+\/\s+(.+)$/);
  if (match) {
    const mistake = match[1].trim();
    const corrected = match[2].trim();
    return (
      <span className="tutor-title-combo">
        <span className="tutor-title-mistake" title="Original mistake">
          {mistake}
        </span>
        <span className="tutor-title-sep" aria-hidden="true"> / </span>
        <span className="tutor-title-corrected" title="Corrected sentence">
          {corrected}
        </span>
      </span>
    );
  }
  return <span className="tutor-title-plain">{title}</span>;
}

async function readApi<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'The tutor request failed. Please try again.');
  return body as T;
}

export default function TutorExperience({ module, onBack, sessionId, onBackSessions, onOpenSession, onSwitchSession }: {
  module: TutorModule;
  onBack: () => void;
  sessionId: string | null;
  onBackSessions: () => void;
  onOpenSession: (id: string) => void;
  onSwitchSession: (id: string) => void;
}) {
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [activeSession, setActiveSession] = useState<SessionWithExamples | null>(null);
  const [selectedBatch, setSelectedBatch] = useState(1);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonDraft, setLessonDraft] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadedModuleId, setLoadedModuleId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const autoGenerateFor = useRef<string | null>(null);
  const generationInProgress = useRef(false);
  const creationInProgress = useRef(false);

  const expressionMode = module.id === EXPRESSION_MODULE_ID;
  const visibleSessions = loadedModuleId === module.id ? sessions : [];
  const sessionsAreLoading = loadingSessions || loadedModuleId !== module.id;
  const displayedSession = activeSession?.id === sessionId ? activeSession : null;
  const sessionIsLoading = loadingSession || Boolean(sessionId && !displayedSession);
  const currentExamples = useMemo(
    () => displayedSession?.examples.filter((example) => example.batch_number === selectedBatch) ?? [],
    [displayedSession, selectedBatch],
  );
  const availableBatches = displayedSession?.examples.reduce((max, example) => Math.max(max, example.batch_number ?? 1), 0) ?? 0;

  useEffect(() => {
    let ignore = false;
    fetch(`/api/tutor/sessions?module=${encodeURIComponent(module.id)}`, { cache: 'no-store' })
      .then((response) => readApi<{ sessions: TutorSession[] }>(response))
      .then((result) => { if (!ignore) { setSessions(result.sessions); setLoadedModuleId(module.id); } })
      .catch((error: unknown) => { if (!ignore) { setNotice(error instanceof Error ? error.message : 'Could not load sessions.'); setLoadedModuleId(module.id); } })
      .finally(() => { if (!ignore) setLoadingSessions(false); });
    fetch('/api/tutor/usage', { cache: 'no-store' })
      .then((response) => readApi<{ usage: Usage }>(response))
      .then((result) => { if (!ignore) setUsage(result.usage); })
      .catch(() => undefined);
    return () => { ignore = true; };
  }, [module.id]);

  const generateBatch = async (id: string) => {
    if (generationInProgress.current) return false;
    generationInProgress.current = true;
    setGenerating(true);
    setNotice('');
    try {
      const result = await readApi<{
        batch: number;
        sessionTitle?: string;
        examples: TutorExample[];
        expressionLesson: { meaningMalayalam: string; category: string; usageMalayalam: string } | null;
        usage: Usage;
      }>(await fetch('/api/tutor/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
      }));
      setActiveSession((current) => {
        if (!current || current.id !== id) return current;
        const existing = new Set(current.examples.map((item) => item.fingerprint));
        return {
          ...current,
          title: result.sessionTitle ?? current.title,
          examples: [...current.examples, ...result.examples.filter((item) => !existing.has(item.fingerprint))],
          expression_meaning: result.expressionLesson?.meaningMalayalam ?? current.expression_meaning,
          expression_category: result.expressionLesson?.category ?? current.expression_category,
          expression_usage: result.expressionLesson?.usageMalayalam ?? current.expression_usage,
        };
      });
      setSelectedBatch(result.batch);
      setUsage(result.usage);
      setSessions((current) => current.map((item) => item.id === id ? {
        ...item,
        title: result.sessionTitle ?? item.title,
        expression_meaning: result.expressionLesson?.meaningMalayalam ?? item.expression_meaning,
        expression_category: result.expressionLesson?.category ?? item.expression_category,
        expression_usage: result.expressionLesson?.usageMalayalam ?? item.expression_usage,
      } : item));
      return true;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'The tutor could not generate this batch.');
      return false;
    } finally {
      generationInProgress.current = false;
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setActiveSession(null);
      return;
    }
    let ignore = false;
    setLoadingSession(true);
    fetch(`/api/tutor/sessions/${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
      .then((response) => readApi<{ session?: TutorSession; examples: TutorExample[] } & TutorSession>(response))
      .then(async (result) => {
        if (ignore) return;
        setNotice('');
        const rawSession = (result && result.session ? result.session : result) as TutorSession;
        const sessionWithExamples: SessionWithExamples = {
          ...rawSession,
          examples: result.examples ?? [],
        };
        setActiveSession(sessionWithExamples);
        const maxBatch = sessionWithExamples.examples.reduce((max, example) => Math.max(max, example.batch_number ?? 1), 0);
        setSelectedBatch(Math.max(1, maxBatch));
        if (!maxBatch && autoGenerateFor.current !== sessionId) {
          autoGenerateFor.current = sessionId;
          await generateBatch(sessionId);
        }
      })
      .catch((error: unknown) => { if (!ignore) setNotice(error instanceof Error ? error.message : 'Could not load the lesson.'); })
      .finally(() => { if (!ignore) setLoadingSession(false); });
    return () => { ignore = true; };
  }, [sessionId]);

  const createSession = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = lessonDraft.trim();
    if (!input || creating || creationInProgress.current) return;
    creationInProgress.current = true;
    setCreating(true);
    setNotice('');
    try {
      const result = await readApi<{ session: TutorSession }>(await fetch('/api/tutor/sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ moduleId: module.id, input }),
      }));
      setSessions((current) => [result.session, ...current]);
      setLessonDraft('');
      setShowLessonForm(false);
      setMenuOpen(false);
      onOpenSession(result.session.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not create the lesson.');
    } finally {
      creationInProgress.current = false;
      setCreating(false);
    }
  };

  const startNewSession = () => {
    setShowLessonForm(true);
    setMenuOpen(false);
    if (sessionId) onBackSessions();
  };

  const handleNext = async () => {
    if (selectedBatch < availableBatches) {
      setSelectedBatch((batch) => batch + 1);
      return;
    }
    if (!expressionMode && availableBatches < MAX_SENTENCE_BATCHES && displayedSession) {
      await generateBatch(displayedSession.id);
    }
  };

  const usageTotal = (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0) + (usage?.reservedTokens ?? 0);
  const hasNext = selectedBatch < availableBatches || (!expressionMode && availableBatches < MAX_SENTENCE_BATCHES);

  return <main className="tutor-screen tutor-redesign tutor-inner-open">
    <header className="tutor-header tutor-header-detail">
      <button className="tutor-menu-button" aria-label="Open session history" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button>
      <div className="tutor-header-main"><span className="tutor-hero-kicker">Module {String(module.number).padStart(2, '0')}</span><h1>{module.title}</h1></div>
      {sessionId && <button className="tutor-new-chat" onClick={startNewSession}>＋<span>New session</span></button>}
    </header>

    {menuOpen && <><button className="tutor-drawer-backdrop" aria-label="Close session menu" onClick={() => setMenuOpen(false)} />
      <aside className="tutor-session-drawer">
        <div className="tutor-drawer-title"><strong>{module.title}</strong><button onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button></div>
        <button className="tutor-drawer-new" onClick={startNewSession}>＋ New session</button>
        <div className="tutor-drawer-list">
          {visibleSessions.map((item) => <button key={item.id} className={`tutor-drawer-item ${item.id === sessionId ? 'selected' : ''}`} onClick={() => { setMenuOpen(false); setShowLessonForm(false); onSwitchSession(item.id); }}>
            <SessionTitle title={item.title} />
            <small>{item.kind === 'expression' ? 'Expression lesson' : 'Sentence transformation'}</small>
          </button>)}
          {!visibleSessions.length && !sessionsAreLoading && <small>No saved sessions yet.</small>}
          {sessionsAreLoading && <small>Loading sessions…</small>}
        </div>
        <button className="tutor-drawer-back" onClick={onBack}>← Back to AI Tutor</button>
      </aside>
    </>}

    <div className="tutor-content">
      {!sessionId ? <>
        <section className="tutor-module-intro sentence-mode">
          <p>{module.description}</p>
          {showLessonForm ? <form className="tutor-sentence-form" onSubmit={createSession}>
            <label htmlFor="new-learning-item">{expressionMode ? 'Choose an expression' : 'Enter a Malayalam or English sentence'}</label>
            {expressionMode && <div className="tutor-expression-options" aria-label="Supported expressions">
              {SUPPORTED_EXPRESSIONS.map((expression) => <button key={expression} type="button" className="tutor-secondary-btn" onClick={() => setLessonDraft(expression)}>{expression}</button>)}
            </div>}
            <textarea id="new-learning-item" autoFocus maxLength={180} value={lessonDraft} onChange={(event) => setLessonDraft(event.target.value)} placeholder={expressionMode ? 'Choose an expression above' : 'For example: I went to London. / ഞാൻ ലണ്ടനിലേക്ക് പോയി.'} required />
            <div className="tutor-form-actions">
              <button className="tutor-secondary-btn" type="button" onClick={() => { setShowLessonForm(false); setLessonDraft(''); }}>Cancel</button>
              <button className="tutor-primary-btn" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Start lesson →'}</button>
            </div>
          </form> : <button className="tutor-primary-btn" onClick={() => setShowLessonForm(true)}>＋ New Learning Session</button>}
        </section>
        {notice && <p className="tutor-demo-notice" role="status">{notice}</p>}
        {visibleSessions.length > 0 && <section className="tutor-saved-sessions">
          <h2>Recent sessions</h2>
          {visibleSessions.map((item) => <button key={item.id} type="button" className="tutor-drawer-item" onClick={() => onOpenSession(item.id)}>
            <SessionTitle title={item.title} />
            <small>{item.kind === 'expression' ? 'Expression lesson' : 'Sentence transformation'}</small>
          </button>)}
        </section>}
      </> : <>
          <div className="tutor-chat-top"><div><span className="tutor-session-kicker">Learning session</span><h2>{displayedSession ? <SessionTitle title={displayedSession.title} /> : 'Loading lesson…'}</h2></div>
            {displayedSession && <div className="tutor-progress-label">{expressionMode ? 'Expression lesson' : `Batch ${selectedBatch} of ${MAX_SENTENCE_BATCHES}`}</div>}
          </div>
          <div className="tutor-chat-message">
            <div className="tutor-message-label">Tutor · Gemini lesson</div>
            {displayedSession && (expressionMode ? <>
              <h3>Expression: {displayedSession.expression}</h3>
              <p><b>Meaning:</b> {displayedSession.expression_meaning || 'Generating lesson…'}</p>
              <p><b>Grammar category:</b> {displayedSession.expression_category || 'Generating lesson…'}</p>
              <p><b>Usage:</b> {displayedSession.expression_usage || 'Generating lesson…'}</p>
            </> : <><h3>Base sentence</h3><p>{displayedSession.base_input}</p><p>Natural English transformations, Malayalam translations, and reusable grammar structures.</p></>)}
            <div className="tutor-example-list">
              {currentExamples.map((example, index) => <article className="tutor-example" key={example.fingerprint ?? `${selectedBatch}-${index}`}>
                <div className="tutor-example-number">{(selectedBatch - 1) * 5 + index + 1}</div>
                <div><h4>{example.english}</h4>{selectedBatch === 1 && index === 0 && !expressionMode && <small>Natural English / corrected sentence</small>}<p><b>Malayalam</b><span>{example.malayalam}</span></p><p><b>Structure</b><span>{example.structure}</span></p></div>
              </article>)}
            </div>
            {(sessionIsLoading || generating) && <p className="tutor-demo-notice" role="status">{generating ? 'Preparing five new examples…' : 'Loading saved lesson…'}</p>}
            {!sessionIsLoading && !generating && displayedSession && !displayedSession.examples.length && <p className="tutor-demo-notice">No examples were saved yet. Try generating the lesson again.</p>}
            {notice && <p className="tutor-demo-notice" role="alert">{notice}</p>}
          </div>
          <div className="tutor-chat-footer">
            {usage && <div className="tutor-progress-row"><span>{usageTotal.toLocaleString()} / {usage.dailyLimit.toLocaleString()} tokens used today (UTC)</span><div className="tutor-progress"><span style={{ width: `${Math.min(100, (usageTotal / usage.dailyLimit) * 100)}%` }} /></div></div>}
            {displayedSession && !currentExamples.length && !sessionIsLoading && !generating && <button className="tutor-primary-btn" onClick={() => generateBatch(displayedSession.id)}>Generate examples →</button>}
            {currentExamples.length > 0 && <>
              <span className="tutor-progress-label">{displayedSession?.kind === 'expression' ? '5 examples' : `${Math.min(selectedBatch * 5, 30)} of 30 examples`}</span>
              {selectedBatch > 1 && <button className="tutor-secondary-btn" onClick={() => setSelectedBatch((batch) => batch - 1)}>← Previous</button>}
              {hasNext && <button className="tutor-primary-btn" onClick={handleNext} disabled={generating}>{generating ? 'Generating…' : 'Continue Learning →'}</button>}
            </>}
          </div>
        </>}
      </div>
  </main>;
}
