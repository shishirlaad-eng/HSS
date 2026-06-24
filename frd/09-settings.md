# 09 — Settings Module

**Version:** 1.0 | **Status:** Draft | **Date:** 2026-06-23
**Screens:** US-901 to US-902
**Maps to Doc tab:** Settings | **Platform:** Admin Web | **Risk Level:** High
**Access:** Super Admin only

---

## Overview

The Settings module is accessible exclusively to Super Admins. It provides centralised control
over system-wide configuration grouped into two tabs: General (branding, SMTP, organisation
information, regional settings, security) and Mobile Related (Android and iOS app version
control and force-update management). All changes take effect immediately on save unless
noted otherwise.

Sub-areas previously listed as in-scope — Static Pages, Email Templates, and System
Notifications — are **[TBD — Needs Confirmation: blocking — not yet represented in the
frontend; scope must be confirmed before Gate 4 documentation can be written for those
sub-areas]**.

---

## Actors

| Actor | Access level |
|-------|-------------|
| Super Admin | Full read/write on all Settings screens |
| All other roles | No access; redirected to their default dashboard |

---

## US-901 — System Settings: General Tab

---

### 1. User Story

The system shall allow the Super Admin to view and update all general system configuration
fields — Branding, Communication/SMTP, Organisation Information, Regional Settings, and
Security — across five vertically stacked card sections on a single screen, and shall save
all sections together in one operation when the Super Admin submits the sticky-footer
"Save Changes" button.

---

### 2. Screen Purpose

The General Tab aggregates all non-mobile system-wide parameters that govern how the
platform presents itself (branding, contact details), sends email (SMTP), interprets
dates and currency (regional settings), and enforces access controls (security). A single
save operation prevents partial-state inconsistency across sections. The screen renders
immediately with the last-saved values pre-populated in all fields.

---

### 3. Fields and Validation

#### Section A — Branding

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Company Name | text | Yes | Non-empty; max 255 characters | "Company name is required." |
| Copyright Text | text | No | Max 500 characters | "Copyright text must not exceed 500 characters." |
| Platform Logo | file upload | No | Accepted types: PNG, SVG; recommended 512 × 512 px; max file size: [TBD — Needs Confirmation: non-blocking — file size limit not specified in frontend] | "Only PNG or SVG files are accepted for the logo." |
| Favicon | file upload | No | Accepted types: ICO, PNG; recommended 32 × 32 px; max file size: [TBD — Needs Confirmation: non-blocking — file size limit not specified in frontend] | "Only ICO or PNG files are accepted for the favicon." |

Sub-section label: **Identity Assets**

#### Section B — Communication / SMTP

Sub-section: **SMTP Configuration**

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| SMTP Host | text | Yes | Non-empty; valid hostname or IP format | "SMTP host is required." |
| SMTP Port | text | Yes | Non-empty; numeric value 1–65535 | "SMTP port is required." |
| SMTP Username | text | Yes | Non-empty | "SMTP username is required." |
| SMTP Password | password (masked) | Yes | Non-empty; displayed as masked dots; editable. Displayed as masked on load (••••••••••••). A "Copy" button is available; clicking it calls a dedicated secure endpoint to retrieve plaintext and write to clipboard. Plaintext NEVER returned in GET /settings response. | "SMTP Password is required." |
| Encryption Type | select | Yes | One of: None, SSL, TLS | "Encryption type is required." |

Sub-section: **Sender Details**

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Sender Name | text | Yes | Non-empty; max 255 characters | "Sender name is required." |
| Sender Email Address | email | Yes | Non-empty; valid email format (RFC 5321) | "A valid sender email address is required." |

#### Section C — Organisation Information

Sub-section: **Contact Info**

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Address | textarea | Yes | Non-empty; max 1000 characters | "Address is required." |
| Admin Email Address | email | Yes | Non-empty; valid email format | "A valid admin email address is required." |
| Contact Number | text | No | Max 30 characters; accepts digits, spaces, parentheses, hyphens, leading + | — |
| Website URL | text | No | If provided: must begin with https:// or http:// | "Enter a valid website URL (e.g. https://www.hssuk.org)." |

