# 05 — Members Management (Super Admin)

**Maps to Doc tab:** Members management (+ Pending Approvals, Pending Guardian Approval, Member Details)
**Platform:** Admin Web · **Risk Level:** High

## Scope & Governance
System-wide member administration across all Masters scopes (Country/Org → Region → Town →
Activity Centre) for Adult/Teen/Child profiles. Super Admin: full CRUD + export + bulk upload +
soft delete. Hierarchy roles (per RBAC): view-only listing + details within assigned scope (no
add/edit/delete/export/bulk upload unless RBAC explicitly allows). Region Head sees only assigned
regions, etc.

**Safeguarding (non-negotiable):** Teen (12–17) is an independent account requiring guardian
consent/approval gating; Child (<12) has no independent login (managed via parent/guardian mode);
guardian approval override handled in the Pending Guardian Approval sub-module with mandatory
audit trail; Super Admin cannot bypass OTP/consent safeguards. All state-changing actions audited;
if audit logging fails, the action is blocked. Member data is PII — minimize exposure in lists,
mask where appropriate. No silent changes; destructive actions confirmed + logged. Lifecycle
statuses must match Global FRD (Pending Parental Consent / Pending Approval / Active / Inactive /
Rejected).

## Member types & compliance
Types: Adult (18+), Teen (12–17), Child (<12). Compliance values: DBS Pending/Completed; First Aid
Pending/Completed.

---

## US (Members Listing) — system-wide listing, search, filter, export, bulk upload

### 1 · User Story
The system shall present a paginated, searchable, filterable listing of all members across the
Masters scope hierarchy, and shall allow Super Admin to create, edit, deactivate, reactivate,
soft-delete, export, and bulk-upload members with full audit coverage.

### 2 · Screen Purpose
Central member administration hub. Scope: all statuses and member types visible to the logged-in
actor's RBAC scope. Non-SA hierarchy roles see the listing with actions suppressed.

### 3 · Fields & Validation — Search, Filters, and Add Member

**Search scope (extended):** Name · Email · Phone · Member ID · Secondary Email · Guardian Name · Guardian Email · Emergency Contact Name · Emergency Contact Phone.

**Filters:**
- Masters scope (cascading Country → Region → Town → Activity Centre)
- Gender (Male / Female / Other)
- Responsibility Type
- Registration Date range
- Compliance Status
- Member Type (Age Category)
- Status (Pending Parental Consent / Pending Approval / Active / Inactive / Rejected)
- DBS Status (Pending / Completed)
- First Aid Status (Pending / Completed)
- **AgeGroup (6-band):** Bal(ika) (0–5) · Shishu (6–11) · Kishor(i) (12–16) · Tarun(i) (17–30) · Yuva(ti) (30–60) · Jyestha(a) (60+)

  > The AgeGroup filter uses the confirmed HSS cultural age taxonomy (user-confirmed 2026-06-21).
  > MemberType (Adult/Teen/Child) and AgeGroup are separate systems — see Cross-module conflict
  > section at end of file.

**Listing columns (frontend):**
| Column | Notes |
|--------|-------|
| Member ID | Read-only |
| Full Name | |
| Age Group (badge) | 6-band AgeGroup value (Bal/Shishu/Kishor/Tarun/Yuva/Jyestha) |
| Email | Primary email |
| Primary Contact Number | |
| Emergency Contact | Emergency contact name |
| Sangh Responsibility | Member's assigned responsibility |
| HSS Scope (combined) | Single column: Country · Vibhag · Nagar · Shakha |
| First Aid Status (badge) | Pending / Completed |
| DBS Status (badge) | Pending / Completed |
| Status (badge) | Pending Parental Consent / Pending Approval / Active / Inactive / Rejected |
| Actions | View · Edit (if RBAC allows) · Deactivate / Reactivate · Delete (soft, SA only) |

Note: "Last Updated", "Guardian Email", and separate Country/Vibhag/Nagar/Shakha columns are NOT present in the listing — Guardian Email shown in Member Details header for minors only.

> Approve/Reject do NOT appear in this listing — they belong in Pending Approvals /
> Pending Guardian Approval sub-modules.

**Karyakartas toggle:** A toggle control on the listing header allows the SA to switch the view
between "All Members" and "Karyakartas only" (members with at least one assigned Responsibility).
The toggle filters via the `hasResponsibility=true` query parameter. The toggle state is preserved
within the current session but does not persist across sessions.

**KPI panel (above listing):**
| KPI tile | Definition |
|----------|------------|
| Total Members | Count of all non-deleted members in RBAC scope |
| Active Members | Count where status = Active |
| Pending Approvals | Count where status = Pending Approval |
| Pending Guardian Approvals | Count where status = Pending Parental Consent |
| Inactive Members | Count where status = Inactive |

