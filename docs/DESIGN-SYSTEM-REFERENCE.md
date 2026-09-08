# MyHSS MMS — UI Style Reference (Spacing & Typography)

**Source of truth: this document is extracted from the ACTUAL implemented Tailwind classes in the codebase** (not an aspirational spec). It covers the shared UI primitives (`src/app/components/ui/*`), this app's composed components (`src/app/components/hb/common/*`, `src/app/components/hb/listing/*`), and the de-facto patterns hand-rolled directly in real screens where no shared component exists. Every value below is a real class pulled from the code and resolved to px/rem/hex using Tailwind's default scale plus this project's custom tokens in `src/styles/globals.css`.

Where the same "component" is implemented two or three different ways across the app (which happens — see the **Known Inconsistencies** section), all variants are listed with their source file so the dev team can pick one canonical version and consolidate.

Last generated: 2026-09-04. Regenerate by re-reading the component files below if the code changes.

---

## 0. Global Tokens

### 0.1 Font Families

| Token | Stack | Used by |
|---|---|---|
| Body (default) | `"Open Sauce One", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | `<body>` and everything that inherits from it — i.e. every component below (buttons, inputs, table cells, badges, menus) unless it's a literal heading tag |
| Heading (`h1`–`h6` only) | `"TT Ramillas", "Open Sauce One", "Inter", sans-serif` | Only real `<h1>`–`<h6>` elements. Most "titles" in this app (modal titles, card titles, PageHeader title) are `<div>`/`<h3>`/`<h4>` with explicit Tailwind classes, not styled headings — check the component before assuming TT Ramillas applies |
| Code/mono | `"JetBrains Mono", "Fira Code", "Courier New", monospace` | `<code>` tags, ID chips (e.g. `page.id` in Static Pages cards use `font-mono`) |

### 0.2 Base Type Scale (`globals.css`)

| Element | Font size | Line height | Weight | Letter spacing | Font family |
|---|---|---|---|---|---|
| `html` | 16px root | — | — | — | — |
| `body` | 14px (0.875rem) | default | 400 | normal | Body stack |
| `h1` | 32px | 40px | 700 | -0.02em | Heading stack |
| `h2` | 24px | 32px | 600 | -0.01em | Heading stack |
| `h3` | 18px | 26px | 600 | normal | Heading stack |
| `h4` | 16px | 24px | 600 | normal | Heading stack |
| `h5` | 14px | 20px | 600 | normal | Heading stack |
| `h6` | 12px | 18px | 600 | normal | Heading stack |
| `p` | 14px | 22px | 400 | normal | Body stack |
| `.text-lead` | 16px | 24px | 400 | normal | color `#525252` (dark `#a3a3a3`) |
| `.text-large` | 16px | 24px | 500 | normal | Body stack |
| `.text-small` | 12px | 18px | 400 | normal | Body stack |
| `.text-muted` | 14px | 20px | 400 | normal | color `#a3a3a3` (dark `#737373`) |
| `code` | 13px | — | — | — | Mono stack, padding `2px 6px` |

### 0.3 Tailwind Utility → px Conversion (default scale, no custom override found)

| Class suffix | px | Class suffix | px |
|---|---|---|---|
| `0.5` | 2px | `6` | 24px |
| `1` | 4px | `7` | 28px |
| `1.5` | 6px | `8` | 32px |
| `2` | 8px | `9` | 36px |
| `2.5` | 10px | `10` | 40px |
| `3` | 12px | `11` | 44px |
| `3.5` | 14px | `12` | 48px |
| `4` | 16px | `16` | 64px |
| `5` | 20px | — | — |

| Text class | Font size | Default line height |
|---|---|---|
| `text-[10px]` | 10px | — |
| `text-xs` | 12px | 16px |
| `text-sm` | 14px | 20px |
| `text-base` | 16px | 24px |
| `text-lg` | 18px | 28px |
| `text-xl` | 20px | 28px |
| `text-2xl` | 24px | 32px |
| `text-3xl` | 30px | 36px |

| Radius class | px | Weight class | Value |
|---|---|---|---|
| `rounded` | 4px | `font-normal` | 400 |
| `rounded-md` | 6px | `font-medium` | 500 |
| `rounded-lg` | 8px | `font-semibold` | 600 |
| `rounded-xl` | 12px | `font-bold` | 700 |
| `rounded-2xl` | 16px | — | — |
| `rounded-full` | 9999px | — | — |

### 0.4 Color Tokens (light mode hex / dark mode hex)

