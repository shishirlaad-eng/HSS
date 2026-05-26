# Global Header Component Template

## Overview
A comprehensive, reusable global header component with search functionality, notifications, theme switching, and user profile management. Designed for enterprise applications with full dark mode support.

---

## Component Structure

```
GlobalHeader
├── Left Section (Logo + Search)
│   ├── Logo (Conditional)
│   └── Global Search
│       ├── Search Input
│       └── Search Dropdown
│           ├── Search Results (with categories)
│           ├── Quick Access Modules
│           ├── Recent Searches
│           └── Search Tips Footer
│
└── Right Section (Action Icons)
    ├── Notifications Dropdown
    ├── Theme Selector Dropdown
    ├── Dark Mode Toggle
    └── User Profile Dropdown
```

---

## Layout Specifications

### Header Container
- **Element**: `<header>`
- **Position**: `sticky top-0`
- **Z-Index**: `z-50` (50)
- **Height**: `h-12` (48px)
- **Padding**: `px-6` (24px horizontal)
- **Background**: 
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`
- **Border** (on scroll):
  - Light: `border-b border-neutral-200`
  - Dark: `dark:border-neutral-800`
- **Shadow** (on scroll): `shadow-sm`

### Main Container
- **Display**: `flex items-center justify-between`
- **Gap**: `gap-4` (16px)

---

## Left Section Components

### 1. Logo (Conditional Display)
**Display Condition**: Only when sidebar is collapsed

```jsx
<div className="flex items-center gap-2 flex-shrink-0">
  <img
    src={logo}
    alt="Logo"
    className="h-8 w-auto object-contain"
  />
</div>
```

**Specifications**:
- Container Gap: `gap-2` (8px)
- Image Height: `h-8` (32px)
- Image Width: `w-auto`
- Object Fit: `object-contain`

---

### 2. Global Search Component

#### Search Container
- **Container**: `relative flex-1`
- **Max Width**: Parent has `max-w-md` (448px)

#### Search Icon
```jsx
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-500 dark:text-neutral-400" />
```

**Specifications**:
- Position: `absolute left-3 top-1/2 -translate-y-1/2`
- Size: `w-[18px] h-[18px]`
- Color:
  - Light: `text-neutral-500`
  - Dark: `dark:text-neutral-400`

#### Search Input
```jsx
<input
  type="text"
  placeholder="Search across all modules..."
  className="w-full pl-10 pr-20 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
/>
```

**Specifications**:
- Width: `w-full`
- Padding: 
  - Left: `pl-10` (40px)
  - Right: `pr-20` (80px)
  - Vertical: `py-1.5` (6px)
- Background:
  - Light: `bg-neutral-50`
  - Dark: `dark:bg-neutral-900`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-lg` (8px)
- Font Size: `text-sm` (14px)
- Text Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Placeholder Color:
  - Light: `placeholder:text-neutral-500`
  - Dark: `dark:placeholder:text-neutral-500`
- Focus States:
  - Outline: `focus:outline-none`
  - Ring: `focus:ring-2 focus:ring-primary-500`
  - Border: `focus:border-transparent`
- Transition: `transition-all`

#### Keyboard Shortcut Badge
```jsx
<kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] rounded border border-neutral-300 dark:border-neutral-700">
  ⌘K
</kbd>
```

**Specifications**:
- Display: `hidden sm:inline-block`
- Position: `absolute right-3 top-1/2 -translate-y-1/2`
- Padding: `px-1.5 py-0.5` (6px/2px)
- Background:
  - Light: `bg-neutral-200`
  - Dark: `dark:bg-neutral-800`
- Text Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Font Size: `text-[10px]`
- Border Radius: `rounded`
- Border:
  - Light: `border border-neutral-300`
  - Dark: `dark:border-neutral-700`

---

### 3. Search Dropdown

#### Dropdown Container
```jsx
<div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl overflow-hidden">
```

**Specifications**:
- Position: `absolute left-0 top-full`
- Margin Top: `mt-2` (8px)
- Width: `w-full`
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-lg` (8px)
- Shadow: `shadow-2xl`
- Overflow: `overflow-hidden`

#### Search Results Section

**Results Container**:
- Max Height: `max-h-[500px]`
- Overflow: `overflow-y-auto`

**Category Header**:
```jsx
<div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50">
  <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-400 uppercase tracking-wide">
    {category}
  </div>
