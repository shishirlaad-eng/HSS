# 🔄 Find & Replace Guide for Templates

**Quick guide to convert template files to your specific use case in minutes!**

---

## 🚀 Quick Start Process

### **Step 1: Copy Template Files to New Project**

In your NEW Figma Make project, create these files from templates:

```
/components/
└── /your-module/              ← Create your module folder
    ├── YourListing.tsx        ← Copy from TEMPLATE_Listing.tsx
    └── mockData.ts            ← Copy from TEMPLATE_mockData.ts
```

---

### **Step 2: Rename Files**

| Template File | Rename To (Examples) |
|--------------|---------------------|
| `TEMPLATE_Listing.tsx` | `EmployeeListing.tsx` OR `ProductListing.tsx` OR `InvoiceListing.tsx` |
| `TEMPLATE_mockData.ts` | `mockData.ts` (same for all) |

---

### **Step 3: Find & Replace**

Use your editor's Find & Replace (Ctrl+H or Cmd+H) to replace these terms:

---

## 📝 Example 1: Creating **Employee Management**

### **In EmployeeListing.tsx:**

| Find (Case Sensitive) | Replace With |
|-----------------------|--------------|
| `Item` | `Employee` |
| `item` | `employee` |
| `ITEM` | `EMPLOYEE` |
| `Item Management` | `Employee Management` |
| `items` | `employees` |

**After Find & Replace, you'll have:**
- `mockEmployees` instead of `mockItems`
- `EmployeeListing()` instead of `ItemListing()`
- `getEmployeeById()` instead of `getItemById()`
- All UI text says "Employee" instead of "Item"

---

### **In mockData.ts (Employee):**

**1. Update the Item interface** (lines ~10-30):

```typescript
// BEFORE (Template):
export interface Item {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ItemStatus;
  priority?: ItemPriority;
  createdAt: string;
  updatedAt: string;
}

// AFTER (Employee):
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  priority?: EmployeePriority;
  createdAt: string;
  updatedAt: string;
  
  // Employee-specific fields
  department: string;
  role: string;
  joinDate: string;
  salary: number;
  manager?: string;
}
```

**2. Update mockItems array** (lines ~35-60):

```typescript
// BEFORE (Template):
export const mockItems: Item[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15',
  },
  // ...
];

// AFTER (Employee):
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15',
    
    // Employee fields
    department: 'Engineering',
    role: 'Software Engineer',
    joinDate: '2024-01-15',
    salary: 85000,
    manager: 'Sarah Williams',
  },
  // Add more employees...
];
```

**3. Find & Replace in mockData.ts:**

| Find | Replace With |
|------|--------------|
| `Item` | `Employee` |
| `item` | `employee` |
| `mockItems` | `mockEmployees` |

---

## 📝 Example 2: Creating **Product Catalog**

### **In ProductListing.tsx:**

| Find | Replace With |
|------|--------------|
| `Item` | `Product` |
| `item` | `product` |
| `ITEM` | `PRODUCT` |
| `Item Management` | `Product Catalog` |
| `items` | `products` |

---

### **In mockData.ts (Product):**

**Update interface:**

```typescript
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: ProductStatus; // 'in-stock' | 'low-stock' | 'out-of-stock'
  category: string;
  supplier: string;
  stock: number;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}
```

**Update mock data:**

```typescript
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    sku: 'WM-001',
    price: 29.99,
    status: 'in-stock',
    category: 'Electronics',
    supplier: 'Tech Supplies Inc',
    stock: 150,
    reorderLevel: 20,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15',
  },
  // ...
];
```

**Find & Replace:**

| Find | Replace With |
|------|--------------|
| `Item` | `Product` |
| `mockItems` | `mockProducts` |

---

## 📝 Example 3: Creating **Invoice Management**

### **In InvoiceListing.tsx:**

| Find | Replace With |
|------|--------------|
| `Item` | `Invoice` |
| `item` | `invoice` |
| `Item Management` | `Invoice Management` |
| `items` | `invoices` |

---

### **In mockData.ts (Invoice):**

**Update interface:**

```typescript
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: InvoiceStatus; // 'paid' | 'pending' | 'overdue' | 'cancelled'
  dueDate: string;
  issueDate: string;
  items: number; // number of line items
  createdAt: string;
  updatedAt: string;
}
```

**Update mock data:**

```typescript
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'Acme Corporation',
    amount: 5499.99,
    status: 'paid',
    dueDate: '2024-02-15',
    issueDate: '2024-01-15',
    items: 5,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-15',
  },
  // ...
];
```

---

## 🎯 Custom Field Mapping

After find & replace, update the **LIST VIEW** to show your specific fields:

### **Template (Generic):**
```tsx
<div className="flex items-center gap-4 text-sm">
  <span className="flex items-center gap-1">
    <Mail className="w-3.5 h-3.5" />
    {item.email}
  </span>
  <span className="flex items-center gap-1">
    <Phone className="w-3.5 h-3.5" />
    {item.phone}
  </span>
</div>
```

### **Employee Version:**
```tsx
<div className="flex items-center gap-4 text-sm">
  <span className="flex items-center gap-1">
    <Building2 className="w-3.5 h-3.5" />
    {employee.department}
  </span>
  <span className="flex items-center gap-1">
    <Briefcase className="w-3.5 h-3.5" />
    {employee.role}
  </span>
</div>
```

