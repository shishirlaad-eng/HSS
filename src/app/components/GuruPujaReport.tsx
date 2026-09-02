// ─────────────────────────────────────────────────────────────
// HSS UK — Guru Puja Report
// Reconciliation report for Guru Purnima utsav Shakhas: Cash + Cheque income
// per age category, banking details, and whether the paperwork is complete.
// Distinct from the separate "Guru Purnima Cash Income" feature.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import { Calculator, ClipboardList, Pencil } from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  PrimaryButton,
  Pagination,
  AdvancedSearchPanel,
  useStickyListingHeader,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import { FormModal, FormField, FormLabel, FormInput, ErrorText } from './hb/common';
import { mockSessions, ShakhaSession } from '../../mockAPI/attendanceData';
import { AgeGroup, AGE_GROUP_LABELS } from '../../mockAPI/membersData';
import {
  GuruPujaAmount,
  GuruPujaReportEntry,
  getGuruPujaReportEntry,
  mockGuruPujaReportEntries,
  saveGuruPujaReportEntry,
} from '../../mockAPI/guruPujaReportData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { formatDate as fmtDate } from '../../utils/formatDate';
import { toast } from 'sonner';

const AGE_GROUP_ORDER: AgeGroup[] = ['bal', 'shishu', 'kishor', 'tarun', 'yuva', 'jyestha'];

