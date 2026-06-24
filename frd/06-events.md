# 06 — Karyakrams (Events) Module

**Version:** 1.0 | **Status:** Draft | **Date:** 2026-06-22
**Screens:** US-601 to US-607
**Maps to Doc tab:** Karyakrams | **Platform:** Admin Web + Member Web | **Risk Level:** High

---

## Screens Covered

| Story ID | Screen | Primary Roles |
|----------|--------|---------------|
| US-601 | Karyakram Listing — Admin | All admin roles, Reporting User, Shakha Operations |
| US-602 | Karyakram Listing — Member / Teen | Adult Member, Teen Member |
| US-603 | Create Karyakram | Roles with `events.add` permission |
| US-604 | Karyakram Detail — Overview Tab | All roles |
| US-605 | Karyakram Detail — Participants Tab | Admin roles, Reporting User |
| US-606 | Karyakram Detail — Media Tab | All roles |
| US-607 | Member Registration (Request to Attend) | Adult Member, Teen Member |

---

## Module Data Model

### Event Entity

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | System | Pattern `EVT-NNN`; auto-generated |
| `name` | string | Yes | Karyakram title; max 150 chars |
| `status` | enum | System | `draft \| active \| cancelled \| completed`; system-managed. (`published` retired — legacy only.) |
| `country` | string | Yes | Masters hierarchy L1 |
| `region` | string | Yes | Vibhaag — Masters L2 |
| `town` | string | Yes | Nagar — Masters L3 |
| `activityCentre` | string | Yes | Shakha — Masters L4 |
| `locationType` | enum | Yes | `physical \| online` |
| `venueAddress` | string | Conditional | Required when `locationType === 'physical'` |
| `onlineUrl` | string | Conditional | Required when `locationType === 'online'`; valid URL format |
| `startDate` | ISO datetime UTC | Yes | Must be in future at creation |
| `endDate` | ISO datetime UTC | Yes | Must be after `startDate` |
| `paymentType` | enum | Yes | `paid \| free` |
| `priceCategories` | EventPriceCategory[] | Conditional | Required when `paid`; min 1 item; currency GBP (£) |
| `capacity` | number | Optional | Integer ≥ 1; unlimited if absent |
| `description` | string | Optional | Free text; max 2000 chars |
| `imageUrl` | string | Optional | Event banner image URL |
| `termsAndConditions` | string | Optional | Falls back to system default if absent |
| `filterAgeCategories` | AgeGroup[] | Optional | "Select All" = no restriction on this dimension |
| `filterGenders` | enum[] | Optional | `'male' \| 'female'`; "Select All" = no restriction |
| `filterJobTitles` | string[] | Optional | Role Type / Responsibility values; "Select All" = no restriction |
| `guestRegistrationEnabled` | boolean | Optional | Default `false` |
| `customQuestions` | EventCustomQuestion[] | Optional | Registration questions shown to member at sign-up |
| `cancelledDate` | ISO datetime UTC | System | Set on cancellation |
| `cancellationReason` | string | Conditional | Required when admin cancels; collected via cancel modal |
| `metrics.going` | number | System | Live count of participants with `rsvp === 'going'` |
| `metrics.participantCount` | number | System | Total active participants |
| `metrics.mediaCount` | number | System | Total media items |
| `createdDate` | ISO datetime UTC | System | Set on creation |
| `lastUpdated` | ISO datetime UTC | System | Updated on every mutation |

**Retired fields (not in scope):** `host`, `metrics.maybe`, `metrics.notGoing`

### Age Bands (canonical — confirmed)

| Value | Label |
|-------|-------|
| `bal` | Bal(ika) (0–5) |
| `shishu` | Shishu (6–11) |
| `kishor` | Kishor(i) (12–16) |
| `tarun` | Tarun(i) (17–30) |
| `yuva` | Yuva(ti) (30–60) |
| `jyestha` | Jyestha(a) (60+) |

### EventPriceCategory

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `PC-1` |
| `label` | string | e.g. "Standard", "Student", "Family (2+2)"; required |
| `price` | number | GBP; ≥ 0 |

### EventCustomQuestion

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `CQ-1` |
| `label` | string | Question text; max 200 chars; required |
| `type` | enum | `text \| dropdown \| checkbox` |
| `options` | string[] | Required when `type === 'dropdown'`; min 2 options |
| `required` | boolean | If `true`, blocks registration submission until answered |

### EventParticipant

| Field | Type | Notes |
|-------|------|-------|
| `memberId` | string | FK to Member |
| `name` | string | Denormalised display name |
| `email` | string | Denormalised |
| `phone` | string | Denormalised; may be empty string |
| `memberType` | enum | `adult \| teen \| child` |
| `rsvp` | enum | `requested \| going \| denied` |
| `isCoordinator` | boolean | Default `false`; only meaningful when `rsvp === 'going'` |
| `customAnswers` | Record\<string, string\|boolean\> | Keyed by `EventCustomQuestion.id` |

### EventMedia

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `MED-001` |
| `memberId` | string | Empty string for admin uploads |
| `memberName` | string | Display name of uploader |
| `type` | enum | `image \| video` |
| `caption` | string | Optional; max 200 chars |
| `postedAt` | ISO datetime UTC | |
| `imageUrl` | string | Optional; absent = gradient placeholder rendered |

### Event Status State Machine

| From | To | Trigger | Actor |
|------|----|---------|-------|
| — | `draft` | Creation | Admin |
| `draft` | `active` | `startDate` reached (or admin manually activates) | System / Admin |
| `active` | `completed` | `endDate` passed | System |
| `draft \| active` | `cancelled` | Admin cancel action | Admin |
| `cancelled` | — | Terminal state | — |
| `completed` | — | Terminal state | — |

> **Note — `published` status retired:** The `published` state appeared in legacy mock data but is not part of the active lifecycle. Events are visible to members when `status === 'active'`. Admins may manually activate or deactivate (`draft ↔ active`) before `startDate`; after `startDate` the system auto-sets `active`.

**Confirmed:** No separate `publishDate` field exists. The `draft → published` transition is not date-triggered by a publish date. Status lifecycle is: `draft` (creation) → `active` (auto at `startDate`) → `completed` (auto at `endDate`). The `published` status is **retired from the lifecycle** — it existed in legacy mock data only. Events are visible to members when `status === 'active'`. Admins may manually activate/deactivate (draft ↔ active) before `startDate`.

### RSVP States (participant-level)

| State | Meaning | Actor |
|-------|---------|-------|
| `requested` | Member submitted registration; awaiting admin review | Member |
| `going` | Admin approved registration | Admin |
| `denied` | Admin rejected registration | Admin |

No "Maybe", "Not Going", "Checked-in", or "Refunded" states exist. These are retired from the data model.

---

## US-601 — Karyakram Listing (Admin)

### 1. User Story

The system shall allow admin roles (Super Admin, Kendriya Admin, Vibhaag Admin, Nagar Admin, Shakha Admin, Event Admin, Reporting User, Shakha Operations) to view, search, filter, and manage Karyakrams within their hierarchy scope from a listing page with Grid, List, and Table view modes.

### 2. Screen Purpose

Primary entry point to the Karyakrams module for all admin and operational roles. Displays a scoped list of Karyakrams with summary KPI widgets at the top. Enables text search, date range filtering, advanced multi-condition filtering, column visibility control (Table view), multi-select, and row-level actions. Role-based action visibility ensures only permitted operations are presented.

### 3. Fields & Validation

