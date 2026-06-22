# 04 — Masters (Super Admin)

**Maps to Doc tab:** Masters · **Platform:** Admin Web · **Risk Level:** High · **Version:** 1.2
**Stories:** US-001 to US-005

## Overview
System-wide reference data foundation. Manages the organisational hierarchy
(Country/Org → Region → Town → Activity Centre) and the Responsibility reference list
(Role Types). Every other module depends on Masters for scoping, filtering, mapping, and
targeting. Super Admins have full CRUD; Hierarchy Role users have view-only scoped to their
level. All mutations are server-validated, dependency-checked, and immutably audited.

**Terminology:** "Country" = Organisation/National entity (e.g. HSS UK), NOT a geographic
country list. "Role Types" = Responsibility/Department/Job Title reference values (non-RBAC).
Timestamp display = organisation-configured timezone (NOT IP-based).

## Access Matrix
| Action | Super Admin | Hierarchy Role User |
|--------|-------------|---------------------|
| View listings | ✅ | ✅ (scoped) |
| Search / Filters / Pagination + View All | ✅ | ✅ |
| Export CSV | ✅ | ❌ |
| Create / Edit / Activate-Deactivate / Delete (governed) | ✅ | ❌ |

## Hierarchy Rules
- Region → exactly one Country; Town → exactly one Region; Activity Centre → exactly one Town.
- Name uniqueness: Country system-wide; Region within Country; Town within Region; AC within Town; Role Types system-wide (case-insensitive).
- Parent change on in-use record: allowed (delete dependency rules still enforced).
- Deactivate parent with active children: blocked.
- Delete with dependencies: blocked; use Deactivate.

## Listing Utilities (all tabs)
Free-text search · cascading filters (Country → Region → Town; Status) · pagination
10/20/50/100/View All (lazy load 50 per increment) · Export CSV (SA only, respects filters).
Export columns (min): Name, Parent references, Status, Last updated (org timezone).

## Notifications & Feedback (exact copy)
| Event | Type | Message |
|-------|------|---------|
| Create success | Toast | "Record created successfully." |
| Update success | Toast | "Record updated successfully." |
| Status change success | Toast | "Status updated successfully." |
| Delete success | Toast | "Record deleted successfully." |
| Blocked delete | Toast | "Cannot delete. This record is in use." |
| Duplicate name | Toast/Field | Duplicate validation message (exact copy **[TBD]**) |
| Activate/Deactivate | Modal | "Confirm Status Change" / "Are you sure you want to activate/deactivate this record?" |
| Delete | Modal | "Confirm Deletion" / "Are you sure you want to delete this record?" |
| Concurrency conflict | Toast/Block | "This record was updated by someone else. Please refresh and try again." |

## Delete Governance
Blocks delete: members reference record · events reference record · child Masters exist ·
Role Type has member assignment mappings. Zero dependencies → delete allowed.

## API Error Codes
400 validation · 401 unauthenticated · 403 forbidden · 404 not found · 409 conflict
(duplicate/blocked delete/concurrency) · 500 server error.

## Module Open Questions
| # | Question |
|---|----------|
| Q1 | AC address field "Country" — default from Org/National? |
| Q2 | AC API field `addressCountry` — final inclusion + default logic |
| Q3 | Exact duplicate-name validation copy |
| Q4 | Do Age group/Gender/DBS/First Aid filters apply to Masters or only Members listing? |
| Q5 | Concurrency: Last-timestamp only, or ETag/version too? |
| Q6 | Audit log UI access — SA in Admin Web, or backend tooling only? |

---

## US-001 · Country (Org/National) — Listing & CRUD

**User Story:** allow SA to list/create/view/update/activate-deactivate/delete Country records
(top-level entity), enforcing uniqueness, dependency-based deletion governance, and immutable audit.

