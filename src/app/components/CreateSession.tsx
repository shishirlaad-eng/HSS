// ─────────────────────────────────────────────────────────────
// HSS UK — Create Session (full page, HB template style)
// ─────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
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
import { FormField, FormLabel, FormInput, FormSelect, ErrorText } from './hb/common';
import {
  ShakhaSession,
  AttendanceRecord,
  SHAKHA_TYPES,
  UTSAV_OPTIONS,
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
  utsav: string;
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
  utsav: 'None',
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
  sessionToEdit,
  onCancel,
  onCreate,
  onUpdate,
}: {
  initialDate: string;
  sessionToEdit?: ShakhaSession;
  onCancel: () => void;
  onCreate: (sessions: ShakhaSession[]) => void;
  onUpdate?: (id: string, updates: Partial<ShakhaSession>) => void;
}) {
  const isEditMode = !!sessionToEdit;
  const [form, setForm]     = useState<CreateForm>(
    sessionToEdit
      ? {
          date:           sessionToEdit.date,
          startTime:      sessionToEdit.startTime,
          endTime:        sessionToEdit.endTime,
          region:         sessionToEdit.region,
          town:           sessionToEdit.town,
          activityCentre: sessionToEdit.activityCentre,
          shakhaType:     sessionToEdit.shakhaType ?? '',
          utsav:          sessionToEdit.utsav ?? 'None',
          recurDays:      [],
          repeatUntil:    '',
        }
      : EMPTY_FORM(initialDate)
  );
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
    if (!isEditMode && isRecurring && !form.repeatUntil)
                              e.repeatUntil    = 'Repeat until date is required for recurring Shakhas.';
    if (!isEditMode && isRecurring && form.repeatUntil && form.repeatUntil < form.date)
                              e.repeatUntil    = 'Repeat until must be on or after the start date.';
    setErrors(e);
    return e;
  };

  const errCls = (key: string) => errors[key] ? 'border-error-400 dark:border-error-600 focus:ring-error-400/30' : '';

  const FIELD_ORDER = ['date', 'startTime', 'endTime', 'shakhaType', 'region', 'town', 'activityCentre', 'repeatUntil'];
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const focusFirstError = (errs: Record<string, string>) => {
    const firstKey = FIELD_ORDER.find(k => errs[k]);
    const el = firstKey ? fieldRefs.current[firstKey] : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
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
      utsav:          form.utsav,
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
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      toast.error('Please fill in all required fields.');
      focusFirstError(errs);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      if (isEditMode && sessionToEdit && onUpdate) {
        const title = `${form.activityCentre.replace(' Activity Centre', '')} — ${form.shakhaType}`;
        onUpdate(sessionToEdit.id, {
          date:           form.date,
          startTime:      form.startTime,
          endTime:        form.endTime,
          region:         form.region,
          town:           form.town,
          activityCentre: form.activityCentre,
          shakhaType:     form.shakhaType as ShakhaSession['shakhaType'],
          utsav:          form.utsav as ShakhaSession['utsav'],
          title,
          dayOfWeek:      new Date(form.date + 'T12:00:00').getDay(),
          attendanceRecords: buildAttendanceRecordsForCentre(form.activityCentre).map(r => ({ ...r })),
          totalExpected:  buildAttendanceRecordsForCentre(form.activityCentre).length,
        });
        toast.success('Shakha updated successfully');
      } else {
        const newSessions = buildSessions();
        onCreate(newSessions);
        toast.success(
          newSessions.length === 1
            ? 'Shakha created successfully'
            : `${newSessions.length} recurring Shakhas created successfully`,
        );
      }
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
    ? (isEditMode ? 'Saving…' : 'Creating…')
    : isEditMode
      ? 'Save Changes'
      : isRecurring && recurringPreviewCount > 0
        ? `Create ${recurringPreviewCount} Shakhas`
        : 'Create Shakha';

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950 min-h-screen">
      <div className="max-w-[100%] mx-auto">

        {/* ── Page Header ──────────────────────────────────── */}
        <PageHeader
          title={isEditMode ? 'Edit Shakha' : 'Create Shakha'}
          subtitle={isEditMode ? 'Update Shakha details' : 'Schedule a new Shakha gathering'}
          breadcrumbs={[
            { label: 'Sankhya' },
            { label: 'Shakha', onClick: onCancel },
            { label: isEditMode ? 'Edit Shakha' : 'Create Shakha', current: true },
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

            {/* ── Card: Shakha Details ───────────────────── */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={Calendar} title="Shakha Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Date — full width */}
                <div className="md:col-span-2">
                  <FormField>
                    <FormLabel required>Date</FormLabel>
                    <FormInput
                      ref={el => { fieldRefs.current.date = el; }}
                      type="date"
                      value={form.date}
                      onChange={e => setField('date', e.target.value)}
                      className={errCls('date')}
                    />
                    <ErrorText>{touched && errors.date}</ErrorText>
                  </FormField>
                </div>

                <FormField>
                  <FormLabel required>Start Time</FormLabel>
                  <FormInput
                    ref={el => { fieldRefs.current.startTime = el; }}
                    type="time"
                    value={form.startTime}
                    onChange={e => setField('startTime', e.target.value)}
                    className={errCls('startTime')}
                  />
                  <ErrorText>{touched && errors.startTime}</ErrorText>
                </FormField>

                <FormField>
                  <FormLabel required>End Time</FormLabel>
                  <FormInput
                    ref={el => { fieldRefs.current.endTime = el; }}
                    type="time"
                    value={form.endTime}
                    onChange={e => setField('endTime', e.target.value)}
                    className={errCls('endTime')}
                  />
                  <ErrorText>{touched && errors.endTime}</ErrorText>
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
                    ref={el => { fieldRefs.current.shakhaType = el; }}
                    value={form.shakhaType}
                    onChange={e => setField('shakhaType', e.target.value)}
                    className={errCls('shakhaType')}
                  >
                    <option value="">Select shakha type…</option>
                    {SHAKHA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </FormSelect>
                  <ErrorText>{touched && errors.shakhaType}</ErrorText>
                </FormField>

                <FormField>
                  <FormLabel>Utsav</FormLabel>
                  <FormSelect
                    value={form.utsav}
                    onChange={e => setField('utsav', e.target.value)}
                  >
                    {UTSAV_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                  </FormSelect>
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
                    ref={el => { fieldRefs.current.region = el; }}
                    value={form.region}
                    onChange={e => handleRegionChange(e.target.value)}
                    className={errCls('region')}
                  >
                    <option value="">Select region…</option>
                    {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </FormSelect>
                  <ErrorText>{touched && errors.region}</ErrorText>
                </FormField>

                <FormField>
                  <FormLabel required>Town</FormLabel>
                  <FormSelect
                    ref={el => { fieldRefs.current.town = el; }}
                    value={form.town}
                    onChange={e => handleTownChange(e.target.value)}
                    disabled={!form.region}
                    className={errCls('town')}
                  >
                    <option value="">Select town…</option>
                    {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </FormSelect>
                  <ErrorText>{touched && errors.town}</ErrorText>
                </FormField>

                <div className="md:col-span-2">
                  <FormField>
                    <FormLabel required>Activity Centre</FormLabel>
                    <FormSelect
                      ref={el => { fieldRefs.current.activityCentre = el; }}
                      value={form.activityCentre}
                      onChange={e => setField('activityCentre', e.target.value)}
                      disabled={!form.town}
                      className={errCls('activityCentre')}
                    >
                      <option value="">Select activity centre…</option>
                      {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </FormSelect>
                    <ErrorText>{touched && errors.activityCentre}</ErrorText>
                  </FormField>
                </div>

              </div>
            </div>

            {/* ── Card: Recurrence ─────────────────────────── */}
            {!isEditMode && <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <SectionHeader icon={RefreshCw} title="Recurrence" />

              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Select days to create recurring Shakhas, or leave all unchecked for a one-off Shakha.
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
                        ref={el => { fieldRefs.current.repeatUntil = el; }}
                        type="date"
                        value={form.repeatUntil}
                        min={form.date}
                        onChange={e => setField('repeatUntil', e.target.value)}
                        className={errCls('repeatUntil')}
                      />
                      <ErrorText>{touched && errors.repeatUntil}</ErrorText>
                      {recurringPreviewCount > 0 && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1.5 font-medium">
                          {recurringPreviewCount} Shakha{recurringPreviewCount !== 1 ? 's' : ''} will be created
                        </p>
                      )}
                    </FormField>
                  </div>
                </div>
              )}
            </div>}

          </div>

          {/* ── Right: sidebar summary ───────────────────────── */}
          <div className="space-y-6">

            {/* Shakha Summary */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                Shakha Summary
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
                    <Tag className="w-3.5 h-3.5" /> Utsav
                  </dt>
                  <dd className="text-xs font-medium text-neutral-900 dark:text-white text-right">
                    {form.utsav || 'None'}
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
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Total Shakhas</span>
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
                Once a Shakha is created, attendance records will be auto-populated for all active members at the selected activity centre.
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
