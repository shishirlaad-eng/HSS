# 03 — Authentication

**Maps to Doc tab:** Authentication · **Platform:** Admin Web / Backoffice + Member Portal · **Risk Level:** High
**Stories:** US-001 to US-014 (Super Admin / Member / Teen authentication; multi-role session management)

## Overview
Secure access to both the Admin Web (Backoffice) and the Member Portal. For Super Admins, covers the full authentication lifecycle: login (Email/Password + OTP 2FA), OTP verification, forgot password via OTP, reset password with policy enforcement, and logout with session termination. For Members and Teens, covers self-registration with age-based routing, guardian consent flow for Kishor (12–17) applicants, status-based restricted login sessions (Pending Approval / Pending Parental Consent), and full session access on activation. Enforces strict rate limits, account/IP lockouts, and anti-enumeration protections across all actor types. Super Admin provisioning is out of scope.

## Actors & Roles
| Actor | Type | Description |
|-------|------|-------------|
| Super Admin | Human | System-wide administrator logging into Admin Web |
| Adult Member | Human | Self-registered applicant aged 18+; logs into Member Portal |
| Teen / Kishor | Human | Self-registered applicant aged 12–17; requires guardian consent before Admin approval |
| Guardian | Human | Parent or legal guardian of a Teen applicant; may or may not be an existing HSS member; acts via tokenised email link |
| Auth Service | System | Validates credentials, issues/verifies OTP, issues/invalidates sessions, enforces limits, writes audit logs, generates guardian consent tokens |
| OTP Delivery Provider | External | Sends OTP and guardian consent emails via Email/SMS (provider TBD) |
| Identity Store | System | Stores identity, password hash, account status, MFA channel settings, membership status |

## Module Global Standards
DB datetime UTC · display timezone fixed by Country/Org context from profile · DD/MM/YYYY ·
24-hour · GBP · HTTPS/TLS only · SMTP must be configured & enabled in Settings for email OTP.

### Rate Limits (per IP)
| Endpoint | Limit |
|----------|-------|
| /auth/login | 20 req/min/IP |
| /auth/otp/verify | 30 req/min/IP |
| /auth/otp/resend | 10 req/min/IP |
| /auth/password/forgot | 10 req/min/IP |
| /auth/password/reset | 10 req/min/IP |

> **Scope:** All rate limits and lockout rules in this section apply to all actor types sharing the `/auth/login` endpoint — Super Admin, Adult Member, and Teen Member. Member registration has a separate rate limit on `/auth/member/register` [TBD — see US-009 Q2]. Guardian consent endpoints are rate-limited independently [TBD — see US-012 §4.5].

### Lockout Rules
| Type | Trigger | Duration | Escalation |
|------|---------|----------|------------|
| Account lockout (by email) | 5 failed logins / 15 min | 15 min | 60 min if another lockout same email / 24h |
| OTP verification lockout (by email) | 5 invalid OTP / 10 min | 15 min | None |
| IP block | 20 failed logins / 15 min from IP | 30 min | 2nd = 60 min; 3rd = 24h within 24h |

### OTP Resend Limits (per email)
Cooldown 60 s · max 3 / 15 min · daily cap 10 / 24h · resend invalidates previous OTP.

### OTP Expiry (configurable in Settings)
Login OTP 5 min · Reset OTP 10 min.

### Session Management
Idle timeout 60 min (default, configurable) · message: "Session expired. Please log in again."

### Validation & User Messaging Reference (exact copy)
All validation errors render in a single shared form-level error banner (not field-level
inline messages) — see US-001 §3, US-002 §3, US-004 §3.

| Scenario | Level | Message |
|----------|-------|---------|
| Invalid email format | Form | "Enter a valid email address." |
| Missing password | Form | "Password is required." |
| Invalid credentials | Form | "Invalid credentials." |
| Account inactive | Form | "Account is not active." |
| Invalid OTP | Form | "Invalid OTP." |
| OTP expired | Form | "OTP expired. Please resend OTP." |
| OTP resend cooldown | Form | "Please wait 60 seconds before requesting a new OTP." |
| OTP resend limit | Form | "OTP resend limit reached. Try again later." |
| Lockout | Form | "Too many attempts. Try again later." |
| OTP provider failure | Form | "Unable to send OTP right now. Please try again later." |
| Password policy fail | Form | "Password does not meet policy." |
| Confirm mismatch | Form | "Passwords do not match." |
| Wrong role access | Form | "Access denied." |
| Session expired | Form | "Session expired. Please log in again." |
| Password reset success | Form | "Password reset successful. Please log in." |
| Forgot password sent | Form | "If the email is valid, an OTP has been sent." |

> **Prototype delivery note:** Success-path messages ("If the email is valid, an OTP has been sent.", "Password reset successful. Please log in.", "Trusted device recognised. Logged in without OTP.") are delivered as `toast.success()` in the frontend prototype rather than form-level banners. This is accepted behaviour for success confirmations. Form-level error banners remain mandatory for all error/failure messages (per table above).

### Out of Scope
SSO (SAML/OAuth enterprise) · authenticator-app MFA (TOTP) · hardware keys (FIDO2) ·
biometric login · passwordless (magic links) · Super Admin provisioning · "Remember me"
OTP bypass · active session management console (unless added later).

---

## US-001 · Login — Credential Validation & OTP Initiation

### 1. User Story
The system shall allow a Super Admin to enter Email and Password on the Login screen,
validate credentials against the Identity Store, and on success create a Pending OTP
session state, issue an OTP via the configured delivery channel, and navigate to the
OTP Verification screen.

### 2. Screen Purpose
Entry point to the Admin Web Backoffice. Collects Email and Password, validates them
server-side, and initiates the 2FA flow. A successful credential check only triggers an
OTP challenge — it does not grant access. A "Forgot Password" link is always visible.

### 3. Fields & Validation
| Field | Type | Required | Validation | Message |
|-------|------|----------|-----------|---------|
| Email | Text | Yes | Valid email format (RFC 5322) | "Enter a valid email address." |
| Password | Password (masked) | Yes | Non-empty; never logged/stored plaintext | "Password is required." |
| Login | Button | — | Not disabled by pre-validation. Clickable whenever both fields are non-empty; on click, client-side validation runs and any failures are shown in a form-level error banner | — |
| Forgot Password | Link | — | Always visible; → Forgot Password screen | — |

### 4. Business Logic
**4.1 Positive:** user enters email + password and clicks Login (button is not pre-disabled) →
client-side validation passes (valid email format, non-empty password) → Auth Service
validates → account exists, is not hard-deleted, and credentials match → create "Pending OTP"
state → issue 6-digit OTP (Email required; SMS if enabled) → navigate to OTP Verification.
**Status-gating note:** "Account is not active." fires only for explicitly deactivated
accounts. Members with status Pending Approval or Pending Parental Consent are allowed to
proceed through OTP — their post-authentication session is restricted based on status (see
US-013). Hard-deleted accounts (rejected members) have no record; they receive "Invalid
credentials." (anti-enumeration — identical to any failed login).
**4.2 Negative:** Invalid credentials → "Invalid credentials." (no field/email disclosure, no
OTP). Account explicitly inactive/deactivated → "Account is not active." (no OTP). Hard-deleted
member → "Invalid credentials." (anti-enumeration; no disclosure of deletion). Invalid email
format (client, on submit attempt) → form-level error banner, no API call. Password empty
(client, on submit attempt) → form-level error banner, no API call.
**4.3 Edge:** Account lockout (5 fails/15 min → 15 min; 2nd/24h → 60 min). IP block (20 fails/15
min → 30 min; 2nd 60 min; 3rd 24h). Loading state disables button + spinner. OTP delivery
failure → "Unable to send OTP right now. Please try again later." Wrong role → "Access denied."
**4.4 Audit:** login attempt (success/failure), account lockout (email hash + duration), IP
block (IP + duration); never store password/OTP/token; include correlationId.
**4.5 Security/Permissions:** password never logged/stored plaintext; errors never reveal email
existence; HTTPS/TLS only; rate limit 20 req/min/IP on /auth/login. Shared endpoint across all actor types (Super Admin, Adult Member, Teen Member); member-specific post-authentication session routing governed by US-013. Session token (JWT or equivalent) encodes all roles assigned to the authenticating account. Active role at login = Member/Teen for member-type accounts; Super Admin / admin role for admin-only accounts. Role-context switching post-authentication governed by US-014.

> **[Prototype gap — Login button enabled state]** Frontend prototype enables the Login button even when both fields are empty; validation fires on submit. Production must enforce: button enabled only when both Email and Password fields are non-empty (per AC §7 bullet 1 intent).

> **[Prototype gap — Email validation regex]** Frontend uses a simplified regex (`/^\S+@\S+\.\S+$/`) rather than RFC 5322–compliant validation. Low risk in practice but deviates from §3 spec. Production implementation should use a compliant library or server-side validation.

### 5. Navigation Rules
Login → OTP Verification (valid credentials). Login → Forgot Password (link). Any screen →
Login (logout/timeout). Login → Member Registration screen via a "Register as Member"
button/link displayed below the Login button (cross-reference: see `05-members.md` for the
Member Registration screen specification — full registration flow and field details are not
duplicated here; this entry covers only the navigation entry point).

### 7. Acceptance Criteria
- [ ] Login button is clickable whenever both Email and Password fields are non-empty (not gated on pre-validation of email format).
- [ ] On Login click, if Email format is invalid or Password is empty, show a single form-level error banner and do not call the API.
- [ ] "Invalid credentials." for any mismatch without field/email disclosure; no OTP.
- [ ] "Account is not active." when account is explicitly deactivated; no OTP. Hard-deleted (rejected) member login returns "Invalid credentials." — indistinguishable from wrong-password response (anti-enumeration). Members with status Pending Approval or Pending Parental Consent proceed through OTP normally; session routing applied post-verification (US-013).
- [ ] Create Pending OTP, issue OTP, navigate to OTP Verification on valid Active login.
- [ ] Lock account 15 min after 5 fails/15 min; escalate 60 min on 2nd/24h.
- [ ] Block IP 30 min after 20 fails/15 min; escalate 60 min/24h.
- [ ] Audit every attempt, failure, lockout, IP block, excluding secrets.

### 8. API Mapping
| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| /auth/login | POST | No (pre-auth) | 20 req/min/IP; returns Pending OTP state |

### 10. Dependencies
Identity Store (active SA account + salted hash); OTP Delivery Provider (Email required,
SMS optional); US-002 (OTP Verification target).

### 11. Open Questions
| # | Question | Blocking? |
|---|----------|-----------|
| Q1 | Does "Account is not active." intentionally differ from "Invalid credentials." (enumeration risk)? (Global §8.1.5) | 🔴 Yes |

---

## US-002 · OTP Verification — Authenticate Session
**Version 3.1** — opt-in trusted-device checkbox (default checked), matching frontend prototype (SuperAdminAuth.tsx).

### 1. User Story
The system shall allow a Super Admin in "Pending OTP" state to enter a 6-digit OTP, optionally
choose whether to remember the device via a checkbox (default checked), verify the OTP within
the configured expiry window, and on success create an authenticated session, persist a
trusted-device cookie for 30 days only if the checkbox remains checked, and redirect to the
Dashboard. On subsequent logins from the same device within 30 days (where a valid cookie
exists), the OTP step is bypassed.

