# 🎯 EXACT UI SPECIFICATIONS - CRM Listing Page

**Complete specification document with every measurement, color, hover effect, and interaction detail**

---

## 📏 LAYOUT & SPACING

### Page Container
```tsx
className="p-5 md:p-6 bg-white dark:bg-neutral-950 min-h-screen px-[8px] py-[4px]"
```
- **Mobile Padding:** 20px (p-5)
- **Desktop Padding:** 24px (md:p-6)
- **Inner Padding X:** 8px (px-[8px])
- **Inner Padding Y:** 4px (py-[4px])
- **Background:** white (dark: neutral-950)
- **Min Height:** 100vh (min-h-screen)

### Content Max Width
```tsx
className="max-w-[100%] mx-auto"
```
- **Max Width:** 100% (no restriction)
- **Margin:** auto centered

---

## 🎨 PAGE HEADER SECTION

### Title
```tsx
className="text-[32px] leading-[40px] font-semibold text-neutral-900 dark:text-white mb-1"
```
- **Font Size:** 32px
- **Line Height:** 40px
- **Font Weight:** 600 (semibold)
- **Color:** neutral-900 (dark: white)
- **Margin Bottom:** 4px (mb-1)
- **DO NOT use Tailwind size classes** - Use exact pixels!

### Breadcrumb Container
```tsx
className="flex items-center gap-2 text-sm"
```
- **Display:** flex
- **Align:** items-center
- **Gap:** 8px (gap-2)
- **Font Size:** 14px (text-sm)

### Breadcrumb Link
```tsx
className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
```
- **Default Color:** neutral-600 (dark: neutral-400)
- **Hover Color:** primary-600 (dark: primary-400)
- **Transition:** colors only (transition-colors)

### Breadcrumb Separator
```tsx
<ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
```
- **Size:** 16px × 16px (w-4 h-4)
- **Color:** neutral-400 (dark: neutral-600)

### Breadcrumb Current Page
```tsx
className="text-neutral-900 dark:text-white"
```
- **Color:** neutral-900 (dark: white)
- **No Hover:** Current page is not clickable

---

## 🔘 BUTTON SPECIFICATIONS

### Icon Button (Standard)
```tsx
className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg transition-all"
```

**Dimensions:**
- Width: 40px (w-10)
- Height: 40px (h-10)

**Colors:**
- Background: white (dark: neutral-950)
- Border: neutral-200 (dark: neutral-800)
- Border Hover: primary-300 (dark: primary-700)
- Icon Color: neutral-600 (dark: neutral-400)

**Spacing & Shape:**
- Border Radius: 8px (rounded-lg)
- Border Width: 1px
- Display: flex
- Align: items-center justify-center

**Effects:**
- Transition: all properties (transition-all)
- Cursor: pointer (default)

**Icon Inside:**
- Size: 20px × 20px (w-5 h-5)

---

### Icon Button (Active State)
```tsx
className="border-primary-500 dark:border-primary-600 text-primary-600 dark:text-primary-400"
```
- **Active Border:** primary-500 (dark: primary-600)
- **Active Icon Color:** primary-600 (dark: primary-400)

---

### Primary Button
```tsx
className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors flex items-center gap-2"
```

**Dimensions:**
- Padding Horizontal: 16px (px-4)
- Padding Vertical: 8px (py-2)
- Height: ~40px (auto from padding)

