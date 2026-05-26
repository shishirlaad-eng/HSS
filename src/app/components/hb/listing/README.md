# 🧩 HB Listing Components Library

**Generic, reusable UI components for any listing/table page**

---

## 📦 What's in This Folder?

This folder contains **production-ready, generic components** that work with ANY data type - customers, products, orders, invoices, employees, locations, or whatever your business needs.

### **Components Available:**

1. **IconButton.tsx** - 40×40px icon buttons
2. **PrimaryButton.tsx** - Main action buttons  
3. **SecondaryButton.tsx** - Secondary/cancel buttons
4. **FlyoutMenu.tsx** - Dropdown menus with submenu support
5. **Breadcrumb.tsx** - Navigation breadcrumbs
6. **SearchBar.tsx** - Gmail-style expandable search
7. **PageHeader.tsx** - Page title with breadcrumb and actions
8. **SummaryWidgets.tsx** - Generic dashboard metrics
9. **FilterPopup.tsx** - Advanced multi-filter dropdown
10. **StatusFilter.tsx** - Quick status filtering
11. **DateRangeFilter.tsx** - Date range picker
12. **FilterChips.tsx** - Active filter chips display
13. **ViewModeSwitcher.tsx** - Grid/Table/List toggle
14. **Pagination.tsx** - Page navigation
15. **index.ts** - Barrel export for easy imports

---

## 🚀 How to Use in Your Project

### Step 1: Import Components

```tsx
// Import all at once
import { 
  IconButton, 
  PrimaryButton, 
  SecondaryButton,
  FlyoutMenu,
  PageHeader,
  SearchBar,
  SummaryWidgets,
  FilterPopup
} from './components/hb/listing';

// Or import individually
import { IconButton } from './components/hb/listing/IconButton';
```

### Step 2: Define Your Data Type

```tsx
import type { GenericDataItem } from '../../../utils/widgetCalculator';

interface Customer extends GenericDataItem {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  revenue: number;
}
```

### Step 3: Use Components with Your Data

```tsx
<SummaryWidgets
  widgets={[
    {
      id: 'total',
      label: 'Total Customers',
      icon: 'Users',
      color: 'indigo',
      enabled: true,
      formula: { type: 'count' }
    }
  ]}
  data={customers}
/>
```

---

## 📖 Component Usage Examples

### IconButton

```tsx
import { Search, RefreshCw, Settings } from 'lucide-react';
import { IconButton } from './components/hb/listing';

<IconButton 
  icon={Search} 
  onClick={() => setShowSearch(true)}
  title="Search"
/>

<IconButton 
  icon={RefreshCw} 
  onClick={handleRefresh}
  title="Refresh"
/>

<IconButton 
  icon={Settings} 
  onClick={() => setShowSettings(true)}
  active={showSettings}
  title="Settings"
/>
```

**Props:**
- `icon` (LucideIcon) - Required - The icon component from lucide-react
- `onClick` (function) - Optional - Click handler
- `title` (string) - Optional - Tooltip text
- `active` (boolean) - Optional - Active state (changes border/color)
- `className` (string) - Optional - Additional classes

**Specifications:**
- Size: 40×40px
- Icon Size: 20×20px
- Border: neutral-200, Hover: primary-300
- Exact class: See IconButton.tsx

---

### PrimaryButton

```tsx
import { Plus, Save, Upload } from 'lucide-react';
import { PrimaryButton } from './components/hb/listing';

<PrimaryButton 
  icon={Plus} 
  onClick={() => setShowAddForm(true)}
>
  Add Employee
</PrimaryButton>

<PrimaryButton 
  icon={Save} 
  onClick={handleSave}
  hideTextOnMobile
>
  Save Changes
</PrimaryButton>

<PrimaryButton onClick={handleSubmit} type="submit">
  Submit
</PrimaryButton>
```

**Props:**
- `children` (ReactNode) - Required - Button text
- `icon` (LucideIcon) - Optional - Icon to show before text
- `onClick` (function) - Optional - Click handler
- `type` ('button' | 'submit') - Optional - Default: 'button'
- `hideTextOnMobile` (boolean) - Optional - Hide text on mobile, show on desktop
- `className` (string) - Optional - Additional classes

**Specifications:**
- Height: 40px
- Padding: 16px × 8px
- Background: primary-600, Hover: primary-700
- Icon Size: 16×16px

---

### SecondaryButton

```tsx
import { Download } from 'lucide-react';
import { SecondaryButton } from './components/hb/listing';

<SecondaryButton onClick={handleCancel}>
  Cancel
</SecondaryButton>

<SecondaryButton icon={Download} onClick={handleExport}>
  Export Data
</SecondaryButton>
```

**Props:**
- `children` (ReactNode) - Required - Button text
- `icon` (LucideIcon) - Optional - Icon
- `onClick` (function) - Optional - Click handler
- `type` ('button' | 'submit') - Optional
- `className` (string) - Optional

