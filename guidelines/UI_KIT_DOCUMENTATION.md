# UI Kit Documentation

## 📍 Access

The UI Kit is accessible via the navigation sidebar:
- **Location**: Sidebar → UI Kit (with Palette icon)
- **Route**: Click "UI Kit" in the navigation menu
- **File**: `/src/app/components/UIKit.tsx`

---

## 🎨 What's Included

### 1. **Foundations**
- **Design Tokens** - Border radius, shadows, and core design values
- **Typography** - Inter font family with systematic type scale (48px to 12px)
- **Colors** - Full palette with Indigo primary, Neutral grays, and semantic colors
- **Spacing** - Consistent 4px-based spacing scale
- **Elevation** - Shadow system for visual hierarchy (4 levels)

### 2. **Components**

#### **Buttons**
- `PrimaryButton` - Main action buttons with icons
- `SecondaryButton` - Secondary actions
- `IconButton` - 40×40px icon-only buttons
- Shadcn Button variants (default, secondary, outline, ghost, link, destructive)
- All sizes (sm, default, lg, icon)
- States (default, hover, disabled, loading)

#### **Form Elements**
- `FormInput` - Text, email, password, number inputs
- `FormTextarea` - Multi-line text input
- `FormLabel` - Field labels with required indicator
- `FormGrid` - Responsive form grids (1-4 columns)
- `FormField` - Field container
- `FormFooter` - Form action buttons area

#### **Tables**
- Styled data tables with hover states
- Header with background
- Action buttons in rows
- Badge components for status

#### **Cards**
- `Card` - Container component
- `CardHeader` - Card title area
- `CardTitle` - Card heading
- `CardDescription` - Card subtitle
- `CardContent` - Card body

#### **Modals**
- `FormModal` - Modal wrapper for forms
- Full-screen on mobile
- Backdrop overlay
- Close on ESC key

#### **Alerts & Toasts**
- `Alert` - Inline alert messages (info, destructive)
- `toast.success()` - Success notifications
- `toast.error()` - Error notifications
- `toast.info()` - Info notifications

#### **Iconography**
- Lucide React icons (v0.487.0)
- 12+ commonly used icons showcased
- Consistent sizing (w-4 h-4, w-5 h-5, w-6 h-6)

#### **HB Components**
- `SearchBar` - Expandable search with advanced filters
- `StatusFilter` - Quick status toggle
- `ViewModeSwitcher` - Table/Grid/List view toggle
- `Pagination` - Page navigation
- `Breadcrumb` - Hierarchical navigation
- `SummaryWidgets` - Dashboard metrics
- `FilterPopup` - Advanced filtering

### 3. **Navigation**

#### **Sidebar**
- Collapsible navigation
- Icons + labels
- Expandable sub-items
- Active state highlighting

#### **Header**
- `PageHeader` - Page title with breadcrumbs and actions
- Action buttons area
- Breadcrumb navigation

#### **Tabs**
- `Tabs` - Tabbed navigation
- `TabsList` - Tab container
- `TabsTrigger` - Individual tab
- `TabsContent` - Tab panel

#### **Breadcrumbs**
- Hierarchical path display
- Clickable navigation
- Current page indicator

### 4. **Patterns**

#### **Listing Page Pattern**
Complete pattern including:
- PageHeader with actions
- SummaryWidgets
- SearchBar + Filters
- Data Table/Grid
- Pagination

#### **Form Page Pattern**
Standard form structure:
- FormModal container
- FormGrid for layout
- FormField + FormLabel + FormInput
- FormFooter with actions

#### **Detail Page Pattern**
Information display:
- PageHeader with edit actions
- Tabs for sections
- Cards for content grouping

#### **Dashboard Pattern**
Overview page:
- SummaryWidgets for metrics
- Cards for data sections
- Charts and visualizations

### 5. **States**

#### **Loading State**
- Spinner component (`Loader2`)
- Animated loading indicator
- Loading button state

#### **Empty State**
- Icon placeholder
- Helpful message
- Primary action CTA

#### **Error State**
- Destructive alert
- Error icon
- Error message

