# Reporting Page Header Template

## Overview
The Page Header is the top section of every reporting/listing page, containing the page title, breadcrumb navigation, and a comprehensive action bar with search, filters, and utility buttons. It follows a consistent pattern across all reporting pages.

---

## Component Structure

```
PageHeader
├── Header Container
│   ├── Title & Breadcrumbs Section
│   │   ├── Title (h1)
│   │   └── Breadcrumb Navigation
│   │
│   └── Action Bar Section
│       ├── Search Bar + Advanced Filter Button
│       ├── Date Range Filter Button
│       ├── Toggle Summary Button
│       ├── Refresh Button
│       └── More Menu Dropdown
│           ├── Import
│           ├── Export Submenu (CSV, Excel, PDF)
│           ├── Print
│           └── Customize Columns Submenu
```

---

## Usage

```tsx
import { PageHeader } from '../components/hb/listing';

<PageHeader
  title="Attendance Report"
  breadcrumbs={[
    { label: "Home", href: "#" },
    { label: "Reporting", href: "#" },
    { label: "Attendance Report", current: true },
  ]}
>
  {/* Action bar content as children */}
</PageHeader>
```

---

## PageHeader Component

### Container Structure
The PageHeader component internally renders:
- Title section (left-aligned)
- Breadcrumb navigation (below title or beside on large screens)
- Action bar (right-aligned or below on mobile)

**Component is imported from**: `/src/app/components/hb/listing`

---

## Action Bar Layout

### Container
```tsx
<div className="flex flex-wrap items-center gap-2">
  {/* All action buttons and controls */}
</div>
```

**Specifications**:
- Display: `flex flex-wrap items-center`
- Gap: `gap-2` (8px between items)
- Responsive: Wraps on smaller screens

---

## 1. Search Bar Component

### Component
```tsx
<div className="relative" data-flyout-container>
  <SearchBar
    value={searchQuery}
    onChange={setSearchQuery}
    placeholder="Search by employee name or ID..."
    onAdvancedSearch={() => setShowFilterPopup(true)}
    activeFilterCount={filters.length}
  />
  
  {showFilterPopup && (
    <FilterPopup
      isOpen={showFilterPopup}
      onClose={() => setShowFilterPopup(false)}
      filters={filters}
      onFiltersChange={setFilters}
      filterOptions={filterOptions}
    />
  )}
</div>
```

**Specifications**:
- Component: `SearchBar` from `hb/listing`
- Container: `relative` positioning
- Attribute: `data-flyout-container` for popup positioning
- Width: Flexible, typically 300-400px
- Props:
  - `value`: Current search query
  - `onChange`: Search query update handler
  - `placeholder`: Contextual placeholder text
  - `onAdvancedSearch`: Opens filter popup
  - `activeFilterCount`: Badge count for active filters

