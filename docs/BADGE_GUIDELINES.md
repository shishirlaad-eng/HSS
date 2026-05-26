# Badge & Tag Guidelines

## 🎯 Badge System Overview

We have **TWO distinct badge patterns** for different use cases:

---

## Pattern 1 & 2: Status Badge with Dot (Unified Pattern)

**Use For:**
- Tables and data grids
- Reports and dashboards  
- Listing pages (grid/list view)
- All status displays across ALL views
- Professional UI elements

**Visual Pattern:**
- ⚪ Gray background
- ⚪ Gray border
- ⚪ Gray text
- 🔴 **Colorful dot indicator**

### Code Example:

```tsx
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
  <div className="w-1.5 h-1.5 rounded-full bg-success-500"></div>
  <span className="text-xs text-neutral-600 dark:text-neutral-400">Active</span>
</span>
```

### Complete Specifications:

**Container:**
- Display: `inline-flex items-center`
- Gap: `gap-1.5` (6px between dot and text)
- Padding: `px-2 py-0.5` (8px horizontal, 2px vertical)
- Background: `bg-white dark:bg-neutral-900`
- Border: `border border-neutral-200 dark:border-neutral-800`
- Border Radius: `rounded-full`

**Status Dot:**
- Size: `w-1.5 h-1.5` (6px × 6px)
- Shape: `rounded-full`
- Color: **Semantic color** (success-500, warning-500, error-500, info-500, neutral-400)

**Text:**
- Font Size: `text-xs` (12px)
- Color: `text-neutral-600 dark:text-neutral-400` (ALWAYS gray, never colored)

### Dot Color System:

```typescript
const getDotColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'present':
      return 'bg-success-500';  // Green dot
    
    case 'pending':
    case 'in progress':
    case 'partial':
      return 'bg-warning-500';  // Orange dot
    
    case 'inactive':
    case 'rejected':
    case 'cancelled':
      return 'bg-error-500';    // Red dot
    
    case 'scheduled':
    case 'upcoming':
      return 'bg-info-500';     // Blue dot
    
    default:
      return 'bg-neutral-400';  // Gray dot
  }
};
```

---

## Pattern 3: Tags (Removable Labels)

**Use For:**
- Filter chips
- Selected items
- Removable labels
- Multi-select displays

**Visual Pattern:**
- ⚪ Gray outline border
- ⚪ Gray text
- 🏷️ Optional icon
- ❌ Remove button

### Code Example:

```tsx
<span className="inline-flex items-center gap-2 px-2 py-0.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-md">
  <Tag className="w-3 h-3" />
  <span>JavaScript</span>
  <button 
    onClick={handleRemove}
    className="hover:text-error-500 transition-colors"
  >
    <X className="w-3 h-3" />
  </button>
</span>
```

### Complete Specifications:

**Container:**
- Display: `inline-flex items-center`
- Gap: `gap-2` (8px)
- Padding: `px-2 py-0.5`
- Border: `border border-neutral-200 dark:border-neutral-800`
- Background: `bg-white dark:bg-neutral-950`
- Border Radius: `rounded-md` (6px, not full rounded)
- Text: `text-xs text-neutral-700 dark:text-neutral-300`

**Icon (optional):**
- Size: `w-3 h-3` (12px)
- Color: Inherits from container

**Remove Button:**
- Hover: `hover:text-error-500`
- Transition: `transition-colors`

---

## ❌ ANTI-PATTERNS (What NOT to Do)

### ❌ Don't Use Black Borders
```tsx
// WRONG
<span className="border border-black">...</span>

// CORRECT
<span className="border border-neutral-200 dark:border-neutral-800">...</span>
```

### ❌ Don't Mix Patterns
```tsx
// WRONG - Dot badge with colored text
<span className="bg-white border border-neutral-200">
  <div className="bg-success-500"></div>
  <span className="text-success-600">Active</span>  {/* Text should be gray! */}
</span>

// CORRECT
<span className="bg-white border border-neutral-200">
  <div className="bg-success-500"></div>
  <span className="text-neutral-600">Active</span>  {/* Gray text */}
</span>
```

### ❌ Don't Use Full Color Badges for Status
```tsx
// WRONG - Full color badge (old Pattern 2)
<span className="px-2 py-0.5 text-xs rounded-full bg-success-100 text-success-700">
  Active
</span>

// CORRECT - Use dot badge consistently
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-neutral-200 rounded-full">
  <div className="w-1.5 h-1.5 rounded-full bg-success-500"></div>
  <span className="text-xs text-neutral-600">Active</span>
</span>
```

---

## 📊 Decision Tree: Which Badge Pattern?

```
Are you showing any type of status?
├─ YES → Use Pattern 1 & 2 (Dot Badge) - Unified Pattern
│         - Use in ALL views (Grid, List, Table)
│         - Gray background, border, text
│         - Colorful dot
│
└─ NO → Is it a removable filter/tag?
        ├─ YES → Use Pattern 3 (Tag)
        │         - Outline style with remove button
        │
        └─ NO → Use Shadcn Badge variants for generic labels
                  - Default, Secondary, Outline
                  - For non-status purposes only
```

---

## 📝 Implementation Examples

### Example 1: Table Cell with Status Badge (Pattern 1)

```tsx
<td className="px-4 py-1.5">
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
    <div className={`w-1.5 h-1.5 rounded-full ${getDotColor(item.status)}`}></div>
    <span className="text-xs text-neutral-600 dark:text-neutral-400">
      {item.status}
    </span>
  </span>
</td>
```

### Example 2: List View Item (Pattern 2 - Same as Pattern 1)

```tsx
<div className="flex items-center gap-2">
  <span className="text-neutral-900 dark:text-white">{item.name}</span>
  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
    <div className={`w-1.5 h-1.5 rounded-full ${getDotColor(item.status)}`}></div>
    <span className="text-xs text-neutral-600 dark:text-neutral-400">{item.status}</span>
  </span>
</div>
```

### Example 3: Grid View Card (Pattern 1 & 2 - Unified)

```tsx
<div className="card">
  <div className="card-header">
    <h3>{item.title}</h3>
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
      <div className={`w-1.5 h-1.5 rounded-full ${getDotColor(item.status)}`}></div>
      <span className="text-xs text-neutral-600 dark:text-neutral-400">{item.status}</span>
    </span>
  </div>
</div>
```

### Example 4: Filter Tags (Pattern 3)

```tsx
<div className="flex flex-wrap gap-2">
  {selectedFilters.map((filter) => (
    <span 
      key={filter}
      className="inline-flex items-center gap-2 px-2 py-0.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-md"
    >
      <span>{filter}</span>
      <button onClick={() => removeFilter(filter)}>
        <X className="w-3 h-3" />
      </button>
    </span>
  ))}
</div>
```

---

## ✅ Checklist for Badge Implementation

- [ ] Using dot badge (Pattern 1 & 2) for ALL status displays
- [ ] Consistent across all views (Grid, List, Table)
- [ ] No black borders (use neutral-200/800)
- [ ] Dot badges have GRAY text (not colored)
- [ ] Tags have outline style with proper border
- [ ] Using semantic colors (success, warning, error, info)
- [ ] Proper dark mode support
- [ ] Consistent sizing (text-xs, px-2 py-0.5)

---

**Last Updated:** January 2026
**Version:** 2.0.0 - Unified Pattern 1 & 2

