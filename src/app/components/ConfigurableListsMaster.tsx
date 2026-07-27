import { useState, useMemo, useRef } from 'react';
import {
  Plus, Eye, Edit, Trash2, MoreVertical, AlertTriangle,
  ToggleLeft, ToggleRight, RefreshCw,
  ArrowUpDown, ArrowUp, ArrowDown,
  FileSpreadsheet, BarChart3,
} from 'lucide-react';
import {
  SearchBar, Pagination, IconButton, ViewModeSwitcher,
  PrimaryButton, SummaryWidgets, useStickyListingHeader,
} from './hb/listing';
import {
  FormModal, FormSection, FormField, FormLabel, FormInput, StatusSlider, ErrorText,
} from './hb/common';
import { toast } from 'sonner';
import { ROLE_TYPE_OPTIONS } from '../../mockAPI/membersData';
import { mockRoles } from '../../mockAPI/rolesData';
import { formatDate } from '../../utils/formatDate';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListKey =
  | 'age-groups'
  | 'dietary-requirements'
  | 'spoken-languages'
  | 'occupation'
  | 'contact-relationship'
  | 'role-types'
  | 'responsibility-type'
  | 'responsibility-level'
  | 'first-aid-qual'
  | 'safeguarding-levels'
  | 'shakha-types'
  | 'utsav-options'
  | 'incident-type'
  | 'incident-outcome';

