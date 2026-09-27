# Implementation Plan

This plan divides the PRD into 7 ordered phases, each with concrete outputs.

## Phase 1 — App Skeleton + Navigation + Coach Tone Scaffold
**PRD references:** Main Journey, Short Summary, AI Coach Tone

**Concrete outputs:**
- Running app with 4 routes: Home / Learn / Practice / Reflect + Progress view
- `ai/prompt.ts` with friendly-peer system instruction: warm everyday language, no clinical/judgmental phrasing, admit limits, mistakes are normal
- Static Home with daily reflection placeholder

**Done when:** Can navigate to all sections, and all AI output goes through one tone prompt.

## Phase 2 — First-Time + Returning Flows
**PRD references:** First-Time User Flow, Returning User Flow

**Concrete outputs:**
- First-time: Welcome (what/who for) → Quick check-in (Learn / Practice / Real situation) → Guided first action router → one-time Safety notice + resources link
- Returning: straight to Home, static greeting (e.g. "Good to see you again..."), no check-in, Continue button only if an incomplete lesson mini-practice exists (otherwise hidden), free choice of all features

**Done when:** New users get a guided start, and returning users get no friction.

## Phase 3 — Short Lessons
**PRD references:** Key Features (Short Lessons), Lesson Structure

**Concrete outputs:**
- `content/lessons/*.json`: id, question, concept, explanation, before/after example, mini-practice
- Lesson UI: 1. Relatable question 2. One-tap Yes/Sometimes → reveal idea 3. Short explanation + example 4. Optional mini-practice (type 1 sentence or pick 2-3, not required to complete)
- 3 seed lessons: active listening, tone, de-escalation

**Done when:** A lesson is completable in a few minutes without doing the practice.

## Phase 4 — Role-Play Practice
**PRD references:** Role-Play Scenario Selection + Starter Scenarios

**Concrete outputs:**
- Picker: a) list of 7 starter scenarios b) describe-own → AI generates a scenario
- Chat UI clearly labeled as simulated, with end/restart
- Feedback view: tone / empathy / clarity observations + alternatives, no scores

**Done when:** Pick → simulate → end → feedback works for both the list and custom option.

## Phase 5 — Real Situation Guidance
**PRD references:** Real Situation Guidance

**Concrete outputs:**
- Input form + strict 3-part renderer: 1. Reflect back situation in 1-2 sentences, no emotion assumption 2. 2-3 labeled options (direct / softer / question-based) 3. One-line non-repetitive disclaimer
- Rule enforced: no multi-question interrogation; if unclear, assume + disclose inline

**Done when:** Every response matches that 3-part shape.

## Phase 6 — Progress Tracking + Reminders
**PRD references:** Progress Tracking

**Concrete outputs:**
- Post-activity message: gentle consistency only
- No streak numbers, scores, or break-streak warnings; missed days never mentioned, just a warm "welcome back"
- Progress store: completed lessons / role-plays / guidance counts
- Optional reminders with on/off + time (e.g. "Practice a lesson today"), fully disableable

**Done when:** Activity updates progress, and reminders are fully disableable.

## Phase 7 — Crisis & Safety Handling + Hardening
**PRD references:** Crisis & Safety Handling, Known challenge

**Concrete outputs:**
- `lib/safety.ts` gate on all AI inputs (lessons, role-play, guidance) — cautious, not keyword-only
- On trigger: 1. Single warm message 2. Always-visible ResourceCard (hotline/text/emergency) 3. Stop coaching that topic (no follow-ups/options) 4. Gentle re-entry, never re-surface crisis unprompted
- Same behavior for new and returning users
- Safety test suite: danger/abuse/self-harm/suicidal/serious mental-health → redirect; normal conflict → no redirect

**Done when:** Safety tests pass, normal features are blocked during a crisis, and re-entry works.