#### Section D — Regional Settings

Sub-section: **Localisation**

| Field | Type | Required | Validation / Options | Error Message |
|-------|------|----------|----------------------|---------------|
| Date Format | select | Yes | DD/MM/YYYY · MM/DD/YYYY · YYYY-MM-DD | "Date format is required." |
| Time Zone | select | Yes | UTC+0 (Greenwich Mean Time) · UTC+5:30 (Indian Standard Time) · UTC-5 (Eastern Standard Time) [TBD — non-blocking: full production list pending] | "Time zone is required." |
| Currency | select | Yes | GBP (£) · USD ($) · EUR (€) · INR (₹) | "Currency is required." |
| Language | select | No | UK English (only available option currently) [TBD — non-blocking: additional languages TBD] | — |

#### Section E — Security

Sub-section: **Access Control**

| Field | Type | Required | Default | Validation | Error Message |
|-------|------|----------|---------|------------|---------------|
| Maximum Login Attempts | number | Yes | 5 | Integer; min 1, max 10; default 5. After N consecutive failures → account locked for 5 minutes (auto-released). | "Maximum Login Attempts must be a whole number between 1 and 10." |
| Session Timeout (Minutes) | number | Yes | 60 | Integer; min [TBD — non-blocking]; max [TBD — non-blocking]; default 60. Represents idle inactivity period before auto-logout. | "Session Timeout must be a positive whole number (in minutes)." |

---

### 4. Business Logic

#### 4.1 Positive Flow

1. The Super Admin navigates to Settings. The General tab is displayed by default with all fields pre-populated from the last saved values.
2. The Super Admin edits one or more fields across any number of the five sections.
3. The Super Admin clicks "Save Changes" in the sticky footer. The button label changes to "Saving Changes…" and the button is disabled for the duration of the async call.
4. The system sends a single API request containing all General Tab field values.
5. On a successful response the system displays a toast notification: "System settings updated successfully."
6. All updated values are now the active system-wide configuration. Regional settings (`dateFormat`, `timeZone`, `currency`) apply globally to all modules immediately. Security settings (`maxLoginAttempts`, `sessionTimeout`) are enforced by Auth at the next applicable login or session evaluation.
   - `maxLoginAttempts` (default: 5): Auth module locks account for **5 minutes** after N consecutive failed login attempts. Lock auto-releases after 5 minutes. No manual unlock action required in the current scope.
   - `sessionTimeout` (default: 60 minutes): enforced by the session management layer. Idle period is measured from last user action. On expiry, session is invalidated and user is redirected to the login page. Takes effect immediately on save (applies to all new sessions; existing active sessions follow the previous value until next activity check).
7. SMTP changes take effect on the next outbound email dispatch.
8. Branding changes (`companyName`, `copyrightText`) are reflected globally in the platform UI immediately. Uploaded Logo and Favicon replace any previously stored assets platform-wide.

#### 4.2 Negative Flow

1. If the Super Admin clicks "Save Changes" with one or more required fields empty, the system displays inline field-level validation errors per the error messages in Section 3. The API call is not made.
2. If the API call returns an error response, the system displays a toast notification: "Failed to update settings." No partial update is applied; all fields retain their pre-submit values on screen.
3. If an uploaded file is of an unsupported type, the system rejects the file at input and displays the error message defined in Section 3. The upload field reverts to its previous state (either empty or the previously saved asset).

#### 4.3 Edge Cases

1. **Tab switching without saving:** If the Super Admin switches from the General tab to the Mobile Related tab (or vice versa) before saving, unsaved field changes are retained in local form state. They are not lost and are not saved. The Super Admin can return to the tab and continue editing or save.
2. **Cancel with unsaved changes:** If the Super Admin clicks "Cancel", the system shows a browser `confirm()` dialog: "Are you sure you want to discard all changes?" If the Super Admin confirms, `window.location.reload()` is executed and all fields reset to the last saved state. If the Super Admin dismisses the dialog, no action is taken and the form remains in its current edited state.
3. **Concurrent edits:** If two Super Admin sessions submit settings changes simultaneously, the last write wins. No optimistic locking or conflict detection is currently specified. [TBD — Needs Confirmation: non-blocking — concurrency strategy not defined in frontend]
4. **No logo/favicon previously set:** Upload fields render empty. Saving without uploading a file leaves the existing asset (or absence of asset) unchanged.
5. **Replacing an existing logo/favicon:** On a successful save the new file replaces the old asset. The old asset is no longer served. Storage location is [TBD — Needs Confirmation: non-blocking — Azure Blob Storage assumed].

