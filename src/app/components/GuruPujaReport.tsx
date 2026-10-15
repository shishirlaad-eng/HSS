// ─────────────────────────────────────────────────────────────
// HSS UK — Guru Puja Report
// Reconciliation report for Guru Purnima utsav Shakhas: Cash + Cheque Dakshina
// per age category, banking details, and whether the paperwork is complete.
// Distinct from the separate "Guru Purnima Cash Income" feature.
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import { Calculator, ClipboardList, Pencil, MoreVertical, FileSpreadsheet } from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  PrimaryButton,
  IconButton,
  Pagination,
  AdvancedSearchPanel,
  useStickyListingHeader,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import { FormModal, FormField, FormLabel, FormInput, ErrorText } from './hb/common';
import ReportDateFilter, { inDateRange } from './ReportDateFilter';
import { mockSessions, ShakhaSession } from '../../mockAPI/attendanceData';
import { AgeGroup } from '../../mockAPI/membersData';
import {
  GuruPujaAmount,
  GuruPujaReportEntry,
  getGuruPujaReportEntry,
  mockGuruPujaReportEntries,
  saveGuruPujaReportEntry,
} from '../../mockAPI/guruPujaReportData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { useReportLocationFilters } from './useReportLocationFilters';
import { formatDate as fmtDate } from '../../utils/formatDate';
import { toast } from 'sonner';

const AGE_GROUP_ORDER: AgeGroup[] = ['shishu', 'bal', 'kishor', 'tarun', 'yuva', 'jyestha'];

