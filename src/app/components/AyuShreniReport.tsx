// ─────────────────────────────────────────────────────────────
// HSS UK — Ayu Shreni Directory (all members by Age Group)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Users, UserCheck,
  Download, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { PageHeader, PrimaryButton, Pagination, useStickyListingHeader } from './hb/listing';
import {
  mockMembers, getAgeGroup, AGE_GROUP_LABELS, AgeGroup, MASTERS_CASCADE, type Member,
} from '../../mockAPI/membersData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';
import { toast } from 'sonner';
import { formatDate } from '../../utils/formatDate';

// ── Colour palette ────────────────────────────────────────────

const AGE_COLORS: Record<AgeGroup, string> = {
  bal:     '#fde68a',
  shishu:  '#fbbf24',
  kishor:  '#f59e0b',
  tarun:   '#d97706',
  yuva:    '#b45309',
  jyestha: '#92400e',
};

const CHART_PALETTE = [
  '#f59e0b', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6',
  '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#6366f1',
];

// ── Helpers ───────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString(); }

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-neutral-700 dark:text-neutral-200 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── Chart card wrapper ─────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">{fmt(Number(value))}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type SortField = 'firstName' | 'surname' | 'ageGroup' | 'town' | 'region';

// ── Main Component ────────────────────────────────────────────