| Token | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| **primary** (light) | `#f8fafc` | `#f1f5f9` | `#e2e8f0` | `#cbd5e1` | `#94a3b8` | `#1e293b` | `#0f172a` | `#020617` | `#000` | `#000` |
| **primary** (dark) | `#020617` | `#0f172a` | `#1e293b` | `#334155` | `#475569` | `#334155` | `#475569` | `#cbd5e1` | `#e2e8f0` | `#f1f5f9` |
| **neutral** (Zinc) | `#fafafa` | `#f4f4f5` | `#e4e4e7` | `#d4d4d8` | `#a1a1aa` | `#71717a` | `#52525b` | `#3f3f46` | `#27272a` | `#18181b` |
| **success** (Sewa Green) | `#f1fced` | `#ddf7d2` | `#b8efa0` | `#86e063` | `#65c44a` | `#4EAE33` | `#3d8928` | `#2f6b1e` | `#225016` | `#17360e` |
| **warning** (Amber) | `#fffbeb` | `#fef3c7` | `#fde68a` | `#fcd34d` | `#fbbf24` | `#f59e0b` | `#d97706` | `#b45309` | `#92400e` | `#78350f` |
| **error** (Dharma Red) | `#fff0f0` | `#ffd9d9` | `#ffaaab` | `#ff7075` | `#e8313a` | `#BC0F1C` | `#9a0c17` | `#790913` | `#58070e` | `#3a0409` |
| **info** (Bal Blue) | `#e6f6fd` | `#c0e9fa` | `#89d5f6` | `#45bdf0` | `#1dade9` | `#009FE3` | `#0080b8` | `#006390` | `#004a6b` | `#003148` |

`neutral` is symmetric (same scale used for both modes, dark mode just flips which end is "light"). `primary`, `success`, `warning`, `error`, `info` invert 50↔950 in dark mode — see `globals.css` lines 179–279 for the dark override block if a shade past 900 is needed.

---

## Known Inconsistencies (flag for dev team before treating anything below as "the" canonical answer)

These are real, currently-shipping divergences found across files — not proposals, observations:

1. **Table wrapper border-radius**: `rounded-lg` (MemberManagement, EmailTemplates) vs `rounded-xl` (Sessions). Table wrapper shadow: `shadow-sm` present in Member/EmailTemplates, absent in Sessions.
2. **Table cell padding**: `px-4 py-3.5` (MemberManagement, GuruPujaReport) vs `px-6 py-3.5` (EmailTemplates) vs `px-4 py-3` (Sessions).
3. **Status pill**: base shape `px-2 py-0.5 rounded-full border text-xs` is universal, but MemberManagement's `StatusBadge` omits `font-medium` that Sessions/GuruPujaReport both include. `whitespace-nowrap` present in Member/GuruPujaReport, absent in Sessions.
4. **Modal overlay tint**: `bg-black/40` (PendingApprovals, MemberManagement) vs `bg-black/50 backdrop-blur-sm` vs `bg-black/88 backdrop-blur-sm` (both used within EventDetail.tsx itself, inconsistently, for different modals in the same file).
5. **Modal panel**: EventDetail's confirm dialogs use `rounded-2xl shadow-2xl max-w-sm` with no panel-level padding; PendingApprovals/MemberManagement confirm dialogs use `rounded-xl shadow-xl max-w-md p-6`. Title tag/size also differs (`h4 text-base font-bold` vs `h3 text-[18px] font-semibold`).
6. **Confirmation footer alignment**: EventDetail centers buttons (`justify-center gap-2`), PendingApprovals/MemberManagement right-align (`justify-end gap-3`).
7. **`ui/dialog.tsx` (shadcn Dialog) is not used anywhere in a real screen.** The real modal is either `FormModal` (`hb/common/Form.tsx`, 13 files) or a hand-rolled `fixed inset-0 z-50 ... bg-black/*` overlay (14 files). Recommend picking one and deprecating the other, or at minimum standardizing the overlay tint and panel radius.
8. **`ui/tooltip.tsx` (Radix Tooltip) is not used in any real screen** — only in the `UIKit.tsx` showcase and internally in `ui/sidebar.tsx`/`ui/chart.tsx`. Every real tooltip in the app is a native `title="..."` attribute passed through `IconButton`.
9. **Empty-state icon size**: `w-6 h-6` inside a circled `w-12 h-12` badge (MemberManagement) vs a plain uncircled `w-10 h-10` (Sessions).
10. **Two dropdown-menu implementations coexist**: `ui/dropdown-menu.tsx` (Radix, shadcn-style) and `hb/listing/FlyoutMenu.tsx` (hand-rolled, this app's actual dominant pattern — used by StatusFilter, ViewModeSwitcher, PageHeader's More menu). `IconButton`'s own built-in action-menu is a *third*, separately hand-rolled portal menu, not built on either.
11. **Custom Select exists in two places**: `ui/select.tsx` (Radix-based) and `hb/common/Select.tsx` (plain native `<select>`). `Form.tsx`'s `FormSelect` wraps the native element too. All three coexist.

