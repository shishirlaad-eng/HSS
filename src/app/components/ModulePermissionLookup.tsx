// ─────────────────────────────────────────────────────────────
// HSS UK — Roles & Permissions › Module Permission Lookup
// Pick a module from dropdown and see what permissions each role has for it.
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import { Check, Minus, Search, Layers } from 'lucide-react';
import { availableModules, mockRoles, getRoleModulePermissions } from '../../mockAPI/rolesData';

const selectCls = 'h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function ModulePermissionLookup() {
  const [moduleId, setModuleId] = useState(availableModules[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const selectedModule = availableModules.find(m => m.id === moduleId) ?? availableModules[0];

  // Group modules by category to reflect the exact left sidebar structure
  const categories = useMemo(() => {
    const set = new Set<string>();
    availableModules.forEach(m => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, []);

  const roleRows = useMemo(() => {
    if (!selectedModule) return [];
    const q = query.trim().toLowerCase();

    return mockRoles
      .filter(role => {
        if (!q) return true;
        const matchName = role.name.toLowerCase().includes(q);
        const matchCode = role.code?.toLowerCase().includes(q);
        const matchDesc = role.description?.toLowerCase().includes(q);
        return matchName || matchCode || matchDesc;
      })
      .map(role => {
        const allowedIds = new Set(getRoleModulePermissions(role, selectedModule.id));
        const actions = selectedModule.actions.map(a => ({
          ...a,
          allowed: allowedIds.has(a.id),
        }));

        return {
          role,
          actions,
        };
      });
  }, [selectedModule, query]);

  const moduleDisplayName = selectedModule?.category && selectedModule.category !== selectedModule.name
    ? `${selectedModule.category} › ${selectedModule.name}`
    : selectedModule?.name;

  return (
    <div className="p-6">
      {/* Filter and selector toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary-500" />
            Module
          </label>
          <select
            value={moduleId}
            onChange={e => setModuleId(e.target.value)}
            className={`${selectCls} min-w-[320px] font-medium`}
          >
            {categories.map(cat => (
              <optgroup key={cat} label={cat}>
                {availableModules
                  .filter(m => m.category === cat)
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name === cat ? m.name : `${cat} › ${m.name}`} ({m.actions.length} action{m.actions.length === 1 ? '' : 's'})
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search roles…"
            className={`${selectCls} pl-8 w-[240px]`}
          />
        </div>
      </div>

      {/* Permissions Table (Only Role and Permissions columns) */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th
                className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 w-[280px]"
                style={{ position: 'static' }}
              >
                Role
              </th>
              <th
                className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                style={{ position: 'static' }}
              >
                Permissions in {moduleDisplayName}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {roleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-14 text-center text-sm text-neutral-400"
                >
                  No roles match the search criteria.
                </td>
              </tr>
            ) : (
              roleRows.map(({ role, actions }) => (
                <tr key={role.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 transition-colors">
                  {/* Role Name & Meta */}
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {role.name}
                      </span>
                      {role.status === 'inactive' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                        {role.description}
                      </p>
                    )}
                  </td>

                  {/* Action Badges in front of the role */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {actions.map(a => (
                        <span
                          key={a.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs transition-colors ${
                            a.allowed
                              ? 'bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border-success-200 dark:border-success-800 font-medium'
                              : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700'
                          }`}
                        >
                          {a.allowed ? (
                            <Check className="w-3 h-3 text-success-600 dark:text-success-400" />
                          ) : (
                            <Minus className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                          )}
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
