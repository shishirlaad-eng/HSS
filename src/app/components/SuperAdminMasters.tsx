import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Eye, Edit, Trash2, Plus, RefreshCw, MoreVertical,
  Globe, MapPin, Map, Building2, Tags, AlertTriangle,
  ArrowUpDown, ArrowUp, ArrowDown,
  FileSpreadsheet, FileText, BarChart3,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  PageHeader, SearchBar, Pagination, IconButton,
  ViewModeSwitcher, PrimaryButton, ColumnVisibilityPanel,
  SummaryWidgets, StatusFilter,
  type ColumnConfig
} from './hb/listing';
import {
  FormModal, FormSection, FormField, FormLabel,
  FormInput, FormSelect, StatusSlider
} from './hb/common';
import { toast } from 'sonner';
import { ROLE_TYPE_OPTIONS } from '../../mockAPI/membersData';
import { mockRoles } from '../../mockAPI/rolesData';
import { getRoleScope } from '../../mockAPI/roleScope';

type ViewMode = 'grid' | 'list' | 'table';
export type MasterType = 'country' | 'region' | 'town' | 'centre' | 'role-types';

export interface MasterItem {
  id: string;
  name: string;
  code?: string;
  countryName?: string;
  regionName?: string;
  townName?: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
  childCount?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialCountries: MasterItem[] = [
  { id: 'CNT-001', name: 'HSS UK',             code: 'UK (+44)',  status: 'active',   lastUpdated: '2024-01-10', childCount: 6 },
  { id: 'CNT-002', name: 'HSS Ireland',         code: 'IE (+353)', status: 'active',   lastUpdated: '2024-01-12', childCount: 2 },
  { id: 'CNT-003', name: 'HSS Channel Islands', code: 'CI (+44)',  status: 'inactive', lastUpdated: '2024-02-01', childCount: 0 },
  { id: 'CNT-004', name: 'HSS United States',   code: 'US (+1)',   status: 'active',   lastUpdated: '2024-03-01', childCount: 0 },
  { id: 'CNT-005', name: 'HSS Canada',          code: 'CA (+1)',   status: 'active',   lastUpdated: '2024-03-05', childCount: 0 },
  { id: 'CNT-006', name: 'HSS Germany',         code: 'DE (+49)',  status: 'active',   lastUpdated: '2024-03-10', childCount: 0 },
  { id: 'CNT-007', name: 'HSS Norway',          code: 'NO (+47)',  status: 'active',   lastUpdated: '2024-03-15', childCount: 0 },
  { id: 'CNT-008', name: 'HSS Denmark',         code: 'DK (+45)',  status: 'active',   lastUpdated: '2024-03-18', childCount: 0 },
  { id: 'CNT-009', name: 'HSS Finland',         code: 'FI (+358)', status: 'active',   lastUpdated: '2024-03-20', childCount: 0 },
];

const initialRegions: MasterItem[] = [
  { id: 'RGN-001', name: 'South West',    countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-11', childCount: 2 },
  { id: 'RGN-002', name: 'Midlands',      countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-14', childCount: 3 },
  { id: 'RGN-003', name: 'North West',    countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-18', childCount: 2 },
  { id: 'RGN-004', name: 'Yorkshire',     countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-20', childCount: 2 },
  { id: 'RGN-005', name: 'South East',    countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-01', childCount: 2 },
  { id: 'RGN-006', name: 'Scotland',      countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-05', childCount: 1 },
  { id: 'RGN-007', name: 'Ireland South', countryName: 'HSS Ireland', status: 'active',   lastUpdated: '2024-02-08', childCount: 1 },
  { id: 'RGN-008', name: 'Ireland North', countryName: 'HSS Ireland', status: 'inactive', lastUpdated: '2024-02-10', childCount: 0 },
];

const initialTowns: MasterItem[] = [
  { id: 'TWN-001', name: 'Bristol',      regionName: 'South West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-12', childCount: 2 },
  { id: 'TWN-002', name: 'Bath',         regionName: 'South West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-13', childCount: 1 },
  { id: 'TWN-003', name: 'Birmingham',   regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-15', childCount: 2 },
  { id: 'TWN-004', name: 'Coventry',     regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-16', childCount: 1 },
  { id: 'TWN-005', name: 'Leicester',    regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-17', childCount: 1 },
  { id: 'TWN-006', name: 'Manchester',   regionName: 'North West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-20', childCount: 2 },
  { id: 'TWN-007', name: 'Bolton',       regionName: 'North West', countryName: 'HSS UK',      status: 'inactive', lastUpdated: '2024-01-22', childCount: 0 },
  { id: 'TWN-008', name: 'Leeds',        regionName: 'Yorkshire',  countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-01', childCount: 1 },
  { id: 'TWN-009', name: 'Sheffield',    regionName: 'Yorkshire',  countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-02', childCount: 1 },
  { id: 'TWN-010', name: 'London',       regionName: 'South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-05', childCount: 2 },
  { id: 'TWN-011', name: 'Southampton',  regionName: 'South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-06', childCount: 1 },
  { id: 'TWN-012', name: 'Glasgow',      regionName: 'Scotland',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-08', childCount: 1 },
  { id: 'TWN-013', name: 'Dublin',       regionName: 'Ireland South', countryName: 'HSS Ireland', status: 'active', lastUpdated: '2024-02-10', childCount: 1 },
];

const initialCentres: MasterItem[] = [
  { id: 'CTR-001', name: 'Bristol Central Shakha',     townName: 'Bristol',    regionName: 'South West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-15' },
  { id: 'CTR-002', name: 'Filton Gat',                 townName: 'Bristol',    regionName: 'South West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-16' },
  { id: 'CTR-003', name: 'Bath Shakha',                townName: 'Bath',       regionName: 'South West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-17' },
  { id: 'CTR-004', name: 'Birmingham Aston Shakha',    townName: 'Birmingham', regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-18' },
  { id: 'CTR-005', name: 'Birmingham Selly Oak Shakha',townName: 'Birmingham', regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-19' },
  { id: 'CTR-006', name: 'Coventry Shakha',            townName: 'Coventry',   regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-20' },
  { id: 'CTR-007', name: 'Leicester Shakha',           townName: 'Leicester',  regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-21' },
  { id: 'CTR-008', name: 'Manchester Shakha',          townName: 'Manchester', regionName: 'North West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-22' },
  { id: 'CTR-009', name: 'Wythenshawe Gat',            townName: 'Manchester', regionName: 'North West', countryName: 'HSS UK',      status: 'inactive', lastUpdated: '2024-01-24' },
  { id: 'CTR-010', name: 'Leeds Shakha',               townName: 'Leeds',      regionName: 'Yorkshire',  countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-01' },
  { id: 'CTR-011', name: 'Sheffield Shakha',           townName: 'Sheffield',  regionName: 'Yorkshire',  countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-02' },
  { id: 'CTR-012', name: 'Ealing Shakha',              townName: 'London',     regionName: 'South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-05' },
  { id: 'CTR-013', name: 'Harrow Shakha',              townName: 'London',     regionName: 'South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-06' },
  { id: 'CTR-014', name: 'Southampton Shakha',         townName: 'Southampton',regionName: 'South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-07' },
  { id: 'CTR-015', name: 'Glasgow Shakha',             townName: 'Glasgow',    regionName: 'Scotland',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-08' },
  { id: 'CTR-016', name: 'Dublin Shakha',              townName: 'Dublin',     regionName: 'Ireland South', countryName: 'HSS Ireland', status: 'active', lastUpdated: '2024-02-10' },
];

const initialRoleTypes: MasterItem[] = ROLE_TYPE_OPTIONS.map((name, index) => ({
  id: `ROL-${String(index + 1).padStart(3, '0')}`,
  name,
  status: 'active' as const,
  lastUpdated: '2024-02-15',
}));

// ─── Sub-section Tab Config ───────────────────────────────────────────────────

const MASTER_TABS: { id: MasterType; label: string }[] = [
  { id: 'country',    label: 'Country' },
  { id: 'region',     label: 'Region' },
  { id: 'town',       label: 'Town' },
  { id: 'centre',     label: 'Activity Centre' },
  { id: 'role-types', label: 'Role Types' },
];

// ─── Component Props ──────────────────────────────────────────────────────────

interface SuperAdminMastersProps {
  masterType: MasterType;
  onNavigate?: (page: string) => void;
  selectedRole?: string;
}

export default function SuperAdminMasters({ masterType, onNavigate, selectedRole = 'Super Admin' }: SuperAdminMastersProps) {

  // ── Masters permission flags (derived from selected role) ──────────────────
  const mastersPerms = useMemo(() => {
    const role = mockRoles.find(r => r.name === selectedRole);
    const actions: string[] = role?.permissions?.masters ?? [];
    return {
      canAdd:    actions.includes('add'),
      canEdit:   actions.includes('edit'),
      canDelete: actions.includes('delete'),
      canStatus: actions.includes('status'),
    };
  }, [selectedRole]);

  // ── View & pagination ──────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ── Data ───────────────────────────────────────────────────────────────────
  const [countries,  setCountries]  = useState<MasterItem[]>(initialCountries);
  const [regions,    setRegions]    = useState<MasterItem[]>(initialRegions);
  const [towns,      setTowns]      = useState<MasterItem[]>(initialTowns);
  const [centres,    setCentres]    = useState<MasterItem[]>(initialCentres);
  const [roleTypes,  setRoleTypes]  = useState<MasterItem[]>(initialRoleTypes);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterCountry,  setFilterCountry]  = useState('');
  const [filterRegion,   setFilterRegion]   = useState('');
  const [filterTown,     setFilterTown]     = useState('');

  // ── Sorting ────────────────────────────────────────────────────────────────
  const [sortField,     setSortField]     = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // ── Selection & summary ────────────────────────────────────────────────────
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [showSummary,  setShowSummary]  = useState(true);

  // ── Column visibility ──────────────────────────────────────────────────────
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true, name: true, code: true,
    countryName: true, regionName: true, townName: true,
    status: true, lastUpdated: true,
  });

  // ── CRUD modal ─────────────────────────────────────────────────────────────
  const [modalMode,   setModalMode]   = useState<'create' | 'edit' | 'view' | null>(null);
  const [activeItem,  setActiveItem]  = useState<Partial<MasterItem> | null>(null);

  // ── Confirmation modals ────────────────────────────────────────────────────
  const [deleteTarget,   setDeleteTarget]   = useState<MasterItem | null>(null);
  const [statusTarget,   setStatusTarget]   = useState<MasterItem | null>(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);

  // ── Reset filters & page when section changes ──────────────────────────────
  useEffect(() => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterCountry('');
    setFilterRegion('');
    setFilterTown('');
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [masterType]);

  useEffect(() => {
    if (viewMode !== 'table') setShowColumnPanel(false);
  }, [viewMode]);

  // ─── Config per section ────────────────────────────────────────────────────
  const config = useMemo(() => {
    switch (masterType) {
      case 'country': return {
        title: 'Country',
        subtitle: 'Manage Organization/National records used as the top-level Masters scope.',
        icon: Globe,
        addLabel: 'Add Country',
        nameLabel: 'Country Name',
        idPrefix: 'CNT',
      };
      case 'region': return {
        title: 'Region',
        subtitle: 'Manage Regions linked to a Country.',
        icon: Map,
        addLabel: 'Add Region',
        nameLabel: 'Region Name',
        idPrefix: 'RGN',
      };
      case 'town': return {
        title: 'Town',
        subtitle: 'Manage Towns linked to a Region.',
        icon: MapPin,
        addLabel: 'Add Town',
        nameLabel: 'Town Name',
        idPrefix: 'TWN',
      };
      case 'centre': return {
        title: 'Activity Centre',
        subtitle: 'Manage Activity Centres linked to a Town.',
        icon: Building2,
        addLabel: 'Add Activity Centre',
        nameLabel: 'Activity Centre Name',
        idPrefix: 'CTR',
      };
      case 'role-types': return {
        title: 'Role Types',
        subtitle: 'Manage the Role Types reference list used by governance and role assignment.',
        icon: Tags,
        addLabel: 'Add Role Type',
        nameLabel: 'Role Type Name',
        idPrefix: 'ROL',
      };
    }
  }, [masterType]);

  const isStandaloneMaster = masterType === 'role-types';

  // ─── Column config ─────────────────────────────────────────────────────────
  const masterColumns = useMemo<ColumnConfig[]>(() => {
    const cols: ColumnConfig[] = [{ key: 'name', label: config.nameLabel }];
    if (masterType === 'country')    cols.push({ key: 'code', label: 'Country Code' });
    if (masterType !== 'country' && !isStandaloneMaster)
                                     cols.push({ key: 'countryName', label: 'Country' });
    if (masterType === 'town' || masterType === 'centre')
                                     cols.push({ key: 'regionName', label: 'Region' });
    if (masterType === 'centre')     cols.push({ key: 'townName', label: 'Town' });
    cols.push({ key: 'status', label: 'Status' });
    cols.push({ key: 'lastUpdated', label: 'Last Updated' });
    return cols;
  }, [masterType, config, isStandaloneMaster]);

  // ─── Raw data for current section (scoped to role's level) ───────────────
  const currentDataArray = useMemo(() => {
    const scope = getRoleScope(selectedRole);
    let data: MasterItem[];
    switch (masterType) {
      case 'country':    data = countries;   break;
      case 'region':     data = regions;     break;
      case 'town':       data = towns;       break;
      case 'centre':     data = centres;     break;
      case 'role-types': return roleTypes;   // no geo-scope on role types
    }
    // Apply scope filtering on master items
    if (scope.level === 'all') return data;
    if (scope.level === 'national' && scope.country) {
      // Regions: only those belonging to scope.country
      if (masterType === 'region')  return data.filter(i => i.countryName === scope.country);
      // Towns: only those whose regionName is in scope country's regions
      if (masterType === 'town') {
        const { MASTERS_CASCADE: MC } = require('../../mockAPI/membersData');
        const countryRegions: string[] = MC.regions[scope.country] ?? [];
        return data.filter(i => countryRegions.includes(i.regionName ?? ''));
      }
      // Centres: only those whose town is in scope country
      if (masterType === 'centre') {
        const { MASTERS_CASCADE: MC } = require('../../mockAPI/membersData');
        const countryRegions: string[] = MC.regions[scope.country] ?? [];
        const countryTowns: string[] = countryRegions.flatMap((r: string) => MC.towns[r] ?? []);
        return data.filter(i => countryTowns.includes(i.townName ?? ''));
      }
    }
    if (scope.level === 'regional' && scope.region) {
      if (masterType === 'region')  return data.filter(i => i.name === scope.region);
      if (masterType === 'town')    return data.filter(i => i.regionName === scope.region);
      if (masterType === 'centre')  {
        const { MASTERS_CASCADE: MC } = require('../../mockAPI/membersData');
        const regionTowns: string[] = MC.towns[scope.region] ?? [];
        return data.filter(i => regionTowns.includes(i.townName ?? ''));
      }
    }
    if (scope.level === 'town' && scope.town) {
      if (masterType === 'region')  return data.filter(i => i.name === scope.region);
      if (masterType === 'town')    return data.filter(i => i.name === scope.town);
      if (masterType === 'centre')  return data.filter(i => i.townName === scope.town);
    }
    if (scope.level === 'centre' && scope.centre) {
      if (masterType === 'region')  return data.filter(i => i.name === scope.region);
      if (masterType === 'town')    return data.filter(i => i.name === scope.town);
      if (masterType === 'centre')  return data.filter(i => i.name === scope.centre);
    }
    return data;
  }, [masterType, countries, regions, towns, centres, roleTypes, selectedRole]);

  const setCurrentDataArray = (updater: (prev: MasterItem[]) => MasterItem[]) => {
    switch (masterType) {
      case 'country':    setCountries(updater);    break;
      case 'region':     setRegions(updater);      break;
      case 'town':       setTowns(updater);        break;
      case 'centre':     setCentres(updater);      break;
      case 'role-types': setRoleTypes(updater);    break;
    }
  };

  // ─── Processed (filtered + sorted) data ───────────────────────────────────
  const processedData = useMemo(() => {
    let result = currentDataArray.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        (item.code         && item.code.toLowerCase().includes(q)) ||
        (item.countryName  && item.countryName.toLowerCase().includes(q)) ||
        (item.regionName   && item.regionName.toLowerCase().includes(q)) ||
        (item.townName     && item.townName.toLowerCase().includes(q));
      const matchesStatus  = filterStatus  === 'all' || item.status === filterStatus;
      const matchesCountry = !filterCountry || item.countryName === filterCountry;
      const matchesRegion  = !filterRegion  || item.regionName  === filterRegion;
      const matchesTown    = !filterTown    || item.townName     === filterTown;
      return matchesSearch && matchesStatus && matchesCountry && matchesRegion && matchesTown;
    });

    result = [...result].sort((a, b) => {
      const aVal = (a as any)[sortField] ?? '';
      const bVal = (b as any)[sortField] ?? '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1  : -1;
      return 0;
    });

    return result;
  }, [currentDataArray, searchQuery, filterStatus, filterCountry, filterRegion, filterTown, sortField, sortDirection]);

  const totalPages   = itemsPerPage === 0 ? 1 : Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (itemsPerPage === 0) return processedData;
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  // ─── Derived dropdown options ──────────────────────────────────────────────
  const countryOptions   = useMemo(() => countries.map(c => c.name), [countries]);
  const regionOptions    = useMemo(() => {
    const base = regions.filter(r => !filterCountry || r.countryName === filterCountry);
    return [...new Set(base.map(r => r.name))];
  }, [regions, filterCountry]);
  const townOptions      = useMemo(() => {
    const base = towns.filter(t =>
      (!filterCountry || t.countryName === filterCountry) &&
      (!filterRegion  || t.regionName  === filterRegion)
    );
    return [...new Set(base.map(t => t.name))];
  }, [towns, filterCountry, filterRegion]);

  // Form-specific cascading options (based on activeItem's parents, not filter)
  const formRegionOptions = useMemo(() =>
    regions.filter(r => r.countryName === activeItem?.countryName).map(r => r.name),
    [regions, activeItem?.countryName]);

  const formTownOptions = useMemo(() =>
    towns.filter(t =>
      t.countryName === activeItem?.countryName &&
      t.regionName  === activeItem?.regionName
    ).map(t => t.name),
    [towns, activeItem?.countryName, activeItem?.regionName]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateNew = () => {
    const newId = `${config.idPrefix}-${String(currentDataArray.length + 1).padStart(3, '0')}`;
    setActiveItem({
      id: newId,
      name: '',
      code: masterType === 'country' ? '' : undefined,
      countryName: masterType !== 'country' && !isStandaloneMaster ? '' : undefined,
      regionName:  (masterType === 'town' || masterType === 'centre') ? '' : undefined,
      townName:    masterType === 'centre' ? '' : undefined,
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
  };

  const handleSaveItem = () => {
    if (!activeItem?.name?.trim()) {
      toast.error(`${config.nameLabel} is required.`);
      return;
    }
    if (masterType !== 'country' && !isStandaloneMaster && !activeItem.countryName) {
      toast.error('Country is required.');
      return;
    }
    if ((masterType === 'town' || masterType === 'centre') && !activeItem.regionName) {
      toast.error('Region is required.');
      return;
    }
    if (masterType === 'centre' && !activeItem.townName) {
      toast.error('Town is required.');
      return;
    }

    const savedItem = { ...activeItem, lastUpdated: new Date().toISOString().split('T')[0] } as MasterItem;

    if (modalMode === 'create') {
      setCurrentDataArray(prev => [...prev, savedItem]);
      toast.success('Record created successfully.');
    } else {
      setCurrentDataArray(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
      toast.success('Record updated successfully.');
    }
    setModalMode(null);
    setActiveItem(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentDataArray(prev => prev.filter(i => i.id !== deleteTarget.id));
      toast.success('Record deleted successfully.');
      setDeleteTarget(null);
      setIsSubmitting(false);
    }, 400);
  };

  const handleConfirmStatusChange = () => {
    if (!statusTarget) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newStatus = statusTarget.status === 'active' ? 'inactive' : 'active';
      setCurrentDataArray(prev =>
        prev.map(i => i.id === statusTarget.id
          ? { ...i, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
          : i
        )
      );
      toast.success('Status updated successfully.');
      setStatusTarget(null);
      setIsSubmitting(false);
    }, 400);
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = selectedIds.size > 0
      ? processedData.filter(i => selectedIds.has(i.id))
      : processedData;
    if (!dataToExport.length) { toast.error('No data available to export.'); return; }

    const cols = masterColumns.filter(c => visibleColumns[c.key]);

    if (format === 'excel') {
      const headers = cols.map(c => `"${c.label}"`).join(',');
      const rows = dataToExport.map(item =>
        cols.map(c => `"${String((item as any)[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
      );
      const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${masterType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success(`Exported ${dataToExport.length} records to Excel.`);
    } else {
      const lines = [
        `${config.title.toUpperCase()} REPORT — ${new Date().toLocaleString()}`,
        `Total: ${dataToExport.length}`,
        '',
        cols.map(c => c.label.padEnd(22)).join(''),
        '─'.repeat(cols.length * 22),
        ...dataToExport.map(item =>
          cols.map(c => String((item as any)[c.key] ?? '').substring(0, 20).padEnd(22)).join('')
        ),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${masterType}_export_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      toast.success(`Exported ${dataToExport.length} records to PDF.`);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const IconComponent = config.icon;

  const renderStatusBadge = (status: string) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium capitalize ${
        isActive
          ? 'bg-success-50 text-success-600 border-success-100 dark:bg-success-950/20 dark:text-success-400 dark:border-success-900/30'
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`} />
        {status}
      </span>
    );
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40 hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc'
      ? <ArrowUp   className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
      : <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />;
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  // ─── Status filter options ─────────────────────────────────────────────────
  const statusOptions = useMemo(() => [
    { value: 'all',      label: 'All',      count: currentDataArray.length },
    { value: 'active',   label: 'Active',   count: currentDataArray.filter(i => i.status === 'active').length },
    { value: 'inactive', label: 'Inactive', count: currentDataArray.filter(i => i.status === 'inactive').length },
  ], [currentDataArray]);

  // ─── Row action menu items ─────────────────────────────────────────────────
  const getRowMenuItems = (item: MasterItem) => {
    const items: any[] = [
      { icon: Eye, label: 'View Details', onClick: () => { setActiveItem(item); setModalMode('view'); } },
    ];
    if (mastersPerms.canEdit) {
      items.push({ icon: Edit, label: 'Edit Record', onClick: () => { setActiveItem(item); setModalMode('edit'); } });
    }
    if (mastersPerms.canStatus) {
      items.push({ divider: true });
      items.push({
        icon: item.status === 'active' ? ToggleLeft : ToggleRight,
        label: item.status === 'active' ? 'Deactivate' : 'Activate',
        onClick: () => setStatusTarget(item),
      });
    }
    if (mastersPerms.canDelete) {
      items.push({ divider: true });
      items.push({ icon: Trash2, label: 'Delete Record', onClick: () => setDeleteTarget(item) });
    }
    return items;
  };

  // ─── Filter select shared style ────────────────────────────────────────────
  const filterSelectClass = `h-10 px-3 text-xs border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-primary-400 dark:focus:border-primary-600`;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
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
              placeholder={`Search ${config.title.toLowerCase()}s...`}
            />

            <StatusFilter
              currentStatus={filterStatus}
              statuses={statusOptions}
              onChange={setFilterStatus}
            />

            {/* Parent filters for Region / Town / Centre */}
            {(masterType === 'region' || masterType === 'town' || masterType === 'centre') && (
              <select
                className={filterSelectClass}
                value={filterCountry}
                onChange={e => { setFilterCountry(e.target.value); setFilterRegion(''); setFilterTown(''); }}
              >
                <option value="">All Countries</option>
                {countryOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}

            {(masterType === 'town' || masterType === 'centre') && (
              <select
                className={filterSelectClass}
                value={filterRegion}
                onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); }}
              >
                <option value="">All Regions</option>
                {regionOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}

            {masterType === 'centre' && (
              <select
                className={filterSelectClass}
                value={filterTown}
                onChange={e => setFilterTown(e.target.value)}
                disabled={!filterRegion}
              >
                <option value="">All Towns</option>
                {townOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}

            {mastersPerms.canAdd && (
              <PrimaryButton icon={Plus} onClick={handleCreateNew}>
                {config.addLabel}
              </PrimaryButton>
            )}

            <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
            <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />

            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: FileSpreadsheet, label: 'Export as Excel', onClick: () => handleExport('excel') },
                { icon: FileText,        label: 'Export as PDF',   onClick: () => handleExport('pdf')   },
              ]}
            />

            <ViewModeSwitcher currentMode={viewMode} onChange={setViewMode} />

            <ColumnVisibilityPanel
              isOpen={showColumnPanel}
              onClose={() => setShowColumnPanel(false)}
              columns={masterColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={key => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
              anchorRef={columnAnchorRef}
            />
          </div>
        </PageHeader>

        {/* ── SUB-SECTION TABS ────────────────────────────────────────────── */}
        <div className="flex gap-0 mt-4 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          {MASTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate?.(tab.id)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                masterType === tab.id
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SUMMARY WIDGETS ─────────────────────────────────────────────── */}
        {showSummary && (
          <div className="mt-4">
            {masterType === 'country' && (
              <SummaryWidgets title="Country Summary" widgets={[
                { label: 'Total Countries',  value: countries.length,                                icon: 'Globe'       },
                { label: 'Active Countries', value: countries.filter(c => c.status === 'active').length, icon: 'CheckCircle' },
              ]} />
            )}
            {masterType === 'region' && (
              <SummaryWidgets title="Region Summary" widgets={[
                { label: 'Total Regions',  value: regions.length,                               icon: 'Map'         },
                { label: 'Active Regions', value: regions.filter(r => r.status === 'active').length, icon: 'CheckCircle' },
                { label: 'Countries',      value: new Set(regions.map(r => r.countryName)).size, icon: 'Globe'       },
              ]} />
            )}
            {masterType === 'town' && (
              <SummaryWidgets title="Town Summary" widgets={[
                { label: 'Total Towns',  value: towns.length,                              icon: 'MapPin'      },
                { label: 'Active Towns', value: towns.filter(t => t.status === 'active').length, icon: 'CheckCircle' },
                { label: 'Regions',      value: new Set(towns.map(t => t.regionName)).size, icon: 'Map'         },
              ]} />
            )}
            {masterType === 'centre' && (
              <SummaryWidgets title="Activity Centre Summary" widgets={[
                { label: 'Total Centres',  value: centres.length,                                icon: 'Building2'   },
                { label: 'Active Centres', value: centres.filter(c => c.status === 'active').length, icon: 'CheckCircle' },
                { label: 'Towns',          value: new Set(centres.map(c => c.townName)).size,    icon: 'MapPin'      },
              ]} />
            )}
            {masterType === 'role-types' && (
              <SummaryWidgets title="Role Types Summary" widgets={[
                { label: 'Total Role Types',  value: roleTypes.length,                                  icon: 'Tags'        },
                { label: 'Active Role Types', value: roleTypes.filter(r => r.status === 'active').length, icon: 'CheckCircle' },
              ]} />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CARD VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {paginatedData.length > 0 ? paginatedData.map(item => (
              <div
                key={item.id}
                onClick={() => { setActiveItem(item); setModalMode('view'); }}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between min-h-[160px] ${
                  selectedIds.has(item.id)
                    ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-600 dark:hover:border-primary-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <span className="text-[11px] font-mono text-neutral-400">{item.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        title="Select"
                      />
                      <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getRowMenuItems(item)} />
                    </div>
                  </div>

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
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">{item.countryName}</span>
                      </div>
                    )}
                    {item.regionName && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Region:</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">{item.regionName}</span>
                      </div>
                    )}
                    {item.townName && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Town:</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">{item.townName}</span>
                      </div>
                    )}
                    {item.childCount !== undefined && masterType !== 'centre' && !isStandaloneMaster && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">
                          {masterType === 'country' ? 'Regions:'
                          : masterType === 'region'  ? 'Towns:'
                          : masterType === 'town'    ? 'Activity Centres:'
                          : 'Children:'}
                        </span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.childCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-neutral-100 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
                  <span className="text-[10px] text-neutral-400">{formatDate(item.lastUpdated)}</span>
                  {renderStatusBadge(item.status)}
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/30 dark:bg-neutral-900/30">
                <p className="text-sm text-neutral-500">No records found. Click {config.addLabel} to create.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LIST VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {viewMode === 'list' && (
          <div className="space-y-2 mt-4">
            {paginatedData.length > 0 ? paginatedData.map(item => (
              <div
                key={item.id}
                onClick={() => { setActiveItem(item); setModalMode('view'); }}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                  selectedIds.has(item.id)
                    ? 'border-primary-300 dark:border-primary-600 bg-primary-50/10'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                    />
                  </div>
                  <div className="w-8 h-8 rounded bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600 flex-shrink-0">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                    <div className="min-w-[150px]">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.name}</h4>
                      <span className="text-[11px] font-mono text-neutral-400">{item.id}</span>
                    </div>
                    {item.code        && <span className="text-xs text-neutral-500">Code: {item.code}</span>}
                    {item.countryName && <span className="text-xs text-neutral-500 truncate">Country: {item.countryName}</span>}
                    {item.regionName  && <span className="text-xs text-neutral-500 truncate">Region: {item.regionName}</span>}
                    {item.townName    && <span className="text-xs text-neutral-500 truncate">Town: {item.townName}</span>}
                    <span className="text-xs text-neutral-400">{formatDate(item.lastUpdated)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {renderStatusBadge(item.status)}
                  <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getRowMenuItems(item)} />
                </div>
              </div>
            )) : (
              <div className="py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">No records found. Click {config.addLabel} to create.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TABLE VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {viewMode === 'table' && (
          <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-340px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                        onChange={e => setSelectedIds(e.target.checked ? new Set(paginatedData.map(i => i.id)) : new Set())}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                    {visibleColumns.name && (
                      <th onClick={() => handleSort('name')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800">
                        {config.nameLabel} {renderSortIndicator('name')}
                      </th>
                    )}
                    {masterType === 'country' && visibleColumns.code && (
                      <th onClick={() => handleSort('code')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800">
                        Country Code {renderSortIndicator('code')}
                      </th>
                    )}
                    {masterType !== 'country' && !isStandaloneMaster && visibleColumns.countryName && (
                      <th onClick={() => handleSort('countryName')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800">
                        Country {renderSortIndicator('countryName')}
                      </th>
                    )}
                    {(masterType === 'town' || masterType === 'centre') && visibleColumns.regionName && (
                      <th onClick={() => handleSort('regionName')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800">
                        Region {renderSortIndicator('regionName')}
                      </th>
                    )}
                    {masterType === 'centre' && visibleColumns.townName && (
                      <th onClick={() => handleSort('townName')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800">
                        Town {renderSortIndicator('townName')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th onClick={() => handleSort('status')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800">
                        Status {renderSortIndicator('status')}
                      </th>
                    )}
                    {visibleColumns.lastUpdated && (
                      <th onClick={() => handleSort('lastUpdated')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800">
                        Last Updated {renderSortIndicator('lastUpdated')}
                      </th>
                    )}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedData.length > 0 ? paginatedData.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => { setActiveItem(item); setModalMode('view'); }}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        />
                      </td>
                      {visibleColumns.name && (
                        <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white">{item.name}</td>
                      )}
                      {masterType === 'country' && visibleColumns.code && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.code}</td>
                      )}
                      {masterType !== 'country' && !isStandaloneMaster && visibleColumns.countryName && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.countryName}</td>
                      )}
                      {(masterType === 'town' || masterType === 'centre') && visibleColumns.regionName && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.regionName}</td>
                      )}
                      {masterType === 'centre' && visibleColumns.townName && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.townName}</td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-3.5">{renderStatusBadge(item.status)}</td>
                      )}
                      {visibleColumns.lastUpdated && (
                        <td className="px-6 py-3.5 text-sm text-neutral-500 dark:text-neutral-400 font-mono">{formatDate(item.lastUpdated)}</td>
                      )}
                      <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {mastersPerms.canEdit && (
                            <IconButton icon={Edit} borderless onClick={() => { setActiveItem(item); setModalMode('edit'); }} title="Edit" />
                          )}
                          {mastersPerms.canStatus && (
                            <IconButton
                              icon={item.status === 'active' ? ToggleRight : ToggleLeft}
                              borderless
                              onClick={() => setStatusTarget(item)}
                              title={item.status === 'active' ? 'Deactivate' : 'Activate'}
                            />
                          )}
                          {mastersPerms.canDelete && (
                            <IconButton icon={Trash2} borderless onClick={() => setDeleteTarget(item)} title="Delete" />
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={masterColumns.length + 2} className="px-6 py-16 text-center text-sm text-neutral-500">
                        No records found. Click {config.addLabel} to create.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PAGINATION ───────────────────────────────────────────────────── */}
        <div className="mt-6">
          {processedData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={processedData.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            CRUD FORM MODAL
        ══════════════════════════════════════════════════════════════════ */}
        <FormModal
          isOpen={modalMode !== null}
          onClose={() => { setModalMode(null); setActiveItem(null); }}
          title={
            modalMode === 'create' ? config.addLabel :
            modalMode === 'edit'   ? `Edit ${config.title}` :
                                     `${config.title} Details`
          }
          maxWidth="max-w-lg"
        >
          {activeItem && (
            <div className="space-y-4 p-1">

              {/* Country — Region / Town / Centre need a Country dropdown */}
              {masterType !== 'country' && !isStandaloneMaster && (
                <FormSection>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Country</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.countryName ?? ''} readOnly />
                    ) : (
                      <FormSelect
                        value={activeItem.countryName ?? ''}
                        onChange={e => setActiveItem({ ...activeItem, countryName: e.target.value, regionName: '', townName: '' })}
                      >
                        <option value="">Select Country</option>
                        {countryOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </FormSelect>
                    )}
                  </FormField>
                </FormSection>
              )}

              {/* Region — Town / Centre need a Region dropdown (filtered by countryName) */}
              {(masterType === 'town' || masterType === 'centre') && (
                <FormSection>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Region</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.regionName ?? ''} readOnly />
                    ) : (
                      <FormSelect
                        value={activeItem.regionName ?? ''}
                        onChange={e => setActiveItem({ ...activeItem, regionName: e.target.value, townName: '' })}
                        disabled={!activeItem.countryName}
                      >
                        <option value="">Select Region</option>
                        {formRegionOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </FormSelect>
                    )}
                  </FormField>
                </FormSection>
              )}

              {/* Town — Centre needs a Town dropdown (filtered by regionName) */}
              {masterType === 'centre' && (
                <FormSection>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Town</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.townName ?? ''} readOnly />
                    ) : (
                      <FormSelect
                        value={activeItem.townName ?? ''}
                        onChange={e => setActiveItem({ ...activeItem, townName: e.target.value })}
                        disabled={!activeItem.regionName}
                      >
                        <option value="">Select Town</option>
                        {formTownOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </FormSelect>
                    )}
                  </FormField>
                </FormSection>
              )}

              {/* Name field */}
              <FormSection>
                <FormField>
                  <FormLabel required={modalMode !== 'view'}>{config.nameLabel}</FormLabel>
                  <FormInput
                    value={activeItem.name ?? ''}
                    onChange={e => setActiveItem({ ...activeItem, name: e.target.value })}
                    readOnly={modalMode === 'view'}
                    placeholder={`Enter ${config.title.toLowerCase()} name`}
                  />
                </FormField>
              </FormSection>

              {/* Country Code (only for Country) */}
              {masterType === 'country' && (
                <FormSection>
                  <FormField>
                    <FormLabel>Country Code</FormLabel>
                    <FormInput
                      value={activeItem.code ?? ''}
                      onChange={e => setActiveItem({ ...activeItem, code: e.target.value })}
                      readOnly={modalMode === 'view'}
                      placeholder="e.g. UK (+44)"
                    />
                  </FormField>
                </FormSection>
              )}

              {/* Status */}
              <FormSection>
                <FormField>
                  <FormLabel>Status</FormLabel>
                  {modalMode === 'view' ? (
                    <div className="pt-1">{renderStatusBadge(activeItem.status ?? 'active')}</div>
                  ) : (
                    <StatusSlider
                      value={activeItem.status ?? 'active'}
                      onChange={val => setActiveItem({ ...activeItem, status: val })}
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
                    {modalMode === 'create' ? 'Save' : 'Update'}
                  </PrimaryButton>
                )}
              </div>
            </div>
          )}
        </FormModal>

        {/* ══════════════════════════════════════════════════════════════════
            STATUS CONFIRMATION MODAL
        ══════════════════════════════════════════════════════════════════ */}
        <FormModal
          isOpen={statusTarget !== null}
          onClose={() => { if (!isSubmitting) setStatusTarget(null); }}
          title="Confirm Status Change"
          maxWidth="max-w-sm"
        >
          <div className="p-1 space-y-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Are you sure you want to{' '}
              <strong>{statusTarget?.status === 'active' ? 'deactivate' : 'activate'}</strong>{' '}
              <strong className="text-neutral-900 dark:text-white">{statusTarget?.name}</strong>?
            </p>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
              <button
                disabled={isSubmitting}
                onClick={() => setStatusTarget(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <PrimaryButton onClick={handleConfirmStatusChange} disabled={isSubmitting}>
                {isSubmitting ? 'Updating…' : 'Confirm'}
              </PrimaryButton>
            </div>
          </div>
        </FormModal>

        {/* ══════════════════════════════════════════════════════════════════
            DELETE CONFIRMATION MODAL
        ══════════════════════════════════════════════════════════════════ */}
        <FormModal
          isOpen={deleteTarget !== null}
          onClose={() => { if (!isSubmitting) setDeleteTarget(null); }}
          title="Confirm Deletion"
          maxWidth="max-w-sm"
        >
          <div className="p-1 space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-neutral-900 dark:text-white">{deleteTarget?.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
              <button
                disabled={isSubmitting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isSubmitting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </FormModal>

      </div>
    </div>
  );
}
