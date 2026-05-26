# 🚀 Avatar Policy - Quick Reference Card

**Last Updated:** January 6, 2026

---

## ✅ **WHERE AVATARS ARE ALLOWED**

```
✅ UserManagement.tsx      → User Master (Identity Module)
✅ GlobalHeader.tsx        → Logged-in user dropdown
✅ User Profile Pages      → Account settings (future)
```

---

## ❌ **WHERE AVATARS ARE PROHIBITED**

```
❌ SampleDesign.tsx                    → Use <User /> icon
❌ RolePermissionManagement.tsx        → Use <Shield /> icon  
❌ EmployeeDetail.tsx                  → Text-based only
❌ ALL other modules                   → Use relevant icons
❌ ALL templates                       → Icon placeholders
```

---

## 🎨 **What to Use Instead**

### **Icon Placeholder (Preferred)**
```tsx
<div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
</div>
```

### **Initials Circle (Alternative)**
```tsx
<div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium text-sm">
  {name.split(' ').map(n => n[0]).join('')}
</div>
```

---

## 🔍 **Quick Verification**

### **Check 1: Interface**
```tsx
// ❌ BAD
interface Employee {
  avatar?: string; // ← REMOVE THIS (unless User Master)
}

// ✅ GOOD
interface Employee {
  // No avatar field
}
```

### **Check 2: Mock Data**
```tsx
// ❌ BAD
const data = [{
  name: "John",
  avatar: "https://..." // ← REMOVE THIS
}];

// ✅ GOOD
const data = [{
  name: "John",
  // No avatar URL
}];
```

### **Check 3: Rendering**
```tsx
// ❌ BAD
{item.avatar && <img src={item.avatar} />}

// ✅ GOOD
<div className="w-10 h-10 rounded-full bg-primary-100">
  <User className="w-5 h-5" />
</div>
```

---

## 📋 **Checklist Before Merge**

- [ ] No `avatar` field in interface
- [ ] No avatar URLs in mock data
- [ ] No `<img>` tags for avatars
- [ ] Uses icon placeholder instead
- [ ] Not a User Master module

---

## 📚 **Full Documentation**

- **Policy Details:** `/AVATAR_POLICY_GUIDELINE.md`
- **Verification:** `/AVATAR_POLICY_VERIFICATION_REPORT.md`
- **Summary:** `/FINAL_VERIFICATION_SUMMARY.md`

---

## 🚨 **Common Mistakes**

❌ **Don't copy avatar code from UserManagement.tsx**  
✅ **Do use icon placeholders from templates**

❌ **Don't add avatar fields "just in case"**  
✅ **Do follow the established interfaces**

❌ **Don't reuse profile images in other modules**  
✅ **Do use text-based identity (name, code, role)**

---

**Status:** ACTIVE & ENFORCED  
**Exceptions:** User Master only