**Summary Widgets (read-only counters)**

| Widget | Value Source |
|--------|-------------|
| Total Karyakrams | Count of all events in scope |
| Active | Count of `status === 'active'` events in scope |
| Draft | Count of `status === 'draft'` events in scope (`published` status retired) |
| Completed | Count of `status === 'completed'` events in scope |

**Search**

| Field | Type | Validation |
|-------|------|------------|
| Search | text | Searches `name` and `id`; debounced 300 ms; min 1 character to trigger |

**Date Range Filter**

| Field | Validation |
|-------|------------|
| From Date | Optional; must be ≤ To Date when both set. Error: "From Date cannot be after To Date." |
| To Date | Optional; must be ≥ From Date when both set. Error: "To Date cannot be before From Date." |

**Card / Row fields displayed**

| Field | Source |
|-------|--------|
| Karyakram name | `event.name` |
| Status badge | `event.status` (colour-coded per status table in US-604 §3) |
| Location | `event.activityCentre`, `event.town` |
| Start date | `event.startDate` formatted DD MMM YYYY HH:mm UTC |
| End date | `event.endDate` formatted DD MMM YYYY HH:mm UTC |
| Payment / Price | `formatPriceRange(event)`: `£min–£max` if price categories; `£N` if single; "Free" if free |
| Going | `event.metrics.going` |
| Media | `event.metrics.mediaCount` |

### 4. Business Logic

**4.1 Positive Flow**
1. User navigates to Karyakrams via sidebar ("Karyakrams", id: `event-management`).
2. System loads events filtered by user's hierarchy scope (`filterByScope`).
3. Summary widgets display counts from scoped events.
4. Default view mode: Grid. User switches to List or Table via view mode toggle.
5. Text search filters results in real time (debounced 300 ms).
6. Date range filter narrows results to events whose `startDate` falls within the range.
7. Advanced filter popup (Where / Is conditions) allows multi-select field filtering.
8. User clicks a card or row → navigates to Karyakram Detail (US-604).
9. Row action menu renders only actions permitted for the user's role (see §4.5).

**4.2 Negative Flow**
- Zero results matching filters: empty state "No Karyakrams found matching your criteria." with "Reset Filters" button.
- Activate / Deactivate when `status === 'cancelled'` or `status === 'completed'`: toast error "Cannot change status of a cancelled or completed Karyakram."
- Delete when `startDate ≤ now`: toast error "This Karyakram can no longer be deleted after it starts."
- Delete when `status === 'completed'`: toast error "Completed Karyakrams cannot be deleted."
- Cancel when `status === 'cancelled'` or `status === 'completed'`: action absent from menu.

**4.3 Edge Cases**
- Admin with regional scope sees only events in their Vibhaag / Nagar / Shakha; cross-scope events are never returned.
- Summary widget "Total Karyakrams" must reflect only scoped events (consistent with Active / Draft / Completed widgets). [FRONTEND-RECONCILE: current prototype uses unscoped `events.length` for Total — fix required.]
- Multi-select with mixed statuses: bulk actions apply only where the action is valid per item; invalid items show per-item error toast; valid items proceed.
- Pagination: navigating pages resets scroll position to top.

**4.4 Audit Rules**
All status changes, cancellations, and deletions triggered from this screen are audited identically to those triggered from the Detail screen (see US-604 §4.4).

**4.5 RBAC**

| Action | Super Admin | Kendriya | Vibhaag | Nagar | Shakha | Event Admin | Reporting | Shakha Ops |
|--------|:-----------:|:--------:|:-------:|:-----:|:------:|:-----------:|:---------:|:----------:|
| View listing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search / filter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export (Excel / PDF) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Karyakram | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Modify | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Activate / Deactivate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancel | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

### 5. Navigation Rules

**Entry Points**

| Entry Point | From |
|-------------|------|
| Sidebar "Karyakrams" | Any page |
| Dashboard cross-module link (via `initialEventId`) | Dashboard |

**Exit Points**

| Exit | Destination |
|------|-------------|
| Click card / row | US-604 Karyakram Detail |
| Click "Create Karyakram" button | US-603 Create modal (overlay) |
| Row action "Modify" | US-604 → US-603 Edit form |

### 6. Notifications

No module-level notifications from listing page beyond inline toast messages.

### 7. Acceptance Criteria

- [ ] Admin with Vibhaag scope sees only events in that Vibhaag; events from other regions are not returned.
- [ ] Summary widget "Active" count matches the number of `status === 'active'` events in scope.
- [ ] Search results update within 300 ms of last keystroke.
- [ ] "Activate / Deactivate" action is absent from the row menu for cancelled and completed events.
- [ ] "Delete" action is absent from the row menu when `startDate ≤ now` or `status === 'completed'`.
- [ ] Reporting User sees listing and export controls but no Create, Modify, Cancel, or Delete actions.
- [ ] Shakha Operations sees listing only; no action buttons are rendered.
- [ ] View mode toggle (Grid / List / Table) persists within the session; default is Grid.

### 8. API Mapping

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch listing | GET | `/api/v1/events?scope={scope}&page={n}&pageSize={n}&search={q}&from={date}&to={date}&status={s}` |
| Activate / Deactivate | PATCH | `/api/v1/events/{id}/status` — body: `{ status: 'active' \| 'draft' }` |
| Cancel | PATCH | `/api/v1/events/{id}/cancel` — body: `{ cancellationReason: string }` |
| Delete | DELETE | `/api/v1/events/{id}` |
| Export | GET | `/api/v1/events/export?format={excel\|pdf}&scope={scope}` |

### 9. Data Rules

- Events are soft-deleted: `deletedAt` timestamp set; not returned in listings. Soft-deleted event records retained for **1 year** from deletion date, then purged.
- Cancelled events are never auto-deleted; only removed by explicit admin delete where `canDelete` is true.
- PII in event records (`venueAddress`, `onlineUrl`) is venue data, not member PII; standard retention applies.

### 10. Dependencies

- Masters module: hierarchy values for scope filtering (Country, Vibhaag, Nagar, Shakha).
- Roles & Permissions module: `events.*` permission flags per role.
- Members module: participant counts linked to member records.

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | What is the default page size for listing pagination? | No |
| Q2 | Should "Total Karyakrams" widget use scoped count (consistent with other widgets) or unscoped? Current prototype is unscoped — inconsistent. | Yes |
| Q3 | Are cancelled events visible in the admin listing by default, or filtered out? Currently returned in mock data. | No |

---

## US-602 — Karyakram Listing (Member / Teen)

### 1. User Story

The system shall allow Adult Member and Teen Member roles to view Karyakrams available to them, track their own registration status, and review their history of attended events — from a simplified listing page with no admin actions.

### 2. Screen Purpose

Member-facing Karyakrams view. Shows only `active` events (the `published` status is retired). Organised into three fixed sections: upcoming unregistered, upcoming registered, and completed/attended. Driven by the member's own participation records. No admin actions; no view mode switcher; no advanced filters.

### 3. Fields & Validation

**Summary Widgets (read-only)**

| Widget | Value |
|--------|-------|
| Total Karyakrams Attended | Count of past events (`startDate ≤ now`) where member's `rsvp === 'going'` |
| Upcoming (Not Yet Registered) | Count of future non-cancelled events with no participation record for this member |
| Upcoming (Registered) | Count of future non-cancelled events where member's `rsvp === 'going'` or `'requested'` |

**Panels**

