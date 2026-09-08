# All Members — Current Localhost Spec (visible elements)

Scope: **Members → All Members** listing (`MemberManagement.tsx`, default **table view** for admin roles) and the **Member detail page** (`MemberDetail.tsx`), **Personal Details tab** (first tab shown on open). This documents what is **already rendered right now** when you run the app — real classNames from the current source, resolved to px/hex. Nothing proposed, nothing from GitHub.

---

## Listing — table view (default for admin roles)

### 1. Page header block

| Property | Value |
|---|---|
| Title | "Members" — `text-[32px] font-semibold`, color `neutral-900`/white |
| Subtitle (Super Admin only) | 14px, `neutral-600`/`neutral-400` |
| Header row margin-bottom | 24px |
| Actions row | `flex items-center gap-2` — SearchBar, Reg. Date filter button, Add Member button, Bulk Upload icon, Summary icon, More-options icon, View-mode switcher |

### 2. Table wrapper

| Property | Value |
|---|---|
| border | 1px solid `neutral-200` / `neutral-800` |
| border-radius | 8px (`rounded-lg`) |
| box-shadow | `shadow-sm` |
| background | white / `neutral-950` |

### 3. Header row (`<th>`)

| Property | Value |
|---|---|
| padding | 16px x / 12px y |
| background | `neutral-50` `#fafafa` / `neutral-900` `#18181b`, sticky |
| border-bottom | 1px solid `neutral-200`/`neutral-800` |
| font-size / weight | 12px / 600 |
| color | `neutral-700` `#3f3f46` / `neutral-300` |
| cursor | pointer (sortable), `select-none` |
| white-space | nowrap |

### 4. Body row (`<tr>`)

| Property | Value |
|---|---|
| hover background | `neutral-50` / `neutral-900` at 50% |
| divider | `divide-y divide-neutral-100 dark:divide-neutral-800` between rows |
| cursor | pointer (row click opens detail) |

### 5. Cell — Member ID column

| Property | Value |
|---|---|
| padding | 16px x / 14px y |
| font-size / weight | 14px / 500 |
| color | `primary-600` `#0f172a` / `primary-400` — **this is the one column already styled as an accent/link color today** |
| white-space | nowrap |

### 6. Cell — First/Last Name columns

| Property | Value |
|---|---|
| padding | 16px x / 14px y |
| font-size / weight | 14px / 500 |
| color | `neutral-900`/white, hover (row hover) → `primary-600`/`primary-400` |

### 7. Cell — Shakha / Email / Phone / Vibhag / Nagar (metadata columns)

| Property | Value |
|---|---|
| padding | 16px x / 14px y |
| font-size / weight | 14px / 400 |
| color | `neutral-600` `#52525b` / `neutral-400` |
| empty value | `-` in `neutral-400` |

### 8. Cell — Member Type (Age Group badge)

| Property | Value |
|---|---|
| padding | 16px x / 14px y |
| text | `text-sm font-normal`, color `neutral-900`/white |

### 9. Cell — Status (`StatusBadge`)

| Property | Value |
|---|---|
| padding (pill) | 2px y / 8px x |
| border-radius | 9999px |
| font-size | 12px |
| border | 1px, color-matched to status (success/amber/violet/neutral/error) |

### 10. Cell — Compliance badges (DBS / First Aid / Safeguarding)

| Property | Value |
|---|---|
| dot size | 6px (`w-1.5 h-1.5`), `rounded-full` |
| gap (dot ↔ label) | 6px |
| label font-size / weight | 12px / 500 |
| color | success/amber/error/neutral, matched to compliance state |

### 11. Pagination bar

| Property | Value |
|---|---|
| padding | 16px x / 12px y |
| border-top | 1px solid `neutral-200`/`neutral-800` |
| page button | 32×32px, `rounded` (4px) |

---

## Member Detail — Personal Details tab (default tab on open)

### 12. Profile header — Name row

