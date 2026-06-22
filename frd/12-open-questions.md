# 12 — Open Questions (Cross-Cutting)

**Maps to Doc tab:** Questions + Super admin (cross-cutting governance items)

Consolidates open items that span multiple modules. Module-specific questions live in each module
file's Open Questions section. 🔴 = Blocking.

## Super Admin boundaries (governance)
| # | Question | Area |
|---|----------|------|
| SA-A | Can SA edit/delete member data, or view-only for Members? Can SA override consent / force link/unlink child / bypass safeguarding? Can SA edit attendance after submission (within a time window)? | Members / Attendance / Safeguarding |
| SA-B | Masters: can SA delete Regions/Towns/Centres or only deactivate? What happens to members/events/attendance mapped to a deactivated centre? Hierarchy changes effective immediately or scheduled cutover? | Masters |
| SA-C | Roles & permissions: custom roles beyond standard? Model = module + action (CRUD+Approve) + scope (centre/town/region)? Multiple roles per user? | Roles & Permissions |
| SA-D | Reports + export controls: formats (CSV/XLSX/PDF), limits (max rows, time range), watermark/audit for exports | Reports |
| SA-E | Data Migration (~8,000 records): scope (members only? attendance history? events? announcements?), field mapping ownership + validation, cutover (big bang vs phased), rollback trigger criteria + window | Data Migration |

> Note: several SA boundaries are already answered in module files — e.g. Members confirms SA full
> CRUD + soft delete, no consent bypass; Masters confirms deactivate-over-delete with dependency
> blocks; Roles confirms custom roles + module/action/scope model + multi-role. SA-E (Data
> Migration) has no dedicated module file yet — **[TBD — needs its own Gate 4 spec]**.

## Member / Teen / Child governance
| # | Question |
|---|----------|
| MTC-1 | Login gating contradiction: baseline "only active users proceed" vs teen profile-only login while pending — needs one explicit global rule (see Global §7.2, Q6 for Rejected teens) |
| MTC-2 | Consent linkage: 13–17 requires guardian email + consent; consistent linking rules (no bypass) |
| MTC-3 | Age transition at 18: parent control removed + independent profile — explicit state transition + ownership rules |
| MTC-4 | Teen age band canonical value: "13–17" (Global) vs "Kishor 12–16" (Pending Guardian Approval) |

## Events (cross-cutting) — see also 06-events.md
Event Admin cancel/edit-after-publish rules; capacity overbooking/waitlist; payment & refund
integrity (authorization, partial refunds, cutoffs, reconciliation, failed/duplicate payments);
registration approval state standardization; Event Admin scope; **RSVP vs participant-status model
discrepancy** (Going/Maybe/Not Going vs Pending/Approved/Rejected/Checked-in/Refunded).

## Reports (cross-cutting) — see also 08-reports.md
R1 scope levels · R2 drill up/down · R3 dimensions + member-level PII · R4 export formats/watermark/
limits · R5 week definition + timezone for rollups.

## Global blocking TBDs (from Global §11)
| # | Question | Blocking? | Owner |
|---|----------|-----------|-------|
| Q1 | Auth strategy (JWT cookies + Bearer vs unified Bearer) | 🔴 | Client + Dev |
| Q2 | CSRF strategy (depends on Q1) | 🔴 | Dev |
| Q3 | Inactive member retention period | 🔴 | Client |
| Q4 | Audit log retention (min 3 yrs) | 🔴 | Client |
| Q5 | DBS data retention after obligation ends | 🔴 | Client (legal) |
| Q6 | Teen login while Rejected | 🔴 | Client |
| Q7 | Email/SMS OTP provider | 🟡 | Client |
| Q8 | CI/CD toolchain | 🟡 | Dev |
| Q9 | Events Report compliance filter timing + gate type | 🔴 (Gate 4) | Client |
| Q10 | SAR export format (PDF/CSV) | 🟡 | Client |
| Q11 | Session timeout warning modal | 🟡 | Client |
| Q12 | Password reuse policy (last 5) | 🟡 | Client |

## Modules without a dedicated file yet (need Gate 4 specs)
- Dashboard (per-role KPIs)
- Profile (view/edit own; member child-profile management)
- Notifications (Bell) — partially covered under Announcements
- Compliance (DBS/First Aid management screens)
- Incident Logging
- Donations
- Data Migration
- Sessions / Attendance logs (source had empty headers)

> **[FRONTEND-RECONCILE]** As the prototype reveals these screens, create their module files
> (following the same Gate 4 11-section format) and move their open questions out of this file
> into the new module file.
