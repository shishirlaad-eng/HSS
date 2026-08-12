import { useState, useEffect } from "react";
import hssLogoOrange from "../assets/brand/hss/logos/hss-logo-orange.png";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { GlobalHeader } from "./components/GlobalHeader";
import UIKit from "./components/UIKit";
import SampleDesign from "./components/SampleDesign";
import MemberManagement from "./components/MemberManagement";
import EventManagement from "./components/EventManagement";
import StaticPages from "./components/StaticPages";
import SystemSettings from "./components/SystemSettings";
import SuperAdminMasters from "./components/SuperAdminMasters";
import EmailTemplates from "./components/EmailTemplates";
import RoleManagement from "./components/RoleManagement";
import LogsManagement from "./components/LogsManagement";
import LogsPage from "./components/LogsPage";
import PendingApprovals from "./components/PendingApprovals";
import PendingGuardianApprovals from "./components/PendingGuardianApprovals";
import Dashboard from "./components/Dashboard";
import Announcements from "./components/Announcements";
import Sessions from "./components/Sessions";
import AttendanceLog from "./components/AttendanceLog";
import MyProfile, { MEMBER_PROFILE_STORAGE_KEY, getChildStatus, setChildStatus } from "./components/MyProfile";
import MembersReport from "./components/MembersReport";
import EventsReport from "./components/EventsReport";
import DonationsPaymentsReport from "./components/DonationsPaymentsReport";
import AttendanceReport from "./components/AttendanceReport";
import RefundReport from "./components/RefundReport";
import KaryakartaReport from "./components/KaryakartaReport";
import AyuShreniReport from "./components/AyuShreniReport";
import { SiteMap } from "./components/SiteMap";
import { GlobalFooter } from "./components/GlobalFooter";
import { LanguageProvider } from "../i18n/LanguageContext";
import SuperAdminAuth from "./components/SuperAdminAuth";
import NonMemberDashboard from "./components/NonMemberDashboard";
import StripeDonation from "./components/StripeDonation";
import MyDonations from "./components/MyDonations";
import ComplianceManagement from "./components/ComplianceManagement";
import EmergencyDetails from "./components/EmergencyDetails";
import IncidentManagement from "./components/IncidentManagement";
import { RoleScopeProvider } from "./contexts/RoleScopeContext";

// ─── Placeholder shown for modules not yet built ──────────────────────────────
const PAGE_LABELS: Record<string, string> = {
  "report-members":             "Members Report",
  "report-events":              "Events Report",
  "report-donations":           "Nidhi Report",
  "report-attendance":          "Sankhya Report",
  "report-refunds":             "Refund Report",
  "report-karyakarta":          "Karyakarta Report",
  "report-ayu-shreni":          "Ayu Shreni Report",
  "role-types":                 "Responsibility",
};

function PlaceholderPage({ page }: { page: string }) {
  const label = PAGE_LABELS[page] ?? page;
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">{label}</h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
        This module is part of My HSS and will be implemented in the next development phase.
      </p>
    </div>
  );
}

