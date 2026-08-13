// ─────────────────────────────────────────────────────────────
// HSS UK — Shakha Directory Report
// Shakha list sourced from Masters (HSS UK Setup — MASTERS_CASCADE, the same
// centre names used across Members/Events/Sessions). Operating hours are
// derived from Attendance > Sessions (mockSessions) by matching Shakha name.
//
// NOTE: the separate Masters CRUD screen (SuperAdminMasters.tsx) keeps its
// own fictional centre-name list with contact details that doesn't match
// MASTERS_CASCADE — no reliable join exists between the two today, so
// Contact Name/Number show "—" until that's reconciled.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Building2, Clock, Download, SlidersHorizontal, X } from 'lucide-react';
import { PageHeader, PrimaryButton, useStickyListingHeader } from './hb/listing';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { mockSessions } from '../../mockAPI/attendanceData';
import { toast } from 'sonner';
import { formatDate } from '../../utils/formatDate';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CHART_PALETTE = [
  '#f59e0b', '#3b82f6', '#22c55e', '#ec4899', '#8b5cf6',
  '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#6366f1',
];

function fmt(n: number) { return n.toLocaleString(); }

interface DirectoryRow {
  centre: string;
  town: string;
  region: string;
  country: string;
  meetingDay?: string;
  meetingTime?: string;
}

