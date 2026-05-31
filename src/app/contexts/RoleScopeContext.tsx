import { createContext, useContext, useMemo, ReactNode } from 'react';
import { getRoleScope, RoleScope } from '../../mockAPI/roleScope';
import { mockRoles } from '../../mockAPI/rolesData';

interface RoleScopeContextValue {
  selectedRole: string;
  scope: RoleScope;
}

export const RoleScopeContext = createContext<RoleScopeContextValue>({
  selectedRole: 'Super Admin',
  scope: getRoleScope('Super Admin'),
});

export function RoleScopeProvider({
  selectedRole,
  children,
}: {
  selectedRole: string;
  children: ReactNode;
}) {
  return (
    <RoleScopeContext.Provider
      value={{ selectedRole, scope: getRoleScope(selectedRole) }}
    >
      {children}
    </RoleScopeContext.Provider>
  );
}

export function useRoleScope() {
  return useContext(RoleScopeContext);
}

// ─────────────────────────────────────────────────────────────
// useModulePermissions — returns action flags for a given module
// Usage: const { canAdd, canEdit } = useModulePermissions('members')
// ─────────────────────────────────────────────────────────────
export function useModulePermissions(moduleId: string) {
  const { selectedRole } = useRoleScope();

  return useMemo(() => {
    const role = mockRoles.find(r => r.name === selectedRole);
    const actions = new Set<string>(role?.permissions?.[moduleId] ?? []);
    return {
      canView:             actions.has('view'),
      canAdd:              actions.has('add'),
      canEdit:             actions.has('edit'),
      canDelete:           actions.has('delete'),
      canExport:           actions.has('export'),
      canApprove:          actions.has('approve'),
      canApproveGuardian:  actions.has('approve_guardian'),
      canCancel:           actions.has('cancel'),
      canStatus:           actions.has('status'),
      canViewLog:          actions.has('view_log'),
      /** Generic check for any custom action */
      has: (action: string) => actions.has(action),
    };
  }, [selectedRole, moduleId]);
}
