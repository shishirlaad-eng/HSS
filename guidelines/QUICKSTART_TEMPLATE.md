# 🚀 Quick Start Template - New Figma Make Project

Use this guide to replicate the CRM UI in a brand new Figma Make file for different applications (HR, Projects, Finance, etc.)

---

## ⚡ 3-Step Setup Process

### **STEP 1: Copy Core Files (Exact Copy)**
### **STEP 2: Customize Sidebar Menu**
### **STEP 3: Build Your Module Components**

---

## 📋 STEP 1: Copy Core Files

### File 1: `/styles/globals.css`

**Action:** Create this file with EXACT content from CRM project

**How to do it in new Figma Make file:**
1. In your CRM project, read `/styles/globals.css` 
2. Copy the entire content (all ~600 lines)
3. In new Figma Make project, create `/styles/globals.css`
4. Paste the content exactly as-is

**What this includes:**
- ✅ All 5 theme definitions (natural, slate, nord, midnight, warm)
- ✅ Light & dark mode colors
- ✅ Typography system
- ✅ Base styles

**⚠️ DO NOT CHANGE ANYTHING** - This is your design system foundation

---

### File 2: `/components/GlobalHeader.tsx`

**Action:** Create this file with EXACT content from CRM project

**How to do it:**
1. In CRM project, read `/components/GlobalHeader.tsx`
2. Copy entire content (all ~700 lines)
3. In new project, create `/components/GlobalHeader.tsx`
4. Paste exactly as-is

**What this includes:**
- ✅ Search functionality
- ✅ Theme switcher (5 themes)
- ✅ Dark mode toggle
- ✅ Company selector
- ✅ Notifications
- ✅ User profile dropdown

**⚠️ DO NOT CHANGE ANYTHING** - This works globally for all apps

---

### File 3: `/components/CompanySelector.tsx`

**Action:** Create this file with EXACT content from CRM project

**How to do it:**
1. In CRM project, read `/components/CompanySelector.tsx`
2. Copy entire content
3. In new project, create `/components/CompanySelector.tsx`
4. Paste exactly as-is

**⚠️ DO NOT CHANGE ANYTHING**

---

### File 4: `/imports/logo.png` (Your Logo)

**Action:** Use your logo asset

**Options:**
- Use same CRM logo across all apps
- OR replace with new app-specific logo

---

## 📋 STEP 2: Customize Sidebar

### File: `/components/Sidebar.tsx`

**Action:** Copy the file, then CUSTOMIZE the menu items

**What to Copy (Lines 1-40):**
```typescript
import { useState, useRef, useEffect } from 'react';
import {
  Users,
  UserIcon,
  LogOut,
  Settings,
  Target,
  CreditCard,
  Users as UsersIcon,
  Key,
  Menu,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import logo from 'figma:asset/359c28f4c65a9b1416c8530205b35d718c631dfc.png';

// UPDATE THIS: Change to your module type
type ModuleType = 'leads' | 'opportunities' | 'requirement-types';

interface SidebarProps {
  currentModule: ModuleType;
  onNavigateToModule: (module: ModuleType) => void;
  onLogout?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// ... rest of types stay same
```

**What to CUSTOMIZE (Lines ~75-140):**

```typescript
// EXAMPLE FOR HR APPLICATION
type ModuleType = 'employees' | 'attendance' | 'payroll' | 'leave';

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: UserIcon,
    subItems: [
      { id: 'dashboard', label: 'Dashboard', onClick: () => {} },
      { id: 'sitemap', label: 'Sitemap', onClick: () => {} },
    ],
  },
  {
    id: 'hr',
    label: 'HR Management',
    icon: UsersIcon,
    subItems: [
      { 
        id: 'employees', 
        label: 'Employees', 
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
      { id: 'general-settings', label: 'General Settings', onClick: () => {} },
      { id: 'integrations', label: 'Integrations', onClick: () => {} },
    ],
  },
];
```

**Everything else (Lines 140-end) stays EXACTLY the same** - The entire render logic, collapse functionality, profile section, etc.

---

## 📋 STEP 3: Build Module Components

### File: `/App.tsx`

**Base Structure (Copy this pattern):**

```typescript
import { useState } from 'react';
import { GlobalHeader } from './components/GlobalHeader';
import { Sidebar } from './components/Sidebar';
import { YourModuleApp } from './components/YourModuleApp'; // Your main module component

// UPDATE THIS: Your module types
type ModuleType = 'employees' | 'attendance' | 'payroll' | 'leave';

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

  // Dark mode toggle
  const handleToggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newMode));
    }
  };

  // Theme change
  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  };

  // Apply dark mode and theme
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
      {/* Global Header - 48px height */}
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

      {/* Sidebar - Fixed position */}
      <Sidebar
        currentModule={currentModule}
        onNavigateToModule={setCurrentModule}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className={`transition-all duration-300 pt-12 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <YourModuleApp 
          currentModule={currentModule}
          onNavigateToModule={setCurrentModule}
        />
      </main>
    </div>
  );
}
```

---

### File: `/components/YourModuleApp.tsx` (Main Module Component)

**Pattern (Similar to CRMApp.tsx):**

```typescript
import { useState } from 'react';
import { EmployeeListing } from './hr/EmployeeListing';
import { AttendanceListing } from './hr/AttendanceListing';
// ... other module components

type ModuleType = 'employees' | 'attendance' | 'payroll' | 'leave';
type Screen = 'list' | 'detail' | 'add' | 'edit';

