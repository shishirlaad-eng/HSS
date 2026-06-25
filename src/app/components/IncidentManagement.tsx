import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  MoreVertical,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  ChevronLeft,
  Calendar,
  MapPin,
  User,
  HeartPulse,
  Info,
  Tag,
  ClipboardCheck,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import {
  mockIncidents,
  FirstAidIncident,
  IncidentType,
  IncidentOutcome,
  INCIDENT_TYPES,
  INCIDENT_OUTCOMES,
} from '../../mockAPI/incidentData';
import { mockMembers } from '../../mockAPI/membersData';
import { mockSessions, ShakhaSession } from '../../mockAPI/attendanceData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'table';
type PageState = 'list' | 'detail' | 'create' | 'edit';

// ── Outcome badge ─────────────────────────────────────────────

const OUTCOME_CFG: Record<IncidentOutcome, { bg: string; text: string }> = {
  'Returned to Activity': { bg: 'bg-[#f1fced] dark:bg-emerald-950/30', text: 'text-[#3d8928] dark:text-emerald-400' },
  'Sent Home':            { bg: 'bg-[#fffbeb] dark:bg-amber-950/30',    text: 'text-[#d97706] dark:text-amber-400'  },
  'Taken to Hospital':    { bg: 'bg-[#fff4f0] dark:bg-orange-950/30',   text: 'text-[#c2410c] dark:text-orange-400' },
  'Ambulance Called':     { bg: 'bg-[#fff0f0] dark:bg-red-950/30',      text: 'text-[#9a0c17] dark:text-red-400'    },
};

function OutcomeBadge({ outcome }: { outcome: IncidentOutcome }) {
  const { bg, text } = OUTCOME_CFG[outcome];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bg} ${text} border-current/20`}>
      {outcome}
    </span>
  );
}

const TYPE_CFG: Record<IncidentType, string> = {
  'Minor Injury':    'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
  'Major Injury':    'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
  'Illness':         'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  'Allergic Reaction': 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400',
  'Other':           'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400',
};

function TypeBadge({ type }: { type: IncidentType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_CFG[type]}`}>
      {type}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Form types ────────────────────────────────────────────────

interface IncidentForm {
  dateTime: string;
  sessionId: string;
  isShakhaMember: boolean;
  memberId: string;
  casualtyName: string;
  incidentType: IncidentType | '';
  incidentDescription: string;
  firstAidGiven: string;
  firstAiderName: string;
  outcome: IncidentOutcome | '';
  reportedBy: string;
  witnesses: string;
  followUpRequired: boolean;
  followUpNotes: string;
}

const EMPTY_FORM: IncidentForm = {
  dateTime: new Date().toISOString().slice(0, 16),
  sessionId: '',
  isShakhaMember: false,
  memberId: '',
  casualtyName: '',
  incidentType: '',
  incidentDescription: '',
  firstAidGiven: '',
  firstAiderName: '',
  outcome: '',
  reportedBy: '',
  witnesses: '',
  followUpRequired: false,
  followUpNotes: '',
};

// ── Delete confirm modal ──────────────────────────────────────

