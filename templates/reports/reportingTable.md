# Reporting Table Template

## Overview
The data table is the core component of reporting pages, displaying records in a structured, scannable format. It features conditional column visibility, status indicators, hover states, and responsive horizontal scrolling. This template defines every aspect of how data rows are displayed.

---

## Component Structure

```
Table Container
├── Outer Container (Border & Rounded Corners)
├── Scroll Container (Horizontal Overflow)
└── Table Element
    ├── Table Head (thead)
    │   └── Header Row (tr)
    │       └── Header Cells (th) - Conditional visibility
    │
    └── Table Body (tbody)
        └── Data Rows (tr) - Repeating
            └── Data Cells (td) - Conditional visibility
                ├── Text Data
                ├── Status Badges
                └── Custom Components
```

---

## Table Container

### Outer Container
```tsx
<div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
  {/* Scroll container and table */}
</div>
```

**Specifications**:
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-lg` (8px)
- Overflow: `overflow-hidden` (clips scrolling content to rounded corners)

---

### Scroll Container
```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Table content */}
  </table>
</div>
```

**Specifications**:
- Overflow: `overflow-x-auto`
- Purpose: Enables horizontal scrolling on small screens
- Behavior: Appears only when table width exceeds container

**Table Element**:
- Width: `w-full`
- Min Width: Determined by column count (no explicit min-width set)

---

## Table Header (thead)

### Header Row Container
```tsx
<thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
  <tr>
    {/* Header cells */}
  </tr>
</thead>
```

**Specifications**:
- Background:
  - Light: `bg-neutral-50`
  - Dark: `dark:bg-neutral-900`
- Border Bottom:
  - Light: `border-b border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Purpose: Visually separates headers from data rows

---

### Header Cells (th)

#### Basic Structure
```tsx
{visibleColumns.employeeName && (
  <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
    Employee Name
  </th>
)}
```

**Specifications**:
- Padding: `px-4 py-3` (16px horizontal / 12px vertical)
- Text Align: `text-left`
- Font Size: `text-xs` (12px)
- Text Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Text Transform: `uppercase`
- Letter Spacing: `tracking-wider`
- Font Weight: Inherits (typically medium/600)

**Conditional Rendering**:
- Each header cell is wrapped in conditional check
- Only renders if `visibleColumns.columnName === true`
- Allows dynamic show/hide of columns

**Column Examples**:
```tsx
// ID Column
{visibleColumns.employeeId && (
  <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
    Employee ID
  </th>
)}

// Name Column
{visibleColumns.employeeName && (
  <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
    Employee Name
  </th>
)}

// Date Column
{visibleColumns.date && (
  <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
    Date
  </th>
)}

// Status Column
{visibleColumns.status && (
  <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
    Status
  </th>
)}
```

---

## Table Body (tbody)

### Body Container
```tsx
<tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
  {paginatedData.map((record) => (
    <tr key={record.id}>
      {/* Data cells */}
    </tr>
  ))}
</tbody>
```

**Specifications**:
- Divider:
  - Light: `divide-y divide-neutral-200`
  - Dark: `dark:divide-neutral-800`
- Purpose: Creates horizontal lines between rows

**Key Prop**:
- **Required**: Each row must have unique `key={record.id}`
- Uses record's unique identifier
- Critical for React rendering performance

---

## Table Rows (tr)

### Row Structure
```tsx
<tr
  key={record.id}
  className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
>
  {/* Data cells */}
</tr>
```

**Specifications**:
- Key: `key={record.id}` (unique identifier)
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Transition: `transition-colors`

**Default State**:
- Background: Transparent (inherits from container)
- Border: None (divider applied via tbody)

**Hover State**:
- Background changes to subtle neutral color
- Smooth transition (default ~150ms)
- Entire row highlights on hover

**Interactive Behavior** (Optional):
```tsx
// If row should be clickable
<tr
  key={record.id}
  onClick={() => handleRowClick(record.id)}
  className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
>
```
- Add `cursor-pointer` for clickable rows
- Add `onClick` handler for row interaction

---

## Data Cells (td)

### Basic Data Cell Structure
```tsx
{visibleColumns.employeeName && (
  <td className="px-4 py-1.5 text-sm text-neutral-900 dark:text-white">
    {record.employeeName}
  </td>
)}
```

**Specifications**:
- Padding: `px-4 py-1.5` (16px horizontal / 6px vertical)
- Font Size: `text-sm` (14px)
- Text Color: Varies by data type (see below)
- Conditional: Only renders if column is visible

---

### Data Cell Types & Styling

