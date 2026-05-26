# Templates Documentation

**Version:** 1.0  
**Last Updated:** January 12, 2026  
**Status:** Generic - Ready for any project

---

## Overview

This directory contains comprehensive templates and design specifications for building consistent, accessible, and production-ready user interfaces. All templates are framework-agnostic and can be adapted to any project.

---

## 📚 Available Templates

### **Select Dropdown Guide**
**File:** `/templates/SELECT_DROPDOWN_GUIDE.md`  
**Purpose:** Complete specifications for Select dropdown components  
**Includes:**
- Visual specifications (dimensions, colors, spacing)
- SelectTrigger, SelectContent, SelectItem specifications
- Animation and transitions
- Accessibility guidelines
- Tailwind class reference
- Best practices and common issues

**Use when:** Building any dropdown/select component

---

### **Form Components**
**Directory:** `/templates/form/`  
**Main File:** `form.md`  
**Purpose:** Complete form system specifications  
**Includes:**
- Form modal structure
- Input fields (text, email, password, date, etc.)
- Textarea components
- Select/dropdown components
- Form layouts (grid, section, card)
- Labels, validation, error states
- Accessibility requirements

**Use when:** Building forms, modals, or data entry interfaces

---

### **Sidebar Components**
**Directory:** `/templates/sidebar/`  
**Main File:** `Sidebar.md`  
**Purpose:** Navigation sidebar specifications  
**Includes:**
- Collapsible sidebar structure
- Navigation items (expandable/collapsible)
- User profile section
- Logout/settings dropdowns
- Responsive behavior
- Dark mode support

**Use when:** Building application navigation or sidebar layouts

---

### **Header Components**
**Directory:** `/templates/header/`  
**Purpose:** Global header specifications  
**Includes:**
- Header structure and layout
- Navigation elements
- User menu/profile dropdown
- Theme switcher
- Responsive behavior
- Breadcrumbs

**Use when:** Building application headers or top navigation

---

### **Listing/Table Components**
**Directory:** `/templates/listing/`  
**Purpose:** Data listing and table specifications  
**Includes:**
- Grid view layouts
- List view layouts
- Table view specifications
- Pagination components
- Search and filtering
- Action menus (3-dot menus)
- Empty states

**Use when:** Building data tables, lists, or grid views

---

### **Detail View Components**
**Directory:** `/templates/detail_view/`  
**Purpose:** Detail page specifications  
**Includes:**
- Profile headers
- Information sections
- Tab navigation
- Status badges
- Action buttons
- Responsive layouts

**Use when:** Building detail pages, profile pages, or view-only interfaces

---

### **Reports Components**
**Directory:** `/templates/reports/`  
**Purpose:** Reporting and analytics specifications  
**Includes:**
- Dashboard layouts
- Chart specifications
- KPI cards
- Data visualization
- Export functionality

**Use when:** Building dashboards, analytics, or reporting interfaces

---

## 🎨 Design System

### Color Palette

**Primary Colors:**
- Primary-50 to Primary-950 (Blue scale)
- Used for: Buttons, links, focus states, selected items

**Neutral Colors:**
- Neutral-50 to Neutral-950 (Gray scale)
- Used for: Text, backgrounds, borders, dividers

**Semantic Colors:**
- Success: Green
- Error/Destructive: Red
- Warning: Yellow
- Info: Blue

### Typography

**Font Sizes:**
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing Scale

**Standard Spacing:**
- 0.5 (2px), 1 (4px), 1.5 (6px), 2 (8px), 2.5 (10px), 3 (12px), 3.5 (14px), 4 (16px), 5 (20px), 6 (24px), 8 (32px)

**Component Heights:**
- Inputs/Buttons: 40px (h-10)
- Small Buttons: 32px (h-8)
- Large Buttons: 48px (h-12)

### Border Radius

