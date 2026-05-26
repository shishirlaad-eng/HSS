# 📋 Step-by-Step Guide: Copy CRM UI to New Project

**Follow this exact process to replicate your CRM listing page in a new application in 30 minutes!**

---

## 🎯 What You'll Get

By following this guide, you'll create a NEW Figma Make project with:
- ✅ Same header (search, theme switcher, notifications)
- ✅ Same sidebar (just different menu items)
- ✅ Same listing page structure (breadcrumb, stats, filters, 4 views)
- ✅ Same theme system (5 themes + dark mode)
- ✅ Different content (Employees instead of Leads, for example)

**Total Time: ~45 minutes**

---

## 📦 PHASE 1: Setup New Project (5 minutes)

### Step 1.1: Create New Figma Make Project
1. Go to Figma Make
2. Click "Create New Project"
3. Name it (e.g., "HR Management" or "Product Catalog")

### Step 1.2: Create Folder Structure
Create these folders in your new project:
```
/styles/
/components/
/imports/
```

---

## 📦 PHASE 2: Copy Core System Files (10 minutes)

### Step 2.1: Copy Theme System (EXACT COPY)

**From CRM Project:**
1. Open `/styles/globals.css`
2. Copy ENTIRE file content (all ~600 lines)

**In New Project:**
1. Create `/styles/globals.css`
2. Paste the content EXACTLY
3. ⚠️ **DO NOT CHANGE ANYTHING**

**✅ You now have: 5 themes + dark mode + typography system**

---

### Step 2.2: Copy Global Header (EXACT COPY)

**From CRM Project:**
1. Open `/components/GlobalHeader.tsx`
2. Copy ENTIRE file content

**In New Project:**
1. Create `/components/GlobalHeader.tsx`
2. Paste the content EXACTLY
3. ⚠️ **DO NOT CHANGE ANYTHING**

**✅ You now have: Search, notifications, theme switcher, user menu**

---

### Step 2.3: Copy Company Selector (EXACT COPY)

**From CRM Project:**
1. Open `/components/CompanySelector.tsx`
2. Copy ENTIRE file content

**In New Project:**
1. Create `/components/CompanySelector.tsx`
2. Paste the content EXACTLY
3. ⚠️ **DO NOT CHANGE ANYTHING**

**✅ You now have: Company dropdown**

---

### Step 2.4: Copy Logo (Optional)

**From CRM Project:**
1. Note the logo import path: `figma:asset/359c28f4c65a9b1416c8530205b35d718c631dfc.png`

**In New Project:**
- Use same logo, OR
- Replace with your new app logo in Sidebar.tsx later

---

## 📦 PHASE 3: Setup Sidebar (10 minutes)

### Step 3.1: Copy Sidebar File

**From CRM Project:**
1. Open `/components/Sidebar.tsx`
2. Copy ENTIRE file content

**In New Project:**
1. Create `/components/Sidebar.tsx`
2. Paste the content

---

### Step 3.2: Customize Sidebar Menu (ONLY PART YOU CHANGE!)

**Find the `menuItems` array** (around line 110-175)

**Example for HR Application:**

```typescript
// CHANGE THIS: Module type
type ModuleType = 'employees' | 'attendance' | 'payroll' | 'leave';

// CHANGE THIS: menuItems array
const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: UserIcon,
    subItems: [
      { id: 'dashboard', label: 'Dashboard', onClick: () => {} },
    ],
  },
  {
    id: 'hr',
    label: 'HR Management',  // ← Changed from "Leads"
    icon: UsersIcon,
    subItems: [
      { 
        id: 'employees',  // ← Changed from "leads"
        label: 'Employees',  // ← Changed from "Lead Management"
        onClick: () => onNavigateToModule('employees'),
        active: currentModule === 'employees'
      },
      { 
        id: 'attendance', 
        label: 'Attendance', 
        onClick: () => onNavigateToModule('attendance'),
        active: currentModule === 'attendance'
      },
      { 
        id: 'payroll', 
        label: 'Payroll', 
        onClick: () => onNavigateToModule('payroll'),
        active: currentModule === 'payroll'
      },
      { 
        id: 'leave', 
        label: 'Leave Management', 
        onClick: () => onNavigateToModule('leave'),
        active: currentModule === 'leave'
      },
    ],
  },
  // Keep Users and Settings sections as-is
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    subItems: [
      { id: 'all-users', label: 'All Users', onClick: () => {} },
      { id: 'teams', label: 'Teams', onClick: () => {} },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    subItems: [
      { id: 'general', label: 'General Settings', onClick: () => {} },
      { id: 'integrations', label: 'Integrations', onClick: () => {} },
    ],
  },
];
```