</div>
```

**Specifications**:
- Padding: `px-3 py-2` (12px/8px)
- Background:
  - Light: `bg-neutral-50`
  - Dark: `dark:bg-neutral-900/50`
- Text:
  - Size: `text-xs` (12px)
  - Weight: `font-semibold`
  - Color Light: `text-neutral-700`
  - Color Dark: `dark:text-neutral-400`
  - Transform: `uppercase`
  - Tracking: `tracking-wide`

**Result Item Button**:
```jsx
<button className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors flex items-center gap-3 group">
```

**Specifications**:
- Width: `w-full`
- Padding: `px-4 py-3` (16px/12px)
- Text Align: `text-left`
- Hover Background:
  - Light: `hover:bg-primary-50`
  - Dark: `dark:hover:bg-primary-900/30`
- Display: `flex items-center`
- Gap: `gap-3` (12px)
- Group: `group` (for child hover states)
- Transition: `transition-colors`

**Icon Container**:
```jsx
<div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
  <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
</div>
```

**Specifications**:
- Size: `w-9 h-9` (36px x 36px)
- Background:
  - Light: `bg-neutral-100`
  - Dark: `dark:bg-neutral-900`
- Hover Background:
  - Light: `group-hover:bg-primary-100`
  - Dark: `dark:group-hover:bg-primary-900/30`
- Border Radius: `rounded-lg` (8px)
- Display: `flex items-center justify-center`
- Shrink: `flex-shrink-0`
- Icon Size: `w-5 h-5` (20px x 20px)
- Icon Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Icon Hover Color:
  - Light: `group-hover:text-primary-600`
  - Dark: `dark:group-hover:text-primary-400`

**Result Title**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Margin Bottom: `mb-0.5` (2px)

**Result Description**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

**Status Badge**:
```jsx
<div className="px-2 py-0.5 text-[10px] rounded-full flex-shrink-0">
```

**Specifications**:
- Padding: `px-2 py-0.5` (8px/2px)
- Font Size: `text-[10px]`
- Border Radius: `rounded-full`
- Shrink: `flex-shrink-0`

**Status Badge Colors**:

**Success States** (Approved, Present, On Time):
- Light: `bg-success-100 text-success-700`
- Dark: `dark:bg-success-900/30 dark:text-success-400`

**Warning States** (Pending, Correction Needed):
- Light: `bg-warning-100 text-warning-700`
- Dark: `dark:bg-warning-900/30 dark:text-warning-400`

**Error States** (On Leave, Late, Rejected):
- Light: `bg-error-100 text-error-700`
- Dark: `dark:bg-error-900/30 dark:text-error-400`

**Neutral States** (Default):
- Light: `bg-neutral-100 text-neutral-700`
- Dark: `dark:bg-neutral-800 dark:text-neutral-400`

**Chevron Icon**:
- Size: `w-4 h-4` (16px x 16px)
- Color:
  - Light: `text-neutral-400`
  - Dark: `dark:text-neutral-600`
- Opacity: `opacity-0 group-hover:opacity-100`
- Transition: `transition-opacity`

#### Quick Access Section

**Section Container**:
- Border: `border-b border-neutral-200 dark:border-neutral-800`

**Quick Access Item**:
```jsx
<button className="w-full px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-3">
```

**Specifications**:
- Width: `w-full`
- Padding: `px-3 py-2.5` (12px/10px)
- Text Align: `text-left`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Border Radius: `rounded-lg` (8px)
- Display: `flex items-center`
- Gap: `gap-3` (12px)
- Transition: `transition-colors`

#### Recent Searches Section

**Recent Search Item**:
```jsx
<button className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-3 group">
```

**Specifications**:
- Width: `w-full`
- Padding: `px-3 py-2` (12px/8px)
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Border Radius: `rounded-lg` (8px)
- Display: `flex items-center`
- Gap: `gap-3` (12px)

**Clock Icon**:
- Size: `w-4 h-4` (16px x 16px)
- Color:
  - Light: `text-neutral-400`
  - Dark: `dark:text-neutral-600`

**Remove Button (X)**:
- Size: `w-3.5 h-3.5` (14px x 14px)
- Opacity: `opacity-0 group-hover:opacity-100`
- Color:
  - Light: `text-neutral-500`
  - Dark: `dark:text-neutral-400`
- Hover Color:
  - Light: `hover:text-error-500`
  - Dark: `dark:hover:text-error-400`

#### Empty State

**Container**:
- Padding: `p-8` (32px)
- Text Align: `text-center`

**Icon**:
- Size: `w-12 h-12` (48px x 48px)
- Color:
  - Light: `text-neutral-300`
  - Dark: `dark:text-neutral-700`
- Margin: `mx-auto mb-3`

**Title**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Margin Bottom: `mb-1` (4px)

**Description**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

#### Search Tips Footer

**Container**:
```jsx
<div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
```

**Specifications**:
- Padding: `px-4 py-2` (16px/8px)
- Background:
  - Light: `bg-neutral-50`
  - Dark: `dark:bg-neutral-900/50`
- Border:
  - Light: `border-t border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Display: `flex items-center justify-between`
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

