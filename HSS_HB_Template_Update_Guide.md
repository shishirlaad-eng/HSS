Reference: 
folder Name: Brand Kit-20260522T160021Z-3-001
MD file: HSS_HB_Template_Update_Guide

# HSS UK Project — HB Admin Template Update Guide

## 1. Objective

Use the existing **Hidden Brains Admin Template** as the frontend foundation for the **HSS UK Membership Management System** and apply the **HSS UK Brand Kit** as a controlled client branding layer.

This guide is intended for Antigravity, Windsurf, Codex, or a frontend developer to safely update the current HB template without replacing the template architecture.

---

## 2. Core Decision

Do **not** remove or recreate the HB template from scratch.

Use this approach:

```text
HB Admin Template = UI/UX foundation, reusable components, layout, listing/detail behavior
HSS Brand Kit = client branding layer: logo, colors, typography guidance, brand rules
HSS FRD / module specs = business functionality and screen requirements
```

The HSS brand kit does not define application behavior, admin page structure, filters, tables, details, routing, or reusable React components. Therefore, it should not replace the HB template.

---

## 3. Source of Truth Hierarchy

### 3.1 Global Layout Source of Truth

Use these files as the foundation for the global admin shell:

```text
src/app/App.tsx
src/app/components/Sidebar.tsx
src/app/components/GlobalHeader.tsx
src/mockAPI/navigationData.ts
src/styles/globals.css
src/styles/index.css
src/styles/fonts.css
```

### 3.2 Listing Page Source of Truth

Use these files for all listing pages:

```text
src/app/components/SampleDesign.tsx
src/app/components/hb/listing/
templates/listing/TEMPLATE_Listing.tsx
templates/listing/TEMPLATE_mockData.ts
templates/listing/EXACT_SPECIFICATIONS.md
templates/listing/COMPLETE_GUIDE.md
templates/listing/STEP_BY_STEP_GUIDE.md
templates/listing/FIND_REPLACE_GUIDE.md
```

### 3.3 Detail Page Source of Truth

Use these files for all detail/view pages:

```text
src/app/components/EmployeeDetail.tsx
templates/detail_view/DetailViewTemplate.tsx
templates/detail_view/EXACT_SPECIFICATIONS.md
templates/detail_view/SUMMARY.md
```

### 3.4 Form and Modal Source of Truth

Use these files for create/edit forms, filters, and modals:

```text
src/app/components/hb/common/
templates/form/form.md
src/app/components/ui/
```

### 3.5 Reporting Source of Truth

Use these files for report modules:

```text
templates/reports/reportingOverview.md
templates/reports/reportingPageHeader.md
templates/reports/reportingPagination.md
templates/reports/reportingTable.md
```

### 3.6 HSS Brand Source of Truth

Use these brand kit files:

```text
Brand Kit/HSS UK Brand Board.pdf
Brand Kit/Brand Asset Links.docx
Brand Kit/HSS (UK) Logo-Assets/HSS (UK) Logo/PNG/HSSUK logo colour.png
Brand Kit/HSS (UK) Logo-Assets/HSS (UK) Logo/PNG/HSSUK logo White.png
Brand Kit/HSS (UK) Logo-Assets/HSS (UK) Logo/PNG/HSSUK logo Black.png
Brand Kit/HSS (UK) Logo-Assets/HSS (UK) Logo/PNG/HSSUK logo Orange.png
```

---

## 4. HSS Brand Tokens

Add the HSS palette as client-specific theme tokens.

```css
:root {
  --hss-blue: #172E4D;
  --hss-orange: #F9B03D;
  --hss-body-text: #3C3C3D;
  --hss-muted: #9C9C9D;
  --hss-bal-blue: #009FE3;
  --hss-sewa-green: #4EAE33;
  --hss-sevika-pink: #F67FD5;
  --hss-dharma-red: #BC0F1C;
}
```

Recommended semantic mapping:

| Purpose | HSS Color | Hex |
|---|---|---|
| Primary brand | HSS Blue | `#172E4D` |
| Main accent / CTA | HSS Orange | `#F9B03D` |
| Body text | Body Text | `#3C3C3D` |
| Muted / helper text | Secondary Grey | `#9C9C9D` |
| Info | Bal Blue | `#009FE3` |
| Success | Sewa Green | `#4EAE33` |
| Special / Sevika | Sevika Pink | `#F67FD5` |
| Error / destructive | Dharma Red | `#BC0F1C` |

---

## 5. Asset Placement

Copy the client logo assets into the project using a clean structure:

```text
src/assets/brand/hss/logos/
  hss-logo-colour.png
  hss-logo-white.png
  hss-logo-black.png
  hss-logo-orange.png
```

Recommended source mapping:

