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
  BarChart3
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
  PrimaryButton,
  SecondaryButton,
  ColumnVisibilityPanel,
  SummaryWidgets,
  type ColumnConfig
} from './hb/listing';
import {
  FormSection,
  FormField,
  FormLabel,
  FormInput,
  StatusSlider,
} from './hb/common';
import { mockRoles, availableModules, Role, ModulePermission } from '../../mockAPI/rolesData';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'table';

export default function RoleManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting state
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const roleColumns: ColumnConfig[] = [
    { key: 'name', label: 'Role Name' },
    { key: 'code', label: 'Role Code' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'lastUpdated', label: 'Updated Date' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    code: true,
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
      });
      setRolePermissions(selectedRole.permissions);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'active',
      });
      setRolePermissions({});
    }
    if (availableModules && availableModules.length > 0) {
      setActiveModuleId(availableModules[0].id);
    }
  }, [selectedRole, isEditing]);

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
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(true);
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
    toast.info(`Cloning role: ${role.name}`);
  };

  const handleDelete = (role: Role) => {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      toast.success(`Role "${role.name}" deleted successfully.`);
    }
  };

  const handleSave = () => {
    toast.success(`Role ${selectedRole?.id ? 'updated' : 'created'} successfully.`);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
      const matchesSearch = 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [searchQuery]);

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
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRoles.slice(start, start + itemsPerPage);
  }, [sortedRoles, currentPage]);

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
      let reportContent = `ROLE REPORT - Generated on ${new Date().toLocaleString()}\n`;
      reportContent += `Total Records: ${dataToExport.length}\n\n`;
      reportContent += columnsToExport.map(col => col.label.padEnd(25)).join('') + '\n';
      reportContent += '='.repeat(columnsToExport.length * 25) + '\n';
      
      dataToExport.forEach(item => {
        reportContent += columnsToExport.map(col => {
          let val = (item as any)[col.key];
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

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  // Helper: Status Badge
  const getStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full">
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`}></div>
        <span className="text-xs text-neutral-600 dark:text-neutral-400">
          {isActive ? 'Active' : 'Inactive'}
        </span>
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
      {/* Header */}
      <PageHeader
        title="Role Management"
        breadcrumbs={[
          { label: 'User Management', href: '#' },
          { label: 'Role Management', current: true },
        ]}
      >
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

        <PrimaryButton icon={Plus} onClick={handleCreate}>
          Add Role
        </PrimaryButton>

        <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
        <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />

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
      </PageHeader>

      {/* SUMMARY WIDGETS */}
      {showSummary && (
        <SummaryWidgets
          title="Role Summary"
          widgets={[
            { label: 'Total Roles', value: mockRoles.length, icon: 'Briefcase' },
            { label: 'Active Roles', value: mockRoles.filter(r => r.status === 'active').length, icon: 'CheckCircle' },
            { label: 'Inactive Roles', value: mockRoles.filter(r => r.status === 'inactive').length, icon: 'XCircle' },
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
                  <input
                    type="checkbox"
                    checked={selectedIds.has(role.id)}
                    onChange={() => toggleSelection(role.id)}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                  />
                  <IconButton
                    icon={MoreVertical}
                    borderless={true}
                    menuItems={[
                      { icon: Eye, label: 'View Role', onClick: () => handleEdit(role) },
                      { icon: Edit2, label: 'Edit Role', onClick: () => handleEdit(role) },
                      { icon: Copy, label: 'Clone Role', onClick: () => handleClone(role) },
                      { icon: RefreshCw, label: 'Change Status', onClick: () => {} },
                      { icon: Trash2, label: 'Delete Role', onClick: () => handleDelete(role), variant: 'danger' as any },
                    ]}
                  />
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate mb-0.5">
                  {role.name}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 font-mono mb-3">
                  {role.code}
                </p>
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
                    <span>{new Date(role.lastUpdated).toLocaleDateString()}</span>
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
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
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
                  {visibleColumns.name && (
                    <th onClick={() => handleSort('name')} className="px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer uppercase tracking-wider">
                      Role Name {renderSortArrow('name')}
                    </th>
                  )}
                  {visibleColumns.code && (
                    <th onClick={() => handleSort('code')} className="px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer uppercase tracking-wider">
                      Role Code {renderSortArrow('code')}
                    </th>
                  )}
                  {visibleColumns.description && (
                    <th className="px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Description
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th onClick={() => handleSort('status')} className="px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer uppercase tracking-wider">
                      Status {renderSortArrow('status')}
                    </th>
                  )}
                  {visibleColumns.lastUpdated && (
                    <th onClick={() => handleSort('lastUpdated')} className="px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer uppercase tracking-wider">
                      Updated Date {renderSortArrow('lastUpdated')}
                    </th>
                  )}
                  <th className="px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginatedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer" onClick={() => handleEdit(role)}>
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(role.id)}
                        onChange={() => toggleSelection(role.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </td>
                    {visibleColumns.name && (
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                        {role.name}
                      </td>
                    )}
                    {visibleColumns.code && (
                      <td className="px-6 py-4 text-sm text-neutral-500 font-mono">
                        {role.code}
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
                        {new Date(role.lastUpdated).toLocaleDateString('en-GB')}
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
      />
    </div>
  );

  // ========== FORM VIEW (SPLIT LAYOUT) ==========
  const renderForm = () => {
    const activeModule = availableModules.find(m => m.id === activeModuleId);
    const activePerms = rolePermissions[activeModuleId] || [];

    return (
      <div className="space-y-6">
        <PageHeader
          title={selectedRole?.id ? 'Edit Role' : 'Create Role'}
          breadcrumbs={[
            { label: 'Role Management', href: '#', onClick: handleCancel },
            { label: selectedRole?.id ? 'Edit Role' : 'Create Role', current: true },
          ]}
        >
          <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave}>Save Role</PrimaryButton>
        </PageHeader>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Role Information */}
          <div className="w-full lg:w-[35%] space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Role Information</h3>
              
              <div className="space-y-4">
                <FormField>
                  <FormLabel required>Role Name</FormLabel>
                  <FormInput
                    placeholder="Enter role name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormField>

                <FormField>
                  <FormLabel required>Role Code</FormLabel>
                  <FormInput
                    placeholder="e.g. manager_level_1"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
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

              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
                <PrimaryButton className="flex-1" onClick={handleSave}>Save Changes</PrimaryButton>
                <SecondaryButton className="flex-1" onClick={handleCancel}>Cancel</SecondaryButton>
              </div>
            </div>
          </div>

          {/* Right Panel - Permission Management */}
          <div className="w-full lg:w-[65%] space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[700px]">
              {/* Right Panel Header */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Role Privileges</h3>
                  <p className="text-xs text-neutral-500">Configure module-level access and action permissions</p>
                </div>
                <PrimaryButton size="sm" onClick={handleSave}>Save Privileges</PrimaryButton>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Module List (Left Sidebar) */}
                <div className="w-1/3 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto bg-neutral-50/30 dark:bg-neutral-900/30">
                  {availableModules.map((module) => {
                    const selectedCount = (rolePermissions[module.id] || []).length;
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

                {/* Permissions Grid (Right Content) */}
                <div className="w-2/3 p-6 overflow-y-auto">
                  {activeModule && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                          {activeModule.name} Permissions
                        </h4>
                        <button
                          onClick={() => toggleSelectAllModule(activeModule.id)}
                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {(rolePermissions[activeModule.id] || []).length === activeModule.actions.length
                            ? 'Unselect All'
                            : 'Select All'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeModule.actions.map((action) => {
                          const isSelected = activePerms.includes(action.id);
                          return (
                            <div
                              key={action.id}
                              onClick={() => togglePermission(activeModule.id, action.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                                  : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-300 dark:hover:border-primary-700'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-primary-500 border-primary-500 text-white'
                                  : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                  {action.name}
                                </div>
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  {action.code}
                                </div>
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
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-full mx-auto">
        {isEditing ? renderForm() : renderListing()}
      </div>
    </div>
  );
}
