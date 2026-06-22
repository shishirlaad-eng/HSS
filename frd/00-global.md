# 00 — Global Requirements

**Gate:** Gate 2 — Global Requirements · **Status:** Approved · **Project:** MyHSS MMS
**Vendor:** Hidden Brains · **Client:** HSS UK · **Maps to Doc tab:** Global

---

## 1. Document Index

### 1.1 Purpose

Defines the global functional and non-functional requirements for the MyHSS Membership
Management System (MMS) — a centralized, secure, scalable platform replacing HSS UK's
end-of-life membership system. It addresses the legacy system's inability to support
HSS UK's safeguarding, operational, and reporting needs across a distributed national
hierarchy.

### 1.2 Project Overview

The MMS provides secure member lifecycle management (registration, consent, approval,
profile), weekly attendance recording (Sankhya), event management with Stripe payments,
role-scoped dashboards and reporting, announcements, compliance tracking (DBS/First Aid),
donations, and Super Admin governance — all enforced through a multi-level organizational
hierarchy (National → Region → Town → Activity Centre).

**Business domain:** National charity membership management with safeguarding obligations
for minors, multi-level operational reporting, and event administration.

**Target users:** Super Admin, National Head, Regional Head, Town Head, Activity Centre
Admin, Event Admin, Reporting User, Ops User, Member (18+), Teen (12–17), Child (<12 — no login).

**High-level workflow:**
1. Member (or adult on behalf of a child) registers; system applies age-gating rules (<12 / 12–17 / 18+).
2. Teen registration: submitted → Registration Approval by admin → Parental Consent Approval by linked Member (18+) guardian → Active.
3. Adult (18+) registration: submitted → Activity Centre Admin/admin approval → Active.
4. Active member attends Shakha sessions; Ops User records weekly Sankhya attendance.
5. Member/guardian registers for events; paid events processed via Stripe; approvals applied where configured.
6. Admin tiers manage compliance (DBS/First Aid uploads, verification, expiry alerts).
7. Announcements and notifications broadcast by hierarchy level; bell icon for all roles.
8. Reporting Users and admin tiers view KPI dashboards and filtered reports; export to CSV.

### 1.3 Out of Scope

- In-system event cancellation by members (handled offline via Activity Centre Admin)
- Tablet-compatible web admin panel
- Mobile/tablet-responsive admin web panel
- Offline (no internet connection) functionality
- AI-driven autonomous decision-making that bypasses approval workflows
- Content/data entry, SEO, marketing
- Source code of any third-party API
- CRM integration (future scope, not current)
- Any unapproved integrations not listed in Section 1.4
- Super Admin account provisioning (handled out-of-band)
- Child (<12) independent login — profile managed by linked Member (18+) guardian only

### 1.4 Dependencies

**Internal system dependencies:**
- Central identity, authentication, and session management service
- Shared hierarchy model (Masters: Country → Region → Town → Activity Centre) used by RBAC, reporting, announcements targeting, event scoping
- Shared status/state models across member lifecycle, event registration, compliance, attendance
- Audit Log Service — immutable; save must be blocked if unavailable
- Redis cache for performance (listing APIs, KPI dashboards)

**External integrations:**

| Integration | Purpose | Owner | Status |
|-------------|---------|-------|--------|
| Stripe | Paid event registration, donation processing, refunds | Client owns Stripe account | Confirmed |
| Email/SMS OTP Provider | OTP delivery for 2FA and password resets; email required, SMS optional | Client procures | TBD — provider not yet decided |
| Azure Blob Storage | Private file storage for DBS/First Aid docs, announcement attachments | Hidden Brains | Confirmed |
| Azure (UK region) | Hosting — Dev, QA/UAT, Prod environments | Hidden Brains | Confirmed |

### 1.5 Reference Links