| Panel Title | Events Shown | Cap | Sort |
|-------------|-------------|-----|------|
| Upcoming Karyakrams – Not Yet Registered | Future (`startDate > now`), non-cancelled, member has no participant record | 3 | Ascending by `startDate` |
| Upcoming Karyakrams – Registered | Future, non-cancelled, member `rsvp === 'going'` or `'requested'` | 3 | Ascending by `startDate` |
| Completed Karyakrams – Attended | Past (`startDate ≤ now`), member `rsvp === 'going'` | None | Descending by `startDate`; grouped by year |

**Search bar:** text input; filters across all three panels by `event.name`.

### 4. Business Logic

**4.1 Positive Flow**
1. Member navigates to Karyakrams via sidebar.
2. System resolves member ID from role context (`Adult Member → MBR-xxx`; `Teen Member → MBR-yyy`).
3. System filters available events to `status === 'active'` only (`published` status retired).
4. Events are classified into three buckets using the member's participation records.
5. Summary widgets display counts. Panels show up to 3 upcoming events each.
6. Member clicks an event card → Karyakram Detail US-604 (member view).

**4.2 Negative Flow**
- Member with no participation records: "Registered" and "Attended" panels show empty state "No Karyakrams yet."
- All upcoming events already registered: "Not Yet Registered" panel shows empty state.
- No upcoming events available: both upcoming panels show empty state.

**4.3 Edge Cases**
- `draft`, `cancelled`, and `completed` events are entirely hidden from member listing; status badges for these are never seen by members in the listing. (`published` status retired — not applicable.)
- Events where member's `rsvp === 'denied'` do not appear in "Registered" panel. [TBD — Needs Confirmation — **BLOCKING**: do denied members re-appear in "Not Yet Registered" to allow re-registration? See US-607 Q4.]
- "Attended" is inferred, not stored: past event + `rsvp === 'going'` = attended. No manual mark-attended action exists.
- Teen members see the same events as adult members, subject to audience filter eligibility at registration time.

**4.4 Audit Rules**

No audit events from member listing view. Registration actions audited in US-607 §4.4.

**4.5 RBAC**

| Action | Adult Member | Teen Member |
|--------|:------------:|:-----------:|
| View listing (member panels) | ✅ | ✅ |
| Search | ✅ | ✅ |
| Click event → Detail | ✅ | ✅ |
| Any admin action | ❌ | ❌ |

### 5. Navigation Rules

| Entry Point | From |
|-------------|------|
| Sidebar "Karyakrams" | Any page |

| Exit | Destination |
|------|-------------|
| Click event card in any panel | US-604 Detail — Overview tab (member view) |

### 6. Notifications

None from listing page.

### 7. Acceptance Criteria

- [ ] Member sees only `active` events; `draft`, `cancelled`, and `completed` events are absent. (`published` status retired.)
- [ ] Summary widget counts match corresponding panel item totals.
- [ ] "Not Yet Registered" panel shows ≤ 3 events sorted ascending by `startDate`.
- [ ] "Registered" panel shows events where member's `rsvp === 'going'` or `'requested'`.
- [ ] "Attended" table shows only past events where member's `rsvp === 'going'`, sorted descending, grouped by year.
- [ ] No Create, Modify, Cancel, or Delete buttons are rendered anywhere on this screen.
- [ ] Teen Member sees identical listing logic to Adult Member, subject to audience filter eligibility.

### 8. API Mapping

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch available events | GET | `/api/v1/events?status=active` |
| Fetch member participations | GET | `/api/v1/members/{memberId}/participations` |

### 9. Data Rules

- Member participation records are personal data; not exposed to other members.
- "Attended" status is a derived display value; not stored as a separate field.

### 10. Dependencies

- US-607: Registration flow creates participation records surfaced here.
- Members module: `memberId` from session role context.

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | Should denied members re-appear in "Not Yet Registered" to allow re-registration? | Yes |
| Q2 | Should "Not Yet Registered" panel offer a "See all" link when more than 3 events exist? | No |

---

## US-603 — Create Karyakram

### 1. User Story

The system shall allow admin roles with `events.add` permission to create a new Karyakram via a modal form, specifying location hierarchy, schedule, payment model, audience filters, custom registration questions, and optional terms — with the event created in `draft` status on save.

### 2. Screen Purpose

Modal overlay on the Karyakram Listing (admin). Collects all configuration for a new event. Validates all required fields before saving. New event is always created in `draft` status; it does not auto-publish on creation.

### 3. Fields & Validation

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Karyakram Title | text | Yes | 1–150 chars | "Karyakram Title is required." / "Title must be 150 characters or fewer." |
| Country | select (Masters) | Yes | Active Masters value; Only active Masters values shown; inactive values filtered from dropdown. | "Country is required." |
| Vibhaag | select (Masters) | Yes | Cascades from Country; Only active Masters values shown; inactive values filtered from dropdown. | "Vibhaag is required." |
| Nagar | select (Masters) | Yes | Cascades from Vibhaag; Only active Masters values shown; inactive values filtered from dropdown. | "Nagar is required." |
| Shakha | select (Masters) | Yes | Cascades from Nagar; Only active Masters values shown; inactive values filtered from dropdown. | "Shakha is required." |
| Location Type | radio | Yes | `physical` or `online` | "Location Type is required." |
| Venue Address | textarea | Conditional | Required when `physical`; max 300 chars | "Venue Address is required for physical Karyakrams." |
| Online URL | text | Conditional | Required when `online`; valid URL | "Online URL is required for online Karyakrams." / "Online URL must be a valid URL." |
| Start Date / Time | datetime picker | Yes | Must be in future at creation | "Start Date must be in the future." |
| End Date / Time | datetime picker | Yes | Must be after Start | "End Date must be after Start Date." |
| Payment Type | radio | Yes | `paid` or `free` | "Payment Type is required." |
| Price Categories | repeating group | Conditional | Min 1 when `paid`; label non-empty; price ≥ 0 | "Add at least one price category for paid Karyakrams." / "Price category label is required." / "Price must be 0 or greater." |
| Capacity | number | No | Integer ≥ 1 if provided | "Capacity must be a whole number of 1 or more." |
| Description | textarea | No | Max 2000 chars | "Description must be 2000 characters or fewer." |
| Banner Image | [TBD — file / URL] | No | [TBD] | [TBD — Needs Confirmation] |
| Age Categories | multi-select | No | Values from age band enum; "Select All" = no restriction | — |
| Genders | multi-select | No | `male`, `female`; "Select All" = no restriction | — |
| Role Types | multi-select | No | Values from Masters role type list; "Select All" = no restriction | — |
| Allow Guest Registration | checkbox | No | Default unchecked | — |
| Custom Questions | repeating group | No | Label 1–200 chars; type required; `dropdown` requires ≥ 2 options | "Question label is required." / "Dropdown questions require at least 2 options." |
| Terms & Conditions | textarea | No | Falls back to system default T&C if blank | — |

**Cascade behaviour:** Selecting Country clears and re-populates Vibhaag; selecting Vibhaag clears Nagar and Shakha; selecting Nagar clears Shakha. All downstream selects reset on parent change.

**Audience filter "Select All":** Each dimension (Age Categories, Genders, Role Types) has a "Select All" option. Selecting "Select All" means no restriction on that dimension. If at least one specific value is selected on a dimension (without "Select All"), only members matching that value are eligible to register. Enforcement occurs at registration (US-607), not at creation time.

### 4. Business Logic