#### 4.4 Audit Rules

| Action | Audit Event | Fields Logged |
|--------|-------------|---------------|
| Save General Settings | `SETTINGS_GENERAL_UPDATED` | `actorId`, `timestamp`, `changedFields: string[]` (list of field keys that changed), `previousValues: Record<string,any>` (masked for SMTP Password), `newValues: Record<string,any>` (masked for SMTP Password) |
| Upload Logo | `SETTINGS_LOGO_UPLOADED` | `actorId`, `timestamp`, `fileSize`, `mimeType` |
| Upload Favicon | `SETTINGS_FAVICON_UPLOADED` | `actorId`, `timestamp`, `fileSize`, `mimeType` |
| Copy SMTP Password | `SETTINGS_SMTP_PASSWORD_COPIED` | `actorId`, `timestamp`, `ipAddress` |

#### 4.5 Security and Permissions

| Role | View Settings | Edit Settings | Save Settings |
|------|--------------|---------------|---------------|
| Super Admin | Yes | Yes | Yes |
| National Head | No | No | No |
| Regional Head | No | No | No |
| Shakha Admin | No | No | No |
| Member | No | No | No |
| Teen | No | No | No |

- Non-Super-Admin users who navigate directly to the Settings URL must be redirected to their default dashboard. The API endpoint must enforce role-based authorisation server-side; a 403 response must be returned for any non-Super-Admin request.
- The SMTP Password field must never be returned in plaintext in the general GET settings API response. The GET settings endpoint returns the SMTP Password as a masked placeholder string. The UI renders a copy icon next to the field. On click, the system calls `GET /api/v1/settings/smtp-password` (authenticated, Super Admin only) and writes the plaintext value to `navigator.clipboard`. The plaintext password is never embedded in the general GET /settings response payload.

---

### 5. Navigation

#### Entry Points

| Source | Trigger | Condition |
|--------|---------|-----------|
| Sidebar — "Settings" item | Click | User is Super Admin with active session |
| Direct URL (e.g. /settings) | Page load | User is Super Admin; non-Super-Admin is redirected |

#### Exit Points

| Destination | Trigger |
|-------------|---------|
| Mobile Related Tab (same screen) | Super Admin clicks "Mobile Related" tab |
| Previous page / dashboard | Super Admin clicks browser back or navigates via sidebar |
| Settings screen reloaded (hard reset) | Super Admin confirms Cancel dialog |

---

### 6. Notifications

| Trigger | Channel | Recipient | Content | Timing |
|---------|---------|-----------|---------|--------|
| Successful save | In-app toast | Super Admin (current session) | "System settings updated successfully." | Immediately on successful API response |
| Failed save | In-app toast | Super Admin (current session) | "Failed to update settings." | Immediately on API error response |

No email or push notifications are generated by Settings save operations.

---

### 7. Acceptance Criteria

1. The system shall pre-populate all General Tab fields with the last saved values when the Super Admin navigates to the Settings screen.
2. The system shall disable the "Save Changes" button and display the label "Saving Changes…" while the save API call is in progress, and re-enable it on completion regardless of outcome.
3. The system shall display the toast "System settings updated successfully." when the save API call returns a success response, and "Failed to update settings." when it returns an error.
4. The system shall prevent saving if any required field is empty and shall display the exact inline error messages specified in Section 3 for each empty required field.
5. The system shall retain unsaved changes in local form state when the Super Admin switches between the General and Mobile Related tabs without saving.
6. The system shall execute `window.location.reload()` (resetting all fields to last saved state) only after the Super Admin confirms the browser `confirm()` dialog triggered by clicking "Cancel"; clicking "Cancel" without confirmation must leave the form unchanged.
7. The system shall reject file uploads for Logo and Favicon that are not of the accepted types (PNG/SVG for Logo; ICO/PNG for Favicon) and display the exact error messages specified in Section 3.

