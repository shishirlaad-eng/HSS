import { useState, useMemo } from 'react';
import { User, Shield, Mail } from 'lucide-react';
import LogsManagement, { LogModuleType } from './LogsManagement';
import { useModulePermissions } from '../contexts/RoleScopeContext';

interface Tab {
  id: LogModuleType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
}

const ALL_TABS: Tab[] = [
  { id: 'login', label: 'Login Logs',  icon: User,   action: 'login_view' },
  { id: 'audit', label: 'Audit Logs',  icon: Shield, action: 'audit_view' },
  { id: 'email', label: 'Email Logs',  icon: Mail,   action: 'email_view' },
];

export default function LogsPage() {
  const alp = useModulePermissions('audit-logs');
  const tabs = useMemo(() => ALL_TABS.filter(tab => alp.has(tab.action)), [alp]);
  const [activeTab, setActiveTab] = useState<LogModuleType>(tabs[0]?.id ?? 'login');

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      {/* Tab bar — uses existing platform tab pattern (border-bottom active indicator) */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <nav
          className="flex items-center px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label="Log type tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0 ${
                  isActive
                    ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content — key forces clean remount so column/filter state resets per tab */}
      <LogsManagement key={activeTab} type={activeTab} />
    </div>
  );
}
