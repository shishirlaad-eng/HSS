# Reporting Page Template - Overview

## Introduction
A comprehensive, reusable reporting page template designed for data-heavy list views with filtering, sorting, searching, and export capabilities. This template provides a consistent user experience across all reporting and listing pages in enterprise applications.

---

## Page Architecture

```
Reporting Page
├── Container (Padding & Background)
├── Max-Width Wrapper
│
├── Page Header Section
│   ├── Title & Breadcrumbs
│   └── Action Bar
│       ├── Search Bar + Advanced Filters
│       ├── Date Range Filter
│       ├── Toggle Summary Button
│       ├── Refresh Button
│       └── More Menu (Export, Print, Columns)
│
├── Summary Widgets (Optional/Toggleable)
│   └── Widget Cards (Configurable)
│
├── Filter Chips (Conditional)
│   └── Active Filters Display
│
├── Data Table
│   ├── Table Header
│   ├── Table Body (Data Rows)
│   └── Conditional Column Visibility
│
└── Pagination (Conditional - 20+ records)
```

---

## Overall Container Structure

### Outer Container
```jsx
<div className="p-5 md:p-6 bg-white dark:bg-neutral-950 px-[8px] py-[8px]">
  <div className="max-w-[100%] mx-auto">
    {/* All content */}
  </div>
</div>
```

**Specifications**:
- Padding: 
  - Mobile: `p-5` (20px)
  - Desktop: `md:p-6` (24px)
  - Override: `px-[8px] py-[8px]` (Applied after, results in 8px padding)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`
- Max Width Wrapper: `max-w-[100%] mx-auto`

**Note**: The padding override creates an 8px padding on all sides for the final layout.

---

## Visual Hierarchy

### 1. Page Header
- **Height**: Auto (based on content)
- **Margin Bottom**: `mb-5` or `mb-6` (20-24px)
- **Components**: Title, breadcrumbs, action buttons

### 2. Summary Widgets (Optional)
- **Display**: Toggleable via button
- **Margin Bottom**: `mb-5` (20px)
- **Layout**: Grid of metric cards

### 3. Filter Chips (Conditional)
- **Display**: Only when filters are active
- **Margin Bottom**: `mb-5` (20px)
- **Components**: Removable filter tags

### 4. Data Table
- **Border**: Full border with rounded corners
- **Overflow**: Horizontal scroll on small screens
- **Background**: White/Dark neutral

### 5. Pagination (Conditional)
- **Display**: Only when 20+ total records
- **Margin Top**: `mt-5` (20px)
- **Position**: Below table

---

## Section Spacing

### Vertical Spacing Between Sections
- Page Header → Summary: `20px` (mb-5)
- Summary → Filter Chips: `20px` (mb-5)
- Filter Chips → Table: `20px` (mb-5)
- Table → Pagination: `20px` (mt-5)

### Horizontal Spacing
- Container: `8px` padding on all sides
- Table cells: `px-4` (16px horizontal)
- Action buttons: `gap-2` or `gap-3` (8-12px)

---

## Component Sections

This reporting template is composed of several key components, each documented in detail in separate files:

1. **[Page Header](./reportingPageHeader.md)** - Title, breadcrumbs, and action bar
2. **[Summary Widgets](./reportingSummaryWidgets.md)** - Configurable metric dashboard
3. **[Filters & Search](./reportingFilters.md)** - Search bar, advanced filters, date range
4. **[Data Table](./reportingTable.md)** - Table structure, columns, and rows
5. **[Pagination](./reportingPagination.md)** - Page navigation and item counts
6. **[Export & Print](./reportingExport.md)** - Export menu and print functionality
7. **[Column Management](./reportingColumns.md)** - Show/hide table columns

---

## Key Features

### 1. Responsive Design
- Mobile-first approach
- Horizontal scrolling for tables on small screens
- Collapsible filters and summary on mobile
- Responsive padding and spacing

### 2. Dark Mode Support
- All components support dark mode
- Consistent color tokens across themes
- Smooth transitions between modes

### 3. Data Filtering
- Text search across records
- Advanced filter popup with multiple conditions
- Date range filtering with presets
- Active filter chips display
- Clear all filters option

### 4. Data Export
- CSV export
- Excel export
- PDF export
- Print functionality

### 5. Column Management
- Show/hide individual columns
- Persist column preferences
- Quick toggle via dropdown menu

### 6. Summary Dashboard
- Toggleable widget display
- Configurable widgets
- Real-time data calculation
- Manage widgets modal

### 7. Pagination
- Shows only for 20+ records
- Items per page selection
- Current page indicator
- Total items count
- Jump to page functionality

---

## State Management Requirements

### Component State
```typescript
// Search and filters
const [searchQuery, setSearchQuery] = useState("");
const [filters, setFilters] = useState<FilterCondition[]>([]);
const [showFilterPopup, setShowFilterPopup] = useState(false);

// Date range
const [dateRange, setDateRange] = useState<{
  start: Date | null;
  end: Date | null;
  label?: string;
}>({ start: null, end: null });
const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);

