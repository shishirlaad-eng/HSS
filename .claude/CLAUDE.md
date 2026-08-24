# CLAUDE.md — MyHSS MMS FRD-Sync Project

Project memory and routing rules for keeping the FRD (`frd/*.md`) in sync with the
frontend prototype, and publishing to the Google Doc on explicit instruction.

## Hard rule — never remove without double-asking (applies to ALL work in this repo)
Never remove, delete, or unregister anything that already exists and already works —
code, UI sections/fields, mock/seed data (including existing member registrations,
participants, records), config, or content — as a side effect of doing something else
(e.g. testing a different flow, fixing an unrelated bug). This applies everywhere in this
project, not just the FRD-sync workflow below.
- If removing something seems like the right fix, STOP and ask the user first — and ask
  again to confirm before actually doing it (double-ask, not a single confirmation).
- Prefer additive/non-destructive alternatives: add new seed data instead of altering
  existing seed data, add a new test event/record instead of repurposing one already in use,
  comment out only with explicit sign-off, etc.
- This rule exists because existing mock data (e.g. a member's event registration) was once
  deleted to test an unrelated flow, breaking a working page the user relied on, without
  asking first.

## Before any frontend implementation
Read `guidelines/Guidelines.md` first — UI consistency rules and standing context to
remember. Update it when new consistency rules or context emerge.

## Source of truth
- The **editable source of truth** for the FRD is the local Markdown in `frd/*.md`.
- The **Google Doc is a publish target**, not an editing surface.
- File ↔ Doc-tab mapping is in `frd/README.md`.

## Hard rules (do not violate)
1. **Trigger only.** Never update the FRD or publish to the Doc unless the user explicitly
   asks. No background or speculative edits.
2. **frd-studio governs structure.** All FRD content follows the frd-studio skill: Gate 4
   11-section format per screen/story; Gate 3 for `01-technical-specification.md`; Gate 2
   for `00-global.md`. Never write "system will handle errors", "as per standard", or "etc."
   Mark missing info `[TBD — Needs Confirmation]` and flag blocking items.
3. **document-formatter runs ONLY on newly authored content**, never on small in-place
   modifications. (Modifications skip the formatter — user's rule.)
4. **Never drop the Technical Specification** (`01-technical-specification.md`) when publishing.
5. **Classify before folding.** Client UI feedback lands in `frd/_ui-feedback.md` first.
   Separate UI-only from functional/business-logic/navigation. Only functional parts are
   folded into module files; tag each item; confirm with the user before folding.
6. **Log every edit.** Append one row to `frd/_changelog.md` for every FRD change (date,
   module file, type, what changed, synced-to-Doc?).
7. **Never invent requirements.** Only what the frontend or the user provides. When the
   frontend and a `.md` file disagree, surface the conflict; don't silently overwrite.
8. **Publishing is a separate, explicit step.** Updating `.md` files never auto-publishes.

## How a request is routed
- User describes a frontend change (or says "read the changed files") → **change-capture**
  agent produces a change spec (module, UI vs functional vs navigation vs business-logic).
- Change spec → **frd-author** agent edits the correct `frd/NN-*.md` per frd-studio + appends
  to `_changelog.md`.
- If new content was authored → **frd-formatter** agent runs document-formatter on those
  sections. If it was a plain modification → skip the formatter.
- User explicitly says "publish [module(s)] to the Doc" → **frd-publisher** agent formats new
  sections and writes into the matching Doc tab via the connected Google Docs MCP/connector.

## Reconcile markers
`[FRONTEND-RECONCILE]` marks points where the spec must be checked against the live frontend.
When working on a module, resolve its reconcile markers against the actual frontend files and
remove the marker once confirmed.

## Known cross-file discrepancies to watch (already flagged)
- Events: RSVP model (Going/Maybe/Not Going) vs participant-status model (Pending/Approved/
  Rejected/Checked-in/Refunded). See `06-events.md`.
- Auth: password min length 12 (module) vs 8 (Global §2). See `03-authentication.md` US-004.
- Teen age band: 13–17 (Global) vs Kishor 12–16 (Pending Guardian Approval). See `05-members.md`.
- API envelope: simple (source) vs rich (frd-studio Gate 3). See `01-technical-specification.md`.
- Dashboard KPI target: 3 s (Global) vs 4 s (Tech NFR).
