# Form Template - Complete Design Specifications

**Version:** 2.8  
**Last Updated:** January 12, 2026  
**Source:** /src/app/components/hb/common/Form.tsx

**Changelog v2.8:**
- **Dropdown Item Rounding Fix:** Changed SelectItem from `rounded-none` to `rounded-md` (6px) for proper corner styling
- **Border Radius Consistency:** All items now have `rounded-md` with first/last maintaining additional top/bottom rounding
- **Visual Match:** Dropdown items now match the UI Kit design with subtle rounded corners on all items

**Previous Changes (v2.7):**
- **Dropdown Z-Index Fix:** Changed SelectContent z-index from `z-50` to `z-[100]` to appear above modals and other overlays
- **Base Select Component:** Updated `/src/app/components/ui/select.tsx` to use `z-[100]` for proper layering
- **Design Consistency:** All dropdown specifications now fully match UI Kit and design guidelines
- **Documentation Updated:** All references made generic for use across different projects

**Previous Changes (v2.6):**
- **Dropdown Shadow Fix:** Changed SelectContent shadow from `shadow-lg` to `shadow-md` for proper design guidelines compliance
- **FormSelectContent Updated:** Added explicit `shadow-md` to FormSelectContent wrapper to ensure consistent dropdown styling
- **Base Select Component:** Updated `/src/app/components/ui/select.tsx` to use `shadow-md` instead of `shadow-lg`
- **Design Guidelines Verified:** All dropdown styling now matches specifications in this document

## Overview
This document provides comprehensive specifications for all form components used in modals and pages throughout the application. Every detail—from colors and fonts to hover states and dropdown animations—is documented here to ensure consistent form experiences across all projects.

---

## Table of Contents

