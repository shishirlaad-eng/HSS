# ❌ Profile Picture / Avatar Usage Policy

## 🎯 **MANDATORY DESIGN SYSTEM RULE**

**Profile pictures / avatars are PROHIBITED in all modules except User Master / User Profile.**

---

## 📋 **Global Policy**

### ✅ **ALLOWED:**
- **User Master Module** (`/src/app/components/UserManagement.tsx`)
- **User Profile Pages** (profile settings, account management)
- **Global Header** (logged-in user avatar in navigation)

### ❌ **PROHIBITED:**
- Employee Management
- Department Management  
- Location Management
- Training Management
- Room Booking
- Asset Management
- Project Management
- Task Management
- Inventory Management
- Vendor Management
- Customer Management
- **ALL OTHER MODULES**

---

## 🚫 **Reason for Restriction**

1. **Identity Clarity** - Profile pictures are reserved exclusively for user account identification
2. **Consistent UX** - Prevents avatar overload across the system
3. **Performance** - Reduces image loading overhead
4. **Data Privacy** - Limits storage and transmission of personal images
5. **Visual Hierarchy** - Maintains clean, text-focused interface

---

## 🎨 **Approved Alternative Representations**

Instead of profile pictures, use:

### **1. Icon Placeholder (Preferred)**
```tsx
<div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
</div>
```

### **2. Initials Circle (Secondary)**
```tsx
<div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium text-sm">
  {name.split(' ').map(n => n[0]).join('')}
</div>
```

### **3. Text-Only Representation (Minimalist)**
```tsx
<div>
  <div className="text-sm font-medium text-neutral-900 dark:text-white">
    {name}
  </div>
  <div className="text-xs text-neutral-500 dark:text-neutral-400">
    {role}
  </div>
</div>
```

---

## 📁 **Files Updated to Remove Avatars**

### **✅ Completed:**
- `/src/app/components/SampleDesign.tsx` - Employee Management (removed all avatar images)
- `/src/app/components/EmployeeDetail.tsx` - Employee detail view (no avatars - uses text-based identity)
- `/src/app/components/RolePermissionManagement.tsx` - Role management (no avatars)
- `/templates/listing/TEMPLATE_Listing.tsx` - Template file (updated comments to reflect policy)
- `/templates/listing/EXAMPLE_AdvancedFiltering.tsx` - Example template (updated)

### **🔒 Preserved (User Master Only):**
- `/src/app/components/UserManagement.tsx` - **KEEP** avatars (this is User Master)
- `/src/app/components/GlobalHeader.tsx` - **KEEP** user dropdown avatar

---

## 🛠️ **Implementation Guide**

### **For New Modules:**

When creating a new module, follow this structure:

```tsx
// ❌ DO NOT DO THIS:
interface Employee {
  id: string;
  name: string;
  avatar?: string; // ❌ REMOVE THIS
}

// ✅ DO THIS INSTEAD:
interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  // No avatar field
}

// ❌ DO NOT RENDER AVATARS:
{employee.avatar ? (
  <img src={employee.avatar} />
) : (
  <div>Placeholder</div>
)}

// ✅ USE ICON PLACEHOLDERS:
<div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
</div>
```

---

## 📊 **Visual Comparison**

### **BEFORE (Incorrect - Multiple Modules with Avatars):**
```
┌─────────────────────────────────┐
│ Employee Management             │
├─────────────────────────────────┤
│ 🟡 Sarah Johnson                │  ❌ Has avatar
│ 🟢 Michael Chen                 │  ❌ Has avatar
│ 🔴 Emily Rodriguez              │  ❌ Has avatar
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Department Management           │
├─────────────────────────────────┤
│ 🟡 Engineering Dept             │  ❌ Has avatar
│ 🟢 Marketing Dept               │  ❌ Has avatar
└─────────────────────────────────┘
```

### **AFTER (Correct - Avatars Only in User Master):**
```
┌─────────────────────────────────┐
│ Employee Management             │
├─────────────────────────────────┤
│ 👤 Sarah Johnson                │  ✅ Icon placeholder
│ 👤 Michael Chen                 │  ✅ Icon placeholder
│ 👤 Emily Rodriguez              │  ✅ Icon placeholder
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Department Management           │
├─────────────────────────────────┤
│ 🏢 Engineering Dept             │  ✅ Icon placeholder
│ 🏢 Marketing Dept               │  ✅ Icon placeholder
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ USER MASTER (Allowed)           │
├─────────────────────────────────┤
│ 🟡 sarah@company.com            │  ✅ Avatar allowed
│ 🟢 michael@company.com          │  ✅ Avatar allowed
└─────────────────────────────────┘
```

---

## 🔍 **Code Review Checklist**

Before merging any new component:

- [ ] Does the interface have an `avatar` field? → **REMOVE IT** (unless User Master)
- [ ] Does mock data include avatar URLs? → **REMOVE THEM** (unless User Master)
- [ ] Does the component render `<img>` tags for avatars? → **REPLACE WITH ICON** (unless User Master)
- [ ] Does the component import avatar images? → **REMOVE IMPORTS** (unless User Master)
- [ ] Is this component part of User Master/Profile? → **Only then allow avatars**

---

## 🚀 **Enforcement**

This policy is **MANDATORY** and applies to:

✅ All new modules created  
✅ All existing modules (must be updated)  
✅ All template files  
✅ All documentation examples  
✅ All future projects using this design system

**Exception Process:**  
If a module genuinely requires profile pictures, it must be approved by the design system team and documented as an exception in this file.

---

## 📝 **Summary**

| Module Type | Avatar Allowed | Alternative |
|------------|---------------|-------------|
| **User Master** | ✅ YES | - |
| **User Profile** | ✅ YES | - |
| **Global Header** | ✅ YES (logged-in user) | - |
| **Employee Management** | ❌ NO | Icon / Initials |
| **Department Management** | ❌ NO | Icon / Initials |
| **ALL Other Modules** | ❌ NO | Icon / Initials |

---

**Last Updated:** January 6, 2026  
**Policy Version:** 1.0  
**Status:** ACTIVE & ENFORCED