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
} from "lucide-react";

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
        label: "My Attendance",
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
      active: ['members', 'karyakartas', 'compliance', 'emergency-details', 'pending-approvals', 'pending-guardian-approvals'].includes(currentPage),
      subItems: [
        {
          id: "members",
          label: "All Members",
          onClick: () => onNavigate("members"),
          active: currentPage === "members",
        },
        {
          id: "karyakartas",
          label: "Responsibilities and Roles",
          onClick: () => onNavigate("karyakartas"),
          active: currentPage === "karyakartas",
        },
        {
          id: "compliance",
          label: "Compliance",
          onClick: () => onNavigate("compliance"),
          active: currentPage === "compliance",
        },
        {
          id: "emergency-details",
          label: "Emergency Details",
          onClick: () => onNavigate("emergency-details"),
          active: currentPage === "emergency-details",
        },
        {
          id: "pending-approvals",
          label: "Pending Karyawaha Approvals",
          onClick: () => onNavigate("pending-approvals"),
          active: currentPage === "pending-approvals",
        },
        ...(['Super Admin', 'Shakha Admin'].includes(selectedRole) ? [{
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
      label: "Attendance",
      icon: ClipboardCheck,
      active: ['sessions', 'first-aid-incidents'].includes(currentPage),
      subItems: [
        {
          id: "sessions",
          label: "Shakha",
          onClick: () => onNavigate("sessions"),
          active: currentPage === "sessions",
        },
        ...(['Shakha Admin', 'Nagar Admin', 'Vibhag Admin', 'Kendriya Admin', 'Super Admin'].includes(selectedRole) ? [{
          id: "first-aid-incidents",
          label: "First Aid Incidents",
          onClick: () => onNavigate("first-aid-incidents"),
          active: currentPage === "first-aid-incidents",
        }] : []),
      ],
    }]),

    // ── 6b. My Donations (member-facing) ─────────────────────────
    {
      id: "my-donations",
      label: "Dakshina",
      icon: ReceiptText,
      onClick: () => onNavigate("my-donations"),
      active: currentPage === "my-donations",
    },

    // ── 7. Reports ───────────────────────────────────────────────
    {
      id: "reports-group",
      label: "Reports",
      icon: BarChart3,
      subItems: [
        {
          id: "report-members",
          label: "Members Report",
          onClick: () => onNavigate("report-members"),
          active: currentPage === "report-members",
        },
        {
          id: "report-events",
          label: "Karyakram Report",
          onClick: () => onNavigate("report-events"),
          active: currentPage === "report-events",
        },
        {
          id: "report-donations",
          label: "Nidhi Report",
          onClick: () => onNavigate("report-donations"),
          active: currentPage === "report-donations",
        },
        {
          id: "report-attendance",
          label: "Attendance Report",
          onClick: () => onNavigate("report-attendance"),
          active: currentPage === "report-attendance",
        },
        {
          id: "report-refunds",
          label: "Refund Report",
          onClick: () => onNavigate("report-refunds"),
          active: currentPage === "report-refunds",
        },
        {
          id: "report-karyakarta",
          label: "Karyakarta Report",
          onClick: () => onNavigate("report-karyakarta"),
          active: currentPage === "report-karyakarta",
        },
        {
          id: "report-ayu-shreni",
          label: "Ayu Shreni Report",
          onClick: () => onNavigate("report-ayu-shreni"),
          active: currentPage === "report-ayu-shreni",
        },
        {
          id: "report-myhss-role",
          label: "MyHSS Role Report",
          onClick: () => onNavigate("report-myhss-role"),
          active: currentPage === "report-myhss-role",
        },
        {
          id: "report-shakha-directory",
          label: "Shakha Directory",
          onClick: () => onNavigate("report-shakha-directory"),
          active: currentPage === "report-shakha-directory",
        },
      ],
    },

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