// Flatten the full Country → Vibhag → Nagar → Shakha hierarchy from Masters.
function buildDirectory(): DirectoryRow[] {
  const rows: DirectoryRow[] = [];
  for (const country of MASTERS_CASCADE.countries) {
    const regions = MASTERS_CASCADE.regions[country] ?? [];
    for (const region of regions) {
      const towns = MASTERS_CASCADE.towns[region] ?? [];
      for (const town of towns) {
        const centres = MASTERS_CASCADE.centres[town] ?? [];
        for (const centre of centres) {
          const session = mockSessions.find(s => s.activityCentre === centre);
          rows.push({
            centre, town, region, country,
            meetingDay: session ? DAY_NAMES[session.dayOfWeek] : undefined,
            meetingTime: session ? `${session.startTime} – ${session.endTime}` : undefined,
          });
        }
      }
    }
  }
  return rows;
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

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
// Deliberately NOT scoped to the viewer's own Vibhag/Nagar/Shakha — a
// directory is meant to list every Shakha, not just the viewer's own patch.
export default function ShakhaDirectoryReport() {
  const allRows = useMemo(buildDirectory, []);

  const [filterCountry, setFilterCountry] = useState('');
  const [filterRegion,  setFilterRegion]  = useState('');
  const [filterTown,    setFilterTown]    = useState('');

  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const countryOptions = MASTERS_CASCADE.countries;
  const regionOptions   = filterCountry ? (MASTERS_CASCADE.regions[filterCountry] ?? []) : Object.values(MASTERS_CASCADE.regions).flat();
  const townOptions     = filterRegion   ? (MASTERS_CASCADE.towns[filterRegion] ?? [])   : Object.values(MASTERS_CASCADE.towns).flat();

  const hasFilter = !!(filterCountry || filterRegion || filterTown);
  const clearFilters = () => { setFilterCountry(''); setFilterRegion(''); setFilterTown(''); };

  const filtered = useMemo(() => allRows.filter(r => {
    if (filterCountry && r.country !== filterCountry) return false;
    if (filterRegion   && r.region !== filterRegion)   return false;
    if (filterTown      && r.town !== filterTown)        return false;
    return true;
  }), [allRows, filterCountry, filterRegion, filterTown]);

  const total = filtered.length;
  const withHours = filtered.filter(r => r.meetingDay).length;

  const byRegion = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(r => { map[r.region] = (map[r.region] ?? 0) + 1; });
    return Object.entries(map).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count);
  }, [filtered]);

  const handleExport = () => {
    if (total === 0) {
      toast.error('No data to export — adjust your filters and try again.');
      return;
    }
    const filters: string[] = [];
    if (filterCountry) filters.push(`Country: ${filterCountry}`);
    if (filterRegion)  filters.push(`Vibhag: ${filterRegion}`);
    if (filterTown)     filters.push(`Nagar: ${filterTown}`);

    const rows: string[][] = [
      ['Shakha Directory — HSS UK'],
      [`Generated: ${formatDate(new Date())}`],
      filters.length ? [`Filters applied: ${filters.join(' | ')}`] : ['Filters applied: None (All Shakhas)'],
      [],
      ['SUMMARY'],
      ['Total Shakhas', String(total)],
      ['With Known Operating Hours', String(withHours)],
      [],
      ['SHAKHAS'],
      ['Shakha Name', 'Nagar', 'Vibhag', 'Contact Name', 'Contact Number', 'Meeting Day', 'Meeting Time'],
      ...filtered.map(r => [r.centre, r.town, r.region, '—', '—', r.meetingDay ?? '—', r.meetingTime ?? '—']),
    ];

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `HSS_Shakha_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported Shakha Directory — ${total} Shakhas`);
  };

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950 min-h-screen" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
          <PageHeader
            title="Shakha Directory"
            subtitle="All Shakhas across HSS — contact details and operating hours"
            breadcrumbs={[
              { label: 'Reports' },
              { label: 'Shakha Directory', current: true },
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

          <select
            value={filterCountry}
            onChange={e => { setFilterCountry(e.target.value); setFilterRegion(''); setFilterTown(''); }}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
          >
            <option value="">All Countries</option>
            {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterRegion}
            onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); }}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
          >
            <option value="">All Vibhags</option>
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={filterTown}
            onChange={e => setFilterTown(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]"
          >
            <option value="">All Nagars</option>
            {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
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
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(total)}</strong> Shakha{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── KPI Cards ────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Total Shakhas"              value={total}     icon={Building2} color="bg-primary-500" />
          <KpiCard label="With Known Operating Hours" value={withHours} icon={Clock}     color="bg-info-500" sub={total > 0 ? `${Math.round(withHours/total*100)}% of total` : undefined} />
          <KpiCard label="Vibhags Covered"            value={byRegion.length} icon={Building2} color="bg-success-500" />
        </div>

        {/* ── Chart ────────────────────────────────────────── */}
        <div className="mt-6">
          <ChartCard title="Shakhas by Vibhag" subtitle="Distribution across regions">
            <ResponsiveContainer width="100%" height={Math.max(180, byRegion.length * 36 + 40)}>
              <BarChart data={byRegion} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: '#6b7280' }} width={140} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Shakhas" radius={[0, 4, 4, 0]}>
                  {byRegion.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Directory Table ─────────────────────────────── */}
        <div className="mt-6">
          <ChartCard title="Shakha Directory" subtitle="Full list matching the current filters">
            <div className="sticky-table-scroll slim-scroll">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-xs text-neutral-500 dark:text-neutral-400">
                    <th className="py-2 pr-4 font-medium">Shakha Name</th>
                    <th className="py-2 pr-4 font-medium">Nagar</th>
                    <th className="py-2 pr-4 font-medium">Vibhag</th>
                    <th className="py-2 pr-4 font-medium">Contact Name</th>
                    <th className="py-2 pr-4 font-medium">Contact Number</th>
                    <th className="py-2 pr-4 font-medium">Meeting Day</th>
                    <th className="py-2 pr-4 font-medium">Meeting Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-neutral-400 text-sm">No Shakhas match the selected filters.</td>
                    </tr>
                  ) : filtered.map(r => (
                    <tr key={r.centre} className="text-neutral-700 dark:text-neutral-300">
                      <td className="py-2 pr-4 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{r.centre}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.town}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.region}</td>
                      <td className="py-2 pr-4 whitespace-nowrap text-neutral-400">—</td>
                      <td className="py-2 pr-4 whitespace-nowrap text-neutral-400">—</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.meetingDay ?? <span className="text-neutral-400">—</span>}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.meetingTime ?? <span className="text-neutral-400">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}
