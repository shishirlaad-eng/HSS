// ─────────────────────────────────────────────────────────────
// HSS UK — Sessions (Shakha Table)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useRef } from 'react';
import {
  Users,
  Filter,
  Plus,
  MapPin,
  X,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import { PageHeader } from './hb/listing/PageHeader';
import { PrimaryButton, DateRangeFilter, useStickyListingHeader, Pagination } from './hb/listing';
import CreateSession from './CreateSession';
import SessionDetail from './SessionDetail';
import { mockSessions, ShakhaSession, AttendanceRecord } from '../../mockAPI/attendanceData';
import { MASTERS_CASCADE, mockMembers, getAgeGroup } from '../../mockAPI/membersData';
import { useRoleScope, useModulePermissions } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';
import { formatDate as sharedFormatDate } from '../../utils/formatDate';

// ── Helpers ──────────────────────────────────────────────────
const DAY_NAMES_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function formatDate(iso: string) {
  return sharedFormatDate(iso);
}

function statusColor(status: ShakhaSession['status']) {
  if (status === 'completed')  return 'bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-800';
  if (status === 'cancelled')  return 'bg-error-50 text-error-700 dark:bg-error-950/20 dark:text-error-400 border-error-200 dark:border-error-800';
  return 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 border-primary-200 dark:border-primary-800';
}

function statusDot(status: ShakhaSession['status']) {
  if (status === 'completed')  return 'bg-success-500';
  if (status === 'cancelled')  return 'bg-error-500';
  return 'bg-primary-500';
}

function statusLabel(status: ShakhaSession['status']) {
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  return 'Active';
}

function attendanceRate(s: ShakhaSession) {
  const marked = s.attendanceRecords.filter(r => r.status !== 'unmarked');
  if (!marked.length) return null;
  const present = s.attendanceRecords.filter(r => r.status === 'present').length;
  return Math.round((present / marked.length) * 100);
}

function buildAttendanceRecordsForCentre(activityCentre: string): AttendanceRecord[] {
  return mockMembers
    .filter(member => member.status === 'active' && member.activityCentre === activityCentre)
    .map(member => ({
      memberId: member.id,
      memberName: member.name,
      gender: member.gender,
      ageCategory: getAgeGroup(member.dateOfBirth),
      jobTitle: member.jobTitle,
      status: 'unmarked' as const,
    }));
}

// ── Table header style ────────────────────────────────────────
const TH = 'px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap bg-neutral-50 dark:bg-neutral-900 text-left';

// ── Sortable TH ───────────────────────────────────────────────
type SortKey = 'date' | 'startTime' | 'activityCentre' | 'region' | 'town' | 'status' | 'attendanceRate';
type SortDir = 'asc' | 'desc';

function SortTh({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th className={`${TH} cursor-pointer select-none group`} onClick={() => onSort(sortKey)}>
      <div className="flex items-center gap-1">
        <span className={`transition-colors ${active ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-neutral-900 dark:group-hover:text-white'}`}>
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

// ── Main Sessions Component ───────────────────────────────────
export default function Sessions() {
  const today = new Date();

  // ── Role scope & permissions ─────────────────────────────────
  const { scope, selectedRole } = useRoleScope();
  const atp = useModulePermissions('attendance');
  const isMemberRole = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';
  const isShakhaAdmin = selectedRole === 'Shakha Admin';
  const canManageShakha = !isMemberRole && atp.canView && atp.canAdd;

  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const [filterRegion, setFilterRegion]   = useState('');
  const [filterTown,   setFilterTown]     = useState('');
  const [filterCentre, setFilterCentre]   = useState('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [dateRangeLabel, setDateRangeLabel] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();
  const [selectedSession, setSelectedSession] = useState<ShakhaSession | null>(null);
  const [createDate,      setCreateDate]      = useState<string | null>(null);
  const [editSession,     setEditSession]     = useState<ShakhaSession | null>(null);

  // Members can browse Shakhas outside their own centre to request to join
  const [browseOtherShakha, setBrowseOtherShakha] = useState(false);
  const browse = isMemberRole && browseOtherShakha;
  const toggleBrowse = () => {
    setBrowseOtherShakha(b => !b);
    setFilterRegion(''); setFilterTown(''); setFilterCentre('');
  };

  // Sessions state
  const scopedSessions = useMemo(() => filterByScope(mockSessions, scope), [scope]);
  const [sessions, setSessions] = useState<ShakhaSession[]>(mockSessions);

  const handleCreateSession = (newSessions: ShakhaSession[]) => {
    setSessions(prev => [...prev, ...newSessions]);
    setCreateDate(null);
    setSelectedSession(newSessions[0] ?? null);
  };

  const handleCancelSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, status: 'cancelled' as const } : s)
    );
    setSelectedSession(prev => prev?.id === sessionId ? { ...prev, status: 'cancelled' as const } : prev);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setSelectedSession(null);
  };

  const handleUpdateSession = (sessionId: string, updates: Partial<ShakhaSession>) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
    setSelectedSession(prev => prev?.id === sessionId ? { ...prev, ...updates } : prev);
    setEditSession(null);
  };

  const handleMarkAttendance = (sessionId: string, memberId: string, status: AttendanceRecord['status']) => {
    const memberRecordTemplate = sessions
      .flatMap(session => session.attendanceRecords)
      .find(record => record.memberId === memberId);

    const updateSession = (session: ShakhaSession): ShakhaSession => {
      if (session.id !== sessionId) return session;
      const hasMemberRecord = session.attendanceRecords.some(record => record.memberId === memberId);
      const markedAt = status === 'unmarked' ? undefined : new Date().toISOString();
      return {
        ...session,
        attendanceRecords: hasMemberRecord
          ? session.attendanceRecords.map(record =>
              record.memberId === memberId ? { ...record, status, markedAt } : record,
            )
          : memberRecordTemplate
            ? [...session.attendanceRecords, { ...memberRecordTemplate, status, markedAt }]
            : session.attendanceRecords,
      };
    };

    setSessions(prev => prev.map(updateSession));
    setSelectedSession(prev => (prev ? updateSession(prev) : prev));
  };

  // Cascade options
  const regionOptions  = browse
    ? (MASTERS_CASCADE.regions[scope.country ?? 'HSS UK'] ?? [])
    : scope.level === 'all' || scope.level === 'national'
      ? (MASTERS_CASCADE.regions[scope.country ?? 'HSS UK'] ?? [])
      : scope.region ? [scope.region] : [];
  const townOptions    = browse
    ? (filterRegion ? (MASTERS_CASCADE.towns[filterRegion] ?? []) : [])
    : scope.showTownFilter
      ? (filterRegion
          ? (MASTERS_CASCADE.towns[filterRegion] ?? [])
          : scope.region ? (MASTERS_CASCADE.towns[scope.region] ?? []) : [])
      : [];
  const centreOptions  = browse
    ? (filterTown ? (MASTERS_CASCADE.centres[filterTown] ?? []) : [])
    : scope.showCentreFilter
      ? (filterTown
          ? (MASTERS_CASCADE.centres[filterTown] ?? [])
          : scope.town ? (MASTERS_CASCADE.centres[scope.town] ?? []) : [])
      : [];

  const showRegionSelect = browse || scope.showRegionFilter;
  const showTownSelect   = browse || scope.showTownFilter;
  const showCentreSelect = browse || scope.showCentreFilter;

  const handleRegionChange = (v: string) => { setFilterRegion(v); setFilterTown(''); setFilterCentre(''); setPage(1); };
  const handleTownChange   = (v: string) => { setFilterTown(v);   setFilterCentre(''); setPage(1); };

  // Filtered sessions (unsorted — sort applied separately below)
  const filteredSessions = useMemo(() => {
    const base = browse ? sessions : scopedSessions;
    return base.filter(s => {
      if (dateFrom) {
        if (s.date < dateFrom || s.date > (dateTo || dateFrom)) return false;
      }
      if (filterRegion && s.region !== filterRegion) return false;
      if (filterTown   && s.town   !== filterTown)   return false;
      if (filterCentre && s.activityCentre !== filterCentre) return false;
      return true;
    });
  }, [browse, sessions, scopedSessions, filterRegion, filterTown, filterCentre, dateFrom, dateTo]);

  // ── Sorted sessions ──────────────────────────────────────────
  const sortedSessions = useMemo(() => {
    const list = [...filteredSessions];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'attendanceRate') {
        cmp = (attendanceRate(a) ?? -1) - (attendanceRate(b) ?? -1);
      } else {
        const av = a[sortKey] as string;
        const bv = b[sortKey] as string;
        cmp = av.localeCompare(bv);
      }
      if (cmp === 0) cmp = a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filteredSessions, sortKey, sortDir]);

  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const activeFilters = [filterRegion, filterTown, filterCentre].filter(Boolean).length;

  // ── Pagination ──────────────────────────────────────────────
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(sortedSessions.length / pageSize));
  const paginatedSessions = pageSize === 0 ? sortedSessions : sortedSessions.slice((page - 1) * pageSize, page * pageSize);

  const colCount = 4 + ((scope.showRegionFilter || scope.showTownFilter) ? 1 : 0) + (scope.showTownFilter ? 1 : 0) + 2;

  // ── Sub-pages ─────────────────────────────────────────────
  if (editSession && canManageShakha) {
    return (
      <CreateSession
        initialDate={editSession.date}
        sessionToEdit={editSession}
        onCancel={() => setEditSession(null)}
        onCreate={handleCreateSession}
        onUpdate={handleUpdateSession}
      />
    );
  }

  if (selectedSession) {
    return (
      <SessionDetail
        session={selectedSession}
        allSessions={sessions}
        onBack={() => setSelectedSession(null)}
        onMarkAttendance={handleMarkAttendance}
        onCancelSession={canManageShakha ? handleCancelSession : undefined}
        onDeleteSession={selectedRole === 'Super Admin' ? handleDeleteSession : undefined}
        onEditSession={canManageShakha ? (id) => { const s = sessions.find(ss => ss.id === id); if (s) setEditSession(s); } : undefined}
      />
    );
  }

  if (createDate && canManageShakha) {
    return (
      <CreateSession
        initialDate={createDate}
        onCancel={() => setCreateDate(null)}
        onCreate={handleCreateSession}
      />
    );
  }

  return (
    <div className="sticky-listing-table p-6" style={stickyTableStyle}>
      <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-neutral-50 dark:bg-neutral-950 pb-1">
      <PageHeader
        title="Sankhya"
        subtitle={isMemberRole ? undefined : "View and manage recurring Shakha gatherings"}
        breadcrumbs={[
          { label: 'Sankhya' },
          { label: 'Shakha', current: true },
        ]}
      >
        {isMemberRole && (
          <PrimaryButton icon={browseOtherShakha ? X : MapPin} onClick={toggleBrowse}>
            {browseOtherShakha ? 'Back to my Shakha' : 'Attend another Shakha'}
          </PrimaryButton>
        )}
        {canManageShakha && (
          <PrimaryButton
            icon={Plus}
            onClick={() => setCreateDate(isoDate(today.getFullYear(), today.getMonth(), today.getDate()))}
          >
            Create Shakha
          </PrimaryButton>
        )}
      </PageHeader>
      </div>

      {/* ── Filter bar (Shakha Date + Region/Town/Activity Centre) ── */}
      <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <Filter className="w-4 h-4 text-neutral-400 self-center mt-4 flex-shrink-0" />
        {browse && (
          <p className="w-full text-xs text-neutral-500 dark:text-neutral-400 -mb-1">
            Pick a Region, Nagar and Shakha to find another Shakha you'd like to attend, then open it to request to join.
          </p>
        )}
        <div className="flex flex-col gap-1 min-w-[180px] flex-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Shakha Date</label>
          <div className="relative" ref={dateFilterRef}>
            <button
              onClick={() => setShowDateFilter(open => !open)}
              title="Filter by Shakha date"
              className={`w-full h-9 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                dateFrom
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{dateFrom ? (dateRangeLabel || `${formatDate(dateFrom)} - ${formatDate(dateTo || dateFrom)}`) : 'All Dates'}</span>
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
                  className="ml-auto text-primary-400 hover:text-primary-700 dark:hover:text-primary-200 flex-shrink-0"
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
        </div>
        {showRegionSelect && (
          <div className="flex flex-col gap-1 min-w-[180px] flex-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Region</label>
            <select
              value={filterRegion}
              onChange={e => handleRegionChange(e.target.value)}
              className="h-9 px-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Regions</option>
              {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}
        {showTownSelect && (
          <div className="flex flex-col gap-1 min-w-[160px] flex-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Town</label>
            <select
              value={filterTown}
              onChange={e => handleTownChange(e.target.value)}
              disabled={showRegionSelect && !filterRegion}
              className="h-9 px-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Towns</option>
              {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}
        {showCentreSelect && (
          <div className="flex flex-col gap-1 min-w-[200px] flex-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Activity Centre</label>
            <select
              value={filterCentre}
              onChange={e => { setFilterCentre(e.target.value); setPage(1); }}
              disabled={showTownSelect && !filterTown}
              className="h-9 px-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Centres</option>
              {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {activeFilters > 0 || dateFrom ? (
          <button
            onClick={() => { setFilterRegion(''); setFilterTown(''); setFilterCentre(''); setDateFrom(''); setDateTo(''); setDateRangeLabel(''); setPage(1); }}
            className="h-9 px-4 text-xs font-medium text-error-600 dark:text-error-400 border border-error-200 dark:border-error-800 rounded-lg hover:bg-error-50 dark:hover:bg-error-950 transition-colors self-end"
          >
            Clear
          </button>
        ) : (
          <div className="h-9 w-16 self-end" />
        )}
      </div>

      {/* ── Legend + count ── */}
      <div className="flex items-center gap-4 mb-3">
        {[
          { label: 'Active', dot: 'bg-primary-500' },
          { label: 'Completed', dot: 'bg-success-500' },
          { label: 'Cancelled', dot: 'bg-error-500' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.dot}`} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{l.label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
          {filteredSessions.length} Shakha{filteredSessions.length !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* ── Table ── */}
      <div className="sticky-table-scroll slim-scroll border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950">
        <table className="w-full min-w-max text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <SortTh label="Date" sortKey="date" current={sortKey} dir={sortDir} onSort={handleSort} />
              <th className={TH}>Day</th>
              <SortTh label="Time" sortKey="startTime" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortTh label="Shakha" sortKey="activityCentre" current={sortKey} dir={sortDir} onSort={handleSort} />
              {(scope.showRegionFilter || scope.showTownFilter) && <SortTh label="Region" sortKey="region" current={sortKey} dir={sortDir} onSort={handleSort} />}
              {scope.showTownFilter && <SortTh label="Town" sortKey="town" current={sortKey} dir={sortDir} onSort={handleSort} />}
              <SortTh label="Status" sortKey="status" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortTh label="Attendance" sortKey="attendanceRate" current={sortKey} dir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedSessions.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-16 text-center">
                  <CalendarDays className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No Shakha sessions found</p>
                  {canManageShakha && (
                    <button
                      onClick={() => setCreateDate(isoDate(today.getFullYear(), today.getMonth(), today.getDate()))}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create a Shakha session
                    </button>
                  )}
                </td>
              </tr>
            ) : paginatedSessions.map(s => {
              const isToday   = s.date === todayIso;
              const rate      = attendanceRate(s);
              const present   = s.attendanceRecords.filter(r => r.status === 'present').length;
              const total     = s.attendanceRecords.length;
              const dateObj   = new Date(s.date + 'T00:00:00');
              const dayName   = DAY_NAMES_FULL[dateObj.getDay()];
              const [y, mo, d] = s.date.split('-');
              const displayDate = `${d}/${mo}/${y}`;

              return (
                <tr
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                    isToday ? 'bg-primary-50/30 dark:bg-primary-950/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${isToday ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-900 dark:text-white'}`}>
                        {displayDate}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400">
                          Today
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{dayName}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap font-medium">
                    {s.startTime}–{s.endTime}
                  </td>
                  <td className="px-4 py-3 text-neutral-900 dark:text-white font-medium">
                    {s.activityCentre.replace(' Activity Centre', '')}
                    {s.locationAddressLine1 && (
                      <span className="block text-xs font-normal text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                        {[s.locationAddressLine1, s.locationPostCode].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </td>
                  {(scope.showRegionFilter || scope.showTownFilter) && (
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{s.region}</td>
                  )}
                  {scope.showTownFilter && (
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{s.town}</td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${statusColor(s.status)}`}>
                      {statusLabel(s.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {total === 0 ? (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">—</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {present}/{total}
                        </span>
                        {rate !== null && (
                          <span className={`text-xs font-medium ${
                            rate >= 75 ? 'text-success-600 dark:text-success-400' :
                            rate >= 50 ? 'text-amber-600 dark:text-amber-400' :
                            'text-error-600 dark:text-error-400'
                          }`}>
                            ({rate}%)
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredSessions.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredSessions.length}
            itemsPerPage={pageSize}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setPageSize(n); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
}
