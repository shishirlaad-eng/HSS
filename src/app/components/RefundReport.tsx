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
  CheckCircle2,
  Clock3,
  Download,
  PoundSterling,
  RefreshCcw,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { mockRefunds, type RefundReason, type RefundStatus } from '../../mockAPI/refundsData';

const PRIMARY = '#f59e0b';
const CHART_PALETTE = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#f97316'];

const STATUS_LABELS: Record<RefundStatus, string> = {
  requested: 'Requested',
  approved: 'Approved',
  processed: 'Processed',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<RefundStatus, string> = {
  requested: '#f59e0b',
  approved: '#3b82f6',
  processed: '#22c55e',
  rejected: '#ef4444',
};

const REASON_LABELS: Record<RefundReason, string> = {
  'event-cancelled': 'Event Cancelled',
  'duplicate-payment': 'Duplicate Payment',
  'unable-to-attend': 'Unable to Attend',
  'payment-error': 'Payment Error',
  other: 'Other',
};

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

function money(n: number) {
  return `GBP ${fmt(Math.round(n))}`;
}

function pct(n: number) {
  return Number.isFinite(n) ? `${Math.round(n)}%` : '0%';
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

export default function RefundReport() {
  const [filterCountry, setFilterCountry] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown, setFilterTown] = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const countryOptions = useMemo(() => Array.from(new Set(mockRefunds.map(r => r.country))).sort(), []);
  const regionOptions = useMemo(() => {
    const countries = filterCountry ? [filterCountry] : countryOptions;
    return Array.from(new Set(countries.flatMap(country => MASTERS_CASCADE.regions[country] ?? [])));
  }, [countryOptions, filterCountry]);
  const townOptions = useMemo(() => {
    const regions = filterRegion ? [filterRegion] : regionOptions;
    return Array.from(new Set(regions.flatMap(region => MASTERS_CASCADE.towns[region] ?? [])));
  }, [filterRegion, regionOptions]);
  const centreOptions = useMemo(() => {
    const towns = filterTown ? [filterTown] : townOptions;
    return Array.from(new Set(towns.flatMap(town => MASTERS_CASCADE.centres[town] ?? [])));
  }, [filterTown, townOptions]);

  const hasFilter = !!(filterCountry || filterRegion || filterTown || filterCentre || filterStatus || filterReason || filterPeriod !== 'all');

  const clearFilters = () => {
    setFilterCountry('');
    setFilterRegion('');
    setFilterTown('');
    setFilterCentre('');
    setFilterStatus('');
    setFilterReason('');
    setFilterPeriod('all');
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const start30 = new Date(now.getTime() - 30 * 86400000);
    const start90 = new Date(now.getTime() - 90 * 86400000);
    const startYear = new Date(now.getFullYear(), 0, 1);

    return mockRefunds.filter(refund => {
      const requested = new Date(refund.requestedDate);
      if (filterCountry && refund.country !== filterCountry) return false;
      if (filterRegion && refund.region !== filterRegion) return false;
      if (filterTown && refund.town !== filterTown) return false;
      if (filterCentre && refund.activityCentre !== filterCentre) return false;
      if (filterStatus && refund.status !== filterStatus) return false;
      if (filterReason && refund.reason !== filterReason) return false;
      if (filterPeriod === '30d' && requested < start30) return false;
      if (filterPeriod === '90d' && requested < start90) return false;
      if (filterPeriod === 'ytd' && requested < startYear) return false;
      return true;
    });
  }, [filterCountry, filterRegion, filterTown, filterCentre, filterStatus, filterReason, filterPeriod]);

  const totalRequests = filtered.length;
  const requestedAmount = filtered.reduce((sum, r) => sum + r.amount, 0);
  const processedAmount = filtered.filter(r => r.status === 'processed').reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = filtered.filter(r => r.status === 'requested' || r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);
  const rejectedAmount = filtered.filter(r => r.status === 'rejected').reduce((sum, r) => sum + r.amount, 0);
  const processedCount = filtered.filter(r => r.status === 'processed').length;
  const pendingCount = filtered.filter(r => r.status === 'requested' || r.status === 'approved').length;
  const approvalRate = totalRequests > 0 ? ((processedCount + filtered.filter(r => r.status === 'approved').length) / totalRequests) * 100 : 0;
  const averageRefund = totalRequests > 0 ? requestedAmount / totalRequests : 0;

  const statusData = useMemo(() => {
    const map: Record<RefundStatus, { count: number; amount: number }> = {
      requested: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      processed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
    };
    filtered.forEach(r => {
      map[r.status].count += 1;
      map[r.status].amount += r.amount;
    });
    return Object.entries(map)
      .map(([key, value]) => ({ key: key as RefundStatus, name: STATUS_LABELS[key as RefundStatus], ...value }))
      .filter(item => item.count > 0);
  }, [filtered]);


  const byEvent = useMemo(() => {
    const map: Record<string, { requests: number; amount: number }> = {};
    filtered.forEach(r => {
      if (!map[r.eventName]) map[r.eventName] = { requests: 0, amount: 0 };
      map[r.eventName].requests += 1;
      map[r.eventName].amount += r.amount;
    });
    return Object.entries(map)
      .map(([event, values]) => ({ event: shortName(event, 26), fullEvent: event, ...values }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const byRegion = useMemo(() => {
    const map: Record<string, { requests: number; amount: number }> = {};
    regionOptions.forEach(region => { map[region] = { requests: 0, amount: 0 }; });
    filtered.forEach(r => {
      if (!map[r.region]) map[r.region] = { requests: 0, amount: 0 };
      map[r.region].requests += 1;
      map[r.region].amount += r.amount;
    });
    return Object.entries(map).map(([region, values]) => ({
      region: shortName(region, 22),
      fullRegion: region,
      ...values,
    }));
  }, [filtered, regionOptions]);

  const requesterSummary = useMemo(() => {
    const map: Record<string, { requests: number; amount: number; processed: number; pending: number }> = {};
    filtered.forEach(r => {
      if (!map[r.requesterName]) map[r.requesterName] = { requests: 0, amount: 0, processed: 0, pending: 0 };
      map[r.requesterName].requests += 1;
      map[r.requesterName].amount += r.amount;
      if (r.status === 'processed') map[r.requesterName].processed += 1;
      if (r.status === 'requested' || r.status === 'approved') map[r.requesterName].pending += 1;
    });
    return Object.entries(map)
      .map(([requester, values]) => ({ requester, ...values }))
      .sort((a, b) => b.requests - a.requests || b.amount - a.amount)
      .slice(0, 8);
  }, [filtered]);

  const monthlyTrend = useMemo(() => {
    const keys = filtered.map(r => monthKey(r.requestedDate)).sort();
    if (!keys.length) return [];
    const [startYear, startMonth] = keys[0].split('-').map(Number);
    const [endYear, endMonth] = keys[keys.length - 1].split('-').map(Number);
    const map: Record<string, { requests: number; amount: number; processed: number }> = {};
    for (let cursor = new Date(startYear, startMonth - 1, 1); cursor <= new Date(endYear, endMonth - 1, 1); cursor.setMonth(cursor.getMonth() + 1)) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      map[key] = { requests: 0, amount: 0, processed: 0 };
    }
    filtered.forEach(r => {
      const key = monthKey(r.requestedDate);
      map[key].requests += 1;
      map[key].amount += r.amount;
      if (r.status === 'processed') map[key].processed += r.amount;
    });
    return Object.entries(map).map(([key, values]) => ({ month: monthLabel(key), ...values }));
  }, [filtered]);

  const topRequester = requesterSummary[0];
  const highestRefundEvent = byEvent[0];

  const handleExport = () => {
    const rows: string[][] = [
      ['Refund Report - HSS'],
      [`Generated: ${new Date().toLocaleDateString('en-GB')}`],
      [],
      ['SUMMARY KPIs'],
      ['Total Refund Requests', String(totalRequests)],
      ['Requested Amount', money(requestedAmount)],
      ['Processed Amount', money(processedAmount)],
      ['Pending Amount', money(pendingAmount)],
      ['Rejected Amount', money(rejectedAmount)],
      ['Approval Rate', pct(approvalRate)],
      ['Average Refund', money(averageRefund)],
      [],
      ['REFUND STATUS'],
      ['Status', 'Requests', 'Amount'],
      ...statusData.map(r => [r.name, String(r.count), money(r.amount)]),
      [],
      ['REFUNDS BY EVENT'],
      ['Event', 'Requests', 'Amount'],
      ...byEvent.map(r => [r.fullEvent, String(r.requests), money(r.amount)]),
      [],
      ['TOP REFUND REQUESTERS'],
      ['Requester', 'Requests', 'Amount', 'Processed', 'Pending'],
      ...requesterSummary.map(r => [r.requester, String(r.requests), money(r.amount), String(r.processed), String(r.pending)]),
      [],
      ['REFUNDS BY VIBHAAG'],
      ['Vibhaag', 'Requests', 'Amount'],
      ...byRegion.map(r => [r.fullRegion, String(r.requests), money(r.amount)]),
      [],
      ['MONTHLY TREND'],
      ['Month', 'Requests', 'Requested Amount', 'Processed Amount'],
      ...monthlyTrend.map(r => [r.month, String(r.requests), money(r.amount), money(r.processed)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSS_Refund_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Refund Report"
          subtitle="Aggregated refund statistics across statuses, reasons, paid events, regions and requester summaries"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Refund Report', current: true },
          ]}
        >
          <PrimaryButton icon={Download} onClick={handleExport}>Export CSV</PrimaryButton>
        </PageHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterRegion(''); setFilterTown(''); setFilterCentre(''); }} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]">
            <option value="">All Countries</option>
            {countryOptions.map(country => <option key={country} value={country}>{country}</option>)}
          </select>
          <select value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]">
            <option value="">All Regions</option>
            {regionOptions.map(region => <option key={region} value={region}>{region}</option>)}
          </select>
          <select value={filterTown} onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]">
            <option value="">All Towns</option>
            {townOptions.map(town => <option key={town} value={town}>{town}</option>)}
          </select>
          <select value={filterCentre} onChange={e => setFilterCentre(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px]">
            <option value="">All Centres</option>
            {centreOptions.map(centre => <option key={centre} value={centre}>{centre}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select value={filterReason} onChange={e => setFilterReason(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[155px]">
            <option value="">All Reasons</option>
            {Object.entries(REASON_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]">
            <option value="all">All Dates</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(totalRequests)}</strong> refund request{totalRequests !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 xl:grid-cols-5 gap-4">
          <KpiCard label="Requested Amount" value={money(requestedAmount)} icon={RefreshCcw} color="bg-primary-500" sub={`${fmt(totalRequests)} requests`} />
          <KpiCard label="Processed Amount" value={money(processedAmount)} icon={CheckCircle2} color="bg-success-500" sub={`${fmt(processedCount)} processed`} />
          <KpiCard label="Pending Amount" value={money(pendingAmount)} icon={Clock3} color="bg-warning-500" sub={`${fmt(pendingCount)} pending / approved`} />
          <KpiCard label="Rejected Amount" value={money(rejectedAmount)} icon={XCircle} color="bg-error-500" />
          <KpiCard label="Average Refund" value={money(averageRefund)} icon={PoundSterling} color="bg-blue-500" />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Top Refund Requester</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{topRequester ? `${topRequester.requester} (${fmt(topRequester.requests)} requests)` : 'No requests'}</p>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Highest Refund Event</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{highestRefundEvent ? `${highestRefundEvent.fullEvent} (${money(highestRefundEvent.amount)})` : 'No event data'}</p>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Approval / Processed Rate</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">{pct(approvalRate)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Refund Status" subtitle="Requests and amounts by current refund status">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count">
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
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">{fmt(d.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Refund Amount by Status" subtitle="Amount exposure by status">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
                  {statusData.map(entry => <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Refunds by Paid Event" subtitle="Refund request count and amount by event">
            <ResponsiveContainer width="100%" height={Math.max(260, byEvent.length * 42 + 60)}>
              <BarChart data={byEvent} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="event" tick={{ fontSize: 10, fill: '#6b7280' }} width={150} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="amount" name="Amount" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="requests" name="Requests" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Refund Requesters" subtitle="Member summary by refund request count and amount">
            <ResponsiveContainer width="100%" height={Math.max(260, requesterSummary.length * 42 + 60)}>
              <BarChart data={requesterSummary} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="requester" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="requests" name="Requests" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="amount" name="Amount" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Refunds by Region" subtitle="All configured regions for the selected country scope">
            <ResponsiveContainer width="100%" height={Math.max(260, byRegion.length * 42 + 60)}>
              <BarChart data={byRegion} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="requests" name="Requests" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="amount" name="Amount" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Refund Trend" subtitle="Refund requests, requested amount and processed amount over time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="requests" name="Requests" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="amount" name="Requested Amount" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="processed" name="Processed Amount" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center gap-3">
          <UserRound className="w-5 h-5 text-primary-500 flex-shrink-0" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Member summary is limited to requester name, aggregate request count and aggregate amount. Contact details and transaction-level member data are not shown.
          </p>
        </div>
      </div>
    </div>
  );
}
