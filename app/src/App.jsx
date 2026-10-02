import { useCallback, useEffect, useState } from 'react';
import { COACH_SYSTEM } from '../ai/prompt.ts';
import { LESSONS, SCENARIOS } from './data.js';
import { LS, bump, buildGuidanceParts, getCompleted, getNum, rpFeedback, rpReply } from './store.js';
import { SAFETY_MESSAGE, SUPPORT_RESOURCES, SAFETY_TESTS, assessSafety, runSafetyTests } from './lib/safety.ts';

function SafetyCard({ onStartOver }) {
  return (
    <div className="safety">
      <p><b>{SAFETY_MESSAGE}</b></p>
      <p><b>Support resources (always visible):</b></p>
      <ul>
        {SUPPORT_RESOURCES.map((r) => (
          <li key={r.label}><b>{r.label}:</b> {r.detail}</li>
        ))}
      </ul>
      <p className="muted">Coaching on this topic is stopped. You can return whenever ready — nothing here will be brought up again.</p>
      <p>
        <button className="btn" onClick={() => { window.location.hash = '#home'; if (onStartOver) onStartOver(); }}>Back to Home</button>{' '}
        <button className="btn secondary" onClick={() => { window.location.hash = '#learn'; if (onStartOver) onStartOver(); }}>Learn instead</button>{' '}
        {onStartOver && <button className="btn secondary" onClick={onStartOver}>Start over</button>}
      </p>
    </div>
  );
}

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#home');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#home');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#\/?/, '') || 'home';
}

function suggestionFor(choice) {
  if (choice === 'learn') return { route: 'learn', label: 'a short lesson on active listening' };
  if (choice === 'practice') return { route: 'practice', label: 'a role-play to practice' };
  return { route: 'reflect', label: 'the guidance tool for your real situation' };
}