### SearchBar Styling (Internal)
- Height: `h-10` (40px)
- Padding: `px-4` (16px horizontal)
- Border: `border border-neutral-300 dark:border-neutral-700`
- Border Radius: `rounded-lg` (8px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-900`
- Text: `text-sm` (14px)
- Focus State: Ring with primary color

**Filter Badge** (when filters active):
- Position: Top-right corner
- Size: `min-w-[18px] h-[18px]`
- Background: `bg-primary-600`
- Text: `text-white text-xs`
- Shape: `rounded-full`

---

## 2. Date Range Filter Button

### Component
```tsx
<div className="relative">
  <button
    onClick={() => setShowDateRangeFilter(!showDateRangeFilter)}
    className={`px-4 py-2 border ${
      dateRange.start && dateRange.end
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
        : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
    } hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-2`}
  >
    <Calendar className="w-4 h-4" />
    <span className="text-sm">
      {dateRange.start && dateRange.end
        ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
        : 'Date Range'}
    </span>
  </button>

  <DateRangeFilter
    isOpen={showDateRangeFilter}
    onClose={() => setShowDateRangeFilter(false)}
    startDate={dateRange.start}
    endDate={dateRange.end}
    onApply={(startDate, endDate, label) => {
      setDateRange({ start: startDate, end: endDate, label });
    }}
  />
</div>
```

**Specifications**:

**Button (Default State)**:
- Padding: `px-4 py-2` (16px/8px)
- Border: `border border-neutral-300 dark:border-neutral-700`
- Text Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Border Radius: `rounded-lg` (8px)
- Display: `flex items-center`
- Gap: `gap-2` (8px)
- Transition: `transition-colors`

**Button (Active State - with date selected)**:
- Border: `border-primary-500`
- Background:
  - Light: `bg-primary-50`
  - Dark: `dark:bg-primary-950`
- Text Color:
  - Light: `text-primary-700`
  - Dark: `dark:text-primary-300`

**Icon**:
- Component: `Calendar` from lucide-react
- Size: `w-4 h-4` (16px x 16px)

**Text**:
- Font Size: `text-sm` (14px)
- Default: "Date Range"
- Active: "MM/DD/YYYY - MM/DD/YYYY" or preset label

**DateRangeFilter Component**:
- Imported from: `hb/listing`
- Renders as absolute positioned dropdown below button
- See `reportingFilters.md` for full details

---

## 3. Icon Buttons (Summary, Refresh)

### Component
```tsx
<IconButton
  icon={BarChart3}
  onClick={() => setShowSummary(!showSummary)}
  active={showSummary}
  title="Toggle Summary"
/>

<IconButton
  icon={RefreshCw}
  onClick={handleRefresh}
  title="Refresh"
/>
```

**Specifications**:
- Component: `IconButton` from `hb/listing`
- Size: `w-10 h-10` (40px x 40px)
- Padding: `p-2` (8px)
- Border: `border border-neutral-300 dark:border-neutral-700`
- Border Radius: `rounded-lg` (8px)

**Default State**:
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-900`
- Icon Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`

**Active State** (when `active={true}`):
- Border: `border-primary-500`
- Background:
  - Light: `bg-primary-50`
  - Dark: `dark:bg-primary-950`
- Icon Color:
  - Light: `text-primary-600`
  - Dark: `dark:text-primary-400`

**Props**:
- `icon`: Lucide icon component
- `onClick`: Click handler function
- `active`: Boolean for active state (optional)
- `title`: Tooltip text for accessibility

**Common Icons**:
- `BarChart3`: Toggle summary dashboard
- `RefreshCw`: Refresh data
- `MoreVertical`: More options menu

---

## 4. More Menu Dropdown

### Button & Container
```tsx
<div className="relative" data-flyout-container>
  <IconButton
    icon={MoreVertical}
    onClick={() => setShowMoreMenu(!showMoreMenu)}
    title="More options"
  />

  {showMoreMenu && (
    <FlyoutMenu position="right" onClose={() => setShowMoreMenu(false)}>
      {/* Menu items */}
    </FlyoutMenu>
  )}
</div>
```

**Container Specifications**:
- Position: `relative`
- Attribute: `data-flyout-container` (for proper positioning)

**FlyoutMenu Component**:
- Imported from: `hb/listing`
- Position: `right` (aligns right edge of menu with button)
- Width: `w-56` (224px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-900`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-lg` (8px)
- Shadow: `shadow-lg`
- Position: `absolute top-full mt-2 right-0`
- Z-Index: `z-50`

---

### Menu Items

#### Simple Menu Item
```tsx
<FlyoutMenuItem
  icon={Upload}
  onClick={() => {
    handleImport();
    setShowMoreMenu(false);
  }}
  roundedTop  // First item
>
  Import
</FlyoutMenuItem>
```

**Specifications**:
- Padding: `px-4 py-2.5` (16px/10px)
- Font Size: `text-sm` (14px)
- Display: `flex items-center`
- Gap: `gap-2` (8px)

**Default State**:
- Text Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Background: Transparent
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-800`

**Border Radius**:
- First item: `roundedTop` prop → `rounded-t-lg`
- Last item: `roundedBottom` prop → `rounded-b-lg`
- Middle items: No radius

**Icon**:
- Size: `w-4 h-4` (16px x 16px)
- Color: Inherits from parent text color

---

#### Menu Item with Submenu (Export)

```tsx
<FlyoutMenuItem
  icon={Download}
  asDiv  // Don't render as button
>
  <div className="relative group/export w-full">
    <div className="flex items-center justify-between w-full">
      <span>Export</span>
      <ChevronRight className="w-4 h-4 ml-auto" />
    </div>
    
    {/* Submenu */}
    <div className="absolute left-full top-0 ml-1 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all duration-200 pointer-events-none group-hover/export:pointer-events-auto">
      {/* Submenu items */}
    </div>
  </div>
</FlyoutMenuItem>
```

**Parent Item Specifications**:
- `asDiv` prop: Renders as `<div>` instead of `<button>`
- Group: `group/export` for submenu hover trigger
- Width: `w-full`
- ChevronRight: Indicates submenu availability

**Submenu Container**:
- Position: `absolute left-full top-0`
- Margin Left: `ml-1` (4px gap)
- Width: `w-48` (192px) or `w-56` (224px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-900`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-lg` (8px)
- Shadow: `shadow-lg`
- Padding Vertical: `py-1` (4px)
- Z-Index: `z-50`

**Submenu Visibility**:
- Default: `opacity-0 invisible pointer-events-none`
- On Hover: `group-hover/export:opacity-100 group-hover/export:visible group-hover/export:pointer-events-auto`
- Transition: `transition-all duration-200`

---

#### Submenu Items

##### Export Options (CSV, Excel, PDF)
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    handleExport("csv");
    setShowMoreMenu(false);
  }}
  className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 rounded-t-lg"
