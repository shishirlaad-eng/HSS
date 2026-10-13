// ─────────────────────────────────────────────────────────────
// HSS UK — Roles & Permissions (Settings)
// Two separate screens: Permissions (per-role lookup and editing) and Roles (the role list).
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import RoleManagement from './RoleManagement';
import PermissionLookup from './PermissionLookup';

type RolesTab = 'roles' | 'lookup';

const TABS: { id: RolesTab; label: string }[] = [
  { id: 'lookup', label: 'Permissions' },
  { id: 'roles',  label: 'Roles'       },
];

export default function RolesPermissions() {
  const [tab, setTab] = useState<RolesTab>('lookup');
  // The role detail / edit page is its own screen — the tabs only show on the listing screens.
  const [roleDetailOpen, setRoleDetailOpen] = useState(false);

  return (
    <div>
      {!roleDetailOpen && (
      <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-6">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
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

      )}

      {tab === 'roles' && <RoleManagement onEditingChange={setRoleDetailOpen} />}
      {tab === 'lookup' && <PermissionLookup />}
    </div>
  );
}