**4.1 Positive Flow**
1. Admin clicks "Create Karyakram" on the listing.
2. Modal opens with all fields empty / default.
3. Admin fills in form. Cascading selects populate Vibhaag → Nagar → Shakha options dynamically.
4. On Save: all validations run. If all pass → system creates event with `status: 'draft'`, `createdDate: now`, `lastUpdated: now`, `metrics: { going: 0, participantCount: 0, mediaCount: 0 }`.
5. Toast: "Karyakram created successfully."
6. Modal closes. Listing refreshes with new event visible.

**4.2 Negative Flow**
- Any required field empty on Save: fields highlighted red; inline error messages shown; save blocked.
- `paymentType === 'paid'` with no price categories: "Add at least one price category for paid Karyakrams."
- `startDate` in the past: "Start Date must be in the future."
- `endDate` before `startDate`: "End Date must be after Start Date."
- Creating with an inactive or archived Masters value (Country / Vibhaag / Nagar / Shakha): system blocks save with error: "Selected [field name] is inactive. Choose an active location to proceed." Inactive values are not shown in cascade dropdowns — they are filtered out at the dropdown population level so the error only triggers if a value becomes inactive after being selected.

**4.3 Edge Cases**
- Switching `paymentType` from `paid` to `free`: price categories are cleared silently; no validation error on residual categories.
- Switching `locationType` from `physical` to `online`: `venueAddress` field cleared; `onlineUrl` field shown.
- Custom question type changed from `dropdown` to `text`: options are cleared.
- Audience filter "Select All" on a dimension removes individual selections for that dimension.
- All three audience filter dimensions left as "Select All": all members are eligible to register (no restriction).

**4.4 Audit Rules**

| Action | Audit Event | Fields Logged |
|--------|-------------|---------------|
| Create | `KARYAKRAM_CREATED` | `actorId`, `newEventId`, `eventName`, `status: 'draft'`, `timestamp` |

**4.5 RBAC**

| Action | Super Admin | Kendriya | Vibhaag | Nagar | Shakha | Event Admin | Reporting | Shakha Ops |
|--------|:-----------:|:--------:|:-------:|:-----:|:------:|:-----------:|:---------:|:----------:|
| Access Create modal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### 5. Navigation Rules

| Entry | From |
|-------|------|
| "Create Karyakram" button | US-601 Admin Listing |

| Exit | Destination |
|------|-------------|
| Save success | Modal closes; US-601 listing (refreshed, new event visible) |
| Cancel / Close | Modal closes; US-601 listing (unchanged) |

### 6. Notifications

| Trigger | Channel | Recipient | Content | Timing |
|---------|---------|-----------|---------|--------|
| Karyakram created | In-app toast | Creating admin | "Karyakram created successfully." | Immediate |

### 7. Acceptance Criteria

- [ ] All required fields are validated on Save; form does not submit with any required field empty.
- [ ] `paid` payment type with zero price categories blocks save with exact error message.
- [ ] Choosing Country clears Vibhaag, Nagar, and Shakha dropdowns and re-populates Vibhaag options.
- [ ] "Select All" on any audience filter dimension means no restriction on that dimension at registration.
- [ ] New event is created with `status: 'draft'` and appears in admin listing immediately after save.
- [ ] Reporting User and Shakha Operations do not see the "Create Karyakram" button.
- [ ] Cancelling the modal creates no event record.

### 8. API Mapping

| Action | Method | Endpoint |
|--------|--------|----------|
| Create event | POST | `/api/v1/events` — body: full event payload |
| Fetch Masters (country) | GET | `/api/v1/masters/countries` |
| Fetch Masters (region) | GET | `/api/v1/masters/regions?countryId={id}` |
| Fetch Masters (town) | GET | `/api/v1/masters/towns?regionId={id}` |
| Fetch Masters (shakha) | GET | `/api/v1/masters/activity-centres?townId={id}` |
| Fetch Masters (role types) | GET | `/api/v1/masters/role-types` |

### 9. Data Rules

- New events created as `draft`; not visible to members until `status === 'active'` (`published` status retired).
- Custom questions stored as array on the event entity; member answers stored per participant on registration.
- Standard T&C text stored as a system constant; overridden per event when `termsAndConditions` field is populated.

### 10. Dependencies

- Masters module: cascade dropdowns for hierarchy and role type list.
- US-601: "Create Karyakram" button entry point.
- US-604: Detail view of newly created event.

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | Is banner image a file upload (to object storage) or a URL text input? | No |
| Q2 | ~~Should creation with an inactive / archived Masters value be blocked (error) or warned (proceed with caution)?~~ **Resolved:** Hard block — inactive values filtered from dropdowns; if stale, error shown. | Resolved |
| Q3 | ~~Auto-notify members on publish?~~ **Resolved:** No — members are not notified when an event becomes active. Members discover events by browsing the listing. | Resolved |
| Q4 | ~~Does a separate `publishDate` field exist?~~ **Resolved:** No. `published` status retired. Events go `draft → active` at `startDate`. | Resolved |

---

## US-604 — Karyakram Detail — Overview Tab

### 1. User Story

The system shall allow all roles to view the full details of a Karyakram on an Overview tab, with role-appropriate action buttons (admin: Modify, Cancel, Delete; member: Register or current RSVP status display) and live participation stat cards (admin) or own registration answers (member).

### 2. Screen Purpose

Primary detail view for a Karyakram. The default tab on opening. Admin view shows complete event configuration, live participant stat cards (Requested / Going / Denied), and governance action buttons. Member view shows condensed event details, their own RSVP status, and custom question answers if registered.

### 3. Fields & Validation

**Admin Overview — fields displayed**

| Field | Display Label |
|-------|--------------|
| `name` | Karyakram Title |
| `status` | Status badge (colour-coded) |
| `locationType` + `venueAddress` / `onlineUrl` | Location |
| `startDate` | Start Date & Time |
| `endDate` | End Date & Time |
| `paymentType` + `priceCategories` | Payment / Price |
| `capacity` | Capacity ("N spots" or "Unlimited" if absent) |
| `description` | About this Karyakram |
| `filterAgeCategories` | Target Age Groups ("All" if "Select All") |
| `filterGenders` | Target Gender ("All" if "Select All") |
| `filterJobTitles` | Target Role Types ("All" if "Select All") |
| Guest registration URL | Shown only when `guestRegistrationEnabled === true` |
| `customQuestions` | Additional Registration Questions list (type badge + Required badge per question) |
| `termsAndConditions` | Terms & Conditions (expandable section) |
| Requested / Going / Denied | Live stat cards computed from participant records |

**Member Overview — fields displayed**

| Field | Display |
|-------|---------|
| `name` | Karyakram Title |
| `locationType` + address / URL | Location |
| `startDate` | Start Date |
| `endDate` | End Date |
| Member's `rsvp` | Status badge (see below) |
| Member's `customAnswers` | Registration Questions — own answers; shown only when registered |

**Status Badge Colours**

| Status | Colour |
|--------|--------|
| `draft` | Neutral grey |
| `active` | Green |
| `cancelled` | Red |
| `completed` | Amber |

> **Note:** `published` status badge (Blue) retired. No longer part of active lifecycle.

**Member RSVP Badge**

| RSVP State | Badge Text | Colour |
|------------|-----------|--------|
| `requested` | "Requested — awaiting approval" | Amber |
| `going` | "Going" | Green |
| `denied` | "Request Denied" | Red |

### 4. Business Logic

