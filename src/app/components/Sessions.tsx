// ─────────────────────────────────────────────────────────────
// HSS UK — Sessions (Shakha Calendar)
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  X,
  CheckCircle2,
  XCircle,
  Filter,
  LayoutGrid,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from './hb/listing/PageHeader';
import { mockSessions, ShakhaSession, AttendanceRecord, SHAKHA_TYPES, getSessionShakhaType } from '../../mockAPI/attendanceData';
import { MASTERS_CASCADE, mockMembers, getAgeCategory } from '../../mockAPI/membersData';

// ── Create Session Modal ──────────────────────────────────────

// Mon-first order (UK convention): Mon=1,Tue=2,Wed=3,Thu=4,Fri=5,Sat=6,Sun=0
const WEEK_DAYS_ORDER: { label: string; dayNum: number }[] = [
  { label: 'Monday',    dayNum: 1 },
  { label: 'Tuesday',   dayNum: 2 },
  { label: 'Wednesday', dayNum: 3 },
  { label: 'Thursday',  dayNum: 4 },
  { label: 'Friday',    dayNum: 5 },
  { label: 'Saturday',  dayNum: 6 },
  { label: 'Sunday',    dayNum: 0 },
];

interface CreateForm {
  date: string;
  startTime: string;
  endTime: string;
  region: string;
  town: string;
  activityCentre: string;
  shakhaType: string;
  recurDays: number[];   // selected JS day numbers (0=Sun…6=Sat)
  repeatUntil: string;   // ISO date — required when recurDays.length > 0
}

const EMPTY_FORM = (date: string): CreateForm => ({
  date,
  startTime: '18:00',
  endTime:   '20:00',
  region: '',
  town: '',
  activityCentre: '',
  shakhaType: '',
  recurDays: [],
  repeatUntil: '',
});