**Specifications:**
- Border: neutral-300, Text: neutral-700
- Hover: Background neutral-50
- Same size as PrimaryButton

---

### FlyoutMenu

```tsx
import { Upload, Download, Printer } from 'lucide-react';
import { FlyoutMenu, FlyoutMenuItem, FlyoutMenuDivider, NestedFlyout } from './components/hb/listing';

<div className="relative" data-flyout-container>
  <IconButton 
    icon={MoreVertical}
    onClick={() => setShowMenu(!showMenu)}
  />
  
  {showMenu && (
    <FlyoutMenu position="right">
      <FlyoutMenuItem 
        icon={Upload} 
        onClick={handleImport}
        roundedTop
      >
        Import from Excel
      </FlyoutMenuItem>
      
      <FlyoutMenuItem 
        icon={Download} 
        hasSubmenu
        onMouseEnter={() => setShowExport(true)}
        onMouseLeave={() => setShowExport(false)}
      >
        Export
      </FlyoutMenuItem>
      
      {showExport && (
        <NestedFlyout>
          <FlyoutMenuItem icon={Download} roundedTop>
            Export as CSV
          </FlyoutMenuItem>
          <FlyoutMenuItem icon={Download}>
            Export as Excel
          </FlyoutMenuItem>
          <FlyoutMenuItem icon={Download} roundedBottom>
            Export as PDF
          </FlyoutMenuItem>
        </NestedFlyout>
      )}
      
      <FlyoutMenuDivider />
      
      <FlyoutMenuItem 
        icon={Printer} 
        onClick={() => window.print()}
        roundedBottom
      >
        Print
      </FlyoutMenuItem>
    </FlyoutMenu>
  )}
</div>
```

**FlyoutMenu Props:**
- `children` (ReactNode) - Required - Menu items
- `position` ('left' | 'right') - Optional - Default: 'right'
- `width` (string) - Optional - Default: 'w-56' (224px)
- `className` (string) - Optional

**FlyoutMenuItem Props:**
- `children` (ReactNode) - Required - Item text
- `icon` (LucideIcon) - Optional - Item icon
- `onClick` (function) - Optional - Click handler
- `hasSubmenu` (boolean) - Optional - Shows chevron on right
- `onMouseEnter/Leave` (function) - Optional - For submenu trigger
- `roundedTop/Bottom` (boolean) - Optional - For first/last items
- `className` (string) - Optional

**Specifications:**
- Width: 224px default
- Padding per item: 16px × 10px
- Font Size: 14px
- Shadow: shadow-xl
- Z-index: 20, Nested: 30

---

### Breadcrumb

```tsx
import { Breadcrumb, BreadcrumbItem } from './components/hb/listing';

<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/hr">Human Resources</BreadcrumbItem>
  <BreadcrumbItem current>Employee Management</BreadcrumbItem>
</Breadcrumb>
```

**Breadcrumb Props:**
- `children` (ReactNode) - Required - BreadcrumbItems
- `className` (string) - Optional

**BreadcrumbItem Props:**
- `children` (ReactNode) - Required - Item text
- `href` (string) - Optional - Link URL, default: '#'
- `current` (boolean) - Optional - Is current page (no link)
- `onClick` (function) - Optional - Click handler

**Specifications:**
- Font Size: 14px
- Link Color: neutral-600, Hover: primary-600
- Current: neutral-900, no hover
- Separator: ChevronRight, 16×16px

---

### SearchBar

```tsx
import { SearchBar } from './components/hb/listing';

const [searchQuery, setSearchQuery] = useState('');
const [showAdvanced, setShowAdvanced] = useState(false);

<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search employees..."
  onAdvancedSearch={() => setShowAdvanced(true)}
/>
```

**Props:**
- `value` (string) - Required - Search query
- `onChange` (function) - Required - Update query
- `placeholder` (string) - Optional - Default: 'Search...'
- `onAdvancedSearch` (function) - Optional - Shows filter button if provided
- `className` (string) - Optional

**Behavior:**
- Starts collapsed (icon only)
- Expands to input on click
- Auto-focuses input when expanded
- Shows close X button when expanded
- Optional filter button for advanced search

**Specifications:**
- Collapsed: 40×40px icon button
- Expanded: Min 320px wide
- Icon Size: 16×16px when expanded
- Auto focus: Yes

---

### PageHeader

```tsx
import { Plus } from 'lucide-react';
import { PageHeader } from './components/hb/listing';
import { PrimaryButton, IconButton } from './components/hb/listing';

<PageHeader
  title="Employee Management"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Human Resources', href: '/hr' },
    { label: 'Employee Management', current: true }
  ]}
>
  <PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>
    Add Employee
  </PrimaryButton>
  <IconButton icon={RefreshCw} onClick={handleRefresh} />
</PageHeader>
```

