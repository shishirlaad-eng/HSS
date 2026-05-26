# 🎯 EXACT SPECIFICATIONS - Detail View Page

**Complete specification document for Lead/Employee/Product Detail pages with every measurement, color, and interaction**

---

## 📏 PAGE LAYOUT

### Page Container
```tsx
className="p-5 md:p-6 bg-white dark:bg-neutral-950 px-[8px] py-[8px]"
```
- **Padding:** 20px mobile (p-5), 24px desktop (md:p-6)
- **Inner Padding:** 8px horizontal, 8px vertical
- **Background:** white (dark: neutral-950)
- **Max Width:** 100% (max-w-[100%] mx-auto)

---

## 👤 PROFILE HEADER SECTION

### Header Container
```tsx
className="mb-6"
```
- **Margin Bottom:** 24px (mb-6)
- **Padding:** p-4 p-[0px] (effectively 0px due to override)

### Layout Structure
```tsx
className="flex items-start justify-between"
```
- **Display:** flex
- **Align:** items-start
- **Justify:** space-between
- **Left Side:** 70% width
- **Right Side:** auto width with actions

---

### Company Name & Contact Person

**Company Name:**
```tsx
style={{ fontSize: '18px', fontWeight: '600' }}
className="text-neutral-900 dark:text-white mb-2"
```
- **Font Size:** 18px (exact, not Tailwind class)
- **Font Weight:** 600 (semibold)
- **Color:** neutral-900 (dark: white)
- **Margin Bottom:** 8px (mb-2)

**Vertical Divider:**
```tsx
className="w-px h-5 bg-neutral-300 dark:bg-neutral-700"
```
- **Width:** 1px (w-px)
- **Height:** 20px (h-5)
- **Color:** neutral-300 (dark: neutral-700)

**Contact Person:**
```tsx
style={{ fontWeight: 'medium' }}
className="text-sm text-neutral-900 dark:text-white"
```
- **Font Size:** 14px (text-sm)
- **Font Weight:** medium (500)
- **Color:** neutral-900 (dark: white)

**Designation:**
```tsx
style={{ fontWeight: '400' }}
className="text-sm text-neutral-600 dark:text-neutral-400"
```
- **Font Size:** 14px (text-sm)
- **Font Weight:** 400 (normal)
- **Color:** neutral-600 (dark: neutral-400)

**Bullet Separator:**
```tsx
className="text-neutral-400 dark:text-neutral-600"
```
- **Character:** •
- **Color:** neutral-400 (dark: neutral-600)

---

### Contact Details Row

```tsx
className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 mb-2"
```

**Container:**
- **Display:** flex items-center
- **Gap:** 12px (gap-3)
- **Font Size:** 14px (text-sm)
- **Color:** neutral-600 (dark: neutral-400)
- **Margin Bottom:** 8px (mb-2)

**Icon Size:**
```tsx
className="w-3.5 h-3.5"
```
- **Size:** 14px × 14px (w-3.5 h-3.5)

**Icons Used:**
- MapPin - Location
- Phone - Phone number
- Mail - Email
- Linkedin - LinkedIn profile

**Link Hover:**
```tsx
className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
```
- **Hover Color:** primary-600 (dark: primary-400)
- **Transition:** colors only

---

### Tags Row

```tsx
className="flex flex-wrap gap-2"
```
- **Display:** flex flex-wrap
- **Gap:** 8px (gap-2)
- **Uses:** TagBadge component

---

## 🎯 RIGHT SIDE ACTIONS

### Probability Indicator

**Container:**
```tsx
style={{ width: '180px' }}
className="flex flex-col gap-1"
```
- **Width:** 180px (exact)
- **Display:** flex flex-col
- **Gap:** 4px (gap-1)

**Label Row:**
```tsx
className="flex items-center justify-between"
```
- **Label:** text-xs text-neutral-600
- **Value:** text-xs text-neutral-900, font-weight 600

**Progress Bar Container:**
```tsx
className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
```
- **Width:** 100%
- **Height:** 6px (h-1.5)
- **Background:** neutral-200 (dark: neutral-800)
- **Border Radius:** full (rounded-full)

**Progress Bar Fill:**
```tsx
className="h-full bg-error-500 dark:bg-error-500 rounded-full transition-all duration-300"
style={{ width: '85%' }}
```
- **Color:** error-500 (both modes)
- **Transition:** all, 300ms duration
- **Width:** Dynamic (percentage value)

