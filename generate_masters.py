import os
import re

content = """import { useState, useMemo, useRef, useEffect } from 'react';
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
  BarChart3,
  Building
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
  regionName?: string;
  townName?: string;
  status: 'active' | 'inactive';
  createdDate: string;
  childCount?: number;
}

const initialCountries: MasterItem[] = [
  { id: 'CNT-001', name: 'United Kingdom', status: 'active', createdDate: '2024-01-12', childCount: 8 },
  { id: 'CNT-002', name: 'United States', status: 'active', createdDate: '2024-01-10', childCount: 12 },
];

const initialRegions: MasterItem[] = [
  { id: 'REG-001', name: 'England', countryName: 'United Kingdom', status: 'active', createdDate: '2024-01-11', childCount: 20 },
  { id: 'REG-002', name: 'Scotland', countryName: 'United Kingdom', status: 'active', createdDate: '2024-01-14', childCount: 15 },
  { id: 'REG-003', name: 'California', countryName: 'United States', status: 'active', createdDate: '2024-01-18', childCount: 12 },
];

const initialTowns: MasterItem[] = [
  { id: 'TWN-001', name: 'London', regionName: 'England', countryName: 'United Kingdom', status: 'active', createdDate: '2024-01-12', childCount: 5 },
  { id: 'TWN-002', name: 'Manchester', regionName: 'England', countryName: 'United Kingdom', status: 'active', createdDate: '2024-01-13', childCount: 3 },
  { id: 'TWN-003', name: 'Edinburgh', regionName: 'Scotland', countryName: 'United Kingdom', status: 'active', createdDate: '2024-01-15', childCount: 2 },
];

const initialCentres: MasterItem[] = [
  { id: 'CEN-001', name: 'Central Hub', townName: 'London', regionName: 'England', countryName: 'United Kingdom', status: 'active', createdDate: '2024-01-12' },
  { id: 'CEN-002', name: 'North Branch', townName: 'Manchester', regionName: 'England', countryName: 'United Kingdom', status: 'active', createdDate: '2024-01-13' },
];

interface MasterManagementProps {
  masterType: 'country' | 'region' | 'town' | 'centre';
}

export default function SuperAdminMasters({ masterType }: MasterManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const [countries, setCountries] = useState<MasterItem[]>(initialCountries);
  const [regions, setRegions] = useState<MasterItem[]>(initialRegions);
  const [towns, setTowns] = useState<MasterItem[]>(initialTowns);
  const [centres, setCentres] = useState<MasterItem[]>(initialCentres);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'status' | 'delete' | null>(null);
  const [activeItem, setActiveItem] = useState<Partial<MasterItem> | null>(null);
  
  const [showAssociationModal, setShowAssociationModal] = useState(false);
  const [associationData, setAssociationData] = useState<{title: string, items: {name: string, code?: string, status: string}[]}>({title: '', items: []});

  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);

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
      case 'region':
        return {
          title: 'Region Master',
          subtitle: 'Manage regions and states',
          icon: Map,
          idLabel: 'Region Id',
          nameLabel: 'Region Name',
        };
      case 'town':
        return {
          title: 'Town Master',
          subtitle: 'Manage operating towns',
          icon: MapPin,
          idLabel: 'Town Id',
          nameLabel: 'Town Name',
        };
      case 'centre':
        return {
          title: 'Activity Centre Master',
          subtitle: 'Manage operating activity centres',
          icon: Building,
          idLabel: 'Centre Id',
          nameLabel: 'Activity Centre Name',
        };
    }
  }, [masterType]);

  const masterColumns = useMemo<ColumnConfig[]>(() => {
    const cols = [];

    if (masterType === 'country') {
      cols.push({ key: 'name', label: config.nameLabel });
      cols.push({ key: 'status', label: 'Status' });
      cols.push({ key: 'createdDate', label: 'Last Updated' });
    } else if (masterType === 'region') {
      cols.push({ key: 'countryName', label: 'Country' });
      cols.push({ key: 'name', label: config.nameLabel });
      cols.push({ key: 'status', label: 'Status' });
      cols.push({ key: 'createdDate', label: 'Last Updated' });
    } else if (masterType === 'town') {
      cols.push({ key: 'countryName', label: 'Country' });
      cols.push({ key: 'regionName', label: 'Region' });
      cols.push({ key: 'name', label: config.nameLabel });
      cols.push({ key: 'status', label: 'Status' });
      cols.push({ key: 'createdDate', label: 'Last Updated' });
    } else if (masterType === 'centre') {
      cols.push({ key: 'countryName', label: 'Country' });
      cols.push({ key: 'regionName', label: 'Region' });
      cols.push({ key: 'townName', label: 'Town' });
      cols.push({ key: 'name', label: config.nameLabel });
      cols.push({ key: 'status', label: 'Status' });
      cols.push({ key: 'createdDate', label: 'Last Updated' });
    }

    return cols;
  }, [masterType, config]);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    name: true,
    countryName: true,
    regionName: true,
    townName: true,
    status: true,
    createdDate: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentDataArray = useMemo(() => {
    switch (masterType) {
      case 'country': return countries;
      case 'region': return regions;
      case 'town': return towns;
      case 'centre': return centres;
    }
  }, [masterType, countries, regions, towns, centres]);

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
    let result = currentDataArray.filter(item => {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query) ||
             (item.countryName && item.countryName.toLowerCase().includes(query)) ||
             (item.regionName && item.regionName.toLowerCase().includes(query)) ||
             (item.townName && item.townName.toLowerCase().includes(query));
    });

    result.sort((a, b) => {
      let aValue: string = (a as any)[sortField] || '';
      let bValue: string = (b as any)[sortField] || '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [currentDataArray, searchQuery, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  useEffect(() => {
    if (viewMode !== 'table') {
      setShowColumnPanel(false);
    }
  }, [viewMode]);

  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedIds.size > 0 
      ? processedData.filter(item => selectedIds.has(item.id))
      : processedData;

    if (dataToExport.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    toast.success(`Successfully exported ${dataToExport.length} items to ${format.toUpperCase()}.`);
  };

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
        <span className="text-xs font-medium capitalize">
          {status}
        </span>
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
    const prefix = masterType === 'country' ? 'CNT' : masterType === 'region' ? 'REG' : masterType === 'town' ? 'TWN' : 'CEN';
    const newId = `${prefix}-${String(currentDataArray.length + 1).padStart(3, '0')}`;
    setActiveItem({
      id: newId,
      name: '',
      countryName: masterType !== 'country' ? countries[0]?.name : undefined,
      regionName: (masterType === 'town' || masterType === 'centre') ? regions[0]?.name : undefined,
      townName: masterType === 'centre' ? towns[0]?.name : undefined,
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
    
    // Check for uniqueness
    if (masterType === 'country' && countries.some(c => c.name === activeItem.name && c.id !== activeItem.id)) {
        toast.error('Country Name must be unique system-wide.');
        return;
    }
    if (masterType === 'region' && regions.some(r => r.name === activeItem.name && r.countryName === activeItem.countryName && r.id !== activeItem.id)) {
        toast.error('Region Name must be unique within the selected Country.');
        return;
    }
    if (masterType === 'town' && towns.some(t => t.name === activeItem.name && t.regionName === activeItem.regionName && t.id !== activeItem.id)) {
        toast.error('Town Name must be unique within the selected Region.');
        return;
    }
    if (masterType === 'centre' && centres.some(c => c.name === activeItem.name && c.townName === activeItem.townName && c.id !== activeItem.id)) {
        toast.error('Activity Centre Name must be unique within the selected Town.');
        return;
    }

    const savedItem = activeItem as MasterItem;
    
    const typeLabel = masterType.charAt(0).toUpperCase() + masterType.slice(1);
    const successMsg = modalMode === 'create' ? `${typeLabel === 'Centre' ? 'Activity Centre' : typeLabel} created successfully.` : `${typeLabel === 'Centre' ? 'Activity Centre' : typeLabel} updated successfully.`;

    if (modalMode === 'create') {
      if (masterType === 'country') setCountries(prev => [...prev, savedItem]);
      else if (masterType === 'region') setRegions(prev => [...prev, savedItem]);
      else if (masterType === 'town') setTowns(prev => [...prev, savedItem]);
      else setCentres(prev => [...prev, savedItem]);
      toast.success(successMsg);
    } else if (modalMode === 'edit') {
      if (masterType === 'country') setCountries(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      else if (masterType === 'region') setRegions(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      else if (masterType === 'town') setTowns(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      else setCentres(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      toast.success(successMsg);
    }

    setModalMode(null);
    setActiveItem(null);
  };

  const handleConfirmStatus = () => {
    if (activeItem) {
        const savedItem = { ...activeItem, status: activeItem.status === 'active' ? 'inactive' : 'active' } as MasterItem;
        if (masterType === 'country') setCountries(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        else if (masterType === 'region') setRegions(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        else if (masterType === 'town') setTowns(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        else setCentres(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        
        const typeLabel = masterType.charAt(0).toUpperCase() + masterType.slice(1);
        toast.success(`${typeLabel === 'Centre' ? 'Activity Centre' : typeLabel} status updated successfully.`);
    }
    setModalMode(null);
    setActiveItem(null);
  };

  const handleDeleteItem = () => {
    if (activeItem) {
        const id = activeItem.id;
        
        // Mock Dependency Check
        if ((activeItem as MasterItem).childCount && (activeItem as MasterItem).childCount! > 0) {
            toast.error('Cannot delete. This record is in use.');
            setModalMode(null);
            return;
        }

        if (masterType === 'country') setCountries(prev => prev.filter(i => i.id !== id));
        else if (masterType === 'region') setRegions(prev => prev.filter(i => i.id !== id));
        else if (masterType === 'town') setTowns(prev => prev.filter(i => i.id !== id));
        else setCentres(prev => prev.filter(i => i.id !== id));
        
        const typeLabel = masterType.charAt(0).toUpperCase() + masterType.slice(1);
        toast.success(`${typeLabel === 'Centre' ? 'Activity Centre' : typeLabel} deleted successfully.`);
    }
    setModalMode(null);
    setActiveItem(null);
  };

  const IconComponent = config.icon;

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title={config.title}
          subtitle={config.subtitle}
          breadcrumbs={[
            { label: 'Masters', href: '#' },
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
              Add {masterType === 'centre' ? 'Activity Centre' : masterType.charAt(0).toUpperCase() + masterType.slice(1)}
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
                            { icon: Check, label: item.status === 'active' ? 'Deactivate' : 'Activate', onClick: () => { setActiveItem(item); setModalMode('status'); } },
                            { icon: Trash2, label: 'Delete Record', onClick: () => { setActiveItem(item); setModalMode('delete'); } },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-50 dark:border-neutral-900">
                      {item.countryName && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Country:</span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">{item.countryName}</span>
                        </div>
                      )}
                      {item.regionName && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Region:</span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">{item.regionName}</span>
                        </div>
                      )}
                      {item.townName && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Town:</span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[120px]">{item.townName}</span>
                        </div>
                      )}
                      {item.childCount !== undefined && (
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-neutral-400">Children:</span>
                          <span className="font-semibold text-primary-600 dark:text-primary-400">{item.childCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end pt-3 mt-4 border-t border-neutral-100 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/30 dark:bg-neutral-900/30">
                <p className="text-sm text-neutral-500">No matching records found.</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-2 mt-4">
             {paginatedData.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors flex items-center justify-between gap-4 cursor-pointer`}
                  onClick={() => { setActiveItem(item); setModalMode('view'); }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                      <div className="min-w-[150px]">
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.name}</h4>
                      </div>
                      {item.countryName && <span className="text-xs text-neutral-600">Country: {item.countryName}</span>}
                      {item.regionName && <span className="text-xs text-neutral-600">Region: {item.regionName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {renderStatusBadge(item.status)}
                    <IconButton
                      icon={MoreVertical}
                      borderless={true}
                      menuItems={[
                        { icon: Eye, label: 'View Details', onClick: () => { setActiveItem(item); setModalMode('view'); } },
                        { icon: Edit, label: 'Edit Record', onClick: () => { setActiveItem(item); setModalMode('edit'); } },
                        { divider: true },
                        { icon: Check, label: item.status === 'active' ? 'Deactivate' : 'Activate', onClick: () => { setActiveItem(item); setModalMode('status'); } },
                        { icon: Trash2, label: 'Delete Record', onClick: () => { setActiveItem(item); setModalMode('delete'); } },
                      ]}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {viewMode === 'table' && (
            <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                            {masterColumns.map((col) => (
                                <th key={col.key} className="px-6 py-3.5 text-xs font-semibold text-neutral-700">{col.label}</th>
                            ))}
                            <th className="px-6 py-3.5 text-xs font-semibold text-neutral-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {paginatedData.map((item) => (
                            <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                {masterColumns.map(col => (
                                    <td key={col.key} className="px-6 py-3.5 text-sm text-neutral-700">
                                        {col.key === 'status' ? renderStatusBadge(item.status) : (item as any)[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-3.5 text-sm text-neutral-700">
                                    <IconButton
                                      icon={MoreVertical}
                                      borderless={true}
                                      menuItems={[
                                        { icon: Edit, label: 'Edit', onClick: () => { setActiveItem(item); setModalMode('edit'); } },
                                        { icon: Trash2, label: 'Delete', onClick: () => { setActiveItem(item); setModalMode('delete'); } },
                                      ]}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

      </div>

      {/* CREATE / EDIT MODAL */}
      <FormModal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => { setModalMode(null); setActiveItem(null); }}
        title={modalMode === 'create' ? `Create ${config.title.split(' ')[0]}` : `Edit ${config.title.split(' ')[0]}`}
        maxWidth="max-w-xl"
        onSave={handleSaveItem}
      >
        <FormSection>
            {masterType !== 'country' && (
                <FormField>
                    <FormLabel required>Country</FormLabel>
                    <FormSelect
                        value={activeItem?.countryName || ''}
                        onChange={(e) => setActiveItem(prev => ({ ...prev!, countryName: e.target.value }))}
                        options={countries.map(c => ({ value: c.name, label: c.name }))}
                    />
                </FormField>
            )}
            
            {(masterType === 'town' || masterType === 'centre') && (
                <FormField>
                    <FormLabel required>Region</FormLabel>
                    <FormSelect
                        value={activeItem?.regionName || ''}
                        onChange={(e) => setActiveItem(prev => ({ ...prev!, regionName: e.target.value }))}
                        options={regions.filter(r => r.countryName === activeItem?.countryName).map(r => ({ value: r.name, label: r.name }))}
                    />
                </FormField>
            )}

            {masterType === 'centre' && (
                <FormField>
                    <FormLabel required>Town</FormLabel>
                    <FormSelect
                        value={activeItem?.townName || ''}
                        onChange={(e) => setActiveItem(prev => ({ ...prev!, townName: e.target.value }))}
                        options={towns.filter(t => t.regionName === activeItem?.regionName).map(t => ({ value: t.name, label: t.name }))}
                    />
                </FormField>
            )}

            <FormField>
                <FormLabel required>{config.nameLabel}</FormLabel>
                <FormInput
                    value={activeItem?.name || ''}
                    onChange={(e) => setActiveItem(prev => ({ ...prev!, name: e.target.value }))}
                    placeholder={`Enter ${config.nameLabel.toLowerCase()}`}
                />
            </FormField>

            <FormField>
                <FormLabel required>Status</FormLabel>
                <FormSelect
                    value={activeItem?.status || 'active'}
                    onChange={(e) => setActiveItem(prev => ({ ...prev!, status: e.target.value as 'active' | 'inactive' }))}
                    options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' }
                    ]}
                />
            </FormField>
        </FormSection>
      </FormModal>

      {/* VIEW MODAL */}
      <FormModal
        isOpen={modalMode === 'view'}
        onClose={() => { setModalMode(null); setActiveItem(null); }}
        title={`${config.title.split(' ')[0]} Details`}
        maxWidth="max-w-xl"
        hideSaveButton
      >
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm font-medium text-neutral-500">Id:</span><p className="text-sm text-neutral-900 dark:text-white">{activeItem?.id}</p></div>
                <div><span className="text-sm font-medium text-neutral-500">Name:</span><p className="text-sm text-neutral-900 dark:text-white">{activeItem?.name}</p></div>
                {activeItem?.countryName && <div><span className="text-sm font-medium text-neutral-500">Country:</span><p className="text-sm text-neutral-900 dark:text-white">{activeItem?.countryName}</p></div>}
                {activeItem?.regionName && <div><span className="text-sm font-medium text-neutral-500">Region:</span><p className="text-sm text-neutral-900 dark:text-white">{activeItem?.regionName}</p></div>}
                {activeItem?.townName && <div><span className="text-sm font-medium text-neutral-500">Town:</span><p className="text-sm text-neutral-900 dark:text-white">{activeItem?.townName}</p></div>}
                <div><span className="text-sm font-medium text-neutral-500">Status:</span><div className="mt-1">{renderStatusBadge(activeItem?.status || '')}</div></div>
            </div>
        </div>
      </FormModal>

      {/* CONFIRM STATUS MODAL */}
      <FormModal
        isOpen={modalMode === 'status'}
        onClose={() => { setModalMode(null); setActiveItem(null); }}
        title="Confirm Status Change"
        maxWidth="max-w-md"
        onSave={handleConfirmStatus}
        saveButtonLabel="Confirm"
      >
        <div className="p-4">
            <p className="text-sm text-neutral-600">Are you sure you want to {activeItem?.status === 'active' ? 'deactivate' : 'activate'} this record?</p>
        </div>
      </FormModal>

      {/* CONFIRM DELETE MODAL */}
      <FormModal
        isOpen={modalMode === 'delete'}
        onClose={() => { setModalMode(null); setActiveItem(null); }}
        title="Confirm Deletion"
        maxWidth="max-w-md"
        onSave={handleDeleteItem}
        saveButtonLabel="Confirm"
        saveButtonClass="bg-red-600 hover:bg-red-700 text-white"
      >
        <div className="p-4">
            <p className="text-sm text-neutral-600">Are you sure you want to delete this record? This action cannot be undone.</p>
        </div>
      </FormModal>

    </div>
  );
}
"""

with open("d:\\Membership Management system\\src\\app\\components\\SuperAdminMasters.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Generated SuperAdminMasters.tsx successfully")
