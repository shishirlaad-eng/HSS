# Select Dropdown Design Guide

**Version:** 1.0  
**Last Updated:** January 12, 2026  
**Status:** Generic - Ready for any project

---

## Overview

This guide provides complete specifications for implementing consistent Select dropdown components across your application. All measurements, colors, and behaviors are documented to ensure pixel-perfect implementation.

---

## Component Structure

```
Select
├── SelectTrigger (Button that opens dropdown)
│   ├── SelectValue (Displays selected value or placeholder)
│   └── ChevronDown Icon (Rotates when open)
└── SelectContent (Dropdown panel)
    └── SelectItem(s) (Individual options)
        ├── ItemText (Option label)
        └── ItemIndicator (Checkmark when selected)
```

---

## SelectTrigger (Button)

### Visual Specifications

**Dimensions:**
- Height: `40px` (h-10)
- Width: `100%` of container
- Border Radius: `8px` (rounded-lg)
- Border Width: `1px`

**Spacing:**
- Horizontal Padding: `12px` (px-3)
- Vertical Padding: `8px` (py-2)
- Gap between value and icon: `8px` (gap-2)

**Colors:**

*Light Mode:*
- Background: `#FFFFFF` (white)
- Border: `#E5E5E5` (neutral-200)
- Text: `#171717` (neutral-900)
- Placeholder: `#A3A3A3` (neutral-400)

*Dark Mode:*
- Background: `#171717` (neutral-900)
- Border: `#262626` (neutral-800)
- Text: `#FAFAFA` (neutral-100)
- Placeholder: `#737373` (neutral-500)

### States

**Default:**
```tsx
<SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
  <SelectValue placeholder="Select option..." />
</SelectTrigger>
```

**Focus:**
- Border Color: Primary-500 (light) / Primary-600 (dark)
- Shadow: `0 0 0 3px primary-500/10` (light) / `primary-600/20` (dark)
- Outline: None (custom focus ring used)

**Hover:**
- No visual change (focus is primary interaction)

**Disabled:**
- Opacity: `50%`
- Cursor: `not-allowed`
- No interaction

**Open:**
- Maintains focus state
- Icon rotates 180° (auto-handled by Radix)
- Content panel appears below/above

### Icon

**ChevronDown:**
- Size: `16px x 16px` (size-4)
- Opacity: `50%`
- Position: Right side of trigger
- Rotation: Automatic when dropdown opens

---

## SelectContent (Dropdown Panel)

### Visual Specifications

**Dimensions:**
- Min Width: `128px` (min-w-[8rem])
- Width: Auto-matches trigger width
- Max Height: Viewport-dependent (scrollable)
- Border Radius: `8px` (rounded-lg)
- Border Width: `1px`

**Spacing:**
- Viewport Padding: `4px` (p-1) - space around all items
- Offset from trigger: `4px` (translate-y-1)

**Colors:**

*Light Mode:*
- Background: `#FFFFFF` (white)
- Border: `#E5E5E5` (neutral-200)
- Shadow: `shadow-md`

*Dark Mode:*
- Background: `#0A0A0A` (neutral-950)
- Border: `#262626` (neutral-800)
- Shadow: `shadow-md`

**Z-Index:**
- Value: `100` (z-[100])
- Purpose: Appears above modals and other overlays

**Scroll:**
- Overflow X: Hidden
- Overflow Y: Auto (scrollbar appears when needed)
- Scroll Indicators: Show at top/bottom when scrollable

### Animation

**Opening:**
- Fade In: `0 → 1` opacity
- Zoom In: `95% → 100%` scale
- Slide: From trigger direction (bottom: slide up 8px)
- Duration: `~150ms`
- Easing: `ease-in-out`

**Closing:**
- Fade Out: `1 → 0` opacity
- Zoom Out: `100% → 95%` scale
- Duration: `~150ms`
- Easing: `ease-in-out`

### Positioning

**Preferred Side:** Bottom (below trigger)

**Fallback:** Top (above trigger) if insufficient space

**Offset:**
- Bottom: `4px` below trigger
- Top: `4px` above trigger
- Left: `4px` offset
- Right: `4px` offset

