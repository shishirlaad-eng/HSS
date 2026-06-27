// ─────────────────────────────────────────────────────────────
// HSS UK — Sessions (Shakha Calendar)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Filter,
  LayoutGrid,
  Plus,
  MapPin,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from './hb/listing/PageHeader';
import { PrimaryButton } from './hb/listing';
import CreateSession from './CreateSession';
import SessionDetail from './SessionDetail';
import { mockSessions, ShakhaSession, AttendanceRecord } from '../../mockAPI/attendanceData';
import { MASTERS_CASCADE, mockMembers, getAgeGroup } from '../../mockAPI/membersData';
import { useRoleScope, useModulePermissions } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';

// ── Helpers ──────────────────────────────────────────────────
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES     = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
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


// ── Calendar Cell Session Chip ────────────────────────────────
function SessionChip({ session, onClick }: { session: ShakhaSession; onClick: () => void }) {
  const rate = attendanceRate(session);
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] leading-tight font-medium border truncate transition-opacity hover:opacity-80 ${statusColor(session.status)}`}
      title={`${session.title} · ${session.startTime}–${session.endTime}`}
    >
      <span className="flex items-center gap-1">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(session.status)}`} />
        <span className="truncate">{session.startTime} {session.activityCentre.replace(' Activity Centre', '')}</span>
        {rate !== null && <span className="flex-shrink-0 ml-auto">{rate}%</span>}
      </span>
    </button>
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

  // Super Admin defaults to week view; all other roles default to month view
  const [viewMode, setViewMode] = useState<'month' | 'week'>(
    () => selectedRole === 'Super Admin' ? 'week' : 'month'
  );
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); // start of this week (Sun)
    return d;
  });

  const [filterRegion, setFilterRegion]   = useState('');
  const [filterTown,   setFilterTown]     = useState('');
  const [filterCentre, setFilterCentre]   = useState('');
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

  // Sessions scoped to role level
  const scopedSessions = useMemo(() => filterByScope(mockSessions, scope), [scope]);
  const [sessions, setSessions] = useState<ShakhaSession[]>(mockSessions);

  const handleCreateSession = (newSessions: ShakhaSession[]) => {
    setSessions(prev => [...prev, ...newSessions]);
    setCreateDate(null);                 // return to calendar
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

  // Cascade options — scoped to role level, OR full cascade when a member is
  // browsing other Shakhas ("Attend another Shakha").
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

  // Show the location filter bar when the role allows it, or in browse mode
  const showRegionSelect = browse || scope.showRegionFilter;
  const showTownSelect   = browse || scope.showTownFilter;
  const showCentreSelect = browse || scope.showCentreFilter;
  const showFilterBar    = showRegionSelect || showTownSelect || showCentreSelect;

  // Reset dependent filters on parent change
  const handleRegionChange = (v: string) => { setFilterRegion(v); setFilterTown(''); setFilterCentre(''); };
  const handleTownChange   = (v: string) => { setFilterTown(v);   setFilterCentre(''); };

  // Filtered sessions — normally scoped to the role; when a member is browsing
  // other Shakhas, use the full set so they can find Shakhas at other locations.
  const filteredSessions = useMemo(() => {
    const base = browse ? sessions : scopedSessions;
    return base.filter(s => {
      if (filterRegion && s.region !== filterRegion) return false;
      if (filterTown   && s.town   !== filterTown)   return false;
      if (filterCentre && s.activityCentre !== filterCentre) return false;
      return true;
    });
  }, [browse, sessions, scopedSessions, filterRegion, filterTown, filterCentre]);

  // Sessions indexed by ISO date
  const sessionsByDate = useMemo(() => {
    const map: Record<string, ShakhaSession[]> = {};
    filteredSessions.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [filteredSessions]);

  // ── Month navigation ──────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ── Week navigation ───────────────────────────────────────
  const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });

  // Sync weekStart month when switching to week view
  useEffect(() => {
    if (viewMode === 'week') {
      setViewMonth(weekStart.getMonth());
      setViewYear(weekStart.getFullYear());
    }
  }, [viewMode, weekStart]);

  // ── Build month grid ──────────────────────────────────────
  const monthGrid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ date: string | null; dayNum: number | null }> = [];
    for (let i = 0; i < firstDay; i++) cells.push({ date: null, dayNum: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: isoDate(viewYear, viewMonth, d), dayNum: d });
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push({ date: null, dayNum: null });
    return cells;
  }, [viewYear, viewMonth]);

  // ── Build week grid ───────────────────────────────────────
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        date: isoDate(d.getFullYear(), d.getMonth(), d.getDate()),
        dayNum: d.getDate(),
        dayName: DAY_NAMES_SHORT[d.getDay()],
        month: d.getMonth(),
      };
    });
  }, [weekStart]);

  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());
  const activeFilters = [filterRegion, filterTown, filterCentre].filter(Boolean).length;

  // ── Show Edit Session page ─────────────────────────────────
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

  // ── Show Session Detail page ───────────────────────────────
  if (selectedSession) {
    return (
      <SessionDetail
        session={selectedSession}
        allSessions={sessions}
        onBack={() => setSelectedSession(null)}
        onMarkAttendance={handleMarkAttendance}
        onCancelSession={canManageShakha ? handleCancelSession : undefined}
        onDeleteSession={isShakhaAdmin ? handleDeleteSession : undefined}
        onEditSession={canManageShakha ? (id) => { const s = sessions.find(ss => ss.id === id); if (s) setEditSession(s); } : undefined}
      />
    );
  }

  // ── Show Create Session page ───────────────────────────────
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
    <div className="p-6">
      <PageHeader
        title="Shakha"
        subtitle={isMemberRole ? undefined : "Shakha calendar — view and manage recurring Shakha gatherings"}
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

      {/* ── Toolbar row 1: nav + view toggle ── */}
      <div className="flex items-center justify-between mb-3 gap-3">
        {/* Left: month/week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={viewMode === 'month' ? prevMonth : prevWeek}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-neutral-900 dark:text-white min-w-[180px] text-center">
            {viewMode === 'month'
              ? `${MONTH_NAMES[viewMonth]} ${viewYear}`
              : `Week of ${weekDays[0].dayNum} ${MONTH_NAMES[weekDays[0].month]} ${viewYear}`}
          </span>
          <button
            onClick={viewMode === 'month' ? nextMonth : nextWeek}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const y = today.getFullYear(), m = today.getMonth();
              setViewYear(y); setViewMonth(m);
              const d = new Date(today); d.setDate(d.getDate() - d.getDay()); setWeekStart(d);
            }}
            className="ml-1 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Right: view mode toggle */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Week
          </button>
        </div>
      </div>

      {/* ── Toolbar row 2: location filters (role-scoped or member browse) ── */}
      {showFilterBar && (
      <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <Filter className="w-4 h-4 text-neutral-400 self-center mt-4 flex-shrink-0" />
        {browse && (
          <p className="w-full text-xs text-neutral-500 dark:text-neutral-400 -mb-1">
            Pick a Region, Nagar and Shakha to find another Shakha you'd like to attend, then open it to request to join.
          </p>
        )}
        {/* Region — hidden if role is already scoped to a specific region */}
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
        {/* Town — hidden if role is already scoped to a specific town */}
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
        {/* Activity Centre — hidden if role is already scoped to a specific centre */}
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
        {/* Clear */}
        {activeFilters > 0 ? (
          <button
            onClick={() => { setFilterRegion(''); setFilterTown(''); setFilterCentre(''); }}
            className="h-9 px-4 text-xs font-medium text-error-600 dark:text-error-400 border border-error-200 dark:border-error-800 rounded-lg hover:bg-error-50 dark:hover:bg-error-950 transition-colors self-end"
          >
            Clear
          </button>
        ) : (
          <div className="h-9 w-16 self-end" /> /* spacer to keep row height consistent */
        )}
      </div>
      )}

      {/* ── Legend ── */}
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
          {filteredSessions.length} Shakha{filteredSessions.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {/* ── Month View ── */}
      {viewMode === 'month' && (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
            {DAY_NAMES_SHORT.map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7">
            {monthGrid.map((cell, idx) => {
              const isToday   = cell.date === todayIso;
              const sessions  = cell.date ? (sessionsByDate[cell.date] ?? []) : [];
              const isLastRow = idx >= monthGrid.length - 7;
              const daySessions = cell.date ? (sessionsByDate[cell.date] ?? []) : [];
              return (
                <div
                  key={idx}
                  onClick={() => canManageShakha && cell.date && setCreateDate(cell.date)}
                  className={`min-h-[110px] p-1.5 border-r border-b border-neutral-100 dark:border-neutral-800 last:border-r-0 ${
                    isLastRow ? 'border-b-0' : ''
                  } ${
                    !cell.date
                      ? 'bg-neutral-50/60 dark:bg-neutral-900/40'
                      : canManageShakha
                        ? 'bg-white dark:bg-neutral-950 cursor-pointer hover:bg-primary-50/40 dark:hover:bg-primary-950/20 transition-colors group'
                        : 'bg-white dark:bg-neutral-950'
                  }`}
                >
                  {cell.dayNum !== null && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        {canManageShakha && (
                          <Plus className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
                          isToday
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {cell.dayNum}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {daySessions.slice(0, 3).map(s => (
                          <SessionChip key={s.id} session={s} onClick={() => setSelectedSession(s)} />
                        ))}
                        {daySessions.length > 3 && (
                          <button
                            className="w-full text-left px-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            onClick={e => { e.stopPropagation(); setSelectedSession(daySessions[3]); }}
                          >
                            +{daySessions.length - 3} more
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week View ── */}
      {viewMode === 'week' && (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
            {weekDays.map(wd => {
              const isToday = wd.date === todayIso;
              return (
                <div key={wd.date} className={`py-3 text-center border-r border-neutral-200 dark:border-neutral-700 last:border-r-0 ${isToday ? 'bg-primary-100 dark:bg-primary-950/50' : ''}`}>
                  <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider mb-1">{wd.dayName}</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-semibold ${
                    isToday ? 'bg-primary-600 text-white' : 'text-neutral-700 dark:text-neutral-300'
                  }`}>
                    {wd.dayNum}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 min-h-[420px]">
            {weekDays.map(wd => {
              const wdSessions = sessionsByDate[wd.date] ?? [];
              const isToday    = wd.date === todayIso;
              return (
                <div
                  key={wd.date}
                  onClick={() => canManageShakha && setCreateDate(wd.date)}
                  className={`p-2 border-r border-neutral-100 dark:border-neutral-800 last:border-r-0 group ${
                    canManageShakha ? 'cursor-pointer' : ''
                  } ${
                    isToday
                      ? 'bg-primary-50/30 dark:bg-primary-950/10'
                      : canManageShakha ? 'hover:bg-primary-50/30 dark:hover:bg-primary-950/10' : ''
                  } transition-colors`}
                >
                  <div className="space-y-1">
                    {/* "+" hint when hovering empty area */}
                    {canManageShakha && wdSessions.length === 0 && (
                      <div className="h-20 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    {wdSessions.map(s => (
                      <button
                        key={s.id}
                        onClick={e => { e.stopPropagation(); setSelectedSession(s); }}
                        className={`w-full text-left p-2 rounded-lg border text-xs transition-opacity hover:opacity-80 ${statusColor(s.status)}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot(s.status)}`} />
                          <span className="font-semibold truncate">{s.startTime}–{s.endTime}</span>
                        </div>
                        <div className="font-medium truncate leading-tight">{s.activityCentre.replace(' Activity Centre', '')}</div>
                        <div className="text-[10px] opacity-75 mt-0.5 truncate">{s.region}</div>
                        {s.attendanceRecords.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="w-2.5 h-2.5" />
                            <span>{s.attendanceRecords.filter(r => r.status === 'present').length}/{s.attendanceRecords.length}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
}
