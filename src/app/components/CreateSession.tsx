// ─────────────────────────────────────────────────────────────
// HSS UK — Create Session (full page, HB template style)
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  MapPin,
  Tag,
  RefreshCw,
  Info,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, SecondaryButton, PrimaryButton } from './hb/listing';
import { FormField, FormLabel, FormInput, FormSelect } from './hb/common';
import {
  ShakhaSession,
  AttendanceRecord,
  SHAKHA_TYPES,
} from '../../mockAPI/attendanceData';
import {
  MASTERS_CASCADE,
  mockMembers,
  getAgeGroup,
} from '../../mockAPI/membersData';
import { applyMemberCentreOverrides } from '../../mockAPI/shakhaTransferData';

// ── Constants ─────────────────────────────────────────────────

const WEEK_DAYS_ORDER: { label: string; dayNum: number }[] = [
  { label: 'Monday',    dayNum: 1 },
  { label: 'Tuesday',   dayNum: 2 },
  { label: 'Wednesday', dayNum: 3 },
  { label: 'Thursday',  dayNum: 4 },
  { label: 'Friday',    dayNum: 5 },
  { label: 'Saturday',  dayNum: 6 },
  { label: 'Sunday',    dayNum: 0 },
];

const DAY_NAMES_FULL = [
  'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday',
];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Form type ─────────────────────────────────────────────────

interface CreateForm {
  date: string;
  startTime: string;
  endTime: string;
  region: string;
  town: string;
  activityCentre: string;
  shakhaType: string;
  recurDays: number[];
  repeatUntil: string;
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

// ── Helpers ───────────────────────────────────────────────────

function buildAttendanceRecordsForCentre(activityCentre: string): AttendanceRecord[] {
  return applyMemberCentreOverrides(mockMembers)
    .filter(m => m.status === 'active' && m.activityCentre === activityCentre)
    .map(m => ({
      memberId:    m.id,
      memberName:  m.name,
      gender:      m.gender,
      ageCategory: getAgeGroup(m.dateOfBirth),
      jobTitle:    m.jobTitle,
      status:      'unmarked' as const,
    }));
}

// ── Section card header ────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-6 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      {title}
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────

export default function CreateSession({
  initialDate,
  onCancel,
  onCreate,
}: {
  initialDate: string;
  onCancel: () => void;
  onCreate: (sessions: ShakhaSession[]) => void;
}) {
  const [form, setForm]     = useState<CreateForm>(EMPTY_FORM(initialDate));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const regionOptions = MASTERS_CASCADE.regions['HSS UK'] ?? [];
  const townOptions   = form.region ? (MASTERS_CASCADE.towns[form.region]   ?? []) : [];
  const centreOptions = form.town   ? (MASTERS_CASCADE.centres[form.town]   ?? []) : [];
  const isRecurring   = form.recurDays.length > 0;

  const setField = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    if (touched) setErrors(e => ({ ...e, [k]: '' }));
  };

  const toggleDay = (dayNum: number) => {
    setForm(f => ({
      ...f,
      recurDays: f.recurDays.includes(dayNum)
        ? f.recurDays.filter(d => d !== dayNum)
        : [...f.recurDays, dayNum],
    }));
  };

