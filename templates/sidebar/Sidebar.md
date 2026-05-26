# Sidebar Component Template

## Overview
A fixed-position, collapsible navigation sidebar with hierarchical menu structure, user profile section with dropdown menu, and full dark mode support. Features expandable/collapsible submenus, active state highlighting, hover-triggered scrollbar visibility, and smooth animations. Includes Change Password modal functionality.

**Key Features**:
- ✅ Collapsible sidebar (expanded/collapsed states)
- ✅ Hierarchical menu structure with expandable submenus
- ✅ Active state highlighting for current page
- ✅ Hover-triggered scrollbar visibility
- ✅ User profile dropdown with menu options
- ✅ Change Password modal integration
- ✅ Click-outside-to-close functionality
- ✅ Full dark mode support
- ✅ Smooth transitions and animations

---

## Component Structure

```
Sidebar
├── Logo Section (Fixed Top)
│   ├── Logo + Brand Name
│   └── Hamburger Toggle Button
│
├── Navigation Menu (Scrollable)
│   ├── Menu Items (Parent)
│   │   ├── Icon
│   │   ├── Label
│   │   └── Chevron (if has subitems)
│   │
│   └── Sub Menu Items (Nested)
│       ├── Bullet Indicator
│       └── Label
│
└── User Profile Section (Fixed Bottom)
    ├── Profile Button
    │   ├── Avatar
    │   ├── Name & Email
    │   └── Chevron
    │
    └── Profile Popover (Drawer)
        ├── User Info Header
        ├── Menu Items (Profile, Settings, etc.)
        └── Sign Out Button
```

---

## Layout Specifications

### Sidebar Container
```jsx
<aside className="fixed left-0 top-0 bottom-0 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 z-40">
```

**Specifications**:
- Position: `fixed left-0 top-0 bottom-0`
- Width (Expanded): `w-64` (256px)
- Width (Collapsed): `w-16` (64px)
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`
- Border:
  - Light: `border-r border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Z-Index: `z-40`
- Transition: `transition-all duration-300`

---

## Logo Section (Fixed Top)

### Container
```jsx
<div className="h-12 flex-shrink-0 px-4 flex items-center justify-between">
```

**Specifications**:
- Height: `h-12` (48px) - Matches GlobalHeader height
- Padding: `px-4` (16px horizontal)
- Display: `flex items-center justify-between`
- Shrink: `flex-shrink-0`

**Collapsed State**:
- Display: `flex justify-center items-center`
- Shows hamburger menu only

### Logo & Brand Name
```jsx
<div className="flex items-center gap-2">
  <img src={logo} alt="Company Logo" className="h-8 w-auto object-contain" />
  <span className="text-lg text-neutral-900 dark:text-white">Your Brand</span>
</div>
```

**Specifications**:
- Container Gap: `gap-2` (8px)
- Logo Height: `h-8` (32px)
- Logo Width: `w-auto`
- Logo Fit: `object-contain`
- Brand Font Size: `text-lg` (18px)
- Brand Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`

### Hamburger Toggle Button
```jsx
<button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
  <Menu className="w-5 h-5" />
</button>
```

**Specifications**:
- Size: `w-8 h-8` (32px x 32px)
- Display: `flex items-center justify-center`
- Border Radius: `rounded-lg` (8px)
- Text Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Hover Background:
  - Light: `hover:bg-neutral-100`
  - Dark: `dark:hover:bg-neutral-900`
- Transition: `transition-colors`
- Icon Size: `w-5 h-5` (20px x 20px)

**Accessibility**:
- `aria-label`: Dynamic based on state
  - Collapsed: "Expand sidebar"
  - Expanded: "Collapse sidebar"
- `title`: Tooltip text
  - Collapsed: "Expand menu"
  - Expanded: "Collapse menu"

---

## Navigation Menu Section

### Menu Container
```jsx
<div 
  className={`overflow-y-auto overflow-x-hidden h-[calc(100vh-96px)] py-2 transition-all ${
    isHoveringMenu 
      ? 'scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent' 
      : '[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent'
  }`}
  onMouseEnter={() => setIsHoveringMenu(true)}
  onMouseLeave={() => setIsHoveringMenu(false)}
