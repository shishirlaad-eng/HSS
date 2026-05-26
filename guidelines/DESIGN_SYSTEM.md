# CRM Design System - Base UI Kit

**Version 1.0** | **Primary Brand Color: #1766C2**

---

## 🎯 Overview

This is the complete design system for building enterprise SaaS applications. Use this as your foundation for any new application (HR, Projects, Finance, etc.). The UI is proven, consistent, and production-ready.

**What This Includes:**

- ✅ Complete theme system with 6 color themes
- ✅ Light & Dark mode support
- ✅ Global header with search, notifications, theme switcher
- ✅ Collapsible sidebar navigation
- ✅ Typography system (Inter font, 14px base)
- ✅ Consistent spacing, borders, shadows
- ✅ Responsive layouts
- ✅ List, Grid, Table, Kanban view patterns

---

## 🎨 Design Principles

1. **Speed & Clarity** - Fast load, clear hierarchy
2. **Reduced Cognitive Load** - No gradients, clean white backgrounds
3. **Colored Borders** - Cards use colored borders, not filled backgrounds
4. **Consistency** - Same patterns across all modules
5. **14px Base Font** - Inter font family only
6. **Modern SaaS Look** - Professional, clean, trustworthy

---

## 📐 Layout Structure

### Base Layout (ALWAYS USE THIS)

```
┌─────────────────────────────────────────────┐
│  Global Header (48px height)                │
├──────┬──────────────────────────────────────┤
│      │                                       │
│ Side │                                       │
│ bar  │   Main Content Area                   │
│      │                                       │
│ 64px │   (Dynamic based on module)           │
│  or  │                                       │
│256px │                                       │
│      │                                       │
└──────┴──────────────────────────────────────┘
```

### Measurements

- **Header Height:** 48px (fixed)
- **Sidebar Width:** 64px (collapsed) | 256px (expanded)
- **Main Content:** Full height, left margin matches sidebar width
- **Max Content Width:** 100% (no max-width constraint)
- **Content Padding:** 20px (mobile) | 24px (desktop)

---

## 🎨 Color System

### Primary Brand Color

```css
--primary: #1766c2; /* Your brand blue - NEVER CHANGE */
```

### Theme Architecture

All apps support **5 professional themes**:

1. **Natural** (default) - Clean neutral grays
2. **Slate** - Modern blue-gray tones
3. **Nord** - Nordic soft palette
4. **Midnight** - Deep blue theme
5. **Warm** - Coffee & earth tones

### How Themes Work

```html
<!-- Root element has data-theme attribute -->
<html data-theme="natural">
```

### Color Token Structure (Per Theme)

```css
/* Neutral Scale (background, borders, text) */
--neutral-50: ... --neutral-100: ... --neutral-200: ...
  (borders) --neutral-300: ... --neutral-400: ... (muted text)
  --neutral-500: ... --neutral-600: ... (body text)
  --neutral-700: ... --neutral-800: ... --neutral-900: ...
  (headings) --neutral-950: ... (dark backgrounds)
  /* Semantic Colors */
  --success- *: (green for positive actions)
  --warning- *: (yellow/orange for warnings)
  --error- *: (red for errors/danger)
  --info- *: (blue for informational);
```

### Dark Mode

```css
.dark {
  /* All colors automatically adjust */
  /* Use Tailwind's dark: prefix */
}
```

---

## 📝 Typography

### Font Family

```css
font-family: "Inter", sans-serif; /* ONLY Inter, always */
```

### Base Font Size

```css
body {
  font-size: 14px; /* Never change this base */
  line-height: 1.5;
}
```

### Typography Scale (DO NOT USE TAILWIND FONT CLASSES)

```css
/* These are set in globals.css - DO NOT override with Tailwind classes */

h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}
h2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}
h3 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}
h4 {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}
h5 {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}
h6 {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

/* Body text */
body,
p {
  font-size: 14px;
  font-weight: 400;
}

/* Small text */
.text-sm {
  font-size: 13px;
}
.text-xs {
  font-size: 12px;
}
```

### Font Weight Usage

- **Regular (400):** Body text, descriptions
- **Medium (500):** Buttons, labels
- **Semibold (600):** Headings, emphasis
- **Bold (700):** Large headings only

---

## 🧱 Component Patterns

### 1. Cards

