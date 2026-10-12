// ─────────────────────────────────────────────────────────────
// HSS UK — Roles & Permissions › Module Permissions
// The Permissions tab the other way round: pick a module, see every role with
// the actions it is allowed in that module.
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import { Check, Minus, Search } from 'lucide-react';
import { availableModules, mockRoles } from '../../mockAPI/rolesData';

const selectCls = 'h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';

export default function ModulePermissions() {
  const [moduleId, setModuleId] = useState(availableModules[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const mod = availableModules.find(m => m.id === moduleId);

  const rows = useMemo(() => {
    if (!mod) return [];
    const q = query.trim().toLowerCase();
    return mockRoles
      .filter(r => !q || r.name.toLowerCase().includes(q))
      .map(role => {
        const allowedIds = new Set(role.permissions?.[mod.id] ?? []);
        const actions = mod.actions.map(a => ({ ...a, allowed: allowedIds.has(a.id) }));
        return { role, actions, allowedCount: actions.filter(a => a.allowed).length };
      });
  }, [mod, query]);

  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Module Permissions</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Pick a module to see which actions each role can perform in it.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Module</label>
        <select value={moduleId} onChange={e => setModuleId(e.target.value)} className={`${selectCls} min-w-[260px]`}>
          {availableModules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search roles…" className={`${selectCls} pl-8 w-[220px]`} />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 w-[240px]" style={{ position: 'static' }}>Role</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300" style={{ position: 'static' }}>{mod?.name} Permissions</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap" style={{ position: 'static' }}>Allowed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-14 text-center text-sm text-neutral-400">No roles match.</td></tr>
            ) : rows.map(({ role, actions, allowedCount }) => (
              <tr key={role.id}>
                <td className="px-4 py-3 align-top">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{role.name}</p>
                  <p className="text-xs text-neutral-400">{role.status === 'active' ? 'Active' : 'Inactive'}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {actions.map(a => (
                      <span
                        key={a.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${
                          a.allowed
                            ? 'bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border-success-200 dark:border-success-800'
                            : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {a.allowed ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {a.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap align-top">{allowedCount} / {actions.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
