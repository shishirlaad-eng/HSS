# 08 — Reports

**Maps to Doc tab:** Reports (Members report · Events report · Donations · Attendance report · Refund report)

## Status
The source FRD lists the five report sub-tabs as headers; detailed per-report specs are **[TBD —
Needs Confirmation]** / not yet expanded in the source. Global rules already fix: all 5 reports +
CSV export; exports respect applied scope filters; pagination max 500 rows; Reporting User and admin
tiers scoped to assigned hierarchy. The cross-cutting reporting questions below are blocking-adjacent
and should be resolved before these specs are written.

## Reports in scope
1. **Members Report** + CSV
2. **Events Report** + CSV
3. **Donations / Payment Report** + CSV
4. **Attendance Report** + CSV
5. **Refund Report** + CSV

## Confirmed global constraints
- Export respects current filters/search; no data leakage across hierarchy boundaries.
- API responses return only fields appropriate to the requesting role's scope (data minimisation).
- Pagination up to 500 rows; default page size 20.
- Reports + CSV Export permitted for: Super Admin, National/Regional/Town Head, AC Admin (scoped),
  Reporting User (scoped). NOT Event Admin, NOT Ops User, NOT Member/Teen.

## Open Questions (from source Questions tab — Reports)
| # | Question | Risk if unclear |
|---|----------|-----------------|
| R1 | Reporting scope levels allowed (Centre / Town / Region / National — choose all that apply) | Cross-hierarchy data exposure |
| R2 | Drill-down: can a Town user see all centres in that town? Can they drill UP (Town → Region totals)? Usually no — confirm | Data exposure |
| R3 | Drill-down dimensions allowed (Region → Town → Centre); member-level visible or aggregates only; if member-level, which PII fields? | PII leakage in reports |
| R4 | Export formats (CSV / XLSX / PDF); allowed for all Reporting Users or only certain levels; watermark with user + timestamp; max rows / pagination | Bulk download of sensitive data |
| R5 | Date/time rules: what is a "week" for attendance reporting (Mon–Sun? centre-local?); timezone for rollups (server UTC vs UK local); how far back queryable | Inconsistent KPIs and disputes |
| Q9 | Events Report compliance filter: checked at registration vs report-generation time; hard gate (blocks registration) or soft filter (informational)? | (Global Q9 — Blocking, Gate 4) |
| R10 | Member data export format for SAR (PDF or CSV)? | (Global Q10 — Non-blocking) |

> **[FRONTEND-RECONCILE]** When the prototype's report screens exist, capture each report's
> columns, filters, drill-down behaviour, and export controls here in the Gate 4 11-section format,
> then resolve R1–R5 + Q9 with the client before backend build.