---

## SelectItem (Options)

### Visual Specifications

**Dimensions:**
- Width: `100%` of content panel
- Height: Auto (based on padding + text)

**Spacing:**
- Vertical Padding: `10px` (py-2.5)
- Left Padding: `16px` (pl-4)
- Right Padding: `32px` (pr-8) - space for checkmark
- Gap: `8px` between text and icons

**Border Radius:**
- Default: `rounded-md` (6px) - all items have subtle rounded corners
- First Item: `first:rounded-t-lg` (8px top corners)
- Last Item: `last:rounded-b-lg` (8px bottom corners)

**Typography:**
- Font Size: `14px` (text-sm)
- Font Weight: `400` (Regular)
- Line Height: `1.5` (21px)

**Colors:**

*Default State (Light):*
- Background: Transparent
- Text: `#404040` (neutral-700)

*Default State (Dark):*
- Background: Transparent
- Text: `#D4D4D4` (neutral-300)

*Focus/Hover State (Light):*
- Background: `#EFF6FF` (primary-50)
- Text: `#1E3A8A` (primary-900)

*Focus/Hover State (Dark):*
- Background: `rgba(30, 58, 138, 0.5)` (primary-950/50)
- Text: `#DBEAFE` (primary-100)

### Checkmark Indicator

**Position:**
- Alignment: Absolute, right side
- Distance from edge: `8px` (right-2)
- Vertical: Centered

**Icon:**
- Component: Check icon (from lucide-react or similar)
- Size: `16px x 16px` (size-4)
- Color: `#2563EB` (primary-600)

**Visibility:**
- Only shown when item is selected
- Smooth fade-in transition

**Container:**
```tsx
<span className="absolute right-2 flex size-3.5 items-center justify-center">
  <Check className="size-4 text-primary-600" />
</span>
```

### States

**Default:**
```tsx
<SelectItem value="option1">Option 1</SelectItem>
```

**Focused/Hovered:**
- Background changes to primary light
- Text changes to primary dark
- Smooth transition (~150ms)

**Selected:**
- Same styles as focused
- Checkmark appears on right
- Item closes dropdown on click

**Disabled:**
```tsx
<SelectItem value="option" disabled>Disabled Option</SelectItem>
```
- Opacity: `50%`
- Pointer Events: None
- Cursor: `not-allowed`

---

## Complete Implementation Example

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';

