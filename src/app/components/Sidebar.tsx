import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  Settings,
  Key,
  Menu,
  ChevronUp,
  ChevronDown,
  UserIcon,
  HelpCircle,
  User,
} from "lucide-react";
import myHssLogo from "../../assets/brand/hss/logos/my-hss-logo.png";
import { getNavigationData } from "../../mockAPI/navigationData";
import { useLanguage } from "../../i18n/LanguageContext";
import { getPermittedNavIds } from "../../mockAPI/rolesData";
import {
  FormModal,
  FormLabel,
  FormInput,
  FormField,
  FormFooter,
  FormSection,
} from "./hb/common/Form";

interface SidebarProps {
  onLogout?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentPage?: string;
  onNavigate?: (pageId: string) => void;
  logoUrl?: string;
  menuOrientation?: "vertical" | "horizontal";
  selectedRole?: string;
  isPostRegistration?: boolean;
}

export function Sidebar({
  onLogout,
  isCollapsed,
  onToggleCollapse,
  currentPage = "directory",
  onNavigate,
  logoUrl,
  menuOrientation = "vertical",
  selectedRole = "Super Admin",
  isPostRegistration = false,
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "employee-management",
    "organisational-master",
    "attendance-management",
    "leave-management",
    "reporting",
  ]);
  const [showProfileDrawer, setShowProfileDrawer] =
    useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] =
    useState(false);
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Flyout state for collapsed mode
  const [hoveredFlyout, setHoveredFlyout] = useState<{ id: string; top: number; isProfile?: boolean } | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = (id: string, top: number, isProfile?: boolean) => {
    clearTimeout(hoverTimeout.current);
    setHoveredFlyout({ id, top, isProfile });
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredFlyout(null);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileDrawer(false);
      }
    };

    if (showProfileDrawer) {
      document.addEventListener(
        "mousedown",
        handleClickOutside,
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [showProfileDrawer]);

  const toggleMenu = (menuId: string) => {
    if (isCollapsed) {
      // Don't toggle when collapsed
      return;
    }

    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  // Get navigation data and filter by role permissions
  const permittedNavIds = getPermittedNavIds(selectedRole);
  const menuItems = getNavigationData(
    currentPage,
    onNavigate || (() => { }),
    selectedRole,
  ).filter(item => permittedNavIds.has(item.id));

  // Translate nav labels using the language context
  const { t } = useLanguage();
  const isMemberRole = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';
  const navLabelMap: Record<string, string> = {
    // 1. Dashboard
    "dashboard": t.nav.dashboard,

    // 2. Members Management
    "members-management-group":      "Members",
    "members":                        "All Members",
    "karyakartas":                    "Responsibilities and Roles",
    "compliance":                     "Compliance",
    "emergency-details":              "Emergency Details",
    "pending-approvals":              "Pending Karyawaha Approvals",
    "pending-guardian-approvals":     "Pending Parent/Guardian Approvals",

    // 3. Karyakrams
    "event-management":               "Karyakrams",

    // 4. Suchana (Announcements)
    "announcements":                  "Suchana",

    // 5. Attendance
    "attendance-group":               isMemberRole ? "My Attendance" : "Attendance",
    "sessions":                       "Shakha",

    // 6. Reports
    "reports-group":                  "Reports",
    "report-members":                 "Members Report",
    "report-events":                  "Karyakram Report",
    "report-donations":               "Nidhi Report",
    "report-attendance":              "Attendance Report",
    "report-refunds":                 "Refund Report",
    "report-karyakarta":              "Karyakarta Report",
    "report-ayu-shreni":              "Ayu Shreni Report",
    "report-myhss-role":              "MyHSS Role Report",
    "report-shakha-directory":        "Shakha Directory",

    // 7. HSS (UK) Setup
    "masters-group":                  "HSS (UK) Setup",
    "country":                        "Countries",
    "region":                         "Vibhag",
    "town":                           "Nagar",
    "centre":                         "Shakha",

    // 8. Settings
    "role-management":                "Roles & Permissions",

    // 9. Settings
    "settings-group":                 "Settings",
    "system-settings":                t.nav.systemSettings,
    "static-pages":                   t.nav.staticPages,
    "email-templates":                t.nav.emailTemplates,

    // 10. Audit Logging
    "audit-logging":                  "Audit Logging",
  };
  const getLabel = (id: string, fallback: string) =>
    navLabelMap[id] ?? fallback;

  // Hide sidebar in horizontal menu mode
  if (menuOrientation === "horizontal") return null;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 border-r border-white/10 transition-all duration-300 z-50 ${isCollapsed ? "w-16" : "w-64"
        }`}
      style={{ backgroundColor: "#172E4D" }}
    >
      {/* Sidebar Header — HSS brand blue bar */}
      <div
        className={`h-[53px] flex-shrink-0 px-3 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
        style={{ backgroundColor: "#172E4D" }}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={logoUrl}
              alt="HSS UK Logo"
              className="h-9 w-auto object-contain flex-shrink-0"
            />
            <div className="w-px h-7 bg-white/40 flex-shrink-0" />
            <img
              src={myHssLogo}
              alt="My HSS"
              className="h-9 w-auto object-contain flex-shrink-0"
            />
          </div>
        )}

        {/* Hamburger Toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand menu" : "Collapse menu"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Menu */}
      <div
        className={`overflow-y-auto overflow-x-hidden h-[calc(100vh-53px)] py-2 transition-all slim-scroll ${isHoveringMenu
          ? ""
          : "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-transparent"
          }`}
        onMouseEnter={() => setIsHoveringMenu(true)}
        onMouseLeave={() => setIsHoveringMenu(false)}
      >
        <div className="space-y-1 px-2">
          {!isPostRegistration && menuItems.map((menuItem) => {
            const Icon = menuItem.icon;
            const isExpanded = expandedMenus.includes(
              menuItem.id,
            );
            const hasActiveSubItem = menuItem.subItems?.some(
              (sub) => sub.active,
            );

            return (
              <div 
                key={menuItem.id}
                onMouseEnter={(e) => {
                  if (isCollapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleMouseEnter(menuItem.id, rect.top);
                  }
                }}
                onMouseLeave={handleMouseLeave}
              >
                {/* Main Menu Item */}
                <button
                  onClick={() => {
                    if (menuItem.onClick) {
                      menuItem.onClick();
                    }
                    if (menuItem.subItems && menuItem.subItems.length > 0) {
                      toggleMenu(menuItem.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors focus:outline-none ${hasActiveSubItem || menuItem.active
                    ? "bg-[#F9B03D] text-[#172E4D] font-semibold"
                    : "text-white/90 hover:bg-[#F9B03D] hover:text-[#172E4D]"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? getLabel(menuItem.id, menuItem.label) : ""}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {Icon && (
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    )}
                    {!isCollapsed && (
                      <span className="text-sm truncate">
                        {getLabel(menuItem.id, menuItem.label)}
                      </span>
                    )}
                  </div>
                  {!isCollapsed &&
                    menuItem.subItems &&
                    menuItem.subItems.length > 0 && (
                      <span className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                </button>

                {/* Sub Menu Items */}
                {!isCollapsed &&
                  menuItem.subItems &&
                  menuItem.subItems.length > 0 &&
                  isExpanded && (
                    <div className="mt-1 ml-8 mr-2 space-y-1">
                      {menuItem.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={subItem.onClick}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none ${subItem.active
                            ? "bg-[#F9B03D] text-[#172E4D] font-semibold"
                            : "text-white/70 hover:bg-[#F9B03D] hover:text-[#172E4D]"
                            }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                          <span className="truncate">
                            {getLabel(subItem.id, subItem.label)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User profile removed from sidebar — available in the top-right header dropdown */}

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
            console.log(
              "Password change submitted:",
              passwordForm,
            );
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

      {/* Hover Flyout for Collapsed State */}
      {isCollapsed && hoveredFlyout && (
        <div
          className="fixed left-16 z-50 min-w-[200px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-2 ml-1"
          style={hoveredFlyout.isProfile ? { bottom: "16px" } : { top: hoveredFlyout.top }}
          onMouseEnter={() => handleMouseEnter(hoveredFlyout.id, hoveredFlyout.top, hoveredFlyout.isProfile)}
          onMouseLeave={handleMouseLeave}
        >
          {hoveredFlyout.isProfile ? (
            <div className="flex flex-col">
              <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">John Doe</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">john.doe@company.com</div>
              </div>
              <button 
                onClick={() => { setHoveredFlyout(null); onNavigate?.("my-profile"); }}
                className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                My Profile
              </button>
              <button 
                onClick={() => { setHoveredFlyout(null); if(onLogout) onLogout(); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="px-4 py-2 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 mb-1">
                {getLabel(hoveredFlyout.id, menuItems.find(m => m.id === hoveredFlyout.id)?.label || "")}
              </div>
              {menuItems.find(m => m.id === hoveredFlyout.id)?.subItems?.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setHoveredFlyout(null);
                    if (sub.onClick) sub.onClick();
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    sub.active 
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 dark:hover:text-primary-300"
                  }`}
                >
                  {getLabel(sub.id, sub.label)}
                </button>
              )) || (
                <button
                  onClick={() => {
                    setHoveredFlyout(null);
                    const item = menuItems.find(m => m.id === hoveredFlyout.id);
                    if (item?.onClick) item.onClick();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  Open {getLabel(hoveredFlyout.id, menuItems.find(m => m.id === hoveredFlyout.id)?.label || "")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
