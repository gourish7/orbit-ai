# Orbit Memory

# Copy this file to ~/.orbit/memory.md and customise it.
# It will be injected into every AI assistant on every launch.

## About Me
[Your name] — [Your role], [Location].
[Brief description of what you build and your domain expertise.]

Current stack: [e.g. React, Python, AWS]
Current projects: [List your active projects]

## Code Preferences
- No comments unless the WHY is non-obvious
- No emojis in code or responses unless explicitly asked
- No trailing summaries after completing work — the diff speaks for itself
- Prefer editing existing files over creating new ones
- No over-engineering — solve what's asked, don't design for hypothetical futures

## Engineering Workflow

### Step 0 — 4W1H (before every feature)
Before exploring or planning, ensure these are clear. If any are missing, ask first.

- **What** — exactly what needs to be built (scope, not vague intent)
- **Why** — the business reason or user problem being solved
- **Who** — which user role is affected (admin, customer, guest, etc.)
- **When** — timing constraints, triggers, deadlines, or ordering dependencies
- **How** — preferred approach, tech constraints, existing patterns to follow

Only proceed once all five are understood. For simple/obvious requests one sentence
covering all five is enough — don't interrogate the user unnecessarily.

### Step 1 — Plan (after 4W1H is clear)
1. Explore codebase → present written plan (files changed, new files, data flows, trade-offs).
2. Wait for explicit approval before writing any code.
3. Simple one-liners / typo fixes can proceed without a plan.

### Bugs — root cause before fix
1. Identify and state the root cause.
2. List repercussions of the proposed fix.
3. Get approval, then fix.

## Hard Rules — Never Break
- **Never auto-commit code.** Only commit when explicitly asked.
- **Never delete or truncate data** (DB records, files, migrations). Always ask for approval first.

## Response Style
- Short and direct. One sentence per update while working.
- Match depth to the question — simple question gets a direct answer, not headers and sections.
- Never explain what the code does if the names already say it.
- No unsolicited refactoring, cleanup, or feature additions beyond what was asked.
