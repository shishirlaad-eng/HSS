# HSS Membership Management — Complete Design Reference

> **Single source of truth.** Paste this file into any new session before starting a feature.  
> Last updated: 2026-05-26

---

## 1. Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + TypeScript (`strict: false`) |
| Build | Vite |
| Styling | Tailwind CSS v4.x (`@import "tailwindcss"`) |
| Icons | Lucide React (`lucide-react`) |
| Toasts | Sonner (`toast.success / error / warning`) |
| State | Local `useState` / `useMemo` — no Redux/Zustand |
| Router | None — single SPA, page controlled by `currentPage` string in `App.tsx` |
| Font | Inter (body), JetBrains Mono (code/mono) |

---

## 2. Folder Structure

```
src/
├── app/
│   ├── App.tsx                    ← main shell, page router
│   └── components/
│       ├── hb/
│       │   ├── listing/           ← reusable listing UI library
│       │   └── common/            ← reusable form/card/stat library
│       ├── Dashboard.tsx          ← (to be created)
│       ├── MemberManagement.tsx
│       ├── EventManagement.tsx
│       ├── EventDetail.tsx
│       ├── EventEdit.tsx
│       ├── SuperAdminMasters.tsx
│       └── ...
├── mockAPI/
│   ├── membersData.ts
│   ├── eventsData.ts
│   ├── usersData.ts
│   ├── rolesData.ts
│   └── ...
└── styles/
    └── globals.css                ← all CSS tokens defined here
```

---

## 3. Color Tokens

All colors are CSS custom properties defined in `globals.css` and consumed as Tailwind classes.

### Primary (theme-aware — changes with color theme switcher)

| Class | Usage |
|---|---|
| `bg-primary-600` | Primary buttons, active tabs underline, active nav |
| `text-primary-600 dark:text-primary-400` | Primary text links, icons |
| `bg-primary-50 dark:bg-primary-950/50` | Icon container backgrounds |
| `border-primary-600 dark:border-primary-400` | Active tab border |
| `bg-primary-100 dark:bg-primary-950` | Avatar / initials backgrounds |

### Neutral (stable across themes)

| Class | Usage |
|---|---|
| `text-neutral-900 dark:text-white` | Primary text, headings |
| `text-neutral-600 dark:text-neutral-400` | Secondary / label text |
| `text-neutral-500 dark:text-neutral-400` | Placeholder, caption text |
| `text-neutral-400` | Disabled, timestamp |
| `bg-white dark:bg-neutral-950` | Card / page background |
| `bg-neutral-50 dark:bg-neutral-900` | Subtle fill, table header, sidebar row |
| `bg-neutral-100 dark:bg-neutral-800` | Pill backgrounds, inactive filter |
| `border-neutral-200 dark:border-neutral-800` | All card / table borders |
| `divide-neutral-100 dark:divide-neutral-800` | Table row dividers |

### Semantic Colors

| Semantic | Light classes | Dark classes | Use |
|---|---|---|---|
| Success | `bg-success-50 text-success-700` | `dark:bg-success-950/20 dark:text-success-400` | Active status, going RSVP |
| Warning | `bg-amber-50 text-amber-700` | `dark:bg-amber-950/20 dark:text-amber-400` | Pending, warnings |
| Error | `bg-error-50 text-error-700` | `dark:bg-error-950/20 dark:text-error-400` | Cancelled, rejected, danger |
| Info | `bg-blue-50 text-blue-700` | `dark:bg-blue-950/20 dark:text-blue-400` | Published, info state |
| Violet | `bg-violet-50 text-violet-700` | `dark:bg-violet-950/20 dark:text-violet-400` | Paid events, teen badge |
| Amber | `bg-amber-50 text-amber-700` | `dark:bg-amber-950/20 dark:text-amber-400` | Completed events |

### HSS Brand Colours (use as accent only)