### 2. Screen Purpose
Second factor of login. Validates digit format, correctness, expiry; grants a session or
shows a specific error. Rate-limited Resend OTP available. A "Remember this device for 30
days" checkbox, checked by default, controls whether the system writes the
`hss_trusted_device` cookie (30 days) on successful verification.

### 3. Fields & Validation
| Field | Type | Required | Validation | Message |
|-------|------|----------|-----------|---------|
| OTP | Text (numeric) | Yes | Exactly 6 digits, numeric (error shown via form-level error banner, not inline) | "Enter the 6-digit OTP." |
| Trusted Device Checkbox | Checkbox | No | Default state: checked. Label copy: "Remember this device for 30 days. You will not be asked for an OTP again on this device during that period." | — |
| Verify | Button | — | Enabled only when 6 digits entered | — |
| Resend OTP | Button/Link | — | 60 s cooldown; max 3/15 min; max 10/24h per email | "Please wait 60 seconds…" / "OTP resend limit reached. Try again later." |

### 4. Business Logic
**4.1 Positive:** enter 6-digit OTP → Verify enabled → Auth Service validates (matches, not
expired, not invalidated) → mark Verified, create session → if Trusted Device Checkbox is
checked at the moment of successful verification, write `hss_trusted_device` cookie (value:
encoded email; expiry 30 days; path `/`; `SameSite=Strict`); if the checkbox is unchecked, do
NOT write/refresh the cookie → redirect to Dashboard.
**4.2 Trusted-device bypass:** at Login, system checks for valid `hss_trusted_device` cookie
matching entered email → if found & non-expired, bypass OTP, create session directly → toast
"Trusted device recognised. Logged in without OTP." → Dashboard. **Cookie expiry on bypass:**
when bypass occurs, the existing cookie's 30-day expiry is NOT refreshed or reissued — the
original expiry timestamp from when the cookie was first set continues to apply unchanged.
**4.3 Negative:** Invalid OTP → "Invalid OTP." (stay, no session, no cookie). Expired → "OTP
expired. Please resend OTP." (no cookie). Resend within 60 s → cooldown message. Resend limit →
limit message. Delivery failure on resend → provider failure message.
**4.4 Edge:** OTP verify lockout (5 invalid/10 min → 15 min, no cookie). Resend invalidates
previous OTP. Settings-configurable expiry (default 5 min). Loading disables Verify/Resend.
Cookie mismatch → OTP proceeds normally. Cookie expired/deleted → OTP proceeds, new cookie on
next success (subject to checkbox state). Failed/expired OTP → no cookie written regardless of
checkbox state. Shared/public device → user should uncheck the Trusted Device Checkbox before
verifying.
**4.5 Audit:** OTP issued, resend, verify success/failure, verify lockout, trusted-device
cookie set (or not set, per checkbox state), trusted-device bypass login. Log email hashed,
correlationId, timestamp, IP. OTP value never logged.
**4.6 Security:** OTP never logged/in responses/plaintext. Session created only after success
or validated bypass. Cookie written only after confirmed success AND checkbox checked — never
on failure/expiry/lockout/unchecked-checkbox. Rate limits 30 (verify) / 10 (resend) req/min/IP.
**Target production implementation:** the `hss_trusted_device` cookie must be set server-side
with `HttpOnly`, `Secure`, `SameSite=Strict`, 30-day expiry, `path=/`. **Prototype-only gap:**
the current frontend prototype simulates this client-side via `document.cookie` (value =
`encodeURIComponent(email)`); `HttpOnly` and `Secure` cannot be set from client-side
JavaScript. This is a known prototype limitation — the real implementation must move
cookie-setting to the server. Cleared on explicit logout (see US-005).

> **[Prototype gap — Verify button enabled state]** The current frontend prototype enables the Verify button whenever the form is active (`disabled={isLoading}` only); it is NOT gated on exactly 6 numeric digits having been entered. The production implementation must enforce: Verify button enabled ONLY when exactly 6 digits are present in the OTP field (matching AC §7 bullet 1). This is a known prototype shortcut — do not replicate in production.

### 5. Navigation Rules
OTP Verification → Dashboard (verified). Resend stays on screen.

### 7. Acceptance Criteria
- [ ] Enable Verify only when exactly 6 numeric digits entered.
- [ ] Create session + redirect to Dashboard on valid, non-expired, non-invalidated OTP.
- [ ] "Invalid OTP." (stay, no session) on incorrect OTP.
- [ ] "OTP expired. Please resend OTP." when past expiry.
- [ ] Block resend 60 s after previous OTP; block after 3/15 min or 10/24h.
- [ ] Invalidate previous OTP on resend; old OTP returns "Invalid OTP."
- [ ] Lock OTP verify 15 min after 5 invalid/10 min.
- [ ] Audit every issuance, resend, verify success/failure, lockout.
- [ ] Show the Trusted Device Checkbox, checked by default, with the exact label copy specified in §3.
- [ ] On successful verification with checkbox checked, write `hss_trusted_device` cookie (30-day, `SameSite=Strict`, email-bound).
- [ ] On successful verification with checkbox unchecked, do NOT write the `hss_trusted_device` cookie.
- [ ] Do NOT write cookie on failed/expired OTP or locked account, regardless of checkbox state.
- [ ] Bypass OTP + create session when valid matching cookie present; toast as specified.
- [ ] Do NOT bypass if cookie absent/expired/mismatched.
- [ ] On trusted-device bypass, do NOT refresh/reissue the cookie's 30-day expiry — original expiry stands unchanged.
- [ ] Clear cookie on explicit logout (see US-005 §4/§7/§8).

### 8. API Mapping
| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| /auth/otp/verify | POST | Pending OTP | 30 req/min/IP |
| /auth/otp/resend | POST | Pending OTP | 10 req/min/IP |

### 11. Open Questions
| # | Question | Status |
|---|----------|--------|
| Q1 | Is "Pending OTP" cleaned up server-side if abandoned without verifying? | Open |
| Q2 | Should Resend show a live 60 s countdown timer? | ✅ Resolved — Yes. Frontend prototype implements a live per-second countdown; resend button shows "Please wait {N} seconds before requesting a new OTP." The static copy in the Validation Reference table (§Module Global Standards) is superseded — the countdown variant is the accepted behaviour. |
| Q3 | Should the trusted-device cookie carry `Secure` (HTTPS-only)? | ✅ Resolved — Yes, per target production spec in §4.6 (aligns with `01-technical-specification.md` JWT cookie requirements). Not blocking. |
| Q4 | Should the cookie be set server-side (enabling `HttpOnly`) vs `document.cookie`? | ✅ Resolved — Yes, must be set server-side with `HttpOnly`, `Secure`, `SameSite=Strict` in production. Current frontend prototype uses client-side `document.cookie` as a known, documented prototype-only gap (see §4.6). Not blocking. |

---

## US-003 · Forgot Password — Request Reset OTP

### 1. User Story
The system shall allow any authenticated-account holder (Super Admin, Adult Member, or Teen Member) to submit their registered email on the Forgot Password screen and request a reset OTP, returning an identical UI and API response regardless of whether the email exists (anti-enumeration). Email is mandatory for all self-registrations (US-009 Q5, resolved); the phone-only registration path has been eliminated.

### 2. Screen Purpose
Accessible from the Login screen by all actor types. The flow and fields are identical regardless of whether the actor is a Super Admin, Adult Member, or Teen Member.

### 3. Fields & Validation
| Field | Type | Required | Validation | Message |
|-------|------|----------|-----------|---------|
| Email | Text | Yes | Valid email format | "Enter a valid email address." |
| Send OTP | Button | — | Enabled when valid; subject to rate limits | "Please try again later." (on rate limit) |

### 4. Business Logic
**Positive:** valid email enables Send OTP → always show "If the email is valid, an OTP has
been sent." → if email exists & eligible, issue + deliver reset OTP → navigate to Reset
Password. **Negative:** invalid format (client) → field message, no API call. Rate limit →
"Please try again later." Delivery failure → provider failure message. Email not found → same
generic message; no OTP. **Edge:** anti-enumeration — UI message, response body, and HTTP
status identical whether email exists; reset OTP caps same as login; loading disables button.
**Audit:** log every request without indicating whether email found; include correlationId.
**Security:** identical responses, no timing differences; rate limit 10 req/min/IP.

### 5. Navigation Rules
Login → Forgot Password (link). Forgot Password → Reset Password (on Send OTP). Forgot Password → Login ("Back to Login" link always visible on screen).

### 7. Acceptance Criteria
- [ ] "Enter a valid email address." + Send OTP disabled on invalid format, no API call.
- [ ] "If the email is valid, an OTP has been sent." for any valid-format email regardless of existence.
- [ ] Issue/deliver reset OTP only when email exists & eligible.
- [ ] Navigate to Reset Password after Send OTP completes.
- [ ] Enforce 60 s cooldown, max 3/15 min, max 10/24h.
- [ ] "Please try again later." on rate limit without disclosing existence.
- [ ] Audit every request without logging whether email found.

### 8. API Mapping
| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| /auth/password/forgot | POST | No | 10 req/min/IP; identical response always |

### 11. Open Questions
| # | Question | Status |
|---|----------|--------|
| Q1 | Should Forgot Password be reachable from OTP Verification (lost OTP channel)? | Open |

---

## US-004 · Reset Password — OTP Validation & Password Update

### 1. User Story
The system shall allow any authenticated-account holder (Super Admin, Adult Member, or Teen Member) to reset their password by submitting a valid reset OTP with a policy-compliant new password and matching confirmation, after which it updates the password hash, invalidates all outstanding reset OTPs, revokes all active sessions, and redirects to Login.

### 3. Fields & Validation
| Field | Type | Required | Validation | Message |
|-------|------|----------|-----------|---------|
| OTP | Text (numeric) | Yes | Exactly 6 digits (error shown via form-level error banner) | "Enter the 6-digit OTP." |
| New Password | Password (masked) | Yes | Min **8** chars; ≥1 uppercase; ≥1 lowercase; ≥1 number; ≥1 special character (from set `@$!%*?&`); not in last 5 (if feasible); not a common password (recommended). Helper text: "Min 8 characters, with uppercase, lowercase, number, and special character (@$!%*?&)." Error shown via form-level error banner. | "Password does not meet policy." |
| Confirm Password | Password (masked) | Yes | Must exactly match (error shown via form-level error banner) | "Passwords do not match." |
| Reset Password | Button | — | Enabled only when all three pass | — |

> **[Implementation follow-up — out of scope for this FRD edit]** The current frontend
> prototype (`SuperAdminAuth.tsx`) enforces a minimum password length of **12** characters.
> This FRD now specifies **8** per resolution of Global §2 vs US-004 conflict (see §11 Q4,
> resolved). The frontend will need to be updated to enforce min 8 (with the existing
> complexity rules) to match this spec.

> **[Member password policy]** Password policy for Member/Teen reset is identical to the policy defined in §3 above (min 8 chars; ≥1 uppercase; ≥1 lowercase; ≥1 digit; ≥1 special char from `@$!%*?&`). No separate member-specific policy applies.

