import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  MoreVertical,
  Globe,
  MapPin,
  Map,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  FileSpreadsheet,
  FileText,
  BarChart3
} from 'lucide-react';
import { 
  PageHeader, 
  SearchBar, 
  Pagination, 
  IconButton,
  ViewModeSwitcher,
  PrimaryButton,
  ColumnVisibilityPanel,
  SummaryWidgets,
  type ColumnConfig
} from './hb/listing';
import { 
  FormModal, 
  FormSection, 
  FormField, 
  FormLabel, 
  FormInput, 
  FormSelect,
  StatusSlider
} from './hb/common';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'table';

export interface MasterItem {
  id: string;
  name: string;
  code?: string;
  countryName?: string;
  stateName?: string;
  status: 'active' | 'inactive';
  createdDate: string;
  childCount?: number;
}

const initialCountries: MasterItem[] = [
  { id: 'CNT-001', name: 'United States', code: 'US (+1)', status: 'active', createdDate: '2024-01-10', childCount: 12 },
  { id: 'CNT-002', name: 'United Kingdom', code: 'UK (+44)', status: 'active', createdDate: '2024-01-12', childCount: 8 },
  { id: 'CNT-003', name: 'Germany', code: 'DE (+49)', status: 'active', createdDate: '2024-01-15', childCount: 16 },
  { id: 'CNT-004', name: 'Canada', code: 'CA (+1)', status: 'inactive', createdDate: '2024-02-01', childCount: 10 },
  { id: 'CNT-005', name: 'Australia', code: 'AU (+61)', status: 'active', createdDate: '2024-02-10', childCount: 6 },
];

const initialStates: MasterItem[] = [
  { id: 'STT-001', name: 'California', countryName: 'United States', status: 'active', createdDate: '2024-01-11', childCount: 20 },
  { id: 'STT-002', name: 'New York', countryName: 'United States', status: 'active', createdDate: '2024-01-14', childCount: 15 },
  { id: 'STT-003', name: 'Bavaria', countryName: 'Germany', status: 'active', createdDate: '2024-01-18', childCount: 12 },
  { id: 'STT-004', name: 'Ontario', countryName: 'Canada', status: 'inactive', createdDate: '2024-02-05', childCount: 8 },
  { id: 'STT-005', name: 'New South Wales', countryName: 'Australia', status: 'active', createdDate: '2024-02-12', childCount: 5 },
];

const initialCities: MasterItem[] = [
  { id: 'CTY-001', name: 'San Francisco', stateName: 'California', countryName: 'United States', status: 'active', createdDate: '2024-01-12' },
  { id: 'CTY-002', name: 'Los Angeles', stateName: 'California', countryName: 'United States', status: 'active', createdDate: '2024-01-13' },
  { id: 'CTY-003', name: 'New York City', stateName: 'New York', countryName: 'United States', status: 'active', createdDate: '2024-01-15' },
  { id: 'CTY-004', name: 'Munich', stateName: 'Bavaria', countryName: 'Germany', status: 'active', createdDate: '2024-01-20' },
  { id: 'CTY-005', name: 'Sydney', stateName: 'New South Wales', countryName: 'Australia', status: 'active', createdDate: '2024-02-15' },
];

interface MasterManagementProps {
  masterType: 'country' | 'state' | 'city';
}

