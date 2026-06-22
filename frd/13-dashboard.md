# 13 — Dashboard

**Maps to Doc tab:** Dashboard · **Platform:** Admin Web + Member Portal · **Access:** All roles
(content varies by role/scope — see per-section role notes)

## Scope
The Dashboard is the landing screen after login. Two distinct experiences exist:
- **US-DASH-001 — Admin/Hierarchy Dashboard**: Super Admin, National Head, Regional Head, Town
  Head, Activity Centre Admin, Event Admin, Reporting User, Ops User.
- **US-DASH-002 — Member/Teen Dashboard**: Member (18+), Teen (13–17).

All KPI values shown are scoped to the viewing user's hierarchy position (Country → Region →
Town → Activity Centre) via `filterByScope`. In the current frontend prototype, all KPIs are
computed client-side via `useMemo` over mock data arrays — there is no real API/network call
backing the Dashboard yet (see §8 API Mapping and §11 Open Questions).

---

## US-DASH-001 — Admin/Hierarchy Dashboard

### 1. User Story
The system shall display a role-scoped Dashboard landing page for Super Admin, National Head,
Regional Head, Town Head, Activity Centre Admin, Event Admin, Reporting User, and Ops User,
showing organisational KPIs, hierarchy-specific operational KPIs (for Regional Head / Town Head /
Activity Centre Admin), and activity KPIs (for all other listed roles), each scoped to the user's
assigned hierarchy level.

### 2. Screen Purpose
Single landing screen giving each admin/hierarchy role an at-a-glance summary of membership,
attendance (Sankhya), announcements (Suchana), donations (Nidhi), compliance, and upcoming events
(Karyakrams) relevant to their scope, with quick navigation into the corresponding detail screens.

### 3. Fields & Validation
No user-entered fields on this screen (read-only KPI/summary display). Page title and KPI values
are derived, not entered:

| Element | Source / Rule |
|---|---|
| Page title | `${scope.centre} - Dashboard` when a centre is in scope; otherwise "Dashboard". (UI-only.) |
| Subtitle/greeting | Time-of-day greeting ("Good morning / Good afternoon / Good evening — here's what's happening across the network") shown only for non-hierarchy roles (Super Admin, National Head, Event Admin, Reporting User, Ops User) — i.e. roles where `showHierarchyKpis` is false. (UI-only.) |

### 4. Business Logic

#### 4.1 Positive
- **Org-structure KPI cards** (Row 1): Total Members, Vibhaag (Regions), Nagar (Towns), Shakha
  (Activity Centres). Each card's value and sub-metrics are computed from data scoped via
  `filterByScope` against the viewing user's hierarchy position.
- **Total Members KPI** sub-metrics: Active, Inactive, Pending Approval, Pending Guardian
  Approval — each a count of scoped members by status. **[TBD — Needs Confirmation, non-blocking]**
  "Pending Guardian Approval" is the label used on this Dashboard card (from
  `Dashboard.tsx`), but `frd/00-global.md` §7.1 and `frd/05-members.md` use "Pending Parental
  Consent" for the same member status. These must be harmonized to a single canonical label
  across Global, Members, and Dashboard. Do not silently pick one — confirm with the user which
  term is canonical, then update all three locations consistently.
