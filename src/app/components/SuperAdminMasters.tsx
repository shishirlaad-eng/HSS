import { useState, useMemo, useEffect, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye, Edit, Trash2, Plus, RefreshCw, MoreVertical,
  Globe, MapPin, Map, Building2, Tags, AlertTriangle,
  ArrowUpDown, ArrowUp, ArrowDown,
  FileSpreadsheet, FileText, BarChart3,
  ToggleLeft, ToggleRight, Sliders,
} from 'lucide-react';
import ConfigurableListsMaster from './ConfigurableListsMaster';
import {
  PageHeader, SearchBar, Pagination, IconButton,
  ViewModeSwitcher, PrimaryButton, AdvancedSearchPanel,
  SummaryWidgets, useStickyListingHeader,
  type ColumnConfig, type FilterCondition
} from './hb/listing';
import {
  FormModal, FormSection, FormField, FormLabel,
  FormInput, FormSelect, StatusSlider, ErrorText,
} from './hb/common';
import { toast } from 'sonner';
import { ROLE_TYPE_OPTIONS, MASTERS_CASCADE, mockMembers } from '../../mockAPI/membersData';
import { mockRoles } from '../../mockAPI/rolesData';
import { getRoleScope } from '../../mockAPI/roleScope';
import { formatDate as sharedFormatDate } from '../../utils/formatDate';

type ViewMode = 'grid' | 'list' | 'table';
export type MasterType = 'country' | 'region' | 'town' | 'centre' | 'role-types' | 'configurable-lists';

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
  // Activity Centre extras
  // Selected member (holding Shakha Karyawaha Pramukh) whose name/phone are
  // shown as this centre's contact — chosen via autocomplete, not typed in.
  karyawahaPramukhId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postCode?: string;
  // Optional second physical location — some Shakhas meet at two different
  // venues across the week. The primary address above is mandatory; this is not.
  address2Line1?: string;
  address2Line2?: string;
  address2City?: string;
  address2PostCode?: string;
}

// A Shakha's contact name/phone are never typed in directly — the admin picks
// the member from an autocomplete restricted to those holding the "Shakha
// Karyawaha Pramukh" Sangh Responsibility (Level: Shakha / Activity center,
// Responsibility: Karyawaha, Type: Pramukh); the pick is stored as
// karyawahaPramukhId and the member's current name/phone are shown from it.
// Matches against both a member's primary responsibility and any
// currently-held entry in their responsibilities[] history (no endDate).
function isShakhaKaryawahaPramukh(m: typeof mockMembers[number]): boolean {
  const check = (level?: string, resp?: string, type?: string) =>
    level === 'Shakha / Activity center' && resp === 'Karyawaha' && type === 'Pramukh';
  if (check(m.responsibilityLevel, m.jobTitle, m.responsibilityType)) return true;
  return (m.responsibilities ?? []).some(r =>
    !r.endDate && check(r.responsibilityLevel, r.sanghResponsibility, r.responsibilityType)
  );
}

const eligibleKaryawahaPramukhs = mockMembers.filter(m => m.status === 'active' && isShakhaKaryawahaPramukh(m));

function getShakhaKaryawahaPramukh(memberId?: string): { name: string; phone?: string } | null {
  if (!memberId) return null;
  const match = eligibleKaryawahaPramukhs.find(m => m.id === memberId);
  return match ? { name: match.name, phone: match.phone } : null;
}

// ── Contact Name autocomplete — restricted to eligible Karyawaha Pramukhs ──

type PramukhCandidate = typeof mockMembers[number];