**Standard Radius:**
- sm: 4px
- md: 6px
- lg: 8px (most common)
- xl: 12px
- 2xl: 16px

---

## 🚀 Quick Start

### 1. Choose Your Template
Browse the directories above and select the component you need.

### 2. Read the Specifications
Each template includes complete specifications:
- Visual design (colors, spacing, typography)
- States (default, hover, focus, disabled, error)
- Responsive behavior
- Accessibility requirements
- Code examples

### 3. Implement
Copy the provided code examples and adapt them to your project's needs.

### 4. Customize
All templates use CSS variables and Tailwind classes, making them easy to customize:
- Update color variables for your brand
- Adjust spacing and sizing as needed
- Maintain accessibility standards

---

## 🎯 Best Practices

### Consistency
- Use the same component heights across the application (h-10 for inputs)
- Maintain consistent border radius (rounded-lg = 8px)
- Use the same shadow values (shadow-md for dropdowns)
- Follow z-index standards (z-50 for modals, z-[100] for dropdowns)

### Accessibility
- Always include focus states
- Use semantic HTML elements
- Provide keyboard navigation
- Include ARIA attributes
- Maintain color contrast ratios (WCAG AA)

### Performance
- Use CSS transitions for smooth animations
- Avoid large shadow values
- Optimize component re-renders
- Use proper z-index layering

### Maintainability
- Document custom modifications
- Keep specifications up to date
- Use design tokens/CSS variables
- Follow naming conventions

---

## 📋 Component Checklist

When implementing a component, ensure:

- ✅ Visual design matches specifications
- ✅ All states implemented (hover, focus, active, disabled, error)
- ✅ Responsive behavior works on all screen sizes
- ✅ Dark mode supported (if applicable)
- ✅ Keyboard navigation functional
- ✅ Screen reader accessible
- ✅ Color contrast meets WCAG AA
- ✅ Animations smooth and performant
- ✅ Code documented and maintainable

---

## 🔧 Framework Integration

### React + Tailwind CSS
All examples use React with Tailwind CSS v4. Components use:
- Shadcn/ui base components
- Radix UI primitives
- Lucide React icons

### Adapting to Other Frameworks

**Vue:**
- Use Headless UI or Radix Vue
- Convert JSX to Vue templates
- Maintain Tailwind classes

**Svelte:**
- Use Melt UI
- Convert to Svelte components
- Maintain styling specifications

**Angular:**
- Use Angular Material or build custom
- Convert to Angular templates
- Adapt Tailwind to Angular styling

**Vanilla JS:**
- Use native HTML elements
- Convert Tailwind classes to custom CSS
- Maintain specifications

---

## 📖 Documentation Structure

Each template follows this structure:

```
component-name.md
├── Overview
├── Visual Specifications
│   ├── Dimensions
│   ├── Colors (Light/Dark)
│   ├── Typography
│   └── Spacing
├── Component Structure
├── States & Interactions
├── Responsive Behavior
├── Accessibility
├── Code Examples
├── Tailwind Class Reference
├── Best Practices
└── Common Issues & Solutions
```

---

## 🆕 Version History

**v1.0 (January 12, 2026)**
- Initial template documentation
- Select Dropdown Guide added
- Form components documented
- Sidebar components documented
- Header components documented
- Listing components documented
- Detail view components documented
- Reports components documented
- Generic branding applied to all templates

---

## 🤝 Contributing

When adding new templates:

1. Follow the documentation structure above
2. Include complete specifications (visual, interaction, accessibility)
3. Provide code examples with Tailwind classes
4. Document all states and edge cases
5. Make templates generic (no project-specific branding)
6. Test accessibility compliance
7. Update this README with new template information

---

## 📞 Support

For questions or issues with templates:
1. Check the specific template documentation
2. Review the "Common Issues & Solutions" section
3. Verify accessibility requirements
4. Ensure Tailwind classes are correct

---

**All templates are generic and ready for use in any project.**
