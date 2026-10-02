export const LESSONS = [
  {
    id: 'active-listening',
    title: 'Active listening',
    question: 'Have you ever replied before the other person finished — and missed their point?',
    concept: 'Listen to understand, not just to reply.',
    explanation: 'Pause, paraphrase what you heard, then respond. It slows escalation and shows respect.',
    before: 'Before: Interrupting with your rebuttal.',
    after: 'After: Bauleth, what I\u2019m hearing is\u2026 Did I get that right?',
    practicePrompt: 'Type one paraphrase sentence you could use next time:',
    practiceOptions: ['What I\u2019m hearing is\u2026', 'Can you say more about\u2026?', 'Let me check I understood\u2026']
  },
  {
    id: 'tone',
    title: 'Tone without harshness',
    question: 'Have you ever said something true but it landed harshly?',
    concept: 'Separate impact from intent; soften delivery, keep honesty.',
    explanation: 'State fact + impact + request, without judgment words like always or never.',
    before: 'Before: You never listen!',
    after: 'After: When I\u2019m cut off, I feel rushed. Can I finish my point?',
    practicePrompt: 'Pick the softer rewrite:',
    practiceOptions: ['You never listen!', 'When I\u2019m cut off, I feel rushed. Can I finish?', 'Whatever, forget it.']
  },
  {
    id: 'de-escalation',
    title: 'De-escalation',
    question: 'Have you ever said something in the heat of the moment that you regretted?',
    concept: 'Pause before reacting; name the pause out loud.',
    explanation: 'A 10-second pause or asking for time prevents regret and keeps choice in your hands.',
    before: 'Before: Firing back instantly.',
    after: 'After: I need a minute \u2014 can we pause and come back?',
    practicePrompt: 'Type one pause sentence you could use:',
    practiceOptions: ['I need a minute.', 'Can we pause and come back?', 'Let me think before I reply.']
  }
];

export const SCENARIOS = [
  { id: 'disagree', title: 'Disagreeing with a coworker or classmate', context: 'You see things differently on a shared task.', opener: 'I still think my approach is better. Why do you disagree?' },
  { id: 'feedback', title: 'Giving honest feedback to a friend or teammate', context: 'Being truthful without being harsh.', opener: 'Can I get your honest take on my part? Be direct.' },
  { id: 'criticism', title: 'Responding to criticism about yourself', context: 'Staying calm and open instead of defensive.', opener: 'Your section was unclear and slowed us down.' },
  { id: 'boundary', title: 'Setting a boundary', context: 'Saying no without damaging the relationship.', opener: 'Can you take on my extra shifts this week?' },
  { id: 'repair', title: 'Repairing a misunderstanding', context: 'Addressing a conversation that went wrong.', opener: 'You seemed upset after yesterday. What happened?' },
  { id: 'group', title: 'Speaking up in a group project', context: 'Voicing concern without causing conflict.', opener: 'We already decided. Why bring this up again?' },
  { id: 'professor', title: 'Asking a professor for help or an extension', context: 'Clear, respectful, no over/under-explaining.', opener: 'Office hours are short \u2014 what do you need?' }
];
