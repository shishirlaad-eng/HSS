// ─────────────────────────────────────────────────────────────
// HSS UK — Attendance Log
// ─────────────────────────────────────────────────────────────
import { Fragment, useState, useMemo, useRef } from 'react';
import {
  RefreshCw,
  BarChart3,
  FileSpreadsheet,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Users,
  CalendarDays,
  Clock,
  MapPin,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  Pagination,
  AdvancedSearchPanel,
  SummaryWidgets,
  FilterChips,
  DateRangeFilter,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import { mockSessions, SHAKHA_TYPES, getSessionShakhaType } from '../../mockAPI/attendanceData';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import { toast } from 'sonner';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { getScopedFilterOptions } from '../../mockAPI/roleScope';

// ── Constants ─────────────────────────────────────────────────
const ALL_REGIONS  = MASTERS_CASCADE.regions['HSS UK'] ?? [];
const ALL_TOWNS    = Object.values(MASTERS_CASCADE.towns).flat();
const ALL_CENTRES  = Object.values(MASTERS_CASCADE.centres).flat();

// ── Filter options for AdvancedSearchPanel ────────────────────
const FILTER_OPTIONS: Record<string, string[]> = {
  'Vibhaag':         ALL_REGIONS,
  'Nagar':           ALL_TOWNS.sort(),
  'Shakha':          ALL_CENTRES.sort(),
  'Shakha Type':     [...SHAKHA_TYPES],
  'Gender':          ['Male', 'Female'],
  'Age Category':    ['Shishu', 'Bal', 'Kishor', 'Tarun', 'Yuva', 'Jyestha'],
  'Role Type':       [],  // populated dynamically below
  'Status':          ['Present', 'Absent'],
};

// ── Flatten sessions → log entries ───────────────────────────
export interface LogEntry {
  memberId:   string;
  memberName: string;
  gender:     'male' | 'female';
  ageCategory: string;
  jobTitle:   string;
  sessionId:    string;
  sessionTitle: string;
  shakhaType:   string;
  date:         string;
  startTime:    string;
  endTime:      string;
  region:         string;
  town:           string;
  activityCentre: string;
  attendanceStatus: 'present' | 'absent';
  markedAt?: string;
}

function buildLogEntries(): LogEntry[] {
  const entries: LogEntry[] = [];
  mockSessions.forEach(session => {
    session.attendanceRecords.forEach(rec => {
      entries.push({
        memberId:   rec.memberId,
        memberName: rec.memberName,
        gender:     rec.gender,
        ageCategory: rec.ageCategory,
        jobTitle:   rec.jobTitle,
        sessionId:    session.id,
        sessionTitle: session.title,
        shakhaType:   getSessionShakhaType(session),
        date:         session.date,
        startTime:    session.startTime,
        endTime:      session.endTime,
        region:         session.region,
        town:           session.town,
        activityCentre: session.activityCentre,
        attendanceStatus: rec.status,
        markedAt: rec.markedAt,
      });
    });
  });
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

const ALL_LOG_ENTRIES = buildLogEntries();

// Unique role types for filter
const ALL_ROLE_TYPES = Array.from(new Set(ALL_LOG_ENTRIES.map(e => e.jobTitle))).sort();
FILTER_OPTIONS['Role Type'] = ALL_ROLE_TYPES;

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatMonth(iso: string) {
  return new Date(iso + '-01T12:00:00').toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  });
}

function formatMonthName(iso: string) {
  return new Date(iso + '-01T12:00:00').toLocaleDateString('en-GB', { month: 'long' });
}

type SortKey = 'memberName' | 'date' | 'activityCentre' | 'jobTitle' | 'attendanceStatus';
type SortDir = 'asc' | 'desc';

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: 'present' | 'absent' }) {
  return status === 'present' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400 border border-success-200 dark:border-success-800">
      <CheckCircle2 className="w-3 h-3" /> Present
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-700 dark:bg-error-950 dark:text-error-400 border border-error-200 dark:border-error-800">
      <XCircle className="w-3 h-3" /> Absent
    </span>
  );
}