>
  <div className="space-y-1 px-2">
    {/* Menu items */}
  </div>
</div>
```

**Specifications**:
- Overflow Y: `overflow-y-auto`
- Overflow X: `overflow-x-hidden` (prevents horizontal scroll)
- Height: `h-[calc(100vh-96px)]`
  - Full viewport height minus 96px (48px header + 48px user profile)
- Padding Vertical: `py-2` (8px)
- Transition: `transition-all` (smooth scrollbar appearance)
- Scrollbar Styling (On Hover):
  - `scrollbar-thin` (thinner scrollbar)
  - `scrollbar-thumb-neutral-300` (light mode thumb)
  - `dark:scrollbar-thumb-neutral-700` (dark mode thumb)
  - `scrollbar-track-transparent` (invisible track)
- Scrollbar Hidden (Default):
  - `[&::-webkit-scrollbar]:w-0` (hidden scrollbar)
  - `[&::-webkit-scrollbar-thumb]:bg-transparent` (transparent thumb)
- Event Handlers:
  - `onMouseEnter`: Show scrollbar when hovering
  - `onMouseLeave`: Hide scrollbar when not hovering
- Inner Container Padding: `px-2` (8px)
- Inner Container Spacing: `space-y-1` (4px between items)

**Scroll Behavior**:
- Only the menu section scrolls
- Scrollbar appears only on hover
- Profile section remains fixed at bottom
- Profile popover appears above scrollable area
- Smooth native scrolling with hover-triggered scrollbar visibility

### Parent Menu Item
```jsx
<button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors">
  <div className="flex items-center gap-3 min-w-0">
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="text-sm truncate">{label}</span>
  </div>
  {/* Chevron if has subitems */}
</button>
```

**Specifications**:
- Width: `w-full`
- Display: `flex items-center justify-between`
- Padding: `px-3 py-2.5` (12px/10px)
- Border Radius: `rounded-lg` (8px)
- Transition: `transition-colors`

**Collapsed State**:
- Additional Classes: `justify-center`
- Only icon shown, label hidden

**Default State Colors**:
- Text Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`

**Active State Colors** (when item or any subitem is active):
- Background:
  - Light: `bg-primary-50`
  - Dark: `dark:bg-primary-950`
- Text Color:
  - Light: `text-primary-600`
  - Dark: `dark:text-primary-400`

### Menu Item Icon
**Specifications**:
- Size: `w-5 h-5` (20px x 20px)
- Shrink: `flex-shrink-0`
- Inherits color from parent button

### Menu Item Label
**Specifications**:
- Font Size: `text-sm` (14px)
- Text Truncate: `truncate`
- Hidden when collapsed

### Menu Item Content Container
**Specifications**:
- Display: `flex items-center`
- Gap: `gap-3` (12px)
- Min Width: `min-w-0` (allows text truncation)

### Chevron Icon (for expandable items)
```jsx
{isExpanded ? (
  <ChevronUp className="w-4 h-4" />
) : (
  <ChevronDown className="w-4 h-4" />
)}
```

**Specifications**:
- Size: `w-4 h-4` (16px x 16px)
- Container: `flex-shrink-0`
- Hidden when collapsed
- Hidden when item has no subitems

---

### Sub Menu Items Section

#### Container
```jsx
<div className="mt-1 ml-4 space-y-1">
  {/* Sub menu items */}
</div>
```

**Specifications**:
- Margin Top: `mt-1` (4px)
- Margin Left: `ml-4` (16px) - Indentation
- Spacing: `space-y-1` (4px between items)
- Hidden when parent collapsed
- Hidden when parent not expanded

#### Sub Menu Item Button
```jsx
<button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors">
  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
  <span className="truncate">{label}</span>
</button>
```

**Specifications**:
- Width: `w-full`
- Display: `flex items-center`
- Gap: `gap-2` (8px)
- Padding: `px-3 py-2` (12px/8px)
- Border Radius: `rounded-lg` (8px)
- Font Size: `text-sm` (14px)
- Transition: `transition-colors`

