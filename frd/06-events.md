# 06 — Events (Super Admin)

**Maps to Doc tab:** Events · **Platform:** Admin Web · **Risk Level:** High

## Scope
System-wide oversight of events across Country → Region → Town → Activity Centre: view/search/
filter listings, view full details (configuration + participation summary), and governance actions
without bypassing safeguards. Two screens (Events Listing, Event Details) + one Create Event modal.
Super Admin cannot bypass OTP/consent safeguards. Every action audited and applied instantly; if
audit logging fails, the action is blocked.

## Core fields & rules
- **Event ID:** unique system-wide; searchable.
- **Event Title:** required; searchable.
- **Location hierarchy (required):** Country/Region/Town/Activity Centre from Masters (cascading);
  creating with inactive Masters values blocked **[TBD if historical selection allowed]**.
- **Schedule:** Start + End datetime required; Start < End.
- **Payment Type:** explicitly Paid or Free; filterable.

## Participant status (registration outcome, NOT event lifecycle)
Pending · Approved · Rejected · Checked-in · Refunded. Checked-in = participant attended; Refunded =
paid registration refunded. Integrity: Checked-in only from previously Approved **[TBD if from
Pending]**; Refunded typically Paid only **[TBD if free-event cancellation marker]**.

## Event lifecycle (event-level)
Draft → Published/Active → (Cancelled before start | Completed after end | Deactivated by SA).
Completed events cannot be deleted.

## Governance actions (Super Admin)
View-only by default. Allowed (audited, no safeguard bypass): Activate/Deactivate · Cancel · Modify
after publish · Override registration approvals · Create events · Delete (only before start;
completed not deletable). **Edit/Modify cutoff:** blocked if current datetime ≥ event start
(server-enforced; UI hides/disables but backend enforces). **Delete cutoff:** allowed only while
current datetime < event start; delete button visible-but-disabled after start and for completed.

## Action safety
Cancel/Modify/Override must not break reporting consistency, payment/refund integrity (Paid), or
safeguarding workflows. Validate eligibility before applying; if undeterminable due to error, fail
safely + log. All allowed actions produce audit logs; audit failure → action blocked.

**[TBD items to finalize]:** event-level lifecycle transitions detail; constraints for cancel/modify
when registrations exist; refund handling on cancellation (Paid); override rules when participant
already checked-in/refunded; safeguarding coupling between event participation and minor consent.

---