>
  <FileSpreadsheet className="w-4 h-4" />
  CSV
</button>
```

**Specifications**:
- Width: `w-full`
- Padding: `px-4 py-2.5` (16px/10px)
- Text Align: `text-left`
- Font Size: `text-sm` (14px)
- Text Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-800`
- Display: `flex items-center`
- Gap: `gap-2` (8px)
- Transition: `transition-colors`

**Border Radius**:
- First item (CSV): `rounded-t-lg`
- Middle items (Excel): No radius
- Last item (PDF): `rounded-b-lg`

**Icons**:
- CSV/Excel: `FileSpreadsheet` (w-4 h-4)
- PDF: `FileText` (w-4 h-4)

**Important**: `e.stopPropagation()` prevents submenu from closing when clicking items

---

##### Column Visibility Options
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    toggleColumn('employeeId');
  }}
  className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between gap-2"
>
  <span>Employee ID</span>
  {visibleColumns.employeeId && <Check className="w-4 h-4 text-primary-600" />}
</button>
```

**Specifications**:
- Same as export submenu items
- Layout: `flex items-center justify-between`
- Check Icon: Shows when column is visible
- Check Icon Color:
  - Light: `text-primary-600`
  - Dark: `dark:text-primary-400` (can be same)

**Check Mark**:
- Component: `Check` from lucide-react
- Size: `w-4 h-4` (16px x 16px)
- Color: `text-primary-600`
- Position: Right side of item

---

#### Print Menu Item
```tsx
<FlyoutMenuItem
  icon={Printer}
  onClick={() => {
    handlePrint();
    setShowMoreMenu(false);
  }}
>
  Print
</FlyoutMenuItem>
```

**Specifications**: Same as simple menu item

---

#### Customize Columns Menu Item (with submenu)
```tsx
<FlyoutMenuItem
  icon={Columns3}
  asDiv
  roundedBottom  // Last item in main menu
>
  <div className="relative group/columns w-full">
    {/* Same pattern as Export submenu */}
  </div>
</FlyoutMenuItem>
```

**Specifications**: Same as Export submenu pattern

---

## Action Bar Responsive Behavior

### Desktop (≥1024px)
- All items in single row
- Search bar takes available space
- Buttons aligned to right

### Tablet (768px - 1023px)
- May wrap to multiple rows
- Search bar full width or shared row
- Buttons wrap below if needed

### Mobile (<768px)
- Stack vertically
- Search bar full width
- Buttons in row with wrapping
- Smaller padding/margins

---

## State Management

### Required State
```typescript
// Search and filters
const [searchQuery, setSearchQuery] = useState("");
const [showFilterPopup, setShowFilterPopup] = useState(false);
const [filters, setFilters] = useState<FilterCondition[]>([]);

// Date range
const [showDateRangeFilter, setShowDateRangeFilter] = useState(false);
const [dateRange, setDateRange] = useState<{
  start: Date | null;
  end: Date | null;
  label?: string;
}>({ start: null, end: null });

// UI toggles
const [showSummary, setShowSummary] = useState(true);
const [showMoreMenu, setShowMoreMenu] = useState(false);

