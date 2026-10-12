import { useMemo, useState } from 'react';
import ReportDateFilter, { inDateRange } from './ReportDateFilter';
import { filterByScope } from '../../mockAPI/roleScope';
import { useReportLocationFilters } from './useReportLocationFilters';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarCheck2,
  ClipboardCheck,
  Download,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { getSessionShakhaType, mockSessions, SHAKHA_TYPES, type ShakhaSession } from '../../mockAPI/attendanceData';
import { AGE_GROUP_LABELS, MASTERS_CASCADE, type AgeGroup } from '../../mockAPI/membersData';
import { formatDate } from '../../utils/formatDate';

const PRIMARY = '#f59e0b';

const STATUS_LABELS: Record<ShakhaSession['status'], string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<ShakhaSession['status'], string> = {
  scheduled: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

const AGE_COLORS: Record<AgeGroup, string> = {
  bal: '#fde68a',
  shishu: '#fbbf24',
  kishor: '#f59e0b',
  tarun: '#d97706',
  yuva: '#b45309',
  jyestha: '#92400e',
};

const CHART_PALETTE = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#f97316'];

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

function pct(n: number) {
  return Number.isFinite(n) ? `${Math.round(n)}%` : '0%';
}

function shortName(value: string, max = 24) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function monthKey(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: '2-digit',
  });
}