---

### Divider

```tsx
className="w-px h-6 bg-neutral-200 dark:bg-neutral-800"
```
- **Width:** 1px (w-px)
- **Height:** 24px (h-6)
- **Color:** neutral-200 (dark: neutral-800)

---

### Priority Badge

```tsx
className="inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(priority)}"
```
- **Display:** inline-block
- **Padding:** 8px × 4px (px-2 py-1)
- **Border Radius:** 4px (rounded)
- **Font Size:** 12px (text-xs)
- **Font Weight:** medium (500)
- **Color:** Dynamic from getPriorityColor()

---

### Stage Dropdown Button

```tsx
className="h-9 px-3 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors gap-2"
```

**Dimensions:**
- **Height:** 36px (h-9)
- **Padding Horizontal:** 12px (px-3)
- **Gap:** 8px (gap-2)

**Style:**
- **Border:** neutral-300 (dark: neutral-700)
- **Border Radius:** 8px (rounded-lg)
- **Hover Background:** neutral-50 (dark: neutral-900)
- **Transition:** colors

**Text:**
```tsx
className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
```
- **Font Size:** 14px (text-sm)
- **Color:** neutral-700 (dark: neutral-300)
- **No Wrap:** whitespace-nowrap

**Icon:**
```tsx
<ChevronDown className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
```
- **Size:** 16px × 16px (w-4 h-4)

---

### Stage Dropdown Menu

```tsx
className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-10 overflow-hidden max-h-80 overflow-y-auto"
```

**Position:**
- **Position:** absolute right-0
- **Margin Top:** 8px (mt-2)
- **Width:** 256px (w-64)
- **Max Height:** 320px (max-h-80) with scroll

**Style:**
- **Background:** white (dark: neutral-950)
- **Border:** neutral-200 (dark: neutral-800)
- **Border Radius:** 8px (rounded-lg)
- **Shadow:** shadow-lg
- **Z-index:** 10

**Menu Item:**
```tsx
className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
```
- **Padding:** 16px × 10px (px-4 py-2.5)
- **Font Size:** 14px (text-sm)
- **Hover:** bg-neutral-50 (dark: bg-neutral-800)
- **Gap:** 8px (gap-2)

**Active Item:**
```tsx
className="bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
```

**Stage Color Indicator:**
```tsx
className="w-2 h-2 rounded-full flex-shrink-0"
style={{ backgroundColor: getStageHexColor(stage) }}
```
- **Size:** 8px × 8px (w-2 h-2)
- **Shape:** rounded-full
- **Color:** Dynamic from getStageHexColor()

---

### Action Buttons (Square Icons)

**Standard Button:**
```tsx
className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
```

**Dimensions:**
- **Size:** 36px × 36px (w-9 h-9)
- **Border:** neutral-300 (dark: neutral-700)
- **Border Radius:** 8px (rounded-lg)
- **Hover:** bg-neutral-50 (dark: bg-neutral-900)

**Icon Inside:**
```tsx
className="w-4 h-4 text-neutral-700 dark:text-neutral-300"
```
- **Size:** 16px × 16px (w-4 h-4)
- **Color:** neutral-700 (dark: neutral-300)

---

**Email Button (Special Hover):**
```tsx
className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-primary-50 hover:border-primary-300 dark:hover:bg-primary-950 dark:hover:border-primary-700 transition-colors"
```
- **Hover Background:** primary-50 (dark: primary-950)
- **Hover Border:** primary-300 (dark: primary-700)

**Icon Hover:**
```tsx
className="w-4 h-4 text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400"
```
- **Hover Color:** primary-600 (dark: primary-400)

---

**WhatsApp Button (Special Hover):**
```tsx
className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-success-50 hover:border-success-300 dark:hover:bg-success-950 dark:hover:border-success-700 transition-colors"
```
- **Hover Background:** success-50 (dark: success-950)
- **Hover Border:** success-300 (dark: success-700)

**Icon Hover:**
```tsx
className="hover:text-success-600 dark:hover:text-success-400"
```
- **Hover Color:** success-600 (dark: success-400)

---

**Back Button:**
```tsx
className="w-9 h-9 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
```
- Same as standard button
- Explicit background specified

