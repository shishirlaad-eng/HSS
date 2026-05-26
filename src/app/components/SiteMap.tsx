import React from "react";
import { getNavigationData } from "../../mockAPI/navigationData";
import { useLanguage } from "../../i18n/LanguageContext";
import { ChevronRight } from "lucide-react";

interface SiteMapProps {
  onNavigate: (pageId: string) => void;
  currentPage: string;
}

export function SiteMap({ onNavigate, currentPage }: SiteMapProps) {
  const { t } = useLanguage();

  const navLabelMap: Record<string, string> = {
    "dashboard": t.nav.dashboard,
    "site-map": t.nav.siteMap,
    "hb-templates": t.nav.hbTemplates,
    "ui-kit": t.nav.uiKit,
    "sample-design": t.nav.samplePage,
    "user-management-group": t.nav.userManagement,
    "user-management": t.nav.users,
    "event-management-group": t.nav.eventManagement,
    "event-management": t.nav.events,
    "organisational-master": t.nav.organisationalMaster,
    "country": t.nav.country,
    "state": t.nav.state,
    "city": t.nav.city,
    "configurations-group": t.nav.configurations,
    "role-management": t.nav.roleManagement,
    "static-pages": t.nav.staticPages,
    "email-templates": t.nav.emailTemplates,
    "system-notifications": t.nav.systemNotifications,
    "system-settings": t.nav.systemSettings,
    "logs-group": t.nav.logs,
    "login-logs": t.nav.loginLogs,
    "audit-logs": t.nav.auditLogs,
    "api-logs": t.nav.apiLogs,
    "email-logs": t.nav.emailLogs,
    "logs": t.nav.logs,
  };

  const getLabel = (id: string, fallback: string) => navLabelMap[id] ?? fallback;

  // Retrieve full navigation structure
  const navData = getNavigationData(currentPage, onNavigate);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 
          style={{ fontSize: '24px', lineHeight: '32px' }} 
          className="font-semibold text-neutral-900 dark:text-white"
        >
          {getLabel("site-map", "Site Map")}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          A centralized overview of all modules and screens available in the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
        {navData.map((module) => {
          const ModuleIcon = module.icon;
          const hasChildren = module.subItems && module.subItems.length > 0;

          return (
            <div
              key={module.id}
              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-[260px]"
            >
              <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-2.5 flex-none">
                {ModuleIcon && (
                  <div className="p-1.5 bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm text-primary-600 dark:text-primary-400">
                    <ModuleIcon className="w-4 h-4" />
                  </div>
                )}
                <h2 
                  style={{ fontSize: '17px', lineHeight: '24px' }} 
                  className="font-medium text-neutral-900 dark:text-white"
                >
                  {getLabel(module.id, module.label)}
                </h2>
              </div>

              <div className="p-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
                {hasChildren ? (
                  <ul className="space-y-1">
                    {module.subItems!.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => {
                            if (child.onClick) child.onClick();
                            else onNavigate(child.id);
                          }}
                          className="w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-[13px] text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors group cursor-pointer"
                        >
                          <span>{getLabel(child.id, child.label)}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-1 py-1">
                    <button
                      onClick={() => {
                        if (module.onClick) module.onClick();
                        else onNavigate(module.id);
                      }}
                      className="w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-[13px] text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors group cursor-pointer"
                    >
                      <span>Go to {getLabel(module.id, module.label)}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