// Column visibility
const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
  column1: true,
  column2: true,
  // ... all columns
});
```

---

## Event Handlers

### Refresh
```typescript
const handleRefresh = () => {
  // Refresh data
  fetchData();
  toast.success("Data refreshed successfully");
};
```

### Export
```typescript
const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
  // Export logic
  toast.success(`Exporting as ${format.toUpperCase()}...`);
  
  // Implementation depends on format
  switch(format) {
    case 'csv':
      exportToCSV(filteredData);
      break;
    case 'excel':
      exportToExcel(filteredData);
      break;
    case 'pdf':
      exportToPDF(filteredData);
      break;
  }
};
```

### Print
```typescript
const handlePrint = () => {
  window.print();
  toast.success("Preparing print view...");
};
```

### Toggle Column
```typescript
const toggleColumn = (columnId: string) => {
  setVisibleColumns(prev => ({
    ...prev,
    [columnId]: !prev[columnId]
  }));
};
```

---

## Color System

### Buttons (Default State)
- Border: `border-neutral-300 dark:border-neutral-700`
- Background: `bg-white dark:bg-neutral-900`
- Text: `text-neutral-700 dark:text-neutral-300`
- Icon: `text-neutral-600 dark:text-neutral-400`

### Buttons (Active State)
- Border: `border-primary-500`
- Background: `bg-primary-50 dark:bg-primary-950`
- Text: `text-primary-700 dark:text-primary-300`
- Icon: `text-primary-600 dark:text-primary-400`

### Buttons (Hover State)
- Background: `hover:bg-neutral-50 dark:hover:bg-neutral-900`

### Menu Items
- Text: `text-neutral-700 dark:text-neutral-300`
- Hover Background: `hover:bg-neutral-50 dark:hover:bg-neutral-800`

### Check Mark (Selected)
- Color: `text-primary-600 dark:text-primary-400`

---

## Typography

### Page Title
- Component renders internally in PageHeader
- Font Size: `text-2xl` (24px)
- Font Weight: `font-bold`
- Color: `text-neutral-900 dark:text-white`

### Breadcrumbs
- Component renders internally in PageHeader
- Font Size: `text-sm` (14px)
- Color: `text-neutral-600 dark:text-neutral-400`
- Active: `text-neutral-900 dark:text-white`

### Button Text
- Font Size: `text-sm` (14px)
- Font Weight: Regular

### Menu Items
- Font Size: `text-sm` (14px)
- Font Weight: Regular

---

## Spacing

### Action Bar
- Gap between items: `gap-2` (8px)
- Wrapping: `flex-wrap`

### Buttons
- Padding: `px-4 py-2` (16px/8px)
- Icon padding: `p-2` (8px all sides)

### Menu Items
- Padding: `px-4 py-2.5` (16px/10px)
- Gap (icon to text): `gap-2` (8px)

### Submenus
- Margin from parent: `ml-1` (4px)
- Padding vertical: `py-1` (4px)

---

## Accessibility

### Button Labels
- All icon buttons have `title` prop for tooltips
- Screen reader text for date range display

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close menus and popups

### ARIA Attributes
- `aria-label` on icon-only buttons
- `aria-expanded` on dropdown triggers
- `aria-haspopup` for menu buttons

### Focus States
- Visible focus ring on all interactive elements
- Focus trap in modal popups

---

## Implementation Example

```tsx
import { PageHeader, SearchBar, IconButton, FlyoutMenu, FlyoutMenuItem } from '../components/hb/listing';
import { RefreshCw, MoreVertical, BarChart3, Calendar } from 'lucide-react';

function ReportPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  return (
    <div className="p-5 md:p-6">
      <PageHeader
        title="Report Title"
        breadcrumbs={[
          { label: "Home", href: "#" },
          { label: "Reports", href: "#" },
          { label: "Report Title", current: true },
        ]}
      >
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search..."
        />

        {/* Date Range */}
        <button className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Date Range</span>
        </button>

        {/* Toggle Summary */}
        <IconButton
          icon={BarChart3}
          onClick={() => setShowSummary(!showSummary)}
          active={showSummary}
          title="Toggle Summary"
        />

        {/* Refresh */}
        <IconButton
          icon={RefreshCw}
          onClick={() => console.log('Refresh')}
          title="Refresh"
        />

        {/* More Menu */}
        <div className="relative" data-flyout-container>
          <IconButton
            icon={MoreVertical}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More options"
          />
          
          {showMoreMenu && (
            <FlyoutMenu position="right" onClose={() => setShowMoreMenu(false)}>
              {/* Menu items */}
            </FlyoutMenu>
          )}
        </div>
      </PageHeader>
    </div>
  );
}
```

---

## Notes

1. **Container Attribute**: `data-flyout-container` is required for proper popup positioning
2. **Submenu Hover**: Uses group hover pattern with named groups (`group/export`, `group/columns`)
3. **Stop Propagation**: Required in submenu items to prevent menu from closing
4. **Icon Size**: Consistent 16px (w-4 h-4) for all action icons
5. **Border Radius**: First/last items in menus have rounded corners
6. **Z-Index**: Submenus have higher z-index (z-50) than parent menu
7. **Transition**: 200ms duration for smooth submenu appearance
8. **Pointer Events**: Submenu starts with `pointer-events-none`, enables on hover
9. **Active State**: Date range and summary buttons show active state with primary colors
10. **Toast Notifications**: Use `sonner` library for success/error messages

---

**Last Updated**: December 24, 2024
**Version**: 1.0
**Component Path**: `/src/app/components/hb/listing`
