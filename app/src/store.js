// localStorage keys (same as static app so user data carries over)
export const LS = {
  onboarded: 'coach_onboarded',
  choice: 'coach_checkin_choice',
  safety: 'coach_safety_seen',
  incomplete: 'coach_incomplete_lesson',
  completed: 'coach_completed_lessons',
  revealedPrefix: 'coach_revealed_',
  rpCount: 'coach_roleplays',
  rgCount: 'coach_reflections',
  rgLast: 'coach_reflect_last',
  remOn: 'coach_rem_on',
  remTime: 'coach_rem_time'
};

export function getNum(k) {
  return parseInt(localStorage.getItem(k) || '0', 10) || 0;
}
export function bump(k) {
  localStorage.setItem(k, String(getNum(k) + 1));
}
export function getCompleted() {
  try {
    return JSON.parse(localStorage.getItem(LS.completed) || '[]');
  } catch {
    return [];
  }
}

const DISCLAIMERS = [
  "You know this situation best; take what's useful and leave the rest.",
  'Use what fits — you decide what happens next.',
  'Guidance, not a guarantee — pick what suits you.'
];

export function buildGuidanceParts(text) {
  const short = text.length > 140 ? text.slice(0, 140) + '…' : text;
  const words = text.split(/\s+/).length;
  const hasWho = /coworker|manager|friend|teammate|partner|professor|roommate|team|boss/i.test(text);
  const assume =
    !hasWho || words < 12
      ? " (I'm assuming this is a coworker, not a manager — let me know if that's wrong.)"
      : '';
  return {
    reflect: `It sounds like ${short.charAt(0).toLowerCase() + short.slice(1)}.${assume}`,
    options: [
      'A direct option: "I want to clear this up — can we talk for 5 minutes?"',
      'A softer option: "I might be misreading this — can you help me understand?"',
      'A question-based option: "What did you mean when that happened?"'
    ],
    reminder: DISCLAIMERS[text.length % 3]
  };
}

export function rpReply(userText) {
  if (userText.includes('?'))
    return 'Good question — that keeps it curious. How would you state what you need next?';
  if (/sorry|thanks|understand/i.test(userText))
    return 'That lands with empathy. Can you add one clear request?';
  return 'Thanks for sharing that. What outcome would you like here?';
}

export function rpFeedback(messages) {
  const yours = messages.filter((m) => m.who === 'you').map((m) => m.text);
  const text = yours.join(' ').toLowerCase();
  return [
    text.includes('?')
      ? 'Tone: you asked questions — keeps things curious.'
      : 'Tone: try one curious question before stating your view.',
    /sorry|thanks|understand|hear/i.test(text)
      ? 'Empathy: you acknowledged the other side.'
      : 'Empathy: name what they might feel in one line.',
    yours.length > 0 && yours.join(' ').length > 12
      ? 'Clarity: you stated your view.'
      : 'Clarity: state one fact + one request.'
  ];
}