**Default State Colors**:
- Text Color:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Hover Text:
  - Light: `hover:text-neutral-900`
  - Dark: `dark:hover:text-white`

**Active State Colors**:
- Background:
  - Light: `bg-primary-50`
  - Dark: `dark:bg-primary-950`
- Text Color:
  - Light: `text-primary-600`
  - Dark: `dark:text-primary-400`

#### Bullet Indicator
**Specifications**:
- Size: `w-1.5 h-1.5` (6px x 6px)
- Shape: `rounded-full`
- Color: `bg-current` (inherits from parent)
- Opacity: `opacity-40` (40%)

#### Sub Item Label
**Specifications**:
- Text Truncate: `truncate`
- Inherits font size from parent button

---

## User Profile Section (Fixed Bottom)

### Container
```jsx
<div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
```

**Specifications**:
- Position: `absolute bottom-0 left-0 right-0`
- Border Top:
  - Light: `border-t border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`

### Profile Button
```jsx
<button className="w-full p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
```

**Specifications**:
- Width: `w-full`
- Padding: `p-3` (12px all sides)
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Transition: `transition-colors`

**Collapsed State**:
- Additional Classes: `flex justify-center`

### Profile Avatar
```jsx
<div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm">
  SD
</div>
```

**Specifications**:
- Size: `w-10 h-10` (40px x 40px)
- Shape: `rounded-full`
- Background: `bg-primary-600`
- Display: `flex items-center justify-center`
- Text Color: `text-white`
- Font Size: `text-sm` (14px)
- Shrink (when expanded): `flex-shrink-0`

### Profile Info (Expanded State)
```jsx
<div className="flex items-center gap-3">
  {/* Avatar */}
  <div className="flex-1 min-w-0 text-left">
    <div className="text-sm text-neutral-900 dark:text-white truncate">
      Sudharsan
    </div>
    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
      sudharsan@yopmail.com
    </div>
  </div>
  <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform" />
</div>
```

**Container Specifications**:
- Display: `flex items-center`
- Gap: `gap-3` (12px)

**Info Container**:
- Flex: `flex-1 min-w-0`
- Text Align: `text-left`

**Name**:
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`
- Truncate: `truncate`

**Email**:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-500`
  - Dark: `dark:text-neutral-400`
- Truncate: `truncate`

**Chevron Icon**:
- Size: `w-4 h-4` (16px x 16px)
- Color:
  - Light: `text-neutral-400`
  - Dark: Inherits neutral-400
- Shrink: `flex-shrink-0`
- Transform: `rotate-180` when drawer open
- Transition: `transition-transform`

---

## Profile Popover (Drawer)

### Container
```jsx
<div className="absolute bottom-full left-0 right-0 mb-2 mx-2">
  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden">
    {/* Content */}
  </div>
</div>
```

**Outer Container Specifications**:
- Position: `absolute bottom-full left-0 right-0`
- Margin Bottom: `mb-2` (8px)
- Margin Horizontal: `mx-2` (8px)

**Inner Container Specifications**:
- Background:
  - Light: `bg-white`
  - Dark: `dark:bg-neutral-950`
- Border:
  - Light: `border border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Border Radius: `rounded-lg` (8px)
- Shadow: `shadow-lg`
- Overflow: `overflow-hidden`

**Display Condition**:
- Only shown when `showProfileDrawer` is true
- Hidden when sidebar is collapsed

### User Info Header (in Drawer)
```jsx
<div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
  <div className="flex items-center gap-3">
    {/* Avatar, Name, Email */}
  </div>
</div>
```

**Specifications**:
- Padding: `p-4` (16px)
- Border Bottom:
  - Light: `border-b border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Content Display: `flex items-center`
- Content Gap: `gap-3` (12px)

**Avatar in Header**:
- Same specifications as profile button avatar

**Name & Email**:
- Same specifications as profile button info

### Menu Items Section (in Drawer)
```jsx
<div className="py-2">
  {/* Menu items */}
</div>
```