| Source File | Destination File |
|---|---|
| `HSSUK logo colour.png` | `src/assets/brand/hss/logos/hss-logo-colour.png` |
| `HSSUK logo White.png` | `src/assets/brand/hss/logos/hss-logo-white.png` |
| `HSSUK logo Black.png` | `src/assets/brand/hss/logos/hss-logo-black.png` |
| `HSSUK logo Orange.png` | `src/assets/brand/hss/logos/hss-logo-orange.png` |

Do not use animated logo files in the admin shell. Static PNG logos are preferred for performance, clarity, and professional admin UX.

---

## 6. Typography Guidance

The HSS brand kit mentions:

| Font | Intended Use |
|---|---|
| TT Ramillas | Titles and pull-out text only |
| Open Sauce | Subheadings and body text |

Implementation rule:

1. Keep the HB template default readable sans-serif font for body, forms, tables, filters, buttons, and dense admin content.
2. Use TT Ramillas only for large display headings, login hero headings, or selected dashboard callouts if a valid production/web license is confirmed.
3. Do not use TT Ramillas in tables, small labels, filters, forms, pagination, sidebar items, or dense admin content.
4. Do not include trial font files in production unless the client confirms licensing.

Suggested CSS fallback:

```css
:root {
  --font-admin-body: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-hss-display: "TT Ramillas", Georgia, serif;
}
```

---

## 7. Global Template Changes Required

### 7.1 Update App Identity

Update all app identity references from generic HB/sample labels to HSS project labels.

Recommended names:

```text
Application Name: HSS Membership Management System
Short Name: HSS UK Admin
Organization: Hindu Swayamsevak Sangh (UK)
```

Update:

```text
index.html title
sidebar brand area
header title if present
login/auth screens
empty states
browser metadata if present
favicon/app icon if configured
```

---

### 7.2 Update Sidebar

File:

```text
src/app/components/Sidebar.tsx
```

Required changes:

1. Replace HB/default logo with HSS UK logo.
2. Use full-colour logo on light sidebar/background.
3. Use white logo if sidebar background is HSS Blue or dark.
4. Use HSS Orange for active menu indicator, active icon, or selected border.
5. Keep existing collapse/expand behavior.
6. Keep existing responsive behavior.
7. Do not rebuild sidebar from scratch.

Recommended visual behavior:

| Sidebar Element | Branding Rule |
|---|---|
| Sidebar background | Keep HB neutral or use HSS Blue carefully |
| Active item | HSS Orange accent with readable text |
| Hover item | Light HSS Orange/Blue tint |
| Section labels | Muted text |
| Expanded logo | Full HSS logo |
| Collapsed logo | Cropped emblem or carefully contained full logo |

---

### 7.3 Update Global Header

File:

```text
src/app/components/GlobalHeader.tsx
```

Required changes:

1. Keep the existing header structure and behavior.
2. Keep global search, notification, profile, settings, theme, and appearance controls if already available.
3. Apply HSS accent color to active/focus/primary actions.
4. Ensure header does not become visually heavy.
5. Avoid placing a large logo in both sidebar and header unless the layout requires it.

Recommended behavior:

| Header Element | Branding Rule |
|---|---|
| Primary CTA | HSS Orange or HSS Blue depending contrast |
| Search focus ring | HSS Orange / HSS Blue subtle ring |
| Notification badge | HSS Orange or Dharma Red for urgent |
| Profile menu active state | HSS Blue / Orange accent |
| Settings/theme menu | Keep existing HB behavior |

---

### 7.4 Update Theme System

Files:

```text
src/styles/globals.css
src/styles/index.css
src/styles/fonts.css
```

Required changes:

1. Add HSS theme variables.
2. Do not remove existing HB tokens.
3. Add HSS as an additional theme layer or default selected brand theme.
4. Keep light/dark mode functionality working.
5. Ensure focus states, buttons, badges, links, chips, and active tabs use the HSS palette consistently.

Recommended implementation:

```css
[data-color-theme="hss"] {
  --primary: #172E4D;
  --primary-foreground: #FFFFFF;
  --accent: #F9B03D;
  --accent-foreground: #172E4D;
  --destructive: #BC0F1C;
  --success: #4EAE33;
  --info: #009FE3;
  --muted-foreground: #9C9C9D;
}
```

Use actual variable names already present in the HB template where applicable. Do not invent an incompatible parallel system if the template already has theme variables.

---

## 8. Navigation Changes

File:

```text
src/mockAPI/navigationData.ts
```

Replace sample HB template navigation with HSS project navigation.

Recommended initial module structure:

```text
Dashboard
User Management
  - Users
  - Roles & Permissions
Member Management
  - Members
  - Member Registration Requests
  - Member Documents
Family Management
  - Families
  - Family Members
Activity Centre / Shakha Management
  - Activity Centres
  - Shakhas
Event Management
  - Events
  - Participants
Volunteer Management
  - Volunteers
  - Volunteer Assignments
Payments & Donations
  - Payments
  - Donations
  - Receipts
Content Management
  - Static Pages
  - Announcements
  - Notifications
Reports
  - Member Reports
  - Event Reports
  - Payment Reports
Configurations
  - Master Data
  - Age Groups
  - Consent Rules
  - Document Types
Audit Logs
```