```css
--hss-blue:        #172E4D   /* primary brand */
--hss-orange:      #F9B03D   /* brand highlight */
--hss-bal-blue:    #009FE3   /* info/bal */
--hss-sewa-green:  #4EAE33   /* success/sewa */
--hss-sevika-pink: #F67FD5   /* sevika accent */
--hss-dharma-red:  #BC0F1C   /* error/dharma */
```

---

## 4. Typography Scale

| Element | Size | Weight | Class |
|---|---|---|---|
| Page title (PageHeader) | 32px | 600 | `text-[32px] leading-[40px] font-semibold` |
| Section heading | 18px | 600 | `text-lg font-semibold` |
| Card heading / sub-heading | 14–16px | 600 | `text-sm font-semibold` or `text-base font-semibold` |
| Body text | 14px | 400 | `text-sm` |
| Label / caption | 12px | 400–500 | `text-xs` |
| Uppercase micro-label | 10px | 700 | `text-[10px] font-bold uppercase tracking-wider` |
| Mono (IDs, codes) | 13px | 400 | `text-xs font-mono` |
| Table header | 12px | 600 | `text-xs font-semibold` |
| Table cell | 14px | 400 | `text-sm` |

---

## 5. Spacing & Layout

### Page Wrapper
Every full page component uses:
```tsx
<div className="p-5 md:p-6 bg-transparent dark:bg-neutral-950 px-[8px] py-[8px]">
  <div className="max-w-[100%] mx-auto">
    {/* content */}
  </div>
</div>
```

### Standard Gaps
| Use | Value |
|---|---|
| Between page sections | `space-y-6` or `gap-6` |
| Between cards in a grid | `gap-4` |
| Between form fields | `gap-4` |
| Icon + text inside button/badge | `gap-1.5` |
| Header action buttons | `gap-2` |
| Stat card internal padding | `p-4` |
| Card body padding | `px-6 py-5` or `p-6` |
| Card header (with border-b) | `px-6 pt-4 pb-3` |
| Tab content padding | `p-6` |

### Two-Column Detail Layout (used in EventDetail, MemberDetail)
```tsx
<div className="flex flex-col lg:flex-row gap-6">
  <div className="flex-1 lg:w-[70%]"> {/* Main content */} </div>
  <div className="lg:w-[30%] space-y-6"> {/* Sidebar */} </div>
</div>
```

### Grid Patterns
```tsx
// 4 KPI cards
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

// 3 stat cards
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

// 2-column form
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Media grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 6. Component Library

### 6.1 `hb/listing` — Import path: `'./hb/listing'`

| Component | Props summary | Use |
|---|---|---|
| `PageHeader` | `title`, `subtitle`, `breadcrumbs[]`, `moreMenu?`, `children` | Every list page top |
| `SearchBar` | `value`, `onChange`, `placeholder?` | Inline search |
| `PrimaryButton` | `icon?`, `onClick`, `disabled?`, `hideTextOnMobile?` | Main CTA |
| `SecondaryButton` | `icon?`, `onClick` | Secondary action |
| `IconButton` | `icon`, `onClick`, `title?` | Icon-only action |
| `ViewModeSwitcher` | `viewMode`, `onChange` | Grid/Table toggle |
| `Pagination` | `currentPage`, `totalPages`, `totalItems`, `onPageChange` | List pagination |
| `SummaryWidgets` | `widgets[]` | Collapsible summary row |
| `AdvancedSearchPanel` | `isOpen`, `onClose`, `filters`, `filterOptions`, `onFiltersChange` | Filter drawer |
| `FilterChips` | `filters[]`, `onRemove`, `onClearAll` | Active filter chips |
| `Breadcrumb` + `BreadcrumbItem` | `href?`, `current?`, `onClick?` | Breadcrumb trail |
| `FlyoutMenu` + `FlyoutMenuItem` | `position`, `onClose`, `icon?`, `roundedTop?`, `roundedBottom?` | Dropdown menu |

### 6.2 `hb/common` — Import path: `'./hb/common'`

| Component | Key props | Use |
|---|---|---|
| `StatCard` | `label`, `value`, `icon?`, `trend?`, `className?`, `valueClassName?` | KPI metric cards |
| `FormModal` | `isOpen`, `onClose`, `title`, `size?` | Modal with built-in header + scrollable body (`p-5` padding applied internally) |
| `FormField` | `label`, `required?`, `error?`, `className?` | Form field wrapper |
| `FormLabel` | `required?` | Label with asterisk |
| `FormInput` | `value`, `onChange`, `placeholder?`, `type?`, `disabled?` | Text input |
| `FormTextarea` | `value`, `onChange`, `rows?` | Multi-line input |
| `FormSelect` | `value`, `onValueChange`, `placeholder?`, `disabled?` | Dropdown select |
| `FormGrid` | `cols?` (default 2) | 2-col form grid |
| `FormSection` | `title` | Titled section inside form |
| `StatusSlider` | `checked`, `onChange`, `disabled?` | Toggle switch |

#### ⚠️ Known Constraints
- `FormModal` body already has `p-5` — **do NOT add padding to the inner div**
- `FormInput` / `FormSelect` do **not** accept an `error` prop — show errors via `<p className="text-xs text-error-600 mt-1">`
- `FormField` does **not** accept `span` — use `className="md:col-span-2"` instead

---

## 7. Standard Card Pattern

```tsx
<div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
  {/* Optional header */}
  <h4 className="text-sm font-medium text-neutral-900 dark:text-white px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
    Card Title
  </h4>
  {/* Body */}
  <div className="px-6 py-5">
    {/* content */}
  </div>