---

### 8. API Mapping

| Operation | Method | Endpoint | Request Payload Summary | Success Response |
|-----------|--------|----------|------------------------|-----------------|
| Load current settings | GET | [TBD — Needs Confirmation: blocking — endpoint not confirmed] | — | 200 with current settings object |
| Save all General Tab settings | PUT / PATCH | [TBD — Needs Confirmation: blocking — endpoint not confirmed] | `{ companyName, copyrightText, logoUrl, faviconUrl, smtpHost, smtpPort, smtpUsername, smtpPassword, encryptionType, senderName, senderEmail, address, adminEmail, contactNumber, websiteUrl, dateFormat, timeZone, currency, language, maxLoginAttempts, sessionTimeout }` | 200 with updated settings object |
| Upload logo asset | POST | [TBD — Needs Confirmation: non-blocking — file upload endpoint not confirmed] | Multipart form-data; file field | 200 with asset URL |
| Upload favicon asset | POST | [TBD — Needs Confirmation: non-blocking — file upload endpoint not confirmed] | Multipart form-data; file field | 200 with asset URL |
| Retrieve SMTP Password (copy) | GET | `/api/v1/settings/smtp-password` — returns `{ password: string }` in plaintext; Super Admin only; every call logged in audit trail | — | 200 with `{ password: string }` |

---

### 9. Data Rules

| Rule | Detail |
|------|--------|
| SMTP Password storage | Must be stored encrypted at rest. Never returned in plaintext via any API response. |
| Logo and Favicon storage | Binary assets; storage location assumed Azure Blob Storage [TBD — Needs Confirmation: non-blocking]. Old asset deleted or replaced on successful upload. |
| Regional settings propagation | `dateFormat`, `timeZone`, and `currency` are system-wide globals read by all modules at runtime. Changing them affects all existing and future records' display formatting immediately. |
| Security settings propagation | `maxLoginAttempts` is read by Auth at login time. `sessionTimeout` is enforced by the session management layer. Both take effect immediately on save with no application restart required. |
| SMTP settings propagation | New SMTP configuration values are used on the next outbound email dispatch. In-flight email deliveries (if any) use the configuration active at the time of dispatch. |
| PII fields | `adminEmail`, `senderEmail`, `smtpUsername`, `smtpPassword`, `contactNumber` are potentially personally identifying or sensitive. Access is restricted to Super Admin. Covered by GDPR obligations as per `00-global.md`. |
| Retention | Settings records are system configuration; they are retained for the life of the platform. Audit history (if implemented) subject to retention policy [TBD — see §4.4]. |

---

### 10. Dependencies

| Dependency | Detail |
|------------|--------|
| `03-authentication.md` | `maxLoginAttempts` is read by the Auth module at login to enforce account lockout. `sessionTimeout` is enforced by session management. SMTP must be configured for OTP email delivery (US-002, US-003, US-004 in auth). |
| `00-global.md` | `dateFormat`, `timeZone`, and `currency` are referenced as system-wide defaults across all modules. |
| All modules | All modules consume the Regional Settings values for display formatting. |
| Asset delivery (CDN/Blob) | Logo and Favicon URLs must be publicly accessible for platform-wide rendering. Storage service TBD (see §9). |

