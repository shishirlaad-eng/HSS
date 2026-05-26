# Reporting Pagination Template

## Overview
The Pagination component is used at the bottom of reporting/listing pages to navigate through large datasets. It only displays when there are **20 or more total records** and provides page navigation, item count information, and items-per-page selection.

---

## Display Condition

### Show Pagination When:
```typescript
{filteredData.length >= 20 && (
  <div className="mt-5">
    <Pagination
      currentPage={currentPage}
      totalPages={Math.ceil(filteredData.length / itemsPerPage)}
      onPageChange={setCurrentPage}
      totalItems={filteredData.length}
      itemsPerPage={itemsPerPage}
    />
  </div>
)}
```

**Rule**: Pagination displays only when `totalItems >= 20`

---

## Component Structure

```
Pagination
├── Container
│   ├── Left Section - Items Info
│   │   └── "Showing X to Y of Z items"
│   │
│   └── Right Section - Navigation
│       ├── Items Per Page Selector
│       ├── First Page Button
│       ├── Previous Page Button
│       ├── Page Number Buttons (1, 2, 3, ..., N)
│       ├── Next Page Button
│       └── Last Page Button
```

---

## Usage

```tsx
import { Pagination } from '../components/hb/listing';

<Pagination
  currentPage={currentPage}
  totalPages={Math.ceil(filteredData.length / itemsPerPage)}
  onPageChange={setCurrentPage}
  totalItems={filteredData.length}
  itemsPerPage={itemsPerPage}
/>
```

### Props
```typescript
interface PaginationProps {
  currentPage: number;        // Current active page (1-based)
  totalPages: number;          // Total number of pages
  onPageChange: (page: number) => void;  // Page change handler
  totalItems: number;          // Total number of items in dataset
  itemsPerPage: number;        // Items displayed per page
  onItemsPerPageChange?: (count: number) => void;  // Optional
}
```

---

## Layout Specifications

### Container
```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
  {/* Left: Items info */}
  {/* Right: Navigation */}
</div>
```

**Specifications**:
- Display: 
  - Mobile: `flex flex-col items-start` (stacked)
  - Desktop: `sm:flex-row sm:items-center` (horizontal)
- Justify: `justify-between`
- Gap: `gap-4` (16px)
- Padding: `py-4` (16px vertical)
- Background: Transparent (inherits parent)

---

## Left Section - Items Info

### Component
```tsx
<div className="text-sm text-neutral-600 dark:text-neutral-400">
  Showing <span className="font-medium text-neutral-900 dark:text-white">{startItem}</span> to{' '}
  <span className="font-medium text-neutral-900 dark:text-white">{endItem}</span> of{' '}
  <span className="font-medium text-neutral-900 dark:text-white">{totalItems}</span> items
</div>
```

**Calculations**:
```typescript
const startItem = (currentPage - 1) * itemsPerPage + 1;
const endItem = Math.min(currentPage * itemsPerPage, totalItems);
```

**Example Output**: "Showing 21 to 40 of 156 items"

**Specifications**:
- Font Size: `text-sm` (14px)
- Base Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Numbers (emphasized):
  - Font Weight: `font-medium`
  - Color:
    - Light: `text-neutral-900`
    - Dark: `dark:text-white`

---

## Right Section - Navigation Controls

### Container
```tsx
<div className="flex items-center gap-2">
  {/* Items per page selector */}
  {/* Navigation buttons */}
</div>
```

**Specifications**:
- Display: `flex items-center`
- Gap: `gap-2` (8px between elements)

---

## Items Per Page Selector

### Component
```tsx
<div className="flex items-center gap-2">
  <span className="text-sm text-neutral-600 dark:text-neutral-400">Show:</span>
  <select
    value={itemsPerPage}
    onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
    className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  >
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={50}>50</option>
    <option value={100}>100</option>
  </select>
</div>
```

**Specifications**:

**Label**:
- Text: "Show:"
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