| Type | Reference |
|------|-----------|
| Frontend Repository | GitHub repo (connected to project — HB Admin Template base) |
| HSS Brand Kit | Brand Kit/HSS UK Brand Board.pdf + logo assets in project repo |
| Use Case Document | HSS UK Membership Management Use Case Document v0.1 |
| RFP | RFP for HSS UK Membership Management System.pdf |
| Privacy Policy | HSS (UK) Privacy Policy.pdf |
| Data Protection Policy | HSS (UK) Data Protection Policy.pdf |
| Figma / Prototype | TBD — Non-Blocking |
| Stripe API Docs | https://stripe.com/docs/api |

---

## 2. Global Rules

| Rule Area | Standard |
|-----------|----------|
| Timezone (Display) | UK time — GMT (winter) / BST GMT+1 (summer); auto-adjusted |
| DB Datetime Storage | UTC — all timestamps stored in UTC, displayed in UK local time |
| Date Format | DD/MM/YYYY |
| Time Format | 24-hour (e.g. 14:30) |
| Currency | GBP (£) |
| Decimal Precision | 2 decimal places (e.g. £25.00) |
| Language / Locale | en-GB |
| Default Page Size | 20 records per page |
| Max Upload File Size | 10 MB per file (enforced at Nginx + API level) |
| Allowed Upload File Types | Configurable in Admin Settings (Super Admin sets allowed types/sizes; default: PDF, JPG, PNG) |
| Session Idle Timeout | 60 minutes idle (default); configurable in Settings; applies to new sessions on change |
| Session Expiry Message | "Session expired. Please log in again." |
| Password Policy | Minimum 8 characters; at least 1 uppercase letter; at least 1 lowercase letter; at least 1 number; at least 1 special character (from set `@$!%*?&`). This governs over any module-specific value (resolves prior 12-vs-8 conflict in `03-authentication.md` US-004 — see US-004 §11 Q4, resolved). |
| Password Storage | Salted hash (bcrypt); never stored or logged in plaintext |
| OTP Format | 6-digit numeric |
| Login OTP Expiry | 5 minutes (configurable in Settings) |
| Reset OTP Expiry | 10 minutes (configurable in Settings) |
| OTP Resend Cooldown | 60 seconds between resends |
| OTP Resend Limit | Max 3 resends per 15 minutes; max 10 OTP sends per 24 hours per email |
| OTP Resend Behaviour | Resending immediately invalidates the previous OTP |
| Account Lockout Trigger | 5 failed login attempts within 15 minutes |
| Account Lockout Duration | 15 minutes (escalates to 60 minutes on second lockout within 24 hours) |
| OTP Verify Lockout Trigger | 5 invalid OTP entries within 10 minutes |
| OTP Verify Lockout Duration | 15 minutes |
| IP Block Trigger | 20 failed logins from same IP within 15 minutes |
| IP Block Duration | 30 min (2nd block = 60 min; 3rd block = 24 hours within 24-hour window) |
| Transport Security | HTTPS / TLS 1.2+ everywhere — web ↔ API, API ↔ DB, API ↔ Blob, API ↔ Stripe, API ↔ OTP provider |
| Data at Rest Encryption | AES-256 for PII-sensitive fields |
| API Response — Success | `{ "data": [], "pagination": { "page": 1, "size": 20, "total": 0 } }` |
| API Response — Error | `{ "error": true, "message": "..." }` |
| API Auth Strategy | **[TBD — Blocking (Q1)]**: JWT in HttpOnly cookies (Web) + Bearer tokens (Mobile) is preferred; must confirm before Gate 3 |
| Audit Log on Save Block | If Audit Log Service is unavailable → save must be blocked for all sensitive actions |
| Soft Delete | Dependency-driven — entity cannot be deleted if active dependencies exist |
| Performance — Listing APIs | Response < 2 seconds |
| Performance — Dashboard KPIs | Response < 3 seconds |
| Performance — Document Downloads | Response < 5 seconds |
| Pagination Max Rows | Up to 500 rows (server-enforced ceiling) |
| Donation Preset Amounts | £5, £10, £25, £50, £100, £250 (plus free-text "Other amount", min £1) |
| Gift Aid | Checkbox on donation screen — UK taxpayer declaration; logged against donation record |
| Environments | Dev, QA/UAT, Production — fully isolated databases and storage |
| Sensitive Data in Logs | NEVER log passwords, OTPs, session tokens, card numbers, or PII beyond necessary identifiers |