**Everything else stays the same!**

---

## 📦 PHASE 4: Setup App.tsx (5 minutes)

### Step 4.1: Create App.tsx

**In New Project**, create `/App.tsx` with this structure:

```typescript
import { useState, useEffect } from 'react';
import { GlobalHeader } from './components/GlobalHeader';
import { Sidebar } from './components/Sidebar';
import { EmployeeApp } from './components/EmployeeApp'; // Your module wrapper

type ModuleType = 'employees' | 'attendance' | 'payroll' | 'leave'; // Match sidebar

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('employees');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'natural';
    }
    return 'natural';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newMode));
    }
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', currentTheme);
  }, [isDarkMode, currentTheme]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="fixed top-0 left-0 right-0 z-30">
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <GlobalHeader
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            isSidebarCollapsed={isSidebarCollapsed}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </div>
      </div>

      <Sidebar
        currentModule={currentModule}
        onNavigateToModule={setCurrentModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className={`transition-all duration-300 pt-12 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <EmployeeApp 
          currentModule={currentModule}
          onNavigateToModule={setCurrentModule}
        />
      </main>
    </div>
  );
}
```

---

## 📦 PHASE 5: Create Module Structure (15 minutes)

### Step 5.1: Create Module Folder

In new project, create:
```
/components/hr/     (or /components/products/, /components/invoices/, etc.)
```

---

### Step 5.2: Copy Template Files

**From Your TEMPLATES Folder (in CRM project):**

1. Copy `TEMPLATE_Listing.tsx` → Rename to `EmployeeListing.tsx`
2. Copy `TEMPLATE_mockData.ts` → Rename to `mockData.ts`

**Place both in `/components/hr/`**

---

### Step 5.3: Find & Replace in EmployeeListing.tsx

Open `EmployeeListing.tsx` and use Find & Replace (Ctrl+H):

**Do these replacements in order:**

| Find (Case Sensitive ✓) | Replace With |
|--------------------------|--------------|
| `Item` | `Employee` |
| `item` | `employee` |
| `ITEM` | `EMPLOYEE` |
| `items` | `employees` |
| `Item Management` | `Employee Management` |

**Save the file!**

---

### Step 5.4: Update mockData.ts

**1. Update the interface** (around line 10):

```typescript
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
  
  // Employee-specific fields
  department: string;
  role: string;
  joinDate: string;
  salary: number;
}

export type EmployeeStatus = 'active' | 'on-leave' | 'inactive';
```

**2. Update mock data** (around line 35):

```typescript
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15',
    department: 'Engineering',
    role: 'Software Engineer',
    joinDate: '2024-01-15',
    salary: 85000,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    createdAt: '2024-02-20',
    updatedAt: '2024-12-14',
    department: 'Marketing',
    role: 'Marketing Manager',
    joinDate: '2024-02-20',
    salary: 75000,
  },
  // Add more employees...
];
```

**3. Find & Replace:**

| Find | Replace With |
|------|--------------|
| `Item` | `Employee` |
| `item` | `employee` |
| `mockItems` | `mockEmployees` |

**Save the file!**

---

### Step 5.5: Create Module Wrapper

Create `/components/EmployeeApp.tsx`:

```typescript
import { useState } from 'react';
import { EmployeeListing } from './hr/EmployeeListing';

type ModuleType = 'employees' | 'attendance' | 'payroll' | 'leave';

interface EmployeeAppProps {
  currentModule: ModuleType;
  onNavigateToModule: (module: ModuleType) => void;
}

export function EmployeeApp({ currentModule }: EmployeeAppProps) {
  if (currentModule === 'employees') {
    return <EmployeeListing />;
  }

  if (currentModule === 'attendance') {
    return <div className="p-6">Attendance Module - Coming Soon</div>;
  }

  if (currentModule === 'payroll') {
    return <div className="p-6">Payroll Module - Coming Soon</div>;
  }

  if (currentModule === 'leave') {
    return <div className="p-6">Leave Management - Coming Soon</div>;
  }

  return null;
}
```

---

## 📦 PHASE 6: Customize Your Listing (5 minutes)

### Step 6.1: Update Breadcrumb

In `EmployeeListing.tsx`, find the breadcrumb section (around line 60):

```tsx
{/* CHANGE THIS: */}
<div className="flex items-center gap-2 mb-5">
  <span>Home</span>
  <ChevronRight className="w-4 h-4" />
  <span>Human Resources</span>  {/* ← Changed */}
  <ChevronRight className="w-4 h-4" />
  <span className="text-neutral-900 dark:text-white">Employee Management</span>