---

### More Actions Dropdown

**Trigger Button:** Same as standard button (w-9 h-9)

**Menu Container:**
```tsx
className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-10 overflow-hidden"
```
- **Width:** 224px (w-56)
- **Position:** absolute right-0, mt-2
- **Shadow:** shadow-lg
- **Z-index:** 10

**Menu Item:**
```tsx
className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-3 text-neutral-700 dark:text-neutral-300"
```
- **Padding:** 16px × 10px (px-4 py-2.5)
- **Font Size:** 14px (text-sm)
- **Gap:** 12px (gap-3) - larger than stage dropdown!
- **Hover:** bg-neutral-50 (dark: bg-neutral-800)

**Delete Item (Special):**
```tsx
className="w-full px-4 py-2.5 text-left text-sm hover:bg-error-50 dark:hover:bg-error-950 transition-colors flex items-center gap-3 text-error-600 dark:text-error-400 border-t border-neutral-200 dark:border-neutral-800"
```
- **Hover:** bg-error-50 (dark: bg-error-950)
- **Color:** error-600 (dark: error-400)
- **Border Top:** Separator line above delete

---

## 📊 TWO-COLUMN LAYOUT

### Layout Container
```tsx
className="flex gap-6"
```
- **Display:** flex
- **Gap:** 24px (gap-6)

### Left Column (Tabs + Content)
```tsx
className="w-[70%]"
```
- **Width:** 70%
- **Border:** border border-neutral-200 dark:border-neutral-800
- **Border Radius:** rounded-lg
- **Overflow:** overflow-hidden

### Right Column (Dynamic Content)
```tsx
className="w-[30%] space-y-6"
```
- **Width:** 30%
- **Space Between Items:** 24px (space-y-6)

---

## 🔖 HORIZONTAL TABS

### Tab Container
```tsx
className="border-b border-neutral-200 dark:border-neutral-800"
```
- **Border Bottom:** 1px solid
- **Color:** neutral-200 (dark: neutral-800)

### Layout
```tsx
className="flex justify-between items-center"
```
- **Display:** flex
- **Justify:** space-between
- **Align:** items-center

### Individual Tab Button

**Inactive Tab:**
```tsx
className="px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
```

**Dimensions:**
- **Padding:** 16px × 12px (px-4 py-3)
- **Font Size:** 14px (text-sm)
- **White Space:** nowrap

**Style:**
- **Border Bottom:** 2px transparent
- **Color:** neutral-600 (dark: neutral-400)
- **Hover Color:** neutral-900 (dark: white)
- **Transition:** colors

---

**Active Tab:**
```tsx
className="px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold"
```

**Style:**
- **Border Bottom:** 2px primary-600 (dark: primary-400)
- **Color:** neutral-900 (dark: white)
- **Font Weight:** semibold (600)

---

### More Button (with Dropdown)

**Button:**
```tsx
className="px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 flex items-center gap-1"
```
- **Gap:** 4px (gap-1) between text and icon

**Active State:**
```tsx
className="border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold"
```

**Inactive State:**
```tsx
className="border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
```

**Icon:**
```tsx
<ChevronDown className="w-4 h-4" />
```

---

### More Tabs Dropdown

**Container:**
```tsx
className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-10 overflow-hidden"
```
- **Width:** 256px (w-64)
- **Position:** absolute right-0
- **Margin Top:** 8px (mt-2)

**Dropdown Item:**
```tsx
className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
```

**Active Item:**
```tsx
className="bg-primary-50 dark:bg-primary-950 text-neutral-900 dark:text-white font-semibold"
```

**Inactive Item:**
```tsx
className="text-neutral-700 dark:text-neutral-300"
```

---

## 🎨 MODALS & DRAWERS

### Delete Confirmation Modal

**Overlay:**
```tsx
className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
```
- **Position:** fixed inset-0
- **Background:** black 50% opacity (bg-black/50)
- **Display:** flex centered
- **Z-index:** 50
- **Padding:** 16px (p-4)

**Modal Container:**
```tsx
className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 max-w-md w-full"
```
- **Max Width:** 448px (max-w-md)
- **Width:** 100% (w-full)
- **Padding:** 24px (p-6)
- **Border Radius:** 8px (rounded-lg)