If the FRD/module list later confirms a different module hierarchy, follow the approved FRD/module list over this suggested structure.

---

## 9. Listing Page Update Rules

For every HSS listing page, follow the HB listing reference.

Primary references:

```text
src/app/components/SampleDesign.tsx
src/app/components/hb/listing/
templates/listing/TEMPLATE_Listing.tsx
templates/listing/EXACT_SPECIFICATIONS.md
```

Required listing features:

| Feature | Rule |
|---|---|
| Page header | Use HB PageHeader pattern |
| Breadcrumb | Use HB breadcrumb pattern |
| Search | Keep compact search behavior |
| Advanced filters | Use HB filter modal/panel pattern |
| Filter chips | Show applied filters clearly |
| View modes | Keep table/grid/list if applicable |
| Summary cards | Use relevant module counts/status metrics |
| Table/list/grid | Use HB styling and spacing |
| Row actions | Use HB dropdown/flyout menu pattern |
| Bulk selection | Include where business action requires it |
| Pagination | Use HB pagination pattern |
| Empty states | Use HSS-friendly copy and subtle HSS accent |

Branding rules:

| Listing Element | HSS Styling |
|---|---|
| Primary action button | HSS Blue or HSS Orange |
| Filter chip active state | Light HSS Orange tint |
| Active tab/view state | HSS Blue text or Orange underline |
| Success status | Sewa Green |
| Pending/info status | Bal Blue or HSS Orange |
| Rejected/error status | Dharma Red |
| Special category | Sevika Pink only where contextually meaningful |

Do not create new listing layouts unless explicitly required by the FRD.

---

## 10. Detail Page Update Rules

For all detail pages, use the HB detail page reference.

Primary references:

```text
src/app/components/EmployeeDetail.tsx
templates/detail_view/DetailViewTemplate.tsx
templates/detail_view/EXACT_SPECIFICATIONS.md
```

Required detail page structure:

| Detail Page Area | Rule |
|---|---|
| Header/profile summary | Use HB detail header/card pattern |
| Status badge | Use HSS semantic colors |
| Primary actions | Use HB action button/dropdown pattern |
| Tabs | Use HB tab behavior and spacing |
| Section cards | Keep neutral admin styling |
| Audit/history | Include where FRD requires it |
| Documents/media | Use existing image/modal viewer pattern when applicable |
| Back navigation | Keep consistent with HB detail pattern |

Recommended tabs by module example:

### Member Detail

```text
Overview
Personal Details
Family
Documents
Events
Payments
Consent
Activity / Audit History
```

### Event Detail

```text
Overview
Participants
Registrations
Payments
Documents
Audit History
```

### User Detail

```text
Overview
Role & Permissions
Login Activity
Audit History
```

---

## 11. Form and Modal Update Rules

Use existing HB form/modal patterns.

Primary references:

```text
src/app/components/hb/common/
templates/form/form.md
src/app/components/ui/dialog.tsx
src/app/components/ui/input.tsx
src/app/components/ui/select.tsx
src/app/components/ui/textarea.tsx
```

Rules:

1. Use HB modal/form section layout.
2. Keep labels, inputs, validation messages, and spacing consistent.
3. Use HSS Orange or HSS Blue for focus and primary submit action.
4. Use Dharma Red for destructive/error actions.
5. Use Sewa Green for success confirmation.
6. Do not use highly decorative brand styles in forms.

---

## 12. Status Badge Mapping

Use the HSS brand palette semantically.

| Status Type | Color |
|---|---|
| Active / Approved / Completed | Sewa Green `#4EAE33` |
| Pending / Under Review | HSS Orange `#F9B03D` |
| Info / Draft / Scheduled | Bal Blue `#009FE3` |
| Rejected / Failed / Cancelled | Dharma Red `#BC0F1C` |
| Inactive / Archived | Grey `#9C9C9D` |
| Sevika-specific category | Sevika Pink `#F67FD5` only when relevant |

Do not use brand colors randomly. Every color must map to a clear state or meaning.

---

## 13. Content and Terminology Replacement

Replace generic template terms with HSS project terms.

| Replace Template Term | Use HSS Term |
|---|---|
| Employee | Member / User depending context |
| Lead | Member / Registration Request depending context |
| CRM | Membership Management System |
| Sample Page | Actual module name |
| HB Templates | Remove from production navigation or keep only in development if needed |
| Customer | Member |
| Branch | Activity Centre / Shakha if applicable |