</div>
```

---

### Step 6.2: Update Page Title

```tsx
<h1 className="text-neutral-900 dark:text-white mb-1">
  Employee Management
</h1>
<p className="text-neutral-600 dark:text-neutral-400">
  Manage your organization's employees and their information
</p>
```

---

### Step 6.3: Update Stats Cards

Find stats cards section (around line 150) and update labels:

```tsx
<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  Total Employees  {/* ← Changed from "Total Items" */}
</div>
```

---

### Step 6.4: Update List Fields (Optional)

If you want to show department/role instead of email/phone in list view, find the list items (around line 300):

```tsx
{/* BEFORE: */}
<div className="flex items-center gap-4 text-sm">
  <Mail className="w-3.5 h-3.5" />
  {employee.email}
</div>

{/* AFTER (show department/role): */}
<div className="flex items-center gap-4 text-sm">
  <Building2 className="w-3.5 h-3.5" />
  {employee.department}
  <Briefcase className="w-3.5 h-3.5" />
  {employee.role}
</div>

{/* Don't forget to import icons: */}
import { Building2, Briefcase } from 'lucide-react';
```

---

## ✅ PHASE 7: Test Your App (5 minutes)

### Step 7.1: Run the App
1. Start your Figma Make preview
2. Check that page loads without errors

### Step 7.2: Test Features
- [ ] Header appears with search, theme switcher
- [ ] Sidebar shows your custom menu items
- [ ] Employee Management loads
- [ ] Stats cards show correct numbers
- [ ] Search works
- [ ] Filter dropdown works
- [ ] View switcher works (Grid, List, Table)
- [ ] Dark mode toggle works
- [ ] Theme switcher works (try all 5 themes)

### Step 7.3: Check Responsive
- [ ] Try mobile view (collapse sidebar)
- [ ] Try tablet view
- [ ] Try desktop view

---

## 🎉 Done!

**You now have:**
- ✅ Complete HR Management app (or Products, Invoices, etc.)
- ✅ Same professional UI as CRM
- ✅ Breadcrumb navigation
- ✅ Stats cards
- ✅ Search & filters
- ✅ 4 view modes (Grid, List, Table, Kanban)
- ✅ Theme system (5 themes + dark mode)
- ✅ Responsive layout

**Total time: ~45 minutes!** 🚀

---

## 📁 Final File Structure

Your new project should look like this:

```
/your-new-app/
│
├── /styles/
│   └── globals.css              ← Copied exactly from CRM
│
├── /components/
│   ├── GlobalHeader.tsx         ← Copied exactly from CRM
│   ├── CompanySelector.tsx      ← Copied exactly from CRM
│   ├── Sidebar.tsx              ← Copied & customized menu
│   ├── EmployeeApp.tsx          ← Created new (wrapper)
│   │
│   └── /hr/
│       ├── EmployeeListing.tsx  ← From template + find/replace
│       └── mockData.ts          ← From template + customized
│
└── App.tsx                      ← Created new (main layout)
```

---

## 🔄 Next Steps

### To Add More Modules:
1. Create new listing from template (e.g., AttendanceListing.tsx)
2. Do find & replace (Item → Attendance)
3. Add to EmployeeApp.tsx routing

### To Add Detail Pages:
1. Wait for TEMPLATE_Detail.tsx (coming next!)
2. Follow same find & replace process

### To Add Forms:
1. Wait for TEMPLATE_Form.tsx (coming next!)
2. Follow same find & replace process

---

## 💡 Pro Tips

1. **Always test after each phase** - Don't wait until the end!
2. **Use case-sensitive find & replace** - Prevents errors
3. **Keep template files in CRM project** - Reuse for future projects
4. **Copy the structure, customize the content** - Don't reinvent the wheel!

---

## 🆘 Troubleshooting

**Error: "Cannot find module './mockData'"**
- ✅ Make sure mockData.ts is in the same folder as EmployeeListing.tsx
- ✅ Check the import path matches your folder structure

**Error: "Property 'department' does not exist"**
- ✅ Make sure you updated the Employee interface in mockData.ts
- ✅ Make sure you added department field to mock data

**Sidebar menu doesn't show my items**
- ✅ Check that ModuleType in Sidebar.tsx matches your modules
- ✅ Check that onNavigateToModule is passed correctly

**Stats cards show 0**
- ✅ Make sure mockEmployees array has data
- ✅ Check that status values match ('active', 'pending', 'inactive')

---

**🎊 Congratulations! You've successfully replicated your CRM UI in a new application!**

Use this same process for every new app you build - it gets faster each time! 🚀