### 4. Business Logic
**Positive:** valid OTP + compliant password + match → Auth Service validates OTP (correct,
not expired [default 10 min], not invalidated) → verify policy + not in last 5 hashes (if
feasible) → confirm match → store salted hash → invalidate all reset OTPs → revoke all active
sessions/tokens → redirect to Login "Password reset successful. Please log in."
**Negative:** Invalid OTP → "Invalid OTP." Expired → "OTP expired. Please resend OTP." Policy
fail → "Password does not meet policy." Mismatch → "Passwords do not match." Rate/attempt
limit → "Too many attempts. Try again later." (No change in any negative case.)
**Edge:** OTP verify lockout (5/10 min → 15 min). Resend invalidates earlier OTP. Used OTP
rejected on replay. Settings-configurable expiry. Atomic session revocation with hash update.
Loading disables button.
**Audit:** reset success / failure (with reason); never log password/OTP/token; correlationId.
**Security:** salted hash; plaintext never logged/stored; all active sessions revoked on
success; used reset OTP invalidated (replay prevention); rate limit 10 req/min/IP.

### 5. Navigation Rules
Reset Password → Login (on success, with "Password reset successful. Please log in." toast).
Reset Password → Login ("Back to Login" link always visible on screen).

### 7. Acceptance Criteria
- [ ] Enable Reset only when OTP 6 digits + password passes policy + confirm matches.
- [ ] On valid submit: store salted hash, invalidate reset OTPs, revoke all sessions, redirect to Login with success message.
- [ ] "Invalid OTP." / "OTP expired…" / "Password does not meet policy." / "Passwords do not match." each block the change.
- [ ] Reject used reset OTP on any subsequent attempt.
- [ ] Lock OTP verify 15 min after 5 invalid/10 min.
- [ ] Audit every reset attempt (success/failure reason), excluding secrets.

### 8. API Mapping
| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| /auth/password/reset | POST | Reset OTP | 10 req/min/IP; atomic update + revoke |

### 10. Dependencies
US-003 (issues the reset OTP); Identity Store (hash update + last-5 history check); Settings
(reset OTP expiry).

### 11. Open Questions
| # | Question | Status |
|---|----------|--------|
| Q1 | Password history (last 5) — must-have or stretch? (Global Q12) | Open |
| Q2 | Which common-password list/library (HaveIBeenPwned / OWASP)? | Open |
| Q3 | Inline Resend OTP on Reset screen, or return to Forgot Password? | ✅ Resolved — No inline resend on Reset screen. Frontend prototype provides a "Back to Login" link only. Confirmed as accepted behaviour. |
| Q4 | Password min length: 12 (module) vs 8 (Global §2) — confirm | ✅ Resolved — 8 governs (per Global §2). US-004 §3 updated accordingly. Frontend prototype currently enforces 12 and requires an update (flagged as implementation follow-up, out of scope for this FRD edit). Not blocking. |

---

## US-005 · Logout — Session Termination

### 1. User Story
The system shall allow any authenticated user (Super Admin, Adult Member, or Teen Member — including those in a restricted session) to log out, invalidate the session/token server-side, clear all client auth storage (including the `hss_trusted_device` cookie), show a "You have been logged out." confirmation message, and redirect to Login. For members in a restricted session (Pending Approval or Pending Parental Consent), logout behaviour is identical — the restricted session is terminated in the same way as a full session.

### 4. Business Logic
**Positive:** trigger logout → client sends logout request with current token → Auth Service
invalidates server-side → client clears all auth storage (session cookies/tokens AND the
`hss_trusted_device` cookie — set to expired/empty so it is no longer presented on the next
login) → show toast/confirmation "You have been logged out." → redirect to Login.
**Edge:** session already expired → idempotent, no error; `hss_trusted_device` cookie clearing
still occurs. Server unreachable → client still clears local storage (including
`hss_trusted_device`), shows the confirmation message, and redirects.
**Audit:** log every logout (include correlationId).
**Security:** server-side invalidation mandatory; /auth/logout requires authenticated session.
Clearing `hss_trusted_device` on logout ensures the user is shown the OTP screen again on next
login attempt (cross-reference: US-002 §4.6, §7).

### 7. Acceptance Criteria
- [ ] Send server-side logout request on trigger.
- [ ] Invalidate session/token server-side.
- [ ] Clear all client-side auth storage.
- [ ] Clear the `hss_trusted_device` cookie (set to expired/empty) on every logout, so the next login attempt requires OTP verification again.
- [ ] Show "You have been logged out." confirmation message (toast) on logout.
- [ ] Redirect to Login after logout.
- [ ] Audit every logout.

> **[Implementation gap — out of scope for this FRD edit]** The current frontend prototype's
> `handleLogout` does not clear the `hss_trusted_device` cookie. This is a known gap and
> requires a frontend fix to comply with the AC above.

### 8. API Mapping
| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| /auth/logout | POST | Yes | Idempotent; MUST clear `hss_trusted_device` cookie (set to expired/empty) as part of the logout response/flow |

### 10. Dependencies
US-001/US-002 (authenticated session must exist).

---

## US-006 · Session Idle Timeout

### 1. User Story
The system shall automatically log out any authenticated user (Super Admin, Adult Member, or Teen Member — including those in a restricted session) after the configured idle timeout (default 60 min), invalidate the session server-side, and redirect to Login with "Session expired. Please log in again." Idle timeout applies equally to restricted (pending) member sessions and full sessions.

### 4. Business Logic
**Positive:** inactive for idle timeout → Auth Service invalidates session server-side → next
request / client detection redirects to Login with the message.
**Edge:** idle timeout read from Settings; changes apply to new sessions. Client should
proactively detect token expiry and redirect.
**Audit:** log session expiry due to idle timeout.
**Security:** invalidation server-side; client redirect alone insufficient.

### 7. Acceptance Criteria
- [ ] Invalidate session after 60 min inactivity (default), configurable via Settings.
- [ ] Redirect to Login with "Session expired. Please log in again."
- [ ] Read idle timeout from Settings (no code deploy to change).
- [ ] Audit session expiry due to inactivity.

### 10. Dependencies
Settings module (configurable idle timeout readable by Auth Service).

### 11. Open Questions
| # | Question | Status |
|---|----------|--------|
| Q1 | Show a "session expiring in 5 min" warning modal before timeout? (Global Q11) | Open |

---

## US-007 · OTP Notification Delivery — Email & SMS

### 1. User Story
The system shall deliver OTP notifications via Email (mandatory) and SMS (if enabled) when an
OTP is issued for login or reset, using the configured provider, showing a generic error on
delivery failure without exposing provider details.

### Notification Rules
| Trigger | Email | SMS | Push | Notes |
|---------|-------|-----|------|-------|
| OTP issued for login | ✅ Always | ✅ If enabled | ❌ Never | Sent to registered channel(s) |
| OTP issued for password reset | ✅ Always | ✅ If enabled | ❌ Never | Anti-enumeration response required |
| Lockout triggered | ❌ | ❌ | ❌ | UI message only |

### 4. Business Logic
**Positive:** Auth issues OTP → send Email always → send SMS only if enabled → never push.
**Negative:** provider failure → "Unable to send OTP right now. Please try again later."; log
internally without vendor/technical details. **Edge:** reset OTP delivery status not exposed
in UI (anti-enumeration); SMS optional, checked before attempt; Email/SMS failures handled
independently; SMTP must be configured & enabled. **Audit:** log OTP issued (login/reset);
OTP value never logged.

### 7. Acceptance Criteria
- [ ] Send OTP via Email on every issuance (login + reset).
- [ ] Send OTP via SMS only when SMS enabled.
- [ ] Never send Push for any OTP event.
- [ ] Generic provider-failure message without exposing provider/error.
- [ ] Log delivery failures internally, excluding OTP values.

### 10. Dependencies
OTP Delivery Provider (SMTP creds; SMS gateway if enabled); Settings (SMTP configured & enabled).

### 11. Open Questions
| # | Question | Status |
|---|----------|--------|
| Q1 | Which vendor(s) for Email and SMS? (Global Q7) | Open |
| Q2 | SMS enablement: global Settings toggle or per-SA profile? | Open |
| Q3 | Member self-registration allows phone-only (no email). OTP delivery channel for phone-only member login is unresolved. | — | Client | ✅ Resolved — email mandatory for self-registration (US-009 Q5). Phone-only path eliminated. |

---

## US-008 · Audit Logging — Complete Auth Event Log

### 1. User Story
The system shall create immutable, append-only audit log entries for all authentication
events — successes, failures, lockouts, and session events — without storing any secret values.

### Required Audit Events

**Super Admin & all actor auth events:**
Login success/failure · OTP issued · OTP resend · OTP verify success/failure · account lockout ·
IP block · forgot password request · password reset success/failure · logout · trusted-device
bypass login · restricted session granted · role-context switch (activeRole changed mid-session).

**Member registration & lifecycle events:**
Member registration submitted · member registration blocked (age < 12) · member approved ·
member rejected + hard delete · session invalidated post-rejection.

**Guardian consent events (Teen path):**
Guardian consent email sent · guardian consent approved (direct or on-behalf override) ·
guardian consent declined (direct or on-behalf override) · guardian consent token expired ·
guardian consent email resent.

Each event logs correlationId, timestamp (UTC), and event-appropriate fields (email hash,
failure reason, lock/block duration, IP, memberId where applicable). Secrets (passwords,
OTPs, tokens, raw guardian PII) never logged. Full per-event field lists in US-009–US-013 §4.4.

### 4. Business Logic
**Audit Rules:** every entry includes event type, UTC timestamp, correlationId where available;
never store passwords/OTPs/tokens/plaintext secrets; lockout entries store email as hash; IP
block entries log IP + duration. **Edge:** append-only; soft/hard delete not permitted by
default; retention **[TBD]** (auth 12–24 months; OTP attempts 90 days); archival **[TBD]**.
**Security:** system-owned, immutable; no role (incl. Super Admin) may delete via the app.

### 7. Acceptance Criteria
- [ ] Audit entry for every event in the Required Audit Events list.
- [ ] Never store passwords/OTPs/tokens in any entry.
- [ ] Store email as hash in account-lockout entries.
- [ ] Include correlationId where available.
- [ ] All timestamps in UTC.
- [ ] No soft/hard deletion of audit entries by default.

### 10. Dependencies
US-001–US-007 (events); log storage infrastructure (append-only, configurable retention/archival).

### 11. Open Questions
| # | Question | Status |
|---|----------|--------|
| Q1 | Retention period (compliance/legal) — confirm | Open |
| Q2 | Archival target, access controls, search interface | Open |
| Q3 | Audit logs viewable by SA in Admin Web UI, or backend tooling only? | Open |

---

## Member / Teen Authentication

> **Scope note:** US-009–US-013 cover self-registration, guardian consent, and login for Adult Members and Teen/Kishor applicants on the Member Portal. They share the same login screen as Super Admin and other admin roles; routing is post-authentication based on role + membership status.

---

## US-009 · Member Self-Registration

