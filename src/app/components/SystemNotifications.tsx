import { useState, useMemo, useRef } from 'react';
import { 
  Bell,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Send
} from 'lucide-react';
import { 
  PageHeader, 
  SearchBar, 
  Pagination, 
  IconButton,
  ViewModeSwitcher,
  PrimaryButton,
  ColumnVisibilityPanel,
  type ColumnConfig
} from './hb/listing';
import { 
  FormModal, 
  FormSection, 
  FormGrid,
  FormField, 
  FormLabel, 
  FormInput, 
  FormSelect,
  StatusSlider
} from './hb/common';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'table';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  triggerEvent: string;
  status: 'active' | 'inactive';
  createdDate: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'NTF-001',
    title: 'System Maintenance Alert',
    message: 'Scheduled infrastructure maintenance will occur this Saturday at 02:00 UTC. Expect temporary connectivity fluctuations.',
    targetAudience: 'All Users',
    triggerEvent: 'Manual Dispatch',
    status: 'active',
    createdDate: '2024-03-01'
  },
  {
    id: 'NTF-002',
    title: 'New Feature Rollout: Advanced Dashboards',
    message: 'We have updated the primary dashboards with customizable reporting graphs and streamlined workflows. Explore them today!',
    targetAudience: 'Administrators & Managers',
    triggerEvent: 'Post-Login Banner',
    status: 'active',
    createdDate: '2024-03-10'
  },
  {
    id: 'NTF-003',
    title: 'Session Expiry Notification Reminder',
    message: 'Your ongoing platform authentication token is scheduled for automated recycling within 10 minutes to protect credential persistence.',
    targetAudience: 'Active Sessions',
    triggerEvent: 'Inactivity Threshold',
    status: 'inactive',
    createdDate: '2024-02-20'
  },
  {
    id: 'NTF-004',
    title: 'Password Expiry Grace Period',
    message: 'Your system access credentials will require standard automated modification within 5 days per security protocols.',
    targetAudience: 'All Users',
    triggerEvent: 'Policy Countdown',
    status: 'active',
    createdDate: '2024-03-12'
  },
];

