// ─────────────────────────────────────────────────────────────
// HSS UK — Karyakarta Report (members holding a Sangh Responsibility)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Award, Users, Briefcase,
  Download, SlidersHorizontal, X,
} from 'lucide-react';
import { PageHeader, PrimaryButton, Pagination, useStickyListingHeader } from './hb/listing';
import {
  mockMembers, getAgeGroup, AGE_GROUP_LABELS, AgeGroup, MASTERS_CASCADE,
  RESPONSIBILITY_LEVEL_OPTIONS, RESPONSIBILITY_TYPE_OPTIONS,
} from '../../mockAPI/membersData';
import { toast } from 'sonner';
import { formatDate } from '../../utils/formatDate';

// Age-group membership labels are NOT sangh responsibilities — same exclusion
// list used by Dashboard's "Shakha Karyakartas" KPI.
const AGE_GROUP_ROLE_LABELS = new Set([
  'Bal(ika)', 'Shishu', 'Kishor(i)', 'Tarun(i)', 'Yuva(ti)', 'Jyestha(a)',
]);

// ── Colour palette ────────────────────────────────────────────

const PRIMARY = '#f59e0b';
const COLORS = {
  male:   '#3b82f6',
  female: '#ec4899',
};

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

const NOT_SET = 'Not Set';

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