function DepartmentSelect() {
  const [department, setDepartment] = useState("");

  return (
    <Select value={department} onValueChange={setDepartment}>
      <SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <SelectValue placeholder="Select department..." />
      </SelectTrigger>
      <SelectContent>
        {/* First item gets rounded top corners */}
        <SelectItem value="engineering">Engineering</SelectItem>
        {/* Middle items have no border radius */}
        <SelectItem value="design">Design</SelectItem>
        <SelectItem value="marketing">Marketing</SelectItem>
        <SelectItem value="sales">Sales</SelectItem>
        {/* Last item gets rounded bottom corners */}
        <SelectItem value="hr">Human Resources</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

---

## Tailwind Classes Reference

### SelectTrigger
```
h-10 w-full
bg-white dark:bg-neutral-900
border border-neutral-200 dark:border-neutral-800
rounded-lg
px-3 py-2
text-sm
focus-visible:border-primary-500 dark:focus-visible:border-primary-600
focus-visible:ring-[3px] focus-visible:ring-primary-500/10 dark:focus-visible:ring-primary-600/20
transition-[border-color,box-shadow]
disabled:opacity-50 disabled:cursor-not-allowed
```

### SelectContent
```
bg-white dark:bg-neutral-950
border border-neutral-200 dark:border-neutral-800
rounded-lg
shadow-md
z-[100]
min-w-[8rem]
overflow-x-hidden overflow-y-auto
p-1 (viewport padding)
data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
data-[side=bottom]:translate-y-1
```

### SelectItem
```
relative flex w-full
cursor-pointer
items-center gap-2
rounded-none first:rounded-t-lg last:rounded-b-lg
py-2.5 pl-4 pr-8
text-sm
text-neutral-700 dark:text-neutral-300
focus:bg-primary-50 dark:focus:bg-primary-950/50
focus:text-primary-900 dark:focus:text-primary-100
outline-hidden select-none
data-[disabled]:pointer-events-none data-[disabled]:opacity-50
```

---

## Accessibility

### Keyboard Navigation

**Trigger:**
- `Enter` / `Space`: Opens dropdown
- `Tab`: Moves focus to next element
- `Shift+Tab`: Moves focus to previous element

**Dropdown Open:**
- `↓` / `↑`: Navigate through options
- `Home`: Jump to first option
- `End`: Jump to last option
- `Enter`: Select focused option and close
- `Escape`: Close dropdown without selecting
- `Tab`: Close dropdown and move to next element

### Screen Reader Support

**ARIA Attributes (Auto-handled by Radix):**
- `role="combobox"` on trigger
- `aria-expanded` indicates open/closed state
- `aria-controls` links trigger to content
- `aria-activedescendant` indicates focused option
- `aria-selected` indicates selected option

**Announcements:**
- Opening: "Listbox expanded"
- Navigation: "Option [name], [x] of [y]"
- Selection: "Option [name] selected"
- Closing: "Listbox collapsed"

### Focus Management

- Focus trapped within dropdown when open
- Arrow keys navigate options
- Selected option receives initial focus when opened
- Focus returns to trigger when closed
- Visual focus indicator on all interactive elements

---

## Best Practices

### Do's ✓

1. **Use consistent heights** - All triggers should be `h-10` (40px)
2. **Provide clear placeholders** - "Select department..." not "Choose..."
3. **Order logically** - Alphabetical or by frequency of use
4. **Limit options** - More than 10? Consider search/filter
5. **Use descriptive labels** - Clear option names
6. **Handle empty states** - Provide feedback when no options
7. **Test keyboard navigation** - Ensure full keyboard accessibility
8. **Match trigger width** - Dropdown should align with trigger

### Don'ts ✗

1. **Don't use custom z-index** - Use `z-[100]` for consistency
2. **Don't remove animations** - They provide context and polish
3. **Don't override focus styles** - Accessibility critical
4. **Don't use tiny text** - Maintain `text-sm` (14px) minimum
5. **Don't nest dropdowns** - Complex interactions confuse users
6. **Don't disable without reason** - Always provide context
7. **Don't remove checkmarks** - Visual confirmation of selection
8. **Don't change border radius** - Keep `rounded-lg` (8px)

---

## Common Issues & Solutions

### Issue: Dropdown appears behind modal
**Solution:** Ensure `z-[100]` is set on SelectContent

### Issue: First/last items have square corners
**Solution:** Use `first:rounded-t-lg` and `last:rounded-b-lg` on SelectItem

### Issue: Dropdown doesn't match trigger width
**Solution:** Radix auto-handles this with `position="popper"`

### Issue: Focus state not visible
**Solution:** Ensure focus ring classes are present on trigger

### Issue: Text overflow in items
**Solution:** Items have `text-sm` and proper padding - check container width

### Issue: Checkmark not appearing
**Solution:** Verify `SelectPrimitive.ItemIndicator` is present in SelectItem

---

## Framework Integration

### React (Radix UI + Tailwind)

This guide is based on Radix UI primitives with Tailwind CSS styling. All specifications can be adapted to other frameworks:

- **Vue:** Use Headless UI or Radix Vue
- **Svelte:** Use Melt UI
- **Angular:** Adapt styles to Angular Material
- **Vanilla JS:** Use native `<select>` with custom styling

---

## Related Documentation

- **Form Components:** `/templates/form/form.md`
- **Color System:** `/templates/design-system/colors.md`
- **Typography:** `/templates/design-system/typography.md`
- **Accessibility:** `/templates/accessibility/WCAG.md`

---

## Version History

**v1.0 (January 12, 2026)**
- Initial comprehensive guide
- Z-index standardized to `z-[100]`
- Shadow standardized to `shadow-md`
- Complete Tailwind class reference
- Accessibility specifications
- Best practices and common issues

---

**Made generic for use across all projects.**