// ─────────────────────────────────────────────────────────────
// HSS UK — Roles & Permissions (Settings)
// Three tabs: Role Permissions, Module Permissions, and Role Management.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import RoleManagement from './RoleManagement';
import PermissionLookup from './PermissionLookup';
import ModulePermissionLookup from './ModulePermissionLookup';
import { PageHeader } from './hb/listing';

type RolesTab = 'lookup' | 'module-lookup' | 'roles';

const TABS: { id: RolesTab; label: string; subtext: string }[] = [
  { id: 'lookup',        label: 'Role Permissions',   subtext: 'View and manage Role permissions' },
  { id: 'module-lookup', label: 'Module Permissions', subtext: 'View Role permissions by module' },
  { id: 'roles',         label: 'Role Management',    subtext: 'View, edit and create Roles for MyHSS' },
];

export default function RolesPermissions() {
  const [tab, setTab] = useState<RolesTab>('lookup');
  const currentTab = TABS.find(t => t.id === tab) || TABS[0];

  return (
    <div>
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-6 pt-6">
        <PageHeader
          title="Roles and Permissions"
          subtitle={currentTab.subtext}
        />
        <div className="flex gap-1 -mb-px">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-primary-600 text-primary-700 dark:text-primary-300 dark:border-primary-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tab === 'lookup' && <PermissionLookup />}
        {tab === 'module-lookup' && <ModulePermissionLookup />}
        {tab === 'roles' && <RoleManagement />}
      </div>
    </div>
  );
}