// Demo children pre-attached to the "Member" login so the My Profile hover-flyout
// and "Other Profiles" tab (switch to a child profile) have something to show
// without a manual Add Child pass first — 2 Bal, 1 Kishor; 2 approved, 1 pending.
const DEMO_CHILDREN = [
  { id: "HSS-00099", firstName: "Aarav", surname: "Doe" },
  { id: "HSS-00098", firstName: "Ishaan", surname: "Doe" },
  { id: "HSS-00097", firstName: "Kavya", surname: "Doe" },
];
const CHILD_ACCOUNTS_STORAGE_KEY = "myMemberChildAccounts";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark";
    }
    return false;
  });

  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("colorTheme");
      const validThemes = ["hss-brand", "default-black", "ocean-blue", "emerald-green", "violet-purple", "amber-orange"];
      return validThemes.includes(saved || "") ? saved! : "hss-brand";
    }
    return "hss-brand";
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [menuOrientation, setMenuOrientation] = useState<
    "vertical" | "horizontal"
  >(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem(
          "menuOrientation",
        ) as "vertical" | "horizontal") || "vertical"
      );
    }
    return "vertical";
  });

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedRole, setSelectedRole] = useState("Super Admin");
  const [isPostRegistration, setIsPostRegistration] = useState(false);
  const [isUnderReview, setIsUnderReview] = useState(false);
  // Always reseed to the curated 3-child demo set on load — this is fixed demo data,
  // not something that should keep accumulating "John Doe" entries from prior testing.
  const [childAccounts, setChildAccounts] = useState<{ id: string; firstName: string; surname: string }[]>(DEMO_CHILDREN);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [nonMemberProfile, setNonMemberProfile] = useState<{ firstName: string; lastName: string; email: string; registeredAt: string } | null>(null);
  const [nonMemberChildren, setNonMemberChildren] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [nonMemberViewChildId, setNonMemberViewChildId] = useState<string | null>(null);
  const [nonMemberUpgrading, setNonMemberUpgrading] = useState(false);
  const [memberToView, setMemberToView] = useState<string | null>(null);
  const [memberToViewTab, setMemberToViewTab] = useState<string | undefined>(undefined);
  const [eventToView, setEventToView] = useState<string | null>(null);
  const [announcementToView, setAnnouncementToView] = useState<string | null>(null);

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("platformLogo") || null;
    }
    return null;
  });

  // Active logo: custom upload takes priority; otherwise use HSS brand orange logo
  const logoUrl = customLogoUrl || hssLogoOrange;

  const handleLogoChange = (newLogo: string) => {
    setCustomLogoUrl(newLogo);
    localStorage.setItem("platformLogo", newLogo);
  };

  useEffect(() => {
    // Remove any legacy non-data-URL logo so HSS brand logos are used by default
    const stored = localStorage.getItem("platformLogo");
    if (stored && !stored.startsWith("data:")) {
      localStorage.removeItem("platformLogo");
      setCustomLogoUrl(null);
    }
  }, []);

  useEffect(() => {
    // Seed each demo child's own profile (child, not adult defaults) so switching
    // to one shows a proper profile the first time, not blank fields — 2 Bal, 1
    // Kishor; 2 approved, 1 pending approval.
    const seeds: Record<string, { gender: string; dateOfBirth: string; town: string; activityCentre: string; status: 'approved' | 'pending' }> = {
      [DEMO_CHILDREN[0].id]: { gender: "Male",   dateOfBirth: "2012-06-10", town: "Wembley", activityCentre: "Wembley Activity Centre", status: "approved" }, // Kishor
      [DEMO_CHILDREN[1].id]: { gender: "Male",   dateOfBirth: "2022-03-15", town: "Harrow",  activityCentre: "Harrow Activity Centre",  status: "approved" }, // Bal
      [DEMO_CHILDREN[2].id]: { gender: "Female", dateOfBirth: "2023-01-10", town: "Wembley", activityCentre: "Wembley Activity Centre", status: "pending"  }, // Bal
    };
    DEMO_CHILDREN.forEach(child => {
      const seed = seeds[child.id];
      const key = `${MEMBER_PROFILE_STORAGE_KEY}:child:${child.id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({
          firstName: child.firstName,
          surname: child.surname,
          gender: seed.gender,
          dateOfBirth: seed.dateOfBirth,
          country: "HSS UK",
          region: "London & South East",
          town: seed.town,
          activityCentre: seed.activityCentre,
        }));
      }
      if (getChildStatus(child.id) === 'draft') setChildStatus(child.id, seed.status);
    });
  }, []);

  useEffect(() => {
    // Persist so children added via "Add Child" survive a page refresh — otherwise
    // the in-memory list resets to just the seeded demo child on reload.
    localStorage.setItem(CHILD_ACCOUNTS_STORAGE_KEY, JSON.stringify(childAccounts));
  }, [childAccounts]);

  /* -------------------- Theme Effects -------------------- */
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("colorTheme", currentTheme);
    document.documentElement.setAttribute(
      "data-theme",
      currentTheme,
    );
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem("menuOrientation", menuOrientation);
  }, [menuOrientation]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [currentPage]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsPostRegistration(false);
    setIsUnderReview(false);
    setActiveChildId(null);
    setNonMemberProfile(null);
    setNonMemberChildren([]);
    setNonMemberViewChildId(null);
    setNonMemberUpgrading(false);
    toast.success("You have been logged out.");
  };

  const handleNavigate = (pageId: string) => {
    if (isUnderReview && pageId !== 'my-profile') {
      toast.info('Profile is still under review. You will get access once approved.');
      return;
    }
    if (isPostRegistration && pageId !== 'my-profile') {
      toast.info('Complete your profile and submit for approval to access this section.');
      return;
    }
    setCurrentPage(pageId);
  };

  const MEMBER_ROLES = ["Adult Member", "Teen Member"];

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setCurrentPage("dashboard");
    setActiveChildId(null);
    // Member & Teen roles default to horizontal layout; all others use vertical
    const orientation = MEMBER_ROLES.includes(role) ? "horizontal" : "vertical";
    setMenuOrientation(orientation);
    localStorage.setItem("menuOrientation", orientation);
  };

  // Switch the "My Profile" page between the logged-in member's own profile (childId = null)
  // and one of their children's profiles.
  const handleSwitchProfile = (childId: string | null) => {
    setActiveChildId(childId);
    setIsPostRegistration(false);
    setIsUnderReview(false);
    setCurrentPage(childId ? "dashboard" : "my-profile");
  };

  const handleChildAdded = (child: { id: string; firstName: string; surname: string }) => {
    setChildAccounts(prev => [...prev, child]);
    setActiveChildId(child.id);
    setIsPostRegistration(true);
    setIsUnderReview(false);
    setCurrentPage("my-profile");
  };

  if (!isAuthenticated) {
    return (
      <SuperAdminAuth
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setSelectedRole("Super Admin");
          setCurrentPage("dashboard");
          setMenuOrientation("vertical");
          localStorage.setItem("menuOrientation", "vertical");
        }}
        onRegisterSuccess={(role) => {
          setIsAuthenticated(true);
          setSelectedRole(role);
          setIsPostRegistration(true);
          setCurrentPage('my-profile');
          const orientation = "horizontal";
          setMenuOrientation(orientation);
          localStorage.setItem("menuOrientation", orientation);
        }}
        onGuardianRegisterSuccess={(data) => {
          setNonMemberProfile({ ...data, registeredAt: new Date().toISOString() });
          setNonMemberChildren([]);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  if (nonMemberProfile && !nonMemberViewChildId && !nonMemberUpgrading) {
    return (
      <NonMemberDashboard
        profile={nonMemberProfile}
        childAccounts={nonMemberChildren}
        onAddChild={(child) => {
          setNonMemberChildren(prev => [...prev, { id: child.id, firstName: child.firstName, lastName: child.lastName }]);
        }}
        onViewChildProfile={(childId) => {
          setNonMemberViewChildId(childId);
          setSelectedRole('Adult Member');
          setActiveChildId(childId);
          setIsPostRegistration(false);
          setIsUnderReview(false);
          setCurrentPage('dashboard');
          setMenuOrientation('horizontal');
          localStorage.setItem('menuOrientation', 'horizontal');
        }}
        onUpgrade={() => {
          setNonMemberUpgrading(true);
          setSelectedRole('Adult Member');
          setActiveChildId(null);
          setIsPostRegistration(true);
          setIsUnderReview(false);
          setCurrentPage('my-profile');
          setMenuOrientation('horizontal');
          localStorage.setItem('menuOrientation', 'horizontal');
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LanguageProvider>
    <RoleScopeProvider selectedRole={selectedRole}>
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() =>
          setIsSidebarCollapsed(!isSidebarCollapsed)
        }
        currentPage={currentPage}
        onNavigate={handleNavigate}
        logoUrl={logoUrl}
        menuOrientation={menuOrientation}
        selectedRole={selectedRole}
        isPostRegistration={isPostRegistration || isUnderReview}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          menuOrientation === "horizontal"
            ? "ml-0"
            : isSidebarCollapsed
              ? "ml-16"
              : "ml-64"
        }`}
      >
        {/* Global Header */}
        <GlobalHeader
          isDarkMode={isDark}
          onToggleDarkMode={() => setIsDark(!isDark)}
          isSidebarCollapsed={isSidebarCollapsed}
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          logoUrl={logoUrl}
          menuOrientation={menuOrientation}
          onMenuOrientationChange={setMenuOrientation}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          selectedRole={selectedRole}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
          isPostRegistration={isPostRegistration || isUnderReview}
          childAccounts={MEMBER_ROLES.includes(selectedRole) ? childAccounts : []}
          activeChildId={activeChildId}
          onSwitchProfile={handleSwitchProfile}
        />

        {/* Page Content */}
        {/* ── Existing implemented pages ── */}
        {currentPage === "donate" ? (
          <StripeDonation onBack={() => handleNavigate("dashboard")} />
        ) : currentPage === "my-donations" ? (
          <MyDonations onGiveDakshina={() => handleNavigate("donate")} />
        ) : currentPage === "dashboard" ? (
          <Dashboard
            onNavigate={handleNavigate}
            onNavigateToEvent={(id) => { setEventToView(id); setCurrentPage('event-management'); }}
            onNavigateToAnnouncement={(id) => { setAnnouncementToView(id); setCurrentPage('announcements'); }}
            childAccounts={(MEMBER_ROLES.includes(selectedRole) && !activeChildId) ? childAccounts : []}
            onSwitchProfile={handleSwitchProfile}
            activeChildId={activeChildId}
            onBack={(nonMemberViewChildId || nonMemberUpgrading) ? () => {
              setNonMemberViewChildId(null);
              setNonMemberUpgrading(false);
              setActiveChildId(null);
              setCurrentPage('dashboard');
            } : undefined}
            backLabel={(nonMemberViewChildId || nonMemberUpgrading) ? "Back to Dashboard" : undefined}
          />
        ) : currentPage === "members" ? (
          <MemberManagement
            key="members"
            initialMemberId={memberToView}
            onConsumeInitialMember={() => { setMemberToView(null); setMemberToViewTab(undefined); }}
            initialMemberTab={memberToViewTab}
          />
        ) : currentPage === "karyakartas" ? (
          <MemberManagement key="karyakartas" karyakartasOnly={true} />
        ) : currentPage === "compliance" ? (
          <ComplianceManagement
            onNavigateToMember={(id) => {
              setMemberToView(id);
              setMemberToViewTab('compliance');
              setCurrentPage('members');
            }}
          />
        ) : currentPage === "emergency-details" ? (
          <EmergencyDetails
            onNavigateToMember={(id) => {
              setMemberToView(id);
              setCurrentPage('members');
            }}
          />
        ) : currentPage === "pending-approvals" ? (
          <PendingApprovals />
        ) : currentPage === "pending-guardian-approvals" ? (
          <PendingGuardianApprovals />
        ) : currentPage === "role-management" ? (
          <RoleManagement />
        ) : currentPage === "event-management" ? (
          <EventManagement
            onNavigateToMember={(id) => {
              setMemberToView(id);
              setCurrentPage("members");
            }}
            initialEventId={eventToView}
            onConsumeInitialEvent={() => setEventToView(null)}
          />
        ) : currentPage === "configurable-lists" ? (
          <SuperAdminMasters masterType="configurable-lists" onNavigate={handleNavigate} selectedRole={selectedRole} />
        ) : currentPage === "country" ? (
          <SuperAdminMasters masterType="country"    onNavigate={handleNavigate} selectedRole={selectedRole} />
        ) : currentPage === "region" ? (
          <SuperAdminMasters masterType="region"     onNavigate={handleNavigate} selectedRole={selectedRole} />
        ) : currentPage === "town" ? (
          <SuperAdminMasters masterType="town"       onNavigate={handleNavigate} selectedRole={selectedRole} />
        ) : currentPage === "centre" ? (
          <SuperAdminMasters masterType="centre"     onNavigate={handleNavigate} selectedRole={selectedRole} />
        ) : currentPage === "system-settings" ? (
          <SystemSettings logoUrl={logoUrl} onLogoChange={handleLogoChange} />
        ) : currentPage === "static-pages" ? (
          <StaticPages />
        ) : currentPage === "email-templates" ? (
          <EmailTemplates />
        ) : currentPage === "announcements" ? (
          <Announcements
            initialAnnouncementId={announcementToView}
            onConsumeInitialAnnouncement={() => setAnnouncementToView(null)}
          />
        ) : currentPage === "first-aid-incidents" ? (
          <IncidentManagement />
        ) : currentPage === "sessions" ? (
          <Sessions />
        ) : currentPage === "attendance-log" ? (
          <AttendanceLog />
        ) : currentPage === "report-members" ? (
          <MembersReport />
        ) : currentPage === "report-events" ? (
          <EventsReport />
        ) : currentPage === "report-donations" ? (
          <DonationsPaymentsReport />
        ) : currentPage === "report-attendance" ? (
          <AttendanceReport />
        ) : currentPage === "report-refunds" ? (
          <RefundReport />
        ) : currentPage === "report-karyakarta" ? (
          <KaryakartaReport />
        ) : currentPage === "report-ayu-shreni" ? (
          <AyuShreniReport />
        ) : currentPage === "my-profile" ? (
          <MyProfile
            selectedRole={selectedRole}
            isPostRegistration={isPostRegistration}
            isUnderReview={isUnderReview}
            onSubmitForApproval={() => {
              if (activeChildId) setChildStatus(activeChildId, 'pending');
              setIsPostRegistration(false);
              setIsUnderReview(true);
            }}
            activeChildId={activeChildId}
            onChildAdded={handleChildAdded}
            childAccounts={(MEMBER_ROLES.includes(selectedRole) && !activeChildId) ? childAccounts : []}
            onSelectOtherProfile={(childId) => {
              const status = getChildStatus(childId);
              setActiveChildId(childId);
              setIsPostRegistration(status === 'draft');
              setIsUnderReview(status === 'pending');
            }}
            onBack={(nonMemberViewChildId || nonMemberUpgrading) ? () => {
              setNonMemberViewChildId(null);
              setNonMemberUpgrading(false);
              setActiveChildId(null);
              setCurrentPage('dashboard');
            } : undefined}
            backLabel={(nonMemberViewChildId || nonMemberUpgrading) ? "Back to Dashboard" : undefined}
            carriedOverDetails={nonMemberUpgrading && nonMemberProfile ? {
              firstName: nonMemberProfile.firstName,
              lastName: nonMemberProfile.lastName,
              email: nonMemberProfile.email,
            } : undefined}
          />
        ) : currentPage === "logs" ? (
          <LogsPage />

        /* ── Developer reference pages (files kept, hidden from prod nav) ── */
        ) : currentPage === "ui-kit" ? (
          <UIKit />
        ) : currentPage === "sample-design" ? (
          <SampleDesign />
        ) : currentPage === "site-map" ? (
          <SiteMap onNavigate={handleNavigate} currentPage={currentPage} />

        /* ── Placeholder pages (components to be built per module) ── */
        ) : (
          <PlaceholderPage page={currentPage} />
        )}

        {/* Global Footer */}
        <GlobalFooter 
          isSidebarCollapsed={isSidebarCollapsed} 
          menuOrientation={menuOrientation} 
        />
      </main>

      {/* Toast */}
      <Toaster
        position="top-right"
        expand
        richColors
        closeButton
        theme={isDark ? "dark" : "light"}
      />
    </div>
    </RoleScopeProvider>
    </LanguageProvider>
  );
}