---

## 1. Button

### 1a. `PrimaryButton` (`hb/listing/PrimaryButton.tsx`) — real, most-used

```
px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-btn-text
rounded-lg transition-colors flex items-center justify-center gap-2
disabled:opacity-50 disabled:cursor-not-allowed
```

**Spacing**
| Property | Value |
|---|---|
| padding-top / bottom | 8px (`py-2`) |
| padding-left / right | 16px (`px-4`) |
| margin | none set (caller-controlled) |
| gap | 8px (`gap-2`, between icon and label) |
| icon size | `w-4 h-4` = 16×16px |

**Typography**
| Property | Value |
|---|---|
| font-family | Body stack |
| font-size | inherited (14px, no `text-*` class set — relies on body default) |
| font-weight | 400 (no weight class set) |
| line-height | default |
| letter-spacing | normal |
| color | `#ffffff` (`text-btn-text`) |
| text-align | center (via flex `justify-center`) |
| border-radius | 8px (`rounded-lg`) |
| background | `primary-600` `#0f172a` → hover `primary-700` `#020617` → active `primary-800` `#000000` |

### 1b. `SecondaryButton` (`hb/listing/SecondaryButton.tsx`)

```
px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300
hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors
flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
```
Same spacing/type as PrimaryButton (`px-4 py-2`, `gap-2`, `rounded-lg`) except: background transparent/white, border `1px solid neutral-300` `#d4d4d8` (dark: `neutral-700` `#3f3f46`), text color `neutral-700` `#3f3f46` (dark: `neutral-300` `#d4d4d8`), hover background `neutral-50` `#fafafa` (dark: `neutral-900` `#18181b`).

### 1c. `ui/button.tsx` (shadcn primitive — used by `UIKit.tsx` showcase and a handful of screens, not the dominant real button)

| Size | Height | Padding | Border radius |
|---|---|---|---|
| `default` | 36px (`h-9`) | `px-4 py-2` = 16px / 8px | 6px (`rounded-md`) |
| `sm` | 32px (`h-8`) | `px-3` = 12px | 6px |
| `lg` | 40px (`h-10`) | `px-6` = 24px | 6px |
| `icon` | 36×36px (`size-9`) | — | 6px |

Variants (color only, spacing identical across all): `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.

### 1d. `IconButton` (icon-only button, `hb/listing/IconButton.tsx`)

| Variant | Size | Border | Radius |
|---|---|---|---|
| default | 40×40px (`w-10 h-10`) | `1px solid neutral-200` (dark `neutral-800`) | `rounded-lg` (8px) |
| active/menu-open | 40×40px | `1px solid primary-500` | `rounded-lg` |
| `borderless` | 28×28px (`w-7 h-7`) | none | `rounded` (4px) |

Icon size: `w-5 h-5` (20px) default, `w-4 h-4` (16px) when `borderless`.

---

## 2. Input

### `ui/input.tsx` (base primitive, used directly and wrapped by `FormInput`)

```
h-9 border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-base rounded-md
focus-visible:border-primary-500
```

**Spacing**
| Property | Value |
|---|---|
| height | 36px (`h-9`) |
| padding-top / bottom | 4px (`py-1`) |
| padding-left / right | 12px (`px-3`) |
| border | 1px solid `neutral-200` `#e4e4e7` (dark `neutral-800` `#27272a`) |
| border-radius | 6px (`rounded-md`) |

**Typography**
| Property | Value |
|---|---|
| font-size | 16px (`text-base`) |
| font-family | Body stack |
| font-weight | 400 |
| color | inherited (default text color) |
| placeholder color | `neutral-400`/`neutral-600` typically (per usage) |

### `FormInput` (`hb/common/Form.tsx`) — real form-modal variant

```
h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg
```
(merged onto base Input via `cn()`) — height bumped to 40px (`h-10`), radius bumped to `rounded-lg` (8px), explicit background added. Date-type inputs add `pr-10` (40px right padding) to make room for a calendar icon (`w-4 h-4`, `neutral-400`) absolutely positioned at `right-3 top-1/2`.

---

## 3. Select

### `hb/common/Select.tsx` (native `<select>`, real custom component)

```
appearance-none w-full h-9 rounded-lg px-3 py-1 pr-9 text-sm
bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700
text-neutral-900 dark:text-neutral-100
focus:outline-none focus:border-primary-500 dark:focus:border-primary-600
focus:shadow-lg focus:shadow-primary-500/10 dark:focus:shadow-primary-600/20
disabled:opacity-50 disabled:cursor-not-allowed
```
Error state adds: `border-error-500 dark:border-error-600`.