**Select Element**:
- Padding: `px-3 py-1.5` (12px/6px)
- Border: `border border-neutral-300 dark:border-neutral-700`
- Border Radius: `rounded-lg` (8px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-900`
- Text Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Font Size: `text-sm` (14px)
- Focus State:
  - Outline: `focus:outline-none`
  - Ring: `focus:ring-2 focus:ring-primary-500`
  - Border: `focus:border-transparent`

**Options**:
- Values: 10, 20, 50, 100
- Default: 20 items per page

**Behavior**:
- Resets to page 1 when changed
- Recalculates total pages
- Maintains current data filter

---

## Navigation Buttons Container

```tsx
<div className="flex items-center gap-1">
  {/* All navigation buttons */}
</div>
```

**Specifications**:
- Display: `flex items-center`
- Gap: `gap-1` (4px between buttons)

---

## Button Styles

### Base Button Style
```tsx
<button className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
```

**Specifications**:
- Size: `w-8 h-8` (32px x 32px)
- Display: `flex items-center justify-center`
- Border Radius: `rounded-lg` (8px)
- Border: `border border-neutral-300 dark:border-neutral-700`
- Text Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Disabled State:
  - Opacity: `disabled:opacity-50`
  - Cursor: `disabled:cursor-not-allowed`
- Transition: `transition-colors`

---

### Active Page Button Style
```tsx
<button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500 text-white border border-primary-600 dark:border-primary-500 font-medium">
```

**Specifications**:
- Background:
  - Light: `bg-primary-600`
  - Dark: `dark:bg-primary-500`
- Text Color: `text-white`
- Border:
  - Light: `border-primary-600`
  - Dark: `dark:border-primary-500`
- Font Weight: `font-medium`
- No hover state (already active)

---

## Navigation Buttons

### 1. First Page Button
```tsx
<button
  onClick={() => onPageChange(1)}
  disabled={currentPage === 1}
  className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  aria-label="Go to first page"
>
  <ChevronsLeft className="w-4 h-4" />
</button>
```

**Specifications**:
- Icon: `ChevronsLeft` (double chevron left)
- Icon Size: `w-4 h-4` (16px x 16px)
- Disabled: When on first page (`currentPage === 1`)
- Action: Jump to page 1

---

### 2. Previous Page Button
```tsx
<button
  onClick={() => onPageChange(currentPage - 1)}
  disabled={currentPage === 1}
  className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  aria-label="Go to previous page"
>
  <ChevronLeft className="w-4 h-4" />
</button>
```

**Specifications**:
- Icon: `ChevronLeft` (single chevron left)
- Icon Size: `w-4 h-4` (16px x 16px)
- Disabled: When on first page
- Action: Go to previous page

---

### 3. Page Number Buttons

#### Logic for Page Number Display
```typescript
const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  const maxVisible = 5; // Show max 5 page buttons
  
  if (totalPages <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Always show last page
    pages.push(totalPages);
  }
  
  return pages;
};
```

**Examples**:
- Pages 1-5: Show all [1, 2, 3, 4, 5]
- Current page 5 of 20: [1, ..., 4, 5, 6, ..., 20]
- Current page 1 of 20: [1, 2, 3, ..., 20]
- Current page 20 of 20: [1, ..., 18, 19, 20]

#### Page Number Button
```tsx
<button
  onClick={() => onPageChange(page)}
  className={
    page === currentPage
      ? "w-8 h-8 flex items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500 text-white border border-primary-600 dark:border-primary-500 font-medium"
      : "w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
  }
  aria-label={`Go to page ${page}`}
  aria-current={page === currentPage ? 'page' : undefined}
>
  {page}
</button>
```

**Specifications**:
- Font Size: `text-sm` (14px) - inherited
- Current Page: Uses active button style
- Other Pages: Uses base button style
- Click Action: Navigate to that page

#### Ellipsis (...) Indicator
```tsx
<span className="w-8 h-8 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
  ⋯
</span>
```

**Specifications**:
- Size: `w-8 h-8` (matches button size)
- Display: `flex items-center justify-center`
- Color:
  - Light: `text-neutral-500`
  - Dark: `dark:text-neutral-400`
- Character: "⋯" (horizontal ellipsis) or "..."
- Not clickable (span, not button)

---

### 4. Next Page Button
```tsx
<button
  onClick={() => onPageChange(currentPage + 1)}
  disabled={currentPage === totalPages}
  className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  aria-label="Go to next page"
>
  <ChevronRight className="w-4 h-4" />
</button>
```

**Specifications**:
- Icon: `ChevronRight` (single chevron right)
- Icon Size: `w-4 h-4` (16px x 16px)
- Disabled: When on last page (`currentPage === totalPages`)
- Action: Go to next page

---

### 5. Last Page Button
```tsx
<button
  onClick={() => onPageChange(totalPages)}
  disabled={currentPage === totalPages}
  className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  aria-label="Go to last page"
>
  <ChevronsRight className="w-4 h-4" />
</button>
```

**Specifications**:
- Icon: `ChevronsRight` (double chevron right)
- Icon Size: `w-4 h-4` (16px x 16px)
- Disabled: When on last page
- Action: Jump to last page

---

## State Management

### Required State
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(20);
```

### Derived Values
```typescript
const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const startItem = (currentPage - 1) * itemsPerPage + 1;
const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);
const paginatedData = filteredData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

---

## Event Handlers

### Page Change
```typescript
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  // Optionally scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

### Items Per Page Change
```typescript
const handleItemsPerPageChange = (count: number) => {
  setItemsPerPage(count);
  setCurrentPage(1); // Reset to first page
  toast.success(`Now showing ${count} items per page`);
};
```

---

## Responsive Behavior

