# 07 — Attendance Oversight (Super Admin)

**Maps to Doc tab:** Attendance · **Platform:** Admin Web · **Access:** Super Admin only

## Scope
System-wide oversight of attendance (Sankhya) across Country → Region → Town → Activity Centre.
Attendance captured by Week/Date only (no weekly gathering entity); submitted by Ops users, overseen
by Centre Admin/Ops. Two screens (Attendance Overview, Attendance Details) + one Edit Attendance
modal. Any SA governance action audited and applied instantly; integrity preserved (no silent edits).

## Core rules
- Attendance tracked by **both Week and Date** (used for filtering + uniquely identifying the record).
- **Uniqueness:** only one attendance record per Activity Centre per Week/Date.
- Member-level values: exactly **Present** or **Absent** (no other value; no null/invalid).
- **Edit-after-submit (SA):** edit member entries (Present↔Absent), mark corrected, save a
  **mandatory correction reason**. On success: persisted instantly; Details reflects new entries +
  updated lastModified metadata.
- **No silent changes:** every edit creates an audit record (who/what/when/why); original
  submittedBy/submittedOn retained; lastModifiedBy/lastModifiedOn updated; each correction = new
  audit entry.

## Capabilities
**Search:** Activity Centre name · Week/Date range · Member Name / Member ID.
**Filters:** Masters scope (cascading) · Week + Date (both).
**Overview columns (min):** Country · Region · Town · Activity Centre · Week · Date · Submitted By ·
Submitted On · Last Modified By · Last Modified On · Correction Flag (badge) · Actions (View Details).
**Details sections:** Attendance Summary (Centre + Week + Date) · submission metadata · last-mod
metadata · Member Attendance Grid (Member ID, Name, Present/Absent) · correction history/audit ref
(optional **[TBD]**) · Governance: Edit Attendance (modal).
**Edit Attendance modal:** editable Present/Absent grid · Correction reason (mandatory, textarea) ·
Save/Cancel. Validation: reason required; Present/Absent only; save blocked if audit logging fails.

## Business rules (selected)
Missing Week or Date → block save + validation error. Duplicate AC + Week/Date → block creation
("Attendance already exists for this Activity Centre and Week/Date."); enforce uniqueness at DB level,
409 on race. Member moved/deactivated after submission → record remains historically viewable
**[TBD strictness]**. Edit without correction reason → block ("Correction reason is required."). Audit
failure at correction → block (no partial update) + "Unable to save. Please try again." Multiple rows
in one save → single record-level reason **[TBD per-row]**. Concurrent SA edits → Last-based **[TBD]**
→ "This record was updated by someone else. Please refresh and try again."

## Notifications (exact copy)
"Attendance record updated successfully." / "Attendance correction saved successfully." Errors:
validation, save/update failure, audit-logging failure ("Unable to save. Please try again."),
conflict. Optional confirm modal "Confirm Correction" / "Are you sure you want to update this
attendance record?" **[TBD]**.

## Access
SA only for all actions (view overview/details, search, filter by Masters + Week/Date, edit-after-
submit with mandatory reason, edit member entries). Audit failure blocks edits.

## Acceptance (selected)
Overview loads (or empty) · search by Centre/Week+Date/Member · filter by Masters scope · view
details with member-level Present/Absent + submission metadata · edit-after-submit with correction
reason persists + updates lastModified + audits · mark corrected stores/audits reason · missing reason
blocks save · invalid value blocks save · audit failure blocks save · uniqueness preserved (no
duplicate per AC/Week/Date) · load failure → error + Retry · concurrent edits handled per chosen
strategy **[TBD]**.

## API
GET `/admin/attendance` (page,size,search,countryId,regionId,townId,centreId,weekFrom,weekTo,dateFrom,
dateTo) · GET `/admin/attendance/{attendanceId}` · PUT `/admin/attendance/{attendanceId}` (body:
correctionReason required, entries[{memberId, status Present/Absent}]; audited). Errors
400/401/403/404/409/500. Save blocked if correctionReason missing or any status not Present/Absent;
audit failure → blocked.

## Audit
ATTENDANCE_CORRECTION (record-level) · ATTENDANCE_ENTRY_UPDATE (changed entries; one event with list
or per-member **[TBD]**) · correctionReason captured (mandatory) · BLOCKED_ACTION (missing reason /
invalid status / audit-failure) · CONFLICT **[TBD if implemented]**. View-audit Mandatory/Optional
**[TBD]**. Min fields: eventId, eventType, attendanceId, scope snapshot (country/region/town/centre +
week + date), performedBy, performedAtUtc, requestId/correlationId, before/after snapshot **[TBD]**,
correctionReason, reason. Append-only, immutable.

> **[FRONTEND-RECONCILE]** Verify the Overview columns, the Present/Absent member grid, the mandatory
> correction-reason field on edit, the correction flag/metadata display, and Week + Date being both
> required for record identification.