export default function MasterManagement({ masterType }: MasterManagementProps) {
  // Enforce Default Card View as per standards
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const [countries, setCountries] = useState<MasterItem[]>(initialCountries);
  const [states, setStates] = useState<MasterItem[]>(initialStates);
  const [cities, setCities] = useState<MasterItem[]>(initialCities);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  // Sorting state
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal / Form state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
  const [activeItem, setActiveItem] = useState<Partial<MasterItem> | null>(null);
  
  // Association Modal state
  const [showAssociationModal, setShowAssociationModal] = useState(false);
  const [associationData, setAssociationData] = useState<{title: string, items: {name: string, code?: string, status: string}[]}>({title: '', items: []});

  // Column Visibility State
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);

  // Headers and UI elements configuration
  const config = useMemo(() => {
    switch (masterType) {
      case 'country':
        return {
          title: 'Country Master',
          subtitle: 'Manage organizational operating countries',
          icon: Globe,
          idLabel: 'Country Id',
          nameLabel: 'Country Name',
        };
      case 'state':
        return {
          title: 'State Master',
          subtitle: 'Manage regions and administrative states',
          icon: Map,
          idLabel: 'State Id',
          nameLabel: 'State Name',
        };
      case 'city':
        return {
          title: 'City Master',
          subtitle: 'Manage local operating cities and hubs',
          icon: MapPin,
          idLabel: 'City Id',
          nameLabel: 'City Name',
        };
      default:
        return {
          title: 'Master Management',
          subtitle: 'Manage organizational master data',
          icon: Globe,
          idLabel: 'Id',
          nameLabel: 'Name',
        };
    }
  }, [masterType]);

  const masterColumns = useMemo<ColumnConfig[]>(() => {
    const cols = [
      { key: 'id', label: config.idLabel },
      { key: 'name', label: config.nameLabel },
    ];

    if (masterType === 'country') {
      cols.push({ key: 'code', label: 'Country Code' });
      cols.push({ key: 'childCount', label: 'States Count' });
    } else {
      cols.push({ key: 'countryName', label: 'Country Name' });
      if (masterType === 'city') {
        cols.push({ key: 'stateName', label: 'State Name' });
      } else {
        cols.push({ key: 'childCount', label: 'Cities Count' });
      }
    }

    cols.push({ key: 'status', label: 'Status' });
    cols.push({ key: 'createdDate', label: 'Created Date' });

    return cols;
  }, [masterType, config]);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    code: true,
    countryName: true,
    stateName: true,
    childCount: true,
    status: true,
    createdDate: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Derive current data array based on masterType prop
  const currentDataArray = useMemo(() => {
    switch (masterType) {
      case 'country': return countries;
      case 'state': return states;
      case 'city': return cities;
      default: return [];
    }
  }, [masterType, countries, states, cities]);

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

  // Filter and Sort Data
  const processedData = useMemo(() => {
    let result = currentDataArray.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.countryName && item.countryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.stateName && item.stateName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

    result.sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (sortField) {
        case 'id':
          aValue = a.id; bValue = b.id; break;
        case 'name':
          aValue = a.name; bValue = b.name; break;
        case 'code':
          aValue = a.code || ''; bValue = b.code || ''; break;
        case 'countryName':
          aValue = a.countryName || ''; bValue = b.countryName || ''; break;
        case 'stateName':
          aValue = a.stateName || ''; bValue = b.stateName || ''; break;
        case 'status':
          aValue = a.status; bValue = b.status; break;
        case 'createdDate':
          aValue = a.createdDate; bValue = b.createdDate; break;
        default:
          aValue = a.name; bValue = b.name; break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [currentDataArray, searchQuery, sortField, sortDirection]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  // Auto-close column visibility panel when leaving table view
  useEffect(() => {
    if (viewMode !== 'table') {
      setShowColumnPanel(false);
    }
  }, [viewMode]);

  // Enhanced Export handler (CSV/PDF)
  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedIds.size > 0 
      ? processedData.filter(item => selectedIds.has(item.id))
      : processedData;

    if (dataToExport.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    const columnsToExport = masterColumns.filter(col => visibleColumns[col.key]);

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
      link.setAttribute('download', `${masterType}_master_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Successfully exported ${dataToExport.length} items to Excel.`);
    } else {
      let reportContent = `${masterType.toUpperCase()} MASTER REPORT - Generated on ${new Date().toLocaleString()}\n`;
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
      link.setAttribute('download', `${masterType}_master_export_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${dataToExport.length} items to PDF.`);
    }
  };

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
        isActive 
          ? 'bg-success-50 text-success-600 border-success-100 dark:bg-success-950/20 dark:text-success-400 dark:border-success-900/30' 
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`}></div>
        <span className="text-xs font-medium capitalize">
          {status}
        </span>
      </span>
    );
  };

  // Render Sorting Header Arrow Helper
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

  // CRUD Handlers
  const handleCreateNew = () => {
    const prefix = masterType === 'country' ? 'CNT' : masterType === 'state' ? 'STT' : 'CTY';
    const newId = `${prefix}-${String(currentDataArray.length + 1).padStart(3, '0')}`;
    setActiveItem({
      id: newId,
      name: '',
      code: masterType === 'country' ? '' : undefined,
      countryName: masterType !== 'country' ? 'United States' : undefined,
      stateName: masterType === 'city' ? 'California' : undefined,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
  };

  const handleSaveItem = () => {
    if (!activeItem || !activeItem.name) {
      toast.error('Please complete required fields.');
      return;
    }

    const savedItem = activeItem as MasterItem;
    
    if (modalMode === 'create') {
      if (masterType === 'country') setCountries(prev => [...prev, savedItem]);
      else if (masterType === 'state') setStates(prev => [...prev, savedItem]);
      else setCities(prev => [...prev, savedItem]);
      toast.success(`${config.title} item added successfully.`);
    } else if (modalMode === 'edit') {
      if (masterType === 'country') {
        setCountries(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      } else if (masterType === 'state') {
        setStates(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      } else {
        setCities(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      }
      toast.success(`${config.title} item updated successfully.`);
    }

    setModalMode(null);
    setActiveItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      if (masterType === 'country') setCountries(prev => prev.filter(i => i.id !== id));
      else if (masterType === 'state') setStates(prev => prev.filter(i => i.id !== id));
      else setCities(prev => prev.filter(i => i.id !== id));
      toast.success('Record deleted successfully.');
    }
  };

  const handleShowAssociation = (item: MasterItem) => {
    let title = '';
    let items: {name: string, code?: string, status: string}[] = [];

    if (masterType === 'country') {
      title = `States in ${item.name}`;
      items = states.filter(s => s.countryName === item.name).map(s => ({
        name: s.name,
        code: s.id,
        status: s.status
      }));
    } else if (masterType === 'state') {
      title = `Cities in ${item.name}`;
      items = cities.filter(c => c.stateName === item.name).map(c => ({
        name: c.name,
        code: c.id,
        status: c.status
      }));
    }

    setAssociationData({ title, items });
    setShowAssociationModal(true);
  };

  const IconComponent = config.icon;

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        {/* PAGE HEADER */}
        <PageHeader
          title={config.title}
          subtitle={config.subtitle}
          breadcrumbs={[
            { label: 'Configurations', href: '#' },
            { label: 'Master Management', href: '#' },
            { label: config.title, current: true },
          ]}
        >
          <div className="flex items-center gap-2 flex-wrap" ref={columnAnchorRef}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
              placeholder={`Search ${masterType}s...`}
            />
            
            <PrimaryButton icon={Plus} onClick={handleCreateNew}>
              Add {masterType.charAt(0).toUpperCase() + masterType.slice(1)}
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

            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={masterColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              anchorRef={columnAnchorRef}
            />
          </div>
        </PageHeader>

        {/* SUMMARY WIDGETS */}
        {showSummary && (
          <>
            {masterType === 'country' && (
              <SummaryWidgets
                title="Country Summary"
                widgets={[
                  { label: 'Total Countries', value: countries.length, icon: 'Globe' },
                  { label: 'Active Countries', value: countries.filter(c => c.status === 'active').length, icon: 'CheckCircle' },
                ]}
              />
            )}
            {masterType === 'state' && (
              <SummaryWidgets
                title="State Summary"
                widgets={[
                  { label: 'Total States', value: states.length, icon: 'Building2' },
                  { label: 'Associated Countries', value: new Set(states.map(s => s.countryName).filter(Boolean)).size, icon: 'Globe' },
                ]}
              />
            )}
            {masterType === 'city' && (
              <SummaryWidgets
                title="City Summary"
                widgets={[
                  { label: 'Total Cities', value: cities.length, icon: 'MapPin' },
                  { label: 'Associated States', value: new Set(cities.map(c => c.stateName).filter(Boolean)).size, icon: 'Building2' },
                ]}
              />
            )}
          </>
        )}

        {/* ========== CARD VIEW (DEFAULT STANDARDIZED) ========== */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between min-h-[160px] ${
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
                    {/* Header line inside card */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {item.id}
                          </span>
                        </div>
                      </div>

                      {/* TOP-RIGHT ACTION AREA */}
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          title="Select Record"
                        />
                        <IconButton
                          icon={MoreVertical}
                          borderless={true}
                          title="Actions"
                          menuItems={[
                            { icon: Eye, label: 'View Details', onClick: () => { setActiveItem(item); setModalMode('view'); } },
                            { icon: Edit, label: 'Edit Record', onClick: () => { setActiveItem(item); setModalMode('edit'); } },
                            { divider: true },
                            { icon: Trash2, label: 'Delete Record', onClick: () => handleDeleteItem(item.id) },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Metadata lines */}
                    <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-50 dark:border-neutral-900">
                      {item.code && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Code:</span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">{item.code}</span>
                        </div>
                      )}
                      {item.countryName && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Country:</span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">{item.countryName}</span>
                        </div>
                      )}
                      {item.stateName && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">State:</span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">{item.stateName}</span>
                        </div>
                      )}
                      {item.childCount !== undefined && (
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-neutral-400">{masterType === 'country' ? 'States:' : 'Cities:'}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleShowAssociation(item); }}
                            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline decoration-primary-500/30 underline-offset-4 transition-all"
                          >
                            {item.childCount} {masterType === 'country' ? 'States' : 'Cities'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Status badge ONLY (Checkbox moved to top) */}
                  <div className="flex items-center justify-end pt-3 mt-4 border-t border-neutral-100 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/30 dark:bg-neutral-900/30">
                <p className="text-sm text-neutral-500">No matching master records found.</p>
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
                        title="Select Record"
                      />
                    </div>

                    <div className="w-8 h-8 rounded bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600 flex-shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                      <div className="min-w-[150px]">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {item.id}
                        </span>
                      </div>

                      {item.code && (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          Code: {item.code}
                        </span>
                      )}

                      {item.countryName && (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          Country: {item.countryName}
                        </span>
                      )}

                      {item.stateName && (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          State: {item.stateName}
                        </span>
                      )}

                      {item.childCount !== undefined && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleShowAssociation(item); }}
                          className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline decoration-primary-500/30 underline-offset-4 transition-all"
                        >
                          {item.childCount} {masterType === 'country' ? 'States' : 'Cities'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                    <IconButton
                      icon={MoreVertical}
                      borderless={true}
                      title="Actions"
                      menuItems={[
                        { icon: Eye, label: 'View Details', onClick: () => { setActiveItem(item); setModalMode('view'); } },
                        { icon: Edit, label: 'Edit Record', onClick: () => { setActiveItem(item); setModalMode('edit'); } },
                        { divider: true },
                        { icon: Trash2, label: 'Delete Record', onClick: () => handleDeleteItem(item.id) },
                      ]}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">No matching master records found.</p>
              </div>
            )}
          </div>
        )}

        {/* ========== DATA TABLE VIEW (STICKY HEADER SCROLLING LAYOUT) ========== */}
        {viewMode === 'table' && (
          <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
            {/* Scrollable container enforces sticky header */}
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
                            setSelectedIds(new Set(paginatedData.map(i => i.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        title="Select All on Page"
                      />
                    </th>
                    
                    {/* Standardized Title Case Headers with Inline Sorting */}
                    {visibleColumns.id && (
                      <th 
                        onClick={() => handleSort('id')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        {config.idLabel} {renderSortIndicator('id')}
                      </th>
                    )}

                    {visibleColumns.name && (
                      <th 
                        onClick={() => handleSort('name')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        {config.nameLabel} {renderSortIndicator('name')}
                      </th>
                    )}

                    {masterType === 'country' && visibleColumns.code && (
                      <th 
                        onClick={() => handleSort('code')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Country Code {renderSortIndicator('code')}
                      </th>
                    )}

                    {masterType !== 'country' && visibleColumns.countryName && (
                      <th 
                        onClick={() => handleSort('countryName')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        Country Name {renderSortIndicator('countryName')}
                      </th>
                    )}

                    {masterType === 'city' && visibleColumns.stateName && (
                      <th 
                        onClick={() => handleSort('stateName')}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 tracking-normal"
                      >
                        State Name {renderSortIndicator('stateName')}
                      </th>
                    )}

                    {(masterType === 'country' || masterType === 'state') && visibleColumns.childCount && (
                      <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800 tracking-normal">
                        {masterType === 'country' ? 'States Count' : 'Cities Count'}
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
                            title="Select Record"
                          />
                        </td>
                        {visibleColumns.id && (
                          <td className="px-6 py-3.5 text-sm font-mono text-primary-600 dark:text-primary-400 font-medium">
                            {item.id}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white">
                            {item.name}
                          </td>
                        )}
                        
                        {masterType === 'country' && visibleColumns.code && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                            {item.code}
                          </td>
                        )}

                        {masterType !== 'country' && visibleColumns.countryName && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                            {item.countryName}
                          </td>
                        )}

                        {masterType === 'city' && visibleColumns.stateName && (
                          <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">
                            {item.stateName}
                          </td>
                        )}

                        {(masterType === 'country' || masterType === 'state') && visibleColumns.childCount && (
                          <td className="px-6 py-3.5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleShowAssociation(item); }}
                              className="text-primary-600 dark:text-primary-400 font-semibold hover:underline decoration-primary-500/30 underline-offset-4 transition-all"
                            >
                              {item.childCount} {masterType === 'country' ? 'States' : 'Cities'}
                            </button>
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
                              title="View Details"
                            />
                            <IconButton
                              icon={Edit}
                              borderless={true}
                              onClick={() => { setActiveItem(item); setModalMode('edit'); }}
                              title="Edit Record"
                            />
                            <IconButton
                              icon={Trash2}
                              borderless={true}
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete Record"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-16 text-center text-sm text-neutral-500">
                          No matching records found.
                        </td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== PAGINATION (FROZEN/SEPARATE FOOTER CONTAINER) ========== */}
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

        {/* ========== CRUD FORM MODAL ========== */}
        <FormModal
          isOpen={modalMode !== null}
          onClose={() => { setModalMode(null); setActiveItem(null); }}
          title={modalMode === 'create' ? `Add New ${config.title}` : modalMode === 'edit' ? `Edit Record ${activeItem?.id}` : `View Details: ${activeItem?.name}`}
          maxWidth="max-w-lg"
        >
          {activeItem && (
            <div className="space-y-4">
              <FormSection>
                <FormField>
                  <FormLabel required={modalMode !== 'view'}>{config.nameLabel}</FormLabel>
                  <FormInput
                    value={activeItem.name || ''}
                    onChange={e => setActiveItem({...activeItem, name: e.target.value})}
                    readOnly={modalMode === 'view'}
                    placeholder={`Enter ${masterType} name`}
                  />
                </FormField>
              </FormSection>

              {masterType === 'country' && (
                <FormSection>
                  <FormField>
                    <FormLabel>Country Code & Prefix</FormLabel>
                    <FormInput
                      value={activeItem.code || ''}
                      onChange={e => setActiveItem({...activeItem, code: e.target.value})}
                      readOnly={modalMode === 'view'}
                      placeholder="e.g. US (+1)"
                    />
                  </FormField>
                </FormSection>
              )}

              {masterType !== 'country' && (
                <FormSection>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Parent Country</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.countryName || ''} readOnly />
                    ) : (
                      <FormSelect
                        value={activeItem.countryName || 'United States'}
                        onChange={e => setActiveItem({...activeItem, countryName: e.target.value})}
                      >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </FormSelect>
                    )}
                  </FormField>
                </FormSection>
              )}

              {masterType === 'city' && (
                <FormSection>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Parent State</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.stateName || ''} readOnly />
                    ) : (
                      <FormSelect
                        value={activeItem.stateName || 'California'}
                        onChange={e => setActiveItem({...activeItem, stateName: e.target.value})}
                      >
                        <option value="California">California</option>
                        <option value="New York">New York</option>
                        <option value="Bavaria">Bavaria</option>
                        <option value="New South Wales">New South Wales</option>
                      </FormSelect>
                    )}
                  </FormField>
                </FormSection>
              )}

              <FormSection>
                <FormField>
                  <FormLabel>Status</FormLabel>
                  {modalMode === 'view' ? (
                    <div className="pt-1">{renderStatusBadge(activeItem.status || 'active')}</div>
                  ) : (
                    <StatusSlider
                      value={activeItem.status || 'active'}
                      onChange={val => setActiveItem({...activeItem, status: val})}
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
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <PrimaryButton onClick={handleSaveItem}>
                    Save {config.title}
                  </PrimaryButton>
                )}
              </div>
            </div>
          )}
        </FormModal>

        {/* ========== ASSOCIATION POPUP (STATES/CITIES LIST) ========== */}
        <FormModal
          isOpen={showAssociationModal}
          onClose={() => setShowAssociationModal(false)}
          title={associationData.title}
          maxWidth="max-w-md"
        >
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {associationData.items.length > 0 ? (
              associationData.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      ID: {item.code}
                    </span>
                  </div>
                  {renderStatusBadge(item.status)}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-500 text-sm italic">
                No associations found for this record.
              </div>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              onClick={() => setShowAssociationModal(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </FormModal>
      </div>
    </div>
  );
}
