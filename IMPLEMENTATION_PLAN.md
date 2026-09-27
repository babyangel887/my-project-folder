# Implementation Plan

Source: `PRD.md` — AI Communication Coach for students / early-career professionals.

## Planned Stack (locked in 2026-09-27)

- **Framework:** Vite + React web app (single platform for MVP)
- **Database:** None — `localStorage` for progress / incomplete-lesson `Continue` flag
- **Authentication:** None — local first-time flag (`localStorage`)
- **File storage:** Repo folder `content/` (JSON lessons/scenarios), no storage service
- **AI:** Thin `ai/` orchestration layer in front of LLM API + `lib/safety.ts` gate on all AI inputs

No `package.json` / `src/` yet — this is the target, not current state.

## Phase 1 — App Skeleton + Navigation + Coach Tone Scaffold

**PRD refs:** Main Journey, Short Summary, AI Coach Tone

**Concrete outputs:**
- Running app with 4 routes: Home / Learn / Practice / Reflect + Progress view
- `ai/prompt.ts` with friendly-peer system instruction: warm everyday language, no clinical/judgmental phrasing, admit limits, mistakes are normal
- Static Home with daily reflection placeholder

**Done when:** Can navigate to all sections, all AI output goes through one tone prompt.

## Phase 2 — First-Time + Returning Flows

**PRD refs:** First-Time User Flow, Returning User Flow

**Concrete outputs:**
- First-time: Welcome (what/who for) → Quick check-in (Learn / Practice / Real situation) → Guided first action router → one-time Safety notice + resources link
- Returning: straight to Home, static greeting e.g. "Good to see you again...", no check-in, Continue button only if incomplete lesson mini-practice exists (otherwise hidden), free choice of all features

**Done when:** New users get guided start, returning users get no friction.

## Phase 3 — Short Lessons

**PRD refs:** Key Features (Short Lessons), Lesson Structure

**Concrete outputs:**
- `content/lessons/*.json`: id, question, concept, explanation, before/after example, mini-practice
- Lesson UI: 1. Relatable question 2. One-tap Yes/Sometimes → reveal idea 3. Short explanation + example 4. Optional mini-practice (type 1 sentence or pick 2-3, not required to complete)
- 3 seed lessons: active listening, tone, de-escalation

**Done when:** Lesson completable in a few minutes without doing practice.

## Phase 4 — Role-Play Practice

**PRD refs:** Role-Play Scenario Selection + 7 Starter Scenarios

**Concrete outputs:**
- Picker: a) list of 7 starters (disagreeing, giving feedback, responding to criticism, setting boundary, repairing misunderstanding, speaking up in group, asking professor for help) b) describe-own → AI generates scenario
- Chat UI clearly labeled simulated, with end/restart
- Feedback view: tone / empathy / clarity observations + alternatives, no scores

**Done when:** Pick → simulate → end → feedback works for list and custom.

## Phase 5 — Real Situation Guidance

**PRD refs:** Real Situation Guidance

**Concrete outputs:**
- Input form + strict 3-part renderer: 1. Reflect back situation in 1-2 sentences, no emotion assumption 2. 2-3 labeled options (direct / softer / question-based) 3. One-line non-repetitive disclaimer
- Rule: no multi-question interrogation; if unclear, assume + disclose inline

**Done when:** Every response matches that 3-part shape.

## Phase 6 — Progress Tracking + Reminders

**PRD refs:** Progress Tracking, Reminders

**Concrete outputs:**
- Post-activity message: gentle consistency only, no streak numbers/scores/break-streak warnings; missed days never mentioned, just warm welcome back
- Progress store in `localStorage`: completed lessons / role-plays / guidance counts
- Optional reminders with on/off + time, fully disableable

**Done when:** Activity updates progress, reminders fully disableable.

## Phase 7 — Crisis & Safety Handling + Hardening

**PRD refs:** Safety Redirection, Crisis & Safety Handling, Known challenge

**Concrete outputs:**
- `lib/safety.ts` gate on all AI inputs, cautious (not keyword-only)
- On trigger: 1. Single warm message 2. Always-visible ResourceCard (hotline/text/emergency) 3. Stop coaching that topic 4. Gentle re-entry, never re-surface crisis unprompted
- Same behavior for new and returning users
- Safety test suite: danger/abuse/self-harm/suicidal/serious mental-health → redirect; normal conflict → no redirect

**Done when:** Safety tests pass, normal features blocked during crisis, re-entry works.