export default function SystemNotifications() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('createdDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const notificationColumns: ColumnConfig[] = [
    { key: 'id', label: 'Notification Id' },
    { key: 'title', label: 'Broadcast Title' },
    { key: 'targetAudience', label: 'Target Audience' },
    { key: 'triggerEvent', label: 'Trigger Schema' },
    { key: 'status', label: 'Status' },
    { key: 'createdDate', label: 'Created Date' },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    title: true,
    targetAudience: true,
    triggerEvent: true,
    status: true,
    createdDate: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Modal form state adhering strictly to enterprise template rules
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [activeItem, setActiveItem] = useState<Partial<NotificationItem> | null>(null);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedData = useMemo(() => {
    let result = notifications.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let aVal = a[sortField as keyof NotificationItem] || '';
      let bVal = b[sortField as keyof NotificationItem] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [notifications, searchQuery, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const renderStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
        isActive 
          ? 'bg-success-50 text-success-600 border-success-100 dark:bg-success-950/20 dark:text-success-400 dark:border-success-900/30' 
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`}></div>
        <span className="text-xs font-medium capitalize">{status}</span>
      </span>
    );
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
    );
  };

  const handleCreateNew = () => {
    const newId = `NTF-${String(notifications.length + 1).padStart(3, '0')}`;
    setActiveItem({
      id: newId,
      title: '',
      message: '',
      targetAudience: 'All Users',
      triggerEvent: 'Manual Dispatch',
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
  };

  const handleSaveNotification = () => {
    if (!activeItem || !activeItem.title || !activeItem.message) {
      toast.error('Please fill in required notification fields.');
      return;
    }

    const saved = activeItem as NotificationItem;
    if (modalMode === 'create') {
      setNotifications(prev => [saved, ...prev]);
      toast.success('System notification broadcast configured successfully.');
    } else {
      setNotifications(prev => prev.map(n => n.id === saved.id ? saved : n));
      toast.success('Notification schema updated.');
    }

    setModalMode(null);
    setActiveItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to withdraw this notification structure?')) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification withdrawn.');
    }
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="System Notifications"
          subtitle="Configure global banners, event triggers, and broadcast alert messaging"
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'System Notifications', current: true },
          ]}
        >
          <div className="flex items-center gap-2 flex-wrap" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onToggleColumns={() => setShowColumnPanel(!showColumnPanel)}
              placeholder="Search notifications..."
            />
            
            <PrimaryButton icon={Plus} onClick={handleCreateNew}>
              Create Broadcast
            </PrimaryButton>

            <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />

            <ViewModeSwitcher
              currentMode={viewMode}
              onChange={setViewMode}
            />

            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={notificationColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
          </div>
        </PageHeader>

        {/* ========== CARD VIEW DEFAULT ========== */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between min-h-[170px] ${
                    selectedIds.has(item.id)
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-600 dark:hover:border-primary-400'
                  }`}
                  onClick={() => {
                    setActiveItem(item);
                    setModalMode('view');
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">
                            {item.title}
                          </h4>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {item.id} • {item.triggerEvent}
                          </span>
                        </div>
                      </div>

                      {/* Minimalist Action Menu (Borderless) */}
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        />
                        <IconButton
                          icon={MoreVertical}
                          borderless={true}
                          title="Actions"
                          menuItems={[
                            { icon: Eye, label: 'View Broadcast Details', onClick: () => { setActiveItem(item); setModalMode('view'); } },
                            { icon: Edit, label: 'Edit Parameters', onClick: () => { setActiveItem(item); setModalMode('edit'); } },
                            { divider: true },
                            { icon: Trash2, label: 'Withdraw Notification', onClick: () => handleDelete(item.id) },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-50 dark:border-neutral-900 space-y-1">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="text-[11px] text-neutral-400 pt-1 flex items-center justify-between">
                        <span>Audience: {item.targetAudience}</span>
                        <span>{item.createdDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Checkbox / Status */}
                  <div className="flex items-center justify-end pt-3 mt-4 border-t border-neutral-100 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">No matching system notifications found.</p>
              </div>
            )}
          </div>
        )}

        {/* ========== LIST VIEW ========== */}
        {viewMode === 'list' && (
          <div className="space-y-2 mt-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                    selectedIds.has(item.id)
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/10'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                  onClick={() => {
                    setActiveItem(item);
                    setModalMode('view');
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox placed at extreme LEFT position */}
                    <div onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </div>

                    <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                      <div className="min-w-[180px]">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {item.id} • {item.triggerEvent}
                        </span>
                      </div>

                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate flex-1">
                        {item.message}
                      </span>

                      <span className="text-xs text-neutral-400 hidden lg:inline">
                        Audience: {item.targetAudience}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                    <IconButton
                      icon={MoreVertical}
                      borderless={true}
                      title="Actions"
                      menuItems={[
                        { icon: Eye, label: 'View Broadcast Details', onClick: () => { setActiveItem(item); setModalMode('view'); } },
                        { icon: Edit, label: 'Edit Parameters', onClick: () => { setActiveItem(item); setModalMode('edit'); } },
                        { divider: true },
                        { icon: Trash2, label: 'Withdraw Notification', onClick: () => handleDelete(item.id) },
                      ]}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">No matching system broadcasts found.</p>
              </div>
            )}
          </div>
        )}

        {/* ========== DATA TABLE VIEW (STICKY HEADER SCROLLING LAYOUT) ========== */}
        {viewMode === 'table' && (
          <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    {/* Standardized Checkbox inside FIRST column */}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(paginatedData.map(n => n.id)));
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
                        Notification Id {renderSortIndicator('id')}
                      </th>
                    )}

                    {visibleColumns.title && (
                      <th 
                        onClick={() => handleSort('title')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Broadcast Title {renderSortIndicator('title')}
                      </th>
                    )}

                    {visibleColumns.targetAudience && (
                      <th 
                        onClick={() => handleSort('targetAudience')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Target Audience {renderSortIndicator('targetAudience')}
                      </th>
                    )}

                    {visibleColumns.triggerEvent && (
                      <th 
                        onClick={() => handleSort('triggerEvent')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Trigger Schema {renderSortIndicator('triggerEvent')}
                      </th>
                    )}

                    {visibleColumns.status && (
                      <th 
                        onClick={() => handleSort('status')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Status {renderSortIndicator('status')}
                      </th>
                    )}

                    {visibleColumns.createdDate && (
                      <th 
                        onClick={() => handleSort('createdDate')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Created Date {renderSortIndicator('createdDate')}
                      </th>
                    )}

                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800 tracking-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveItem(item);
                          setModalMode('view');
                        }}
                      >
                        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelection(item.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          />
                        </td>
                        {visibleColumns.id && (
                          <td className="px-6 py-3.5 text-sm font-mono text-primary-600 dark:text-primary-400 font-medium">
                            {item.id}
                          </td>
                        )}
                        {visibleColumns.title && (
                          <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white">
                            {item.title}
                          </td>
                        )}
                        {visibleColumns.targetAudience && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                            {item.targetAudience}
                          </td>
                        )}
                        {visibleColumns.triggerEvent && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                            {item.triggerEvent}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-3.5">
                            {renderStatusBadge(item.status)}
                          </td>
                        )}
                        {visibleColumns.createdDate && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                            {item.createdDate}
                          </td>
                        )}
                        <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              icon={Eye}
                              borderless={true}
                              onClick={() => { setActiveItem(item); setModalMode('view'); }}
                              title="View Broadcast Details"
                            />
                            <IconButton
                              icon={Edit}
                              borderless={true}
                              onClick={() => { setActiveItem(item); setModalMode('edit'); }}
                              title="Edit Parameters"
                            />
                            <IconButton
                              icon={Trash2}
                              borderless={true}
                              onClick={() => handleDelete(item.id)}
                              title="Withdraw Broadcast"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-16 text-center text-sm text-neutral-500">
                          No notifications found.
                        </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== SEPARATE PAGINATION FOOTER ========== */}
        <div className="mt-6">
          {processedData.length > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={processedData.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

        {/* ========== INTEGRATED ENTERPRISE FORM MODAL ========== */}
        <FormModal
          isOpen={modalMode !== null}
          onClose={() => { setModalMode(null); setActiveItem(null); }}
          title={modalMode === 'create' ? 'Broadcast Notification Workspace' : modalMode === 'edit' ? `Edit Broadcast Schema ${activeItem?.id}` : `Broadcast Overview: ${activeItem?.title}`}
          maxWidth="max-w-xl"
        >
          {activeItem && (
            <div className="space-y-4">
              <FormSection title="Notification Header Identity">
                <FormGrid cols={1}>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Broadcast Title</FormLabel>
                    <FormInput
                      value={activeItem.title || ''}
                      onChange={e => setActiveItem({...activeItem, title: e.target.value})}
                      readOnly={modalMode === 'view'}
                      placeholder="Enter prominent broadcast topic..."
                    />
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection title="Dispatch Targeting & Logic">
                <FormGrid cols={2}>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Target Audience</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.targetAudience || ''} readOnly />
                    ) : (
                      <FormSelect
                        value={activeItem.targetAudience || 'All Users'}
                        onChange={e => setActiveItem({...activeItem, targetAudience: e.target.value})}
                      >
                        <option value="All Users">All Users</option>
                        <option value="Administrators & Managers">Administrators & Managers</option>
                        <option value="Active Sessions">Active Sessions</option>
                        <option value="External Partners">External Partners</option>
                      </FormSelect>
                    )}
                  </FormField>

                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Trigger Event Schema</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.triggerEvent || ''} readOnly />
                    ) : (
                      <FormSelect
                        value={activeItem.triggerEvent || 'Manual Dispatch'}
                        onChange={e => setActiveItem({...activeItem, triggerEvent: e.target.value})}
                      >
                        <option value="Manual Dispatch">Manual Dispatch</option>
                        <option value="Post-Login Banner">Post-Login Banner</option>
                        <option value="Inactivity Threshold">Inactivity Threshold</option>
                        <option value="Policy Countdown">Policy Countdown</option>
                      </FormSelect>
                    )}
                  </FormField>
                </FormGrid>
              </FormSection>

              <FormSection title="Messaging Statement">
                <FormField>
                  <FormLabel required={modalMode !== 'view'}>Broadcast Copy</FormLabel>
                  <textarea
                    value={activeItem.message || ''}
                    onChange={e => setActiveItem({...activeItem, message: e.target.value})}
                    readOnly={modalMode === 'view'}
                    rows={4}
                    className="w-full p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500 resize-none leading-relaxed"
                    placeholder="Enter explicit multi-line directive..."
                  />
                </FormField>
              </FormSection>

              <FormSection title="Broadcast Visibility">
                <FormField>
                  <FormLabel>Operational Status</FormLabel>
                  {modalMode === 'view' ? (
                    <div className="pt-1">{renderStatusBadge(activeItem.status || 'active')}</div>
                  ) : (
                    <StatusSlider
                      value={activeItem.status || 'active'}
                      onChange={val => setActiveItem({...activeItem, status: val})}
                      activeLabel="Active Broadcast"
                      inactiveLabel="Suspended / Inactive"
                    />
                  )}
                </FormField>
              </FormSection>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => { setModalMode(null); setActiveItem(null); }}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {modalMode === 'view' ? 'Close Panel' : 'Cancel Dispatch'}
                </button>
                {modalMode !== 'view' && (
                  <PrimaryButton icon={Send} onClick={handleSaveNotification}>
                    Confirm Broadcast Setup
                  </PrimaryButton>
                )}
              </div>
            </div>
          )}
        </FormModal>

      </div>
    </div>
  );
}