- **HierarchyKpiSection** — shown only for Regional Head, Town Head, and Activity Centre Admin
  (`showHierarchyKpis = true`). Renders the following 7 KPI cards, each scoped via
  `filterByScope`:
  1. **Sankhya** — value = sessions held YTD (count of completed sessions in the current
     calendar year, scoped). Sub-metrics: "Shakhas held YTD" (same count), "Avg — last 4
     Shakhas" (average attendance rate across the 4 most recent completed sessions, by date
     descending), "Avg — YTD" (average attendance rate across all YTD completed sessions).
     Attendance rate per session = present ÷ (present + absent) × 100, rounded; 0% if no
     present/absent records exist for that session.
  2. **Suchana** — value = total announcement count (all announcements, not scope-filtered).
     Sub-metric: "High priority" = count of announcements with `priority === 'high'`.
  3. **Pending Shakha Approvals** — value = count of scoped members with status Pending
     Approval or Pending Guardian Approval (Pending Parental Consent). Sub-metrics: "Awaiting
     your approval" (same total count), "Awaiting parental consent" (count of just the Pending
     Guardian Approval / Pending Parental Consent subset). This card is **hidden when
     `scope.level === 'centre'`** — Activity Centre Admin does not see this card (see §4.3).
  4. **Shakha Karyakartas** — value = count of scoped members where `status === 'active'` AND
     the member's job title (Sangh responsibility) is NOT one of the age-group membership
     labels: `Bal(ika)`, `Shishu`, `Kishor(i)`, `Tarun(i)`, `Yuva(ti)`, `Jyestha(a)`. Sub-metric:
     "Holding sangh responsibility" = same count. **[TBD — Needs Confirmation, non-blocking]**
     The exclusion list above (`Bal(ika), Shishu, Kishor(i), Tarun(i), Yuva(ti), Jyestha(a)`) is
     taken verbatim from `Dashboard.tsx` (`AGE_GROUP_ROLE_LABELS`). Confirm this is the
     canonical and complete list of age-group membership labels (vs actual Sangh
     responsibility/job-title values) before relying on it for KPI accuracy — if any
     additional age-group labels exist (or any of these are in fact real responsibilities),
     this exclusion list and the resulting "Shakha Karyakartas" count must be corrected.
  5. **Nidhi** — value = total donations received (scoped, `status === 'received'`), formatted
     as GBP. Sub-metrics: "Online" = total of received donations with `channel === 'online'`;
     "Cash" = total of received donations with `channel === 'cash'`. A Gift Aid claimable
     amount is computed internally as 25% of the total of received donations flagged
     `giftAid === true`, but this value is **not displayed** on the card — it is an
     internal-only computation in the current prototype, not a user-facing KPI.
  6. **Compliance** — value = count of scoped members with `compliance.dbs === 'completed'`
     (DBS approved). Sub-metrics: "DBS approved" (same value), "First aiders" = count of scoped
     members with `isFirstAider === true`, "Safeguarding complete" = count of scoped members
     with `compliance.safeguardingTraining === 'completed'`.
  7. **Upcoming Karyakrams** — value = count of events with status `published` or `active` that
     the scope is **eligible for** (see eligibility rule below). Sub-metrics: "Active" = count
     of the eligible set with `status === 'active'`; "Published" = count of the eligible set
     with `status === 'published'`.