### 1. User Story
The system shall allow an unregistered individual to self-register for HSS membership by completing a registration form with personal, contact, organisational, and password details; shall derive the applicant's age from the submitted date of birth; and shall automatically route the application: age ≥ 18 → Adult path (status = Pending Approval, US-010); age 12–17 (Kishor) → Teen path (status = Pending Parental Consent, US-011); age < 12 → block registration with a clear message.

### 2. Screen Purpose
The Member Registration screen is publicly accessible via the "Register as Member" button on the Login screen, requiring no prior login. The applicant completes personal details, creates a password, selects their organisational placement via cascading Masters dropdowns, and accepts the Terms & Conditions. If the applicant's DOB indicates age 12–17, a Guardian Email field is shown and becomes mandatory. On submission the system derives the age, routes to the correct approval path, and displays a confirmation summary. No manual path selection is required from the applicant.

### 3. Fields & Validation

| Field | Type | Mandatory | Validation Rules | Error Message |
|-------|------|-----------|-----------------|---------------|
| First Name | Text | Yes | Min 1 char, max 100 chars | "First name is required." |
| Last Name | Text | Yes | Min 1 char, max 100 chars | "Last name is required." |
| Date of Birth | Date | Yes | DD/MM/YYYY; must result in age ≥ 12; future dates rejected | "Date of birth is required." / "Self-registration is not available for members under 12. Please contact your Activity Centre." |
| Email Address | Email | Yes | RFC 5322 format; unique in system; mandatory for all self-registrations (required for login OTP delivery) | "Enter a valid email address." / "An account with this email already exists." |
| Phone Number | Tel | No | Valid phone format (optional) | "Enter a valid phone number." |
| Password | Password (masked) | Yes | Min 8 chars; ≥1 uppercase; ≥1 lowercase; ≥1 digit; ≥1 special char from `@$!%*?&` | "Password does not meet policy. Use min 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)." |
| Confirm Password | Password (masked) | Yes | Must exactly match Password | "Passwords do not match." |
| Country / Organisation | Dropdown | Yes | Valid value from Masters (MASTERS_CASCADE.countries) | "Country / organisation is required." |
| Region | Dropdown | Yes | Valid from Masters; depends on Country | "Region is required." |
| Town | Dropdown | Yes | Valid from Masters; depends on Region | "Town is required." |
| Activity Centre | Dropdown | Yes | Valid from Masters; depends on Town | "Activity centre is required." |
| Guardian Email | Email | Conditional | Required when DOB age is 12–17 (Kishor/Teen); hidden when age ≥ 18; RFC 5322 format; must differ from applicant email | "Guardian email is required for members aged 12–17." / "Enter a valid guardian email address." / "Guardian email must be different from your own email." |
| Terms & Conditions | Checkbox | Yes | Must be checked | "You must accept the Terms & Conditions and Privacy Policy." |
| Submit Registration | Button | — | Enabled; client-side validation runs on click | — |
| Cancel | Button | — | Always visible | Navigates back to Login |

Age-based field visibility rules:
- Age < 12: block on submit — show error, no API call
- Age 12–17 (Kishor/Teen): Guardian Email shown and required
- Age 18+: Guardian Email hidden and not required

### 4. Business Logic

**4.1 Positive Flow:**
1. Applicant opens registration form from Login screen ("Register as Member").
2. Applicant fills fields; Guardian Email field shown/hidden dynamically based on DOB.
3. Applicant submits; client-side validation passes.
4. POST /auth/member/register called.
5. Server validates uniqueness (email); derives age from DOB.
6. Age ≥ 18: member record created, status = Pending Approval → Adult path (US-010); toast: "Registration submitted. Your application is under review."
7. Age 12–17: member record created, status = Pending Parental Consent → Teen path (US-011); toast: "Registration submitted. We've sent an approval request to your guardian."
8. Confirmation screen shown with submitted details summary and current status badge.

**4.2 Negative Flow:**
1. Age < 12 (from DOB) → "Self-registration is not available for members under 12. Please contact your Activity Centre." No API call.
2. Email missing → "Email address is required." No API call.
3. Email invalid format → "Enter a valid email address." No API call.
4. Email already registered → "An account with this email already exists. Please log in or use a different email."
5. Password does not meet policy → "Password does not meet policy. Use min 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)."
6. Passwords do not match → "Passwords do not match."
7. Teen (12–17) submits without guardian email → "Guardian email is required for members aged 12–17."
8. Guardian email same as applicant email → "Guardian email must be different from your own email."
9. T&C not accepted → "You must accept the Terms & Conditions and Privacy Policy."
10. API failure → "Unable to submit registration. Please try again."

**4.3 Edge Cases:**
- DOB on exact 12th or 18th birthday: boundary inclusive — 12 = Teen/Kishor; 18 = Adult.
- Duplicate submission (back-button re-submit): server rejects on email uniqueness check.
- Slow connection: Submit button disabled + spinner during in-flight request; re-enabled on error.
- Country with no Regions: Region dropdown disabled; user cannot proceed — flag as Masters data issue.

**4.4 Audit Rules:**

| Event | Actor | Logged Fields | Timestamp |
|-------|-------|--------------|-----------|
| MEMBER_REGISTRATION_SUBMITTED | System | memberId, email (hashed), ageGroup (label, not raw DOB), status, memberType, activityCentreId, correlationId | UTC |
| MEMBER_REGISTRATION_BLOCKED | System (age < 12) | attempt IP, correlationId | UTC |

Password never logged. Raw DOB not stored in audit logs — age-group label only.

**4.5 Security & Permissions:**

| Role | View Form | Submit |
|------|-----------|--------|
| Unauthenticated (public) | ✅ | ✅ (own registration only) |
| Any authenticated user | ❌ (redirect to portal) | ❌ |

- Password stored as salted hash; never logged or stored plaintext.
- Registration endpoint rate-limited: [TBD — Needs Confirmation; recommend 10 req/min/IP].
- HTTPS/TLS mandatory.

### 5. Navigation Rules

- **Entry:** Login screen → "Register as Member" button (unauthenticated only).
- **Exit:**

| Action | Navigates To | Condition |
|--------|-------------|-----------|
| Submit (success — Adult 18+) | Registration Confirmation screen | After successful POST |
| Submit (success — Teen 12–17) | Registration Confirmation screen | After successful POST |
| Cancel | Login screen | Always |
| Back to Login (on confirmation) | Login screen | Always |

- **Status transitions on submit:**

| From Status | To Status | Trigger | Path |
|-------------|-----------|---------|------|
| (none) | Pending Approval | DOB age ≥ 18 | Adult path (US-010) |
| (none) | Pending Parental Consent | DOB age 12–17 | Teen path (US-011) |

### 6. Notifications

| Trigger | Channel | Recipient | Content Summary | Timing |
|---------|---------|-----------|----------------|--------|
| Adult registration submitted | Email | Admin (Activity Centre / Super Admin) | New member application pending review — name, Activity Centre | Immediately |
| Adult registration submitted | In-app | Admin | New pending approval notification | Immediately |
| Teen registration submitted | Email | Guardian (guardian email provided) | Guardian consent request — teen details + 7-day Approve/Decline link | Immediately |
| Teen registration submitted | In-app | Admin (Pending Guardian Approval queue) | Teen registration awaiting guardian consent | Immediately |

### 7. Acceptance Criteria

- [ ] Guardian Email field shown/hidden dynamically; for age 12–17 it is required; for age 18+ it is hidden and not required.
- [ ] System blocks submission with clear error when DOB indicates age < 12; no API call made.
- [ ] Adult (18+) registration creates member record with status Pending Approval; Teen (12–17) creates with status Pending Parental Consent.
- [ ] Password policy enforced: min 8 chars, uppercase, lowercase, digit, special char; Confirm Password must match exactly.
- [ ] Email uniqueness enforced; duplicate email returns appropriate error.
- [ ] Confirmation screen shown after successful submission with status badge (Pending Approval or Pending Parental Consent).
- [ ] T&C checkbox required; submission blocked if unchecked.
- [ ] All registration data (except password hash) accessible in admin Pending Approvals / Pending Guardian Approval queues.

### 8. API Mapping

| Endpoint | Method | Auth Required | Request | Response |
|----------|--------|--------------|---------|----------|
| /auth/member/register | POST | No (public) | `{ firstName, lastName, dateOfBirth, email, phone?, password, countryId, regionId, townId, activityCentreId, guardianEmail? (required if teen), acceptedTerms: true }` | `{ memberId, status, memberType }` |

Errors: 400 (validation) · 409 (email conflict) · 429 (rate limit) · 500.

### 9. Data Rules

- **Data Owner:** System
- **Soft Delete:** No
- **Hard Delete:** Yes — triggered when Admin rejects a membership application. On hard delete: all PII permanently removed from primary tables; audit log retains event with hashed identifiers only.
- **Data Retention:** Active member data: retained for the duration of active membership. Rejected (hard-deleted): all PII removed immediately; audit log entries (hashed identifiers only) retained for 6 months from the date of hard delete, then purged.
- **GDPR / PII:**
  - PII fields: First Name, Last Name, Date of Birth, Email, Phone
  - Password stored as salted hash only — never stored/logged as plaintext
  - Raw DOB not stored in audit logs; age-group label logged instead
  - Right to erasure: fulfilled by hard delete on rejection (PII removed immediately; audit log hashed-only retained 6 months then purged). For active members: [TBD — Needs Confirmation — mechanism for voluntary erasure request from active member].

### 10. Dependencies

- Masters data (MASTERS_CASCADE: countries, regions, towns, centres) must be pre-loaded.
- OTP / Email Delivery Provider — guardian consent email delivery (US-011).
- Terms & Conditions and Privacy Policy static pages must be published.
- US-010 (Adult approval flow) and US-011 (Teen guardian consent flow) are downstream.

### 11. Open Questions

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | Age 17 — classified as Adult or Teen/Kishor? | — | Client | ✅ Resolved — Teen/Kishor. Teen band is 12–17. Adult band is 18+. No gap. |
| Q2 | Registration rate limit (req/min/IP on /auth/member/register)? | No | Dev/Arch | Open |
| Q3 | Data retention period for active member PII? | — | Client/Legal | ✅ Resolved (partial) — rejected/hard-deleted: 6 months post-delete (hashed audit log only). Active member retention period: [TBD — Needs Confirmation]. |
| Q4 | Right to erasure for active (non-rejected) members — what is the mechanism? | Yes (GDPR) | Client/Legal | Open |
| Q5 | Phone-only registration (no email provided): email OTP delivery (mandatory per US-007) is not possible. | — | Client | ✅ Resolved — email is mandatory for all self-registrations. Phone is optional. Ensures OTP delivery channel always available for login and forgot-password flows. |

---

## US-010 · Adult Member — Approval Flow & Restricted Login

### 1. User Story
The system shall allow an Adult Member (status = Pending Approval) to log in immediately after self-registration using full OTP 2FA, but shall restrict their post-login session to the My Profile page only with a status banner; upon Admin approval the status transitions to Active and full member access is granted; upon Admin rejection the member record is permanently hard-deleted and any active session invalidated, with subsequent login attempts returning "Invalid credentials."

### 2. Screen Purpose
This story covers the restricted session state experienced by Adult Members after self-registration and before Admin approval. The member can log in, view and update their own profile, and see a status banner explaining their pending state. All other navigation is hidden or inaccessible. This allows members to correct their details and track status without accessing member features prior to verification. It also governs the Admin approve/reject actions that terminate this state.