**4.1 Positive Flow**

*Admin:*
1. Admin clicks event in listing → Detail opens; Overview tab active by default.
2. All event fields displayed.
3. Stat cards show live Requested / Going / Denied counts from participant records (not from `metrics.*` legacy fields).
4. When `guestRegistrationEnabled === true`: URL `https://hssuk.org/events/{id}/register` displayed with copy button. Copy uses `navigator.clipboard.writeText`; success toast "Link copied to clipboard."
5. Modify button: enabled when `startDate > now`; disabled (visible, greyed) when `startDate ≤ now`.
6. Cancel: available when `status !== 'cancelled' && status !== 'completed'`.
7. Delete: available when `startDate > now && status !== 'completed'`.

*Member:*
1. Member clicks event card from listing → Detail opens on Overview tab.
2. Condensed event details displayed (title, location, start date, end date).
3. If no participation record AND event is `active` AND member is eligible: "Register for Karyakram" button shown → triggers US-607. (If at capacity, registration proceeds to waitlist per US-607 §4.1.)
4. If member has participation record: RSVP status badge shown; Register button absent.
5. If `rsvp === 'going'` and `customQuestions.length > 0`: member's own answers displayed in "Registration Questions" card (`checkbox` answers shown as "Yes" / "No").

**4.2 Negative Flow**
- Modify when `startDate ≤ now`: button visible but disabled; tooltip "Karyakram cannot be edited after it starts."
- Modify when `status === 'cancelled'`: Modify button hidden entirely.
- Delete when `startDate ≤ now`: confirmation modal shows error "This Karyakram can no longer be deleted after it starts." and blocks action.
- Delete when `status === 'completed'`: confirmation modal shows error "Completed Karyakrams cannot be deleted." and blocks action.
- Cancel when `status === 'cancelled'` or `'completed'`: Cancel action not rendered.
- Cancel confirmation modal text: "Are you sure you want to cancel this Karyakram? This action cannot be undone." — cancel requires mandatory `cancellationReason` text input (see US-603 §3).
- Delete confirmation modal variant: `danger` style.

**4.3 Edge Cases**
- Event with `capacity` set and `goingCount >= capacity`: member's registration CTA remains active; registration accepted as `requested` waitlist (see US-607 §4.1 Waitlist path). "Karyakram Fully Booked" badge no longer used.
- `guestRegistrationEnabled === false` or field absent: guest URL section not rendered.
- `customQuestions` empty or absent: "Additional Registration Questions" section not rendered for admin; "Registration Questions" card not rendered for member.
- Online event: `venueAddress` not shown; `onlineUrl` displayed. [TBD — Needs Confirmation: hyperlink (new tab) or copy-only?]
- Admin views event with `status === 'cancelled'`: `cancellationReason` and `cancelledDate` displayed in a notice block; Modify, Cancel, and Delete buttons absent.

**4.4 Audit Rules**

| Action | Audit Event | Fields Logged |
|--------|-------------|---------------|
| Status change | `KARYAKRAM_STATUS_CHANGED` | `actorId`, `eventId`, `from`, `to`, `timestamp` |
| Cancel | `KARYAKRAM_CANCELLED` | `actorId`, `eventId`, `cancellationReason`, `cancelledDate`, `timestamp` |
| Delete | `KARYAKRAM_DELETED` | `actorId`, `eventId`, `eventName`, `deletedAt`, `timestamp` |
| Modify (opens edit) | `KARYAKRAM_EDIT_OPENED` | `actorId`, `eventId`, `timestamp` |

**4.5 RBAC**

| Action | Super Admin | Kendriya–Shakha Admin | Event Admin | Reporting | Shakha Ops | Member |
|--------|:-----------:|:---------------------:|:-----------:|:---------:|:----------:|:------:|
| View Overview | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modify | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cancel | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Register (member CTA) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Copy guest URL | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 5. Navigation Rules

**Entry Points**

| Entry | From |
|-------|------|
| Click event card / row | US-601 Admin Listing |
| Click event card in member panels | US-602 Member Listing |
| Dashboard cross-module link with `initialEventId` | Dashboard |

**Exit Points**

| Exit | Destination |
|------|-------------|
| "Back to Events" button | US-601 or US-602 Listing |
| "Modify" button | US-603 Edit form |
| Participants tab | US-605 |
| Media tab | US-606 |
| Delete success | US-601 Admin Listing |
| Participant name click (admin) | Member profile (Members module) |

### 6. Notifications

| Trigger | Channel | Recipient | Content |
|---------|---------|-----------|---------|
| Karyakram cancelled | Email + in-app | All `rsvp === 'going'` participants | "Karyakram '{name}' has been cancelled. Reason: {cancellationReason}." |
| Karyakram cancelled | In-app toast | Acting admin | "Karyakram cancelled successfully." |
| Karyakram deleted | In-app toast | Acting admin | "Karyakram deleted successfully." |
| Status activated | In-app toast | Acting admin | "Karyakram activated successfully." |
| Status deactivated | In-app toast | Acting admin | "Karyakram deactivated successfully." |
| Guest link copied | In-app toast | Acting admin | "Link copied to clipboard." |

### 7. Acceptance Criteria

- [ ] Admin stat cards (Requested / Going / Denied) reflect live participant counts from participant records, not `metrics.*` legacy fields.
- [ ] Modify button is visible but disabled after `startDate` is reached; tooltip displays "Karyakram cannot be edited after it starts."
- [ ] Cancel action is absent when `status === 'cancelled'` or `'completed'`.
- [ ] Delete confirmation modal blocks action for completed events and post-start-date events with exact specified error messages.
- [ ] Cancel modal requires a non-empty `cancellationReason` text input; submitting without it is blocked.
- [ ] Guest registration URL copy button works via `navigator.clipboard.writeText`; success toast appears.
- [ ] Member at a capacity-full event sees waitlist message "This Karyakram is at capacity. Your request has been added to the waiting list." after submitting; participant record created with `rsvp: 'requested'`.
- [ ] Cancellation notification sent to all `going` participants including `cancellationReason` text.
- [ ] `customQuestions` section absent from admin view when array is empty or not set.

### 8. API Mapping

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch event detail | GET | `/api/v1/events/{id}` |
| Update event | PUT | `/api/v1/events/{id}` |
| Change status | PATCH | `/api/v1/events/{id}/status` |
| Cancel event | PATCH | `/api/v1/events/{id}/cancel` — body: `{ cancellationReason: string }` |
| Delete event | DELETE | `/api/v1/events/{id}` |
| Fetch live participant counts | GET | `/api/v1/events/{id}/participants/summary` |

### 9. Data Rules

- Cancelled events are retained; `cancellationReason` stored on event and visible to admins only.
- Guest registration URL is computed from `event.id`; not stored as a separate entity.
- `cancellationReason` is stored as plain text; not encrypted (not member PII).

### 10. Dependencies

- US-601 / US-602: Entry points.
- US-603: Modify action loads edit form.
- US-605: Participants tab (admin only).
- US-606: Media tab (all roles).
- US-607: Member registration CTA on this screen.
- Masters module: location display values.

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | Should `onlineUrl` be a hyperlink (new tab) or copy-only in admin and member views? | No |
| Q2 | Should members see `cancellationReason` when an event is cancelled? Currently hidden. | No |
| Q3 | Should `status === 'completed'` events show a different CTA for members (e.g. "View Summary") instead of the absent Register button? | No |

---

## US-605 — Karyakram Detail — Participants Tab