  const handleRegionChange = (v: string) => {
    setForm(f => ({ ...f, region: v, town: '', activityCentre: '' }));
  };
  const handleTownChange = (v: string) => {
    setForm(f => ({ ...f, town: v, activityCentre: '' }));
  };

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.date)           e.date           = 'This field is required.';
    if (!form.startTime)      e.startTime      = 'This field is required.';
    if (!form.endTime)        e.endTime        = 'This field is required.';
    if (form.startTime && form.endTime && form.endTime <= form.startTime)
                              e.endTime        = 'End time must be after start time.';
    if (!form.region)         e.region         = 'This field is required.';
    if (!form.town)           e.town           = 'This field is required.';
    if (!form.activityCentre) e.activityCentre = 'This field is required.';
    if (!form.shakhaType)     e.shakhaType     = 'This field is required.';
    if (isRecurring && !form.repeatUntil)
                              e.repeatUntil    = 'Repeat until date is required for recurring sessions.';
    if (isRecurring && form.repeatUntil && form.repeatUntil < form.date)
                              e.repeatUntil    = 'Repeat until must be on or after the start date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build sessions ─────────────────────────────────────────
  const buildSessions = (): ShakhaSession[] => {
    const title = `${form.activityCentre.replace(' Activity Centre', '')} — ${form.shakhaType}`;
    const centreRecords = buildAttendanceRecordsForCentre(form.activityCentre);
    const base = {
      activityCentre: form.activityCentre,
      region:         form.region,
      town:           form.town,
      shakhaType:     form.shakhaType,
      startTime:      form.startTime,
      endTime:        form.endTime,
      status:         'scheduled' as const,
      totalExpected:  centreRecords.length,
    };

    if (!isRecurring) {
      const d = new Date(form.date + 'T12:00:00');
      return [{
        ...base,
        id:                `SES-NEW-${Date.now()}`,
        title,
        frequency:         'one-off' as const,
        dayOfWeek:         d.getDay(),
        date:              form.date,
        attendanceRecords: centreRecords.map(r => ({ ...r })),
      }];
    }

    const results: ShakhaSession[] = [];
    const cur = new Date(form.date + 'T12:00:00');
    const end = new Date(form.repeatUntil + 'T12:00:00');
    while (cur <= end) {
      if (form.recurDays.includes(cur.getDay())) {
        const ds = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
        results.push({
          ...base,
          id:                `SES-NEW-${Date.now()}-${ds}`,
          title,
          frequency:         'weekly' as const,
          dayOfWeek:         cur.getDay(),
          date:              ds,
          attendanceRecords: centreRecords.map(r => ({ ...r })),
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return results;
  };

  // ── Recurring preview count ───────────────────────────────
  const recurringPreviewCount = (() => {
    if (!isRecurring || !form.repeatUntil || form.repeatUntil < form.date) return 0;
    let count = 0;
    const cur = new Date(form.date + 'T12:00:00');
    const end = new Date(form.repeatUntil + 'T12:00:00');
    while (cur <= end) {
      if (form.recurDays.includes(cur.getDay())) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  })();

  // ── Submit ─────────────────────────────────────────────────
  const handleCreate = () => {
    setTouched(true);
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const newSessions = buildSessions();
      onCreate(newSessions);
      toast.success(
        newSessions.length === 1
          ? 'Session created successfully'
          : `${newSessions.length} recurring sessions created successfully`,
      );
      setSaving(false);
    }, 600);
  };

  // ── Computed display values ────────────────────────────────
  const dateLabel = form.date
    ? (() => {
        const d = new Date(form.date + 'T12:00:00');
        return `${DAY_NAMES_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      })()
    : '—';

  const createBtnLabel = saving
    ? 'Creating…'
    : isRecurring && recurringPreviewCount > 0
      ? `Create ${recurringPreviewCount} Sessions`
      : 'Create Session';

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">

        {/* ── Page Header ──────────────────────────────────── */}
        <PageHeader
          title="Create Session"
          subtitle="Schedule a new Shakha attendance session"
          breadcrumbs={[
            { label: 'Attendance' },
            { label: 'Sessions', onClick: onCancel },
            { label: 'Create Session', current: true },
          ]}
        >
          <div className="flex items-center gap-3">
            <SecondaryButton icon={ArrowLeft} onClick={onCancel} disabled={saving}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              icon={saving ? Loader2 : Save}
              onClick={handleCreate}
              isLoading={saving}
              disabled={saving}
            >
              {createBtnLabel}
            </PrimaryButton>
          </div>
        </PageHeader>

        {/* ── Body — 3-col grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-24">

          {/* ── Left: main form (col-span-2) ──────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Card: Session Details ───────────────────── */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={Calendar} title="Session Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Date — full width */}
                <div className="md:col-span-2">
                  <FormField>
                    <FormLabel required>Date</FormLabel>
                    <FormInput
                      type="date"
                      value={form.date}
                      onChange={e => setField('date', e.target.value)}
                    />
                    {touched && errors.date && <p className="text-xs text-error-600 mt-1">{errors.date}</p>}
                  </FormField>
                </div>

                <FormField>
                  <FormLabel required>Start Time</FormLabel>
                  <FormInput
                    type="time"
                    value={form.startTime}
                    onChange={e => setField('startTime', e.target.value)}
                  />
                  {touched && errors.startTime && <p className="text-xs text-error-600 mt-1">{errors.startTime}</p>}
                </FormField>

                <FormField>
                  <FormLabel required>End Time</FormLabel>
                  <FormInput
                    type="time"
                    value={form.endTime}
                    onChange={e => setField('endTime', e.target.value)}
                  />
                  {touched && errors.endTime && <p className="text-xs text-error-600 mt-1">{errors.endTime}</p>}
                </FormField>

              </div>
            </div>

            {/* ── Card: Shakha Type ────────────────────────── */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={Tag} title="Shakha Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField>
                  <FormLabel required>Shakha Type</FormLabel>
                  <FormSelect
                    value={form.shakhaType}
                    onChange={e => setField('shakhaType', e.target.value)}
                  >
                    <option value="">Select shakha type…</option>
                    {SHAKHA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </FormSelect>
                  {touched && errors.shakhaType && <p className="text-xs text-error-600 mt-1">{errors.shakhaType}</p>}
                </FormField>
              </div>
            </div>

            {/* ── Card: Location ───────────────────────────── */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={MapPin} title="Location" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <FormField>
                  <FormLabel required>Region</FormLabel>
                  <FormSelect
                    value={form.region}
                    onChange={e => handleRegionChange(e.target.value)}
                  >
                    <option value="">Select region…</option>
                    {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </FormSelect>
                  {touched && errors.region && <p className="text-xs text-error-600 mt-1">{errors.region}</p>}
                </FormField>

                <FormField>
                  <FormLabel required>Town</FormLabel>
                  <FormSelect
                    value={form.town}
                    onChange={e => handleTownChange(e.target.value)}
                    disabled={!form.region}
                  >
                    <option value="">Select town…</option>
                    {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </FormSelect>
                  {touched && errors.town && <p className="text-xs text-error-600 mt-1">{errors.town}</p>}
                </FormField>

                <div className="md:col-span-2">
                  <FormField>
                    <FormLabel required>Activity Centre</FormLabel>
                    <FormSelect
                      value={form.activityCentre}
                      onChange={e => setField('activityCentre', e.target.value)}
                      disabled={!form.town}
                    >
                      <option value="">Select activity centre…</option>
                      {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </FormSelect>
                    {touched && errors.activityCentre && <p className="text-xs text-error-600 mt-1">{errors.activityCentre}</p>}
                  </FormField>
                </div>

              </div>
            </div>

            {/* ── Card: Recurrence ─────────────────────────── */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={RefreshCw} title="Recurrence" />

              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Select days to create recurring sessions, or leave all unchecked for a one-off session.
              </p>

              {/* Day checkboxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 mb-6">
                {WEEK_DAYS_ORDER.map(({ label, dayNum }) => {
                  const checked = form.recurDays.includes(dayNum);
                  return (
                    <label
                      key={dayNum}
                      className="flex items-center gap-2.5 cursor-pointer group"
                      onClick={() => toggleDay(dayNum)}
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 group-hover:border-primary-400'
                        }`}
                      >
                        {checked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l2.5 2.5L8 3" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm select-none transition-colors ${
                        checked
                          ? 'text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Repeat Until — only when days are selected */}
              {isRecurring && (
                <div className="pt-5 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField>
                      <FormLabel required>Repeat Until</FormLabel>
                      <FormInput
                        type="date"
                        value={form.repeatUntil}
                        min={form.date}
                        onChange={e => setField('repeatUntil', e.target.value)}
                      />
                      {touched && errors.repeatUntil && <p className="text-xs text-error-600 mt-1">{errors.repeatUntil}</p>}
                      {recurringPreviewCount > 0 && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1.5 font-medium">
                          {recurringPreviewCount} session{recurringPreviewCount !== 1 ? 's' : ''} will be created
                        </p>
                      )}
                    </FormField>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Right: sidebar summary ───────────────────────── */}
          <div className="space-y-6">

            {/* Session Summary */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Session Summary
              </div>
              <dl className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </dt>
                  <dd className="text-xs font-medium text-neutral-900 dark:text-white text-right">
                    {dateLabel}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </dt>
                  <dd className="text-xs font-medium text-neutral-900 dark:text-white text-right">
                    {form.startTime && form.endTime ? `${form.startTime} – ${form.endTime}` : '—'}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-shrink-0">
                    <Tag className="w-3.5 h-3.5" /> Shakha
                  </dt>
                  <dd className="text-xs font-medium text-neutral-900 dark:text-white text-right">
                    {form.shakhaType || '—'}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5" /> Centre
                  </dt>
                  <dd className="text-xs font-medium text-neutral-900 dark:text-white text-right">
                    {form.activityCentre || '—'}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-shrink-0">
                    <RefreshCw className="w-3.5 h-3.5" /> Recurrence
                  </dt>
                  <dd className="text-xs font-medium text-neutral-900 dark:text-white text-right">
                    {isRecurring
                      ? form.recurDays.map(d => WEEK_DAYS_ORDER.find(w => w.dayNum === d)?.label.slice(0,3)).join(', ')
                      : 'One-off'}
                  </dd>
                </div>

                {isRecurring && recurringPreviewCount > 0 && (
                  <div className="pt-3 mt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Total sessions</span>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {recurringPreviewCount}
                      </span>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Help note */}
            <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 rounded-lg p-4">
              <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed">
                <span className="font-semibold block mb-1">Attendance tracking</span>
                Once a session is created, attendance records will be auto-populated for all active members at the selected activity centre.
              </p>
            </div>

          </div>

        </div>

        {/* ── Sticky footer ─────────────────────────────────── */}
        <div className="fixed bottom-0 right-0 left-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-4 z-30 ml-[260px]">
          <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
            <SecondaryButton icon={ArrowLeft} onClick={onCancel} disabled={saving}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              icon={saving ? Loader2 : Save}
              onClick={handleCreate}
              isLoading={saving}
              disabled={saving}
            >
              {createBtnLabel}
            </PrimaryButton>
          </div>
        </div>

      </div>
    </div>
  );
}
