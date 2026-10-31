'use client';
import { useState } from 'react';
import type { TutorModule } from './types';

type Example = { english: string; malayalam: string; structure: string };
type LearningSession = { id: string; title: string; completed: number };
type TutorMessage = { id: string; role: 'tutor'; examples: Example[]; batch: number };
const sentenceBatches: Example[][] = [
  [
    { english: 'I went to London.', malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പോയി.', structure: 'Subject + V2 + Preposition + Object of preposition.' },
    { english: "I didn't go to London.", malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പോയില്ല.', structure: 'Subject + did not + V1 + Preposition + Object of preposition.' },
    { english: 'Did I go to London?', malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പോയോ?', structure: 'Did + Subject + V1 + Preposition + Object of preposition?' },
    { english: 'May I go to London?', malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പൊയ്ക്കോട്ടേ?', structure: 'Modal + Subject + V1 + Preposition + Object of preposition?' },
    { english: 'I am going to London.', malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പോകുകയാണ്.', structure: 'Subject + am/is/are + V-ing + Preposition + Object of preposition.' },
  ],
  [
    { english: 'I have gone to London.', malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പോയിട്ടുണ്ട്.', structure: 'Subject + have/has + V3 + Preposition + Object of preposition.' },
    { english: 'I was going to London.', malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പോകുകയായിരുന്നു.', structure: 'Subject + was/were + V-ing + Preposition + Object of preposition.' },
    { english: 'I will go to London.', malayalam: 'ഞാൻ ലണ്ടനിലേക്ക് പോകും.', structure: 'Subject + will + V1 + Preposition + Object of preposition.' },
    { english: 'I have not been to London.', malayalam: 'ഞാൻ ലണ്ടനിൽ പോയിട്ടില്ല.', structure: 'Subject + have/has + not + been + to + place.' },
    { english: 'Why did I go to London?', malayalam: 'ഞാൻ എന്തിനാണ് ലണ്ടനിലേക്ക് പോയത്?', structure: 'Wh-word + did + Subject + V1 + place?' },
  ],
];
const sentenceSessions: Record<string, Example[][]> = {
  london: sentenceBatches,
  student: [[
    { english: 'He is a good student.', malayalam: 'അവൻ നല്ലൊരു വിദ്യാർത്ഥിയാണ്.', structure: 'Subject + be verb + adjective + noun.' },
    { english: 'He is not a good student.', malayalam: 'അവൻ നല്ലൊരു വിദ്യാർത്ഥിയല്ല.', structure: 'Subject + be verb + not + adjective + noun.' },
    { english: 'Is he a good student?', malayalam: 'അവൻ നല്ലൊരു വിദ്യാർത്ഥിയാണോ?', structure: 'Be verb + subject + adjective + noun?' },
    { english: 'Was he a good student?', malayalam: 'അവൻ നല്ലൊരു വിദ്യാർത്ഥിയായിരുന്നോ?', structure: 'Was/were + subject + adjective + noun?' },
    { english: 'He has been a good student.', malayalam: 'അവൻ നല്ലൊരു വിദ്യാർത്ഥിയായിട്ടുണ്ട്.', structure: 'Subject + has/have + been + adjective + noun.' },
  ], [
    { english: 'He will be a good student.', malayalam: 'അവൻ നല്ലൊരു വിദ്യാർത്ഥിയാകും.', structure: 'Subject + will + be + adjective + noun.' },
    { english: 'He can be a good student.', malayalam: 'അവന് നല്ലൊരു വിദ്യാർത്ഥിയാകാൻ കഴിയും.', structure: 'Subject + modal + be + adjective + noun.' },
    { english: 'Why is he a good student?', malayalam: 'എന്തുകൊണ്ടാണ് അവൻ നല്ലൊരു വിദ്യാർത്ഥിയായിരിക്കുന്നത്?', structure: 'Wh-word + be verb + subject + complement?' },
    { english: 'He was becoming a better student.', malayalam: 'അവൻ കൂടുതൽ നല്ല വിദ്യാർത്ഥിയായി മാറിക്കൊണ്ടിരുന്നു.', structure: 'Subject + was/were + becoming + complement.' },
    { english: 'They consider him a good student.', malayalam: 'അവർ അവനെ നല്ലൊരു വിദ്യാർത്ഥിയായി കരുതുന്നു.', structure: 'Subject + verb + object + object complement.' },
  ]],
  learn: [[
    { english: 'I want to learn English.', malayalam: 'എനിക്ക് ഇംഗ്ലീഷ് പഠിക്കണം.', structure: 'Subject + want + to-infinitive + object.' },
    { english: "I don't want to learn English.", malayalam: 'എനിക്ക് ഇംഗ്ലീഷ് പഠിക്കേണ്ട.', structure: 'Subject + do not + want + to-infinitive + object.' },
    { english: 'Do I want to learn English?', malayalam: 'എനിക്ക് ഇംഗ്ലീഷ് പഠിക്കണോ?', structure: 'Do + subject + want + to-infinitive + object?' },
    { english: 'I wanted to learn English.', malayalam: 'എനിക്ക് ഇംഗ്ലീഷ് പഠിക്കണമെന്ന് ആഗ്രഹമുണ്ടായിരുന്നു.', structure: 'Subject + wanted + to-infinitive + object.' },
    { english: 'I am learning English.', malayalam: 'ഞാൻ ഇംഗ്ലീഷ് പഠിക്കുകയാണ്.', structure: 'Subject + am/is/are + V-ing + object.' },
  ], [
    { english: 'I have learned English.', malayalam: 'ഞാൻ ഇംഗ്ലീഷ് പഠിച്ചിട്ടുണ്ട്.', structure: 'Subject + have/has + V3 + object.' },
    { english: 'I will learn English.', malayalam: 'ഞാൻ ഇംഗ്ലീഷ് പഠിക്കും.', structure: 'Subject + will + V1 + object.' },
    { english: 'I can learn English.', malayalam: 'എനിക്ക് ഇംഗ്ലീഷ് പഠിക്കാൻ കഴിയും.', structure: 'Subject + modal + V1 + object.' },
    { english: 'Why do I want to learn English?', malayalam: 'എനിക്ക് എന്തുകൊണ്ടാണ് ഇംഗ്ലീഷ് പഠിക്കണമെന്ന് ആഗ്രഹം?', structure: 'Wh-word + do + subject + want + to-infinitive?' },
    { english: 'I have been learning English.', malayalam: 'ഞാൻ ഇംഗ്ലീഷ് പഠിച്ചുകൊണ്ടിരിക്കുകയാണ്.', structure: 'Subject + have/has + been + V-ing + object.' },
  ]],
};
const grammarContent: Record<string, { meaning: string; category: string; usage: string; batches: Example[][] }> = {
  until: {
    meaning: 'വരെ / അതുവരെ', category: 'Conjunction / preposition', usage: 'Shows that an action or situation continues up to a particular time or point.', batches: [[
      { english: 'I will wait until you come.', malayalam: 'നീ വരുന്നതുവരെ ഞാൻ കാത്തിരിക്കും.', structure: 'Subject + will + V1 + until + subject + present simple.' },
      { english: "Don't leave until I return.", malayalam: 'ഞാൻ തിരിച്ചുവരുന്നതുവരെ പോകല്ലേ.', structure: 'Negative imperative + until + subject + present simple.' },
      { english: 'We worked until midnight.', malayalam: 'ഞങ്ങൾ അർദ്ധരാത്രിവരെ ജോലി ചെയ്തു.', structure: 'Subject + V2 + until + time expression.' },
      { english: 'The shop is open until six.', malayalam: 'കട ആറുമണിവരെ തുറന്നിരിക്കും.', structure: 'Subject + be + adjective + until + time.' },
      { english: 'She stayed until the rain stopped.', malayalam: 'മഴ നിൽക്കുന്നതുവരെ അവൾ അവിടെ നിന്നു.', structure: 'Subject + V2 + until + subject + past simple.' },
    ], [
      { english: 'Keep stirring until the sauce thickens.', malayalam: 'സോസ് കട്ടിയാകുന്നതുവരെ ഇളക്കിക്കൊണ്ടിരിക്കുക.', structure: 'Imperative + until + subject + present simple.' },
      { english: 'He had never travelled until last year.', malayalam: 'കഴിഞ്ഞ വർഷം വരെ അവൻ യാത്ര ചെയ്തിരുന്നില്ല.', structure: 'Subject + had never + V3 + until + time.' },
      { english: 'You cannot enter until the doors open.', malayalam: 'വാതിലുകൾ തുറക്കുന്നതുവരെ നിനക്ക് അകത്തു കടക്കാനാവില്ല.', structure: 'Subject + cannot + V1 + until + clause.' },
      { english: 'I did not know the answer until you explained it.', malayalam: 'നീ വിശദീകരിക്കുന്നതുവരെ എനിക്ക് ഉത്തരം അറിയില്ലായിരുന്നു.', structure: 'Subject + did not + V1 + until + clause.' },
      { english: 'Wait here until the bus arrives.', malayalam: 'ബസ് എത്തുന്നതുവരെ ഇവിടെ കാത്തിരിക്കുക.', structure: 'Imperative + until + subject + present simple.' },
    ]]
  },
  'as soon as': {
    meaning: 'ഉടനെ / ചെയ്ത ഉടൻ', category: 'Subordinating conjunction', usage: 'Connects two events when the second happens immediately after the first.', batches: [[
      { english: 'Call me as soon as you arrive.', malayalam: 'നീ എത്തിയ ഉടൻ എന്നെ വിളിക്കൂ.', structure: 'Imperative + as soon as + subject + present simple.' },
      { english: 'As soon as the bell rang, the students left.', malayalam: 'മണി മുഴങ്ങിയ ഉടൻ വിദ്യാർത്ഥികൾ പോയി.', structure: 'As soon as + subject + V2, subject + V2.' },
      { english: "I'll let you know as soon as I hear anything.", malayalam: 'എന്തെങ്കിലും അറിഞ്ഞ ഉടൻ ഞാൻ നിന്നെ അറിയിക്കും.', structure: 'Subject + will + V1 + as soon as + present simple.' },
      { english: 'She smiled as soon as she saw her friend.', malayalam: 'സുഹൃത്തിനെ കണ്ട ഉടൻ അവൾ പുഞ്ചിരിച്ചു.', structure: 'Subject + V2 + as soon as + subject + V2.' },
      { english: 'As soon as it stops raining, we can go out.', malayalam: 'മഴ നിന്ന ഉടൻ നമുക്ക് പുറത്തുപോകാം.', structure: 'As soon as + present simple, subject + can + V1.' },
    ], [
      { english: 'Please send the file as soon as you finish.', malayalam: 'പൂർത്തിയാക്കിയ ഉടൻ ഫയൽ അയയ്ക്കൂ.', structure: 'Imperative + as soon as + present simple.' },
      { english: 'The baby fell asleep as soon as the car started.', malayalam: 'കാർ തുടങ്ങിയ ഉടൻ കുഞ്ഞ് ഉറങ്ങി.', structure: 'Subject + V2 + as soon as + subject + V2.' },
      { english: 'As soon as we get home, we will eat.', malayalam: 'വീട്ടിലെത്തിയ ഉടൻ ഞങ്ങൾ ഭക്ഷണം കഴിക്കും.', structure: 'As soon as + present simple, subject + will + V1.' },
      { english: 'He apologized as soon as he realized his mistake.', malayalam: 'തന്റെ തെറ്റ് മനസ്സിലാക്കിയ ഉടൻ അവൻ ക്ഷമ ചോദിച്ചു.', structure: 'Subject + V2 + as soon as + subject + V2.' },
      { english: 'I will start as soon as everyone is ready.', malayalam: 'എല്ലാവരും തയ്യാറായ ഉടൻ ഞാൻ തുടങ്ങും.', structure: 'Subject + will + V1 + as soon as + present simple.' },
    ]]
  },
  'neither...nor': {
    meaning: 'ഇതുമില്ല അതുമില്ല / രണ്ടുമല്ല', category: 'Correlative conjunction', usage: 'Joins two negative alternatives. The verb agrees with the nearer subject.', batches: [[
      { english: 'Neither Ravi nor Anu was late.', malayalam: 'രവിയോ അനുവോ വൈകിയില്ല.', structure: 'Neither + singular noun + nor + singular noun + singular verb.' },
      { english: 'She likes neither tea nor coffee.', malayalam: 'അവൾക്ക് ചായയും കാപ്പിയും ഇഷ്ടമല്ല.', structure: 'Subject + verb + neither + noun + nor + noun.' },
      { english: 'Neither the manager nor the employees were available.', malayalam: 'മാനേജരോ ജീവനക്കാരോ ലഭ്യമായിരുന്നില്ല.', structure: 'Neither + singular subject + nor + plural subject + plural verb.' },
      { english: 'He can neither swim nor drive.', malayalam: 'അവന് നീന്താനോ വാഹനമോടിക്കാനോ കഴിയില്ല.', structure: 'Subject + modal + neither + V1 + nor + V1.' },
      { english: 'Neither of the answers is correct.', malayalam: 'ഉത്തരങ്ങളിൽ ഒന്നുപോലും ശരിയല്ല.', structure: 'Neither of + plural noun + singular verb (formal usage).' },
    ], [
      { english: 'Neither my brother nor I am interested in cricket.', malayalam: 'എന്റെ സഹോദരനും എനിക്കും ക്രിക്കറ്റിൽ താൽപര്യമില്ല.', structure: 'Neither + noun + nor + I + am.' },
      { english: 'They neither called nor sent a message.', malayalam: 'അവർ വിളിക്കുകയോ സന്ദേശം അയയ്ക്കുകയോ ചെയ്തില്ല.', structure: 'Subject + neither + V2 + nor + V2.' },
      { english: 'Neither the keys nor the wallet is on the table.', malayalam: 'താക്കോലോ പേഴ്സോ മേശപ്പുറത്തില്ല.', structure: 'Neither + plural noun + nor + singular noun + singular verb.' },
      { english: 'She is neither angry nor upset.', malayalam: 'അവൾക്ക് ദേഷ്യമോ വിഷമമോ ഇല്ല.', structure: 'Subject + be + neither + adjective + nor + adjective.' },
      { english: 'Neither did he complain nor did he leave.', malayalam: 'അവൻ പരാതിപ്പെടുകയോ അവിടെനിന്ന് പോകുകയോ ചെയ്തില്ല.', structure: 'Neither + auxiliary + subject + verb + nor + auxiliary + subject + verb.' },
    ]]
  },
};

function initialSessions(module: TutorModule): LearningSession[] {
  return module.number === 1
    ? [{ id: 'london', title: 'I went to London.', completed: 5 }, { id: 'student', title: 'He is a good student.', completed: 0 }, { id: 'learn', title: 'I want to learn English.', completed: 0 }]
    : [{ id: 'until', title: 'Until', completed: 5 }, { id: 'as-soon-as', title: 'As soon as', completed: 0 }, { id: 'neither-nor', title: 'Neither...nor', completed: 0 }];
}

export default function TutorExperience({ module, onBack, sessionId, onBackSessions, onOpenSession, onSwitchSession }: { module: TutorModule; onBack: () => void; sessionId: string | null; onBackSessions: () => void; onOpenSession: (id: string) => void; onSwitchSession: (id: string) => void }) {
  const [sessions, setSessions] = useState(() => initialSessions(module));
  const [batch, setBatch] = useState(0);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonDraft, setLessonDraft] = useState('');
  const grammar = module.number === 2;
  const session = sessions.find((item) => item.id === sessionId);
  const content = grammar && session ? grammarContent[session.id === 'as-soon-as' ? 'as soon as' : session.id === 'neither-nor' ? 'neither...nor' : session.id === 'until' ? 'until' : ''] ?? null : null;
  const message: TutorMessage | null = session ? { id: `${session.id}-${batch}`, role: 'tutor', batch, examples: grammar ? content?.batches[Math.min(batch, (content?.batches.length ?? 1) - 1)] ?? [] : (sentenceSessions[session.id] ?? sentenceBatches)[Math.min(batch, 1)] } : null;
  const isCustomSession = Boolean(session && session.id.startsWith('custom-'));
  const examples = isCustomSession ? [] : message?.examples ?? [];
  const sessionSentence = session && module.number === 1 ? session.title : '';
  const nextBatch = () => {
    if (batch >= 1) { setNotice('You’ve completed the available demo lessons for this session.'); return; }
    setBatch((value) => value + 1);
    setSessions((list) => list.map((item) => item.id === sessionId ? { ...item, completed: 10 } : item));
    setNotice('');
  };
  const open = (id: string) => {
    setBatch(0);
    setNotice('');
    setMenuOpen(false);
    if (sessionId) onSwitchSession(id);
    else onOpenSession(id);
  };
  const createSession = () => {
    const title = lessonDraft.trim();
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'sentence';
    const id = `custom-${grammar ? 'expression' : 'sentence'}-${slug}-${Date.now().toString(36)}`;
    setSessions((list) => [...list, { id, title, completed: 0 }]);
    setLessonDraft('');
    setShowLessonForm(false);
    setMenuOpen(false);
    setBatch(0);
    onOpenSession(id);
  };
  const startNewChat = () => {
    setShowLessonForm(true);
    setMenuOpen(false);
    if (sessionId) onBackSessions();
  };

  return <main className="tutor-screen tutor-redesign tutor-inner-open">
    <header className="tutor-header tutor-header-detail">


    <button className="tutor-menu-button" aria-label="Open session history" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>☰</button><div className="tutor-header-main"><span className="tutor-hero-kicker">Module {String(module.number).padStart(2, '0')}</span><h1>{module.title}</h1></div>
    {session && 
    <button className="tutor-new-chat" onClick={startNewChat}>＋<span>New chat</span>
    </button>}


    </header>





    {menuOpen && <><button className="tutor-drawer-backdrop" aria-label="Close session menu" onClick={() => setMenuOpen(false)} /><aside className="tutor-session-drawer"><div className="tutor-drawer-title"><strong>{module.title}</strong><button onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button></div><button className="tutor-drawer-new" onClick={startNewChat}>＋ New chat</button><div className="tutor-drawer-list">{sessions.map((item) => <button key={item.id} className={`tutor-drawer-item ${item.id === sessionId ? 'selected' : ''}`} onClick={() => open(item.id)}><span>{item.title}</span><small>{item.completed} patterns completed</small></button>)}</div>{grammar && <button className="tutor-drawer-back" onClick={() => { setMenuOpen(false); onBackSessions(); }}>← Back to sessions</button>}<button className="tutor-drawer-back" onClick={onBack}>← Back to AI Tutor</button></aside></>}
    <div className="tutor-content">
      {!session ? <>
        <section className="tutor-module-intro sentence-mode"><p>{module.description}</p>{showLessonForm ? <form className="tutor-sentence-form" onSubmit={(event) => { event.preventDefault(); createSession(); }}><label htmlFor="new-learning-item">{grammar ? 'Enter a grammar pattern or expression' : 'Enter an English sentence'}</label><textarea id="new-learning-item" autoFocus maxLength={180} value={lessonDraft} onChange={(event) => setLessonDraft(event.target.value)} placeholder={grammar ? 'For example: Although' : 'For example: I went to London.'} required /><div className="tutor-form-actions"><button className="tutor-secondary-btn" type="button" onClick={() => { setShowLessonForm(false); setLessonDraft(''); }}>Cancel</button><button className="tutor-primary-btn" type="submit">Create chat →</button></div></form> : <button className="tutor-primary-btn" onClick={startNewChat}>＋ New Learning Session</button>}</section>
      </> : <>
        <div className="tutor-chat-top"><div><span className="tutor-session-kicker">Learning session</span><h2>{session.title}</h2></div><div className="tutor-progress-label">Batch {batch + 1} of 2</div></div>
        <div className="tutor-chat-message"><div className="tutor-message-label">Tutor · Demo lesson</div>
          {grammar && content ? <><h3>Expression: {session.title.toUpperCase()}</h3><p><b>Meaning:</b> {content.meaning}</p><p><b>Grammar category:</b> {content.category}</p><p><b>Usage:</b> {content.usage}</p></> : grammar ? <><h3>Expression: {session.title}</h3><p>This demo chat has been created for your expression. Learning examples can be added to this session.</p></> : <><h3>Base sentence: {sessionSentence}</h3><p>{isCustomSession ? 'This demo chat has been created for your sentence. Learning examples can be added to this session.' : 'Let’s explore a few useful structures and see how each one changes the meaning.'}</p></>}
          <div className="tutor-example-list">{examples.map((example, index) => <article className="tutor-example" key={`${batch}-${example.english}`}><div className="tutor-example-number">{index + 1}</div><div><h4>{example.english}</h4><p><b>Malayalam</b><span>{example.malayalam}</span></p><p><b>Structure</b><span>{example.structure}</span></p></div></article>)}</div>
        </div>
        <div className="tutor-chat-footer">{!isCustomSession && <><div className="tutor-progress-row"><span>{Math.min((batch + 1) * 5, 10)} of 10 patterns explored</span><div className="tutor-progress"><span style={{ width: `${(batch + 1) * 50}%` }} /></div></div><button className="tutor-primary-btn" onClick={nextBatch}>Continue Learning →</button></>}{notice && <p className="tutor-demo-notice">{notice}</p>}</div>
      </>}
    </div>
  </main>;
}
