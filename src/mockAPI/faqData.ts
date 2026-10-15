// ─────────────────────────────────────────────────────────────
// HSS UK Admin Panel — Support & FAQ Data & State Management
// Aligned strictly with left sidebar menu structure
// ─────────────────────────────────────────────────────────────

export interface ModuleSubmodule {
  id: string; // e.g. "dashboard:dashboard"
  moduleId: string;
  moduleName: string;
  submoduleId: string;
  submoduleName: string;
  pageId: string; // maps to currentPage in App.tsx
}

export interface FAQItem {
  id: string;
  moduleSubmoduleId: string;
  moduleId: string;
  moduleName: string;
  submoduleId: string;
  submoduleName: string;
  question: string;
  answer: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// COMPLETE MODULE & SUBMODULE HIERARCHY
// Considers left side menu only:
// - If no sub-items on left menu: module Name & sub-module Name are identical (e.g. HSS UK Setup -> HSS UK Setup)
// - If left menu has sub-items: sub-modules match left menu items exactly
// ─────────────────────────────────────────────────────────────
export const MODULE_SUBMODULE_LIST: ModuleSubmodule[] = [
  // 1. Dashboard (no sub-items on left menu)
  {
    id: "dashboard:dashboard",
    moduleId: "dashboard",
    moduleName: "Dashboard",
    submoduleId: "dashboard",
    submoduleName: "Dashboard",
    pageId: "dashboard",
  },

  // 2. HSS (UK) Setup (no sub-items on left menu)
  {
    id: "setup:setup",
    moduleId: "masters",
    moduleName: "HSS (UK) Setup",
    submoduleId: "setup",
    submoduleName: "HSS (UK) Setup",
    pageId: "country",
  },

  // 3. Members (has sub-items on left menu)
  {
    id: "members:all-members",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "all-members",
    submoduleName: "All Members",
    pageId: "members",
  },
  {
    id: "members:emergency-details",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "emergency-details",
    submoduleName: "Emergency Details",
    pageId: "emergency-details",
  },
  {
    id: "members:non-member-accounts",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "non-member-accounts",
    submoduleName: "Non-Member Accounts",
    pageId: "non-member-accounts",
  },
  {
    id: "members:pending-approvals",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "pending-approvals",
    submoduleName: "Pending Karyawaha Approvals",
    pageId: "pending-approvals",
  },
  {
    id: "members:guardian-approvals",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "guardian-approvals",
    submoduleName: "Pending Parent/Guardian Approvals",
    pageId: "pending-guardian-approvals",
  },

  // 4. Karyakrams (no sub-items on left menu)
  {
    id: "karyakrams:karyakrams",
    moduleId: "events",
    moduleName: "Karyakrams",
    submoduleId: "karyakrams",
    submoduleName: "Karyakrams",
    pageId: "event-management",
  },

  // 5. Suchana (no sub-items on left menu)
  {
    id: "suchana:suchana",
    moduleId: "announcements",
    moduleName: "Suchana",
    submoduleId: "suchana",
    submoduleName: "Suchana",
    pageId: "announcements",
  },

  // 6. Shakha (has sub-items on left menu)
  {
    id: "shakha:sessions",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "sessions",
    submoduleName: "Sankhya",
    pageId: "sessions",
  },
  {
    id: "shakha:roles",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "roles",
    submoduleName: "Responsibilities & Roles",
    pageId: "karyakartas",
  },
  {
    id: "shakha:compliance",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "compliance",
    submoduleName: "Compliance",
    pageId: "compliance",
  },
  {
    id: "shakha:first-aid",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "first-aid",
    submoduleName: "First Aid Incidents",
    pageId: "first-aid-incidents",
  },
  {
    id: "shakha:guru-puja",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "guru-puja",
    submoduleName: "Guru Puja Report",
    pageId: "guru-puja-report",
  },
  {
    id: "shakha:shakha-dakshina",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "shakha-dakshina",
    submoduleName: "Shakha Dakshina",
    pageId: "shakha-dakshina",
  },

  // 7. Reports (has sub-items on left menu)
  {
    id: "reports:members",
    moduleId: "reports",
    moduleName: "Reports",
    submoduleId: "members-report",
    submoduleName: "Members Report",
    pageId: "report-members",
  },
  {
    id: "reports:events",
    moduleId: "reports",
    moduleName: "Reports",
    submoduleId: "events-report",
    submoduleName: "Karyakram Report",
    pageId: "report-events",
  },
  {
    id: "reports:donations",
    moduleId: "reports",
    moduleName: "Reports",
    submoduleId: "donations-report",
    submoduleName: "Nidhi Report",
    pageId: "report-donations",
  },
  {
    id: "reports:attendance",
    moduleId: "reports",
    moduleName: "Reports",
    submoduleId: "attendance-report",
    submoduleName: "Sankhya Report",
    pageId: "report-attendance",
  },
  {
    id: "reports:refunds",
    moduleId: "reports",
    moduleName: "Reports",
    submoduleId: "refunds-report",
    submoduleName: "Refund Report",
    pageId: "report-refunds",
  },
  {
    id: "reports:karyakarta",
    moduleId: "reports",
    moduleName: "Reports",
    submoduleId: "karyakarta-report",
    submoduleName: "Karyakarta Report",
    pageId: "report-karyakarta",
  },
  {
    id: "reports:myhss-role",
    moduleId: "reports",
    moduleName: "Reports",
    submoduleId: "myhss-role-report",
    submoduleName: "MyHSS Role Report",
    pageId: "report-myhss-role",
  },

  // 8. Directory (has sub-items on left menu)
  {
    id: "directory:shakha-directory",
    moduleId: "directory",
    moduleName: "Directory",
    submoduleId: "shakha-directory",
    submoduleName: "Shakha Directory",
    pageId: "report-shakha-directory",
  },
  {
    id: "directory:karyakarta-directory",
    moduleId: "directory",
    moduleName: "Directory",
    submoduleId: "karyakarta-directory",
    submoduleName: "Karyakarta Directory",
    pageId: "report-karyakarta-directory",
  },
  {
    id: "directory:ayu-shreni",
    moduleId: "directory",
    moduleName: "Directory",
    submoduleId: "ayu-shreni",
    submoduleName: "Ayu Shreni Directory",
    pageId: "report-ayu-shreni",
  },

  // 9. Settings (explicitly requested: System Settings, Static Pages, Email Templates, System Notifications, Roles & Permissions)
  {
    id: "settings:system-settings",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "system-settings",
    submoduleName: "System Settings",
    pageId: "system-settings",
  },
  {
    id: "settings:static-pages",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "static-pages",
    submoduleName: "Static Pages",
    pageId: "static-pages",
  },
  {
    id: "settings:email-templates",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "email-templates",
    submoduleName: "Email Templates",
    pageId: "email-templates",
  },
  {
    id: "settings:system-notifications",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "system-notifications",
    submoduleName: "System Notifications",
    pageId: "system-notifications",
  },
  {
    id: "settings:role-management",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "role-management",
    submoduleName: "Roles & Permissions",
    pageId: "role-management",
  },

  // 10. Audit Logging (no sub-items on left menu)
  {
    id: "audit:logs",
    moduleId: "audit-logs",
    moduleName: "Audit Logging",
    submoduleId: "audit-logs",
    submoduleName: "Audit Logging",
    pageId: "logs",
  },
];

// ─────────────────────────────────────────────────────────────
// INITIAL SEED FAQS
// Aligned with the left-sidebar module & submodule model
// ─────────────────────────────────────────────────────────────
export const INITIAL_FAQS: FAQItem[] = [
  // ── Dashboard FAQs ──
  {
    id: "faq-1",
    moduleSubmoduleId: "dashboard:dashboard",
    moduleId: "dashboard",
    moduleName: "Dashboard",
    submoduleId: "dashboard",
    submoduleName: "Dashboard",
    question: "What key metrics and widgets are displayed on the main Dashboard?",
    answer: "The Dashboard provides a consolidated real-time overview of active member statistics, recent registrations, upcoming karyakrams, shakha sankhya trends, and urgent pending approvals.",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "faq-2",
    moduleSubmoduleId: "dashboard:dashboard",
    moduleId: "dashboard",
    moduleName: "Dashboard",
    submoduleId: "dashboard",
    submoduleName: "Dashboard",
    question: "How frequently are the metrics and numbers refreshed on the Dashboard?",
    answer: "Dashboard data reflects real-time database updates and recalculates summary counters each time the page is viewed or explicitly reloaded.",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "faq-3",
    moduleSubmoduleId: "dashboard:dashboard",
    moduleId: "dashboard",
    moduleName: "Dashboard",
    submoduleId: "dashboard",
    submoduleName: "Dashboard",
    question: "Can administrators filter the dashboard overview by Vibhag or Shakha?",
    answer: "Yes, users with Kendriya or Vibhag privileges can apply top-level administrative filters to narrow metrics to specific regions or towns.",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },

  // ── HSS (UK) Setup FAQs (Module: HSS (UK) Setup, Sub-module: HSS (UK) Setup) ──
  {
    id: "faq-4",
    moduleSubmoduleId: "setup:setup",
    moduleId: "masters",
    moduleName: "HSS (UK) Setup",
    submoduleId: "setup",
    submoduleName: "HSS (UK) Setup",
    question: "How do administrators add a new country in HSS (UK) Setup?",
    answer: "Navigate to HSS (UK) Setup > Country, click \"Add Country\", provide country code, phone code, and operational currency, then save.",
    status: "active",
    createdAt: "2026-03-02T10:00:00Z",
    updatedAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "faq-5",
    moduleSubmoduleId: "setup:setup",
    moduleId: "masters",
    moduleName: "HSS (UK) Setup",
    submoduleId: "setup",
    submoduleName: "HSS (UK) Setup",
    question: "Can an existing country record be deactivated without deleting history?",
    answer: "Yes, toggle the status switch in the country row to Inactive. Deactivated countries are preserved for historical audit trails.",
    status: "active",
    createdAt: "2026-03-02T10:00:00Z",
    updatedAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "faq-6",
    moduleSubmoduleId: "setup:setup",
    moduleId: "masters",
    moduleName: "HSS (UK) Setup",
    submoduleId: "setup",
    submoduleName: "HSS (UK) Setup",
    question: "Who has permission to manage and edit Country records?",
    answer: "Only National Heads and Kendriya Super Administrators possess permissions to create or alter country-level structures.",
    status: "active",
    createdAt: "2026-03-02T10:00:00Z",
    updatedAt: "2026-03-02T10:00:00Z",
  },
  {
    id: "faq-7",
    moduleSubmoduleId: "setup:setup",
    moduleId: "masters",
    moduleName: "HSS (UK) Setup",
    submoduleId: "setup",
    submoduleName: "HSS (UK) Setup",
    question: "What is a Vibhag within the HSS (UK) organisational structure?",
    answer: "A Vibhag represents a regional administrative zone that encompasses multiple Nagars and associated Shakhas within the UK.",
    status: "active",
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "faq-8",
    moduleSubmoduleId: "setup:setup",
    moduleId: "masters",
    moduleName: "HSS (UK) Setup",
    submoduleId: "setup",
    submoduleName: "HSS (UK) Setup",
    question: "How do I add a new Vibhag under an existing country?",
    answer: "Go to HSS (UK) Setup > Vibhag, select \"Add Vibhag\", choose the parent Country, enter the Vibhag name, and assign regional karyakartas.",
    status: "active",
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },
  {
    id: "faq-9",
    moduleSubmoduleId: "setup:setup",
    moduleId: "masters",
    moduleName: "HSS (UK) Setup",
    submoduleId: "setup",
    submoduleName: "HSS (UK) Setup",
    question: "How do I configure a new Shakha Activity Centre?",
    answer: "Go to HSS (UK) Setup > Shakha, click \"Add Shakha\", enter address, meeting day, meeting time, and primary contact karyakarta details.",
    status: "active",
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-03T10:00:00Z",
  },

  // ── Members FAQs ──
  {
    id: "faq-14",
    moduleSubmoduleId: "members:all-members",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "all-members",
    submoduleName: "All Members",
    question: "How do I create a new member record in the Admin Panel?",
    answer: "Click the \"Add Member\" button on the All Members page. Complete personal, contact, and Shakha details. When finished, submit the record for approval.",
    status: "active",
    createdAt: "2026-03-06T10:00:00Z",
    updatedAt: "2026-03-06T10:00:00Z",
  },
  {
    id: "faq-15",
    moduleSubmoduleId: "members:all-members",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "all-members",
    submoduleName: "All Members",
    question: "How do I change a member's status (Active, Inactive, Suspended)?",
    answer: "Open the member details page, click \"Change Status\", select the new status from the dropdown, specify the reason, and confirm.",
    status: "active",
    createdAt: "2026-03-06T10:00:00Z",
    updatedAt: "2026-03-06T10:00:00Z",
  },
  {
    id: "faq-16",
    moduleSubmoduleId: "members:all-members",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "all-members",
    submoduleName: "All Members",
    question: "How do family account links and child accounts work?",
    answer: "Adult members can register and manage child accounts under their profile. Once submitted, child records undergo Karyawaha approval.",
    status: "active",
    createdAt: "2026-03-06T10:00:00Z",
    updatedAt: "2026-03-06T10:00:00Z",
  },
  {
    id: "faq-17",
    moduleSubmoduleId: "members:emergency-details",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "emergency-details",
    submoduleName: "Emergency Details",
    question: "Who can view member emergency contact and medical details?",
    answer: "Only verified Karyakartas, Shakha Karyawahas, and designated safeguarding officers can view emergency information.",
    status: "active",
    createdAt: "2026-03-07T10:00:00Z",
    updatedAt: "2026-03-07T10:00:00Z",
  },
  {
    id: "faq-18",
    moduleSubmoduleId: "members:pending-approvals",
    moduleId: "members",
    moduleName: "Members",
    submoduleId: "pending-approvals",
    submoduleName: "Pending Karyawaha Approvals",
    question: "How do Karyawahas approve newly registered members?",
    answer: "Navigate to Members > Pending Karyawaha Approvals, review applicant details, verify their assigned Shakha, and click Approve.",
    status: "active",
    createdAt: "2026-03-07T10:00:00Z",
    updatedAt: "2026-03-07T10:00:00Z",
  },

  // ── Karyakrams FAQs (Module: Karyakrams, Sub-module: Karyakrams) ──
  {
    id: "faq-20",
    moduleSubmoduleId: "karyakrams:karyakrams",
    moduleId: "events",
    moduleName: "Karyakrams",
    submoduleId: "karyakrams",
    submoduleName: "Karyakrams",
    question: "How do I create a new Karyakram event?",
    answer: "Click \"Create Karyakram\", provide title, dates, venue, capacity, ticket categories, and eligibility criteria, then publish.",
    status: "active",
    createdAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
  },
  {
    id: "faq-21",
    moduleSubmoduleId: "karyakrams:karyakrams",
    moduleId: "events",
    moduleName: "Karyakrams",
    submoduleId: "karyakrams",
    submoduleName: "Karyakrams",
    question: "What does 'Karyakram expiry' mean?",
    answer: "An expired Karyakram has passed its end date. Expired Karyakrams become read-only records, but attendee and financial logs remain accessible.",
    status: "active",
    createdAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
  },
  {
    id: "faq-22",
    moduleSubmoduleId: "karyakrams:karyakrams",
    moduleId: "events",
    moduleName: "Karyakrams",
    submoduleId: "karyakrams",
    submoduleName: "Karyakrams",
    question: "How does attendee QR check-in work?",
    answer: "Each registered member receives a digital QR code pass that can be scanned at reception using any standard mobile device camera.",
    status: "active",
    createdAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
  },

  // ── Suchana FAQs (Module: Suchana, Sub-module: Suchana) ──
  {
    id: "faq-23",
    moduleSubmoduleId: "suchana:suchana",
    moduleId: "announcements",
    moduleName: "Suchana",
    submoduleId: "suchana",
    submoduleName: "Suchana",
    question: "How do I post a national or regional Suchana?",
    answer: "Click \"New Suchana\", draft title and body text, choose target audience (National, Vibhag, or specific Shakha), and set expiration.",
    status: "active",
    createdAt: "2026-03-09T10:00:00Z",
    updatedAt: "2026-03-09T10:00:00Z",
  },
  {
    id: "faq-24",
    moduleSubmoduleId: "suchana:suchana",
    moduleId: "announcements",
    moduleName: "Suchana",
    submoduleId: "suchana",
    submoduleName: "Suchana",
    question: "Do members receive push notifications for urgent announcements?",
    answer: "Yes, when marked \"High Priority\", automated push notifications and email digests are triggered to matching member profiles.",
    status: "active",
    createdAt: "2026-03-09T10:00:00Z",
    updatedAt: "2026-03-09T10:00:00Z",
  },

  // ── Shakha FAQs ──
  {
    id: "faq-25",
    moduleSubmoduleId: "shakha:sessions",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "sessions",
    submoduleName: "Sankhya",
    question: "How do I record Sankhya (attendance) for a Shakha session?",
    answer: "Select your Shakha from the filter, locate the session date or click \"Record Sankhya\", enter headcounts for Bal, Kishor, Tarun, and Proudh categories, then submit.",
    status: "active",
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "faq-26",
    moduleSubmoduleId: "shakha:compliance",
    moduleId: "attendance",
    moduleName: "Shakha",
    submoduleId: "compliance",
    submoduleName: "Compliance",
    question: "How do I track and update volunteer DBS compliance status?",
    answer: "Navigate to Shakha > Compliance to review volunteers due for DBS renewal, verify certificate numbers, and track issue dates.",
    status: "active",
    createdAt: "2026-03-11T10:00:00Z",
    updatedAt: "2026-03-11T10:00:00Z",
  },

  // ── Settings FAQs (Sub-modules: System Settings, Static Pages, Email Templates, System Notifications, Roles & Permissions) ──
  {
    id: "faq-28",
    moduleSubmoduleId: "settings:system-settings",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "system-settings",
    submoduleName: "System Settings",
    question: "How do I update the platform logo or branding?",
    answer: "Go to System Settings → General → Branding. Upload a new logo (PNG/SVG, max 1 MB). The logo updates across the header and login page immediately after saving.",
    status: "active",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
  },
  {
    id: "faq-29",
    moduleSubmoduleId: "settings:system-settings",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "system-settings",
    submoduleName: "System Settings",
    question: "How do I configure the administrative session timeout?",
    answer: "In System Settings → General → Security, set the \"Session Timeout\" duration in minutes. Users will be automatically logged out after inactivity.",
    status: "active",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z",
  },
  {
    id: "faq-30",
    moduleSubmoduleId: "settings:static-pages",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "static-pages",
    submoduleName: "Static Pages",
    question: "How do I create or edit a public policy or static page?",
    answer: "Click \"Add Policy\" or click \"Edit\" on an existing card. Update title, URL slug, and formatted body text. Toggle Visibility to publish.",
    status: "active",
    createdAt: "2026-03-13T10:00:00Z",
    updatedAt: "2026-03-13T10:00:00Z",
  },
  {
    id: "faq-31",
    moduleSubmoduleId: "settings:email-templates",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "email-templates",
    submoduleName: "Email Templates",
    question: "How do I modify notification email templates?",
    answer: "Navigate to Settings > Email Templates, select a template, customize the subject line and HTML body using variable merge tags.",
    status: "active",
    createdAt: "2026-03-13T10:00:00Z",
    updatedAt: "2026-03-13T10:00:00Z",
  },
  {
    id: "faq-32",
    moduleSubmoduleId: "settings:system-notifications",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "system-notifications",
    submoduleName: "System Notifications",
    question: "How are administrative system notifications configured?",
    answer: "Under Settings > System Notifications, administrators can specify trigger events, alert delivery channels, and recipient administrator roles.",
    status: "active",
    createdAt: "2026-03-14T10:00:00Z",
    updatedAt: "2026-03-14T10:00:00Z",
  },
  {
    id: "faq-33",
    moduleSubmoduleId: "settings:role-management",
    moduleId: "settings",
    moduleName: "Settings",
    submoduleId: "role-management",
    submoduleName: "Roles & Permissions",
    question: "How do I assign permissions to an administrative role?",
    answer: "Select the role card, click \"Edit Permissions\", check or uncheck individual module actions, and click \"Save Changes\".",
    status: "active",
    createdAt: "2026-03-14T10:00:00Z",
    updatedAt: "2026-03-14T10:00:00Z",
  },

  // ── Audit Logging FAQs (Module: Audit Logging, Sub-module: Audit Logging) ──
  {
    id: "faq-34",
    moduleSubmoduleId: "audit:logs",
    moduleId: "audit-logs",
    moduleName: "Audit Logging",
    submoduleId: "audit-logs",
    submoduleName: "Audit Logging",
    question: "What events are recorded in the audit logs?",
    answer: "All user logins, role assignments, profile approvals, data exports, and administrative settings modifications are recorded with actor details.",
    status: "active",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
];

// ─────────────────────────────────────────────────────────────
// STORAGE & SYNCHRONIZATION HELPERS
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "hss_faq_items_v3";
const FAQ_UPDATE_EVENT = "hss_faq_updated";

export function getFAQItems(): FAQItem[] {
  if (typeof window === "undefined") return INITIAL_FAQS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAQS));
    return INITIAL_FAQS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAQS));
    return INITIAL_FAQS;
  } catch (e) {
    console.error("Failed to parse FAQ items from localStorage", e);
    return INITIAL_FAQS;
  }
}