function fmtMoney(n: number) {
  return `£${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shakhaStatusPill(status: ShakhaSession['status']) {
  if (status === 'completed') {
    return { label: 'Completed', cls: 'bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-800' };
  }
  return { label: 'Active', cls: 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 border-primary-200 dark:border-primary-800' };
}

function reportStatusPill(isComplete: boolean) {
  return isComplete
    ? { label: 'Completed', cls: 'bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-800' }
    : { label: 'Pending', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
}

type AmountForm = Record<AgeGroup, { cash: string; cheque: string }>;

const EMPTY_AMOUNTS: AmountForm = AGE_GROUP_ORDER.reduce((acc, g) => ({ ...acc, [g]: { cash: '', cheque: '' } }), {} as AmountForm);

// ── Edit popup ──────────────────────────────────────────────────

function GuruPujaReportModal({
  session,
  entry,
  onClose,
  onSave,
}: {
  session: ShakhaSession;
  entry?: GuruPujaReportEntry;
  onClose: () => void;
  onSave: (data: Omit<GuruPujaReportEntry, 'id' | 'recordedAt'>) => void;
}) {
  const [amounts, setAmounts] = useState<AmountForm>(
    entry
      ? AGE_GROUP_ORDER.reduce((acc, g) => ({
          ...acc,
          [g]: { cash: String(entry.amounts[g]?.cash ?? ''), cheque: String(entry.amounts[g]?.cheque ?? '') },
        }), {} as AmountForm)
      : EMPTY_AMOUNTS,
  );
  const [dateBanked, setDateBanked] = useState(entry?.dateBanked ?? '');
  const [bankedBy, setBankedBy] = useState(entry?.bankedBy ?? '');
  const [payingInRefNo, setPayingInRefNo] = useState(entry?.payingInRefNo ?? '');
  const [isComplete, setIsComplete] = useState(entry?.isComplete ?? false);
  const [touched, setTouched] = useState(false);

  const setAmount = (g: AgeGroup, channel: 'cash' | 'cheque', v: string) =>
    setAmounts(p => ({ ...p, [g]: { ...p[g], [channel]: v } }));

  const num = (v: string) => parseFloat(v) || 0;

  const totalCash   = useMemo(() => AGE_GROUP_ORDER.reduce((sum, g) => sum + num(amounts[g].cash), 0), [amounts]);
  const totalCheque = useMemo(() => AGE_GROUP_ORDER.reduce((sum, g) => sum + num(amounts[g].cheque), 0), [amounts]);
  const totalIncome = totalCash + totalCheque;

  const amountErrors = AGE_GROUP_ORDER.some(g =>
    (amounts[g].cash !== '' && (isNaN(Number(amounts[g].cash)) || Number(amounts[g].cash) < 0)) ||
    (amounts[g].cheque !== '' && (isNaN(Number(amounts[g].cheque)) || Number(amounts[g].cheque) < 0))
  );

  const handleSubmit = () => {
    setTouched(true);
    if (amountErrors) {
      toast.error('Please fix the highlighted amounts.');
      return;
    }
    const roundedAmounts = AGE_GROUP_ORDER.reduce((acc, g) => ({
      ...acc,
      [g]: {
        cash: Math.round(num(amounts[g].cash) * 100) / 100,
        cheque: Math.round(num(amounts[g].cheque) * 100) / 100,
      } as GuruPujaAmount,
    }), {} as Record<AgeGroup, GuruPujaAmount>);

    onSave({
      sessionId: session.id,
      amounts: roundedAmounts,
      dateBanked: dateBanked || undefined,
      bankedBy: bankedBy || undefined,
      payingInRefNo: payingInRefNo || undefined,
      isComplete,
    });
  };

  const fieldCls = (err: boolean) =>
    `w-full text-sm rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
      touched && err
        ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
        : 'border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400'
    }`;

  return (
    <FormModal
      isOpen
      onClose={onClose}
      title="Guru Puja Report"
      description={`${session.activityCentre} · ${fmtDate(session.date)}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Income by Age Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AGE_GROUP_ORDER.map(g => {
              const cashErr = touched && amounts[g].cash !== '' && (isNaN(Number(amounts[g].cash)) || Number(amounts[g].cash) < 0);
              const chequeErr = touched && amounts[g].cheque !== '' && (isNaN(Number(amounts[g].cheque)) || Number(amounts[g].cheque) < 0);
              return (
                <div key={g} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{AGE_GROUP_LABELS[g]}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FormLabel>Cash</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">£</span>
                        <input
                          type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00"
                          value={amounts[g].cash}
                          onChange={e => setAmount(g, 'cash', e.target.value)}
                          className={`${fieldCls(cashErr)} pl-6`}
                        />
                      </div>
                      <ErrorText>{cashErr && 'Invalid amount.'}</ErrorText>
                    </div>
                    <div>
                      <FormLabel>Cheque</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">£</span>
                        <input
                          type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00"
                          value={amounts[g].cheque}
                          onChange={e => setAmount(g, 'cheque', e.target.value)}
                          className={`${fieldCls(chequeErr)} pl-6`}
                        />
                      </div>
                      <ErrorText>{chequeErr && 'Invalid amount.'}</ErrorText>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="px-4 py-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
            <p className="text-xs text-primary-700 dark:text-primary-300">Total Cash Income</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">{fmtMoney(totalCash)}</p>
          </div>
          <div className="px-4 py-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
            <p className="text-xs text-primary-700 dark:text-primary-300">Total Cheque Income</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">{fmtMoney(totalCheque)}</p>
          </div>
          <div className="px-4 py-3 rounded-lg bg-neutral-900 dark:bg-white">
            <p className="text-xs text-neutral-300 dark:text-neutral-600 flex items-center gap-1"><Calculator className="w-3 h-3" /> Total Income</p>
            <p className="text-lg font-bold text-white dark:text-neutral-900">{fmtMoney(totalIncome)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField>
            <FormLabel>Date Banked</FormLabel>
            <FormInput type="date" value={dateBanked} onChange={e => setDateBanked(e.target.value)} />
          </FormField>
          <FormField>
            <FormLabel>Banked By</FormLabel>
            <FormInput value={bankedBy} onChange={e => setBankedBy(e.target.value)} placeholder="Name" />
          </FormField>
          <FormField>
            <FormLabel>Paying In Ref No</FormLabel>
            <FormInput value={payingInRefNo} onChange={e => setPayingInRefNo(e.target.value)} placeholder="Reference" />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={isComplete}
            onChange={e => setIsComplete(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500/30"
          />
          Guru Puja Report is all complete
        </label>

        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-lg font-semibold bg-[#172E4D] hover:bg-[#172E4D]/80 text-white transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </FormModal>
  );
}

// ── Main component ────────────────────────────────────────────

export default function GuruPujaReport() {
  const { scope } = useRoleScope();
  const scopedFilterOptions = getScopedFilterOptions(scope);

  const [entries, setEntries] = useState<GuruPujaReportEntry[]>(mockGuruPujaReportEntries);
  const [editingSession, setEditingSession] = useState<ShakhaSession | null>(null);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  const scopedSessions = useMemo(
    () => filterByScope(mockSessions, scope).filter(s =>
      s.utsav === 'Guru Purnima' && (s.status === 'scheduled' || s.status === 'completed')
    ),
    [scope],
  );

  const entryFor = (sessionId: string) => entries.find(e => e.sessionId === sessionId);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedSessions.filter(s => {
      const matchSearch = !q ||
        s.activityCentre.toLowerCase().includes(q) ||
        s.town.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q);

      const evalFilter = (f: FilterCondition): boolean => {
        switch (f.field) {
          case 'Vibhag': return f.values.includes(s.region);
          case 'Nagar':   return f.values.includes(s.town);
          case 'Shakha':  return f.values.includes(s.activityCentre);
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
  }, [scopedSessions, searchQuery, filters]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.date.localeCompare(a.date)), [filtered]);

  const paginated = useMemo(() => {
    if (itemsPerPage === 0) return sorted;
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(sorted.length / itemsPerPage));

  const handleSave = (data: Omit<GuruPujaReportEntry, 'id' | 'recordedAt'>) => {
    const saved = saveGuruPujaReportEntry(data);
    setEntries(prev => {
      const idx = prev.findIndex(e => e.sessionId === saved.sessionId);
      if (idx === -1) return [saved, ...prev];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
    toast.success('Guru Puja Report saved.');
    setEditingSession(null);
  };

  const filterOptions: Record<string, string[]> = {
    ...(scope.showRegionFilter ? { 'Vibhag': scopedFilterOptions.regionOptions } : {}),
    ...(scope.showTownFilter   ? { 'Nagar':   scopedFilterOptions.townOptions   } : {}),
    ...(scope.showCentreFilter ? { 'Shakha':  scopedFilterOptions.centreOptions } : {}),
  };

  const hasFilters = searchQuery.length > 0 || filters.some(f => f.values.length > 0);

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
          <PageHeader
            title="Guru Puja Report"
            subtitle="Reconcile Cash and Cheque income collected at Guru Purnima Shakhas."
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
                title="Filter Guru Puja Report"
              />
            </div>
          </PageHeader>
        </div>

        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  {['Date', 'Shakha', 'Shakha Status', 'Attendance', 'Report Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.length > 0 ? paginated.map(s => {
                  const entry = entryFor(s.id);
                  const shakhaStatus = shakhaStatusPill(s.status);
                  const reportStatus = reportStatusPill(entry?.isComplete ?? false);
                  const present = s.attendanceRecords.filter(r => r.status === 'present').length;
                  return (
                    <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{fmtDate(s.date)}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{s.activityCentre}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${shakhaStatus.cls}`}>
                          {shakhaStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{present}/{s.totalExpected}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${reportStatus.cls}`}>
                          {reportStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <PrimaryButton icon={Pencil} onClick={() => setEditingSession(s)}>Edit</PrimaryButton>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {hasFilters ? 'No Guru Purnima Shakhas match your search.' : 'No Guru Purnima Shakhas recorded yet.'}
                        </p>
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

      {editingSession && (
        <GuruPujaReportModal
          session={editingSession}
          entry={entryFor(editingSession.id)}
          onClose={() => setEditingSession(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
