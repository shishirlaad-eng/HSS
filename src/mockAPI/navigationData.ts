import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  Megaphone,
  ClipboardCheck,
  BarChart3,
  Database,
  Settings,
  History,
  ReceiptText,
  BookOpenText,
} from "lucide-react";
import { hasPermission } from "./rolesData";

// Each Reports sub-item has its own view action in the "reports" module (RBAC),
// so it can be shown/hidden per role independently rather than the whole
// Reports section being all-or-nothing. Keys match SubMenuItem.id below.
const REPORT_VIEW_ACTIONS: Record<string, string> = {
  "report-members":               "members_view",
  "report-events":                "events_view",
  "report-donations":             "donations_view",
  "report-attendance":            "attendance_view",
  "report-refunds":               "refunds_view",
  "report-karyakarta":            "karyakarta_view",
  "report-ayu-shreni":            "ayu_shreni_view",
  "report-myhss-role":            "myhss_role_view",
  "report-shakha-directory":      "shakha_directory_view",
  "report-karyakarta-directory":  "karyakarta_directory_view",
};

export interface SubMenuItem {
  id: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: any;
  onClick?: () => void;
  active?: boolean;
  subItems?: SubMenuItem[];
}

// Masters sub-items hidden per role (mirrors SuperAdminMasters tab logic)
const HIDDEN_MASTERS_BY_ROLE: Partial<Record<string, string[]>> = {
  'Vibhag Admin':  ['country', 'region', 'configurable-lists'],
  'Nagar Admin':    ['country', 'region', 'town'],
  'Shakha Admin':   ['country', 'region', 'town', 'centre'],
};

