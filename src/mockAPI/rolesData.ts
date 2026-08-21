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
  // 1. Dashboard
  {
    id: "dashboard",
    name: "Dashboard",
    actions: [
      { id: "view", name: "View Dashboard", code: "dashboard_view" },
    ],
  },
  // 2. Masters
  {
    id: "masters",
    name: "HSS (UK) Setup",
    actions: [
      { id: "view",   name: "View / List",             code: "masters_view" },
      { id: "add",    name: "Add",                     code: "masters_add" },
      { id: "edit",   name: "Edit",                    code: "masters_edit" },
      { id: "delete", name: "Delete",                  code: "masters_delete" },
      { id: "status", name: "Active / Inactive",       code: "masters_status" },
    ],
  },
  // 3. Members Management
  {
    id: "members",
    name: "Members Management",
    actions: [
      { id: "view",             name: "View / List",                         code: "members_view" },
      { id: "add",              name: "Add Member",                          code: "members_add" },
      { id: "edit",             name: "Edit Member",                         code: "members_edit" },
      { id: "delete",           name: "Delete Member",                       code: "members_delete" },
      { id: "approve",          name: "Approve / Reject Registrations",      code: "members_approve" },
      { id: "approve_guardian", name: "Approve / Reject Guardian Approval",  code: "members_approve_guardian" },
      { id: "export",           name: "Export CSV",                          code: "members_export" },
    ],
  },
  // 4. Karyakrams (Events Management)
  {
    id: "events",
    name: "Karyakrams",
    actions: [
      { id: "view",    name: "View / List",            code: "events_view" },
      { id: "add",     name: "Create Karyakram",           code: "events_add" },
      { id: "edit",    name: "Edit Karyakram",             code: "events_edit" },
      { id: "delete",  name: "Delete Karyakram",           code: "events_delete" },
      { id: "cancel",  name: "Cancel Karyakram",           code: "events_cancel" },
      { id: "export",  name: "Export CSV",             code: "events_export" },
    ],
  },
  // 5. Suchana (Announcements)
  {
    id: "announcements",
    name: "Suchana",
    actions: [
      { id: "view",   name: "View / List",             code: "announcements_view" },
      { id: "add",    name: "Create Suchana",          code: "announcements_add" },
      { id: "edit",   name: "Edit Suchana",            code: "announcements_edit" },
      { id: "delete", name: "Delete Suchana",          code: "announcements_delete" },
    ],
  },
  // 6. Attendance
  {
    id: "attendance",
    name: "Attendance",
    actions: [
      { id: "view",     name: "View / List",           code: "attendance_view" },
      { id: "view_log", name: "View Attendance Log",   code: "attendance_view_log" },
      { id: "add",      name: "Mark Attendance",       code: "attendance_add" },
      { id: "edit",     name: "Edit / Unmark",         code: "attendance_edit" },
      { id: "delete",   name: "Delete Shakha",         code: "attendance_delete" },
    ],
  },
  // 7. Utsav Cash Income (Guru Purnima, etc.)
  {
    id: "utsav-income",
    name: "Utsav Cash Income",
    actions: [
      { id: "view",   name: "View / List",       code: "utsav_income_view" },
      { id: "add",    name: "Record Cash Income", code: "utsav_income_add" },
      { id: "export", name: "Export CSV",        code: "utsav_income_export" },
    ],
  },
  // 8. Donation Collection (Karyakram — per-attendee, not Utsav Cash Income)
  {
    id: "karyakram-donations",
    name: "Donation Collection",
    actions: [
      { id: "view",   name: "View / List",      code: "karyakram_donations_view" },
      { id: "add",    name: "Record Donation",   code: "karyakram_donations_add" },
      { id: "export", name: "Export CSV",       code: "karyakram_donations_export" },
    ],
  },
  // 9. Reports
  {
    id: "reports",
    name: "Reports",
    actions: [
      { id: "members_view",      name: "View Members Report",                code: "reports_members_view" },
      { id: "members_export",    name: "Export Members Report",              code: "reports_members_export" },
      { id: "events_view",       name: "View Karyakram Report",              code: "reports_events_view" },
      { id: "events_export",     name: "Export Karyakram Report",            code: "reports_events_export" },
      { id: "attendance_view",   name: "View Attendance Report",             code: "reports_attendance_view" },
      { id: "attendance_export", name: "Export Attendance Report",           code: "reports_attendance_export" },
      { id: "donations_view",    name: "View Nidhi Report",                  code: "reports_donations_view" },
      { id: "donations_export",  name: "Export Nidhi Report",                code: "reports_donations_export" },
      { id: "refunds_view",      name: "View Refunds Report",                code: "reports_refunds_view" },
      { id: "refunds_export",    name: "Export Refunds Report",              code: "reports_refunds_export" },
      { id: "karyakarta_view",   name: "View Karyakarta Report",             code: "reports_karyakarta_view" },
      { id: "ayu_shreni_view",   name: "View Ayu Shreni Directory",          code: "reports_ayu_shreni_view" },
      { id: "ayu_shreni_export", name: "Export Ayu Shreni Directory",        code: "reports_ayu_shreni_export" },
      { id: "myhss_role_view",   name: "View MyHSS Role Report",             code: "reports_myhss_role_view" },
      { id: "myhss_role_export", name: "Export MyHSS Role Report",           code: "reports_myhss_role_export" },
      { id: "shakha_directory_view",   name: "View Shakha Directory",        code: "reports_shakha_directory_view" },
      { id: "shakha_directory_export", name: "Export Shakha Directory",      code: "reports_shakha_directory_export" },
      { id: "karyakarta_directory_view",   name: "View Karyakarta Directory",   code: "reports_karyakarta_directory_view" },
      { id: "karyakarta_directory_export", name: "Export Karyakarta Directory", code: "reports_karyakarta_directory_export" },
    ],
  },
  // 10. Roles & Permissions (under Settings in nav)
  {
    id: "rbac",
    name: "Roles & Permissions (RBAC)",
    actions: [
      { id: "view",   name: "View Roles",              code: "rbac_view" },
      { id: "edit",   name: "Edit Permissions",        code: "rbac_edit" },
      { id: "add",    name: "Create / Edit Role",      code: "rbac_add" },
      { id: "delete", name: "Active / De-active Role", code: "rbac_delete" },
    ],
  },
  // 11. Settings
  {
    id: "settings",
    name: "Settings",
    actions: [
      { id: "view",   name: "View Settings",           code: "settings_view" },
      { id: "edit",   name: "Edit Settings",           code: "settings_edit" },
    ],
  },
  // 12. Audit Logging
  {
    id: "audit-logs",
    name: "Audit Logging",
    actions: [
      { id: "view",   name: "View Audit Logs",         code: "audit_view" },
    ],
  },
  // 13. My Donations (member-facing)
  {
    id: "my-donations",
    name: "My Donations",
    actions: [
      { id: "view", name: "View My Donations", code: "my_donations_view" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// ROLES — 10 Member Personas from PDF
// ─────────────────────────────────────────────────────────────
export const mockRoles: Role[] = [

  // 1. Super Admin ─ full access to everything (only role with Settings, RBAC, Audit Logging)
  {
    id: "1",
    name: "Super Admin",
    code: "super_admin",
    description: "Full system access. Only role with Settings, RBAC, Masters CRUD, and Audit Logging.",
    status: "active",
    userCount: 2,
    lastUpdated: "2025-01-10T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      masters:       ["view", "add", "edit", "delete", "status"],
      members:       ["view", "add", "edit", "delete", "approve", "approve_guardian", "export"],
      events:        ["view", "add", "edit", "delete", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view", "view_log", "add", "edit", "delete"],
      "utsav-income": ["view", "add", "export"],
      reports:       ["members_view", "members_export", "events_view", "events_export", "attendance_view", "attendance_export", "donations_view", "donations_export", "refunds_view", "refunds_export", "karyakarta_view", "ayu_shreni_view", "ayu_shreni_export", "myhss_role_view", "myhss_role_export", "shakha_directory_view", "shakha_directory_export", "karyakarta_directory_view", "karyakarta_directory_export"],
      rbac:          ["view", "edit", "add", "delete"],
      settings:      ["view", "edit"],
      "audit-logs":  ["view"],
    },
  },

  // 2. National Head ─ sees national + all levels below (regions, towns, centres)
  //    No Settings, No RBAC, No Audit Logging
  //    Attendance: log view only (not session setup or mark/unmark)
  {
    id: "2",
    name: "Kendriya Admin",
    code: "national_head",
    description: "National-level admin. Views all regions, towns and centres data. No CRUD on members.",
    status: "active",
    userCount: 1,
    lastUpdated: "2025-01-12T09:00:00Z",
    permissions: {
      dashboard:     ["view"],
      masters:       ["view"],
      members:       ["view", "approve", "approve_guardian", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view", "view_log"],
      "utsav-income": ["view", "add", "export"],
      reports:       ["members_view", "members_export", "events_view", "events_export", "attendance_view", "attendance_export", "donations_view", "donations_export", "refunds_view", "refunds_export", "karyakarta_view", "ayu_shreni_view", "ayu_shreni_export", "myhss_role_view", "myhss_role_export", "shakha_directory_view", "shakha_directory_export", "karyakarta_directory_view", "karyakarta_directory_export"],
    },
  },

  // 3. Regional Head ─ sees own region + towns + centres below
  //    No Settings, No RBAC, No Audit Logging
  //    Attendance: full (session setup + mark/unmark + log)
  {
    id: "3",
    name: "Vibhag Admin",
    code: "regional_head",
    description: "Regional-level admin. Views own region data and all towns/centres within it. No CRUD on members.",
    status: "active",
    userCount: 5,
    lastUpdated: "2025-01-14T11:00:00Z",
    permissions: {
      dashboard:     ["view"],
      masters:       ["view", "add"],
      members:       ["view", "approve", "approve_guardian", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view", "view_log", "add", "edit", "delete"],
      "utsav-income": ["view", "add", "export"],
      reports:       ["members_view", "members_export", "events_view", "events_export", "attendance_view", "attendance_export", "donations_view", "donations_export", "refunds_view", "refunds_export", "karyakarta_view", "ayu_shreni_view", "ayu_shreni_export", "myhss_role_view", "myhss_role_export", "shakha_directory_view", "shakha_directory_export", "karyakarta_directory_view", "karyakarta_directory_export"],
    },
  },

  // 4. Town Head ─ sees own town + centres below
  //    No Settings, No RBAC, No Audit Logging
  //    Attendance: full
  {
    id: "4",
    name: "Nagar Admin",
    code: "town_head",
    description: "Town-level admin. Views own town data and all activity centres within it. No CRUD on members.",
    status: "active",
    userCount: 12,
    lastUpdated: "2025-01-15T14:00:00Z",
    permissions: {
      dashboard:     ["view"],
      masters:       ["view"],
      members:       ["view", "approve", "approve_guardian", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view", "view_log", "add", "edit", "delete"],
      "utsav-income": ["view", "add", "export"],
      reports:       ["members_view", "members_export", "events_view", "events_export", "attendance_view", "attendance_export", "donations_view", "donations_export", "refunds_view", "refunds_export", "karyakarta_view", "ayu_shreni_view", "ayu_shreni_export", "myhss_role_view", "myhss_role_export", "shakha_directory_view", "shakha_directory_export", "karyakarta_directory_view", "karyakarta_directory_export"],
    },
  },

  // 5. Activity Centre Admin ─ sees own centre data only
  //    No Masters, No Settings, No RBAC, No Audit Logging
  //    Attendance: full
  {
    id: "5",
    name: "Shakha Admin",
    code: "activity_centre_admin",
    description: "Manages their own activity centre. Views Role Types only in Masters. No CRUD on members.",
    status: "active",
    userCount: 28,
    lastUpdated: "2025-01-16T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "approve", "approve_guardian", "export"],
      events:        ["view", "add", "edit", "cancel", "export"],
      announcements: ["view", "add", "edit", "delete"],
      attendance:    ["view", "view_log", "add", "edit", "delete"],
      "utsav-income": ["view", "add", "export"],
      reports:       ["members_view", "members_export", "events_view", "events_export", "attendance_view", "attendance_export", "donations_view", "donations_export", "refunds_view", "refunds_export", "karyakarta_view", "ayu_shreni_view", "ayu_shreni_export", "myhss_role_view", "myhss_role_export", "shakha_directory_view", "shakha_directory_export", "karyakarta_directory_view", "karyakarta_directory_export"],
    },
  },

  // 6. Karyakram Admin ─ full Karyakram CRUD, view members listing only
  //    No Masters, No Attendance, No Reports, No Settings, No RBAC
  {
    id: "6",
    name: "Karyakram Admin",
    code: "event_admin",
    description: "Creates and manages Karyakrams (full CRUD). View-only access to member listings.",
    status: "active",
    userCount: 8,
    lastUpdated: "2025-01-17T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view"],
      events:        ["view", "add", "edit", "delete", "cancel", "export"],
      announcements: ["view"],
      "karyakram-donations": ["view", "add", "export"],
    },
  },

  // 7. Reporting User ─ view + export all reports, view member/event listings
  //    No Masters, No Attendance, No Settings, No RBAC
  {
    id: "7",
    name: "Reporting User",
    code: "reporting_user",
    description: "Read-only access to member and Karyakram listings. Can view and export all reports.",
    status: "active",
    userCount: 4,
    lastUpdated: "2025-01-18T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view", "export"],
      events:        ["view", "export"],
      announcements: ["view"],
      "utsav-income": ["view", "export"],
      reports:       ["members_view", "members_export", "events_view", "events_export", "attendance_view", "attendance_export", "donations_view", "donations_export", "refunds_view", "refunds_export", "karyakarta_view", "ayu_shreni_view", "ayu_shreni_export", "myhss_role_view", "myhss_role_export", "shakha_directory_view", "shakha_directory_export", "karyakarta_directory_view", "karyakarta_directory_export"],
    },
  },

  // 8. Ops User ─ attendance full CRUD, view events only
  //    No Members Management, No Masters, No Reports, No Settings, No RBAC
  {
    id: "8",
    name: "Shakha Operations",
    code: "ops_user",
    description: "Operational staff. Full attendance management (Shakha + mark/unmark + log). View-only Karyakrams.",
    status: "active",
    userCount: 15,
    lastUpdated: "2025-01-19T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      events:        ["view"],
      announcements: ["view"],
      attendance:    ["view", "view_log", "add", "edit", "delete"],
    },
  },

  // 9. Member (18+) ─ view events + announcements, mark/unmark own attendance
  //    No Members Management, No Masters, No Reports, No Settings, No RBAC
  {
    id: "9",
    name: "Adult Member",
    code: "member_adult",
    description: "Adult member portal. Can view Karyakrams and announcements, and mark/unmark own attendance.",
    status: "active",
    userCount: 320,
    lastUpdated: "2025-01-20T10:00:00Z",
    permissions: {
      dashboard:        ["view"],
      events:           ["view"],
      announcements:    ["view"],
      attendance:       ["add", "edit"],
      'my-donations':   ["view"],
    },
  },

  // 10. Teen (13–17) ─ same as Member (18+) but guardian consent required
  {
    id: "10",
    name: "Teen Member",
    code: "member_teen",
    description: "Teen member portal (13–17). Same access as adult member. Guardian consent required for attendance.",
    status: "active",
    userCount: 85,
    lastUpdated: "2025-01-20T10:00:00Z",
    permissions: {
      dashboard:        ["view"],
      events:           ["view"],
      announcements:    ["view"],
      attendance:       ["add", "edit"],
      'my-donations':   ["view"],
    },
  },

  // 11. Karyakram Coordinator ─ assigned per-event, cannot create Karyakrams
  //    Can only view/edit the specific Karyakram(s) they've been made coordinator
  //    on (see EventManagement.tsx's isCoordinator-based list filter). No Masters,
  //    No Attendance, No Reports, No Settings, No RBAC.
  {
    id: "11",
    name: "Karyakram Coordinator",
    code: "event_coordinator",
    description: "Assigned by a Karyakram Admin to help manage one or more specific Karyakrams. Cannot create new Karyakrams or manage unrelated ones.",
    status: "active",
    userCount: 0,
    lastUpdated: "2026-08-14T10:00:00Z",
    permissions: {
      dashboard:     ["view"],
      members:       ["view"],
      events:        ["view", "edit"],
      announcements: ["view"],
      "karyakram-donations": ["view", "add", "export"],
    },
  },
];