// Summary and widgets
const [showSummary, setShowSummary] = useState(true);
const [showWidgetsModal, setShowWidgetsModal] = useState(false);
const [widgets, setWidgets] = useState<WidgetConfig[]>([]);

// Menus
const [showMoreMenu, setShowMoreMenu] = useState(false);

// Table columns
const [visibleColumns, setVisibleColumns] = useState({
  column1: true,
  column2: true,
  // ... all columns
});

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(20);

// Data
const [data, setData] = useState([]);
```

---

## Data Flow

### 1. Data Fetching
```typescript
// Initial load
useEffect(() => {
  fetchData();
}, []);

// Refresh on filter change
useEffect(() => {
  filterAndSortData();
}, [searchQuery, filters, dateRange]);
```

### 2. Data Filtering
```typescript
const filteredData = useMemo(() => {
  return data
    .filter(item => matchesSearch(item, searchQuery))
    .filter(item => matchesFilters(item, filters))
    .filter(item => matchesDateRange(item, dateRange));
}, [data, searchQuery, filters, dateRange]);
```

### 3. Pagination
```typescript
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredData.slice(startIndex, startIndex + itemsPerPage);
}, [filteredData, currentPage, itemsPerPage]);
```

---

## Conditional Rendering Rules

### Summary Widgets
- **Show When**: `showSummary === true`
- **Toggle Button**: BarChart3 icon in page header
- **Default State**: Visible

### Filter Chips
- **Show When**: `filters.length > 0`
- **Location**: Between summary and table
- **Actions**: Remove individual filter, Clear all

### Pagination
- **Show When**: `filteredData.length > 20`
- **Location**: Below table
- **Updates**: On filter/search changes

### Table Columns
- **Show When**: `visibleColumns[columnName] === true`
- **Persist**: Save to localStorage or backend
- **Reset**: Restore all columns option

---

## Color System

### Background Colors
- **Page Background**: 
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`

- **Table Header**: 
  - Light: `bg-neutral-50`
  - Dark: `dark:bg-neutral-900`

- **Table Row Hover**:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`

### Text Colors
- **Primary Text**: 
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`

- **Secondary Text**: 
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`

- **Muted Text**: 
  - Light: `text-neutral-500`
  - Dark: `dark:text-neutral-500`

### Border Colors
- **Default Border**: 
  - Light: `border-neutral-200`
  - Dark: `dark:border-neutral-800`

- **Divider**: 
  - Light: `divide-neutral-200`
  - Dark: `dark:divide-neutral-800`

---

## Typography

### Font Sizes
- **Page Title**: `text-2xl` (24px) - Page header title
- **Section Headers**: `text-lg` (18px) - Widget titles
- **Body Text**: `text-sm` (14px) - Table cells, labels
- **Small Text**: `text-xs` (12px) - Table headers, helper text
- **Tiny Text**: `text-[10px]` - Badges, tags

### Font Weights
- **Bold**: `font-bold` - Page titles
- **Semi-bold**: `font-semibold` - Section headers, widget values
- **Medium**: `font-medium` - Table headers, emphasized text
- **Regular**: Default - Body text

---

## Spacing Scale

### Container Spacing
- Page Container: `8px` all sides
- Max Width: `100%` with `mx-auto`

### Section Margins
- Between major sections: `mb-5` (20px)
- Between minor elements: `mb-3` (12px)

### Component Padding
- Buttons: `px-4 py-2` (16px/8px)
- Table cells: `px-4 py-1.5` or `py-3` (16px horizontal)
- Cards: `p-4` or `p-5` (16-20px)

### Element Gaps
- Action buttons: `gap-2` or `gap-3` (8-12px)
- Table columns: No gap (border-separated)
- Widget grid: `gap-4` (16px)

---

## Responsive Breakpoints

### Mobile First
- Default: `< 640px` (mobile)
- Small: `sm: >= 640px`
- Medium: `md: >= 768px`
- Large: `lg: >= 1024px`
- Extra Large: `xl: >= 1280px`

### Responsive Adjustments
```typescript
// Padding
p-5 md:p-6        // 20px mobile, 24px desktop

// Grid columns
grid-cols-1 md:grid-cols-2 lg:grid-cols-4  // Responsive widgets

// Table
overflow-x-auto   // Horizontal scroll on mobile
```

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for dropdown menus
- Escape to close popups

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-expanded` on dropdown triggers
- `role="table"` on table elements
- `aria-live="polite"` for dynamic content updates

### Screen Reader Support
- Descriptive button labels
- Table headers with proper scope
- Status announcements for actions
- Hidden text for context (`sr-only` class)

---

## Performance Optimization

### Data Handling
1. **Memoization**: Use `useMemo` for filtered/sorted data
2. **Virtualization**: Consider for 1000+ row tables
3. **Lazy Loading**: Load additional data on scroll
4. **Debouncing**: Search input with 300ms delay

### Rendering
1. **Conditional Rendering**: Only render visible components
2. **Key Props**: Unique keys for list items
3. **Component Splitting**: Separate large components
4. **Code Splitting**: Lazy load heavy features (export, widgets)

---

## Implementation Checklist