export default function AyuShreniReport() {
  // Data scope — restricted to the current admin's responsibility level
  // (Vibhag Admin sees only their Vibhag, Nagar Admin only their Nagar, etc.),
  // same scoping mechanism used across Members/Sessions/Logs.
  const { scope } = useRoleScope();

  // ── Base dataset: all active members within scope ────────────
  const scopedMembers = useMemo(
    () => filterByScope(mockMembers, scope).filter(m => m.status === 'active'),
    [scope],
  );

  // ── Filters ────────────────────────────────────────────────
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown,   setFilterTown]   = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterGender, setFilterGender] = useState('');

  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const regionOptions = scope.showRegionFilter ? (MASTERS_CASCADE.regions['HSS UK'] ?? []) : (scope.region ? [scope.region] : []);
  const townOptions    = scope.showTownFilter
    ? (filterRegion ? (MASTERS_CASCADE.towns[filterRegion] ?? []) : [])
    : (scope.town ? [scope.town] : []);
  const centreOptions  = scope.showCentreFilter
    ? (filterTown ? (MASTERS_CASCADE.centres[filterTown] ?? []) : [])
    : (scope.centre ? [scope.centre] : []);

  const hasFilter = !!(filterAgeGroup || filterRegion || filterTown || filterCentre || filterGender);

  const clearFilters = () => {
    setFilterAgeGroup('');
    setFilterRegion(''); setFilterTown(''); setFilterCentre('');
    setFilterGender('');
  };

  // ── Filtered members ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return scopedMembers.filter(m => {
      if (filterAgeGroup && getAgeGroup(m.dateOfBirth) !== filterAgeGroup) return false;
      if (filterRegion && m.region !== filterRegion) return false;
      if (filterTown   && m.town !== filterTown) return false;
      if (filterCentre && m.activityCentre !== filterCentre) return false;
      if (filterGender && m.gender !== filterGender) return false;
      return true;
    });
  }, [scopedMembers, filterAgeGroup, filterRegion, filterTown, filterCentre, filterGender]);

  // ── Sorting + pagination for the member table ─────────────────
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };
  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-40" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />
      : <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />;
  };
  const sortValue = (m: Member, field: SortField) =>
    field === 'firstName' ? (m.firstName ?? m.name.split(' ')[0])
    : field === 'surname'   ? (m.surname ?? m.name.split(' ').slice(1).join(' '))
    : field === 'ageGroup'  ? AGE_GROUP_LABELS[getAgeGroup(m.dateOfBirth)]
    : field === 'town'      ? m.town
    : m.region;

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = sortValue(a, sortField).localeCompare(sortValue(b, sortField));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDirection]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const totalPages = itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginated = itemsPerPage === 0 ? sorted : sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Aggregations ───────────────────────────────────────────

  const total = filtered.length;
  const maleCount   = filtered.filter(m => m.gender === 'male').length;
  const femaleCount = filtered.filter(m => m.gender === 'female').length;

  // Age group distribution
  const byAgeGroup = useMemo(() => {
    const map: Record<AgeGroup, number> = { bal: 0, shishu: 0, kishor: 0, tarun: 0, yuva: 0, jyestha: 0 };
    filtered.forEach(m => { map[getAgeGroup(m.dateOfBirth)]++; });
    return (Object.entries(map) as [AgeGroup, number][])
      .map(([key, count]) => ({ group: AGE_GROUP_LABELS[key], key, count }));
  }, [filtered]);

  // By Vibhag (region)
  const byRegion = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { map[m.region] = (map[m.region] ?? 0) + 1; });
    return Object.entries(map)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // ── Export CSV ─────────────────────────────────────────────
  const handleExport = () => {
    if (total === 0) {
      toast.error('No data to export — adjust your filters and try again.');
      return;
    }

    const filters: string[] = [];
    if (filterAgeGroup) filters.push(`Age Group: ${AGE_GROUP_LABELS[filterAgeGroup as AgeGroup]}`);
    if (filterRegion) filters.push(`Vibhag: ${filterRegion}`);
    if (filterTown)   filters.push(`Nagar: ${filterTown}`);
    if (filterCentre) filters.push(`Shakha: ${filterCentre}`);
    if (filterGender) filters.push(`Gender: ${filterGender}`);

    const rows: string[][] = [
      ['Ayu Shreni Directory — HSS UK'],
      [`Generated: ${formatDate(new Date())}`],
      filters.length ? [`Filters applied: ${filters.join(' | ')}`] : ['Filters applied: None (All members in scope)'],
      [],
      ['SUMMARY KPIs'],
      ['Total Members', String(total)],
      ['Male',          String(maleCount)],
      ['Female',        String(femaleCount)],
      [],
      ['MEMBERS'],
      ['First Name', 'Last Name', 'Age Group', 'Nagar', 'Vibhag', 'Email', 'Contact Number'],
      ...sorted.map(m => [
        m.firstName ?? m.name.split(' ')[0],
        m.surname ?? m.name.split(' ').slice(1).join(' '),
        AGE_GROUP_LABELS[getAgeGroup(m.dateOfBirth)],
        m.town, m.region, m.email, m.phone ?? '',
      ]),
    ];

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `HSS_Ayu_Shreni_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported Ayu Shreni Directory — ${total} members`);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950 min-h-screen" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        {/* Page Header */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title="Ayu Shreni Directory"
          subtitle="All members by Age Group across Vibhags, Nagars and Shakhas"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Ayu Shreni Directory', current: true },
          ]}
        >
          <PrimaryButton icon={Download} onClick={handleExport}>
            Export CSV
          </PrimaryButton>
        </PageHeader>
        </div>

        {/* ── Filter Bar ──────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />

          {/* Age Group */}
          <select
            value={filterAgeGroup}
            onChange={e => setFilterAgeGroup(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[140px]"
          >
            <option value="">All Age Groups</option>
            {(Object.entries(AGE_GROUP_LABELS) as [AgeGroup, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Vibhag */}
          <select
            value={filterRegion}
            onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }}
            disabled={!scope.showRegionFilter && regionOptions.length <= 1}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Vibhags</option>
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Nagar */}
          <select
            value={filterTown}
            onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }}
            disabled={scope.showTownFilter ? !filterRegion : townOptions.length <= 1}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Nagars</option>
            {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Shakha */}
          <select
            value={filterCentre}
            onChange={e => setFilterCentre(e.target.value)}
            disabled={scope.showCentreFilter ? !filterTown : centreOptions.length <= 1}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Shakhas</option>
            {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Gender */}
          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[120px]"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {hasFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(total)}</strong> member{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── KPI Cards ────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Total Members" value={total}       icon={Users}     color="bg-primary-500" />
          <KpiCard label="Male"          value={maleCount}   icon={UserCheck} color="bg-info-500"  sub={total > 0 ? `${Math.round(maleCount/total*100)}% of total` : undefined} />
          <KpiCard label="Female"        value={femaleCount} icon={UserCheck} color="bg-pink-500"  sub={total > 0 ? `${Math.round(femaleCount/total*100)}% of total` : undefined} />
        </div>

        {/* ── Row: Age Group + Vibhag ────────────────────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="Age Group Distribution" subtitle="Members across HSS Ayu Shreni (age groups)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byAgeGroup} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Members" radius={[4, 4, 0, 0]}>
                  {byAgeGroup.map((entry, i) => (
                    <Cell key={i} fill={AGE_COLORS[entry.key as AgeGroup]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Members by Vibhag" subtitle="Distribution across regions">
            <ResponsiveContainer width="100%" height={Math.max(180, byRegion.length * 36 + 40)}>
              <BarChart data={byRegion} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={120} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Members" radius={[0, 4, 4, 0]}>
                  {byRegion.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Member Table ──────────────────────────────────── */}
        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-left text-xs text-neutral-600 dark:text-neutral-400">
                  <th onClick={() => handleSort('firstName')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">First Name{renderSortArrow('firstName')}</th>
                  <th onClick={() => handleSort('surname')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">Last Name{renderSortArrow('surname')}</th>
                  <th onClick={() => handleSort('ageGroup')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">Age Group{renderSortArrow('ageGroup')}</th>
                  <th onClick={() => handleSort('town')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">Nagar{renderSortArrow('town')}</th>
                  <th onClick={() => handleSort('region')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">Vibhag{renderSortArrow('region')}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-400 text-sm">No members match the selected filters.</td>
                  </tr>
                ) : paginated.map(m => (
                  <tr key={m.id} className="text-neutral-700 dark:text-neutral-300">
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.firstName ?? m.name.split(' ')[0]}</td>
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.surname ?? m.name.split(' ').slice(1).join(' ')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{AGE_GROUP_LABELS[getAgeGroup(m.dateOfBirth)]}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.town}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.region}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{m.phone ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={n => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        </div>

      </div>
    </div>
  );
}