**Props:**
- `title` (string) - Required - Page title
- `breadcrumbs` (array) - Optional - Array of breadcrumb objects
  - `label` (string) - Required - Breadcrumb text
  - `href` (string) - Optional - Link URL
  - `current` (boolean) - Optional - Is current page
  - `onClick` (function) - Optional - Click handler
- `children` (ReactNode) - Optional - Action buttons/elements
- `className` (string) - Optional

**Specifications:**
- Title: 32px, 600 weight, 40px line-height
- Margin Bottom: 24px
- Includes Breadcrumb component automatically
- Children displayed on right side with gap-3

---

## 🎯 Why Use These Components?

### ✅ Benefits

1. **Consistency** - Same look across all pages
2. **Speed** - No need to write CSS classes
3. **Maintainability** - Update once, affects all pages
4. **Tested** - All components are battle-tested from CRM
5. **Responsive** - Mobile/tablet/desktop handled
6. **Dark Mode** - Automatic support
7. **Accessible** - Proper ARIA labels, keyboard support

### ❌ Without Components (Old Way)

```tsx
// You write this every time:
<button className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg transition-all">
  <Search className="w-5 h-5" />
</button>
```

### ✅ With Components (New Way)

```tsx
// You write this:
<IconButton icon={Search} />
```

**Saves:** ~150 characters per button × dozens of buttons = thousands of characters!

---

## 📏 All Specifications Documented

Every component has exact specifications at the top of its file:

- Measurements (width, height, padding, margin)
- Colors (default, hover, active, dark mode)
- Typography (size, weight, line-height)
- Spacing (gap, padding)
- Transitions (type, duration)
- Icon sizes
- Hover effects

**See:** `/TEMPLATES/EXACT_SPECIFICATIONS.md` for complete reference

---

## 🔄 Adding New Components

When you create a new reusable component:

1. **Create file** in `/components/hb/listing/YourComponent.tsx`
2. **Add specifications** at top of file (copy format from existing)
3. **Export** from `index.ts`
4. **Document** in this README

**Example:**

```tsx
/**
 * REUSABLE YOUR COMPONENT
 * 
 * Description of component
 * 
 * SPECIFICATIONS:
 * - Size: ...
 * - Colors: ...
 * - Hover: ...
 * 
 * USAGE:
 * <YourComponent prop={value} />
 */

export function YourComponent({ ...props }) {
  return (
    // Component code
  );
}
```

---

## 🎨 Customization

### Can I Customize?

**Yes, but carefully!**

**Safe to customize:**
- `className` prop (add additional classes)
- Icon sizes (if needed for specific use case)
- Width of FlyoutMenu
- Placeholder text in SearchBar

**Don't customize:**
- Core sizes (40px buttons, 16px icons)
- Colors (use theme system)
- Hover effects
- Transitions
- Border styles

**Why?** Consistency across your entire application suite!

---

## 📦 File Sizes

All components are lightweight:

```
IconButton.tsx       ~1.5 KB
PrimaryButton.tsx    ~1.8 KB
SecondaryButton.tsx  ~1.5 KB
FlyoutMenu.tsx       ~3.5 KB
Breadcrumb.tsx       ~1.2 KB
SearchBar.tsx        ~2.5 KB
PageHeader.tsx       ~1.8 KB
index.ts             ~0.5 KB
---------------------------------
Total:               ~14.3 KB
```

**Tiny footprint, huge productivity boost!**

---

## ✅ Checklist for New Project

When starting new project:

- [ ] Copy `/components/hb/` folder to new project
- [ ] Verify imports work: `import { IconButton } from './components/hb/listing'`
- [ ] Replace old button HTML with `<IconButton>`
- [ ] Replace breadcrumb HTML with `<Breadcrumb>`
- [ ] Replace search HTML with `<SearchBar>`
- [ ] Use `<PageHeader>` for page titles
- [ ] Use `<FlyoutMenu>` for all dropdown menus
- [ ] Test all components in light & dark mode
- [ ] Test responsive behavior

---

## 📞 Support

**Need help?**

1. Check component file for specifications
2. See `/TEMPLATES/EXACT_SPECIFICATIONS.md` for detailed specs
3. Look at CRM LeadListing.tsx for real-world usage
4. Check this README for examples

**Found a bug?**

1. Check if you're passing correct props
2. Verify you copied entire `/components/hb/` folder
3. Check console for TypeScript errors
4. Compare with original LeadListing.tsx

---

## 🎉 Success Story

**Before Components:**
- 30 buttons in listing page
- 30 × 150 characters = 4,500 characters of repeated code
- Hard to maintain
- Easy to make mistakes
- Inconsistent styling

**After Components:**
- 30 buttons in listing page
- 30 × 30 characters = 900 characters (80% reduction!)
- Update once, affects all
- TypeScript catches errors
- Perfect consistency

**You save:** 3,600 characters per page × many pages = massive time savings!

---

**Version:** 1.0  
**Created:** December 19, 2025  
**Source:** CRM LeadListing.tsx  
**Components:** Production-tested and ready to use!