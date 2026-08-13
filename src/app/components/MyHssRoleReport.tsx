// ─────────────────────────────────────────────────────────────
// HSS UK — MyHSS Role Report (members holding one or more MyHSS Roles)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, UserCheck, ShieldCheck,
  Download, SlidersHorizontal, X,
} from 'lucide-react';
import { PageHeader, PrimaryButton, useStickyListingHeader } from './hb/listing';
import { mockMembers, MASTERS_CASCADE } from '../../mockAPI/membersData';
import { ADMIN_ROLE_OPTIONS } from '../../mockAPI/rolesData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';
import { toast } from 'sonner';
import { formatDate } from '../../utils/formatDate';

// ── Colour palette ────────────────────────────────────────────

const COLORS = {
  male:   '#3b82f6',
  female: '#ec4899',
};

const CHART_PALETTE = [
  '#f59e0b', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6',
  '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#6366f1',
];

const NOT_SET = 'Not Set';

// ── Helpers ───────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString(); }

function rolesFor(m: { adminRole?: string; adminRoles?: string[] }): string[] {
  return m.adminRoles && m.adminRoles.length > 0 ? m.adminRoles : (m.adminRole ? [m.adminRole] : []);
}

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

export default function MyHssRoleReport() {
  // Data scope — restricted to the current admin's responsibility level,
  // same scoping mechanism used across Members/Sessions/Logs.
  const { scope } = useRoleScope();

  // ── Base dataset: active members holding one or more MyHSS Roles ────
  const roleHolders = useMemo(
    () => filterByScope(mockMembers, scope).filter(m => m.status === 'active' && rolesFor(m).length > 0),
    [scope],
  );

  // ── Filters ────────────────────────────────────────────────
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown,   setFilterTown]   = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterMyHssRole, setFilterMyHssRole] = useState('');

  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const regionOptions = scope.showRegionFilter ? (MASTERS_CASCADE.regions['HSS UK'] ?? []) : (scope.region ? [scope.region] : []);
  const townOptions    = scope.showTownFilter
    ? (filterRegion ? (MASTERS_CASCADE.towns[filterRegion] ?? []) : [])
    : (scope.town ? [scope.town] : []);
  const centreOptions  = scope.showCentreFilter
    ? (filterTown ? (MASTERS_CASCADE.centres[filterTown] ?? []) : [])
    : (scope.centre ? [scope.centre] : []);

  const hasFilter = !!(filterRegion || filterTown || filterCentre || filterGender || filterMyHssRole);

  const clearFilters = () => {
    setFilterRegion(''); setFilterTown(''); setFilterCentre('');
    setFilterGender(''); setFilterMyHssRole('');
  };

  // ── Filtered role holders ─────────────────────────────────────
  const filtered = useMemo(() => {
    return roleHolders.filter(m => {
      if (filterRegion && m.region !== filterRegion) return false;
      if (filterTown   && m.town !== filterTown) return false;
      if (filterCentre && m.activityCentre !== filterCentre) return false;
      if (filterGender && m.gender !== filterGender) return false;
      if (filterMyHssRole && !rolesFor(m).includes(filterMyHssRole)) return false;
      return true;
    });
  }, [roleHolders, filterRegion, filterTown, filterCentre, filterGender, filterMyHssRole]);

  // ── Aggregations ───────────────────────────────────────────

  const total = filtered.length;
  const maleCount   = filtered.filter(m => m.gender === 'male').length;
  const femaleCount = filtered.filter(m => m.gender === 'female').length;
  const multiRoleCount = filtered.filter(m => rolesFor(m).length > 1).length;

  // Gender donut
  const genderData = useMemo(() => ([
    { name: 'Male',   value: maleCount,   key: 'male' },
    { name: 'Female', value: femaleCount, key: 'female' },
  ]), [maleCount, femaleCount]);

  // MyHSS Role distribution
  const byRole = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { rolesFor(m).forEach(r => { map[r] = (map[r] ?? 0) + 1; }); });
    return Object.entries(map)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);
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
    if (filterRegion) filters.push(`Vibhag: ${filterRegion}`);
    if (filterTown)   filters.push(`Nagar: ${filterTown}`);
    if (filterCentre) filters.push(`Shakha: ${filterCentre}`);
    if (filterGender) filters.push(`Gender: ${filterGender}`);
    if (filterMyHssRole) filters.push(`MyHSS Role: ${filterMyHssRole}`);

    const rows: string[][] = [
      ['MyHSS Role Report — HSS UK'],
      [`Generated: ${formatDate(new Date())}`],
      filters.length ? [`Filters applied: ${filters.join(' | ')}`] : ['Filters applied: None (All role holders in scope)'],
      [],
      ['SUMMARY KPIs'],
      ['Total Members with a MyHSS Role', String(total)],
      ['Male',                           String(maleCount)],
      ['Female',                         String(femaleCount)],
      ['Holding More Than One Role',     String(multiRoleCount)],
      [],
      ['MEMBERS'],
      ['Member', 'Shakha', 'Nagar', 'Vibhag', 'Sangh Responsibility', 'MyHSS Role(s)'],
      ...filtered.map(m => [m.name, m.activityCentre, m.town, m.region, m.jobTitle || NOT_SET, rolesFor(m).join('; ')]),
    ];

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `HSS_MyHSS_Role_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported MyHSS Role Report — ${total} members`);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950 min-h-screen" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        {/* Page Header */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title="MyHSS Role Report"
          subtitle="Members holding one or more MyHSS Roles across Vibhags, Nagars and Shakhas"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'MyHSS Role Report', current: true },
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

          {/* MyHSS Role */}
          <select
            value={filterMyHssRole}
            onChange={e => setFilterMyHssRole(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[170px]"
          >
            <option value="">All MyHSS Roles</option>
            {ADMIN_ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
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
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total with a MyHSS Role" value={total}            icon={ShieldCheck} color="bg-primary-500" />
          <KpiCard label="Male"                    value={maleCount}       icon={UserCheck}   color="bg-info-500" sub={total > 0 ? `${Math.round(maleCount/total*100)}% of total` : undefined} />
          <KpiCard label="Female"                  value={femaleCount}     icon={UserCheck}   color="bg-pink-500" sub={total > 0 ? `${Math.round(femaleCount/total*100)}% of total` : undefined} />
          <KpiCard label="Holding Multiple Roles"  value={multiRoleCount}  icon={Users}       color="bg-success-500" />
        </div>

        {/* ── Row 1: MyHSS Role + Vibhag ────────────────────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="MyHSS Role Distribution" subtitle="Members per MyHSS Role (a member can hold more than one)">
            <ResponsiveContainer width="100%" height={Math.max(180, byRole.length * 32 + 40)}>
              <BarChart data={byRole} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="role" tick={{ fontSize: 9, fill: '#6b7280' }} width={150} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Members" radius={[0, 4, 4, 0]}>
                  {byRole.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Role Holders by Vibhag" subtitle="Distribution across regions">
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

        {/* ── Row 2: Gender ─────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Gender Distribution" subtitle="Male vs Female role holders">
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

      </div>
    </div>
  );
}
