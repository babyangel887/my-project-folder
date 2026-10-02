// Phase 7 — safety gate. Canonical module; imported by src/App.jsx for
// every AI-input path (role-play messages, custom scenarios, real-situation
// guidance, lesson mini-practice).
//
// Design: multi-signal scoring, NOT a single keyword check. A trip to 'high'
// requires either a direct high-severity pattern (self-harm, suicidal intent,
// abuse/violence, immediate danger) or 2+ distinct concerning signals.
// One ambiguous signal alone only yields 'concerning' (supportive note,
// coaching continues). Educational framing ("lesson", "role-play", "example")
// never overrides a direct high-severity statement.

export type SafetyLevel = 'ok' | 'concerning' | 'high';

export interface SafetyAssessment {
  level: SafetyLevel;
  signals: string[];
}

interface Pattern {
  re: RegExp;
  signal: string;
}

// Direct, high-severity statements. Each one alone trips 'high'.
const HIGH_PATTERNS: Pattern[] = [
  { re: /\bkill(ing)?\s+(myself|me)\b/i, signal: 'self-harm: kill self' },
  { re: /\bsuicid\w*\b/i, signal: 'self-harm: suicide' },
  { re: /\bend\s+my\s+life\b/i, signal: 'self-harm: end life' },
  { re: /\btake\s+my\s+own\s+life\b/i, signal: 'self-harm: end life' },
  { re: /\bcutting\s+myself\b/i, signal: 'self-harm: cutting' },
  { re: /\bself[\s-]?harm\b/i, signal: 'self-harm' },
  { re: /\bhurt\s+myself\b/i, signal: 'self-harm' },
  { re: /\bwant\s+to\s+die\b/i, signal: 'self-harm: want to die' },
  { re: /\bdomestic\s+violence\b/i, signal: 'abuse: domestic violence' },
  { re: /\bbeing\s+abused\b/i, signal: 'abuse' },
  { re: /\b(he|she|they)\s+(hits?|beats?|hurts?|hurting)\s+me\b/i, signal: 'abuse: physical' },
  { re: /\babuse[sd]?\s+(me|my\s+(sister|brother|mom|dad|wife|husband|partner|kid|child))\b/i, signal: 'abuse' },
  { re: /\bhe\s+threatened\s+to\s+kill\s+me\b/i, signal: 'danger: death threat' },
  { re: /\bgun\s+to\s+my\s+head\b/i, signal: 'danger: weapon' },
  { re: /\bi\s+am\s+in\s+immediate\s+danger\b/i, signal: 'danger: immediate' },
  { re: /\bholding\s+me\s+against\s+my\s+will\b/i, signal: 'danger: confinement' }
];

// Weaker signals. One alone -> 'concerning'. Two or more distinct -> 'high'.
const CONCERN_PATTERNS: Pattern[] = [
  { re: /\bthreat\w*\b/i, signal: 'threat' },
  { re: /\bunsafe\b/i, signal: 'unsafe' },
  { re: /\bscared\s+(to\s+go\s+home|of\s+(him|her|them))\b/i, signal: 'fear' },
  { re: /\bknife\b/i, signal: 'weapon: knife' },
  { re: /\bgun\b/i, signal: 'weapon: gun' },
  { re: /\bhit\s+me\b/i, signal: 'violence' },
  { re: /\bhurting\s+me\b/i, signal: 'harm' },
  { re: /\bstalking\b/i, signal: 'stalking' },
  { re: /\bcan'?t\s+leave\b/i, signal: 'confinement?' },
  { re: /\bself\s*harm\b/i, signal: 'self-harm?' }
];

export function assessSafety(text: string): SafetyAssessment {
  const input = text || '';
  const high: string[] = [];
  for (const p of HIGH_PATTERNS) {
    if (p.re.test(input) && !high.includes(p.signal)) high.push(p.signal);
  }
  if (high.length > 0) return { level: 'high', signals: high };

  const concern: string[] = [];
  for (const p of CONCERN_PATTERNS) {
    if (p.re.test(input) && !concern.includes(p.signal)) concern.push(p.signal);
  }
  if (concern.length >= 2) return { level: 'high', signals: concern };
  if (concern.length === 1) return { level: 'concerning', signals: concern };
  return { level: 'ok', signals: [] };
}

export const SAFETY_MESSAGE =
  "This sounds really serious, and I want to make sure you get the right kind of help. You don't have to face this alone.";

// Generic examples — localize per launch market. Not a substitute for
// jurisdiction-specific crisis resources.
export interface SupportResource {
  label: string;
  detail: string;
}

export const SUPPORT_RESOURCES: SupportResource[] = [
  { label: 'Emergency', detail: 'Call your local emergency number (e.g. 911 in the US) if anyone is in immediate danger.' },
  { label: 'Crisis hotline', detail: 'US: call or text 988 (Suicide and Crisis Lifeline).' },
  { label: 'Crisis text line', detail: 'US: text HOME to 741741.' },
  { label: 'Trusted person', detail: 'Consider reaching out to someone you trust right now.' }
];

export interface SafetyTestCase {
  input: string;
  expect: SafetyLevel;
  note: string;
}

// Suite: dangerous inputs must redirect; ordinary conflicts must not.
export const SAFETY_TESTS: SafetyTestCase[] = [
  { input: 'My teammate keeps interrupting me in meetings.', expect: 'ok', note: 'ordinary workplace conflict' },
  { input: 'My roommate left dishes in the sink again.', expect: 'ok', note: 'ordinary roommate friction' },
  { input: 'We disagree about the project deadline.', expect: 'ok', note: 'ordinary disagreement' },
  { input: 'He abused the refund policy to get credit.', expect: 'ok', note: 'non-personal use of abused' },
  { input: 'I want to kill myself.', expect: 'high', note: 'direct suicidal statement' },
  { input: 'I have been thinking about suicide lately.', expect: 'high', note: 'suicidal ideation' },
  { input: 'I keep cutting myself when I am upset.', expect: 'high', note: 'self-harm' },
  { input: 'My partner is being abused? No — my partner hits me.', expect: 'high', note: 'physical abuse' },
  { input: 'There is domestic violence at home.', expect: 'high', note: 'domestic violence' },
  { input: 'He threatened to kill me.', expect: 'high', note: 'death threat' },
  { input: 'He threatened me with a knife.', expect: 'high', note: 'threat + weapon combo' },
  { input: 'I feel unsafe at home.', expect: 'concerning', note: 'single vague signal only' },
  { input: 'Give me an example lesson about de-escalation.', expect: 'ok', note: 'educational framing' }
];

export function runSafetyTests(): { passed: number; failed: number; failures: string[] } {
  const failures: string[] = [];
  for (const t of SAFETY_TESTS) {
    const got = assessSafety(t.input).level;
    if (got !== t.expect) failures.push(`"${t.input}" (${t.note}): expected ${t.expect}, got ${got}`);
  }
  return { passed: SAFETY_TESTS.length - failures.length, failed: failures.length, failures };
}