#### **Success State**
- Success alert
- Success toast
- Confirmation message

### 6. **Responsive Rules**

#### **Breakpoints**
- sm: 640px+
- md: 768px+
- lg: 1024px+
- xl: 1280px+
- 2xl: 1536px+

#### **Best Practices**
- Mobile-first approach
- Test at 375px, 768px, 1440px
- Use FormGrid for responsive layouts
- Tables scroll horizontally on mobile
- Modals are full-screen on mobile
- Stack vertically on mobile

### 7. **Accessibility Guidelines**

#### **Keyboard Navigation**
- Tab - Navigate elements
- Enter/Space - Activate buttons
- Esc - Close modals
- Arrow keys - Navigate lists

#### **ARIA Labels**
- Icon-only buttons have aria-label
- Form hints use aria-describedby
- Required fields marked with aria-required

#### **Color Contrast**
- WCAG AA standards (4.5:1 ratio)
- Icons + text for status
- Test in light and dark mode

#### **Focus States**
- Visible focus rings
- ring-2 ring-offset-2
- Clear focus indicators

---

## 💻 Code Examples

Every component in the UI Kit includes:
1. **Live Preview** - Interactive examples you can test
2. **Code Snippets** - Copy-to-clipboard code blocks
3. **Usage Examples** - Real-world implementation patterns
4. **Props Documentation** - Available options and configurations

---

## 🔧 Interactive Features

### Copy Code
Every code block has a copy button in the top-right corner. Click to copy the code to your clipboard.

### Table of Contents
The left sidebar provides quick navigation to all sections. Click any item to jump directly to that section.

### Live Examples
All components are live and interactive. You can:
- Click buttons to see states
- Open modals and forms
- Test filters and search
- View different variants

---

## 📝 Usage Guide

### For Developers

1. **Browse Components** - Navigate through the table of contents
2. **View Examples** - See live component previews
3. **Copy Code** - Use the copy button on code blocks
4. **Implement** - Paste into your project and customize

### For Designers

1. **Reference Design Tokens** - Colors, spacing, typography
2. **Check Patterns** - Standard page layouts and structures
3. **Review States** - Loading, empty, error, success examples
4. **Verify Accessibility** - Guidelines and best practices

---

## 🎯 Quick Reference

### Most Used Components

```tsx
// Buttons
import { PrimaryButton, SecondaryButton, IconButton } from './components/hb/listing';
<PrimaryButton icon={Plus}>Add New</PrimaryButton>

// Forms
import { FormModal, FormGrid, FormField, FormLabel, FormInput } from './components/hb/common';
<FormModal isOpen={show} onClose={onClose} title="Add Item">
  <FormGrid cols={2}>
    <FormField>
      <FormLabel required>Name</FormLabel>
      <FormInput value={name} onChange={setName} />
    </FormField>
  </FormGrid>
</FormModal>

// Alerts
import { toast } from 'sonner';
toast.success('Success!');
toast.error('Error!');

// Cards
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## 🔗 Related Documentation

- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Component Catalog**: `/guidelines/COMPONENT_CATALOG.md`
- **Generic Template Guide**: `/guidelines/GENERIC_TEMPLATE_GUIDE.md`
- **Listing Components**: `/src/app/components/hb/listing/README.md`

---

## 📊 Statistics

- **Foundations**: 5 sections (Tokens, Typography, Colors, Spacing, Elevation)
- **Components**: 8 categories with 30+ components
- **Navigation**: 4 navigation patterns
- **Patterns**: 4 page patterns
- **States**: 4 state examples
- **Code Examples**: 20+ copy-paste snippets
- **Live Demos**: 50+ interactive examples

---

## ✨ Features

✅ **Interactive Playground** - Test all components live  
✅ **Copy-to-Clipboard** - Quick code copying  
✅ **Dark Mode Support** - All examples work in both modes  
✅ **Responsive Examples** - Mobile, tablet, desktop previews  
✅ **Accessibility Focused** - WCAG AA compliant  
✅ **Production Ready** - Battle-tested components  
✅ **Type Safe** - Full TypeScript support  
✅ **Well Documented** - Clear usage instructions  

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