**Container Specifications**:
- Padding Vertical: `py-2` (8px)

#### Menu Item Button
```jsx
<button className="w-full px-4 py-2.5 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center gap-3">
  <Icon className="w-4 h-4" />
  <span className="text-sm">Label</span>
</button>
```

**Specifications**:
- Width: `w-full`
- Padding: `px-4 py-2.5` (16px/10px)
- Text Align: `text-left`
- Text Color:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`
- Hover Background:
  - Light: `hover:bg-neutral-50`
  - Dark: `dark:hover:bg-neutral-900`
- Transition: `transition-colors`
- Display: `flex items-center`
- Gap: `gap-3` (12px)

**Icon Specifications**:
- Size: `w-4 h-4` (16px x 16px)

**Label Specifications**:
- Font Size: `text-sm` (14px)

**Available Menu Items**:
1. Profile (`UserIcon`)
2. My Email Tokens (`CreditCard`)
3. Organization Settings (`Settings`)
4. Change Password (`Key`)

### Menu Divider
```jsx
<div className="border-t border-neutral-200 dark:border-neutral-800 my-1" />
```

**Specifications**:
- Border Top:
  - Light: `border-t border-neutral-200`
  - Dark: `dark:border-neutral-800`
- Margin Vertical: `my-1` (4px)

### Sign Out Button
```jsx
<button className="w-full px-4 py-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-3">
  <LogOut className="w-4 h-4" />
  <span className="text-sm">Sign out</span>
