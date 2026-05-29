// ─────────────────────────────────────────────────────────────
// HSS UK — Session Detail (full page, HB template style)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { PageHeader, SecondaryButton } from './hb/listing';
import { ShakhaSession, AttendanceRecord, getSessionShakhaType } from '../../mockAPI/attendanceData';
import { mockMembers, ROLE_TYPE_OPTIONS } from '../../mockAPI/membersData';

// ── Helpers ───────────────────────────────────────────────────

const DAY_NAMES_FULL = [
  'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday',
];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function statusColor(status: ShakhaSession['status']) {
  if (status === 'completed') return 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400 border-success-200 dark:border-success-800';
  if (status === 'cancelled') return 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-400 border-error-200 dark:border-error-800';
  return 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400 border-primary-200 dark:border-primary-800';
}

function statusDot(status: ShakhaSession['status']) {
  if (status === 'completed') return 'bg-success-500';
  if (status === 'cancelled') return 'bg-error-500';
  return 'bg-primary-500';
}

function attendanceRate(s: ShakhaSession) {
  const marked = s.attendanceRecords.filter(r => r.status !== 'unmarked');
  if (!marked.length) return null;
  const present = s.attendanceRecords.filter(r => r.status === 'present').length;
  return Math.round((present / marked.length) * 100);
}

// ── Sub-components ─────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, count }: {
  icon: React.ElementType;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      {title}
      {count !== undefined && (
        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
          {count}
        </span>
      )}
    </div>
  );
}