</div>
```

### Subtle / fill card
```tsx
<div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
```

---

## 8. Badge Patterns

### Status Badge (5-state events)
```tsx
const statusMap = {
  draft:     { bg: 'bg-neutral-50 dark:bg-neutral-900',    text: 'text-neutral-600 dark:text-neutral-400',  dot: 'bg-neutral-400'  },
  published: { bg: 'bg-blue-50 dark:bg-blue-950/20',       text: 'text-blue-700 dark:text-blue-400',        dot: 'bg-blue-500'     },
  active:    { bg: 'bg-success-50 dark:bg-success-950/20', text: 'text-success-700 dark:text-success-400',  dot: 'bg-success-500'  },
  cancelled: { bg: 'bg-error-50 dark:bg-error-950/20',     text: 'text-error-700 dark:text-error-400',      dot: 'bg-error-500'    },
  completed: { bg: 'bg-amber-50 dark:bg-amber-950/20',     text: 'text-amber-700 dark:text-amber-400',      dot: 'bg-amber-500'    },
};
// Render:
<span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
  <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
  <span className="text-xs font-medium">{s.label}</span>
</span>
```

### Member Status Badge
```tsx
const memberStatusMap = {
  active:                   { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  pending:                  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  'pending-parental-consent': { bg: 'bg-blue-50',  text: 'text-blue-700',    dot: 'bg-blue-500'    },
  inactive:                 { bg: 'bg-neutral-50', text: 'text-neutral-600', dot: 'bg-neutral-400' },
  rejected:                 { bg: 'bg-error-50',   text: 'text-error-700',   dot: 'bg-error-500'   },
};
```

### Simple Pill Badge
```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium">
  Label
</span>
```

### Count Badge (on tabs/pills)
```tsx
<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-white text-[10px] font-bold">
  {count}
</span>
```

---

## 9. Button Styles (inline / without library)

```tsx
const btnBase     = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
const btnPrimary  = `${btnBase} bg-primary-600 hover:bg-primary-700 text-white`;
const btnGhost    = `${btnBase} border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800`;
const btnDanger   = `${btnBase} border border-error-300 dark:border-error-700 text-error-700 dark:text-error-400 bg-white dark:bg-neutral-900 hover:bg-error-50 dark:hover:bg-error-950/20`;
const btnWarn     = `${btnBase} border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-white dark:bg-neutral-900 hover:bg-amber-50 dark:hover:bg-amber-950/20`;
const btnDisabled = `${btnBase} border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-60`;
```

---

## 10. Tab Pattern

```tsx
type Tab = 'overview' | 'participants' | 'media'; // define per module

// Tab bar
<div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30">
  <div className="flex px-2">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
          activeTab === tab.id
            ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
            : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>

// Tab content area
<div className="p-6 bg-white dark:bg-neutral-950 flex-1">
  {activeTab === 'overview' && ( ... )}
</div>
```

---

## 11. Table Pattern

```tsx
<div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
  <table className="w-full text-left">
    <thead>
      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <th className="px-4 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400">Col</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
      <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
        <td className="px-4 py-3 text-sm text-neutral-900 dark:text-white">value</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 12. Warning / Info Banner Pattern

```tsx
{/* Amber warning */}
<div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg text-sm text-amber-700 dark:text-amber-400">
  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
  <span>Warning message here.</span>
</div>

{/* Blue info */}
<div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg text-sm text-blue-700 dark:text-blue-400">
  <Info className="w-4 h-4 flex-shrink-0" />
  <span>Info message here.</span>
</div>
```

---

## 13. Empty State Pattern

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <UsersIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No items found</p>
  <p className="text-xs text-neutral-400 mt-1">Adjust your filters or add a new item.</p>
</div>
```

---

## 14. Avatar / Initials Pattern

```tsx
{/* Large (44px) — used in host/member info */}
<div className="w-11 h-11 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
  {name.split(' ').map(n => n[0]).join('')}
</div>

{/* Small (24px) — used in media cards */}
<div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
  <span className="text-[9px] font-bold text-white">{initials}</span>
</div>

{/* Medium (28px) — used in lightbox header */}
<div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
  {initials}
</div>
```

---

## 15. Confirmation / Action Modal Pattern

All inline ConfirmModals use this component defined in `EventManagement.tsx`:

```tsx
function ConfirmModal({
  isOpen, title, message, confirmLabel, confirmVariant = 'primary',
  isLoading, onConfirm, onClose,
}) {
  if (!isOpen) return null;
  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button onClick={onClose} className={btnGhost}>Cancel</button>
          <button onClick={onConfirm} className={confirmVariant === 'danger' ? btnDanger : btnPrimary} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </FormModal>
  );
}
```

---

## 16. Mock Data Sources

| File | Export | Key fields |
|---|---|---|
| `src/mockAPI/membersData.ts` | `mockMembers`, `MASTERS_CASCADE`, `MEMBER_FILTER_OPTIONS` | `id`, `name`, `email`, `status`, `memberType`, `registrationDate`, `country`, `region`, `town`, `activityCentre` |
| `src/mockAPI/eventsData.ts` | `mockEvents`, `mockParticipants`, `mockMediaPosts` | `id`, `name`, `status`, `startDate`, `endDate`, `host`, `metrics`, `paymentType` |
| `src/mockAPI/usersData.ts` | `mockUsers` | `id`, `name`, `email`, `role`, `status` |
| `src/mockAPI/rolesData.ts` | `mockRoles` | `id`, `name`, `permissions` |
| `src/mockAPI/logsData.ts` | `mockLogs` | `id`, `action`, `module`, `user`, `timestamp` |

### MASTERS_CASCADE structure
```typescript
MASTERS_CASCADE = {
  countries: string[],           // 9 countries
  regions:   Record<string, string[]>,  // per country
  towns:     Record<string, string[]>,  // per region
  centres:   Record<string, string[]>,  // per town
}
// Counts from mock data:
// Countries: 9 | Regions: 19 | Towns: 34 | Activity Centres: 35
```

### Member status values
`'active' | 'pending' | 'pending-parental-consent' | 'inactive' | 'rejected'`

### Event status values
`'draft' | 'published' | 'active' | 'cancelled' | 'completed'`

---

## 17. Navigation / Routing

- All navigation is controlled by `currentPage` string in `App.tsx`
- Page IDs used in the router:

| Page ID | Component |
|---|---|
| `dashboard` | Dashboard (to build) |
| `members` | MemberManagement |
| `pending-approvals` | PendingApprovals |
| `pending-guardian-approvals` | PendingGuardianApprovals |
| `event-management` | EventManagement |
| `user-management` | UserManagement |
| `role-management` | RoleManagement |
| `country` / `region` / `town` / `centre` / `role-types` | SuperAdminMasters |
| `system-settings` | SystemSettings |
| `static-pages` | StaticPages |
| `email-templates` | EmailTemplates |
| `system-notifications` | SystemNotifications |
| `logs` | LogsPage |

- To navigate programmatically, call `handleNavigate(pageId)` — passed down as `onNavigate` prop
- Cross-module navigation (e.g. event participant → member detail) uses a shared state in App.tsx:
  ```tsx
  const [memberToView, setMemberToView] = useState<string | null>(null);
  // EventManagement gets: onNavigateToMember={(id) => { setMemberToView(id); setCurrentPage('members'); }}
  // MemberManagement gets: initialMemberId={memberToView} onConsumeInitialMember={() => setMemberToView(null)}
  ```

---

## 18. Page Structure Template

Every new full-page module follows this shell:

```tsx
import { useState, useMemo } from 'react';
import { /* lucide icons */ } from 'lucide-react';
import { PageHeader, PrimaryButton, SearchBar, Pagination } from './hb/listing';
import { StatCard, FormModal, FormField, FormInput } from './hb/common';
import { toast } from 'sonner';
import { mockXxx } from '../../mockAPI/xxxData';