export default function App() {
  const raw = useHash();
  const [part, param] = raw.split('/');
  const route = part || 'home';
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  const [rp, setRp] = useState({ id: '', custom: '', msgs: [], ended: false });
  const [rpInput, setRpInput] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [rgInput, setRgInput] = useState(() => localStorage.getItem(LS.rgLast) || '');
  const [rgResult, setRgResult] = useState(() => localStorage.getItem(LS.rgLast) || '');
  const [practiceInput, setPracticeInput] = useState('');
  const [remTime, setRemTime] = useState(() => localStorage.getItem(LS.remTime) || '09:00');
  const [rgSafety, setRgSafety] = useState(null);
  const [pickerSafety, setPickerSafety] = useState(null);
  const [lessonSafety, setLessonSafety] = useState(null);

  const isOnboarded = localStorage.getItem(LS.onboarded) === '1';
  const hasIncomplete = localStorage.getItem(LS.incomplete) === '1';

  const go = (h) => {
    window.location.hash = h;
  };

  // --- onboarding ---
  const choose = (c) => {
    localStorage.setItem(LS.choice, c);
    go('#start');
  };
  const finishOnboarding = () => {
    localStorage.setItem(LS.onboarded, '1');
    localStorage.setItem(LS.safety, '1');
    go('#home');
  };
  const resetDemo = () => {
    [LS.onboarded, LS.choice, LS.safety, LS.incomplete, LS.completed, LS.rpCount, LS.rgCount].forEach((k) =>
      localStorage.removeItem(k)
    );
    go('#welcome');
    rerender();
  };

  // --- lessons ---
  const openLesson = (id) => go('#learn/' + id);
  const revealIdea = (id) => {
    localStorage.setItem(LS.revealedPrefix + id, '1');
    localStorage.setItem(LS.incomplete, '1');
    rerender();
  };
  const completeLesson = (id, practice) => {
    if (practice && practice.trim()) {
      const a = assessSafety(practice);
      if (a.level === 'high') {
        setLessonSafety(a);
        return;
      }
    }
    setLessonSafety(null);
    const c = getCompleted();
    if (!c.includes(id)) c.push(id);
    localStorage.setItem(LS.completed, JSON.stringify(c));
    localStorage.setItem(LS.incomplete, '0');
    localStorage.removeItem(LS.revealedPrefix + id);
    if (practice) localStorage.setItem('coach_practice_' + id, practice);
    go('#learn');
  };

  // --- role-play ---
  const openScenario = (id) => {
    const s = SCENARIOS.find((x) => x.id === id);
    if (!s) return;
    setPickerSafety(null);
    setRp({ id, custom: '', msgs: [{ who: 'them', text: s.opener }], ended: false });
    go('#practice/' + id);
  };
  const startCustom = () => {
    const v = customInput.trim();
    if (!v) return;
    const a = assessSafety(v);
    if (a.level === 'high') {
      setPickerSafety(a);
      return;
    }
    setPickerSafety(null);
    setRp({
      id: 'custom',
      custom: v,
      msgs: [{ who: 'them', text: 'Got it — let us try this out. What would you say first about: ' + v }],
      ended: false
    });
    go('#practice/custom');
  };
  const sendRP = () => {
    const v = rpInput.trim();
    if (!v || rp.ended) return;
    const a = assessSafety(v);
    if (a.level === 'high') {
      setRp((p) => ({ ...p, ended: true, safety: a }));
      setRpInput('');
      return;
    }
    setRp((p) => ({ ...p, msgs: [...p.msgs, { who: 'you', text: v }, { who: 'them', text: rpReply(v) }] }));
    setRpInput('');
  };
  const endRP = () => {
    if (!rp.ended) bump(LS.rpCount);
    setRp((p) => ({ ...p, ended: true }));
  };
  const restartRP = () => {
    if (rp.id === 'custom') {
      go('#practice');
      return;
    }
    const s = SCENARIOS.find((x) => x.id === rp.id);
    if (s) setRp({ id: s.id, custom: '', msgs: [{ who: 'them', text: s.opener }], ended: false });
  };

  // --- reflect ---
  const getGuidance = () => {
    const v = rgInput.trim();
    if (!v) return;
    const a = assessSafety(v);
    if (a.level === 'high') {
      setRgSafety(a);
      setRgResult('');
      return;
    }
    setRgSafety(a.level === 'concerning' ? a : null);
    localStorage.setItem(LS.rgLast, v);
    bump(LS.rgCount);
    setRgResult(v);
  };

  // --- reminders ---
  const remOn = localStorage.getItem(LS.remOn) === '1';

  const nav = [
    ['welcome', 'Welcome'],
    ['home', 'Home'],
    ['learn', 'Learn'],
    ['practice', 'Practice'],
    ['reflect', 'Reflect'],
    ['progress', 'Progress']
  ];

  return (
    <div className="wrap">
      <header>
        <h1>AI Communication Coach</h1>
        <p className="muted">Vite+React (phases 1–6 ported from static app).</p>
        <nav className="tabs">
          {nav.map(([r, label]) => (
            <a key={r} href={'#' + r} data-route={r} className={route === r ? 'active' : ''}>
              {label}
            </a>
          ))}
        </nav>
      </header>
      <main>
        {route === 'welcome' && (
          <div className="card">
            <h2>Welcome</h2>
            <p>This app helps students and early-career pros handle difficult conversations with empathy. Short lessons, role-play practice, and bounded guidance for real situations.</p>
            <button className="btn" onClick={() => go('#checkin')}>Start check-in</button>
          </div>
        )}
        {route === 'checkin' && (
          <div className="card">
            <h2>Quick check-in — why are you here today?</h2>
            <button className="btn" onClick={() => choose('learn')}>I want to learn</button>
            <button className="btn" onClick={() => choose('practice')}>I want to practice</button>
            <button className="btn" onClick={() => choose('situ')}>I have a real situation</button>
            <p className="muted">First-time only. Returning users never see this.</p>
          </div>
        )}
        {route === 'start' && (
          <div className="card">
            <h2>Guided first action</h2>
            <p>Based on your check-in, try {suggestionFor(localStorage.getItem(LS.choice) || 'learn').label}.</p>
            <button className="btn" onClick={() => go('#' + suggestionFor(localStorage.getItem(LS.choice) || 'learn').route)}>Go now</button>{' '}
            <button className="btn secondary" onClick={() => go('#safety')}>Next: safety notice</button>
          </div>
        )}
        {route === 'safety' && (
          <div className="safety">
            <h2>Safety notice (one-time)</h2>
            <p>This app is not a substitute for professional help in emergencies. If there is danger, abuse, self-harm, or a mental-health crisis, contact trusted people or emergency services.</p>
            <button className="btn" onClick={finishOnboarding}>Got it — go to Home</button>
          </div>
        )}
        {route === 'home' && !isOnboarded && (
          <div className="card">
            <h2>Welcome — new here?</h2>
            <p>Take the 30-second guided start, or explore freely.</p>
            <button className="btn" onClick={() => go('#welcome')}>Start guided onboarding</button>
            <p>Or jump in: <a href="#learn">Learn</a> · <a href="#practice">Practice</a> · <a href="#reflect">Reflect</a></p>
          </div>
        )}
        {route === 'home' && isOnboarded && (
          <div className="card">
            <h2>Good to see you again. What would you like to work on today?</h2>
            <p><b>Daily reflection (placeholder):</b> Someone misunderstood what you meant. What could you do before responding?</p>
            {hasIncomplete ? (
              <p><button className="btn" onClick={() => go('#learn')}>Continue lesson</button></p>
            ) : (
              <p className="muted">No incomplete lesson — Continue hidden.</p>
            )}
            <p>Free choice: <a href="#learn">Learn</a> · <a href="#practice">Practice</a> · <a href="#reflect">Reflect</a> · <a href="#progress">Progress</a></p>
            <p className="muted">Demo: incomplete={hasIncomplete ? '1' : '0'}{' '}
              <button className="btn secondary" onClick={() => { localStorage.setItem(LS.incomplete, hasIncomplete ? '0' : '1'); rerender(); }}>Toggle incomplete</button>{' '}
              <button className="btn secondary" onClick={resetDemo}>Reset demo</button>
            </p>
          </div>
        )}
        {route === 'learn' && !param && (
          <div className="card">
            <h2>Learn — short lessons</h2>
            <p>3 seed lessons. Each takes a few minutes. Mini-practice optional.</p>
            {LESSONS.map((L) => (
              <p key={L.id}>
                <button className="btn secondary" onClick={() => openLesson(L.id)}>
                  {L.title}{getCompleted().includes(L.id) ? ' ✓' : ''}
                </button>
              </p>
            ))}
            <p><a href="#home">Back home</a></p>
          </div>
        )}
        {route === 'learn' && param && (
          <div className="card">
            {(() => {
              const L = LESSONS.find((x) => x.id === param);
              if (!L) return <p>Not found. <a href="#learn">All lessons</a></p>;
              const revealed = localStorage.getItem(LS.revealedPrefix + L.id) === '1';
              return (
                <>
                  <h2>{L.title}</h2>
                  <p><b>1. Question:</b> {L.question}</p>
                  {!revealed ? (
                    <>
                      <button className="btn" onClick={() => revealIdea(L.id)}>Yes</button>{' '}
                      <button className="btn secondary" onClick={() => revealIdea(L.id)}>Sometimes</button>
                    </>
                  ) : (
                    <>
                      <p><b>2. Idea:</b> {L.concept}</p>
                      <p><b>3. Explanation:</b> {L.explanation}</p>
                      <p>{L.before}<br />{L.after}</p>
                      <p><b>4. Optional mini-practice:</b> {L.practicePrompt}</p>
                      <p className="muted">{L.practiceOptions.join(' · ')}</p>
                      <p><input value={practiceInput} onChange={(e) => setPracticeInput(e.target.value)} placeholder="Type one sentence (optional)" style={{ width: '100%', padding: 8 }} /></p>
                      <button className="btn" onClick={() => { completeLesson(L.id, ''); setPracticeInput(''); }}>Mark complete (practice optional)</button>{' '}
                      <button className="btn secondary" onClick={() => { completeLesson(L.id, practiceInput); setPracticeInput(''); }}>Save practice + complete</button>
                    </>
                  )}
                  {lessonSafety && lessonSafety.level === 'high' && (
                    <SafetyCard onStartOver={() => setLessonSafety(null)} />
                  )}
                  <p><a href="#learn">All lessons</a></p>
                </>
              );
            })()}
          </div>
        )}
        {route === 'practice' && !param && (
          <div className="card">
            <h2>Practice — pick a scenario (simulated)</h2>
            {SCENARIOS.map((s) => (
              <p key={s.id}><button className="btn secondary" onClick={() => openScenario(s.id)}>{s.title}</button></p>
            ))}
            <p><b>Or describe your own:</b></p>
            <p><input value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="e.g. Roommate left dishes…" style={{ width: '100%', padding: 8 }} /></p>
            <p><button className="btn" onClick={startCustom}>Create scenario</button></p>
            {pickerSafety && pickerSafety.level === 'high' && (
              <SafetyCard onStartOver={() => { setPickerSafety(null); setCustomInput(''); }} />
            )}
          </div>
        )}
        {route === 'practice' && param && (
          <div className="card">
            <h2>{param === 'custom' ? 'Custom: ' + rp.custom : (SCENARIOS.find((x) => x.id === param) || {}).title} (simulated)</h2>
            <p className="muted">Clearly labeled simulation. End/restart anytime.</p>
            {rp.msgs.map((m, i) => (
              <p key={i}><b>{m.who === 'you' ? 'You' : 'Partner'}:</b> {m.text}</p>
            ))}
            {rp.safety && rp.safety.level === 'high' ? (
              <SafetyCard onStartOver={() => { setRp({ id: '', custom: '', msgs: [], ended: false }); setRpInput(''); go('#practice'); }} />
            ) : !rp.ended ? (
              <>
                <p><input value={rpInput} onChange={(e) => setRpInput(e.target.value)} placeholder="Your reply…" style={{ width: '100%', padding: 8 }} /></p>
                <p><button className="btn" onClick={sendRP}>Send</button> <button className="btn secondary" onClick={endRP}>End + feedback</button></p>
              </>
            ) : (
              <div className="card">
                <h3>Feedback (observations, no scores)</h3>
                {rpFeedback(rp.msgs).map((o, i) => <p key={i}>{o}</p>)}
                <p className="muted">Alternatives: ask for clarification · explain impact · state what you need going forward.</p>
                <button className="btn secondary" onClick={restartRP}>Restart</button>{' '}
                <button className="btn secondary" onClick={() => go('#practice')}>Picker</button>
              </div>
            )}
          </div>
        )}
        {route === 'reflect' && (
          <>
            <div className="card">
              <h2>Reflect — real situation guidance</h2>
              <p>Describe a disagreement. No interrogation — you get a 3-part response.</p>
              <p><textarea value={rgInput} onChange={(e) => { setRgInput(e.target.value); if (rgSafety) setRgSafety(null); }} placeholder="e.g. My teammate keeps interrupting me in meetings…" style={{ width: '100%', padding: 8 }} rows={3} /></p>
              <p><button className="btn" onClick={getGuidance}>Get guidance</button></p>
              <p className="muted">Tone scaffold active, {COACH_SYSTEM.length} chars. Safety gate active on every submission.</p>
            </div>
            {rgSafety && rgSafety.level === 'high' ? (
              <SafetyCard onStartOver={() => { setRgSafety(null); setRgInput(''); setRgResult(''); }} />
            ) : (
              <>
                {rgResult && (
                  <div className="card">
                    {(() => {
                      const g = buildGuidanceParts(rgResult);
                      return (
                        <>
                          <p><b>1. Reflect back:</b> {g.reflect}</p>
                          <p><b>2. Options:</b><br />• {g.options[0]}<br />• {g.options[1]}<br />• {g.options[2]}</p>
                          <p className="muted"><b>3. Reminder:</b> {g.reminder}</p>
                        </>
                      );
                    })()}
                  </div>
                )}
                {rgSafety && rgSafety.level === 'concerning' && (
                  <div className="card">
                    <p className="muted">Note: this sounds tough — consider involving someone you trust alongside anything here.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {route === 'progress' && (
          <div className="card">
            <h2>Progress</h2>
            {(() => {
              const lessons = getCompleted().length;
              const rps = getNum(LS.rpCount);
              const rgs = getNum(LS.rgCount);
              const total = lessons + rps + rgs;
              const msg =
                total === 0
                  ? 'Welcome back — every conversation is a chance to practice.'
                  : lessons > 0 && rps === 0 && rgs === 0
                    ? "You practiced staying calm during disagreement today. You're building a nice habit."
                    : "You've explored a few different conversation styles — nice momentum.";
              return (
                <>
                  <p>{msg}</p>
                  <p>Lessons {lessons} · Role-plays {rps} · Reflections {rgs}</p>
                  <p className="muted">No scores, no streaks, missed days never mentioned.</p>
                  <p><b>Reminders (optional):</b> {remOn ? 'on at ' + (localStorage.getItem(LS.remTime) || '09:00') : 'off'}</p>
                  <p>
                    <button className="btn secondary" onClick={() => { localStorage.setItem(LS.remOn, remOn ? '0' : '1'); rerender(); }}>{remOn ? 'Turn off' : 'Turn on'}</button>{' '}
                    <input type="time" value={remTime} onChange={(e) => setRemTime(e.target.value)} />{' '}
                    <button className="btn secondary" onClick={() => { localStorage.setItem(LS.remTime, remTime); rerender(); }}>Save time</button>{' '}
                    <button className="btn secondary" onClick={() => { localStorage.setItem(LS.remOn, '0'); rerender(); }}>Disable</button>
                  </p>
                  <p className="muted">e.g. “Practice a lesson today”. No guilt, fully disableable.</p>
                </>
              );
            })()}
          </div>
        )}
        {route === 'safety-test' && (
          <div className="card">
            <h2>Safety self-test</h2>
            {(() => {
              const r = runSafetyTests();
              return (
                <>
                  <p><b>{r.passed}/{SAFETY_TESTS.length} passed</b>{r.failed > 0 && ` — ${r.failed} failed`}.</p>
                  {r.failures.map((f, i) => <p key={i} style={{ color: '#B3261E' }}>{f}</p>)}
                  <ul>
                    {SAFETY_TESTS.map((t, i) => (
                      <li key={i}><b>{assessSafety(t.input).level}</b> (expect {t.expect}) — {t.note}: “{t.input}”</li>
                    ))}
                  </ul>
                </>
              );
            })()}
          </div>
        )}
      </main>
      <footer className="muted">All AI output goes through <code>ai/prompt.ts</code> tone scaffold + <code>src/lib/safety.ts</code> gate. <a href="#safety-test">Safety self-test</a></footer>
    </div>
  );
}
