// ─────────────────────────────────────────────────────────────
// HSS UK — Karyakarta Directory (all members holding a Sangh Responsibility)
//
// "Fixed order" for Sangh Responsibility follows the client's Ref Data Google
// Sheet "Sangh Responsibility" column, given verbatim. Kept as a report-local
// list (not merged into the shared ROLE_TYPE_OPTIONS picklist used elsewhere)
// since it renames/adds a couple of values not yet present on any member
// record — "Sampark" is kept as a legacy alias for "Samaj Sampark" so
// existing mock data still sorts into the right position.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, Fragment } from 'react';
import {
  Users, UserCheck, Building2,
  Download, SlidersHorizontal, X,
} from 'lucide-react';
import { PageHeader, PrimaryButton, useStickyListingHeader } from './hb/listing';
import {
  mockMembers, MASTERS_CASCADE, RESPONSIBILITY_LEVEL_OPTIONS,
  type ResponsibilityLevel, type Member,
} from '../../mockAPI/membersData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';
import { toast } from 'sonner';
import { formatDate } from '../../utils/formatDate';

// Age-group membership labels are NOT sangh responsibilities — same exclusion
// list used by KaryakartaReport.tsx / Dashboard's "Shakha Karyakartas" KPI.
const AGE_GROUP_ROLE_LABELS = new Set([
  'Bal(ika)', 'Shishu', 'Kishor(i)', 'Tarun(i)', 'Yuva(ti)', 'Jyestha(a)',
]);

const NOT_SET = 'Not Set';

// Fixed responsibility-level display order for grouping (Kendriya → Vibhag → Nagar → Shakha).
const LEVEL_ORDER: (ResponsibilityLevel | typeof NOT_SET)[] = [...RESPONSIBILITY_LEVEL_OPTIONS];

// Fixed Sangh Responsibility order — see file header note.
const RESPONSIBILITY_ORDER = [
  'Sanghchalak',
  'Karyawaha',
  'Mukhya Shikshak',
  'Shareerik',
  'Bauddhik',
  'Vyavestha',
  'Vyavestha IT',
  'Nidhi',
  'Sewa',
  'Samaj Sampark',
  'Sampark', // legacy alias — existing mock data uses this value, ranks with Samaj Sampark
  'Prachaar',
  'Jyestha(a)',
  'Yuva(ti)',
  'Tarun(i)',
  'Kishor(i)',
  'Shishu',
  'Bal(ika)',
  'SSV',
  'Sangh Mail',
  'Karyalay',
  'Hindu Sahitya Kendra',
  'Vistaar',
  'Ghatnayak',
  'Sankhya',
  'Shikshak',
];
const responsibilityRank = (r: string) => {
  const i = RESPONSIBILITY_ORDER.indexOf(r);
  return i === -1 ? RESPONSIBILITY_ORDER.length : i;
};

function fmt(n: number) { return n.toLocaleString(); }

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