export function saveFAQItems(items: FAQItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(FAQ_UPDATE_EVENT, { detail: items }));
}

export function addFAQItem(
  data: Omit<FAQItem, "id" | "createdAt" | "updatedAt">
): FAQItem {
  const items = getFAQItems();
  const newItem: FAQItem = {
    ...data,
    id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newItem, ...items];
  saveFAQItems(updated);
  return newItem;
}

export function updateFAQItem(
  id: string,
  updates: Partial<Omit<FAQItem, "id" | "createdAt">>
): FAQItem | null {
  const items = getFAQItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updatedItem: FAQItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  items[index] = updatedItem;
  saveFAQItems(items);
  return updatedItem;
}

export function deleteFAQItem(id: string): boolean {
  const items = getFAQItems();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  saveFAQItems(filtered);
  return true;
}

export function toggleFAQStatus(id: string): FAQItem | null {
  const items = getFAQItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const newStatus = items[index].status === "active" ? "inactive" : "active";
  items[index] = {
    ...items[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
  saveFAQItems(items);
  return items[index];
}

export function getSubmoduleForPage(pageId: string): ModuleSubmodule | undefined {
  if (['country', 'region', 'town', 'centre', 'configurable-lists'].includes(pageId)) {
    return MODULE_SUBMODULE_LIST.find((m) => m.id === "setup:setup");
  }
  return MODULE_SUBMODULE_LIST.find((m) => m.pageId === pageId);
}

export function getSubmodulesForModule(moduleName: string): ModuleSubmodule[] {
  return MODULE_SUBMODULE_LIST.filter((m) => m.moduleName === moduleName);
}

export function getActiveFaqsForPage(pageId: string): FAQItem[] {
  const ms = getSubmoduleForPage(pageId);
  const items = getFAQItems();
  if (!ms) return [];
  return items.filter(
    (item) => item.moduleSubmoduleId === ms.id && item.status === "active"
  );
}

export { FAQ_UPDATE_EVENT };