**Icon Container:**
```tsx
className="w-10 h-10 bg-error-100 dark:bg-error-950 rounded-full flex items-center justify-center flex-shrink-0"
```
- **Size:** 40px × 40px (w-10 h-10)
- **Background:** error-100 (dark: error-950)
- **Shape:** rounded-full

**Icon:**
```tsx
<AlertTriangle className="w-5 h-5 text-error-600 dark:text-error-400" />
```
- **Size:** 20px × 20px (w-5 h-5)
- **Color:** error-600 (dark: error-400)

**Title:**
```tsx
className="text-neutral-900 dark:text-white mb-1"
```
- **Font Size:** Default (14px base)
- **Color:** neutral-900 (dark: white)
- **Margin Bottom:** 4px (mb-1)

**Description:**
```tsx
className="text-sm text-neutral-600 dark:text-neutral-400"
```
- **Font Size:** 14px (text-sm)
- **Color:** neutral-600 (dark: neutral-400)

**Input Field:**
```tsx
className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white mb-4"
```
- **Padding:** 12px × 8px (px-3 py-2)
- **Font Size:** 14px (text-sm)
- **Border Radius:** 8px (rounded-lg)
- **Focus Ring:** 2px primary-500

**Cancel Button:**
```tsx
className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
```

**Delete Button:**
```tsx
className="flex-1 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
```
- **Background:** error-600
- **Hover:** error-700
- **Disabled:** 50% opacity, no pointer cursor

---

### Side Drawer (Edit/Email/Activity)

**Overlay:**
```tsx
className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end"
```
- **Position:** fixed inset-0
- **Background:** black 50% opacity
- **Justify:** flex-end (drawer from right)
- **Z-index:** 50

**Drawer Container:**
```tsx
className="bg-white dark:bg-neutral-950 w-full max-w-2xl h-full overflow-y-auto"
// OR
className="bg-white dark:bg-neutral-950 w-full max-w-lg h-full flex flex-col"
```

**Sizes:**
- **Large Drawer:** max-w-2xl (672px) - For Edit, Email
- **Medium Drawer:** max-w-lg (512px) - For Activities
- **Small Drawer:** max-w-md (448px) - For Attachments

**Layout:**
- **With scroll:** overflow-y-auto (whole drawer scrolls)
- **With flex:** flex flex-col (header/content/footer structure)

---

### Drawer Header

```tsx
className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-950 z-10"
// OR
className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-shrink-0"
```

**Dimensions:**
- **Padding:** 24px (p-6)
- **Border Bottom:** 1px solid

**Sticky Header (for overflow-y-auto):**
- **Position:** sticky top-0
- **Z-index:** 10
- **Background:** white/neutral-950 (prevents content showing through)

