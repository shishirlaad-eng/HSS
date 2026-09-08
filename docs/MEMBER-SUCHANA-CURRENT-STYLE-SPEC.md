# Member Suchana — Current Localhost Spec (visible elements)

Scope: **Member → Suchana** listing and detail page (`Announcements.tsx`, `isMemberRole === true` branch — role is `Adult Member` or `Teen Member`). Documents what is **already rendered right now**. Real classNames from the current source, resolved to px/hex. This is a materially different render path than the Super Admin Suchana screens (no KPI row, no admin filters, no status/scope/notification metadata, Unread/Read grouping instead of a flat list) — not a variant of the admin spec, a separate one.

---

## List page

### 1. Page header block

| Property | Value |
|---|---|
| Title | "Suchana" |
| Subtitle | "Below is the list of all Suchanas for your attention" — 14px, `neutral-600`/`neutral-400` |
| Actions row | `SearchBar` + date-range filter button — **no** "New Suchana" button (member has no `ap.canAdd`) |
| Date filter button | height 40px (`h-10`), padding 12px x, `text-xs font-medium`, `rounded-lg`, border toggles to `primary-500`/`primary-50` when a range is active |

### 2. What's absent vs the admin view

| Removed for members | Reason |
|---|---|
| KPI row (Total/Sent/Scheduled/Drafts `StatCard`s) | `!isMemberRole` only |
| Status filter select, Scope filter select | `canViewAdminSuchanaValues` only |

### 3. Results count text

| Property | Value |
|---|---|
| margin-bottom | 12px |
| font-size | 12px (`text-xs`) |
| color | `neutral-500`/`neutral-400` |

### 4. Section heading ("Unread" / "Read")

| Property | Value |
|---|---|
| font-size / weight | 19px (`text-[19px]`) / 600 |
| color | `neutral-900`/white |
| count suffix | same line, `font-normal`, `neutral-400`/`neutral-500`, format `(N)` |
| margin-bottom | 12px |
| section-to-section gap | 28px (`space-y-7`) |
| empty-section text | 12px, `neutral-400`/`neutral-500` |

### 5. Suchana card (list row) — member view

| Property | Value |
|---|---|
| border / radius / shadow | 1px `neutral-200`/`neutral-800`, 8px, `shadow-sm` — identical shell to admin card |
| inner padding | 20px x / 16px y |
| card-to-card gap | 12px (`space-y-3`) |
| Priority bar | 4px wide strip, red/amber/neutral by priority |
| Content-type icon box | 40×40px, `rounded-lg`, bg `neutral-50`/`neutral-900`, icon 20px |
| Title | 16px / 600, **`"TT Ramillas", "Open Sauce One", serif`** (explicit inline override — same as admin) |
| High-priority text | 12px / 500, red-500/400 — shown regardless of role when `priority === 'high'` |
| Body preview | 12px, `neutral-600`/`neutral-400`, 2-line clamp |
| Date (right column) | 12px, `neutral-500`/`neutral-400` |

### 6. What's absent on the member card vs admin card

| Removed for members | Gate |
|---|---|
| Status pill (Sent/Scheduled/Draft) | `canViewAdminSuchanaValues` |
| Scope chip (National/Vibhag/Nagar/Shakha) | `canViewAdminSuchanaValues` |
| Demographic filter chips (age/gender) | `canViewAdminSuchanaValues` |
| Push/Email notification badges | `canViewAdminSuchanaValues` |
| Bell indicator | `canViewAdminSuchanaValues` |
| "Posted by" line under date | `!isMemberRole` only, i.e. hidden for members |

Net effect: the member card shows only **icon, title, high-priority flag (if any), body preview, date, delete button (if permitted)** — everything else on the row is admin-only.

---

## Detail page (opened by tapping a card — marks it read)

### 7. Page header block

| Property | Value |
|---|---|
| Title | the Suchana's own title |
| Breadcrumbs | **none** for members (`undefined` — admin gets a 3-level breadcrumb) |
| Actions | single `SecondaryButton` "Back to Suchanas", icon `ArrowLeft` — no Edit/Delete (admin-only) |

### 8. Media block (image/video, if attached)

| Property | Value | (admin equivalent) |
|---|---|---|
| Image max-height | **384px** (`max-h-96`) | 288px (`max-h-72`) |
| Video container height | **288px** (`h-72`) | 192px (`h-48`) |
| border / radius | 1px `neutral-200`/`neutral-800`, 8px | same |

Members get a noticeably larger media area than admins on the same screen.

### 9. Message card

| Property | Value | (admin equivalent) |
|---|---|---|
| Header padding | 24px x, 16px top, 12px bottom | same |
| Header text | 14px / 600, "Message" | same |
| Body padding | **24px x / 24px y** (`px-6 py-6`) | 24px x / 20px y (`px-6 py-5`) |
| Body font-size | **16px** (`text-base`) | 14px (`text-sm`) |
| Body color | `neutral-700`/`neutral-300`, `leading-relaxed`, rendered via `prose dark:prose-invert` | same |

Members read a larger body font in a slightly roomier card than admins do.

### 10. Audience Scope + Posted-by/Date row — **member-only block**

This 2-column row only renders for members (`isMemberRole`); admins get this same information in the right sidebar instead (§13 in the admin-facing doc), not inline.

| Property | Value |
|---|---|
| grid | 1 col mobile / 2 col `sm:` up, gap 16px |
| **Audience Scope card**: padding | 20px (`p-5`) |
| label | 12px, `neutral-500`/`neutral-400`, margin-bottom 12px |
| scope value | 14px / 600, icon 16px, color matches scope (primary/violet/emerald/amber) |
| sub-detail lines (region/town/centre) | 12px, `neutral-500`/`neutral-400`, margin-top 12px |
| **Posted-by/Date card**: background | `neutral-50`/`neutral-900` at 50% |
| padding | 16px (`p-4`) |
| row font-size | 12px, label muted / value `neutral-900`/white `font-medium` (posted-by) or `neutral-700`/`neutral-300` (date) |
| row-to-row gap | 8px (`space-y-2`) |

### 11. What's absent on the member detail page vs admin

| Removed for members | Gate |
|---|---|
| Demographic Filters card (age/gender/responsibility chips) | `!isMemberRole` |
| Right sidebar (Status & Priority / Audience Scope / Notifications / Meta cards, `lg:w-80`) | `!isMemberRole` |
| Edit / Delete header buttons | `!isMemberRole` |
| Breadcrumbs | `!isMemberRole` |

The member detail page is single-column (no right sidebar at all) — the admin's 3-column-worth of metadata (status, priority, content type, cooldown, estimated reach, scope, notification channels, posted-by/created/sent/ID) collapses to just the two inline cards in §10 for members.

---

## Notable current-state observations

- Member body text (16px) is **larger** than admin body text (14px) for the exact same message content — the only place across every screen audited so far where the member-facing render is roomier/larger than the admin one, rather than the usual pattern of admin screens carrying more chrome.
- The Suchana card title's `TT Ramillas` inline-style override (see [Suchana list spec](SUCHANA-LIST-CURRENT-STYLE-SPEC.md)) applies identically here — this is shared render code (`renderAnnouncementCard`), not duplicated per role.
- "Read" status is purely local component state (`readIds`, a `Set` in `useState`) — it resets on every page reload/navigation away and is never persisted, so the Unread/Read grouping is not a real read-receipt system yet.
