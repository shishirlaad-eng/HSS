// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HSS UK â€” Members Report (aggregated statistics, no member PII)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  Users, TrendingUp, CheckCircle2, AlertCircle,
  Download, SlidersHorizontal, X,
} from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { mockMembers, getAgeGroup, AGE_GROUP_LABELS, AgeGroup, MASTERS_CASCADE } from '../../mockAPI/membersData';
import { toast } from 'sonner';

// â”€â”€ Colour palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PRIMARY   = '#f59e0b';  // amber â€“ HSS brand
const COLORS = {
  active:                  '#22c55e',
  pending:                 '#f59e0b',
  'pending-parental-consent': '#a78bfa',
  inactive:                '#94a3b8',
  rejected:                '#ef4444',
  male:                    '#3b82f6',
  female:                  '#ec4899',
  completed:               '#22c55e',
  pendingComp:             '#f59e0b',
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
  '#f59e0b','#3b82f6','#22c55e','#ec4899','#8b5cf6',
  '#06b6d4','#ef4444','#84cc16','#f97316','#6366f1',
];

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_LABELS: Record<string, string> = {
  active:                     'Active',
  pending:                    'Pending Approval',
  'pending-parental-consent': 'Parental Consent',
  inactive:                   'Inactive',
  rejected:                   'Rejected',
};

function fmt(n: number) { return n.toLocaleString(); }

// Custom tooltip wrapper
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