function DeleteModal({
  incident,
  isLoading,
  onClose,
  onConfirm,
}: {
  incident: FirstAidIncident;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-md p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#fff0f0] flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-[#BC0F1C]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">Delete Incident Record</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              This will permanently delete the incident record. This action cannot be undone.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{incident.casualtyName}</span>
              <span className="ml-2 text-neutral-400">·</span>
              <span className="ml-2">{fmtDate(incident.dateTime)}</span>
              <span className="ml-2 font-mono text-neutral-400">{incident.id}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-lg font-medium bg-[#BC0F1C] hover:bg-[#9a0c17] text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create / Edit form ────────────────────────────────────────

function IncidentForm({
  incident,
  scopeCentre,
  scopeMembers,
  scopeSessions,
  onCancel,
  onSave,
}: {
  incident?: FirstAidIncident;
  scopeCentre?: string;
  scopeMembers: typeof mockMembers;
  scopeSessions: typeof mockSessions;
  onCancel: () => void;
  onSave: (form: IncidentForm) => void;
}) {
  const isEdit = !!incident;
  const [form, setForm] = useState<IncidentForm>(
    incident
      ? {
          dateTime: incident.dateTime.slice(0, 16),
          sessionId: incident.sessionId ?? '',
          isShakhaMember: incident.isShakhaMember,
          memberId: incident.memberId ?? '',
          casualtyName: incident.casualtyName,
          incidentType: incident.incidentType,
          incidentDescription: incident.incidentDescription,
          firstAidGiven: incident.firstAidGiven,
          firstAiderName: incident.firstAiderName,
          outcome: incident.outcome,
          reportedBy: incident.reportedBy,
          witnesses: incident.witnesses ?? '',
          followUpRequired: incident.followUpRequired,
          followUpNotes: incident.followUpNotes ?? '',
        }
      : EMPTY_FORM,
  );
  const [touched, setTouched] = useState(false);

  const set = (k: keyof IncidentForm, v: any) => setForm(p => ({ ...p, [k]: v }));

  const errors = {
    dateTime:            !form.dateTime,
    casualtyName:        !form.casualtyName.trim(),
    incidentType:        !form.incidentType,
    incidentDescription: !form.incidentDescription.trim(),
    firstAidGiven:       !form.firstAidGiven.trim(),
    firstAiderName:      !form.firstAiderName.trim(),
    outcome:             !form.outcome,
    reportedBy:          !form.reportedBy.trim(),
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = () => {
    setTouched(true);
    if (hasErrors) return;
    onSave(form);
  };

  const fieldCls = (err: boolean) =>
    `w-full text-sm rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
      touched && err
        ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
        : 'border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400'
    }`;

  const activeSessions = scopeSessions.filter(s => s.status !== 'cancelled');

  const SummaryRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 flex-shrink-0">
        <Icon className="w-3.5 h-3.5" /> {label}
      </dt>
      <dd className="text-xs font-medium text-neutral-900 dark:text-white text-right">{value || '—'}</dd>
    </div>
  );

  return (
    <div className="p-6 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          {isEdit ? 'Edit Incident Record' : 'Record First Aid Incident'}
        </h2>
      </div>

      {/* Two-box grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: main form (col-span-2) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Incident Details */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Incident Details</h3>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={e => set('dateTime', e.target.value)}
                  className={fieldCls(errors.dateTime)}
                />
              </div>

              {scopeCentre && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Shakha</label>
                  <input
                    type="text"
                    value={scopeCentre}
                    readOnly
                    className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Incident Type <span className="text-red-500">*</span>
                </label>
                <select value={form.incidentType} onChange={e => set('incidentType', e.target.value as IncidentType)} className={fieldCls(errors.incidentType)}>
                  <option value="">Select type…</option>
                  {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Linked Shakha Session <span className="text-neutral-400 text-xs font-normal">(optional)</span>
                </label>
                <select value={form.sessionId} onChange={e => set('sessionId', e.target.value)} className={fieldCls(false)}>
                  <option value="">— None —</option>
                  {activeSessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title} · {fmtDate(s.date)}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Incident Description <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={form.incidentDescription} onChange={e => set('incidentDescription', e.target.value)} placeholder="Describe what happened…" className={fieldCls(errors.incidentDescription)} />
              </div>

            </div>
          </div>

          {/* Casualty */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Casualty</h3>
            </div>
            <div className="px-5 py-5 space-y-4">

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { set('isShakhaMember', !form.isShakhaMember); set('memberId', ''); }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isShakhaMember ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${form.isShakhaMember ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Shakha Member</span>
              </div>

              {form.isShakhaMember ? (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Select Member <span className="text-red-500">*</span>
                  </label>
                  <select value={form.memberId} onChange={e => { const m = scopeMembers.find(m => m.id === e.target.value); set('memberId', e.target.value); if (m) set('casualtyName', m.name); }} className={fieldCls(!form.memberId && touched)}>
                    <option value="">Select member…</option>
                    {scopeMembers.filter(m => m.status === 'active').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Casualty Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.casualtyName} onChange={e => set('casualtyName', e.target.value)} placeholder="Full name of casualty…" className={fieldCls(errors.casualtyName)} />
                </div>
              )}

            </div>
          </div>

          {/* Treatment & Outcome */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Treatment & Outcome</h3>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  First Aid Given <span className="text-red-500">*</span>
                </label>
                <textarea rows={3} value={form.firstAidGiven} onChange={e => set('firstAidGiven', e.target.value)} placeholder="Describe treatment administered…" className={fieldCls(errors.firstAidGiven)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  First Aider Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.firstAiderName} onChange={e => set('firstAiderName', e.target.value)} placeholder="Name of first aider…" className={fieldCls(errors.firstAiderName)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Outcome <span className="text-red-500">*</span>
                </label>
                <select value={form.outcome} onChange={e => set('outcome', e.target.value as IncidentOutcome)} className={fieldCls(errors.outcome)}>
                  <option value="">Select outcome…</option>
                  {INCIDENT_OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

            </div>
          </div>

          {/* Reporting & Follow-up */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Reporting & Follow-up</h3>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Reported By <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.reportedBy} onChange={e => set('reportedBy', e.target.value)} placeholder="Name of person reporting…" className={fieldCls(errors.reportedBy)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Witnesses <span className="text-neutral-400 text-xs font-normal">(optional)</span>
                </label>
                <input type="text" value={form.witnesses} onChange={e => set('witnesses', e.target.value)} placeholder="Names of any witnesses…" className={fieldCls(false)} />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <button type="button" onClick={() => set('followUpRequired', !form.followUpRequired)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.followUpRequired ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${form.followUpRequired ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Follow-up Required</span>
              </div>

              {form.followUpRequired && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Follow-up Notes</label>
                  <textarea rows={2} value={form.followUpNotes} onChange={e => set('followUpNotes', e.target.value)} placeholder="What follow-up is needed…" className={fieldCls(false)} />
                </div>
              )}

            </div>
          </div>

          {touched && hasErrors && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Please fill in all required fields.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-lg font-semibold bg-[#172E4D] hover:bg-[#172E4D]/80 text-white transition-colors">
              {isEdit ? 'Save Changes' : 'Record Incident'}
            </button>
          </div>

        </div>

        {/* ── Right: summary sidebar ── */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Incident Summary
            </div>
            <dl className="space-y-3.5">
              <SummaryRow icon={Calendar}      label="Date"       value={form.dateTime ? new Date(form.dateTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''} />
              <SummaryRow icon={MapPin}        label="Shakha"     value={scopeCentre ?? '—'} />
              <SummaryRow icon={Tag}           label="Type"       value={form.incidentType} />
              <SummaryRow icon={User}          label="Casualty"   value={form.casualtyName} />
              <SummaryRow icon={HeartPulse}    label="First Aider" value={form.firstAiderName} />
              <SummaryRow icon={ClipboardCheck} label="Outcome"   value={form.outcome} />
              {form.followUpRequired && (
                <div className="pt-3 mt-1 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Follow-up Required</span>
                </div>
              )}
            </dl>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Detail view ───────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      <div className="text-sm font-medium text-neutral-900 dark:text-white">{children}</div>
    </div>
  );
}

function IncidentDetail({
  incident,
  canEdit,
  onBack,
  onEdit,
  onDelete,
}: {
  incident: FirstAidIncident;
  canEdit: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-6 pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Incident Record</h2>
          <span className="font-mono text-xs text-neutral-400">{incident.id}</span>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="flex items-center gap-2 px-3 h-9 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onDelete} className="flex items-center gap-2 px-3 h-9 text-xs font-medium rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-white dark:bg-neutral-950 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Badge strip */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <TypeBadge type={incident.incidentType} />
        <OutcomeBadge outcome={incident.outcome} />
        {incident.followUpRequired && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Follow-up Required
          </span>
        )}
      </div>

      {/* Two-box grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: main detail cards (col-span-2) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Incident Details */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Incident Details</h3>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailRow label="Date & Time">{fmtDateTime(incident.dateTime)}</DetailRow>
              <DetailRow label="Shakha">{incident.activityCentre}</DetailRow>
              <DetailRow label="Incident Type"><TypeBadge type={incident.incidentType} /></DetailRow>
              {incident.sessionId && <DetailRow label="Linked Session">{incident.sessionId}</DetailRow>}
              <div className="sm:col-span-2">
                <DetailRow label="Incident Description">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed whitespace-pre-wrap">{incident.incidentDescription}</p>
                </DetailRow>
              </div>
            </div>
          </div>

          {/* Casualty */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Casualty</h3>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailRow label="Name">{incident.casualtyName}</DetailRow>
              <DetailRow label="Shakha Member">{incident.isShakhaMember ? 'Yes' : 'No'}</DetailRow>
              {incident.memberId && <DetailRow label="Member ID">{incident.memberId}</DetailRow>}
            </div>
          </div>

          {/* Treatment & Outcome */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Treatment & Outcome</h3>
            </div>
            <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <DetailRow label="First Aid Given">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed whitespace-pre-wrap">{incident.firstAidGiven}</p>
                </DetailRow>
              </div>
              <DetailRow label="First Aider">{incident.firstAiderName}</DetailRow>
              <DetailRow label="Outcome"><OutcomeBadge outcome={incident.outcome} /></DetailRow>
            </div>
          </div>

        </div>

        {/* ── Right: reporting sidebar ── */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Reporting & Follow-up</h3>
            </div>
            <div className="px-5 py-5 space-y-4">
              <DetailRow label="Reported By">{incident.reportedBy}</DetailRow>
              {incident.witnesses && <DetailRow label="Witnesses">{incident.witnesses}</DetailRow>}
              <DetailRow label="Follow-up Required">{incident.followUpRequired ? 'Yes' : 'No'}</DetailRow>
              {incident.followUpRequired && incident.followUpNotes && (
                <DetailRow label="Follow-up Notes">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed whitespace-pre-wrap">{incident.followUpNotes}</p>
                </DetailRow>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function IncidentManagement() {
  const { scope, selectedRole } = useRoleScope();
  const canEdit = ['Shakha Admin', 'Nagar Admin', 'Vibhaag Admin', 'Super Admin', 'Kendriya Admin'].includes(selectedRole);
  const scopedFilterOptions = getScopedFilterOptions(scope);

  const [incidents, setIncidents] = useState<FirstAidIncident[]>(mockIncidents);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [pageState, setPageState] = useState<PageState>('list');
  const [selected, setSelected] = useState<FirstAidIncident | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [deleteModal, setDeleteModal] = useState<{ open: boolean; incident: FirstAidIncident | null; loading: boolean }>({
    open: false, incident: null, loading: false,
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  const scopedIncidents = useMemo(() => filterByScope(incidents, scope), [incidents, scope]);
  const scopedMembers   = useMemo(() => filterByScope(mockMembers, scope), [scope]);
  const scopedSessions  = useMemo(() => filterByScope(mockSessions, scope), [scope]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scopedIncidents.filter(inc => {
      const matchSearch = !q ||
        inc.casualtyName.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.firstAiderName.toLowerCase().includes(q) ||
        inc.incidentType.toLowerCase().includes(q) ||
        inc.activityCentre.toLowerCase().includes(q);

      const matchFilters = filters.every(f => {
        if (!f.values.length) return true;
        switch (f.field) {
          case 'Incident Type': return f.values.includes(inc.incidentType);
          case 'Outcome':       return f.values.includes(inc.outcome);
          case 'Follow-up':     return f.values.includes(inc.followUpRequired ? 'Yes' : 'No');
          case 'Vibhaag':       return f.values.includes(inc.region);
          case 'Nagar':         return f.values.includes(inc.town);
          case 'Shakha':        return f.values.includes(inc.activityCentre);
          default:              return true;
        }
      });
      return matchSearch && matchFilters;
    });
  }, [scopedIncidents, searchQuery, filters]);

  const paginated = useMemo(() => {
    if (itemsPerPage === 0) return filtered;
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(filtered.length / itemsPerPage);

  // ── Handlers ─────────────────────────────────────────────────

  const nextId = () => `FAI-${String(incidents.length + 1).padStart(3, '0')}`;

  const handleSave = (form: IncidentForm) => {
    const now = new Date().toISOString();
    if (pageState === 'edit' && selected) {
      const updated: FirstAidIncident = {
        ...selected,
        dateTime: form.dateTime,
        sessionId: form.sessionId || undefined,
        isShakhaMember: form.isShakhaMember,
        memberId: form.isShakhaMember ? form.memberId || undefined : undefined,
        casualtyName: form.casualtyName,
        incidentType: form.incidentType as IncidentType,
        incidentDescription: form.incidentDescription,
        firstAidGiven: form.firstAidGiven,
        firstAiderName: form.firstAiderName,
        outcome: form.outcome as IncidentOutcome,
        reportedBy: form.reportedBy,
        witnesses: form.witnesses || undefined,
        followUpRequired: form.followUpRequired,
        followUpNotes: form.followUpRequired ? form.followUpNotes || undefined : undefined,
        updatedAt: now,
      };
      setIncidents(prev => prev.map(i => i.id === selected.id ? updated : i));
      setSelected(updated);
      setPageState('detail');
      toast.success('Incident record updated.');
    } else {
      const created: FirstAidIncident = {
        id: nextId(),
        country: scope.country ?? 'HSS UK',
        region: scope.region ?? '',
        town: scope.town ?? '',
        activityCentre: scope.centre ?? form.sessionId ?? '',
        dateTime: form.dateTime,
        sessionId: form.sessionId || undefined,
        isShakhaMember: form.isShakhaMember,
        memberId: form.isShakhaMember ? form.memberId || undefined : undefined,
        casualtyName: form.casualtyName,
        incidentType: form.incidentType as IncidentType,
        incidentDescription: form.incidentDescription,
        firstAidGiven: form.firstAidGiven,
        firstAiderName: form.firstAiderName,
        outcome: form.outcome as IncidentOutcome,
        reportedBy: form.reportedBy,
        witnesses: form.witnesses || undefined,
        followUpRequired: form.followUpRequired,
        followUpNotes: form.followUpRequired ? form.followUpNotes || undefined : undefined,
        createdAt: now,
        updatedAt: now,
      };
      setIncidents(prev => [created, ...prev]);
      setPageState('list');
      toast.success('Incident recorded successfully.');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.incident) return;
    setDeleteModal(p => ({ ...p, loading: true }));
    await new Promise(r => setTimeout(r, 500));
    setIncidents(prev => prev.filter(i => i.id !== deleteModal.incident!.id));
    toast.success('Incident record deleted.');
    setDeleteModal({ open: false, incident: null, loading: false });
    if (pageState === 'detail') { setPageState('list'); setSelected(null); }
  };

  const handleExportCSV = () => {
    if (!filtered.length) { toast.error('No data to export.'); return; }
    const headers = ['ID', 'Date', 'Shakha', 'Casualty', 'Member?', 'Type', 'Outcome', 'First Aider', 'Follow-up'];
    const csv = [
      headers.join(','),
      ...filtered.map(i => [
        i.id,
        new Date(i.dateTime).toLocaleDateString('en-GB'),
        `"${i.activityCentre}"`,
        `"${i.casualtyName}"`,
        i.isShakhaMember ? 'Yes' : 'No',
        `"${i.incidentType}"`,
        `"${i.outcome}"`,
        `"${i.firstAiderName}"`,
        i.followUpRequired ? 'Yes' : 'No',
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `first-aid-incidents_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported.');
  };

  // ── Sub-pages ─────────────────────────────────────────────────

  if (pageState === 'create') {
    return (
      <IncidentForm
        scopeCentre={scope.centre}
        scopeMembers={scopedMembers}
        scopeSessions={scopedSessions}
        onCancel={() => setPageState('list')}
        onSave={handleSave}
      />
    );
  }

  if (pageState === 'edit' && selected) {
    return (
      <>
        <IncidentForm
          incident={selected}
          scopeCentre={scope.centre}
          scopeMembers={scopedMembers}
          scopeSessions={scopedSessions}
          onCancel={() => setPageState('detail')}
          onSave={handleSave}
        />
        {deleteModal.open && deleteModal.incident && (
          <DeleteModal
            incident={deleteModal.incident}
            isLoading={deleteModal.loading}
            onClose={() => setDeleteModal({ open: false, incident: null, loading: false })}
            onConfirm={handleDelete}
          />
        )}
      </>
    );
  }

  if (pageState === 'detail' && selected) {
    const live = incidents.find(i => i.id === selected.id) ?? selected;
    return (
      <>
        <IncidentDetail
          incident={live}
          canEdit={canEdit}
          onBack={() => { setPageState('list'); setSelected(null); }}
          onEdit={() => setPageState('edit')}
          onDelete={() => setDeleteModal({ open: true, incident: live, loading: false })}
        />
        {deleteModal.open && deleteModal.incident && (
          <DeleteModal
            incident={deleteModal.incident}
            isLoading={deleteModal.loading}
            onClose={() => setDeleteModal({ open: false, incident: null, loading: false })}
            onConfirm={handleDelete}
          />
        )}
      </>
    );
  }

  // ── List ──────────────────────────────────────────────────────

  const filterOptions: Record<string, string[]> = {
    'Incident Type': [...INCIDENT_TYPES],
    'Outcome':       [...INCIDENT_OUTCOMES],
    'Follow-up':     ['Yes', 'No'],
    ...(scope.showRegionFilter ? { 'Vibhaag': scopedFilterOptions.regionOptions } : {}),
    ...(scope.showTownFilter   ? { 'Nagar':   scopedFilterOptions.townOptions   } : {}),
    ...(scope.showCentreFilter ? { 'Shakha':  scopedFilterOptions.centreOptions } : {}),
  };

  const getRowMenu = (inc: FirstAidIncident) => [
    { icon: Eye,    label: 'View',   onClick: () => { setSelected(inc); setPageState('detail'); } },
    ...(canEdit ? [
      { icon: Pencil, label: 'Edit',   onClick: () => { setSelected(inc); setPageState('edit'); } },
      { icon: Trash2, label: 'Delete', onClick: () => setDeleteModal({ open: true, incident: inc, loading: false }) },
    ] : []),
  ];

  const hasFilters = searchQuery.length > 0 || filters.some(f => f.values.length > 0);

  const EmptyState = () => (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          {hasFilters ? <Search className="w-6 h-6 text-neutral-400" /> : <HeartPulse className="w-6 h-6 text-neutral-400" />}
        </div>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
          {hasFilters ? 'No incidents match your search.' : 'No incident records yet.'}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {hasFilters ? 'Try adjusting your search or filters.' : 'Record a first aid incident using the button above.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">

        <PageHeader
          title="First Aid Incidents"
          subtitle="Record and manage first aid incidents attributed to Shakha sessions."
          breadcrumbs={[
            { label: 'Sankhya', href: '#' },
            { label: 'First Aid Incidents', current: true },
          ]}
        >
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onAdvancedSearch={() => setShowAdvanced(true)}
              activeFilterCount={filters.filter(f => f.values.length > 0).length}
              placeholder="Search by casualty, type, first aider…"
            />
            <AdvancedSearchPanel
              isOpen={showAdvanced}
              onClose={() => setShowAdvanced(false)}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={filterOptions}
              title="Filter Incidents"
            />
          </div>
          <IconButton icon={RefreshCw} onClick={() => {}} title="Refresh" />
          <IconButton
            icon={MoreVertical}
            title="More options"
            menuItems={[
              { icon: FileSpreadsheet, label: 'Export as CSV', onClick: handleExportCSV },
            ]}
          />
          {canEdit && (
            <button
              onClick={() => setPageState('create')}
              className="flex items-center gap-2 px-3 h-9 text-xs font-semibold rounded-lg bg-[#172E4D] hover:bg-[#172E4D]/80 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Incident
            </button>
          )}
          <ViewModeSwitcher currentMode={viewMode} onChange={setViewMode} />
        </PageHeader>

        {/* ── GRID ──────────────────────────────────────────────── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.length > 0 ? paginated.map(inc => (
              <div
                key={inc.id}
                onClick={() => { setSelected(inc); setPageState('detail'); }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 hover:shadow-md hover:border-primary-600 dark:hover:border-primary-400 transition-all cursor-pointer shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <TypeBadge type={inc.incidentType} />
                  <div onClick={e => e.stopPropagation()}>
                    <IconButton icon={MoreVertical} borderless title="Actions" menuItems={getRowMenu(inc)} />
                  </div>
                </div>
                <div>
                  <p className="text-base font-semibold text-neutral-900 dark:text-white truncate">{inc.casualtyName}</p>
                  <p className="text-xs text-neutral-400 font-mono">{inc.id}</p>
                </div>
                <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    {fmtDate(inc.dateTime)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{inc.activityCentre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{inc.firstAiderName}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <OutcomeBadge outcome={inc.outcome} />
                  {inc.followUpRequired && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-3 h-3" />
                      Follow-up
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full"><EmptyState /></div>
            )}
          </div>
        )}

        {/* ── LIST ──────────────────────────────────────────────── */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {paginated.length > 0 ? paginated.map(inc => (
              <div
                key={inc.id}
                onClick={() => { setSelected(inc); setPageState('detail'); }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-neutral-900 dark:text-white">{inc.casualtyName}</span>
                      <TypeBadge type={inc.incidentType} />
                      <span className="text-xs text-neutral-400 font-mono">{inc.id}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />{fmtDateTime(inc.dateTime)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />{inc.activityCentre}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-neutral-400" />{inc.firstAiderName}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <OutcomeBadge outcome={inc.outcome} />
                      {inc.followUpRequired && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Follow-up Required
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <IconButton icon={MoreVertical} borderless title="More" menuItems={getRowMenu(inc)} />
                  </div>
                </div>
              </div>
            )) : <EmptyState />}
          </div>
        )}

        {/* ── TABLE ─────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                    {['ID', 'Date', 'Casualty', 'Shakha', 'Type', 'Outcome', 'First Aider', 'Follow-up', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginated.length > 0 ? paginated.map(inc => (
                    <tr
                      key={inc.id}
                      onClick={() => { setSelected(inc); setPageState('detail'); }}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 font-mono whitespace-nowrap">{inc.id}</td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{fmtDate(inc.dateTime)}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{inc.casualtyName}</td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{inc.activityCentre}</td>
                      <td className="px-4 py-3.5"><TypeBadge type={inc.incidentType} /></td>
                      <td className="px-4 py-3.5"><OutcomeBadge outcome={inc.outcome} /></td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{inc.firstAiderName}</td>
                      <td className="px-4 py-3.5">
                        {inc.followUpRequired
                          ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"><AlertTriangle className="w-3 h-3" />Yes</span>
                          : <span className="text-xs text-neutral-400">No</span>
                        }
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <IconButton icon={MoreVertical} borderless title="More" menuItems={getRowMenu(inc)} />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <HeartPulse className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {hasFilters ? 'No incidents match your search.' : 'No incident records yet.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        )}
      </div>

      {deleteModal.open && deleteModal.incident && (
        <DeleteModal
          incident={deleteModal.incident}
          isLoading={deleteModal.loading}
          onClose={() => setDeleteModal({ open: false, incident: null, loading: false })}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
