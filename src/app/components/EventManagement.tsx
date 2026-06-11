import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Eye,
  Calendar,
  User as UserIcon,
  Users as UsersIcon,
  Clock,
  RefreshCw,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit,
  FileSpreadsheet,
  FileText,
  BarChart3,
  MapPin,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Ban,
  Play,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  CalendarDays,
  X,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  ViewModeSwitcher,
  Pagination,
  AdvancedSearchPanel,
  PrimaryButton,
  ColumnVisibilityPanel,
  SummaryWidgets,
  DateRangeFilter,
  type ColumnConfig,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import {
  FormModal,
  FormField,
  FormLabel,
  FormInput,
  FormGrid,
  FormSelect,
} from './hb/common';
import { mockEvents, Event } from '../../mockAPI/eventsData';
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, AgeGroup } from '../../mockAPI/membersData';
import EventDetail from './EventDetail';
import EventEdit from './EventEdit';
import { toast } from 'sonner';
import { useRoleScope, useModulePermissions } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';

type ViewMode = 'grid' | 'list' | 'table';
type PageState = 'list' | 'detail' | 'edit';
type ModalType = null | 'create' | 'status' | 'cancel' | 'override' | 'delete';

// ─── Cutoff helpers ───────────────────────────────────────────────────────────
const isPastStart = (event: Event) => new Date() >= new Date(event.startDate);
const canModify   = (event: Event) => !isPastStart(event);
const canDelete   = (event: Event) => !isPastStart(event) && event.status !== 'completed';

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Event['status'] }) {
  const map: Record<Event['status'], { bg: string; text: string; dot: string; label: string }> = {
    draft:     { bg: 'bg-neutral-50 dark:bg-neutral-900',         text: 'text-neutral-600 dark:text-neutral-400',   dot: 'bg-neutral-400',   label: 'Draft'     },
    published: { bg: 'bg-blue-50 dark:bg-blue-950/20',            text: 'text-blue-700 dark:text-blue-400',         dot: 'bg-blue-500',      label: 'Published' },
    active:    { bg: 'bg-success-50 dark:bg-success-950/20',      text: 'text-success-700 dark:text-success-400',   dot: 'bg-success-500',   label: 'Active'    },
    cancelled: { bg: 'bg-error-50 dark:bg-error-950/20',          text: 'text-error-700 dark:text-error-400',       dot: 'bg-error-500',     label: 'Cancelled' },
    completed: { bg: 'bg-amber-50 dark:bg-amber-950/20',          text: 'text-amber-700 dark:text-amber-400',       dot: 'bg-amber-500',     label: 'Completed' },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-transparent ${s.bg} ${s.text}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      <span className="text-xs font-medium">{s.label}</span>
    </span>
  );
}

// ─── Payment badge ────────────────────────────────────────────────────────────
function PaymentBadge({ type }: { type: Event['paymentType'] }) {
  return type === 'paid' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 text-xs font-medium border border-transparent">
      <CreditCard className="w-3 h-3" /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs font-medium border border-transparent">
      Free
    </span>
  );
}

// ─── Simple confirmation modal ─────────────────────────────────────────────────
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

function ConfirmModal({
  isOpen, title, message, confirmLabel, confirmVariant = 'primary',
  isLoading, onConfirm, onClose, children,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const btnBase = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const btnVariant =
    confirmVariant === 'danger'
      ? 'bg-error-600 hover:bg-error-700 text-white'
      : confirmVariant === 'warning'
      ? 'bg-amber-500 hover:bg-amber-600 text-white'
      : 'bg-primary-600 hover:bg-primary-700 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{message}</p>
          {children}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${btnBase} ${btnVariant}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Event Modal ────────────────────────────────────────────────────────
interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Event>) => void;
}

