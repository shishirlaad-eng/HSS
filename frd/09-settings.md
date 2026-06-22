# 09 — Settings

**Maps to Doc tab:** Settings (System settings · Static pages · Email template · System notifications)

## Status
Source lists these as headers; detailed specs are **[TBD — Needs Confirmation]** / not yet expanded.
Several global rules already depend on Settings being configurable, so the confirmed dependencies
below must hold even before full specs are written.

## Sub-areas in scope
1. **System Settings** — session idle timeout (default 60 min), OTP expiry (Login 5 min / Reset
   10 min), attachment rules (allowed upload types/sizes; default PDF/JPG/PNG, max 10 MB), and other
   system parameters. Values must be readable by Auth Service and other modules at runtime; changes
   apply without code deployment.
2. **Static Pages** — content pages **[TBD: which pages, editor type, publish flow]**.
3. **Email Template** — templates for transactional emails (OTP, approval, consent, etc.)
   **[TBD: template list, variables, versioning]**.
4. **System Notifications** — config for system-generated notifications **[TBD: triggers, channels,
   cooldown]** (note: Announcements module has a "cooldown delay option" — relationship **[TBD]**).

## Confirmed dependencies (other modules rely on these)
- Auth: session idle timeout, Login/Reset OTP expiry read from Settings.
- Auth: SMTP must be configured and enabled in Settings for email OTP delivery.
- Global: allowed upload file types/sizes set by Super Admin in Admin Settings.
- SMS enablement mechanism (global Settings toggle vs per-account) — **[TBD — Auth Q2 / Global Q7]**.

## Access
Super Admin: full. (Roles & Permissions matrix: Settings/RBAC is Super Admin "Full"; National Head
has RBAC-only for specific tiers — see `10-roles-permissions.md`.)

> **[FRONTEND-RECONCILE]** When the prototype's Settings screens exist, capture each sub-area in the
> Gate 4 11-section format, especially which values are runtime-configurable and their validation
> ranges (e.g. min/max session timeout, OTP expiry bounds).