1. [Form Modal Structure](#form-modal-structure)
2. [Modal Overlay](#modal-overlay)
3. [Modal Container](#modal-container)
4. [Modal Header](#modal-header)
5. [Modal Body](#modal-body)
6. [Form Labels](#form-labels)
7. [Form Input Fields](#form-input-fields)
8. [Form Textarea](#form-textarea)
9. [Form Select/Dropdown](#form-selectdropdown)
10. [Form Grid Layout](#form-grid-layout)
11. [Form Footer](#form-footer)
12. [Form Field Container](#form-field-container)
13. [Form Card Layout](#form-card-layout)
14. [Form Section](#form-section)
15. [Color System](#color-system)
16. [Typography](#typography)
17. [Spacing](#spacing)
18. [States & Interactions](#states--interactions)
19. [Accessibility](#accessibility)
20. [Complete Example](#complete-example)

---

## Form Modal Structure

### Component Hierarchy
```
FormModal
├── Overlay (fixed backdrop)
└── Modal Container
    ├── Modal Header
    │   ├── Title & Description
    │   └── Close Button
    ├── Modal Body
    │   └── Form Content (children)
    └── Form Footer (optional)
```

---

## Modal Overlay

### Structure
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50">
  {/* Modal Container */}
</div>
```

### Specifications

**Position**:
- Position: `fixed inset-0` (covers entire viewport)
- Z-index: `z-50` (above page content)
- Display: `flex items-center justify-center`

**Background**:
- Color: `bg-black/50` (black with 50% opacity)
- **No blur effect** - keeps design clean and performant

**Scrolling**:
- Overflow: `overflow-y-auto` (allows scrolling for tall modals)
- Padding: `p-4` (16px on all sides for mobile spacing)

**Behavior**:
- Prevents body scroll when modal is open (see JavaScript section)
- Click on overlay typically closes modal (add onClick handler)

### JavaScript - Body Scroll Lock
```typescript
useEffect(() => {
  if (isOpen) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  } else {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
  return () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };
}, [isOpen]);
```

**Purpose**:
- Prevents background scrolling when modal is open
- Compensates for scrollbar width to prevent layout shift
- Cleanup on unmount

---

## Modal Container

### Structure
```tsx
<div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full my-8 max-w-2xl">
  {/* Header, Body, Footer */}
</div>
```

### Specifications

**Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-950`

**Border**:
- Light: `border border-neutral-200` (1px solid)
- Dark: `dark:border-neutral-800`
- Radius: `rounded-lg` (8px)

**Shadow**:
- `shadow-xl` (large drop shadow for elevation)

**Sizing**:
- Width: `w-full` (100% of available space)
- Max Width: `max-w-2xl` (672px) - configurable
- Margin: `my-8` (32px vertical spacing)

**Max Width Options**:
- Small: `max-w-md` (448px) - Simple forms, confirmations
- Medium: `max-w-lg` (512px) - Standard forms
- Large: `max-w-2xl` (672px) - **Default** - Complex forms
- Extra Large: `max-w-4xl` (896px) - Very complex forms
- Full: `max-w-6xl` (1152px) - Multi-section forms

**Responsive Behavior**:
- Mobile: Full width minus padding (`p-4`)
- Tablet+: Constrained by max-width

---

## Modal Header

### Structure
```tsx
<div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
  <div>
    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
      Add New Location
    </h3>
    <p className="text-xs text-neutral-500 mt-0.5">
      Fill in the details below
    </p>
  </div>
  <button
    onClick={onClose}
    className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
  >
    <X className="w-3.5 h-3.5" />
  </button>
</div>
```

### Container Specifications

**Layout**:
- Display: `flex items-center justify-between`
- Padding: `px-5 py-3` (20px horizontal / 12px vertical)

**Border**:
- Bottom Border:
  - Light: `border-b border-neutral-200`
  - Dark: `dark:border-neutral-800`

### Title Specifications

**Main Title** (`<h3>`):
- Font Size: `text-sm` (14px)
- Font Weight: `font-medium` (500)
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`

**Description** (`<p>`) - Optional:
- Font Size: `text-xs` (12px)
- Color:
  - Light: `text-neutral-500`
  - Dark: `text-neutral-500` (same in both modes)
- Margin: `mt-0.5` (2px above)

### Close Button Specifications

**Container**:
- Size: `w-7 h-7` (28px x 28px)
- Display: `flex items-center justify-center`
- Border Radius: `rounded-lg` (8px)

**Colors**:
- Default Text:
  - Light: `text-neutral-600`
  - Dark: `dark:text-neutral-400`
- Hover Background:
  - Light: `hover:bg-neutral-100`
  - Dark: `dark:hover:bg-neutral-900`

**Icon**:
- Component: `<X />` from lucide-react
- Size: `w-3.5 h-3.5` (14px x 14px)

**Animation**:
- Transition: `transition-colors` (smooth background change)

---

## Modal Body

### Structure
```tsx
<div className="p-5">
  {/* Form content goes here */}
</div>
```

### Specifications

**Padding**: 
- All sides: `p-5` (20px)

**Purpose**:
- Contains all form fields, grids, and sections
- Provides consistent spacing from modal edges

---

## Form Labels

### Structure
```tsx
<label 
  htmlFor="locationName"
  className="text-xs text-neutral-700 dark:text-neutral-300 block mb-1.5"
>
  Location Name <span className="text-red-500">*</span>
</label>
```

### Specifications

**Typography**:
- Font Size: `text-xs` (12px)
- Font Weight: Regular (400) - inherited
- Display: `block`

**Colors**:
- Light: `text-neutral-700`
- Dark: `dark:text-neutral-300`

**Spacing**:
- Margin Bottom: `mb-1.5` (6px) - space between label and input

**Required Indicator**:
- Character: `*` (asterisk)
- Color: `text-red-500` (red)
- Placement: After label text

**Accessibility**:
- Always use `htmlFor` attribute matching input's `id`
- Semantic `<label>` element for screen readers

### Example with Required Indicator
```tsx
<FormLabel htmlFor="email" required>
  Email Address
</FormLabel>
// Renders: Email Address *
```

---

## Form Input Fields

### Structure
```tsx
<input
  id="locationName"
  type="text"
  placeholder="Enter location name"
  className="flex h-10 w-full min-w-0 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1 text-sm text-neutral-900 dark:text-neutral-100 transition-[border-color,box-shadow] outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-primary-500 dark:focus:border-primary-600 focus:shadow-lg focus:shadow-primary-500/10 dark:focus:shadow-primary-600/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
/>
```

### Specifications

**Sizing**:
- Height: `h-10` (40px) - **Standardized across all inputs**
- Width: `w-full` (100% of container)
- Min Width: `min-w-0` (allows input to shrink in flex/grid)

**Layout**:
- Display: `flex`
- Padding: `px-3 py-1` (12px horizontal / 4px vertical)

**Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-900`

**Border**:
- Width: `border` (1px)
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`
- Radius: `rounded-lg` (8px)

**Typography**:
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-neutral-100`

**Placeholder**:
- Color:
  - Light: `placeholder:text-neutral-400`
  - Dark: `dark:placeholder:text-neutral-500`

**Transitions**:
- Properties: `transition-[border-color,box-shadow]`
- Duration: Default (~150ms)

**Outline**:
- `outline-none` (custom focus styles used instead)

### Focus State

**Border Color**:
- Light: `focus:border-primary-500`
- Dark: `dark:focus:border-primary-600`

**Shadow**:
- Light: `focus:shadow-lg focus:shadow-primary-500/10`
- Dark: `dark:focus:shadow-primary-600/20`
- Effect: Subtle glow around input

### Disabled State

```tsx
<input disabled />
```

**Styles**:
- `disabled:pointer-events-none` (no interaction)
- `disabled:cursor-not-allowed` (visual indicator)
- `disabled:opacity-50` (50% opacity)

### Invalid/Error State

```tsx
<input aria-invalid="true" />
```

**Styles**:
- Border:
  - Light: `aria-invalid:border-error-500`
  - Dark: `dark:aria-invalid:border-error-600`
- Focus Shadow: `aria-invalid:focus:shadow-error-500/10`

### Input Types

**Text Input**:
```tsx
<input type="text" />
```

**Email Input**:
```tsx
<input type="email" />
```

**Number Input**:
```tsx
<input type="number" />
```

**Password Input**:
```tsx
<input type="password" />
```

**Date Input**:
```tsx
<input type="date" />
```

**With FormInput Component (Auto Calendar Icon)**:
```tsx
<FormInput
  id="joinDate"
  type="date"
  value={formData.joinDate}
  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
  required
/>
```

The FormInput component automatically detects `type="date"` and adds a calendar icon on the right side.

#### Date Input Implementation (Internal)
```tsx
{type === 'date' && (
  <div className="relative">
    <Input 
      type="date"
      className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg pr-10
                 [&::-webkit-calendar-picker-indicator]:opacity-0 
                 [&::-webkit-calendar-picker-indicator]:absolute 
                 [&::-webkit-calendar-picker-indicator]:right-0 
                 [&::-webkit-calendar-picker-indicator]:w-10 
                 [&::-webkit-calendar-picker-indicator]:h-10 
                 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      {...props} 
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <Calendar className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
    </div>
  </div>
)}
```

#### Date Input Specifications

**Container**:
- Position: `relative` (for icon positioning)

**Input Element**:
- Height: `h-10` (40px)
- Padding Right: `pr-10` (40px - space for calendar icon)
- All other input styles apply

**Native Calendar Icon (Hidden)**:
- CSS Selectors: `[&::-webkit-calendar-picker-indicator]:`
  - `opacity-0` - Hides the native icon
  - `absolute` - Positions it absolutely
  - `right-0` - Aligns to right edge
  - `w-10 h-10` - Maintains clickable area (40px x 40px)
  - `cursor-pointer` - Shows pointer cursor
- **Purpose**: Hides native browser calendar icon while keeping it clickable
- **Result**: Only custom Calendar icon is visible, but native picker still opens on click

**Calendar Icon (Custom)**:
- Component: `<Calendar />` from lucide-react  
- Position: `absolute right-3 top-1/2 -translate-y-1/2`
- Pointer Events: `pointer-events-none` (clicks pass through to native picker)
- Size: `w-4 h-4` (16px x 16px)
- Color:
  - Light: `text-neutral-400`
  - Dark: `dark:text-neutral-600`
- Placement: Right-aligned, vertically centered

**Click Behavior**:
- User clicks anywhere on input → Native date picker opens
- User clicks on calendar icon → Click passes through → Native picker opens
- **No duplicate icons shown** - Native icon hidden, custom icon visible

**Native Date Picker**:
- Browser native date picker opens on click
- Respects browser/OS date format preferences
- Mobile optimized (system date picker on iOS/Android)

**Time Input**:
```tsx
<input type="time" />
```

### File Input

```tsx
<input type="file" />
```

**Additional Styles**:
- File button: `file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-900 dark:file:text-neutral-100`

---

## Form Textarea

### Structure
```tsx
<textarea
  id="notes"
  placeholder="Enter notes..."
  className="min-h-[80px] w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 resize-none focus-visible:ring-1 focus-visible:ring-primary-500 transition-[border-color,box-shadow] outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
></textarea>
```

### Specifications

**Sizing**:
- Min Height: `min-h-[80px]` (80px minimum)
- Width: `w-full` (100% of container)
- Resize: `resize-none` (prevents user resizing)

**Padding**:
- Horizontal: `px-3` (12px)
- Vertical: `py-2` (8px)

**Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-900`

**Border**:
- Width: `border` (1px)
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`
- Radius: `rounded-lg` (8px)

**Typography**:
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-neutral-100`

**Placeholder**:
- Color:
  - Light: `placeholder:text-neutral-400`
  - Dark: `dark:placeholder:text-neutral-500`

**Focus State**:
- Ring: `focus-visible:ring-1 focus-visible:ring-primary-500`
- Creates 1px ring around textarea

**Transitions**:
- Properties: `transition-[border-color,box-shadow]`

**Outline**:
- `outline-none` (custom focus styles used)

### Auto-Resize Textarea (Optional)

For dynamic height based on content:

```typescript
const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
  e.currentTarget.style.height = 'auto';
  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
};
```

---

## Form Select/Dropdown

### Native HTML Select (FormSelect) - RECOMMENDED

The FormSelect component uses a native HTML `<select>` element with custom styling and a ChevronDown icon positioned on the right.

#### Structure
```tsx
<FormSelect
  id="department"
  value={formData.department}
  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
  required
>
  <option value="">Select department</option>
  <option value="Engineering">Engineering</option>
  <option value="Design">Design</option>
  <option value="Marketing">Marketing</option>
</FormSelect>
```

#### Complete Implementation (Internal)
```tsx
<div className="relative">
  <select
    className="h-10 w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-900 
               border border-neutral-200 dark:border-neutral-800 rounded-lg 
               text-sm text-neutral-900 dark:text-white appearance-none
               focus:outline-none focus:border-primary-500 dark:focus:border-primary-600 
               focus:shadow-lg focus:shadow-primary-500/10 dark:focus:shadow-primary-600/20
               transition-[border-color,box-shadow]
               disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </select>
  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
    <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
  </div>
</div>
```

#### Specifications

**Container**:
- Position: `relative` (for icon positioning)

**Select Element**:
- Height: `h-10` (40px) - **Matches input height**
- Width: `w-full` (100% of container)
- Padding: `px-3 py-2` (12px horizontal / 8px vertical)
- Padding Right: `pr-10` (40px - space for chevron icon)
- Appearance: `appearance-none` (removes native dropdown arrow)

**Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-900`

**Border**:
- Width: `border` (1px)
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`
- Radius: `rounded-lg` (8px)

**Typography**:
- Font Size: `text-sm` (14px)
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`

**Focus State**:
- Outline: `focus:outline-none` (custom focus styles)
- Border Color:
  - Light: `focus:border-primary-500`
  - Dark: `dark:focus:border-primary-600`
- Shadow:
  - Light: `focus:shadow-lg focus:shadow-primary-500/10`
  - Dark: `dark:focus:shadow-primary-600/20`

**Disabled State**:
- Opacity: `disabled:opacity-50`
- Cursor: `disabled:cursor-not-allowed`

**Chevron Icon**:
- Component: `<ChevronDown />` from lucide-react
- Position: `absolute right-3 top-1/2 -translate-y-1/2`
- Pointer Events: `pointer-events-none` (allows clicking through to select)
- Size: `w-4 h-4` (16px x 16px)
- Color:
  - Light: `text-neutral-400`
  - Dark: `dark:text-neutral-600`

**Why Use Native Select?**
- Better accessibility out of the box
- Native mobile UX (iOS/Android system pickers)
- Simpler implementation
- Better performance
- No additional JavaScript required

---

### Custom Select Components (Advanced)

For advanced use cases requiring custom styling or behavior, use the Shadcn Select components:

#### Components Structure

Select consists of three main components:
1. **SelectTrigger** - The button that opens dropdown
2. **SelectContent** - The dropdown container
3. **SelectItem** - Individual options

### SelectTrigger (Dropdown Button)

#### Structure
```tsx
<SelectTrigger className="h-10 w-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg">
  <SelectValue placeholder="Select option" />
</SelectTrigger>
```

#### Specifications

**Sizing**:
- Height: `h-10` (40px) - **Matches input height**
- Width: `w-full` (100% of container)

**Layout**:
- Display: `flex items-center justify-between`
- Gap: `gap-2` (8px between value and icon)
- Padding: `px-3 py-2` (12px horizontal / 8px vertical)

**Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-900`

**Border**:
- Width: `border` (1px)
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`
- Radius: `rounded-lg` (8px)

**Typography**:
- Font Size: `text-sm` (14px)
- Color:
  - Selected: 
    - Light: `text-neutral-900`
    - Dark: `dark:text-neutral-100`
  - Placeholder:
    - Light: `data-[placeholder]:text-neutral-400`
    - Dark: `dark:data-[placeholder]:text-neutral-500`

**Icon** (ChevronDown):
- Size: `size-4` (16px x 16px)
- Opacity: `opacity-50`
- Color: Inherits from trigger
- Auto-rotates when open

**Transitions**:
- Properties: `transition-[border-color,box-shadow]`

**Outline**:
- `outline-none` (custom focus styles)

#### Focus State

**Border Color**:
- Light: `focus-visible:border-primary-500`
- Dark: `dark:focus-visible:border-primary-600`

**Shadow**:
- Light: `focus-visible:shadow-lg focus-visible:shadow-primary-500/10`
- Dark: `dark:focus-visible:shadow-primary-600/20`

#### Disabled State

```tsx
<SelectTrigger disabled>
```

**Styles**:
- `disabled:cursor-not-allowed`
- `disabled:opacity-50`

#### Invalid State

```tsx
<SelectTrigger aria-invalid="true">
```

**Styles**:
- Border:
  - Light: `aria-invalid:border-error-500`
  - Dark: `dark:aria-invalid:border-error-600`
- Focus Shadow: `aria-invalid:focus-visible:shadow-error-500/10`

---

### SelectContent (Dropdown Panel)

#### Structure
```tsx
<SelectContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-lg p-0">
  <SelectItem value="option1">Option 1</SelectItem>
  <SelectItem value="option2">Option 2</SelectItem>
  <SelectItem value="option3">Option 3</SelectItem>
</SelectContent>
```

#### Specifications

**Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-950`

**Border**:
- Width: `border` (1px)
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`
- Radius: `rounded-lg` (8px)

**Padding**:
- Container: `p-0` (no outer padding)
- Viewport: `p-1` (4px padding around items)

**Shadow**:
- `shadow-md` (medium drop shadow)

**Sizing**:
- Min Width: `min-w-[8rem]` (128px minimum)
- Max Height: Limited by viewport (scrollable)
- Width: Matches trigger width (auto)

**Z-index**:
- `z-[100]` (appears above modals)

**Scroll**:
- Overflow X: `overflow-x-hidden`
- Overflow Y: `overflow-y-auto`

#### Animation

**Open Animation**:
- `data-[state=open]:animate-in`
- `data-[state=open]:fade-in-0`
- `data-[state=open]:zoom-in-95`
- Slide from trigger direction

**Close Animation**:
- `data-[state=closed]:animate-out`
- `data-[state=closed]:fade-out-0`
- `data-[state=closed]:zoom-out-95`

**Position Offset**:
- Bottom: `data-[side=bottom]:translate-y-1` (4px below trigger)
- Top: `data-[side=top]:-translate-y-1` (4px above trigger)
- Left: `data-[side=left]:-translate-x-1`
- Right: `data-[side=right]:translate-x-1`

---

### SelectItem (Dropdown Option)

#### Structure
```tsx
<SelectItem 
  value="lagos"
  className="rounded-md py-2.5 pl-4 pr-8 cursor-pointer focus:bg-primary-50 dark:focus:bg-primary-950/50 focus:text-primary-900 dark:focus:text-primary-100 text-neutral-700 dark:text-neutral-300 first:rounded-t-lg last:rounded-b-lg"
>
  Lagos, Nigeria
</SelectItem>
```

#### Specifications

**Layout**:
- Display: `flex items-center`
- Gap: `gap-2` (8px between content and checkmark)
- Position: `relative` (for checkmark positioning)

**Padding**:
- Vertical: `py-2.5` (10px)
- Left: `pl-4` (16px)
- Right: `pr-8` (32px - space for checkmark)

**Border Radius**:
- Default: `rounded-md` (6px)
- First Item: `first:rounded-t-lg` (8px top corners)
- Last Item: `last:rounded-b-lg` (8px bottom corners)

**Typography**:
- Font Size: `text-sm` (14px)
- Font Weight: Regular (400)

**Colors - Default State**:
- Text:
  - Light: `text-neutral-700`
  - Dark: `dark:text-neutral-300`

**Colors - Focus/Hover State**:
- Background:
  - Light: `focus:bg-primary-50`
  - Dark: `dark:focus:bg-primary-950/50`
- Text:
  - Light: `focus:text-primary-900`
  - Dark: `dark:focus:text-primary-100`

**Cursor**:
- `cursor-pointer` (indicates clickability)

**Selection Behavior**:
- `select-none` (prevents text selection)

#### Checkmark Indicator

**Position**:
- `absolute right-2` (8px from right edge)
- Vertical: Centered via flex

**Icon**:
- Component: `<Check />` from lucide-react
- Size: `size-4` (16px x 16px)
- Visibility: Only shown when item is selected

**Container**:
```tsx
<span className="absolute right-2 flex size-3.5 items-center justify-center">
  <Check className="size-4" />
</span>
```

#### Disabled Item

```tsx
<SelectItem value="disabled" disabled>
```

**Styles**:
- `data-[disabled]:pointer-events-none`
- `data-[disabled]:opacity-50`

---

### Complete Select Example

```tsx
<FormField>
  <FormLabel htmlFor="location" required>
    Location
  </FormLabel>
  <Select value={location} onValueChange={setLocation}>
    <FormSelectTrigger>
      <SelectValue placeholder="Select location" />
    </FormSelectTrigger>
    <FormSelectContent>
      <FormSelectItem value="lagos">Lagos, Nigeria</FormSelectItem>
      <FormSelectItem value="abuja">Abuja, Nigeria</FormSelectItem>
      <FormSelectItem value="portharcourt">Port Harcourt, Nigeria</FormSelectItem>
    </FormSelectContent>
  </Select>
</FormField>
```

---

## Form Grid Layout

### Structure
```tsx
<div className="grid gap-3.5 grid-cols-1 md:grid-cols-2">
  <FormField>{/* Field 1 */}</FormField>
  <FormField>{/* Field 2 */}</FormField>
</div>
```

### Specifications

**Display**: 
- `grid`

**Gap**: 
- `gap-3.5` (14px between grid items)

**Grid Templates**:

#### Single Column
```tsx
<FormGrid cols={1}>
  {/* All fields stack vertically */}
</FormGrid>
```
- Classes: `grid-cols-1`
- Use for: Full-width fields, textareas

#### Two Columns
```tsx
<FormGrid cols={2}>
  {/* Fields in 2 columns on desktop */}
</FormGrid>
```
- Mobile: `grid-cols-1`
- Desktop: `md:grid-cols-2`
- Use for: Most forms (name/email, first/last name)

#### Three Columns
```tsx
<FormGrid cols={3}>
  {/* Fields in 3 columns on desktop */}
</FormGrid>
```
- Mobile: `grid-cols-1`
- Desktop: `md:grid-cols-3`
- Use for: Short fields (day/month/year, phone parts)

#### Four Columns
```tsx
<FormGrid cols={4}>
  {/* Fields in 4 columns on desktop */}
</FormGrid>
```
- Mobile: `grid-cols-1`
- Desktop: `md:grid-cols-4`
- Use for: Very short fields (time fields, numeric codes)

### Responsive Breakpoints

- **Mobile** (< 768px): Single column
- **Tablet+** (≥ 768px): Specified column count

### Full-Width Field in Grid

To make a single field span all columns:

```tsx
<FormGrid cols={2}>
  <FormField>{/* Column 1 */}</FormField>
  <FormField>{/* Column 2 */}</FormField>
  <FormField className="md:col-span-2">
    {/* Full width field */}
  </FormField>
</FormGrid>
```

---

## Form Footer

### Structure
```tsx
<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
  <button type="button">Cancel</button>
  <button type="submit">Save</button>
</div>
```

### Specifications

**Layout**:
- Mobile: `flex flex-col-reverse` (stacked, primary button on top)
- Desktop: `sm:flex-row sm:justify-end` (horizontal, right-aligned)

**Gap**:
- `gap-2` (8px between buttons)

**Spacing**:
- Padding Top: `pt-4` (16px)
- Margin Top: `mt-4` (16px)

**Border**:
- Top Border:
  - Light: `border-t border-neutral-200`
  - Dark: `dark:border-neutral-800`

**Purpose**:
- Visually separates form actions from content
- Provides consistent spacing

### Button Order

**Mobile** (stacked):
1. Primary button (top)
2. Secondary button (bottom)

**Desktop** (horizontal):
1. Secondary button (left)
2. Primary button (right)

**Reasoning**:
- `flex-col-reverse` reverses visual order on mobile
- Primary action is always most accessible (top on mobile, right on desktop)

---

## Form Field Container

### Structure
```tsx
<div className="space-y-0">
  <FormLabel htmlFor="name">Name</FormLabel>
  <FormInput id="name" />
</div>
```

### Specifications

**Spacing**:
- `space-y-0` (no additional spacing, label has `mb-1.5`)

**Purpose**:
- Groups label with its input
- Provides consistent structure
- Can add error messages below input

### With Error Message

```tsx
<FormField>
  <FormLabel htmlFor="email" required>Email</FormLabel>
  <FormInput id="email" type="email" aria-invalid="true" />
  <p className="text-xs text-error-500 mt-1">Please enter a valid email</p>
</FormField>
```

**Error Text**:
- Font Size: `text-xs` (12px)
- Color: `text-error-500`
- Margin: `mt-1` (4px above)

---

## Form Card Layout

### Structure
```tsx
<div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
      Personal Information
    </h3>
    <p className="text-sm text-neutral-500 mt-1">
      Update your personal details
    </p>
  </div>
  {/* Form content */}
</div>
```

### Specifications

**Background**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-950`

**Border**:
- Light: `border border-neutral-200`
- Dark: `dark:border-neutral-800`
- Radius: `rounded-lg` (8px)

**Padding**:
- All sides: `p-6` (24px)

**Header** (optional):

**Title** (`<h3>`):
- Font Size: `text-lg` (18px)
- Font Weight: `font-semibold` (600)
- Color:
  - Light: `text-neutral-900`
  - Dark: `dark:text-white`

**Description** (`<p>`):
- Font Size: `text-sm` (14px)
- Color: `text-neutral-500` (same in both modes)
- Margin: `mt-1` (4px)

**Header Container**:
- Margin Bottom: `mb-6` (24px) - space before form content

### Use Cases

- Multi-section forms (each section in a card)
- Page-based forms (not in modal)
- Forms with visual grouping needs

---

## Form Section

### Structure
```tsx
<div className="space-y-4">
  <FormField>{/* Field 1 */}</FormField>
  <FormField>{/* Field 2 */}</FormField>
  <FormField>{/* Field 3 */}</FormField>
</div>
```

### Specifications

**Spacing**:
- `space-y-4` (16px vertical spacing between children)

**Purpose**:
- Groups related form fields
- Provides consistent vertical rhythm
- Can be used within grids or standalone

### Combined with Grid

```tsx
<FormSection>
  <FormGrid cols={2}>
    <FormField>{/* Field 1 */}</FormField>
    <FormField>{/* Field 2 */}</FormField>
  </FormGrid>
  <FormField>{/* Full-width field */}</FormField>
</FormSection>
```

---

## Color System

### Background Colors

**Modal Overlay**:
- All modes: `bg-black/50`

**Modal Container**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-950`

**Input Fields**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-900`

**Select Content**:
- Light: `bg-white`
- Dark: `dark:bg-neutral-950`

**Header Background** (hover states):
- Light: `hover:bg-neutral-100`
- Dark: `dark:hover:bg-neutral-900`

**Select Item Focus**:
- Light: `focus:bg-primary-50`
- Dark: `dark:focus:bg-primary-950/50`

---

### Border Colors

**Modal Container**:
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`

**Modal Header Bottom**:
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`

**Form Footer Top**:
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`

**Input/Select Default**:
- Light: `border-neutral-200`
- Dark: `dark:border-neutral-800`

**Input/Select Focus**:
- Light: `focus:border-primary-500`
- Dark: `dark:focus:border-primary-600`

**Input/Select Invalid**:
- Light: `aria-invalid:border-error-500`
- Dark: `dark:aria-invalid:border-error-600`

---

### Text Colors

**Modal Title**:
- Light: `text-neutral-900`
- Dark: `dark:text-white`

**Modal Description**:
- Light/Dark: `text-neutral-500`

**Close Button**:
- Light: `text-neutral-600`
- Dark: `dark:text-neutral-400`

**Form Labels**:
- Light: `text-neutral-700`
- Dark: `dark:text-neutral-300`

**Required Indicator**:
- All modes: `text-red-500`

**Input Text**:
- Light: `text-neutral-900`
- Dark: `dark:text-neutral-100`

**Input Placeholder**:
- Light: `placeholder:text-neutral-400`
- Dark: `dark:placeholder:text-neutral-500`

**Select Item Default**:
- Light: `text-neutral-700`
- Dark: `dark:text-neutral-300`

**Select Item Focus**:
- Light: `focus:text-primary-900`
- Dark: `dark:focus:text-primary-100`

**Error Text**:
- All modes: `text-error-500`

---

### Shadow Colors

**Modal Container**:
- `shadow-xl` (neutral shadow)

**Select Content**:
- `shadow-md` (neutral shadow)

**Input Focus**:
- Light: `focus:shadow-lg focus:shadow-primary-500/10`
- Dark: `dark:focus:shadow-primary-600/20`

**Select Focus**:
- Light: `focus-visible:shadow-lg focus-visible:shadow-primary-500/10`
- Dark: `dark:focus-visible:shadow-primary-600/20`

**Input Invalid Focus**:
- Light: `aria-invalid:focus:shadow-error-500/10`

---

## Typography

### Font Sizes

| Element | Class | Size |
|---------|-------|------|
| Modal Title | `text-sm` | 14px |
| Modal Description | `text-xs` | 12px |
| Form Labels | `text-xs` | 12px |
| Input Text | `text-sm` | 14px |
| Select Text | `text-sm` | 14px |
| Placeholder | `text-sm` | 14px |
| Error Text | `text-xs` | 12px |
| Card Title | `text-lg` | 18px |
| Card Description | `text-sm` | 14px |

### Font Weights

| Element | Class | Weight |
|---------|-------|--------|
| Modal Title | `font-medium` | 500 |
| Modal Description | Regular | 400 |
| Form Labels | Regular | 400 |
| Input Text | Regular | 400 |
| Card Title | `font-semibold` | 600 |
| Card Description | Regular | 400 |

### Text Transform

**Form Labels**:
- No transform (sentence case)

**Select Items**:
- No transform (as provided)

---

## Spacing

### Modal Spacing

| Element | Property | Class | Value |
|---------|----------|-------|-------|
| Overlay | Padding | `p-4` | 16px |
| Container | Vertical Margin | `my-8` | 32px top/bottom |
| Header | Horizontal Padding | `px-5` | 20px |
| Header | Vertical Padding | `py-3` | 12px |
| Body | All Padding | `p-5` | 20px |
| Footer | Padding Top | `pt-4` | 16px |
| Footer | Margin Top | `mt-4` | 16px |

### Form Element Spacing

| Element | Property | Class | Value |
|---------|----------|-------|-------|
| Label | Margin Bottom | `mb-1.5` | 6px |
| Grid | Gap | `gap-3.5` | 14px |
| Section | Vertical Spacing | `space-y-4` | 16px |
| Footer | Button Gap | `gap-2` | 8px |
| Card | Padding | `p-6` | 24px |
| Card Header | Margin Bottom | `mb-6` | 24px |
| Card Description | Margin Top | `mt-1` | 4px |
| Error Message | Margin Top | `mt-1` | 4px |

### Input Spacing

| Element | Property | Class | Value |
|---------|----------|-------|-------|
| Input | Height | `h-10` | 40px |
| Input | Horizontal Padding | `px-3` | 12px |
| Input | Vertical Padding | `py-1` | 4px |
| Textarea | Min Height | `min-h-[80px]` | 80px |
| Textarea | Horizontal Padding | `px-3` | 12px |
| Textarea | Vertical Padding | `py-2` | 8px |
| Select Trigger | Height | `h-10` | 40px |
| Select Trigger | Horizontal Padding | `px-3` | 12px |
| Select Trigger | Vertical Padding | `py-2` | 8px |
| Select Item | Vertical Padding | `py-2.5` | 10px |
| Select Item | Left Padding | `pl-4` | 16px |
| Select Item | Right Padding | `pr-8` | 32px |

### Border Radius

| Element | Class | Value |
|---------|-------|-------|
| Modal Container | `rounded-lg` | 8px |
| Close Button | `rounded-lg` | 8px |
| Input | `rounded-lg` | 8px |
| Textarea | `rounded-lg` | 8px |
| Select Trigger | `rounded-lg` | 8px |
| Select Content | `rounded-lg` | 8px |
| Select Item First | `first:rounded-t-lg` | 8px (top) |
| Select Item Last | `last:rounded-b-lg` | 8px (bottom) |
| Form Card | `rounded-lg` | 8px |

---

## States & Interactions

### Input States

#### Default State
- Border: Neutral color
- Background: Light color
- Text: Dark/readable
- Cursor: Text cursor

#### Hover State
- No visual change (focus is primary interaction)

#### Focus State
- Border: Primary color
- Shadow: Primary glow
- Outline: None (custom styles)
- Transition: Smooth border/shadow change

#### Disabled State
- Opacity: 50%
- Cursor: not-allowed
- No pointer events
- Visual: Grayed out

#### Invalid/Error State
- Border: Error color (red)
- Focus Shadow: Error glow
- Error message below input

#### Filled State
- Text appears in input
- Maintains styles

---

### Select States

#### Trigger States

**Closed/Default**:
- Border: Neutral color
- Icon: ChevronDown pointing down
- Text: Value or placeholder

**Hover** (closed):
- No visual change

**Focus**:
- Border: Primary color
- Shadow: Primary glow
- Icon remains down

**Open**:
- Border: Primary color (maintains focus state)
- Icon: Auto-rotates to point up
- Content panel appears

**Disabled**:
- Opacity: 50%
- Cursor: not-allowed
- Cannot open

**Invalid**:
- Border: Error color
- Focus Shadow: Error glow

#### Content Panel States

**Opening**:
- Fade in (0 → 1 opacity)
- Zoom in (95% → 100% scale)
- Slide from trigger direction
- Duration: ~150ms

**Closing**:
- Fade out (1 → 0 opacity)
- Zoom out (100% → 95% scale)
- Duration: ~150ms

**Scrolling**:
- Scroll indicators appear at top/bottom when needed
- Smooth scroll behavior

#### Select Item States

**Default**:
- Background: Transparent
- Text: Neutral color
- No checkmark

**Hover/Focus**:
- Background: Primary light
- Text: Primary dark
- Transition: Smooth

**Selected**:
- Checkmark appears on right
- Text/background same as hover

**Disabled**:
- Opacity: 50%
- No pointer events
- Cannot select

---

### Button States (in Footer)

#### Secondary Button (Cancel)

**Default**:
```tsx
<button className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
  Cancel
</button>
```

**Hover**:
- Background changes to light neutral

#### Primary Button (Submit)

**Default**:
```tsx
<button className="px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
  Save
</button>
```

**Hover**:
- Background darkens slightly

**Disabled**:
```tsx
<button disabled className="opacity-50 cursor-not-allowed">
```

---

### Transitions

**Properties Animated**:
- `border-color` (inputs, selects)
- `box-shadow` (focus states)
- `background-color` (buttons, hover states)
- `opacity` (disabled states, dropdowns)
- `transform` (dropdown animations)

**Duration**:
- Default: ~150ms (Tailwind default)
- Smooth and performant

**Easing**:
- Default: ease-in-out (Tailwind default)
- Natural feeling

---

## Accessibility

### Keyboard Navigation

**Tab Order**:
1. Close button
2. First input/select
3. Subsequent form fields
4. Cancel button
5. Submit button

**Shortcuts**:
- `Esc` - Close modal
- `Enter` - Submit form (if in input)
- `Space` - Open select, toggle checkbox
- `↑↓` - Navigate select options
- `Enter` - Select option in dropdown
- `Tab` - Move to next field
- `Shift+Tab` - Move to previous field

### Screen Readers

**Form Labels**:
- Always use `<label>` with `htmlFor`
- Connects label to input semantically
- Screen reader announces label when input focused

**Required Fields**:
- Visually indicated with `*`
- Announced as "required" by screen readers
- Consider adding `aria-required="true"`

**Error Messages**:
- Use `aria-invalid="true"` on input
- Associate error with `aria-describedby`
```tsx
<input 
  id="email" 
  aria-invalid="true" 
  aria-describedby="email-error" 
/>
<p id="email-error">Please enter a valid email</p>
```

**Select Components**:
- Radix UI handles ARIA attributes automatically
- Proper roles and states

**Modal**:
- Focus trap (keeps focus within modal)
- Focus first field on open
- Return focus to trigger on close
- `role="dialog"` `aria-modal="true"` (if custom modal)

### Color Contrast

**WCAG AA Compliance**:
- Text colors meet minimum 4.5:1 contrast ratio
- Labels: `neutral-700` on `white` = ✓
- Input text: `neutral-900` on `white` = ✓
- Dark mode tested for contrast

**Focus Indicators**:
- Visible focus states (colored borders, shadows)
- Never rely solely on color (use shadows too)

### Error Handling

**Validation**:
- Real-time validation (on blur or submit)
- Clear error messages
- Preserve user input on error
- Focus first invalid field

**Error Message Best Practices**:
- Be specific ("Email is required" not "Error")
- Suggest correction ("Use format: name@example.com")
- Respectful tone

---

## Complete Example

### Full Form Implementation

```tsx
import { useState } from "react";
import { X } from "lucide-react";
import {
  FormModal,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelectTrigger,
  FormSelectContent,
  FormSelectItem,
  FormGrid,
  FormField,
  FormFooter,
  FormSection
} from "@/components/hb/common/Form";
import { Select, SelectValue } from "@/components/ui/select";

function AddLocationForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    email: "",
    type: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Add Location
      </button>

      <FormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Location"
        description="Fill in the details below to create a new location"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <FormSection>
            {/* Location Name - Full Width */}
            <FormField>
              <FormLabel htmlFor="name" required>
                Location Name
              </FormLabel>
              <FormInput
                id="name"
                type="text"
                placeholder="Enter location name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </FormField>

            {/* Address - Full Width */}
            <FormField>
              <FormLabel htmlFor="address" required>
                Street Address
              </FormLabel>
              <FormInput
                id="address"
                type="text"
                placeholder="Enter street address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </FormField>

            {/* City and State - 2 Columns */}
            <FormGrid cols={2}>
              <FormField>
                <FormLabel htmlFor="city" required>
                  City
                </FormLabel>
                <FormInput
                  id="city"
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="state" required>
                  State
                </FormLabel>
                <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                  <FormSelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </FormSelectTrigger>
                  <FormSelectContent>
                    <FormSelectItem value="lagos">Lagos</FormSelectItem>
                    <FormSelectItem value="abuja">Abuja</FormSelectItem>
                    <FormSelectItem value="rivers">Rivers</FormSelectItem>
                  </FormSelectContent>
                </Select>
              </FormField>
            </FormGrid>

            {/* Country and Zip - 2 Columns */}
            <FormGrid cols={2}>
              <FormField>
                <FormLabel htmlFor="country" required>
                  Country
                </FormLabel>
                <FormInput
                  id="country"
                  type="text"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="zipCode">
                  Postal Code
                </FormLabel>
                <FormInput
                  id="zipCode"
                  type="text"
                  placeholder="Enter postal code"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                />
              </FormField>
            </FormGrid>

            {/* Phone and Email - 2 Columns */}
            <FormGrid cols={2}>
              <FormField>
                <FormLabel htmlFor="phone">
                  Phone Number
                </FormLabel>
                <FormInput
                  id="phone"
                  type="tel"
                  placeholder="+234 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="email">
                  Email Address
                </FormLabel>
                <FormInput
                  id="email"
                  type="email"
                  placeholder="location@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </FormField>
            </FormGrid>

            {/* Location Type - Full Width */}
            <FormField>
              <FormLabel htmlFor="type" required>
                Location Type
              </FormLabel>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <FormSelectTrigger>
                  <SelectValue placeholder="Select location type" />
                </FormSelectTrigger>
                <FormSelectContent>
                  <FormSelectItem value="hotel">Hotel</FormSelectItem>
                  <FormSelectItem value="restaurant">Restaurant</FormSelectItem>
                  <FormSelectItem value="resort">Resort</FormSelectItem>
                  <FormSelectItem value="office">Office</FormSelectItem>
                </FormSelectContent>
              </Select>
            </FormField>

            {/* Notes - Full Width */}
            <FormField>
              <FormLabel htmlFor="notes">
                Additional Notes
              </FormLabel>
              <FormTextarea
                id="notes"
                placeholder="Enter any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </FormField>
          </FormSection>

          {/* Form Footer */}
          <FormFooter>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Save Location
            </button>
          </FormFooter>
        </form>
      </FormModal>
    </>
  );
}
```

---

## Component Import Guide

### From Form Components
```tsx
import {
  FormModal,           // Modal wrapper
  FormLabel,           // Field labels
  FormInput,           // Text inputs
  FormTextarea,        // Multi-line inputs
  FormSelectTrigger,   // Select button
  FormSelectContent,   // Select dropdown
  FormSelectItem,      // Select options
  FormGrid,            // Responsive grid
  FormField,           // Field container
  FormFooter,          // Action buttons area
  FormSection,         // Vertical spacing
  FormCard             // Card container (page forms)
} from "@/components/hb/common/Form";
```

### From UI Components
```tsx
import { Select, SelectValue } from "@/components/ui/select";
```

### Icons
```tsx
import { X } from "lucide-react";
```

---

## Notes

1. **Consistent Heights**: All inputs and selects use `h-10` (40px) for visual alignment
2. **Border Radius**: Consistently `rounded-lg` (8px) across all form elements
3. **Focus States**: Always use primary color with subtle shadow/glow
4. **No Blur on Overlay**: Design system uses solid `bg-black/50`, no backdrop-blur
5. **Responsive Grids**: Always stack to single column on mobile
6. **Required Indicators**: Red asterisk after label text
7. **Error States**: Use `aria-invalid` for styling and accessibility
8. **Z-Index Layers**: Overlay (50) < Select Content (100)
9. **Select Items**: First/last have rounded corners, middle items square
10. **Animations**: Smooth transitions (~150ms) for professional feel

---

**Last Updated**: January 12, 2026  
**Version**: 2.8  
**Related Components**: `/src/app/components/hb/common/Form.tsx` + `/src/app/components/ui/select.tsx`  
**Related Templates**: N/A (Foundation template)