export interface ConfigItem {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

// ─── Category / list config ───────────────────────────────────────────────────

const CATEGORIES: { label: string; lists: { key: ListKey; label: string; idPrefix: string }[] }[] = [
  {
    label: 'Member',
    lists: [
      { key: 'age-groups',            label: 'Age Groups',            idPrefix: 'AGE' },
      { key: 'dietary-requirements',  label: 'Dietary Requirements',  idPrefix: 'DIT' },
      { key: 'spoken-languages',      label: 'Spoken Languages',      idPrefix: 'LNG' },
      { key: 'occupation',            label: 'Occupation',            idPrefix: 'OCC' },
      { key: 'contact-relationship',  label: 'Contact Relationship',  idPrefix: 'REL' },
    ],
  },
  {
    label: 'Roles & Responsibility',
    lists: [
      { key: 'role-types',           label: 'Sangh Responsibility',   idPrefix: 'ROT' },
      { key: 'responsibility-type',  label: 'Responsibility Type',    idPrefix: 'RST' },
      { key: 'responsibility-level', label: 'Responsibility Level',   idPrefix: 'RSL' },
    ],
  },
  {
    label: 'Compliance',
    lists: [
      { key: 'first-aid-qual',      label: 'First Aid Qualifications',     idPrefix: 'FAQ' },
      { key: 'safeguarding-levels', label: 'Safeguarding Training Levels', idPrefix: 'SGL' },
    ],
  },
  {
    label: 'Attendance / Session',
    lists: [
      { key: 'shakha-types',  label: 'Shakha Types',  idPrefix: 'SHT' },
      { key: 'utsav-options', label: 'Utsav Options', idPrefix: 'UTS' },
    ],
  },
  {
    label: 'First Aid Incidents',
    lists: [
      { key: 'incident-type',    label: 'Incident Type',    idPrefix: 'INT' },
      { key: 'incident-outcome', label: 'Incident Outcome', idPrefix: 'INO' },
    ],
  },
];

const LIST_META: Record<ListKey, { label: string; idPrefix: string }> = {} as any;
CATEGORIES.forEach(cat => cat.lists.forEach(l => { LIST_META[l.key] = { label: l.label, idPrefix: l.idPrefix }; }));

// ─── Initial data ─────────────────────────────────────────────────────────────

function makeItems(idPrefix: string, names: string[]): ConfigItem[] {
  return names.map((name, i) => ({
    id: `${idPrefix}-${String(i + 1).padStart(3, '0')}`,
    name,
    status: 'active' as const,
    lastUpdated: '2024-01-15',
  }));
}

const INITIAL_DATA: Record<ListKey, ConfigItem[]> = {
  'age-groups':           makeItems('AGE', ['Bal (0–5)', 'Shishu (6–11)', 'Kishor (12–16)', 'Tarun (17–30)', 'Yuva (30–60)', 'Jyestha (60+)']),
  'dietary-requirements': makeItems('DIT', ['Coeliac', 'Gluten-free', 'Vegan', 'Lacto (allows dairy)', 'Paleo Diet', 'Ketogenic (low carbohydrate, high fat)', 'Low GI (limits carbohydrate intake)', 'FODMAP', 'No Onions or Garlic', 'Other - With box to specify']),
  'spoken-languages':     makeItems('LNG', ['Assamese', 'Bengali', 'English', 'Gujarati', 'Hindi', 'Kannada', 'Konkani', 'Malayalam', 'Marathi', 'Nepali', 'Odia', 'Punjabi', 'Sanskrit', 'Tamil', 'Telugu', 'Other']),
  'occupation':           makeItems('OCC', ['Student', 'Employed - Full Time', 'Employed - Part Time', 'Self-Employed', 'Retired', 'Unemployed', 'Homemaker', 'Other']),
  'contact-relationship': makeItems('REL', ['Spouse', 'Sibling', 'Parent', 'Child', 'Other - With box to specify']),
  'role-types':           makeItems('ROT', ROLE_TYPE_OPTIONS),
  'responsibility-type':  makeItems('RST', ['Pramukh', 'Pramukh (Saha)', 'Toli']),
  'responsibility-level': makeItems('RSL', ['Kendriya / National', 'Vibhag / Region', 'Nagar / Town', 'Shakha / Activity Centre']),
  'first-aid-qual':       makeItems('FAQ', ['1-day First Aid', '3-day First Aid at Work', 'Doctor (GMC registered)', 'Nurse (NMC registered)', 'Paramedic (HCPC registered)']),
  'safeguarding-levels':  makeItems('SGL', ['Basic Awareness (Level 1)', 'Child Protection Intermediate (Level 2)', 'Child Protection Advanced (Level 3)', 'Lead Practitioner (Level 4)', 'Designated Safeguarding Lead (DSL)']),
  'shakha-types':         makeItems('SHT', ['Swayamsevak Shakha', 'Sewa Shakha', 'Parivaar Shakha', 'Milan', 'Sampark Kendra']),
  'utsav-options':        makeItems('UTS', ['None', 'Makar Sankranti', 'Varsh Pratipada', 'Guru Purnima', 'Rakshabandhan', 'Vijya Dashmi']),
  'incident-type':        makeItems('INT', ['Minor Injury', 'Major Injury', 'Illness', 'Allergic Reaction', 'Other']),
  'incident-outcome':     makeItems('INO', ['Returned to Activity', 'Sent Home', 'Taken to Hospital', 'Ambulance Called']),
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  selectedRole?: string;
}

export default function ConfigurableListsMaster({ selectedRole = 'Super Admin' }: Props) {
  const perms = useMemo(() => {
    const role = mockRoles.find(r => r.name === selectedRole);
    const actions: string[] = (role as any)?.permissions?.masters ?? [];
    return {
      canAdd:    actions.includes('add'),
      canEdit:   actions.includes('edit'),
      canDelete: actions.includes('delete'),
      canStatus: actions.includes('status'),
    };
  }, [selectedRole]);

  const [selectedList, setSelectedList] = useState<ListKey>('age-groups');
  const [allData, setAllData]           = useState<Record<ListKey, ConfigItem[]>>(INITIAL_DATA);

  const [viewMode,     setViewMode]     = useState<'grid' | 'list' | 'table'>('table');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [sortField,    setSortField]    = useState<'name' | 'status' | 'lastUpdated'>('name');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();
  const [showSummary,  setShowSummary]  = useState(false);

  const [modalMode,    setModalMode]    = useState<'create' | 'edit' | 'view' | null>(null);
  const [activeItem,   setActiveItem]   = useState<Partial<ConfigItem> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConfigItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<ConfigItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const meta         = LIST_META[selectedList];
  const currentItems = allData[selectedList];

  const processedData = useMemo(() => {
    let r = currentItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    r = [...r].sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return r;
  }, [currentItems, searchQuery, sortField, sortDir]);

  const totalPages    = itemsPerPage === 0 ? 1 : Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (itemsPerPage === 0) return processedData;
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const setItems = (updater: (prev: ConfigItem[]) => ConfigItem[]) =>
    setAllData(prev => ({ ...prev, [selectedList]: updater(prev[selectedList]) }));

  const toggleId = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSelectList = (key: ListKey) => {
    setSelectedList(key);
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleCreateNew = () => {
    const newId = `${meta.idPrefix}-${String(currentItems.length + 1).padStart(3, '0')}`;
    setActiveItem({ id: newId, name: '', status: 'active', lastUpdated: new Date().toISOString().split('T')[0] });
    setModalMode('create');
  };

  const [nameError, setNameError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!activeItem?.name?.trim()) {
      setNameError(true);
      toast.error('Name is required.');
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameRef.current?.focus();
      return;
    }
    setNameError(false);
    const saved = { ...activeItem, lastUpdated: new Date().toISOString().split('T')[0] } as ConfigItem;
    if (modalMode === 'create') {
      setItems(prev => [...prev, saved]);
      toast.success('Item added.');
    } else {
      setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
      toast.success('Item updated.');
    }
    setModalMode(null);
    setActiveItem(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      toast.success('Item deleted.');
      setDeleteTarget(null);
      setIsSubmitting(false);
    }, 300);
  };