### 1. User Story

The system shall allow admin roles to view, filter, approve, deny, and manage coordinator designation for registered participants of a Karyakram, and export the full participant list as a CSV — from the Participants tab on the Karyakram Detail page. This tab is hidden from Member and Teen Member roles.

### 2. Screen Purpose

Admin-only tab on the Karyakram Detail page. Displays all EventParticipant records for the event. Enables RSVP management (approve / deny pending requests) and coordinator designation for approved participants. Supports filtering by RSVP status and CSV export. Cross-navigates to individual member profiles.

### 3. Fields & Validation

**Participant Table Columns**

| Column | Source | Notes |
|--------|--------|-------|
| Name | `participant.name` | Coordinator badge (shield icon) shown when `isCoordinator === true` |
| Email | `participant.email` | |
| Phone | `participant.phone` | May be empty |
| Member Type | `participant.memberType` | `adult / teen / child` |
| RSVP Status | `participant.rsvp` | Amber "Requested" / Green "Going" / Red "Denied" |
| Action | — | Approve + Deny for `requested`; Make / Remove Coordinator for `going`; "—" for `denied` |

**Filter**

| Filter | Options |
|--------|---------|
| RSVP Status | All / Requested / Going / Denied |

**CSV Export:** Download file. Includes 37 fields: memberId, name, email, phone, memberType, rsvp, isCoordinator, all customAnswer values, plus full member profile fields (address, emergency contact, guardian details, medical info, DBS status, first aid status, safeguarding status, dietary requirements, occupation, originating state).

### 4. Business Logic

**4.1 Positive Flow**

*Approve RSVP:*
1. Admin clicks Approve (green check) on a `requested` participant.
2. `rsvp` → `going`. Action cell switches to coordinator management buttons.
3. Toast: "Registration approved — marked as Going."

*Deny RSVP:*
1. Admin clicks Deny (red ban) on a `requested` participant.
2. `rsvp` → `denied`. Action cell shows "—".
3. Toast: "Registration denied."

*Make Coordinator:*
1. Admin clicks "Make Coordinator" on a `going` participant.
2. `isCoordinator` → `true`. Coordinator badge (shield-check icon) appears next to name.
3. Toast: "Participant marked as coordinator."
4. No upper limit on coordinators per event.

*Remove Coordinator:*
1. Admin clicks "Remove as Coordinator" on a `going + isCoordinator` participant.
2. `isCoordinator` → `false`. Badge removed.
3. Toast: "Coordinator role removed."

**4.2 Negative Flow**
- Approve on already-`going` participant: action button not rendered.
- Make Coordinator on `requested` or `denied` participant: action not rendered.
- CSV export with no participants: file downloads with header row only; no error.

**4.3 Edge Cases**
- Admin views participants of a cancelled event: tab still accessible; [TBD — Needs Confirmation — **BLOCKING**: should Approve / Deny / Coordinator actions be locked for cancelled events?]
- Denied participant: cannot be directly re-approved from this tab; member must re-register (re-registration rules TBD per US-602 Q1 and US-607 Q4).
- Coordinator badge only meaningful when `rsvp === 'going'`; denied or requested participants cannot hold coordinator status.

**4.4 Audit Rules**

| Action | Audit Event | Fields Logged |
|--------|-------------|---------------|
| Approve | `PARTICIPANT_APPROVED` | `actorId`, `eventId`, `memberId`, `timestamp` |
| Deny | `PARTICIPANT_DENIED` | `actorId`, `eventId`, `memberId`, `timestamp` |
| Make Coordinator | `COORDINATOR_ASSIGNED` | `actorId`, `eventId`, `memberId`, `timestamp` |
| Remove Coordinator | `COORDINATOR_REMOVED` | `actorId`, `eventId`, `memberId`, `timestamp` |
| Export CSV | `PARTICIPANTS_EXPORTED` | `actorId`, `eventId`, `timestamp`, `format: 'csv'` |

**4.5 RBAC**

| Action | Super Admin | Kendriya–Shakha Admin | Event Admin | Reporting | Shakha Ops | Member |
|--------|:-----------:|:---------------------:|:-----------:|:---------:|:----------:|:------:|
| View tab | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve / Deny | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Make / Remove Coordinator | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Export CSV | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### 5. Navigation Rules

| Entry | From |
|-------|------|
| Click "Participants" tab | US-604 Overview tab |

| Exit | Destination |
|------|-------------|
| Click participant name | Member profile (Members module) |
| Click Overview or Media tab | US-604 or US-606 |

### 6. Notifications

| Trigger | Channel | Recipient | Content |
|---------|---------|-----------|---------|
| RSVP approved | Email + in-app | Member | "Your registration for '{Karyakram name}' has been approved. You are confirmed as Going." |
| RSVP denied | Email + in-app | Member | "Your registration for '{Karyakram name}' has not been approved." |

### 7. Acceptance Criteria

- [ ] Participants tab is not rendered for Adult Member or Teen Member roles.
- [ ] Approve button is available only for `rsvp === 'requested'` participants; clicking changes status to `going` immediately.
- [ ] Deny button is available only for `rsvp === 'requested'` participants; clicking changes status to `denied` immediately.
- [ ] Coordinator badge appears immediately next to participant name on "Make Coordinator"; removed on "Remove as Coordinator."
- [ ] RSVP filter (All / Requested / Going / Denied) correctly narrows table rows.
- [ ] CSV export downloads with all 37 fields; file is named `karyakram-{id}-participants.csv`.
- [ ] Approved and denied members receive the specified notification.
- [ ] Export action is available to Reporting User but Approve / Deny and Coordinator actions are not.

### 8. API Mapping

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch participants | GET | `/api/v1/events/{id}/participants?rsvp={all\|requested\|going\|denied}` |
| Approve | PATCH | `/api/v1/events/{id}/participants/{memberId}/approve` |
| Deny | PATCH | `/api/v1/events/{id}/participants/{memberId}/deny` |
| Make Coordinator | PATCH | `/api/v1/events/{id}/participants/{memberId}/coordinator` — body: `{ isCoordinator: true }` |
| Remove Coordinator | PATCH | `/api/v1/events/{id}/participants/{memberId}/coordinator` — body: `{ isCoordinator: false }` |
| Export CSV | GET | `/api/v1/events/{id}/participants/export?format=csv` |

### 9. Data Rules

- CSV export includes all participant profile fields (37 columns). Access restricted to roles with `export` permission. Every download logged in the audit trail with: actor, role, event ID, timestamp, row count.
- UK-GDPR: all 37 fields confirmed permitted for export. Access control (role-gated) and audit logging satisfy data accountability requirements.
- Participant records retained for **1 year** from event `endDate` (or `cancelledDate` for cancelled events), then purged.

### 10. Dependencies

- US-604: Tab entry point.
- US-607: Registration creates participant records visible here.
- Members module: cross-navigation to member profile; member PII data sourced from here.

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | ~~Which CSV fields permitted under UK-GDPR?~~ **Resolved:** All 37 fields confirmed permitted. Role-gated access + audit log satisfy accountability. | Resolved |
| Q2 | Should Approve / Deny / Coordinator actions be locked for participants of a cancelled event? | Yes |
| Q3 | Can a denied participant be directly re-approved from this tab (without re-registering)? | Yes |
| Q4 | What is the SLA for approval / denial notifications reaching members? | No |

---

## US-606 — Karyakram Detail — Media Tab

### 1. User Story