---

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q-901-1 | ~~maxLoginAttempts valid range?~~ **Resolved:** Integer 1–10, default 5. Lock duration: 5 minutes, auto-released. | Resolved |
| Q-901-2 | ~~sessionTimeout valid range?~~ **Resolved:** Default 60 min; fully configurable. Min/max bounds TBD (non-blocking). | Resolved |
| Q-901-3 | What are the maximum accepted file sizes for Logo and Favicon uploads? | Non-blocking; needed before production hardening |
| Q-901-4 | Where are Logo and Favicon assets stored? (Azure Blob Storage assumed — confirm.) | Non-blocking; needed before API Mapping §8 and Data Rules §9 are finalised |
| Q-901-5 | Which additional time zones will be available in production beyond the three shown in the frontend? | Non-blocking |
| Q-901-6 | Which additional languages will be supported beyond UK English? | Non-blocking |
| Q-901-7 | Is a "Test SMTP Connection" feature planned for a future release? | Non-blocking |
| Q-901-8 | ~~Should Settings saves be audit-logged?~~ **Resolved:** Yes. Audit events: SETTINGS_GENERAL_UPDATED (with changedFields + masked prev/new values), SETTINGS_LOGO_UPLOADED, SETTINGS_FAVICON_UPLOADED. | Resolved |
| Q-901-9 | ~~GET endpoint — masked placeholder or field omitted?~~ **Resolved:** Masked on GET. Copy button calls separate secure endpoint `/api/v1/settings/smtp-password`; plaintext never in general GET response. | Resolved |
| Q-901-10 | What are the confirmed GET and PUT/PATCH endpoint paths for the General Tab settings? | Yes — blocking; required to complete §8 |

---

## US-902 — System Settings: Mobile Related Tab

---

### 1. User Story

The system shall allow the Super Admin to configure the current version numbers and
force-update behaviour for the Android and iOS mobile applications, and shall save these
values in one operation when the Super Admin submits the sticky-footer "Save Changes"
button, so that the mobile applications can be directed to update before the user can
continue using them.

---

### 2. Screen Purpose

The Mobile Related Tab gives the Super Admin control over mobile application version
management without requiring a code deployment. By toggling force-update flags and
providing the current required version number and an in-app update message, the Super Admin
can mandate that mobile users upgrade to a minimum version before proceeding. The screen
renders with the last-saved values pre-populated.

---

### 3. Fields and Validation

#### Android Application

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| Android App Version | text | Yes | Non-empty; semantic version format (e.g. 1.2.4); placeholder: "e.g. 1.0.0" | "Android app version is required." |
| Force Android Update | toggle (boolean) | No | Values: true (ON) / false (OFF); default: false (OFF) | — |
| Android Update Message | textarea | No | Max character length: [TBD — Needs Confirmation: non-blocking — not specified in frontend]; visible only / editable when Force Android Update is ON [TBD — Needs Confirmation: non-blocking — confirm whether field is hidden or disabled when toggle is OFF] | — |

#### iOS Application

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| iOS App Version | text | Yes | Non-empty; semantic version format (e.g. 1.2.4); placeholder: "e.g. 1.0.0" | "iOS app version is required." |
| Force iOS Update | toggle (boolean) | No | Values: true (ON) / false (OFF); default: false (OFF) | — |
| iOS Update Message | textarea | No | Max character length: [TBD — Needs Confirmation: non-blocking — not specified in frontend]; visible only / editable when Force iOS Update is ON [TBD — Needs Confirmation: non-blocking — confirm whether field is hidden or disabled when toggle is OFF] | — |

---

### 4. Business Logic

#### 4.1 Positive Flow

1. The Super Admin clicks the "Mobile Related" tab. The screen renders with all six fields pre-populated from the last saved values. Toggle states reflect the current force-update configuration.
2. The Super Admin edits one or more fields.
3. The Super Admin clicks "Save Changes" in the sticky footer. The button label changes to "Saving Changes…" and the button is disabled for the duration of the async call.
4. The system sends a single API request containing the current values of all Mobile Related Tab fields.
5. On a successful response the system displays a toast notification: "System settings updated successfully."
6. From the next mobile app poll of the settings endpoint, the app reads the updated `forceAndroidUpdate` / `forceIosUpdate` flag. If the flag is `true`, the app displays the corresponding update message and blocks access until the user updates to the version indicated by `androidAppVersion` / `iosAppVersion`.

#### 4.2 Negative Flow