// â”€â”€ Chart card wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ChartCard({ title, subtitle, children, className = '' }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// â”€â”€ KPI card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function MembersReport() {

  // â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [filterRegion,  setFilterRegion]  = useState('');
  const [filterTown,    setFilterTown]    = useState('');
  const [filterCentre,  setFilterCentre]  = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [filterGender,  setFilterGender]  = useState('');
  const [filterPeriod,  setFilterPeriod]  = useState('all');

  const regionOptions = MASTERS_CASCADE.regions['HSS UK'] ?? [];
  const townOptions   = filterRegion ? (MASTERS_CASCADE.towns[filterRegion]   ?? []) : [];
  const centreOptions = filterTown   ? (MASTERS_CASCADE.centres[filterTown]   ?? []) : [];

  const hasFilter = !!(filterRegion || filterTown || filterCentre || filterStatus || filterGender || filterPeriod !== 'all');

  const clearFilters = () => {
    setFilterRegion(''); setFilterTown(''); setFilterCentre('');
    setFilterStatus(''); setFilterGender(''); setFilterPeriod('all');
  };

  // â”€â”€ Filtered members â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = filterPeriod === '30d'  ? new Date(now.getTime() - 30  * 86400000)
                 : filterPeriod === '90d'  ? new Date(now.getTime() - 90  * 86400000)
                 : filterPeriod === '1y'   ? new Date(now.getTime() - 365 * 86400000)
                 : null;

    return mockMembers.filter(m => {
      if (filterRegion  && m.region         !== filterRegion)  return false;
      if (filterTown    && m.town           !== filterTown)    return false;
      if (filterCentre  && m.activityCentre !== filterCentre)  return false;
      if (filterStatus  && m.status         !== filterStatus)  return false;
      if (filterGender  && m.gender         !== filterGender)  return false;
      if (cutoff && new Date(m.registrationDate) < cutoff)     return false;
      return true;
    });
  }, [filterRegion, filterTown, filterCentre, filterStatus, filterGender, filterPeriod]);

  // â”€â”€ Aggregations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const totalMembers  = filtered.length;
  const activeCount   = filtered.filter(m => m.status === 'active').length;
  const pendingCount  = filtered.filter(m => m.status === 'pending' || m.status === 'pending-parental-consent').length;
  const compIssueCount = filtered.filter(m => m.compliance.dbs === 'Pending' || m.compliance.firstAid === 'Expired').length;

  // Status donut
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { map[m.status] = (map[m.status] ?? 0) + 1; });
    return Object.entries(map)
      .map(([key, value]) => ({ name: STATUS_LABELS[key] ?? key, value, key }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Members by Activity Centre with gender breakdown (top 12)
  const byCentre = useMemo(() => {
    const map: Record<string, { male: number; female: number }> = {};
    filtered.forEach(m => {
      const key = m.activityCentre.replace(' Activity Centre', '');
      if (!map[key]) map[key] = { male: 0, female: 0 };
      map[key][m.gender]++;
    });
    return Object.entries(map)
      .map(([centre, v]) => ({ centre, ...v, total: v.male + v.female }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [filtered]);

  // Age group distribution
  const byAgeGroup = useMemo(() => {
    const map: Record<AgeGroup, number> = { bal: 0, shishu: 0, kishor: 0, tarun: 0, yuva: 0, jyestha: 0 };
    filtered.forEach(m => { map[getAgeGroup(m.dateOfBirth)]++; });
    return (Object.entries(map) as [AgeGroup, number][])
      .map(([key, count]) => ({ group: AGE_GROUP_LABELS[key], key, count }));
  }, [filtered]);

  // Gender breakdown
  const genderData = useMemo(() => {
    const male   = filtered.filter(m => m.gender === 'male').length;
    const female = filtered.filter(m => m.gender === 'female').length;
    return [
      { name: 'Male',   value: male,   key: 'male' },
      { name: 'Female', value: female, key: 'female' },
    ];
  }, [filtered]);

  // Top role types
  const byRoleType = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(m => { if (m.jobTitle) map[m.jobTitle] = (map[m.jobTitle] ?? 0) + 1; });
    return Object.entries(map)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  // DBS compliance
  const dbsData = useMemo(() => {
    const completed = filtered.filter(m => m.compliance.dbs === 'Approved').length;
    const pending   = filtered.length - completed;
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending',   value: pending   },
    ];
  }, [filtered]);

  // First Aid compliance
  const firstAidData = useMemo(() => {
    const completed = filtered.filter(m => m.compliance.firstAid === 'Certified').length;
    const pending   = filtered.length - completed;
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending',   value: pending   },
    ];
  }, [filtered]);

  // Monthly registrations (last 18 months)
  const registrationTrend = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    // Pre-populate last 18 months
    for (let i = 17; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = 0;
    }
    filtered.forEach(m => {
      const d = new Date(m.registrationDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in map) map[key]++;
    });
    return Object.entries(map).map(([month, count]) => {
      const [y, mo] = month.split('-');
      const label = new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      return { month: label, count };
    });
  }, [filtered]);

  // â”€â”€ Export CSV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleExport = () => {
    if (totalMembers === 0) {
      toast.error('No data to export â€” adjust your filters and try again.');
      return;
    }

    const filters: string[] = [];
    if (filterRegion) filters.push(`Region: ${filterRegion}`);
    if (filterTown)   filters.push(`Town: ${filterTown}`);
    if (filterCentre) filters.push(`Centre: ${filterCentre}`);
    if (filterStatus) filters.push(`Status: ${filterStatus}`);
    if (filterGender) filters.push(`Gender: ${filterGender}`);
    if (filterPeriod !== 'all') filters.push(`Period: ${filterPeriod}`);

    const rows: string[][] = [
      ['Members Report â€” HSS UK'],
      [`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`],
      filters.length ? [`Filters applied: ${filters.join(' | ')}`] : ['Filters applied: None (All members)'],
      [],
      ['SUMMARY KPIs'],
      ['Total Members',     String(totalMembers)],
      ['Active',            String(activeCount)],
      ['Pending',           String(pendingCount)],
      ['Compliance Issues', String(compIssueCount)],
      [],
      ['STATUS BREAKDOWN'],
      ['Status', 'Count'],
      ...statusData.map(r => [r.name, String(r.value)]),
      [],
      ['AGE GROUP DISTRIBUTION'],
      ['Age Group', 'Count'],
      ...byAgeGroup.map(r => [r.group, String(r.count)]),
      [],
      ['GENDER BREAKDOWN'],
      ['Gender', 'Count'],
      ...genderData.map(r => [r.name, String(r.value)]),
      [],
      ['TOP ROLE TYPES'],
      ['Role', 'Count'],
      ...byRoleType.map(r => [r.role, String(r.count)]),
      [],
      ['DBS COMPLIANCE'],
      ['Status', 'Count'],
      ...dbsData.map(r => [r.name, String(r.value)]),
      [],
      ['FIRST AID COMPLIANCE'],
      ['Status', 'Count'],
      ...firstAidData.map(r => [r.name, String(r.value)]),
      ...(filterRegion ? [
        [],
        [`MEMBERS BY SHAKHA (${filterRegion})`],
        ['Shakha', 'Male', 'Female', 'Total'],
        ...byCentre.map(r => [r.centre, String(r.male), String(r.female), String(r.total)]),
      ] : []),
    ];

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `HSS_Members_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported Members Report â€” ${totalMembers} members`);
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">

        {/* Page Header */}
        <PageHeader
          title="Members Report"
          subtitle="Aggregated membership statistics across regions, demographics and compliance"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Members Report', current: true },
          ]}
        >
          <PrimaryButton icon={Download} onClick={handleExport}>
            Export CSV
          </PrimaryButton>
        </PageHeader>

        {/* â”€â”€ Filter Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />

          {/* Region */}
          <select
            value={filterRegion}
            onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
          >
            <option value="">All Regions</option>
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Town */}
          <select
            value={filterTown}
            onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }}
            disabled={!filterRegion}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Towns</option>
            {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Activity Centre */}
          <select
            value={filterCentre}
            onChange={e => setFilterCentre(e.target.value)}
            disabled={!filterTown}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Centres</option>
            {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="pending-parental-consent">Parental Consent</option>
            <option value="inactive">Inactive</option>
            <option value="rejected">Rejected</option>
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

          {/* Registration Period */}
          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
          >
            <option value="all">All Time</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last 12 Months</option>
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
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(totalMembers)}</strong> member{totalMembers !== 1 ? 's' : ''}
          </span>
        </div>

        {/* â”€â”€ KPI Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Members"       value={totalMembers}   icon={Users}         color="bg-primary-500" />
          <KpiCard label="Active Members"      value={activeCount}    icon={TrendingUp}    color="bg-success-500" sub={totalMembers > 0 ? `${Math.round(activeCount/totalMembers*100)}% of total` : undefined} />
          <KpiCard label="Pending Approval"    value={pendingCount}   icon={AlertCircle}   color="bg-warning-500" />
          <KpiCard label="Compliance Issues"   value={compIssueCount} icon={CheckCircle2}  color="bg-error-500"   sub="DBS or First Aid pending" />
        </div>

        {/* â”€â”€ Row 1: Status + Gender â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Status Donut */}
          <ChartCard title="Membership Status Breakdown" subtitle="Distribution of members by current status">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[entry.key as keyof typeof COLORS] ?? CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[d.key as keyof typeof COLORS] ?? CHART_PALETTE[i % CHART_PALETTE.length] }} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                      <span className="text-[10px] text-neutral-400">{totalMembers > 0 ? `${Math.round(d.value/totalMembers*100)}%` : '0%'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Gender Donut */}
          <ChartCard title="Gender Distribution" subtitle="Male vs Female membership split">
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
                        style={{ width: totalMembers > 0 ? `${Math.round(d.value/totalMembers*100)}%` : '0%', backgroundColor: COLORS[d.key as keyof typeof COLORS] }}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5 text-right">{totalMembers > 0 ? `${Math.round(d.value/totalMembers*100)}%` : '0%'}</p>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* â”€â”€ Row 2: Age Groups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6">
          <ChartCard title="Age Group Distribution" subtitle="Members across HSS age groups">
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
        </div>

        {/* â”€â”€ Row 3: By Activity Centre (only when a region is selected) â”€â”€ */}
        {filterRegion && (
          <div className="mt-6">
            <ChartCard
              title="Members by Activity Centre"
              subtitle={`Gender distribution per activity centre â€” ${filterRegion}`}
            >
              <ResponsiveContainer width="100%" height={Math.max(220, byCentre.length * 40 + 60)}>
                <BarChart data={byCentre} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="centre" tick={{ fontSize: 10, fill: '#6b7280' }} width={140} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="male"   name="Male"   stackId="a" fill={COLORS.male}   radius={[0, 0, 0, 0]} barSize={22} />
                  <Bar dataKey="female" name="Female" stackId="a" fill={COLORS.female} radius={[0, 4, 4, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* â”€â”€ Row 4: Role Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6">
          <ChartCard title="Top 10 Role Types" subtitle="Most common HSS roles across filtered members">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byRoleType} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="role" tick={{ fontSize: 9, fill: '#6b7280' }} width={150} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Members" radius={[0, 4, 4, 0]}>
                  {byRoleType.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* â”€â”€ Row 5: Compliance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* DBS */}
          <ChartCard title="DBS Compliance" subtitle="DBS check status across members">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={dbsData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    <Cell fill={COLORS.completed} />
                    <Cell fill={COLORS.pendingComp} />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {dbsData.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 0 ? COLORS.completed : COLORS.pendingComp }} />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: totalMembers > 0 ? `${Math.round(d.value/totalMembers*100)}%` : '0%', backgroundColor: i === 0 ? COLORS.completed : COLORS.pendingComp }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* First Aid */}
          <ChartCard title="First Aid Compliance" subtitle="First Aid certification status across members">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={firstAidData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    <Cell fill={COLORS.completed} />
                    <Cell fill={COLORS.pendingComp} />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {firstAidData.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 0 ? COLORS.completed : COLORS.pendingComp }} />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                      </div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: totalMembers > 0 ? `${Math.round(d.value/totalMembers*100)}%` : '0%', backgroundColor: i === 0 ? COLORS.completed : COLORS.pendingComp }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* â”€â”€ Row 6: Registrations Over Time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="mt-6">
          <ChartCard title="New Member Registrations" subtitle="Monthly registration trend over the last 18 months">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={registrationTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Registrations"
                  stroke={PRIMARY}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}