**Spacing**: height 36px (`h-9`), `px-3` (12px) left / `pr-9` (36px) right (room for chevron), `py-1` (4px), border-radius 8px (`rounded-lg`). Chevron icon `w-4 h-4` positioned `right-3 top-1/2`.

**Typography**: `text-sm` = 14px/20px, color `neutral-900` `#18181b` (dark `neutral-100` `#f4f4f5`).

### `ui/select.tsx` (Radix primitive)

| Element | Spacing | Typography |
|---|---|---|
| `SelectTrigger` | height 36px default / 32px compact (data-size) | — |
| `SelectContent` | `rounded-lg`, `shadow-md` | bg white / `neutral-950` dark |
| `SelectItem` | `py-2.5 pr-8 pl-4` = 10px top/bottom, 32px right, 16px left | `focus:bg-primary-50` |

### `FormSelect` (`hb/common/Form.tsx`) — form-modal variant

Height 40px (`h-10`), `px-3 py-2 pr-10`, `rounded-lg`, `text-sm`, chevron `w-4 h-4` at `right-3`.

---

## 4. Search (`SearchBar`, `hb/listing/SearchBar.tsx`)

**Collapsed state** (icon button): `w-10 h-10` (40×40px), `rounded-lg`, border `neutral-200`/`neutral-800`.

**Expanded state**
```
flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-950
border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm min-w-[320px]
```

| Property | Value |
|---|---|
| padding-top / bottom | 8px (`py-2`) |
| padding-left / right | 16px (`px-4`) |
| gap | 8px (`gap-2`, icon ↔ input ↔ filter icon ↔ close icon) |
| min-width | 320px |
| border-radius | 8px |
| leading search icon | `w-4 h-4`, `neutral-400`/`neutral-600` |

**Typography (input text)**: `text-sm` (14px/20px), color `neutral-900` (dark `white`), placeholder `neutral-400` (dark `neutral-600`).

Active-filter-count badge (small red/primary dot on the filter icon): `w-4 h-4`, `text-[10px] font-medium`, `rounded-full`, background `primary-600`, text white.

---

## 5. Filter

Three real filter surfaces share the same panel shell: `FilterPopup.tsx`, `AdvancedSearchPanel.tsx` (byte-identical panel classes), `DateRangeFilter.tsx` (own but analogous), `StatusFilter.tsx` (uses `FlyoutMenu` instead of its own panel).

### 5a. `FilterPopup` / `AdvancedSearchPanel` panel shell

```
absolute top-full right-0 mt-2 w-[480px] bg-white dark:bg-neutral-950
border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-40
```

| Section | Spacing | Typography |
|---|---|---|
| Header row | `px-4 py-3` (16px/12px), border-bottom | title: `text-sm font-semibold` (14px/600), color `neutral-900`/white |
| Content | `p-4` (16px all sides), `max-h-[500px] overflow-y-auto` | — |
| Filter row | `flex items-start gap-2` (8px gap) | — |
| Field/value dropdown trigger | height 32px (`h-8`), `px-3` | `text-sm`, color `neutral-900`/white |
| Dropdown option row | `px-3 py-1.5` (12px/6px) | `text-sm` |
| Checkbox row (values list) | `px-3 py-1.5`, `gap-2` | `text-sm` |
| Remove-filter button | `w-6 h-6` (24px) | icon default lucide size |
| Footer | `px-4 py-3` (16px/12px), border-top, bg `neutral-50`/`neutral-900/50` | — |
| Clear/Cancel button | height 32px (`h-8`), `px-3` | `text-xs` (12px), color `neutral-600`/`neutral-400` |
| Apply button | height 32px (`h-8`), `px-4` | `text-xs font-medium`, white on `primary-600` |

AdvancedSearchPanel adds an AND/OR connector row: `py-2` vertical padding, pill toggle `rounded-full`, buttons `px-2.5 py-1`, text `text-[11px] font-medium`.

### 5b. `DateRangeFilter` panel

```
absolute right-0 top-full mt-2 w-[320px] bg-white dark:bg-neutral-950
border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-40
```
Header/footer: `p-4` (16px all sides). Preset grid: `grid grid-cols-2 gap-2` (8px gap). Preset chip: `px-3 py-2` (12px/8px), `text-sm`, `rounded-lg`. Date `<input>`: `px-3 py-2`, `text-sm`, `rounded-lg`, `focus:ring-2 focus:ring-primary-500`.

### 5c. `StatusFilter` trigger

`w-10 h-10` icon button (same shell as `IconButton`), active-filter dot badge `w-3 h-3` bottom/top-right offset `-top-1 -right-1`, `border-2 border-white` (dark `neutral-950`). Menu itself renders through `FlyoutMenu` (§9).

---

## 6. Table / TableHeader / TableRow / TableCell

