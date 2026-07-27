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
  Activity,
  CalendarCheck2,
  Download,
  Image,
  SlidersHorizontal,
  Ticket,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { mockEvents, type Event } from '../../mockAPI/eventsData';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { formatDate } from '../../utils/formatDate';

const PRIMARY = '#f59e0b';

const STATUS_LABELS: Record<Event['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  active: 'Active',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const STATUS_COLORS: Record<Event['status'], string> = {
  draft: '#94a3b8',
  published: '#3b82f6',
  active: '#22c55e',
  cancelled: '#ef4444',
  completed: '#8b5cf6',
};

const PAYMENT_COLORS = {
  free: '#06b6d4',
  paid: '#f59e0b',
};

const RSVP_COLORS = {
  going: '#22c55e',
  maybe: '#f59e0b',
  notGoing: '#ef4444',
};

const CHART_PALETTE = [
  '#f59e0b',
  '#3b82f6',
  '#22c55e',
  '#8b5cf6',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#f97316',
];

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

function pct(value: number) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : '0%';
}

function shortName(value: string, max = 24) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: '2-digit',
  });
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

function ChartCard({
  title,
  subtitle,
  children,
  className = '',
}: {
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

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
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

export default function EventsReport() {
  const [filterCountry, setFilterCountry] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown, setFilterTown] = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const countryOptions = useMemo(() => Array.from(new Set(mockEvents.map(e => e.country))).sort(), []);
  const masterRegionOptions = useMemo(() => {
    const countries = filterCountry ? [filterCountry] : countryOptions;
    return Array.from(new Set(countries.flatMap(country => MASTERS_CASCADE.regions[country] ?? [])));
  }, [countryOptions, filterCountry]);
  const regionOptions = useMemo(
    () => masterRegionOptions,
    [masterRegionOptions],
  );
  const townOptions = useMemo(
    () => Array.from(new Set(mockEvents.filter(e => (!filterCountry || e.country === filterCountry) && (!filterRegion || e.region === filterRegion)).map(e => e.town))).sort(),
    [filterCountry, filterRegion],
  );
  const centreOptions = useMemo(
    () => Array.from(new Set(mockEvents.filter(e => (!filterCountry || e.country === filterCountry) && (!filterRegion || e.region === filterRegion) && (!filterTown || e.town === filterTown)).map(e => e.activityCentre))).sort(),
    [filterCountry, filterRegion, filterTown],
  );

  const hasFilter = !!(filterCountry || filterRegion || filterTown || filterCentre || filterStatus || filterPayment || filterPeriod !== 'all');

  const clearFilters = () => {
    setFilterCountry('');
    setFilterRegion('');
    setFilterTown('');
    setFilterCentre('');
    setFilterStatus('');
    setFilterPayment('');
    setFilterPeriod('all');
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const start30 = new Date(now.getTime() - 30 * 86400000);
    const start90 = new Date(now.getTime() - 90 * 86400000);
    const next90 = new Date(now.getTime() + 90 * 86400000);

    return mockEvents.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      if (filterCountry && event.country !== filterCountry) return false;
      if (filterRegion && event.region !== filterRegion) return false;
      if (filterTown && event.town !== filterTown) return false;
      if (filterCentre && event.activityCentre !== filterCentre) return false;
      if (filterStatus && event.status !== filterStatus) return false;
      if (filterPayment && event.paymentType !== filterPayment) return false;
      if (filterPeriod === 'upcoming' && start < now) return false;
      if (filterPeriod === 'past' && end >= now && event.status !== 'completed' && event.status !== 'cancelled') return false;
      if (filterPeriod === '30d' && start < start30) return false;
      if (filterPeriod === '90d' && start < start90) return false;
      if (filterPeriod === 'next90' && (start < now || start > next90)) return false;
      return true;
    });
  }, [filterCountry, filterRegion, filterTown, filterCentre, filterStatus, filterPayment, filterPeriod]);

  const totalEvents = filtered.length;
  const activePipeline = filtered.filter(e => e.status === 'published' || e.status === 'active').length;
  const totalResponses = filtered.reduce((sum, e) => sum + e.metrics.participantCount, 0);
  const totalGoing = filtered.reduce((sum, e) => sum + e.metrics.going, 0);
  const totalMaybe = filtered.reduce((sum, e) => sum + e.metrics.maybe, 0);
  const totalNotGoing = filtered.reduce((sum, e) => sum + e.metrics.notGoing, 0);
  const totalMedia = filtered.reduce((sum, e) => sum + e.metrics.mediaCount, 0);
  const totalCapacity = filtered.reduce((sum, e) => sum + (e.capacity ?? 0), 0);
  const totalGoingWithCapacity = filtered.reduce((sum, e) => sum + (e.capacity ? e.metrics.going : 0), 0);
  const totalRevenuePotential = filtered.reduce((sum, e) => sum + (e.paymentType === 'paid' ? e.metrics.going * (e.price ?? 0) : 0), 0);
  const fillRate = totalCapacity > 0 ? (totalGoingWithCapacity / totalCapacity) * 100 : 0;
  const responseRate = totalResponses > 0 ? (totalGoing / totalResponses) * 100 : 0;
  const cancelledRate = totalEvents > 0 ? (filtered.filter(e => e.status === 'cancelled').length / totalEvents) * 100 : 0;

  const statusData = useMemo(() => {
    const map: Record<Event['status'], number> = {
      draft: 0,
      published: 0,
      active: 0,
      cancelled: 0,
      completed: 0,
    };
    filtered.forEach(e => { map[e.status] += 1; });
    return Object.entries(map)
      .map(([key, value]) => ({ key: key as Event['status'], name: STATUS_LABELS[key as Event['status']], value }))
      .filter(item => item.value > 0);
  }, [filtered]);

  const rsvpData = useMemo(() => [
    { key: 'going', name: 'Going', value: totalGoing },
    { key: 'maybe', name: 'Maybe', value: totalMaybe },
    { key: 'notGoing', name: 'Not Going', value: totalNotGoing },
  ], [totalGoing, totalMaybe, totalNotGoing]);

  const paymentData = useMemo(() => {
    const free = filtered.filter(e => e.paymentType === 'free').length;
    const paid = filtered.filter(e => e.paymentType === 'paid').length;
    return [
      { key: 'free', name: 'Free', value: free },
      { key: 'paid', name: 'Paid', value: paid },
    ].filter(item => item.value > 0);
  }, [filtered]);

  const byRegion = useMemo(() => {
    const map: Record<string, { events: number; responses: number; going: number; goingWithCapacity: number; capacity: number; media: number }> = {};
    masterRegionOptions.forEach(region => {
      map[region] = { events: 0, responses: 0, going: 0, goingWithCapacity: 0, capacity: 0, media: 0 };
    });
    filtered.forEach(e => {
      if (!map[e.region]) map[e.region] = { events: 0, responses: 0, going: 0, goingWithCapacity: 0, capacity: 0, media: 0 };
      map[e.region].events += 1;
      map[e.region].responses += e.metrics.participantCount;
      map[e.region].going += e.metrics.going;
      map[e.region].goingWithCapacity += e.capacity ? e.metrics.going : 0;
      map[e.region].capacity += e.capacity ?? 0;
      map[e.region].media += e.metrics.mediaCount;
    });
    return Object.entries(map)
      .map(([region, values]) => ({
        region: shortName(region, 22),
        fullRegion: region,
        fillRate: values.capacity > 0 ? Math.round((values.goingWithCapacity / values.capacity) * 100) : 0,
        ...values,
      }))
      .sort((a, b) => masterRegionOptions.indexOf(a.fullRegion) - masterRegionOptions.indexOf(b.fullRegion));
  }, [filtered, masterRegionOptions]);

  const monthlyTrend = useMemo(() => {
    if (!filtered.length) return [];

    const keys = filtered.map(e => monthKey(e.startDate)).sort();
    const start = keys[0];
    const end = keys[keys.length - 1];
    const [startYear, startMonth] = start.split('-').map(Number);
    const [endYear, endMonth] = end.split('-').map(Number);
    const map: Record<string, { events: number; responses: number }> = {};

    for (let cursor = new Date(startYear, startMonth - 1, 1); cursor <= new Date(endYear, endMonth - 1, 1); cursor.setMonth(cursor.getMonth() + 1)) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      map[key] = { events: 0, responses: 0 };
    }

    filtered.forEach(e => {
      const key = monthKey(e.startDate);
      if (!map[key]) map[key] = { events: 0, responses: 0 };
      map[key].events += 1;
      map[key].responses += e.metrics.participantCount;
    });

    return Object.entries(map).map(([key, values]) => ({
      month: monthLabel(key),
      ...values,
    }));
  }, [filtered]);

  const capacityByRegion = useMemo(
    () => [...byRegion],
    [byRegion],
  );
  const regionActivityRanking = useMemo(
    () => [...byRegion].sort((a, b) => b.events - a.events || b.responses - a.responses),
    [byRegion],
  );
  const regionCapacityRanking = useMemo(
    () => byRegion.filter(r => r.capacity > 0).sort((a, b) => b.fillRate - a.fillRate),
    [byRegion],
  );

  const engagementByStatus = useMemo(() => {
    const map: Record<Event['status'], { responses: number; media: number }> = {
      draft: { responses: 0, media: 0 },
      published: { responses: 0, media: 0 },
      active: { responses: 0, media: 0 },
      cancelled: { responses: 0, media: 0 },
      completed: { responses: 0, media: 0 },
    };
    filtered.forEach(e => {
      map[e.status].responses += e.metrics.participantCount;
      map[e.status].media += e.metrics.mediaCount;
    });
    return Object.entries(map)
      .map(([key, values]) => ({ status: STATUS_LABELS[key as Event['status']], ...values }))
      .filter(item => item.responses > 0 || item.media > 0);
  }, [filtered]);

  const mostActiveRegion = regionActivityRanking[0]?.events ? regionActivityRanking[0].fullRegion : 'No event activity';
  const strongestFillRegion = regionCapacityRanking[0]?.fullRegion ?? 'No capacity data';
  const averageResponses = totalEvents > 0 ? Math.round(totalResponses / totalEvents) : 0;

  const handleExport = () => {
    const rows: string[][] = [
      ['Events Report - HSS'],
      [`Generated: ${formatDate(new Date())}`],
      [],
      ['SUMMARY KPIs'],
      ['Total Events', String(totalEvents)],
      ['Published / Active Events', String(activePipeline)],
      ['Total Responses', String(totalResponses)],
      ['Going Responses', String(totalGoing)],
      ['Average Fill Rate', pct(fillRate)],
      ['Media Posts', String(totalMedia)],
      ['Potential Paid Revenue', String(totalRevenuePotential)],
      [],
      ['STATUS BREAKDOWN'],
      ['Status', 'Events'],
      ...statusData.map(r => [r.name, String(r.value)]),
      [],
      ['RSVP MIX'],
      ['Response', 'Count'],
      ...rsvpData.map(r => [r.name, String(r.value)]),
      [],
      ['PAYMENT MIX'],
      ['Payment Type', 'Events'],
      ...paymentData.map(r => [r.name, String(r.value)]),
      [],
      ['EVENTS BY VIBHAG'],
      ['Vibhag', 'Events', 'Responses', 'Going', 'Capacity', 'Fill Rate', 'Media Posts'],
      ...byRegion.map(r => [r.fullRegion, String(r.events), String(r.responses), String(r.going), String(r.capacity), pct(r.fillRate), String(r.media)]),
      [],
      ['MONTHLY TREND'],
      ['Month', 'Events', 'Responses'],
      ...monthlyTrend.map(r => [r.month, String(r.events), String(r.responses)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSS_Events_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Events Report"
          subtitle="Aggregated event performance across RSVP response, capacity, payment mix and regional engagement"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Events Report', current: true },
          ]}
        >
          <PrimaryButton icon={Download} onClick={handleExport}>
            Export CSV
          </PrimaryButton>
        </PageHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />

          <select
            value={filterCountry}
            onChange={e => {
              setFilterCountry(e.target.value);
              setFilterRegion('');
              setFilterTown('');
              setFilterCentre('');
            }}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]"
          >
            <option value="">All Countries</option>
            {countryOptions.map(country => <option key={country} value={country}>{country}</option>)}
          </select>

          <select
            value={filterRegion}
            onChange={e => {
              setFilterRegion(e.target.value);
              setFilterTown('');
              setFilterCentre('');
            }}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
          >
            <option value="">All Regions</option>
            {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
          </select>

          <select
            value={filterTown}
            onChange={e => {
              setFilterTown(e.target.value);
              setFilterCentre('');
            }}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]"
          >
            <option value="">All Towns</option>
            {townOptions.map(town => <option key={town} value={town}>{town}</option>)}
          </select>

          <select
            value={filterCentre}
            onChange={e => setFilterCentre(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px]"
          >
            <option value="">All Centres</option>
            {centreOptions.map(centre => <option key={centre} value={centre}>{centre}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[135px]"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>

          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[120px]"
          >
            <option value="">All Payments</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[140px]"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past / Closed</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="next90">Next 90 Days</option>
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
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(totalEvents)}</strong> event{totalEvents !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 xl:grid-cols-5 gap-4">
          <KpiCard label="Total Events" value={totalEvents} icon={CalendarCheck2} color="bg-primary-500" />
          <KpiCard label="Published / Active" value={activePipeline} icon={Activity} color="bg-success-500" />
          <KpiCard label="Total Responses" value={totalResponses} icon={Users} color="bg-blue-500" sub={`${pct(responseRate)} confirmed going`} />
          <KpiCard label="Average Fill Rate" value={pct(fillRate)} icon={TrendingUp} color="bg-violet-500" sub={totalCapacity > 0 ? `${fmt(totalGoingWithCapacity)} of ${fmt(totalCapacity)} capacity` : 'Capacity not set'} />
          <KpiCard label="Media Posts" value={totalMedia} icon={Image} color="bg-cyan-500" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Most Active Region</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{mostActiveRegion}</p>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Strongest Fill Rate</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{strongestFillRegion}</p>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Avg Responses / Event</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{fmt(averageResponses)}</p>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Cancellation Rate</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{pct(cancelledRate)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Event Status Breakdown" subtitle="Event lifecycle mix for the selected scope">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusData.map(entry => <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map(d => (
                  <div key={d.key} className="flex items-center justify-between gap-3">
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

          <ChartCard title="RSVP Response Mix" subtitle="Aggregate response intent across filtered events">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={rsvpData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                    {rsvpData.map(entry => <Cell key={entry.key} fill={RSVP_COLORS[entry.key as keyof typeof RSVP_COLORS]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {rsvpData.map(d => (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: totalResponses > 0 ? `${Math.round((d.value / totalResponses) * 100)}%` : '0%', backgroundColor: RSVP_COLORS[d.key as keyof typeof RSVP_COLORS] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Payment Mix" subtitle="Free and paid events by count">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                    {paymentData.map(entry => <Cell key={entry.key} fill={PAYMENT_COLORS[entry.key as keyof typeof PAYMENT_COLORS]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {paymentData.map(d => (
                  <div key={d.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{d.name}</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{fmt(d.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: totalEvents > 0 ? `${Math.round((d.value / totalEvents) * 100)}%` : '0%', backgroundColor: PAYMENT_COLORS[d.key as keyof typeof PAYMENT_COLORS] }}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <Ticket className="w-3.5 h-3.5" />
                  Potential revenue: GBP {fmt(totalRevenuePotential)}
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Events by Region" subtitle="All configured regions, including regions with no matching events">
            <ResponsiveContainer width="100%" height={Math.max(240, byRegion.length * 42 + 60)}>
              <BarChart data={byRegion} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="events" name="Events" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="responses" name="Responses" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Capacity Utilisation by Region" subtitle="All configured regions, with zero shown where capacity is not configured">
            <ResponsiveContainer width="100%" height={Math.max(240, capacityByRegion.length * 42 + 60)}>
              <BarChart data={capacityByRegion} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="fillRate" name="Fill Rate %" radius={[0, 4, 4, 0]} barSize={22}>
                  {capacityByRegion.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Events Over Time" subtitle="Monthly event count and response volume">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="left" type="monotone" dataKey="events" name="Events" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }} />
                <Line yAxisId="right" type="monotone" dataKey="responses" name="Responses" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Engagement by Event Status" subtitle="Responses and media posts grouped by lifecycle status">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={engagementByStatus} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="responses" name="Responses" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="media" name="Media Posts" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