### 3. Fields & Validation

No input form for the restricted session itself. Status banner and navigation restriction are the operative elements.

| Element | Type | Details |
|---------|------|---------|
| Status Banner | Read-only | "Your membership application is under review. You'll be notified once approved." |
| My Profile page | Page | Fully accessible and editable (name, contact, org mapping) |
| All other routes | Blocked | Redirect to My Profile; no error shown — silent redirect |

### 4. Business Logic

**4.1 Positive Flow:**
1. Adult member logs in (email + password + OTP — same login screen as all roles).
2. System checks status post-authentication: Pending Approval → grant restricted session (My Profile only).
3. Restricted session: My Profile renders; all other routes redirect silently to My Profile.
4. Admin approves via Pending Approvals (Sub-module B, 05-members.md): status = Pending Approval → Active.
5. Member notified by email + in-app: "Your membership has been approved! Welcome to MyHSS."
6. Next login (or live session update [TBD]) grants full member session.

**4.2 Negative Flow:**
1. Pending Approval member attempts non-Profile route → silent redirect to My Profile; banner remains.
2. Admin rejects: member record permanently hard-deleted.
   - If member has active session: session invalidated server-side; next request → Login with "Session expired. Please log in again."
   - If member attempts login after hard delete: "Invalid credentials." (anti-enumeration — no disclosure of deletion).
3. Rejection reason never disclosed to member via any channel.

**4.3 Edge Cases:**
- Member edits profile while Pending Approval: update persists; status unaffected by profile edits.
- Admin rejects while member session is active: graceful server-side session invalidation; next route triggers redirect to Login.
- Concurrent admin actions (two admins act on same member): first action wins; second returns "This request was already processed. Please refresh."
- Trusted-device cookie bypass (US-002) still applies; bypass skips OTP but NOT the status check — status evaluated on every login regardless of bypass.

**4.4 Audit Rules:**

| Event | Actor | Logged Fields | Timestamp |
|-------|-------|--------------|-----------|
| MEMBER_APPROVE | Admin | memberId, previousStatus (Pending Approval), newStatus (Active), approvedBy (adminId), correlationId | UTC |
| MEMBER_REJECT_HARD_DELETE | Admin | memberId (hashed post-delete), previousStatus, rejectedBy (adminId), reason, correlationId | UTC |
| RESTRICTED_SESSION_GRANTED | System | memberId, status at login, correlationId | UTC |
| SESSION_INVALIDATED_POST_REJECTION | System | memberId (hashed), correlationId | UTC |

**4.5 Security & Permissions:**

| Status | Login | Session Type | Routes |
|--------|-------|-------------|--------|
| Pending Approval | ✅ | Restricted | My Profile only |
| Active | ✅ | Full | All member features |
| Hard-deleted (Rejected) | ❌ | None | "Invalid credentials." |

- Admin hard delete is permanent and irreversible; requires confirmation modal before executing.
- Session tokens for rejected members invalidated server-side immediately.
- Rejection reason not disclosed to member in any notification or UI message.

### 5. Navigation Rules

| Status at Login | Accessible | Blocked |
|----------------|-----------|---------|
| Pending Approval | My Profile only | All other member routes (silent redirect) |
| Active | All member routes | — |

Status transitions:

| From | To | Trigger | Actor |
|------|----|---------|-------|
| Pending Approval | Active | Admin approves | Admin |
| Pending Approval | (hard deleted) | Admin rejects | Admin |

### 6. Notifications

| Trigger | Channel | Recipient | Content Summary | Timing |
|---------|---------|-----------|----------------|--------|
| Admin approves member | Email | Member | "Your membership has been approved. You can now access all MyHSS features." | Immediately |
| Admin approves member | In-app | Member | "Your membership has been approved! Welcome to MyHSS." | Immediately |
| Admin rejects member | Email | Member | "Your membership application was not approved. Please contact your Activity Centre for more information." (no rejection reason disclosed) | Immediately |

### 7. Acceptance Criteria

- [ ] Adult member (Pending Approval) can log in; session restricted to My Profile only; all other routes redirect silently to My Profile.
- [ ] Status banner displayed on My Profile: "Your membership application is under review. You'll be notified once approved."
- [ ] After Admin approval: status transitions to Active; full access on next login or live update.
- [ ] After Admin rejection: record permanently hard-deleted; active session invalidated; subsequent login returns "Invalid credentials."
- [ ] Rejection reason never disclosed to member via any channel.
- [ ] Admin hard delete logged in audit with hashed memberId and rejection reason.
- [ ] Concurrent admin action on same member returns "This request was already processed." to second actor.

### 8. API Mapping

| Endpoint | Method | Auth Required | Notes |
|----------|--------|--------------|-------|
| POST /admin/members/{id}/approve | POST | Admin | Status: Pending Approval → Active; triggers member notification |
| POST /admin/members/{id}/reject | POST | Admin | Body: `{ reason }` (required); triggers hard delete + member notification |
| GET /auth/member/session-status | GET | Member session | Returns current status; used by client for live session gating |

### 9. Data Rules

- **Soft Delete:** No.
- **Hard Delete:** Yes — on Admin rejection. Permanent, irreversible.
- **Post-hard-delete:** All PII fields removed from primary tables; audit log entry retained with hashed memberId, rejection timestamp, adminId, reason.
- **Audit log retention after hard delete:** 6 months from date of hard delete, then purged. Hashed identifiers only; no PII retained after purge.

### 10. Dependencies

- US-009 (Member Self-Registration — creates the Pending Approval record).
- `05-members.md` Sub-module B (Pending Approvals — Admin UI for approve/reject).
- Notification service (email + in-app).
- US-013 (Member Login & Status-Based Session — handles login and status routing).

### 11. Open Questions

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | Live session update on approval (real-time) vs next-login-only — which is required? | No | Client | Open |
| Q2 | Audit log retention period for hard-deleted member records? | — | Client/Legal | ✅ Resolved — 6 months post hard-delete, then purged. Hashed identifiers only retained during that period. |

---

## US-011 · Teen Registration — Guardian Consent Flow

### 1. User Story
The system shall, upon a Teen (Kishor, age 12–17) completing self-registration, immediately send a guardian consent email to the guardian email address provided at registration, containing the teen's submitted details and a tokenised Approve/Decline link valid for 7 days; shall support two guardian paths (existing HSS member and non-HSS-member) with guardian identity data collected and saved against the teen profile on approval; and shall transition the teen's status to Pending Approval for Admin review only after guardian consent is confirmed.

### 2. Screen Purpose
This story governs the automated guardian consent process between Teen self-registration and Admin approval. There is no UI screen within the main app for this flow — it operates via email to the guardian, with the guardian acting on the Guardian Consent Landing Page (US-012). The system issues and tracks consent tokens, routes approval results back into the membership workflow, and allows Admin to resend or override via the Pending Guardian Approval sub-module (05-members.md Sub-module C). The teen can log in during this stage but is in a restricted session (US-013).

### 3. Fields & Validation

Guardian consent email (system-generated — not an in-app form):

| Element | Details |
|---------|---------|
| Teen First Name + Last Name | From registration |
| Age Group Label | "Kishor (12–17)" — raw DOB not included |
| Activity Centre | As submitted at registration |
| Approve Link | Tokenised, 7-day expiry, single-use → routes to US-012 |
| Decline Link | Tokenised, 7-day expiry, single-use → routes to US-012 decline view |
| Email footer | "This link expires in 7 days. If you did not expect this email, please contact [HSS contact email — TBD]." |

Consent token properties:
- Opaque token (signed JWT or HMAC-signed random value)
- Expiry: 7 days from issuance
- Single-use: invalidated immediately on first use (approve or decline)
- Bound to: teen memberId + guardian email

### 4. Business Logic

**4.1 Positive Flow:**
1. Teen registration submitted (US-009) → teen record created, status = Pending Parental Consent.
2. System checks whether guardian email matches an existing HSS member account.
   - **Path A (guardian is HSS member):** token generated; email sent to guardian's registered address; guardian name/phone available for pre-fill on landing page.
   - **Path B (guardian is not HSS member):** token generated; email sent to external guardian email address; guardian must complete identity form on landing page.
3. Guardian clicks Approve link → Guardian Consent Landing Page (US-012).
4. Guardian approves (fills identity form if non-HSS path; confirms relationship and consent):
   - Guardian name, phone, relationship, consent timestamp saved against teen profile.
   - Teen status: Pending Parental Consent → Pending Approval.
   - Admin notified (email + in-app): teen pending Admin review.
   - Teen notified (email + in-app): "Your guardian has approved your registration. Your profile is now pending admin review."
5. Admin approves teen (Sub-module B) → status: Pending Approval → Active.
6. Admin rejects teen (Sub-module B) → hard delete (same as US-010 adult rejection).

**4.2 Negative Flow:**
1. Guardian clicks Decline → status stays Pending Parental Consent.
   - Teen notified (email + in-app): "Your guardian has declined your registration request. Please contact your Activity Centre."
   - Admin notified (email + in-app).
2. Token expires (7 days, no action):
   - Status stays Pending Parental Consent.
   - Teen's restricted session shows: "Your guardian approval link has expired. Please contact your Activity Centre."
   - Admin can resend from Pending Guardian Approval queue.
3. Token already used (second click): "This link has already been used. If you believe this is an error, please contact your Activity Centre."
4. Guardian email bounce (undeliverable detected by delivery provider):
   - System sets teen record `guardianEmailDeliveryStatus = "bounced"`.
   - Teen record flagged in Pending Guardian Approval queue with "Email delivery failed" badge.
   - Teen's restricted session banner changes to: "We couldn't deliver the approval request to your guardian. Please update the guardian's email address in your profile or contact your Activity Centre."
   - Teen can update guardian email in My Profile (restricted session) → triggers token invalidation + new consent email sent to corrected address + bounce flag cleared (see Q-D handling).
   - Admin can also correct guardian email and resend from Pending Guardian Approval queue.
   - Neither actor is required to act within 7 days; if original 7-day token expires with bounce flag set, the queue entry remains open until admin or teen resolves.

**4.3 Edge Cases:**
- Guardian email same as teen email: blocked at registration (US-009 validation).
- Guardian email bounce + token expires (7 days): teen record stays in Pending Guardian Approval queue indefinitely with both "bounce" and "expired" indicators; admin or teen must action before consent can be obtained.
- Guardian email corrected by teen (My Profile) after bounce: old token invalidated, bounce flag cleared, new 7-day token issued, new consent email sent to corrected address.
- One guardian is listed on multiple teen applications: each token is independent per teen memberId.
- Teen updates guardian email in My Profile (restricted session, status = Pending Parental Consent): old token immediately invalidated; guardianEmail field on teen record updated; guardianEmailDeliveryStatus reset to "pending"; new 7-day token generated; new consent email sent to updated address; previous guardian email address receives: "The consent request for [Teen first name] has been updated. The previous link is no longer valid."
- Admin overrides guardian consent (Sub-module C): consent recorded as on-behalf override (on_behalf_flag = true), audited; same status transition.
- Teen account hard-deleted (Admin rejects at Pending Approval post-guardian-consent): if guardian then clicks link → "This application is no longer active."
- Teen re-registers after hard delete: treated as new application; new guardian consent email sent.