// ── Sortable TH ───────────────────────────────────────────────
function SortTh({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th className="px-4 py-3 text-left whitespace-nowrap cursor-pointer select-none group" onClick={() => onSort(sortKey)}>
      <div className="flex items-center gap-1">
        <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200'}`}>
          {label}
        </span>
        {active
          ? dir === 'asc'
            ? <ArrowUp   className="w-3 h-3 text-primary-600 dark:text-primary-400" />
            : <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400" />
          : <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-60 text-neutral-400" />
        }
      </div>
    </th>
  );
}

// ── Date Range Bar ────────────────────────────────────────────
function DateRangeBar({
  dateFrom, dateTo,
  onFromChange, onToChange, onClear,
}: {
  dateFrom: string; dateTo: string;
  onFromChange: (v: string) => void;
  onToChange:   (v: string) => void;
  onClear: () => void;
}) {
  const hasRange = dateFrom || dateTo;
  return (
    <div className="flex items-center gap-3 px-1 pb-3">
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Date Range</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={e => onFromChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <span className="text-xs text-neutral-400">—</span>
        <div className="relative">
          <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={e => onToChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        {hasRange && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-neutral-500 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-950 rounded-lg transition-colors"
            title="Clear date range"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
      {hasRange && (
        <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
          {dateFrom && dateTo
            ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}`
            : dateFrom
              ? `From ${formatDate(dateFrom)}`
              : `Until ${formatDate(dateTo)}`
          }
        </span>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function AttendanceLog() {
  // ── Role scope ──────────────────────────────────────────────
  const { scope } = useRoleScope();
  const scopedFilterOptions = getScopedFilterOptions(scope);

  const [searchQuery,        setSearchQuery]        = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters,            setFilters]            = useState<FilterCondition[]>([]);
  const [dateFrom,           setDateFrom]           = useState('');
  const [dateTo,             setDateTo]             = useState('');
  const [dateRangeLabel,     setDateRangeLabel]     = useState('');
  const [showDateFilter,     setShowDateFilter]     = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const [showSummary,        setShowSummary]        = useState(true);
  const [sortKey,            setSortKey]            = useState<SortKey>('date');
  const [sortDir,            setSortDir]            = useState<SortDir>('desc');
  const [page,               setPage]               = useState(1);
  const [pageSize,           setPageSize]           = useState(15);
  const [collapsedYears,     setCollapsedYears]     = useState<Set<string>>(new Set());
  const [collapsedMonths,    setCollapsedMonths]    = useState<Set<string>>(new Set());

  const activeFilterCount = filters.filter(f => f.values.length > 0).length;

  // ── Filter + sort ─────────────────────────────────────────
  // Scope-filtered log entries (base dataset)
  const scopedLogEntries = useMemo(() => {
    // Member (18+) / Teen: only their own records
    if (scope.selfOnly && scope.selfMemberId) {
      return ALL_LOG_ENTRIES.filter(r => r.memberId === scope.selfMemberId);
    }
    if (scope.level === 'all') return ALL_LOG_ENTRIES;
    return ALL_LOG_ENTRIES.filter(r => {
      if (scope.level === 'national')  return r.region         === scope.region || scopedFilterOptions.regionOptions.includes(r.region);
      if (scope.level === 'regional')  return r.region         === scope.region;
      if (scope.level === 'town')      return r.town           === scope.town;
      if (scope.level === 'centre')    return r.activityCentre === scope.centre;
      return true;
    });
  }, [scope, scopedFilterOptions.regionOptions]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    let rows = scopedLogEntries.filter(r => {
      // Search
      if (q && !(
        r.memberName.toLowerCase().includes(q) ||
        r.jobTitle.toLowerCase().includes(q) ||
        r.activityCentre.toLowerCase().includes(q) ||
        r.sessionTitle.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q)
      )) return false;

      // Date range
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo   && r.date > dateTo)   return false;

      // Advanced filters
      for (const f of filters) {
        if (!f.values.length) continue;
        switch (f.field) {
          case 'Vibhaag':         if (!f.values.includes(r.region))                          return false; break;
          case 'Nagar':           if (!f.values.includes(r.town))                             return false; break;
          case 'Shakha':          if (!f.values.includes(r.activityCentre))                  return false; break;
          case 'Shakha Type':     if (!f.values.includes(r.shakhaType))                       return false; break;
          case 'Gender':          if (!f.values.map(v=>v.toLowerCase()).includes(r.gender))          return false; break;
          case 'Age Category':    if (!f.values.map(v=>v.toLowerCase()).includes(r.ageCategory)) return false; break;
          case 'Role Type':       if (!f.values.includes(r.jobTitle))                             return false; break;
          case 'Status':          if (!f.values.map(v=>v.toLowerCase()).includes(r.attendanceStatus)) return false; break;
        }
      }
      return true;
    });

    // Sort
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey] as string;
      const bv = b[sortKey] as string;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [searchQuery, filters, dateFrom, dateTo, sortKey, sortDir, scopedLogEntries]);

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = pageSize === 0 ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
  const monthTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filtered.forEach(entry => {
      const monthKey = entry.date.slice(0, 7);
      totals.set(monthKey, (totals.get(monthKey) ?? 0) + 1);
    });
    return totals;
  }, [filtered]);

  const yearTotals = useMemo(() => {
    const totals = new Map<string, number>();
    filtered.forEach(entry => {
      const yearKey = entry.date.slice(0, 4);
      totals.set(yearKey, (totals.get(yearKey) ?? 0) + 1);
    });
    return totals;
  }, [filtered]);

  const groupedPaginated = useMemo(() => {
    const yearMap = new Map<string, Map<string, LogEntry[]>>();
    paginated.forEach(entry => {
      const yearKey  = entry.date.slice(0, 4);
      const monthKey = entry.date.slice(0, 7);
      if (!yearMap.has(yearKey)) yearMap.set(yearKey, new Map());
      const monthMap = yearMap.get(yearKey)!;
      if (!monthMap.has(monthKey)) monthMap.set(monthKey, []);
      monthMap.get(monthKey)!.push(entry);
    });
    return Array.from(yearMap.entries()).map(([year, monthMap]) => ({
      year,
      totalEntries: yearTotals.get(year) ?? 0,
      months: Array.from(monthMap.entries()).map(([month, entries]) => ({
        month,
        entries,
        totalEntries: monthTotals.get(month) ?? 0,
      })),
    }));
  }, [paginated, monthTotals, yearTotals]);

  const toggleYear = (year: string) => {
    setCollapsedYears(previous => {
      const next = new Set(previous);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleMonth = (month: string) => {
    setCollapsedMonths(previous => {
      const next = new Set(previous);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  const presentCount = filtered.filter(r => r.attendanceStatus === 'present').length;
  const absentCount  = filtered.filter(r => r.attendanceStatus === 'absent').length;
  const rate         = filtered.length > 0 ? Math.round((presentCount / filtered.length) * 100) : 0;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!filtered.length) { toast.error('No data to export.'); return; }
    const header = 'Member,Role,Gender,Activity Centre,Town,Region,Shakha,Date,Start,End,Status';
    const rows = filtered.map(r =>
      [r.memberName, r.jobTitle, r.gender, r.activityCentre, r.town, r.region,
       `"${r.sessionTitle}"`, r.date, r.startTime, r.endTime, r.attendanceStatus].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'attendance-log.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Attendance log exported as CSV');
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">

        {/* ── PAGE HEADER ── */}
        <PageHeader
          title={scope.selfOnly ? "My Sankhya" : "Sankhya Log"}
          subtitle={scope.selfOnly ? "Your Personal Attendance Record" : "Complete record of member Sankhya across all Shakha gatherings."}
          >
          {/* Search + Advanced Filter panel — admin only */}
          {!scope.selfOnly && (
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setPage(1); }}
              onAdvancedSearch={() => setShowAdvancedSearch(true)}
              activeFilterCount={activeFilterCount}
              placeholder="Search member, role, centre, Shakha…"
            />
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
              filters={filters}
              onFiltersChange={f => { setFilters(f); setPage(1); }}
              filterOptions={{
                ...(scope.showRegionFilter  ? { 'Vibhaag':         scopedFilterOptions.regionOptions } : {}),
                ...(scope.showTownFilter    ? { 'Nagar':           scopedFilterOptions.townOptions }   : {}),
                ...(scope.showCentreFilter  ? { 'Shakha':          scopedFilterOptions.centreOptions } : {}),
                'Shakha Type':  FILTER_OPTIONS['Shakha Type'],
                'Gender':       FILTER_OPTIONS['Gender'],
                'Age Category': FILTER_OPTIONS['Age Category'],
                'Role Type':    FILTER_OPTIONS['Role Type'],
                'Status':       FILTER_OPTIONS['Status'],
              }}
              title="Filter Attendance Log"
            />
          </div>
          )}

          <div className="relative" ref={dateFilterRef}>
            <button
              onClick={() => setShowDateFilter(open => !open)}
              title="Filter by attendance date"
              className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                dateFrom
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {dateFrom ? (dateRangeLabel || `${formatDate(dateFrom)} - ${formatDate(dateTo)}`) : 'Shakha Date'}
              {dateFrom && (
                <span
                  role="button"
                  onClick={event => {
                    event.stopPropagation();
                    setDateFrom('');
                    setDateTo('');
                    setDateRangeLabel('');
                    setPage(1);
                  }}
                  className="ml-0.5 text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
            <DateRangeFilter
              isOpen={showDateFilter}
              onClose={() => setShowDateFilter(false)}
              startDate={dateFrom}
              endDate={dateTo}
              onApply={(start, end, label) => {
                setDateFrom(start);
                setDateTo(end);
                setDateRangeLabel(label || '');
                setPage(1);
              }}
              title="Shakha Date Range"
            />
          </div>

          <IconButton icon={BarChart3}   onClick={() => setShowSummary(s => !s)} title="Toggle Summary" />
          <IconButton icon={RefreshCw}   onClick={() => { setSearchQuery(''); setFilters([]); setDateFrom(''); setDateTo(''); setDateRangeLabel(''); setPage(1); }} title="Reset" />
          {!scope.selfOnly && (
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: FileSpreadsheet, label: 'Export as CSV', onClick: handleExportCSV },
              ]}
            />
          )}
        </PageHeader>

        {/* ── SUMMARY WIDGETS ── */}
        {showSummary && (
          <SummaryWidgets
            title={scope.selfOnly ? "My Attendance Summary (YTD)" : "Attendance Summary"}
            colorCards={scope.selfOnly}
            widgets={[
              { label: 'Shakhas Held (YTD)', value: filtered.length,  icon: 'Users',       color: 'slate'   },
              { label: 'Present',         value: presentCount,     icon: 'CheckCircle', color: 'emerald' },
              { label: 'Absent',          value: absentCount,      icon: 'XCircle',     color: 'amber'   },
              { label: 'Attendance Rate', value: `${rate}%`,       icon: 'BarChart3',   color: 'sky'     },
            ]}
          />
        )}

        {/* ── ACTIVE FILTER CHIPS ── */}
        <FilterChips
          filters={filters.filter(f => f.values.length > 0)}
          onRemove={id => { setFilters(prev => prev.filter(f => f.id !== id)); setPage(1); }}
          onClearAll={() => { setFilters([]); setPage(1); }}
        />

        {/* ── TABLE ── */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
          <div className="overflow-x-auto slim-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                  {!scope.selfOnly && (
                    <>
                      <SortTh label="Member"          sortKey="memberName"       current={sortKey} dir={sortDir} onSort={handleSort} />
                      <SortTh label="Role"             sortKey="jobTitle"         current={sortKey} dir={sortDir} onSort={handleSort} />
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">Gender</th>
                    </>
                  )}
                  <SortTh label="Shakha"           sortKey="activityCentre"   current={sortKey} dir={sortDir} onSort={handleSort} />
                  {!scope.selfOnly && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">Shakha</th>
                  )}
                  <SortTh label="Date"             sortKey="date"             current={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">Time</th>
                  <SortTh label="Status"           sortKey="attendanceStatus" current={sortKey} dir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={scope.selfOnly ? 4 : 8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          <Users className="w-6 h-6 text-neutral-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No attendance records found</p>
                        {(activeFilterCount > 0 || searchQuery) && (
                          <button
                            onClick={() => { setFilters([]); setSearchQuery(''); setPage(1); }}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : groupedPaginated.map(({ year, months, totalEntries: yearTotal }) => (
                  <Fragment key={`${page}-${year}`}>
                    {/* ── Year header ── */}
                    <tr>
                      <td colSpan={scope.selfOnly ? 4 : 8} className="p-0">
                        <button
                          type="button"
                          onClick={() => toggleYear(year)}
                          aria-expanded={!collapsedYears.has(year)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-primary-700 dark:bg-primary-950 hover:bg-primary-800 dark:hover:bg-primary-900 text-left transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {collapsedYears.has(year)
                              ? <ChevronRight className="w-4 h-4 text-white/80" />
                              : <ChevronDown className="w-4 h-4 text-white/80" />
                            }
                            <span className="text-sm font-bold text-white tracking-wide">{year}</span>
                          </span>
                          <span className="text-xs font-medium text-white/60">
                            {yearTotal} {yearTotal === 1 ? 'record' : 'records'}
                          </span>
                        </button>
                      </td>
                    </tr>
                    {/* ── Month groups within year ── */}
                    {!collapsedYears.has(year) && months.map(({ month, entries, totalEntries }, groupIndex) => (
                      <Fragment key={`${month}-${groupIndex}`}>
                        <tr>
                          <td colSpan={scope.selfOnly ? 4 : 8} className="p-0">
                            <button
                              type="button"
                              onClick={() => toggleMonth(month)}
                              aria-expanded={!collapsedMonths.has(month)}
                              className="w-full flex items-center justify-between gap-3 pl-8 pr-4 py-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border-y border-neutral-200 dark:border-neutral-800 text-left transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                {collapsedMonths.has(month)
                                  ? <ChevronRight className="w-4 h-4 text-neutral-500" />
                                  : <ChevronDown className="w-4 h-4 text-neutral-500" />
                                }
                                <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {formatMonthName(month)}
                                </span>
                              </span>
                              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                {entries.length === totalEntries
                                  ? `${totalEntries} ${totalEntries === 1 ? 'record' : 'records'}`
                                  : `${entries.length} on this page · ${totalEntries} total`
                                }
                              </span>
                            </button>
                          </td>
                        </tr>
                        {!collapsedMonths.has(month) && entries.map((entry, idx) => (
                  <tr key={`${entry.sessionId}-${entry.memberId}-${month}-${idx}`}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">

                    {!scope.selfOnly && (
                    <>
                    {/* Member */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300">
                            {entry.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white leading-tight">{entry.memberName}</p>
                          <p className="text-[11px] text-neutral-400 capitalize">{entry.ageCategory}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{entry.jobTitle}</span>
                    </td>

                    {/* Gender */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        entry.gender === 'male'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-200 dark:border-pink-800'
                      }`}>
                        {entry.gender === 'male' ? 'Male' : 'Female'}
                      </span>
                    </td>
                    </>
                    )}

                    {/* Activity Centre */}
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                            {entry.activityCentre.replace(' Activity Centre', '')}
                          </p>
                          <p className="text-[11px] text-neutral-400 whitespace-nowrap">{entry.town}, {entry.region}</p>
                        </div>
                      </div>
                    </td>

                    {/* Session */}
                    {!scope.selfOnly && (
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 max-w-[180px] truncate" title={entry.sessionTitle}>
                        {entry.sessionTitle}
                      </p>
                      {entry.shakhaType !== '—' && (
                        <p className="text-[11px] text-neutral-400">{entry.shakhaType}</p>
                      )}
                    </td>
                    )}

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300">
                        <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
                        {formatDate(entry.date)}
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {entry.startTime}–{entry.endTime}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={entry.attendanceStatus} />
                    </td>
                  </tr>
                        ))}
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={pageSize}
              onPageChange={setPage}
              onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }}
            />
          )}
        </div>

      </div>

    </div>
  );
}
