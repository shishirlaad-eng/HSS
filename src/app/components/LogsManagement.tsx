import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  MoreVertical,
  Eye,
  Calendar,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Activity,
  Zap,
  Mail,
  User as UserIcon,
  Monitor,
  Globe,
  Code,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hash,
  Filter,
  Check,
  FileSpreadsheet,
  FileText,
  BarChart3
} from 'lucide-react';
import { 
  PageHeader,
  SearchBar,
  IconButton,
  Pagination,
  AdvancedSearchPanel,
  ColumnVisibilityPanel,
  ViewModeSwitcher,
  SummaryWidgets,
  type ColumnConfig,
  type FilterCondition
} from './hb/listing';
import { 
  FormModal, 
  FormSection, 
  FormField, 
  FormLabel,
  FormInput,
  FormTextArea
} from './hb/common';
import { 
  mockLoginLogs, 
  mockAuditLogs, 
  mockAPILogs, 
  mockEmailLogs,
  LoginLog,
  AuditLog,
  APILog,
  EmailLog
} from '../../mockAPI/logsData';
import { toast } from 'sonner';

export type LogModuleType = 'login' | 'audit' | 'api' | 'email';

const formatDateTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  return `${day} ${month} ${year}, ${strTime}`;
};

const getRelativeTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  const now = new Date().getTime();
  const then = new Date(dateStr).getTime();
  const diffInMs = now - then;
  
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins} mins ago`;
  
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
};

const formatDuration = (ms: number | string) => {
  const duration = Number(ms);
  if (isNaN(duration)) return String(ms);
  if (duration < 1000) return `${duration} ms`;
  return `${(duration / 1000).toFixed(1)} sec`;
};

const calculateDuration = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start) return 'N/A';
  if (!end) return 'Active Session';
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const getTimestampField = (log: any, type: LogModuleType) => {
  switch (type) {
    case 'login': return log.loginTime;
    case 'audit': return log.timestamp;
    case 'api': return log.requestTime;
    case 'email': return log.sentAt;
    default: return log.timestamp;
  }
};
interface LogsManagementProps {
  type: LogModuleType;
}

export default function LogsManagement({ type }: LogsManagementProps) {
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  // Sorting state
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);

  // Config based on log type
  const config = useMemo(() => {
    switch (type) {
      case 'login':
        return {
          title: 'Login Logs',
          subtitle: 'Track user access and authentication attempts',
          icon: UserIcon,
          data: mockLoginLogs,
          columns: [
            { key: 'userName', label: 'User Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'loginTime', label: 'Login Time' },
            { key: 'status', label: 'Status' },
            { key: 'ipAddress', label: 'IP Address' },
            { key: 'device', label: 'Device/Browser' },
          ] as ColumnConfig[],
          filterOptions: {
            'Status': ['Success', 'Failed'],
            'Role': ['Admin', 'Editor', 'Viewer'],
            'Date Range': ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'],
          }
        };
      case 'audit':
        return {
          title: 'Audit Logs',
          subtitle: 'Monitor all administrative actions and record changes',
          icon: Shield,
          data: mockAuditLogs,
          columns: [
            { key: 'user', label: 'User' },
            { key: 'module', label: 'Module' },
            { key: 'actionType', label: 'Action Type' },
            { key: 'recordName', label: 'Record Name' },
            { key: 'timestamp', label: 'Date & Time' },
            { key: 'ipAddress', label: 'IP Address' },
          ] as ColumnConfig[],
          filterOptions: {
            'Module': ['User Management', 'Event Management', 'Settings'],
            'Action Type': ['Create', 'Update', 'Delete'],
            'Date Range': ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'],
          }
        };
      case 'api':
        return {
          title: 'API Logs',
          subtitle: 'Track all incoming and outgoing API requests',
          icon: Zap,
          data: mockAPILogs,
          columns: [
            { key: 'apiName', label: 'API Name' },
            { key: 'endpoint', label: 'Endpoint' },
            { key: 'method', label: 'Method' },
            { key: 'status', label: 'Response Status' },
            { key: 'requestTime', label: 'Request Time' },
            { key: 'responseTime', label: 'Response Time' },
          ] as ColumnConfig[],
          filterOptions: {
            'Method': ['GET', 'POST', 'PUT', 'DELETE'],
            'Status': ['200', '201', '400', '404', '500'],
            'Date Range': ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'],
          }
        };
      case 'email':
        return {
          title: 'Email Logs',
          subtitle: 'Monitor system-generated email communications',
          icon: Mail,
          data: mockEmailLogs,
          columns: [
            { key: 'recipientName', label: 'Recipient' },
            { key: 'templateName', label: 'Template' },
            { key: 'subject', label: 'Subject' },
            { key: 'sentAt', label: 'Sent Date & Time' },
            { key: 'status', label: 'Delivery Status' },
            { key: 'triggeredBy', label: 'Triggered By' },
          ] as ColumnConfig[],
          filterOptions: {
            'Status': ['Delivered', 'Sent', 'Failed', 'Bounced'],
            'Date Range': ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'],
          }
        };
      default:
        return { title: 'Logs', subtitle: 'View system logs and activity', icon: Activity, data: [], columns: [], filterOptions: {} };
    }
  }, [type]);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => config.columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {} as Record<string, boolean>)
  );

  // Reset visible columns whenever the log type changes so API/Email logs
  // don't inherit stale column keys from a previously visited log type
  useEffect(() => {
    setVisibleColumns(
      config.columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {} as Record<string, boolean>)
    );
    setSortField(type === 'login' ? 'loginTime' : type === 'audit' ? 'timestamp' : type === 'api' ? 'requestTime' : 'sentAt');
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortArrow = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary-600 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary-600 ml-1 inline-block" />
    );
  };

  const filteredData = useMemo(() => {
    return config.data.filter((item: any) => {
      // 1. Search Query
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchStr)
      );
      if (!matchesSearch) return false;

      // 2. Advanced Filters
      for (const filter of filters) {
        if (!filter.values || filter.values.length === 0) continue;
        
        if (filter.field === 'Date Range') {
          const itemTime = new Date(getTimestampField(item, type)).getTime();
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Start of today
          
          const matchDateRange = filter.values.some(range => {
            if (range === 'Today') {
              return itemTime >= now.getTime();
            } else if (range === 'Yesterday') {
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              return itemTime >= yesterday.getTime() && itemTime < now.getTime();
            } else if (range === 'Last 7 Days') {
              const last7Days = new Date(now);
              last7Days.setDate(last7Days.getDate() - 7);
              return itemTime >= last7Days.getTime();
            } else if (range === 'Last 30 Days') {
              const last30Days = new Date(now);
              last30Days.setDate(last30Days.getDate() - 30);
              return itemTime >= last30Days.getTime();
            } else if (range === 'This Month') {
              const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              return itemTime >= thisMonth.getTime();
            }
            return false;
          });
          
          if (!matchDateRange) return false;
          continue;
        }

        let fieldValue = '';
        if (type === 'login') {
          if (filter.field === 'Status') fieldValue = item.status;
          if (filter.field === 'Role') fieldValue = item.role;
        } else if (type === 'audit') {
          if (filter.field === 'Module') fieldValue = item.module;
          if (filter.field === 'Action Type') fieldValue = item.actionType;
        } else if (type === 'api') {
          if (filter.field === 'Method') fieldValue = item.method;
          if (filter.field === 'Status') fieldValue = String(item.status);
        } else if (type === 'email') {
          if (filter.field === 'Status') fieldValue = item.status;
        }
        
        if (fieldValue && !filter.values.includes(fieldValue)) {
          return false;
        }
      }

      return true;
    });
  }, [config.data, searchQuery, filters, type]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  // Auto-close column visibility panel when leaving table view
  useEffect(() => {
    if (viewMode !== 'table') {
      setShowColumnPanel(false);
    }
  }, [viewMode]);

  // Group logs by Date (Today, Yesterday, Earlier)
  const groupLogsByDate = (logs: any[], logType: LogModuleType) => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const earlier: any[] = [];

    const now = new Date();
    const todayStr = now.toDateString();

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toDateString();

    logs.forEach(log => {
      const ts = getTimestampField(log, logType);
      if (!ts) {
        earlier.push(log);
        return;
      }
      const logDate = new Date(ts);
      const logDateStr = logDate.toDateString();

      if (logDateStr === todayStr) {
        today.push(log);
      } else if (logDateStr === yestStr) {
        yesterday.push(log);
      } else {
        earlier.push(log);
      }
    });

    return { today, yesterday, earlier };
  };

  // Get dynamic timeline content details per log type
  const getTimelineDetails = (log: any, logType: LogModuleType) => {
    switch (logType) {
      case 'login':
        return {
          title: log.status === 'Success' ? 'User Login Success' : 'User Login Failed',
          subtitle: `Role: ${log.role || 'User'}`,
          description: log.failureReason ? `Failed: ${log.failureReason}` : `Logged in from ${log.location || 'Unknown'} using ${log.device || 'Device'} (${log.os || 'OS'})`,
          module: 'Login',
          user: log.userName || 'System',
          status: log.status,
        };
      case 'audit':
        return {
          title: `${log.actionType || 'Action'} Record`,
          subtitle: `Module: ${log.module || 'System'}`,
          description: log.description || 'Record changed',
          module: log.module || 'Audit',
          user: log.user || 'System',
          status: 'Success',
        };
      case 'api':
        return {
          title: `API Request: ${log.method || 'GET'} ${log.apiName || 'Endpoint'}`,
          subtitle: `Response status: ${log.status}`,
          description: `Endpoint: ${log.endpoint || ''} (Response: ${log.responseTime || 0}ms)`,
          module: 'API',
          user: log.user || 'System',
          status: Number(log.status) >= 400 ? 'Failed' : 'Success',
        };
      case 'email':
        return {
          title: `Email Sent: ${log.templateName || 'Template'}`,
          subtitle: `Recipient: ${log.recipientName || ''} (${log.recipientEmail || ''})`,
          description: `Subject: ${log.subject || ''} (Triggered by: ${log.triggeredBy || 'System'})`,
          module: 'Email',
          user: log.triggeredBy || 'System',
          status: log.status,
        };
    }
  };

  // Enhanced Export handler (CSV/PDF)
  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedIds.size > 0 
      ? sortedData.filter(log => selectedIds.has(log.id))
      : sortedData;

    if (dataToExport.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    const columnsToExport = config.columns.filter(col => visibleColumns[col.key]);

    if (format === 'excel') {
      const headers = columnsToExport.map(col => `"${col.label}"`).join(',');
      const rows = dataToExport.map(item => 
        columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'loginTime' || col.key === 'timestamp' || col.key === 'requestTime' || col.key === 'sentAt') {
            val = formatDateTime(val);
          }
          return `"${String(val || '').replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_logs_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Successfully exported ${dataToExport.length} logs to Excel.`);
    } else {
      let reportContent = `${type.toUpperCase()} LOG REPORT - Generated on ${new Date().toLocaleString()}\n`;
      reportContent += `Total Records: ${dataToExport.length}\n\n`;
      reportContent += columnsToExport.map(col => col.label.padEnd(25)).join('') + '\n';
      reportContent += '='.repeat(columnsToExport.length * 25) + '\n';
      
      dataToExport.forEach(item => {
        reportContent += columnsToExport.map(col => {
          let val = (item as any)[col.key];
          if (col.key === 'loginTime' || col.key === 'timestamp' || col.key === 'requestTime' || col.key === 'sentAt') {
            val = formatDateTime(val);
          }
          return String(val || '').substring(0, 23).padEnd(25);
        }).join('') + '\n';
      });

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_logs_export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${dataToExport.length} logs to PDF.`);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusBadge = (status: string | number) => {
    const statusStr = String(status).toLowerCase();
    let color = 'bg-neutral-400';
    let label = String(status);

    if (statusStr.includes('success') || statusStr.includes('delivered') || statusStr === 'active' || (typeof status === 'number' && status >= 200 && status < 300)) {
      color = 'bg-success-500';
    } else if (statusStr.includes('failed') || statusStr.includes('bounced') || statusStr === 'inactive' || (typeof status === 'number' && status >= 400)) {
      color = 'bg-error-500';
    } else if (statusStr.includes('pending') || statusStr.includes('sent')) {
      color = 'bg-primary-500';
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
        <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          {label}
        </span>
      </span>
    );
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6 min-h-screen animate-in fade-in duration-500">
      <div className="max-w-[100%] mx-auto space-y-6">
        <PageHeader
          title={config.title}
          subtitle={config.subtitle}
          breadcrumbs={[
            { label: 'Logs', href: '#' },
            { label: config.title, current: true },
          ]}
        >
          <div className="relative" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder={`Search ${config.title.toLowerCase()}...`}
            />
            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={config.columns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={config.filterOptions}
            />
          </div>

          <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
          <IconButton icon={RefreshCw} onClick={() => toast.success('Data refreshed')} title="Refresh" />
          
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
            modes={['table', 'timeline']}
            onChange={setViewMode}
          />
        </PageHeader>

        {/* SUMMARY WIDGETS */}
        {showSummary && (
          <SummaryWidgets
            title="Log Summary"
            widgets={[
              { label: 'Total Logs', value: config.data.length, icon: 'Activity' },
              { label: 'Today Logs', value: config.data.filter((item: any) => new Date(getTimestampField(item, type)).toDateString() === new Date().toDateString()).length, icon: 'Clock' },
              { label: 'Failed Logs', value: config.data.filter((item: any) => String(item.status).toLowerCase().includes('failed') || String(item.status).toLowerCase().includes('bounced') || (typeof item.status === 'number' && item.status >= 400)).length, icon: 'XCircle' },
              { label: 'Success Logs', value: config.data.filter((item: any) => String(item.status).toLowerCase().includes('success') || String(item.status).toLowerCase().includes('delivered') || (typeof item.status === 'number' && item.status >= 200 && item.status < 300)).length, icon: 'CheckCircle' },
            ]}
          />
        )}
        {/* TIMELINE VIEW */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            {(() => {
              const { today, yesterday, earlier } = groupLogsByDate(sortedData, type);
              const groups = [
                { label: 'Today', items: today },
                { label: 'Yesterday', items: yesterday },
                { label: 'Earlier', items: earlier },
              ].filter(g => g.items.length > 0);

              if (groups.length === 0) {
                return (
                  <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Search className="w-6 h-6 text-neutral-400" />
                      </div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No logs found</h3>
                    </div>
                  </div>
                );
              }

              return (
                <div className="relative border-l-2 border-neutral-200 dark:border-neutral-800 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8 py-2">
                  {groups.map((group) => (
                    <div key={group.label} className="space-y-6">
                      {/* Group Header */}
                      <div className="relative -ml-[35px] md:-ml-[43px] flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary-600 border-4 border-neutral-100 dark:border-neutral-950 shadow-sm" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 dark:bg-neutral-950 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800">
                          {group.label}
                        </span>
                      </div>

                      {/* Timeline Cards */}
                      <div className="space-y-4">
                        {group.items.map((log) => {
                          const details = getTimelineDetails(log, type);
                          if (!details) return null;

                          const statusStr = String(log.status).toLowerCase();
                          let dotColor = 'bg-blue-500';
                          if (statusStr.includes('success') || statusStr.includes('delivered') || statusStr === 'active' || (typeof log.status === 'number' && log.status >= 200 && log.status < 300)) {
                            dotColor = 'bg-emerald-500';
                          } else if (statusStr.includes('failed') || statusStr.includes('bounced') || statusStr === 'inactive' || (typeof log.status === 'number' && log.status >= 400)) {
                            dotColor = 'bg-rose-500';
                          } else if (statusStr.includes('pending') || statusStr.includes('sent') || statusStr.includes('warning')) {
                            dotColor = 'bg-amber-500';
                          }

                          const timeStr = formatDateTime(getTimestampField(log, type));
                          const relativeStr = getRelativeTime(getTimestampField(log, type));
                          const isExpanded = expandedLogIds.has(log.id);

                          return (
                            <div key={log.id} className="relative group">
                              {/* Timeline indicator node */}
                              <div className={`absolute -ml-[43px] md:-ml-[51px] mt-2.5 w-3.5 h-3.5 rounded-full ${dotColor} border-4 border-neutral-100 dark:border-neutral-950 group-hover:scale-125 transition-transform duration-200 shadow-sm`} />

                              {/* Card Content */}
                              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 hover:shadow-md transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                      {details.user}
                                    </span>
                                    <span className="text-xs text-neutral-300 dark:text-neutral-700">•</span>
                                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-900 px-2 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-800">
                                      {details.module}
                                    </span>
                                    <span className="text-xs text-neutral-300 dark:text-neutral-700">•</span>
                                    {getStatusBadge(log.status)}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{timeStr}</span>
                                    <span className="opacity-70">({relativeStr})</span>
                                  </div>
                                </div>

                                <div className="text-sm font-medium text-neutral-750 dark:text-neutral-300 mb-4 pl-1">
                                  {details.title}
                                </div>

                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 bg-neutral-50 dark:bg-neutral-900/40 p-3 rounded-lg border border-neutral-100 dark:border-neutral-900 pl-4 border-l-4 border-l-primary-500">
                                  {details.description}
                                </div>

                                {/* Expanded Detail Panel */}
                                {isExpanded && (
                                  <div className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg animate-in slide-in-from-top-2 duration-200">
                                    <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 border-b border-neutral-200 dark:border-neutral-850 pb-1.5 flex items-center justify-between">
                                      <span>Log Metadata</span>
                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                          toast.success("Copied log metadata payload!");
                                        }}
                                        className="text-[10px] text-primary-600 hover:underline capitalize"
                                      >
                                        copy payload
                                      </button>
                                    </div>
                                    <pre className="text-xs text-neutral-750 dark:text-neutral-300 font-mono overflow-x-auto whitespace-pre bg-neutral-100 dark:bg-neutral-950 p-3 rounded border border-neutral-200/50 dark:border-neutral-900 max-h-60">
                                      {JSON.stringify(log, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* Action Area */}
                                <div className="flex items-center justify-between pt-3.5 border-t border-neutral-100 dark:border-neutral-900/60 mt-3.5 text-xs">
                                  <span className="font-mono text-neutral-400 dark:text-neutral-500">ID: {log.id}</span>
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(log.id);
                                        toast.success("Copied log ID!");
                                      }}
                                      className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors font-medium"
                                    >
                                      Copy ID
                                    </button>
                                    <button
                                      onClick={() => toggleExpandLog(log.id)}
                                      className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors font-medium"
                                    >
                                      {isExpanded ? 'Hide Details' : 'Show Details'}
                                    </button>
                                    <button
                                      onClick={() => handleViewDetails(log)}
                                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold transition-colors"
                                    >
                                      Full View
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(new Set(paginatedData.map(u => u.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                    {config.columns.map(col => visibleColumns[col.key] && (
                      <th 
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {renderSortArrow(col.key)}
                        </div>
                      </th>
                    ))}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800 tracking-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((log) => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                        onClick={() => handleViewDetails(log)}
                      >
                        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(log.id)}
                            onChange={() => toggleSelection(log.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          />
                        </td>
                        
                        {type === 'login' && (
                          <>
                            {visibleColumns.userName && <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{(log as LoginLog).userName}</td>}
                            {visibleColumns.email && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{(log as LoginLog).email}</td>}
                            {visibleColumns.role && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{(log as LoginLog).role}</td>}
                            {visibleColumns.loginTime && (
                              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <div>{formatDateTime((log as LoginLog).loginTime)}</div>
                                <div className="text-xs text-neutral-400">({getRelativeTime((log as LoginLog).loginTime)})</div>
                              </td>
                            )}
                            {visibleColumns.status && <td className="px-6 py-4">{getStatusBadge((log as LoginLog).status)}</td>}
                            {visibleColumns.ipAddress && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-mono">{(log as LoginLog).ipAddress}</td>}
                            {visibleColumns.device && (
                              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                {(log as LoginLog).device} / {(log as LoginLog).browser}
                              </td>
                            )}
                          </>
                        )}

                        {type === 'audit' && (
                          <>
                            {visibleColumns.user && <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{(log as AuditLog).user}</td>}
                            {visibleColumns.module && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{(log as AuditLog).module}</td>}
                            {visibleColumns.actionType && (
                              <td className="px-6 py-4">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                  (log as AuditLog).actionType === 'Delete' ? 'bg-error-50 text-error-600 dark:bg-error-950/20 dark:text-error-400' :
                                  (log as AuditLog).actionType === 'Create' ? 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400' :
                                  'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400'
                                }`}>
                                  {(log as AuditLog).actionType}
                                </span>
                              </td>
                            )}
                            {visibleColumns.recordName && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 italic">{(log as AuditLog).recordName}</td>}
                            {visibleColumns.timestamp && (
                              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <div>{formatDateTime((log as AuditLog).timestamp)}</div>
                                <div className="text-xs text-neutral-400">({getRelativeTime((log as AuditLog).timestamp)})</div>
                              </td>
                            )}
                            {visibleColumns.ipAddress && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-mono">{(log as AuditLog).ipAddress}</td>}
                          </>
                        )}

                        {type === 'api' && (
                          <>
                            {visibleColumns.apiName && <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{(log as APILog).apiName}</td>}
                            {visibleColumns.endpoint && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-mono truncate max-w-[200px]">{(log as APILog).endpoint}</td>}
                            {visibleColumns.method && (
                              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <span className="font-bold">{(log as APILog).method}</span>
                              </td>
                            )}
                            {visibleColumns.status && <td className="px-6 py-4">{getStatusBadge((log as APILog).status)}</td>}
                            {visibleColumns.requestTime && (
                              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <div>{formatDateTime((log as APILog).requestTime)}</div>
                                <div className="text-xs text-neutral-400">({getRelativeTime((log as APILog).requestTime)})</div>
                              </td>
                            )}
                            {visibleColumns.responseTime && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 font-semibold text-primary-600">{formatDuration((log as APILog).responseTime)}</td>}
                          </>
                        )}

                        {type === 'email' && (
                          <>
                            {visibleColumns.recipientName && (
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-neutral-900 dark:text-white">{(log as EmailLog).recipientName}</div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-500">{(log as EmailLog).recipientEmail}</div>
                              </td>
                            )}
                            {visibleColumns.templateName && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{(log as EmailLog).templateName}</td>}
                            {visibleColumns.subject && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">{(log as EmailLog).subject}</td>}
                            {visibleColumns.sentAt && (
                              <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <div>{formatDateTime((log as EmailLog).sentAt)}</div>
                                <div className="text-xs text-neutral-400">({getRelativeTime((log as EmailLog).sentAt)})</div>
                              </td>
                            )}
                            {visibleColumns.status && <td className="px-6 py-4">{getStatusBadge((log as EmailLog).status)}</td>}
                            {visibleColumns.triggeredBy && <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 italic">{(log as EmailLog).triggeredBy}</td>}
                          </>
                        )}

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <IconButton 
                              icon={Eye} 
                              onClick={() => handleViewDetails(log)} 
                              title="View Details"
                              borderless
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
                          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No logs found</h3>
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

        {/* PAGINATION SECTION */}
        <div className="mt-6">
          {filteredData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>

        {/* DETAIL MODAL */}
        <FormModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`${config.title} Details`}
          maxWidth="max-w-2xl"
        >
          {selectedLog && (
            <div className="space-y-6">
              <FormSection title="General Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField>
                    <FormLabel>Log ID</FormLabel>
                    <FormInput value={selectedLog.id} readOnly />
                  </FormField>
                  <FormField>
                    <FormLabel>Date & Time</FormLabel>
                    <FormInput value={`${formatDateTime(getTimestampField(selectedLog, type))} (${getRelativeTime(getTimestampField(selectedLog, type))})`} readOnly />
                  </FormField>
                  <FormField>
                    <FormLabel>Status</FormLabel>
                    <div className="h-10 flex items-center">
                      {getStatusBadge(selectedLog.status)}
                    </div>
                  </FormField>
                  <FormField>
                    <FormLabel>IP Address</FormLabel>
                    <FormInput value={selectedLog.ipAddress || 'System Generated'} readOnly />
                  </FormField>
                </div>
              </FormSection>

              {type === 'login' && (
                <FormSection title="Session Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField>
                      <FormLabel>Session Start Time</FormLabel>
                      <FormInput value={formatDateTime(selectedLog.loginTime)} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Session End Time</FormLabel>
                      <FormInput value={selectedLog.logoutTime ? formatDateTime(selectedLog.logoutTime) : 'Active Session'} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Session Duration</FormLabel>
                      <FormInput value={selectedLog.sessionDuration || calculateDuration(selectedLog.loginTime, selectedLog.logoutTime)} readOnly />
                    </FormField>
                    <div className="col-span-1 md:col-span-2 border-t border-neutral-100 dark:border-neutral-800 my-2 pt-4" />
                    <FormField>
                      <FormLabel>User</FormLabel>
                      <FormInput value={`${selectedLog.userName} (${selectedLog.email})`} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Role</FormLabel>
                      <FormInput value={selectedLog.role} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Device</FormLabel>
                      <FormInput value={selectedLog.device} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Browser / OS</FormLabel>
                      <FormInput value={`${selectedLog.browser} / ${selectedLog.os}`} readOnly />
                    </FormField>
                    <FormField className="md:col-span-2">
                      <FormLabel>Location</FormLabel>
                      <FormInput value={selectedLog.location} readOnly />
                    </FormField>
                    {selectedLog.failureReason && (
                      <FormField className="md:col-span-2">
                        <FormLabel>Failure Reason</FormLabel>
                        <FormTextArea value={selectedLog.failureReason} readOnly rows={2} />
                      </FormField>
                    )}
                  </div>
                </FormSection>
              )}

              {type === 'audit' && (
                <FormSection title="Modification History">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <FormField>
                      <FormLabel>Performed By</FormLabel>
                      <FormInput value={selectedLog.user} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Module</FormLabel>
                      <FormInput value={selectedLog.module} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Action</FormLabel>
                      <FormInput value={selectedLog.actionType} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Record</FormLabel>
                      <FormInput value={selectedLog.recordName} readOnly />
                    </FormField>
                  </div>
                  
                  {selectedLog.details && (
                    <div className="space-y-4">
                      <FormField>
                        <FormLabel>Change Description</FormLabel>
                        <FormTextArea value={selectedLog.description} readOnly rows={2} />
                      </FormField>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField>
                          <FormLabel>Before Change</FormLabel>
                          <FormTextArea 
                            value={JSON.stringify(selectedLog.details.before, null, 2)} 
                            readOnly 
                            rows={6}
                            className="font-mono text-[13px]" 
                          />
                        </FormField>
                        <FormField>
                          <FormLabel>After Change</FormLabel>
                          <FormTextArea 
                            value={JSON.stringify(selectedLog.details.after, null, 2)} 
                            readOnly 
                            rows={6}
                            className="font-mono text-[13px]" 
                          />
                        </FormField>
                      </div>
                    </div>
                  )}
                </FormSection>
              )}

              {type === 'api' && (
                <FormSection title="Payload Data">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <FormField>
                      <FormLabel>API Name</FormLabel>
                      <FormInput value={selectedLog.apiName} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Method / Status</FormLabel>
                      <FormInput value={`${selectedLog.method} / ${selectedLog.status}`} readOnly />
                    </FormField>
                    <FormField className="md:col-span-2">
                      <FormLabel>Endpoint URL</FormLabel>
                      <FormInput value={selectedLog.endpoint} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Request Time</FormLabel>
                      <FormInput value={formatDateTime(selectedLog.requestTime)} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Total Execution Duration</FormLabel>
                      <FormInput value={formatDuration(selectedLog.responseTime)} readOnly />
                    </FormField>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField>
                      <FormLabel>Request Payload</FormLabel>
                      <FormTextArea 
                        value={selectedLog.requestPayload} 
                        readOnly 
                        rows={6}
                        className="font-mono text-[13px]"
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Response Body</FormLabel>
                      <FormTextArea 
                        value={selectedLog.responsePayload} 
                        readOnly 
                        rows={6}
                        className="font-mono text-[13px]"
                      />
                    </FormField>
                  </div>
                </FormSection>
              )}

              {type === 'email' && (
                <FormSection title="Email Delivery Preview">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <FormField>
                      <FormLabel>Recipient</FormLabel>
                      <FormInput value={`${selectedLog.recipientName} (${selectedLog.recipientEmail})`} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Template Used</FormLabel>
                      <FormInput value={selectedLog.templateName} readOnly />
                    </FormField>
                    <FormField className="md:col-span-2">
                      <FormLabel>Subject Line</FormLabel>
                      <FormInput value={selectedLog.subject} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>Triggered By</FormLabel>
                      <FormInput value={selectedLog.triggeredBy} readOnly />
                    </FormField>
                    <div className="col-span-1 md:col-span-2 border-t border-neutral-100 dark:border-neutral-800 my-2 pt-4" />
                    <FormField>
                      <FormLabel>Queued Time</FormLabel>
                      <FormInput value={formatDateTime(new Date(new Date(selectedLog.sentAt).getTime() - 2000).toISOString())} readOnly />
                    </FormField>
                    <FormField>
                      <FormLabel>{selectedLog.status === 'Failed' ? 'Failed Time' : 'Sent Time'}</FormLabel>
                      <FormInput value={formatDateTime(selectedLog.sentAt)} readOnly />
                    </FormField>
                  </div>
                  
                  <FormField>
                    <FormLabel>Message Preview</FormLabel>
                    <FormTextArea 
                      value={selectedLog.contentPreview} 
                      readOnly 
                      rows={8}
                    />
                  </FormField>
                  
                  {selectedLog.status === 'Failed' && (
                    <div className="mt-2">
                      <FormField>
                        <FormLabel>Error Details</FormLabel>
                        <div className="p-3 bg-error-50 dark:bg-error-950/20 text-error-600 dark:text-error-400 rounded-lg text-sm border border-error-100 dark:border-error-900/30">
                          {selectedLog.failureReason}
                        </div>
                      </FormField>
                    </div>
                  )}
                </FormSection>
              )}
            </div>
          )}
        </FormModal>
      </div>
    </div>
  );
}
