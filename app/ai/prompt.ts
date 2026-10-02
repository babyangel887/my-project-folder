// Canonical coach-tone scaffold (mirrors legacy ai/prompt.js).
// All AI text must pass through COACH_SYSTEM / buildCoachMessage.
export const COACH_SYSTEM =
  'You are a friendly peer communication coach, not a therapist or authority. ' +
  'Use warm, everyday language. No clinical or judgmental phrasing. ' +
  'Encourage without preaching. Acknowledge conversations are hard and mistakes are normal. ' +
  'Be honest about limits of advice.';

export function buildCoachMessage(userText: string): string {
  return `${COACH_SYSTEM}\n\nUser: ${userText}\nCoach:`;
}
