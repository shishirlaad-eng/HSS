# 📚 Code Snippets Library

Copy-paste ready code for building new applications using the CRM design system.

---

## 🎨 Theme System Snippets

### Complete globals.css (Copy entire file)

```css
/* SEE /styles/globals.css in CRM project for full content */
/* This is your foundation - copy all ~600 lines exactly */
```

---

## 🧩 Layout Snippets

### App.tsx - Complete Base Structure

```typescript
import { useState, useEffect } from 'react';
import { GlobalHeader } from './components/GlobalHeader';
import { Sidebar } from './components/Sidebar';
import { YourModuleApp } from './components/YourModuleApp';

type ModuleType = 'module1' | 'module2' | 'module3'; // Customize this

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('module1');
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

### Sidebar menuItems - Customization Template

```typescript
// CUSTOMIZE THIS ARRAY for your application

const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "Home",
    icon: UserIcon,
    subItems: [
      {
        id: "dashboard",
        label: "Dashboard",
        onClick: () => {},
      },
      { id: "sitemap", label: "Sitemap", onClick: () => {} },
    ],
  },
  {
    id: "main-module",
    label: "Your Main Module", // e.g., "HR Management"
    icon: Target, // Choose appropriate icon
    subItems: [
      {
        id: "sub1",
        label: "Sub Module 1", // e.g., "Employees"
        onClick: () => onNavigateToModule("sub1"),
        active: currentModule === "sub1",
      },
      {
        id: "sub2",
        label: "Sub Module 2", // e.g., "Attendance"
        onClick: () => onNavigateToModule("sub2"),
        active: currentModule === "sub2",
      },
      {
        id: "sub3",
        label: "Sub Module 3",
        onClick: () => onNavigateToModule("sub3"),
        active: currentModule === "sub3",
      },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: UsersIcon,
    subItems: [
      {
        id: "all-users",
        label: "All Users",
        onClick: () => {},
      },
      { id: "teams", label: "Teams", onClick: () => {} },
      {
        id: "roles",
        label: "Roles & Permissions",
        onClick: () => {},
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    subItems: [
      {
        id: "general",
        label: "General Settings",
        onClick: () => {},
      },
      {
        id: "integrations",
        label: "Integrations",
        onClick: () => {},
      },
    ],
  },
];
```

---

## 📄 Page Layout Snippets

### Standard Page Structure

```typescript
export function YourPageComponent() {
  return (
    <div className="p-5 md:p-6 bg-white dark:bg-neutral-950 px-[8px] py-[8px]">
      <div className="max-w-[100%] mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5 text-sm text-neutral-600 dark:text-neutral-400">
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span>Module Name</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-900 dark:text-white">Current Page</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-neutral-900 dark:text-white mb-1">
              Page Title
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Page description goes here
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors">
              Secondary Action
            </button>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Primary Action
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div>
          {/* Your content goes here */}
        </div>

      </div>
    </div>
  );
}
```

---

## 📊 Stats Cards Snippet

### 4-Column Stats Grid

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
  {/* Stat Card 1 */}
  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="text-neutral-600 dark:text-neutral-400 text-sm">
        Total Items
      </div>
      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
        <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
    </div>
    <div className="text-2xl text-neutral-900 dark:text-white mb-1">
      1,234
    </div>
    <div className="flex items-center gap-1 text-xs">
      <TrendingUp className="w-3 h-3 text-success-500" />
      <span className="text-success-600 dark:text-success-400">+12.5%</span>
      <span className="text-neutral-500">vs last month</span>
    </div>
  </div>

  {/* Stat Card 2 */}
  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="text-neutral-600 dark:text-neutral-400 text-sm">
        Active
      </div>
      <div className="w-8 h-8 rounded-lg bg-success-100 dark:bg-success-950 flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
      </div>
    </div>
    <div className="text-2xl text-neutral-900 dark:text-white mb-1">
      856
    </div>
    <div className="text-xs text-neutral-500">
      69.3% of total
    </div>
  </div>

  {/* Stat Card 3 */}
  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="text-neutral-600 dark:text-neutral-400 text-sm">
        Pending
      </div>
      <div className="w-8 h-8 rounded-lg bg-warning-100 dark:bg-warning-950 flex items-center justify-center">
        <Clock className="w-4 h-4 text-warning-600 dark:text-warning-400" />
      </div>
    </div>
    <div className="text-2xl text-neutral-900 dark:text-white mb-1">
      234
    </div>
    <div className="text-xs text-neutral-500">
      19.0% of total
    </div>
  </div>

  {/* Stat Card 4 */}
  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="text-neutral-600 dark:text-neutral-400 text-sm">
        Inactive
      </div>
      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <XCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
      </div>
    </div>
    <div className="text-2xl text-neutral-900 dark:text-white mb-1">
      144
    </div>
    <div className="text-xs text-neutral-500">
      11.7% of total
    </div>
  </div>
</div>
```

---

## 🔍 Search & Filters Bar Snippet

```typescript
<div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-5">
  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
    {/* Search Input */}
    <div className="flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-600" />
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-400"
        />
      </div>
    </div>

    {/* Filter Buttons */}
    <div className="flex items-center gap-2">
      <button className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-950 rounded-lg transition-colors flex items-center gap-2">
        <Filter className="w-4 h-4" />
        <span className="text-sm">Filters</span>
      </button>

      {/* View Mode Toggle */}
      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-3 py-2 transition-colors ${
            viewMode === 'grid'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-2 transition-colors ${
            viewMode === 'list'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
          }`}
        >
          <ListIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-3 py-2 transition-colors ${
            viewMode === 'table'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
          }`}
        >
          <Table2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 📋 List View Snippet

```typescript
<div className="space-y-2">
  {items.map((item) => (
    <div
      key={item.id}
      onClick={() => handleItemClick(item.id)}
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        {/* Left Side - Main Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar/Icon */}
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-neutral-900 dark:text-white truncate">
                {item.name}
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400 flex-shrink-0">
                {item.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {item.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {item.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item.id);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMore(item.id);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## 🎴 Grid View Snippet

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map((item) => (
    <div
      key={item.id}
      onClick={() => handleItemClick(item.id)}
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header with Actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
          <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMore(item.id);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Status */}
      <div className="mb-3">
        <h3 className="text-neutral-900 dark:text-white mb-1 truncate">
          {item.name}
        </h3>
        <span className="px-2 py-1 text-xs rounded-full bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400">
          {item.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{item.email}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{item.phone}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Created {formatDate(item.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.daysAgo} days ago
          </span>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## 📊 Table View Snippet

```typescript
<div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <tr>
          <th className="px-4 py-3 text-left">
            <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-700" />
          </th>
          <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Name
          </th>
          <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Status
          </th>
          <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Contact
          </th>
          <th className="px-4 py-3 text-left text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Date
          </th>
          <th className="px-4 py-3 text-right text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {items.map((item) => (
          <tr
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className="hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
          >
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" className="rounded border-neutral-300 dark:border-neutral-700" />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm text-neutral-900 dark:text-white">
                  {item.name}
                </span>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="px-2 py-1 text-xs rounded-full bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-400">
                {item.status}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex flex-col gap-1">
                <span>{item.email}</span>
                <span>{item.phone}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
              {formatDate(item.createdAt)}
            </td>
            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-end gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        Showing 1-10 of 100 items
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">
          Previous
        </button>
        <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">
          1
        </button>
        <button className="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">
          2
        </button>
        <button className="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">
          3
        </button>
        <button className="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">
          Next
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 📝 Form Drawer Snippet (Add/Edit)

```typescript
{showFormDrawer && (
  <div className="fixed inset-0 z-50 flex">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setShowFormDrawer(false)}
    />

    {/* Drawer */}
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-neutral-950 shadow-xl flex flex-col">
      {/* Header - Sticky */}
      <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-neutral-900 dark:text-white mb-1">
              Add New Item
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Fill in the information below
            </p>
          </div>
          <button
            onClick={() => setShowFormDrawer(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Form Field */}
          <div>
            <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              Full Name <span className="text-error-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              Email <span className="text-error-600">*</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Select Field */}
          <div>
            <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              Status
            </label>
            <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
          </div>

          {/* Textarea Field */}
          <div>
            <label className="block text-sm text-neutral-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Enter description..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Footer - Sticky */}
      <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowFormDrawer(false)}
            className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            Save Item
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## 🗑️ Delete Confirmation Modal Snippet

```typescript
{showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setShowDeleteModal(false)}
    />

    {/* Modal */}
    <div className="relative bg-white dark:bg-neutral-950 rounded-lg shadow-xl max-w-md w-full p-6">
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-error-100 dark:bg-error-950 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6 text-error-600 dark:text-error-400" />
      </div>

      {/* Title */}
      <h3 className="text-center text-neutral-900 dark:text-white mb-2">
        Delete Item?
      </h3>

      {/* Description */}
      <p className="text-center text-neutral-600 dark:text-neutral-400 mb-6">
        This action cannot be undone. This will permanently delete the item and remove all associated data.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 📑 Tabs Snippet

```typescript
<div>
  {/* Tab Navigation */}
  <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6">
    <div className="flex gap-6">
      <button
        onClick={() => setActiveTab('tab1')}
        className={`pb-3 border-b-2 transition-colors ${
          activeTab === 'tab1'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        Tab 1
      </button>
      <button
        onClick={() => setActiveTab('tab2')}
        className={`pb-3 border-b-2 transition-colors ${
          activeTab === 'tab2'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        Tab 2
      </button>
      <button
        onClick={() => setActiveTab('tab3')}
        className={`pb-3 border-b-2 transition-colors ${
          activeTab === 'tab3'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        Tab 3
      </button>
    </div>
  </div>

  {/* Tab Content */}
  <div>
    {activeTab === 'tab1' && (
      <div>
        {/* Tab 1 content */}
      </div>
    )}
    {activeTab === 'tab2' && (
      <div>
        {/* Tab 2 content */}
      </div>
    )}
    {activeTab === 'tab3' && (
      <div>
        {/* Tab 3 content */}
      </div>
    )}
  </div>
</div>
```

---

## 🔔 Empty State Snippet

```typescript
<div className="flex flex-col items-center justify-center py-16 text-center">
  {/* Icon */}
  <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
    <Package className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
  </div>

  {/* Title */}
  <h3 className="text-neutral-900 dark:text-white mb-2">
    No Items Found
  </h3>

  {/* Description */}
  <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
    Get started by creating your first item. You can add multiple items and manage them all in one place.
  </p>

  {/* Action Button */}
  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2">
    <Plus className="w-4 h-4" />
    Add New Item
  </button>
</div>
```

---

## ⏳ Loading Spinner Snippet

```typescript
<div className="flex items-center justify-center py-16">
  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
</div>
```

---

## 💀 Skeleton Loader Snippet

```typescript
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6" />
</div>
```

---

## 🎯 Helper Functions Snippet

```typescript
// Date Formatting
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Currency Formatting
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Status Color Helper
export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-950";
    case "pending":
      return "text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-950";
    case "inactive":
      return "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900";
    case "error":
      return "text-error-600 dark:text-error-400 bg-error-100 dark:bg-error-950";
    default:
      return "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900";
  }
};

// Truncate Text
export const truncateText = (
  text: string,
  maxLength: number,
) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Get Initials
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
```

---

**✅ All snippets are production-ready and follow the CRM design system exactly!**

Copy and paste these into your new Figma Make project and customize the data/labels as needed.