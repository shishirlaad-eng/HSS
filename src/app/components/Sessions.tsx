// ─────────────────────────────────────────────────────────────
// HSS UK — Sessions (Shakha Table)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  Plus,
  MapPin,
  X,
  CalendarDays,
} from 'lucide-react';
import { PageHeader } from './hb/listing/PageHeader';
import { PrimaryButton, DateRangeFilter, useStickyListingHeader } from './hb/listing';
import CreateSession from './CreateSession';
import SessionDetail from './SessionDetail';
import { mockSessions, ShakhaSession, AttendanceRecord } from '../../mockAPI/attendanceData';
import { MASTERS_CASCADE, mockMembers, getAgeGroup } from '../../mockAPI/membersData';
import { useRoleScope, useModulePermissions } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';

// ── Helpers ──────────────────────────────────────────────────
const DAY_NAMES_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES     = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
  return 'Scheduled';
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

// ── Main Sessions Component ───────────────────────────────────
export default function Sessions() {
  const today = new Date();

  // ── Role scope & permissions ─────────────────────────────────
  const { scope, selectedRole } = useRoleScope();
  const atp = useModulePermissions('attendance');
  const isMemberRole = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';
  const isShakhaAdmin = selectedRole === 'Shakha Admin';
  const canManageShakha = !isMemberRole && atp.canView && atp.canAdd;

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based

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
  const showFilterBar    = showRegionSelect || showTownSelect || showCentreSelect;

  const handleRegionChange = (v: string) => { setFilterRegion(v); setFilterTown(''); setFilterCentre(''); };
  const handleTownChange   = (v: string) => { setFilterTown(v);   setFilterCentre(''); };

  // Filtered + sorted sessions for current month
  const filteredSessions = useMemo(() => {
    const base = browse ? sessions : scopedSessions;
    return base
      .filter(s => {
        if (dateFrom) {
          if (s.date < dateFrom || s.date > (dateTo || dateFrom)) return false;
        } else {
          const d = new Date(s.date);
          if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) return false;
        }
        if (filterRegion && s.region !== filterRegion) return false;
        if (filterTown   && s.town   !== filterTown)   return false;
        if (filterCentre && s.activityCentre !== filterCentre) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [browse, sessions, scopedSessions, viewYear, viewMonth, filterRegion, filterTown, filterCentre, dateFrom, dateTo]);

  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const activeFilters = [filterRegion, filterTown, filterCentre].filter(Boolean).length;

  // ── Month navigation ──────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); };

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
        title="Shakha"
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

      {/* ── Month navigation bar ── */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-neutral-900 dark:text-white min-w-[160px] text-center">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={goToday}
          className="ml-1 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Today
        </button>
        <div className="relative ml-2" ref={dateFilterRef}>
          <button
            onClick={() => setShowDateFilter(open => !open)}
            title="Filter by Shakha date"
            className={`h-9 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
              dateFrom
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {dateFrom ? (dateRangeLabel || `${formatDate(dateFrom)} - ${formatDate(dateTo || dateFrom)}`) : 'Shakha Date'}
            {dateFrom && (
              <span
                role="button"
                onClick={event => {
                  event.stopPropagation();
                  setDateFrom('');
                  setDateTo('');
                  setDateRangeLabel('');
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
              if (start) {
                const d = new Date(start);
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
              }
            }}
            title="Shakha Date Range"
          />
        </div>
      </div>

      {/* ── Location filter bar ── */}
      {showFilterBar && (
        <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <Filter className="w-4 h-4 text-neutral-400 self-center mt-4 flex-shrink-0" />
          {browse && (
            <p className="w-full text-xs text-neutral-500 dark:text-neutral-400 -mb-1">
              Pick a Region, Nagar and Shakha to find another Shakha you'd like to attend, then open it to request to join.
            </p>
          )}
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
                onChange={e => setFilterCentre(e.target.value)}
                disabled={showTownSelect && !filterTown}
                className="h-9 px-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Centres</option>
                {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {activeFilters > 0 ? (
            <button
              onClick={() => { setFilterRegion(''); setFilterTown(''); setFilterCentre(''); }}
              className="h-9 px-4 text-xs font-medium text-error-600 dark:text-error-400 border border-error-200 dark:border-error-800 rounded-lg hover:bg-error-50 dark:hover:bg-error-950 transition-colors self-end"
            >
              Clear
            </button>
          ) : (
            <div className="h-9 w-16 self-end" />
          )}
        </div>
      )}

      {/* ── Legend + count ── */}
      <div className="flex items-center gap-4 mb-3">
        {[
          { label: 'Scheduled', dot: 'bg-primary-500' },
          { label: 'Completed', dot: 'bg-success-500' },
          { label: 'Cancelled', dot: 'bg-error-500' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.dot}`} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{l.label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
          {filteredSessions.length} Shakha{filteredSessions.length !== 1 ? 's' : ''} in {MONTH_NAMES[viewMonth]}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="sticky-table-scroll slim-scroll border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950">
        <table className="w-full min-w-max text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className={TH}>Date</th>
              <th className={TH}>Day</th>
              <th className={TH}>Time</th>
              <th className={TH}>Shakha</th>
              {(scope.showRegionFilter || scope.showTownFilter) && <th className={TH}>Region</th>}
              {scope.showTownFilter && <th className={TH}>Town</th>}
              <th className={TH}>Status</th>
              <th className={TH}>Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredSessions.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <CalendarDays className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No Shakha sessions in {MONTH_NAMES[viewMonth]} {viewYear}</p>
                  {canManageShakha && (
                    <button
                      onClick={() => setCreateDate(isoDate(viewYear, viewMonth, 1))}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create a Shakha session
                    </button>
                  )}
                </td>
              </tr>
            )}
            {filteredSessions.map(s => {
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
      </div>
    </div>
  );
}