1. If "Android App Version" or "iOS App Version" is empty when "Save Changes" is clicked, the system displays the inline error messages defined in Section 3. The API call is not made.
2. If the version string does not match semantic version format (e.g. contains non-numeric characters or missing segments), the system displays: "Enter a valid version number (e.g. 1.0.0)." The API call is not made.
3. If the API call returns an error response, the system displays: "Failed to update settings." No partial update is applied.

#### 4.3 Edge Cases

1. **Force update ON with no message:** If `forceAndroidUpdate` or `forceIosUpdate` is toggled ON but the corresponding update message textarea is left empty, the mobile app will display a force-update block with no descriptive message. Whether to require a message when the force flag is ON is [TBD — Needs Confirmation: non-blocking].
2. **Tab switching without saving:** Unsaved changes on the Mobile Related tab are retained in local form state if the Super Admin switches to the General tab and returns, consistent with US-901 §4.3 edge case 1.
3. **Cancel with unsaved changes:** Behaviour is identical to US-901 §4.3 edge case 2 — browser `confirm()` dialog, then `window.location.reload()` on confirmation.
4. **Version downgrade:** The system does not prevent a Super Admin from setting a lower version number than the previously saved value. Any business rules around version monotonicity are [TBD — Needs Confirmation: non-blocking].
5. **Mobile app polling frequency:** The interval at which mobile apps poll the settings endpoint to detect a force-update flag is [TBD — Needs Confirmation: non-blocking — not specified in frontend].

#### 4.4 Audit Rules

| Action | Audit Event | Fields Logged |
|--------|-------------|---------------|
| Save Mobile Settings | `SETTINGS_MOBILE_UPDATED` | `actorId`, `timestamp`, `changedFields: string[]`, `previousValues: Record<string,any>`, `newValues: Record<string,any>` |

#### 4.5 Security and Permissions

| Role | View Mobile Settings | Edit Mobile Settings | Save Mobile Settings |
|------|---------------------|----------------------|----------------------|
| Super Admin | Yes | Yes | Yes |
| All other roles | No | No | No |

- All access controls and server-side enforcement rules stated in US-901 §4.5 apply equally to this tab.
- Force-update configuration is high-impact (it can block all mobile users); access must remain strictly Super Admin only.

---

### 5. Navigation

#### Entry Points

| Source | Trigger | Condition |
|--------|---------|-----------|
| Settings screen — "Mobile Related" tab | Click | User is Super Admin; General Tab is already loaded |
| Direct URL with Mobile Related tab parameter (if supported) | Page load | User is Super Admin |

#### Exit Points

| Destination | Trigger |
|-------------|---------|
| General Tab (same screen) | Super Admin clicks "General" tab |
| Previous page / dashboard | Super Admin clicks browser back or navigates via sidebar |
| Settings screen reloaded (hard reset) | Super Admin confirms Cancel dialog |

---

### 6. Notifications

| Trigger | Channel | Recipient | Content | Timing |
|---------|---------|-----------|---------|--------|
| Successful save | In-app toast | Super Admin (current session) | "System settings updated successfully." | Immediately on successful API response |
| Failed save | In-app toast | Super Admin (current session) | "Failed to update settings." | Immediately on API error response |

No email or push notifications are generated by Mobile Settings save operations. Mobile app users are notified by the mobile app itself (using the update message content) when the force-update flag is active — this is a mobile-side behaviour, not a platform notification.

---

### 7. Acceptance Criteria

1. The system shall pre-populate all Mobile Related Tab fields with the last saved values, including correct toggle states for `forceAndroidUpdate` and `forceIosUpdate`, when the Super Admin navigates to the tab.
2. The system shall prevent saving if `androidAppVersion` or `iosAppVersion` is empty or not in a valid semantic version format, displaying the exact error messages specified in Section 3.
3. The system shall display the toast "System settings updated successfully." on a successful save and "Failed to update settings." on a failed save.
4. The system shall disable the "Save Changes" button and display "Saving Changes…" while the API call is in progress.
5. The system shall retain unsaved Mobile Related Tab changes in local form state when the Super Admin switches to the General Tab without saving.
6. When `forceAndroidUpdate` is `true` after a successful save, the mobile app shall read this flag and display the value of `androidUpdateMessage`, blocking continued app use until the user updates; the same applies for `forceIosUpdate` and `iosUpdateMessage`.
7. The system shall execute `window.location.reload()` (resetting all fields to last saved state) only after the Super Admin confirms the browser `confirm()` dialog triggered by clicking "Cancel".