```tsx
<div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
  {/* Card content */}
</div>
```

**Variations:**

- **Colored Border Card:**

```tsx
<div className="bg-white dark:bg-neutral-950 border-l-4 border-l-primary-500 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
```

### 2. Buttons

**Primary Button:**

```tsx
<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
  Action
</button>
```

**Secondary Button:**

```tsx
<button className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors">
  Cancel
</button>
```

**Ghost Button:**

```tsx
<button className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors">
  Link
</button>
```

**Icon Button:**

```tsx
<button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

### 3. Form Inputs

**Text Input:**

```tsx
<input
  type="text"
  placeholder="Enter value..."
  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>
```

**Select Dropdown:**

```tsx
<div className="grid gap-2">
  <Label>Reporting To Manager</Label>
  <Select>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select manager" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1">Option 1</SelectItem>
      <SelectItem value="2">Option 2</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Textarea:**

```tsx
<textarea
  rows={4}
  placeholder="Enter description..."
  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
/>
```

### 4. Badges/Tags

**Status Badge:**

```tsx
<span className="px-2 py-1 text-xs rounded-full bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400">
  Active
</span>
```

**Color Variations:**

- Success: `bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400`
- Warning: `bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-400`
- Error: `bg-error-100 dark:bg-error-950 text-error-700 dark:text-error-400`
- Info: `bg-info-100 dark:bg-info-950 text-info-700 dark:text-info-400`
- Neutral: `bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400`

### 5. Modals/Drawers

**Right Drawer (for forms):**

```tsx
<div className="fixed inset-0 z-50 flex">
  {/* Backdrop */}
  <div
    className="fixed inset-0 bg-black/50"
    onClick={onClose}
  />

  {/* Drawer */}
  <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-neutral-950 shadow-xl overflow-y-auto">
    {/* Header */}
    <div className="sticky top-0 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 p-6 flex items-center justify-between">
      <h2>Drawer Title</h2>
      <button onClick={onClose}>
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Content */}
    <div className="p-6">{/* Form content */}</div>

    {/* Footer */}
    <div className="sticky bottom-0 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 p-6 flex justify-end gap-3">
      <button>Cancel</button>
      <button>Save</button>
    </div>
  </div>
</div>
```

**Center Modal (for confirmations):**

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Backdrop */}
  <div
    className="fixed inset-0 bg-black/50"
    onClick={onClose}
  />

  {/* Modal */}
  <div className="relative bg-white dark:bg-neutral-950 rounded-lg shadow-xl max-w-md w-full p-6">
    <h3>Confirm Action</h3>
    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
      Are you sure you want to proceed?
    </p>
    <div className="flex justify-end gap-3 mt-6">
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  </div>
</div>
```

### 6. Tabs

**Horizontal Tabs:**

```tsx
<div className="border-b border-neutral-200 dark:border-neutral-800">
  <div className="flex gap-6">
    <button className="pb-3 border-b-2 border-primary-600 text-primary-600 dark:text-primary-400">
      Active Tab
    </button>
    <button className="pb-3 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
      Inactive Tab
    </button>
  </div>
</div>
```

### 7. Dropdown Menus

**Standard Dropdown:**

```tsx
{
  /* Trigger */
}
<button onClick={() => setShowDropdown(!showDropdown)}>
  <MoreVertical className="w-5 h-5" />
</button>;

{
  /* Dropdown */
}
{
  showDropdown && (
    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50">
      <button className="w-full px-4 py-2 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm">Action</span>
      </button>
    </div>
  );
}
```

---

## 📊 View Patterns

### Grid View Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <div
      key={item.id}
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Card content */}
    </div>
  ))}
</div>
```

### List View Pattern