The system shall allow all roles (admin and member) to view media associated with a Karyakram and upload new images or videos, from the Media tab on the Karyakram Detail page. Admin roles may attribute uploads to any member; member uploads are attributed to their own identity automatically.

### 2. Screen Purpose

Media gallery for a Karyakram. Available to all roles. Displays uploaded images and videos in a grid with lightbox viewer. Supports multi-file upload with optional caption. "Posted by" attribution field visible to admins only.

### 3. Fields & Validation

**Upload Form**

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| File(s) | file picker (multi-select) | Yes | Accepted: `image/*` (JPG/PNG/GIF/WEBP), `video/*` (MP4/MOV/AVI/WEBM); video max 100 MB each | "Please select at least one file." / "Video files must be under 100 MB." / "Unsupported file type. Accepted: JPG, PNG, GIF, WEBP, MP4, MOV, AVI, WEBM." |
| Caption | text | No | Max 200 chars | "Caption must be 200 characters or fewer." |
| Posted by | member select | Conditional | Admin only; required for admin uploads; auto-set to session member for member uploads | — |

**Media Grid**
- Images: thumbnail preview.
- Videos: gradient placeholder with play icon indicator.
- Lightbox: opens on click; keyboard navigation ArrowLeft (previous), ArrowRight (next), Escape (close); caption and uploader name shown.

### 4. Business Logic

**4.1 Positive Flow**
1. User opens Media tab; existing media displayed in grid.
2. User clicks "Upload Media" / "Add Photos & Videos."
3. File picker opens; user selects one or more files.
4. Optional caption entered.
5. Admin: selects "Posted by" member from dropdown. Member: "Posted by" auto-set to session identity.
6. On Post: `EventMedia` record(s) created; `event.metrics.mediaCount` incremented by count of uploaded items.
7. New media items appear in grid immediately (as gradient placeholder until processing completes).

**4.2 Negative Flow**
- Video > 100 MB: "Video files must be under 100 MB." Upload blocked before transmission.
- No file selected on submit: "Please select at least one file."
- Unsupported file type: "Unsupported file type. Accepted: JPG, PNG, GIF, WEBP, MP4, MOV, AVI, WEBM."

**4.3 Edge Cases**
- Admin upload: `memberId` stored as empty string; `memberName` reflects the "Posted by" selection.
- Cancelled or completed event: media tab accessible and upload allowed. [TBD — Needs Confirmation: should upload be locked for cancelled / completed events?]
- Batch upload of many files (e.g. 20+ images): uploads processed sequentially or in parallel. [TBD — Needs Confirmation: max files per upload?]
- `imageUrl` absent on a new upload until processing completes: gradient placeholder rendered; replaces with actual thumbnail once URL is available.

**4.4 Audit Rules**

| Action | Audit Event | Fields Logged |
|--------|-------------|---------------|
| Upload | `MEDIA_UPLOADED` | `actorId`, `eventId`, `mediaId`, `type`, `timestamp` |

**4.5 RBAC**

| Action | All Admin | Reporting | Shakha Ops | Member |
|--------|:---------:|:---------:|:----------:|:------:|
| View media | ✅ | ✅ | ✅ | ✅ |
| Upload media | ✅ | ✅ | ✅ | ✅ |
| "Posted by" field | ✅ | ✅ | ✅ | ❌ |
| Delete media | [TBD — Needs Confirmation] | [TBD] | ❌ | ❌ |

### 5. Navigation Rules

| Entry | From |
|-------|------|
| Click "Media" tab | US-604 Overview or US-605 Participants |

| Exit | Destination |
|------|-------------|
| Click uploader name (non-empty `memberId`) | Member profile (Members module) |
| Click other tab | US-604 or US-605 |

### 6. Notifications

None.

### 7. Acceptance Criteria

- [ ] Media tab is visible to Adult Member and Teen Member roles.
- [ ] Video files over 100 MB are rejected with exact error message before any upload begins.
- [ ] Member's upload shows no "Posted by" field; uploader name attributed to session member automatically.
- [ ] Lightbox keyboard navigation (ArrowLeft / ArrowRight / Escape) functions correctly.
- [ ] `metrics.mediaCount` increments by the count of successfully uploaded items.
- [ ] Unsupported file types rejected before upload with exact error message.
- [ ] Multiple files can be selected in a single upload action.

### 8. API Mapping

| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch media | GET | `/api/v1/events/{id}/media` |
| Upload media | POST | `/api/v1/events/{id}/media` — multipart/form-data; fields: `file`, `caption?`, `memberId?` |
| Delete media | DELETE | `/api/v1/events/{id}/media/{mediaId}` |

### 9. Data Rules

- Media files stored in **Azure Blob Storage**. CDN provider: [TBD — Needs Confirmation: Azure CDN / Front Door or third-party?].
- `imageUrl` populated after async processing; until available, gradient placeholder rendered.
- Media files retained for **1 year** from event `endDate` (or `cancelledDate`), then purged from Azure Blob Storage and CDN.
- GDPR: media may contain images of members. Members may request deletion of media items featuring them by contacting an admin. Admin deletes from the Media tab (US-606). Right-to-erasure fulfilled by admin action; no automated facial-recognition removal in scope.

### 10. Dependencies

- US-604: Tab entry point.
- Members module: "Posted by" member lookup (admin); cross-navigation on uploader name click.

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | Can admins delete any media item? Can members delete their own uploads? | Yes |
| Q2 | Should media upload be locked for cancelled or completed events? | No |
| Q3 | ~~Object storage service?~~ **Resolved:** Azure Blob Storage confirmed. CDN provider TBD (non-blocking). | Resolved |
| Q4 | ~~GDPR right-to-erasure for media?~~ **Resolved:** Members request via admin; admin deletes from Media tab. No automated removal in scope. | Resolved |
| Q5 | What is the maximum number of files permitted in a single upload action? | No |

---

## US-607 — Member Registration (Request to Attend)

### 1. User Story

The system shall allow Adult Member and Teen Member roles to register their interest in attending a Karyakram by submitting a registration request — optionally answering custom questions set by the admin — which is queued for admin approval before the member is confirmed as Going.

### 2. Screen Purpose

Registration flow for members. Triggered from the "Register for Karyakram" CTA on US-604 Detail Overview. Eligibility is checked before the flow opens. If the event has custom questions, a modal collects answers. On submission, a participant record is created with `rsvp: 'requested'`.

### 3. Fields & Validation

**Eligibility Checks (pre-modal; performed before CTA is enabled)**

| Check | Condition | Error / Display |
|-------|-----------|-----------------|
| Event status | Must be `active` (`published` status retired) | CTA hidden |
| Capacity full (waitlist) | `event.capacity` set AND `goingCount >= capacity` | Registration accepted as `requested` (waitlist). Member shown: "This Karyakram is at capacity. Your request has been added to the waiting list." |
| Age group filter | Member's age group in `filterAgeCategories` (if not "Select All") | "You are not eligible to register for this Karyakram." inline; no modal |
| Gender filter | Member's gender in `filterGenders` (if not "Select All") | "You are not eligible to register for this Karyakram." inline; no modal |
| Role type filter | Member's job title in `filterJobTitles` (if not "Select All") | "You are not eligible to register for this Karyakram." inline; no modal |
| Existing registration | No `EventParticipant` record for this member + event | "You have already registered for this Karyakram." inline |

**Custom Questions Modal**