KPI tiles are informational read-only; clicking a tile does NOT navigate to a filtered view
(unless a future story explicitly adds that behaviour). Tile counts reload when the page loads
and after any state-changing action.

**Add Member field set (full):**

*Identity*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | Text | Yes | 2–50 chars, alpha + space/hyphen |
| Last Name | Text | Yes | 2–50 chars, alpha + space/hyphen |
| Date of Birth | Date (DD/MM/YYYY) | Yes | Must be in the past; age determines Member Type |
| Gender | Dropdown (Male / Female / Other) | Yes | |
| Email | Text | Yes | RFC 5322 format; unique across all members |
| Phone | Text | No | E.164 format |

*Secondary Contact*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Secondary Email | Email | No | RFC 5322 |
| Secondary Phone | Text | No | E.164 format |

*Address*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Building Name | Text | No | |
| Address Line 1 | Text | No | |
| Address Line 2 | Text | No | |
| Town / City | Text | No | Contact address — distinct from Masters Nagar |
| Post Code | Text | No | |

*Emergency Contact*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Emergency Contact Name | Text | Yes | |
| Emergency Contact Phone | Text | Yes | E.164 format |
| Emergency Contact Email | Email | Yes | RFC 5322 |
| Emergency Contact Relationship | Text | Yes | |

*Guardian (displayed only when DOB indicates Teen — NOT shown for Child or Adult)*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Guardian Name | Text | Conditional (Teen) | |
| Guardian Phone | Text | Conditional (Teen) | E.164 format |
| Guardian Email | Email | Conditional (Teen) | RFC 5322; distinct from member email |
| Guardian Relationship | Text | Conditional (Teen) | |

*Other Information*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Medical Information Declared | Checkbox | No | |
| Medical Information Details | Textarea | Conditional (checkbox checked) | |
| Is First Aider | Dropdown (Yes / No) | No | |
| First Aid Qualification Level | Text | Conditional (Yes) | |
| First Aid Expiry Date | Date | Conditional (Yes) | Must be in the future |
| Dietary Requirements | Multi-select | No | Options: Vegetarian, Vegan, Halal, Gluten-free |
| Occupation | Text | No | |
| Originating State in India | Text | No | |

*Compliance — DBS*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| DBS Status | Dropdown (Pending / Completed) | No | |
| DBS Reference | Text | No | |
| DBS Certificate Number | Text | No | |
| DBS Certificate Date | Date | No | |
| Certificate Received From | Dropdown (HSS / Other) | No | |
| Certificate Received From (Other) | Text | Conditional (Other selected) | |
| DBS Update Service | Dropdown (Yes / No) | No | |
| Update Service Number | Text | Conditional (Yes) | |
| Update Service Last Check Date | Date | Conditional (Yes) | |
| DBS App Under Process | Dropdown (Yes / No) | No | |
| DBS Verified By | Text | No | |

*Compliance — First Aid*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Aid Status | Dropdown (Pending / Completed) | No | |
| First Aid Reference | Text | No | |

*Compliance — Safeguarding*
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Safeguarding Status | Dropdown (Pending / Completed) | No | |
| Safeguarding Reference | Text | No | |
| Safeguarding Expiry | Date | No | |

### 4 · Business Logic

#### 4.1 Positive
- Listing loads with pagination (default 25 rows/page) and respects RBAC scope on first render.
- Search is applied across all nine search-scope fields simultaneously (OR logic).
- Filters combine with AND logic; cascading Masters dropdowns reset child selections on parent change.
- Karyakartas toggle adds `hasResponsibility=true` to the query without clearing other active filters.
- KPI tile counts are fetched independently (`GET /admin/members/kpi`) and displayed above the listing.
- Add Member: upon valid submission, initial status is assigned based on member type:
  - **Adult (age ≥ 18):** status = `pending` → routes to Sub-module B (Pending Approvals).
  - **Teen or Child (age < 18):** status = `pending-parental-consent` → routes to Sub-module C
    (Pending Guardian Approval).
- Member Type (Adult / Teen / Child) is **derived automatically** from the submitted Date of Birth
  at the moment of creation; it is not a user-selectable field. Rule: age < 12 → Child;
  12 ≤ age ≤ 17 → Teen; age ≥ 18 → Adult. Age is calculated as: floor((today − DOB) / 365.25).
- AgeGroup (6-band) is auto-derived from DOB and stored on creation. Confirmed bands (user-confirmed 2026-06-21):
  Bal(ika) 0–5 · Shishu 6–11 · Kishor(i) 12–16 · Tarun(i) 17–30 · Yuva(ti) 30–60 · Jyestha(a) 60+.