</button>
```

**Specifications**:
- Width: `w-full`
- Padding: `px-4 py-2.5` (16px/10px)
- Text Align: `text-left`
- Text Color:
  - Light: `text-red-600`
  - Dark: `dark:text-red-400`
- Hover Background:
  - Light: `hover:bg-red-50`
  - Dark: `dark:hover:bg-red-950`
- Transition: `transition-colors`
- Display: `flex items-center`
- Gap: `gap-3` (12px)

---

## Color System Reference

### Semantic Colors

#### Primary (Brand/Active States)
- `primary-50`: Active background light mode
- `primary-400`: Active text dark mode
- `primary-600`: Active text light mode, Avatar background
- `primary-950`: Active background dark mode

#### Neutral (General UI)
- `neutral-50`: Hover backgrounds (light)
- `neutral-100`: Hover backgrounds (light)
- `neutral-200`: Borders (light)
- `neutral-300`: Text (light)
- `neutral-400`: Icons, secondary text
- `neutral-500`: Tertiary text
- `neutral-600`: Icons, text (light)
- `neutral-700`: Primary text (light)
- `neutral-800`: Borders (dark)
- `neutral-900`: Text white, Hover backgrounds (dark)
- `neutral-950`: Panel backgrounds (dark)

#### Error/Destructive (Sign Out)
- `red-50`: Hover background (light)
- `red-400`: Text (dark)
- `red-600`: Text (light)
- `red-950`: Hover background (dark)

### Text Colors

#### Light Mode
- Primary Text: `text-neutral-900`
- Secondary Text: `text-neutral-700`
- Tertiary Text: `text-neutral-600`
- Subtle Text: `text-neutral-500`
- Active Text: `text-primary-600`
- Destructive Text: `text-red-600`

#### Dark Mode
- Primary Text: `dark:text-white`
- Secondary Text: `dark:text-neutral-300`
- Tertiary Text: `dark:text-neutral-400`
- Active Text: `dark:text-primary-400`
- Destructive Text: `dark:text-red-400`

---

## Typography Scale

### Font Sizes
- **Large**: `text-lg` (18px) - Brand name
- **Base**: `text-sm` (14px) - All menu items, labels
- **Small**: `text-xs` (12px) - Email addresses

### Font Weights
- **Regular**: Default (400) - All text
- No bold or medium weights used in sidebar

---

## Spacing Scale

### Padding
- `p-2`: 8px - Menu outer container vertical
- `p-3`: 12px - Profile button, menu items
- `p-4`: 16px - Logo section, drawer header
- `px-2`: 8px - Menu inner container horizontal
- `px-3`: 12px - Menu items horizontal
- `px-4`: 16px - Logo section, drawer items horizontal
- `py-2`: 8px - Menu outer container, sub items vertical
- `py-2.5`: 10px - Menu items, drawer items vertical

### Margin
- `mb-1`: 4px - Menu divider
- `mb-2`: 8px - Drawer bottom margin
- `ml-4`: 16px - Sub menu indentation
- `mt-1`: 4px - Sub menu top margin
- `mx-2`: 8px - Drawer horizontal margin
- `my-1`: 4px - Divider vertical margin

### Gap
- `gap-2`: 8px - Logo container, sub item content
- `gap-3`: 12px - Menu item content, profile info, drawer items

---

## Border Radius

- `rounded-lg`: 8px - All buttons, containers
- `rounded-full`: Full circle - Avatar, bullet indicators

---

## Shadows

- `shadow-lg`: Large shadow for profile drawer popover

---

## Transitions & Animations

### Standard Transitions
- `transition-colors`: All buttons, hover states
- `transition-all duration-300`: Sidebar width collapse/expand
- `transition-transform`: Chevron rotation

### Durations
- `duration-300`: 300ms for sidebar width transition

### Transforms
- `rotate-180`: Chevron when drawer open

---

## Icons

### Icon Library
- **Package**: `lucide-react` v0.487.0

### Icon Sizes
- **Small**: `w-4 h-4` (16px) - Chevrons, drawer menu icons, profile chevron
- **Standard**: `w-5 h-5` (20px) - Main menu icons, hamburger menu

### Common Icons Used

#### Navigation Icons
- `LayoutDashboard`: Dashboard
- `Building2`: Organisational Master
- `Users`: Employee Management
- `Clock`: Attendance Management
- `FileText`: Reporting

#### System Icons
- `Menu`: Hamburger toggle
- `ChevronUp`: Expand indicator
- `ChevronDown`: Collapse indicator
- `UserIcon`: Profile menu item
- `CreditCard`: Email tokens
- `Settings`: Organization settings
- `Key`: Change password
- `LogOut`: Sign out

---

## Responsive Behavior

### Sidebar States

#### Expanded State (Default)
- Width: `w-64` (256px)
- Shows: Logo, brand name, menu labels, sub items, profile info

#### Collapsed State
- Width: `w-16` (64px)
- Shows: Hamburger menu, menu icons only, avatar only
- Hides: Brand name, labels, chevrons, sub items, profile info, profile drawer

### Transition Behavior
- Smooth width transition with `transition-all duration-300`
- Content visibility changes instantly (no fade)

### Height Management
- **Logo Section**: Fixed `h-12` (48px)
- **User Profile**: Fixed height based on content
- **Menu Section**: Calculated `h-[calc(100vh-96px)]` with scroll

---

## Interactive States

### Menu Items
- **Default**: Neutral colors
- **Hover**: Light background change
- **Active**: Primary colored background and text
- **Parent Active** (has active child): Primary colored background and text
- **Disabled**: Not applicable (all items clickable)

### Collapse/Expand
- **Menu Items**: Can't expand submenu when sidebar collapsed
- **Profile Drawer**: Hidden when sidebar collapsed

### Click Outside
- Profile drawer closes when clicking outside its container
- Implemented with `useRef` and `mousedown` event listener

---

## State Management Requirements

### Component State
```typescript
const [expandedMenus, setExpandedMenus] = useState<string[]>([
  'employee-management',
  'organisational-master', 
  'attendance-management',
  'reporting'
]);
const [showProfileDrawer, setShowProfileDrawer] = useState(false);
const [isHoveringMenu, setIsHoveringMenu] = useState(false);
```

### Props Interface
```typescript
interface SidebarProps {
  onLogout?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentPage?: string;
  onNavigate?: (pageId: string) => void;
}
```

### Refs Required
```typescript
const profileRef = useRef<HTMLDivElement>(null);
```

---

## Navigation Data Structure

### Menu Item Interface
```typescript
interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  active?: boolean;
  subItems?: SubMenuItem[];
}
```

### Sub Menu Item Interface
```typescript
interface SubMenuItem {
  id: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
}
```

### Example Navigation Data
```typescript
{
  id: "employee-management",
  label: "Employee Management",
  icon: Users,
  subItems: [
    {
      id: "directory",
      label: "Directory",
      onClick: () => onNavigate('directory'),
      active: currentPage === 'directory',
    },
  ],
}
```

---

## Click Outside Detection Implementation

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
      setShowProfileDrawer(false);
    }
  };

  if (showProfileDrawer) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showProfileDrawer]);
```