**4.4 Audit Rules:**

| Event | Actor | Logged Fields | Timestamp |
|-------|-------|--------------|-----------|
| GUARDIAN_CONSENT_EMAIL_SENT | System | memberId (teen), guardianEmail (hashed), tokenId, isHSSMember (bool), correlationId | UTC |
| GUARDIAN_CONSENT_EMAIL_BOUNCED | System (delivery provider callback) | memberId (teen), guardianEmail (hashed), tokenId, bounceType, correlationId | UTC |
| GUARDIAN_CONSENT_APPROVED | Guardian / Admin | memberId (teen), guardianEmail (hashed), tokenId, onBehalfFlag, correlationId | UTC |
| GUARDIAN_CONSENT_DECLINED | Guardian / Admin | memberId (teen), guardianEmail (hashed), tokenId, reason (if any), correlationId | UTC |
| GUARDIAN_CONSENT_EXPIRED | System (scheduled) | memberId (teen), tokenId, correlationId | UTC |
| GUARDIAN_CONSENT_RESENT | Admin | memberId (teen), resentBy (adminId), newTokenId, previousTokenId (invalidated), correlationId | UTC |
| GUARDIAN_EMAIL_UPDATED | Teen (self) | memberId (teen), oldGuardianEmail (hashed), newGuardianEmail (hashed), previousTokenId (invalidated), newTokenId, correlationId | UTC |

Raw guardian PII (name, phone) not stored in audit logs — hashed or excluded.

**4.5 Security & Permissions:**

| Action | Who Can Perform |
|--------|----------------|
| Send initial guardian consent email | System (automated on teen registration) |
| Resend guardian consent email | Admin only (from Pending Guardian Approval queue) |
| Approve guardian consent | Guardian (via token link, US-012) OR Admin (override, on-behalf, Sub-module C) |
| Decline guardian consent | Guardian (via token link, US-012) OR Admin (override, Sub-module C) |

- Consent tokens are single-use and 7-day time-limited.
- Token URL must not expose teen PII (opaque token in URL; teen details served server-side after token validation).
- Non-HSS guardian landing page (US-012) publicly accessible but token-gated.

### 5. Navigation Rules

| Step | Trigger | Outcome |
|------|---------|---------|
| Teen submits registration | System | Consent email sent; teen → Registration Confirmation screen |
| Guardian clicks Approve link | Guardian email | Opens Guardian Consent Landing Page (US-012) |
| Guardian clicks Decline link | Guardian email | Opens Guardian Consent Landing Page (US-012) — decline view |
| Guardian approves | US-012 | Teen → Pending Approval; admin + teen notified |
| Guardian declines / token expires | US-012 / system | Teen stays Pending Parental Consent; admin + teen notified |

Status transitions:

| From | To | Trigger | Actor |
|------|----|---------|-------|
| Pending Parental Consent | Pending Approval | Guardian approves OR Admin override | Guardian / Admin |
| Pending Parental Consent | (stays) | Guardian declines | Guardian |
| Pending Parental Consent | (stays) | Token expires | System |
| Pending Approval | Active | Admin approves | Admin |
| Pending Approval | (hard deleted) | Admin rejects | Admin |

### 6. Notifications

| Trigger | Channel | Recipient | Content Summary | Timing |
|---------|---------|-----------|----------------|--------|
| Teen registration submitted | Email | Guardian (guardian email) | Teen's name, Activity Centre, 7-day Approve/Decline link | Immediately |
| Guardian email bounce detected | In-app (restricted session banner) | Teen | "We couldn't deliver the approval request to your guardian. Please update the guardian's email address in your profile or contact your Activity Centre." | On bounce detection |
| Teen updates guardian email | Email | Previous guardian address | "The consent request for [Teen first name]'s HSS membership has been updated. This link is no longer valid." | Immediately on update |
| Teen updates guardian email | Email | New guardian address | New 7-day consent request with updated teen details + Approve/Decline link | Immediately on update |
| Guardian approves | Email | Teen | "Your guardian has approved your registration. Pending admin review." | Immediately |
| Guardian approves | In-app (if logged in) | Teen | Same | Immediately |
| Guardian declines | Email | Teen | "Your guardian has declined your registration. Contact your Activity Centre." | Immediately |
| Guardian declines | In-app (if logged in) | Teen | Same | Immediately |
| Guardian approves | Email | Admin | New teen pending admin review | Immediately |
| Guardian approves | In-app | Admin | New teen pending approval notification | Immediately |
| Guardian declines | Email | Admin | Guardian declined consent for teen | Immediately |
| Admin approves teen | Email | Teen | "Your membership has been approved." | Immediately |
| Admin approves teen | In-app | Teen | Same | Immediately |
| Admin rejects teen (hard delete) | Email | Teen | "Your membership application was not approved." (generic — no reason) | Immediately |
| Token expires (7 days) | In-app | Admin (Pending Guardian Approval) | Consent link expired for teen — queue indicator updated | On expiry |

### 7. Acceptance Criteria

- [ ] Guardian consent email sent immediately on teen registration with teen's name, Activity Centre, and 7-day tokenised Approve/Decline links.
- [ ] Approve link routes to Guardian Consent Landing Page (US-012); guardian details collected and saved to teen profile; teen status transitions to Pending Approval.
- [ ] Decline link routes to US-012; decline recorded; teen status stays Pending Parental Consent; teen and admin notified.
- [ ] Token expires after exactly 7 days; expired token on landing page shows error; teen status unchanged.
- [ ] Used token (second click — approve or decline) shows "already used" error; no double-processing.
- [ ] On guardian approval: admin and teen both notified via email + in-app.
- [ ] Admin can resend guardian consent email from Pending Guardian Approval queue; new token issued; previous token invalidated.
- [ ] Admin can approve guardian consent on behalf of guardian; on_behalf_flag = true recorded in audit.
- [ ] All consent events audited with hashed guardian email, tokenId, onBehalfFlag, correlationId.

### 8. API Mapping

| Endpoint | Method | Auth Required | Notes |
|----------|--------|--------------|-------|
| POST /auth/guardian-consent/verify-token | POST | No (public, token-based) | Body: `{ token }` → returns `{ valid, teenName, ageGroupLabel, activityCentre, registrationDate, guardianIsHSSMember, guardian?: { name, phone } }` |
| POST /auth/guardian-consent/approve | POST | No (public, token-based) | Body: `{ token, guardianName, guardianPhone, relationship, consentAccepted: true }` |
| POST /auth/guardian-consent/decline | POST | No (public, token-based) | Body: `{ token }` |
| POST /admin/members/{id}/guardian-consent/resend | POST | Admin | Invalidates old token; generates + sends new 7-day token |
| POST /admin/members/{id}/guardian-consent/approve | POST | Admin | Override on behalf; body: `{ reason? }` |
| POST /admin/members/{id}/guardian-consent/reject | POST | Admin | Override decline; body: `{ reason }` (required) |

### 9. Data Rules

- **Guardian data collected:** guardian name, phone, relationship, consent timestamp stored on teen's member record on approval.
- **Soft Delete:** No.
- **Hard Delete:** Teen member record hard-deleted on Admin rejection (same as US-010).
- **Consent token:** stored hashed; marked used or deleted on first action; purged on expiry [TBD — cleanup schedule].
- **Guardian email PII:** stored on teen's member record; hashed in all audit logs; subject to right-to-erasure rules.

### 10. Dependencies

- US-009 (Teen registration — creates teen record and guardian email field).
- US-012 (Guardian Consent Landing Page — handles the approve/decline action).
- US-013 (Member Login & Status-Based Session — teen restricted session during Pending Parental Consent).
- `05-members.md` Sub-module C (Pending Guardian Approval — Admin resend and override UI).
- Email Delivery Provider (guardian consent email).
- Notification service (in-app alerts).

### 11. Open Questions

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | If guardian email bounces (undeliverable), how should system flag it? | — | Client | ✅ Resolved — system sets deliveryStatus = "bounced"; teen flagged in Pending Guardian Approval queue with "Email delivery failed" badge; teen sees actionable banner in restricted session; teen or admin can correct email and resend. |
| Q2 | Can teen change guardian email after registration (before consent granted)? | — | Client | ✅ Resolved — Yes. Teen can update guardian email via My Profile in restricted session. Old token invalidated immediately; new 7-day token issued; new consent email sent to updated address; previous guardian address notified that the link is no longer valid. |
| Q3 | Should a reminder email be sent to guardian before the 7-day link expires (e.g. at day 5)? | No | Client | Open |
| Q4 | Guardian consent landing page URL format: `[domain]/guardian-consent/{token}`? | No | Dev | Open |

---

## US-012 · Guardian Consent Landing Page

### 1. User Story
The system shall provide a publicly accessible, no-login-required web page within the MyHSS application that accepts a time-limited single-use guardian consent token, validates it, displays the teen's submitted registration details for the guardian's review, and allows the guardian to approve (with identity details required if not an HSS member) or decline the consent request, recording the outcome against the teen's membership record.

### 2. Screen Purpose
The Guardian Consent Landing Page is a token-gated public page within the MyHSS web application — accessible without an HSS account. Guardians land here when clicking the Approve or Decline link from the consent email (US-011). The page presents teen details clearly, collects the guardian's own details (if they are not already an HSS member — pre-populated if they are), and records the consent decision. It must be fully mobile-responsive as most guardians will access it directly from email on a phone.

### 3. Fields & Validation

**Read-only teen details displayed to guardian:**
| Element | Details |
|---------|---------|
| Teen First Name + Last Name | From registration |
| Age Group Label | "Kishor (12–17)" — raw DOB not shown |
| Activity Centre | As submitted |
| Date Registration Submitted | DD/MM/YYYY |

**Guardian identity fields — required if guardian is NOT an existing HSS member:**

| Field | Type | Mandatory | Validation | Error Message |
|-------|------|-----------|------------|---------------|
| Guardian Full Name | Text | Yes | Min 2 chars, max 150 chars | "Guardian name is required." |
| Guardian Phone | Tel | Yes | Valid phone format | "A valid phone number is required." |
| Relationship to Teen | Dropdown | Yes | Options: Parent / Legal Guardian / Grandparent / Other | "Please select your relationship to the applicant." |
| Consent Confirmation | Checkbox | Yes | Must be checked | "You must confirm your consent before proceeding." |
| Consent Label | — | — | "I confirm I am the parent / legal guardian of the above-named applicant and I consent to their HSS membership application." | — |

**If guardian IS an existing HSS member:**
- Guardian Full Name and Phone pre-populated from HSS profile (read-only display).
- Relationship dropdown and Consent Confirmation checkbox still required.

**Actions:**

| Button | Condition | What Happens |
|--------|-----------|-------------|
| Approve Registration | Always shown (token valid) | Submits guardian details + consent |
| Decline Registration | Secondary text link | Shows confirmation prompt → records decline |

### 4. Business Logic

