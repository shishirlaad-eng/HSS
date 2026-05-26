# 🎨 Visual Component Catalog

A visual reference guide showing all available UI components in the CRM Design System.

---

## 📦 Button Components

### Primary Button

```
┌─────────────────┐
│  ✓ Save Changes │  ← White text on #1766C2 background
└─────────────────┘
```

**Use for:** Primary actions, form submissions

### Secondary Button

```
┌─────────────────┐
│     Cancel      │  ← Neutral text with border
└─────────────────┘
```

**Use for:** Cancel actions, secondary options

### Ghost Button

```
  View Details      ← No border, just text with hover background
```

**Use for:** Tertiary actions, inline links

### Icon Button

```
┌───┐
│ ⋮ │  ← 32×32px circle, icon only
└───┘
```

**Use for:** Actions in compact spaces

---

## 🃏 Card Components

### Standard Card

```
┌────────────────────────────────┐
│                                │
│   Card Content                 │  ← White background
│                                │     Gray border
└────────────────────────────────┘
```

### Colored Border Card (Emphasis)

```
┃┌───────────────────────────────┐
┃│                               │
┃│   Important Content           │  ← Blue left border (4px)
┃│                               │
┃└───────────────────────────────┘
```

### Card with Header

```
┌────────────────────────────────┐
│ Card Title              [...]  │  ← Header with action
├────────────────────────────────┤
│                                │
│   Card Content                 │
│                                │
└────────────────────────────────┘
```

### Stat Card

```
┌────────────────────────┐
│ Total Items        [↑] │  ← Label + Icon
│                        │
│ 1,234                  │  ← Large number
│ +12.5% vs last month   │  ← Growth indicator
└────────────────────────┘
```

---

## 🏷️ Badge Components

### Status Badges

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Active  │  │ Pending  │  │ Warning  │  │  Error   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
   Green         Yellow       Orange         Red
```

### Pill Badge

```
●●●●●●●●●  ← Fully rounded corners (rounded-full)
  Label
```

### Count Badge

```
 ┌───┐
 │ 5 │  ← Small number indicator
 └───┘
```

---

## 📝 Form Components

### Text Input

```
┌──────────────────────────────────┐
│ [🔍] Search items...             │  ← Optional icon
└──────────────────────────────────┘
```

### Select Dropdown

```
┌──────────────────────────────────┐
│ Reporting To Manager         [▼] │
└──────────────────────────────────┘
```

### Textarea

```
┌───────────────────────────��──────┐
│                                  │
│ Enter description...             │
│                                  │
│                                  │
└──────────────────────────────────┘
```

### Checkbox

```
☑ Option 1
☐ Option 2
☐ Option 3
```

### Radio Button

```
◉ Option A
○ Option B
○ Option C
```

---

## 🎯 Navigation Components

### Horizontal Tabs

```
─────────  ─────────  ─────────
  Tab 1      Tab 2      Tab 3
══════════  ─────────  ─────────
    ↑ Active (blue underline)
```

### Breadcrumb

```
Home  ›  Module  ›  Current Page
                     ↑ Bold/colored
```

### Pagination

```
[Previous]  [1]  2  3  ...  10  [Next]
             ↑ Active (blue background)
```

---

## 📋 List Patterns

### Simple List

```
┌────────────────────────────────────────┐
│ [👤] John Doe             [✏️] [⋮]   │
│      john@email.com                    │
├────────────────────────────────────────┤
│ [👤] Jane Smith           [✏️] [⋮]   │
│      jane@email.com                    │
└────────────────────────────────────────┘
```

### List with Status

```
┌────────────────────────────────────────┐
│ [👤] John Doe  ⦿Active    [✏️] [⋮]   │
│      📧 john@email.com                 │
│      📞 +1 234 567 8900                │
└────────────────────────────────────────┘
```

---

## 🎴 Grid Patterns

### 4-Column Grid (Desktop)

```
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│ [👤] │  │ [👤] │  │ [👤] │  │ [👤] │
│      │  │      │  │      │  │      │
│ John │  │ Jane │  │ Mike │  │ Sara │
└──────┘  └──────┘  └──────┘  └──────┘
```

### Responsive Grid

- **Mobile:** 1 column
- **Tablet:** 2 columns
- **Desktop:** 3-4 columns

---

## 📊 Table Pattern

```
┌────────────────────────────────────────────────────┐
│ [☐] Name         Status      Contact      [Actions]│  ← Header
├────────────────────────────────────────────────────┤
│ [☐] [👤] John    ⦿Active    john@...    [✏️] [⋮] │
│ [☐] [👤] Jane    ⦿Active    jane@...    [✏️] [⋮] │
│ [☐] [👤] Mike    ⊗Inactive  mike@...    [✏️] [⋮] │
└────────────────────────────────────────────────────┘
```

---

## 🎪 Modal Patterns

### Center Modal (Confirmation)

```
        ┌──────────────────────┐
        │                      │
        │    [⚠️]              │
        │                      │
        │  Confirm Action?     │
        │  Description text    │
        │                      │
        │ [Cancel] [Confirm]   │
        │                      │
        └──────────────────────┘
