// ─────────────────────────────────────────────────────────────
// HSS UK — Guru Purnima Cash Income
// Lets Shakha/Nagar/Vibhag (and Kendriya/Super) Admins record the cash
// collected at a completed Guru Purnima utsav Shakha, broken down by age
// category, and view the historical record of what's been collected.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Eye,
  MoreVertical,
  FileSpreadsheet,
  BarChart3,
  ChevronLeft,
  IndianRupee,
  Wallet,
  Receipt,
  Calculator,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  PrimaryButton,
  Pagination,
  AdvancedSearchPanel,
  useStickyListingHeader,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import { mockUtsavCashIncome, UtsavCashIncomeEntry } from '../../mockAPI/donationsData';
import { mockSessions } from '../../mockAPI/attendanceData';
import { AgeGroup, AGE_GROUP_LABELS } from '../../mockAPI/membersData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { formatDate as fmtDate } from '../../utils/formatDate';
import { ErrorText } from './hb/common';
import { toast } from 'sonner';

type PageState = 'list' | 'record';

const AGE_GROUP_ORDER: AgeGroup[] = ['bal', 'shishu', 'kishor', 'tarun', 'yuva', 'jyestha'];

function fmtMoney(n: number) {
  return `£${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function KpiCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">{value}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Record / Edit form ────────────────────────────────────────

type AmountForm = Record<AgeGroup, string>;

const EMPTY_AMOUNTS: AmountForm = { bal: '', shishu: '', kishor: '', tarun: '', yuva: '', jyestha: '' };

function CashIncomeForm({
  entry,
  scopedSessions,
  scopedEntries,
  onCancel,
  onSave,
}: {
  entry?: UtsavCashIncomeEntry;
  scopedSessions: typeof mockSessions;
  scopedEntries: UtsavCashIncomeEntry[];
  onCancel: () => void;
  onSave: (sessionId: string, amounts: AmountForm) => void;
}) {
  const isEdit = !!entry;
  const [sessionId, setSessionId] = useState(entry?.sessionId ?? '');
  const [amounts, setAmounts] = useState<AmountForm>(
    entry
      ? AGE_GROUP_ORDER.reduce((acc, g) => ({ ...acc, [g]: String(entry.amounts[g] ?? '') }), {} as AmountForm)
      : EMPTY_AMOUNTS,
  );
  const [touched, setTouched] = useState(false);

  // Completed Guru Purnima sessions in scope that don't already have an entry
  // — except the one this edit is already linked to.
  const eligibleSessions = useMemo(() => {
    const takenSessionIds = new Set(scopedEntries.filter(e => e.id !== entry?.id).map(e => e.sessionId));
    return scopedSessions.filter(s =>
      s.utsav === 'Guru Purnima' && s.status === 'completed' && !takenSessionIds.has(s.id)
    );
  }, [scopedSessions, scopedEntries, entry]);

  const selectedSession = scopedSessions.find(s => s.id === sessionId);

  const setAmount = (g: AgeGroup, v: string) => setAmounts(p => ({ ...p, [g]: v }));

  const total = useMemo(
    () => AGE_GROUP_ORDER.reduce((sum, g) => sum + (parseFloat(amounts[g]) || 0), 0),
    [amounts],
  );

  const sessionError = !sessionId;
  const amountErrors = AGE_GROUP_ORDER.some(g => amounts[g] !== '' && (isNaN(Number(amounts[g])) || Number(amounts[g]) < 0));
  const hasErrors = sessionError || amountErrors;

  const fieldCls = (err: boolean) =>
    `w-full text-sm rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
      touched && err
        ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
        : 'border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400'
    }`;

  const handleSubmit = () => {
    setTouched(true);
    if (hasErrors) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }
    onSave(sessionId, amounts);
  };

  return (
    <div className="p-6 pb-12 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <h2 className="text-[18px] font-semibold text-neutral-900 dark:text-white">
          {isEdit ? 'Edit Guru Purnima Cash Income' : 'Record Guru Purnima Cash Income'}
        </h2>
      </div>

      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Shakha Session</h3>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Guru Purnima Shakha <span className="text-red-500">*</span>
            </label>
            {isEdit ? (
              <input
                type="text"
                readOnly
                value={selectedSession ? `${selectedSession.title} · ${fmtDate(selectedSession.date)}` : sessionId}
                className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
              />
            ) : (
              <>
                <select value={sessionId} onChange={e => setSessionId(e.target.value)} className={fieldCls(sessionError)}>
                  <option value="">Select a completed Guru Purnima Shakha…</option>
                  {eligibleSessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title} · {fmtDate(s.date)}</option>
                  ))}
                </select>
                <ErrorText>{touched && sessionError && 'Please select the Shakha session where this was collected.'}</ErrorText>
                {eligibleSessions.length === 0 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                    No completed Guru Purnima Shakhas awaiting a cash income entry in your scope.
                  </p>
                )}
              </>
            )}
          </div>
          {selectedSession && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Shakha Location</label>
              <input
                type="text"
                readOnly
                value={`${selectedSession.activityCentre}, ${selectedSession.town}, ${selectedSession.region}`}
                className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Cash Income by Age Category</h3>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {AGE_GROUP_ORDER.map(g => {
              const err = touched && amounts[g] !== '' && (isNaN(Number(amounts[g])) || Number(amounts[g]) < 0);
              return (
                <div key={g}>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    {AGE_GROUP_LABELS[g]}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">£</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amounts[g]}
                      onChange={e => setAmount(g, e.target.value)}
                      className={`${fieldCls(err)} pl-6`}
                    />
                  </div>
                  <ErrorText>{err && 'Enter a valid non-negative amount.'}</ErrorText>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between px-5 py-4 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
            <div className="flex items-center gap-2 text-sm font-medium text-primary-900 dark:text-primary-200">
              <Calculator className="w-4 h-4" />
              Total Cash Income Collected
            </div>
            <span className="text-2xl font-bold text-primary-900 dark:text-primary-100">{fmtMoney(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-lg font-semibold bg-[#172E4D] hover:bg-[#172E4D]/80 text-white transition-colors">
          {isEdit ? 'Save Changes' : 'Record Cash Income'}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function UtsavCashIncome() {
  const { scope, selectedRole } = useRoleScope();
  const canRecord = ['Shakha Admin', 'Nagar Admin', 'Vibhag Admin', 'Kendriya Admin', 'Super Admin'].includes(selectedRole);
  const scopedFilterOptions = getScopedFilterOptions(scope);

  const [entries, setEntries] = useState<UtsavCashIncomeEntry[]>(mockUtsavCashIncome);
  const [pageState, setPageState] = useState<PageState>('list');
  const [selected, setSelected] = useState<UtsavCashIncomeEntry | null>(null);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  const scopedEntries  = useMemo(() => filterByScope(entries, scope), [entries, scope]);
  const scopedSessions = useMemo(() => filterByScope(mockSessions, scope), [scope]);

  const sessionFor = (sessionId: string) => mockSessions.find(s => s.id === sessionId);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedEntries.filter(e => {
      const session = sessionFor(e.sessionId);
      const matchSearch = !q ||
        e.id.toLowerCase().includes(q) ||
        e.activityCentre.toLowerCase().includes(q) ||
        e.town.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        (session?.title.toLowerCase().includes(q) ?? false);

      const evalFilter = (f: FilterCondition): boolean => {
        switch (f.field) {
          case 'Vibhag': return f.values.includes(e.region);
          case 'Nagar':   return f.values.includes(e.town);
          case 'Shakha':  return f.values.includes(e.activityCentre);
          default:        return true;
        }
      };
      const activeFilters = filters.filter(f => f.values.length > 0);
      const matchFilters = activeFilters.length === 0
        ? true
        : activeFilters.reduce<boolean>((acc, f, i) => {
            if (i === 0) return evalFilter(f);
            return f.logicOp === 'OR' ? (acc || evalFilter(f)) : (acc && evalFilter(f));
          }, true);
      return matchSearch && matchFilters;
    });
  }, [scopedEntries, searchQuery, filters]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
    [filtered],
  );

  const paginated = useMemo(() => {
    if (itemsPerPage === 0) return sorted;
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(sorted.length / itemsPerPage));

  const totalCollected = useMemo(() => filtered.reduce((sum, e) => sum + e.total, 0), [filtered]);
  const entriesRecorded = filtered.length;
  const avgPerSession = entriesRecorded > 0 ? totalCollected / entriesRecorded : 0;

  // ── Handlers ─────────────────────────────────────────────────

  const nextId = () => `UCI-${String(entries.length + 1).padStart(3, '0')}`;

  const handleSave = (sessionId: string, amountsForm: AmountForm) => {
    const session = sessionFor(sessionId) ?? sessionFor(selected?.sessionId ?? '');
    const amounts = AGE_GROUP_ORDER.reduce((acc, g) => {
      acc[g] = Math.round((parseFloat(amountsForm[g]) || 0) * 100) / 100;
      return acc;
    }, {} as Record<AgeGroup, number>);
    const total = Math.round(AGE_GROUP_ORDER.reduce((sum, g) => sum + amounts[g], 0) * 100) / 100;

    if (selected) {
      const updated: UtsavCashIncomeEntry = { ...selected, amounts, total };
      setEntries(prev => prev.map(e => e.id === selected.id ? updated : e));
      toast.success('Cash income entry updated.');
    } else {
      const created: UtsavCashIncomeEntry = {
        id: nextId(),
        sessionId,
        utsav: 'Guru Purnima',
        date: session?.date ?? new Date().toISOString().slice(0, 10),
        country: scope.country ?? 'HSS UK',
        region: session?.region ?? scope.region ?? '',
        town: session?.town ?? scope.town ?? '',
        activityCentre: session?.activityCentre ?? scope.centre ?? '',
        amounts,
        total,
        recordedAt: new Date().toISOString(),
      };
      setEntries(prev => [created, ...prev]);
      toast.success('Cash income recorded successfully.');
    }
    setPageState('list');
    setSelected(null);
  };

  const handleExportCSV = () => {
    if (!filtered.length) { toast.error('No data to export.'); return; }
    const headers = ['ID', 'Date', 'Shakha', 'Nagar', 'Vibhag', ...AGE_GROUP_ORDER.map(g => AGE_GROUP_LABELS[g]), 'Total'];
    const csv = [
      headers.join(','),
      ...sorted.map(e => [
        e.id,
        fmtDate(e.date),
        `"${e.activityCentre}"`,
        `"${e.town}"`,
        `"${e.region}"`,
        ...AGE_GROUP_ORDER.map(g => e.amounts[g].toFixed(2)),
        e.total.toFixed(2),
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `guru-purnima-cash-income_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported.');
  };

  // ── Record / Edit sub-page ─────────────────────────────────────

  if (pageState === 'record') {
    return (
      <CashIncomeForm
        entry={selected ?? undefined}
        scopedSessions={scopedSessions}
        scopedEntries={scopedEntries}
        onCancel={() => { setPageState('list'); setSelected(null); }}
        onSave={handleSave}
      />
    );
  }

  // ── List ──────────────────────────────────────────────────────

  const filterOptions: Record<string, string[]> = {
    ...(scope.showRegionFilter ? { 'Vibhag': scopedFilterOptions.regionOptions } : {}),
    ...(scope.showTownFilter   ? { 'Nagar':   scopedFilterOptions.townOptions   } : {}),
    ...(scope.showCentreFilter ? { 'Shakha':  scopedFilterOptions.centreOptions } : {}),
  };

  const getRowMenu = (e: UtsavCashIncomeEntry) => [
    { icon: Eye,    label: 'View',   onClick: () => { setSelected(e); setPageState('record'); } },
    ...(canRecord ? [
      { icon: Pencil, label: 'Edit', onClick: () => { setSelected(e); setPageState('record'); } },
    ] : []),
  ];

  const hasFilters = searchQuery.length > 0 || filters.some(f => f.values.length > 0);

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
          <PageHeader
            title="Guru Purnima Cash Income"
            subtitle="Record and view cash income collected during Guru Purnima utsav Shakhas."
          >
            <div className="relative">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onAdvancedSearch={() => setShowAdvanced(true)}
                activeFilterCount={filters.filter(f => f.values.length > 0).length}
                placeholder="Search by Shakha, Nagar or Vibhag…"
              />
              <AdvancedSearchPanel
                isOpen={showAdvanced}
                onClose={() => setShowAdvanced(false)}
                filters={filters}
                onFiltersChange={setFilters}
                showMatchModeToggle
                filterOptions={filterOptions}
                title="Filter Cash Income"
              />
            </div>
            <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: FileSpreadsheet, label: 'Export as CSV', onClick: handleExportCSV },
              ]}
            />
            {canRecord && (
              <PrimaryButton icon={Plus} onClick={() => { setSelected(null); setPageState('record'); }}>
                Record Cash Income
              </PrimaryButton>
            )}
          </PageHeader>
        </div>

        {showSummary && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Total Collected"      value={fmtMoney(totalCollected)} icon={Wallet}      color="bg-primary-500" />
            <KpiCard label="Entries Recorded"      value={String(entriesRecorded)} icon={Receipt}     color="bg-info-500" />
            <KpiCard label="Average per Session"   value={fmtMoney(avgPerSession)} icon={IndianRupee} color="bg-success-500" />
          </div>
        )}

        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  {['ID', 'Date', 'Shakha', 'Nagar', 'Vibhag', ...AGE_GROUP_ORDER.map(g => AGE_GROUP_LABELS[g]), 'Total', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.length > 0 ? paginated.map(e => (
                  <tr
                    key={e.id}
                    onClick={() => { setSelected(e); setPageState('record'); }}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 font-mono whitespace-nowrap">{e.id}</td>
                    <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{fmtDate(e.date)}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{e.activityCentre}</td>
                    <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{e.town}</td>
                    <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{e.region}</td>
                    {AGE_GROUP_ORDER.map(g => (
                      <td key={g} className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{fmtMoney(e.amounts[g])}</td>
                    ))}
                    <td className="px-4 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white whitespace-nowrap">{fmtMoney(e.total)}</td>
                    <td className="px-4 py-3.5 text-right" onClick={ev => ev.stopPropagation()}>
                      <IconButton icon={MoreVertical} borderless title="More" menuItems={getRowMenu(e)} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6 + AGE_GROUP_ORDER.length + 2} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Wallet className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {hasFilters ? 'No cash income entries match your search.' : 'No Guru Purnima cash income recorded yet.'}
                        </p>
                        {canRecord && !hasFilters && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Record cash income using the button above.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {sorted.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sorted.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