- Edit: field-level constraints [TBD — Needs Confirmation — non-blocking]; full form pre-populated
  with existing values.
- Deactivate: allowed only when current status = **Active**. Sets status to **Inactive**.
  Confirmation modal required. Action is audited.
- Reactivate: allowed only when current status = **Inactive**. Sets status to **Active**.
  Confirmation modal required. Action is audited.
- Export CSV: respects all active filters and search. Columns in output (see §4.1 Export columns
  below).
- Bulk Upload: two-state modal (see §4.1 Bulk Upload below).
- Soft delete: allowed only when no blocking dependencies exist (dependency list [TBD — Needs
  Confirmation — blocking: must enumerate dependent entities]).

**Export CSV columns (enumerated — matches frontend):**
Member ID · Name · Age Groups (years old) · Email · Primary Contact Number · Secondary Email ·
Emergency Contact Name · Emergency Contact Phone · Guardian Name · Guardian Email · Status ·
Country · Vibhaag · Nagar · Shakha · DBS Status · First Aid Status · Is First Aider ·
Dietary Requirements · Registration Date.

**Bulk Upload — two-state modal:**

*State 1 — Upload:*
- SA selects a CSV file (max file size [TBD — non-blocking]).
- System validates: (a) required columns present; (b) schema valid. If schema invalid, modal
  stays in State 1 and displays the list of missing/invalid columns. Upload is blocked.
- Maximum rows per file: **500**. If file exceeds 500 rows, upload is blocked with message:
  "File exceeds the 500-row limit. Please split the file and upload again."
- On valid schema + row count ≤ 500, system runs row-level validation and transitions to State 2.

*State 2 — Summary:*
- Displays: Total Rows · Success Count · Failure Count.
- Failure rows shown with row number and specific field-level errors.
- SA may download the error report (CSV of failed rows + error messages) [TBD — non-blocking].
- SA clicks "Confirm" to create all valid rows. Invalid rows are discarded (not partially saved).
- Each created member is audited individually (BULK_UPLOAD_ROW_CREATED event).
- Entire bulk upload operation is audited (BULK_UPLOAD event with totals).

#### 4.2 Negative
- Search with no results → empty state: "No members found matching your search." + Clear Search.
- Filter combination yields no results → empty state with Clear Filters action.
- Add Member with duplicate Email → "A member with this email already exists." (409 conflict).
- Add Member with duplicate Member ID → "A member with this ID already exists." (409 conflict).
- Guardian email missing for Teen → "Guardian email is required for Teen members." (blocked).
- Invalid Masters mapping value → "Invalid selection. Please choose a valid option."
- Deactivate attempted on non-Active member → action blocked; UI shows current status.
- Reactivate attempted on non-Inactive member → action blocked; UI shows current status.
- Delete with blocking dependencies → "Cannot delete this member. Please resolve dependencies
  first." (dependency list [TBD — Needs Confirmation — blocking]).
- Bulk upload file > 500 rows → "File exceeds the 500-row limit. Please split the file and
  upload again."
- Bulk upload schema invalid → State 1 stays open; column errors listed.
- API failure on any action → "Unable to save. Please try again." (or action-specific variant).

#### 4.3 Edge
- Concurrent update: last-write-based conflict detection [TBD — Needs Confirmation: optimistic
  lock strategy — non-blocking]; on conflict → "Data was updated by another user. Please refresh."
- Member turns 18 during an active session (Teen → Adult): Member Type and AgeGroup are
  re-derived on the next profile load; no automatic status change. [TBD — Needs Confirmation —
  non-blocking]
- Zero-member result on page load (no members in scope) → empty state + "Add Member" CTA.
- Karyakartas toggle + no Karyakartas in scope → empty state: "No Karyakartas found."
- KPI tile fetch failure: tile shows "—" with tooltip "Unable to load count."

#### 4.4 Audit
| Event | Min fields |
|-------|-----------|
| MEMBER_CREATE | memberId, performedBy, performedAtUtc, initialStatus, requestId |
| MEMBER_UPDATE | memberId, changedFields[], previousValues[], newValues[], performedBy, performedAtUtc, requestId |
| MEMBER_DEACTIVATE | memberId, previousStatus (Active), newStatus (Inactive), performedBy, performedAtUtc, requestId |
| MEMBER_REACTIVATE | memberId, previousStatus (Inactive), newStatus (Active), performedBy, performedAtUtc, requestId |
| MEMBER_DELETE | memberId, performedBy, performedAtUtc, requestId |
| CSV_EXPORT | filterSnapshot, exportedBy, exportedAtUtc, rowCount, requestId |
| BULK_UPLOAD | bulkUploadId, uploadedBy, uploadedAtUtc, totalRows, successCount, failureCount, requestId |
| BULK_UPLOAD_ROW_CREATED | bulkUploadId, memberId, rowNumber, performedAtUtc |
| BLOCKED_ACTION | reason, attemptedBy, attemptedAtUtc, requestId |
| CONFLICT | memberId, conflictType, detectedAtUtc, requestId |