**4.1 Positive Flow:**
1. Guardian clicks Approve link → browser opens `[HSS domain]/guardian-consent/{token}`.
2. System validates token: exists, not expired (≤7 days), not yet used.
3. System checks guardian email (from token) against HSS member database:
   - HSS member found: display teen details + pre-populated guardian name/phone (read-only); relationship + consent checkbox required.
   - No HSS member found: display teen details + empty guardian identity form; all fields required.
4. Guardian reviews, fills required fields, checks consent checkbox, clicks "Approve Registration".
5. POST /auth/guardian-consent/approve → guardian info saved to teen profile → teen status: Pending Parental Consent → Pending Approval.
6. Confirmation shown: "Thank you. Your consent has been recorded. [Teen first name]'s registration is now pending admin review."
7. Notifications sent per US-011 §6.

**4.2 Negative Flow:**
1. Token invalid (not found): "This link is invalid. Please contact your Activity Centre."
2. Token expired (>7 days): "This approval link has expired. Please contact your Activity Centre to request a new link."
3. Token already used: "This link has already been used. If you believe this is an error, please contact your Activity Centre."
4. Teen account hard-deleted between email send and guardian click: "This application is no longer active."
5. Guardian clicks Decline → confirmation prompt: "Are you sure you want to decline this registration?" → confirm → POST /auth/guardian-consent/decline → page shows: "You have declined the registration request. [Teen first name] and the Activity Centre have been notified."
6. Required fields missing (non-HSS path): field-level error messages; submit blocked.

**4.3 Edge Cases:**
- Mobile access (common for email link clicks): page must be fully mobile-responsive.
- Guardian bookmarks page after use: "This link has already been used."
- Guardian opens both Approve and Decline links: first action wins; second returns used-token error.
- Network failure on submit: "Unable to record your response. Please try again." (retry safe — idempotent on token).

**4.4 Audit Rules:**

| Event | Actor | Logged Fields | Timestamp |
|-------|-------|--------------|-----------|
| CONSENT_PAGE_LOADED | Guardian (anonymous) | tokenId, IP, userAgent, correlationId | UTC |
| GUARDIAN_CONSENT_APPROVED | Guardian | tokenId, memberId (teen), guardianEmail (hashed), isHSSMember (bool), correlationId | UTC |
| GUARDIAN_CONSENT_DECLINED | Guardian | tokenId, memberId (teen), guardianEmail (hashed), correlationId | UTC |

Raw guardian name and phone not stored in audit logs.

**4.5 Security & Permissions:**

| Aspect | Rule |
|--------|------|
| Authentication | None required; consent token is sole access control |
| Token format | Opaque (signed JWT or HMAC-signed random); teen PII not in URL |
| Teen PII shown | First Name + Last Name + Activity Centre + age group label; raw DOB not shown |
| CSRF protection | Required; token binding provides primary protection; CSRF header recommended |
| Rate limiting | [TBD — recommend: 5 submit attempts per token; 10 req/min/IP] |
| Page caching | Must not cache; token state changes after use |

### 5. Navigation Rules

- **Entry:** Guardian consent email → Approve or Decline link → this page (no preceding HSS app screen).
- **Exit:**

| Action | Navigates To | Condition |
|--------|-------------|-----------|
| Approve (success) | Confirmation message (same page, no redirect) | On successful POST |
| Decline (confirmed) | Confirmation message (same page, no redirect) | On successful POST |
| Back to MyHSS (optional link) | Login screen | After confirmation shown |

### 6. Notifications

Notifications triggered by the approve/decline actions are governed by US-011 §6. This landing page does not send notifications directly — the server-side handler (US-011 API) triggers them.

### 7. Acceptance Criteria

- [ ] Page loads with valid, non-expired, unused token; displays teen name, age group label, Activity Centre, and registration date.
- [ ] Invalid / expired / used token displays appropriate error; no teen details shown.
- [ ] Non-HSS guardian: all identity fields required; submit blocked with field errors if any missing.
- [ ] HSS guardian: name and phone pre-populated from HSS profile (read-only); relationship + consent checkbox still required.
- [ ] Approve action: guardian details saved to teen profile; teen status transitions Pending Parental Consent → Pending Approval; confirmation message shown on page.
- [ ] Decline action: confirmation prompt before submitting; decline recorded; status stays Pending Parental Consent; confirmation shown.
- [ ] Token invalidated immediately after first use; second use returns "already used" error.
- [ ] Page is fully mobile-responsive.
- [ ] Raw guardian name and phone not stored in audit log.

### 8. API Mapping

| Endpoint | Method | Auth Required | Notes |
|----------|--------|--------------|-------|
| POST /auth/guardian-consent/verify-token | POST | No | Body: `{ token }` → validates and returns teen details + guardian pre-fill if HSS member |
| POST /auth/guardian-consent/approve | POST | No | Body: `{ token, guardianName, guardianPhone, relationship, consentAccepted: true }` |
| POST /auth/guardian-consent/decline | POST | No | Body: `{ token }` |

Errors: 400 (validation) · 404 (token not found) · 409 (token already used) · 410 (token expired) · 500.

### 9. Data Rules

- **Data Owner:** System.
- **Soft Delete:** Not applicable (transactional page — no independent data entity).
- **Guardian data collected (non-HSS path):** stored on teen's member record; subject to GDPR/PII rules of US-009 §9.
- **Consent tokens:** stored hashed; deleted or marked used on first action; purged on expiry [TBD — scheduled cleanup].

### 10. Dependencies

- US-011 (Teen Guardian Consent Flow — issues the token, sends the email, handles notifications).
- US-009 (Teen registration — creates the teen record with guardian email).
- Email Delivery Provider (sends the link that leads here).
- Masters data (to display Activity Centre name on page).

### 11. Open Questions

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | URL format for page: `[domain]/guardian-consent/{token}`? Confirm domain and path with dev. | No | Dev | Open |
| Q2 | Should page display HSS logo and branding? (Mobile email → branded landing page expected) | No | Client/Design | Open |
| Q3 | After consent action, should page offer "Login to MyHSS" link for HSS-member guardians? | No | Client | Open |

---

## US-013 · Member / Teen Login & Status-Based Session Routing

### 1. User Story
The system shall allow a registered Member or Teen to log in via the same Login screen as all other roles using email and password with full OTP 2FA (and trusted-device bypass per US-002), and shall route their post-login session based on current membership status: Active → full member session; Pending Approval or Pending Parental Consent → restricted session (My Profile only) with a status-appropriate banner; hard-deleted (rejected) → login blocked with "Invalid credentials." (anti-enumeration). Where the authenticated member has been assigned one or more additional admin roles (e.g. Ops User, Event Admin), all assigned roles are embedded in the session token at login; the default active role is Member/Teen regardless of additional roles. Role-context switching is governed by US-014.

### 2. Screen Purpose
Members and Teens use the same Login screen as Super Admins and all other roles. The system identifies the actor's role and membership status post-authentication and routes accordingly. This story governs the Member/Teen login path — credential validation, OTP flow (reusing US-001/US-002), trusted-device behaviour, and the critical status-based session routing that determines whether the member receives full or restricted access. No separate member login URL exists.

### 3. Fields & Validation

Login fields are identical to US-001 (Email + Password + OTP via US-002). No additional form fields.

Post-login status-routing UI elements:

| Element | Status Condition | Content |
|---------|-----------------|---------|
| Restricted Session Banner | Pending Approval | "Your membership application is under review. You'll be notified once approved." |
| Restricted Session Banner | Pending Parental Consent (guardian link active) | "Waiting for guardian approval. We've sent an email to your guardian. Please ask them to check their inbox." |
| Restricted Session Banner | Pending Parental Consent (guardian email bounced) | "We couldn't deliver the approval request to your guardian. Please update the guardian's email address in your profile or contact your Activity Centre." |
| Restricted Session Banner | Pending Parental Consent (guardian link expired) | "Your guardian approval link has expired. Please contact your Activity Centre." |
| Session Type | Active | Full member session — no banner |

### 4. Business Logic

**4.1 Positive Flow:**
1. Member/Teen enters email + password → client validation → Login.
2. Trusted-device cookie check (US-001/US-002): if valid match → bypass OTP → proceed to step 4.
3. No trusted device → Auth Service validates credentials → Pending OTP state → OTP sent → OTP Verification screen (US-002).
4. OTP verified → Auth Service creates session → role + status determined from member record:
   - Adult Member, Active → full member session.
   - Teen Member, Active → full teen member session.
   - Adult Member, Pending Approval → restricted session; My Profile only; Pending Approval banner.
   - Teen Member, Pending Parental Consent → restricted session; My Profile only; guardian-waiting banner (with expiry variant if token expired).
   - Teen Member, Pending Approval (guardian approved, awaiting admin) → restricted session; My Profile only; "under review" banner.
5. Restricted session: all routes except My Profile silently redirect to My Profile.
6. System embeds all roles assigned to this account in the session token (activeRole = Member or Teen by default; additionalRoles[] = any admin roles assigned). Portal opens in Member/Teen context. Role switcher visible in portal header if additionalRoles[] is non-empty.

**4.2 Negative Flow:**
1. Hard-deleted member (rejected) → login attempt → "Invalid credentials." (anti-enumeration; no disclosure of deletion).
2. Invalid credentials (wrong email/password) → "Invalid credentials."
3. Account locked (5 failed attempts/15 min) → "Too many attempts. Try again later."
4. Restricted session member attempts non-Profile route → silent redirect to My Profile; banner remains.
5. Active session invalidated (Admin rejects during session) → next route request → Login: "Session expired. Please log in again."

**4.3 Edge Cases:**
- Trusted-device bypass applies to OTP only; status check always runs post-bypass — a Pending member with a trusted-device cookie still receives a restricted session.
- Member approved while in active restricted session: [TBD — live update via polling vs next-login; see US-010 Q1].
- Teen in Pending Parental Consent with expired guardian token: restricted session granted; banner shows expiry message.
- Two simultaneous sessions for same member (different devices): both sessions independently check status; both invalidated on hard delete.
- Phone-only member: not applicable — email is mandatory for self-registration (US-009 Q5, resolved). All members have an email address available for OTP delivery.
- Member in restricted session (Pending Approval or Pending Parental Consent) who also holds additional admin roles: default activeRole = Member/Teen (restricted). Whether restricted status blocks use of additional admin roles (i.e. can they switch to Ops User while Pending) is [TBD — Needs Confirmation — see US-014 Q1].

**4.4 Audit Rules:**

| Event | Actor | Logged Fields | Timestamp |
|-------|-------|--------------|-----------|
| MEMBER_LOGIN_SUCCESS | System | memberId, role, status at login, sessionType (restricted / full), trustedDeviceBypass (bool), correlationId | UTC |
| MEMBER_LOGIN_RESTRICTED_SESSION | System | memberId, status, restrictionReason, correlationId | UTC |
| MEMBER_LOGIN_BLOCKED | System | email (hashed), failureReason, correlationId | UTC |

**4.5 Security & Permissions:**

| Status | Login | Session Type | Accessible Routes |
|--------|-------|-------------|------------------|
| Pending Parental Consent | ✅ | Restricted | My Profile only |
| Pending Approval | ✅ | Restricted | My Profile only |
| Active | ✅ | Full | All member features |
| Hard-deleted (Rejected) | ❌ | None | "Invalid credentials." |