**Kbd Elements**:
- Padding: `px-1.5 py-0.5` (6px/2px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-800`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-700`
- Border Radius: `rounded`
- Font Size: `text-[10px]`

---

## Right Section Components

### Action Icons Container
```jsx
<div className="flex items-center gap-1.5">
```

**Specifications**:
- Display: `flex items-center`
- Gap: `gap-1.5` (6px)

---

### 1. Notifications Dropdown

#### Notification Button
```jsx
<button className="relative w-9 h-9 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors">
```

**Specifications**:
- Position: `relative`
- Size: `w-9 h-9` (36px x 36px)
- Display: `flex items-center justify-center`
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Hover Background:
  - Light: `hover:bg-neutral-100`
  - Dark: `dark:hover:bg-neutral-900`
- Border Radius: `rounded-lg` (8px)
- Transition: `transition-colors`

**Icon Size**: `w-5 h-5` (20px x 20px)

#### Notification Badge
```jsx
<span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-error-500 text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
```

**Specifications**:
- Position: `absolute top-0 right-0`
- Min Width: `min-w-[18px]`
- Height: `h-[18px]`
- Padding: `px-1` (4px)
- Background: `bg-error-500`
- Text Color: `text-white`
- Font Size: `text-[11px]`
- Font Weight: `font-semibold`
- Border Radius: `rounded-full`
- Display: `flex items-center justify-center`

#### Notification Dropdown Panel
```jsx
<div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
```

**Specifications**:
- Position: `absolute right-0 top-full`
- Margin Top: `mt-2` (8px)
- Width: `w-80` (320px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-lg` (8px)
- Shadow: `shadow-xl`
- Overflow: `overflow-hidden`

#### Notification Header
```jsx
<div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
```

**Specifications**:
- Padding: `p-3` (12px)
- Border:
  - Light: `border-b border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Display: `flex items-center justify-between`

**Header Title**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-semibold`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`

**Unread Count**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-primary-600`
  - Dark: `dark:text-primary-400`

#### Notification List
**Container**:
- Max Height: `max-h-96` (384px)
- Overflow: `overflow-y-auto`

**Notification Item**:
```jsx
<div className="p-3 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer">
```

**Specifications**:
- Padding: `p-3` (12px)
- Border:
  - Light: `border-b border-neutral-100`
  - Dark: `dark:border-neutral-800`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Cursor: `cursor-pointer`
- Transition: `transition-colors`

**Unread Background** (additional):
- Light: `bg-primary-50/30`
- Dark: `dark:bg-primary-950/30`

**Unread Dot**:
- Size: `w-2 h-2` (8px x 8px)
- Background:
  - Light: `bg-primary-600`
  - Dark: `dark:bg-primary-400`
- Border Radius: `rounded-full`
- Margin Top: `mt-1.5` (6px)

**Notification Title**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Margin Bottom: `mb-0.5` (2px)

**Notification Message**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Margin Bottom: `mb-1` (4px)

**Notification Time**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-500`
  - Dark: `dark:text-neutral-500`

#### Notification Footer
```jsx
<div className="p-2 border-t border-neutral-200 dark:border-neutral-800">
  <button className="w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 rounded transition-colors">
```

**Specifications**:
- Container Padding: `p-2` (8px)
- Border:
  - Light: `border-t border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Button Width: `w-full`
- Button Padding: `py-2` (8px vertical)
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-primary-600`
  - Dark: `dark:text-primary-400`
- Hover Background:
  - Light: `hover:bg-primary-50`
  - Dark: `dark:hover:bg-primary-950`
- Border Radius: `rounded`
- Transition: `transition-colors`

---

### 2. Theme Selector Dropdown

#### Theme Button
```jsx
<button className="w-9 h-9 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors">
```

**Specifications**: Same as Notification Button

#### Theme Dropdown Panel
```jsx
<div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
```

**Specifications**:
- Width: `w-64` (256px)
- All other specs same as Notification Dropdown Panel

#### Theme Header
```jsx
<div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
  <div className="text-xs font-medium text-neutral-900 dark:text-white px-2 py-1">
```

**Specifications**:
- Container Padding: `p-2` (8px)
- Border:
  - Light: `border-b border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Text Padding: `px-2 py-1` (8px/4px)
- Font Size: `text-xs` (12px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`

#### Theme List
**Container**:
- Max Height: `max-h-64` (256px)
- Overflow: `overflow-y-auto`

**Theme Item**:
```jsx
<button className="w-full px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
```

**Specifications**:
- Width: `w-full`
- Padding: `px-3 py-2.5` (12px/10px)
- Text Align: `text-left`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Transition: `transition-colors`

**Theme Name**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Margin Bottom: `mb-0.5` (2px)

**Theme Description**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

**Check Icon** (Active Theme):
- Size: `w-4 h-4` (16px x 16px)
- Color:
  - Light: `text-primary-600`
  - Dark: `dark:text-primary-400`
- Margin Top: `mt-0.5` (2px)
- Shrink: `flex-shrink-0`

---

### 3. Dark Mode Toggle

```jsx
<button className="w-9 h-9 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-all hover:scale-105 active:scale-95">
```

**Specifications**:
- Size: `w-9 h-9` (36px x 36px)
- Display: `flex items-center justify-center`
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Hover Background:
  - Light: `hover:bg-neutral-100`
  - Dark: `dark:hover:bg-neutral-900`
- Border Radius: `rounded-lg` (8px)
- Transition: `transition-all`
- Hover Scale: `hover:scale-105` (1.05)
- Active Scale: `active:scale-95` (0.95)

**Icon Size**: `w-5 h-5` (20px x 20px)

---

### 4. User Profile Dropdown

#### User Avatar Button
```jsx
<button className="h-9 px-2 flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors">
```

**Specifications**:
- Height: `h-9` (36px)
- Padding: `px-2` (8px)
- Display: `flex items-center`
- Gap: `gap-1.5` (6px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Hover Background:
  - Light: `hover:bg-neutral-100`
  - Dark: `dark:hover:bg-neutral-900`
- Border Radius: `rounded-lg` (8px)
- Transition: `transition-colors`

#### Avatar Circle
```jsx
<div className="w-7 h-7 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
```

**Specifications**:
- Size: `w-7 h-7` (28px x 28px)
- Background:
  - Light: `bg-primary-600`
  - Dark: `dark:bg-primary-500`
- Border Radius: `rounded-full`
- Display: `flex items-center justify-center`
- Text Color: `text-white`
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`

#### Chevron Icon
- Size: `w-3.5 h-3.5` (14px x 14px)
- Display: `hidden lg:inline`

#### User Dropdown Panel
```jsx
<div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
```

**Specifications**:
- Width: `w-72` (288px)
- All other specs same as Notification Dropdown Panel

#### User Info Section
```jsx
<div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
```

**Specifications**:
- Padding: `p-4` (16px)
- Border:
  - Light: `border-b border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Display: `flex items-start`
- Gap: `gap-3` (12px)

**Large Avatar**:
- Size: `w-12 h-12` (48px x 48px)
- Background:
  - Light: `bg-primary-600`
  - Dark: `dark:bg-primary-500`
- Border Radius: `rounded-full`
- Display: `flex items-center justify-center`
- Text Color: `text-white`
- Font Weight: `font-medium`
- Shrink: `flex-shrink-0`

**User Name**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Margin Bottom: `mb-0.5` (2px)

**User Email**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Margin Bottom: `mb-1` (4px)

**User Role**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-500`
  - Dark: `dark:text-neutral-500`

#### Menu Items Section
```jsx
<div className="p-1">
  <button className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2">
```

**Specifications**:
- Container Padding: `p-1` (4px)
- Button Width: `w-full`
- Button Padding: `px-3 py-2` (12px/8px)
- Text Align: `text-left`
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Border Radius: `rounded`
- Transition: `transition-colors`
- Display: `flex items-center`
- Gap: `gap-2` (8px)

**Menu Icon**:
- Size: `w-4 h-4` (16px x 16px)

#### Logout Section
```jsx
<div className="p-1 border-t border-neutral-200 dark:border-neutral-800">
  <button className="w-full px-3 py-2 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 rounded transition-colors flex items-center gap-2">
```

**Specifications**:
- Container: Same as Menu Items Section with border-top
- Button: Same as Menu Items with error colors
- Text Color:
  - Light: `text-error-600`
  - Dark: `dark:text-error-400`
- Hover Background:
  - Light: `hover:bg-error-50`
  - Dark: `dark:hover:bg-error-950`

---

## Color System Reference

### Semantic Colors

#### Primary (Brand/Interactive)
- `primary-50`: Light background hover states
- `primary-100`: Lighter backgrounds
- `primary-400`: Dark mode primary
- `primary-500`: Focus rings, accents
- `primary-600`: Primary text/icons light mode
- `primary-900`: Dark backgrounds (30% opacity)
- `primary-950`: Very dark backgrounds

#### Success (Approved, Confirmed)
- `success-100`: Light background
- `success-400`: Dark mode text
- `success-700`: Light mode text
- `success-900`: Dark background (30% opacity)
- `success-950`: Very dark background

#### Warning (Pending, Attention)
- `warning-100`: Light background
- `warning-200`: Highlight background
- `warning-400`: Dark mode text
- `warning-700`: Light mode text
- `warning-900`: Dark background (30% opacity)

#### Error (Critical, Rejected)
- `error-50`: Light hover background
- `error-100`: Light background
- `error-400`: Dark mode text/icons
- `error-500`: Badges, notifications
- `error-600`: Light mode text/icons
- `error-700`: Light mode text
- `error-900`: Dark background (30% opacity)
- `error-950`: Very dark background

#### Neutral (General UI)
- `neutral-50`: Light input backgrounds
- `neutral-100`: Light borders, backgrounds
- `neutral-200`: Borders, kbd backgrounds
- `neutral-300`: Lighter borders
- `neutral-400`: Icons, subtle text
- `neutral-500`: Placeholder text
- `neutral-600`: Secondary text
- `neutral-700`: Primary text
- `neutral-800`: Dark borders
- `neutral-900`: Dark input backgrounds
- `neutral-950`: Dark panel backgrounds

### Text Colors

#### Light Mode
- Primary Text: `text-neutral-900`
- Secondary Text: `text-neutral-600`
- Tertiary Text: `text-neutral-500`
- Interactive Text: `text-primary-600`
- Success Text: `text-success-700`
- Warning Text: `text-warning-700`
- Error Text: `text-error-600`

#### Dark Mode
- Primary Text: `dark:text-white`
- Secondary Text: `dark:text-neutral-400`
- Tertiary Text: `dark:text-neutral-500`
- Interactive Text: `dark:text-primary-400`
- Success Text: `dark:text-success-400`
- Warning Text: `dark:text-warning-400`
- Error Text: `dark:text-error-400`

---

## Typography Scale

### Font Sizes
- **Extra Small**: `text-[10px]` - Badges, kbd shortcuts
- **Small**: `text-xs` (12px) - Descriptions, helper text
- **Base**: `text-sm` (14px) - Buttons, inputs, body text
- **Badge Text**: `text-[11px]` - Notification counts

### Font Weights
- **Regular**: Default (400)
- **Medium**: `font-medium` (500) - Titles, emphasized text
- **Semi-Bold**: `font-semibold` (600) - Section headers
- **Bold**: `font-bold` (700) - Not commonly used

---

## Spacing Scale

### Padding
- `p-1`: 4px
- `p-2`: 8px
- `p-3`: 12px
- `p-4`: 16px
- `p-8`: 32px

### Gap
- `gap-1`: 4px
- `gap-1.5`: 6px
- `gap-2`: 8px
- `gap-3`: 12px
- `gap-4`: 16px

### Margin
- `mb-0.5`: 2px
- `mb-1`: 4px
- `mb-2`: 8px
- `mb-3`: 12px
- `mt-1.5`: 6px
- `mt-2`: 8px

---

## Border Radius

- `rounded`: 4px - Small elements (buttons, kbd)
- `rounded-lg`: 8px - Cards, inputs, dropdowns
- `rounded-full`: Full circle - Badges, avatars, dots

---

## Shadows

- `shadow-sm`: Small shadow for elevated header
- `shadow-xl`: Large shadow for dropdowns
- `shadow-2xl`: Extra large shadow for search dropdown

---

## Transitions & Animations

### Standard Transitions
- `transition-colors`: Color changes (buttons, backgrounds)
- `transition-all`: All properties (inputs, toggles)
- `transition-opacity`: Opacity changes (hover icons)

### Transform Scales
- `hover:scale-105`: 5% scale up on hover
- `active:scale-95`: 5% scale down on active

### Opacity States
- `opacity-0`: Hidden
- `group-hover:opacity-100`: Show on parent hover

---

## Icons

### Icon Library
- **Package**: `lucide-react` v0.487.0

### Icon Sizes
- Small: `w-3.5 h-3.5` (14px) - Chevrons, close buttons
- Medium: `w-4 h-4` (16px) - Menu icons, small UI icons
- Standard: `w-5 h-5` (20px) - Main navigation icons
- Large: `w-9 h-9` (36px) - Icon containers
- Extra Large: `w-10 h-10` (40px), `w-12 h-12` (48px) - Empty states

### Common Icons Used
- `Search`: Search functionality
- `Bell`: Notifications
- `Palette`: Theme selector
- `Sun`/`Moon`: Dark mode toggle
- `User`: Profile
- `Settings`: Settings menu
- `HelpCircle`: Help/Support
- `LogOut`: Sign out
- `Check`: Selected state
- `ChevronDown`: Dropdown indicator
- `ChevronRight`: Navigation, forward action
- `Clock`: Time-related items, recent searches
- `X`: Close, remove actions

---

## Responsive Behavior

### Breakpoints
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up

### Responsive Elements

#### Search Input
- Keyboard shortcut badge: `hidden sm:inline-block`

#### User Avatar
- Chevron: `hidden lg:inline`

---

## Interactive States

### Buttons & Links
- **Default**: Base colors
- **Hover**: Background color change, scale transform
- **Active**: Scale down (0.95)
- **Focus**: Ring outline (`focus:ring-2 focus:ring-primary-500`)

### Inputs
- **Default**: Neutral background
- **Hover**: No visible change
- **Focus**: 
  - Ring: `focus:ring-2 focus:ring-primary-500`
  - Border: `focus:border-transparent`
  - Outline: `focus:outline-none`

### Dropdown Items
- **Default**: Transparent background
- **Hover**: 
  - Background: Light neutral (light mode) or dark neutral (dark mode)
  - For primary actions: Primary tinted background

### Group Hover Patterns
- Icon color changes
- Chevron appears/disappears
- Background transitions
- Use `group` class on parent and `group-hover:` on children

---

## Accessibility

### Keyboard Navigation
- **⌘K / Ctrl+K**: Open search
- **Enter**: Submit/select
- **Escape**: Close dropdowns
- **Tab**: Navigate through interactive elements

### ARIA Attributes
- `title` on icon buttons for tooltips
- `alt` text on images
- Semantic HTML elements

### Focus States
- Visible focus rings on all interactive elements
- `focus:outline-none` paired with `focus:ring-2` for custom focus styles

---

## State Management Requirements

### Search Component
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [showSearchDropdown, setShowSearchDropdown] = useState(false);
const [recentSearches, setRecentSearches] = useState<string[]>([]);
```

### Dropdown Components
```typescript
const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
const [showThemeDropdown, setShowThemeDropdown] = useState(false);
const [showUserDropdown, setShowUserDropdown] = useState(false);
```

### Theme State
```typescript
const [isDarkMode, setIsDarkMode] = useState(false);
const [currentTheme, setCurrentTheme] = useState("natural");
```

### Scroll Detection
```typescript
const [isScrolled, setIsScrolled] = useState(false);
```

---

## Click Outside Detection

### Required Refs
```typescript
const searchRef = useRef<HTMLDivElement>(null);
const notificationsRef = useRef<HTMLDivElement>(null);
const themeRef = useRef<HTMLDivElement>(null);
const userRef = useRef<HTMLDivElement>(null);
const searchInputRef = useRef<HTMLInputElement>(null);
```

### Implementation Pattern
```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

---

## Data Structure Examples

### Search Data Item
```typescript
interface SearchItem {
  id: number;
  title: string;
  type: string;
  category: string;
  icon: LucideIcon;
  description: string;
  status: string;
}
```

### Notification Item
```typescript
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}
```

### Theme Item
```typescript
interface Theme {
  id: string;
  name: string;
  description: string;
}
```

### Quick Access Module
```typescript
interface QuickAccessModule {
  id: number;
  name: string;
  icon: LucideIcon;
  description: string;
  module: string;
}
```

---

## Implementation Checklist

### Basic Structure
- [ ] Header container with sticky positioning
- [ ] Left section with logo and search
- [ ] Right section with action icons
- [ ] Responsive layout with proper gaps

### Search Component
- [ ] Search input with icon
- [ ] Keyboard shortcut badge (⌘K)
- [ ] Search dropdown with results
- [ ] Category grouping
- [ ] Quick access section
- [ ] Recent searches with localStorage
- [ ] Empty states
- [ ] Search tips footer

### Notifications
- [ ] Notification button with badge
- [ ] Notification dropdown panel
- [ ] Unread indicator (dot)
- [ ] Notification items with hover states
- [ ] "View all" footer button

### Theme Selector
- [ ] Theme button
- [ ] Theme dropdown panel
- [ ] Theme list with checkmark for active
- [ ] Theme switching functionality

### Dark Mode Toggle
- [ ] Toggle button with Sun/Moon icon
- [ ] Scale animation on hover/active
- [ ] Dark mode state management

### User Profile
- [ ] Avatar button with initials
- [ ] User info section
- [ ] Menu items (Profile, Settings, Help)
- [ ] Logout button with error styling

### Interactive Behaviors
- [ ] Click outside to close dropdowns
- [ ] Keyboard shortcuts (⌘K, Enter, Escape)
- [ ] Hover states on all interactive elements
- [ ] Focus states with ring indicators
- [ ] Group hover effects

### Responsive Features
- [ ] Hide keyboard shortcut on mobile
- [ ] Hide chevron on smaller screens
- [ ] Appropriate dropdown widths

### Accessibility
- [ ] All buttons have aria-labels or titles
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Semantic HTML structure

---

## Performance Considerations

1. **Debounce Search**: Implement debouncing for search input
2. **Lazy Load Dropdowns**: Only render dropdown content when open
3. **Virtual Scrolling**: For long notification lists
4. **LocalStorage**: Persist recent searches across sessions
5. **Memoization**: Memoize search results and filtered data

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Custom Properties support required
- Flexbox support required
- Dark mode via CSS class switching (not media query)

---

## Notes

1. All spacing uses Tailwind's spacing scale (4px base)
2. Colors use semantic naming (primary, success, warning, error, neutral)
3. Dark mode uses explicit classes, not automatic detection
4. All dropdowns align to the right edge of their trigger button
5. z-index management: Header (50), Dropdowns (auto stacking context)
6. Transitions are consistent across similar interactions
7. Icon sizes should be consistent within similar contexts
8. Text truncation should be applied where content might overflow

---

## Usage Example

```tsx
import { GlobalHeader } from '@/components/GlobalHeader';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('natural');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <GlobalHeader
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSidebarCollapsed={isSidebarCollapsed}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />
      {/* Rest of your app */}
    </div>
  );
}
```

---

## Customization Guide

### Changing Primary Color
Replace all `primary-*` classes with your brand color scale.

### Adjusting Height
Change `h-12` on header container to desired height. Adjust icon and padding proportionally.

### Modifying Dropdown Width
- Search: `w-full` (matches input)
- Notifications: `w-80` (320px)
- Theme: `w-64` (256px)
- User: `w-72` (288px)

### Adding New Sections
Follow the established patterns:
1. Create button with standard sizing (`w-9 h-9`)
2. Use standard hover states
3. Position dropdown with `absolute right-0 top-full mt-2`
4. Apply standard dropdown styling
5. Add click-outside detection

---

## Version History

- **v1.0** - Initial template based on Global Header implementation
- Designed for Nigerian Hospitality Sector Attendance Application
- Extracted as reusable template for future projects

---

## Support & Maintenance

For questions or improvements to this template:
1. Document any deviations from this spec
2. Update this template when making global design changes
3. Maintain consistency across all projects using this template

---

**Last Updated**: December 24, 2024
