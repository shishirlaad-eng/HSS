# Suchana List — Current Localhost Spec (visible elements)

Scope: **Super Admin → Suchana** listing (`Announcements.tsx`, `pageState === 'list'`, admin view — `canViewAdminSuchanaValues === true`). Documents what is **already rendered right now**. Real classNames from the current source, resolved to px/hex. Nothing proposed.

---

### 1. Page header block

| Property | Value |
|---|---|
| Title | "Suchana" — default `PageHeader` title styling (32px/600, `neutral-900`/white) |
| Subtitle | "Create and manage suchanas for members across the network" — 14px, `neutral-600`/`neutral-400` |
| Actions row | `SearchBar` + "New Suchana" `PrimaryButton` (`ap.canAdd` only) |

### 2. KPI row (`StatCard` × 4 — Total / Sent / Scheduled / Drafts)

| Property | Value |
|---|---|
| grid | `grid-cols-2 lg:grid-cols-4`, gap 16px |
| margin-bottom | 24px |
| card padding | 16px (`StatCard` default, see system-wide reference §17) |
| icon | Megaphone / Send / CalendarClock / BookmarkCheck, 20px, `primary-600`/`primary-400` |
| trend text | 12px, `success-600`/`error-600` per `positive` flag |

### 3. Admin filter row (Status / Scope selects)

| Property | Value |
|---|---|
| gap | 12px (`gap-3`), wraps to column on mobile |
| margin-bottom | 16px |
| select height | 40px (`h-10`) |
| select padding | 12px left / 36px right (room for chevron) |
| border-radius | 8px |
| font-size | 14px, `neutral-700`/`neutral-300` |
| chevron icon | 16px, `neutral-400`, absolute `right-3` |
| Clear button | ghost style: `px-3 py-1.5`, border `neutral-300`/`neutral-700`, 14px/500 |

### 4. Results count text

| Property | Value |
|---|---|
| margin-bottom | 12px |
| font-size | 12px (`text-xs`) |
| color | `neutral-500`/`neutral-400` |

### 5. Suchana card (list row)

| Property | Value |
|---|---|
| border | 1px solid `neutral-200`/`neutral-800`, hover → `neutral-300`/`neutral-700` |
| border-radius | 8px |
| box-shadow | `shadow-sm` |
| inner padding | 20px x / 16px y (`px-5 py-4`) |
| gap (icon ↔ content) | 16px |
| card-to-card gap | 12px (`space-y-3`) |

### 6. Priority bar (left edge strip)

| Property | Value |
|---|---|
| width | 4px (`w-1`) |
| height | full card height |
| color | red-500 (high) / amber-500 (medium) / neutral-300–700 (low) |

### 7. Content-type icon box

| Property | Value |
|---|---|
| size | 40×40px (`w-10 h-10`) |
| border-radius | 8px |
| background | `neutral-50`/`neutral-900` |
| border | 1px solid `neutral-200`/`neutral-800` |
| icon size | 20px (`w-5 h-5`) |
| icon color | primary (text) / violet (image) / rose (video) |

### 8. Title

| Property | Value |
|---|---|
| font-size | 16px (`text-[16px]`) |
| font-weight | 600 |
| **font-family** | **`"TT Ramillas", "Open Sauce One", serif`** — explicit inline style, the only place in this list that opts into the heading serif font instead of inheriting the body sans stack |
| color | `neutral-900`/white |
| margin-bottom (row) | 4px |

### 9. Status pill (next to title)

| Property | Value |
|---|---|
| padding | 2px y / 8px x |
| border-radius | 9999px |
| font-size / weight | 12px / 500 |
| colors | sent = success wash/text; scheduled = blue-50/700 (dark blue-950/400); draft = neutral-100/600 |

### 10. Priority text ("High priority")

| Property | Value |
|---|---|
| font-size / weight | 12px / 500 |
| color | red-500/400 (only rendered when priority = high) |

### 11. Body preview text

| Property | Value |
|---|---|
| font-size | 12px (`text-xs`) |
| color | `neutral-600`/`neutral-400` |
| line-clamp | 2 lines |
| margin-bottom | 12px |

### 12. Bottom meta row (scope chip, demographic chips, notif badges, bell)

| Property | Value |
|---|---|
| gap | 16px x / 8px y (`gap-x-4 gap-y-2`) |
| Scope chip icon | 14px (`w-3.5 h-3.5`), color per scope (primary/violet/emerald/amber) |
| Scope chip text | 12px / 500 |
| Demographic chip | 12px, `neutral-500`/`neutral-400`, icon 12px |
| Notif badge (Push/Email) | pill, 12px x / 2px y padding, `text-xs`, border 1px, success or blue tint when enabled, neutral when off |
| Bell indicator | 12px text, amber-600/400, icon 12px |

### 13. Right-side column (date, posted-by, delete)

| Property | Value |
|---|---|
| alignment | right |
| date text | 12px, `neutral-500`/`neutral-400` |
| posted-by text | 12px, `neutral-400`/`neutral-500`, margin-top 2px |
| delete button | 32×32px (`w-8 h-8`), `rounded-lg`, icon 16px, hover → red-50/600 |
| delete disabled state | same size, `neutral-300`/`neutral-700`, `cursor-not-allowed`, native `title` tooltip explains why |

### 14. Pagination bar

| Property | Value |
|---|---|
| margin-top | 24px (`mt-6`) |
| spec | identical to system-wide reference §11 (`hb/listing/Pagination.tsx`) |

---

## Notable current-state observations

- The Suchana card title is the **only element on either audited page so far** (All Members listing/detail, Suchana list) that actually renders in the **TT Ramillas heading font** via an explicit inline `style` override — everywhere else "title" text uses the body sans stack with a bold/semibold weight instead of the serif face.
- Status pill here (`STATUS_CFG`) is a **different shape** than the `StatusBadge` pattern used on Members (`px-2 py-0.5 rounded-full`, **no border**, vs Members' bordered version) — same padding/radius, missing the `border` + `whitespace-nowrap`.
- Member-facing view of this same screen (`isMemberRole === true`) hides Status/Scope/notif badges entirely and groups cards into "Unread"/"Read" sections instead — a materially different screen behind the same component, not documented here since scope is the Super Admin view.
