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
import { Download, SlidersHorizontal, X, ChevronRight, ChevronDown } from 'lucide-react';
import { PageHeader, PrimaryButton, SearchBar, useStickyListingHeader } from './hb/listing';
import {
  mockMembers, MASTERS_CASCADE, RESPONSIBILITY_LEVEL_OPTIONS,
  type Member,
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

// Short form of a responsibility level e.g. "Kendriya / National" → "Kendriya".
function shortLevel(level?: string) {
  return level ? level.split('/')[0].trim() : '';
}

// All three parts of the Sangh Responsibility — Level, Responsibility, Type —
// e.g. "Kendriya Shareerik Pramukh".
function fullResponsibility(m: Member) {
  return [shortLevel(m.responsibilityLevel), m.jobTitle, m.responsibilityType].filter(Boolean).join(' ');
}

function MemberRow({ m }: { m: Member }) {
  return (
    <tr className="text-neutral-700 dark:text-neutral-300">
      <td className="px-4 py-3 whitespace-nowrap">{fullResponsibility(m)}</td>
      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.firstName ?? m.name.split(' ')[0]}</td>
      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white whitespace-nowrap">{m.surname ?? m.name.split(' ').slice(1).join(' ')}</td>
      <td className="px-4 py-3 whitespace-nowrap">{m.activityCentre}</td>
      <td className="px-4 py-3 whitespace-nowrap">{m.email}</td>
      <td className="px-4 py-3 whitespace-nowrap">{m.phone ?? '—'}</td>
    </tr>
  );
}

// Tiered visual styles matching the collapsible year/month groups in the
// Member-facing "My Attendance" log (AttendanceLog.tsx) — solid primary band
// for the top tier, progressively lighter/more-indented neutral bands below.
const GROUP_TIER_STYLE = {
  top: {
    padding: 'px-4',
    bg: 'bg-primary-700 dark:bg-primary-950 hover:bg-primary-800 dark:hover:bg-primary-900',
    text: 'text-white',
    icon: 'text-white/80',
    count: 'text-white/60',
    border: '',
  },
  nagar: {
    padding: 'pl-8 pr-4',
    bg: 'bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800',
    text: 'text-neutral-900 dark:text-white',
    icon: 'text-neutral-500',
    count: 'text-neutral-500 dark:text-neutral-400',
    border: 'border-y border-neutral-200 dark:border-neutral-800',
  },
  shakha: {
    padding: 'pl-12 pr-4',
    bg: 'bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/60',
    text: 'text-neutral-800 dark:text-neutral-200',
    icon: 'text-neutral-400',
    count: 'text-neutral-400 dark:text-neutral-500',
    border: 'border-y border-neutral-100 dark:border-neutral-800/60',
  },
} as const;