| Field | Type | Validation | Error |
|-------|------|------------|-------|
| Text question | text input | Required if `question.required === true`; must be non-empty | "Please answer: '{question label}'" |
| Dropdown question | select | Required if `required === true`; must select from `options` array | "Please answer: '{question label}'" |
| Checkbox question | checkbox | Required if `required === true`; must be checked (`= true`) | "Please answer: '{question label}'" |

### 4. Business Logic

**4.1 Positive Flow**

*Without custom questions:*
1. Member clicks "Register for Karyakram."
2. All eligibility checks pass.
3. `EventParticipant` record created immediately: `{ rsvp: 'requested', customAnswers: {}, isCoordinator: false }`.
4. Toast: "Request to attend sent for approval."
5. CTA replaced by amber badge "Requested — awaiting approval."

*With custom questions:*
1. Member clicks "Register for Karyakram."
2. All eligibility checks pass.
3. Custom questions modal opens displaying all `event.customQuestions` items.
4. Member fills in answers. `text` → free text input; `dropdown` → select from options; `checkbox` → checkbox.
5. Member clicks Submit.
6. Required field validation runs. Any missing required answer: toast "Please answer: '{question label}'"; submission blocked; modal stays open.
7. All required answers present: `EventParticipant` record created with `rsvp: 'requested'`, `customAnswers: { [questionId]: answer }`.
8. Toast: "Request to attend sent for approval."
9. Modal closes. CTA replaced by amber badge "Requested — awaiting approval."

**Waitlist path (capacity full):** When `goingCount >= event.capacity` at submission time, participant record created with `rsvp: 'requested'` and member shown: "This Karyakram is at capacity. Your request has been added to the waiting list." Admin may approve waitlisted participants when a `going` participant self-cancels or is denied, freeing a capacity slot.

**Member RSVP Display Post-Registration**

| `rsvp` State | Display |
|-------------|---------|
| `requested` | Amber badge "Requested — awaiting approval" |
| `going` | Green badge "Going" |
| `denied` | Red badge "Request Denied" |

**4.2 Negative Flow**
- Any required question unanswered: modal stays open; toast "Please answer: '{question label}'"; identifies the specific question; submission blocked.
- Event fully booked (`goingCount >= capacity`): registration proceeds as `requested` waitlist (see 4.1 Waitlist path). CTA remains active; member receives waitlist message.
- Member ineligible for audience filter(s): CTA replaced with "You are not eligible to register for this Karyakram." message; modal never opens.
- Event no longer `active` (i.e. `draft`, `cancelled`, or `completed`): CTA hidden entirely; status badge communicates event state.
- Member already has a participant record: CTA replaced with current RSVP status badge; re-registration blocked.

**4.3 Edge Cases**
- Checkbox question marked `required`: member must check the box (e.g. photo consent, terms acceptance). Unchecked = blocked.
- Required checkbox: submitting with box unchecked triggers "Please answer: '{label}'" toast and blocks submission.
- Race condition on capacity: system validates capacity server-side at time of API submission; if capacity filled between client check and server receipt, server returns error "This Karyakram is now fully booked." Modal is closed; CTA replaced with "Karyakram Fully Booked."
- Teen member: same flow as adult member; audience filter enforcement uses teen member's stored profile data.
- Cancelling the questions modal (X / Cancel button): no participant record created; member remains unregistered.

**4.4 Audit Rules**

| Action | Audit Event | Fields Logged |
|--------|-------------|---------------|
| Registration submitted | `REGISTRATION_REQUESTED` | `eventId`, `memberId`, `timestamp`, `customAnswers` (stored as-is on participant record) |

**4.5 RBAC**

| Action | Adult Member | Teen Member | All Admin |
|--------|:------------:|:-----------:|:---------:|
| Register (CTA visible) | ✅ | ✅ | ❌ |
| Submit custom questions | ✅ | ✅ | ❌ |
| View own RSVP status | ✅ | ✅ | ❌ |

### 5. Navigation Rules

| Entry | Trigger | From |
|-------|---------|------|
| "Register for Karyakram" CTA | Click | US-604 Detail Overview (member view) |

| Exit | Destination |
|------|-------------|
| Submit success | Stays on US-604; CTA replaced by status badge |
| Cancel / Close questions modal | Modal closes; stays on US-604; no record created |

### 6. Notifications

| Trigger | Channel | Recipient | Content | Timing |
|---------|---------|-----------|---------|--------|
| Registration submitted | In-app toast | Member | "Request to attend sent for approval." | Immediate |
| Registration submitted | Email + in-app | Coordinator(s) / admin | [TBD — Needs Confirmation: should coordinators be notified of each new registration?] | On submission |
| RSVP approved (by admin in US-605) | Email + in-app | Member | "Your registration for '{Karyakram name}' has been approved. You are confirmed as Going." | On approval |
| RSVP denied (by admin in US-605) | Email + in-app | Member | "Your registration for '{Karyakram name}' has not been approved." | On denial |

### 7. Acceptance Criteria

- [ ] "Register for Karyakram" CTA is absent for all admin roles; present only for Adult Member and Teen Member roles.
- [ ] If event has `customQuestions`, clicking Register opens the questions modal before creating any record.
- [ ] Required question left blank blocks submission; toast "Please answer: '{label}'" identifies the exact question.
- [ ] Required checkbox question: unchecked blocks submission with exact toast.
- [ ] On successful submission, RSVP status badge updates immediately to amber "Requested — awaiting approval."
- [ ] Member at capacity sees "Karyakram Fully Booked" badge; CTA absent; modal never opens.
- [ ] Member ineligible for audience filters sees "You are not eligible to register for this Karyakram." inline; modal never opens.
- [ ] Cancelling the questions modal (without submitting) creates no `EventParticipant` record.
- [ ] Race condition: server-side capacity check rejects registration if capacity filled since client load; correct error displayed.

### 8. API Mapping

| Action | Method | Endpoint |
|--------|--------|----------|
| Eligibility check | GET | `/api/v1/events/{id}/eligibility?memberId={memberId}` |
| Submit registration | POST | `/api/v1/events/{id}/register` — body: `{ memberId: string, customAnswers: Record<string, string\|boolean> }` |

### 9. Data Rules

- `customAnswers` stored on the `EventParticipant` record; treated as personal data under UK-GDPR.
- Registration creates a participant record immediately on submission (not deferred); status starts as `requested`.
- Member may cancel their own registration at any time before the event `startDate`. Self-cancel sets `rsvp: 'denied'` on the participant record (not hard-deleted). Member re-registration rules follow US-607 Q4.
- If a member cancels when the event was at capacity, the next `requested` waitlist participant can be approved by admin.

### 10. Dependencies

- US-604: Entry point (Register CTA on Overview tab).
- US-605: Admin approves or denies the `requested` record created here.
- US-602: Member's RSVP status surfaced on the listing panels.
- Members module: member profile data used for eligibility check (age group, gender, role type).

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | ~~Can members cancel their own registration?~~ **Resolved:** Yes — self-cancel sets `rsvp: 'denied'`. Also confirmed: capacity-full registrations go to `requested` waitlist (not blocked). | Resolved |
| Q2 | ~~Delete or set to denied on self-cancel?~~ **Resolved:** Set to `denied` (soft — record retained). | Resolved |
| Q3 | Should coordinators receive an email notification for each new registration request? | No |
| Q4 | Can a denied member re-register for the same event? If yes, do previous `customAnswers` pre-fill the modal? | Yes |

---

*End of 06 — Karyakrams (Events) Module*