- All rate limits, lockout rules, and OTP security from US-001/US-002 apply identically to member logins.
- `hss_trusted_device` cookie functions identically for members as for admin (US-002 §4).
- Status check is always server-side; client-side routing is UX fallback only.
- Rejected member login must be indistinguishable from invalid-credentials response (anti-enumeration).

### 5. Navigation Rules

| Status at Login | Post-Login Route | Blocked Routes |
|----------------|-----------------|----------------|
| Active | Member home / Dashboard | None |
| Pending Approval | My Profile (with banner) | All other member routes (silent redirect) |
| Pending Parental Consent | My Profile (with banner) | All other member routes (silent redirect) |
| Hard-deleted | Login screen (error) | — |

### 6. Notifications

No notifications triggered by the login flow itself. Notifications for status changes are governed by US-010 §6 and US-011 §6.

### 7. Acceptance Criteria

- [ ] Member / Teen logs in via the same Login screen as all other roles; no separate member login URL exists.
- [ ] Full OTP 2FA (US-001/US-002 rules) applies; trusted-device bypass works identically for members.
- [ ] Active member receives full member session.
- [ ] Pending Approval member receives restricted session; only My Profile accessible; correct banner shown.
- [ ] Pending Parental Consent teen receives restricted session; only My Profile accessible; guardian-specific banner shown; expiry variant shown if guardian link expired.
- [ ] Hard-deleted member login returns "Invalid credentials." — no disclosure of deletion or hard-delete status.
- [ ] Trusted-device bypass skips OTP but status check always runs; a bypassed Pending member still receives a restricted session.
- [ ] Restricted session: any non-My-Profile route redirects silently to My Profile; no error shown.
- [ ] Admin rejection during active session invalidates session server-side; next request redirects to Login with "Session expired. Please log in again."

### 8. API Mapping

| Endpoint | Method | Auth Required | Notes |
|----------|--------|--------------|-------|
| POST /auth/login | POST | No (pre-auth) | Same endpoint as admin; response includes `{ role, status, sessionType }` for client routing |
| POST /auth/otp/verify | POST | Pending OTP | Same as US-002; response includes `{ role, status }` |
| GET /auth/member/session-status | GET | Member session | Client polls to detect live status changes (e.g. approval during session) |

### 9. Data Rules

Data rules for the login/OTP flow are governed by US-001/US-002. No new data entities created by this story. Status data is owned by US-009/US-010/US-011.

### 10. Dependencies

- US-001 (Login — credential validation and OTP initiation; same endpoint).
- US-002 (OTP Verification; same flow).
- US-009 (Member Self-Registration — creates the member record that this story reads).
- US-010 (Adult approval flow — governs Pending Approval status transitions).
- US-011 (Teen guardian consent flow — governs Pending Parental Consent status).

### 11. Open Questions

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | Live session update on status change — real-time (WebSocket/SSE) or client polling (GET /auth/member/session-status interval)? | No | Dev/Arch | Open |
| Q2 | Should restricted session show a dedicated "pending" landing page, or My Profile with banner? | No | Client | ✅ Resolved — My Profile with banner. |

---

## US-014 · Role-Context Switch (Active Role Selection)

### §1 User Story

The system shall allow any authenticated user who holds multiple assigned roles to switch their active role context mid-session via a role-switcher control in the portal header, without requiring re-authentication, and shall update the active role in the session, adapt the portal context (navigation, permissions, UI scope) to the selected role, and log the switch event.

### §2 Screen Purpose

The Role-Context Switcher is a persistent header control visible to any user whose session token contains more than one role. It is not a separate screen — it is a dropdown or selector mounted in the main navigation header on both the Member Portal and the Admin Web Panel. Users access it when they need to operate in a different role context (e.g., a member who is also an Ops User switching from their Member view to their Ops User operational view). The switcher is absent for single-role sessions.

### §3 Fields & Validation

| Field / Element | Type | Mandatory | Validation Rules | Error Message |
|-----------------|------|-----------|------------------|---------------|
| Role Switcher Dropdown | Dropdown (header) | Conditional — visible only when additionalRoles[] non-empty | Selected role must be in the user's assigned roles list as returned by session token; role must be active | "This role is no longer assigned to your account. Please log in again." |
| Current Active Role Badge | Label (read-only) | — | Displays current activeRole label | — |

**Visibility rule:** Switcher rendered only when session token `additionalRoles[]` has ≥ 1 entry. Single-role users never see the switcher.

**Buttons / Actions:**

| Button / Action | Visible To | Condition | What Happens |
|-----------------|-----------|-----------|-------------|
| Select role from dropdown | Any multi-role user | additionalRoles[] non-empty | System switches activeRole, reloads portal context for selected role |
| Stay in current role (dismiss) | Any multi-role user | Dropdown open | Closes dropdown, no change |

### §4 Business Logic

#### 4.1 Positive Flow
1. Authenticated user opens role-switcher dropdown in header.
2. Dropdown lists all roles in session token (current activeRole highlighted; others selectable).
3. User selects a different role.
4. System validates selected role is still in user's assigned roles (server-side check against current RBAC state).
5. System updates `activeRole` in session (server-side session record updated; client receives updated token or session signal).
6. Portal context reloads: navigation menu, available modules, scope, and UI adapt to the selected role.
7. Audit event ROLE_CONTEXT_SWITCHED logged.
8. User continues in new role context without re-entering credentials or OTP.

**Default active role on login:**
- Member/Teen account (with or without additional roles): `activeRole = Member` or `activeRole = Teen`.
- Admin-only account (Super Admin, National Head, etc., no Member/Teen designation): `activeRole = [their admin role]`.
- Mixed account: always defaults to Member/Teen on first login. User explicitly switches to access admin role context.

#### 4.2 Negative Flow
1. Selected role no longer assigned (RBAC removed mid-session) → server returns 403 → "This role is no longer assigned to your account. Please log in again." → session invalidated → redirect to Login.
2. Session expired during role switch → "Session expired. Please log in again." → redirect to Login.
3. Role switcher opened but only one role in token → switcher should not have rendered; if reached via direct manipulation → safe error, no switch performed.

#### 4.3 Edge Cases
- Member in restricted session (Pending Approval or Pending Parental Consent) with additional admin roles: [TBD — Needs Confirmation] whether restricted status blocks switching to admin role context. Until resolved, treat as: restricted member cannot switch active role — switcher hidden while status is Pending. See Q1.
- Teen who turns 18 mid-session: age-band transition is handled at next login; active session not affected.
- Admin role deactivated while user is mid-session in that role context: server-side permission check on next action returns 403; system prompts re-login or switches back to Member role.
- User has Member + 3 admin roles: dropdown lists all 4; switch allowed to any; each switch logged independently.

#### 4.4 Audit Rules

| Event | Actor | Logged Fields | Timestamp |
|-------|-------|--------------|-----------|
| ROLE_CONTEXT_SWITCHED | Authenticated user (self) | memberId / userId, previousActiveRole, newActiveRole, sessionId, correlationId | UTC |
| ROLE_SWITCH_BLOCKED | System | memberId / userId, attemptedRole, reason (role-removed / session-expired), correlationId | UTC |

#### 4.5 Security & Permissions

| Role | Can use switcher | Notes |
|------|-----------------|-------|
| Any multi-role user | ✅ | Only roles in session token are selectable; no privilege escalation beyond assigned roles |
| Single-role user | ❌ | Switcher not rendered |

- Role switch is server-validated on every attempt — client cannot forge additionalRoles[].
- No OTP re-challenge on role switch (session already authenticated).
- Each role switch is independently audited.
- Switching to admin role context on the Web Admin Panel: user now operates under admin-role RBAC rules; Member Portal scope restrictions removed for that context.
- Switching back to Member/Teen: admin permissions revoked for that context; Member Portal restrictions re-applied.
- No field-level PII differences between role contexts beyond what RBAC already governs.

### §5 Navigation Rules

- **Entry point:** Header dropdown — always visible in portal header for multi-role sessions. Available on all screens (Member Portal and Admin Web Panel).
- **Exit points:**

| Action | Navigates To | Condition |
|--------|-------------|-----------|
| Switch to admin role | Admin Web Panel home (role-appropriate dashboard) | Role switch successful |
| Switch to Member/Teen role | Member Portal home (or My Profile if restricted session) | Role switch successful |
| Role no longer valid | Login screen | Server returns 403 on role validation |
| Dismiss dropdown (no change) | Current screen | No switch performed |

### §6 Notifications

No notifications triggered by role-context switch. Switch is instantaneous and user-initiated.

### §7 Acceptance Criteria

- [ ] Role switcher visible in header only when session token has ≥ 2 roles; absent for single-role sessions.
- [ ] Selecting a role from the dropdown triggers server-side role validation before switching.
- [ ] On successful switch, portal context (navigation, modules, scope) updates to match the selected role — no re-authentication prompt.
- [ ] Default active role on login for a Member/Teen with additional admin roles is always Member/Teen, not the admin role.
- [ ] Selecting a role that has been de-assigned mid-session returns a clear error and invalidates the session.
- [ ] Every role-context switch produces a ROLE_CONTEXT_SWITCHED audit event with previousActiveRole and newActiveRole logged.
- [ ] Restricted-session member (Pending Approval/Pending Parental Consent): role switcher hidden — cannot access admin role context while pending [see Q1].

### §8 API Mapping

| Endpoint | Method | Auth Required | Request | Response |
|----------|--------|--------------|---------|----------|
| `/auth/session/switch-role` | POST | Yes — any multi-role user | `{ targetRole: string }` | `{ activeRole: string, updatedToken?: string, portalRedirectUrl: string }` |

> *Token refresh strategy (new JWT vs session-record update) to be confirmed during Gate 3 technical design.*

### §9 Data Rules

- **Data Owner:** Auth Service / Session Service
- **Soft Delete:** N/A — role switch is a session-state change, not a data record
- **Hard Delete:** N/A
- **Data Retention:** Role-switch audit events retained per US-008 audit log retention rules (shared policy).
- **GDPR / PII:** No PII collected during role switch. Logged fields: role names (not PII), sessionId, correlationId. No masking required.

### §10 Dependencies

- **US-001–US-013:** Active authenticated session required. Role switch only possible post-login.
- **RBAC / Settings module:** Assigned roles must be provisioned before they appear in session token. Role assignments are managed by Activity Centre Admin / Super Admin via RBAC settings.
- **Session Service:** Must support `activeRole` field in session record and server-side update on switch.

### §11 Open Questions

| # | Question | Blocking? | Owner | Status |
|---|----------|-----------|-------|--------|
| Q1 | Member in restricted session (Pending Approval or Pending Parental Consent) who also has admin roles assigned — can they switch to admin role context while their member status is still pending? Or does pending status block all role switching until member account is Active? | 🔴 Yes | Client | Open |
| Q2 | When a Member/Teen switches to an Admin role context, do they remain on the same web domain/URL or is there a redirect to the Admin Web Panel URL? (Affects whether Web + Mobile portals are separate apps or a unified SPA.) | 🔴 Yes | Dev | Open |
| Q3 | Should switching to an admin role require step-up authentication (e.g. re-enter password, not OTP) for elevated privilege roles (Super Admin, National Head)? | 🟡 No | Client + Security | Open |