function CreateSessionModal({
  initialDate,
  onClose,
  onCreate,
}: {
  initialDate: string;
  onClose: () => void;
  onCreate: (sessions: ShakhaSession[]) => void;
}) {
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM(initialDate));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateForm, string>>>({});

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const regionOptions = MASTERS_CASCADE.regions['HSS UK'] ?? [];
  const townOptions   = form.region ? (MASTERS_CASCADE.towns[form.region] ?? []) : [];
  const centreOptions = form.town   ? (MASTERS_CASCADE.centres[form.town] ?? []) : [];
  const isRecurring   = form.recurDays.length > 0;

  const setField = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const toggleDay = (dayNum: number) => {
    setForm(f => ({
      ...f,
      recurDays: f.recurDays.includes(dayNum)
        ? f.recurDays.filter(d => d !== dayNum)
        : [...f.recurDays, dayNum],
    }));
    setErrors(e => ({ ...e, recurDays: '' }));
  };

  const handleRegionChange = (v: string) => { setField('region', v); setField('town', ''); setField('activityCentre', ''); };
  const handleTownChange   = (v: string) => { setField('town', v);   setField('activityCentre', ''); };

  const validate = () => {
    const e: Partial<Record<keyof CreateForm, string>> = {};
    if (!form.date)           e.date           = 'Date is required';
    if (!form.startTime)      e.startTime      = 'Start time is required';
    if (!form.endTime)        e.endTime        = 'End time is required';
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
                              e.endTime        = 'End time must be after start time';
    if (!form.region)         e.region         = 'Region is required';
    if (!form.town)           e.town           = 'Town is required';
    if (!form.activityCentre) e.activityCentre = 'Activity Centre is required';
    if (!form.shakhaType)     e.shakhaType     = 'Shakha type is required';
    if (isRecurring && !form.repeatUntil)
                              e.repeatUntil    = 'Repeat until date is required for recurring sessions';
    if (isRecurring && form.repeatUntil && form.repeatUntil < form.date)
                              e.repeatUntil    = 'Repeat until must be on or after the start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Build all session dates: for each date in [startDate, repeatUntil] whose
  // day-of-week is in recurDays (or just the single start date if not recurring).
  const buildSessions = (): ShakhaSession[] => {
    const title = `${form.activityCentre.replace(' Activity Centre', '')} — ${form.shakhaType}`;
    const centreAttendanceRecords = buildAttendanceRecordsForCentre(form.activityCentre);
    const base = {
      activityCentre: form.activityCentre,
      region:         form.region,
      town:           form.town,
      shakhaType:     form.shakhaType,
      startTime:      form.startTime,
      endTime:        form.endTime,
      status:         'scheduled' as const,
      totalExpected:  centreAttendanceRecords.length,
    };

    if (!isRecurring) {
      const d = new Date(form.date + 'T12:00:00');
      return [{
        ...base,
        id:        `SES-NEW-${Date.now()}`,
        title,
        frequency: 'one-off' as const,
        dayOfWeek: d.getDay(),
        date:      form.date,
        attendanceRecords: centreAttendanceRecords.map(r => ({ ...r })),
      }];
    }

    // Recurring: walk day by day from startDate → repeatUntil
    const results: ShakhaSession[] = [];
    const startD = new Date(form.date + 'T12:00:00');
    const endD   = new Date(form.repeatUntil + 'T12:00:00');
    const cur    = new Date(startD);

    while (cur <= endD) {
      if (form.recurDays.includes(cur.getDay())) {
        const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
        results.push({
          ...base,
          id:        `SES-NEW-${Date.now()}-${dateStr}`,
          title,
          frequency: 'weekly' as const,
          dayOfWeek: cur.getDay(),
          date:      dateStr,
          attendanceRecords: centreAttendanceRecords.map(r => ({ ...r })),
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return results;
  };

  const handleCreate = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const newSessions = buildSessions();
      onCreate(newSessions);
      const count = newSessions.length;
      toast.success(
        count === 1
          ? 'Session created successfully'
          : `${count} recurring sessions created successfully`,
      );
      setSaving(false);
      onClose();
    }, 500);
  };

  const dateObj = new Date(form.date + 'T12:00:00');
  const dateLabel = form.date
    ? `${DAY_NAMES_FULL[dateObj.getDay()]}, ${dateObj.getDate()} ${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">New Session</h3>
            {dateLabel && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{dateLabel}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Date <span className="text-error-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => setField('date', e.target.value)}
              className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                errors.date ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
              }`}
            />
            {errors.date && <p className="text-xs text-error-500 mt-1">{errors.date}</p>}
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Start Time <span className="text-error-500">*</span>
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setField('startTime', e.target.value)}
                className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                  errors.startTime ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
                }`}
              />
              {errors.startTime && <p className="text-xs text-error-500 mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                End Time <span className="text-error-500">*</span>
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setField('endTime', e.target.value)}
                className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                  errors.endTime ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
                }`}
              />
              {errors.endTime && <p className="text-xs text-error-500 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Recurrence */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Recurrence</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                Select days to create recurring sessions, or leave blank for a one-off
              </p>
            </div>
            <div className="px-4 py-3 space-y-3">
              {/* Day checkboxes */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {WEEK_DAYS_ORDER.map(({ label, dayNum }) => (
                  <label
                    key={dayNum}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div
                      onClick={() => toggleDay(dayNum)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                        form.recurDays.includes(dayNum)
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 group-hover:border-primary-400'
                      }`}
                    >
                      {form.recurDays.includes(dayNum) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l2.5 2.5L8 3" />
                        </svg>
                      )}
                    </div>
                    <span
                      onClick={() => toggleDay(dayNum)}
                      className={`text-sm select-none transition-colors ${
                        form.recurDays.includes(dayNum)
                          ? 'text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Repeat until — only shown when days are selected */}
              {isRecurring && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Repeat Until <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.repeatUntil}
                    min={form.date}
                    onChange={e => setField('repeatUntil', e.target.value)}
                    className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                      errors.repeatUntil ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                  {errors.repeatUntil && <p className="text-xs text-error-500 mt-1">{errors.repeatUntil}</p>}
                  {/* Preview count */}
                  {form.repeatUntil && form.repeatUntil >= form.date && (() => {
                    let count = 0;
                    const cur = new Date(form.date + 'T12:00:00');
                    const end = new Date(form.repeatUntil + 'T12:00:00');
                    while (cur <= end) { if (form.recurDays.includes(cur.getDay())) count++; cur.setDate(cur.getDate() + 1); }
                    return count > 0 ? (
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-1.5">
                        {count} session{count !== 1 ? 's' : ''} will be created
                      </p>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Shakha Type */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Shakha Type <span className="text-error-500">*</span>
            </label>
            <select
              value={form.shakhaType}
              onChange={e => setField('shakhaType', e.target.value)}
              className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                errors.shakhaType ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <option value="">Select shakha type…</option>
              {SHAKHA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.shakhaType && <p className="text-xs text-error-500 mt-1">{errors.shakhaType}</p>}
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Region <span className="text-error-500">*</span>
            </label>
            <select
              value={form.region}
              onChange={e => handleRegionChange(e.target.value)}
              className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                errors.region ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <option value="">Select region…</option>
              {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.region && <p className="text-xs text-error-500 mt-1">{errors.region}</p>}
          </div>

          {/* Town */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Town <span className="text-error-500">*</span>
            </label>
            <select
              value={form.town}
              onChange={e => handleTownChange(e.target.value)}
              disabled={!form.region}
              className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.town ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <option value="">Select town…</option>
              {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.town && <p className="text-xs text-error-500 mt-1">{errors.town}</p>}
          </div>

          {/* Activity Centre */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Activity Centre <span className="text-error-500">*</span>
            </label>
            <select
              value={form.activityCentre}
              onChange={e => setField('activityCentre', e.target.value)}
              disabled={!form.town}
              className={`w-full h-9 px-3 text-sm rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.activityCentre ? 'border-error-400 dark:border-error-600' : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <option value="">Select activity centre…</option>
              {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.activityCentre && <p className="text-xs text-error-500 mt-1">{errors.activityCentre}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-70"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'Creating…' : 'Create Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES     = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function statusColor(status: ShakhaSession['status']) {
  if (status === 'completed')  return 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400 border-success-200 dark:border-success-800';
  if (status === 'cancelled')  return 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-400 border-error-200 dark:border-error-800';
  return 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400 border-primary-200 dark:border-primary-800';
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
      ageCategory: getAgeCategory(member.dateOfBirth),
      jobTitle: member.jobTitle,
      status: 'unmarked' as const,
    }));
}

// ── Session Detail Modal ──────────────────────────────────────
function SessionModal({
  session,
  onClose,
  onMarkAttendance,
}: {
  session: ShakhaSession;
  onClose: () => void;
  onMarkAttendance: (sessionId: string, memberId: string, status: AttendanceRecord['status']) => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const present = session.attendanceRecords.filter(r => r.status === 'present');
  const absent  = session.attendanceRecords.filter(r => r.status === 'absent');
  const unmarked = session.attendanceRecords.filter(r => r.status === 'unmarked');
  const markedCount = present.length + absent.length;
  const rate    = attendanceRate(session);

  const dateObj = new Date(session.date + 'T12:00:00');
  const dateLabel = `${DAY_NAMES_FULL[dateObj.getDay()]}, ${dateObj.getDate()} ${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const shakhaType = getSessionShakhaType(session);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(session.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot(session.status)}`} />
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{session.frequency}</span>
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white leading-tight">{session.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta info */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>{session.startTime} – {session.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span>{session.activityCentre}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Tag className="w-4 h-4 text-neutral-400" />
            <span>{shakhaType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Users className="w-4 h-4 text-neutral-400" />
            <span>
              {session.attendanceRecords.length > 0
                ? `${present.length} / ${markedCount} present${rate !== null ? ` (${rate}%)` : ''}`
                : `${session.totalExpected} expected`}
            </span>
          </div>
        </div>

        {/* Attendance list */}
        <div className="flex-1 overflow-y-auto">
          {session.attendanceRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No attendance recorded yet</p>
              <p className="text-xs text-neutral-400 mt-1">Attendance will appear here once the session starts</p>
            </div>
          ) : (
            <>
              {/* Mark Attendance */}
              {unmarked.length > 0 && (
                <div className="px-6 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Mark Attendance ({unmarked.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {unmarked.map(r => (
                      <MemberRow
                        key={r.memberId}
                        record={r}
                        onMark={status => onMarkAttendance(session.id, r.memberId, status)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Present */}
              {present.length > 0 && (
                <div className="px-6 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Present ({present.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {present.map(r => (
                      <MemberRow
                        key={r.memberId}
                        record={r}
                        onMark={status => onMarkAttendance(session.id, r.memberId, status)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Absent */}
              {absent.length > 0 && (
                <div className="px-6 pt-3 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-3.5 h-3.5 text-error-400" />
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Absent ({absent.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {absent.map(r => (
                      <MemberRow
                        key={r.memberId}
                        record={r}
                        onMark={status => onMarkAttendance(session.id, r.memberId, status)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  record,
  onMark,
}: {
  record: AttendanceRecord;
  onMark?: (status: AttendanceRecord['status']) => void;
}) {
  const initials = record.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{record.memberName}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{record.jobTitle} · {record.ageCategory} · {record.gender}</p>
      </div>
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
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
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

  // Local sessions list — starts from mock data, new sessions are appended
  const [sessions, setSessions] = useState<ShakhaSession[]>(mockSessions);

  const handleCreateSession = (newSessions: ShakhaSession[]) => {
    setSessions(prev => [...prev, ...newSessions]);
    setSelectedSession(newSessions[0] ?? null);
  };

  const handleMarkAttendance = (sessionId: string, memberId: string, status: AttendanceRecord['status']) => {
    const updateSession = (session: ShakhaSession): ShakhaSession => {
      if (session.id !== sessionId) return session;

      return {
        ...session,
        attendanceRecords: session.attendanceRecords.map(record =>
          record.memberId === memberId
            ? {
                ...record,
                status,
                markedAt: status === 'unmarked' ? undefined : new Date().toISOString(),
              }
            : record,
        ),
      };
    };

    setSessions(prev => prev.map(updateSession));
    setSelectedSession(prev => (prev ? updateSession(prev) : prev));
  };

  // Cascade options
  const regionOptions  = MASTERS_CASCADE.regions['HSS UK'] ?? [];
  const townOptions    = filterRegion ? (MASTERS_CASCADE.towns[filterRegion] ?? []) : [];
  const centreOptions  = filterTown   ? (MASTERS_CASCADE.centres[filterTown]  ?? []) : [];

  // Reset dependent filters on parent change
  const handleRegionChange = (v: string) => { setFilterRegion(v); setFilterTown(''); setFilterCentre(''); };
  const handleTownChange   = (v: string) => { setFilterTown(v);   setFilterCentre(''); };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (filterRegion && s.region !== filterRegion) return false;
      if (filterTown   && s.town   !== filterTown)   return false;
      if (filterCentre && s.activityCentre !== filterCentre) return false;
      return true;
    });
  }, [sessions, filterRegion, filterTown, filterCentre]);

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

  return (
    <div className="p-6">
      <PageHeader
        title="Sessions"
        subtitle="Shakha session calendar — view and manage recurring attendance sessions"
        breadcrumbs={[
          { label: 'Attendance' },
          { label: 'Sessions', current: true },
        ]}
      />

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

      {/* ── Toolbar row 2: always-visible filters ── */}
      <div className="flex flex-wrap items-end gap-3 mb-4 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <Filter className="w-4 h-4 text-neutral-400 self-center mt-4 flex-shrink-0" />
        {/* Region */}
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
        {/* Town */}
        <div className="flex flex-col gap-1 min-w-[160px] flex-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Town</label>
          <select
            value={filterTown}
            onChange={e => handleTownChange(e.target.value)}
            disabled={!filterRegion}
            className="h-9 px-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Towns</option>
            {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {/* Activity Centre */}
        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Activity Centre</label>
          <select
            value={filterCentre}
            onChange={e => setFilterCentre(e.target.value)}
            disabled={!filterTown}
            className="h-9 px-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Centres</option>
            {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
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
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {/* ── Month View ── */}
      {viewMode === 'month' && (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
            {DAY_NAMES_SHORT.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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
                  onClick={() => cell.date && setCreateDate(cell.date)}
                  className={`min-h-[110px] p-1.5 border-r border-b border-neutral-100 dark:border-neutral-800 last:border-r-0 ${
                    isLastRow ? 'border-b-0' : ''
                  } ${
                    !cell.date
                      ? 'bg-neutral-50/60 dark:bg-neutral-900/40'
                      : 'bg-white dark:bg-neutral-950 cursor-pointer hover:bg-primary-50/40 dark:hover:bg-primary-950/20 transition-colors group'
                  }`}
                >
                  {cell.dayNum !== null && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <Plus className="w-3 h-3 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
            {weekDays.map(wd => {
              const isToday = wd.date === todayIso;
              return (
                <div key={wd.date} className={`py-3 text-center border-r border-neutral-100 dark:border-neutral-800 last:border-r-0 ${isToday ? 'bg-primary-50 dark:bg-primary-950/30' : ''}`}>
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">{wd.dayName}</div>
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
                  onClick={() => setCreateDate(wd.date)}
                  className={`p-2 border-r border-neutral-100 dark:border-neutral-800 last:border-r-0 cursor-pointer group ${
                    isToday ? 'bg-primary-50/30 dark:bg-primary-950/10' : 'hover:bg-primary-50/30 dark:hover:bg-primary-950/10'
                  } transition-colors`}
                >
                  <div className="space-y-1">
                    {/* "+" hint when hovering empty area */}
                    {wdSessions.length === 0 && (
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

      {/* Session detail modal */}
      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onMarkAttendance={handleMarkAttendance}
        />
      )}

      {/* Create session modal */}
      {createDate && (
        <CreateSessionModal
          initialDate={createDate}
          onClose={() => setCreateDate(null)}
          onCreate={handleCreateSession}
        />
      )}
    </div>
  );
}