> **[FRONTEND-RECONCILE]** Confirm date/time display, currency formatting, default page size,
> and session-timeout warning behaviour match the live prototype.

---

## 3. Platforms

| Platform | Type | Primary Users | Notes |
|----------|------|---------------|-------|
| Web Application | ReactJS SPA (HB Admin Template + HSS Brand Kit) | Super Admin, National/Regional/Town Heads, AC Admin, Event Admin, Reporting User, Ops User | Single platform for all admin/operational roles; RBAC + scope controls visibility |
| Mobile App | React Native (iOS + Android) | Member (18+), Teen (12–17) | Member (18+) also manages child profiles as guardian |
| Backend REST API | Node.js + Nginx | All roles / system actors | Serves web and mobile; validates all business rules server-side |
| Database | MySQL | System actor | Primary relational store; Redis for caching |
| File Storage | Azure Blob Storage (UK region) | System actor | Private access; role/scope controlled downloads |
| External: Stripe | Payment gateway | System actor | Event payments, donations, refunds |
| External: Email/SMS OTP | Notification delivery | System actor | Email mandatory, SMS optional; provider TBD |

---

## 4. Roles

| Role | HSS Name | Description | Access Level |
|------|----------|-------------|--------------|
| Super Admin | n/a | Full system governance — all modules, RBAC, Masters CRUD, data migration, audit logs | Super Admin (unrestricted) |
| National Head | Kendriya Admin | National-level oversight; co-manages RBAC for National/Regional Head, Reporting User, Ops User | Admin |
| Regional Head | Vibhaag Admin | Regional-level operations; view Masters for towns/centres under region | Admin |
| Town Head | Nagar Admin | Town-level operations; view Masters for centres under town | Admin |
| Activity Centre Admin | Shakha Admin | View-only on members; manages RBAC for AC Admin, Ops User, Member, Teen; compliance, incidents | Admin |
| Event Admin | Event Admin | Creates/manages events, registrations, check-in/out, refunds; manages own RBAC | Admin |
| Reporting User | Reporting User | Read-only dashboards and CSV reports across assigned hierarchy | Read-Only |
| Ops User | Shakha Operations | Session setup, attendance marking, log view | Standard |
| Member (18+) | Adult Member | Self-managed profile, attendance, events, donations; guardian capability for child profiles | Standard |
| Teen (12–17) | Teen Member (Kishor/i) | Same as adult member once approved; restricted to profile-only during pending states | Standard (Restricted pending) |
| Child (<12) | Bal(ika) / Shishu | No login; profile managed by linked Member (18+) guardian | None (no direct access) |

---

## 5. Module List

> Full per-role module breakdown retained in the source Doc. Summary below; detailed
> module specs live in their own files (`03`–`11`).

**Super Admin:** Authentication · Dashboard · Profile · Masters · Members Management ·
Events Management · Announcements · Notifications (Bell) · Attendance · Reports ·
Settings/RBAC · Audit Logging · Data Migration.

**National Head:** Auth · Dashboard (national KPIs) · Profile · Masters (view) ·
Members (view) · Events (CRU) · Announcements (CRU) · Notifications · Attendance
(mark/log) · Reports · RBAC (Nat/Reg/Reporting/Ops).

**Regional Head:** Auth · Dashboard (regional KPIs) · Profile · Masters (view) ·
Members (view) · Events (CRU) · Announcements (CRU) · Notifications · Attendance
(setup/mark/edit/log) · Reports.

**Town Head:** Auth · Dashboard (town KPIs) · Profile · Masters (view) · Members
(view) · Events (CRU) · Announcements (CRU) · Notifications · Attendance · Reports.

**Activity Centre Admin:** Auth · Dashboard (centre KPIs) · Profile · Masters (view) ·
Members (view-only) · Events (CRU + registrations view/approve) · Announcements
(centre level) · Notifications · Attendance · Compliance · Incident Logging · Reports
(scoped) · RBAC (AC/Ops/Member/Teen).