### **Product Version:**
```tsx
<div className="flex items-center gap-4 text-sm">
  <span className="flex items-center gap-1">
    <Tag className="w-3.5 h-3.5" />
    {product.sku}
  </span>
  <span className="flex items-center gap-1">
    <DollarSign className="w-3.5 h-3.5" />
    {formatCurrency(product.price)}
  </span>
  <span className="flex items-center gap-1">
    <Package className="w-3.5 h-3.5" />
    Stock: {product.stock}
  </span>
</div>
```

### **Invoice Version:**
```tsx
<div className="flex items-center gap-4 text-sm">
  <span className="flex items-center gap-1">
    <FileText className="w-3.5 h-3.5" />
    {invoice.invoiceNumber}
  </span>
  <span className="flex items-center gap-1">
    <DollarSign className="w-3.5 h-3.5" />
    {formatCurrency(invoice.amount)}
  </span>
  <span className="flex items-center gap-1">
    <Calendar className="w-3.5 h-3.5" />
    Due: {formatDate(invoice.dueDate)}
  </span>
</div>
```

---

## 🎨 Update Breadcrumb & Title

**Find this section** (around line 60-80):

```tsx
{/* BEFORE (Template): */}
<div className="flex items-center gap-2 mb-5">
  <span>Home</span>
  <ChevronRight className="w-4 h-4" />
  <span>Management</span>
  <ChevronRight className="w-4 h-4" />
  <span className="text-neutral-900 dark:text-white">Item Management</span>
</div>

<h1>Item Management</h1>
<p>Manage and track all your items in one place</p>
```

**Update to:**

```tsx
{/* Employee: */}
<span>Human Resources</span>
<ChevronRight className="w-4 h-4" />
<span className="text-neutral-900 dark:text-white">Employee Management</span>

<h1>Employee Management</h1>
<p>Manage your organization's employees and their information</p>

{/* Product: */}
<span>Inventory</span>
<ChevronRight className="w-4 h-4" />
<span className="text-neutral-900 dark:text-white">Product Catalog</span>

<h1>Product Catalog</h1>
<p>Manage your product inventory and stock levels</p>

{/* Invoice: */}
<span>Finance</span>
<ChevronRight className="w-4 h-4" />
<span className="text-neutral-900 dark:text-white">Invoice Management</span>

<h1>Invoice Management</h1>
<p>Track and manage all customer invoices</p>
```

---

## 📊 Update Stats Cards Labels

**Find the stats cards section** (around line 120-200) and update labels:

### **Employee Version:**
```tsx
<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  Total Employees
</div>

<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  Active
</div>

<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  On Leave
</div>

<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  Inactive
</div>
```

### **Product Version:**
```tsx
<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  Total Products
</div>

<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  In Stock
</div>

<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  Low Stock
</div>

<div className="text-neutral-600 dark:text-neutral-400 text-sm">
  Out of Stock
</div>
```

---

## ⚡ Quick Checklist

After copying and doing find & replace:

- [ ] Renamed files (TEMPLATE_Listing.tsx → YourListing.tsx)
- [ ] Find & Replace: `Item` → `YourEntity`
- [ ] Find & Replace: `item` → `yourEntity`
- [ ] Find & Replace: `items` → `yourEntities`
- [ ] Updated interface in mockData.ts with your fields
- [ ] Updated mockData array with your sample data
- [ ] Updated breadcrumb navigation text
- [ ] Updated page title and description
- [ ] Updated stats card labels
- [ ] Updated list/grid/table fields to show your data
- [ ] Updated button text ("Add New Item" → "Add New Employee")
- [ ] Tested in browser

---

## 🕐 Time Estimate

- **Copy files:** 2 minutes
- **Find & Replace:** 3 minutes
- **Update mockData interface:** 5 minutes
- **Update mockData sample:** 5 minutes
- **Customize fields in views:** 10 minutes
- **Test and adjust:** 5 minutes

**Total: ~30 minutes** to have a fully working listing page!

---

## 💡 Pro Tips

1. **Use Case-Sensitive Find & Replace** - Ensures `Item` doesn't become `employee` (wrong!)

2. **Do Find & Replace in this order:**
   - First: `Item` → `Employee` (capital)
   - Then: `item` → `employee` (lowercase)
   - Last: `ITEM` → `EMPLOYEE` (uppercase)

3. **Test after each major change** - Run the app to catch errors early

4. **Keep the structure** - Don't remove the 4 views (grid/list/table/kanban), stats cards, or filter bar unless you really don't need them

5. **Add icons as needed** - Import from lucide-react:
   ```tsx
   import { Building2, Briefcase, Tag, Package, FileText } from 'lucide-react';
   ```

---

## 🎯 Result

After following this guide, you'll have:
- ✅ Complete listing page with your entity (Employee/Product/Invoice)
- ✅ Breadcrumb navigation
- ✅ Stats cards
- ✅ Search & filters
- ✅ 4 view modes (grid, list, table, kanban)
- ✅ Actions (add, edit, delete, import, export)
- ✅ Empty state
- ✅ Responsive design
- ✅ Dark mode support

**All in ~30 minutes!** 🚀

---

**Need help?** Refer to the original LeadListing.tsx in the CRM project for more complex examples!