Do not remove reference/template files unless the team confirms they are no longer needed. It is acceptable to remove template demo pages from production navigation while keeping files in the repository as developer references.

---

## 14. Login / Authentication Screen Branding

The login/authentication screens should be the most visibly branded screens.

Recommended design:

| Element | Rule |
|---|---|
| Logo | Use full-colour logo on light background or white logo on dark background |
| Background | Clean white, subtle HSS Blue panel, or HSS Blue gradient with sufficient contrast |
| Primary button | HSS Orange with HSS Blue text, or HSS Blue with white text |
| Links | HSS Blue |
| Error state | Dharma Red |
| Success state | Sewa Green |
| Typography | Sans-serif for forms; optional TT Ramillas for hero heading only if licensed |

Authentication pages to prepare:

```text
Login
OTP Verification
Forgot Password
Reset Password
```

---

## 15. Production Navigation vs Developer References

The HB template has useful reference screens such as UI Kit and Sample Page.

Recommended approach:

1. Keep reference files in repository.
2. Remove or hide `HB Templates`, `UI Kit`, and `Sample Page` from production-facing navigation.
3. If needed, keep a developer-only route or hidden flag for UI Kit during internal development.
4. Do not delete reusable components and documentation.

---

## 16. Accessibility and Contrast Rules

1. Always check text contrast when using HSS Blue and Orange.
2. Avoid orange text on white for small text unless contrast is sufficient.
3. Prefer HSS Blue for text links and HSS Orange for accents/buttons.
4. Do not place full-colour logo on visually busy backgrounds.
5. Use white logo only on dark/HSS Blue backgrounds.
6. Keep focus states visible for keyboard users.

---

## 17. Recommended Implementation Sequence

### Phase 1 — Safe Template Setup

1. Clean install dependencies if needed.
2. Verify the existing HB template builds.
3. Do not change business screens yet.
4. Confirm global header/sidebar works.

Commands:

```bash
npm install
npm run build
```

On Windows:

```bash
npm.cmd install
npm.cmd run build
```

### Phase 2 — Brand Asset Integration

1. Add HSS logo files under `src/assets/brand/hss/logos/`.
2. Add HSS CSS variables.
3. Update app name/title.
4. Update sidebar logo.
5. Update favicon if available.
6. Validate light/dark mode.

### Phase 3 — Global Shell Branding

1. Update sidebar active/hover states.
2. Update header accent/focus states.
3. Add HSS theme to color theme selector if the selector exists.
4. Keep the template’s existing theme behavior intact.

### Phase 4 — Navigation Replacement

1. Update `navigationData.ts` with HSS modules.
2. Remove/hide HB demo navigation from production.
3. Keep UI Kit and SampleDesign files for developer reference.

### Phase 5 — Module Screen Migration

For each module:

1. Create listing page using HB listing reference.
2. Create detail page using HB detail reference.
3. Use HSS terminology and mock data.
4. Apply HSS status badge mapping.
5. Validate responsive behavior.
6. Run build.

### Phase 6 — Validation

Run:

```bash
npm run build
```

Validate:

```text
No TypeScript errors
No broken imports
No deleted reusable components
No layout regression in sidebar/header
No logo distortion
No random color usage
No unlicensed production font usage
```

---

## 18. Acceptance Criteria

The update is complete when:

| Area | Acceptance Criteria |
|---|---|
| Template foundation | HB app shell, sidebar, header, listing/detail components are retained |
| Branding | HSS logo and colors applied consistently |
| Navigation | HSS project modules replace sample template navigation |
| Typography | Admin readability preserved; decorative fonts not overused |
| Listings | HB listing pattern retained for project modules |
| Details | HB detail pattern retained for project modules |
| Forms | HB form/modal pattern retained |
| Theme | Light/dark mode remains functional |
| Build | `npm run build` or `npm.cmd run build` passes |
| Safety | No new design system created unnecessarily |

---

## 19. Hard Rules for AI Code Generation

When using Windsurf, Codex, or Antigravity, enforce these rules:

1. Do not delete the HB template.
2. Do not create a new project from scratch.
3. Do not replace the global header/sidebar architecture.
4. Do not invent a new design system.
5. Do not hardcode brand colors repeatedly inside components if theme variables exist.
6. Do not use animated logo files in normal admin screens.
7. Do not use trial font files in production without license confirmation.
8. Do not delete `templates/`, `guidelines/`, or reusable HB components.
9. Do not remove light/dark mode behavior.
10. Always run the build after changes.

---

## 20. Final Recommended Statement

```text
The HSS UK admin panel should be implemented by extending the existing Hidden Brains Admin Template. The HB template remains the source of truth for admin layout, components, listing pages, detail pages, forms, filters, and global shell behavior. The HSS UK Brand Kit should be applied as a controlled client branding layer using official logos, color tokens, semantic status mapping, and restrained typography usage.
```