**Listing columns:** Name · Status · Last updated · Actions (SA only).
**Create/Edit fields:** Name (text, required, unique system-wide case-insensitive, "Name is
required."/duplicate) · Status (toggle, default Active).

**Business logic:** Create → validate non-empty + unique → persist → "Record created
successfully." → audit CREATE/COUNTRY. Edit → validate uniqueness + concurrency → "Record
updated successfully." → UPDATE/COUNTRY. Negative: duplicate (field msg), missing name, concurrency
conflict (CONFLICT/COUNTRY), server error. Edge: delete with dependencies (child Regions or
Members/Events) → blocked "Cannot delete. This record is in use." (BLOCKED_ACTION); delete zero
deps → allowed; deactivate with active Regions → blocked; inactive Country not selectable in new
registrations/events (historical retained); no permission → "Access denied."
**Audit:** CREATE, UPDATE, STATUS_CHANGE, DELETE, BLOCKED_ACTION (incl. reason + dependencyCounts),
CONFLICT. Immutable, append-only.

**Acceptance:** listing columns shown · create on unique non-empty · block duplicate ·
update on valid edit · block on concurrency mismatch · confirmation modal before delete; block
if deps · delete only when zero deps · block deactivation with active child Regions · inactive
not selectable in new registrations/events · audit every mutation + blocked action.

**API:** GET/POST/PUT/DELETE `/masters/countries[/{id}]` (SA only for mutations; GET = SA +
scoped Hierarchy); GET `/masters/countries/export`; GET `/masters/dependencies?type=COUNTRY&id=`.

**Open Questions:** Q1 max char limit for Name? · Q2 exact duplicate-name copy?

---

## US-002 · Region — Listing & CRUD
Region belongs to exactly one Country; name unique within Country; cascading Country filter.
**Fields:** Country (dropdown, required, active) · Region Name (required, unique within Country) ·
Status. **Logic:** create/edit (parent change allowed while in use) with uniqueness in new
Country scope + concurrency; delete blocked if child Towns or Members/Events; deactivate blocked
if active child Towns; inactive not selectable in new registrations/events. **Audit:** CREATE/
UPDATE/STATUS_CHANGE/DELETE/BLOCKED_ACTION/CONFLICT (REGION). **API:** `/masters/regions[/{id}]`
(+ `/export`), query `countryId`.

## US-003 · Town — Listing & CRUD
Town belongs to exactly one Region; name unique within Region; cascading Country + Region filters.
**Fields:** Country · Region (cascades) · Town Name (unique within Region) · Status. **Logic:**
delete blocked if child Activity Centres or Members/Events; deactivate blocked if active child
ACs; parent change allowed; inactive not selectable in new registrations/events. **Audit:** TOWN
variants. **API:** `/masters/towns[/{id}]` (+ `/export`), query `countryId`, `regionId`.

## US-004 · Activity Centre — Listing, CRUD, Contact & Address
AC belongs to exactly one Town; name unique within Town; includes mandatory Contact + Address.
**Listing (min):** Country · Region · Town · AC Name · Contact Name · Contact Email/Phone ·
Status · Last updated · Actions. Filters Country → Region → Town (all optional).
**Fields:**
| Field | Required | Validation |
|-------|----------|-----------|
| Activity Centre Name | Yes | Unique within Town (case-insensitive) |
| Country / Region / Town | Yes | Cascading; active selections |
| Contact Name | Yes | Non-empty |
| Contact Email | No | Valid email if provided ("Enter a valid email address.") |
| Contact Phone | No | Valid phone if provided ("Enter a valid phone number.") |
| Address Line 1 | Yes | Non-empty |
| Address Line 2 | No | — |
| City/Town | Yes | Non-empty |
| County/State | No | — |
| Postcode | Yes | Non-empty; valid postcode format |
| Country (Address) | No | **[TBD — may default from Org/National]** |

**Logic:** create validates all required + uniqueness + email/phone/postcode formats; edit allows
Town parent change while referenced; delete blocked if Members/Events reference (else allowed
zero-dep); deactivate not blocked by children (ACs have none) but needs confirmation; soft warning
recommended if both Contact Email + Phone empty. **Audit:** CENTRE variants. **API:**
`/masters/centres[/{id}]` (+ `/export`); full payload incl. contact + address fields.
**Open Questions:** Q1 address Country default? · Q2 phone format (UK/international)? · Q3 postcode
format (UK regex/open)? · Q4 soft warning when both contact methods empty?

## US-005 · Responsibility (Role Types) — Listing & CRUD
*(Source tab header present; detail not expanded in source.)* Role Types reference values, unique
system-wide (case-insensitive), non-RBAC. CRUD + Active/Inactive. Delete blocked if Role Type has
member assignment mappings. **[TBD — Needs Confirmation]** full field/validation/AC detail when
source is expanded.

---

> **[FRONTEND-RECONCILE]** Verify cascading dropdown behaviour, listing columns, the
> Activity Centre contact/address field set (required vs optional), pagination options,
> and exact toast/modal copy against the live Masters screens.