All audit events are append-only and immutable. If audit logging fails, the triggering action is
blocked and the user sees: "Unable to save. Please try again."

#### 4.5 Security & Permissions
- Full PII (email, phone, DOB, guardian email) visible to Super Admin in detail view; masked in
  listing (email: first 3 chars + *** + domain; phone: last 4 digits; guardian email: same
  as member email masking).
- Hierarchy roles: listing view only within their RBAC scope; all write actions (create/edit/
  deactivate/reactivate/delete/export/bulk-upload) hidden unless RBAC explicitly grants them.
- SA cannot bypass OTP/consent safeguards per Safeguarding section above.
- Bulk upload file is processed server-side; no client-side row processing.

### 5 · Navigation
- Members Listing is accessible from the main nav sidebar under "Members."
- "View" action → Member Details page (Sub-module A); back button returns to listing preserving
  filters, search, and page position.
- "Edit" action → opens Edit Member modal (same field set as Add Member, pre-populated).
- "Add Member" button → opens Add Member modal.
- "Bulk Upload" button → opens two-state Bulk Upload modal.
- "Export CSV" button → triggers download; stays on listing page.
- Karyakartas toggle → updates listing in-place; no page navigation.
- KPI tiles → no navigation (informational only unless a future story adds drill-down).
- Pending Approvals and Pending Guardian Approvals → separate sub-module screens (not inline
  in this listing); accessible via sidebar or KPI tile [TBD — Needs Confirmation: whether KPI
  tiles navigate — non-blocking].

### 6 · Notifications
- All toast messages use a standard top-right, auto-dismiss (5 s) toast component.
- "Member created successfully."
- "Member updated successfully."
- "Member deactivated successfully."
- "Member reactivated successfully."
- "Member deleted successfully."
- "CSV exported successfully."
- "Bulk upload completed. [X] members created, [Y] rows failed."
- On bulk upload with zero failures: "Bulk upload completed successfully. [X] members created."
- Audit-failure error: "Unable to save. Please try again."
- Confirmation modals required before: Deactivate / Reactivate / Delete / Bulk Upload confirm step.

### 7 · Acceptance Criteria
1. Listing loads (or empty state with Add Member CTA) within 3 s on first render.
2. Search by Name, Email, Phone, Member ID, Secondary Email, Guardian Name, Guardian Email, Emergency Contact Name, Emergency Contact Phone returns correct results.
3. Filters apply with AND logic; Masters scope cascades correctly.
4. AgeGroup filter renders all 6 bands and narrows results correctly.
5. Karyakartas toggle adds `hasResponsibility=true` to query; all other filters remain active.
6. KPI tiles display correct counts on page load and refresh after state changes.
7. Add Member: Adult → status = `pending` (Pending Approval); Teen/Child → status = `pending-parental-consent` (Pending Parental Consent). Audit event written on creation.
8. Member Type (Adult/Teen/Child) auto-derived from DOB; not user-selectable.
9. AgeGroup auto-derived from DOB and stored on creation.
10. Teen creation: guardian fields (Name, Phone, Email, Relationship) required; status = `pending-parental-consent`. Child creation: guardian fields NOT required; status = `pending-parental-consent`.
11. Duplicate Email or Member ID → 409 error message; no member created.
12. Edit: form pre-populated; save persists + audits changed fields only.
13. Deactivate: only shown/enabled for Active members; confirmation modal required; sets Inactive.
14. Reactivate: only shown/enabled for Inactive members; confirmation modal required; sets Active.
15. Delete: soft only; blocked with safe error if dependencies; confirmation modal required.
16. Export CSV: contains all enumerated columns; respects active filters and search.
17. Bulk Upload State 1: schema invalid → error list shown, upload blocked; > 500 rows → blocked
    with row-limit message.
18. Bulk Upload State 2: summary shows totals; failure rows with field errors; confirm creates
    valid rows only; audit written per row and per batch.
19. Listing columns show HSS Scope as combined single column.
20. PII masked in listing; full PII visible in Member Details to SA.
21. Audit-logging failure blocks any state-changing action; user sees "Unable to save. Please
    try again."
22. Load failure → error state + Retry button.