#### 1. Primary Data (ID, Name)
**Purpose**: Main identifiable information

```tsx
{visibleColumns.employeeId && (
  <td className="px-4 py-1.5 text-sm text-neutral-900 dark:text-white">
    {record.employeeId}
  </td>
)}

{visibleColumns.employeeName && (
  <td className="px-4 py-1.5 text-sm text-neutral-900 dark:text-white">
    {record.employeeName}
  </td>
)}
```

**Color Specifications**:
- Light: `text-neutral-900` (darkest, most prominent)
- Dark: `dark:text-white`
- Font Weight: Regular (400)

**Use Cases**:
- Employee ID
- Employee Name
- Record ID
- Primary identifiers

---

#### 2. Secondary Data (Department, Location, etc.)
**Purpose**: Supporting information

```tsx
{visibleColumns.department && (
  <td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
    {record.department}
  </td>
)}

{visibleColumns.location && (
  <td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
    {record.location}
  </td>
)}
```

**Color Specifications**:
- Light: `text-neutral-600` (medium gray)
- Dark: `dark:text-neutral-400`
- Font Weight: Regular (400)

**Use Cases**:
- Department
- Location
- Role
- Category
- Descriptive fields

---

#### 3. Date/Time Data
**Purpose**: Temporal information

```tsx
{visibleColumns.date && (
  <td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
    {formatDate(record.date)}
  </td>
)}

{visibleColumns.checkIn && (
  <td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
    {record.checkIn}
  </td>
)}

{visibleColumns.checkOut && (
  <td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
    {record.checkOut}
  </td>
)}
```

**Color Specifications**:
- Light: `text-neutral-600`
- Dark: `dark:text-neutral-400`

**Formatting Helper**:
```typescript
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
  // Example output: "Dec 24, 2024"
};
```

**Use Cases**:
- Date columns
- Check-in time
- Check-out time
- Timestamps
- Duration

---

#### 4. Numeric Data (Hours, Counts)
**Purpose**: Quantitative information

```tsx
{visibleColumns.workHours && (
  <td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
    {record.workHours}
  </td>
)}
```

**Color Specifications**:
- Light: `text-neutral-600`
- Dark: `dark:text-neutral-400`

**Optional - Right Alignment**:
```tsx
<td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 text-right">
  {record.workHours}
</td>
```

**Use Cases**:
- Work hours
- Counts
- Quantities
- Numeric metrics

---

#### 5. Status Badge Cell
**Purpose**: Visual status indicators

```tsx
{visibleColumns.status && (
  <td className="px-4 py-1.5">
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
      <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(record.status)}`}></div>
      <span className="text-xs text-neutral-600 dark:text-neutral-400">{record.status}</span>
    </span>
  </td>
)}
```

**Badge Container Specifications**:
- Display: `inline-flex items-center`
- Gap: `gap-1.5` (6px between dot and text)
- Padding: `px-2 py-0.5` (8px/2px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-900`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-full`

**Status Dot Specifications**:
- Size: `w-1.5 h-1.5` (6px x 6px)
- Shape: `rounded-full`
- Color: Dynamic based on status (see below)

**Status Text Specifications**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

---

### Status Color System

#### getStatusColor Helper Function
```typescript
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    // Success/Positive States
    case 'present':
    case 'approved':
    case 'completed':
    case 'active':
    case 'on time':
      return 'bg-success-500';
    
    // Warning/Pending States
    case 'pending':
    case 'late':
    case 'in progress':
    case 'partial':
      return 'bg-warning-500';
    
    // Error/Negative States
    case 'absent':
    case 'rejected':
    case 'on leave':
    case 'cancelled':
    case 'overdue':
      return 'bg-error-500';
    
    // Info States
    case 'scheduled':
    case 'upcoming':
      return 'bg-info-500';
    
    // Default/Neutral
    default:
      return 'bg-neutral-400';
  }
};
```

**Color Mapping**:

**Success (Green)**:
- `bg-success-500`: Present, Approved, Completed, Active, On Time
- RGB: Typically green (#10B981 or similar)

**Warning (Yellow/Orange)**:
- `bg-warning-500`: Pending, Late, In Progress, Partial
- RGB: Typically orange (#F59E0B or similar)

**Error (Red)**:
- `bg-error-500`: Absent, Rejected, On Leave, Cancelled, Overdue
- RGB: Typically red (#EF4444 or similar)

**Info (Blue)**:
- `bg-info-500`: Scheduled, Upcoming
- RGB: Typically blue (#3B82F6 or similar)

**Neutral (Gray)**:
- `bg-neutral-400`: Unknown or default states
- RGB: Medium gray

---

### Alternative Status Badge Styles

#### Filled Background Badge
```tsx
<span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getFilledBadgeClass(record.status)}`}>
  {record.status}
</span>
```