- **Upcoming Karyakrams eligibility rule** (`isEligibleForShakha`): an event counts toward the
  scope's "Upcoming Karyakrams" KPI if EITHER:
  - the event has no age filter, no gender filter, and no job-title filter set on it, OR
  - at least one member within the current scope satisfies ALL of the filters that ARE set on
    the event: age (via `getAgeGroup(member.dateOfBirth)` matching the event's age filter),
    gender (matching the event's gender filter), and job title (matching the event's job-title
    filter).

  **[TBD — Needs Confirmation, non-blocking]** This rule was added to `Dashboard.tsx` in commit
  `3360eea` using the field names `filterAgeCategories`, `filterGenders`, and `filterJobTitles`
  on the event object, plus a helper `getAgeGroup(dob)`. `frd/06-events.md` does not currently
  define a canonical "event eligibility filter" section or equivalent field names for these
  three filters. Before this rule is finalized in the FRD, reconcile the naming with
  `frd/06-events.md`: either (a) add a canonical Event Eligibility Filters section to
  `06-events.md` using these (or renamed) fields and reference it here, or (b) confirm these
  field names with the user as canonical and add the corresponding section to
  `06-events.md`. Do not finalize naming in this file until that reconciliation happens.
- **Activity KPIs row** (shown only when `showHierarchyKpis` is false, i.e. for Super Admin,
  National Head, Event Admin, Reporting User, Ops User): 4 cards —
  - **Upcoming Karyakrams** — count of events with status `published` or `active`
    (system-wide in the prototype, not scope-filtered), with sub-counts "active" and
    "published".
  - **Suchana** — total announcement count, with "high priority" sub-count.
  - **Recent Registrations** — count of the 6 most recently registered members (system-wide),
    with "Latest: <time ago>" sub-metric.
  - **Pending Approvals** — count of members with status Pending Approval or Pending Guardian
    Approval (Pending Parental Consent), with "awaiting parental consent" sub-count.

#### 4.2 Negative
- If there are no upcoming events (published/active), the "Upcoming Karyakrams" list section
  shows "No upcoming events scheduled." instead of a list.
- If there are no pending approvals, the "Pending Approvals" quick-list section shows "All
  approvals up to date" with a confirmation icon instead of a list.

#### 4.3 Edge
- **Visibility rule — Pending Shakha Approvals card:** hidden entirely when `scope.level ===
  'centre'` (Activity Centre Admin never sees this KPI card).
- **Visibility rule — Upcoming Karyakrams + Pending Approvals section:** the combined
  "Upcoming Karyakrams" list and "Pending Approvals" quick-list section (below the KPI rows) is
  entirely hidden when `scope.level === 'centre'` — Activity Centre Admin never sees this
  section.
- **Org-structure card visibility is role-scoped** — each role hides the org-structure KPI
  cards for hierarchy levels AT OR BELOW (i.e. greater than or equal to) its own level; levels
  ABOVE its own level remain visible:
  - Regional Head: hides Vibhaag/Regions card (`hideRegions`).
  - Town Head: hides Vibhaag/Regions AND Nagar/Towns cards (`hideRegions`, `hideTowns`).
  - Activity Centre Admin: hides Vibhaag/Regions, Nagar/Towns, AND Shakha/Centres cards
    (`hideRegions`, `hideTowns`, `hideCentres`).
  - Super Admin, National Head, Event Admin, Reporting User, Ops User: see all org-structure
    cards (Total Members, Vibhaag, Nagar, Shakha).
  - The "Total Members" card is always visible to all roles in this user story.

#### 4.4 Audit
No state-changing actions occur on this screen (read-only KPI display); no audit events are
generated by viewing the Dashboard.

#### 4.5 Security & Permissions
- All KPI values are scoped server-side to the viewing user's assigned hierarchy position
  (Country/Region/Town/Activity Centre) — a user must never see counts/totals for hierarchy
  branches outside their assigned scope.
- Role-based section visibility (HierarchyKpiSection vs Activity KPIs row; org-structure card
  hiding; Pending Shakha Approvals / Upcoming Karyakrams+Pending Approvals section hiding) must
  be enforced consistently with `frd/00-global.md` §6 Role & Permission Matrix.

### 5. Navigation
| KPI / Element | Navigates to |
|---|---|
| Sankhya card | Attendance log / oversight screen (`attendance-log`) |
| Suchana card | Announcements screen (`announcements`) |
| Pending Shakha Approvals card | Pending Approvals screen (`pending-approvals`) |
| Shakha Karyakartas card | Members listing (`members`) |
| Nidhi card | Donations report (`report-donations`) |
| Compliance card | Members listing (`members`) |
| Upcoming Karyakrams card / "View all" | Event Management (`event-management`) |
| Activity KPIs — Upcoming Karyakrams card | Event Management (`event-management`) |
| Activity KPIs — Suchana card | Announcements screen (`announcements`) |
| Activity KPIs — Recent Registrations card | Members listing (`members`) |
| Activity KPIs — Pending Approvals card | Pending Approvals screen (`pending-approvals`) |
| Pending Approvals quick-list "Review" | Pending Approvals screen (`pending-approvals`) |
| Recent Registrations "View all" | Members listing (`members`) |
| Announcements "View all" | Announcements screen (`announcements`) |

### 6. Notifications
No notifications/toasts are triggered by this screen (read-only display).

### 7. Acceptance Criteria
1. Dashboard loads with org-structure KPI cards scoped to the viewing user's hierarchy level.
2. Total Members card shows Active / Inactive / Pending Approval / Pending Guardian Approval
   sub-counts, scoped correctly.
3. Regional Head, Town Head, and Activity Centre Admin see the 7-card HierarchyKpiSection;
   all other listed roles see the 4-card Activity KPIs row instead.
4. Activity Centre Admin does not see the "Pending Shakha Approvals" card.
5. Activity Centre Admin does not see the "Upcoming Karyakrams + Pending Approvals" combined
   section.
6. Org-structure cards for hierarchy levels at or below the viewing role's own level are
   hidden (per §4.3 mapping table).
7. "Shakha Karyakartas" count excludes members whose job title is an age-group membership
   label (pending confirmation of the exclusion list — see §4.1 item 4 TBD).
8. "Upcoming Karyakrams" count for hierarchy roles includes only events the scope is eligible
   for per the `isEligibleForShakha` rule (§4.1).
9. Gift Aid claimable amount is computed but not rendered anywhere on the Nidhi card.
10. All KPI navigation targets (§5) route to the correct destination screens.

### 8. API Mapping
**[TBD — Needs Confirmation, non-blocking]** No backend API currently exists for this screen.
In the prototype, all KPI values are computed client-side via `useMemo` over mock data arrays
(`mockMembers`, `mockEvents`, `mockSessions`, `mockDonations`, `mockAnnouncements`,
`MASTERS_CASCADE`). A future Dashboard API (e.g. `GET /dashboard/kpis?scope=...`) returning the
KPI values described in §4.1, scoped server-side, would be required for production. Performance
target for this endpoint: see §11 Open Questions (3 s vs 4 s conflict, unresolved).

### 9. Data Rules
- Member counts (Total Members, Active/Inactive/Pending statuses, Shakha Karyakartas,
  Compliance) are derived from the member dataset, scoped via `filterByScope`.
- Sankhya (attendance) KPIs derive from session records with `status === 'completed'`,
  scoped via `filterByScope`; attendance rate per session = present ÷ (present + absent) × 100.
- Nidhi (donations) KPIs derive from donation records with `status === 'received'`, scoped via
  `filterByScope`; Gift Aid claimable = 25% of total amount of received donations where
  `giftAid === true` (internal-only, not displayed).
- Suchana (announcements) counts are NOT scope-filtered in the current prototype (all
  announcements, system-wide).
- Upcoming Karyakrams counts use event `status` of `published` or `active`, filtered through
  the `isEligibleForShakha` eligibility rule for hierarchy roles (§4.1); for non-hierarchy
  roles' Activity KPIs row, the count is system-wide (no eligibility filter applied).

### 10. Dependencies
- `frd/00-global.md` §6 Role & Permission Matrix (Dashboard row) — role-level access summary;
  this file provides the itemized KPI breakdown per role.
- `frd/00-global.md` §7.1 — member status definitions (Pending Parental Consent / Pending
  Approval / Active / Rejected) — see §4.1 TBD on terminology harmonization.
- `frd/05-members.md` — member status, compliance fields (DBS, First Aid, Safeguarding),
  job title / Sangh responsibility.
- `frd/06-events.md` — event status values (published/active/draft/completed/cancelled),
  event eligibility filters (pending reconciliation — see §4.1 TBD).
- `frd/07-attendance.md` — session/attendance records feeding the Sankhya KPI.
- `frd/08-reports.md` — Donations report (Nidhi card navigation target).
- `frd/11-announcements.md` — announcement records feeding the Suchana KPI.
- `frd/01-technical-specification.md` §3.7 — Dashboard KPI performance target (see §11 TBD).

### 11. Open Questions
| # | Question | Blocking? |
|---|---|---|
| D1 | "Shakha Karyakartas" exclusion list (`Bal(ika), Shishu, Kishor(i), Tarun(i), Yuva(ti),
Jyestha(a)`) — is this the canonical/complete list of age-group membership labels vs actual
Sangh responsibilities? | Non-blocking |
| D2 | "Pending Guardian Approval" (Dashboard label) vs "Pending Parental Consent"
(`frd/00-global.md` §7.1, `frd/05-members.md`) — harmonize to one canonical term across all
three files. | Non-blocking |
| D3 | "Upcoming Karyakrams" eligibility filter field names (`filterAgeCategories`,
`filterGenders`, `filterJobTitles` from `Dashboard.tsx`) have no canonical home in
`frd/06-events.md` — reconcile naming and add an Event Eligibility Filters section to
`06-events.md`, then update the reference here. | Non-blocking |
| D4 | Dashboard KPI performance target conflict: `frd/00-global.md` (line 127) states < 3 s;
`frd/01-technical-specification.md` §3.7 (line 138) states the source NFR section says < 4 s.
This reconciliation does not resolve the conflict — see `frd/01-technical-specification.md`
§3.7 and `frd/12-open-questions.md`. | Non-blocking (tracked centrally) |

---

## US-DASH-002 — Member/Teen Dashboard

### 1. User Story
The system shall display a personal Dashboard for Member (18+) and Teen (13–17) roles, showing
the member's identity, attendance (My Sankhya), upcoming events (Karyakrams), announcements
(Suchana), and donations (My Dakshina), with a "Give Dakshina" call-to-action that navigates to
the donation flow.

### 2. Screen Purpose
Single landing screen for individual members/teens summarizing their personal participation
(attendance, registered/upcoming events, donations) and the latest announcements, with quick
navigation into the corresponding detail screens and the donation flow.

### 3. Fields & Validation
No user-entered fields on this screen (read-only personal summary display).

| Element | Source / Rule |
|---|---|
| Identity header | Member's first name + last name, Member ID (e.g. `[HSS-00001]`), Sangh
responsibility (job title), Activity Centre (Shakha), Town (Nagar), Region (Vibhaag). |
| Greeting | Time-of-day greeting ("Good morning / Good afternoon / Good evening") — computed but
not shown for this role in the current layout (greeting logic present but the Member dashboard
header does not render the greeting text; identity header is shown instead). **[Note: no TBD —
informational only, matches Dashboard.tsx as written.]** |

### 4. Business Logic

#### 4.1 Positive
- **"Give Dakshina" CTA** appears in two places: (a) the page header (top-right, beside the
  identity block), and (b) the footer of the "My Dakshina" list card. Both navigate to the
  `donate` page (Navigation — see §5).
- **4 stat cards** (Row 1):
  1. **My Sankhya** — value = attendance percentage YTD = (present count ÷ total attendance
     records) × 100, rounded. Sub-metrics: "{present} present · {absent} absent" counts, and a
     derived metric **`presentAnotherShakha`** = count of the member's attendance records
     where `status === 'present'`, the session name contains "Shakha", AND the session's
     shakha name does NOT match the member's own Activity Centre — displayed as "{n} present
     in another shakha". **[TBD — Needs Confirmation, non-blocking]** This `presentAnotherShakha`
     metric is a new business rule first introduced in `Dashboard.tsx` and currently has no
     canonical definition or home in `frd/07-attendance.md` or elsewhere. Confirm: (a) is this
     metric required in production, (b) what is its canonical name, and (c) should its
     definition live in `frd/07-attendance.md` (Sankhya/attendance module) with a
     cross-reference from here, or remain documented only in this Dashboard module.
  2. **Karyakrams** — value = count of upcoming events for this member. Sub-metric shows
     upcoming vs registered counts (e.g. "3 upcoming · 2 registered").
  3. **Suchana** — value = total announcement count. Sub-metric: count of high-priority
     announcements.
  4. **My Dakshina** — value = total donations YTD (sum of the member's donation amounts,
     formatted as GBP). Sub-metrics: total of donations with `type === 'online'` ("online
     Dakshina") and total of donations with `type === 'recurring'` ("recurring Dakshina"). Card
     footer includes the "Give Dakshina" CTA and a running total.
- **Below stat cards**, four list sections (each showing the 3 most recent/upcoming items,
  with a "View all" link where applicable):
  1. **Upcoming Karyakrams list** — shows up to 3 of the member's upcoming events (date,
     name, status badge, time, Activity Centre, registered-participant count, fee/Free badge).
     "View all" navigates to Event Management.
  2. **My Sankhya list** — shows up to 3 of the member's most recent attendance records
     (session name, date, Present/Absent badge).
  3. **Suchana list** — shows up to 3 of the most recent announcements (priority icon, title,
     time-ago, body excerpt, posted-by). "View all" navigates to Announcements.
  4. **My Dakshina list** — shows up to 3 of the member's most recent donations (date/time,
     amount). Footer shows running total and the "Give Dakshina" CTA.