function GroupHeader({ label, count, collapsed, onToggle, tier }: {
  label: string; count: number; collapsed: boolean; onToggle: () => void; tier: keyof typeof GROUP_TIER_STYLE;
}) {
  const s = GROUP_TIER_STYLE[tier];
  return (
    <tr>
      <td colSpan={6} className="p-0">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className={`w-full flex items-center justify-between gap-3 ${s.padding} py-2.5 ${s.bg} ${s.border} text-left transition-colors`}
        >
          <span className="flex items-center gap-2">
            {collapsed
              ? <ChevronRight className={`w-4 h-4 ${s.icon}`} />
              : <ChevronDown className={`w-4 h-4 ${s.icon}`} />
            }
            <span className={`text-sm font-bold ${s.text}`}>{label}</span>
          </span>
          <span className={`text-xs font-medium ${s.count}`}>
            {count} {count === 1 ? 'Karyakarta' : 'Karyakartas'}
          </span>
        </button>
      </td>
    </tr>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function KaryakartaDirectoryReport() {
  const { scope } = useRoleScope();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (key: string) => setCollapsedGroups(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  // ── Base dataset: active members holding a Sangh Responsibility ────
  const karyakartas = useMemo(
    () => filterByScope(mockMembers, scope).filter(m => m.status === 'active' && !AGE_GROUP_ROLE_LABELS.has(m.jobTitle)),
    [scope],
  );

  // ── Search + Filters ─────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
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
    const q = searchQuery.trim().toLowerCase();
    return karyakartas.filter(m => {
      if (q) {
        const matchesSearch =
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.phone ?? '').toLowerCase().includes(q) ||
          m.jobTitle.toLowerCase().includes(q) ||
          m.activityCentre.toLowerCase().includes(q) ||
          m.town.toLowerCase().includes(q) ||
          m.region.toLowerCase().includes(q) ||
          (m.responsibilityLevel ?? '').toLowerCase().includes(q) ||
          (m.responsibilityType ?? '').toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (filterRegion && m.region !== filterRegion) return false;
      if (filterTown   && m.town !== filterTown) return false;
      if (filterCentre && m.activityCentre !== filterCentre) return false;
      if (filterGender && m.gender !== filterGender) return false;
      if (filterRespLevel && (m.responsibilityLevel ?? NOT_SET) !== filterRespLevel) return false;
      if (filterResponsibility && m.jobTitle !== filterResponsibility) return false;
      return true;
    });
  }, [karyakartas, searchQuery, filterRegion, filterTown, filterCentre, filterGender, filterRespLevel, filterResponsibility]);

  // ── Aggregations ───────────────────────────────────────────

  const total = filtered.length;
  const maleCount   = filtered.filter(m => m.gender === 'male').length;
  const femaleCount = filtered.filter(m => m.gender === 'female').length;
  const kendriyaCount = filtered.filter(m => m.responsibilityLevel === 'Kendriya / National').length;
  const nagarCount     = filtered.filter(m => m.responsibilityLevel === 'Nagar / Town').length;
  const shakhaCount    = filtered.filter(m => m.responsibilityLevel === 'Shakha / Activity center').length;

  const sortMembers = (list: Member[]) =>
    [...list].sort((a, b) => responsibilityRank(a.jobTitle) - responsibilityRank(b.jobTitle) || a.name.localeCompare(b.name));

  // ── Grouping ─────────────────────────────────────────────────
  // Two top-level groups: Kendriya (flat) and Vibhag. Within Vibhag, members
  // are organised by the ACTUAL org hierarchy they belong to (region → town →
  // activityCentre), not just their own responsibility level — a Vibhag-level
  // Karyakarta sits at the top of their region's branch, Nagar-level
  // Karyakartas nest under the Nagar (town) inside that region, and
  // Shakha-level Karyakartas nest under the Shakha (centre) inside that Nagar.
  const grouped = useMemo(() => {
    const kendriyaMembers = sortMembers(filtered.filter(m => m.responsibilityLevel === 'Kendriya / National'));
    const vibhagLevelMembers = filtered.filter(m => m.responsibilityLevel === 'Vibhag / Region');
    const nagarLevelMembers  = filtered.filter(m => m.responsibilityLevel === 'Nagar / Town');
    const shakhaLevelMembers = filtered.filter(m => m.responsibilityLevel === 'Shakha / Activity center');

    const regionNames = Array.from(new Set(
      [...vibhagLevelMembers, ...nagarLevelMembers, ...shakhaLevelMembers].map(m => m.region)
    )).sort();

    const vibhagRegions = regionNames.map(region => {
      const regionVibhagMembers = vibhagLevelMembers.filter(m => m.region === region);
      const regionNagarMembers  = nagarLevelMembers.filter(m => m.region === region);
      const regionShakhaMembers = shakhaLevelMembers.filter(m => m.region === region);

      const townNames = Array.from(new Set(
        [...regionNagarMembers, ...regionShakhaMembers].map(m => m.town)
      )).sort();

      const nagars = townNames.map(town => {
        const townNagarMembers  = regionNagarMembers.filter(m => m.town === town);
        const townShakhaMembers = regionShakhaMembers.filter(m => m.town === town);

        const centreNames = Array.from(new Set(townShakhaMembers.map(m => m.activityCentre))).sort();
        const shakhas = centreNames.map(centre => ({
          centre,
          members: sortMembers(townShakhaMembers.filter(m => m.activityCentre === centre)),
        }));

        return { town, members: sortMembers(townNagarMembers), shakhas };
      });

      const regionTotal = regionVibhagMembers.length + regionNagarMembers.length + regionShakhaMembers.length;
      return { region, members: sortMembers(regionVibhagMembers), nagars, regionTotal };
    });

    const vibhagTotal = vibhagLevelMembers.length + nagarLevelMembers.length + shakhaLevelMembers.length;

    return { kendriyaMembers, vibhagRegions, vibhagTotal };
  }, [filtered]);

  const hasAnyGroupedRows = grouped.kendriyaMembers.length > 0 || grouped.vibhagTotal > 0;

  // ── Export CSV ─────────────────────────────────────────────
  const handleExport = () => {
    if (total === 0) {
      toast.error('No data to export — adjust your filters and try again.');
      return;
    }

    const filters: string[] = [];
    if (searchQuery) filters.push(`Search: ${searchQuery}`);
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

    const memberRow = (m: Member) => [
      fullResponsibility(m),
      m.firstName ?? m.name.split(' ')[0],
      m.surname ?? m.name.split(' ').slice(1).join(' '),
      m.activityCentre, m.email, m.phone ?? '',
    ];
    const header = ['Sangh Responsibility', 'First Name', 'Last Name', 'Shakha', 'Email', 'Contact Number'];

    if (grouped.kendriyaMembers.length > 0) {
      rows.push(['KENDRIYA / NATIONAL']);
      rows.push(header);
      grouped.kendriyaMembers.forEach(m => rows.push(memberRow(m)));
      rows.push([]);
    }

    if (grouped.vibhagTotal > 0) {
      rows.push([`VIBHAG (${grouped.vibhagTotal})`]);
      grouped.vibhagRegions.forEach(rg => {
        rows.push([`Vibhag: ${rg.region} (${rg.regionTotal})`]);
        if (rg.members.length > 0) {
          rows.push(header);
          rg.members.forEach(m => rows.push(memberRow(m)));
        }
        rg.nagars.forEach(nagar => {
          rows.push([`  Nagar: ${nagar.town} (${nagar.members.length + nagar.shakhas.reduce((s, sh) => s + sh.members.length, 0)})`]);
          if (nagar.members.length > 0) {
            rows.push(header);
            nagar.members.forEach(m => rows.push(memberRow(m)));
          }
          nagar.shakhas.forEach(shakha => {
            rows.push([`    Shakha: ${shakha.centre} (${shakha.members.length})`]);
            rows.push(header);
            shakha.members.forEach(m => rows.push(memberRow(m)));
          });
        });
        rows.push([]);
      });
    }

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
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, phone, Shakha…"
            />
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
                {!hasAnyGroupedRows ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-400 text-sm">No Karyakartas match the selected filters.</td>
                  </tr>
                ) : (
                  <>
                    {grouped.kendriyaMembers.length > 0 && (
                      <Fragment key="kendriya">
                        <GroupHeader
                          label="Kendriya / National"
                          count={grouped.kendriyaMembers.length}
                          collapsed={collapsedGroups.has('kendriya')}
                          onToggle={() => toggleGroup('kendriya')}
                          tier="top"
                        />
                        {!collapsedGroups.has('kendriya') && grouped.kendriyaMembers.map(m => <MemberRow key={m.id} m={m} />)}
                      </Fragment>
                    )}

                    {grouped.vibhagTotal > 0 && (
                      <Fragment key="vibhag">
                        {grouped.vibhagRegions.map(rg => {
                          const regionKey = `vibhag:${rg.region}`;
                          return (
                          <Fragment key={rg.region}>
                            <GroupHeader
                              label={`Vibhag: ${rg.region}`}
                              count={rg.regionTotal}
                              collapsed={collapsedGroups.has(regionKey)}
                              onToggle={() => toggleGroup(regionKey)}
                              tier="top"
                            />
                            {!collapsedGroups.has(regionKey) && (
                              <>
                                {rg.members.map(m => <MemberRow key={m.id} m={m} />)}

                                {rg.nagars.map(nagar => {
                                  const nagarTotal = nagar.members.length + nagar.shakhas.reduce((s, sh) => s + sh.members.length, 0);
                                  const nagarKey = `${regionKey}:${nagar.town}`;
                                  return (
                                    <Fragment key={nagar.town}>
                                      <GroupHeader
                                        label={`Nagar: ${nagar.town}`}
                                        count={nagarTotal}
                                        collapsed={collapsedGroups.has(nagarKey)}
                                        onToggle={() => toggleGroup(nagarKey)}
                                        tier="nagar"
                                      />
                                      {!collapsedGroups.has(nagarKey) && (
                                        <>
                                          {nagar.members.map(m => <MemberRow key={m.id} m={m} />)}

                                          {nagar.shakhas.map(shakha => {
                                            const shakhaKey = `${nagarKey}:${shakha.centre}`;
                                            return (
                                              <Fragment key={shakha.centre}>
                                                <GroupHeader
                                                  label={`Shakha: ${shakha.centre}`}
                                                  count={shakha.members.length}
                                                  collapsed={collapsedGroups.has(shakhaKey)}
                                                  onToggle={() => toggleGroup(shakhaKey)}
                                                  tier="shakha"
                                                />
                                                {!collapsedGroups.has(shakhaKey) && shakha.members.map(m => <MemberRow key={m.id} m={m} />)}
                                              </Fragment>
                                            );
                                          })}
                                        </>
                                      )}
                                    </Fragment>
                                  );
                                })}
                              </>
                            )}
                          </Fragment>
                          );
                        })}
                      </Fragment>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