### Desktop (≥640px)
- Horizontal layout
- Info text on left, controls on right
- All page numbers visible

### Mobile (<640px)
- Stacked vertical layout
- Info text at top
- Controls below
- Fewer page numbers shown (e.g., 3 instead of 5)

**Mobile Adjustment**:
```typescript
const isMobile = window.innerWidth < 640;
const maxVisiblePages = isMobile ? 3 : 5;
```

---

## Color System

### Text Colors
- **Info Text**:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- **Emphasized Numbers**:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- **Button Text (Default)**:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- **Button Text (Active)**:
  - Color: `text-white`

### Background Colors
- **Button (Default)**:
  - Transparent
- **Button Hover**:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- **Button (Active)**:
  - Light: `bg-primary-600`
  - Dark: `dark:bg-primary-500`
- **Select Input**:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-900`

### Border Colors
- **Default Border**:
  - Light: `border-neutral-300`
  - Dark: `dark:border-neutral-700`
- **Active Border**:
  - Light: `border-primary-600`
  - Dark: `dark:border-primary-500`

---

## Typography

### Font Sizes
- **Info Text**: `text-sm` (14px)
- **Page Numbers**: `text-sm` (14px) - inherited
- **Select**: `text-sm` (14px)

### Font Weights
- **Info Text**: Regular (400)
- **Emphasized Numbers**: `font-medium` (500)
- **Active Page**: `font-medium` (500)

---

## Spacing

### Container
- Padding: `py-4` (16px vertical)
- Gap: `gap-4` (16px between sections on mobile)

### Controls
- Gap between elements: `gap-2` (8px)
- Gap between buttons: `gap-1` (4px)

### Buttons
- Size: `w-8 h-8` (32px x 32px)
- Padding: Built into flex centering

### Select
- Padding: `px-3 py-1.5` (12px/6px)

---

## Icons

### Icon Library
- **Package**: `lucide-react` v0.487.0

### Icons Used
- `ChevronsLeft`: First page (double left)
- `ChevronLeft`: Previous page (single left)
- `ChevronRight`: Next page (single right)
- `ChevronsRight`: Last page (double right)

### Icon Size
- All icons: `w-4 h-4` (16px x 16px)

---

## Accessibility

### ARIA Labels
```tsx
aria-label="Go to first page"
aria-label="Go to previous page"
aria-label={`Go to page ${page}`}
aria-label="Go to next page"
aria-label="Go to last page"
```

### ARIA Current
```tsx
aria-current={page === currentPage ? 'page' : undefined}
```

### Keyboard Navigation
- Tab through all buttons
- Enter/Space to activate
- Disabled buttons skip focus

### Screen Reader
- Announces page changes
- Announces items per page changes
- Disabled state announced

---

## Edge Cases

### Single Page (< 20 items)
- Pagination hidden completely

### Exactly 20 Items
- Pagination shown (1 page total)
- Next/Last buttons disabled

### First Page
- First/Previous buttons disabled
- Opacity reduced to 50%

### Last Page
- Next/Last buttons disabled
- Opacity reduced to 50%

### Items Per Page Change
- Resets to page 1
- Recalculates total pages
- May reduce total pages (e.g., 100 items: 5 pages @ 20/page → 2 pages @ 50/page)

---

## Implementation Example

```tsx
import { Pagination } from '../components/hb/listing';
import { useState, useMemo } from 'react';

function ReportPage() {
  const [data, setData] = useState([/* ... */]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div>
      {/* Table with paginatedData */}

      {/* Pagination - Only show if 20+ records */}
      {data.length >= 20 && (
        <div className="mt-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={data.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(count) => {
              setItemsPerPage(count);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
```

---

## Performance Optimization

### Memoization
```typescript
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredData.slice(startIndex, startIndex + itemsPerPage);
}, [filteredData, currentPage, itemsPerPage]);
```

### Avoid Unnecessary Renders
- Use `useCallback` for event handlers
- Memoize page number calculations
- Only re-render when page or items per page changes

---

## Notes

1. **Minimum Threshold**: Show pagination only when `totalItems >= 20`
2. **Default Items**: 20 items per page (industry standard)
3. **Page Reset**: Reset to page 1 when filters change
4. **Scroll Behavior**: Optionally scroll to top on page change
5. **URL Persistence**: Consider adding page number to URL query params
6. **Server-Side**: For very large datasets (10,000+), implement server-side pagination
7. **Loading State**: Show loading indicator while fetching new page data
8. **Empty State**: Handle when filtered results drop below 20 items
9. **Maximum Pages**: Consider ellipsis for 100+ pages
10. **Keyboard Shortcuts**: Consider adding Alt+← / Alt+→ for page navigation

---

**Last Updated**: December 24, 2024
**Version**: 1.0
**Component Path**: `/src/app/components/hb/listing`