interface YourModuleAppProps {
  currentModule: ModuleType;
  onNavigateToModule: (module: ModuleType) => void;
}

export function YourModuleApp({ currentModule, onNavigateToModule }: YourModuleAppProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Render based on current module
  if (currentModule === 'employees') {
    return <EmployeeListing />;
  }

  if (currentModule === 'attendance') {
    return <AttendanceListing />;
  }

  // ... other modules

  return null;
}
```

---

### File: `/components/hr/EmployeeListing.tsx` (Example Listing)

**Use the EXACT SAME pattern as LeadListing.tsx:**

```typescript
import { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, LayoutGrid, List as ListIcon, Table2,
  ChevronDown, MoreVertical, Mail, Phone, User, Edit, Trash2,
  // ... other icons you need
} from 'lucide-react';

// Your data
import { mockEmployees, type Employee } from './mockData';

type ViewMode = 'grid' | 'list' | 'table';

export function EmployeeListing() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState(mockEmployees);

  // Use EXACT same layout structure as LeadListing:
  return (
    <div className="p-5 md:p-6 bg-white dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">
        
        {/* Breadcrumb - Same pattern */}
        <div className="flex items-center gap-2 mb-5 text-sm text-neutral-600 dark:text-neutral-400">
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span>HR Management</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-900 dark:text-white">Employees</span>
        </div>

        {/* Page Header - Same pattern */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-neutral-900 dark:text-white mb-1">
              Employee Management
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your organization's employees
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Filters & Actions Bar - Same pattern */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded-lg"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('list')}>
                <ListIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('table')}>
                <Table2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Same pattern as CRM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <div className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">
              Total Employees
            </div>
            <div className="text-2xl text-neutral-900 dark:text-white">
              {employees.length}
            </div>
          </div>
          {/* ... more stat cards */}
        </div>

        {/* List/Grid/Table Content */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-neutral-900 dark:text-white">
                        {employee.name}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {employee.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Card content */}
              </div>
            ))}
          </div>
        )}

        {/* Table view - Use same pattern */}
      </div>
    </div>
  );
}
```

---

### File: `/components/hr/mockData.ts`

**Use same pattern as CRM mockData.ts:**

```typescript
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'on-leave';
  joinDate: string;
  // ... more fields
}

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    phone: '+1 234 567 8900',
    role: 'Software Engineer',
    department: 'Engineering',
    status: 'active',
    joinDate: '2023-01-15',
  },
  // ... more employees
];

// Helper functions - Same pattern as CRM
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-950';
    case 'inactive': return 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900';
    case 'on-leave': return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-950';
    default: return '';
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

---

## 🎯 Summary: What to Copy vs What to Customize

### ✅ COPY EXACTLY (100% as-is):
1. `/styles/globals.css` - Your entire design system
2. `/components/GlobalHeader.tsx` - Universal header
3. `/components/CompanySelector.tsx` - Company dropdown

### 🔄 COPY & CUSTOMIZE (90% same, 10% change):
4. `/components/Sidebar.tsx` - Copy all, change menuItems array only
5. `/App.tsx` - Copy structure, change module types and routing

### 🆕 BUILD NEW (Use patterns from CRM):
6. `/components/YourModuleApp.tsx` - Like CRMApp.tsx
7. `/components/your-module/YourListing.tsx` - Like LeadListing.tsx
8. `/components/your-module/YourDetail.tsx` - Like FullLeadDetail.tsx
9. `/components/your-module/AddYourForm.tsx` - Like AddLeadForm.tsx
10. `/components/your-module/mockData.ts` - Your data structure

---

## 📊 Quick Reference Examples

### For HR Application:
- Module Type: `'employees' | 'attendance' | 'payroll' | 'leave'`
- Listing: EmployeeListing.tsx (like LeadListing)
- Detail: EmployeeDetail.tsx (like FullLeadDetail)

### For Project Management:
- Module Type: `'projects' | 'tasks' | 'timesheets' | 'reports'`
- Listing: ProjectListing.tsx
- Detail: ProjectDetail.tsx

### For Finance:
- Module Type: `'invoices' | 'expenses' | 'payments' | 'reports'`
- Listing: InvoiceListing.tsx
- Detail: InvoiceDetail.tsx

---

## ⚡ Time Estimate

**Setup Time for New App:**
- Copy core files (5 minutes)
- Customize sidebar (5 minutes)
- Set up App.tsx structure (5 minutes)
- Build first listing component (30 minutes)
- **Total: ~45 minutes to 1 hour**

---

## ✅ Checklist for New Project

- [ ] Create new Figma Make project
- [ ] Copy `/styles/globals.css` exactly
- [ ] Copy `/components/GlobalHeader.tsx` exactly
- [ ] Copy `/components/CompanySelector.tsx` exactly
- [ ] Copy `/components/Sidebar.tsx` and customize menu
- [ ] Copy `/App.tsx` structure and update modules
- [ ] Create your module folder structure
- [ ] Create mockData.ts with your data types
- [ ] Create first listing component using CRM pattern
- [ ] Create detail component using CRM pattern
- [ ] Create add/edit form using CRM pattern
- [ ] Test all views (list, grid, table)
- [ ] Test dark mode
- [ ] Test theme switcher
- [ ] Test responsive layout

---

**🎉 You're Done!**

You now have a complete application with the same professional UI, theme system, and patterns as your CRM. Just swap the data and labels!

---

**Need Help?**
Refer to:
- `DESIGN_SYSTEM.md` for component patterns
- Original CRM files for implementation details
- This guide for step-by-step instructions
