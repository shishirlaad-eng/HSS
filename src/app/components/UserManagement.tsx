import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Search,
  User as UserIcon,
  RefreshCw,
  Download,
  Mail,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit,
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
  ColumnVisibilityPanel,
  SummaryWidgets,
  type ColumnConfig
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import { mockUsers, User } from '../../mockAPI/usersData';
import UserDetail from './UserDetail';
import UserEdit from './UserEdit';
import { UserStatusModal } from './UserStatusModal';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'table';
type ViewModeState = 'list' | 'detail' | 'edit';

export default function UserManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModeState, setViewModeState] = useState<ViewModeState>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const userColumns: ColumnConfig[] = [
    { key: 'id', label: 'User Id' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'createdDate', label: 'Created Date' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    email: true,
    status: true,
    createdDate: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: 'activate' | 'deactivate' | 'self-deactivate';
  }>({
    isOpen: false,
    user: null,
    action: 'deactivate',
  });

  // Filter and Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilters = filters.every(filter => {
        if (filter.field === 'Status') {
          return filter.values.some(v => {
            const statusMap: Record<string, string> = { 'Active': 'active', 'Inactive': 'inactive' };
            return statusMap[v] === user.status;
          });
        }
        return true;
      });

      return matchesSearch && matchesFilters;
    });
  }, [users, searchQuery, filters]);

  // Sorting Logic
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aVal = (a as any)[sortField] || '';
      let bVal = (b as any)[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Pagination Logic
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage]);

  // Auto-close column visibility panel when leaving table view
  useEffect(() => {
    if (viewMode !== 'table') {
      setShowColumnPanel(false);
    }
  }, [viewMode]);

  // Enhanced Export handler (CSV/PDF)
  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedIds.size > 0 
      ? sortedUsers.filter(u => selectedIds.has(u.id))
      : sortedUsers;

    if (dataToExport.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    const columnsToExport = userColumns.filter(col => visibleColumns[col.key]);

    if (format === 'excel') {
      const headers = columnsToExport.map(col => `"${col.label}"`).join(',');
      const rows = dataToExport.map(item => 
        columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'createdDate') {
            val = new Date(val).toLocaleDateString('en-GB');
          }
          return `"${String(val || '').replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Successfully exported ${dataToExport.length} users to Excel.`);
    } else {
      let reportContent = `USER REPORT - Generated on ${new Date().toLocaleString()}\n`;
      reportContent += `Total Records: ${dataToExport.length}\n\n`;
      reportContent += columnsToExport.map(col => col.label.padEnd(25)).join('') + '\n';
      reportContent += '='.repeat(columnsToExport.length * 25) + '\n';
      
      dataToExport.forEach(item => {
        reportContent += columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'createdDate') {
            val = new Date(val).toLocaleDateString('en-GB');
          }
          return String(val || '').substring(0, 23).padEnd(25);
        }).join('') + '\n';
      });

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${dataToExport.length} users to PDF.`);
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handlers
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setViewModeState('detail');
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setViewModeState('edit');
  };

  const handleBackToList = () => {
    setViewModeState('list');
    setSelectedUser(null);
  };

  const handleToggleStatus = (user: User) => {
    // In a real app, we would check if the user is the current logged-in user
    const isSelf = false; // Mocking self-check
    
    if (isSelf && user.status === 'active') {
      setStatusModal({
        isOpen: true,
        user,
        action: 'self-deactivate',
      });
    } else {
      setStatusModal({
        isOpen: true,
        user,
        action: user.status === 'active' ? 'deactivate' : 'activate',
      });
    }
  };

  const confirmStatusChange = () => {
    if (!statusModal.user) return;

    const newStatus = statusModal.user.status === 'active' ? 'inactive' : 'active';
    
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === statusModal.user?.id ? { ...u, status: newStatus } : u)
    );

    // Also update selected user if in detail view
    if (selectedUser && selectedUser.id === statusModal.user.id) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }

    toast.success(`User account has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
    setStatusModal({ ...statusModal, isOpen: false });
  };

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

  if (viewModeState === 'detail' && selectedUser) {
    return (
      <>
        <UserDetail 
          user={selectedUser} 
          onBack={handleBackToList} 
          onEdit={() => handleEdit(selectedUser)}
          onToggleStatus={handleToggleStatus}
        />
        <UserStatusModal 
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
          onConfirm={confirmStatusChange}
          userName={statusModal.user?.name || ''}
          action={statusModal.action}
        />
      </>
    );
  }

  if (viewModeState === 'edit' && selectedUser) {
    return (
      <UserEdit 
        user={selectedUser} 
        onBack={() => setViewModeState('detail')} 
      />
    );
  }

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <PageHeader
          title="Users"
          breadcrumbs={[
            { label: 'User Management', href: '#' },
            { label: 'Users', current: true },
          ]}
        >
          <div className="relative" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search users..."
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={{ 'Status': ['Active', 'Inactive'] }}
            />
            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={userColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
          </div>

          <PrimaryButton icon={Plus} onClick={() => toast.info('Add User functionality is coming soon.')}>
            Add User
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
            title="User Summary"
            widgets={[
              { label: 'Total Users', value: users.length, icon: 'Users' },
              { label: 'Active Users', value: users.filter(u => u.status === 'active').length, icon: 'CheckCircle' },
              { label: 'Inactive Users', value: users.filter(u => u.status === 'inactive').length, icon: 'XCircle' },
              { label: 'Pending Users', value: users.filter(u => (u as any).status === 'pending').length, icon: 'Clock' },
            ]}
          />
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer relative group shadow-sm ${
                    selectedIds.has(user.id)
                      ? 'border-primary-300 dark:border-primary-600'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                  onClick={() => handleViewDetails(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Extreme left Checkbox */}
                      <div onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelection(user.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                          title="Select"
                        />
                      </div>

                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400 font-bold text-lg">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-neutral-900 dark:text-white font-semibold truncate">
                            {user.name}
                          </span>
                          {getStatusBadge(user.status)}
                          <span className="text-xs text-neutral-400 dark:text-neutral-600 ml-auto md:ml-0">•</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-500 font-mono">
                            {user.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="truncate">{user.email}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{new Date(user.createdDate).toLocaleDateString('en-GB')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4" onClick={e => e.stopPropagation()}>
                      <IconButton
                        icon={MoreVertical}
                        borderless={true}
                        title="Actions"
                        menuItems={[
                          { icon: Eye, label: 'View', onClick: () => handleViewDetails(user) },
                          { icon: Edit, label: 'Edit', onClick: () => handleEdit(user) },
                          { icon: user.status === 'active' ? ToggleLeft : ToggleRight, label: user.status === 'active' ? 'Deactivate' : 'Activate', onClick: () => handleToggleStatus(user) },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Search className="w-6 h-6 text-neutral-400" />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No users found</h3>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group shadow-sm flex flex-col ${
                    selectedIds.has(user.id)
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-600 dark:hover:border-primary-400'
                  }`}
                  onClick={() => handleViewDetails(user)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 font-bold text-xl transition-all shadow-inner">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelection(user.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        title="Select"
                      />
                      <IconButton
                        icon={MoreVertical}
                        borderless={true}
                        title="Actions"
                        menuItems={[
                          { icon: Eye, label: 'View', onClick: () => handleViewDetails(user) },
                          { icon: Edit, label: 'Edit', onClick: () => handleEdit(user) },
                          { icon: user.status === 'active' ? ToggleLeft : ToggleRight, label: user.status === 'active' ? 'Deactivate' : 'Activate', onClick: () => handleToggleStatus(user) },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
                        {user.name}
                      </h4>
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono mb-3">
                      {user.id}
                    </p>

                    <div className="space-y-2.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{new Date(user.createdDate).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end items-center mt-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.status)}
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold hidden sm:inline">User Account</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Search className="w-6 h-6 text-neutral-400" />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No users found</h3>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DATA TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(paginatedUsers.map(u => u.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                    {visibleColumns.id && (
                      <th 
                        onClick={() => handleSort('id')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        User Id {renderSortArrow('id')}
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th 
                        onClick={() => handleSort('name')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Name {renderSortArrow('name')}
                      </th>
                    )}
                    {visibleColumns.email && (
                      <th 
                        onClick={() => handleSort('email')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Email {renderSortArrow('email')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th 
                        onClick={() => handleSort('status')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Status {renderSortArrow('status')}
                      </th>
                    )}
                    {visibleColumns.createdDate && (
                      <th 
                        onClick={() => handleSort('createdDate')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Created Date {renderSortArrow('createdDate')}
                      </th>
                    )}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800 tracking-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                        onClick={() => handleViewDetails(user)}
                      >
                        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(user.id)}
                            onChange={() => toggleSelection(user.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          />
                        </td>
                        {visibleColumns.id && (
                          <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4">
                            {user.id}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 text-xs font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {user.name}
                              </span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.email && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {user.email}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-4">
                            {getStatusBadge(user.status)}
                          </td>
                        )}
                        {visibleColumns.createdDate && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(user.createdDate).toLocaleDateString('en-GB')}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <IconButton 
                              icon={user.status === 'active' ? ToggleRight : ToggleLeft}
                              borderless={true}
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                              className={user.status === 'active' ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400'}
                            />
                            <IconButton 
                              icon={Eye}
                              borderless={true}
                              onClick={() => handleViewDetails(user)}
                              title="View Details"
                            />
                            <IconButton 
                              icon={Edit}
                              borderless={true}
                              onClick={() => handleEdit(user)}
                              title="Edit"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Search className="w-6 h-6 text-neutral-400" />
                          </div>
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No users found</h3>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6">
          {filteredUsers.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <UserStatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        onConfirm={confirmStatusChange}
        userName={statusModal.user?.name || ''}
        action={statusModal.action}
      />
    </div>
  );
}
