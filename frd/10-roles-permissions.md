# 10 — Roles & Permissions (Super Admin)

**Maps to Doc tab:** Roles and permission · **Platform:** Admin Web / Backoffice · **Risk Level:** High
**Access:** Super Admin only

## Scope
Configure authorization system-wide: Roles (create/edit/deactivate), Permissions (module/action
access per role), User Role Assignment (assign roles + scope to users).

Permission model supports: module-level access · action-level (View/Create/Edit/Approve/Deactivate/
Delete) · scope-level via Masters hierarchy (Country/Region/Town/Activity Centre) for any non-global
role. Custom roles allowed but must map to the standard permissions framework. Super Admin cannot
bypass OTP/consent safeguards (limits what permissions can grant). Determinism: any permission/
assignment change takes effect immediately, including existing sessions. All role/permission/
assignment changes audited. No role can grant itself Super Admin access except via Super Admin.

## Module business rules
- Role Name unique (case-insensitive). Role Status Active/Inactive. Inactive role: cannot be
  assigned; if already assigned, becomes non-effective immediately (keeps assignment but inactive).
  Super Admin role cannot be deactivated.
- Permissions per role: module allow/deny · action allow/deny · scope via Masters. Role's scope
  level = maximum data boundary (e.g. Town scope → only data under that Town). Updates apply
  instantly incl. existing sessions.
- Assignment: a user can have one or more roles; per role, a scope level + scope value (cascading
  Masters dropdowns) required. If scope value inactive, assignment blocked **[TBD]**.
- If audit logging fails for a change, save is blocked (locked rule).
- Prevent privilege escalation: no non-SA can alter roles/permissions; a role cannot grant bypass
  of OTP/consent safeguards (policy-level restriction).

## Screens
1. **Roles Listing** — columns: Role Name (unique) · Description · Status (badge) · Last updated ·
   Actions (Edit, Activate/Deactivate, Configure Permissions). Create/Edit modal: Role Name
   (required, unique case-insensitive) · Description (optional, max length **[TBD]**) · Status
   (default Active). SA role cannot be deactivated.
2. **Permissions (Role → Permission Matrix)** — role selector + matrix grid (rows = modules:
   Members, Attendance, Events, Event Registrations, Reports, Masters, etc.; columns = actions
   View/Create/Edit/Approve/Deactivate/Delete) + module-level "Enable module" switch (disables all
   actions when off) + Save/Cancel. Cannot remove SA mandatory permissions **[TBD minimums]**;
   prevent permissions that bypass OTP/consent safeguards; save blocked if audit fails. On Save,
   permissions apply instantly (incl. existing sessions).
3. **User Role Assignment** — columns: User Name/Email · Assigned Roles (tags) · Scope · Status ·
   Last updated · Actions (Assign/Update, Remove). Assign modal: User (search/select, must exist) ·
   Role(s) (multi-select, only Active selectable) · Scope Level (Country/Region/Town/Centre) · Scope
   Value (cascading Masters, valid entry) · Save/Cancel (blocked if audit fails). Cascading: Country
   → Regions → Towns → Activity Centres. Assignments apply instantly for new and existing sessions.

## Notifications (exact copy)
Success: "Role created successfully." / "Role updated successfully." / "Role status updated
successfully." / "Permissions updated successfully." / "Role assigned successfully." / "Role
assignment updated successfully." / "Role removed successfully." Errors: validation (duplicate role
name, missing fields), blocked (deactivate SA role), audit-logging failure ("Unable to save. Please
try again."), save/update failure. Confirm modals: Activate/Deactivate Role ("Confirm Status
Change"), Remove Role Assignment ("Confirm Removal").

## Edge cases
Instant permission change: removing a permission removes access immediately (incl. existing
sessions). Role deactivation: non-effective immediately, assignments kept but inactive. Scope value
becomes inactive later: historical access remains allowed. Concurrent permission edits: Last-based
conflict. Privilege escalation: system must not allow configuring permissions that bypass OTP/consent.

## Acceptance (selected)
Roles listing loads · create role (unique name) + toast + audit · edit role + audit · deactivate
non-SA role → Inactive, non-effective immediately, assignments kept + audit · configure permissions
→ saved, apply instantly + audit · assign role(s) + scope → applies instantly + audit · duplicate
role name blocked (inline) · deactivate SA role blocked · audit-logging failure blocks save · assign
inactive role blocked · concurrent permission edits (Last-based) block save with conflict · Masters
scope inactive → historical access allowed · permission removal affects existing sessions instantly.

## API
Roles: GET/POST `/admin/roles` · PUT `/admin/roles/{roleId}` (block deactivating SA role) · PATCH
`/admin/roles/{roleId}` (activate/deactivate) · GET `/admin/roles/{roleId}`.
Permissions: GET/PUT `/admin/roles/{roleId}/permissions` (apply instantly; save blocked if audit
fails).
Assignments: GET/POST `/admin/assignments` (multi-role) · PUT `/admin/assignments/{assignmentId}`
(apply instantly) · DELETE `/admin/assignments/{assignmentId}` (confirm required).
Lookups: GET `/admin/users/lookup` · GET `/admin/roles/lookup` (only Active selectable) · GET
`/masters/lookup` (cascading scope values). Errors 400/401/403/404/409/500.

## Audit
ROLE_CREATE/UPDATE/STATUS_CHANGE · blocked attempt to deactivate SA role · PERMISSIONS_UPDATE
(before/after) · ASSIGNMENT_CREATE/UPDATE/DELETE · BLOCKED_ACTION (audit-failure) · CONFLICT
(Last mismatch). Min fields: eventId, eventType, performedBy, performedAtUtc, requestId/correlationId,
roleId or userId+assignmentId, before/after snapshot, scope snapshot. Append-only, immutable. If
audit cannot be written, block the change.

> **[FRONTEND-RECONCILE]** Verify the three screens (Roles Listing, Permission Matrix, User Role
> Assignment), the action columns set (View/Create/Edit/Approve/Deactivate/Delete), the cascading
> scope dropdowns, and that the prototype reflects instant-effect permission changes.