---

## Main Layout Integration

### HTML Structure
```tsx
<div className="min-h-screen">
  <Sidebar {...props} />
  
  <main className={`transition-all duration-300 ${
    isSidebarCollapsed ? 'ml-16' : 'ml-64'
  }`}>
    {/* Page content */}
  </main>
</div>
```

### Main Content Margin
- **Expanded**: `ml-64` (256px) - Matches sidebar width
- **Collapsed**: `ml-16` (64px) - Matches collapsed width
- **Transition**: `transition-all duration-300` - Smooth shift

---

## Functionality Breakdown

### 1. Toggle Sidebar Collapse
**Function**: `onToggleCollapse()`
- Toggles between expanded/collapsed states
- Controlled by parent component
- Triggered by hamburger menu button

### 2. Toggle Submenu Expansion
**Function**: `toggleMenu(menuId: string)`
- Adds/removes menu ID from `expandedMenus` array
- Does nothing when sidebar is collapsed
- Toggles chevron icon direction

**Logic**:
```typescript
const toggleMenu = (menuId: string) => {
  if (isCollapsed) return;
  
  setExpandedMenus(prev => 
    prev.includes(menuId) 
      ? prev.filter(id => id !== menuId)
      : [...prev, menuId]
  );
};
```

### 3. Handle Navigation
**Function**: `onNavigate(pageId: string)`
- Callback function passed from parent
- Updates `currentPage` in parent state
- Triggers active state highlighting

### 4. Toggle Profile Drawer
**Function**: `setShowProfileDrawer(!showProfileDrawer)`
- Opens/closes profile popover
- Auto-closes on click outside
- Hidden when sidebar collapsed

### 5. Handle Logout
**Function**: `onLogout()`
- Optional callback function
- Triggered from sign out button in profile drawer
- Closes drawer before executing logout

---

## Active State Highlighting

### Parent Menu Active
A parent menu is considered active when:
1. The menu item itself has `active: true`
2. **OR** any of its sub-items has `active: true`

**Implementation**:
```typescript
const hasActiveSubItem = menuItem.subItems?.some(sub => sub.active);
```

### Visual Indicators
**Active Parent/Sub Item**:
- Background: Primary-50 (light) / Primary-950 (dark)
- Text: Primary-600 (light) / Primary-400 (dark)

**Inactive Items**:
- Background: Transparent
- Text: Neutral-700/300
- Hover: Neutral-50/900

---

## Accessibility Features

### Keyboard Navigation
- All menu items and buttons are keyboard accessible
- Tab navigation through all interactive elements
- Enter/Space to activate buttons

### ARIA Attributes
- `aria-label` on toggle button (describes current state)
- `title` attribute for tooltips (especially when collapsed)
- Semantic HTML (`<aside>`, `<nav>` implied)

### Screen Reader Support
- Meaningful labels for all buttons
- Icon-only buttons have aria-labels
- State changes announced through label updates

---

## Performance Considerations

### Optimization Strategies
1. **Conditional Rendering**: Sub-menus only render when parent expanded
2. **Event Delegation**: Single click handler per menu level
3. **Ref-based Detection**: Efficient click-outside implementation
4. **CSS Transitions**: Hardware-accelerated width changes
5. **Memoization**: Navigation data can be memoized if expensive

