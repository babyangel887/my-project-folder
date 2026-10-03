// Client for the Express/Groq backend (POST /ask).
// In dev, Vite proxies /ask -> http://localhost:3000 (see vite.config.js).
// Throws on network error, timeout, or server-side error so callers can
// fall back to the local heuristic and stay usable offline.

export async function askCoach(text, { timeoutMs = 30000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: ctrl.signal
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `Server error (${r.status})`);
    if (!data.reply) throw new Error('Empty reply from server');
    return data.reply;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out');
    throw new Error(e.message || 'Request failed');
  } finally {
    clearTimeout(t);
  }
}

export function rolePlayPrompt({ scenarioTitle, scenarioContext, history, userText }) {
  const lines = history
    .slice(-6)
    .map((m) => `${m.who === 'you' ? 'User' : 'Partner'}: ${m.text}`)
    .join('\n');
  return (
    `Role-play a difficult conversation. You are the other person, not the coach.\n` +
    `Scenario: ${scenarioTitle}. Context: ${scenarioContext}\n` +
    `Stay in character, 1-2 sentences, no abuse, no excessive distress.\n` +
    `Conversation so far:\n${lines}\nUser: ${userText}\nPartner:`
  );
}

export function guidancePrompt(userText) {
  return (
    `A user describes a real disagreement. Respond in exactly 3 parts:\n` +
    `1. Reflect back the situation in 1-2 sentences (situation, not assumed emotions).\n` +
    `2. Offer 2-3 respectful response options with tone labels (direct / softer / question-based).\n` +
    `3. One-line reminder that this is guidance, not a guarantee.\n` +
    `Do not ask clarifying questions; if something is unclear, state your assumption inline.\n` +
    `User situation: ${userText}`
  );
}
