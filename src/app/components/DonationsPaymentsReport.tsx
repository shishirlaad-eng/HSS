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
  Banknote,
  CreditCard,
  Download,
  HandCoins,
  PoundSterling,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PageHeader, PrimaryButton } from './hb/listing';
import { formatDate } from '../../utils/formatDate';
import { mockDonations } from '../../mockAPI/donationsData';
import { mockSessions } from '../../mockAPI/attendanceData';
import { mockGuruPujaReportEntries } from '../../mockAPI/guruPujaReportData';
import { AgeGroup } from '../../mockAPI/membersData';

export type DakshinaStream = 'one-off' | 'cash-cheque' | 'other';

const STREAM_COLORS: Record<DakshinaStream, string> = {
  'one-off': '#3b82f6',
  'cash-cheque': '#22c55e',
  'other': '#8b5cf6',
};

const STREAM_LABELS: Record<DakshinaStream, string> = {
  'one-off': 'MyHSS One-Off Dakshina',
  'cash-cheque': 'Guru Puja Cash & Cheque Dakshina',
  'other': 'Other Dakshina',
};

const AGE_GROUPS: AgeGroup[] = ['shishu', 'bal', 'kishor', 'tarun', 'yuva', 'jyestha'];

function getEntryDakshina(entry?: { amounts: Record<string, { cash: number; cheque: number }> }) {
  if (!entry?.amounts) return 0;
  return AGE_GROUPS.reduce((sum, g) => sum + (entry.amounts[g]?.cash ?? 0) + (entry.amounts[g]?.cheque ?? 0), 0);
}

function fmt(n: number) {
  return Number.isFinite(n) ? n.toLocaleString() : '0';
}

function money(n: number) {
  return `GBP ${fmt(Math.round(n))}`;
}

