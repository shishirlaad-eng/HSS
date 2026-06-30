import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Globe,
  Bell,
  Grid3x3,
  Sun,
  Moon,
  Monitor,
  Building2,
  MapPin,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Check,
  Clock,
  X,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  ChevronRight,
  Star,
  Crown,
  Shield,
  Plus,
  CalendarCheck,
  CalendarX,
  ClipboardList,
  UserCheck,
  UserX,
  Timer,
  ClipboardCheck,
  Key,
  LifeBuoy,
} from "lucide-react";
import { getNavigationData } from "../../mockAPI/navigationData";
import { useLanguage } from "../../i18n/LanguageContext";
import { ADMIN_ROLE_OPTIONS, getPermittedNavIds } from "../../mockAPI/rolesData";
import myHssLogo from "../../assets/brand/hss/logos/my-hss-logo.png";
import {
  FormModal,
  FormLabel,
  FormInput,
  FormField,
  FormFooter,
  FormSection,
} from "./hb/common/Form";

const ROLE_DISPLAY_LABELS: Record<string, string> = {
  'Kendriya Admin':   'Kendriya Admin',
  'Vibhaag Admin':    'Vibhaag Admin',
  'Nagar Admin':      'Nagar Admin',
  'Shakha Admin':     'Shakha Admin',
  'Shakha Operations':'Shakha Operations',
  'Adult Member':     'Member',
  'Teen Member':      'Teen Member',
};

// ── Mock "My Shakha" details (shown via My Profile dropdown) ──
const MY_SHAKHA_DETAILS = {
  name:          "Wembley Activity Centre",
  shakhaType:    "Swayamsevak Shakha",
  vibhaag:       "London & South East",
  nagar:         "Wembley",
  addressLine1:  "12 Ealing Road",
  addressLine2:  "Wembley",
  city:          "London",
  postCode:      "HA0 4TL",
  meetingDay:    "Thursday",
  meetingTime:   "18:00 – 20:00",
  contactName:   "Ramesh Patel",
  contactPhone:  "07700 900111",
  contactEmail:  "wembley@hss.org.uk",
  status:        "active",
};

interface GlobalHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSidebarCollapsed: boolean;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
  logoUrl?: string;
  menuOrientation?: "vertical" | "horizontal";
  onMenuOrientationChange?: (
    o: "vertical" | "horizontal",
  ) => void;
  currentPage?: string;
  onNavigate?: (pageId: string) => void;
  selectedRole?: string;
  onRoleChange?: (role: string) => void;
  onLogout?: () => void;
}

