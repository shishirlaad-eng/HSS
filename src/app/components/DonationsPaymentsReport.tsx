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
  Banknote,
  CreditCard,
  Download,
  Gift,
  HandCoins,
  PoundSterling,
  ReceiptText,
  SlidersHorizontal,
  Ticket,
  TrendingUp,
  X,
} from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { mockEvents } from '../../mockAPI/eventsData';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { mockDonations, type DonationChannel, type DonationStatus } from '../../mockAPI/donationsData';

const PRIMARY = '#f59e0b';
const CHART_PALETTE = ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#f97316'];

const DONATION_STATUS_LABELS: Record<string, string> = {
  received: 'Received',
  failed:   'Failed',
  refunded: 'Refunded',
};

const DONATION_STATUS_COLORS: Record<string, string> = {
  received: '#22c55e',
  failed:   '#ef4444',
  refunded: '#8b5cf6',
};

const CHANNEL_LABELS: Record<DonationChannel, string> = {
  online: 'Online',
  'bank-transfer': 'Bank Transfer',
  cash: 'Cash',
  cheque: 'Cheque',
};

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

function money(n: number) {
  return `GBP ${fmt(Math.round(n))}`;
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

function shortName(value: string, max = 24) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
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

export default function DonationsPaymentsReport() {
  const [filterCountry, setFilterCountry] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown, setFilterTown] = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterDonationStatus, setFilterDonationStatus] = useState('');

  const countryOptions = useMemo(() => {
    return Array.from(new Set([...mockEvents.map(e => e.country), ...mockDonations.map(d => d.country)])).sort();
  }, []);
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
  const hasFilter = !!(filterCountry || filterRegion || filterTown || filterCentre || filterPeriod !== 'all' || filterDonationStatus);

  const clearFilters = () => {
    setFilterCountry('');
    setFilterRegion('');
    setFilterTown('');
    setFilterCentre('');
    setFilterPeriod('all');
    setFilterDonationStatus('');
  };

  const dateInPeriod = (date: string) => {
    if (filterPeriod === 'all') return true;
    const now = new Date();
    const value = new Date(date);
    const start30 = new Date(now.getTime() - 30 * 86400000);
    const start90 = new Date(now.getTime() - 90 * 86400000);
    const startYear = new Date(now.getFullYear(), 0, 1);
    if (filterPeriod === '30d') return value >= start30;
    if (filterPeriod === '90d') return value >= start90;
    if (filterPeriod === 'ytd') return value >= startYear;
    return true;
  };

  const paidEvents = useMemo(() => {
    return mockEvents.filter(event => {
      if (event.paymentType !== 'paid') return false;
      if (filterCountry && event.country !== filterCountry) return false;
      if (filterRegion && event.region !== filterRegion) return false;
      if (filterTown && event.town !== filterTown) return false;
      if (filterCentre && event.activityCentre !== filterCentre) return false;
      if (!dateInPeriod(event.startDate)) return false;
      return true;
    });
  }, [filterCountry, filterRegion, filterTown, filterCentre, filterPeriod]);

  const filteredDonations = useMemo(() => {
    return mockDonations.filter(donation => {
      if (filterCountry && donation.country !== filterCountry) return false;
      if (filterRegion && donation.region !== filterRegion) return false;
      if (filterTown && donation.town !== filterTown) return false;
      if (filterCentre && donation.activityCentre !== filterCentre) return false;
      if (filterDonationStatus && donation.status !== filterDonationStatus) return false;
      if (!dateInPeriod(donation.date)) return false;
      return true;
    });
  }, [filterCountry, filterRegion, filterTown, filterCentre, filterPeriod, filterDonationStatus]);

  const eventPaymentRevenue = paidEvents.reduce((sum, e) => sum + e.metrics.going * (e.price ?? 0), 0);
  const eventPaymentBookings = paidEvents.reduce((sum, e) => sum + e.metrics.going, 0);
  const donationReceived = filteredDonations.filter(d => d.status === 'received').reduce((sum, d) => sum + d.amount, 0);
  const donationPledged = filteredDonations.filter(d => d.status === 'pledged').reduce((sum, d) => sum + d.amount, 0);
  const donationRefunded = filteredDonations.filter(d => d.status === 'refunded').reduce((sum, d) => sum + d.amount, 0);
  const combinedReceived = eventPaymentRevenue + donationReceived;
  const averageDonation = filteredDonations.filter(d => d.status === 'received').length > 0
    ? donationReceived / filteredDonations.filter(d => d.status === 'received').length
    : 0;

  const streamData = useMemo(() => [
    { name: 'Event Payments', value: eventPaymentRevenue, key: 'payments' },
    { name: 'Donations', value: donationReceived, key: 'donations' },
  ], [eventPaymentRevenue, donationReceived]);

  const donationStatusData = useMemo(() => {
    const map: Record<string, number> = { received: 0, failed: 0, refunded: 0 };
    filteredDonations.filter(d => d.status !== 'pledged').forEach(d => { map[d.status] = (map[d.status] ?? 0) + d.amount; });
    return Object.entries(map)
      .map(([key, value]) => ({ key: key as DonationStatus, name: DONATION_STATUS_LABELS[key as DonationStatus], value }))
      .filter(item => item.value > 0);
  }, [filteredDonations]);

  const donationByChannel = useMemo(() => {
    const map: Record<DonationChannel, number> = { online: 0, 'bank-transfer': 0, cash: 0, cheque: 0 };
    filteredDonations.filter(d => d.status === 'received').forEach(d => { map[d.channel] += d.amount; });
    return Object.entries(map)
      .map(([key, value]) => ({ key: key as DonationChannel, name: CHANNEL_LABELS[key as DonationChannel], value }))
      .filter(item => item.value > 0);
  }, [filteredDonations]);

  const paymentByEvent = useMemo(() => paidEvents
    .map(e => ({
      event: shortName(e.name, 24),
      fullEvent: e.name,
      revenue: e.metrics.going * (e.price ?? 0),
      bookings: e.metrics.going,
    }))
    .sort((a, b) => b.revenue - a.revenue), [paidEvents]);

  const regionData = useMemo(() => {
    const map: Record<string, { payments: number; donations: number }> = {};
    regionOptions.forEach(region => { map[region] = { payments: 0, donations: 0 }; });
    paidEvents.forEach(e => {
      if (!map[e.region]) map[e.region] = { payments: 0, donations: 0 };
      map[e.region].payments += e.metrics.going * (e.price ?? 0);
    });
    filteredDonations.filter(d => d.status === 'received').forEach(d => {
      if (!map[d.region]) map[d.region] = { payments: 0, donations: 0 };
      map[d.region].donations += d.amount;
    });
    return Object.entries(map).map(([region, values]) => ({
      region: shortName(region, 22),
      fullRegion: region,
      ...values,
    }));
  }, [paidEvents, filteredDonations, regionOptions]);

  const monthlyTrend = useMemo(() => {
    const keys = [
      ...paidEvents.map(e => monthKey(e.startDate)),
      ...filteredDonations.map(d => monthKey(d.date)),
    ].sort();
    if (!keys.length) return [];

    const [startYear, startMonth] = keys[0].split('-').map(Number);
    const [endYear, endMonth] = keys[keys.length - 1].split('-').map(Number);
    const map: Record<string, { payments: number; donations: number }> = {};
    for (let cursor = new Date(startYear, startMonth - 1, 1); cursor <= new Date(endYear, endMonth - 1, 1); cursor.setMonth(cursor.getMonth() + 1)) {
      map[monthKey(cursor.toISOString())] = { payments: 0, donations: 0 };
    }
    paidEvents.forEach(e => { map[monthKey(e.startDate)].payments += e.metrics.going * (e.price ?? 0); });
    filteredDonations.filter(d => d.status === 'received').forEach(d => { map[monthKey(d.date)].donations += d.amount; });
    return Object.entries(map).map(([key, values]) => ({ month: monthLabel(key), ...values }));
  }, [paidEvents, filteredDonations]);

  const handleExport = () => {
    const rows: string[][] = [
      ['Donations / Payments Report - HSS'],
      [`Generated: ${new Date().toLocaleDateString('en-GB')}`],
      [],
      ['SUMMARY KPIs'],
      ['Event Payment Revenue', money(eventPaymentRevenue)],
      ['Donation Received', money(donationReceived)],
      ['Combined Received', money(combinedReceived)],
      ['Donation Refunded', money(donationRefunded)],
      ['Paid Event Bookings', String(eventPaymentBookings)],
      ['Average Donation', money(averageDonation)],
      [],
      ['EVENT PAYMENTS BY EVENT'],
      ['Event', 'Paid Bookings', 'Revenue'],
      ...paymentByEvent.map(r => [r.fullEvent, String(r.bookings), money(r.revenue)]),
      [],
      ['VIBHAAG BREAKDOWN'],
      ['Vibhaag', 'Event Payments', 'Donations'],
      ...regionData.map(r => [r.fullRegion, money(r.payments), money(r.donations)]),
      [],
      ['MONTHLY TREND'],
      ['Month', 'Event Payments', 'Donations'],
      ...monthlyTrend.map(r => [r.month, money(r.payments), money(r.donations)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSS_Donations_Payments_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Donations / Payment Report"
          subtitle="Separate aggregate reporting for paid event revenue and organisation donations"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Donations / Payment Report', current: true },
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
          <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]">
            <option value="all">All Dates</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          <select value={filterDonationStatus} onChange={e => setFilterDonationStatus(e.target.value)} className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[140px]">
            <option value="">All Donation Status</option>
            {Object.entries(DONATION_STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Event Payments" value={money(eventPaymentRevenue)} icon={Ticket} color="bg-primary-500" sub={`${fmt(eventPaymentBookings)} paid bookings`} />
          <KpiCard label="Donations Received" value={money(donationReceived)} icon={Gift} color="bg-success-500" sub={`${fmt(filteredDonations.filter(d => d.status === 'received').length)} received donations`} />
          <KpiCard label="Combined Received" value={money(combinedReceived)} icon={PoundSterling} color="bg-blue-500" sub="Payments + donations" />
          <KpiCard label="Average Donation" value={money(averageDonation)} icon={TrendingUp} color="bg-violet-500" />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Revenue Stream Split" subtitle="Event payment revenue and received donations are separate streams">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={streamData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    <Cell fill={PRIMARY} />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {streamData.map((d, i) => (
                  <div key={d.key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: i === 0 ? PRIMARY : '#22c55e' }} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">{money(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Donation Status" subtitle="Donation amounts by current status">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={donationStatusData} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                  {donationStatusData.map(d => <Cell key={d.key} fill={DONATION_STATUS_COLORS[d.key]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6">
          <ChartCard title="Event Payment Revenue" subtitle="Revenue from paid event bookings only">
            <ResponsiveContainer width="100%" height={Math.max(240, paymentByEvent.length * 42 + 60)}>
              <BarChart data={paymentByEvent} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="event" tick={{ fontSize: 10, fill: '#6b7280' }} width={140} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="bookings" name="Paid Bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Financials by Region" subtitle="Separate regional totals for event payments and donations">
            <ResponsiveContainer width="100%" height={Math.max(260, regionData.length * 42 + 60)}>
              <BarChart data={regionData} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="payments" name="Event Payments" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="donations" name="Donations" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Financial Trend" subtitle="Payments and received donations over time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="payments" name="Event Payments" stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="donations" name="Donations" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Payment Stream</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Paid event bookings only</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center gap-3">
            <Banknote className="w-5 h-5 text-success-500" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Donation Stream</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Member, family and organisation giving</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center gap-3">
            <ReceiptText className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Privacy Scope</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Aggregate totals only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