function monthKey(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  if (!key || !key.includes('-')) return key;
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
  const {
    scope,
    region: filterRegion, town: filterTown, centre: filterCentre,
    setRegion: setFilterRegion, setTown: setFilterTown, setCentre: setFilterCentre,
    regionOptions, townOptions, centreOptions,
    regionLocked, townLocked, centreLocked,
    regionDisabled, townDisabled, centreDisabled,
  } = useReportLocationFilters();
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [dateLabel, setDateLabel] = useState('');

  const hasFilter = !!((filterRegion && !regionLocked) || (filterTown && !townLocked) || (filterCentre && !centreLocked) || dateStart);

  const clearFilters = () => {
    setFilterRegion('');
    setFilterTown('');
    setFilterCentre('');
    setDateStart(''); setDateEnd(''); setDateLabel('');
  };

  const filteredDonations = useMemo(() => {
    return filterByScope(mockDonations, scope).filter(donation => {
      if (filterRegion && donation.region !== filterRegion) return false;
      if (filterTown && donation.town !== filterTown) return false;
      if (filterCentre && donation.activityCentre !== filterCentre) return false;
      if (!inDateRange(donation.date, dateStart, dateEnd)) return false;
      return true;
    });
  }, [scope, filterRegion, filterTown, filterCentre, dateStart, dateEnd]);

  // Scoped Guru Puja sessions for Cash & Cheque Dakshina
  const scopedSessions = useMemo(() => {
    return filterByScope(mockSessions, scope).filter(s => {
      if (s.utsav !== 'Guru Purnima') return false;
      if (filterRegion && s.region !== filterRegion) return false;
      if (filterTown && s.town !== filterTown) return false;
      if (filterCentre && s.activityCentre !== filterCentre) return false;
      if (!inDateRange(s.date, dateStart, dateEnd)) return false;
      return true;
    });
  }, [scope, filterRegion, filterTown, filterCentre, dateStart, dateEnd]);

  const receivedDonations = filteredDonations.filter(d => d.status === 'received');

  // Stream 1: MyHSS One-Off Dakshina
  const onlineDonations = receivedDonations
    .filter(d => d.incomeStream === 'online-donation')
    .reduce((sum, d) => sum + d.amount, 0);

  // Stream 2: Total Cash & Cheque Dakshina from Guru Puja report
  const cashChequeDakshina = useMemo(() => {
    return scopedSessions.reduce((total, session) => {
      const entry = mockGuruPujaReportEntries.find(e => e.sessionId === session.id);
      return total + getEntryDakshina(entry);
    }, 0);
  }, [scopedSessions]);

  // Stream 3: Other Dakshina (uploaded from Shakha Dakshina module - for now blank/0)
  const otherDakshina = 0;

  // Total Dakshina (excluding recurring / standing orders)
  const totalDakshina = onlineDonations + cashChequeDakshina + otherDakshina;

  const streamData = useMemo(() => [
    { key: 'one-off' as DakshinaStream, name: STREAM_LABELS['one-off'], value: onlineDonations },
    { key: 'cash-cheque' as DakshinaStream, name: STREAM_LABELS['cash-cheque'], value: cashChequeDakshina },
    { key: 'other' as DakshinaStream, name: STREAM_LABELS['other'], value: otherDakshina },
  ], [onlineDonations, cashChequeDakshina, otherDakshina]);

  const regionData = useMemo(() => {
    const map: Record<string, {
      online: number;
      cashCheque: number;
      other: number;
    }> = {};
    (regionOptions || []).forEach(region => {
      map[region] = { online: 0, cashCheque: 0, other: 0 };
    });
    receivedDonations.forEach(d => {
      if (!map[d.region]) map[d.region] = { online: 0, cashCheque: 0, other: 0 };
      if (d.incomeStream === 'online-donation') map[d.region].online += d.amount;
    });
    scopedSessions.forEach(s => {
      if (!map[s.region]) map[s.region] = { online: 0, cashCheque: 0, other: 0 };
      const entry = mockGuruPujaReportEntries.find(e => e.sessionId === s.id);
      map[s.region].cashCheque += getEntryDakshina(entry);
    });
    return Object.entries(map).map(([region, values]) => ({
      region: shortName(region, 22),
      fullRegion: region,
      ...values,
      totalDakshina: values.online + values.cashCheque + values.other,
    }));
  }, [receivedDonations, scopedSessions, regionOptions]);

  const monthlyTrend = useMemo(() => {
    const donationMonths = receivedDonations
      .filter(d => d.incomeStream === 'online-donation')
      .map(d => monthKey(d.date))
      .filter(Boolean);
    const sessionMonths = scopedSessions
      .map(s => monthKey(s.date))
      .filter(Boolean);
    const allMonths = Array.from(new Set([...donationMonths, ...sessionMonths])).sort();

    if (!allMonths.length) return [];

    const [startYear, startMonth] = allMonths[0].split('-').map(Number);
    const [endYear, endMonth] = allMonths[allMonths.length - 1].split('-').map(Number);
    const map: Record<string, { online: number; cashCheque: number; other: number; dakshina: number }> = {};

    let curYear = startYear;
    let curMonth = startMonth;
    while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
      const k = `${curYear}-${String(curMonth).padStart(2, '0')}`;
      map[k] = { online: 0, cashCheque: 0, other: 0, dakshina: 0 };
      curMonth++;
      if (curMonth > 12) {
        curMonth = 1;
        curYear++;
      }
    }

    receivedDonations.forEach(d => {
      if (d.incomeStream === 'online-donation') {
        const key = monthKey(d.date);
        if (key && map[key]) {
          map[key].online += d.amount;
          map[key].dakshina += d.amount;
        }
      }
    });

    scopedSessions.forEach(s => {
      const key = monthKey(s.date);
      if (key && map[key]) {
        const entry = mockGuruPujaReportEntries.find(e => e.sessionId === s.id);
        const amt = getEntryDakshina(entry);
        map[key].cashCheque += amt;
        map[key].dakshina += amt;
      }
    });

    return Object.entries(map).map(([key, values]) => ({ month: monthLabel(key), ...values }));
  }, [receivedDonations, scopedSessions]);

  const handleExport = () => {
    const rows: string[][] = [
      ['Nidhi Report - HSS'],
      [`Generated: ${formatDate(new Date())}`],
      [],
      ['SUMMARY KPIS'],
      ['Total Dakshina', money(totalDakshina)],
      ['MyHSS One-Off Dakshina', money(onlineDonations)],
      ['Total Cash & Cheque Dakshina', money(cashChequeDakshina)],
      ['Other Dakshina', otherDakshina > 0 ? money(otherDakshina) : 'GBP 0'],
      [],
      ['VIBHAG BREAKDOWN'],
      ['Vibhag', 'MyHSS One-Off Dakshina', 'Total Cash & Cheque Dakshina', 'Other Dakshina', 'Total Dakshina'],
      ...regionData.map(r => [
        r.fullRegion,
        money(r.online),
        money(r.cashCheque),
        money(r.other),
        money(r.totalDakshina),
      ]),
      [],
      ['MONTHLY TREND'],
      ['Month', 'MyHSS One-Off Dakshina', 'Total Cash & Cheque Dakshina', 'Other Dakshina', 'Total Dakshina'],
      ...monthlyTrend.map(r => [r.month, money(r.online), money(r.cashCheque), money(r.other), money(r.dakshina)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HSS_Nidhi_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">
        <PageHeader
          title="Nidhi Report"
          subtitle="Dakshina report detailing MyHSS one-off dakshina, Guru Puja Cash & Cheque Daksina and Other Dakshina"
          breadcrumbs={[
            { label: 'Reports' },
            { label: 'Nidhi Report', current: true },
          ]}
        >
          <PrimaryButton icon={Download} onClick={handleExport}>Export CSV</PrimaryButton>
        </PageHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <select disabled={regionDisabled} value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }} className="disabled:opacity-50 disabled:cursor-not-allowed h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]">
            <option value="">All Vibhags</option>
            {(regionOptions || []).map(region => <option key={region} value={region}>{region}</option>)}
          </select>
          <select disabled={townDisabled} value={filterTown} onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }} className="disabled:opacity-50 disabled:cursor-not-allowed h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]">
            <option value="">All Nagars</option>
            {(townOptions || []).map(town => <option key={town} value={town}>{town}</option>)}
          </select>
          <select disabled={centreDisabled} value={filterCentre} onChange={e => setFilterCentre(e.target.value)} className="disabled:opacity-50 disabled:cursor-not-allowed h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px]">
            <option value="">All Shakhas</option>
            {(centreOptions || []).map(centre => <option key={centre} value={centre}>{centre}</option>)}
          </select>
          <ReportDateFilter
            start={dateStart}
            end={dateEnd}
            label={dateLabel}
            onChange={(s, e, l) => { setDateStart(s); setDateEnd(e); setDateLabel(l); }}
            title="Dakshina Date Range"
            emptyLabel="Dakshina Date"
          />
          {hasFilter && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <KpiCard
            label="Total Dakshina"
            value={money(totalDakshina)}
            icon={PoundSterling}
            color="bg-primary-600"
            sub="MyHSS one-off dakshina + Guru Puja cash & cheque dakshina + other dakshina"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            label="MyHSS One-Off Dakshina"
            value={money(onlineDonations)}
            icon={CreditCard}
            color="bg-blue-500"
            sub="Online donations via MyHSS"
          />
          <KpiCard
            label="Total Cash & Cheque Dakshina"
            value={money(cashChequeDakshina)}
            icon={Banknote}
            color="bg-emerald-500"
            sub="Guru Puja cash & cheque dakshina"
          />
          <KpiCard
            label="Other Dakshina"
            value={otherDakshina > 0 ? money(otherDakshina) : '—'}
            icon={HandCoins}
            color="bg-purple-500"
            sub="Uploaded from Shakha Dakshina module"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <ChartCard title="Dakshina Split" subtitle="MyHSS one-off, Guru Puja cash & cheque, and other dakshina">
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={streamData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {streamData.filter(d => d.value > 0).map(d => (
                      <Cell key={d.key} fill={STREAM_COLORS[d.key]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {streamData.map(d => (
                  <div key={d.key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STREAM_COLORS[d.key] }} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {d.value > 0 ? money(d.value) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Dakshina by Vibhag" subtitle="Dakshina streams by Vibhag">
            <ResponsiveContainer width="100%" height={Math.max(260, regionData.length * 42 + 60)}>
              <BarChart data={regionData} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={130} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="online" name="MyHSS One-Off Dakshina" fill={STREAM_COLORS['one-off']} radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="cashCheque" name="Cash & Cheque Dakshina" fill={STREAM_COLORS['cash-cheque']} radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="other" name="Other Dakshina" fill={STREAM_COLORS['other']} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Dakshina Trend" subtitle="Dakshina streams over time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="online" name="MyHSS One-Off Dakshina" stroke={STREAM_COLORS['one-off']} strokeWidth={2.5} dot={{ r: 3, fill: STREAM_COLORS['one-off'], strokeWidth: 0 }} />
                <Line type="monotone" dataKey="cashCheque" name="Cash & Cheque Dakshina" stroke={STREAM_COLORS['cash-cheque']} strokeWidth={2.5} dot={{ r: 3, fill: STREAM_COLORS['cash-cheque'], strokeWidth: 0 }} />
                <Line type="monotone" dataKey="other" name="Other Dakshina" stroke={STREAM_COLORS['other']} strokeWidth={2.5} dot={{ r: 3, fill: STREAM_COLORS['other'], strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}