**Flex Header (for flex-col):**
- **Flex Shrink:** 0 (doesn't shrink)

**Title:**
```tsx
style={{ fontSize: '18px', fontWeight: '600' }}
className="text-neutral-900 dark:text-white"
```
- **Font Size:** 18px (exact)
- **Font Weight:** 600 (semibold)

**Close Button:**
```tsx
className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
```
- **Size:** 32px × 32px (w-8 h-8)
- **Border Radius:** 8px (rounded-lg)
- **Hover:** bg-neutral-100 (dark: bg-neutral-900)

**Close Icon:**
```tsx
<X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
```
- **Size:** 20px × 20px (w-5 h-5)

---

### Drawer Content Area

**With Flex Layout:**
```tsx
className="flex-1 overflow-y-auto"
```
- **Flex:** 1 (takes remaining space)
- **Overflow:** scroll if needed

**Inner Padding:**
```tsx
className="p-6"
```
- **Padding:** 24px (p-6) all sides

**Form Spacing:**
```tsx
className="space-y-6"
```
- **Space Between Fields:** 24px (space-y-6)

---

### Drawer Footer

**With Flex Layout:**
```tsx
className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0"
```
- **Padding:** 24px (p-6)
- **Border Top:** 1px solid
- **Flex Shrink:** 0 (always visible, doesn't shrink)

**Button Container:**
```tsx
className="flex gap-3 justify-center"
// OR
className="flex items-center justify-between gap-4"
```
- **Gap:** 12px or 16px depending on layout
- **Justify:** center or space-between

---

### Form Fields in Drawers

**Label:**
```tsx
style={{ fontSize: '14px', fontWeight: '500' }}
className="block text-neutral-900 dark:text-white mb-2"
```
- **Font Size:** 14px (exact)
- **Font Weight:** 500 (medium)
- **Margin Bottom:** 8px (mb-2)
- **Display:** block

**Required Indicator:**
```tsx
<span className="text-error-600">*</span>
```

**Input/Select:**
```tsx
style={{ fontSize: '14px' }}
className="w-full px-3 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
```

**Dimensions:**
- **Width:** 100% (w-full)
- **Padding:** 12px × 10px (px-3 py-2.5)
- **Font Size:** 14px (exact)

**Style:**
- **Background:** white (dark: neutral-900)
- **Border:** neutral-300 (dark: neutral-700)
- **Border Radius:** 8px (rounded-lg)
- **Text:** neutral-900 (dark: white)
- **Placeholder:** neutral-400 (dark: neutral-600)

**Focus:**
- **Outline:** none
- **Ring:** 2px primary-500
- **Border:** transparent

**Textarea:**
```tsx
rows={6}
// OR rows={8} OR rows={10}
className="w-full px-3 py-2.5 ... resize-none"
```
- **Resize:** none (resize-none)
- **Rows:** 6-10 depending on use case

---

### Grid Layouts in Forms

**Two Columns:**
```tsx
className="grid grid-cols-2 gap-4"
```
- **Columns:** 2
- **Gap:** 16px (gap-4)

---

### File Upload Area

```tsx
className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 text-center hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer"
```

**Style:**
- **Border:** 2px dashed
- **Border Color:** neutral-300 (dark: neutral-700)
- **Hover Border:** primary-400 (dark: primary-600)
- **Padding:** 32px (p-8)
- **Border Radius:** 8px (rounded-lg)
- **Transition:** colors
- **Cursor:** pointer

**Icon Container:**
```tsx
className="w-8 h-8 text-neutral-400 dark:text-neutral-600"
// OR for larger
className="w-10 h-10 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center"
```

---

### Rich Text Editor Toolbar

**Toolbar Container:**
```tsx
className="border-b border-neutral-300 dark:border-neutral-700 px-3 py-2 flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800"
```
- **Padding:** 12px × 8px (px-3 py-2)
- **Gap:** 16px (gap-4)
- **Background:** neutral-50 (dark: neutral-800)
- **Border Bottom:** 1px solid

**Toolbar Button:**
```tsx
className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
```
- **Size:** 28px × 28px (w-7 h-7)
- **Border Radius:** 4px (rounded)
- **Hover:** bg-neutral-100 (dark: bg-neutral-800)

---

## 📧 GMAIL-STYLE COMPOSE WINDOW

### Window Container (Minimized)
```tsx
style={{ width: '240px', height: '40px' }}
className="fixed bottom-0 right-6 z-50 shadow-2xl rounded-t-lg overflow-hidden transition-all duration-200"
```
- **Width:** 240px
- **Height:** 40px
- **Position:** fixed bottom-0 right-6
- **Z-index:** 50
- **Border Radius:** top only (rounded-t-lg)
- **Shadow:** shadow-2xl
- **Transition:** all 200ms

### Window Container (Maximized)
```tsx
style={{ width: '540px', height: '600px' }}
```
- **Width:** 540px
- **Height:** 600px

### Compose Header
```tsx
className="bg-neutral-900 dark:bg-neutral-950 px-4 py-2.5 flex items-center justify-between"
```
- **Background:** neutral-900 (dark: neutral-950)
- **Padding:** 16px × 10px (px-4 py-2.5)
- **Height:** 40px (auto from padding)

**Title:**
```tsx
style={{ fontWeight: '500' }}
className="text-sm text-white"
```
- **Font Size:** 14px (text-sm)
- **Font Weight:** 500 (medium)
- **Color:** white (always, even in dark mode)

**Action Buttons:**
```tsx
className="p-1 hover:bg-neutral-800 dark:hover:bg-neutral-900 rounded transition-colors"
```
- **Padding:** 4px (p-1)
- **Hover:** bg-neutral-800/900
- **Border Radius:** 4px (rounded)

**Icons:**
```tsx
className="w-4 h-4 text-neutral-300"
```
- **Size:** 16px × 16px
- **Color:** neutral-300 (light gray on dark header)

---

### Compose Body

**Email Fields:**
```tsx
className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-2.5 flex items-center gap-2"
```
- **Padding:** 16px × 10px (px-4 py-2.5)
- **Gap:** 8px (gap-2)
- **Border Bottom:** 1px solid

**Field Label:**
```tsx
className="text-xs text-neutral-500 dark:text-neutral-400 w-12"
```
- **Font Size:** 12px (text-xs)
- **Width:** 48px (w-12) - fixed for alignment
- **Color:** neutral-500 (dark: neutral-400)

**Field Input:**
```tsx
className="flex-1 text-sm bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
```
- **Flex:** 1
- **Font Size:** 14px (text-sm)
- **Background:** transparent
- **Border:** none
- **Outline:** none

---

### Compose Footer

```tsx
className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between"
```
- **Padding:** 16px × 12px (px-4 py-3)
- **Border Top:** 1px solid

**Send Button:**
```tsx
style={{ fontSize: '14px', fontWeight: '500' }}
className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
```
- **Padding:** 24px × 8px (px-6 py-2)
- **Font Size:** 14px (exact)
- **Font Weight:** 500 (medium)

**Attach Button:**
```tsx
className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
```
- **Padding:** 8px (p-2)
- **Border Radius:** 8px (rounded-lg)

---

## 🎨 COLOR SPECIFICATIONS

All colors follow the same system as Listing page:

### Primary Color
- **primary-600:** #1766C2 (main brand color)
- **primary-50/950:** Light/dark backgrounds for hover states
- **primary-300/700:** Border colors on hover
- **primary-400:** Dark mode text/icon color

### Neutral Colors
- **neutral-50 to neutral-950:** Full scale for light/dark mode
- **Borders:** neutral-200/800 (default), neutral-300/700 (inputs)
- **Text:** neutral-900/white (headings), neutral-600/400 (body)
- **Icons:** neutral-700/300 (default), neutral-600/400 (muted)

### Semantic Colors
- **error-50 to error-950:** Red for delete, errors
- **success-50 to success-950:** Green for WhatsApp, success states
- **warning-50 to warning-950:** Orange/yellow for warnings

---

## 🎯 COMMON PATTERNS

### Button Group with Divider
```tsx
<div className="flex gap-2">
  <button>Action 1</button>
  <button>Action 2</button>
  <div className="w-px h-9 bg-neutral-200 dark:bg-neutral-800"></div>
  <button>Action 3</button>
</div>
```
- Divider: 1px wide, matches button height (h-9 = 36px)

### Icon + Text Pattern
```tsx
<div className="flex items-center gap-1">
  <Icon className="w-3.5 h-3.5" />
  <span>Text</span>
</div>
```
- Gap: 4px (gap-1) for tight spacing
- Icon: 14px × 14px for inline text

### Disabled State
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```
- Opacity: 50%
- Cursor: not-allowed

### Stop Propagation Pattern
```tsx
onClick={(e) => e.stopPropagation()}
```
- Prevents clicks from bubbling to parent overlay

---

## ✅ CHECKLIST

When creating detail page:

- [ ] Page padding: p-5 md:p-6, px-[8px] py-[8px]
- [ ] Company name: 18px, 600 weight (exact px, not Tailwind)
- [ ] Contact person: text-sm, medium weight
- [ ] Contact icons: w-3.5 h-3.5 (14px)
- [ ] Action buttons: w-9 h-9 (36px square)
- [ ] Button icons: w-4 h-4 (16px)
- [ ] Two columns: 70% / 30% with gap-6
- [ ] Tabs: border-b-2, active: primary-600, semibold
- [ ] Drawer header: 18px, 600 weight title
- [ ] Form labels: 14px, 500 weight
- [ ] Form inputs: px-3 py-2.5, 14px text
- [ ] Drawer footer: flex-shrink-0, p-6
- [ ] Gmail compose: 240px × 40px minimized, 540px × 600px maximized
- [ ] All transitions: transition-colors or transition-all
- [ ] All hover states working
- [ ] Dark mode on all elements

---

**Version:** 1.0  
**Last Updated:** December 19, 2025  
**Source:** FullLeadDetail.tsx (Production CRM)  
**All measurements verified and exact**