// ─── Audience helpers ─────────────────────────────────────────────────────────
function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer select-none transition-colors ${
      checked
        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
    }`}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
      {label}
    </label>
  );
}

function toggleArr<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'bal',     label: 'Bal(ika) (0-5)'   },
  { value: 'shishu',  label: 'Shishu (6-11)'    },
  { value: 'kishor',  label: 'Kishor(i) (12-16)' },
  { value: 'tarun',   label: 'Tarun(i) (17-30)'  },
  { value: 'yuva',    label: 'Yuva(ti) (30-60)'  },
  { value: 'jyestha', label: 'Jyestha(a) (60+)'  },
];

const AUDIENCE_AGE_LABELS: Record<AgeGroup, string> = {
  bal:     'Bal(ika) (0-5)',
  shishu:  'Shishu (6-11)',
  kishor:  'Kishor(i) (12-16)',
  tarun:   'Tarun(i) (17-30)',
  yuva:    'Yuva(ti) (30-60)',
  jyestha: 'Jyestha(a) (60+)',
};

const EMPTY_CREATE = {
  name: '',
  description: '',
  country: '',
  region: '',
  town: '',
  activityCentre: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  paymentType: '' as 'paid' | 'free' | '',
  price: '',
  capacity: '',
  coHosts: '',
  filterAgeCategories: [] as AgeGroup[],
  filterGenders:       [] as ('male' | 'female')[],
  filterJobTitles:     [] as string[],
};

type CreateForm = typeof EMPTY_CREATE;
type CreateErrors = Partial<Record<keyof CreateForm, string>>;

function CreateEventModal({ isOpen, onClose, onSave }: CreateEventModalProps) {
  const [form, setForm] = useState<CreateForm>(EMPTY_CREATE);
  const [errors, setErrors] = useState<CreateErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_CREATE);
      setErrors({});
      setTouched(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const availableRegions = form.country ? (MASTERS_CASCADE.regions[form.country] ?? []) : [];
  const availableTowns   = form.region  ? (MASTERS_CASCADE.towns[form.region]   ?? []) : [];
  const availableCentres = form.town    ? (MASTERS_CASCADE.centres[form.town]   ?? []) : [];

  const set = (field: keyof CreateForm, value: string | string[]) => {
    setForm(prev => {
      const next: CreateForm = { ...prev, [field]: value };
      if (field === 'country') { next.region = ''; next.town = ''; next.activityCentre = ''; }
      if (field === 'region')  { next.town = ''; next.activityCentre = ''; }
      if (field === 'town')    { next.activityCentre = ''; }
      return next;
    });
    if (touched) validate({ ...form, [field]: value });
  };

  const validate = (f: CreateForm): CreateErrors => {
    const errs: CreateErrors = {};
    if (!f.name.trim())         errs.name         = 'This field is required.';
    if (!f.country)             errs.country       = 'This field is required.';
    if (!f.region)              errs.region        = 'This field is required.';
    if (!f.town)                errs.town          = 'This field is required.';
    if (!f.activityCentre)      errs.activityCentre = 'This field is required.';
    if (!f.startDate)           errs.startDate     = 'This field is required.';
    if (!f.startTime)           errs.startTime     = 'This field is required.';
    if (!f.endDate)             errs.endDate       = 'This field is required.';
    if (!f.endTime)             errs.endTime       = 'This field is required.';
    if (!f.paymentType)         errs.paymentType   = 'This field is required.';
    if (f.paymentType === 'paid' && !f.price.trim()) errs.price = 'Price is required for paid events.';
    if (f.startDate && f.startTime && f.endDate && f.endTime) {
      const start = new Date(`${f.startDate}T${f.startTime}`);
      const end   = new Date(`${f.endDate}T${f.endTime}`);
      if (start >= end) errs.endDate = 'Start Date/Time must be earlier than End Date/Time.';
    }
    setErrors(errs);
    return errs;
  };

  const handleSave = async () => {
    setTouched(true);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) return;
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const now = new Date().toISOString();
      onSave({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        country: form.country,
        region: form.region,
        town: form.town,
        activityCentre: form.activityCentre,
        startDate: `${form.startDate}T${form.startTime}:00Z`,
        endDate: `${form.endDate}T${form.endTime}:00Z`,
        paymentType: form.paymentType as 'paid' | 'free',
        price: form.paymentType === 'paid' ? parseFloat(form.price) : undefined,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        coHosts: form.coHosts ? form.coHosts.split(',').map(s => s.trim()).filter(Boolean) : [],
        filterAgeCategories: form.filterAgeCategories.length > 0 ? form.filterAgeCategories : undefined,
        filterGenders:       form.filterGenders.length > 0       ? form.filterGenders       : undefined,
        filterJobTitles:     form.filterJobTitles.length > 0     ? form.filterJobTitles     : undefined,
        status: 'draft',
        createdDate: now,
        lastUpdated: now,
        chatState: 'archived',
        metrics: { going: 0, maybe: 0, notGoing: 0, participantCount: 0, mediaCount: 0 },
      });
    } catch {
      toast.error('Unable to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Create Event" maxWidth="max-w-3xl">
      <div className="overflow-y-auto slim-scroll space-y-6 max-h-[62vh]">
        {/* Event Basics */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Event Basics
          </p>
          <FormGrid cols={2}>
            <FormField className="md:col-span-2">
              <FormLabel required>Event Title</FormLabel>
              <FormInput
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Enter event title"
              />
              {errors.name && <p className="text-xs text-error-600 mt-1">{errors.name}</p>}
            </FormField>
            <FormField className="md:col-span-2">
              <FormLabel>Event Description</FormLabel>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the event — purpose, agenda, what to expect…"
                rows={3}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </FormField>
            <FormField>
              <FormLabel>Co-Hosts (comma separated)</FormLabel>
              <FormInput
                value={form.coHosts}
                onChange={e => set('coHosts', e.target.value)}
                placeholder="e.g. John Smith, Emma Davis"
              />
            </FormField>
            <FormField>
              <FormLabel>Capacity</FormLabel>
              <FormInput
                type="number"
                value={form.capacity}
                onChange={e => set('capacity', e.target.value)}
                placeholder="Max participants"
                min="1"
              />
            </FormField>
          </FormGrid>
        </div>

        {/* Location */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Location
          </p>
          <FormGrid cols={2}>
            <FormField>
              <FormLabel required>Country</FormLabel>
              <FormSelect
                value={form.country}
                onChange={e => set('country', e.target.value)}
              >
                <option value="">Select Country</option>
                {MASTERS_CASCADE.countries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </FormSelect>
              {errors.country && <p className="text-xs text-error-600 mt-1">{errors.country}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Region</FormLabel>
              <FormSelect
                value={form.region}
                onChange={e => set('region', e.target.value)}
                disabled={!form.country}
              >
                <option value="">Select Region</option>
                {availableRegions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </FormSelect>
              {errors.region && <p className="text-xs text-error-600 mt-1">{errors.region}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Town</FormLabel>
              <FormSelect
                value={form.town}
                onChange={e => set('town', e.target.value)}
                disabled={!form.region}
              >
                <option value="">Select Town</option>
                {availableTowns.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </FormSelect>
              {errors.town && <p className="text-xs text-error-600 mt-1">{errors.town}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Activity Centre</FormLabel>
              <FormSelect
                value={form.activityCentre}
                onChange={e => set('activityCentre', e.target.value)}
                disabled={!form.town}
              >
                <option value="">Select Activity Centre</option>
                {availableCentres.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </FormSelect>
              {errors.activityCentre && <p className="text-xs text-error-600 mt-1">{errors.activityCentre}</p>}
            </FormField>
          </FormGrid>
        </div>

        {/* Schedule */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Schedule
          </p>
          <FormGrid cols={2}>
            <FormField>
              <FormLabel required>Start Date</FormLabel>
              <FormInput
                type="date"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
              />
              {errors.startDate && <p className="text-xs text-error-600 mt-1">{errors.startDate}</p>}
            </FormField>
            <FormField>
              <FormLabel required>Start Time</FormLabel>
              <FormInput
                type="time"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
              />
              {errors.startTime && <p className="text-xs text-error-600 mt-1">{errors.startTime}</p>}
            </FormField>
            <FormField>
              <FormLabel required>End Date</FormLabel>
              <FormInput
                type="date"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
              />
              {errors.endDate && <p className="text-xs text-error-600 mt-1">{errors.endDate}</p>}
            </FormField>
            <FormField>
              <FormLabel required>End Time</FormLabel>
              <FormInput
                type="time"
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
              />
              {errors.endTime && <p className="text-xs text-error-600 mt-1">{errors.endTime}</p>}
            </FormField>
          </FormGrid>
        </div>

        {/* Payment */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5" /> Payment Type
          </p>
          <FormGrid cols={2}>
            <FormField>
              <FormLabel required>Payment Type</FormLabel>
              <FormSelect
                value={form.paymentType}
                onChange={e => set('paymentType', e.target.value)}
              >
                <option value="">Select Payment Type</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </FormSelect>
              {errors.paymentType && <p className="text-xs text-error-600 mt-1">{errors.paymentType}</p>}
            </FormField>
            {form.paymentType === 'paid' && (
              <FormField>
                <FormLabel required>Price (£)</FormLabel>
                <FormInput
                  type="number"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-xs text-error-600 mt-1">{errors.price}</p>}
              </FormField>
            )}
          </FormGrid>
        </div>

        {/* Target Audience */}
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <UsersIcon className="w-3.5 h-3.5" /> Target Audience
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Optional — leave all unchecked to target all members.
            </p>

            {/* Age Category */}
            <div>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Age Category</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUP_OPTIONS.map(({ value, label }) => (
                  <CheckChip
                    key={value}
                    label={label}
                    checked={form.filterAgeCategories.includes(value)}
                    onChange={() => set('filterAgeCategories', toggleArr(form.filterAgeCategories, value) as any)}
                  />
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Gender</p>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: 'male',   label: 'Male'   },
                  { value: 'female', label: 'Female' },
                ] as { value: 'male' | 'female'; label: string }[]).map(({ value, label }) => (
                  <CheckChip
                    key={value}
                    label={label}
                    checked={form.filterGenders.includes(value)}
                    onChange={() => set('filterGenders', toggleArr(form.filterGenders, value) as any)}
                  />
                ))}
              </div>
            </div>

            {/* Role Type / Job Title */}
            <div>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Role Type / Job Title</p>
              <div className="flex flex-wrap gap-2">
                {ROLE_TYPE_OPTIONS.map(role => (
                  <CheckChip
                    key={role}
                    label={role}
                    checked={form.filterJobTitles.includes(role)}
                    onChange={() => set('filterJobTitles', toggleArr(form.filterJobTitles, role) as any)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-60"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save
        </button>
      </div>
    </FormModal>
  );
}

// ─── FILTER OPTIONS ───────────────────────────────────────────────────────────
const EVENT_FILTER_BASE = {
  'Status': ['Draft', 'Published', 'Active', 'Cancelled', 'Completed'],
  'Payment Type': ['Paid', 'Free'],
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EventManagement({ onNavigateToMember }: { onNavigateToMember?: (memberId: string) => void } = {}) {
  // ── Role scope & permissions ─────────────────────────────────
  const { scope, selectedRole } = useRoleScope();
  const ep = useModulePermissions('events');
  const scopedFilterOptions = getScopedFilterOptions(scope);
  const isMemberRole = selectedRole === 'Member (18+)' || selectedRole.startsWith('Teen (13');
  const scopedEvents = useMemo(
    () => isMemberRole ? mockEvents : filterByScope(mockEvents, scope),
    [isMemberRole, scope],
  );

  const [viewMode, setViewMode]       = useState<ViewMode>(
    isMemberRole ? 'list' : 'grid'
  );
  const [events, setEvents]           = useState<Event[]>(mockEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters]         = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [eventDateStart, setEventDateStart] = useState('');
  const [eventDateEnd, setEventDateEnd] = useState('');
  const [eventDateLabel, setEventDateLabel] = useState('');
  const [showEventDateFilter, setShowEventDateFilter] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [pageState, setPageState]         = useState<PageState>('list');
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary]     = useState(true);

  // Modal state
  const [modal, setModal] = useState<{
    type: ModalType;
    event?: Event;
    isLoading: boolean;
  }>({ type: null, isLoading: false });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Column visibility
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const eventColumns: ColumnConfig[] = [
    { key: 'id',           label: 'Event ID'           },
    { key: 'name',         label: 'Event Title'        },
    { key: 'location',     label: 'Location'           },
    { key: 'startDate',    label: 'Start Date/Time'    },
    { key: 'endDate',      label: 'End Date/Time'      },
    { key: 'paymentType',  label: 'Payment Type'       },
    { key: 'status',       label: 'Status'             },
    { key: 'participants', label: 'Participants'       },
    { key: 'lastUpdated',  label: 'Last Updated'       },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true, name: true, location: true, startDate: true,
    endDate: true, paymentType: true, status: true,
    participants: true, lastUpdated: false,
  });
  const toggleColumn = (key: string) =>
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));

  // Sort
  const [sortField, setSortField]         = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(p => p === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };
  const renderSortArrow = (field: string) =>
    sortField !== field
      ? <ArrowUpDown className="w-3 h-3 text-neutral-400 ml-1 inline-block opacity-40" />
      : sortDirection === 'asc'
        ? <ArrowUp className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />
        : <ArrowDown className="w-3 h-3 text-primary-600 dark:text-primary-400 ml-1 inline-block" />;

  const toggleSelection = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // Filtering
  const filteredEvents = useMemo(() => {
    return scopedEvents.filter(event => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        event.name.toLowerCase().includes(q) ||
        event.host.toLowerCase().includes(q) ||
        event.id.toLowerCase().includes(q) ||
        event.town.toLowerCase().includes(q) ||
        event.region.toLowerCase().includes(q) ||
        event.country.toLowerCase().includes(q);

      const matchesFilters = filters.every(f => {
        if (!f.values.length) return true;
        switch (f.field) {
          case 'Status':
            return f.values.some(v => v.toLowerCase() === event.status);
          case 'Payment Type':
            return f.values.some(v => v.toLowerCase() === event.paymentType);
          case 'Country':
            return f.values.includes(event.country);
          case 'Vibhaag':
            return f.values.includes(event.region);
          case 'Nagar':
            return f.values.includes(event.town);
          case 'Shakha':
            return f.values.includes(event.activityCentre);
          default:
            return true;
        }
      });

      const eventDate = event.startDate.split('T')[0];
      const matchesEventDates =
        (!eventDateStart || eventDate >= eventDateStart) &&
        (!eventDateEnd || eventDate <= eventDateEnd);

      return matchesSearch && matchesFilters && matchesEventDates;
    });
  }, [scopedEvents, searchQuery, filters, eventDateStart, eventDateEnd]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      let aVal = (a as any)[sortField] ?? '';
      let bVal = (b as any)[sortField] ?? '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEvents, sortField, sortDirection]);

  const totalPages    = itemsPerPage === 0 ? 1 : Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    if (itemsPerPage === 0) return sortedEvents;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedEvents.slice(start, start + itemsPerPage);
  }, [sortedEvents, currentPage, itemsPerPage]);

  useEffect(() => { if (viewMode !== 'table') setShowColumnPanel(false); }, [viewMode]);

  // ── Date formatting ────────────────────────────────────────────────────────
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Navigation ─────────────────────────────────────────────────────────────
  const openDetail = (event: Event) => { setSelectedEvent(event); setPageState('detail'); };
  const openEdit   = (event: Event) => { setSelectedEvent(event); setPageState('edit');   };
  const backToList = ()              => { setPageState('list'); setSelectedEvent(null);   };

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openModal = (type: Exclude<ModalType, null | 'create'>, event: Event) =>
    setModal({ type, event, isLoading: false });
  const closeModal = () => setModal({ type: null, isLoading: false });

  const confirmAction = async () => {
    if (!modal.event) return;
    setModal(p => ({ ...p, isLoading: true }));
    await new Promise(r => setTimeout(r, 800));

    const ev = modal.event;
    switch (modal.type) {
      case 'status': {
        const newStatus: Event['status'] =
          ev.status === 'active' ? 'draft' : 'active';
        setEvents(prev =>
          prev.map(e => e.id === ev.id
            ? { ...e, status: newStatus, lastUpdated: new Date().toISOString() }
            : e
          )
        );
        // Update selectedEvent if on detail page
        if (selectedEvent?.id === ev.id) {
          setSelectedEvent(e => e ? { ...e, status: newStatus } : e);
        }
        toast.success(
          newStatus === 'active' ? 'Event activated successfully.' : 'Event deactivated successfully.'
        );
        break;
      }
      case 'cancel': {
        setEvents(prev =>
          prev.map(e => e.id === ev.id
            ? { ...e, status: 'cancelled', cancelledDate: new Date().toISOString(), lastUpdated: new Date().toISOString() }
            : e
          )
        );
        if (selectedEvent?.id === ev.id) {
          setSelectedEvent(e => e ? { ...e, status: 'cancelled' } : e);
        }
        toast.success('Event cancelled successfully.');
        break;
      }
      case 'override': {
        toast.success('Registration approval updated successfully.');
        break;
      }
      case 'delete': {
        if (!canDelete(ev)) {
          toast.error(
            ev.status === 'completed'
              ? 'Completed events cannot be deleted.'
              : 'This event can no longer be deleted after it starts.'
          );
          break;
        }
        setEvents(prev => prev.filter(e => e.id !== ev.id));
        if (pageState === 'detail') backToList();
        toast.success('Event deleted successfully.');
        break;
      }
    }
    closeModal();
  };

  const handleCreateSave = (data: Partial<Event>) => {
    const newId = `EVT-${Date.now().toString().slice(-6)}`;
    const newEvent: Event = {
      id: newId,
      name: data.name ?? 'New Event',
      host: 'Sarah Johnson',
      coHosts: data.coHosts ?? [],
      status: 'draft',
      country: data.country ?? '',
      region: data.region ?? '',
      town: data.town ?? '',
      activityCentre: data.activityCentre ?? '',
      startDate: data.startDate ?? new Date().toISOString(),
      endDate: data.endDate ?? new Date().toISOString(),
      createdDate: data.createdDate ?? new Date().toISOString(),
      lastUpdated: data.lastUpdated ?? new Date().toISOString(),
      paymentType: data.paymentType ?? 'free',
      price: data.price,
      capacity: data.capacity,
      metrics: data.metrics ?? { going: 0, maybe: 0, notGoing: 0, participantCount: 0, mediaCount: 0 },
      chatState: 'archived',
    };
    setEvents(prev => [newEvent, ...prev]);
    setShowCreateModal(false);
    toast.success('Event created successfully.');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const data = selectedIds.size > 0
      ? sortedEvents.filter(ev => selectedIds.has(ev.id))
      : sortedEvents;
    if (!data.length) { toast.error('No data to export.'); return; }
    toast.success(`Exporting ${data.length} events as ${format === 'excel' ? 'Excel' : 'PDF'}...`);
  };

  // ── Determine row actions ──────────────────────────────────────────────────
  const getRowActions = (event: Event) => {
    const past = isPastStart(event);
    const isCancelledOrCompleted = event.status === 'cancelled' || event.status === 'completed';
    return {
      canModify:   ep.canEdit && !past,
      modifyTip:   past ? 'Event cannot be edited after it starts.' : 'Modify Event',
      canActivate: ep.canEdit && !isCancelledOrCompleted,
      canCancel:   ep.canCancel && !isCancelledOrCompleted,
      canDelete:   ep.canDelete && canDelete(event),
      deleteTip:   !canDelete(event)
        ? (event.status === 'completed' ? 'Completed events cannot be deleted.' : 'Event cannot be deleted after it starts.')
        : 'Delete Event',
    };
  };

  // ─── Sub-pages ─────────────────────────────────────────────────────────────
  if (pageState === 'detail' && selectedEvent) {
    // Find live version
    const live = events.find(e => e.id === selectedEvent.id) ?? selectedEvent;
    return (
      <>
        <EventDetail
          event={live}
          onBack={backToList}
          onModify={() => openEdit(live)}
          onCancel={() => openModal('cancel', live)}
          onDelete={() => openModal('delete', live)}
          onViewMember={onNavigateToMember}
        />
        {/* Modals can still show above detail */}
        <ConfirmModal
          isOpen={modal.type === 'status' && !!modal.event}
          title="Confirm Status Change"
          message={`Are you sure you want to ${modal.event?.status === 'active' ? 'deactivate' : 'activate'} this event?`}
          confirmLabel={modal.event?.status === 'active' ? 'Deactivate' : 'Activate'}
          confirmVariant="primary"
          isLoading={modal.isLoading}
          onConfirm={confirmAction}
          onClose={closeModal}
        />
        <ConfirmModal
          isOpen={modal.type === 'cancel' && !!modal.event}
          title="Confirm Cancellation"
          message="Are you sure you want to cancel this event? This action cannot be undone."
          confirmLabel="Confirm Cancellation"
          confirmVariant="warning"
          isLoading={modal.isLoading}
          onConfirm={confirmAction}
          onClose={closeModal}
        />
        <ConfirmModal
          isOpen={modal.type === 'override' && !!modal.event}
          title="Confirm Override"
          message="Are you sure you want to override this registration decision?"
          confirmLabel="Confirm Override"
          confirmVariant="warning"
          isLoading={modal.isLoading}
          onConfirm={confirmAction}
          onClose={closeModal}
        />
        <ConfirmModal
          isOpen={modal.type === 'delete' && !!modal.event}
          title="Confirm Deletion"
          message="Are you sure you want to delete this event? This action is permanent and cannot be undone."
          confirmLabel="Confirm Deletion"
          confirmVariant="danger"
          isLoading={modal.isLoading}
          onConfirm={confirmAction}
          onClose={closeModal}
        />
      </>
    );
  }

  if (pageState === 'edit' && selectedEvent) {
    const live = events.find(e => e.id === selectedEvent.id) ?? selectedEvent;
    return (
      <EventEdit
        event={live}
        onBack={() => setPageState('detail')}
        onSave={(updated) => {
          setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
          setSelectedEvent(updated);
          setPageState('detail');
          toast.success('Event updated successfully.');
        }}
      />
    );
  }

  // ─── Listing ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">

        {/* PAGE HEADER */}
        <PageHeader
          title="Karyakrams"
          subtitle="View and govern events across all Masters scopes."
          breadcrumbs={[
            { label: 'Karyakrams', href: '#' },
            { label: 'Karyakrams', current: true },
          ]}
        >
          {!isMemberRole && (
            <div className="relative" ref={columnAnchorRef}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onAdvancedSearch={() => setShowAdvancedSearch(true)}
                onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
                activeFilterCount={filters.filter(f => f.values.length > 0).length}
                placeholder="Search events..."
              />
              <AdvancedSearchPanel
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={{
                  ...EVENT_FILTER_BASE,
                  ...(scope.showCountryFilter  ? { 'Country':         MASTERS_CASCADE.countries } : {}),
                  ...(scope.showRegionFilter   ? { 'Vibhaag':         scopedFilterOptions.regionOptions } : {}),
                  ...(scope.showTownFilter     ? { 'Nagar':           scopedFilterOptions.townOptions }   : {}),
                  ...(scope.showCentreFilter   ? { 'Shakha':          scopedFilterOptions.centreOptions } : {}),
                }}
              />
              <ColumnVisibilityPanel
                isOpen={showColumnPanel}
                onClose={() => setShowColumnPanel(false)}
                columns={eventColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
                anchorRef={columnAnchorRef}
              />
            </div>
          )}

          <div className="relative" ref={dateFilterRef}>
            <button
              onClick={() => setShowEventDateFilter(p => !p)}
              title="Filter by Event Dates"
              className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                eventDateStart
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {eventDateStart ? (eventDateLabel || `${eventDateStart} - ${eventDateEnd}`) : 'Event dates'}
              {eventDateStart && (
                <span
                  role="button"
                  onClick={e => {
                    e.stopPropagation();
                    setEventDateStart('');
                    setEventDateEnd('');
                    setEventDateLabel('');
                  }}
                  className="ml-0.5 text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
            <DateRangeFilter
              isOpen={showEventDateFilter}
              onClose={() => setShowEventDateFilter(false)}
              startDate={eventDateStart}
              endDate={eventDateEnd}
              onApply={(start, end, label) => {
                setEventDateStart(start);
                setEventDateEnd(end);
                setEventDateLabel(label || '');
                setCurrentPage(1);
              }}
              title="Event Date Range"
            />
          </div>

          {ep.canAdd && (
            <PrimaryButton icon={Plus} onClick={() => setShowCreateModal(true)}>
              Create Event
            </PrimaryButton>
          )}
          {!isMemberRole && (
            <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
          )}
          {!isMemberRole && (
            <IconButton icon={RefreshCw} onClick={() => toast.info('Refreshed.')} title="Refresh" />
          )}
          {ep.canExport && (
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: FileSpreadsheet, label: 'Export as Excel', onClick: () => handleExport('excel') },
                { icon: FileText,        label: 'Export as PDF',   onClick: () => handleExport('pdf')   },
              ]}
            />
          )}
          {!isMemberRole && (
            <ViewModeSwitcher currentMode={viewMode} onChange={setViewMode} />
          )}
        </PageHeader>

        {/* SUMMARY WIDGETS */}
        {!isMemberRole && showSummary && (
          <SummaryWidgets
            title="Event Summary"
            widgets={[
              { label: 'Total Events',     value: events.length,                                       icon: 'Activity'   },
              { label: 'Active',           value: scopedEvents.filter(e => e.status === 'active').length,    icon: 'CheckCircle'},
              { label: 'Draft/Published',  value: scopedEvents.filter(e => e.status === 'draft' || e.status === 'published').length, icon: 'Clock' },
              { label: 'Completed',        value: scopedEvents.filter(e => e.status === 'completed').length, icon: 'XCircle'   },
            ]}
          />
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {paginatedEvents.length > 0 ? paginatedEvents.map(event => {
              const actions = getRowActions(event);
              return (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer relative group shadow-sm ${
                    selectedIds.has(event.id)
                      ? 'border-primary-300 dark:border-primary-600'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                  onClick={() => openDetail(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(event.id)}
                          onChange={() => toggleSelection(event.id)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                        />
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-neutral-900 dark:text-white font-semibold truncate">{event.name}</span>
                          <StatusBadge status={event.status} />
                          <PaymentBadge type={event.paymentType} />
                          <span className="text-xs text-neutral-500 font-mono ml-auto md:ml-0">{event.id}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="truncate">{event.host}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{event.town} · {event.region}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{formatDate(event.startDate)}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <UsersIcon className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{event.metrics.participantCount} participants</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4" onClick={e => e.stopPropagation()}>
                      <IconButton
                        icon={MoreVertical}
                        borderless={true}
                        title="Actions"
                        menuItems={[
                          { icon: Eye,        label: 'View Details',                     onClick: () => openDetail(event)                                                   },
                          { icon: Edit,       label: actions.canModify ? 'Modify' : 'Modify (Blocked)', onClick: actions.canModify ? () => openEdit(event) : () => toast.warning('Event cannot be edited after it starts.') },
                          { icon: event.status === 'active' ? Ban : Play, label: event.status === 'active' ? 'Deactivate' : 'Activate', onClick: actions.canActivate ? () => openModal('status', event) : () => toast.warning('Cannot change status of a cancelled or completed event.') },
                          { icon: XCircle,    label: 'Cancel Event',                     onClick: actions.canCancel ? () => openModal('cancel', event) : () => toast.warning('Event is already cancelled or completed.')    },
                          { icon: ShieldAlert,label: 'Override Approval',                onClick: () => openModal('override', event)                                        },
                          { icon: Trash2,     label: actions.canDelete ? 'Delete' : 'Delete (Blocked)', onClick: actions.canDelete ? () => openModal('delete', event) : () => toast.error(actions.deleteTip) },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No records found.</h3>
              </div>
            )}
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedEvents.length > 0 ? paginatedEvents.map(event => {
              const actions = getRowActions(event);
              return (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group shadow-sm flex flex-col ${
                    selectedIds.has(event.id)
                      ? 'border-primary-300 dark:border-primary-600 bg-primary-50/20 dark:bg-primary-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800'
                  }`}
                  onClick={() => openDetail(event)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(event.id)}
                        onChange={() => toggleSelection(event.id)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                      />
                      <IconButton
                        icon={MoreVertical}
                        borderless={true}
                        title="Actions"
                        menuItems={[
                          { icon: Eye,         label: 'View Details',                     onClick: () => openDetail(event)                                                   },
                          { icon: Edit,        label: actions.canModify ? 'Modify' : 'Modify (Blocked)', onClick: actions.canModify ? () => openEdit(event) : () => toast.warning('Event cannot be edited after it starts.') },
                          { icon: event.status === 'active' ? Ban : Play, label: event.status === 'active' ? 'Deactivate' : 'Activate', onClick: actions.canActivate ? () => openModal('status', event) : () => toast.warning('Cannot change status of a cancelled or completed event.') },
                          { icon: XCircle,     label: 'Cancel Event',                     onClick: actions.canCancel ? () => openModal('cancel', event) : () => toast.warning('Event is already cancelled or completed.')    },
                          { icon: ShieldAlert, label: 'Override Approval',                onClick: () => openModal('override', event)                                        },
                          { icon: Trash2,      label: actions.canDelete ? 'Delete' : 'Delete (Blocked)', onClick: actions.canDelete ? () => openModal('delete', event) : () => toast.error(actions.deleteTip) },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <StatusBadge status={event.status} />
                      <PaymentBadge type={event.paymentType} />
                    </div>
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-white truncate mb-0.5 mt-2">
                      {event.name}
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono mb-3">{event.id}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <UserIcon className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{event.host}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span className="truncate">{event.town} · {event.region}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center mt-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <UsersIcon className="w-3.5 h-3.5" />
                      <span>{event.metrics.participantCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <CheckCircle2 className="w-3 h-3 text-success-500" />{event.metrics.going}
                      <HelpCircle   className="w-3 h-3 text-primary-500" />{event.metrics.maybe}
                      <XCircle      className="w-3 h-3 text-neutral-400" />{event.metrics.notGoing}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No records found.</h3>
              </div>
            )}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-auto slim-scroll max-h-[calc(100vh-320px)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3.5 w-12 border-b border-neutral-200 dark:border-neutral-800">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedEvents.length && paginatedEvents.length > 0}
                        onChange={e => e.target.checked
                          ? setSelectedIds(new Set(paginatedEvents.map(ev => ev.id)))
                          : setSelectedIds(new Set())
                        }
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                      />
                    </th>
                    {visibleColumns.id && (
                      <th onClick={() => handleSort('id')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Event ID {renderSortArrow('id')}
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th onClick={() => handleSort('name')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Event Title {renderSortArrow('name')}
                      </th>
                    )}
                    {visibleColumns.location && (
                      <th onClick={() => handleSort('town')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Location {renderSortArrow('town')}
                      </th>
                    )}
                    {visibleColumns.startDate && (
                      <th onClick={() => handleSort('startDate')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Start Date/Time {renderSortArrow('startDate')}
                      </th>
                    )}
                    {visibleColumns.endDate && (
                      <th onClick={() => handleSort('endDate')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        End Date/Time {renderSortArrow('endDate')}
                      </th>
                    )}
                    {visibleColumns.paymentType && (
                      <th onClick={() => handleSort('paymentType')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Payment {renderSortArrow('paymentType')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th onClick={() => handleSort('status')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Status {renderSortArrow('status')}
                      </th>
                    )}
                    {visibleColumns.participants && (
                      <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Participants
                      </th>
                    )}
                    {visibleColumns.lastUpdated && (
                      <th onClick={() => handleSort('lastUpdated')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Last Updated {renderSortArrow('lastUpdated')}
                      </th>
                    )}
                    <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-6 py-3.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 text-right border-b border-neutral-200 dark:border-neutral-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedEvents.length > 0 ? paginatedEvents.map(event => {
                    const actions = getRowActions(event);
                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                        onClick={() => openDetail(event)}
                      >
                        <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelection(event.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                          />
                        </td>
                        {visibleColumns.id && (
                          <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400 underline decoration-primary-600/30 underline-offset-4 whitespace-nowrap">
                            {event.id}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors max-w-[200px]">
                            <span className="truncate block">{event.name}</span>
                          </td>
                        )}
                        {visibleColumns.location && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            <span className="block">{event.town}</span>
                            <span className="text-xs text-neutral-400">{event.region}</span>
                          </td>
                        )}
                        {visibleColumns.startDate && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            {formatDateTime(event.startDate)}
                          </td>
                        )}
                        {visibleColumns.endDate && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            {formatDateTime(event.endDate)}
                          </td>
                        )}
                        {visibleColumns.paymentType && (
                          <td className="px-6 py-4">
                            <PaymentBadge type={event.paymentType} />
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-4">
                            <StatusBadge status={event.status} />
                          </td>
                        )}
                        {visibleColumns.participants && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-xs text-neutral-500 whitespace-nowrap">
                              <span className="flex items-center gap-0.5 text-success-600"><CheckCircle2 className="w-3 h-3" />{event.metrics.going}</span>
                              <span className="flex items-center gap-0.5 text-primary-600"><HelpCircle   className="w-3 h-3" />{event.metrics.maybe}</span>
                              <span className="flex items-center gap-0.5 text-neutral-400"><XCircle      className="w-3 h-3" />{event.metrics.notGoing}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.lastUpdated && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            {formatDate(event.lastUpdated)}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <IconButton icon={Eye}   borderless onClick={() => openDetail(event)} title="View Details" />
                            <IconButton
                              icon={Edit}
                              borderless
                              onClick={() => actions.canModify ? openEdit(event) : toast.warning('Event cannot be edited after it starts.')}
                              title={actions.modifyTip}
                            />
                            <IconButton
                              icon={Trash2}
                              borderless
                              onClick={() => actions.canDelete ? openModal('delete', event) : toast.error(actions.deleteTip)}
                              title={actions.deleteTip}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="px-6 py-20 text-center">
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No records found.</h3>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6">
          {filteredEvents.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredEvents.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          )}
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateSave}
      />

      {/* CONFIRMATION MODALS (listing context) */}
      <ConfirmModal
        isOpen={modal.type === 'status' && pageState === 'list' && !!modal.event}
        title="Confirm Status Change"
        message={`Are you sure you want to ${modal.event?.status === 'active' ? 'deactivate' : 'activate'} this event?`}
        confirmLabel={modal.event?.status === 'active' ? 'Deactivate' : 'Activate'}
        confirmVariant="primary"
        isLoading={modal.isLoading}
        onConfirm={confirmAction}
        onClose={closeModal}
      />
      <ConfirmModal
        isOpen={modal.type === 'cancel' && pageState === 'list' && !!modal.event}
        title="Confirm Cancellation"
        message="Are you sure you want to cancel this event? This action cannot be undone."
        confirmLabel="Confirm Cancellation"
        confirmVariant="warning"
        isLoading={modal.isLoading}
        onConfirm={confirmAction}
        onClose={closeModal}
      />
      <ConfirmModal
        isOpen={modal.type === 'override' && pageState === 'list' && !!modal.event}
        title="Confirm Override"
        message="Are you sure you want to override this registration decision?"
        confirmLabel="Confirm Override"
        confirmVariant="warning"
        isLoading={modal.isLoading}
        onConfirm={confirmAction}
        onClose={closeModal}
      />
      <ConfirmModal
        isOpen={modal.type === 'delete' && pageState === 'list' && !!modal.event}
        title="Confirm Deletion"
        message="Are you sure you want to delete this event? This action is permanent and cannot be undone."
        confirmLabel="Confirm Deletion"
        confirmVariant="danger"
        isLoading={modal.isLoading}
        onConfirm={confirmAction}
        onClose={closeModal}
      />
    </div>
  );
}
