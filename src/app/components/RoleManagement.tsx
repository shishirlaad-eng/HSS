import { 
  useState, 
  useMemo, 
  useEffect,
  useRef 
} from 'react';
import {
  Shield,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Copy,
  Trash2,
  RefreshCw,
  Download,
  Check,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List as ListIcon,
  Filter,
  Users as UsersIcon,
  Clock,
  FileSpreadsheet,
  FileText,
  BarChart3,
  X
} from 'lucide-react';
import {
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
  PrimaryButton,
  SecondaryButton,
  ColumnVisibilityPanel,
  SummaryWidgets,
  useStickyListingHeader,
  type ColumnConfig
} from './hb/listing';
import {
  FormSection,
  FormField,
  FormLabel,
  FormInput,
  StatusSlider,
  ErrorText,
} from './hb/common';
import { mockRoles, availableModules, Role, ModulePermission } from '../../mockAPI/rolesData';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'sonner';
import { useModulePermissions, useRoleScope } from '../contexts/RoleScopeContext';

type ViewMode = 'grid' | 'table';

export default function RoleManagement({ onEditingChange }: { onEditingChange?: (editing: boolean) => void } = {}) {
  const rp = useModulePermissions('rbac');
  const { selectedRole: currentSystemRole } = useRoleScope();
  const isSuperAdmin = currentSystemRole === 'Super Admin';

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [version, setVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting state
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();
  const roleColumns: ColumnConfig[] = [
    { key: 'name', label: 'Role Name' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'lastUpdated', label: 'Updated Date' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    description: true,
    status: true,
    lastUpdated: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    level: '' as string,
  });
  const [activeModuleId, setActiveModuleId] = useState<string>(availableModules?.[0]?.id || '');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});

  // Reset form when editing/creating
  useEffect(() => {
    if (selectedRole) {
      setFormData({
        name: selectedRole.name,
        code: selectedRole.code,
        description: selectedRole.description,
        status: selectedRole.status,
        level: (selectedRole as any).level ?? '',
      });
      setRolePermissions(selectedRole.permissions);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'active',
        level: '',
      });
      setRolePermissions({});
    }
    if (availableModules && availableModules.length > 0) {
      setActiveModuleId(availableModules[0].id);
    }
  }, [selectedRole, isEditing]);

  // Let a parent (the Roles & Permissions tabs) know when the detail/edit page is open.
  useEffect(() => {
    onEditingChange?.(isEditing);
    return () => onEditingChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setIsEditing(true);
    setRoleErrors({});
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(true);
    setRoleErrors({});
  };

  const handleClone = (role: Role) => {
    const clonedRole = {
      ...role,
      id: '',
      name: `${role.name} (Copy)`,
      code: `${role.code}_copy`,
    };
    setSelectedRole(clonedRole);
    setIsEditing(true);
    setRoleErrors({});
    toast.info(`Cloning role: ${role.name}`);
  };

  const handleDelete = (role: Role) => {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      const idx = mockRoles.findIndex(r => r.id === role.id);
      if (idx !== -1) {
        mockRoles.splice(idx, 1);
      }
      setVersion(v => v + 1);
      toast.success(`Role "${role.name}" deleted successfully.`);
    }
  };

  const [roleErrors, setRoleErrors] = useState<Record<string, boolean>>({});
  const roleNameRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const trimmedName = formData.name.trim();
    const errs = {
      name: !trimmedName,
    };
    if (errs.name) {
      setRoleErrors(errs);
      toast.error('Please fill in all required fields.');
      const el = roleNameRef.current;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
      return;
    }
    setRoleErrors({});

    if (selectedRole?.id) {
      const existing = mockRoles.find(r => r.id === selectedRole.id);
      if (existing) {
        existing.name = trimmedName;
        existing.description = formData.description;
        existing.status = formData.status;
        existing.lastUpdated = new Date().toISOString();
      }
    } else {
      const newRole: Role = {
        id: `role_${Date.now()}`,
        name: trimmedName,
        code: trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        description: formData.description,
        status: formData.status,
        permissions: {},
        lastUpdated: new Date().toISOString(),
      };
      mockRoles.unshift(newRole);
    }

    setVersion(v => v + 1);
    toast.success(`Role ${selectedRole?.id ? 'updated' : 'created'} successfully.`);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRoleErrors({});
  };

  const togglePermission = (moduleId: string, actionId: string) => {
    setRolePermissions(prev => {
      const modulePerms = prev[moduleId] || [];
      const nextPerms = modulePerms.includes(actionId)
        ? modulePerms.filter(id => id !== actionId)
        : [...modulePerms, actionId];
      
      return { ...prev, [moduleId]: nextPerms };
    });
  };

  const toggleSelectAllModule = (moduleId: string) => {
    const module = availableModules.find(m => m.id === moduleId);
    if (!module) return;

    const currentPerms = rolePermissions[moduleId] || [];
    const allActionIds = module.actions.map(a => a.id);

    if (currentPerms.length === allActionIds.length) {
      // Unselect all
      setRolePermissions(prev => ({ ...prev, [moduleId]: [] }));
    } else {
      // Select all
      setRolePermissions(prev => ({ ...prev, [moduleId]: allActionIds }));
    }
  };

  // Memoized Data
  const filteredRoles = useMemo(() => {
    return mockRoles.filter(role => {
      if (role.code === 'super_admin') return false; // Super Admin always has full access — not editable here
      const matchesSearch =
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, version]);

  const sortedRoles = useMemo(() => {
    return [...filteredRoles].sort((a, b) => {
      const aVal = (a as any)[sortField] || '';
      const bVal = (b as any)[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRoles, sortField, sortDirection]);

  const paginatedRoles = useMemo(() => {
    if (itemsPerPage === 0) return sortedRoles;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRoles.slice(start, start + itemsPerPage);
  }, [sortedRoles, currentPage, itemsPerPage]);

  // Auto-close column visibility panel when leaving table view
  useEffect(() => {
    if (viewMode !== 'table') {
      setShowColumnPanel(false);
    }
  }, [viewMode]);

  // Enhanced Export handler (CSV/PDF)
  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedIds.size > 0 
      ? sortedRoles.filter(role => selectedIds.has(role.id))
      : sortedRoles;

    if (dataToExport.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    const columnsToExport = roleColumns.filter(col => visibleColumns[col.key]);

    if (format === 'excel') {
      const headers = columnsToExport.map(col => `"${col.label}"`).join(',');
      const rows = dataToExport.map(item =>
        columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'lastUpdated') val = formatDate(val);
          return `"${String(val || '').replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `roles_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${dataToExport.length} roles to Excel.`);
    } else {
      let reportContent = `ROLE REPORT - Generated on ${formatDate(new Date())}\n`;
      reportContent += `Total Records: ${dataToExport.length}\n\n`;
      reportContent += columnsToExport.map(col => col.label.padEnd(25)).join('') + '\n';
      reportContent += '='.repeat(columnsToExport.length * 25) + '\n';

      dataToExport.forEach(item => {
        reportContent += columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'lastUpdated') val = formatDate(val);
          return String(val || '').substring(0, 23).padEnd(25);
        }).join('') + '\n';
      });

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `roles_export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${dataToExport.length} roles to PDF.`);
    }
  };

  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filteredRoles.length / itemsPerPage);

  // Helper: Status Badge
  const getStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        isActive
          ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950 dark:text-success-400 dark:border-success-800'
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 ml-1 inline-block" />
    );
  };

  // ========== LISTING VIEW ==========
  const renderListing = () => (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-neutral-50 dark:bg-neutral-950 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
              placeholder="Search roles..."
            />
            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={roleColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
          </div>

          <div className="flex items-center gap-2">
            {rp.canAdd && (
              <PrimaryButton icon={Plus} onClick={handleCreate}>
                Add Role
              </PrimaryButton>
            )}

            <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
            <IconButton icon={RefreshCw} onClick={() => setVersion(v => v + 1)} title="Refresh" />

            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: FileSpreadsheet, label: 'Export as Excel', onClick: () => handleExport('excel') },
                { icon: FileText, label: 'Export as PDF', onClick: () => handleExport('pdf') },
              ]}
            />
            
            <ViewModeSwitcher
              currentMode={viewMode}
              onChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* SUMMARY WIDGETS */}
      {showSummary && (
        <SummaryWidgets
          title="Role Summary"
          widgets={[
            { label: 'Total Roles', value: mockRoles.filter(r => r.code !== 'super_admin').length, icon: 'Briefcase' },
            { label: 'Active Roles', value: mockRoles.filter(r => r.code !== 'super_admin' && r.status === 'active').length, icon: 'CheckCircle' },
            { label: 'Inactive Roles', value: mockRoles.filter(r => r.code !== 'super_admin' && r.status === 'inactive').length, icon: 'XCircle' },
          ]}
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedRoles.map((role) => (
            <div
              key={role.id}
              className={`bg-white dark:bg-neutral-950 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer relative group flex flex-col ${
                selectedIds.has(role.id)
                  ? 'border-primary-300 dark:border-primary-600 bg-primary-50/10'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
              onClick={() => handleEdit(role)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {!isSuperAdmin && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(role.id)}
                      onChange={() => toggleSelection(role.id)}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                    />
                  )}
                  <IconButton
                    icon={MoreVertical}
                    borderless={true}
                    menuItems={[
                      { icon: Eye, label: 'View Role', onClick: () => handleEdit(role) },
                      ...(rp.canEdit   ? [{ icon: Edit2,     label: 'Edit Role',     onClick: () => handleEdit(role) }]   : []),
                      ...(rp.canAdd    ? [{ icon: Copy,      label: 'Clone Role',    onClick: () => handleClone(role) }]  : []),
                      ...(rp.canDelete ? [{ icon: RefreshCw, label: 'Change Status', onClick: () => {} }]                : []),
                      ...(rp.canDelete ? [{ icon: Trash2,    label: 'Delete Role',   onClick: () => handleDelete(role), variant: 'danger' as any }] : []),
                    ]}
                  />
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate mb-0.5">
                  {role.name}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 h-10">
                  {role.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span>{role.userCount} Users</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(role.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end items-center mt-auto" onClick={e => e.stopPropagation()}>
                {getStatusBadge(role.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-visible shadow-sm">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  {!isSuperAdmin && (
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedRoles.length && paginatedRoles.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(paginatedRoles.map(r => r.id)));
                          else setSelectedIds(new Set());
                        }}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th onClick={() => handleSort('name')} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      Role Name {renderSortArrow('name')}
                    </th>
                  )}
                  {visibleColumns.description && (
                    <th className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Description
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th onClick={() => handleSort('status')} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      Status {renderSortArrow('status')}
                    </th>
                  )}
                  {visibleColumns.lastUpdated && (
                    <th onClick={() => handleSort('lastUpdated')} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      Updated Date {renderSortArrow('lastUpdated')}
                    </th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginatedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer" onClick={() => handleEdit(role)}>
                    {!isSuperAdmin && (
                      <td className="p-4" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(role.id)}
                          onChange={() => toggleSelection(role.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        />
                      </td>
                    )}
                    {visibleColumns.name && (
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                        {role.name}
                      </td>
                    )}
                    {visibleColumns.description && (
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {role.description}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-6 py-4">
                        {getStatusBadge(role.status)}
                      </td>
                    )}
                    {visibleColumns.lastUpdated && (
                      <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(role.lastUpdated)}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <IconButton
                        icon={MoreVertical}
                        borderless={true}
                        menuItems={[
                          { icon: Eye, label: 'View Role', onClick: () => handleEdit(role) },
                          { icon: Edit2, label: 'Edit Role', onClick: () => handleEdit(role) },
                          { icon: Copy, label: 'Clone Role', onClick: () => handleClone(role) },
                          { icon: Trash2, label: 'Delete Role', onClick: () => handleDelete(role), variant: 'danger' as any },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredRoles.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
      />
    </div>
  );

  // ========== ROLE MODAL (ADD / EDIT POP-UP) ==========
  const renderRoleModal = () => {
    const isNew = !selectedRole?.id;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={handleCancel}>
        <div
          className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div>
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">
                {isNew ? 'Add Role' : `Edit Role — ${selectedRole.name}`}
              </h3>
              <p className="text-xs text-neutral-500">
                {isNew ? 'Create a new role for MyHSS' : 'Update role details and status'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                aria-label="Close"
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto space-y-4">
            <FormField>
              <FormLabel required>Role Name</FormLabel>
              <FormInput
                ref={roleNameRef}
                placeholder="Enter role name"
                value={formData.name}
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  setRoleErrors(prev => ({ ...prev, name: false }));
                }}
                className={roleErrors.name ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
              />
              <ErrorText>{roleErrors.name && 'Role name is required.'}</ErrorText>
            </FormField>

            <FormField>
              <FormLabel>Level</FormLabel>
              <select
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
              >
                <option value="">Select level…</option>
                <option value="Shakha">Shakha</option>
                <option value="Nagar">Nagar</option>
                <option value="Vibhag">Vibhag</option>
                <option value="National">National</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </FormField>

            <FormField>
              <FormLabel>Description</FormLabel>
              <textarea
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[100px]"
                placeholder="Describe the responsibilities of this role"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </FormField>

            <FormField>
              <FormLabel>Status</FormLabel>
              <StatusSlider
                value={formData.status}
                onChange={val => setFormData({ ...formData, status: val })}
              />
            </FormField>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>
              {isNew ? 'Create Role' : 'Save Changes'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950 min-h-screen" style={stickyTableStyle}>
      <div className="max-w-full mx-auto">
        {renderListing()}
        {isEditing && renderRoleModal()}
      </div>
    </div>
  );
}