| Property | Value |
|---|---|
| font-size | 32px (`text-[32px]`) |
| font-weight | 600 |
| color | `neutral-900`/white |
| margin-bottom (row) | 8px |
| divider next to name | 1px × 20px vertical bar, `neutral-300`/`neutral-700` |
| Member ID text | 20px, weight 500, color `neutral-400`/`neutral-500`, format `[MBR-001]` |

### 13. Profile header — badge row

| Property | Value |
|---|---|
| margin-bottom | 8px |
| gap | 8px |
| contents | Age Group badge (plain text, 14px/normal) + Status badge (pill, same spec as §9) |

### 14. Profile header — contact row (email / guardian / phone)

| Property | Value |
|---|---|
| margin-bottom | 8px |
| gap | 16px x / 4px y |
| font-size | 14px |
| color | `neutral-600`/`neutral-400`, hover (email link) → `primary-600`/`primary-400` |
| icon size | 14px (`w-3.5 h-3.5`) |
| separator | `\|` in `neutral-300`/`neutral-700` |

### 15. Profile header — location/meta row

| Property | Value |
|---|---|
| font-size | 12px (`text-xs`) |
| color | `neutral-500` |
| gap | 12px x / 4px y |
| icon size | 12px (`w-3 h-3`) |
| separator | `·` |
| contents | Country · Region (with pin icon) · Town · Activity Centre · "Registered {date}" (with clock icon) |

### 16. Action buttons (top-right of header)

| Property | Value |
|---|---|
| gap between buttons | 8px |
| button padding | 12px x / 8px y (`px-3 py-2`) |
| font-size / weight | 14px / 500 |
| border-radius | 8px |
| Edit Member | primary-filled (`PrimaryButton`) |
| Deactivate/Reactivate | bordered, `neutral-300`/`neutral-700` (deactivate) or success-tinted (reactivate) |
| Delete | bordered `#ffaaab`, text `#9a0c17`, bg `#fff0f0` |

### 17. Tab bar

| Property | Value |
|---|---|
| wrapper border-bottom | 1px solid `neutral-200`/`neutral-800` |
| tab padding | 20px x / 12px y (`px-5 py-3`) |
| font-size | 14px |
| selected | `font-semibold`, `border-b-2` in `primary-600`/`primary-400`, text `neutral-900`/white |
| unselected | normal weight, `border-transparent`, text `neutral-600`/`neutral-400` |
| badge (e.g. pending count) | 16×16px circle, `bg-[#BC0F1C]`, white text, 9px font, `font-bold` |

### 18. Content card (`InfoSection`)

| Property | Value |
|---|---|
| border | 1px solid `neutral-200`/`neutral-800` |
| border-radius | 8px |
| **top border accent** | **3px solid `#172E4D`** (brand navy — this is the app's current signature accent, distinct from a plain hairline card) |
| header padding | 20px x / 16px y (`px-5 py-4`) |
| header border-bottom | 1px solid `neutral-100`/`neutral-800` |
| header title font-size / weight | 19px / 700 (`text-[19px] font-bold`) |
| body padding | 24px x / 24px bottom / 16px top (`px-6 pb-6 pt-4`) |
| body grid gap | 24px (`gap-6`), 2 columns (or 4 on wide `cols=4` sections) |

### 19. Info field (label + value, inside a card)

| Property | Value |
|---|---|
| label margin-bottom | 6px |
| label font-size | 12px, color `neutral-500`/`neutral-400` |
| required-asterisk color | `error-600` |
| value font-size / weight | 14px / 500 |
| value color | `neutral-900`/white |

### 20. Stat mini-tile (Karyakrams/Shakhas attended, Other Information tab)

| Property | Value |
|---|---|
| padding | 16px |
| gap (icon ↔ text) | 16px |
| border | 1px solid `neutral-100`/`neutral-800` |
| border-radius | 8px |
| background | `neutral-50`/`neutral-900` at 50% |
| icon box | 40×40px, `rounded-lg`, bg `primary-50`/`primary-950` |
| value font-size / weight | 20px / 700 |
| label font-size | 12px, `neutral-500`/`neutral-400` |