function ChartCard({ title, subtitle, children, className = '' }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm ${className}`}>
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

// ── Main Component ────────────────────────────────────────────

export default function KaryakartaReport() {

  // ── Base dataset: members holding a Sangh Responsibility ────
  const karyakartas = useMemo(
    () => mockMembers.filter(m => m.status === 'active' && !AGE_GROUP_ROLE_LABELS.has(m.jobTitle)),
    [],
  );

  const responsibilityOptions = useMemo(
    () => Array.from(new Set(karyakartas.map(m => m.jobTitle))).sort(),
    [karyakartas],
  );

  // ── Filters ────────────────────────────────────────────────
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown,   setFilterTown]   = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('');
  const [filterRespLevel, setFilterRespLevel] = useState('');
  const [filterResponsibility, setFilterResponsibility] = useState('');
  const [filterRespType, setFilterRespType] = useState('');

  // ── List pagination ──────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const regionOptions = MASTERS_CASCADE.regions['HSS UK'] ?? [];
  const townOptions   = filterRegion ? (MASTERS_CASCADE.towns[filterRegion] ?? []) : [];
  const centreOptions = filterTown   ? (MASTERS_CASCADE.centres[filterTown] ?? []) : [];

  const hasFilter = !!(filterRegion || filterTown || filterCentre || filterGender || filterAgeGroup
    || filterRespLevel || filterResponsibility || filterRespType);

  const clearFilters = () => {
    setFilterRegion(''); setFilterTown(''); setFilterCentre('');
    setFilterGender(''); setFilterAgeGroup('');
    setFilterRespLevel(''); setFilterResponsibility(''); setFilterRespType('');
  };

  // ── Filtered karyakartas ─────────────────────────────────────
  const filtered = useMemo(() => {
    return karyakartas.filter(m => {
      if (filterRegion && m.region !== filterRegion) return false;
      if (filterTown   && m.town !== filterTown) return false;
      if (filterCentre && m.activityCentre !== filterCentre) return false;
      if (filterGender && m.gender !== filterGender) return false;
      if (filterAgeGroup && getAgeGroup(m.dateOfBirth) !== filterAgeGroup) return false;
      if (filterRespLevel && (m.responsibilityLevel ?? NOT_SET) !== filterRespLevel) return false;
      if (filterResponsibility && m.jobTitle !== filterResponsibility) return false;
      if (filterRespType && (m.responsibilityType ?? NOT_SET) !== filterRespType) return false;
      return true;
    });
  }, [karyakartas, filterRegion, filterTown, filterCentre, filterGender, filterAgeGroup, filterRespLevel, filterResponsibility, filterRespType]);

  // Reset to page 1 whenever the filtered set changes
  useEffect(() => { setCurrentPage(1); }, [filtered]);

  const totalPages = itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    if (itemsPerPage === 0) return filtered;
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // ── Aggregations ───────────────────────────────────────────

  const total = filtered.length;
  const maleCount   = filtered.filter(m => m.gender === 'male').length;
  const femaleCount = filtered.filter(m => m.gender === 'female').length;
  const withFormalResponsibility = filtered.filter(m => m.responsibilityType && m.responsibilityLevel).length;

  // Gender donut
  const genderData = useMemo(() => ([
    { name: 'Male',   value: maleCount,   key: 'male' },
    { name: 'Female', value: femaleCount, key: 'female' },
  ]), [maleCount, femaleCount]);

  // By Vibhag (region)
  const byRegion = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { map[m.region] = (map[m.region] ?? 0) + 1; });
    return Object.entries(map)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Age group distribution
  const byAgeGroup = useMemo(() => {
    const map: Record<AgeGroup, number> = { bal: 0, shishu: 0, kishor: 0, tarun: 0, yuva: 0, jyestha: 0 };
    filtered.forEach(m => { map[getAgeGroup(m.dateOfBirth)]++; });
    return (Object.entries(map) as [AgeGroup, number][])
      .map(([key, count]) => ({ group: AGE_GROUP_LABELS[key], key, count }));
  }, [filtered]);

  // Responsibility Type distribution
  const byRespType = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => {
      const key = m.responsibilityType ?? NOT_SET;
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Responsibility Level distribution
  const byRespLevel = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => {
      const key = m.responsibilityLevel ?? NOT_SET;
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Top Responsibilities (jobTitle)
  const byResponsibility = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { map[m.jobTitle] = (map[m.jobTitle] ?? 0) + 1; });
    return Object.entries(map)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  // ── Export CSV ─────────────────────────────────────────────
  const handleExport = () => {
    if (total === 0) {
      toast.error('No data to export — adjust your filters and try again.');
      return;
    }

    const filters: string[] = [];
    if (filterRegion) filters.push(`Vibhag: ${filterRegion}`);
    if (filterTown)   filters.push(`Nagar: ${filterTown}`);
    if (filterCentre) filters.push(`Shakha: ${filterCentre}`);
    if (filterGender) filters.push(`Gender: ${filterGender}`);
    if (filterAgeGroup) filters.push(`Age Group: ${AGE_GROUP_LABELS[filterAgeGroup as AgeGroup]}`);
    if (filterRespLevel) filters.push(`Responsibility Level: ${filterRespLevel}`);
    if (filterResponsibility) filters.push(`Responsibility: ${filterResponsibility}`);
    if (filterRespType) filters.push(`Responsibility Type: ${filterRespType}`);

    const rows: string[][] = [
      ['Karyakarta Report — HSS UK'],
      [`Generated: ${formatDate(new Date())}`],
      filters.length ? [`Filters applied: ${filters.join(' | ')}`] : ['Filters applied: None (All karyakartas)'],
      [],
      ['SUMMARY KPIs'],
      ['Total Karyakartas',          String(total)],
      ['Male',                       String(maleCount)],
      ['Female',                     String(femaleCount)],
      ['With Formal Responsibility', String(withFormalResponsibility)],
      [],
      ['KARYAKARTAS'],
      ['First Name', 'Last Name', 'Vibhag', 'Nagar', 'Shakha', 'Responsibility', 'Email', 'Contact Number'],
      ...filtered.map(m => [m.firstName ?? m.name.split(' ')[0], m.surname ?? m.name.split(' ').slice(1).join(' '), m.region, m.town, m.activityCentre, m.jobTitle, m.email, m.phone ?? '']),
    ];

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `HSS_Karyakarta_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported Karyakarta Report — ${total} karyakartas`);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950 min-h-screen" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        {/* Page Header */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title="Karyakarta Report"
          subtitle="Members holding a Sangh Responsibility across Vibhags, Nagars and Shakhas"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Karyakarta Report', current: true },
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

          {/* Vibhag */}
          <select
            value={filterRegion}
            onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
          >
            <option value="">All Vibhags</option>
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Nagar */}
          <select
            value={filterTown}
            onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }}
            disabled={!filterRegion}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Nagars</option>
            {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Shakha */}
          <select
            value={filterCentre}
            onChange={e => setFilterCentre(e.target.value)}
            disabled={!filterTown}
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

          {/* Responsibility Level */}
          <select
            value={filterRespLevel}
            onChange={e => setFilterRespLevel(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[180px]"
          >
            <option value="">All Responsibility Levels</option>
            {RESPONSIBILITY_LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            <option value={NOT_SET}>{NOT_SET}</option>
          </select>

          {/* Responsibility */}
          <select
            value={filterResponsibility}
            onChange={e => setFilterResponsibility(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px]"
          >
            <option value="">All Responsibilities</option>
            {responsibilityOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Responsibility Type */}
          <select
            value={filterRespType}
            onChange={e => setFilterRespType(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[180px]"
          >
            <option value="">All Responsibility Types</option>
            {RESPONSIBILITY_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            <option value={NOT_SET}>{NOT_SET}</option>
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
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(total)}</strong> karyakarta{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── KPI Cards ────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Karyakartas"          value={total}        icon={Users}    color="bg-primary-500" />
          <KpiCard label="Male"                       value={maleCount}    icon={Award}    color="bg-info-500" sub={total > 0 ? `${Math.round(maleCount/total*100)}% of total` : undefined} />
          <KpiCard label="Female"                     value={femaleCount}  icon={Award}    color="bg-pink-500"  sub={total > 0 ? `${Math.round(femaleCount/total*100)}% of total` : undefined} />
          <KpiCard label="With Formal Responsibility" value={withFormalResponsibility} icon={Briefcase} color="bg-success-500" sub="Responsibility type & level set" />
        </div>

        {/* ── Row 1: Vibhag + Gender ──────────────────────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* By Vibhag */}
          <ChartCard title="Karyakartas by Vibhag" subtitle="Distribution across regions">
            <ResponsiveContainer width="100%" height={Math.max(180, byRegion.length * 36 + 40)}>
              <BarChart data={byRegion} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={120} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Karyakartas" radius={[0, 4, 4, 0]}>
                  {byRegion.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Gender Donut */}
          <ChartCard title="Gender Distribution" subtitle="Male vs Female karyakartas">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {genderData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[entry.key as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {genderData.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.key as keyof typeof COLORS] }} />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: total > 0 ? `${Math.round(d.value/total*100)}%` : '0%', backgroundColor: COLORS[d.key as keyof typeof COLORS] }}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 text-right">{total > 0 ? `${Math.round(d.value/total*100)}%` : '0%'}</p>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* ── Row 2: Age Group + Responsibility Type ───────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="Age Group Distribution" subtitle="Karyakartas across HSS age groups">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byAgeGroup} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Karyakartas" radius={[4, 4, 0, 0]}>
                  {byAgeGroup.map((entry, i) => (
                    <Cell key={i} fill={AGE_COLORS[entry.key as AgeGroup]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Responsibility Type" subtitle="Pramukh / Pramukh (Saha) / Toli breakdown">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={byRespType} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {byRespType.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {byRespType.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                      <span className="text-[10px] text-neutral-400">{total > 0 ? `${Math.round(d.value/total*100)}%` : '0%'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* ── Row 3: Responsibility Level + Top Responsibilities ── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="Responsibility Level" subtitle="Kendriya / Vibhag / Nagar / Shakha breakdown">
            <ResponsiveContainer width="100%" height={Math.max(180, byRespLevel.length * 36 + 40)}>
              <BarChart data={byRespLevel} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="level" tick={{ fontSize: 9, fill: '#6b7280' }} width={150} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Karyakartas" radius={[0, 4, 4, 0]}>
                  {byRespLevel.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Responsibilities" subtitle="Most common roles across filtered karyakartas">
            <ResponsiveContainer width="100%" height={Math.max(180, byResponsibility.length * 28 + 40)}>
              <BarChart data={byResponsibility} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="role" tick={{ fontSize: 9, fill: '#6b7280' }} width={150} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Karyakartas" radius={[0, 4, 4, 0]}>
                  {byResponsibility.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Row 4: Karyakarta List ────────────────────────── */}
        <div className="mt-6">
          <ChartCard title="Karyakarta List" subtitle="Members holding a Sangh Responsibility matching the current filters">
            <div className="sticky-table-scroll slim-scroll">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-xs text-neutral-500 dark:text-neutral-400">
                    <th className="py-2 pr-4 font-medium">First Name</th>
                    <th className="py-2 pr-4 font-medium">Last Name</th>
                    <th className="py-2 pr-4 font-medium">Vibhag</th>
                    <th className="py-2 pr-4 font-medium">Nagar</th>
                    <th className="py-2 pr-4 font-medium">Shakha</th>
                    <th className="py-2 pr-4 font-medium">Responsibility</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Contact Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-neutral-400 text-sm">No karyakartas match the selected filters.</td>
                    </tr>
                  ) : paginated.map(m => (
                    <tr key={m.id} className="text-neutral-700 dark:text-neutral-300">
                      <td className="py-2 pr-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.firstName ?? m.name.split(' ')[0]}</td>
                      <td className="py-2 pr-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.surname ?? m.name.split(' ').slice(1).join(' ')}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{m.region}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{m.town}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{m.activityCentre}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{m.jobTitle}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{m.email}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{m.phone ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </ChartCard>
        </div>

      </div>
    </div>
  );
}
