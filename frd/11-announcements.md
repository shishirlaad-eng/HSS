# 11 — Announcements

**Maps to Doc tab:** Announcements

## Status
Source lists Announcements as a header; a detailed Gate 4 spec is **[TBD — Needs Confirmation]** /
not yet expanded. Known features and permissions from the Global tab are captured below as the
baseline.

## Known features (from Global module list)
- List · Create · Edit · Delete.
- Content types: Text · Image · Video.
- Delivery: Instant or Scheduled Push/Email notifications.
- Cooldown delay option.
- Targeted by hierarchy level (Country/Region/Town/Centre) via Masters.
- Bell-icon notifications for all roles (Receive · Mark as Read).

## Permissions (from Global matrix)
| Role | Announcements |
|------|---------------|
| Super Admin | CRUD |
| National / Regional / Town Head | CRU |
| AC Admin | CRU (Create/Publish at Centre level) |
| Event Admin / Reporting User / Ops User / Member / Teen | View |

## Dependencies
- Masters hierarchy for audience targeting (Country/Region/Town/Centre).
- Azure Blob Storage for announcement attachments (image/video).
- Notifications service (Push/Email) + Settings (System notifications config, cooldown).

> **[FRONTEND-RECONCILE]** When the prototype's Announcements screens exist, capture create/edit
> (content type, scheduling, cooldown, targeting), the bell notifications panel, and mark-as-read
> behaviour in the Gate 4 11-section format.