**Colors:**
- Background: primary-600 (#1766C2)
- Hover Background: primary-700
- Active Background: primary-800
- Text: white

**Spacing & Shape:**
- Border Radius: 8px (rounded-lg)
- Gap (icon + text): 8px (gap-2)
- Display: flex items-center

**Icon Inside:**
- Size: 16px × 16px (w-4 h-4)

**Mobile Behavior:**
- Text: hidden md:inline (hide text on mobile, show on desktop)

**Effects:**
- Transition: colors only (transition-colors)
- Cursor: pointer

---

### Secondary Button
```tsx
className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-2"
```

**Dimensions:**
- Padding: 16px × 8px (px-4 py-2)

**Colors:**
- Border: neutral-300 (dark: neutral-700)
- Text: neutral-700 (dark: neutral-300)
- Background: transparent
- Hover Background: neutral-50 (dark: neutral-900)

**Spacing:**
- Border Radius: 8px (rounded-lg)
- Gap: 8px (gap-2)

---

## 🔍 SEARCH BAR SPECIFICATIONS

### Collapsed State (Icon Only)
```tsx
className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg transition-all"
```
- Same as Icon Button
- Icon Size: 20px × 20px (w-5 h-5)

### Expanded State (Input Visible)
```tsx
// Container
className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm min-w-[320px]"

// Search Icon
<Search className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />

// Input
className="flex-1 bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none"

// Filter Button
className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"

// Close Button
className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-sm"
```

**Container:**
- Min Width: 320px
- Padding: 16px × 8px (px-4 py-2)
- Border: neutral-300 (dark: neutral-700)
- Border Radius: 8px
- Shadow: shadow-sm
- Gap: 8px (gap-2)

**Icons:**
- Search Icon: 16px × 16px, neutral-400 (dark: neutral-600)
- Filter Icon: 16px × 16px in 4px padding button
- Close: Text "✕", 14px

**Input:**
- Flex: flex-1 (takes remaining space)
- Background: transparent
- Text Color: neutral-900 (dark: white)
- Placeholder: neutral-400 (dark: neutral-600)
- Focus: No outline
- Auto Focus: Yes

---

## 📋 FLYOUT MENU SPECIFICATIONS

### Menu Container
```tsx
className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-20"
```

**Position:**
- Position: absolute
- Alignment: right-0 (or left-0)
- Vertical: top-full mt-2 (8px below trigger)

**Dimensions:**
- Width: 224px (w-56) - Default
- Can vary: w-48 (192px), w-64 (256px), w-96 (384px)

**Style:**
- Background: white (dark: neutral-950)
- Border: neutral-200 (dark: neutral-800)
- Border Radius: 8px (rounded-lg)
- Shadow: shadow-xl
- Z-index: 20

---

### Menu Item
```tsx
className="w-full px-4 py-2.5 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-2"
```

**Dimensions:**
- Width: 100% (w-full)
- Padding Horizontal: 16px (px-4)
- Padding Vertical: 10px (py-2.5)

**Typography:**
- Font Size: 14px (text-sm)
- Text Align: left
- Color: neutral-700 (dark: neutral-300)

**Hover:**
- Background: neutral-50 (dark: neutral-900)
- Transition: colors only

**Layout:**
- Display: flex items-center
- Gap: 8px (gap-2)

**Icon:**
- Size: 16px × 16px (w-4 h-4)
- Position: Left side, before text
- Always included for better UX

**Rounded Corners:**
- First item: rounded-t-lg
- Last item: rounded-b-lg
- Middle items: no rounding

### Common Action Menu Icons
```tsx
// Standard Actions
import { Eye, Edit2, Trash2, GitBranch, Briefcase } from 'lucide-react';

// View action
<Eye className="w-4 h-4" />

// Edit action
<Edit2 className="w-4 h-4" />

// Delete action (with divider above)
<Trash2 className="w-4 h-4" />

// Hierarchy/Organization actions
<GitBranch className="w-4 h-4" />

// Status/Job actions
<Briefcase className="w-4 h-4" />
```

### Delete Menu Item (Danger Action)
```tsx
className="w-full px-4 py-2.5 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 transition-colors border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
```
- **Text Color:** error-600 (dark: error-400)
- **Hover Background:** error-50 (dark: error-950)
- **Border Top:** Divider above delete action (neutral-200/800)
- **Always Last:** Delete action is always the last item

---

### Nested Flyout (Submenu)
```tsx
className="absolute left-full top-0 ml-1 w-48 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-30"
```

**Position:**
- Position: absolute
- Horizontal: left-full ml-1 (4px to right of parent)
- Vertical: top-0 (aligned with parent item)

**Z-index:** 30 (higher than parent menu)

**Trigger:**
- On Mouse Enter/Leave
- Shows on hover over parent item with submenu
- Parent item has ChevronRight icon (w-4 h-4) on right

---

### Menu Divider
```tsx
className="border-t border-neutral-200 dark:border-neutral-800 my-1"
```
- Border Top: 1px solid
- Color: neutral-200 (dark: neutral-800)
- Margin Vertical: 4px (my-1)

---

## 📊 SUMMARY WIDGETS (STATS CARD) SPECIFICATIONS

### Toggle Behavior
**Default State:** Closed/Hidden (showSummary = false)  
**Toggle Button:** BarChart3 icon in page header action bar  
**Animation:** Fade-in slide-in-from-top-4 duration-300 on show

### Implementation Pattern
```tsx
// State management
const [showSummary, setShowSummary] = useState(false);

// Toggle button in header
<IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} />

// Conditional rendering
{showSummary && (
  <SummaryWidgets widgets={widgets} />
)}
```

### Component Usage - Simple Widgets
```tsx
<SummaryWidgets 
  widgets={[
    {
      label: 'Total Employees',
      value: '150',
      trend: '+12',
      trendDirection: 'up',
    },
    {
      label: 'Active',
      value: '120',
      trend: '+5',
      trendDirection: 'up',
    },
  ]}
/>
```

### Component Usage - Advanced (with Data & Formulas)
```tsx
<SummaryWidgets 
  widgets={widgetConfigs}  // WidgetConfig[] with formulas
  data={employeeData}      // GenericDataItem[]
  onManageWidgets={handleManageWidgets}
/>
```

**Supported Widget Types:**
1. **SimpleWidget** - Direct values (string | number)
2. **WidgetConfig** - Formula-based calculations from data

### Simple Widget Interface
```tsx
interface SimpleWidget {
  label: string;              // Display name
  value: string | number;     // Direct value to show
  trend?: string;             // e.g., '+12', '-5'
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: string;              // Lucide icon name
  subtitle?: string;          // Optional description
}
```

- **Standard Component:** Always use `SummaryWidgets` instead of raw JSX
- **Data Driven:** Powered by dynamic widget configuration
- **Flexible:** Supports both simple static values and complex calculations

### Card Container
```tsx
className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
```

**Style:**
- Background: white (dark: neutral-950)
- Border: neutral-200 (dark: neutral-800)
- Border Radius: 8px (rounded-lg)
- Padding: 16px (p-4)

**Grid Layout:**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5"
```
- Mobile: 1 column
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 4 columns (lg:grid-cols-4)
- Gap: 16px (gap-4)
- Margin Bottom: 20px (mb-5)

### Card Header (Label + Icon)
```tsx
className="flex items-center justify-between mb-2"
```
- Display: flex, space-between
- Margin Bottom: 8px (mb-2)

### Label
```tsx
className="text-neutral-600 dark:text-neutral-400 text-sm"
```
- Color: neutral-600 (dark: neutral-400)
- Font Size: 14px (text-sm)

### Icon Container
```tsx
className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center"
```
- Size: 32px × 32px (w-8 h-8)
- Border Radius: 8px (rounded-lg)
- Background: primary-100 (dark: primary-950)
- Display: flex, centered

### Icon
```tsx
className="w-4 h-4 text-primary-600 dark:text-primary-400"
```
- Size: 16px × 16px (w-4 h-4)
- Color: primary-600 (dark: primary-400)

### Value (Large Number)
```tsx
className="text-2xl text-neutral-900 dark:text-white mb-1"
```
- Font Size: 24px (text-2xl)
- Color: neutral-900 (dark: white)
- Margin Bottom: 4px (mb-1)
- **Note:** This uses Tailwind size class for number display

### Growth Indicator
```tsx
className="flex items-center gap-1 text-xs"
```
- Display: flex items-center
- Gap: 4px (gap-1)
- Font Size: 12px (text-xs)

### Growth Icon
```tsx
<TrendingUp className="w-3 h-3 text-success-500" />
```
- Size: 12px × 12px (w-3 h-3)
- Color: success-500 (green)

### Growth Text
```tsx
className="text-success-600 dark:text-success-400"
```
- Color: success-600 (dark: success-400)

### Comparison Text
```tsx
className="text-neutral-500"
```
- Color: neutral-500

---

## 🎯 VIEW MODE SWITCHER

### Container
```tsx
className="relative" data-flyout-container
```
- Position: relative
- Data attribute for click-outside detection

### Current View Button
```tsx
className="w-10 h-10 flex items-center justify-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg transition-all"
```
- Same as Icon Button
- Shows current view icon (Grid/List/Table/Kanban)

### View Option (Selected)
```tsx
className="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950"
```
- Text Color: primary-600 (dark: primary-400)
- Background: primary-50 (dark: primary-950)

### View Option (Not Selected)
```tsx
className="text-neutral-700 dark:text-neutral-300"
```
- Text Color: neutral-700 (dark: neutral-300)
- Background: transparent
- Hover: bg-neutral-50 (dark: bg-neutral-900)

---

## 📋 TABLE VIEW SPECIFICATIONS

### Table Container
```tsx
className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
```
- Background: white (dark: neutral-950)
- Border: neutral-200 (dark: neutral-800)
- Border Radius: 8px (rounded-lg)
- Overflow: hidden (for rounded corners)

### Table Header
```tsx
className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800"
```
- Background: neutral-50 (dark: neutral-900)
- Border Bottom: neutral-200 (dark: neutral-800)

### Table Header Cell
```tsx
className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider"
```
- Padding: 16px × 12px (px-4 py-3)
- Text Align: left
- Font Size: 12px (text-xs)
- Color: neutral-600 (dark: neutral-400)
- Transform: uppercase
- Letter Spacing: wider (tracking-wider)

### Table Body
```tsx
className="divide-y divide-neutral-200 dark:divide-neutral-800"
```
- Divider: neutral-200 (dark: neutral-800)

### Table Row
```tsx
className="hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
```
- Hover Background: neutral-50 (dark: neutral-900)
- Cursor: pointer
- Transition: colors

### Table Cell
```tsx
className="px-4 py-3 text-sm text-neutral-900 dark:text-white"
```
- Padding: 16px × 12px (px-4 py-3)
- Font Size: 14px (text-sm)
- Color: neutral-900 (dark: white)

---

## 🎴 GRID VIEW SPECIFICATIONS

### Grid Container
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
```
- Mobile: 1 column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3 columns (lg:grid-cols-3)
- Large Desktop: 4 columns (xl:grid-cols-4)
- Gap: 16px (gap-4)

### Grid Card
```tsx
className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md hover:border-primary-600 dark:hover:border-primary-400 transition-all cursor-pointer relative group"
```
- Background: white (dark: neutral-950)
- Border: neutral-200 (dark: neutral-800)
- Border Radius: 8px (rounded-lg)
- Padding: 16px (p-4)
- Hover Shadow: shadow-md
- Hover Border: primary-600 (dark: primary-400)
- Transition: all (shadow + border color)
- Cursor: pointer
- Group: For child hover effects (avatars)

### Avatar/Image in Grid Card
**With Avatar Image:**
```tsx
<img 
  src={item.avatar} 
  alt={item.name}
  className="w-12 h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
/>
```
- Size: 48px × 48px (w-12 h-12)
- Shape: rounded-full
- Object Fit: cover
- Default: grayscale (grey)
- On Card Hover: grayscale-0 (colorful)
- Transition: all

**Without Avatar (Initials Circle):**
```tsx
<div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-medium transition-all">
  {initials}
</div>
```
- Size: 48px × 48px (w-12 h-12)
- Shape: rounded-full
- Default Background: neutral-200 (dark: neutral-800)
- Hover Background: primary-100 (dark: primary-900)
- Default Text: neutral-500 (dark: neutral-400)
- Hover Text: primary-600 (dark: primary-400)
- Transition: all

---

## 📝 LIST VIEW SPECIFICATIONS

### List Container
```tsx
className="space-y-2"
```
- Space Between: 8px (space-y-2)

### List Item
```tsx
className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
```
- Background: white (dark: neutral-950)
- Border: neutral-200 (dark: neutral-800)
- Border Radius: 8px (rounded-lg)
- Padding: 16px (p-4)
- Hover Background: neutral-50 (dark: neutral-900)
- Transition: colors
- Cursor: pointer

---

## 🎨 COLOR SPECIFICATIONS

### Primary Color
```
#1766C2 (primary-600)
```
- Never changes across themes
- Used for: buttons, links, active states, highlights

### Neutral Colors (Light Mode)
```
neutral-50:   #fafafa  (backgrounds, hover states)
neutral-100:  #f5f5f5  (card backgrounds)
neutral-200:  #e5e5e5  (borders)
neutral-300:  #d4d4d4  (borders, dividers)
neutral-400:  #a3a3a3  (icons, placeholders)
neutral-500:  #737373  (muted text)
neutral-600:  #525252  (body text, icons)
neutral-700:  #404040  (headings)
neutral-800:  #262626  (dark text)
neutral-900:  #171717  (headings, emphasis)
neutral-950:  #0a0a0a  (darkest)
```

### Neutral Colors (Dark Mode)
```
neutral-50:   #0a0a0a  (darkest backgrounds)
neutral-100:  #171717
neutral-200:  #262626
neutral-300:  #404040
neutral-400:  #525252  (icons, muted text)
neutral-500:  #737373
neutral-600:  #a3a3a3  (icons, placeholders)
neutral-700:  #d4d4d4  (borders)
neutral-800:  #e5e5e5  (borders, dividers)
neutral-900:  #f5f5f5  (card backgrounds, hover)
neutral-950:  #fafafa  (backgrounds)
```

### Semantic Colors
```
Success:  green (#10b981 family)
Warning:  orange/yellow (#f59e0b family)
Error:    red (#ef4444 family)
Info:     blue (#3b82f6 family)
```

---

## ⚡ TRANSITION & ANIMATION SPECIFICATIONS

### Standard Transitions
```tsx
transition-colors    // For color changes (most common)
transition-all       // For multiple properties (buttons, borders)
transition-shadow    // For shadow changes (cards)
transition-transform // For movement/scale
```

**Duration:** Default (150ms)
**Easing:** Default (ease-in-out)

### Common Patterns
- Buttons: `transition-colors`
- Cards: `transition-shadow` or `transition-colors`
- Icon Buttons: `transition-all`
- Dropdown menus: No transition on visibility, `transition-colors` on items
- Hover effects: Immediate (no delay)

---

## 🎯 HOVER EFFECT SPECIFICATIONS

### Buttons
- **Icon Button:** Border color changes to primary-300/700
- **Primary Button:** Background darkens (primary-700)
- **Secondary Button:** Background appears (neutral-50/900)

### Links
- **Breadcrumb:** Text color changes to primary-600/400
- **Action Links:** Color changes to primary-600/400

### Cards
- **Grid Card:** Shadow increases to shadow-md + Border changes to primary-600/400
- **Grid Card Avatar (with image):** Grayscale to colorful (grayscale → grayscale-0)
- **Grid Card Avatar (initials):** Grey to primary color (neutral-200/800 → primary-100/900, neutral-500/400 → primary-600/400)
- **List Item:** Background appears (neutral-50/900)
- **Table Row:** Background appears (neutral-50/900)

### Menu Items
- **Flyout Items:** Background appears (neutral-50/900)
- **Always immediate:** No transition delay

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile:    < 768px  (default, no prefix)
Tablet:    ≥ 768px  (md:)
Desktop:   ≥ 1024px (lg:)
Large:     ≥ 1280px (xl:)
XL:        ≥ 1536px (2xl:)
```

### Common Responsive Patterns

**Grid Columns:**
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
// Mobile: 1, Tablet: 2, Desktop: 3, Large: 4
```

**Padding:**
```tsx
p-5 md:p-6
// Mobile: 20px, Desktop: 24px
```

**Text Visibility:**
```tsx
hidden md:inline
// Hide on mobile, show on desktop
```

**Stats Cards:**
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
// Mobile: stack, Tablet: 2 columns, Desktop: 4 columns
```

---

## 🔧 Z-INDEX HIERARCHY

```
Base Layer:           z-0 (default, no class needed)
Dropdown Menus:       z-10
Flyout Menus:         z-20
Nested Flyouts:       z-30
Modals/Drawers:       z-40
Modal Backdrops:      z-50
Tooltips:             z-60
```

**Rule:** Always increment by 10 for flexibility

---

## 📋 COMMON CLASS COMBINATIONS

### Standard Card
```tsx
bg-white dark:bg-neutral-950 
border border-neutral-200 dark:border-neutral-800 
rounded-lg p-4
```

### Hover Card
```tsx
bg-white dark:bg-neutral-950 
border border-neutral-200 dark:border-neutral-800 
rounded-lg p-4 
hover:shadow-md transition-shadow 
cursor-pointer
```

### Icon Button
```tsx
w-10 h-10 
flex items-center justify-center 
text-neutral-600 dark:text-neutral-400 
bg-white dark:bg-neutral-950 
border border-neutral-200 dark:border-neutral-800 
hover:border-primary-300 dark:hover:border-primary-700 
rounded-lg 
transition-all
```

### Primary Button
```tsx
px-4 py-2 
bg-primary-600 
hover:bg-primary-700 
active:bg-primary-800 
text-white 
rounded-lg 
transition-colors 
flex items-center gap-2
```

### Flyout Menu Item
```tsx
w-full px-4 py-2.5 
text-left text-sm 
text-neutral-700 dark:text-neutral-300 
hover:bg-neutral-50 dark:hover:bg-neutral-900 
transition-colors 
flex items-center gap-2
```

---

## ✅ CHECKLIST FOR NEW LISTING PAGE

When creating a new listing page, ensure:

### Layout
- [ ] Page container: p-5 md:p-6
- [ ] Inner padding: px-[8px] py-[4px]
- [ ] Max width: max-w-[100%]
- [ ] Background: white dark:bg-neutral-950

### Header
- [ ] Title: text-[32px] leading-[40px] font-semibold
- [ ] Breadcrumb: flex gap-2 text-sm
- [ ] Breadcrumb links: hover:text-primary-600
- [ ] Chevron separator: w-4 h-4

### Buttons
- [ ] Icon buttons: w-10 h-10
- [ ] Icon size: w-5 h-5
- [ ] Border hover: primary-300/700
- [ ] Primary button: px-4 py-2, bg-primary-600
- [ ] Button icons: w-4 h-4
- [ ] Gap: gap-2 between icon and text

### Search
- [ ] Collapsed: w-10 h-10 icon button
- [ ] Expanded: min-w-[320px]
- [ ] Search icon: w-4 h-4
- [ ] Auto focus on expand
- [ ] Close on X click

### Flyouts
- [ ] Container: w-56, shadow-xl, z-20
- [ ] Items: px-4 py-2.5, text-sm
- [ ] Icons: w-4 h-4 (REQUIRED for all menu items)
- [ ] Icon placement: Left side, gap-2
- [ ] Hover: bg-neutral-50/900
- [ ] Delete item: error-600/400 text, error-50/950 hover, border-t above
- [ ] Nested: left-full ml-1, z-30

### Action Menus (3-dot)
- [ ] Always include icons from lucide-react
- [ ] Common icons: Eye (view), Edit2 (edit), Trash2 (delete), GitBranch (hierarchy), Briefcase (status)
- [ ] Delete action: Always last with top border divider
- [ ] Layout: flex items-center gap-2

### Add/Edit Modal
- [ ] Rendered at component root level (not inside conditional blocks)
- [ ] Uses FormModal component with max-w-2xl
- [ ] Two sections: Personal Information + Work Information
- [ ] Grid layout: md:grid-cols-2 for fields
- [ ] Cancel (secondary) + Submit (primary) buttons in footer
- [ ] Form state: showAddModal, showEditModal, formData
- [ ] Add: clears formData, Edit: populates formData

### Stats Cards (Summary Widgets)
- [ ] Use `SummaryWidgets` component
- [ ] Grid: 1/2/4 columns responsive
- [ ] Gap: gap-4
- [ ] Padding: p-4
- [ ] Icon container: w-8 h-8
- [ ] Icon: w-4 h-4
- [ ] Value: text-2xl

### Views
- [ ] Grid: 1/2/3/4 columns responsive
- [ ] List: space-y-2
- [ ] Table: overflow-hidden rounded-lg
- [ ] All: hover effects working

### Colors
- [ ] Borders: neutral-200/800
- [ ] Text: neutral-900/white, neutral-600/400
- [ ] Hover borders: primary-300/700
- [ ] Backgrounds: white/neutral-950

### Transitions
- [ ] Buttons: transition-all or transition-colors
- [ ] Cards: transition-shadow or transition-colors
- [ ] Links: transition-colors
- [ ] No transition delays

---

**Version:** 2.5  
**Last Updated:** January 12, 2026  
**Source:** SampleDesign.tsx (Employee Management - Production Template)  
**All measurements verified and tested**

**Changelog v2.5:**
- **Form Dropdown Fix:** ChevronDown icon properly aligned right with p-1 viewport padding
- **Date Input Fix:** Native calendar icon hidden, custom Calendar icon shown on right (single icon)
- **Add/Edit Modal Pattern:** Complete implementation guide with state management and proper modal placement
- **Action Menu Icons Added:** All 3-dot action menus now include icons (Eye, Edit2, Trash2, GitBranch, Briefcase)
- **Delete Item Styling:** Red text with error hover background and top divider
- Summary Widgets toggle functionality (default closed)
- SimpleWidget interface support for direct value widgets
- Grid card hover effects (primary border + grayscale avatar transitions)
- Avatar specifications for grid view (grey to colorful on hover)

---

## 📝 ADD/EDIT MODAL PATTERN

### Overview
The Add/Edit modal pattern provides a consistent way to create and update records in listing pages. The modal uses the FormModal component with proper state management and form handling.

### Critical Rule: Modal Placement
**⚠️ MUST READ:** The FormModal MUST be rendered at the root level of your component's return statement, NOT inside conditional blocks.

**❌ WRONG:**
```tsx
if (showDetailView) {
  return <><DetailView /><FormModal /></>; // Modal only in detail view
}
return <ListView />; // No modal here - ADD button won't work!
```

**✅ CORRECT:**
```tsx
return (
  <div>
    <ListView />
    <FormModal /> {/* Always available */}
  </div>
);
```

### State Management Pattern
```tsx
// Modal visibility
const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);

// Data management
const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
const [formData, setFormData] = useState<Partial<Employee>>({
  name: '', email: '', phone: '', department: '',
  position: '', location: '', status: 'active', joinDate: '',
});
```

### Handler Functions Pattern
```tsx
// ADD: Clear form, open modal
const handleAdd = () => {
  setFormData({ name: '', email: '', status: 'active', /* ... */ });
  setShowAddModal(true);
};

// EDIT: Populate form, open modal
const handleEdit = (employee: Employee) => {
  setSelectedEmployee(employee);
  setFormData(employee);
  setShowEditModal(true);
};

// SUBMIT: Process and close
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form submitted:', formData);
  setShowAddModal(false);
  setShowEditModal(false);
};
```

### Complete Implementation Example
See SampleDesign.tsx for the full working example with:
- FormModal component
- Two-section layout (Personal + Work Info)
- Grid responsive layout (md:grid-cols-2)
- Form validation
- Dynamic title and button text
- Proper close handling