function MemberRow({
  record,
  attendanceCount,
  isGuest,
  onMark,
}: {
  record: AttendanceRecord;
  attendanceCount: number;
  isGuest: boolean;
  onMark?: (status: AttendanceRecord['status']) => void;
}) {
  const initials = record.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
      {/* Attendance count badge */}
      <div className="flex-shrink-0 w-8 text-center">
        <span
          className="inline-block min-w-[1.5rem] px-1 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 leading-none"
          title={`${attendanceCount} session${attendanceCount !== 1 ? 's' : ''} attended`}
        >
          {attendanceCount}
        </span>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{initials}</span>
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{record.memberName}</p>
          {isGuest && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-error-50 dark:bg-error-950/30 text-error-600 dark:text-error-400 border border-error-200 dark:border-error-800 flex-shrink-0">
              Guest
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {record.jobTitle} · {record.ageCategory} · {record.gender}
        </p>
      </div>

      {/* Mark buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onMark?.('present')}
          disabled={!onMark}
          title="Mark present"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            record.status === 'present'
              ? 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400'
              : 'text-neutral-400 hover:text-success-600 hover:bg-success-50 dark:hover:bg-success-950'
          } disabled:cursor-default`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onMark?.('absent')}
          disabled={!onMark}
          title="Mark absent"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            record.status === 'absent'
              ? 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-400'
              : 'text-neutral-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950'
          } disabled:cursor-default`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Attendance group header ────────────────────────────────────

function GroupHeader({ icon: Icon, iconClass, label, count }: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {label} ({count})
      </span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────

export default function SessionDetail({
  session,
  allSessions,
  onBack,
  onMarkAttendance,
}: {
  session: ShakhaSession;
  allSessions: ShakhaSession[];
  onBack: () => void;
  onMarkAttendance: (sessionId: string, memberId: string, status: AttendanceRecord['status']) => void;
}) {
  const [searchQuery,       setSearchQuery]       = useState('');
  const [filterAgeCategory, setFilterAgeCategory] = useState('');
  const [filterJobTitle,    setFilterJobTitle]    = useState('');

  const rate       = attendanceRate(session);
  const shakhaType = getSessionShakhaType(session);

  const dateObj   = new Date(session.date + 'T12:00:00');
  const dateLabel = `${DAY_NAMES_FULL[dateObj.getDay()]}, ${dateObj.getDate()} ${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const statusLabel = session.status.charAt(0).toUpperCase() + session.status.slice(1);

  // ── Computed: home centre map (memberId → activityCentre) ──
  const homeCentreMap = useMemo(() => {
    const map = new Map<string, string>();
    mockMembers.forEach(m => map.set(m.id, m.activityCentre ?? ''));
    return map;
  }, []);

  // ── Computed: total attendance count per member (across ALL sessions) ──
  const attendanceCountMap = useMemo(() => {
    const map = new Map<string, number>();
    allSessions.forEach(s => {
      s.attendanceRecords.forEach(r => {
        if (r.status === 'present') {
          map.set(r.memberId, (map.get(r.memberId) ?? 0) + 1);
        }
      });
    });
    return map;
  }, [allSessions]);

  // ── Role type options — full master list, A→Z ────────────
  const roleTypeOptions = [...ROLE_TYPE_OPTIONS].sort((a, b) => a.localeCompare(b));

  // ── Filter + sort helper ──────────────────────────────────
  const processRecords = (records: AttendanceRecord[]) => {
    const q = searchQuery.toLowerCase().trim();
    return records
      .filter(r => {
        if (q && !r.memberName.toLowerCase().includes(q)) return false;
        if (filterAgeCategory && r.ageCategory !== filterAgeCategory) return false;
        if (filterJobTitle && r.jobTitle !== filterJobTitle) return false;
        return true;
      })
      .sort((a, b) => {
        const countA = attendanceCountMap.get(a.memberId) ?? 0;
        const countB = attendanceCountMap.get(b.memberId) ?? 0;
        return countB - countA; // descending — most attended on top
      });
  };

  // ── Derived attendance groups ─────────────────────────────
  const allRecords  = session.attendanceRecords;
  const present     = processRecords(allRecords.filter(r => r.status === 'present'));
  const absent      = processRecords(allRecords.filter(r => r.status === 'absent'));
  const unmarked    = processRecords(allRecords.filter(r => r.status === 'unmarked'));

  const totalPresent  = allRecords.filter(r => r.status === 'present').length;
  const totalAbsent   = allRecords.filter(r => r.status === 'absent').length;
  const totalUnmarked = allRecords.filter(r => r.status === 'unmarked').length;

  const filteredTotal  = present.length + absent.length + unmarked.length;
  const isFiltered     = !!searchQuery.trim() || !!filterAgeCategory || !!filterJobTitle;
  const hasActiveFilter = isFiltered;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterAgeCategory('');
    setFilterJobTitle('');
  };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">

        {/* ── Page Header ──────────────────────────────────── */}
        <PageHeader
          title={session.title}
          subtitle={dateLabel}
          breadcrumbs={[
            { label: 'Attendance' },
            { label: 'Sessions', onClick: onBack },
            { label: session.title, current: true },
          ]}
        >
          <SecondaryButton icon={ArrowLeft} onClick={onBack}>
            Back to Sessions
          </SecondaryButton>
        </PageHeader>

        {/* ── Body ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* ── Left: main content (col-span-2) ──────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Card: Session Info ───────────────────────── */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={Calendar} title="Session Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Date</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{dateLabel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Time</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{session.startTime} – {session.endTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Location</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{session.activityCentre}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">{session.town}, {session.region}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Shakha Type</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{shakhaType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Frequency</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">{session.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(session.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(session.status)}`} />
                      {statusLabel}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Card: Attendance ─────────────────────────── */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">

              {/* Card header */}
              <SectionHeader icon={Users} title="Attendance" count={allRecords.length} />

              {allRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-neutral-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No attendance records yet</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    Records appear here once members have been registered for this session
                  </p>
                </div>
              ) : (
                <>
                  {/* ── Search + Filters toolbar ─────────── */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-5">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search by name…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 h-9 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    {/* Age Category filter */}
                    <div className="relative">
                      <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                      <select
                        value={filterAgeCategory}
                        onChange={e => setFilterAgeCategory(e.target.value)}
                        className="pl-8 pr-7 h-9 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none cursor-pointer min-w-[160px]"
                      >
                        <option value="">All Age Groups</option>
                        <option value="bal">Bal(ika) (0–5)</option>
                        <option value="shishu">Shishu (6–11)</option>
                        <option value="kishor">Kishor(i) (12–16)</option>
                        <option value="tarun">Tarun(i) (17–30)</option>
                        <option value="yuva">Yuva(ti) (30–60)</option>
                        <option value="jyestha">Jyestha(a) (60+)</option>
                      </select>
                    </div>

                    {/* Role Type filter */}
                    <div className="relative">
                      <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                      <select
                        value={filterJobTitle}
                        onChange={e => setFilterJobTitle(e.target.value)}
                        className="pl-8 pr-7 h-9 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none cursor-pointer min-w-[140px]"
                      >
                        <option value="">All Roles</option>
                        {roleTypeOptions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Clear filters */}
                    {hasActiveFilter && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 px-3 h-9 text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Filtered result count */}
                  {hasActiveFilter && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                      Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredTotal}</span> of {allRecords.length} members
                    </p>
                  )}

                  {/* Column legend */}
                  <div className="flex items-center gap-2 mb-3 px-3">
                    <span className="w-8 text-center text-[10px] font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-wider flex-shrink-0">#</span>
                    <div className="w-8 flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-wider flex-1">Member</span>
                    <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-wider flex-shrink-0 mr-1">Mark</span>
                  </div>

                  {/* ── Attendance groups ─────────────────── */}
                  {filteredTotal === 0 ? (
                    <div className="py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
                      No members match your search or filters.
                    </div>
                  ) : (
                    <div className="space-y-6">

                      {/* Awaiting Mark */}
                      {unmarked.length > 0 && (
                        <div>
                          <GroupHeader icon={Users} iconClass="text-neutral-400" label="Awaiting Mark" count={unmarked.length} />
                          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                            {unmarked.map(r => (
                              <MemberRow
                                key={r.memberId}
                                record={r}
                                attendanceCount={attendanceCountMap.get(r.memberId) ?? 0}
                                isGuest={!!homeCentreMap.get(r.memberId) && homeCentreMap.get(r.memberId) !== session.activityCentre}
                                onMark={status => onMarkAttendance(session.id, r.memberId, status)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Present */}
                      {present.length > 0 && (
                        <div>
                          <GroupHeader icon={CheckCircle2} iconClass="text-success-500" label="Present" count={present.length} />
                          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 rounded-lg border border-success-100 dark:border-success-900/30 overflow-hidden">
                            {present.map(r => (
                              <MemberRow
                                key={r.memberId}
                                record={r}
                                attendanceCount={attendanceCountMap.get(r.memberId) ?? 0}
                                isGuest={!!homeCentreMap.get(r.memberId) && homeCentreMap.get(r.memberId) !== session.activityCentre}
                                onMark={status => onMarkAttendance(session.id, r.memberId, status)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Absent */}
                      {absent.length > 0 && (
                        <div>
                          <GroupHeader icon={XCircle} iconClass="text-error-400" label="Absent" count={absent.length} />
                          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 rounded-lg border border-error-100 dark:border-error-900/30 overflow-hidden">
                            {absent.map(r => (
                              <MemberRow
                                key={r.memberId}
                                record={r}
                                attendanceCount={attendanceCountMap.get(r.memberId) ?? 0}
                                isGuest={!!homeCentreMap.get(r.memberId) && homeCentreMap.get(r.memberId) !== session.activityCentre}
                                onMark={status => onMarkAttendance(session.id, r.memberId, status)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* ── Right: sidebar ────────────────────────────── */}
          <div className="space-y-6">

            {/* Attendance Stats */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Attendance Stats
              </div>

              <div className="space-y-4">
                {rate !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Attendance Rate</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          rate >= 75 ? 'bg-success-500' : rate >= 50 ? 'bg-warning-500' : 'bg-error-500'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                )}

                <dl className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-neutral-500 dark:text-neutral-400">Expected</dt>
                    <dd className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {session.totalExpected ?? allRecords.length}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-success-500 flex-shrink-0" /> Present
                    </dt>
                    <dd className="text-sm font-semibold text-success-700 dark:text-success-400">{totalPresent}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-error-500 flex-shrink-0" /> Absent
                    </dt>
                    <dd className="text-sm font-semibold text-error-700 dark:text-error-400">{totalAbsent}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-neutral-400 flex-shrink-0" /> Unmarked
                    </dt>
                    <dd className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">{totalUnmarked}</dd>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <dt className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-error-300 dark:bg-error-700 flex-shrink-0" /> Guests
                    </dt>
                    <dd className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {allRecords.filter(r => {
                        const home = homeCentreMap.get(r.memberId);
                        return !!home && home !== session.activityCentre;
                      }).length}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Help note */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Marking attendance</span>
                Use the <CheckCircle2 className="inline w-3 h-3 text-success-500 mx-0.5" /> and <XCircle className="inline w-3 h-3 text-error-400 mx-0.5" /> buttons to mark present or absent. Changes save instantly.
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">Attendance count (#)</span>
                The number before each name shows their total historical attendance across all sessions.
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-error-50 dark:bg-error-950/30 text-error-600 dark:text-error-400 border border-error-200 dark:border-error-800 mr-1">Guest</span>
                Members attending from a different activity centre.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
