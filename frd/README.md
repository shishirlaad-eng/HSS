# MyHSS MMS — FRD (Local Source of Truth)

This folder is the **editable source of truth** for the HSS Membership Management
System Functional Requirements Document. The Google Doc is now a **publish target**,
not the editing surface.

## How this works (plain version)

1. You edit the frontend prototype as normal.
2. When you reach a stopping point, you tell Claude Code (terminal) or Cowork (chat)
   what changed — e.g. *"trusted-device skips OTP on login; consent step moved earlier.
   Update the FRD."*
3. The agents read your changed frontend files, work out what is UI / functional /
   business-logic / navigation, update the matching `NN-*.md` file(s) here, and append
   a line to `_changelog.md`.
4. Separately, **only when you say so**, the publish agent formats new sections with
   `/document-formatter` and pushes them into the matching tab of the Google Doc.

Nothing runs on its own. You trigger every update and every publish.

## File ↔ Google Doc tab map

Each file maps to one tab in the Google Doc, so "update the Members tab" = one file.

| File | Google Doc tab |
|------|----------------|
| `00-global.md` | Global |
| `01-technical-specification.md` | Technical specification |
| `02-security.md` | Security |
| `03-authentication.md` | Authentication (incl. US-001 to US-008) |
| `04-masters.md` | Masters (incl. US-001 to US-005) |
| `05-members.md` | Members management (incl. Pending Approvals, Pending Guardian Approval, Member Details) |
| `06-events.md` | Events |
| `07-attendance.md` | Attendance |
| `08-reports.md` | Reports (Members / Events / Donations / Attendance / Refund) |
| `09-settings.md` | Settings (System settings / Static pages / Email template / System notifications) |
| `10-roles-permissions.md` | Roles and permission |
| `11-announcements.md` | Announcements |
| `12-open-questions.md` | Questions / cross-cutting open items |
| `13-dashboard.md` | Dashboard |

## Helper files

- `_changelog.md` — append-only log of every FRD edit (date, module, UI vs functional, what changed, synced-to-Doc yes/no).
- `_ui-feedback.md` — inbox for raw client feedback before it is classified and folded into module files.

## Status markers used in these files

- `[TBD — Needs Confirmation]` — open item, per frd-studio rules. Blocking items are flagged.
- `[FRONTEND-RECONCILE]` — a point where Claude Code (on your machine) should compare
  against the live frontend prototype and update the spec to match. These were inserted
  because the conversion was done from the Doc only; the frontend was not available at
  conversion time.

## The frd-studio structure these files follow

- Module files use the **Gate 4** 11-section format per screen/story (User Story,
  Screen Purpose, Fields & Validation, Business Logic, Navigation, Notifications,
  Acceptance Criteria, API Mapping, Data Rules, Dependencies, Open Questions).
- `01-technical-specification.md` follows the **Gate 3** structure.
- `00-global.md` follows the **Gate 2** structure (global rules, roles, platforms,
  status machines, compliance, retention, risks).