// Flat list of role names for use in dropdowns
export const ADMIN_ROLE_OPTIONS: string[] = mockRoles
  .filter(r => r.status === 'active')
  .map(r => r.name);

// Friendlier labels for a couple of roles shown in member-facing UI
export const ROLE_DISPLAY_LABELS: Record<string, string> = {
  'Kendriya Admin':    'Kendriya Admin',
  'Vibhag Admin':      'Vibhag Admin',
  'Nagar Admin':       'Nagar Admin',
  'Shakha Admin':      'Shakha Admin',
  'Shakha Operations': 'Shakha Operations',
  'Adult Member':      'Member',
  'Teen Member':       'Teen Member',
};

// Maps role permission keys → sidebar nav group IDs
const PERMISSION_TO_NAV_IDS: Record<string, string[]> = {
  dashboard:     ['dashboard'],
  members:       ['members-management-group'],
  events:        ['event-management'],
  announcements: ['announcements'],
  attendance:    ['attendance-group'],
  "utsav-income": ['utsav-income'],
  "karyakram-donations": ['karyakram-donations'],
  reports:       ['reports-group'],
  masters:       ['masters-group'],
  rbac:          ['role-management'],
  settings:      ['settings-group'],
  'audit-logs':  ['audit-logging'],
  'my-donations': ['my-donations'],
};

/**
 * Returns the set of top-level nav group IDs visible for a given role name.
 * A module is visible if the role has at least one permission action for it.
 */
export function getPermittedNavIds(roleName: string): Set<string> {
  const role = mockRoles.find(r => r.name === roleName);
  if (!role) return new Set(Object.values(PERMISSION_TO_NAV_IDS).flat()); // fallback: show all

  const permitted = new Set<string>();
  for (const [key, actions] of Object.entries(role.permissions)) {
    if (actions.length > 0) {
      const navIds = PERMISSION_TO_NAV_IDS[key] ?? [];
      navIds.forEach(id => permitted.add(id));
    }
  }
  return permitted;
}