```

### Right Drawer (Forms)

```
┌─────────────────────────────────┐
│ Add New Item              [✕]   │  ← Header
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Name                        │ │
│ └─────────────────────────────┘ │  ← Form fields
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Email                       │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│              [Cancel] [Save]    │  ← Footer
└─────────────────────────────────┘
```

---

## 🎛️ Dropdown Menu

```
        ┌──────────────────────┐
        │ ✏️  Edit             │  ← Hover: light gray bg
        │ 👁️  View Details      │
        │ 📋  Duplicate         │
        ├──────────────────────┤  ← Divider
        │ 🗑️  Delete           │  ← Danger: red text
        └──────────────────────┘
```

---

## 🔍 Search Bar Patterns

### Simple Search

```
┌──────────────────────────────────┐
│ [🔍] Search...                   │
└──────────────────────────────────┘
```

### Search with Filters

```
┌───────────────────────────────────────────────────┐
│ [🔍] Search...          [🔽 Filters] [Grid] [List]│
└───────────────────────────────────────────────────┘
```

---

## 📈 Status Indicators

### Progress Bar

```
████████░░░░░░░░░░░░  40%
```

### Loading Spinner

```
    ⟳
```

### Dot Indicator

```
● Online    ○ Offline
```

---

## 🎨 Color-Coded Elements

### Status Colors

```
● Green     = Success / Active / Completed
● Yellow    = Warning / Pending / In Progress
● Red       = Error / Inactive / Cancelled
● Blue      = Info / Default / Selected
● Gray      = Neutral / Disabled
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)

```
┌───────────────┐
│               │
│   Single      │
│   Column      │
│               │
└───────────────┘
```

### Tablet (768px - 1024px)

```
┌──────────┬──────────┐
│          │          │
│   Two    │   Two    │
│ Columns  │ Columns  │
│          │          │
└──────────┴──────────┘
```

### Desktop (> 1024px)

```
┌────┬────┬────┬────┐
│    │    │    │    │
│ 4  │ 4  │ 4  │ 4  │
│Col │Col │Col │Col │
│    │    │    │    │
└────┴────┴────┴────┘
```

---

## 🎭 Dark Mode

All components automatically support dark mode:

### Light Mode

```
┌────────────────────┐
│ White Background   │  ← bg-white
│ Dark Text          │     text-neutral-900
│ Gray Border        │     border-neutral-200
└────────────────────┘
```

### Dark Mode (Same Component)

```
┌────────────────────┐
│ Dark Background    │  ← dark:bg-neutral-950
│ Light Text         │     dark:text-white
│ Dark Border        │     dark:border-neutral-800
└────────────────────┘
```

---

## 🎨 Theme Variations

All 5 themes use the same components, just different neutral colors:

1. **Natural** - Pure grays (#gray)
2. **Slate** - Blue-gray (#slate)
3. **Nord** - Cool grays (#nord)
4. **Midnight** - Navy-blue grays (#midnight)
5. **Warm** - Warm grays (#warm)

**Primary color (#1766C2) stays the same across all themes!**

---

## 📏 Spacing Reference

```
gap-2  = 8px   ⬌     (tight)
gap-3  = 12px  ⬌⬌    (compact)
gap-4  = 16px  ⬌⬌⬌   (default)
gap-6  = 24px  ⬌⬌⬌⬌⬌⬌ (section)
```

---

## 🔤 Typography Hierarchy

```
H1 - 32px Bold         ← Page titles
H2 - 24px Semibold     ← Section titles
H3 - 20px Semibold     ← Card titles
H4 - 16px Semibold     ← Subsection titles
Body - 14px Regular    ← Default text
Small - 13px Regular   ← Helper text
XSmall - 12px Regular  ← Labels, metadata
```

---

## 🎯 Common Layout Patterns

### Dashboard Layout

```
┌─────────────────────────────────────────┐
│ Header with Stats (4 cards)            │
├─────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────────┐   │
│ │ Recent      │  │                 │   │
│ │ Activity    │  │  Main Chart     │   │
│ │             │  │                 │   │
│ └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

### Listing Page Layout

```
┌─────────────────────────────────────────┐
│ Breadcrumb                              │
├─────────────────────────────────────────┤
│ Page Title          [+ Add New]         │
├─────────────────────────────────────────┤
│ [🔍 Search]  [Filters] [Grid] [List]   │
├─────────────────────────────────────────┤
│ Stats Cards (4 columns)                 │
├─────────────────────────────────────────┤
│                                         │
│ List/Grid/Table Items                   │
│                                         │
└─────────────────────────────────────────┘
```

### Detail Page Layout

```
┌─────────────────────────────────────────┐
│ [← Back] Item Name         [Edit] [⋮]  │
├─────────────────────────────────────────┤
│ Quick Info Cards (horizontal)           │
├─────────────────────────────────────────┤
│ Tab1 | Tab2 | Tab3 | More ▼            │
├─────────────────────────────────────────┤
│                                         │
│ Tab Content Area                        │
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚡ Quick Copy Reference

### Most Common Class Combinations

**Card:**

```
bg-white dark:bg-neutral-950
border border-neutral-200 dark:border-neutral-800
rounded-lg p-4
```

**Button Primary:**

```
px-4 py-2
bg-primary-600 hover:bg-primary-700
text-white
rounded-lg transition-colors
```

**Input:**

```
w-full px-3 py-2
border border-neutral-300 dark:border-neutral-700
bg-white dark:bg-neutral-950
text-neutral-900 dark:text-white
rounded-lg
focus:outline-none focus:ring-2 focus:ring-primary-500
```

**Badge Success:**

```
px-2 py-1 text-xs rounded-full
bg-success-100 dark:bg-success-950
text-success-700 dark:text-success-400
```

---

## 📖 Usage Guidelines

### ✅ DO

- Use consistent spacing (gap-4, p-4)
- Use semantic colors (success, warning, error)
- Support dark mode for all components
- Use rounded-lg for all cards/buttons
- Keep borders subtle (neutral-200)
- Use icons from lucide-react only

### ❌ DON'T

- Don't use gradients
- Don't use custom font sizes (stick to system)
- Don't mix border radius sizes
- Don't forget dark mode variants
- Don't use filled backgrounds (except badges)
- Don't use shadows excessively

---

## 🎬 Animation Guidelines

### Transitions

```
transition-colors     ← For color changes
transition-transform  ← For scale/position
transition-all        ← For multiple properties
```

### Duration

```
duration-150  ← Fast (buttons, hovers)
duration-300  ← Default (most UI)
duration-500  ← Slow (drawers, modals)
```

### Hover Effects

- **Buttons:** Background color change
- **Cards:** Shadow or background change
- **Icons:** Color change
- **Links:** Underline or color change

---

## 🔧 Utility Patterns

### Flexbox Layouts

```
flex items-center justify-between     ← Horizontal with space
flex flex-col gap-4                    ← Vertical stack
flex items-start gap-3                 ← Left-aligned row
```

### Grid Layouts

```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
↑ Responsive grid: 1 → 2 → 4 columns
```

### Truncation

```
truncate              ← Single line ellipsis
line-clamp-2          ← Multi-line ellipsis (2 lines)
```

### Responsive Utilities

```
hidden md:block       ← Hide on mobile, show on desktop
md:hidden             ← Show on mobile, hide on desktop
```

---

## 🎯 Component Checklist

When creating a new component, ensure:

- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Uses design system colors
- [ ] Uses correct spacing (gap-4, p-4)
- [ ] Uses rounded-lg for corners
- [ ] Has hover states
- [ ] Has focus states (forms)
- [ ] Uses Inter font only
- [ ] Follows 14px base size

---

**✅ All components are production-tested in the CRM application!**

Refer to actual implementation files:

- `/components/crm/LeadListing.tsx` - Best example of all patterns
- `/components/GlobalHeader.tsx` - Header patterns
- `/components/Sidebar.tsx` - Navigation patterns
- `/components/crm/FullLeadDetail.tsx` - Detail page patterns