export function GlobalHeader({
  isDarkMode,
  onToggleDarkMode,
  isSidebarCollapsed,
  currentTheme = "default-black",
  onThemeChange,
  logoUrl,
  menuOrientation = "vertical",
  onMenuOrientationChange,
  currentPage = "dashboard",
  onNavigate,
  selectedRole = "Super Admin",
  onRoleChange,
  onLogout,
}: GlobalHeaderProps) {
  const { language: currentLanguage, setLanguage, t, languages } =
    useLanguage();

  // Nav label map — mirrors Sidebar so horizontal nav also responds to language changes
  const navLabelMap: Record<string, string> = {
    "dashboard": t.nav.dashboard,
    "site-map": t.nav.siteMap,
    "hb-templates": t.nav.hbTemplates,
    "ui-kit": t.nav.uiKit,
    "sample-design": t.nav.samplePage,
    "event-management-group": t.nav.eventManagement,
    "event-management": t.nav.events,
    "organisational-master": t.nav.organisationalMaster,
    "country": t.nav.country,
    "state": t.nav.state,
    "city": t.nav.city,
    "role-management": t.nav.roleManagement,
    "configurations-group": t.nav.configurations,
    "static-pages": t.nav.staticPages,
    "email-templates": t.nav.emailTemplates,
    "system-notifications": t.nav.systemNotifications,
    "system-settings": t.nav.systemSettings,
    "logs-group": t.nav.logs,
    "login-logs": t.nav.loginLogs,
    "audit-logs": t.nav.auditLogs,
    "api-logs": t.nav.apiLogs,
    "email-logs": t.nav.emailLogs,
  };
  const getNavLabel = (id: string, fallback: string) => {
    let label = navLabelMap[id] ?? fallback;
    if (menuOrientation === "horizontal") {
      if (id === "event-management-group") label = "Event Mgmt";
      if (id === "organisational-master") label = "Master Mgmt";
    }
    if (id === "attendance-group" && isMemberRole) label = "My Attendance";
    if (id === "my-donations" && isMemberRole) label = "My Dakshina";
    return label;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] =
    useState(false);
  const [recentSearches, setRecentSearches] = useState<
    string[]
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentSearches");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showLanguageDropdown, setShowLanguageDropdown] =
    useState(false);
  const [
    showNotificationsDropdown,
    setShowNotificationsDropdown,
  ] = useState(false);
  const [
    showApplicationsDropdown,
    setShowApplicationsDropdown,
  ] = useState(false);
  const [showUserDropdown, setShowUserDropdown] =
    useState(false);
  const [showSettingsPanel, setShowSettingsPanel] =
    useState(false);
  const [showSupportPanel, setShowSupportPanel] =
    useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(
    new Set(),
  );
  const [openHorizSubmenu, setOpenHorizSubmenu] =
    useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    useState("English");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] =
    useState(false);
  const [showMyShakhaModal, setShowMyShakhaModal] = useState(false);
  const [horizVisibleCount, setHorizVisibleCount] = useState(999);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Refs for click outside detection
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const applicationsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const horizNavRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const itemWidthsRef = useRef<number[]>([]);

  // FAQ data keyed by page/module
  const pageFaqData: Record<string, { id: string; q: string; a: string }[]> = {
    dashboard: [
      {
        id: "d1",
        q: "How do I read the dashboard summary cards?",
        a: "Each card displays a key metric for the current period. The percentage indicator shows the change compared to the previous period. Green means improvement, red means decline.",
      },
      {
        id: "d2",
        q: "How often is the dashboard data refreshed?",
        a: "Dashboard data is refreshed every time you load or navigate to the dashboard. You can force a refresh by reloading the page.",
      },
      {
        id: "d3",
        q: "Can I customise which widgets appear on the dashboard?",
        a: "Widget customisation is planned for a future release. Currently the dashboard shows the default set of operational metrics relevant to your role.",
      },
    ],
    users: [
      {
        id: "u1",
        q: "How do I create a new user?",
        a: "Click the 'Add User' button in the top-right of the Users page. Fill in the required fields — name, email, role — then click Save. An invitation email is sent automatically.",
      },
      {
        id: "u2",
        q: "How do I change a user's status?",
        a: "Open the user's row actions (⋯ menu) and select 'Activate' or 'Deactivate'. Deactivated users cannot log in but their data is preserved.",
      },
      {
        id: "u3",
        q: "How do I assign or change permissions?",
        a: "Edit the user and change the Role field. Roles control module access. Custom permission overrides can be set from the user's detail page under the Permissions tab.",
      },
      {
        id: "u4",
        q: "Can I bulk-import users?",
        a: "Yes. Use the 'Import' option from the Users page header. Download the CSV template, fill it in, and re-upload. Errors are highlighted before committing the import.",
      },
    ],
    events: [
      {
        id: "e1",
        q: "How do I create a Karyakram?",
        a: "Click 'New Karyakram', provide a title, dates, location, and capacity, then publish. Attendee registration opens immediately after publishing.",
      },
      {
        id: "e2",
        q: "What does 'Karyakram expiry' mean?",
        a: "An expired Karyakram has passed its end date. Expired Karyakrams are read-only; you can duplicate them to reuse the setup for a future date.",
      },
      {
        id: "e3",
        q: "How does attendee tracking work?",
        a: "Attendees check in via QR code or manual entry. The Attendees tab on each Karyakram shows real-time check-in status, timestamps, and attendance rate.",
      },
    ],
    attendance: [
      {
        id: "a1",
        q: "How do I correct a missing clock-out?",
        a: "Navigate to the employee's attendance record, click 'Correction Request', enter the correct time and reason, then submit. The request routes to the manager for approval.",
      },
      {
        id: "a2",
        q: "How are late arrivals calculated?",
        a: "Late arrivals are determined by comparing the clock-in time against the shift start time defined in the employee's schedule. A grace period can be configured in System Settings.",
      },
      {
        id: "a3",
        q: "Can I export attendance reports?",
        a: "Yes. Go to Reports and filter by date range and department, then use the Export button to download CSV or PDF.",
      },
    ],
    "leave-requests": [
      {
        id: "l1",
        q: "How does the leave approval workflow work?",
        a: "An employee submits a request. The direct manager receives a notification to approve or reject. HR is notified once a decision is made. The employee sees the status update in real time.",
      },
      {
        id: "l2",
        q: "Can managers approve on behalf of someone else?",
        a: "Only the assigned approver for a leave request can action it. Admins can re-assign approvers from the request's detail view.",
      },
      {
        id: "l3",
        q: "How is leave balance calculated?",
        a: "Leave balances are tracked per leave type. Accrual rules (monthly, annually, etc.) are configured in System Settings under Leave Policies.",
      },
    ],
    settings: [
      {
        id: "s1",
        q: "How do I update the platform logo or branding?",
        a: "Go to System Settings → Branding. Upload a new logo (PNG/SVG, max 1 MB). The logo updates across the header and login page immediately after saving.",
      },
      {
        id: "s2",
        q: "How do I configure the session timeout?",
        a: "In System Settings → Security, set the 'Session Timeout' duration in minutes. Users will be automatically logged out after the specified period of inactivity.",
      },
      {
        id: "s3",
        q: "How do I manage mobile app versions?",
        a: "Navigate to System Settings → Mobile App. Enter the minimum required version and the latest available version. Users on older versions will be prompted to update.",
      },
    ],
  };

  const toggleFaq = (id: string) => {
    setExpandedFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Derive FAQ list for the current page, fall back to dashboard FAQs
  const currentFaqs =
    pageFaqData[currentPage] ??
    pageFaqData["dashboard"] ??
    [];


  const themes = [
    {
      id: "hss-brand",
      name: "HSS Blue",
      description: "HSS UK official navy blue",
    },
    {
      id: "default-black",
      name: "Default Black",
      description: "Premium SaaS dark slate accent",
    },
    {
      id: "ocean-blue",
      name: "Ocean Blue",
      description: "Bright executive azure blue",
    },
    {
      id: "emerald-green",
      name: "Emerald Green",
      description: "Crisp modern growth green",
    },
    {
      id: "violet-purple",
      name: "Violet Purple",
      description: "Vibrant high-tech purple",
    },
    {
      id: "amber-orange",
      name: "Amber Orange",
      description: "Luminous energetic orange",
    },
  ];

  const themeColors: Record<string, string> = {
    "hss-brand": "#172E4D",
    "default-black": "#111827",
    "ocean-blue": "#2563eb",
    "emerald-green": "#10b981",
    "violet-purple": "#8b5cf6",
    "amber-orange": "#f59e0b",
  };

  const notifications = [
    {
      id: 1,
      title: "Leave Request Approved",
      message: "Your annual leave request has been approved",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Attendance Alert",
      message: "Missing clock-out entry for yesterday",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Correction Request",
      message: "Your attendance correction has been processed",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: 4,
      title: "Leave Balance Update",
      message: "Your leave balance has been updated",
      time: "3 hours ago",
      unread: false,
    },
    {
      id: 5,
      title: "Team Attendance",
      message: "3 team members are on leave today",
      time: "5 hours ago",
      unread: false,
    },
  ];

  const applications = [
    {
      id: 1,
      name: "Attendance",
      icon: "📋",
      description: "Manage attendance records",
      color: "bg-primary-100 dark:bg-primary-950",
    },
    {
      id: 2,
      name: "Projects",
      icon: "📊",
      description: "Track project progress",
      color: "bg-success-100 dark:bg-success-950",
    },
    {
      id: 3,
      name: "HR",
      icon: "👥",
      description: "Human resources",
      color: "bg-warning-100 dark:bg-warning-950",
    },
  ];

  // Mock search data
  const searchData = [
    // Users
    {
      id: 1,
      title: "Sarah Johnson",
      type: "User",
      category: "Users",
      icon: UserCheck,
      description: "Active - Premium Member",
      status: "Active",
    },
    {
      id: 2,
      title: "Michael Chen",
      type: "User",
      category: "Users",
      icon: UserX,
      description: "Inactive Account",
      status: "Inactive",
    },
    {
      id: 3,
      title: "Emily Davis",
      type: "User",
      category: "Users",
      icon: UserCheck,
      description: "Active - Admin Role",
      status: "Active",
    },

    // Events
    {
      id: 6,
      title: "Annual Tech Summit",
      type: "Event",
      category: "Karyakrams",
      icon: CalendarCheck,
      description: "Dec 28 - Jan 2 (5 days)",
      status: "Active",
    },
    {
      id: 7,
      title: "Team Building Workshop",
      type: "Event",
      category: "Karyakrams",
      icon: CalendarX,
      description: "Dec 24 (1 day)",
      status: "Expired",
    },

    // Attendance Records
    {
      id: 8,
      title: "Clock-In Record - Sarah Johnson",
      type: "Attendance",
      category: "Attendance",
      icon: Timer,
      description: "Today at 8:00 AM",
      status: "On Time",
    },
    // Modules
    {
      id: "m1",
      title: "User Management",
      type: "Module",
      category: "System Modules",
      icon: Users,
      description: "Manage system users and roles",
      status: "Active",
    },
    {
      id: "m2",
      title: "Karyakram Management",
      type: "Module",
      category: "System Modules",
      icon: Calendar,
      description: "Organize and track Karyakrams",
      status: "Active",
    },
    {
      id: "m3",
      title: "Role Management",
      type: "Module",
      category: "System Modules",
      icon: Shield,
      description: "Configure RBAC and permissions",
      status: "Active",
    },
    {
      id: "m4",
      title: "System Settings",
      type: "Module",
      category: "System Modules",
      icon: Settings,
      description: "Platform branding and security",
      status: "Active",
    },
  ];

  const permittedNavIds = getPermittedNavIds(selectedRole);
  const navItems = getNavigationData(currentPage, onNavigate || (() => {}), selectedRole)
    .filter(item => permittedNavIds.has(item.id));
  
  const quickAccessModules = useMemo(() => {
    const modules: any[] = [];
    navItems.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((sub: any) => {
          modules.push({
            id: sub.id,
            name: sub.label,
            icon: item.icon || Grid3x3,
            description: `Manage ${sub.label.toLowerCase()}`,
            onClick: sub.onClick
          });
        });
      } else {
        modules.push({
          id: item.id,
          name: item.label,
          icon: item.icon || Grid3x3,
          description: `Open ${item.label.toLowerCase()}`,
          onClick: item.onClick
        });
      }
    });
    return modules.slice(0, 6); // Limit to top 6
  }, [navItems]);

  // Filter search results
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query),
    );
  };

  const searchResults = getSearchResults();
  const groupedResults = searchResults.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof searchData>,
  );

  // Highlight search term in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts
      .map((part, index) =>
        part.toLowerCase() === query.toLowerCase()
          ? `<mark class="bg-warning-200 dark:bg-warning-900/30 text-neutral-900 dark:text-white px-0.5 rounded">${part}</mark>`
          : part,
      )
      .join("");
  };

  const unreadCount = notifications.filter(
    (n) => n.unread,
  ).length;

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "k"
      ) {
        event.preventDefault();
        setShowSearchDropdown(true);
        searchInputRef.current?.focus();
      }
      if (event.key === "Escape" && showSearchDropdown) {
        setShowSearchDropdown(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [showSearchDropdown]);

  // Handle search input focus
  const handleSearchFocus = () => {
    setShowSearchDropdown(true);
  };

  // Handle search query change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      setShowSearchDropdown(true);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      // Add to recent searches
      const newRecent = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(newRecent),
      );
      setShowSearchDropdown(false);
    }
  };

  // Clear recent searches
  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Remove single recent search
  const handleRemoveRecent = (
    searchToRemove: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter(
      (s) => s !== searchToRemove,
    );
    setRecentSearches(newRecent);
    localStorage.setItem(
      "recentSearches",
      JSON.stringify(newRecent),
    );
  };

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsDropdown(false);
      }
      if (
        applicationsRef.current &&
        !applicationsRef.current.contains(event.target as Node)
      ) {
        setShowApplicationsDropdown(false);
      }
      if (
        userRef.current &&
        !userRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
        setShowSettingsPanel(false);
      }
      if (
        supportRef.current &&
        !supportRef.current.contains(event.target as Node)
      ) {
        setShowSupportPanel(false);
      }
      if (
        horizNavRef.current &&
        !horizNavRef.current.contains(event.target as Node)
      ) {
        setOpenHorizSubmenu(null);
      }
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  // ── Horizontal nav overflow: measure item widths and calculate how many fit ──
  useEffect(() => {
    if (menuOrientation !== 'horizontal') {
      setHorizVisibleCount(999);
      itemWidthsRef.current = [];
      return;
    }
    const wrapper = horizNavRef.current;
    if (!wrapper) return;

    // Cache natural widths once (on first render when all items are visible)
    const cacheWidths = () => {
      if (itemWidthsRef.current.length > 0) return;
      const items = wrapper.querySelectorAll<HTMLElement>('[data-nav-item]');
      const widths = Array.from(items).map(el => el.getBoundingClientRect().width);
      if (widths.length > 0 && widths.every(w => w > 0)) {
        itemWidthsRef.current = widths;
      }
    };

    const recalc = () => {
      cacheWidths();
      const widths = itemWidthsRef.current;
      if (!widths.length) return;
      const available = wrapper.getBoundingClientRect().width;
      const MORE_W = 92; // px reserved for "More ▾" button
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const remaining = widths.length - i - 1;
        const extra = remaining > 0 ? MORE_W : 0; // reserve space for "More" if items remain
        if (used + widths[i] + extra > available) break;
        used += widths[i];
        count++;
      }
      setHorizVisibleCount(count >= widths.length ? 999 : count);
    };

    const ro = new ResizeObserver(recalc);
    ro.observe(wrapper);
    requestAnimationFrame(() => { cacheWidths(); recalc(); });
    return () => ro.disconnect();
  }, [menuOrientation]);

  // Reset width cache when nav structure changes
  useEffect(() => {
    itemWidthsRef.current = [];
  }, [navItems.length]);

  const isMemberRole = ["Adult Member", "Teen Member"].includes(selectedRole);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${isScrolled ? "shadow-sm" : ""}`}
      style={{ backgroundColor: "#172E4D" }}
    >
      <div className={`px-6 flex justify-between gap-4 ${menuOrientation === "horizontal" ? "h-[93px] items-stretch" : "h-[53px] items-center"}`}>
        {/* Left Side */}
        {menuOrientation === "horizontal" ? (
          /* HORIZONTAL: logos centered, nav items bottom-aligned inline */
          <div className="flex items-center flex-1 min-w-0 gap-4">
            {/* Logos — vertically centered in full header height */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src={logoUrl}
                alt="HSS UK Logo"
                className="h-[74px] w-auto object-contain flex-shrink-0"
              />
              <div className="w-px h-10 bg-white/40 flex-shrink-0" />
              <img
                src={myHssLogo}
                alt="My HSS"
                className="h-9 w-auto object-contain flex-shrink-0"
              />
            </div>
            {/* Nav items — pinned to bottom */}
            <div
              ref={horizNavRef}
              className="flex items-center gap-0.5 min-w-0 flex-1 ml-[5px]"
            >
              {navItems.map((item, index) => {
                const isOverflow = index >= horizVisibleCount;
                const Icon = item.icon;
                const isActive = item.active || item.subItems?.some((s) => s.active);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isOpen = openHorizSubmenu === item.id;
                return (
                  <div
                    key={item.id}
                    data-nav-item
                    className={`relative flex-shrink-0 ${isOverflow ? 'invisible overflow-hidden !w-0 !p-0 pointer-events-none' : ''}`}
                    onMouseEnter={() => !isOverflow && setOpenHorizSubmenu(item.id)}
                    onMouseLeave={() => !isOverflow && setOpenHorizSubmenu(null)}
                  >
                    <button
                      onClick={() => {
                        if (isOverflow) return;
                        if (item.onClick) item.onClick();
                        if (hasSubItems) {
                          setOpenHorizSubmenu(isOpen ? null : item.id);
                        } else {
                          setOpenHorizSubmenu(null);
                        }
                      }}
                      className={`flex items-center gap-[7px] px-[14px] h-[38px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-[#F9B03D] text-[#172E4D] font-semibold"
                          : "text-white/90 hover:bg-[#F9B03D] hover:text-neutral-900"
                      }`}
                    >
                      {Icon && <Icon className="w-[18px] h-[18px] flex-shrink-0" />}
                      <span>{getNavLabel(item.id, item.label)}</span>
                      {hasSubItems && (
                        <ChevronDown className={`w-4 h-4 flex-shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      )}
                    </button>
                    {hasSubItems && isOpen && !isOverflow && (
                      <div className="absolute left-0 top-[100%] pt-1 min-w-[180px] z-50">
                        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
                          {item.subItems!.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => { subItem.onClick?.(); setOpenHorizSubmenu(null); }}
                              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                                subItem.active
                                  ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                                  : "text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 dark:hover:text-primary-300"
                              }`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0" />
                              <span>{getNavLabel(subItem.id, subItem.label)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* ── "More ▾" overflow button ── */}
              {horizVisibleCount < 999 && (
                <div ref={moreMenuRef} className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowMoreMenu(v => !v)}
                    className={`flex items-center gap-[7px] px-[14px] h-[38px] rounded-md text-[16px] font-medium transition-colors whitespace-nowrap ${
                      navItems.slice(horizVisibleCount).some(i => i.active || i.subItems?.some(s => s.active))
                        ? "bg-[#F9B03D] text-neutral-900 font-semibold"
                        : "text-white/90 hover:bg-[#F9B03D] hover:text-neutral-900"
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 opacity-60 transition-transform ${showMoreMenu ? "rotate-180" : ""}`} />
                  </button>
                  {showMoreMenu && (
                    <div className="absolute left-0 top-[calc(100%+4px)] min-w-[210px] z-50">
                      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
                        {navItems.slice(horizVisibleCount).map((item) => {
                          const Icon = item.icon;
                          const isActive = item.active || item.subItems?.some(s => s.active);
                          const hasSubItems = item.subItems && item.subItems.length > 0;
                          if (hasSubItems) {
                            return (
                              <div key={item.id}>
                                <div
                                  className={`px-3 py-2 flex items-center gap-2 bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-100 dark:border-neutral-800 ${item.onClick ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800' : ''}`}
                                  onClick={() => { if (item.onClick) { item.onClick(); setShowMoreMenu(false); } }}
                                >
                                  {Icon && <Icon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 flex-shrink-0" />}
                                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                    {getNavLabel(item.id, item.label)}
                                  </span>
                                </div>
                                {item.subItems!.map((subItem) => (
                                  <button
                                    key={subItem.id}
                                    onClick={() => { subItem.onClick?.(); setShowMoreMenu(false); }}
                                    className={`w-full pl-8 pr-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                                      subItem.active
                                        ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 dark:hover:text-primary-300"
                                    }`}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0" />
                                    <span>{getNavLabel(subItem.id, subItem.label)}</span>
                                  </button>
                                ))}
                              </div>
                            );
                          }
                          return (
                            <button
                              key={item.id}
                              onClick={() => { item.onClick?.(); setShowMoreMenu(false); }}
                              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                                isActive
                                  ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400"
                                  : "text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 dark:hover:text-primary-300"
                              }`}
                            >
                              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                              <span>{getNavLabel(item.id, item.label)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VERTICAL: Logo (when collapsed) + Search input */
          <div className="flex items-center gap-4 flex-1 max-w-md">
          {/* Logo - Show only when sidebar is collapsed */}
          {isSidebarCollapsed && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src={logoUrl}
                alt="Admin Panel"
                className="h-8 w-8 object-contain"
              />
            </div>
          )}

        </div>
        )}

        {/* Right Side - Icons and Dropdowns */}
        <div className="flex items-center gap-1 flex-shrink-0 self-center">
          {/* Search Icon — horizontal mode only */}
          {menuOrientation === "horizontal" && !isMemberRole && (
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => {
                  setShowSearchDropdown(!showSearchDropdown);
                  if (!showSearchDropdown) {
                    setTimeout(
                      () => searchInputRef.current?.focus(),
                      50,
                    );
                  }
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-white/90 hover:bg-[#F9B03D] hover:text-white"
                title="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
              {showSearchDropdown && (
                <div className="absolute right-0 top-full mt-2 w-[480px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl overflow-hidden z-50">
                  {/* Search Input */}
                  <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-500 dark:text-neutral-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search modules, pages, settings..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchQuery.trim()) handleSearchSubmit(searchQuery);
                          if (e.key === "Escape") setShowSearchDropdown(false);
                        }}
                        className="w-full pl-10 pr-16 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] rounded border border-neutral-300 dark:border-neutral-700">⌘K</kbd>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  {searchQuery.trim() && searchResults.length > 0 && (
                    <div className="max-h-[500px] overflow-y-auto slim-scroll">
                      {Object.entries(groupedResults).map(([category, items]) => (
                        <div key={category} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                          <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50">
                            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-400 uppercase tracking-wide">{category}</div>
                          </div>
                          {items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSearchSubmit(searchQuery)}
                                className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors flex items-center gap-3 group"
                              >
                                <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                                  <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className="text-sm font-medium text-neutral-900 dark:text-white mb-0.5"
                                    dangerouslySetInnerHTML={{ __html: highlightText(item.title, searchQuery) }}
                                  />
                                  <div
                                    className="text-xs text-neutral-600 dark:text-neutral-400"
                                    dangerouslySetInnerHTML={{ __html: highlightText(item.description, searchQuery) }}
                                  />
                                </div>
                                <div className={`px-2 py-0.5 text-[10px] rounded-full flex-shrink-0 ${
                                  item.status === "Approved" || item.status === "Present" || item.status === "On Time" || item.status === "Active"
                                    ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400"
                                    : item.status === "Pending" || item.status === "Correction Needed"
                                      ? "bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400"
                                      : item.status === "Inactive" || item.status === "Expired" || item.status === "On Leave" || item.status === "Late" || item.status === "Rejected"
                                        ? "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400"
                                }`}>{item.status}</div>
                                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {searchQuery.trim() && searchResults.length === 0 && (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                      <div className="text-sm font-medium text-neutral-900 dark:text-white mb-1">No results found</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">Try searching with different keywords</div>
                    </div>
                  )}

                  {/* Quick Access + Recent (no query) */}
                  {!searchQuery.trim() && (
                    <>
                      <div className="border-b border-neutral-200 dark:border-neutral-800">
                        <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50">
                          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-400 uppercase tracking-wide">Quick Access</div>
                        </div>
                        <div className="p-2">
                          {quickAccessModules.map((module) => {
                            const Icon = module.icon;
                            return (
                              <button
                                key={module.id}
                                onClick={() => { module.onClick?.(); setShowSearchDropdown(false); }}
                                className="w-full px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-3"
                              >
                                <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-neutral-900 dark:text-white">{module.name}</div>
                                  <div className="text-xs text-neutral-600 dark:text-neutral-400">{module.description}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {recentSearches.length > 0 && (
                        <div>
                          <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
                            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-400 uppercase tracking-wide">Recent Searches</div>
                            <button onClick={handleClearRecent} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Clear all</button>
                          </div>
                          <div className="p-2">
                            {recentSearches.map((search, index) => (
                              <button
                                key={index}
                                onClick={() => { setSearchQuery(search); handleSearchSubmit(search); }}
                                className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-3 group"
                              >
                                <Clock className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
                                <span className="flex-1">{search}</span>
                                <div
                                  onClick={(e) => handleRemoveRecent(search, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5 text-neutral-500 hover:text-error-500" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {recentSearches.length === 0 && (
                        <div className="p-8 text-center border-t border-neutral-200 dark:border-neutral-800">
                          <Clock className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                          <div className="text-xs text-neutral-600 dark:text-neutral-400">No recent searches</div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Footer tips */}
                  <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-[10px]">↵</kbd>
                        to select
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-[10px]">ESC</kbd>
                        to close
                      </span>
                    </div>
                    <span className="text-neutral-500 dark:text-neutral-500">
                      {searchResults.length > 0 && `${searchResults.length} results`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Role Switcher Dropdown */}
          <div className="relative flex items-center">
            <div className="relative">
              <select
                value={selectedRole}
                onChange={e => onRoleChange?.(e.target.value)}
                className="h-8 pl-3 pr-7 text-xs font-medium rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors border-white/30 bg-white/20 text-white hover:bg-white/30"
                title="Switch role view"
              >
                {ADMIN_ROLE_OPTIONS.map(role => (
                  <option key={role} value={role} className="text-neutral-900 bg-white">{ROLE_DISPLAY_LABELS[role] ?? role}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/70" />
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() =>
                setShowNotificationsDropdown(
                  !showNotificationsDropdown,
                )
              }
              className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-white/90 hover:bg-[#F9B03D] hover:text-white"
              title="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-error-500 text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotificationsDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
                <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                    Notifications
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto slim-scroll">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer ${notification.unread
                        ? "bg-primary-50/30 dark:bg-primary-950/30"
                        : ""
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white mb-0.5">
                            {notification.title}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-500">
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button className="w-full py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 rounded transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Support / FAQ Panel */}
          <div className="relative" ref={supportRef}>
            <button
              onClick={() => {
                setShowSupportPanel(!showSupportPanel);
                if (showSupportPanel) setExpandedFaqs(new Set());
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-white/90 hover:bg-[#F9B03D] hover:text-white"
              title="Support & FAQ"
            >
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>
            {showSupportPanel && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50">
                {/* Panel Header */}
                <div className="px-3 py-2.5 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white">Support</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Quick help and frequently asked questions
                  </div>
                </div>

                {/* FAQ Accordion */}
                <div className="max-h-[420px] overflow-y-auto slim-scroll">
                  {currentFaqs.length === 0 ? (
                    <div className="p-6 text-center">
                      <HelpCircle className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        No FAQs available for this page.
                      </div>
                    </div>
                  ) : (
                    currentFaqs.map((faq, index) => {
                      const isOpen = expandedFaqs.has(faq.id);
                      const isLast = index === currentFaqs.length - 1;
                      return (
                        <div
                          key={faq.id}
                          className={!isLast ? "border-b border-neutral-100 dark:border-neutral-800" : ""}
                        >
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full px-3 py-2.5 text-left flex items-start gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-snug flex-1">
                              {faq.q}
                            </span>
                          </button>
                          {isOpen && (
                            <div className="px-3 pb-3 ml-5">
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Panel Footer */}
                <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    Showing help for:{" "}
                    <span className="font-medium text-neutral-600 dark:text-neutral-300 capitalize">
                      {currentPage.replace(/-/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() =>
                setShowUserDropdown(!showUserDropdown)
              }
              className="h-8 pl-1 pr-2 flex items-center gap-1.5 text-white/90 hover:bg-[#F9B03D] hover:text-white rounded-lg transition-colors"
            >
              <div className="w-7 h-7 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                JD
              </div>
              <ChevronDown className="w-3 h-3 hidden lg:inline" />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      JD
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white mb-0.5">
                        John Doe
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        john.doe@company.com
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate?.("my-profile");
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowMyShakhaModal(true);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>My Shakha</span>
                  </button>
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t.settings.appearance}</span>
                    <ChevronDown className={`w-3.5 h-3.5 ml-auto text-neutral-400 transition-transform ${showSettingsPanel ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Appearance Settings (expandable) */}
                {showSettingsPanel && (
                  <div className="border-t border-neutral-200 dark:border-neutral-800">
                    {/* Color Theme */}
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">{t.settings.colorTheme}</div>
                      <div className="space-y-0.5">
                        {themes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => {
                              if (onThemeChange) onThemeChange(theme.id);
                            }}
                            className="w-full px-2 py-1.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors flex items-center gap-2.5"
                          >
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10 dark:border-white/10"
                              style={{ backgroundColor: themeColors[theme.id] }}
                            />
                            <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200">{theme.name}</span>
                            {currentTheme === theme.id && (
                              <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Appearance Mode */}
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">{t.settings.mode}</div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { if (isDarkMode) onToggleDarkMode(); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm border transition-colors ${
                            !isDarkMode
                              ? "bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400"
                              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span>{t.settings.light}</span>
                        </button>
                        <button
                          onClick={() => { if (!isDarkMode) onToggleDarkMode(); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm border transition-colors ${
                            isDarkMode
                              ? "bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400"
                              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5" />
                          <span>{t.settings.dark}</span>
                        </button>
                      </div>
                    </div>

                    {/* Menu Layout */}
                    <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">{t.settings.menuLayout}</div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { if (onMenuOrientationChange) onMenuOrientationChange("vertical"); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm border transition-colors ${
                            menuOrientation !== "horizontal"
                              ? "bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400"
                              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          }`}
                        >
                          <span>{t.settings.vertical}</span>
                        </button>
                        <button
                          onClick={() => { if (onMenuOrientationChange) onMenuOrientationChange("horizontal"); }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm border transition-colors ${
                            menuOrientation === "horizontal"
                              ? "bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400"
                              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          }`}
                        >
                          <span>{t.settings.horizontal}</span>
                        </button>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="p-3">
                      <div className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">{t.settings.language}</div>
                      <div className="relative">
                        <select
                          value={currentLanguage}
                          onChange={(e) => setLanguage(e.target.value as typeof currentLanguage)}
                          className="w-full appearance-none px-3 py-1.5 pr-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors cursor-pointer"
                        >
                          {languages.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                              {lang.flag} {lang.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Logout */}
                <div className="p-1 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout?.();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 rounded transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Change Password Modal */}
      <FormModal
        isOpen={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false);
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }}
        title="Change Password"
        description="Enter your current password and choose a new one"
        maxWidth="max-w-md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Handle password change logic here
            console.log("Password change submitted:", passwordForm);
            setShowChangePasswordModal(false);
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }}
        >
          <FormSection>
            <FormField>
              <FormLabel htmlFor="currentPassword" required>
                Current Password
              </FormLabel>
              <FormInput
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="newPassword" required>
                New Password
              </FormLabel>
              <FormInput
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Must be at least 8 characters long
              </p>
            </FormField>

            <FormField>
              <FormLabel htmlFor="confirmPassword" required>
                Confirm New Password
              </FormLabel>
              <FormInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </FormField>
          </FormSection>

          <FormFooter>
            <button
              type="button"
              onClick={() => {
                setShowChangePasswordModal(false);
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Change Password
            </button>
          </FormFooter>
        </form>
      </FormModal>

      {/* My Shakha Modal */}
      <FormModal
        isOpen={showMyShakhaModal}
        onClose={() => setShowMyShakhaModal(false)}
        title="My Shakha"
        description="Details of your Activity Centre"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{MY_SHAKHA_DETAILS.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{MY_SHAKHA_DETAILS.shakhaType} · {MY_SHAKHA_DETAILS.nagar}, {MY_SHAKHA_DETAILS.vibhaag}</p>
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <p>{MY_SHAKHA_DETAILS.addressLine1}</p>
                {MY_SHAKHA_DETAILS.addressLine2 && <p>{MY_SHAKHA_DETAILS.addressLine2}</p>}
                <p>{MY_SHAKHA_DETAILS.city}, {MY_SHAKHA_DETAILS.postCode}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {MY_SHAKHA_DETAILS.meetingDay}, {MY_SHAKHA_DETAILS.meetingTime}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{MY_SHAKHA_DETAILS.contactName}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{MY_SHAKHA_DETAILS.contactPhone}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">{MY_SHAKHA_DETAILS.contactEmail}</span>
            </div>
          </div>
        </div>

        <FormFooter>
          <button
            type="button"
            onClick={() => setShowMyShakhaModal(false)}
            className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </FormFooter>
      </FormModal>
    </header>
  );
}
