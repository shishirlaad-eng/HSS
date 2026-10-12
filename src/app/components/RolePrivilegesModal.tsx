// ─────────────────────────────────────────────────────────────
// HSS UK — Role Privileges (pop-up)
// Opened from Roles & Permissions › Permission Lookup via "Edit Permissions".
// Module list on the left, action checkboxes on the right; Save writes the
// role's permissions.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { availableModules, Role } from '../../mockAPI/rolesData';
import { PrimaryButton, SecondaryButton } from './hb/listing';

export default function RolePrivilegesModal({
  role,
  onClose,
  onSaved,
}: {
  role: Role;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [perms, setPerms] = useState<Record<string, string[]>>(() => {
    const copy: Record<string, string[]> = {};
    Object.entries(role.permissions ?? {}).forEach(([k, v]) => { copy[k] = [...v]; });
    return copy;
  });
  const [activeModuleId, setActiveModuleId] = useState(availableModules[0]?.id ?? '');

  const activeModule = availableModules.find(m => m.id === activeModuleId);
  const activePerms = perms[activeModuleId] ?? [];

  const toggle = (moduleId: string, actionId: string) => {
    setPerms(prev => {
      const cur = prev[moduleId] ?? [];
      return { ...prev, [moduleId]: cur.includes(actionId) ? cur.filter(id => id !== actionId) : [...cur, actionId] };
    });
  };

  const toggleAll = (moduleId: string) => {
    const mod = availableModules.find(m => m.id === moduleId);
    if (!mod) return;
    const all = mod.actions.map(a => a.id);
    setPerms(prev => ({ ...prev, [moduleId]: (prev[moduleId] ?? []).length === all.length ? [] : all }));
  };

  const handleSave = () => {
    role.permissions = perms;
    role.lastUpdated = new Date().toISOString();
    toast.success(`Privileges updated for ${role.name}.`);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xl w-full max-w-5xl flex flex-col h-[700px] max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div>
            <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Role Privileges — {role.name}</h3>
            <p className="text-xs text-neutral-500">Configure module-level access and action permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton size="sm" onClick={handleSave}>Save Privileges</PrimaryButton>
            <button onClick={onClose} aria-label="Close" className="ml-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Module list */}
          <div className="w-1/3 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto slim-scroll bg-neutral-50/30 dark:bg-neutral-900/30">
            {availableModules.map(module => {
              const selectedCount = (perms[module.id] ?? []).length;
              const totalCount = module.actions.length;
              const isActive = activeModuleId === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={`w-full flex items-center justify-between px-4 py-4 border-b border-neutral-100 dark:border-neutral-800 transition-all text-left group ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/50 border-r-2 border-r-primary-500'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }`}
                >
                  <span className={`text-sm font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>
                    {module.name}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedCount === totalCount
                      ? 'bg-success-100 text-success-600 dark:bg-success-950 dark:text-success-400'
                      : selectedCount > 0
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500'
                  }`}>
                    {selectedCount}/{totalCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Actions grid */}
          <div className="w-2/3 p-6 overflow-y-auto slim-scroll">
            {activeModule && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{activeModule.name} Permissions</h4>
                  <button onClick={() => toggleAll(activeModule.id)} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    {activePerms.length === activeModule.actions.length ? 'Unselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeModule.actions.map(action => {
                    const isSelected = activePerms.includes(action.id);
                    return (
                      <div
                        key={action.id}
                        onClick={() => toggle(activeModule.id, action.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">{action.name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{action.code}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
