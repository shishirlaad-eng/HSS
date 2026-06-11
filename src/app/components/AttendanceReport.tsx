import { useMemo, useState } from 'react';
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
  CheckCircle2,
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

const ATTENDANCE_COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  unmarked: '#94a3b8',
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
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown, setFilterTown] = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterShakhaType, setFilterShakhaType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const regionOptions = MASTERS_CASCADE.regions['HSS UK'] ?? [];
  const townOptions = filterRegion ? (MASTERS_CASCADE.towns[filterRegion] ?? []) : [];
  const centreOptions = filterTown ? (MASTERS_CASCADE.centres[filterTown] ?? []) : [];

  const hasFilter = !!(filterRegion || filterTown || filterCentre || filterShakhaType || filterStatus || filterPeriod !== 'all');

  const clearFilters = () => {
    setFilterRegion('');
    setFilterTown('');
    setFilterCentre('');
    setFilterShakhaType('');
    setFilterStatus('');
    setFilterPeriod('all');
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const start30 = new Date(now.getTime() - 30 * 86400000);
    const start90 = new Date(now.getTime() - 90 * 86400000);
    const startYear = new Date(now.getFullYear(), 0, 1);

    return mockSessions.filter(session => {
      const date = new Date(`${session.date}T12:00:00`);
      const shakhaType = getSessionShakhaType(session);

      if (filterRegion && session.region !== filterRegion) return false;
      if (filterTown && session.town !== filterTown) return false;
      if (filterCentre && session.activityCentre !== filterCentre) return false;
      if (filterShakhaType && shakhaType !== filterShakhaType) return false;
      if (filterStatus && session.status !== filterStatus) return false;
      if (filterPeriod === '30d' && date < start30) return false;
      if (filterPeriod === '90d' && date < start90) return false;
      if (filterPeriod === 'ytd' && date < startYear) return false;
      if (filterPeriod === 'scheduled' && session.status !== 'scheduled') return false;
      if (filterPeriod === 'completed' && session.status !== 'completed') return false;
      return true;
    });
  }, [filterRegion, filterTown, filterCentre, filterShakhaType, filterStatus, filterPeriod]);

  const totalSessions = filtered.length;
  const completedSessions = filtered.filter(s => s.status === 'completed').length;
  const scheduledSessions = filtered.filter(s => s.status === 'scheduled').length;
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

  const attendanceMix = useMemo(() => [
    { key: 'present', name: 'Present', value: totalPresent },
    { key: 'absent', name: 'Absent', value: totalAbsent },
    { key: 'unmarked', name: 'Unmarked', value: totalUnmarked },
  ], [totalPresent, totalAbsent, totalUnmarked]);

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
      ...values,
    }));
  }, [filtered, regionOptions]);

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
    return Object.entries(map).map(([type, values]) => ({ type, ...values }));
  }, [filtered]);

  const byAgeGroup = useMemo(() => {
    const map: Record<AgeGroup, number> = { bal: 0, shishu: 0, kishor: 0, tarun: 0, yuva: 0, jyestha: 0 };
    filtered.forEach(session => {
      session.attendanceRecords.forEach(record => {
        if (record.status === 'present') map[record.ageCategory] += 1;
      });
    });
    return (Object.entries(map) as [AgeGroup, number][]).map(([key, count]) => ({
      group: AGE_GROUP_LABELS[key],
      key,
      count,
    }));
  }, [filtered]);

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
    return [
      { name: 'Male', value: male, key: 'male' },
      { name: 'Female', value: female, key: 'female' },
    ];
  }, [filtered]);

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
      [`Generated: ${new Date().toLocaleDateString('en-GB')}`],
      [],
      ['SUMMARY KPIs'],
      ['Total Sessions', String(totalSessions)],
      ['Completed Sessions', String(completedSessions)],
      ['Scheduled Sessions', String(scheduledSessions)],
      ['Cancelled Sessions', String(cancelledSessions)],
      ['Attendance Rate', pct(attendanceRate)],
      ['Present Marks', String(totalPresent)],
      ['Absent Marks', String(totalAbsent)],
      ['Unmarked Records', String(totalUnmarked)],
      ['Total Expected', String(totalExpected)],
      [],
      ['SESSION STATUS'],
      ['Status', 'Sessions'],
      ...statusData.map(r => [r.name, String(r.value)]),
      [],
      ['ATTENDANCE BY VIBHAAG'],
      ['Vibhaag', 'Sessions', 'Present', 'Absent', 'Expected', 'Attendance Rate'],
      ...byRegion.map(r => [r.fullRegion, String(r.sessions), String(r.present), String(r.absent), String(r.expected), pct(r.attendanceRate)]),
      [],
      ['ATTENDANCE BY SHAKHA TYPE'],
      ['Shakha Type', 'Sessions', 'Present', 'Absent'],
      ...byShakhaType.map(r => [r.type, String(r.sessions), String(r.present), String(r.absent)]),
      [],
      ['MONTHLY TREND'],
      ['Month', 'Sessions', 'Present', 'Absent', 'Attendance Rate'],
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

          <select value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]">
            <option value="">All Regions</option>
            {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
          </select>

          <select value={filterTown} onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }} disabled={!filterRegion} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed">
            <option value="">All Towns</option>
            {townOptions.map(town => <option key={town} value={town}>{town}</option>)}
          </select>

          <select value={filterCentre} onChange={e => setFilterCentre(e.target.value)} disabled={!filterTown} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed">
            <option value="">All Centres</option>
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

          <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[140px]">
            <option value="all">All Dates</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="completed">Completed Only</option>
            <option value="scheduled">Scheduled Only</option>
          </select>

          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(totalSessions)}</strong> session{totalSessions !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 xl:grid-cols-5 gap-4">
          <KpiCard label="Total Sessions" value={totalSessions} icon={CalendarCheck2} color="bg-primary-500" />
          <KpiCard label="Completed Sessions" value={completedSessions} icon={ClipboardCheck} color="bg-success-500" sub={`${pct(completionRate)} completion rate`} />
          <KpiCard label="Attendance Rate" value={pct(attendanceRate)} icon={TrendingUp} color="bg-blue-500" sub={`${fmt(totalPresent)} present of ${fmt(totalMarked)} marked`} />
          <KpiCard label="Avg Present / Session" value={avgPresentPerSession} icon={Users} color="bg-violet-500" />
          <KpiCard label="Scheduled Sessions" value={scheduledSessions} icon={CheckCircle2} color="bg-cyan-500" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Strongest Region</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{strongestRegion?.attendanceRate ? `${strongestRegion.fullRegion} (${strongestRegion.attendanceRate}%)` : 'No attendance data'}</p>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Busiest Centre</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{busiestCentre ? `${busiestCentre.centre} (${fmt(busiestCentre.sessions)} sessions)` : 'No session data'}</p>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Unmarked Records</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{fmt(totalUnmarked)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Attendance Mix" subtitle="Present, absent and unmarked attendance records">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={attendanceMix} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {attendanceMix.map(entry => <Cell key={entry.key} fill={ATTENDANCE_COLORS[entry.key as keyof typeof ATTENDANCE_COLORS]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {attendanceMix.map(d => (
                  <div key={d.key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ATTENDANCE_COLORS[d.key as keyof typeof ATTENDANCE_COLORS] }} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Session Status" subtitle="Scheduled, completed and cancelled sessions">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusData.map(entry => <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map(d => (
                  <div key={d.key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[d.key] }} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Present by Gender" subtitle="Aggregate present marks by gender">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
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
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: totalPresent > 0 ? `${Math.round((d.value / totalPresent) * 100)}%` : '0%', backgroundColor: i === 0 ? '#3b82f6' : '#ec4899' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Attendance Rate by Region" subtitle="All configured UK regions, including regions with no attendance data">
            <ResponsiveContainer width="100%" height={Math.max(260, byRegion.length * 42 + 60)}>
              <BarChart data={byRegion} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="attendanceRate" name="Attendance Rate %" radius={[0, 4, 4, 0]} barSize={22}>
                  {byRegion.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sessions by Shakha Type" subtitle="Session count and attendance marks by Shakha type">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byShakhaType} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sessions" name="Sessions" fill={PRIMARY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Top Activity Centres" subtitle="Centres with the highest number of filtered sessions">
            <ResponsiveContainer width="100%" height={Math.max(260, byCentre.length * 42 + 60)}>
              <BarChart data={byCentre} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="centre" tick={{ fontSize: 10, fill: '#6b7280' }} width={135} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sessions" name="Sessions" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="present" name="Present" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Present by Age Group" subtitle="Aggregate present marks across HSS age groups">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byAgeGroup} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Present Marks" radius={[4, 4, 0, 0]}>
                  {byAgeGroup.map(entry => <Cell key={entry.key} fill={AGE_COLORS[entry.key]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6">
          <ChartCard title="Monthly Attendance Trend" subtitle="Sessions and attendance rate over time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#6b7280' }} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="sessions" name="Sessions" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }} />
                <Line yAxisId="right" type="monotone" dataKey="attendanceRate" name="Attendance Rate %" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