// Age-category definitions specific to the Guru Puja Report — labels with bracketed years
const GURU_PUJA_AGE_GROUP_INFO: Record<AgeGroup, { name: string; fullLabel: string; range: string }> = {
  shishu:  { name: 'Shishu',     fullLabel: 'Shishu (0 - 5 years)',            range: '0 - 5 yrs' },
  bal:     { name: 'Bal(ika)',   fullLabel: 'Bal(ika) (6 - 12 years)',          range: '6 - 12 yrs' },
  kishor:  { name: 'Kishor(i)',  fullLabel: 'Kishor(i) (12 - 16 years)',        range: '12 - 16 yrs' },
  tarun:   { name: 'Tarun(i)',   fullLabel: 'Tarun(i) (16 - 29 years)',         range: '16 - 29 yrs' },
  yuva:    { name: 'Yuva(ti)',   fullLabel: 'Yuva(ti) (30 - 59 years)',         range: '30 - 59 yrs' },
  jyestha: { name: 'Jyestha(a)', fullLabel: 'Jyestha(a) (60 years and older)',  range: '60+ yrs' },
};



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
  const { selectedRole } = useRoleScope();
  const isSuperAdmin = selectedRole === 'Super Admin';

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
  const [isEditing, setIsEditing] = useState(!entry);

  const setAmount = (g: AgeGroup, channel: 'cash' | 'cheque', v: string) =>
    setAmounts(p => ({ ...p, [g]: { ...p[g], [channel]: v } }));

  const num = (v: string) => parseFloat(v) || 0;

  const totalCash     = useMemo(() => AGE_GROUP_ORDER.reduce((sum, g) => sum + num(amounts[g].cash), 0), [amounts]);
  const totalCheque   = useMemo(() => AGE_GROUP_ORDER.reduce((sum, g) => sum + num(amounts[g].cheque), 0), [amounts]);
  const totalDakshina = totalCash + totalCheque;

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="px-4 py-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
            <p className="text-xs text-primary-700 dark:text-primary-300">Total Cash Dakshina</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">{fmtMoney(totalCash)}</p>
          </div>
          <div className="px-4 py-3 rounded-lg bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
            <p className="text-xs text-primary-700 dark:text-primary-300">Total Cheque Dakshina</p>
            <p className="text-lg font-bold text-primary-900 dark:text-primary-100">{fmtMoney(totalCheque)}</p>
          </div>
          <div className="px-4 py-3 rounded-lg bg-neutral-900 dark:bg-white">
            <p className="text-xs text-neutral-300 dark:text-neutral-600 flex items-center gap-1"><Calculator className="w-3 h-3" /> Total Dakshina</p>
            <p className="text-lg font-bold text-white dark:text-neutral-900">{fmtMoney(totalDakshina)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Dakshina by Age Category</h3>
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-3 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Age Category</span>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Cash</span>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Cheque</span>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {AGE_GROUP_ORDER.map(g => {
                const cashErr = touched && amounts[g].cash !== '' && (isNaN(Number(amounts[g].cash)) || Number(amounts[g].cash) < 0);
                const chequeErr = touched && amounts[g].cheque !== '' && (isNaN(Number(amounts[g].cheque)) || Number(amounts[g].cheque) < 0);
                return (
                  <div key={g} className="grid grid-cols-3 gap-3 px-3 py-3 items-start">
                    <div className="pt-2">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{GURU_PUJA_AGE_GROUP_INFO[g].fullLabel}</p>
                    </div>
                    {isEditing ? (
                      <>
                        <div>
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
                      </>
                    ) : (
                      <>
                        <p className="pt-2 text-sm text-neutral-700 dark:text-neutral-300">{fmtMoney(num(amounts[g].cash))}</p>
                        <p className="pt-2 text-sm text-neutral-700 dark:text-neutral-300">{fmtMoney(num(amounts[g].cheque))}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isEditing ? (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Date Banked</p>
              <p className="text-sm text-neutral-900 dark:text-white mt-0.5">{dateBanked ? fmtDate(dateBanked) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Banked By</p>
              <p className="text-sm text-neutral-900 dark:text-white mt-0.5">{bankedBy || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Paying In Ref No</p>
              <p className="text-sm text-neutral-900 dark:text-white mt-0.5">{payingInRefNo || '—'}</p>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            <label className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isComplete}
                onChange={e => setIsComplete(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500/30"
              />
              <div>
                <span className="font-medium text-neutral-900 dark:text-white">Guru Puja Report is all complete</span>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Once this is checked and marked as complete the report will be locked and will no longer be editable.
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Guru Puja Report is all complete:</span>
              <span className={`font-semibold ${isComplete ? 'text-success-700 dark:text-success-400' : 'text-neutral-900 dark:text-white'}`}>
                {isComplete ? 'Yes' : 'No'}
              </span>
              {isComplete && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  Locked
                </span>
              )}
            </div>
            {isComplete && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {isSuperAdmin
                  ? 'This report is completed and locked. As Super Admin, you can unlock and edit it.'
                  : 'Once this is checked and marked as complete the report will be locked and will no longer be editable. Only Super Admin can unlock and edit completed reports.'}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          {isEditing ? (
            <>
              <button
                onClick={() => (entry ? setIsEditing(false) : onClose())}
                className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-lg font-semibold bg-[#172E4D] hover:bg-[#172E4D]/80 text-white transition-colors">
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                Close
              </button>
              {(!entry?.isComplete || isSuperAdmin) && (
                <PrimaryButton icon={Pencil} onClick={() => setIsEditing(true)}>
                  {entry?.isComplete ? 'Unlock & Edit' : 'Edit'}
                </PrimaryButton>
              )}
            </>
          )}
        </div>
      </div>
    </FormModal>
  );
}

// ── Main component ────────────────────────────────────────────

export default function GuruPujaReport() {
  const {
    scope,
    region: filterRegion, town: filterTown, centre: filterCentre,
    setRegion: setFilterRegion, setTown: setFilterTown, setCentre: setFilterCentre,
    regionOptions, townOptions, centreOptions,
    regionLocked, townLocked, centreLocked,
    regionDisabled, townDisabled, centreDisabled,
  } = useReportLocationFilters();
  const scopedFilterOptions = getScopedFilterOptions(scope);

  const [entries, setEntries] = useState<GuruPujaReportEntry[]>(mockGuruPujaReportEntries);
  const [editingSession, setEditingSession] = useState<ShakhaSession | null>(null);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Sort state — first 5 cols + last col (Report Status) sortable
  type SortField = 'date' | 'activityCentre' | 'town' | 'region' | 'status' | 'reportStatus';
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, filterRegion, filterTown, filterCentre, dateStart, dateEnd]);

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

      // Quick location filters
      if (filterRegion && s.region !== filterRegion) return false;
      if (filterTown   && s.town   !== filterTown)   return false;
      if (filterCentre && s.activityCentre !== filterCentre) return false;

      // Date range filter
      if (!inDateRange(s.date, dateStart, dateEnd)) return false;

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
  }, [scopedSessions, searchQuery, filters, filterRegion, filterTown, filterCentre, dateStart, dateEnd]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal = '';
      let bVal = '';
      const entryA = entries.find(e => e.sessionId === a.id);
      const entryB = entries.find(e => e.sessionId === b.id);
      switch (sortField) {
        case 'date':           aVal = a.date;           bVal = b.date;           break;
        case 'activityCentre': aVal = a.activityCentre; bVal = b.activityCentre; break;
        case 'town':           aVal = a.town;           bVal = b.town;           break;
        case 'region':         aVal = a.region;         bVal = b.region;         break;
        case 'status':         aVal = a.status;         bVal = b.status;         break;
        case 'reportStatus':
          aVal = (entryA?.isComplete ? '1' : '0');
          bVal = (entryB?.isComplete ? '1' : '0');
          break;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir, entries]);

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
    toast.success(data.isComplete ? 'Guru Puja Report saved and locked.' : 'Guru Puja Report saved.');
    setEditingSession(null);
  };

  const handleExportCSV = () => {
    if (!sorted.length) { toast.error('No data to export.'); return; }
    const headers = [
      'Date', 'Shakha', 'Nagar', 'Vibhag', 'Shakha Status',
      ...AGE_GROUP_ORDER.map(g => `${GURU_PUJA_AGE_GROUP_INFO[g].name} Dakshina`),
      'Total Dakshina',
      'Sankhya',
      'Report Status',
      ...AGE_GROUP_ORDER.flatMap(g => [`${GURU_PUJA_AGE_GROUP_INFO[g].name} Cash`, `${GURU_PUJA_AGE_GROUP_INFO[g].name} Cheque`]),
      'Total Cash', 'Total Cheque', 'Total Dakshina',
      'Date Banked', 'Banked By', 'Paying In Ref No',
    ];
    const rows = sorted.map(s => {
      const entry = entryFor(s.id);
      const shakhaStatus = shakhaStatusPill(s.status);
      const reportStatus = reportStatusPill(entry?.isComplete ?? false);
      const present = s.attendanceRecords.filter(r => r.status === 'present').length;
      const amounts = entry?.amounts;
      const ageDakshina = AGE_GROUP_ORDER.map(g => (amounts?.[g]?.cash ?? 0) + (amounts?.[g]?.cheque ?? 0));
      const totalDakshina = ageDakshina.reduce((a, b) => a + b, 0);
      const totalCash = amounts ? AGE_GROUP_ORDER.reduce((sum, g) => sum + (amounts[g]?.cash ?? 0), 0) : 0;
      const totalCheque = amounts ? AGE_GROUP_ORDER.reduce((sum, g) => sum + (amounts[g]?.cheque ?? 0), 0) : 0;
      return [
        fmtDate(s.date),
        `"${s.activityCentre}"`,
        `"${s.town}"`,
        `"${s.region}"`,
        shakhaStatus.label,
        ...ageDakshina.map(v => v.toFixed(2)),
        totalDakshina.toFixed(2),
        present,
        reportStatus.label,
        ...AGE_GROUP_ORDER.flatMap(g => [
          (amounts?.[g]?.cash ?? 0).toFixed(2),
          (amounts?.[g]?.cheque ?? 0).toFixed(2),
        ]),
        totalCash.toFixed(2),
        totalCheque.toFixed(2),
        totalDakshina.toFixed(2),
        entry?.dateBanked ? fmtDate(entry.dateBanked) : '',
        entry?.bankedBy ? `"${entry.bankedBy}"` : '',
        entry?.payingInRefNo ? `"${entry.payingInRefNo}"` : '',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guru-puja-report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported.');
  };

  const filterOptions: Record<string, string[]> = {
    ...(scope.showRegionFilter ? { 'Vibhag': scopedFilterOptions.regionOptions } : {}),
    ...(scope.showTownFilter   ? { 'Nagar':   scopedFilterOptions.townOptions   } : {}),
    ...(scope.showCentreFilter ? { 'Shakha':  scopedFilterOptions.centreOptions } : {}),
  };

  const hasFilters =
    searchQuery.length > 0 ||
    filters.some(f => f.values.length > 0) ||
    !!((filterRegion && !regionLocked) || (filterTown && !townLocked) || (filterCentre && !centreLocked)) ||
    !!dateStart;
  const clearQuickFilters = () => {
    setFilterRegion('');
    setFilterTown('');
    setFilterCentre('');
    setDateStart('');
    setDateEnd('');
    setDateLabel('');
  };

  // Sort arrow helper
  const sortArrow = (field: SortField) => {
    if (sortField !== field) return <span className="ml-1 text-neutral-300 dark:text-neutral-600">↕</span>;
    return <span className="ml-1 text-primary-600 dark:text-primary-400">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
          <PageHeader
            title="Guru Puja Report"
            subtitle="Reconcile Cash and Cheque Dakshina collected at Guru Purnima Shakhas."
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
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: FileSpreadsheet, label: 'Export as CSV', onClick: handleExportCSV },
              ]}
            />
          </PageHeader>

          {/* Quick location filters + Date range */}
          <div className="flex flex-wrap items-center gap-2 pb-3">
            <ReportDateFilter
              start={dateStart}
              end={dateEnd}
              label={dateLabel}
              onChange={(s, e, l) => { setDateStart(s); setDateEnd(e); setDateLabel(l); }}
              title="Filter by Guru Puja Date"
              emptyLabel="Date"
              includeFuture={true}
            />

            <select
              disabled={regionDisabled}
              value={filterRegion}
              onChange={e => { setFilterRegion(e.target.value); setFilterTown(''); setFilterCentre(''); }}
              className="disabled:opacity-50 disabled:cursor-not-allowed h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[150px]"
            >
              <option value="">All Vibhags</option>
              {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              disabled={townDisabled}
              value={filterTown}
              onChange={e => { setFilterTown(e.target.value); setFilterCentre(''); }}
              className="disabled:opacity-50 disabled:cursor-not-allowed h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[130px]"
            >
              <option value="">All Nagars</option>
              {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              disabled={centreDisabled}
              value={filterCentre}
              onChange={e => setFilterCentre(e.target.value)}
              className="disabled:opacity-50 disabled:cursor-not-allowed h-9 pl-3 pr-7 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[160px]"
            >
              <option value="">All Shakhas</option>
              {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {(((filterRegion && !regionLocked) || (filterTown && !townLocked) || (filterCentre && !centreLocked)) || !!dateStart) && (
              <button
                onClick={clearQuickFilters}
                className="flex items-center gap-1.5 h-9 px-3 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
          <div className="sticky-table-scroll slim-scroll">
            <table className="w-full min-w-max text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  {([
                    { label: 'Date',         field: 'date'          },
                    { label: 'Shakha',       field: 'activityCentre'},
                    { label: 'Nagar',        field: 'town'          },
                    { label: 'Vibhag',       field: 'region'        },
                    { label: 'Shakha Status',field: 'status'        },
                  ] as { label: string; field: SortField }[]).map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => handleSort(field)}
                      className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {label}{sortArrow(field)}
                    </th>
                  ))}
                  {AGE_GROUP_ORDER.map(g => (
                    <th key={g} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      {GURU_PUJA_AGE_GROUP_INFO[g].name}
                      <span className="block text-[10px] font-normal text-neutral-400 dark:text-neutral-500">{GURU_PUJA_AGE_GROUP_INFO[g].range}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">Sankhya</th>
                  <th
                    onClick={() => handleSort('reportStatus')}
                    className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Report Status{sortArrow('reportStatus')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.length > 0 ? paginated.map(s => {
                  const entry = entryFor(s.id);
                  const shakhaStatus = shakhaStatusPill(s.status);
                  const reportStatus = reportStatusPill(entry?.isComplete ?? false);
                  const present = s.attendanceRecords.filter(r => r.status === 'present').length;
                  const totalDakshina = entry
                    ? AGE_GROUP_ORDER.reduce((sum, g) => sum + (entry.amounts[g]?.cash ?? 0) + (entry.amounts[g]?.cheque ?? 0), 0)
                    : 0;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setEditingSession(s)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{fmtDate(s.date)}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{s.activityCentre}</td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{s.town}</td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{s.region}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${shakhaStatus.cls} whitespace-nowrap`}>
                          {shakhaStatus.label}
                        </span>
                      </td>
                      {AGE_GROUP_ORDER.map(g => {
                        const dakshina = entry ? (entry.amounts[g]?.cash ?? 0) + (entry.amounts[g]?.cheque ?? 0) : 0;
                        return (
                          <td key={g} className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            {entry ? fmtMoney(dakshina) : '—'}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white whitespace-nowrap">
                        {entry ? fmtMoney(totalDakshina) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {present}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${reportStatus.cls} whitespace-nowrap`}>
                          {reportStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={14} className="px-6 py-20 text-center">
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