Two implementations exist: the shadcn primitive (`ui/table.tsx`, used mainly in the UIKit showcase) and the real hand-rolled table used in every actual listing screen (MemberManagement, Sessions, EmailTemplates, GuruPujaReport). **The hand-rolled version is what matters for dev parity** — see Known Inconsistencies #1–#2 for where it isn't even self-consistent across files.

### 6a. `ui/table.tsx` primitive

| Element | Classes | Notes |
|---|---|---|
| `Table` | `w-full caption-bottom text-sm` | 14px/20px |
| `TableHeader` | `[&_tr]:border-b` | — |
| `TableRow` | `hover:bg-muted/50 border-b` | — |
| `TableHead` | `h-10 px-2 font-medium` | 40px height, 8px horizontal padding |
| `TableCell` | `p-2 align-middle` | 8px all sides |
| `TableBody` | `[&_tr:last-child]:border-0` | — |

### 6b. Real hand-rolled table (recommended reference — most files agree closely)

**Wrapper** (recommend: MemberManagement/EmailTemplates version):
```
bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm
```
Inner scroll container: `sticky-table-scroll slim-scroll` (custom utility classes, defined elsewhere in the project's CSS).

**`<table>`**: `w-full min-w-max text-left border-collapse` (Sessions swaps `text-left`→`text-sm`).

**`<thead><tr>`**: `border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900`

**`<th>` (TableHeader cell)**
| Property | Value |
|---|---|
| padding-top / bottom | 12px (`py-3`) |
| padding-left / right | 16px (`px-4`) |
| background | `neutral-50` `#fafafa` (dark `neutral-900` `#18181b`) |
| border-bottom | 1px solid `neutral-200`/`neutral-800` |
| font-size | 12px (`text-xs`) |
| font-weight | 600 (`font-semibold`) |
| color | `neutral-700` `#3f3f46` (dark `neutral-300` `#d4d4d8`) |
| cursor (sortable) | pointer, `select-none` |
| white-space | nowrap |

**`<tbody>`**: `divide-y divide-neutral-100 dark:divide-neutral-800` (1px dividers between rows).

**`<tr>` (TableRow, hover)**: `hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer`.

**`<td>` (TableCell)**
| Property | Value (MemberManagement/GuruPujaReport) | Value (EmailTemplates) | Value (Sessions) |
|---|---|---|---|
| padding-top / bottom | 14px (`py-3.5`) | 14px (`py-3.5`) | 12px (`py-3`) |
| padding-left / right | 16px (`px-4`) | 24px (`px-6`, except `px-4` on checkbox col) | 16px (`px-4`) |

Text color by role: primary/name column `text-neutral-900 dark:text-white font-medium`; secondary/metadata columns `text-neutral-600 dark:text-neutral-400 whitespace-nowrap`. Base size `text-sm` unless noted (Sessions header row exception above).

---

## 7. Checkbox

### `ui/checkbox.tsx` (Radix primitive)

`size-4` (16×16px), `rounded-[4px]`, checked state `bg-[var(--color-theme-accent)]` (`#111827`).

### Hand-rolled checkbox (real, used in filter value-lists and column-visibility panels)

`FilterPopup` values list: `w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500 focus:ring-offset-0` — 16×16px, standard radius.

`ColumnVisibilityPanel` (custom appearance-none checkbox): `w-5 h-5` (20×20px), `rounded-md`, `border-2 border-neutral-300 dark:border-neutral-700`, checked → `border-primary-600 bg-primary-600` (dark: `primary-500`), with a `w-3.5 h-3.5` white check icon overlay.

Table row-select checkboxes (MemberManagement): `w-4 h-4 rounded border-neutral-300 ...` — matches the 16px filter-panel size, not the 20px column-panel size (a third minor inconsistency, low-impact).

---

## 8. Badge

### 8a. `ui/badge.tsx` (shadcn primitive, 10 variants incl. `status-dot`, `success`, `warning`, `error`, `info`, `neutral`)

Shape: `rounded-full`, background `{color}-100` (dark `{color}-950`), text `{color}-700` (dark `{color}-400`). No explicit padding scale given in the base — variants set their own.

### 8b. Real status pill (dominant pattern across all real screens — Members, Sessions, GuruPujaReport)

```
inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap
```

| Property | Value |
|---|---|
| padding-top / bottom | 2px (`py-0.5`) |
| padding-left / right | 8px (`px-2`) |
| border-radius | 9999px (`rounded-full`) |
| border | 1px solid, color-matched (e.g. `success-200`/`error-200`) |
| font-size | 12px (`text-xs`) |
| font-weight | 500 (`font-medium`) — **note: MemberManagement's own `StatusBadge` omits this, see Known Inconsistencies #3** |
| background/text | e.g. success: bg `success-50` text `success-700` (dark bg `success-950/20` text `success-400`) |

### 8c. `ComplianceBadge` (MemberManagement — dot style, distinct pattern)

`inline-flex items-center gap-1.5` (6px gap) + a `w-1.5 h-1.5` (6px) colored `rounded-full` dot + `text-xs font-medium` label. No border, no pill background — used specifically for compliance status, not record status.

---

## 9. DropdownMenu

The real dominant dropdown is **`FlyoutMenu`** (`hb/listing/FlyoutMenu.tsx`), not the Radix `ui/dropdown-menu.tsx` primitive. Used by `StatusFilter`, `ViewModeSwitcher`, `PageHeader`'s More-options menu.

### 9a. `FlyoutMenu` panel

```
absolute top-full mt-2 {right-0|left-0} {width} bg-white dark:bg-neutral-950
border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-20
```

**`FlyoutMenuItem`**
| Property | Value |
|---|---|
| padding-top / bottom | 10px (`py-2.5`) |
| padding-left / right | 16px (`px-4`) |
| gap (icon ↔ label) | 8px (`gap-2`) |
| font-size | 14px (`text-sm`) |
| color | `neutral-700` (dark `neutral-300`), hover → `primary-900`/`primary-100` on `primary-50`/`primary-950/50` bg |
| first item | `rounded-t-lg` |
| last item | `rounded-b-lg` |

**`FlyoutMenuDivider`**: `border-t border-neutral-200 dark:border-neutral-800 my-1` (4px vertical margin).

**`NestedFlyout`** (submenu): `absolute left-full top-0 ml-1 {width} ... rounded-lg shadow-xl z-30` — same visual language, offset 4px (`ml-1`) to the right of parent.

### 9b. `ui/dropdown-menu.tsx` (Radix primitive — used less)

`Content`: `rounded-lg shadow-lg p-1` (4px padding). `Item`: `px-3 py-2 text-sm rounded-md` (12px/8px). `Label`: `px-2 py-1.5 text-sm font-medium` (8px/6px).

### 9c. `PageHeader`'s hand-rolled hover-submenus (Export/Sort/Customize Columns)

A *third* pattern, not built on FlyoutMenu: `absolute left-full top-0 ml-1 w-48 (or w-56) ... rounded-lg shadow-lg py-1 (or py-1.5) z-50`, shown via `group-hover` opacity/visibility transition instead of click-state. Item row: `px-4 py-2.5 text-sm ... flex items-center gap-2`.

---

## 10. ActionMenu

`IconButton`'s built-in menu (`menuItems` prop) is the real "ActionMenu" pattern — a portal-rendered dropdown, separate from both FlyoutMenu and `ui/dropdown-menu.tsx`.

```
fixed z-[999] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800
rounded-lg shadow-lg py-1
```

| Property | Value |
|---|---|
| padding (panel) | 4px top/bottom (`py-1`), positioned via `fixed` + computed coordinates (portal) |
| menu item | `w-full px-3 py-2 text-left text-xs flex items-center gap-2` — 12px/8px padding, 8px gap |
| menu item icon | `w-3.5 h-3.5` (14px) |
| divider | `border-t border-neutral-200 dark:border-neutral-800 my-1` |
| item color | `neutral-700`/`neutral-300`, hover `primary-900`/`primary-100` on `primary-50`/`primary-950/50` |

Note: item font-size here is `text-xs` (12px) — smaller than FlyoutMenu's `text-sm` (14px). Same visual family, different scale; worth aligning.

---

## 11. Pagination

### 11a. `hb/listing/Pagination.tsx` (real, used on every listing screen)

```
flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800
bg-white dark:bg-neutral-950 px-4 py-3 mt-6
```

| Property | Value |
|---|---|
| padding-top / bottom | 12px (`py-3`) |
| padding-left / right | 16px (`px-4`) |
| margin-top | 24px (`mt-6`, separates from table) |
| summary/rows-label text | `text-sm`, color `neutral-600`/`neutral-400` |
| rows-per-page select | `text-sm`, `px-2 py-1` (8px/4px), `rounded` (4px) |
| prev/next button | `w-8 h-8` (32×32px), `rounded` (4px), border `neutral-300`/`neutral-700` |
| page-number button (active) | `w-8 h-8`, `bg-primary-600 text-white` |
| page-number button (inactive) | `w-8 h-8`, bordered, `neutral-700`/`neutral-300` |
| ellipsis | `px-2`, color `neutral-600`/`neutral-400` |

### 11b. `ui/pagination.tsx` (shadcn primitive, `buttonVariants`-based)

`PaginationLink`: `ghost` (inactive) / `outline` (active) variant, default `size=icon` (36×36px, `size-9`). Previous/Next add `gap-1 px-2.5` (4px gap, 10px horizontal padding). Ellipsis: `flex size-9` (36×36px).

---

## 12. Modal

**Real dominant pattern is `FormModal`** (`hb/common/Form.tsx`) — used in 13 files for form-entry modals. A hand-rolled `fixed inset-0 z-50 ... bg-black/*` overlay is used independently in 14 files for detail/confirmation modals (some files use both). `ui/dialog.tsx` (Radix) is not used in any real screen — see Known Inconsistency #7.

### `FormModal`

**Overlay**: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50` — 16px padding on all sides so panel never touches viewport edge.

**Panel**
```
bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800
rounded-lg shadow-xl w-full flex flex-col max-h-[90vh] max-w-2xl (default, overridable)
```

| Section | Spacing | Typography |
|---|---|---|
| Header row | `px-5 py-3` (20px/12px), border-bottom | title `text-[18px] font-semibold`, color `neutral-900`/white |
| Description (under title) | `mt-0.5` (2px) | `text-xs` (12px), color `neutral-500`/`neutral-400` |
| Close button | `w-7 h-7` (28px) | icon default |
| Body | `p-5` (20px all sides), `overflow-y-auto flex-1 min-h-0` | — |
| Footer (`FormFooter`) | `pt-4 mt-4` (16px), border-top, `gap-2` (8px) between buttons, stacks on mobile (`flex-col-reverse sm:flex-row`) | — |

---

## 13. Dialog

`ui/dialog.tsx` (Radix/shadcn primitive) — present in the codebase but **not used by any real screen** (only referenced inside a documentation code-string in `UIKit.tsx`). Kept here for completeness in case the team decides to adopt it going forward.

| Element | Spacing | Typography |
|---|---|---|
| Content | `max-w-[calc(100%-2rem)] sm:max-w-lg`, `rounded-lg`, `p-6` (24px), `gap-4` (16px between header/body/footer) | — |
| Header | `flex flex-col gap-2` (8px) | — |
| Title | — | `text-lg` (18px), `leading-none`, `font-semibold` |
| Description | — | `text-sm`, `text-muted-foreground` |
| Footer | `flex-col-reverse sm:flex-row`, `gap-2` (8px) | — |

`ui/alert-dialog.tsx` mirrors this exactly (same Content/Header/Footer classes); its Title lacks `leading-none`.

---

## 14. Drawer

`ui/drawer.tsx` (Vaul-based, Radix-style).

| Element | Spacing | Typography |
|---|---|---|
| Content | direction-dependent (top/bottom/left/right slide-in classes) | — |
| Header | `p-4` (16px), `gap-1.5` (6px) | — |
| Title | — | `font-semibold` |
| Footer | `mt-auto p-4` (16px), `gap-2` (8px) | — |

---

## 15. Form controls (`hb/common/Form.tsx`)

| Element | Spacing | Typography |
|---|---|---|
| `FormLabel` | `mb-1.5` (6px below label) | `text-xs` (12px), color `neutral-700`/`neutral-300`; required asterisk `text-red-500` |
| `ErrorText` | `mt-1` (4px above) | `text-xs` (12px), color `#BC0F1C` (error-500) |
| `FormGrid` | `gap-3.5` (14px) between fields; column count via `grid-cols-1` / `md:grid-cols-2` / `-3` / `-4` | — |
| `FormFooter` | `gap-2` (8px), `pt-4 mt-4` (16px), border-top | — |
| `FormField` | `space-y-0` (no default vertical spacing — spacing comes from `FormGrid`'s `gap`) | — |
| `FormInput` | see §2 | — |
| `FormSelect` | see §3 | — |
| `FormTextarea` | `min-h-[80px]`, `p-3` (12px all sides) | `text-sm`, color `neutral-900`/white, placeholder `neutral-400` |
| `FormCard` (container) | `p-6` (24px all sides) | `rounded-lg`, bordered |
| `FormSection` | `space-y-4` (16px between children) | — |

---

## 16. Tooltip

**Real pattern: native `title="..."` attribute**, passed through `IconButton`'s `title` prop directly to the underlying `<button title={title}>`. No styled tooltip component involved. Usage counts confirm this is the norm: MemberManagement (12×), EventDetail (14×), PendingApprovals (8×), GuruPujaReport (5×), Sessions (4×) — all native `title=`.

`ui/tooltip.tsx` (Radix) exists and is styled (`rounded-md px-3 py-1.5 text-xs`, `bg-primary text-primary-foreground`) but is only wired up in the `UIKit.tsx` showcase page and two internal `ui/` primitives (sidebar collapse hint, chart legend) — **not available anywhere a real user would see it**.

If the team wants real, styled (non-native) tooltips app-wide, that's new work, not a documentation gap.

---

## 17. Icons

All icons are `lucide-react`. Sizing is contextual, not a single fixed token — here's the real de-facto scale observed across screens:

| Size class | px | Used for |
|---|---|---|
| `w-3 h-3` | 12px | Sort-arrow indicators in table headers, tiny inline "×" clear icons, small inline badge icons |
| `w-3.5 h-3.5` | 14px | **Most common** — inline icon-with-text in table cells (Mail, MapPin, Clock, ShieldCheck), icons inside small pill/action buttons (Approve/Reject `CheckCircle`/`Ban`), `ActionMenu` item icons |
| `w-4 h-4` | 16px | Standalone/filter-row icons, checkbox inputs, `PrimaryButton`/`SecondaryButton` icons, `IconButton` default icon size, `FlyoutMenuItem` icons |
| `w-5 h-5` | 20px | `IconButton`/`SearchBar` collapsed-state icon, modal header icon inside a `w-10 h-10` circle badge |
| `w-6 h-6` | 24px | Empty-state icon inside a circled `w-12 h-12` badge (MemberManagement) |
| `w-7 h-7` | 28px | Modal header icon inside a larger `w-12 h-12` circle (EventDetail refund modal) |
| `w-10 h-10` | 40px | Plain (uncircled) empty-state icon (Sessions — inconsistent with #6, see Known Inconsistencies #9) |

---

## 18. Confirmation dialog

Two structurally different real implementations — see Known Inconsistencies #4–#6 for the exact divergence. Both are documented here since both currently ship.

### 18a. EventDetail-style (e.g. "Trigger Refund")

**Overlay**: `fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4` (some sibling modals in the same file use `bg-black/88` instead).

**Panel**: `relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800` (24px max width `max-w-sm` = 384px; radius 16px).

**Icon badge**: circle `w-12 h-12` (48px) containing `w-7 h-7` icon (e.g. amber `Undo2`).

**Title**: `<h4 className="text-base font-bold text-neutral-900 dark:text-white">` — 16px/700.

**Body**: `<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">` — 14px/20px, 8px top margin.

**Footer**: `flex items-center justify-center gap-2 px-6 py-5` — centered buttons, 8px gap, 24px/20px padding.

### 18b. PendingApprovals-style (`ApproveConfirmModal` / `RejectReasonModal`, also used by MemberManagement's `StatusConfirmModal`/`DeleteConfirmModal`)

**Overlay**: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40`.

**Panel**: `bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-md p-6` — 448px max width, 12px radius, 24px padding directly on the panel (no separate header/body/footer padding zones).

**Icon badge**: circle `w-12 h-12` containing `w-5 h-5` icon (smaller icon than 18a's `w-7 h-7`, same badge size).

**Title**: `<h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white mb-1">` — 18px/600, 4px bottom margin.

**Body**: `<p className="text-sm text-neutral-600 dark:text-neutral-400">` — 14px/20px, no top margin (relies on parent spacing) — plus a secondary line `<p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">Member: ...</p>` for the entity being acted on.

**Footer**: `flex justify-end gap-3` (right-aligned, 12px gap; MemberManagement's version adds `mt-4`).

### 18c. Approve/Reject inline buttons (the actual action triggers, literal hex — reused verbatim across `PendingApprovals.tsx` and `PendingGuardianApprovals.tsx`)

**Approve**
```
inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
bg-[#f1fced] text-[#3d8928] border border-[#b8efa0] hover:bg-[#e2fad1] transition-colors
```
(= `success-50` bg / `success-600` text / `success-200` border, but written as literal hex rather than the token — worth swapping to `bg-success-50 text-success-600 border-success-200` for consistency with the token system.)

**Reject**
```
inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
bg-[#fff0f0] text-[#9a0c17] border border-[#ffaaab] hover:bg-[#ffe0e0] transition-colors
```
(= `error-50` bg / `error-600` text / `error-200` border.)

Both: padding `px-3 py-1.5` (12px/6px), gap `1.5` (6px), radius `rounded-lg` (8px), `text-xs font-medium` (12px/500).

Icon color inside the modal's icon badge (18b) is a *slightly different* shade than the inline button text — badge icon uses `text-[#4EAE33]` (success-500) / `text-[#BC0F1C]` (error-500), while the inline button text uses `text-[#3d8928]` (success-600) / `text-[#9a0c17]` (error-600). Minor, worth normalizing to one shade per color.

---

## How to keep this in sync

This file is generated by reading the actual component source, not maintained by hand-editing rules. If a component changes, re-extract from:
- `src/app/components/ui/*.tsx` (shared primitives)
- `src/app/components/hb/common/*.tsx`, `src/app/components/hb/listing/*.tsx` (this app's composed components)
- `src/styles/globals.css` (tokens)
- Real screen files for anything without a shared component (tables, status pills, confirmation dialogs)