---

### 8. API Mapping

| Operation | Method | Endpoint | Request Payload Summary | Success Response |
|-----------|--------|----------|------------------------|-----------------|
| Load current mobile settings | GET | [TBD — Needs Confirmation: blocking — endpoint not confirmed] | — | 200 with mobile settings object |
| Save all Mobile Related Tab settings | PUT / PATCH | [TBD — Needs Confirmation: blocking — endpoint not confirmed] | `{ androidAppVersion, forceAndroidUpdate, androidUpdateMessage, iosAppVersion, forceIosUpdate, iosUpdateMessage }` | 200 with updated settings object |

Note: If General Tab and Mobile Related Tab share a single settings resource (same GET/PUT endpoint), only the mobile-relevant fields are expected to be updated in the payload for this tab's save operation; the API design must confirm whether partial update (PATCH) or full resource replacement (PUT) is used.

---

### 9. Data Rules

| Rule | Detail |
|------|--------|
| Force-update flag | Boolean. Stored as `forceAndroidUpdate` and `forceIosUpdate`. Read by mobile apps at runtime; changes take effect on next app poll. |
| Version strings | Stored as text strings. No server-side monotonicity enforcement currently specified. |
| Update message content | Stored as plain text. Displayed verbatim in the mobile app. No HTML rendering assumed. |
| Retention | Mobile settings records are system configuration retained for the life of the platform. |

---

### 10. Dependencies

| Dependency | Detail |
|------------|--------|
| Android mobile application | Reads `forceAndroidUpdate`, `androidAppVersion`, and `androidUpdateMessage` from the settings API to determine whether to block the user and what message to show. |
| iOS mobile application | Reads `forceIosUpdate`, `iosAppVersion`, and `iosUpdateMessage` from the settings API to determine whether to block the user and what message to show. |
| `09-settings.md` US-901 | Shares the same sticky-footer Save/Cancel pattern, tab-persistence behaviour, and notification toasts. If the two tabs share a single API resource, the GET endpoint is the same. |

---

### 11. Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| Q-902-1 | What are the confirmed GET and PUT/PATCH endpoint paths for the Mobile Related Tab settings? | Yes — blocking; required to complete §8 |
| Q-902-2 | Do the General Tab and Mobile Related Tab share a single API resource (same GET/PUT endpoint), or are they separate endpoints? | Yes — blocking; affects §8 for both US-901 and US-902 |
| Q-902-3 | Should a message be required when Force Android Update or Force iOS Update is toggled ON? If yes, add a conditional-required validation rule in §3. | Non-blocking |
| Q-902-4 | What is the maximum character length for the Android Update Message and iOS Update Message textareas? | Non-blocking |
| Q-902-5 | Is the update message textarea hidden (display:none) or merely disabled when the corresponding force-update toggle is OFF? | Non-blocking |
| Q-902-6 | At what interval do mobile apps poll the settings endpoint to check the force-update flag? | Non-blocking |
| Q-902-7 | ~~Should Mobile Settings saves be audit-logged?~~ **Resolved:** Yes. Audit event: SETTINGS_MOBILE_UPDATED (with changedFields + prev/new values). | Resolved |
| Q-902-8 | Is there any server-side enforcement of version monotonicity (preventing a Super Admin from setting a lower version than the current value)? | Non-blocking |

---

## Cross-Cutting Notes

- The sticky-footer "Save Changes" / "Cancel" pattern and the tab-persistence behaviour described in US-901 §4.1–4.3 are shared by US-902. Both screens form part of the same Settings page component.
- Sub-areas listed in the prior placeholder FRD — **Static Pages**, **Email Templates**, and **System Notifications** — do not yet have frontend implementations available for Gate 4 analysis. They remain **[TBD — Needs Confirmation: blocking for scope decision]** and must be documented in a future authoring pass once the frontend screens exist.
