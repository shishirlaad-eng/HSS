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

export const getNavigationData = (
  currentPage: string = "dashboard",
  onNavigate: (pageId: string) => void = () => {},
): MenuItem[] => {
  return [

    // ── 1. Dashboard ─────────────────────────────────────────────
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      onClick: () => onNavigate("dashboard"),
      active: currentPage === "dashboard",
    },

    // ── 2. Masters ───────────────────────────────────────────────
    {
      id: "masters-group",
      label: "Masters",
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
          label: "Regions",
          onClick: () => onNavigate("region"),
          active: currentPage === "region",
        },
        {
          id: "town",
          label: "Towns",
          onClick: () => onNavigate("town"),
          active: currentPage === "town",
        },
        {
          id: "centre",
          label: "Activity Centres",
          onClick: () => onNavigate("centre"),
          active: currentPage === "centre",
        },
        {
          id: "role-types",
          label: "Responsibility",
          onClick: () => onNavigate("role-types"),
          active: currentPage === "role-types",
        },
      ],
    },

    // ── 3. Members Management ────────────────────────────────────
    {
      id: "members-management-group",
      label: "Members Management",
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

    // ── 4. Events Management ─────────────────────────────────────
    {
      id: "events-management-group",
      label: "Events Management",
      icon: Calendar,
      subItems: [
        {
          id: "event-management",
          label: "Events",
          onClick: () => onNavigate("event-management"),
          active: currentPage === "event-management",
        },
      ],
    },

    // ── 5. Announcements ─────────────────────────────────────────
    {
      id: "announcements",
      label: "Announcements",
      icon: Megaphone,
      onClick: () => onNavigate("announcements"),
      active: currentPage === "announcements",
    },

    // ── 6. Attendance ────────────────────────────────────────────
    {
      id: "attendance-group",
      label: "Attendance",
      icon: ClipboardCheck,
      subItems: [
        {
          id: "sessions",
          label: "Sessions",
          onClick: () => onNavigate("sessions"),
          active: currentPage === "sessions",
        },
        {
          id: "attendance-log",
          label: "Attendance Log",
          onClick: () => onNavigate("attendance-log"),
          active: currentPage === "attendance-log",
        },
      ],
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
          label: "Donations / Payment Report",
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