**Event Admin:** Auth · Dashboard (events) · Profile · Events Management (full +
Stripe + refunds) · Announcements (view) · Notifications · own RBAC.

**Reporting User:** Auth · Dashboard · Profile · Members (view-only) · Events (view) ·
Announcements (view) · Notifications · Reports (scoped).

**Ops User:** Auth · Dashboard (announcements) · Profile · Attendance · Announcements
(view) · Notifications.

**Member (18+) — Mobile:** Auth (self + child profile creation) · Dashboard · Profile
(+ child profiles + compliance uploads + age transition at 18) · Attendance (own) ·
Events (browse/register self or child + Stripe) · Donations · Announcements · Notifications.

**Teen (12–17) — Mobile:** Auth (guardian or self with guardian email; profile-only
while pending) · Dashboard (once Active) · Profile · Attendance (own, once Active) ·
Events (once Active) · Announcements (once Active) · Notifications.

---

## 6. Role & Permission Matrix (Global)

Scope is enforced server-side on every request. The matrix shows action-level
permissions; data visibility is further restricted by the user's assigned hierarchy
scope (National / Regional / Town / Centre).

| Module | Super Admin | National Head | Regional Head | Town Head | AC Admin | Event Admin | Reporting User | Ops User | Member (18+) | Teen (12–17) |
|--------|-------------|---------------|---------------|-----------|----------|-------------|----------------|----------|--------------|--------------|
| Authentication | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| Dashboard | All KPIs | National KPIs | Regional KPIs | Town KPIs | Centre KPIs | Events only | Members + Reports | Announcements only | Events + Announcements | Events + Announcements |
| Profile | View/Edit own | View/Edit own | View/Edit own | View/Edit own | View/Edit own | View/Edit own | View/Edit own | View/Edit own | View/Edit own + child profiles | View/Edit own |
| Masters – Countries | CRUD | — | — | — | — | — | — | — | — | — |
| Masters – Regions | CRUD | View | — | — | — | — | — | — | — | — |
| Masters – Towns | CRUD | View | View | — | — | — | — | — | — | — |
| Masters – Centres | CRUD | View | View | View | — | — | — | — | — | — |
| Masters – Responsibility | CRUD | View | View | View | View | — | — | — | — | — |
| Members – Listing | Full | View | View | View | View | View | View | — | — | — |
| Members – Pending Approvals | Approve/Reject | View | View | View | View | — | — | — | — | — |
| Members – Guardian Approvals | Approve/Reject | View | View | View | View | — | — | — | — | — |
| Members – Edit | Full | — | — | — | — | — | — | — | — | — |
| Events | CRUD + Override | CRU | CRU | CRU | CRU | CRUD | View/Edit | View | View/Register | View/Register |
| Announcements | CRUD | CRU | CRU | CRU | CRU | View | View | View | View | View |
| Attendance – Setup | ✔ | — | ✔ | ✔ | ✔ | — | — | ✔ | — | — |
| Attendance – Mark/Unmark | ✔ | — | ✔ | ✔ | ✔ | — | — | ✔ | Own only | Own only |
| Attendance – Edit submitted | ✔ | — | ✔ | ✔ | ✔ | — | — | ✔ | Own only | Own only |
| Attendance – Log | ✔ | ✔ | ✔ | ✔ | ✔ | — | — | ✔ | — | — |
| Donations | — | — | — | — | — | — | — | — | ✔ | — |
| Compliance | View | View | View | View | View | — | View | — | Own only | Own (once Active) |
| Incident Logging | View/Create | — | — | — | View/Create | View/Create | — | — | — | — |
| Reports + CSV Export | ✔ | ✔ | ✔ | ✔ | ✔ | — | ✔ | — | — | — |
| Settings / RBAC | Full | RBAC for Nat/Reg/Ops/Reporting | — | — | RBAC for AC/Ops/Member/Teen | Own RBAC | — | — | — | — |
| Audit Logging | ✔ | — | — | — | — | — | — | — | — | — |
| Data Migration | ✔ | — | — | — | — | — | — | — | — | — |
| Notifications (Bell) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