const PramukhAutocomplete = forwardRef<HTMLInputElement, {
  value: string;
  candidates: PramukhCandidate[];
  error?: boolean;
  onChange: (name: string, member: PramukhCandidate | null) => void;
}>(function PramukhAutocomplete({ value, candidates, error, onChange }, forwardedRef) {
  const [query, setQuery]     = useState(value);
  const [focused, setFocused] = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);
  const selfTyping = useRef(false);

  useEffect(() => { if (!selfTyping.current) setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() =>
    candidates.filter(m => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
    [query, candidates],
  );

  const open = focused && suggestions.length > 0;
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open) { setRect(null); return; }
    const update = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  const handleType = (text: string) => {
    selfTyping.current = true;
    setQuery(text);
    onChange(text, null);
    requestAnimationFrame(() => { selfTyping.current = false; });
  };

  const handleSelect = (m: PramukhCandidate) => {
    selfTyping.current = true;
    setQuery(m.name);
    setFocused(false);
    onChange(m.name, m);
    requestAnimationFrame(() => { selfTyping.current = false; });
  };

  return (
    <div ref={ref} className="relative">
      <FormInput
        ref={forwardedRef}
        value={query}
        onChange={e => handleType(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Type to search Shakha Karyawaha Pramukhs…"
        className={error ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
      />
      {open && rect && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[999] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        >
          {suggestions.map(m => (
            <button
              key={m.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(m)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{m.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{m.activityCentre}</p>
              </div>
              <span className="text-xs font-mono text-neutral-400 ml-3 flex-shrink-0">{m.id}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
});

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

// Names below are real MASTERS_CASCADE activity centre names (previously this
// list used fictional names with zero overlap against MASTERS_CASCADE / member
// activityCentre values, which silently broke any join against member data —
// e.g. the Karyawaha Pramukh contact lookup below). contactName/contactPhone
// are no longer read for centre type; they're derived live via
// getShakhaKaryawahaPramukh(name) instead.
const initialCentres: MasterItem[] = [
  { id: 'CTR-001', name: 'Wembley Activity Centre',           townName: 'Wembley',     regionName: 'London & South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-15', contactEmail: 'wembley@hss.org.uk',           addressLine1: '14 Colston Avenue',   addressLine2: '',              city: 'Wembley',      postCode: 'BS1 4ST' },
  { id: 'CTR-002', name: 'Southall Activity Centre',          townName: 'Southall',    regionName: 'London & South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-16', contactEmail: 'southall@hss.org.uk',          addressLine1: '3 Station Road',       addressLine2: '',              city: 'Southall',     postCode: 'BS34 7JH' },
  { id: 'CTR-003', name: 'Ilford Activity Centre',            townName: 'Ilford',      regionName: 'London & South East', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-17', contactEmail: 'ilford@hss.org.uk',            addressLine1: '22 Milsom Street',     addressLine2: '',              city: 'Ilford',       postCode: 'BA1 1DL' },
  { id: 'CTR-004', name: 'Birmingham East Activity Centre',   townName: 'Birmingham',  regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-18', contactEmail: 'bham.east@hss.org.uk',         addressLine1: '88 Witton Road',       addressLine2: 'Aston',         city: 'Birmingham',   postCode: 'B6 6QW' },
  { id: 'CTR-005', name: 'Birmingham West Activity Centre',   townName: 'Birmingham',  regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-19', contactEmail: 'bham.west@hss.org.uk',         addressLine1: '45 Oak Tree Lane',     addressLine2: 'Selly Oak',     city: 'Birmingham',   postCode: 'B29 6JE' },
  { id: 'CTR-006', name: 'Coventry Activity Centre',          townName: 'Coventry',    regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-20', contactEmail: 'coventry@hss.org.uk',          addressLine1: '7 Corporation Street', addressLine2: '',              city: 'Coventry',     postCode: 'CV1 1GF' },
  { id: 'CTR-007', name: 'Leicester Activity Centre',         townName: 'Leicester',   regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-21', contactEmail: 'leicester@hss.org.uk',         addressLine1: '19 Belgrave Road',     addressLine2: '',              city: 'Leicester',    postCode: 'LE4 6AR' },
  { id: 'CTR-008', name: 'Derby Activity Centre',             townName: 'Derby',       regionName: 'Midlands',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-22', contactEmail: 'derby@hss.org.uk',             addressLine1: '52 Deansgate',         addressLine2: '',              city: 'Derby',        postCode: 'M3 2EN' },
  { id: 'CTR-009', name: 'Manchester Central Activity Centre', townName: 'Manchester', regionName: 'North West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-01-24', contactEmail: 'manchester.central@hss.org.uk', addressLine1: '6 Simonsway',          addressLine2: '',              city: 'Manchester',   postCode: 'M22 9NR' },
  { id: 'CTR-010', name: 'Liverpool Activity Centre',         townName: 'Liverpool',   regionName: 'North West', countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-01', contactEmail: 'liverpool@hss.org.uk',         addressLine1: '30 Briggate',          addressLine2: '',              city: 'Liverpool',    postCode: 'LS1 6HR' },
  { id: 'CTR-011', name: 'Leeds North Activity Centre',       townName: 'Leeds',       regionName: 'Yorkshire & Humber', countryName: 'HSS UK', status: 'active',   lastUpdated: '2024-02-02', contactEmail: 'leeds.north@hss.org.uk',       addressLine1: '11 Fargate',           addressLine2: '',              city: 'Leeds',        postCode: 'S1 2HH' },
  { id: 'CTR-012', name: 'Sheffield Activity Centre',         townName: 'Sheffield',   regionName: 'Yorkshire & Humber', countryName: 'HSS UK', status: 'active',   lastUpdated: '2024-02-05', contactEmail: 'sheffield@hss.org.uk',         addressLine1: '74 The Broadway',      addressLine2: '',              city: 'Sheffield',    postCode: 'W5 5JY' },
  { id: 'CTR-013', name: 'Harrow Activity Centre',            townName: 'Harrow',      regionName: 'London & South East', countryName: 'HSS UK', status: 'active',   lastUpdated: '2024-02-06', contactEmail: 'harrow@hss.org.uk',            addressLine1: '28 Station Road',      addressLine2: 'Harrow',        city: 'Harrow',       postCode: 'HA1 2SQ' },
  { id: 'CTR-014', name: 'Edinburgh Activity Centre',         townName: 'Edinburgh',   regionName: 'Scotland',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-07', contactEmail: 'edinburgh@hss.org.uk',         addressLine1: '5 Above Bar Street',   addressLine2: '',              city: 'Edinburgh',    postCode: 'SO14 7DU' },
  { id: 'CTR-015', name: 'Glasgow Activity Centre',           townName: 'Glasgow',     regionName: 'Scotland',   countryName: 'HSS UK',      status: 'active',   lastUpdated: '2024-02-08', contactEmail: 'glasgow@hss.org.uk',           addressLine1: '100 Sauchiehall St',   addressLine2: '',              city: 'Glasgow',      postCode: 'G2 3DE' },
  { id: 'CTR-016', name: 'Dublin Activity Centre',            townName: 'Dublin City', regionName: 'Dublin',     countryName: 'HSS Ireland', status: 'active', lastUpdated: '2024-02-10', contactEmail: 'dublin@hss.ie',                addressLine1: '12 O\'Connell Street', addressLine2: '',              city: 'Dublin',       postCode: 'D01 T6V4' },
];

const initialRoleTypes: MasterItem[] = ROLE_TYPE_OPTIONS.map((name, index) => ({
  id: `ROL-${String(index + 1).padStart(3, '0')}`,
  name,
  status: 'active' as const,
  lastUpdated: '2024-02-15',
}));

// ─── Sub-section Tab Config ───────────────────────────────────────────────────

const MASTER_TABS: { id: MasterType; label: string }[] = [
  { id: 'country',            label: 'Country' },
  { id: 'region',             label: 'Vibhag' },
  { id: 'town',               label: 'Nagar' },
  { id: 'centre',             label: 'Shakha' },
  { id: 'configurable-lists', label: 'Lists & Options' },
];

// Tabs hidden per role (role cannot manage higher-level geography than their scope)
const HIDDEN_TABS_BY_ROLE: Partial<Record<string, MasterType[]>> = {
  'Vibhag Admin':  ['country', 'region', 'configurable-lists'],
  'Nagar Admin':    ['country', 'region', 'town'],
  'Shakha Admin':   ['country', 'region', 'town', 'centre'],
};

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
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  // ── Data ───────────────────────────────────────────────────────────────────
  const [countries,  setCountries]  = useState<MasterItem[]>(initialCountries);
  const [regions,    setRegions]    = useState<MasterItem[]>(initialRegions);
  const [towns,      setTowns]      = useState<MasterItem[]>(initialTowns);
  const [centres,    setCentres]    = useState<MasterItem[]>(initialCentres);
  const [roleTypes,  setRoleTypes]  = useState<MasterItem[]>(initialRoleTypes);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [searchQuery,       setSearchQuery]       = useState('');
  const [filters,           setFilters]           = useState<FilterCondition[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // ── Sorting ────────────────────────────────────────────────────────────────
  const [sortField,     setSortField]     = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // ── Selection & summary ────────────────────────────────────────────────────
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [showSummary,  setShowSummary]  = useState(false);

  // ── Column visibility (table view only) ───────────────────────────────────
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true, name: true, code: true,
    countryName: true, regionName: true, townName: true,
    contactName: true, contactPhone: true, contactEmail: true,
    city: true, postCode: true,
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
    setFilters([]);
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [masterType]);

  // ── Tab visibility per role ────────────────────────────────────────────────
  const hiddenTabIds = useMemo(
    () => new Set<MasterType>(HIDDEN_TABS_BY_ROLE[selectedRole] ?? []),
    [selectedRole],
  );
  const visibleTabs = useMemo(
    () => MASTER_TABS.filter(t => !hiddenTabIds.has(t.id)),
    [hiddenTabIds],
  );
  // If the active tab is hidden for this role, redirect to the first visible one
  useEffect(() => {
    if (hiddenTabIds.has(masterType) && visibleTabs.length > 0) {
      onNavigate?.(visibleTabs[0].id);
    }
  }, [masterType, hiddenTabIds, visibleTabs, onNavigate]);

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
        title: 'Vibhag',
        subtitle: 'Manage Vibhags linked to a Country.',
        icon: Map,
        addLabel: 'Add Vibhag',
        nameLabel: 'Vibhag Name',
        idPrefix: 'RGN',
      };
      case 'town': return {
        title: 'Nagar',
        subtitle: 'Manage Nagars linked to a Vibhag.',
        icon: MapPin,
        addLabel: 'Add Nagar',
        nameLabel: 'Nagar Name',
        idPrefix: 'TWN',
      };
      case 'centre': return {
        title: 'Shakha',
        subtitle: 'Manage Shakhas linked to a Nagar.',
        icon: Building2,
        addLabel: 'Add Shakha',
        nameLabel: 'Shakha Name',
        idPrefix: 'CTR',
      };
      case 'role-types': return {
        title: 'Responsibility',
        subtitle: 'Manage the Responsibility reference list used by governance and role assignment.',
        icon: Tags,
        addLabel: 'Add Responsibility',
        nameLabel: 'Responsibility Name',
        idPrefix: 'ROL',
      };
      case 'configurable-lists': return {
        title: 'Lists & Options',
        subtitle: 'Manage configurable dropdown values used across the system.',
        icon: Sliders,
        addLabel: 'Add Item',
        nameLabel: 'Item Name',
        idPrefix: 'LST',
      };
    }
  }, [masterType]);

  const isStandaloneMaster = masterType === 'role-types' || masterType === 'configurable-lists';

  // ─── Column config ─────────────────────────────────────────────────────────
  const masterColumns = useMemo<ColumnConfig[]>(() => {
    const cols: ColumnConfig[] = [{ key: 'name', label: config.nameLabel }];
    if (masterType === 'country')    cols.push({ key: 'code', label: 'Country Code' });
    if (masterType !== 'country' && !isStandaloneMaster)
                                     cols.push({ key: 'countryName', label: 'Country' });
    if (masterType === 'town' || masterType === 'centre')
                                     cols.push({ key: 'regionName', label: 'Vibhag' });
    if (masterType === 'centre')     cols.push({ key: 'townName',     label: 'Nagar' });
    if (masterType === 'centre')     cols.push({ key: 'contactName',  label: 'Contact Name' });
    if (masterType === 'centre')     cols.push({ key: 'contactPhone', label: 'Phone' });
    if (masterType === 'centre')     cols.push({ key: 'contactEmail', label: 'Email' });
    if (masterType === 'centre')     cols.push({ key: 'city',         label: 'City' });
    if (masterType === 'centre')     cols.push({ key: 'postCode',     label: 'Post Code' });
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
      case 'role-types':         return roleTypes;
      case 'configurable-lists': return [];    // handled by ConfigurableListsMaster
    }
    // Apply scope filtering on master items
    if (scope.level === 'all') return data;
    if (scope.level === 'national' && scope.country) {
      // Regions: only those belonging to scope.country
      if (masterType === 'region')  return data.filter(i => i.countryName === scope.country);
      // Towns: only those whose regionName is in scope country's regions
      if (masterType === 'town') {
        const countryRegions: string[] = MASTERS_CASCADE.regions[scope.country] ?? [];
        return data.filter(i => countryRegions.includes(i.regionName ?? ''));
      }
      // Centres: only those whose town is in scope country
      if (masterType === 'centre') {
        const countryRegions: string[] = MASTERS_CASCADE.regions[scope.country] ?? [];
        const countryTowns: string[] = countryRegions.flatMap((r: string) => MASTERS_CASCADE.towns[r] ?? []);
        return data.filter(i => countryTowns.includes(i.townName ?? ''));
      }
    }
    if (scope.level === 'regional' && scope.region) {
      if (masterType === 'region')  return data.filter(i => i.name === scope.region);
      if (masterType === 'town')    return data.filter(i => i.regionName === scope.region);
      if (masterType === 'centre')  {
        const regionTowns: string[] = MASTERS_CASCADE.towns[scope.region] ?? [];
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
      case 'role-types':         setRoleTypes(updater); break;
      case 'configurable-lists':                        break;
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
        (item.townName     && item.townName.toLowerCase().includes(q)) ||
        (masterType === 'centre' && getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.name.toLowerCase().includes(q)) ||
        (item.contactEmail && item.contactEmail.toLowerCase().includes(q)) ||
        (item.city         && item.city.toLowerCase().includes(q)) ||
        (item.postCode     && item.postCode.toLowerCase().includes(q));
      const matchesFilters = filters.every(f => {
        if (!f.values.length) return true;
        switch (f.field) {
          case 'Status':  return f.values.some(v => v.toLowerCase() === item.status);
          case 'Country': return f.values.includes(item.countryName ?? '');
          case 'Vibhag': return f.values.includes(item.regionName  ?? '');
          case 'Nagar':   return f.values.includes(item.townName    ?? '');
          default: return true;
        }
      });
      return matchesSearch && matchesFilters;
    });

    result = [...result].sort((a, b) => {
      const aVal = (a as any)[sortField] ?? '';
      const bVal = (b as any)[sortField] ?? '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1  : -1;
      return 0;
    });

    return result;
  }, [currentDataArray, searchQuery, filters, sortField, sortDirection]);

  const totalPages   = itemsPerPage === 0 ? 1 : Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (itemsPerPage === 0) return processedData;
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  // ─── Derived dropdown options ──────────────────────────────────────────────
  const countryOptions = useMemo(() => countries.map(c => c.name), [countries]);
  const regionOptions  = useMemo(() => [...new Set(regions.map(r => r.name))], [regions]);
  const townOptions    = useMemo(() => [...new Set(towns.map(t => t.name))],   [towns]);

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
      // Activity Centre extras
      contactEmail: masterType === 'centre' ? '' : undefined,
      addressLine1: masterType === 'centre' ? '' : undefined,
      addressLine2: masterType === 'centre' ? '' : undefined,
      city:         masterType === 'centre' ? '' : undefined,
      postCode:     masterType === 'centre' ? '' : undefined,
      address2Line1:   masterType === 'centre' ? '' : undefined,
      address2Line2:   masterType === 'centre' ? '' : undefined,
      address2City:    masterType === 'centre' ? '' : undefined,
      address2PostCode: masterType === 'centre' ? '' : undefined,
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    setModalMode('create');
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const countryRef = useRef<HTMLSelectElement>(null);
  const regionRef  = useRef<HTMLSelectElement>(null);
  const townRef    = useRef<HTMLSelectElement>(null);
  const nameRef    = useRef<HTMLInputElement>(null);
  const addressLine1Ref = useRef<HTMLInputElement>(null);

  const focusField = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ref.current?.focus();
  };

  const handleSaveItem = () => {
    if (masterType !== 'country' && !isStandaloneMaster && !activeItem?.countryName) {
      setFieldErrors({ countryName: true });
      toast.error('Country is required.');
      focusField(countryRef);
      return;
    }
    if ((masterType === 'town' || masterType === 'centre') && !activeItem?.regionName) {
      setFieldErrors({ regionName: true });
      toast.error('Vibhag is required.');
      focusField(regionRef);
      return;
    }
    if (masterType === 'centre' && !activeItem?.townName) {
      setFieldErrors({ townName: true });
      toast.error('Nagar is required.');
      focusField(townRef);
      return;
    }
    if (!activeItem?.name?.trim()) {
      setFieldErrors({ name: true });
      toast.error(`${config.nameLabel} is required.`);
      focusField(nameRef);
      return;
    }
    if (masterType === 'centre' && !activeItem?.addressLine1?.trim()) {
      setFieldErrors({ addressLine1: true });
      toast.error('Address Line 1 is required.');
      focusField(addressLine1Ref);
      return;
    }
    setFieldErrors({});

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
        cols.map(c => {
          const v = (item as any)[c.key];
          return `"${String(c.key === 'lastUpdated' ? sharedFormatDate(v) : (v ?? '')).replace(/"/g, '""')}"`;
        }).join(',')
      );
      const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${masterType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success(`Exported ${dataToExport.length} records to Excel.`);
    } else {
      const lines = [
        `${config.title.toUpperCase()} REPORT — ${sharedFormatDate(new Date())}`,
        `Total: ${dataToExport.length}`,
        '',
        cols.map(c => c.label.padEnd(22)).join(''),
        '─'.repeat(cols.length * 22),
        ...dataToExport.map(item =>
          cols.map(c => {
            const v = (item as any)[c.key];
            return String(c.key === 'lastUpdated' ? sharedFormatDate(v) : (v ?? '')).substring(0, 20).padEnd(22);
          }).join('')
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
          ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950/20 dark:text-success-400 dark:border-success-800'
          : 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
      }`}>
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

  const formatDate = (d: string) => sharedFormatDate(d, d);

  // ─── Advanced filter options per tab ──────────────────────────────────────
  const filterOptions = useMemo<Record<string, string[]>>(() => ({
    'Status': ['Active', 'Inactive'],
    ...(masterType !== 'country' && !isStandaloneMaster ? { 'Country': countryOptions } : {}),
    ...((masterType === 'town' || masterType === 'centre') ? { 'Vibhag': regionOptions } : {}),
    ...(masterType === 'centre' ? { 'Nagar': townOptions } : {}),
  }), [masterType, isStandaloneMaster, countryOptions, regionOptions, townOptions]);

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

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950 min-h-screen" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title={config.title}
          subtitle={config.subtitle}
          breadcrumbs={[
            { label: 'HSS (UK) Setup', href: '#' },
            { label: config.title, current: true },
          ]}
        >
          {/* Two-group layout: left = search/filters (variable), right = fixed actions */}
          {masterType !== 'configurable-lists' && <div className="flex items-center justify-between gap-4 w-full">

            {/* Left — search + advanced filters */}
            <div className="relative flex items-center gap-2 min-w-0">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onAdvancedSearch={() => setShowAdvancedSearch(true)}
                activeFilterCount={filters.filter(f => f.values.length > 0).length}
                placeholder={`Search ${config.title.toLowerCase()}s...`}
              />
              <AdvancedSearchPanel
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={filterOptions}
                title={`Filter ${config.title}`}
              />
            </div>

            {/* Right — fixed action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
            </div>
          </div>}
        </PageHeader>
        </div>

        {/* ── SUB-SECTION TABS ────────────────────────────────────────────── */}
        <div className="flex gap-0 mt-4 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate?.(tab.id)}
              className={`px-4 py-2.5 text-xs whitespace-nowrap transition-colors border-b-2 -mb-px ${
                masterType === tab.id
                  ? 'border-primary-600 dark:border-primary-400 text-primary-700 dark:text-primary-300 font-semibold bg-primary-50 dark:bg-primary-950/50'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 font-medium hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── CONFIGURABLE LISTS (replaces standard CRUD for this tab) ──── */}
        {masterType === 'configurable-lists' && (
          <ConfigurableListsMaster selectedRole={selectedRole} />
        )}

        {/* ── SUMMARY WIDGETS ─────────────────────────────────────────────── */}
        {masterType !== 'configurable-lists' && showSummary && (
          <div className="mt-4">
            {masterType === 'country' && (
              <SummaryWidgets title="Country Summary" widgets={[
                { label: 'Total Countries',  value: countries.length,                                icon: 'Globe'       },
                { label: 'Active Countries', value: countries.filter(c => c.status === 'active').length, icon: 'CheckCircle' },
              ]} />
            )}
            {masterType === 'region' && (
              <SummaryWidgets title="Vibhag Summary" widgets={[
                { label: 'Total Vibhag',  value: regions.length,                               icon: 'Map'         },
                { label: 'Active Vibhag', value: regions.filter(r => r.status === 'active').length, icon: 'CheckCircle' },
                { label: 'Countries',      value: new Set(regions.map(r => r.countryName)).size, icon: 'Globe'       },
              ]} />
            )}
            {masterType === 'town' && (
              <SummaryWidgets title="Nagar Summary" widgets={[
                { label: 'Total Nagars',  value: towns.length,                              icon: 'MapPin'      },
                { label: 'Active Nagars', value: towns.filter(t => t.status === 'active').length, icon: 'CheckCircle' },
                { label: 'Vibhag',       value: new Set(towns.map(t => t.regionName)).size, icon: 'Map'         },
              ]} />
            )}
            {masterType === 'centre' && (
              <SummaryWidgets title="Shakha Summary" widgets={[
                { label: 'Total Shakhas',  value: centres.length,                                icon: 'Building2'   },
                { label: 'Active Shakhas', value: centres.filter(c => c.status === 'active').length, icon: 'CheckCircle' },
                { label: 'Nagar',          value: new Set(centres.map(c => c.townName)).size,    icon: 'MapPin'      },
              ]} />
            )}
            {masterType === 'role-types' && (
              <SummaryWidgets title="Responsibility Summary" widgets={[
                { label: 'Total Responsibilities',  value: roleTypes.length,                                  icon: 'Tags'        },
                { label: 'Active Responsibilities', value: roleTypes.filter(r => r.status === 'active').length, icon: 'CheckCircle' },
              ]} />
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CARD VIEW
        ══════════════════════════════════════════════════════════════════ */}
        {masterType !== 'configurable-lists' && viewMode === 'grid' && (
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
                        <span className="text-neutral-400">Vibhag:</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">{item.regionName}</span>
                      </div>
                    )}
                    {item.townName && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Nagar:</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">{item.townName}</span>
                      </div>
                    )}
                    {/* Activity Centre extras — Karyawaha Pramukh contact, pulled live */}
                    {masterType === 'centre' && getShakhaKaryawahaPramukh(item.karyawahaPramukhId) && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Contact:</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">{getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.name}</span>
                      </div>
                    )}
                    {masterType === 'centre' && getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.phone && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Phone:</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.phone}</span>
                      </div>
                    )}
                    {masterType === 'centre' && (item.city || item.postCode) && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Location:</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">
                          {[item.city, item.postCode].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    {item.childCount !== undefined && masterType !== 'centre' && !isStandaloneMaster && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">
                          {masterType === 'country' ? 'Vibhag:'
                          : masterType === 'region'  ? 'Nagar:'
                          : masterType === 'town'    ? 'Shakha:'
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
        {masterType !== 'configurable-lists' && viewMode === 'list' && (
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
                    {item.regionName  && <span className="text-xs text-neutral-500 truncate">Vibhag: {item.regionName}</span>}
                    {item.townName    && <span className="text-xs text-neutral-500 truncate">Nagar: {item.townName}</span>}
                    {masterType === 'centre' && getShakhaKaryawahaPramukh(item.karyawahaPramukhId) && <span className="text-xs text-neutral-500 truncate">Contact: {getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.name}</span>}
                    {masterType === 'centre' && getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.phone && <span className="text-xs text-neutral-500">{getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.phone}</span>}
                    {masterType === 'centre' && (item.city || item.postCode) && (
                      <span className="text-xs text-neutral-500">{[item.city, item.postCode].filter(Boolean).join(', ')}</span>
                    )}
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
        {masterType !== 'configurable-lists' && viewMode === 'table' && (
          <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-visible bg-white dark:bg-neutral-950 shadow-sm">
            <div className="sticky-table-scroll slim-scroll">
              <table className="w-full min-w-max text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    {visibleColumns.name && (
                      <th onClick={() => handleSort('name')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        {config.nameLabel} {renderSortIndicator('name')}
                      </th>
                    )}
                    {masterType === 'country' && visibleColumns.code && (
                      <th onClick={() => handleSort('code')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Country Code {renderSortIndicator('code')}
                      </th>
                    )}
                    {masterType !== 'country' && !isStandaloneMaster && visibleColumns.countryName && (
                      <th onClick={() => handleSort('countryName')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Country {renderSortIndicator('countryName')}
                      </th>
                    )}
                    {(masterType === 'town' || masterType === 'centre') && visibleColumns.regionName && (
                      <th onClick={() => handleSort('regionName')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Vibhag {renderSortIndicator('regionName')}
                      </th>
                    )}
                    {masterType === 'centre' && visibleColumns.townName && (
                      <th onClick={() => handleSort('townName')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Nagar {renderSortIndicator('townName')}
                      </th>
                    )}
                    {masterType === 'centre' && visibleColumns.contactName && (
                      <th onClick={() => handleSort('contactName')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Contact Name {renderSortIndicator('contactName')}
                      </th>
                    )}
                    {masterType === 'centre' && visibleColumns.contactPhone && (
                      <th onClick={() => handleSort('contactPhone')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Phone {renderSortIndicator('contactPhone')}
                      </th>
                    )}
                    {masterType === 'centre' && visibleColumns.contactEmail && (
                      <th onClick={() => handleSort('contactEmail')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Email {renderSortIndicator('contactEmail')}
                      </th>
                    )}
                    {masterType === 'centre' && visibleColumns.city && (
                      <th onClick={() => handleSort('city')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        City {renderSortIndicator('city')}
                      </th>
                    )}
                    {masterType === 'centre' && visibleColumns.postCode && (
                      <th onClick={() => handleSort('postCode')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Post Code {renderSortIndicator('postCode')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th onClick={() => handleSort('status')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Status {renderSortIndicator('status')}
                      </th>
                    )}
                    {visibleColumns.lastUpdated && (
                      <th onClick={() => handleSort('lastUpdated')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Last Updated {renderSortIndicator('lastUpdated')}
                      </th>
                    )}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
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
                      {visibleColumns.name && (
                        <td className="px-6 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white">{item.name}</td>
                      )}
                      {masterType === 'country' && visibleColumns.code && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.code}</td>
                      )}
                      {masterType !== 'country' && !isStandaloneMaster && visibleColumns.countryName && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{item.countryName}</td>
                      )}
                      {(masterType === 'town' || masterType === 'centre') && visibleColumns.regionName && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.regionName}</td>
                      )}
                      {masterType === 'centre' && visibleColumns.townName && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.townName}</td>
                      )}
                      {masterType === 'centre' && visibleColumns.contactName && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.name ?? '—'}</td>
                      )}
                      {masterType === 'centre' && visibleColumns.contactPhone && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{getShakhaKaryawahaPramukh(item.karyawahaPramukhId)?.phone ?? '—'}</td>
                      )}
                      {masterType === 'centre' && visibleColumns.contactEmail && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.contactEmail}</td>
                      )}
                      {masterType === 'centre' && visibleColumns.city && (
                        <td className="px-6 py-3.5 text-sm text-neutral-600 dark:text-neutral-400">{item.city}</td>
                      )}
                      {masterType === 'centre' && visibleColumns.postCode && (
                        <td className="px-6 py-3.5 text-sm font-mono text-neutral-600 dark:text-neutral-400">{item.postCode}</td>
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
                      <td colSpan={masterColumns.length + 1} className="px-6 py-16 text-center text-sm text-neutral-500">
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
        {masterType !== 'configurable-lists' && (
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
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CRUD FORM MODAL (geo / role-types only)
        ══════════════════════════════════════════════════════════════════ */}
        {masterType !== 'configurable-lists' && <FormModal
          isOpen={modalMode !== null}
          onClose={() => { setModalMode(null); setActiveItem(null); setFieldErrors({}); }}
          title={
            modalMode === 'create' ? config.addLabel :
            modalMode === 'edit'   ? `Edit ${config.title}` :
                                     `${config.title} Details`
          }
          maxWidth={masterType === 'centre' ? 'max-w-2xl' : 'max-w-lg'}
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
                        ref={countryRef}
                        value={activeItem.countryName ?? ''}
                        onChange={e => { setActiveItem({ ...activeItem, countryName: e.target.value, regionName: '', townName: '' }); setFieldErrors(prev => ({ ...prev, countryName: false })); }}
                        className={fieldErrors.countryName ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                      >
                        <option value="">Select Country</option>
                        {countryOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </FormSelect>
                    )}
                    <ErrorText>{fieldErrors.countryName && 'Country is required.'}</ErrorText>
                  </FormField>
                </FormSection>
              )}

              {/* Region — Town / Centre need a Region dropdown (filtered by countryName) */}
              {(masterType === 'town' || masterType === 'centre') && (
                <FormSection>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Vibhag</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.regionName ?? ''} readOnly />
                    ) : (
                      <FormSelect
                        ref={regionRef}
                        value={activeItem.regionName ?? ''}
                        onChange={e => { setActiveItem({ ...activeItem, regionName: e.target.value, townName: '' }); setFieldErrors(prev => ({ ...prev, regionName: false })); }}
                        disabled={!activeItem.countryName}
                        className={fieldErrors.regionName ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                      >
                        <option value="">Select Vibhag</option>
                        {formRegionOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </FormSelect>
                    )}
                    <ErrorText>{fieldErrors.regionName && 'Vibhag is required.'}</ErrorText>
                  </FormField>
                </FormSection>
              )}

              {/* Town — Centre needs a Town dropdown (filtered by regionName) */}
              {masterType === 'centre' && (
                <FormSection>
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Nagar</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={activeItem.townName ?? ''} readOnly />
                    ) : (
                      <FormSelect
                        ref={townRef}
                        value={activeItem.townName ?? ''}
                        onChange={e => { setActiveItem({ ...activeItem, townName: e.target.value }); setFieldErrors(prev => ({ ...prev, townName: false })); }}
                        disabled={!activeItem.regionName}
                        className={fieldErrors.townName ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                      >
                        <option value="">Select Nagar</option>
                        {formTownOptions.map(n => <option key={n} value={n}>{n}</option>)}
                      </FormSelect>
                    )}
                    <ErrorText>{fieldErrors.townName && 'Nagar is required.'}</ErrorText>
                  </FormField>
                </FormSection>
              )}

              {/* Name field */}
              <FormSection>
                <FormField>
                  <FormLabel required={modalMode !== 'view'}>{config.nameLabel}</FormLabel>
                  <FormInput
                    ref={nameRef}
                    value={activeItem.name ?? ''}
                    onChange={e => { setActiveItem({ ...activeItem, name: e.target.value }); setFieldErrors(prev => ({ ...prev, name: false })); }}
                    readOnly={modalMode === 'view'}
                    placeholder={`Enter ${config.title.toLowerCase()} name`}
                    className={fieldErrors.name ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                  />
                  <ErrorText>{fieldErrors.name && `${config.nameLabel} is required.`}</ErrorText>
                </FormField>
              </FormSection>

              {/* Contact Details (Activity Centre only) — Contact Name is picked from
                  an autocomplete of members holding Shakha Karyawaha Pramukh; phone
                  is shown from that selection and is never typed in directly. */}
              {masterType === 'centre' && (() => {
                const pramukh = getShakhaKaryawahaPramukh(activeItem.karyawahaPramukhId);
                return (
                <FormSection title="Contact Details">
                  <FormField>
                    <FormLabel>Contact Name</FormLabel>
                    {modalMode === 'view' ? (
                      <FormInput value={pramukh?.name ?? 'No Shakha Karyawaha Pramukh assigned'} readOnly />
                    ) : (
                      <PramukhAutocomplete
                        value={pramukh?.name ?? ''}
                        candidates={eligibleKaryawahaPramukhs}
                        onChange={(_, member) => setActiveItem({ ...activeItem, karyawahaPramukhId: member?.id })}
                      />
                    )}
                  </FormField>
                  <FormField>
                    <FormLabel>Phone</FormLabel>
                    <FormInput
                      value={pramukh?.phone ?? '—'}
                      readOnly
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>Email</FormLabel>
                    <FormInput
                      value={activeItem.contactEmail ?? ''}
                      onChange={e => setActiveItem({ ...activeItem, contactEmail: e.target.value })}
                      readOnly={modalMode === 'view'}
                      placeholder="e.g. centre@hss.org.uk"
                    />
                  </FormField>
                </FormSection>
                );
              })()}

              {/* Address Details (Activity Centre only) */}
              {masterType === 'centre' && (
                <FormSection title="Address Details">
                  <FormField>
                    <FormLabel required={modalMode !== 'view'}>Address Line 1</FormLabel>
                    <FormInput
                      ref={addressLine1Ref}
                      value={activeItem.addressLine1 ?? ''}
                      onChange={e => { setActiveItem({ ...activeItem, addressLine1: e.target.value }); setFieldErrors(prev => ({ ...prev, addressLine1: false })); }}
                      readOnly={modalMode === 'view'}
                      placeholder="Street address"
                      className={fieldErrors.addressLine1 ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : ''}
                    />
                    <ErrorText>{fieldErrors.addressLine1 && 'Address Line 1 is required.'}</ErrorText>
                  </FormField>
                  <FormField>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormInput
                      value={activeItem.addressLine2 ?? ''}
                      onChange={e => setActiveItem({ ...activeItem, addressLine2: e.target.value })}
                      readOnly={modalMode === 'view'}
                      placeholder="Area / district (optional)"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField>
                      <FormLabel>City</FormLabel>
                      <FormInput
                        value={activeItem.city ?? ''}
                        onChange={e => setActiveItem({ ...activeItem, city: e.target.value })}
                        readOnly={modalMode === 'view'}
                        placeholder="City"
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Post Code</FormLabel>
                      <FormInput
                        value={activeItem.postCode ?? ''}
                        onChange={e => setActiveItem({ ...activeItem, postCode: e.target.value })}
                        readOnly={modalMode === 'view'}
                        placeholder="e.g. BS1 4ST"
                      />
                    </FormField>
                  </div>
                </FormSection>
              )}

              {/* Additional Location (Activity Centre only) — for Shakhas that meet
                  at two different physical locations across the week; optional. */}
              {masterType === 'centre' && (
                <FormSection title="Additional Location (optional)">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-2 mb-1">
                    Only needed if this Shakha meets at a second physical location on a different day.
                  </p>
                  <FormField>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormInput
                      value={activeItem.address2Line1 ?? ''}
                      onChange={e => setActiveItem({ ...activeItem, address2Line1: e.target.value })}
                      readOnly={modalMode === 'view'}
                      placeholder="Street address (optional)"
                    />
                  </FormField>
                  <FormField>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormInput
                      value={activeItem.address2Line2 ?? ''}
                      onChange={e => setActiveItem({ ...activeItem, address2Line2: e.target.value })}
                      readOnly={modalMode === 'view'}
                      placeholder="Area / district (optional)"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField>
                      <FormLabel>City</FormLabel>
                      <FormInput
                        value={activeItem.address2City ?? ''}
                        onChange={e => setActiveItem({ ...activeItem, address2City: e.target.value })}
                        readOnly={modalMode === 'view'}
                        placeholder="City"
                      />
                    </FormField>
                    <FormField>
                      <FormLabel>Post Code</FormLabel>
                      <FormInput
                        value={activeItem.address2PostCode ?? ''}
                        onChange={e => setActiveItem({ ...activeItem, address2PostCode: e.target.value })}
                        readOnly={modalMode === 'view'}
                        placeholder="e.g. BS1 4ST"
                      />
                    </FormField>
                  </div>
                </FormSection>
              )}

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
                  onClick={() => { setModalMode(null); setActiveItem(null); setFieldErrors({}); }}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <PrimaryButton onClick={handleSaveItem}>
                    Save
                  </PrimaryButton>
                )}
              </div>
            </div>
          )}
        </FormModal>}

        {/* ══════════════════════════════════════════════════════════════════
            STATUS CONFIRMATION MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {masterType !== 'configurable-lists' && <FormModal
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
        </FormModal>}

        {/* ══════════════════════════════════════════════════════════════════
            DELETE CONFIRMATION MODAL
        ══════════════════════════════════════════════════════════════════ */}
        {masterType !== 'configurable-lists' && <FormModal
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
        </FormModal>}

      </div>
    </div>
  );
}