export const getNavigationData = (
  currentPage: string = "dashboard",
  onNavigate: (pageId: string) => void = () => {},
  selectedRole: string = "Super Admin",
): MenuItem[] => {
  const hiddenMasters = new Set<string>(HIDDEN_MASTERS_BY_ROLE[selectedRole] ?? []);
  const isMemberRole = ['Adult Member', 'Teen Member'].includes(selectedRole);

  if (isMemberRole) {
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        onClick: () => onNavigate("dashboard"),
        active: currentPage === "dashboard",
      },
      {
        id: "attendance-group",
        label: "Shakha",
        icon: ClipboardCheck,
        onClick: () => onNavigate("attendance-log"),
        active: currentPage === "attendance-log",
      },
      {
        id: "announcements",
        label: "Suchana",
        icon: Megaphone,
        onClick: () => onNavigate("announcements"),
        active: currentPage === "announcements",
      },
      {
        id: "event-management",
        label: "Karyakrams",
        icon: Calendar,
        onClick: () => onNavigate("event-management"),
        active: currentPage === "event-management",
      },
      {
        id: "my-donations",
        label: "My Dakshina",
        icon: ReceiptText,
        onClick: () => onNavigate("my-donations"),
        active: currentPage === "my-donations",
      },
    ];
  }

  const reportSubItems: SubMenuItem[] = [
    { id: "report-members",              label: "Members Report",       onClick: () => onNavigate("report-members"),              active: currentPage === "report-members" },
    { id: "report-events",               label: "Karyakram Report",     onClick: () => onNavigate("report-events"),               active: currentPage === "report-events" },
    { id: "report-donations",            label: "Nidhi Report",         onClick: () => onNavigate("report-donations"),            active: currentPage === "report-donations" },
    { id: "report-attendance",           label: "Sankhya Report",       onClick: () => onNavigate("report-attendance"),           active: currentPage === "report-attendance" },
    { id: "report-refunds",              label: "Refund Report",        onClick: () => onNavigate("report-refunds"),              active: currentPage === "report-refunds" },
    { id: "report-karyakarta",           label: "Karyakarta Report",    onClick: () => onNavigate("report-karyakarta"),           active: currentPage === "report-karyakarta" },
    { id: "report-myhss-role",           label: "MyHSS Role Report",    onClick: () => onNavigate("report-myhss-role"),           active: currentPage === "report-myhss-role" },
  ].filter(item => hasPermission(selectedRole, "reports", REPORT_VIEW_ACTIONS[item.id]));

  const directorySubItems: SubMenuItem[] = [
    { id: "report-shakha-directory",     label: "Shakha Directory",     onClick: () => onNavigate("report-shakha-directory"),     active: currentPage === "report-shakha-directory" },
    { id: "report-karyakarta-directory", label: "Karyakarta Directory", onClick: () => onNavigate("report-karyakarta-directory"), active: currentPage === "report-karyakarta-directory" },
    { id: "report-ayu-shreni",           label: "Ayu Shreni Directory", onClick: () => onNavigate("report-ayu-shreni"),           active: currentPage === "report-ayu-shreni" },
  ].filter(item => hasPermission(selectedRole, "reports", REPORT_VIEW_ACTIONS[item.id]));

  return [

    // ── 1. Dashboard ─────────────────────────────────────────────
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      onClick: () => onNavigate("dashboard"),
      active: currentPage === "dashboard",
    },

    // ── 2. HSS (UK) Setup ────────────────────────────────────────
    ...(['Super Admin', 'Vibhag Admin'].includes(selectedRole) ? [{
      id: "masters-group",
      label: "HSS (UK) Setup",
      icon: Database,
      onClick: () => {
        const TAB_ORDER = ['country', 'region', 'town', 'centre'];
        const first = TAB_ORDER.find(t => !hiddenMasters.has(t)) ?? 'country';
        onNavigate(first);
      },
      active: ['country', 'region', 'town', 'centre', 'configurable-lists'].includes(currentPage),
    }] : []),

    // ── 3. Members Management ────────────────────────────────────
    {
      id: "members-management-group",
      label: "Members",
      icon: UserCheck,
      active: ['members', 'emergency-details', 'pending-approvals', 'pending-guardian-approvals', 'non-member-accounts'].includes(currentPage),
      subItems: [
        {
          id: "members",
          label: "All Members",
          onClick: () => onNavigate("members"),
          active: currentPage === "members",
        },
        {
          id: "emergency-details",
          label: "Emergency Details",
          onClick: () => onNavigate("emergency-details"),
          active: currentPage === "emergency-details",
        },
        ...(hasPermission(selectedRole, "non-member-accounts", "view") ? [{
          id: "non-member-accounts",
          label: "Non-Member Accounts",
          onClick: () => onNavigate("non-member-accounts"),
          active: currentPage === "non-member-accounts",
        }] : []),
        ...(hasPermission(selectedRole, "pending-approvals", "view") ? [{
          id: "pending-approvals",
          label: "Pending Karyawaha Approvals",
          onClick: () => onNavigate("pending-approvals"),
          active: currentPage === "pending-approvals",
        }] : []),
        ...(hasPermission(selectedRole, "pending-guardian-approvals", "view") ? [{
          id: "pending-guardian-approvals",
          label: "Pending Parent/Guardian Approvals",
          onClick: () => onNavigate("pending-guardian-approvals"),
          active: currentPage === "pending-guardian-approvals",
        }] : []),
      ],
    },

    // ── 4. Karyakrams ────────────────────────────────────────────
    {
      id: "event-management",
      label: "Karyakrams",
      icon: Calendar,
      onClick: () => onNavigate("event-management"),
      active: currentPage === "event-management",
    },

    // ── 5. Suchana (Announcements) ───────────────────────────────
    {
      id: "announcements",
      label: "Suchana",
      icon: Megaphone,
      onClick: () => onNavigate("announcements"),
      active: currentPage === "announcements",
    },

    // ── 6. Attendance ──────────────────────────────────
    ...(['Adult Member', 'Teen Member'].includes(selectedRole) ? [{
      id: "attendance-group",
      label: "My Attendance",
      icon: ClipboardCheck,
      onClick: () => onNavigate("attendance-log"),
      active: currentPage === "attendance-log",
    }] : [{
      id: "attendance-group",
      label: "Shakha",
      icon: ClipboardCheck,
      active: ['sessions', 'karyakartas', 'compliance', 'first-aid-incidents', 'guru-puja-report', 'shakha-dakshina'].includes(currentPage),
      subItems: [
        {
          id: "sessions",
          label: "Sankhya",
          onClick: () => onNavigate("sessions"),
          active: currentPage === "sessions",
        },
        ...(hasPermission(selectedRole, "karyakartas", "view") ? [{
          id: "karyakartas",
          label: "Responsibilities & Roles",
          onClick: () => onNavigate("karyakartas"),
          active: currentPage === "karyakartas",
        }] : []),
        ...(hasPermission(selectedRole, "compliance", "view") ? [{
          id: "compliance",
          label: "Compliance",
          onClick: () => onNavigate("compliance"),
          active: currentPage === "compliance",
        }] : []),
        ...(hasPermission(selectedRole, "first-aid-incidents", "view") ? [{
          id: "first-aid-incidents",
          label: "First Aid Incidents",
          onClick: () => onNavigate("first-aid-incidents"),
          active: currentPage === "first-aid-incidents",
        }] : []),
        ...(hasPermission(selectedRole, "guru-puja-report", "view") ? [{
          id: "guru-puja-report",
          label: "Guru Puja Report",
          onClick: () => onNavigate("guru-puja-report"),
          active: currentPage === "guru-puja-report",
        }] : []),
        ...(hasPermission(selectedRole, "shakha-dakshina", "view") ? [{
          id: "shakha-dakshina",
          label: "Shakha Dakshina",
          onClick: () => onNavigate("shakha-dakshina"),
          active: currentPage === "shakha-dakshina",
        }] : []),
      ],
    }]),

    // ── 7. Reports ─────────────────────────────────────────────── each
    // report is gated by its own "reports" module action (see reportSubItems
    // above), so the group itself only appears when at least one report is
    // permitted for this role — never as an empty, unclickable dropdown.
    ...(reportSubItems.length > 0 ? [{
      id: "reports-group",
      label: "Reports",
      icon: BarChart3,
      subItems: reportSubItems,
    }] : []),

    // ── 7b. Directory ──────────────────────────────────────────── directory
    // listings (Shakha, Karyakarta, Ayu Shreni), split out from Reports so
    // they read as reference lookups rather than generated reports.
    ...(directorySubItems.length > 0 ? [{
      id: "directory-group",
      label: "Directory",
      icon: BookOpenText,
      subItems: directorySubItems,
    }] : []),

    // ── 8. Settings ──────────────────────────────────────────────
    {
      id: "settings-group",
      label: "Settings",
      icon: Settings,
      subItems: [
        {
          id: "system-settings",
          label: "System Settings",
          onClick: () => onNavigate("system-settings"),
          active: currentPage === "system-settings",
        },
        {
          id: "static-pages",
          label: "Static Pages",
          onClick: () => onNavigate("static-pages"),
          active: currentPage === "static-pages",
        },
        {
          id: "email-templates",
          label: "Email Templates",
          onClick: () => onNavigate("email-templates"),
          active: currentPage === "email-templates",
        },
        {
          id: "role-management",
          label: "Roles & Permissions",
          onClick: () => onNavigate("role-management"),
          active: currentPage === "role-management",
        },
      ],
    },

    // ── 10. Audit Logging ────────────────────────────────────────
    {
      id: "audit-logging",
      label: "Audit Logging",
      icon: History,
      onClick: () => onNavigate("logs"),
      active: currentPage === "logs",
    },

  ];
};