> **Dashboard:** the row above shows per-role summary access only. Itemized KPI cards,
> sub-metrics, visibility rules, and navigation per role/screen are specified in
> `frd/13-dashboard.md`.

---

## 7. Status Transition Rules (State Machine)

### 7.1 Member Registration Lifecycle

| From | To | Allowed? | Actor | Condition |
|------|----|----------|-------|-----------|
| — | Pending Approval | ✅ | System | Adult (18+) submits registration |
| — | Pending Parental Consent | ✅ | System | Teen (12–17) submits; system first routes to Registration Approval |
| Pending Approval | Active | ✅ | Super Admin / National / Regional / Town Head | Admin approves |
| Pending Approval | Rejected | ✅ | Super Admin / National / Regional / Town Head | Admin rejects (reason required) |
| Pending Parental Consent | Pending Approval | ✅ | System | Linked Member (18+) guardian provides consent |
| Pending Parental Consent | Rejected | ✅ | Guardian / Admin | Guardian denies consent |
| Rejected | — | ✅ | System (hard delete) | Rejection triggers hard delete of member record — PII removed; audit log (hashed only) retained 6 months. Member can re-apply via fresh registration (new record). No "resubmit" path — record no longer exists. |
| Active | Inactive (Deactivated) | ✅ | Super Admin | Soft deactivation |
| Inactive | Active | ✅ | Super Admin | Reactivation |
| Any | Deleted (Soft) | ✅ | Super Admin | Only if no active dependencies |
| Active | Pending Approval | ❌ | — | Active is terminal unless deactivated |
| Rejected | Active | ❌ | — | Must go through Pending Approval first |

### 7.2 Teen Login Access (within Pending states)

| State | Login Allowed? | Access |
|-------|----------------|--------|
| Pending Parental Consent | ✅ | Profile-only view |
| Pending Approval | ✅ | Profile-only view |
| Active | ✅ | Full access |
| Rejected | ❌ Not applicable — hard delete | Hard delete on rejection removes member record. No session possible. Re-application = fresh registration. Confirmed in US-010 §4 (03-authentication.md). |

### 7.3 Compliance (DBS / First Aid)

| From | To | Allowed? | Condition |
|------|----|----------|-----------|
| — | Pending | ✅ | Member uploads document |
| Pending | Completed / Verified | ✅ | Central team verifies |
| Completed | Expired | ✅ | System (date-based, First Aid only) |
| Expired | Pending | ✅ | Member uploads new document |
| Completed | Pending | ✅ | Member re-uploads document |

### 7.4 Attendance (Sankhya) Submission

| From | To | Allowed? | Actor | Condition |
|------|----|----------|-------|-----------|
| — | Draft | ✅ | Ops User / AC Admin | Partial entry saved |
| Draft | Submitted | ✅ | Ops User / AC Admin | All members marked, submit action |
| Submitted | Submitted (edited) | ✅ | AC Admin, Ops User, Member (own), Regional Head, Town Head | Edit after submission by permitted role |
| Draft | Draft (edited) | ✅ | Any permitted role | Ongoing edit before submit |

### 7.5 Event Registration (Participant)

| From | To | Allowed? | Actor | Condition |
|------|----|----------|-------|-----------|
| — | Pending | ✅ | Member / Teen | Registration submitted |
| Pending | Approved | ✅ | Event Admin / AC Admin | Manual approval (if required) |
| Pending | Rejected | ✅ | Event Admin / AC Admin | Rejection with reason |
| Approved | Checked-in | ✅ | Event Admin | Check-in at event |
| Approved | Refunded | ✅ | Event Admin / Super Admin | Paid event; refund via Stripe |
| Checked-in | Refunded | ✅ | Super Admin | Exceptional case; override |
| Rejected | Pending | ✅ | Member | Re-registration |
| Refunded | Pending | ❌ | — | Cannot re-register after refund in same event |