export default function XxxManagement() {
  // 1. State
  const [items, setItems]             = useState(mockXxx);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage                  = 20;

  // 2. Computed
  const filtered = useMemo(() => items.filter(...), [items, searchQuery]);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 3. Render
  return (
    <div className="p-5 md:p-6 dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">
        <PageHeader title="Module Name" breadcrumbs={[...]}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <PrimaryButton icon={Plus} onClick={...}>Add New</PrimaryButton>
        </PageHeader>

        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6"> ... </div>

        {/* Content */}
        ...

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalPages={...} totalItems={...} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
```

---

## 19. Dark Mode Rules

- **Always** pair light + dark classes: `bg-white dark:bg-neutral-950`
- **Never** use bare colour without dark pair for anything user-visible
- Background hierarchy:
  - App shell: `bg-neutral-50 dark:bg-neutral-950`
  - Cards/panels: `bg-white dark:bg-neutral-950`
  - Subtle fill: `bg-neutral-50 dark:bg-neutral-900` or `dark:bg-neutral-900/50`
  - Table header: `bg-neutral-50 dark:bg-neutral-900`
- Text hierarchy:
  - Primary: `text-neutral-900 dark:text-white`
  - Secondary: `text-neutral-600 dark:text-neutral-400`
  - Muted: `text-neutral-500 dark:text-neutral-400`
  - Disabled: `text-neutral-400 dark:text-neutral-600`

---

## 20. Icon Usage

All icons from `lucide-react`. Standard sizes:

| Context | Size class |
|---|---|
| Inline with text (labels, badges) | `w-3 h-3` or `w-3.5 h-3.5` |
| Button icons | `w-4 h-4` |
| Card/section icons | `w-5 h-5` |
| Empty state illustration | `w-8 h-8` |
| Large feature icon | `w-6 h-6` or `w-7 h-7` |

Common icons used per context:
- Members: `Users`, `UserPlus`, `UserCheck`, `UserX`
- Events: `Calendar`, `CalendarDays`, `Clock`, `MapPin`
- Masters: `Globe`, `Map`, `Building2`, `Home`
- Approvals: `ShieldCheck`, `AlertCircle`, `Clock`
- Navigation: `ArrowLeft`, `ChevronLeft`, `ChevronRight`
- Actions: `Edit`, `Trash2`, `Eye`, `Ban`, `Play`, `XCircle`
- Misc: `Search`, `Plus`, `Filter`, `Download`, `Upload`, `CheckCircle2`

---

## 21. Toast Notifications

```tsx
import { toast } from 'sonner';

toast.success('Record saved successfully.');
toast.error('Something went wrong. Please try again.');
toast.warning('Action has been locked.');
toast.info('Changes are pending approval.');
```

---

## 22. Cutoff / Business Logic Conventions

```typescript
// Events: post-start lock
const isPastStart = (event: Event) => new Date() >= new Date(event.startDate);
const canModify   = (event: Event) => !isPastStart(event);
const canDelete   = (event: Event) => !isPastStart(event) && event.status !== 'completed';

// When action is blocked, show disabled button with title tooltip:
<button className={btnDisabled} title="Reason why disabled" disabled>...</button>

// Warning banner when locked but not cancelled/completed:
{isPastStart(event) && !isCancelledOrCompleted && (
  <div className="... bg-amber-50 ..."><AlertTriangle /><span>Modify/Delete locked.</span></div>
)}
```

---

## 23. Form Cascade Pattern (Masters dropdowns)

```tsx
import { MASTERS_CASCADE } from '../../mockAPI/membersData';

// State: country → region → town → centre
const [country, setCountry] = useState('');
const [region, setRegion]   = useState('');
const [town, setTown]       = useState('');
const [centre, setCentre]   = useState('');

// Available options (recalculate on parent change)
const regions  = country ? MASTERS_CASCADE.regions[country]  ?? [] : [];
const towns    = region  ? MASTERS_CASCADE.towns[region]     ?? [] : [];
const centres  = town    ? MASTERS_CASCADE.centres[town]     ?? [] : [];

// Reset children when parent changes:
const handleCountryChange = (val: string) => { setCountry(val); setRegion(''); setTown(''); setCentre(''); };
```

---

## 24. Theming System

The app supports 6 switchable color themes via `data-theme` attribute on `<html>`:

| Theme ID | Brand |
|---|---|
| `hss-brand` | HSS Navy Blue #172E4D (default) |
| `default-black` | Charcoal #111827 |
| `ocean-blue` | Tailwind Blue #2563eb |
| `emerald-green` | Tailwind Emerald #10b981 |
| `violet-purple` | Tailwind Violet #8b5cf6 |
| `amber-orange` | Tailwind Amber #f59e0b |

All primary colour references (`primary-600`, `primary-700` etc.) automatically adapt. Never hardcode a specific hex for primary UI elements.

---

## 25. Quick Reference — What Already Exists

| Module | File | Status |
|---|---|---|
| Authentication | `SuperAdminAuth.tsx` | ✅ Done |
| Dashboard | `Dashboard.tsx` | 🔲 To build |
| Members | `MemberManagement.tsx` + `MemberDetail.tsx` + `MemberEdit.tsx` | ✅ Done |
| Pending Approvals | `PendingApprovals.tsx` | ✅ Done |
| Guardian Approvals | `PendingGuardianApprovals.tsx` | ✅ Done |
| Events | `EventManagement.tsx` + `EventDetail.tsx` + `EventEdit.tsx` | ✅ Done |
| Masters | `SuperAdminMasters.tsx` (Country, Region, Town, Centre, Role Types) | ✅ Done |
| User Management | `UserManagement.tsx` | ✅ Done |
| Role Management | `RoleManagement.tsx` | ✅ Done |
| Email Templates | `EmailTemplates.tsx` | ✅ Done |
| System Notifications | `SystemNotifications.tsx` | ✅ Done |
| System Settings | `SystemSettings.tsx` | ✅ Done |
| Static Pages | `StaticPages.tsx` | ✅ Done |
| Logs | `LogsPage.tsx` | ✅ Done |
