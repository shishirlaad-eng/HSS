// ─────────────────────────────────────────────────────────────
// HSS UK — Shakha Directory Report
// Shakha list sourced from Masters (HSS UK Setup — MASTERS_CASCADE, the same
// centre names used across Members/Events/Sessions).
//
// NOTE: the separate Masters CRUD screen (SuperAdminMasters.tsx) keeps its
// own fictional centre-name list with contact details that doesn't match
// MASTERS_CASCADE — no reliable join exists between the two today, so
// Contact Name/Number show "—" until that's reconciled.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import { Building2, Download, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PageHeader, PrimaryButton, Pagination, useStickyListingHeader } from './hb/listing';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { toast } from 'sonner';
import { formatDate } from '../../utils/formatDate';

function fmt(n: number) { return n.toLocaleString(); }

interface DirectoryRow {
  centre: string;
  town: string;
  region: string;
  country: string;
}

type SortField = 'centre' | 'town' | 'region';

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
          rows.push({ centre, town, region, country });
        }
      }
    }
  }
  return rows;
}

function KpiCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number;
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

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };
  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-40" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />
      : <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary-600 dark:text-primary-400" />;
  };

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

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const cmp = (a: DirectoryRow, b: DirectoryRow) => a[sortField].localeCompare(b[sortField]);
    return [...filtered].sort((a, b) => sortDirection === 'asc' ? cmp(a, b) : cmp(b, a));
  }, [filtered, sortField, sortDirection]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const totalPages = itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginated = itemsPerPage === 0 ? sorted : sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const total = filtered.length;
  const totalVibhags = useMemo(() => new Set(filtered.map(r => r.region)).size, [filtered]);
  const totalNagars   = useMemo(() => new Set(filtered.map(r => r.town)).size, [filtered]);

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
      ['Total Vibhags', String(totalVibhags)],
      ['Total Nagars',  String(totalNagars)],
      ['Total Shakhas', String(total)],
      [],
      ['SHAKHAS'],
      ['Shakha Name', 'Nagar', 'Vibhag', 'Contact Name', 'Contact Number'],
      ...sorted.map(r => [r.centre, r.town, r.region, '—', '—']),
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
            subtitle="All Shakhas across HSS — filterable, sortable directory"
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
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Total Vibhags" value={totalVibhags} icon={Building2} color="bg-primary-500" />
          <KpiCard label="Total Nagars"  value={totalNagars}  icon={Building2} color="bg-info-500" />
          <KpiCard label="Total Shakhas" value={total}        icon={Building2} color="bg-success-500" />
        </div>

        {/* ── Directory Table ─────────────────────────────── */}
        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-left text-xs text-neutral-600 dark:text-neutral-400">
                  <th onClick={() => handleSort('centre')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">Shakha Name{renderSortArrow('centre')}</th>
                  <th onClick={() => handleSort('town')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">Nagar{renderSortArrow('town')}</th>
                  <th onClick={() => handleSort('region')} className="px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap">Vibhag{renderSortArrow('region')}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Contact Name</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-400 text-sm">No Shakhas match the selected filters.</td>
                  </tr>
                ) : paginated.map(r => (
                  <tr key={r.centre} className="text-neutral-700 dark:text-neutral-300">
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{r.centre}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.town}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.region}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-400">—</td>
                    <td className="px-4 py-3 whitespace-nowrap text-neutral-400">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={n => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        </div>

      </div>
    </div>
  );
}