#### 4.2 Negative
- If the member has no upcoming events, the Upcoming Karyakrams list shows "No upcoming events
  scheduled."

#### 4.3 Edge
- If `mockMyAttendance` is empty, the My Sankhya percentage calculation would divide by zero —
  **[TBD — Needs Confirmation, non-blocking]** no explicit zero-record handling is defined in
  the current prototype; confirm expected display (e.g. "—" or "0%") when a member has no
  attendance records yet.

#### 4.4 Audit
No state-changing actions occur on this screen (read-only personal summary); no audit events
are generated by viewing the Dashboard. Navigation to `donate` initiates the donation flow,
which is audited under its own module (see Dependencies).

#### 4.5 Security & Permissions
- All data shown (attendance, events, donations, announcements) must be scoped to the
  logged-in member's own records only — a Member/Teen must never see another member's
  attendance, donation, or registration data on this screen.
- Teen (13–17) sees the same layout and the same scoping rules as Member (18+); no additional
  restriction beyond the member's own data is defined in the current prototype.

### 5. Navigation
| Element | Navigates to |
|---|---|
| "Give Dakshina" (header) | `donate` page — **[TBD]** Donation flow module not yet identified
in `frd/`; cross-reference once a dedicated Donations/Dakshina module file exists (currently
donation reporting is covered under `frd/08-reports.md`, but the member-facing "give a
donation" flow itself has no module file). |
| "Give Dakshina" (My Dakshina card footer) | `donate` page (same target as above) |
| My Sankhya card | Attendance log (`attendance-log`) |
| Karyakrams card | Event Management (`event-management`) |
| Suchana card | Announcements (`announcements`) |
| My Dakshina card | My Donations (`my-donations`) |
| Upcoming Karyakrams list item / "View all" | Event Management (`event-management`) |
| My Sankhya list item | Sessions (`sessions`) |
| Suchana list item / "View all" | Announcements (`announcements`) |
| My Dakshina list item / header | My Donations (`my-donations`) |

### 6. Notifications
No notifications/toasts are triggered by this screen (read-only display).

### 7. Acceptance Criteria
1. Member/Teen Dashboard loads showing identity header (name, Member ID, Sangh
   responsibility, Shakha/Town/Vibhaag).
2. "Give Dakshina" CTA is present in both the header and the My Dakshina card footer, and both
   navigate to the donation flow (`donate`).
3. My Sankhya card shows attendance % YTD, present/absent counts, and the
   "presentAnotherShakha" count (pending confirmation — see §4.1 TBD).
4. Karyakrams, Suchana, and My Dakshina cards show correct counts/totals scoped to the
   logged-in member.
5. Each of the four list sections (Upcoming Karyakrams, My Sankhya, Suchana, My Dakshina)
   shows up to 3 items with correct data and navigates correctly on click.
6. All data displayed is scoped to the logged-in member only (no cross-member data leakage).

### 8. API Mapping
**[TBD — Needs Confirmation, non-blocking]** No backend API currently exists for this screen.
In the prototype, all values derive from client-side mock arrays
(`mockEvents`, `mockMyAttendance`, `mockAnnouncements`, `mockMyDonations`,
`mockCurrentMember`). A future API (e.g. `GET /me/dashboard`) returning these values scoped to
the authenticated member would be required for production.

### 9. Data Rules
- My Sankhya % = (present attendance records ÷ total attendance records) × 100, rounded.
- `presentAnotherShakha` = count of present attendance records whose session name contains
  "Shakha" and does not match the member's own Activity Centre name (see §4.1 TBD for
  canonical naming/home).