export default function KaryakartaDirectoryReport() {
  const { scope } = useRoleScope();

  // ── Base dataset: active members holding a Sangh Responsibility ────
  const karyakartas = useMemo(
    () => filterByScope(mockMembers, scope).filter(m => m.status === 'active' && !AGE_GROUP_ROLE_LABELS.has(m.jobTitle)),
    [scope],
  );

  // ── Filters ────────────────────────────────────────────────
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTown,   setFilterTown]   = useState('');
  const [filterCentre, setFilterCentre] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterRespLevel, setFilterRespLevel] = useState('');
  const [filterResponsibility, setFilterResponsibility] = useState('');

  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const regionOptions = scope.showRegionFilter ? (MASTERS_CASCADE.regions['HSS UK'] ?? []) : (scope.region ? [scope.region] : []);
  const townOptions    = scope.showTownFilter
    ? (filterRegion ? (MASTERS_CASCADE.towns[filterRegion] ?? []) : [])
    : (scope.town ? [scope.town] : []);
  const centreOptions  = scope.showCentreFilter
    ? (filterTown ? (MASTERS_CASCADE.centres[filterTown] ?? []) : [])
    : (scope.centre ? [scope.centre] : []);

  const responsibilityOptions = useMemo(
    () => Array.from(new Set(karyakartas.map(m => m.jobTitle))).sort((a, b) => responsibilityRank(a) - responsibilityRank(b)),
    [karyakartas],
  );

  const hasFilter = !!(filterRegion || filterTown || filterCentre || filterGender || filterRespLevel || filterResponsibility);

  const clearFilters = () => {
    setFilterRegion(''); setFilterTown(''); setFilterCentre('');
    setFilterGender(''); setFilterRespLevel(''); setFilterResponsibility('');
  };

  // ── Filtered karyakartas ─────────────────────────────────────
  const filtered = useMemo(() => {
    return karyakartas.filter(m => {
      if (filterRegion && m.region !== filterRegion) return false;
      if (filterTown   && m.town !== filterTown) return false;
      if (filterCentre && m.activityCentre !== filterCentre) return false;
      if (filterGender && m.gender !== filterGender) return false;
      if (filterRespLevel && (m.responsibilityLevel ?? NOT_SET) !== filterRespLevel) return false;
      if (filterResponsibility && m.jobTitle !== filterResponsibility) return false;
      return true;
    });
  }, [karyakartas, filterRegion, filterTown, filterCentre, filterGender, filterRespLevel, filterResponsibility]);

  // ── Aggregations ───────────────────────────────────────────

  const total = filtered.length;
  const maleCount   = filtered.filter(m => m.gender === 'male').length;
  const femaleCount = filtered.filter(m => m.gender === 'female').length;
  const kendriyaCount = filtered.filter(m => m.responsibilityLevel === 'Kendriya / National').length;
  const nagarCount     = filtered.filter(m => m.responsibilityLevel === 'Nagar / Town').length;
  const shakhaCount    = filtered.filter(m => m.responsibilityLevel === 'Shakha / Activity center').length;

  // Grouped by Responsibility Level (fixed order), each group's rows sorted by
  // the fixed Sangh Responsibility order, then by name.
  const grouped = useMemo(() => {
    const byLevel = new Map<string, Member[]>();
    filtered.forEach(m => {
      const level = m.responsibilityLevel ?? NOT_SET;
      if (!byLevel.has(level)) byLevel.set(level, []);
      byLevel.get(level)!.push(m);
    });
    return LEVEL_ORDER
      .filter(level => byLevel.has(level))
      .map(level => ({
        level,
        members: byLevel.get(level)!.sort((a, b) =>
          responsibilityRank(a.jobTitle) - responsibilityRank(b.jobTitle) || a.name.localeCompare(b.name)
        ),
      }));
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
    if (filterRespLevel) filters.push(`Responsibility Level: ${filterRespLevel}`);
    if (filterResponsibility) filters.push(`Sangh Responsibility: ${filterResponsibility}`);

    const rows: string[][] = [
      ['Karyakarta Directory — HSS UK'],
      [`Generated: ${formatDate(new Date())}`],
      filters.length ? [`Filters applied: ${filters.join(' | ')}`] : ['Filters applied: None (All Karyakartas)'],
      [],
      ['SUMMARY KPIs'],
      ['Total Karyakartas',   String(total)],
      ['Kendriya Level',      String(kendriyaCount)],
      ['Nagar Level',         String(nagarCount)],
      ['Shakha Level',        String(shakhaCount)],
      ['Male',                String(maleCount)],
      ['Female',              String(femaleCount)],
      [],
    ];

    grouped.forEach(g => {
      rows.push([g.level.toUpperCase()]);
      rows.push(['Sangh Responsibility', 'First Name', 'Last Name', 'Shakha', 'Email', 'Contact Number']);
      g.members.forEach(m => rows.push([
        m.jobTitle,
        m.firstName ?? m.name.split(' ')[0],
        m.surname ?? m.name.split(' ').slice(1).join(' '),
        m.activityCentre, m.email, m.phone ?? '',
      ]));
      rows.push([]);
    });

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `HSS_Karyakarta_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported Karyakarta Directory — ${total} Karyakartas`);
  };

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950 min-h-screen" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
          <PageHeader
            title="Karyakarta Directory"
            subtitle="All members holding a Sangh Responsibility, grouped by responsibility level"
            breadcrumbs={[
              { label: 'Reports' },
              { label: 'Karyakarta Directory', current: true },
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
            value={filterRegion}
            onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }}
            disabled={!scope.showRegionFilter && regionOptions.length <= 1}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Vibhags</option>
            {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={filterTown}
            onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }}
            disabled={scope.showTownFilter ? !filterRegion : townOptions.length <= 1}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Nagars</option>
            {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={filterCentre}
            onChange={e => setFilterCentre(e.target.value)}
            disabled={scope.showCentreFilter ? !filterTown : centreOptions.length <= 1}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Shakhas</option>
            {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[120px]"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <select
            value={filterRespLevel}
            onChange={e => setFilterRespLevel(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[180px]"
          >
            <option value="">All Responsibility Levels</option>
            {RESPONSIBILITY_LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select
            value={filterResponsibility}
            onChange={e => setFilterResponsibility(e.target.value)}
            className="h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[180px]"
          >
            <option value="">All Sangh Responsibilities</option>
            {responsibilityOptions.map(r => <option key={r} value={r}>{r}</option>)}
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
            Showing <strong className="text-neutral-900 dark:text-white">{fmt(total)}</strong> Karyakarta{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── KPI Cards ────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard label="Total Karyakartas" value={total}         icon={Users}     color="bg-primary-500" />
          <KpiCard label="Kendriya Level"    value={kendriyaCount} icon={Building2} color="bg-violet-500" />
          <KpiCard label="Nagar Level"       value={nagarCount}    icon={Building2} color="bg-info-500" />
          <KpiCard label="Shakha Level"      value={shakhaCount}   icon={Building2} color="bg-success-500" />
          <KpiCard label="Male"              value={maleCount}     icon={UserCheck} color="bg-blue-500" sub={total > 0 ? `${Math.round(maleCount/total*100)}% of total` : undefined} />
          <KpiCard label="Female"            value={femaleCount}   icon={UserCheck} color="bg-pink-500" sub={total > 0 ? `${Math.round(femaleCount/total*100)}% of total` : undefined} />
        </div>

        {/* ── Grouped Directory Table ─────────────────────── */}
        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-left text-xs text-neutral-600 dark:text-neutral-400">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Sangh Responsibility</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">First Name</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Last Name</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Shakha</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {grouped.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400 text-sm">No Karyakartas match the selected filters.</td>
                  </tr>
                ) : grouped.map(g => (
                  <Fragment key={g.level}>
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: '#172E4D' }}>
                        {g.level} ({g.members.length})
                      </td>
                    </tr>
                    {g.members.map(m => (
                      <tr key={m.id} className="text-neutral-700 dark:text-neutral-300">
                        <td className="px-4 py-3 whitespace-nowrap">{m.jobTitle}</td>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.firstName ?? m.name.split(' ')[0]}</td>
                        <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.surname ?? m.name.split(' ').slice(1).join(' ')}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{m.activityCentre}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{m.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{m.phone ?? '—'}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