### 7.6 Event Lifecycle

| From | To | Allowed? | Condition |
|------|----|----------|-----------|
| — | Draft | ✅ | Event Admin / Super Admin creates event |
| Draft | Published / Active | ✅ | Event Admin publishes |
| Published | Cancelled | ✅ | Event Admin / Super Admin (before event starts) |
| Published | Completed | ✅ | System (after event end datetime passes) |
| Published | Deactivated | ✅ | Super Admin |
| Completed | Deleted | ❌ | Cannot delete completed events |
| Any (started) | Edited | ❌ | Edit blocked once event start datetime reached (server-enforced) |

> **[FRONTEND-RECONCILE]** Verify every status badge/label and allowed transition shown
> in the prototype matches these tables — especially Event Registration where the
> prototype Events tab references RSVP statuses (Going / Maybe / Not Going). See
> `06-events.md` open questions.

---

## 8. Compliance Requirements

### 8.1 GDPR (UK GDPR / Data Protection Act 2018)

HSS UK is the data controller (Registered Charity No: 1202635). All processing must
comply with the six UK GDPR principles.

**8.1.1 PII fields requiring access control and masking in exports/logs:** Full name,
Date of birth, Email, Phone, Home address, Health conditions, Ethnic background, Native
language, Nationality, DBS reference number, Emergency contact details, Next-of-kin details.

**8.1.2 Right to Erasure (Article 17):** soft delete + anonymisation; PII replaced with
anonymised values (e.g. `DELETED_USER_[ID]`); financial/donation records retained per
legal obligation; DBS-related data retained per safeguarding statutory obligations.
Process: Super Admin initiates → dependency check → anonymise if clear, else notify reason.

**8.1.3 Data Export (SAR):** members can request export, fulfilled via Admin action;
format **[TBD — Non-Blocking]** (PDF or CSV); response window 1 month (UK GDPR Article 12).

**8.1.4 Consent Capture:** parental/guardian consent captured via guardian approval
workflow; Gift Aid consent at donation screen; consent records immutably logged with
timestamp and actor.

**8.1.5 Data Minimisation:** report exports respect applied scope filters; API responses
return only fields appropriate to the requesting role's scope.

### 8.2 OWASP Web Security

| Control | Implementation |
|---------|----------------|
| Input Validation | Server-side strict validation on all inputs; client-side is UX only |
| Authentication | OTP-based 2FA for all roles; JWT strategy **[TBD — Blocking (Q1)]** |
| Password Storage | bcrypt salted hash; never stored or logged in plaintext |
| SQL Injection | Parameterized queries / ORM (no raw SQL with user input) |
| XSS Prevention | Output encoding on all rendered user data; CSP headers |
| CSRF Protection | **[TBD — Blocking (Q2)]**: token-based or SameSite cookie; depends on Q1 |
| Rate Limiting | Per endpoint and per IP (see §2); Redis-backed |
| Sensitive Data in Logs | Never log passwords, OTPs, session tokens, card numbers, PII beyond necessary identifiers |
| File Upload Security | Virus/malware scanning on all uploaded files before Azure Blob storage |
| Privilege Escalation | RBAC enforced at API level (not just UI); scope validated server-side every request |
| Enumeration Protection | Auth endpoints must not reveal whether an email is registered |
| Transport | TLS 1.2+ everywhere; HTTP redirected to HTTPS |

### 8.3 Other Compliance

| Standard | Applicability |
|----------|---------------|
| ISO 27001:2013 | Hidden Brains is certified; development practices follow ISO 27001 controls |
| PCI-DSS | Stripe handles card data; system never stores card numbers |
| Safeguarding (UK) | DBS checks tracked for members working with minors; consent workflows enforced for under-18; Super Admin cannot bypass OTP/consent safeguards |
| Gift Aid (HMRC) | Donation screen captures UK taxpayer declaration; records retained for HMRC audit trail |

---

## 9. Data Retention Policies