- My Dakshina totals = sum of the member's donation amounts; "online" and "recurring" sub-totals
  filter by donation `type`.
- Upcoming Karyakrams list = member's events sorted by start date, limited to top 3 for display
  (10 fetched, 3 shown).

### 10. Dependencies
- `frd/07-attendance.md` — attendance/session records feeding My Sankhya.
- `frd/06-events.md` — event records feeding Karyakrams.
- `frd/11-announcements.md` — announcement records feeding Suchana.
- `frd/08-reports.md` — donation records feeding My Dakshina (reporting side); member-facing
  donation/"Give Dakshina" flow itself has no dedicated module file yet (see §5 TBD).
- `frd/05-members.md` — member identity fields (name, Member ID, job title/Sangh
  responsibility, Activity Centre/Town/Region).

### 11. Open Questions
| # | Question | Blocking? |
|---|---|---|
| D5 | `presentAnotherShakha` metric — canonical name and home (this file vs
`frd/07-attendance.md`); confirm whether required for production. | Non-blocking |
| D6 | Zero-attendance-records edge case for My Sankhya % — expected display value. | Non-blocking |
| D7 | "Give Dakshina" / `donate` navigation target — no dedicated Donations/Dakshina flow module
exists in `frd/` yet; confirm target module or create one. | Non-blocking |