```tsx
<div className="space-y-[17px]">
  {items.map((item) => (
    <div 
      key={item.id}
      className="group bg-white dark:bg-neutral-950 relative rounded-[8px] w-full cursor-pointer hover:shadow-md transition-all" 
      onClick={() => onView(item.id)}
    >
      {/* Hover Border Effect */}
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] dark:border-neutral-800 border-solid inset-0 pointer-events-none rounded-[8px] group-hover:border-primary-300 dark:group-hover:border-primary-700 transition-colors" />
      
      <div className="size-full">
        <div className="content-stretch flex flex-col items-start p-[17px] relative size-full">
          <div className="content-stretch flex h-[48px] items-center justify-between relative shrink-0 w-full">
             {/* Left Column */}
            <div className="basis-0 grow h-[48px] min-h-px min-w-px relative shrink-0">
               <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start relative size-full">
                  {/* Top Row: Name + Status */}
                  <div className="content-stretch flex gap-[8px] h-[24px] items-center relative shrink-0 w-full">
                     {/* Status Dot + Name */}
                     <div className="h-[24px] relative shrink-0 flex items-center gap-[6px]">
                        <div className={`rounded-full size-[10px] shrink-0 ${item.isActive ? 'bg-[#22c55e]' : 'bg-neutral-400'}`} />
                        <h4 className="font-sans leading-[24px] text-[#171717] dark:text-white text-nowrap font-medium">
                          {item.name}
                        </h4>
                     </div>
                     
                     {/* Type Pill */}
                     <div className="bg-white dark:bg-neutral-950 h-[26px] relative rounded-full shrink-0 px-3">
                        <div aria-hidden="true" className="absolute border border-[#e5e5e5] dark:border-neutral-800 border-solid inset-0 pointer-events-none rounded-full shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
                        <div className="relative size-full flex items-center gap-2">
                           <div className="rounded-full size-[6px] bg-[#3b82f6]" />
                           <p className="font-sans font-normal leading-[16px] text-[#525252] dark:text-neutral-400 text-[12px] text-nowrap">
                             {item.type}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Bottom Row: Details */}
                  <div className="content-stretch flex gap-[16px] h-[20px] items-center relative shrink-0 w-full text-[#525252] dark:text-neutral-400 text-[14px]">
                     <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{item.location}</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{item.count} employees</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Side: Actions */}
            <div className="relative shrink-0">
               <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                 <MoreVertical className="w-4 h-4 text-neutral-500" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
```

### Table View Pattern