## Screen: Events Listing
**Search:** Event Name/Title · Event ID · location hierarchy keywords.
**Filters:** Country → Region → Town → Activity Centre (cascading) · participant status · payment
type (Paid/Free) · date range (start/end).
**Columns (min):** Event ID · Event Title · Country · Region · Town · Activity Centre · Start · End ·
Payment Type (badge) · Participant Status Summary (optional **[TBD]**) · Last updated · Actions
(View, Activate/Deactivate, Cancel, Modify, Override — as allowed).
**KPI tiles:** Total Events · Active · Draft/Published · Completed.
**Delete/Modify visibility:** Delete hidden/disabled after start or for completed ("The event cannot
be deleted after it starts."); Modify hidden/disabled after start ("Event cannot be edited after it
starts.").

## Screen: Event Details
**Sections:** Overview (description + summary + configuration + master scope; Participants via RSVP
tab buckets + table) · Media (feed + drag-drop multi-file upload; JPG/PNG/GIF/WEBP images, video
formats **[TBD]**; modal viewer next/prev; audit MEDIA_UPLOAD/MEDIA_DELETE/optional MEDIA_VIEW) ·
Event Summary · Event Configuration (eligibility, capacity, approval requirement, pricing) ·
Participant Overview (list optional **[TBD PII exposure]**) · Audit/History · Governance Actions
(Activate/Deactivate, Cancel, Modify after publish, Override). When current datetime ≥ start →
Modify & Delete disabled/locked (banner); Cancel may still be allowed — clarify allowed-after-start
actions **[TBD]**.

## Modal: Create Event
Fields (min): Event Title (required) · Location Country/Region/Town/Activity Centre (required,
cascading) · Start + End datetime (required) · Payment Type Paid/Free (required) · Pricing (required
if Paid **[TBD]**) · Capacity (optional **[TBD]**) · Registration approval required Yes/No **[TBD]** ·
Save/Cancel.

## Notifications & Feedback (exact copy)
Success toasts: "Event created successfully." / "Event updated successfully." / "Event activated
successfully." / "Event deactivated successfully." / "Event cancelled successfully." / "Registration
approval updated successfully." Confirmation modals: Activate/Deactivate ("Confirm Status Change") ·
Cancel ("Confirm Cancellation") · Override ("Confirm Override"). Error toasts: validation fail,
blocked actions, payment/refund integrity block, save/update failure, audit-logging failure.
Concurrency: "This record was updated by someone else. Please refresh and try again." Stale view:
"Data updated. Please refresh."

## Edge / reliability
Concurrent edits (Last-based) block save with conflict message; stale view shows refresh; participant
status integrity (Checked-in/Refunded reflect registration/payment flow; overrides auditable);
delete conflict/stale → "Event no longer exists or has changed. Please refresh."

## Acceptance (selected)
Listing loads · search by Title/Event ID/location · filter by Masters scope / participant status /
payment type · view details (config + participant summary) · create + audit · activate/deactivate +
audit · cancel + audit · modify after publish + audit · override approvals + audit · delete before
start allowed + audit + removed from listing · modify/edit blocked after start ("This event can no
longer be edited after it starts.") · delete blocked after start ("This event can no longer be
deleted after it starts.") · delete blocked for completed ("Completed events cannot be deleted.") ·
validation blocks create · save fail → safe error, state unchanged · concurrency conflict blocks.

## API
GET `/admin/events` (page,size,search,countryId,regionId,townId,centreId,participantStatus,
paymentType,dateFrom,dateTo) · GET `/admin/events/{eventId}` · POST `/admin/events` · PUT
`/admin/events/{eventId}` (blocked if datetime ≥ start → 409 `EVENT_EDIT_CUTOFF_REACHED`) · POST
`/admin/events/{eventId}/activate|deactivate|cancel` · POST
`/admin/events/{eventId}/registrations/{registrationId}/override` · DELETE `/admin/events/{eventId}`
(409 `EVENT_DELETE_CUTOFF_REACHED` if datetime ≥ start; 409 `EVENT_COMPLETED_NOT_DELETABLE` if
completed). Errors 400/401/403/404/409/500. All governance endpoints write audit; audit failure →
blocked. Cutoffs server-enforced (UI not sole layer). Concurrency: Last-based.

## Audit
EVENT_CREATE/UPDATE/ACTIVATE/DEACTIVATE/CANCEL · REGISTRATION_OVERRIDE (prev + new decision) ·
EVENT_DELETE · BLOCKED_ACTION (reasons: EVENT_EDIT_CUTOFF_REACHED / EVENT_DELETE_CUTOFF_REACHED /
EVENT_COMPLETED_NOT_DELETABLE) · CONFLICT. Min fields incl. beforeSnapshot/afterSnapshot **[TBD full
vs deltas]**, reason. Append-only, immutable.

## Open Questions (cross-cutting, from source Questions tab)
- Event cancellation / edit-after-publish rules for Event Admin (not just SA).
- Capacity overbooking / waitlist behaviour (block vs waitlist vs overbook).
- Payment & refund integrity (refund authorization, partial refunds, cutoff dates, reconciliation,
  failed/duplicate payments).
- Registration approval state names/transitions standardized.
- Event Admin scope (Activity Centre only? Town? Region? National?).
- Audit logging for payments/refunds + approvals explicitly in Phase 3/4.

> **[FRONTEND-RECONCILE — important discrepancy]** The source Events tab navigation lists the
> Participant filter as **RSVP status: Going / Maybe / Not Going**, while the rest of the tab and the
> Global state machine use **Pending / Approved / Rejected / Checked-in / Refunded**. These are two
> different models. Confirm against the live prototype which model the Events screens actually use,
> and reconcile the filter, the participant table, and the state machine accordingly. This is a
> functional (not cosmetic) discrepancy and must be resolved before backend build.
