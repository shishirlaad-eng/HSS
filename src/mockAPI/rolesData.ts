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
  category?: string;
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
// MODULE LIST — aligned with left navigation structure and all sub-menus
// ─────────────────────────────────────────────────────────────
export const availableModules: ModulePermission[] = [
  // ── 1. Dashboard ─────────────────────────────────────────────
  {
    id: "dashboard",
    name: "Dashboard",
    category: "Dashboard",
    actions: [
      { id: "view", name: "View Dashboard", code: "dashboard_view" },
    ],
  },

  // ── 2. HSS (UK) Setup ────────────────────────────────────────
  {
    id: "masters",
    name: "HSS (UK) Setup",
    category: "HSS (UK) Setup",
    actions: [
      { id: "view",   name: "View / List",             code: "masters_view" },
      { id: "add",    name: "Add",                     code: "masters_add" },
      { id: "edit",   name: "Edit",                    code: "masters_edit" },
      { id: "delete", name: "Delete",                  code: "masters_delete" },
      { id: "status", name: "Active / Inactive",       code: "masters_status" },
    ],
  },

  // ── 3. Members ───────────────────────────────────────────────
  {
    id: "members",
    name: "All Members",
    category: "Members",
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
  {
    id: "emergency-details",
    name: "Emergency Details",
    category: "Members",
    actions: [
      { id: "view", name: "View / List", code: "emergency_details_view" },
    ],
  },
  {
    id: "non-member-accounts",
    name: "Non-Member Accounts",
    category: "Members",
    actions: [
      { id: "view", name: "View / List", code: "non_member_accounts_view" },
    ],
  },
  {
    id: "pending-approvals",
    name: "Pending Karyawaha Approvals",
    category: "Members",
    actions: [
      { id: "view",    name: "View / List", code: "pending_approvals_view" },
      { id: "approve", name: "Approve",     code: "pending_approvals_approve" },
      { id: "reject",  name: "Reject",      code: "pending_approvals_reject" },
    ],
  },
  {
    id: "pending-guardian-approvals",
    name: "Pending Parent/Guardian Approvals",
    category: "Members",
    actions: [
      { id: "view",    name: "View / List", code: "pending_guardian_approvals_view" },
      { id: "approve", name: "Approve",     code: "pending_guardian_approvals_approve" },
      { id: "reject",  name: "Reject",      code: "pending_guardian_approvals_reject" },
    ],
  },

  // ── 4. Karyakrams ────────────────────────────────────────────
  {
    id: "events",
    name: "Karyakrams",
    category: "Karyakrams",
    actions: [
      { id: "view",    name: "View / List",            code: "events_view" },
      { id: "add",     name: "Create Karyakram",       code: "events_add" },
      { id: "edit",    name: "Edit Karyakram",         code: "events_edit" },
      { id: "delete",  name: "Delete Karyakram",       code: "events_delete" },
      { id: "cancel",  name: "Cancel Karyakram",       code: "events_cancel" },
      { id: "export",  name: "Export CSV",             code: "events_export" },
    ],
  },

  // ── 5. Suchana ───────────────────────────────────────────────
  {
    id: "announcements",
    name: "Suchana",
    category: "Suchana",
    actions: [
      { id: "view",   name: "View / List",             code: "announcements_view" },
      { id: "add",    name: "Create Suchana",          code: "announcements_add" },
      { id: "edit",   name: "Edit Suchana",            code: "announcements_edit" },
      { id: "delete", name: "Delete Suchana",          code: "announcements_delete" },
    ],
  },

  // ── 6. Shakha ────────────────────────────────────────────────
  {
    id: "attendance",
    name: "Sankhya",
    category: "Shakha",
    actions: [
      { id: "view",     name: "View / List",           code: "attendance_view" },
      { id: "view_log", name: "View Attendance Log",   code: "attendance_view_log" },
      { id: "add",      name: "Mark Attendance",       code: "attendance_add" },
      { id: "edit",     name: "Edit / Unmark",         code: "attendance_edit" },
      { id: "delete",   name: "Delete Shakha",         code: "attendance_delete" },
    ],
  },
  {
    id: "karyakartas",
    name: "Responsibilities & Roles",
    category: "Shakha",
    actions: [
      { id: "view",   name: "View / List",            code: "karyakartas_view" },
      { id: "assign", name: "Assign Responsibility",  code: "karyakartas_assign" },
    ],
  },
  {
    id: "compliance",
    name: "Compliance",
    category: "Shakha",
    actions: [
      { id: "view", name: "View / List", code: "compliance_view" },
    ],
  },
  {
    id: "first-aid-incidents",
    name: "First Aid Incidents",
    category: "Shakha",
    actions: [
      { id: "view", name: "View / List",       code: "first_aid_incidents_view" },
      { id: "add",  name: "Record Incident",   code: "first_aid_incidents_add" },
      { id: "edit", name: "Edit Incident",     code: "first_aid_incidents_edit" },
    ],
  },
  {
    id: "guru-puja-report",
    name: "Guru Puja Report",
    category: "Shakha",
    actions: [
      { id: "view",   name: "View / List", code: "guru_puja_report_view" },
      { id: "export", name: "Export CSV",  code: "guru_puja_report_export" },
    ],
  },
  {
    id: "shakha-dakshina",
    name: "Shakha Dakshina",
    category: "Shakha",
    actions: [
      { id: "view",   name: "View / List", code: "shakha_dakshina_view" },
      { id: "export", name: "Export CSV",  code: "shakha_dakshina_export" },
    ],
  },

  // ── 7. Dakshina ──────────────────────────────────────────────
  {
    id: "my-donations",
    name: "My Dakshina",
    category: "Dakshina",
    actions: [
      { id: "view", name: "View My Donations", code: "my_donations_view" },
    ],
  },

  // ── 8. Reports ───────────────────────────────────────────────
  {
    id: "report-members",
    name: "Members Report",
    category: "Reports",
    actions: [
      { id: "view",   name: "View Report",   code: "reports_members_view" },
      { id: "export", name: "Export CSV",    code: "reports_members_export" },
    ],
  },
  {
    id: "report-events",
    name: "Karyakram Report",
    category: "Reports",
    actions: [
      { id: "view",   name: "View Report",   code: "reports_events_view" },
      { id: "export", name: "Export CSV",    code: "reports_events_export" },
    ],
  },
  {
    id: "report-donations",
    name: "Nidhi Report",
    category: "Reports",
    actions: [
      { id: "view",   name: "View Report",   code: "reports_donations_view" },
      { id: "export", name: "Export CSV",    code: "reports_donations_export" },
    ],
  },
  {
    id: "report-attendance",
    name: "Sankhya Report",
    category: "Reports",
    actions: [
      { id: "view",   name: "View Report",   code: "reports_attendance_view" },
      { id: "export", name: "Export CSV",    code: "reports_attendance_export" },
    ],
  },
  {
    id: "report-refunds",
    name: "Refund Report",
    category: "Reports",
    actions: [
      { id: "view",   name: "View Report",   code: "reports_refunds_view" },
      { id: "export", name: "Export CSV",    code: "reports_refunds_export" },
    ],
  },
  {
    id: "report-karyakarta",
    name: "Karyakarta Report",
    category: "Reports",
    actions: [
      { id: "view", name: "View Report", code: "reports_karyakarta_view" },
    ],
  },
  {
    id: "report-myhss-role",
    name: "MyHSS Role Report",
    category: "Reports",
    actions: [
      { id: "view",   name: "View Report",   code: "reports_myhss_role_view" },
      { id: "export", name: "Export CSV",    code: "reports_myhss_role_export" },
    ],
  },

  // ── 9. Directory ─────────────────────────────────────────────
  {
    id: "report-shakha-directory",
    name: "Shakha Directory",
    category: "Directory",
    actions: [
      { id: "view",   name: "View Directory",   code: "reports_shakha_directory_view" },
      { id: "export", name: "Export CSV",       code: "reports_shakha_directory_export" },
    ],
  },
  {
    id: "report-karyakarta-directory",
    name: "Karyakarta Directory",
    category: "Directory",
    actions: [
      { id: "view",   name: "View Directory",   code: "reports_karyakarta_directory_view" },
      { id: "export", name: "Export CSV",       code: "reports_karyakarta_directory_export" },
    ],
  },
  {
    id: "report-ayu-shreni",
    name: "Ayu Shreni Directory",
    category: "Directory",
    actions: [
      { id: "view",   name: "View Directory",   code: "reports_ayu_shreni_view" },
      { id: "export", name: "Export CSV",       code: "reports_ayu_shreni_export" },
    ],
  },

  // ── 10. Settings ─────────────────────────────────────────────
  {
    id: "settings",
    name: "System Settings",
    category: "Settings",
    actions: [
      { id: "view",   name: "View Settings",           code: "settings_view" },
      { id: "edit",   name: "Edit Settings",           code: "settings_edit" },
    ],
  },
  {
    id: "static-pages",
    name: "Static Pages",
    category: "Settings",
    actions: [
      { id: "view",   name: "View Static Pages",       code: "static_pages_view" },
      { id: "edit",   name: "Edit Static Pages",       code: "static_pages_edit" },
    ],
  },
  {
    id: "email-templates",
    name: "Email Templates",
    category: "Settings",
    actions: [
      { id: "view",   name: "View Email Templates",    code: "email_templates_view" },
      { id: "edit",   name: "Edit Email Templates",    code: "email_templates_edit" },
    ],
  },
  {
    id: "rbac",
    name: "Roles & Permissions",
    category: "Settings",
    actions: [
      { id: "view",   name: "View Roles",              code: "rbac_view" },
      { id: "edit",   name: "Edit Permissions",        code: "rbac_edit" },
      { id: "add",    name: "Create / Edit Role",      code: "rbac_add" },
      { id: "delete", name: "Active / De-active Role", code: "rbac_delete" },
    ],
  },

  // ── 11. Audit Logging ────────────────────────────────────────
  {
    id: "audit-logs",
    name: "Audit Logging",
    category: "Audit Logging",
    actions: [
      { id: "login_view", name: "View Login Logs", code: "audit_login_view" },
      { id: "audit_view", name: "View Audit Logs",  code: "audit_audit_view" },
      { id: "email_view", name: "View Email Logs",  code: "audit_email_view" },
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
      "pending-approvals":          ["view", "approve", "reject"],
      "pending-guardian-approvals": ["view", "approve", "reject"],
      "guru-puja-report":           ["view", "export"],
      "first-aid-incidents":        ["view", "add", "edit"],
      compliance:    ["view"],
      karyakartas:   ["view", "assign"],
      "shakha-dakshina": ["view", "export"],
      "non-member-accounts": ["view"],
      reports:       ["members_view", "members_export", "events_view", "events_export", "attendance_view", "attendance_export", "donations_view", "donations_export", "refunds_view", "refunds_export", "karyakarta_view", "ayu_shreni_view", "ayu_shreni_export", "myhss_role_view", "myhss_role_export", "shakha_directory_view", "shakha_directory_export", "karyakarta_directory_view", "karyakarta_directory_export"],
      rbac:          ["view", "edit", "add", "delete"],
      settings:      ["view", "edit"],
      "audit-logs":  ["login_view", "audit_view", "email_view"],
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
      "pending-approvals":   ["view", "approve", "reject"],
      "guru-puja-report":    ["view", "export"],
      "first-aid-incidents": ["view", "add", "edit"],
      compliance:    ["view"],
      karyakartas:   ["view"],
      "shakha-dakshina": ["view", "export"],
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
      "pending-approvals":   ["view", "approve", "reject"],
      "guru-puja-report":    ["view", "export"],
      "first-aid-incidents": ["view", "add", "edit"],
      compliance:    ["view"],
      karyakartas:   ["view"],
      "shakha-dakshina": ["view", "export"],
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
      "pending-approvals":   ["view", "approve", "reject"],
      "guru-puja-report":    ["view", "export"],
      "first-aid-incidents": ["view", "add", "edit"],
      compliance:    ["view"],
      karyakartas:   ["view"],
      "shakha-dakshina": ["view", "export"],
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
      "pending-approvals":          ["view", "approve", "reject"],
      "pending-guardian-approvals": ["view", "approve", "reject"],
      "guru-puja-report":           ["view", "export"],
      "first-aid-incidents":        ["view", "add", "edit"],
      compliance:    ["view"],
      karyakartas:   ["view", "assign"],
      "shakha-dakshina": ["view", "export"],
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
      "guru-puja-report": ["view", "export"],
      compliance:    ["view"],
      karyakartas:   ["view"],
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
  masters:       ['masters-group'],
  members:       ['members-management-group'],
  'emergency-details': ['members-management-group'],
  'non-member-accounts': ['members-management-group'],
  'pending-approvals': ['members-management-group'],
  'pending-guardian-approvals': ['members-management-group'],
  events:        ['event-management'],
  announcements: ['announcements'],
  attendance:    ['attendance-group'],
  karyakartas:   ['attendance-group'],
  compliance:    ['attendance-group'],
  'first-aid-incidents': ['attendance-group'],
  'guru-puja-report': ['attendance-group'],
  'shakha-dakshina': ['attendance-group'],
  'my-donations': ['my-donations'],
  reports:       ['reports-group', 'directory-group'],
  'report-members': ['reports-group'],
  'report-events': ['reports-group'],
  'report-donations': ['reports-group'],
  'report-attendance': ['reports-group'],
  'report-refunds': ['reports-group'],
  'report-karyakarta': ['reports-group'],
  'report-myhss-role': ['reports-group'],
  'report-shakha-directory': ['directory-group'],
  'report-karyakarta-directory': ['directory-group'],
  'report-ayu-shreni': ['directory-group'],
  settings:      ['settings-group'],
  'static-pages': ['settings-group'],
  'email-templates': ['settings-group'],
  rbac:          ['role-management'],
  'audit-logs':  ['audit-logging'],
};

export const REPORT_ACTION_MAP: Record<string, { view: string; export?: string }> = {
  'report-members':              { view: 'members_view', export: 'members_export' },
  'report-events':               { view: 'events_view', export: 'events_export' },
  'report-donations':            { view: 'donations_view', export: 'donations_export' },
  'report-attendance':           { view: 'attendance_view', export: 'attendance_export' },
  'report-refunds':              { view: 'refunds_view', export: 'refunds_export' },
  'report-karyakarta':           { view: 'karyakarta_view' },
  'report-myhss-role':           { view: 'myhss_role_view', export: 'myhss_role_export' },
  'report-shakha-directory':     { view: 'shakha_directory_view', export: 'shakha_directory_export' },
  'report-karyakarta-directory': { view: 'karyakarta_directory_view', export: 'karyakarta_directory_export' },
  'report-ayu-shreni':           { view: 'ayu_shreni_view', export: 'ayu_shreni_export' },
};

/**
 * Resolves permissions for any module, seamlessly bridging sub-modules
 * (e.g. report-members, emergency-details, static-pages) with role permissions.
 */
export function getRoleModulePermissions(role: Role, moduleId: string): string[] {
  if (role.permissions?.[moduleId]?.length) {
    return role.permissions[moduleId];
  }
  // 1. Check reports sub-modules
  const rMap = REPORT_ACTION_MAP[moduleId];
  if (rMap) {
    const list: string[] = [];
    const repPerms = role.permissions?.['reports'] ?? [];
    if (repPerms.includes(rMap.view)) list.push('view');
    if (rMap.export && repPerms.includes(rMap.export)) list.push('export');
    return list;
  }
  // 2. Emergency details fallback to members view
  if (moduleId === 'emergency-details') {
    return (role.permissions?.['members'] ?? []).includes('view') ? ['view'] : [];
  }
  // 3. Static pages fallback to settings
  if (moduleId === 'static-pages') {
    const s = role.permissions?.['settings'] ?? [];
    const list: string[] = [];
    if (s.includes('view')) list.push('view');
    if (s.includes('edit')) list.push('edit');
    return list;
  }
  // 4. Email templates fallback to settings
  if (moduleId === 'email-templates') {
    const s = role.permissions?.['settings'] ?? [];
    const list: string[] = [];
    if (s.includes('view')) list.push('view');
    if (s.includes('edit')) list.push('edit');
    return list;
  }
  return role.permissions?.[moduleId] ?? [];
}

/**
 * Returns the set of top-level nav group IDs visible for a given role name.
 * A module is visible if the role has at least one permission action for it.
 */
export function hasPermission(roleName: string, moduleId: string, actionId: string): boolean {
  const role = mockRoles.find(r => r.name === roleName);
  if (!role) return false;
  if ((role?.permissions?.[moduleId] ?? []).includes(actionId)) return true;
  const mapped = getRoleModulePermissions(role, moduleId);
  if (mapped.includes(actionId)) return true;
  // Fallback for checking parent "reports" module with specific actionId
  if (moduleId === 'reports') {
    for (const [subId, map] of Object.entries(REPORT_ACTION_MAP)) {
      if (actionId === map.view && (role.permissions?.[subId] ?? []).includes('view')) return true;
      if (map.export && actionId === map.export && (role.permissions?.[subId] ?? []).includes('export')) return true;
    }
  }
  return false;
}

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
