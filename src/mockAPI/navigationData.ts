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
  'Vibhaag Admin':  ['country', 'region'],
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
        label: "My Sankhya",
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
    {
      id: "masters-group",
      label: "HSS (UK) Setup",
      icon: Database,
      subItems: [
        {
          id: "country",
          label: "Countries",
          onClick: () => onNavigate("country"),
          active: currentPage === "country",
        },
        {
          id: "region",
          label: "Vibhaag",
          onClick: () => onNavigate("region"),
          active: currentPage === "region",
        },
        {
          id: "town",
          label: "Nagar",
          onClick: () => onNavigate("town"),
          active: currentPage === "town",
        },
        {
          id: "centre",
          label: "Shakha",
          onClick: () => onNavigate("centre"),
          active: currentPage === "centre",
        },
        {
          id: "role-types",
          label: "Responsibility",
          onClick: () => onNavigate("role-types"),
          active: currentPage === "role-types",
        },
      ].filter(item => !hiddenMasters.has(item.id)),
    },

    // ── 3. Members Management ────────────────────────────────────
    {
      id: "members-management-group",
      label: "Members",
      icon: UserCheck,
      subItems: [
        {
          id: "members",
          label: "Members",
          onClick: () => onNavigate("members"),
          active: currentPage === "members",
        },
        {
          id: "pending-approvals",
          label: "Pending Approvals",
          onClick: () => onNavigate("pending-approvals"),
          active: currentPage === "pending-approvals",
        },
        {
          id: "pending-guardian-approvals",
          label: "Pending Guardian Approvals",
          onClick: () => onNavigate("pending-guardian-approvals"),
          active: currentPage === "pending-guardian-approvals",
        },
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

    // ── 6. Sankhya (Attendance) ──────────────────────────────────
    ...(['Adult Member', 'Teen Member'].includes(selectedRole) ? [{
      id: "attendance-group",
      label: "My Sankhya",
      icon: ClipboardCheck,
      onClick: () => onNavigate("attendance-log"),
      active: currentPage === "attendance-log",
    }] : [{
      id: "attendance-group",
      label: "Sankhya",
      icon: ClipboardCheck,
      subItems: [
        {
          id: "sessions",
          label: "Shakha",
          onClick: () => onNavigate("sessions"),
          active: currentPage === "sessions",
        },
        {
          id: "attendance-log",
          label: "My Sankhya",
          onClick: () => onNavigate("attendance-log"),
          active: currentPage === "attendance-log",
        },
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
          label: "Events Report",
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
          label: "Sankhya Report",
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
          id: "system-notifications",
          label: "System Notifications",
          onClick: () => onNavigate("system-notifications"),
          active: currentPage === "system-notifications",
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