### 8 · API Mapping
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/admin/members` | Paginated listing (params: page, size, search, countryId, regionId, townId, centreId, memberType, status, dbsStatus, firstAidStatus, gender, responsibilityTypeId, ageGroup, hasResponsibility, registrationDateFrom, registrationDateTo) |
| GET | `/admin/members/kpi` | KPI tile counts (scope-filtered) |
| GET | `/admin/members/{memberId}` | Full member detail |
| POST | `/admin/members` | Create member |
| PUT | `/admin/members/{memberId}` | Update member |
| POST | `/admin/members/{memberId}/deactivate` | Deactivate (Active → Inactive) |
| POST | `/admin/members/{memberId}/reactivate` | Reactivate (Inactive → Active) |
| DELETE | `/admin/members/{memberId}` | Soft delete (dependency rules [TBD]) |
| GET | `/admin/members/export` | Export CSV (respects filters) |
| POST | `/admin/members/bulk-upload` | Bulk upload (returns totalRows, successCount, failureCount, failures[{rowNumber, errors[]}], createdMemberIds[]) |

HTTP error codes: 400 / 401 / 403 / 404 / 409 / 422 / 500. All state-changing endpoints write
audit; if audit fails, action is blocked (HTTP 500 + safe error body).

### 9 · Data Rules
- Email: unique across all members (enforced at DB level).
- Member ID: unique, system-generated on creation (format [TBD — Needs Confirmation — non-blocking]).
- HSS ID: unique [TBD — Needs Confirmation: generation rule — non-blocking].
- Member Type: derived from DOB at creation; recalculated on profile load (age boundary check).
- AgeGroup: derived from DOB; stored and indexed for filter performance.
- Status allowed transitions: Pending Approval → Active (approve); Pending Approval → Rejected
  (reject); Active → Inactive (deactivate); Inactive → Active (reactivate);
  Pending Parental Consent → Pending Approval (guardian consent given);
  Pending Parental Consent → Rejected (guardian consent rejected).
- Soft delete: `deletedAt` timestamp set; record excluded from all listing queries; accessible
  only via audit log.
- Concurrency: last-write detection [TBD — Needs Confirmation: optimistic lock field — non-blocking].

### 10 · Dependencies
- Masters module (`04-masters.md`): Country, Region, Town, Activity Centre, Responsibility Type
  values must exist before member creation.
- Authentication module (`03-authentication.md`): guardian consent email flow (US-010/US-011).
- Audit service: all state changes depend on audit write succeeding.
- Notification service: toast messages; guardian consent emails.
- Bulk upload: CSV parser service; row-level validator.

### 11 · Open Questions
| # | Question | Blocking? | Raised |
|---|----------|-----------|--------|
| OQ-1 | Delete dependency list: which entities (events, attendance, donations, etc.) block soft delete? | Blocking | 2026-06-21 |
| OQ-2 | Member ID generation rule (format, prefix, sequence)? | Non-blocking | 2026-06-21 |
| OQ-3 | HSS ID generation rule? | Non-blocking | 2026-06-21 |
| OQ-4 | DBS Reference and First Aid Reference field format/length constraints? | Non-blocking | 2026-06-21 |
| OQ-5 | DBS "Expiring" as distinct status badge? | Non-blocking | 2026-06-21 |
| OQ-6 | Bulk upload error report downloadable CSV — required or nice-to-have? | Non-blocking | 2026-06-21 |
| OQ-7 | AgeGroup for members aged 0–4 (below Bal band): null, exclude from listing, or separate label? | Non-blocking | 2026-06-21 |
| OQ-8 | Do KPI tiles navigate to a filtered listing on click? | Non-blocking | 2026-06-21 |
| OQ-9 | Optimistic-lock strategy for concurrent edits (ETag / updatedAt version field)? | Non-blocking | 2026-06-21 |
| OQ-10 | Bulk upload max file size (bytes)? | Non-blocking | 2026-06-21 |

---

## Sub-module A · Member Details

**User Story:** The system shall display a complete member profile when the SA selects a member
from the listing, organised into four tabs — Profile, Activity & History, Compliance, and Admin —
and shall surface governance action controls appropriate to the member's current status.

### Section layout — four-tab design

**Tab 1 — Profile**
1. **Profile Summary:** Member ID (read-only) · HSS ID (read-only) · Member Photo · Full Name
   (read-only) · Member Type (badge: Adult / Teen / Child) · AgeGroup (badge; auto-derived from
   DOB) · Status (badge) · Registration Date.
2. **Personal Information:** DOB (DD/MM/YYYY) · Gender · Email (full PII) · Phone (full PII) ·
   Secondary Email [TBD — Needs Confirmation: optional field — non-blocking] ·
   Secondary Phone [TBD — Needs Confirmation: optional field — non-blocking].
3. **Address:** Street Line 1 · Street Line 2 (optional) · City · State/Province · Postal Code ·
   Country. [TBD — Needs Confirmation: address fields required vs optional at profile level — non-blocking]
4. **Emergency Contact:** Emergency Contact Name · Emergency Contact Phone · Relationship.
   [TBD — Needs Confirmation: required vs optional — non-blocking]
5. **Organisational (Masters Mapping):** Country/Org · Region · Town · Activity Centre ·
   Primary Responsibility · Additional Responsibilities (primary prominent, additional listed).
6. **Guardian Information (Kishor age group only — age 12–16):** Guardian Name · Guardian Phone · Guardian Email (full PII) · Guardian Relationship · Guardian Consent Status (Pending / Given). Must NOT be shown for Adults or for members outside the Kishor age group. Decision: visibility gated on `ageGroup === 'kishor'` (user-confirmed 2026-06-21, blocking item B4).
7. **Admin Roles assigned to this member:** list of roles from RBAC module (read-only in
   this view; managed via Roles & Permissions module).
   [TBD — Needs Confirmation: display format — non-blocking]

**Tab 2 — Activity & History**
1. **Attendance History (Shakha sessions):** paginated table of attended sessions (date, Shakha
   name, status). Zero records → "No attendance records found."
2. **Event Attendance:** paginated table of events attended (event name, date, status).
   Zero records → "No event attendance records found."
3. **History tab — Membership lifecycle history:** ordered list (newest first) of status
   transitions for this member. Each row: previous status · new status · changed by ·
   timestamp (UTC, displayed in local timezone) · reason/note (if captured).
   This is a read-only display; no pagination limit defined yet
   [TBD — Needs Confirmation: pagination threshold — non-blocking].
   Zero records → "No history records found."

**Tab 3 — Compliance**
1. **DBS:** DBS Status (Pending / Completed / Expiring [TBD GQ-5]) · DBS Reference · DBS Certificate Number · DBS Certificate Date · Certificate Received From · DBS Update Service (Yes/No) → Update Service Number + Last Check Date (conditional) · DBS App Under Process (Yes/No) · DBS Verified By.
2. **First Aid:** First Aid Status · First Aid Reference.
3. **Safeguarding Training** (user-confirmed B5 — 2026-06-21): Safeguarding Status · Training Date · Level of Training · Reference Number · Expiry Date.
4. **Parental Consent** (user-confirmed B5 — 2026-06-21): Consent Status (Pending / Granted / Not Applicable) · displayed for Kishor members only; N/A for Adult members.

**Tab 4 — Admin**
1. **Admin Notes:** full text of admin notes (editable by SA inline or via Edit modal).
2. **Audit History:** paginated table — event type · performed by · timestamp · summary of
   what changed (NOT old/new field values per MOM 27 May). Scoped to this memberId; read-only.

### Business Logic

**Positive:** `GET /admin/members/{memberId}` loads all tab data on page open; each tab may
load its section data lazily to improve performance [TBD — Needs Confirmation: lazy vs eager —
non-blocking]. Guardian tab section visible only for Teen/Child. AgeGroup badge auto-derived from
DOB. Governance actions panel (below tabs or in profile summary header) shows controls valid for
current status only. Back to listing → preserves filters, search, and page position.

**Negative:** API fail → "Unable to load records. Please try again." + Retry button; member not
found → 404: "Member not found." + Return to Listing link; out of RBAC scope → "Access denied."

**Edge:** Concurrent update detected → "Data was updated by another user. Please refresh.";
Child → guardian-managed profile note displayed; multiple responsibilities (primary prominent +
additional listed); no compliance data → "—" / "Not applicable."

**Audit:** Viewing member details is not audited (read-only). Each governance action is audited
in its own story. Audit History section (Tab 4) is read-only and scoped to this memberId.

**Security:** Full PII visible to SA. Hierarchy roles see same tab structure with governance
action controls hidden.

### Governance Actions Panel

The Governance Actions Panel appears regardless of active tab. Visible to SA only.

| Action | Enabled when | Confirmation |
|--------|-------------|-------------|
| Edit | Always (SA) | No (opens modal) |
| Deactivate | Status = Active | Yes — confirmation modal |
| Reactivate | Status = Inactive | Yes — confirmation modal |
| Delete (soft) | No blocking dependencies | Yes — confirmation modal |

Approve / Reject do NOT appear here. Deactivate/Reactivate governance is strictly
Active ↔ Inactive only; no other status transitions are allowed from this panel.

### Deactivate / Reactivate Governance (full spec)

- **Deactivate:** pre-condition `status == Active`. On confirm: `POST /admin/members/{memberId}/deactivate`
  → sets `status = Inactive`; audit event MEMBER_DEACTIVATE written; toast: "Member deactivated
  successfully."; panel updates (Deactivate button hidden, Reactivate button shown).
  If member is not Active when action is triggered: action blocked; error: "This member is not
  currently active. Please refresh."
- **Reactivate:** pre-condition `status == Inactive`. On confirm: `POST /admin/members/{memberId}/reactivate`
  → sets `status = Active`; audit event MEMBER_REACTIVATE written; toast: "Member reactivated
  successfully."; panel updates (Reactivate button hidden, Deactivate button shown).
  If member is not Inactive when action is triggered: action blocked; error: "This member is not
  currently inactive. Please refresh."
- In both cases: if audit logging fails → action is blocked; toast: "Unable to save. Please try again."

### Delete Spec (soft delete)

- Pre-condition: no blocking dependencies (dependency entity list [TBD — Needs Confirmation —
  blocking OQ-1]).
- On confirm: `DELETE /admin/members/{memberId}` → sets `deletedAt` = now, `deletedBy` = SA userId.
- Member excluded from all listing queries and KPI counts after deletion.
- Record remains accessible in audit log (immutable).
- If dependencies exist: request blocked (HTTP 409); toast: "Cannot delete this member. Please
  resolve dependencies first." Specific dependency names surfaced to SA in the modal
  [TBD — Needs Confirmation: enumerate — blocking OQ-1].
- Hard delete is NOT permitted under any circumstances.
- Audit: MEMBER_DELETE event (memberId, performedBy, performedAtUtc, requestId).

### Acceptance Criteria (Sub-module A)
1. Four-tab layout renders; each tab loads its section content.
2. Profile tab: auto-derived AgeGroup badge; guardian section visible only for Teen/Child.
3. Primary + additional responsibilities displayed separately (primary prominent).
4. Activity & History tab: attendance history + event attendance + membership lifecycle
   history (newest first), each with zero-record empty state.
5. Compliance tab: DBS + First Aid fields displayed; empty fields → "—"/"Not applicable."
6. Admin tab: audit history (event type, performed by, timestamp, summary — no old/new values).
7. Governance panel: Deactivate shown only when Active; Reactivate shown only when Inactive.
8. Deactivate → Inactive; Reactivate → Active; both require confirmation modal + audit.
9. Delete blocked with safe error when dependencies exist; hard delete impossible.
10. API fail → error message + Retry; member not found → 404 message + Return to Listing.
11. Back to listing preserves filters and page position.

**API:** GET `/admin/members/{memberId}` · POST `/admin/members/{memberId}/deactivate` ·
POST `/admin/members/{memberId}/reactivate` · DELETE `/admin/members/{memberId}`.

**Open Questions (Sub-module A):** see module-level OQ-1 through OQ-10 above; additionally:
- Q-A: How many audit/activity/history records before pagination?
- Q-B: Lazy vs eager loading per tab?
- Q-C: Address fields — required vs optional at member detail level?

---

## Sub-module B · Pending Approvals (Registrations)

Shows members with status = Pending Approval; allows Approve / Reject. Reuses Member Details layout
+ audit rules + Masters scope/filters. Out of scope: guardian approval (Sub-module C), member CRUD.

**State transitions:** Pending Approval → Active (Approve); Pending Approval → Rejected (Reject).
Once processed, member disappears from list.
**List KPIs:** Total Pending · Registered Today · This Week · Compliance Issues (DBS/First Aid
pending/expired **[TBD definition]**). **List fields (min):** Name + Member ID · Email · Activity
Centre · Registration date · Age category · DBS + First Aid status · Approve/Reject actions.
**Reject Modal:** Rejection Reason (required; free text — user-confirmed B6, 2026-06-21) · Cancel / Confirm Reject.
**Toasts:** "Member approved successfully." / "Member rejected. Reason: <rejection reason text>" / "Unable to approve. Please try again." / "Unable to reject. Please try again." Notifications (if enabled): approve → notify member active; reject → notify member with safe rejection reason.
**Permissions:** SA view + approve + reject; other roles view-only unless RBAC enables.
**Edge:** already processed → "This request was already processed. Please refresh."; audit failure →
block + safe error; status no longer Pending Approval → block + refresh.
**Audit:** MEMBER_APPROVE (memberId, previousStatus, newStatus, approvedBy, time) · MEMBER_REJECT
(memberId, reason, notes, rejectedBy, time) · CONFLICT/BLOCKED_ACTION.
**API:** GET `/admin/members?status=PendingApproval` (+ scope) · POST `/admin/members/{id}/approve` ·
POST `/admin/members/{id}/reject` (body: reason, notes).

**Shakha Transfer Requests (user-confirmed B7, 2026-06-21):** The Pending Approvals screen also handles Shakha Transfer Requests — members requesting to transfer to a different Shakha (Activity Centre). Transfer requests appear as a separate panel/section within this screen alongside member registration approvals. Approve → updates member's Activity Centre; Reject → transfer request cancelled, member stays in current Shakha. Transfer approval is audited separately (SHAKHA_TRANSFER_APPROVE / SHAKHA_TRANSFER_REJECT events). Full specification for Shakha Transfer flows is documented here in `05-members.md` pending a dedicated US to be authored [TBD — Needs Confirmation: Shakha Transfer detailed field spec].

---

## Sub-module C · Pending Guardian Approval

Shows Teen members blocked at Pending Parental Consent because guardian approval is pending. Super
Admin can approve on behalf of guardian (override) — audited. Reject reason: free text (required).
Out of scope: AC Pending Approval step (Sub-module B, after consent), editing member data.

**Eligibility to appear:** memberType = Teen (age 13–17); guardianEmail present; membershipStatus = Pending Parental Consent.
**Approve result (confirmed two-step — user B8, 2026-06-21):** On SA guardian-consent approve → membership status moves to `pending` (Pending Approval); record disappears from Sub-module C list and appears in Sub-module B (Pending Approvals) for final activation. SA must then approve in Sub-module B to set status = Active.
**Reject result:** consent → Rejected; membership → `rejected` with reason. (Exact post-reject state **[TBD]**.)
**List KPIs:** Total Pending · Registered This Week · Waiting > 7 Days · Waiting > 14 Days (waiting
days = Today − registrationDate or consentRequestDate; pick one consistently). **List fields:** teen
name + member ID · teen email · activity centre · registration date · guardian name + email · waiting
days badge · DBS/FA chips (optional) · Approve/Reject.
**Reject Modal:** Rejection Reason (required, free text) · Cancel / Confirm Reject.
**Toasts:** "Guardian consent approved successfully." / "Guardian consent rejected successfully." /
failure variants. Optional notifications: guardian on request/reminder; teen/member on decision.
**Edge:** guardian already acted → conflict + refresh; missing guardian email → record should not
appear (if opened directly, safe error); audit failure → block.
**Audit:** GUARDIAN_CONSENT_APPROVE (on-behalf flag = true) · GUARDIAN_CONSENT_REJECT (reason free
text) · CONFLICT/BLOCKED_ACTION.
**API:** GET `/admin/members?status=PendingParentalConsent&memberType=Teen&ageGroup=Kishor` · POST
`/admin/members/{id}/guardian-consent/approve` (on behalf) · POST
`/admin/members/{id}/guardian-consent/reject` (body: reason).

---

## Cross-module note — Age taxonomy (RESOLVED 2026-06-21)

Two age taxonomies coexist in this module and must never be conflated:

**MemberType (3-band — safeguarding/business logic):**
| MemberType | Age range | Governs |
|------------|-----------|---------|
| Child | < 12 | No independent login; no guardian form fields required |
| Teen | 12–17 | Guardian consent required; Sub-module C routing; Kishor guardian section in Detail |
| Adult | ≥ 18 | Standard member |

**AgeGroup (6-band — HSS cultural taxonomy — confirmed 2026-06-21):**
| AgeGroup | Age range | Display label |
|----------|-----------|---------------|
| Bal(ika) | 0–5 | Bal(ika) |
| Shishu | 6–11 | Shishu |
| Kishor(i) | 12–16 | Kishor(i) |
| Tarun(i) | 17–30 | Tarun(i) |
| Yuva(ti) | 30–60 | Yuva(ti) |
| Jyestha(a) | 60+ | Jyestha(a) |

**Coexistence rules:**
- `memberType` and `ageGroup` are stored as separate fields; neither overrides the other.
- A 17-year-old is `memberType = Teen` AND `ageGroup = Tarun`. Both are correct simultaneously.
- A 12-year-old is `memberType = Teen` AND `ageGroup = Kishor`. Both are correct simultaneously.
- Guardian section in Member Details is gated on `ageGroup === 'kishor'` (12–16) per user-confirmed B4.
- Sub-module C eligibility is gated on `memberType === 'teen'` (12–17) — this means 17-year-olds (Tarun) are in Sub-module C but do NOT show the guardian detail section in Member Details. This is the confirmed intended behaviour.
- Guardian fields in Add Member are shown for `memberType === 'teen'` (age 12–17); NOT shown for Child or Adult (user-confirmed B3).

**Cross-references:** `00-global.md` §Target Users · `03-authentication.md` US-010.