### Scroll Performance
- Fixed header and footer for stable layout
- Only menu section scrolls
- Native browser scrolling (no custom implementation)

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Custom Properties not required (uses Tailwind classes)
- Flexbox support required
- Dark mode via class switching (not media query)
- Fixed positioning support required

---

## Implementation Checklist

### Basic Structure
- [ ] Fixed sidebar container with correct dimensions
- [ ] Logo section at top (48px height)
- [ ] Scrollable menu section in middle
- [ ] User profile section at bottom
- [ ] Proper z-index for layering

### Logo Section
- [ ] Logo image with brand name
- [ ] Hamburger toggle button
- [ ] Conditional rendering based on collapse state
- [ ] Proper alignment and spacing

### Navigation Menu
- [ ] Parent menu items with icons and labels
- [ ] Sub menu items with indentation
- [ ] Expand/collapse chevrons
- [ ] Active state highlighting
- [ ] Bullet indicators for sub items
- [ ] Text truncation for long labels

### User Profile
- [ ] Profile button with avatar and info
- [ ] Profile drawer/popover
- [ ] Menu items (Profile, Settings, etc.)
- [ ] Sign out button with red styling
- [ ] Click outside to close

### Collapsed State
- [ ] Width changes to 64px
- [ ] Only icons and avatar visible
- [ ] Labels and drawer hidden
- [ ] Smooth transition animation
- [ ] Main content margin adjustment

### Interactive Behaviors
- [ ] Toggle sidebar collapse
- [ ] Toggle submenu expansion
- [ ] Navigate to pages
- [ ] Toggle profile drawer
- [ ] Click outside to close drawer
- [ ] Logout functionality

### Styling
- [ ] Light mode colors
- [ ] Dark mode colors
- [ ] Hover states
- [ ] Active states
- [ ] Transitions and animations
- [ ] Proper spacing and padding

### Accessibility
- [ ] ARIA labels on icon buttons
- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Tooltip titles when collapsed
- [ ] Semantic HTML structure

---

## Customization Guide

### Changing Sidebar Width

**Expanded Width**:
```typescript
// Change from w-64 (256px)
className={isCollapsed ? 'w-16' : 'w-72'} // 288px

// Update main content margin to match
className={isSidebarCollapsed ? 'ml-16' : 'ml-72'}
```

**Collapsed Width**:
```typescript
// Change from w-16 (64px)
className={isCollapsed ? 'w-20' : 'w-64'} // 80px

// Update main content margin to match
className={isSidebarCollapsed ? 'ml-20' : 'ml-64'}
```

### Changing Logo Height
Logo section height should match GlobalHeader:
```typescript
// Currently h-12 (48px)
className="h-14 flex-shrink-0 px-4" // 56px

// Update menu height calculation
className="h-[calc(100vh-112px)]" // 14*2*4 = 112px
```

### Changing Active Color
Replace all `primary-*` classes:
```typescript
// From primary-50/600/950/400
// To your brand colors
bg-brand-50 dark:bg-brand-950
text-brand-600 dark:text-brand-400
```

### Adding Menu Icons
Import from `lucide-react`:
```typescript
import { YourIcon } from 'lucide-react';

// In navigation data
{
  id: "new-item",
  label: "New Item",
  icon: YourIcon,
  // ...
}
```

### Customizing Profile Section
Modify profile button content:
```typescript
// Change avatar size
className="w-12 h-12" // Larger (48px)

// Change info displayed
<div className="text-sm">{userName}</div>
<div className="text-xs">{userRole}</div> // Instead of email
```

### Adding Menu Dividers
Insert divider between menu items:
```typescript
<div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />
```

---

## Advanced Features (Optional)

### Badge/Counter on Menu Items
```typescript
// Add to MenuItem interface
badge?: number | string;

// Render in menu item
{menuItem.badge && (
  <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
    {menuItem.badge}
  </span>
)}
```

### Search in Sidebar
Add search input at top of menu section:
```typescript
<div className="px-2 pb-2">
  <input
    type="text"
    placeholder="Search menu..."
    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm"
  />
</div>
```

### Keyboard Shortcuts
Add keyboard shortcut display:
```typescript
// In menu item
<kbd className="px-1.5 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded">
  ⌘K
</kbd>
```