### Basic Structure
- [ ] Page container with proper padding
- [ ] Max-width wrapper
- [ ] Responsive layout
- [ ] Dark mode support

### Page Header
- [ ] Title and breadcrumbs
- [ ] Search bar with advanced filter button
- [ ] Date range filter
- [ ] Action buttons (Summary, Refresh, More)
- [ ] Export menu (CSV, Excel, PDF)
- [ ] Column management menu
- [ ] Print functionality

### Summary Section
- [ ] Toggle button functionality
- [ ] Widget grid layout
- [ ] Manage widgets modal
- [ ] Real-time data calculation

### Filtering
- [ ] Search functionality
- [ ] Advanced filter popup
- [ ] Date range picker with presets
- [ ] Filter chips display
- [ ] Clear filters option

### Data Table
- [ ] Table structure with proper headers
- [ ] Conditional column visibility
- [ ] Hover states on rows
- [ ] Status badges/indicators
- [ ] Responsive horizontal scroll
- [ ] Empty state handling

### Pagination
- [ ] Conditional display (20+ records)
- [ ] Page navigation
- [ ] Items per page selector
- [ ] Current page indicator
- [ ] Total items count

### State Management
- [ ] Search state
- [ ] Filter state
- [ ] Date range state
- [ ] Pagination state
- [ ] Column visibility state
- [ ] Widget configuration state

### Data Operations
- [ ] Filter data by search
- [ ] Filter data by conditions
- [ ] Filter data by date range
- [ ] Sort data (if applicable)
- [ ] Paginate data
- [ ] Export data to CSV
- [ ] Export data to Excel
- [ ] Export data to PDF
- [ ] Print functionality

---

## Usage Example

```tsx
import { AttendanceReport } from '@/pages/AttendanceReport';

function App() {
  return <AttendanceReport />;
}
```

### With Custom Configuration
```tsx
import { ReportingPage } from '@/components/ReportingPage';

function CustomReport() {
  const columns = [
    { id: 'name', label: 'Name', visible: true },
    { id: 'email', label: 'Email', visible: true },
    // ... more columns
  ];

  const widgets = [
    { id: 'total', label: 'Total Records', visible: true },
    // ... more widgets
  ];

  return (
    <ReportingPage
      title="Custom Report"
      breadcrumbs={[...]}
      columns={columns}
      widgets={widgets}
      data={data}
      onExport={handleExport}
      onPrint={handlePrint}
    />
  );
}
```

---

## File Structure

```
/templates/reports/
├── reportingOverview.md         (This file)
├── reportingPageHeader.md       (Page header details)
├── reportingSummaryWidgets.md   (Summary dashboard)
├── reportingFilters.md          (Search & filters)
├── reportingTable.md            (Table structure)
├── reportingPagination.md       (Pagination component)
├── reportingExport.md           (Export & print)
└── reportingColumns.md          (Column management)
```

---

## Dependencies

### Required Components
From `/src/app/components/hb/listing`:
- `PageHeader`
- `SearchBar`
- `FilterPopup`
- `FilterChips`
- `DateRangeFilter`
- `Pagination`
- `IconButton`
- `SummaryWidgets`
- `FlyoutMenu`
- `FlyoutMenuItem`

### Required Icons
From `lucide-react`:
- `RefreshCw` - Refresh button
- `MoreVertical` - More menu
- `ChevronRight` - Submenu indicator
- `FileText` - PDF export
- `FileSpreadsheet` - CSV/Excel export
- `Download` - Export icon
- `Printer` - Print icon
- `Columns3` - Column management
- `Calendar` - Date range
- `BarChart3` - Summary toggle
- `Upload` - Import
- `Check` - Selected state

### Required Packages
- `react` - ^18.0.0
- `lucide-react` - ^0.487.0
- `sonner` - For toast notifications

---

## Common Patterns

### Loading State
```tsx
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
  </div>
) : (
  // Table content
)}
```

### Empty State
```tsx
{filteredData.length === 0 ? (
  <div className="text-center py-12">
    <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
    <div className="text-sm text-neutral-600 dark:text-neutral-400">
      No records found
    </div>
  </div>
) : (
  // Table content
)}
```

### Error State
```tsx
{error ? (
  <div className="text-center py-12">
    <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-3" />
    <div className="text-sm text-error-600 dark:text-error-400">
      {error.message}
    </div>
  </div>
) : (
  // Table content
)}
```

---

## Notes

1. **Pagination Threshold**: Show pagination only when `totalRecords > 20`
2. **Default Items Per Page**: 20 records
3. **Search Debounce**: 300ms delay recommended
4. **Export Limit**: Consider limiting exports to 10,000 records
5. **Column Persistence**: Save visible columns to localStorage or backend
6. **Widget Persistence**: Save widget configuration to user preferences
7. **Date Range**: Default to last 30 days or current month
8. **Filter Logic**: AND logic between different filters, OR within same filter type
9. **Mobile Experience**: Horizontal scroll for tables, simplified filters
10. **Print Styles**: Use `@media print` CSS for print-optimized layout

---

**Last Updated**: December 24, 2024
**Version**: 1.0
**Compatible With**: React 18+, TypeScript 5+, Tailwind CSS 4+