| Data Type | Retention | Archival | Legal Basis |
|-----------|-----------|----------|-------------|
| Active member records | Indefinitely while active | Live DB | Legitimate interest (charity operations) |
| Inactive / deactivated member records | **[TBD — Blocking (Q3)]**: years post-deactivation | Soft delete → archive → anonymise | UK GDPR Article 5(1)(e) |
| Deleted member records (GDPR erasure) | Anonymised immediately; financial links retained | Anonymisation in-place | UK GDPR Article 17 |
| Financial records (donations, event payments, refunds) | 7 years | Archive (cold storage) | HMRC / Charity Commission |
| DBS-related data | Duration of safeguarding obligation + **[TBD]** years | Retained per safeguarding policy | Statutory safeguarding |
| First Aid compliance docs | Until expired + **[TBD]** years | Azure Blob archive | Operational compliance |
| Audit logs | **[TBD — Blocking (Q4)]**: minimum 3 years recommended | Immutable; Azure archive | UK GDPR accountability |
| Attendance records (Sankhya) | **[TBD — Non-Blocking]** | Archive post-season | Operational |
| Event registration / participation history | **[TBD — Non-Blocking]** | Archive post-event | Operational |
| System logs (non-audit) | 90 days | Rolling delete | Operational |

---

## 10. Possible Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Safeguarding breach — consent bypass | Low | Critical | OTP/consent cannot be bypassed by any role, incl. Super Admin; audit log on every consent action |
| PII leakage via report exports | Medium | High | CSV exports scoped strictly to user's hierarchy; server-side validation before export |
| Stripe payment / refund reconciliation gap | Medium | High | All Stripe events logged; webhook processing with idempotency keys; refund audit trail |
| Masters hierarchy edit breaks permissions/reporting | Medium | High | Dependency check before deactivation/edit; cascade rules; audit on all Masters changes |
| Attendance integrity — edit after submit | Medium | Medium | Edit restricted to permitted roles; all edits audited |
| OTP/SMS provider downtime | Medium | High | Email OTP always mandatory (fallback); graceful error without exposing provider |
| Data migration data loss / corruption | Medium | Critical | Dry-run reconciliation before cutover; rollback plan; client validates in UAT |
| Session hijacking | Low | High | HttpOnly cookies or secure Bearer tokens; server-side invalidation on logout/timeout |
| File upload malware | Low | High | Virus scanning before Azure Blob storage; strict MIME validation |
| IP/account brute force | Medium | High | Account lockout + IP blocking (see §2) |

---

## 11. Open Questions / TBDs

🔴 = Blocking (must resolve before Gate 3 or the relevant Gate 4 module spec).

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | Auth strategy: JWT HttpOnly cookies (Web) + Bearer (Mobile), or unified Bearer for both? | 🔴 Yes | Client + Dev | Open |
| Q2 | CSRF protection strategy: token-based or SameSite? (depends on Q1) | 🔴 Yes | Dev | Open |
| Q3 | Inactive member data retention period (years post-deactivation before anonymisation) | 🔴 Yes | Client | Open |
| Q4 | Audit log retention period (min 3 years recommended — confirm) | 🔴 Yes | Client | Open |
| Q5 | DBS data retention (how long after safeguarding obligation ends) | 🔴 Yes | Client (legal) | Open |
| Q6 | Teen login while Rejected: allowed at all? | 🔴 Yes | Client | Open |
| Q7 | Email/SMS OTP provider (Twilio / AWS SES / SendGrid?) | 🟡 No | Client | Open |
| Q8 | CI/CD toolchain (Jenkins or GitLab CI/CD?) | 🟡 No | Dev | Open |
| Q9 | Events Report compliance filter: checked at registration vs report time; hard gate vs soft filter | 🔴 Yes (Gate 4) | Client | Deferred to Gate 4 |
| Q10 | Member data export format for SAR (PDF or CSV?) | 🟡 No | Client | Open |
| Q11 | Session timeout warning modal ("expiring in 5 min") before auto-logout? | 🟡 No | Client | Open |
| Q12 | Password reuse policy (disallow last 5) — must-have or stretch? | 🟡 No | Client | Open |
