# Badge Quick Reference Card

## 🚦 Decision Flow

```
What are you building?
│
├─ Table or Report?
│  └─ ✅ Use Pattern 1: DOT BADGE
│      <Badge variant="status-dot">
│        <StatusDot color="success" />
│        Active
│      </Badge>
│
├─ Listing Page (Grid/List View)?
│  └─ ✅ Use Pattern 2: FULL COLOR BADGE
│      <Badge variant="success">Active</Badge>
│
└─ Filter or Tag?
   └─ ✅ Use Pattern 3: OUTLINE TAG
       <span className="...border...">
         Tag <X />
       </span>
```

---

## Pattern 1: Dot Badge (Tables/Reports) ⭐ PREFERRED

### Quick Copy
```tsx
import { Badge, StatusDot } from './components/ui/badge';

<Badge variant="status-dot">
  <StatusDot color="success" />
  Active
</Badge>
```

### Colors Available
- `success` → Green dot
- `warning` → Orange dot  
- `error` → Red dot
- `info` → Blue dot
- `neutral` → Gray dot

### Visual
```
┌─────────────────────┐
│ ● Active            │  ← Gray border, gray text, green dot
└─────────────────────┘
```

---

## Pattern 2: Full Color Badge (Listings)

### Quick Copy
```tsx
import { Badge } from './components/ui/badge';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Inactive</Badge>
```

### Visual
```
┌─────────┐
│ Active  │  ← Light green background, dark green text
└─────────┘
```

---

## Pattern 3: Outline Tag (Filters)

### Quick Copy
```tsx
<span className="inline-flex items-center gap-2 px-2 py-0.5 text-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-md">
  <Tag className="w-3 h-3" />
  <span>Tag Name</span>
  <button onClick={handleRemove} className="hover:text-error-500">
    <X className="w-3 h-3" />
  </button>
</span>
```

### Visual
```
┌────────────────┐
│ 🏷️ Tag Name  ✕ │  ← Gray outline, remove button
└────────────────┘
```

---

## ❌ Common Mistakes

### Mistake #1: Wrong Pattern for Tables
```tsx
// ❌ WRONG - Using full color in tables
<td><Badge variant="success">Active</Badge></td>

// ✅ CORRECT - Use dot badge
<td>
  <Badge variant="status-dot">
    <StatusDot color="success" />
    Active
  </Badge>
</td>
```

### Mistake #2: Colored Text in Dot Badge
```tsx
// ❌ WRONG - Colored text
<Badge variant="status-dot" className="text-success-600">
  <StatusDot color="success" />
  Active
</Badge>

// ✅ CORRECT - Gray text (automatic with variant)
<Badge variant="status-dot">
  <StatusDot color="success" />
  Active
</Badge>
```

### Mistake #3: Black Borders
```tsx
// ❌ WRONG - Black border
<span className="border border-black">Tag</span>

// ✅ CORRECT - Neutral border
<span className="border border-neutral-200 dark:border-neutral-800">Tag</span>
```

---

## 🎨 Color System

### Semantic Colors (Pattern 1 Dots)
- `bg-success-500` - #22c55e (Green)
- `bg-warning-500` - #f59e0b (Orange)
- `bg-error-500` - #ef4444 (Red)
- `bg-info-500` - #3b82f6 (Blue)
- `bg-neutral-400` - #a3a3a3 (Gray)

### Semantic Colors (Pattern 2 Full)
| Light Mode | Dark Mode |
|------------|-----------|
| `bg-success-100` | `bg-success-950` |
| `text-success-700` | `text-success-400` |
| Same pattern for warning, error, info |

---

## 📋 Implementation Checklist

When adding a badge, verify:

- [ ] Using correct pattern for use case
- [ ] No black borders (use neutral-200/800)
- [ ] Dot badges have gray text
- [ ] Full color badges have light bg + dark text
- [ ] Tags have outline style
- [ ] Proper import statement
- [ ] Dark mode support included

---

## 🔗 References

**Full Documentation:** `/docs/BADGE_GUIDELINES.md`
**Component:** `/src/app/components/ui/badge.tsx`
**Examples:** `/src/app/components/UIKit.tsx`
**Templates:** `/templates/listing/TEMPLATE_mockData.ts`

---

**Version:** 1.0.0  
**Last Updated:** January 3, 2026