```typescript
const getFilledBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'present':
    case 'approved':
      return 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400';
    case 'pending':
    case 'late':
      return 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400';
    case 'absent':
    case 'rejected':
      return 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
  }
};
```

---

## Column Visibility Management

### State Structure
```typescript
const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
  employeeId: true,
  employeeName: true,
  department: true,
  location: true,
  date: true,
  checkIn: true,
  checkOut: true,
  workHours: true,
  status: true,
});
```

### Toggle Column Function
```typescript
const toggleColumn = (columnId: string) => {
  setVisibleColumns(prev => ({
    ...prev,
    [columnId]: !prev[columnId]
  }));
  
  // Optional: Persist to localStorage
  const newColumns = {
    ...visibleColumns,
    [columnId]: !visibleColumns[columnId]
  };
  localStorage.setItem('visibleColumns', JSON.stringify(newColumns));
};
```

### Load Saved Columns
```typescript
useEffect(() => {
  const saved = localStorage.getItem('visibleColumns');
  if (saved) {
    setVisibleColumns(JSON.parse(saved));
  }
}, []);
```

---

## Empty State

### No Data Display
```tsx
<tbody>
  {paginatedData.length === 0 ? (
    <tr>
      <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
          <div className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
            No records found
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Try adjusting your filters or search query
          </div>
        </div>
      </td>
    </tr>
  ) : (
    // Regular data rows
  )}
</tbody>
```

**Specifications**:
- `colSpan`: Spans all visible columns
- Padding: `px-4 py-12` (16px/48px)
- Text Align: `text-center`

**Icon**:
- Component: `FileText` or relevant icon
- Size: `w-12 h-12` (48px x 48px)
- Color:
  - Light: `text-neutral-300`
  - Dark: `dark:text-neutral-700`
- Margin: `mb-3` (12px below)

**Title**:
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium`
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Margin: `mb-1` (4px below)

**Description**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

---

## Loading State

### Loading Skeleton Rows
```tsx
<tbody>
  {isLoading ? (
    Array.from({ length: 5 }).map((_, index) => (
      <tr key={`skeleton-${index}`}>
        {Object.values(visibleColumns).filter(Boolean).map((_, colIndex) => (
          <td key={colIndex} className="px-4 py-1.5">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
          </td>
        ))}
      </tr>
    ))
  ) : (
    // Regular data rows
  )}
</tbody>
```

**Skeleton Specifications**:
- Height: `h-4` (16px)
- Background:
  - Light: `bg-neutral-200`
  - Dark: `dark:bg-neutral-800`
- Border Radius: `rounded`
- Animation: `animate-pulse` (built-in Tailwind)
- Count: 5 skeleton rows

---

## Responsive Behavior

### Mobile (<768px)
- Horizontal scroll enabled
- Table maintains full width
- All columns remain same size
- Scroll indicator may appear

### Tablet (768px - 1023px)
- May still require horizontal scroll
- Depends on number of visible columns

### Desktop (≥1024px)
- Full table visible
- No horizontal scroll (unless many columns)
- Optimal viewing experience

---

## Data Formatting Utilities

### Date Formatting
```typescript
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};
```

### Time Formatting
```typescript
const formatTime = (time: string): string => {
  // Assumes time in "HH:MM:SS" or "HH:MM" format
  return time.substring(0, 5); // Returns "HH:MM"
};
```

### Duration Formatting
```typescript
const formatDuration = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};
```

### Number Formatting
```typescript
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};
```

---

## Color System Reference

### Text Colors

**Primary Data**:
- Light: `text-neutral-900`
- Dark: `dark:text-white`

**Secondary Data**:
- Light: `text-neutral-600`
- Dark: `dark:text-neutral-400`

**Headers**:
- Light: `text-neutral-600`
- Dark: `dark:text-neutral-400`

**Status Badge Text**:
- Light: `text-neutral-600`
- Dark: `dark:text-neutral-400`

### Background Colors

**Table Container**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-950`

**Table Header**:
- Light: `bg-neutral-50`
- Dark: `dark:bg-neutral-900`

**Row Hover**:
- Light: `hover:bg-neutral-50`
- Dark: `dark:hover:bg-neutral-900`