  const handleConfirmStatus = () => {
    if (!statusTarget) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const s = statusTarget.status === 'active' ? 'inactive' : 'active';
      setItems(prev => prev.map(i => i.id === statusTarget.id
        ? { ...i, status: s, lastUpdated: new Date().toISOString().split('T')[0] }
        : i
      ));
      toast.success('Status updated.');
      setStatusTarget(null);
      setIsSubmitting(false);
    }, 300);
  };

  const handleExport = () => {
    const data = selectedIds.size > 0 ? processedData.filter(i => selectedIds.has(i.id)) : processedData;
    if (!data.length) { toast.error('No data to export.'); return; }
    const csv = ['ID,Name,Status,Last Updated',
      ...data.map(i => `"${i.id}","${i.name}","${i.status}","${formatDate(i.lastUpdated)}"`)
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `${selectedList}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${data.length} records.`);
  };

  const renderStatus = (status: string) => {
    const active = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium capitalize ${
        active
          ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950/20 dark:text-success-400 dark:border-success-800'
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
        {status}
      </span>
    );
  };

  const renderSort = (field: typeof sortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp   className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
      : <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />;
  };

  const fmtDate = (d: string) => formatDate(d, d);

  const getMenuItems = (item: ConfigItem) => {
    const items: any[] = [
      { icon: Eye, label: 'View Details', onClick: () => { setActiveItem(item); setModalMode('view'); } },
    ];
    if (perms.canEdit)   items.push({ icon: Edit,  label: 'Edit',   onClick: () => { setActiveItem(item); setModalMode('edit'); } });
    if (perms.canStatus) {
      items.push({ divider: true });
      items.push({ icon: item.status === 'active' ? ToggleLeft : ToggleRight, label: item.status === 'active' ? 'Deactivate' : 'Activate', onClick: () => setStatusTarget(item) });
    }
    if (perms.canDelete) {
      items.push({ divider: true });
      items.push({ icon: Trash2, label: 'Delete', onClick: () => setDeleteTarget(item) });
    }
    return items;
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="sticky-listing-table flex gap-0 mt-4" style={stickyTableStyle}>

      {/* ── LEFT SIDEBAR ────────────────────────────────────────────────────── */}
      <div className="w-56 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 pr-4 mr-6">
        {CATEGORIES.map(cat => (
          <div key={cat.label} className="mb-5">
            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-100 px-3 mb-1.5">
              {cat.label}
            </div>
            {cat.lists.map(list => (
              <button
                key={list.key}
                onClick={() => handleSelectList(list.key)}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors mb-0.5 ${
                  selectedList === list.key
                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {list.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Sub-header */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 flex items-center justify-between mb-4 gap-4 flex-wrap pb-1">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{meta.label}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentItems.length} items · {currentItems.filter(i => i.status === 'active').length} active
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={`Search...`} />
            {perms.canAdd && (
              <PrimaryButton icon={Plus} onClick={handleCreateNew}>Add Item</PrimaryButton>
            )}
            <IconButton icon={BarChart3}      onClick={() => setShowSummary(s => !s)} title="Summary"    />
            <IconButton icon={RefreshCw}      onClick={() => {}}                      title="Refresh"    />
            <IconButton icon={FileSpreadsheet} onClick={handleExport}                  title="Export CSV" />
            <ViewModeSwitcher currentMode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Summary */}
        {showSummary && (
          <div className="mb-4">
            <SummaryWidgets
              title={`${meta.label} Summary`}
              widgets={[
                { label: 'Total Items', value: currentItems.length,                                  icon: 'Tags'        },
                { label: 'Active',      value: currentItems.filter(i => i.status === 'active').length,   icon: 'CheckCircle' },
                { label: 'Inactive',    value: currentItems.filter(i => i.status === 'inactive').length, icon: 'Tags'        },
              ]}
            />
          </div>
        )}

        {/* ── GRID ──────────────────────────────────────────────────────────── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedData.length > 0 ? paginatedData.map(item => (
              <div
                key={item.id}
                onClick={() => { setActiveItem(item); setModalMode('view'); }}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                  selectedIds.has(item.id)
                    ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-600 dark:hover:border-primary-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug">{item.name}</p>
                    <span className="text-[11px] font-mono text-neutral-400">{item.id}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleId(item.id)}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                    />
                    <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getMenuItems(item)} />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-[10px] text-neutral-400">{fmtDate(item.lastUpdated)}</span>
                  {renderStatus(item.status)}
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/30 dark:bg-neutral-900/30">
                <p className="text-sm text-neutral-500">No items found. Click Add Item to create one.</p>
              </div>
            )}
          </div>
        )}

        {/* ── LIST ──────────────────────────────────────────────────────────── */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {paginatedData.length > 0 ? paginatedData.map(item => (
              <div
                key={item.id}
                onClick={() => { setActiveItem(item); setModalMode('view'); }}
                className={`bg-white dark:bg-neutral-950 border rounded-lg p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                  selectedIds.has(item.id) ? 'border-primary-300 dark:border-primary-600' : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleId(item.id)}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                    <div className="min-w-[180px]">
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.name}</h4>
                      <span className="text-[11px] font-mono text-neutral-400">{item.id}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{fmtDate(item.lastUpdated)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {renderStatus(item.status)}
                  <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getMenuItems(item)} />
                </div>
              </div>
            )) : (
              <div className="py-16 text-center border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">No items found.</p>
              </div>
            )}
          </div>
        )}

        {/* ── TABLE ─────────────────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-visible bg-white dark:bg-neutral-950 shadow-sm">
            <div className="sticky-table-scroll slim-scroll">
              <table className="w-full min-w-max text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                        onChange={e => setSelectedIds(e.target.checked ? new Set(paginatedData.map(i => i.id)) : new Set())}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                    {(['name', 'status', 'lastUpdated'] as const).map(f => (
                      <th
                        key={f}
                        onClick={() => handleSort(f)}
                        className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800"
                      >
                        {{ name: 'Name', status: 'Status', lastUpdated: 'Last Updated' }[f]}
                        {renderSort(f)}
                      </th>
                    ))}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800">
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
                          onChange={() => toggleId(item.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-3.5">{renderStatus(item.status)}</td>
                      <td className="px-6 py-3.5 text-sm text-neutral-500 dark:text-neutral-400 font-mono">{fmtDate(item.lastUpdated)}</td>
                      <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {perms.canEdit && (
                            <IconButton icon={Edit} borderless onClick={() => { setActiveItem(item); setModalMode('edit'); }} title="Edit" />
                          )}
                          {perms.canStatus && (
                            <IconButton
                              icon={item.status === 'active' ? ToggleRight : ToggleLeft}
                              borderless
                              onClick={() => setStatusTarget(item)}
                              title={item.status === 'active' ? 'Deactivate' : 'Activate'}
                            />
                          )}
                          {perms.canDelete && (
                            <IconButton icon={Trash2} borderless onClick={() => setDeleteTarget(item)} title="Delete" />
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-sm text-neutral-500">No items found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {processedData.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={processedData.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={n => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        )}

        {/* ── CRUD MODAL ────────────────────────────────────────────────────── */}
        <FormModal
          isOpen={modalMode !== null}
          onClose={() => { setModalMode(null); setActiveItem(null); setNameError(false); }}
          title={
            modalMode === 'create' ? `Add ${meta.label} Item` :
            modalMode === 'edit'   ? 'Edit Item' :
                                     'Item Details'
          }
          maxWidth="max-w-md"
        >
          {activeItem && (
            <div className="space-y-4 p-1">
              <FormSection>
                <FormField>
                  <FormLabel required={modalMode !== 'view'}>Name</FormLabel>
                  <FormInput
                    ref={nameRef}
                    value={activeItem.name ?? ''}
                    onChange={e => { setActiveItem({ ...activeItem, name: e.target.value }); setNameError(false); }}
                    readOnly={modalMode === 'view'}
                    placeholder="Enter item name"
                    className={nameError ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                  />
                  <ErrorText>{nameError && 'Name is required.'}</ErrorText>
                </FormField>
              </FormSection>
              <FormSection>
                <FormField>
                  <FormLabel>Status</FormLabel>
                  {modalMode === 'view' ? (
                    <div className="pt-1">{renderStatus(activeItem.status ?? 'active')}</div>
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
                  <PrimaryButton onClick={handleSave}>
                    Save
                  </PrimaryButton>
                )}
              </div>
            </div>
          )}
        </FormModal>

        {/* Status confirmation */}
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
              <PrimaryButton onClick={handleConfirmStatus} disabled={isSubmitting}>
                {isSubmitting ? 'Updating…' : 'Confirm'}
              </PrimaryButton>
            </div>
          </div>
        </FormModal>

        {/* Delete confirmation */}
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
                Delete{' '}
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
