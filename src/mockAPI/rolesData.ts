// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Roles & Permissions
// Source: Roles & Metrics PDF (Member Personas)
// ─────────────────────────────────────────────────────────────

export interface ActionPermission {
  id: string;
  name: string;
  code: string;
}

export interface ModulePermission {
  id: string;
  name: string;
  actions: ActionPermission[];
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
  userCount: number;
  lastUpdated: string;
  permissions: Record<string, string[]>; // moduleId → actionIds[]
}

// ─────────────────────────────────────────────────────────────
// MODULE LIST — aligned with left navigation structure
// ─────────────────────────────────────────────────────────────
export const availableModules: ModulePermission[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    actions: [
      { id: "view", name: "View Dashboard", code: "dashboard_view" },
    ],
  },
  {
    id: "members",
    name: "Members Management",
    actions: [
      { id: "view",    name: "View / List",           code: "members_view" },
      { id: "add",     name: "Add Member",             code: "members_add" },
      { id: "edit",    name: "Edit Member",            code: "members_edit" },
      { id: "delete",  name: "Delete Member",          code: "members_delete" },
      { id: "approve", name: "Approve / Reject",       code: "members_approve" },
      { id: "export",  name: "Export CSV",             code: "members_export" },
    ],
  },
  {
    id: "events",
    name: "Events Management",
    actions: [
      { id: "view",    name: "View / List",            code: "events_view" },
      { id: "add",     name: "Create Event",           code: "events_add" },
      { id: "edit",    name: "Edit Event",             code: "events_edit" },
      { id: "delete",  name: "Delete Event",           code: "events_delete" },
      { id: "cancel",  name: "Cancel Event",           code: "events_cancel" },
      { id: "export",  name: "Export CSV",             code: "events_export" },
    ],
  },
  {
    id: "announcements",
    name: "Announcements",
    actions: [
      { id: "view",   name: "View / List",             code: "announcements_view" },
      { id: "add",    name: "Create Announcement",     code: "announcements_add" },
      { id: "edit",   name: "Edit Announcement",       code: "announcements_edit" },
      { id: "delete", name: "Delete Announcement",     code: "announcements_delete" },
    ],
  },
  {
    id: "attendance",
    name: "Attendance",
    actions: [
      { id: "view",   name: "View / List",             code: "attendance_view" },
      { id: "add",    name: "Mark Attendance",         code: "attendance_add" },
      { id: "edit",   name: "Edit / Unmark",           code: "attendance_edit" },
      { id: "delete", name: "Delete Session",          code: "attendance_delete" },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    actions: [
      { id: "view",   name: "View Reports",            code: "reports_view" },
      { id: "export", name: "Export CSV",              code: "reports_export" },
    ],
  },
  {
    id: "masters",
    name: "Masters",
    actions: [
      { id: "view",   name: "View / List",             code: "masters_view" },
      { id: "add",    name: "Add",                     code: "masters_add" },
      { id: "edit",   name: "Edit",                    code: "masters_edit" },
      { id: "delete", name: "Delete",                  code: "masters_delete" },
      { id: "status", name: "Active / Inactive",       code: "masters_status" },
    ],
  },
  {
    id: "users",
    name: "User Management",
    actions: [
      { id: "view",   name: "View / List",             code: "users_view" },
      { id: "add",    name: "Add User",                code: "users_add" },
      { id: "edit",   name: "Edit User",               code: "users_edit" },
      { id: "delete", name: "Delete User",             code: "users_delete" },
      { id: "status", name: "Active / Inactive",       code: "users_status" },
    ],
  },
  {
    id: "rbac",
    name: "Roles & Permissions (RBAC)",
    actions: [
      { id: "view",   name: "View Roles",              code: "rbac_view" },
      { id: "edit",   name: "Edit Permissions",        code: "rbac_edit" },
      { id: "add",    name: "Create Role",             code: "rbac_add" },
      { id: "delete", name: "Delete Role",             code: "rbac_delete" },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    actions: [
      { id: "view",   name: "View Settings",           code: "settings_view" },
      { id: "edit",   name: "Edit Settings",           code: "settings_edit" },
    ],
  },
  {
    id: "audit-logs",
    name: "Audit Logging",
    actions: [
      { id: "view",   name: "View Audit Logs",         code: "audit_view" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// ROLES — 10 Member Personas from PDF
// ─────────────────────────────────────────────────────────────
export const mockRoles: Role[] = [

  // 1. Super Admin ─ full access
  {
    id: "1",
    name: "Super Admin",
    code: "super_admin",
    description: "Full system access. Only persona with Settings, Masters CRUD, and Audit Logging.",
    status: "active",
    userCount: 2,
    lastUpdated: "2025-01-10T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "add", "edit", "delete", "approve", "export"],
      events:        ["view", "add", "edit", "delete", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view", "add", "edit", "delete"],
      reports:       ["view", "export"],
      masters:       ["view", "add", "edit", "delete", "status"],
      users:         ["view", "add", "edit", "delete", "status"],
      rbac:          ["view", "edit", "add", "delete"],
      settings:      ["view", "edit"],
      "audit-logs":  ["view"],
    },
  },

  // 2. National Head ─ broad access, view-only on Masters, no Settings/Audit
  {
    id: "2",
    name: "National Head",
    code: "national_head",
    description: "National-level admin. Can manage members and events. View-only access to Masters.",
    status: "active",
    userCount: 1,
    lastUpdated: "2025-01-12T09:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "add", "edit", "approve", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view"],
      reports:       ["view", "export"],
      masters:       ["view"],
      users:         ["view"],
      rbac:          ["view", "edit"],
    },
  },

  // 3. Regional Head ─ regional scope, view-only on Masters
  {
    id: "3",
    name: "Regional Head",
    code: "regional_head",
    description: "Regional-level admin. Manages members and events within their region.",
    status: "active",
    userCount: 5,
    lastUpdated: "2025-01-14T11:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "add", "edit", "approve", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view"],
      reports:       ["view", "export"],
      masters:       ["view"],
      users:         ["view"],
      rbac:          ["view", "edit"],
    },
  },

  // 4. Town Head ─ town scope, view-only on Masters
  {
    id: "4",
    name: "Town Head",
    code: "town_head",
    description: "Town-level admin. Manages members and events within their town.",
    status: "active",
    userCount: 12,
    lastUpdated: "2025-01-15T14:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "add", "edit", "approve", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view"],
      reports:       ["view", "export"],
      masters:       ["view"],
      rbac:          ["view", "edit"],
    },
  },

  // 5. Activity Centre Admin ─ centre scope, attendance CRUD, events CRU
  {
    id: "5",
    name: "Activity Centre Admin",
    code: "activity_centre_admin",
    description: "Manages their activity centre: members, attendance, and events (before event date).",
    status: "active",
    userCount: 28,
    lastUpdated: "2025-01-16T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "add", "edit", "approve", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view", "add", "edit", "delete"],
      reports:       ["view", "export"],
      masters:       ["view"],
      rbac:          ["view", "edit", "add", "delete"],
    },
  },

  // 6. Event Admin ─ event CRUD only (before event date), view members
  {
    id: "6",
    name: "Event Admin",
    code: "event_admin",
    description: "Creates and manages events (CRUD before event date). View-only for members.",
    status: "active",
    userCount: 8,
    lastUpdated: "2025-01-17T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view"],
      events:        ["view", "add", "edit", "delete", "cancel", "export"],
      announcements: ["view"],
      attendance:    [],
      reports:       [],
    },
  },

  // 7. Reporting User ─ view + export reports and member/event listings
  {
    id: "7",
    name: "Reporting User",
    code: "reporting_user",
    description: "Read-only access to member listings and event data. Can export reports.",
    status: "active",
    userCount: 4,
    lastUpdated: "2025-01-18T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "export"],
      events:        ["view", "export"],
      announcements: ["view"],
      attendance:    [],
      reports:       ["view", "export"],
    },
  },

  // 8. Ops User ─ attendance CRUD, view events/members
  {
    id: "8",
    name: "Ops User",
    code: "ops_user",
    description: "Operational staff. Manages attendance (Shakha sessions). View access to members and events.",
    status: "active",
    userCount: 15,
    lastUpdated: "2025-01-19T10:00:00Z",
    permissions: {
      dashboard:     [],
      members:       ["view"],
      events:        ["view", "edit"],
      announcements: ["view"],
      attendance:    ["view", "add", "edit", "delete"],
    },
  },

  // 9. Member (18+) ─ public-facing portal: view events/announcements, own profile
  {
    id: "9",
    name: "Member (18+)",
    code: "member_adult",
    description: "Adult member portal access. Can view events and announcements, manage own profile.",
    status: "active",
    userCount: 320,
    lastUpdated: "2025-01-20T10:00:00Z",
    permissions: {
      dashboard:     [],
      members:       [],
      events:        ["view", "edit"],  // edit = register/update own participation
      announcements: ["view"],
      attendance:    [],
    },
  },

  // 10. Teen (13–17) ─ same as Member (18+) but age-gated
  {
    id: "10",
    name: "Teen (13–17)",
    code: "member_teen",
    description: "Teen member portal access (13–17). Same scope as adult member; guardian consent required.",
    status: "active",
    userCount: 85,
    lastUpdated: "2025-01-20T10:00:00Z",
    permissions: {
      dashboard:     [],
      members:       [],
      events:        ["view", "edit"],
      announcements: ["view"],
      attendance:    [],
    },
  },
];