### Tooltip on Hover (Collapsed State)
Use a tooltip library or custom implementation:
```typescript
// When collapsed, show tooltip on hover
{isCollapsed && (
  <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded whitespace-nowrap">
    {menuItem.label}
  </div>
)}
```

---

## Testing Checklist

### Functionality Testing
- [ ] Sidebar expands/collapses correctly
- [ ] Submenus expand/collapses
- [ ] Active states highlight correctly
- [ ] Navigation triggers page changes
- [ ] Profile drawer opens/closes
- [ ] Click outside closes drawer
- [ ] Logout executes callback

### Visual Testing
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Hover states work on all items
- [ ] Text truncates properly
- [ ] Icons align correctly
- [ ] Spacing is consistent
- [ ] Transitions are smooth

### Responsive Testing
- [ ] Sidebar width transitions smoothly
- [ ] Main content shifts correctly
- [ ] Menu scrolls when content overflows
- [ ] Profile drawer positions correctly
- [ ] Works on different viewport heights

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Screen reader announces labels
- [ ] ARIA labels are correct
- [ ] Tooltips appear on collapsed state

### Edge Cases
- [ ] Very long menu labels truncate
- [ ] Many menu items scroll correctly
- [ ] Empty submenus (no items) handled
- [ ] Menu with no icon displays correctly
- [ ] Rapid clicking doesn't break state

---

## Common Issues & Solutions

### Issue: Submenu doesn't expand when clicked
**Solution**: Check that `toggleMenu` function is not returning early due to collapsed state

### Issue: Active state not highlighting
**Solution**: Ensure `currentPage` prop matches menu item `id` exactly

### Issue: Profile drawer appears behind other content
**Solution**: Check z-index hierarchy (sidebar should be z-40 or higher)

### Issue: Main content jumps when sidebar toggles
**Solution**: Ensure main content has matching `transition-all duration-300`

### Issue: Text truncation not working
**Solution**: Ensure parent containers have `min-w-0` to allow truncation

### Issue: Scroll not working in menu section
**Solution**: Check that height calculation is correct and `overflow-y-auto` is applied

---

## Version History

- **v1.0** - Initial template based on Sidebar implementation
- Designed for Nigerian Hospitality Sector Attendance Application
- Extracted as reusable template for future projects

---

## Integration Example

```tsx
import { Sidebar } from '@/components/Sidebar';
import { useState } from 'react';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('directory');

  const handleLogout = () => {
    // Logout logic
    console.log('Logging out...');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Your page content */}
      </main>
    </div>
  );
}
```

---

## File Structure

```
/src
├── /components
│   └── Sidebar.tsx
├── /mockAPI
│   └── navigationData.ts
└── /assets
    └── logo.png
```

### navigationData.ts
Contains menu structure with parent/child relationships and active states.

---

## Dependencies

### Required Packages
- `react`: ^18.0.0
- `lucide-react`: ^0.487.0

### Required Assets
- Logo image (PNG, SVG, or other format)
- Recommended: 32px height for consistency

---

## Support & Maintenance

For questions or improvements to this template:
1. Document any deviations from this spec
2. Update this template when making global design changes
3. Maintain consistency across all projects using this template
4. Test thoroughly when customizing

---

## Notes

1. **Collapse State**: When collapsed, only icons and avatar are visible
2. **Submenu Behavior**: Submenus cannot be expanded when sidebar is collapsed
3. **Profile Drawer**: Only visible when sidebar is expanded
4. **Active States**: Both parent and child items can have active states
5. **Z-Index**: Sidebar is z-40, header is z-50
6. **Height Management**: Logo (48px) + Profile (variable) + Menu (calculated)
7. **Transitions**: Only width animates, content shows/hides instantly
8. **Icon Consistency**: All navigation icons are 20px, UI icons are 16px
9. **Text Truncation**: Applied to all labels to handle overflow
10. **Click Outside**: Only applies to profile drawer, not sidebar itself

---

**Last Updated**: December 24, 2024