function sessionAttendance(session: ShakhaSession) {
  const present = session.attendanceRecords.filter(r => r.status === 'present').length;
  const absent = session.attendanceRecords.filter(r => r.status === 'absent').length;
  const unmarked = session.attendanceRecords.filter(r => r.status === 'unmarked').length;
  const marked = present + absent;
  const rate = marked > 0 ? (present / marked) * 100 : 0;
  return { present, absent, unmarked, marked, rate };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-neutral-700 dark:text-neutral-200 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

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

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none break-words">
          {typeof value === 'number' ? fmt(value) : value}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{label}</p>
        {sub && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AttendanceReport() {
  const {
    scope,
    region: filterRegion, town: filterTown, centre: filterCentre,
    setRegion: setFilterRegion, setTown: setFilterTown, setCentre: setFilterCentre,
    regionOptions, townOptions, centreOptions,
    regionLocked, townLocked, centreLocked,
    regionDisabled, townDisabled, centreDisabled,
  } = useReportLocationFilters();
  const [filterShakhaType, setFilterShakhaType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [dateLabel, setDateLabel] = useState('');


  const hasFilter = !!((filterRegion && !regionLocked) || (filterTown && !townLocked) || (filterCentre && !centreLocked) || filterShakhaType || filterStatus || dateStart);

  const clearFilters = () => {
    setFilterRegion('');
    setFilterTown('');
    setFilterCentre('');
    setFilterShakhaType('');
    setFilterStatus('');
    setFilterPeriod('all');
    setCustomStart('');
    setCustomEnd('');
  };

  const filtered = useMemo(() => {
    return filterByScope(mockSessions, scope).filter(session => {
      const shakhaType = getSessionShakhaType(session);

      if (filterRegion && session.region !== filterRegion) return false;
      if (filterTown && session.town !== filterTown) return false;
      if (filterCentre && session.activityCentre !== filterCentre) return false;
      if (filterShakhaType && shakhaType !== filterShakhaType) return false;
      if (filterStatus && session.status !== filterStatus) return false;
      if (!inDateRange(session.date, dateStart, dateEnd)) return false;
      return true;
    });
  }, [scope, filterRegion, filterTown, filterCentre, filterShakhaType, filterStatus, dateStart, dateEnd]);

  const totalSessions = filtered.length;
  const completedSessions = filtered.filter(s => s.status === 'completed').length;
  const scheduledSessions = filtered.filter(s => s.status === 'scheduled').length;
  const activeSessions = scheduledSessions; // this app's UI shows the "scheduled" status as "Active"
  const cancelledSessions = filtered.filter(s => s.status === 'cancelled').length;
  const totalExpected = filtered.reduce((sum, s) => sum + s.totalExpected, 0);
  const totalPresent = filtered.reduce((sum, s) => sum + sessionAttendance(s).present, 0);
  const totalAbsent = filtered.reduce((sum, s) => sum + sessionAttendance(s).absent, 0);
  const totalUnmarked = filtered.reduce((sum, s) => sum + sessionAttendance(s).unmarked, 0);
  const totalMarked = totalPresent + totalAbsent;
  const attendanceRate = totalMarked > 0 ? (totalPresent / totalMarked) * 100 : 0;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  const statusData = useMemo(() => {
    const map: Record<ShakhaSession['status'], number> = { scheduled: 0, completed: 0, cancelled: 0 };
    filtered.forEach(s => { map[s.status] += 1; });
    return Object.entries(map)
      .map(([key, value]) => ({ key: key as ShakhaSession['status'], name: STATUS_LABELS[key as ShakhaSession['status']], value }))
      .filter(item => item.value > 0);
  }, [filtered]);

  const byRegion = useMemo(() => {
    const map: Record<string, { sessions: number; present: number; absent: number; expected: number }> = {};
    regionOptions.forEach(region => { map[region] = { sessions: 0, present: 0, absent: 0, expected: 0 }; });
    filtered.forEach(session => {
      if (!map[session.region]) map[session.region] = { sessions: 0, present: 0, absent: 0, expected: 0 };
      const summary = sessionAttendance(session);
      map[session.region].sessions += 1;
      map[session.region].present += summary.present;
      map[session.region].absent += summary.absent;
      map[session.region].expected += session.totalExpected;
    });
    return Object.entries(map).map(([region, values]) => ({
      region: shortName(region, 22),
      fullRegion: region,
      attendanceRate: values.present + values.absent > 0 ? Math.round((values.present / (values.present + values.absent)) * 100) : 0,
      avgPresent: values.sessions > 0 ? Math.round((values.present / values.sessions) * 10) / 10 : 0,
      ...values,
    }));
  }, [filtered, regionOptions]);

  // Average Sankhya chart drills down with the filters: all Vibhags -> Nagars in the
  // selected Vibhag -> Shakhas in the selected Nagar (a selected Shakha shows just that Shakha).
  const locationLevel = filterTown ? 'Shakha' : filterRegion ? 'Nagar' : 'Vibhag';
  const byLocation = useMemo(() => {
    // Only locations with recorded attendance are shown — a Vibhag/Nagar/Shakha whose sessions
    // have no Present/Absent marks yet (e.g. only scheduled sessions) is left out.
    const map: Record<string, { sessions: number; present: number; marked: number }> = {};
    filtered.forEach(session => {
      const key = filterTown ? session.activityCentre : filterRegion ? session.town : session.region;
      if (!map[key]) map[key] = { sessions: 0, present: 0, marked: 0 };
      const summary = sessionAttendance(session);
      map[key].sessions += 1;
      map[key].present += summary.present;
      map[key].marked += summary.present + summary.absent;
    });
    return Object.entries(map)
      .filter(([, v]) => v.marked > 0)
      .map(([name, v]) => ({
        region: shortName(name, 22),
        fullRegion: name,
        avgPresent: Math.round((v.present / v.sessions) * 10) / 10,
      }))
      .sort((x, y) => y.avgPresent - x.avgPresent);
  }, [filtered, filterRegion, filterTown]);

  const byCentre = useMemo(() => {
    const map: Record<string, { sessions: number; present: number; absent: number }> = {};
    filtered.forEach(session => {
      const centre = session.activityCentre.replace(' Activity Centre', '');
      if (!map[centre]) map[centre] = { sessions: 0, present: 0, absent: 0 };
      const summary = sessionAttendance(session);
      map[centre].sessions += 1;
      map[centre].present += summary.present;
      map[centre].absent += summary.absent;
    });
    return Object.entries(map)
      .map(([centre, values]) => ({
        centre: shortName(centre, 24),
        attendanceRate: values.present + values.absent > 0 ? Math.round((values.present / (values.present + values.absent)) * 100) : 0,
        ...values,
      }))
      .sort((a, b) => b.sessions - a.sessions || b.present - a.present)
      .slice(0, 12);
  }, [filtered]);

  const byShakhaType = useMemo(() => {
    const map: Record<string, { sessions: number; present: number; absent: number }> = {};
    SHAKHA_TYPES.forEach(type => { map[type] = { sessions: 0, present: 0, absent: 0 }; });
    filtered.forEach(session => {
      const type = getSessionShakhaType(session);
      if (!map[type]) map[type] = { sessions: 0, present: 0, absent: 0 };
      const summary = sessionAttendance(session);
      map[type].sessions += 1;
      map[type].present += summary.present;
      map[type].absent += summary.absent;
    });
    return Object.entries(map).map(([type, values]) => ({
      type,
      avgPresent: values.sessions > 0 ? Math.round((values.present / values.sessions) * 10) / 10 : 0,
      ...values,
    }));
  }, [filtered]);

  const byAgeGroup = useMemo(() => {
    const empty = () => ({ male: 0, female: 0 });
    const map: Record<AgeGroup, { male: number; female: number }> = {
      bal: empty(), shishu: empty(), kishor: empty(), tarun: empty(), yuva: empty(), jyestha: empty(),
    };
    filtered.forEach(session => {
      session.attendanceRecords.forEach(record => {
        if (record.status === 'present') map[record.ageCategory][record.gender] += 1;
      });
    });
    const denom = completedSessions > 0 ? completedSessions : 1;
    const avg = (n: number) => Math.round((n / denom) * 10) / 10;
    return (Object.entries(map) as [AgeGroup, { male: number; female: number }][]).map(([key, v]) => ({
      group: AGE_GROUP_LABELS[key],
      key,
      count: v.male + v.female,
      male: avg(v.male),
      female: avg(v.female),
    }));
  }, [filtered, completedSessions]);

  const genderData = useMemo(() => {
    let male = 0;
    let female = 0;
    filtered.forEach(session => {
      session.attendanceRecords.forEach(record => {
        if (record.status !== 'present') return;
        if (record.gender === 'male') male += 1;
        if (record.gender === 'female') female += 1;
      });
    });
    const denom = completedSessions > 0 ? completedSessions : 1;
    return [
      { name: 'Male', value: Math.round((male / denom) * 10) / 10, total: male, key: 'male' },
      { name: 'Female', value: Math.round((female / denom) * 10) / 10, total: female, key: 'female' },
    ];
  }, [filtered, completedSessions]);

  // Shakhas held in the filtered period with zero Present marks recorded
  const noPresentSessions = useMemo(() => {
    return [...filtered]
      .filter(s => sessionAttendance(s).present === 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filtered]);

  // Sankhya trend across the filtered Shakhas — same series as the Shakha
  // Admin dashboard's "Sankhya - Rolling 3 months" chart (Total/Average/Male/Female)
  const sankhyaTrendData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const raw = sorted.map(session => {
      const present = session.attendanceRecords.filter(r => r.status === 'present');
      return {
        date: formatDate(session.date),
        total: present.length,
        male: present.filter(r => r.gender === 'male').length,
        female: present.filter(r => r.gender === 'female').length,
      };
    });
    const avgTotal = raw.length ? Math.round(raw.reduce((sum, d) => sum + d.total, 0) / raw.length) : 0;
    return raw.map(d => ({ ...d, average: avgTotal }));
  }, [filtered]);

  // Kept for CSV export only — the visual chart now uses sankhyaTrendData above
  const monthlyTrend = useMemo(() => {
    const keys = filtered.map(s => monthKey(s.date)).sort();
    if (!keys.length) return [];
    const [startYear, startMonth] = keys[0].split('-').map(Number);
    const [endYear, endMonth] = keys[keys.length - 1].split('-').map(Number);
    const map: Record<string, { sessions: number; present: number; absent: number }> = {};
    for (let cursor = new Date(startYear, startMonth - 1, 1); cursor <= new Date(endYear, endMonth - 1, 1); cursor.setMonth(cursor.getMonth() + 1)) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      map[key] = { sessions: 0, present: 0, absent: 0 };
    }
    filtered.forEach(session => {
      const key = monthKey(session.date);
      const summary = sessionAttendance(session);
      map[key].sessions += 1;
      map[key].present += summary.present;
      map[key].absent += summary.absent;
    });
    return Object.entries(map).map(([key, values]) => ({
      month: monthLabel(key),
      attendanceRate: values.present + values.absent > 0 ? Math.round((values.present / (values.present + values.absent)) * 100) : 0,
      ...values,
    }));
  }, [filtered]);

  const strongestRegion = [...byRegion].sort((a, b) => b.attendanceRate - a.attendanceRate)[0];
  const busiestCentre = byCentre[0];
  const avgPresentPerSession = completedSessions > 0 ? Math.round(totalPresent / completedSessions) : 0;

  const handleExport = () => {
    const rows: string[][] = [
      ['Attendance Report - HSS UK'],
      [`Generated: ${formatDate(new Date())}`],
      [],
      ['SUMMARY KPIs'],
      ['Total Shakhas', String(totalSessions)],
      ['Completed Shakhas', String(completedSessions)],
      ['Scheduled Shakhas', String(scheduledSessions)],
      ['Cancelled Shakhas', String(cancelledSessions)],
      ['Attendance Rate', pct(attendanceRate)],
      ['Present Marks', String(totalPresent)],
      ['Absent Marks', String(totalAbsent)],
      ['Unmarked Records', String(totalUnmarked)],
      ['Total Expected', String(totalExpected)],
      [],
      ['SHAKHA STATUS'],
      ['Status', 'Shakhas'],
      ...statusData.map(r => [r.name, String(r.value)]),
      [],
      ['ATTENDANCE BY VIBHAG'],
      ['Vibhag', 'Shakhas', 'Present', 'Absent', 'Expected', 'Attendance Rate'],
      ...byRegion.map(r => [r.fullRegion, String(r.sessions), String(r.present), String(r.absent), String(r.expected), pct(r.attendanceRate)]),
      [],
      ['ATTENDANCE BY SHAKHA TYPE'],
      ['Shakha Type', 'Shakhas', 'Present', 'Absent'],
      ...byShakhaType.map(r => [r.type, String(r.sessions), String(r.present), String(r.absent)]),
      [],
      ['MONTHLY TREND'],
      ['Month', 'Shakhas', 'Present', 'Absent', 'Attendance Rate'],
      ...monthlyTrend.map(r => [r.month, String(r.sessions), String(r.present), String(r.absent), pct(r.attendanceRate)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSS_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Sankhya Report"
          subtitle="Aggregated Sankhya statistics across Shakha gatherings, centres, regions and Shakha types"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Sankhya Report', current: true },
          ]}
        >
          <PrimaryButton icon={Download} onClick={handleExport}>
            Export CSV
          </PrimaryButton>
        </PageHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />

          <select disabled={regionDisabled} value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }} className="disabled:opacity-50 disabled:cursor-not-allowed h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]">
            <option value="">All Vibhags</option>
            {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
          </select>

          <select disabled={townDisabled} value={filterTown} onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed">
            <option value="">All Nagars</option>
            {townOptions.map(town => <option key={town} value={town}>{town}</option>)}
          </select>

          <select disabled={centreDisabled} value={filterCentre} onChange={e => setFilterCentre(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed">
            <option value="">All Shakhas</option>
            {centreOptions.map(centre => <option key={centre} value={centre}>{centre}</option>)}
          </select>

          <select value={filterShakhaType} onChange={e => setFilterShakhaType(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[155px]">
            <option value="">All Shakha Types</option>
            {SHAKHA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[135px]">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>

          <ReportDateFilter
            start={dateStart}
            end={dateEnd}
            label={dateLabel}
            onChange={(s, e, l) => { setDateStart(s); setDateEnd(e); setDateLabel(l); }}
            title="Shakha Date Range"
            emptyLabel="Shakha Date"
          />

          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(totalSessions)}</strong> Shakha{totalSessions !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Total Shakhas" value={activeSessions} icon={CalendarCheck2} color="bg-primary-500" sub="Active Shakhas" />
          <KpiCard label="Completed Shakhas" value={completedSessions} icon={ClipboardCheck} color="bg-success-500" />
          <KpiCard label="Total Attendance" value={totalPresent} icon={TrendingUp} color="bg-blue-500" sub="Present marks in the selected period" />
          <KpiCard label="Avg Present / Shakha" value={avgPresentPerSession} icon={Users} color="bg-violet-500" />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title={`Average Sankhya by ${locationLevel}`}
            subtitle={
              locationLevel === 'Vibhag' ? 'Average Present count per Vibhag — Vibhags with no attendance data are not shown'
              : locationLevel === 'Nagar' ? `Average Present count per Nagar in ${filterRegion} — Nagars with no attendance data are not shown`
              : `Average Present count per Shakha in ${filterTown} — Shakhas with no attendance data are not shown`
            }
          >
            {byLocation.length === 0 ? (
              <p className="py-16 text-center text-sm text-neutral-400">No attendance data for the selected filters.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(260, byLocation.length * 42 + 60)}>
                <BarChart data={byLocation} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="avgPresent" name="Average Present" radius={[0, 4, 4, 0]} barSize={22}>
                    {byLocation.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Shakhas by Shakha Type" subtitle="Average Present count across the 5 Shakha types">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byShakhaType} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="avgPresent" name="Average Present" radius={[4, 4, 0, 0]}>
                  {byShakhaType.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Present by Gender" subtitle="Average Present count per Shakha, by gender">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="total">
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {genderData.map((d, i) => (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{d.value} avg</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: totalPresent > 0 ? `${Math.round((d.total / totalPresent) * 100)}%` : '0%', backgroundColor: i === 0 ? '#3b82f6' : '#ec4899' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Present by Age Group" subtitle="Average Present count per Shakha across HSS age groups, split by Male and Female">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byAgeGroup} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="male"   name="Male"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="female" name="Female" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6">
          <ChartCard title="The shakha with no sankhya recorded" subtitle="Shakhas held in the selected period with zero Present marks recorded">
            {noPresentSessions.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 py-6 text-center">
                Every Shakha in the selected period has at least one Present mark.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto slim-scroll">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-neutral-950">
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="py-2 pr-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Date</th>
                      <th className="py-2 pr-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Shakha</th>
                      <th className="py-2 pr-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Vibhag</th>
                      <th className="py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {noPresentSessions.map(session => (
                      <tr key={session.id}>
                        <td className="py-2 pr-4 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{formatDate(session.date)}</td>
                        <td className="py-2 pr-4 text-neutral-900 dark:text-white font-medium whitespace-nowrap">{session.activityCentre.replace(' Activity Centre', '')}</td>
                        <td className="py-2 pr-4 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{session.region}</td>
                        <td className="py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: STATUS_COLORS[session.status] }}>
                            <XCircle className="w-3.5 h-3.5" />
                            {STATUS_LABELS[session.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="mt-6">
          <ChartCard title="Sankhya Trend" subtitle="Shakhas in the selected period - total, average, male and female Sankhya">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={sankhyaTrendData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="total"   name="Sankhya" stroke="#172E4D" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="average" name="Average" stroke="#f59e0b" strokeWidth={2}   strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="male"    name="Male"    stroke="#3b82f6" strokeWidth={2}   dot={{ r: 3 }} />
                <Line type="monotone" dataKey="female"  name="Female"  stroke="#ec4899" strokeWidth={2}   dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