**Status Badge Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-900`

**Status Dot Colors**:
- Success: `bg-success-500`
- Warning: `bg-warning-500`
- Error: `bg-error-500`
- Info: `bg-info-500`
- Neutral: `bg-neutral-400`

### Border Colors

**Table Border**:
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`

**Row Dividers**:
- Light: `divide-neutral-200`
- Dark: `dark:divide-neutral-800`

**Status Badge Border**:
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`

---

## Typography

### Font Sizes
- **Header Cells**: `text-xs` (12px)
- **Data Cells**: `text-sm` (14px)
- **Status Badge**: `text-xs` (12px)
- **Empty State Title**: `text-sm` (14px)
- **Empty State Description**: `text-xs` (12px)

### Font Weights
- **Headers**: Medium (500) - often inherited
- **Data Cells**: Regular (400)
- **Primary Data**: Regular (400) but darker color
- **Empty State Title**: `font-medium` (500)

### Text Transform
- **Headers**: `uppercase`

### Letter Spacing
- **Headers**: `tracking-wider`

---

## Spacing

### Cell Padding
- **Headers**: `px-4 py-3` (16px/12px)
- **Data Cells**: `px-4 py-1.5` (16px/6px)
- **Empty State**: `px-4 py-12` (16px/48px)

### Status Badge
- Padding: `px-2 py-0.5` (8px/2px)
- Gap: `gap-1.5` (6px between dot and text)

### Status Dot
- Size: `w-1.5 h-1.5` (6px x 6px)

---

## Accessibility

### Table Structure
- Proper semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- Header cells use `<th>` with scope attribute
- Data cells use `<td>`

### Screen Readers
- Empty state provides meaningful message
- Status badges have text labels (not just colors)
- Column headers are descriptive

### Keyboard Navigation
- Clickable rows are keyboard accessible
- Focus states visible on interactive elements
- Tab navigation works correctly

### Color Contrast
- All text meets WCAG AA standards
- Status colors have sufficient contrast
- Dark mode maintains accessibility

---

## Performance Optimization

### Memoization
```typescript
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredData.slice(startIndex, startIndex + itemsPerPage);
}, [filteredData, currentPage, itemsPerPage]);
```

### Virtual Scrolling (For Large Datasets)
```tsx
// Consider react-window or react-virtualized for 1000+ rows
import { FixedSizeList } from 'react-window';
```

### Conditional Rendering
- Only render visible columns
- Use key props correctly
- Avoid inline functions in render

---

## Implementation Example

```tsx
import { useState } from 'react';
import { FileText } from 'lucide-react';

function DataTable({ data }: { data: AttendanceRecord[] }) {
  const [visibleColumns, setVisibleColumns] = useState({
    employeeId: true,
    employeeName: true,
    department: true,
    status: true,
  });

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'present': return 'bg-success-500';
      case 'late': return 'bg-warning-500';
      case 'absent': return 'bg-error-500';
      default: return 'bg-neutral-400';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              {visibleColumns.employeeId && (
                <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Employee ID
                </th>
              )}
              {visibleColumns.employeeName && (
                <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Employee Name
                </th>
              )}
              {visibleColumns.department && (
                <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Department
                </th>
              )}
              {visibleColumns.status && (
                <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-4 py-12 text-center">
                  <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    No records found
                  </div>
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  {visibleColumns.employeeId && (
                    <td className="px-4 py-1.5 text-sm text-neutral-900 dark:text-white">
                      {record.employeeId}
                    </td>
                  )}
                  {visibleColumns.employeeName && (
                    <td className="px-4 py-1.5 text-sm text-neutral-900 dark:text-white">
                      {record.employeeName}
                    </td>
                  )}
                  {visibleColumns.department && (
                    <td className="px-4 py-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                      {record.department}
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-4 py-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(record.status)}`}></div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{record.status}</span>
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Notes

1. **Row Height**: Minimal padding (`py-1.5`) creates compact rows for data density
2. **Header Height**: More padding (`py-3`) for better visual separation
3. **Conditional Columns**: Always wrap both `<th>` and `<td>` in same condition
4. **Status Colors**: Use dot indicator for accessibility (color + shape)
5. **Hover State**: Entire row highlights, not individual cells
6. **Key Props**: Essential for performance, use record ID
7. **Empty State**: Center-aligned with helpful message
8. **colSpan**: Must match count of visible columns for empty state
9. **Text Truncation**: Add `truncate` class if cells have long content
10. **Responsive**: Horizontal scroll preserves data integrity on mobile

---

**Last Updated**: December 24, 2024
**Version**: 1.0
**Related Templates**: reportingOverview.md, reportingPageHeader.md, reportingPagination.md