```tsx
<div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
  <table className="w-full">
    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <tr>
        <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {items.map((item) => (
        <tr
          key={item.id}
          className="hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
        >
          <td className="px-4 py-3 text-sm text-neutral-900 dark:text-white">
            {item.name}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Kanban View Pattern

```tsx
<div className="flex gap-4 overflow-x-auto pb-4">
  {stages.map((stage) => (
    <div key={stage.id} className="flex-shrink-0 w-80">
      {/* Stage Header */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">{stage.name}</span>
          <span className="text-xs text-neutral-500">
            {stage.count}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {stage.items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3"
          >
            {/* Card content */}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

---

## 🎛️ Spacing System

**Use Tailwind's spacing consistently:**

```
gap-2   = 8px   (tight spacing)
gap-3   = 12px  (compact)
gap-4   = 16px  (default between elements)
gap-6   = 24px  (section spacing)
gap-8   = 32px  (large spacing)

p-2     = 8px   (tight padding)
p-3     = 12px  (compact padding)
p-4     = 16px  (default card padding)
p-5     = 20px  (mobile main padding)
p-6     = 24px  (desktop main padding)
```

---

## 🎨 Border & Shadow System

### Borders

```css
/* Default border */
border border-neutral-200 dark:border-neutral-800

/* Colored left border (emphasis) */
border-l-4 border-l-primary-500

/* Top border (dividers) */
border-t border-neutral-200 dark:border-neutral-800
```

### Border Radius

```
rounded-lg  = 8px  (default for cards, buttons)
rounded-full = 9999px (pills, avatars)
rounded-md = 6px (small elements)
```

### Shadows

```
shadow-sm   (subtle cards)
shadow-md   (hover states)
shadow-lg   (dropdowns, modals)
shadow-xl   (drawers)
```

---

## 🖼️ Icons

**Library:** lucide-react

**Standard Icon Sizes:**

```tsx
<Icon className="w-4 h-4" />  // Small (buttons, inline)
<Icon className="w-5 h-5" />  // Default (most UI)
<Icon className="w-6 h-6" />  // Large (emphasis)
<Icon className="w-8 h-8" />  // Extra large (empty states)
```

**Icon Colors:**

```
text-neutral-400 dark:text-neutral-600  (muted icons)
text-neutral-600 dark:text-neutral-400  (default icons)
text-primary-600 dark:text-primary-400  (primary actions)
```

---

## 📱 Responsive Breakpoints

```
sm:  640px  (mobile landscape)
md:  768px  (tablet)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (extra large)
```

**Common Responsive Patterns:**

```tsx
// Sidebar responsive
className={isSidebarCollapsed ? 'ml-16' : 'ml-64'}

// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Padding responsive
className="p-5 md:p-6"

// Text responsive
className="text-sm md:text-base"
```

---

## 🎯 Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Icon className="w-12 h-12 text-neutral-400 dark:text-neutral-600 mb-4" />
  <h3 className="text-neutral-900 dark:text-white mb-2">
    No Items Found
  </h3>
  <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
    Get started by creating your first item.
  </p>
  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
    <Plus className="w-4 h-4 inline mr-2" />
    Add New Item
  </button>
</div>
```

---

## 🔄 Loading States

**Spinner:**

```tsx
<div className="flex items-center justify-center py-16">
  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
</div>
```

**Skeleton Loader:**

```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
</div>
```

---

## 🎨 Status Colors

**Use these semantic colors consistently:**

```tsx
// Success (green)
className =
  "text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-950";

// Warning (yellow/orange)
className =
  "text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-950";

// Error (red)
className =
  "text-error-600 dark:text-error-400 bg-error-100 dark:bg-error-950";

// Info (blue)
className =
  "text-info-600 dark:text-info-400 bg-info-100 dark:bg-info-950";
```

---

## ✅ Do's and Don'ts

### ✅ DO

- Use Inter font only
- Use 14px base font size
- Use semantic color tokens (--primary, --success, etc.)
- Use colored borders for emphasis
- Use clean white backgrounds
- Follow spacing system (gap-4, p-4, etc.)
- Support dark mode for every component
- Use consistent border-radius (rounded-lg)
- Keep UI fast and simple

### ❌ DON'T

- Don't use gradients
- Don't use custom font sizes with Tailwind (text-2xl, font-bold, etc.)
- Don't use filled color backgrounds for cards (except badges)
- Don't mix different border radius sizes
- Don't create custom colors outside the theme system
- Don't use shadows excessively
- Don't forget dark mode variants

---

## 📦 File Structure (For New Projects)

```
/your-new-app/
├── /styles/
│   └── globals.css              ← COPY THIS EXACTLY
├── /components/
│   ├── GlobalHeader.tsx         ← COPY THIS EXACTLY
│   ├── Sidebar.tsx              ← COPY & CUSTOMIZE menu items
│   ├── CompanySelector.tsx      ← COPY THIS EXACTLY
│   └── /your-module/
│       ├── YourListing.tsx      ← Use CRM listing pattern
│       ├── YourDetail.tsx       ← Use CRM detail pattern
│       ├── AddYourForm.tsx      ← Use CRM form pattern
│       └── mockData.ts          ← Your data
├── /imports/
│   └── logo.png                 ← Your logo
└── App.tsx                      ← COPY structure, change module logic
```

---

## 🚀 Quick Start for New Application

1. **Copy Foundation Files:**
   - `/styles/globals.css` (100% as-is)
   - `/components/GlobalHeader.tsx` (100% as-is)
   - `/components/CompanySelector.tsx` (100% as-is)

2. **Adapt Sidebar:**
   - Copy `/components/Sidebar.tsx`
   - Change `menuItems` array (lines ~110-175)
   - Update module types

3. **Copy Layout Structure:**
   - Copy `/App.tsx` layout structure
   - Change module routing logic

4. **Build Your Modules:**
   - Use listing patterns (grid, list, table, kanban)
   - Use detail page patterns (tabs, activity)
   - Use form patterns (drawers, modals)

5. **Use Same Data Structure:**
   - Follow mockData.ts patterns
   - Use same helper functions (formatDate, formatCurrency, etc.)

---

## 📞 Support

This design system is battle-tested and production-ready. Every component, color, and pattern has been carefully designed for enterprise SaaS applications.

**Key Files Reference:**

- Color System: `/styles/globals.css` (lines 1-500)
- Layout: `/App.tsx` (lines 1-100)
- Header: `/components/GlobalHeader.tsx`
- Sidebar: `/components/Sidebar.tsx`
- Listing Pattern: `/components/crm/LeadListing.tsx`
- Detail Pattern: `/components/crm/FullLeadDetail.tsx`

---

**Last Updated:** December 19, 2025
**Version:** 1.0
**Designer:** CRM Team