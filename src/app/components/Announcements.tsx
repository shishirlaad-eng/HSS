// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Announcements Module
// ─────────────────────────────────────────────────────────────
// Features: Create · Read · Delete
// Content types: Text | Image | Video | Cooldown delay
// Audience: National / Region / Town / Centre + demographic filters
// Notifications: Push (Instant / Scheduled) | Email (Instant / Scheduled)
// Bell icon: In-app notification receipt
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  ArrowLeft,
  Send,
  Globe2,
  MapPin,
  Building2,
  Map,
  Users,
  FileText,
  Image,
  Video,
  Bell,
  BellOff,
  Mail,
  MailX,
  Clock,
  CalendarClock,
  AlertCircle,
  BookmarkCheck,
  X,
  ChevronDown,
  Info,
  Loader2,
  Pencil,
  Upload,
  CalendarDays,
  Search,
} from 'lucide-react';
import { PageHeader, PrimaryButton, Pagination, SearchBar, SecondaryButton, DateRangeFilter } from './hb/listing';
import {
  StatCard,
  FormModal,
  FormLabel,
  FormGrid,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormSection,
  RichTextEditor,
} from './hb/common';
import { toast } from 'sonner';
import { useModulePermissions, useRoleScope } from '../contexts/RoleScopeContext';
import {
  mockAnnouncements as initialAnnouncements,
  Announcement,
  AnnouncementStatus,
  AnnouncementScope,
  AnnouncementContent,
} from '../../mockAPI/announcementsData';
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS, mockMembers, RESPONSIBILITY_LEVEL_OPTIONS, RESPONSIBILITY_TYPE_OPTIONS } from '../../mockAPI/membersData';
import { formatDate as sharedFormatDate, formatDateTime as sharedFormatDateTime, formatDateRange } from '../../utils/formatDate';

// ── Constants ─────────────────────────────────────────────────


const JOB_TITLE_OPTIONS = [...ROLE_TYPE_OPTIONS];

// ── Style configs ─────────────────────────────────────────────

const STATUS_CFG: Record<AnnouncementStatus, { bg: string; text: string; dot: string; label: string }> = {
  sent:      { bg: 'bg-success-50 dark:bg-success-950/20',  text: 'text-success-700 dark:text-success-400',  dot: 'bg-success-500',  label: 'Sent'      },
  scheduled: { bg: 'bg-blue-50 dark:bg-blue-950/20',         text: 'text-blue-700 dark:text-blue-400',         dot: 'bg-blue-500',     label: 'Scheduled' },
  draft:     { bg: 'bg-neutral-100 dark:bg-neutral-800',     text: 'text-neutral-600 dark:text-neutral-400',   dot: 'bg-neutral-400',  label: 'Draft'     },
};

const PRIORITY_CFG = {
  high:   { icon: AlertCircle,   color: 'text-red-500 dark:text-red-400',             bar: 'bg-red-500',     bg: 'bg-red-50 dark:bg-red-950/20',     text: 'text-red-700 dark:text-red-400',             label: 'High'   },
  medium: { icon: AlertCircle,   color: 'text-amber-500 dark:text-amber-400',          bar: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/20',   text: 'text-amber-700 dark:text-amber-400',           label: 'Medium' },
  low:    { icon: Info,          color: 'text-neutral-400 dark:text-neutral-500',      bar: 'bg-neutral-300 dark:bg-neutral-700', bg: 'bg-neutral-50 dark:bg-neutral-800',  text: 'text-neutral-500 dark:text-neutral-400',   label: 'Low'    },
};

const CONTENT_CFG: Record<AnnouncementContent, { icon: typeof FileText; label: string; color: string }> = {
  text:  { icon: FileText, label: 'Text',  color: 'text-primary-600 dark:text-primary-400'  },
  image: { icon: Image,    label: 'Image', color: 'text-violet-600 dark:text-violet-400'    },
  video: { icon: Video,    label: 'Video', color: 'text-rose-600 dark:text-rose-400'        },
};

const SCOPE_CFG: Record<AnnouncementScope, { icon: typeof Globe2; label: string; color: string }> = {
  national: { icon: Globe2,     label: 'National',        color: 'text-primary-600 dark:text-primary-400' },
  region:   { icon: Map,        label: 'Vibhag',         color: 'text-violet-600 dark:text-violet-400'   },
  town:     { icon: MapPin,     label: 'Nagar',           color: 'text-emerald-600 dark:text-emerald-400' },
  centre:   { icon: Building2,  label: 'Shakha',          color: 'text-amber-600 dark:text-amber-400'     },
};

// ── Helpers ───────────────────────────────────────────────────

const COOLDOWN_MS = 5 * 60 * 1000; // 5-minute cooldown window

/** Announcement may only be deleted when Draft, Scheduled, OR within the 5-min cooldown after being sent. */
function canDeleteAnnouncement(ann: Announcement): boolean {
  if (ann.status === 'draft')     return true;
  if (ann.status === 'scheduled') return true;
  if (ann.status === 'sent' && ann.sentAt) {
    const elapsed = Date.now() - new Date(ann.sentAt).getTime();
    return elapsed <= COOLDOWN_MS;
  }
  return false;
}

/** Only Draft and Scheduled announcements can be edited. */
function canEditAnnouncement(ann: Announcement): boolean {
  return ann.status === 'draft' || ann.status === 'scheduled';
}

const btnBase    = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors';
const btnPrimary = `${btnBase} bg-primary-600 hover:bg-primary-700 text-white`;
const btnGhost   = `${btnBase} border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800`;
const btnDanger  = `${btnBase} border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 bg-white dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-red-950/20`;

function formatDate(iso: string) {
  return sharedFormatDate(iso);
}

function formatDateTime(iso: string) {
  return sharedFormatDateTime(iso);
}

function scopeLabel(ann: Announcement) {
  if (ann.scope === 'national') return 'National';
  if (ann.scope === 'region')   return ann.targetRegion ?? 'Vibhag';
  if (ann.scope === 'town')     return ann.targetTown ?? 'Nagar';
  return ann.targetCentre ?? 'Shakha';
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Confirm Modal (matches EventManagement pattern exactly) ──

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmModal({
  isOpen, title, message, confirmLabel, isLoading, onConfirm, onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white">{title}</h3>
        </div>
        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{message}</p>
        </div>
        {/* Footer */}
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-error-600 hover:bg-error-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create form blank state ───────────────────────────────────

interface CreateForm {
  title: string;
  body: string;
  contentType: AnnouncementContent;
  mediaUrl: string;
  cooldownHours: number;
  priority: 'high' | 'medium' | 'low';
  targetRegions: string[];   // empty = All
  targetTowns: string[];     // empty = All
  targetCentres: string[];   // empty = All
  targetSpecificOnly: boolean;
  targetMemberIds: string[];
  filterAgeCategories: ('child' | 'teen' | 'adult')[];
  filterGenders: ('male' | 'female')[];
  filterResponsibilityLevels: string[];
  filterJobTitles: string[];
  filterResponsibilityTypes: string[];
  pushEnabled: boolean;
  pushSchedule: 'instant' | 'scheduled';
  pushScheduledAt: string;
  emailEnabled: boolean;
  emailSchedule: 'instant' | 'scheduled';
  emailScheduledAt: string;
}

const blankForm = (): CreateForm => ({
  title: '',
  body: '',
  contentType: 'text',
  mediaUrl: '',
  cooldownHours: 5 / 60,   // fixed at 5 minutes
  priority: 'high',
  targetRegions: [],
  targetTowns: [],
  targetCentres: [],
  targetSpecificOnly: false,
  targetMemberIds: [],
  filterAgeCategories: [],
  filterGenders: [],
  filterResponsibilityLevels: [],
  filterJobTitles: [],
  filterResponsibilityTypes: [],
  pushEnabled: true,
  pushSchedule: 'instant',
  pushScheduledAt: '',
  emailEnabled: true,
  emailSchedule: 'instant',
  emailScheduledAt: '',
});

// ── Sub-components ────────────────────────────────────────────

function NotifBadge({ label, enabled, scheduled }: { label: string; enabled: boolean; scheduled?: boolean }) {
  if (!enabled) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600">
        {label === 'Push' ? <BellOff className="w-3 h-3" /> : <MailX className="w-3 h-3" />}
        {label} off
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
      scheduled
        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
        : 'bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border-success-200 dark:border-success-800'
    }`}>
      {label === 'Push' ? <Bell className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
      {label} · {scheduled ? 'Scheduled' : 'Instant'}
    </span>
  );
}

function ScopeChip({ ann }: { ann: Announcement }) {
  const cfg = SCOPE_CFG[ann.scope];
  const Icon = cfg.icon;
  const label = scopeLabel(ann);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            value === opt.value
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Multi-select dropdown with an "All" option ─────────────────

function MultiSelectField({
  label,
  options,
  selected,
  onChange,
  required,
  disabled,
  allLabel = 'All',
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAll = selected.length === 0 || (options.length > 0 && selected.length === options.length);
  const displayLabel = isAll ? allLabel : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <FormField>
      <FormLabel required={required}>{label}</FormLabel>
      <div className="relative" ref={ref}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className="w-full h-10 px-3 flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={isAll ? 'text-neutral-500 dark:text-neutral-400' : selected.length === 1 ? 'capitalize' : ''}>{displayLabel}</span>
          <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        </button>
        {open && !disabled && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-56 overflow-y-auto slim-scroll">
            <label className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer border-b border-neutral-100 dark:border-neutral-800">
              <input type="checkbox" checked={isAll} onChange={() => onChange(options)} className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600" />
              {allLabel}
            </label>
            {options.map(opt => (
              <label key={opt} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onChange(selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt])}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600"
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}

// ── Searchable multi-select for targeting specific Members ─────

function MemberMultiSelect({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.toLowerCase().trim();
  const matches = (q
    ? mockMembers.filter(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
    : mockMembers
  ).slice(0, 30);

  const selectedMembers = mockMembers.filter(m => selectedIds.includes(m.id));

  return (
    <div>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full h-10 px-3 flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        >
          <span className={selectedIds.length === 0 ? 'text-neutral-500 dark:text-neutral-400' : ''}>
            {selectedIds.length === 0 ? 'Search and select members…' : `${selectedIds.length} member${selectedIds.length !== 1 ? 's' : ''} selected`}
          </span>
          <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
        </button>
        {open && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name or member ID…"
                  className="w-full pl-8 pr-2 h-8 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto slim-scroll">
              {matches.length === 0 ? (
                <p className="px-3 py-4 text-xs text-center text-neutral-400">No members found</p>
              ) : matches.map(m => (
                <label key={m.id} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(m.id)}
                    onChange={() => onChange(selectedIds.includes(m.id) ? selectedIds.filter(id => id !== m.id) : [...selectedIds, m.id])}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600"
                  />
                  <span className="flex-1 min-w-0 truncate">{m.name}</span>
                  <span className="text-xs text-neutral-400 flex-shrink-0">{m.id}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedMembers.map(m => (
            <span key={m.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800 text-xs text-primary-700 dark:text-primary-300">
              {m.name}
              <button type="button" onClick={() => onChange(selectedIds.filter(id => id !== m.id))} className="hover:text-primary-900 dark:hover:text-primary-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card used on the New/Edit Suchana page (matches New Karyakram page) ──

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg"
      style={{ borderTop: '3px solid #172E4D' }}
    >
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 rounded-t-lg">
        <h4 className="text-[19px] font-bold text-neutral-900 dark:text-white">{title}</h4>
      </div>
      <div className="px-6 pb-6 pt-4">
        {children}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

type PageState = 'list' | 'detail';

export default function Announcements({
  initialAnnouncementId,
  onConsumeInitialAnnouncement,
}: {
  initialAnnouncementId?: string | null;
  onConsumeInitialAnnouncement?: () => void;
} = {}) {
  const ap = useModulePermissions('announcements');
  const { selectedRole, scope } = useRoleScope();
  const isMemberRole = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';
  const canViewAdminSuchanaValues = selectedRole === 'Super Admin' || selectedRole.includes('Admin');

  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [pageState, setPageState]         = useState<PageState>('list');
  const [selected, setSelected]           = useState<Announcement | null>(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [bodyWordCount, setBodyWordCount] = useState(0);
  const [showDelete, setShowDelete]       = useState(false);
  const [toDelete, setToDelete]           = useState<Announcement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterStatus, setFilterStatus]   = useState<AnnouncementStatus | 'all'>('all');
  const [filterScope, setFilterScope]     = useState<AnnouncementScope | 'all'>('all');
  const [dateStart, setDateStart]         = useState('');
  const [dateEnd, setDateEnd]             = useState('');
  const [dateLabel, setDateLabel]         = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const dateFilterRef                     = useRef<HTMLDivElement>(null);
  const [page, setPage]                   = useState(1);
  const [PER_PAGE, setPER_PAGE]           = useState(10);
  const [readIds, setReadIds]             = useState<Set<string>>(new Set());

  // Create form
  const [form, setForm] = useState<CreateForm>(blankForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateForm, string>>>({});
  const [createTab, setCreateTab] = useState<'content' | 'audience' | 'notifications'>('content');

  useEffect(() => {
    if (!initialAnnouncementId) return;
    const announcement = announcements.find(item => item.id === initialAnnouncementId);
    if (announcement) {
      setSelected(announcement);
      setPageState('detail');
    }
    onConsumeInitialAnnouncement?.();
  }, [initialAnnouncementId, announcements, onConsumeInitialAnnouncement]);

  // Cascade options — empty selection OR every option selected both mean "All" and widen to the full available set
  const isFullSelection = (sel: string[], opts: string[]) => sel.length === 0 || sel.length >= opts.length;
  const regionOptions  = Object.values(MASTERS_CASCADE.regions).flat();
  const townOptions    = !isFullSelection(form.targetRegions, regionOptions)
    ? form.targetRegions.flatMap(r => MASTERS_CASCADE.towns[r] ?? [])
    : Object.values(MASTERS_CASCADE.towns).flat();
  const centreOptions  = !isFullSelection(form.targetTowns, townOptions)
    ? form.targetTowns.flatMap(t => MASTERS_CASCADE.centres[t] ?? [])
    : Object.values(MASTERS_CASCADE.centres).flat();

  // ── Computed KPIs ───────────────────────────────────────────
  const totalCount     = announcements.length;
  const sentCount      = announcements.filter(a => a.status === 'sent').length;
  const scheduledCount = announcements.filter(a => a.status === 'scheduled').length;
  const draftCount     = announcements.filter(a => a.status === 'draft').length;

  // ── Filtered / paginated list ───────────────────────────────
  const filtered = useMemo(() => {
    return announcements.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) || a.postedBy.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || a.status === filterStatus;
      const matchScope  = filterScope  === 'all' || a.scope  === filterScope;
      const annDate = (a.sentAt ?? a.createdAt ?? '').slice(0, 10);
      const matchDate = (!dateStart || annDate >= dateStart) && (!dateEnd || annDate <= dateEnd);
      return matchSearch && matchStatus && matchScope && matchDate;
    });
  }, [announcements, searchQuery, filterStatus, filterScope, dateStart, dateEnd]);

  const totalPages = PER_PAGE === 0 ? 1 : Math.ceil(filtered.length / PER_PAGE);
  const paginated  = PER_PAGE === 0 ? filtered : filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const bodyIsOver = bodyWordCount > 150;

  // ── Form helpers ────────────────────────────────────────────
  const setField = <K extends keyof CreateForm>(key: K, val: CreateForm[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const createBlankForm = () => ({
    ...blankForm(),
    targetRegions: scope.showRegionFilter ? [] : (scope.region ? [scope.region] : []),
    targetTowns:   scope.showTownFilter   ? [] : (scope.town   ? [scope.town]   : []),
    targetCentres: scope.showCentreFilter ? [] : (scope.centre ? [scope.centre] : []),
  });

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof CreateForm, string>> = {};
    if (!form.title.trim())  errs.title = 'Title is required.';
    if (!form.body.trim())   errs.body  = 'Message body is required.';
    else if (bodyIsOver) errs.body = 'Message must not exceed 150 words.';
    if ((form.contentType === 'image' || form.contentType === 'video') && !form.mediaUrl.trim())
      errs.mediaUrl = 'Please upload an image or video attachment.';
    if (form.targetSpecificOnly && form.targetMemberIds.length === 0)
      errs.targetMemberIds = 'Please select at least one member.';
    if (form.pushEnabled  && form.pushSchedule  === 'scheduled' && !form.pushScheduledAt)  errs.pushScheduledAt  = 'Schedule date/time required.';
    if (form.emailEnabled && form.emailSchedule === 'scheduled' && !form.emailScheduledAt) errs.emailScheduledAt = 'Schedule date/time required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Derive the legacy singular scope/target fields (used by list & detail display) from the new multi-select arrays
  const deriveLegacyScope = (): { scope: AnnouncementScope; targetRegion?: string; targetTown?: string; targetCentre?: string } => {
    if (!isFullSelection(form.targetCentres, centreOptions)) return { scope: 'centre', targetRegion: form.targetRegions[0], targetTown: form.targetTowns[0], targetCentre: form.targetCentres[0] };
    if (!isFullSelection(form.targetTowns, townOptions))     return { scope: 'town',   targetRegion: form.targetRegions[0], targetTown: form.targetTowns[0] };
    if (!isFullSelection(form.targetRegions, regionOptions)) return { scope: 'region', targetRegion: form.targetRegions[0] };
    return { scope: 'national' };
  };

  const handleSave = (asDraft: boolean) => {
    if (!validateForm()) return;

    const isScheduled = !asDraft && (
      (form.pushEnabled  && form.pushSchedule  === 'scheduled') ||
      (form.emailEnabled && form.emailSchedule === 'scheduled')
    );

    const newStatus: AnnouncementStatus = asDraft ? 'draft' : isScheduled ? 'scheduled' : 'sent';

    if (editingId) {
      // ── Edit mode: update existing announcement ──────────────
      setAnnouncements(prev => prev.map(a => {
        if (a.id !== editingId) return a;
        const updated: Announcement = {
          ...a,
          title:       form.title.trim(),
          body:        form.body.trim(),
          contentType: form.contentType,
          mediaUrl:    form.mediaUrl.trim() || undefined,
          cooldownHours: form.cooldownHours,
          priority:    form.priority,
          status:      newStatus,
          ...deriveLegacyScope(),
          targetRegions: form.targetRegions,
          targetTowns:   form.targetTowns,
          targetCentres: form.targetCentres,
          targetMemberIds: form.targetSpecificOnly ? form.targetMemberIds : undefined,
          filterAgeCategories: form.filterAgeCategories,
          filterGenders:       form.filterGenders,
          filterResponsibilityLevels: form.filterResponsibilityLevels,
          filterJobTitles:     form.filterJobTitles,
          filterResponsibilityTypes:  form.filterResponsibilityTypes,
          push: {
            enabled:     form.pushEnabled,
            schedule:    form.pushSchedule,
            scheduledAt: form.pushEnabled && form.pushSchedule === 'scheduled' ? form.pushScheduledAt : undefined,
          },
          email: {
            enabled:     form.emailEnabled,
            schedule:    form.emailSchedule,
            scheduledAt: form.emailEnabled && form.emailSchedule === 'scheduled' ? form.emailScheduledAt : undefined,
          },
          sentAt: newStatus === 'sent' ? (a.sentAt ?? new Date().toISOString()) : undefined,
        };
        // Keep selected in sync if editing the currently-viewed announcement
        if (selected?.id === editingId) setSelected(updated);
        return updated;
      }));
      setShowCreate(false);
      setEditingId(null);
      setForm(createBlankForm());
      setFormErrors({});
      toast.success(asDraft ? 'Draft updated.' : isScheduled ? 'Scheduled Suchana updated.' : 'Suchana sent successfully.');
    } else {
      // ── Create mode: add new announcement ───────────────────
      const newAnn: Announcement = {
        id:   `ANN-${String(announcements.length + 1).padStart(3, '0')}-NEW`,
        title:       form.title.trim(),
        body:        form.body.trim(),
        contentType: form.contentType,
        mediaUrl:    form.mediaUrl.trim() || undefined,
        cooldownHours: form.cooldownHours,
        priority:    form.priority,
        status:      newStatus,
        ...deriveLegacyScope(),
        targetRegions: form.targetRegions,
        targetTowns:   form.targetTowns,
        targetCentres: form.targetCentres,
        targetMemberIds: form.targetSpecificOnly ? form.targetMemberIds : undefined,
        filterAgeCategories: form.filterAgeCategories,
        filterGenders:       form.filterGenders,
        filterResponsibilityLevels: form.filterResponsibilityLevels,
        filterJobTitles:     form.filterJobTitles,
        filterResponsibilityTypes:  form.filterResponsibilityTypes,
        push: {
          enabled:     form.pushEnabled,
          schedule:    form.pushSchedule,
          scheduledAt: form.pushEnabled && form.pushSchedule === 'scheduled' ? form.pushScheduledAt : undefined,
        },
        email: {
          enabled:     form.emailEnabled,
          schedule:    form.emailSchedule,
          scheduledAt: form.emailEnabled && form.emailSchedule === 'scheduled' ? form.emailScheduledAt : undefined,
        },
        createdAt:      new Date().toISOString(),
        sentAt:         asDraft || isScheduled ? undefined : new Date().toISOString(),
        postedBy:       'Admin',
        estimatedReach: 100,
      };
      setAnnouncements(prev => [newAnn, ...prev]);
      setShowCreate(false);
      setForm(createBlankForm());
      setFormErrors({});
      toast.success(asDraft ? 'Suchana saved as draft.' : isScheduled ? 'Suchana scheduled.' : 'Suchana sent successfully.');
    }
  };

  const handleDelete = () => {
    if (!toDelete) return;
    setDeleteLoading(true);
    // Simulate async delete
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== toDelete.id));
      if (selected?.id === toDelete.id) { setSelected(null); setPageState('list'); }
      setDeleteLoading(false);
      setShowDelete(false);
      setToDelete(null);
      toast.success('Suchana deleted.');
    }, 600);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDelete(false);
    setToDelete(null);
  };

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  const openDetail = (ann: Announcement) => {
    setSelected(ann);
    setPageState('detail');
    scrollToTop();
    if (isMemberRole) setReadIds(prev => (prev.has(ann.id) ? prev : new Set(prev).add(ann.id)));
  };
  const goBack     = () => { setSelected(null); setPageState('list'); scrollToTop(); };

  useEffect(() => {
    if (pageState === 'detail' && selected) scrollToTop();
  }, [pageState, selected?.id]);

  const closeCreate = () => { setShowCreate(false); setEditingId(null); setForm(createBlankForm()); setFormErrors({}); setBodyWordCount(0); };

  const openEdit = (ann: Announcement) => {
    setForm({
      title:               ann.title,
      body:                ann.body,
      contentType:         ann.contentType,
      mediaUrl:            ann.mediaUrl ?? '',
      cooldownHours:       ann.cooldownHours,
      priority:            ann.priority,
      targetRegions:       ann.targetRegions ?? (ann.targetRegion ? [ann.targetRegion] : []),
      targetTowns:         ann.targetTowns   ?? (ann.targetTown   ? [ann.targetTown]   : []),
      targetCentres:       ann.targetCentres ?? (ann.targetCentre ? [ann.targetCentre] : []),
      targetSpecificOnly:  (ann.targetMemberIds?.length ?? 0) > 0,
      targetMemberIds:     ann.targetMemberIds ?? [],
      filterAgeCategories: (ann.filterAgeCategories as any) ?? [],
      filterGenders:       ann.filterGenders  ?? [],
      filterResponsibilityLevels: ann.filterResponsibilityLevels ?? [],
      filterJobTitles:     ann.filterJobTitles ?? [],
      filterResponsibilityTypes:  ann.filterResponsibilityTypes  ?? [],
      pushEnabled:         ann.push.enabled,
      pushSchedule:        ann.push.schedule,
      pushScheduledAt:     ann.push.scheduledAt ?? '',
      emailEnabled:        ann.email.enabled,
      emailSchedule:       ann.email.schedule,
      emailScheduledAt:    ann.email.scheduledAt ?? '',
    });
    const annText = ann.body.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    setBodyWordCount(annText === '' ? 0 : annText.split(/\s+/).filter(Boolean).length);
    setEditingId(ann.id);
    setShowCreate(true);
  };

  // ── Render: New / Edit Suchana page ───────────────────────────
  if (showCreate) {
    const CREATE_TABS: { id: 'content' | 'audience' | 'notifications'; label: string }[] = [
      { id: 'content',       label: 'Content'                },
      { id: 'audience',      label: 'Audience and Targeting'  },
      { id: 'notifications', label: 'Notifications'           },
    ];

    return (
      <div className="px-6 py-6">
        <PageHeader
          title={editingId ? 'Edit Suchana' : 'New Suchana'}
          breadcrumbs={[
            { label: 'Suchana', onClick: closeCreate },
            { label: editingId ? 'Edit' : 'Create', current: true },
          ]}
        >
          <div className="flex items-center gap-3">
            <SecondaryButton icon={ArrowLeft} onClick={closeCreate}>Cancel</SecondaryButton>
            <button className={btnGhost} onClick={() => handleSave(true)}>
              <BookmarkCheck className="w-4 h-4" /> Save as Draft
            </button>
            <PrimaryButton icon={Send} onClick={() => handleSave(false)}>
              {form.pushSchedule === 'scheduled' || form.emailSchedule === 'scheduled' ? 'Schedule' : 'Send Now'}
            </PrimaryButton>
          </div>
        </PageHeader>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg">
          {/* Tab bar */}
          <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-t-lg">
            <div className="flex overflow-x-auto">
              {CREATE_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCreateTab(tab.id)}
                  className={`px-5 py-3 text-sm whitespace-nowrap transition-colors border-b-2 ${
                    createTab === tab.id
                      ? 'border-primary-600 dark:border-primary-400 text-neutral-900 dark:text-white font-semibold'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6 bg-white dark:bg-neutral-950 space-y-5 rounded-b-lg">

            {/* ── Content tab ── */}
            {createTab === 'content' && (
              <Card title="Suchana Content">
                <div className="space-y-4">
                  {/* Title */}
                  <FormField>
                    <FormLabel required>Title</FormLabel>
                    <FormInput
                      placeholder="Enter Suchana title"
                      value={form.title}
                      onChange={e => setField('title', e.target.value)}
                    />
                    {formErrors.title && <p className="text-xs text-red-600 mt-1">{formErrors.title}</p>}
                  </FormField>

                  {/* High priority */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      checked={form.priority === 'high'}
                      onChange={e => setField('priority', e.target.checked ? 'high' : 'medium')}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-red-600"
                    />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Mark as High Priority
                    </span>
                  </label>

                  {/* Body */}
                  <FormField>
                    <FormLabel required>Message</FormLabel>
                    <RichTextEditor
                      placeholder="Write your Suchana message…"
                      value={form.body}
                      onChange={html => {
                        setField('body', html);
                        const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
                        setBodyWordCount(text === '' ? 0 : text.split(/\s+/).filter(Boolean).length);
                      }}
                    />
                    <div className="flex items-center justify-end mt-1.5">
                      <span className={`text-xs font-medium ${
                        bodyIsOver               ? 'text-red-600 dark:text-red-400'
                        : bodyWordCount >= 130   ? 'text-amber-600 dark:text-amber-400'
                        :                          'text-neutral-400 dark:text-neutral-500'
                      }`}>
                        {bodyWordCount} / 150 words{bodyIsOver ? ' — limit exceeded' : ''}
                      </span>
                    </div>
                    {formErrors.body && <p className="text-xs text-red-600 mt-1">{formErrors.body}</p>}
                  </FormField>

                  {/* Attachment */}
                  <FormField>
                    <FormLabel>Attachment</FormLabel>
                    <div className="flex items-center gap-2">
                      <label className={`${btnGhost} cursor-pointer`}>
                        <Image className="w-4 h-4" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              setField('mediaUrl', String(reader.result));
                              setField('contentType', 'image');
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <label className={`${btnGhost} cursor-pointer`}>
                        <Video className="w-4 h-4" />
                        Upload Video
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              setField('mediaUrl', String(reader.result));
                              setField('contentType', 'video');
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {form.mediaUrl && (
                        <button
                          type="button"
                          onClick={() => { setField('mediaUrl', ''); setField('contentType', 'text'); }}
                          className={btnDanger}
                        >
                          <X className="w-4 h-4" /> Remove
                        </button>
                      )}
                    </div>

                    {form.mediaUrl && form.contentType === 'image' && (
                      <img src={form.mediaUrl} alt="Attachment preview" className="mt-3 max-h-40 rounded-lg border border-neutral-200 dark:border-neutral-700 object-contain" />
                    )}
                    {form.mediaUrl && form.contentType === 'video' && (
                      <video src={form.mediaUrl} controls className="mt-3 max-h-40 rounded-lg border border-neutral-200 dark:border-neutral-700" />
                    )}

                    {formErrors.mediaUrl && <p className="text-xs text-red-600 mt-1">{formErrors.mediaUrl}</p>}
                  </FormField>

                  {/* Cooldown — fixed at 5 minutes */}
                  <FormField>
                    <FormLabel>How long before Member sees this Suchana</FormLabel>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                      <span className="text-sm text-neutral-900 dark:text-white font-medium">5 minutes</span>
                      <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">Fixed</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">How long before the same member sees this Suchana again.</p>
                  </FormField>
                </div>
              </Card>
            )}

            {/* ── Audience and Targeting tab ── */}
            {createTab === 'audience' && (
              <div className="space-y-5">
                <Card title="Target Specific Members">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                      <input
                        type="checkbox"
                        checked={form.targetSpecificOnly}
                        onChange={e => setField('targetSpecificOnly', e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600"
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Send this Suchana to specific members only
                      </span>
                    </label>
                    {form.targetSpecificOnly && (
                      <FormField>
                        <FormLabel required>Select Members</FormLabel>
                        <MemberMultiSelect
                          selectedIds={form.targetMemberIds}
                          onChange={ids => setField('targetMemberIds', ids)}
                        />
                        {formErrors.targetMemberIds && <p className="text-xs text-red-600 mt-1">{formErrors.targetMemberIds}</p>}
                      </FormField>
                    )}
                  </div>
                </Card>

                {!form.targetSpecificOnly && (
                  <>
                    <Card title="Scope">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MultiSelectField
                          label="Region"
                          options={regionOptions}
                          selected={form.targetRegions}
                          disabled={!scope.showRegionFilter}
                          onChange={v => { setField('targetRegions', v); setField('targetTowns', []); setField('targetCentres', []); }}
                        />
                        <MultiSelectField
                          label="Town"
                          options={townOptions}
                          selected={form.targetTowns}
                          disabled={!scope.showTownFilter}
                          onChange={v => { setField('targetTowns', v); setField('targetCentres', []); }}
                        />
                        <MultiSelectField
                          label="Activity Centre"
                          options={centreOptions}
                          selected={form.targetCentres}
                          disabled={!scope.showCentreFilter}
                          onChange={v => setField('targetCentres', v)}
                        />
                      </div>
                    </Card>

                    <Card title="Demographic Filters">
                      <p className="text-xs text-neutral-400 -mt-2 mb-2">Optional — leave as "All" to target everyone.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MultiSelectField
                          label="Age Category"
                          options={['teen', 'adult']}
                          selected={form.filterAgeCategories}
                          onChange={v => setField('filterAgeCategories', v as ('child' | 'teen' | 'adult')[])}
                        />
                        <MultiSelectField
                          label="Gender"
                          options={['male', 'female']}
                          selected={form.filterGenders}
                          onChange={v => setField('filterGenders', v as ('male' | 'female')[])}
                        />
                        <MultiSelectField
                          label="Responsibility Level"
                          options={[...RESPONSIBILITY_LEVEL_OPTIONS]}
                          selected={form.filterResponsibilityLevels}
                          onChange={v => setField('filterResponsibilityLevels', v)}
                        />
                        <MultiSelectField
                          label="Sangh Responsibility"
                          options={JOB_TITLE_OPTIONS}
                          selected={form.filterJobTitles}
                          onChange={v => setField('filterJobTitles', v)}
                        />
                        <MultiSelectField
                          label="Responsibility Type"
                          options={[...RESPONSIBILITY_TYPE_OPTIONS]}
                          selected={form.filterResponsibilityTypes}
                          onChange={v => setField('filterResponsibilityTypes', v)}
                        />
                      </div>
                    </Card>
                  </>
                )}
              </div>
            )}

            {/* ── Notifications tab ── */}
            {createTab === 'notifications' && (
              canViewAdminSuchanaValues ? (
                <Card title="Notification Channels">
                  <div className="space-y-4">
                    {/* Push notification */}
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">Push Notification</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={form.pushEnabled} onChange={e => setField('pushEnabled', e.target.checked)} />
                          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                        </label>
                      </div>
                      {form.pushEnabled && (
                        <div className="space-y-3">
                          <ToggleGroup
                            value={form.pushSchedule}
                            onChange={v => setField('pushSchedule', v as 'instant' | 'scheduled')}
                            options={[
                              { value: 'instant',   label: '⚡ Send Instantly' },
                              { value: 'scheduled', label: '🕐 Schedule'       },
                            ]}
                          />
                          {form.pushSchedule === 'scheduled' && (
                            <FormField>
                              <FormLabel required>Schedule Date &amp; Time</FormLabel>
                              <FormInput
                                type="datetime-local"
                                value={form.pushScheduledAt}
                                onChange={e => setField('pushScheduledAt', e.target.value)}
                              />
                              {formErrors.pushScheduledAt && <p className="text-xs text-red-600 mt-1">{formErrors.pushScheduledAt}</p>}
                            </FormField>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Email notification */}
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">Email Notification</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={form.emailEnabled} onChange={e => setField('emailEnabled', e.target.checked)} />
                          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                        </label>
                      </div>
                      {form.emailEnabled && (
                        <div className="space-y-3">
                          <ToggleGroup
                            value={form.emailSchedule}
                            onChange={v => setField('emailSchedule', v as 'instant' | 'scheduled')}
                            options={[
                              { value: 'instant',   label: '⚡ Send Instantly' },
                              { value: 'scheduled', label: '🕐 Schedule'       },
                            ]}
                          />
                          {form.emailSchedule === 'scheduled' && (
                            <FormField>
                              <FormLabel required>Schedule Date &amp; Time</FormLabel>
                              <FormInput
                                type="datetime-local"
                                value={form.emailScheduledAt}
                                onChange={e => setField('emailScheduledAt', e.target.value)}
                              />
                              {formErrors.emailScheduledAt && <p className="text-xs text-red-600 mt-1">{formErrors.emailScheduledAt}</p>}
                            </FormField>
                          )}
                        </div>
                      )}
                    </div>

                    {/* In-app bell — always on, informational */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                      <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">In-App Bell Notification</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Members always receive this Suchana in their notification bell. This cannot be disabled.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card title="Notification Channels">
                  <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                    <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">In-App Bell Notification</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Members always receive this Suchana in their notification bell. This cannot be disabled.</p>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'detail' && selected) {
    const sc   = STATUS_CFG[selected.status];
    const pc   = PRIORITY_CFG[selected.priority];
    const cc   = CONTENT_CFG[selected.contentType];
    const scpc = SCOPE_CFG[selected.scope];
    const ScopeIcon = scpc.icon;

    return (
      <div className="px-6 py-6">
        <PageHeader
          title={selected.title}
          breadcrumbs={isMemberRole ? undefined : [
            { label: 'Home', href: '#' },
            { label: 'Suchana', onClick: goBack },
            { label: selected.title.length > 50 ? selected.title.slice(0, 50) + '…' : selected.title, current: true },
          ]}
        >
          <div className="flex items-center gap-2">
            {isMemberRole ? (
              <SecondaryButton icon={ArrowLeft} onClick={goBack}>Back to Suchanas</SecondaryButton>
            ) : (
              <>
                <SecondaryButton icon={ArrowLeft} onClick={goBack}>Back to Suchanas</SecondaryButton>
                {ap.canEdit && canEditAnnouncement(selected) && (
                  <button className={btnGhost} onClick={() => openEdit(selected)}>
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                )}
                {ap.canDelete && (canDeleteAnnouncement(selected) ? (
                  <button className={btnDanger} onClick={() => { setToDelete(selected); setShowDelete(true); }}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                ) : (
                  <span
                    title="Cannot delete — the 5-minute cooldown window has passed"
                    className={`${btnBase} border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-60`}
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </span>
                ))}
              </>
            )}
          </div>
        </PageHeader>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left: content ──────────────────────────────── */}
          <div className="flex-1 space-y-6">
            {/* Media */}
            {selected.mediaUrl && selected.contentType === 'image' && (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <img src={selected.mediaUrl} alt={selected.title} className={`w-full object-cover ${isMemberRole ? 'max-h-96' : 'max-h-72'}`} />
              </div>
            )}
            {selected.mediaUrl && selected.contentType === 'video' && (
              <div className={`bg-black rounded-lg overflow-hidden flex items-center justify-center ${isMemberRole ? 'h-72' : 'h-48'}`}>
                <video src={selected.mediaUrl} controls className={`w-full ${isMemberRole ? 'max-h-72' : 'max-h-48'}`} />
              </div>
            )}

            {/* Body */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
              <div className="px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                <cc.icon className={`w-4 h-4 ${cc.color}`} />
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Message</h4>
              </div>
              <div className={isMemberRole ? 'px-6 py-6' : 'px-6 py-5'}>
                <div
                  className={`text-neutral-700 dark:text-neutral-300 leading-relaxed prose dark:prose-invert max-w-none ${isMemberRole ? 'text-base' : 'text-sm'}`}
                  dangerouslySetInnerHTML={{ __html: selected.body }}
                />
              </div>
            </div>

            {/* Audience Scope + Meta — member role only */}
            {isMemberRole && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Audience Scope */}
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Audience Scope</p>
                  <div className={`flex items-center gap-2 ${scpc.color}`}>
                    <ScopeIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{scopeLabel(selected)}</span>
                  </div>
                  {selected.scope !== 'national' && (
                    <div className="mt-3 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {selected.targetRegion && <p>Region: {selected.targetRegion}</p>}
                      {selected.targetTown   && <p>Town: {selected.targetTown}</p>}
                      {selected.targetCentre && <p>Centre: {selected.targetCentre}</p>}
                    </div>
                  )}
                </div>
                {/* Posted by & Date */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">Posted by</span>
                    <span className="text-neutral-900 dark:text-white font-medium">{selected.postedBy}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">Date</span>
                    <span className="text-neutral-700 dark:text-neutral-300">{selected.sentAt ? formatDateTime(selected.sentAt) : formatDate(selected.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Demographic filters (if any) */}
            {!isMemberRole && (selected.filterAgeCategories.length > 0 || selected.filterGenders.length > 0 || (selected.filterResponsibilityLevels?.length ?? 0) > 0 || selected.filterJobTitles.length > 0 || (selected.filterResponsibilityTypes?.length ?? 0) > 0) && (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                <div className="px-6 pt-4 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Demographic Filters</h4>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {selected.filterAgeCategories.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Age Category</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.filterAgeCategories.map(a => (
                          <span key={a} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 capitalize">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.filterGenders.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Gender</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.filterGenders.map(g => (
                          <span key={g} className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 capitalize">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selected.filterResponsibilityLevels?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Responsibility Level</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.filterResponsibilityLevels!.map(l => (
                          <span key={l} className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.filterJobTitles.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Sangh Responsibility</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.filterJobTitles.map(j => (
                          <span key={j} className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {j}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selected.filterResponsibilityTypes?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Responsibility Type</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.filterResponsibilityTypes!.map(t => (
                          <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: metadata — admin only ───────────────── */}
          {!isMemberRole && <div className="lg:w-80 space-y-4">
            {/* Status & Priority */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                  {sc.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Priority</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${pc.bg} ${pc.text}`}>
                  {pc.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Content</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cc.color}`}>
                  <cc.icon className="w-3.5 h-3.5" />
                  {cc.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Cooldown</span>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">5 min</span>
              </div>
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Estimated Reach</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">{selected.estimatedReach.toLocaleString()} members</span>
                </div>
              </div>
            </div>

            {/* Scope */}
            {canViewAdminSuchanaValues && (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Audience Scope</p>
                <div className={`flex items-center gap-2 ${scpc.color}`}>
                  <ScopeIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{scopeLabel(selected)}</span>
                </div>
                {selected.scope !== 'national' && (
                  <div className="mt-3 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {selected.targetRegion && <p>Region: {selected.targetRegion}</p>}
                    {selected.targetTown   && <p>Town: {selected.targetTown}</p>}
                    {selected.targetCentre && <p>Centre: {selected.targetCentre}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            {canViewAdminSuchanaValues && (
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Notifications</p>

              {/* Push */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected.push.enabled ? 'bg-primary-50 dark:bg-primary-950/30' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                  {selected.push.enabled ? <Bell className="w-4 h-4 text-primary-600 dark:text-primary-400" /> : <BellOff className="w-4 h-4 text-neutral-400" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-900 dark:text-white">Push Notification</p>
                  {selected.push.enabled ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {selected.push.schedule === 'instant' ? 'Instant' : `Scheduled · ${selected.push.scheduledAt ? formatDateTime(selected.push.scheduledAt) : '—'}`}
                    </p>
                  ) : <p className="text-xs text-neutral-400">Disabled</p>}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected.email.enabled ? 'bg-primary-50 dark:bg-primary-950/30' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                  {selected.email.enabled ? <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" /> : <MailX className="w-4 h-4 text-neutral-400" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-900 dark:text-white">Email Notification</p>
                  {selected.email.enabled ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {selected.email.schedule === 'instant' ? 'Instant' : `Scheduled · ${selected.email.scheduledAt ? formatDateTime(selected.email.scheduledAt) : '—'}`}
                    </p>
                  ) : <p className="text-xs text-neutral-400">Disabled</p>}
                </div>
              </div>

              {/* Bell (in-app) */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-50 dark:bg-amber-950/30">
                  <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-900 dark:text-white">In-App Bell</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Received by members</p>
                </div>
              </div>
            </div>
            )}

            {/* Meta */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Posted by</span>
                <span className="text-neutral-900 dark:text-white font-medium">{selected.postedBy}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Created</span>
                <span className="text-neutral-700 dark:text-neutral-300">{formatDate(selected.createdAt)}</span>
              </div>
              {selected.sentAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400">Sent</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{formatDateTime(selected.sentAt)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">ID</span>
                <span className="text-neutral-400 dark:text-neutral-500 font-mono">{selected.id}</span>
              </div>
            </div>
          </div>}
        </div>

        {/* Delete confirm */}
        <ConfirmModal
          isOpen={showDelete && !!toDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete "${toDelete?.title}"? This action is permanent and cannot be undone.`}
          confirmLabel="Confirm Deletion"
          isLoading={deleteLoading}
          onConfirm={handleDelete}
          onClose={closeDeleteModal}
        />
      </div>
    );
  }


  // ── Announcement card renderer (shared by admin flat list and member Read/Unread sections) ──
  const renderAnnouncementCard = (ann: Announcement) => {
    const sc  = STATUS_CFG[ann.status];
    const pc  = PRIORITY_CFG[ann.priority];
    const cc  = CONTENT_CFG[ann.contentType];
    const ContentIcon = cc.icon;

    return (
      <div
        key={ann.id}
        onClick={() => openDetail(ann)}
        className="border rounded-lg overflow-hidden shadow-sm transition-colors group cursor-pointer bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
      >
        <div className="flex">
          {/* Priority bar */}
          <div className={`w-1 flex-shrink-0 ${pc.bar}`} />

          <div className="flex-1 px-5 py-4">
            <div className="flex items-start gap-4">
              {/* Content type icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mt-0.5">
                <ContentIcon className={`w-5 h-5 ${cc.color}`} />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-[16px] text-neutral-900 dark:text-white font-semibold" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>
                    {ann.title}
                  </h3>
                  {/* Status */}
                  {canViewAdminSuchanaValues && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                      {sc.label}
                    </span>
                  )}
                  {/* Priority — only High is ever selectable at creation */}
                  {ann.priority === 'high' && (
                    <span className={`text-xs font-medium ${pc.text}`}>
                      {pc.label} priority
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                  {ann.body.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()}
                </p>

                {/* Bottom meta row */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                  {/* Scope */}
                  {canViewAdminSuchanaValues && <ScopeChip ann={ann} />}

                  {/* Demographic filter chips */}
                  {canViewAdminSuchanaValues && ann.filterAgeCategories.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <Users className="w-3 h-3" />
                      {ann.filterAgeCategories.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                    </span>
                  )}
                  {canViewAdminSuchanaValues && ann.filterGenders.length > 0 && (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 capitalize">
                      {ann.filterGenders.join(' & ')}
                    </span>
                  )}

                  {/* Notification badges */}
                  {canViewAdminSuchanaValues && (
                    <>
                      <NotifBadge label="Push"  enabled={ann.push.enabled}  scheduled={ann.push.enabled  && ann.push.schedule  === 'scheduled'} />
                      <NotifBadge label="Email" enabled={ann.email.enabled} scheduled={ann.email.enabled && ann.email.schedule === 'scheduled'} />
                    </>
                  )}

                  {/* Bell receive indicator */}
                  {canViewAdminSuchanaValues && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Bell className="w-3 h-3" /> Bell
                    </span>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2 ml-2">
                <div className="text-right">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(ann.sentAt ?? ann.createdAt)}</p>
                  {!isMemberRole && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{ann.postedBy}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {ap.canDelete && (canDeleteAnnouncement(ann) ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setToDelete(ann); setShowDelete(true); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete Suchana"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
                      title={
                        ann.status === 'scheduled'
                          ? 'Scheduled Suchanas cannot be deleted'
                          : 'Cannot delete — the 5-minute cooldown window has passed'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render: List View ───────────────────────────────────────
  return (
    <div className="px-6 py-6">
      <PageHeader
        title="Suchana"
        subtitle={isMemberRole ? "Below is the list of all Suchanas for your attention" : "Create and manage suchanas for members across the network"}
      >
        {isMemberRole ? (
          <>
            <SearchBar
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setPage(1); }}
              placeholder="Search Suchanas…"
            />
            <div className="relative" ref={dateFilterRef}>
              <button
                onClick={() => setShowDateFilter(p => !p)}
                title="Filter by date"
                className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  dateStart
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {dateStart ? (dateLabel || formatDateRange(dateStart, dateEnd)) : 'Date range'}
                {dateStart && (
                  <span
                    role="button"
                    onClick={e => { e.stopPropagation(); setDateStart(''); setDateEnd(''); setDateLabel(''); }}
                    className="ml-0.5 text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
              <DateRangeFilter
                isOpen={showDateFilter}
                onClose={() => setShowDateFilter(false)}
                startDate={dateStart}
                endDate={dateEnd}
                onApply={(start, end, label) => { setDateStart(start); setDateEnd(end); setDateLabel(label || ''); setPage(1); }}
                title="Suchana Date Range"
              />
            </div>
          </>
        ) : (
          <SearchBar
            value={searchQuery}
            onChange={v => { setSearchQuery(v); setPage(1); }}
            placeholder="Search Suchanas…"
          />
        )}
        {ap.canAdd && (
          <PrimaryButton icon={Plus} onClick={() => { setForm(createBlankForm()); setShowCreate(true); }}>
            New Suchana
          </PrimaryButton>
        )}
      </PageHeader>

      {/* ── KPI Row ──────────────────────────────────────── */}
      {!isMemberRole && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total"     value={totalCount}     icon={Megaphone}      trend={{ value: 'All Suchanas',         positive: true }} />
          <StatCard label="Sent"      value={sentCount}      icon={Send}           trend={{ value: 'Delivered to members', positive: true }} />
          <StatCard label="Scheduled" value={scheduledCount} icon={CalendarClock}  trend={{ value: 'Awaiting delivery',    positive: true }} />
          <StatCard label="Drafts"    value={draftCount}     icon={BookmarkCheck}  trend={{ value: 'Not yet published',    positive: false }} />
        </div>
      )}

      {/* ── Admin Filters ────────────────────────────────── */}
      {canViewAdminSuchanaValues && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value as AnnouncementStatus | 'all'); setPage(1); }}
              className="h-10 pl-3 pr-9 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
          {/* Scope filter */}
          <div className="relative">
            <select
              value={filterScope}
              onChange={e => { setFilterScope(e.target.value as AnnouncementScope | 'all'); setPage(1); }}
              className="h-10 pl-3 pr-9 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 appearance-none focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Scope</option>
              <option value="national">National</option>
              <option value="region">Region</option>
              <option value="town">Town</option>
              <option value="centre">Activity Centre</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
          {(filterStatus !== 'all' || filterScope !== 'all') && (
            <button
              className={btnGhost}
              onClick={() => { setFilterStatus('all'); setFilterScope('all'); setPage(1); }}
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Results count ────────────────────────────────── */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        {filtered.length === announcements.length
          ? `${announcements.length} Suchana${announcements.length !== 1 ? 's' : ''}`
          : `${filtered.length} of ${announcements.length} Suchanas`}
      </p>

      {/* ── Announcement Cards ───────────────────────────── */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Megaphone className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mb-3" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No Suchanas found</p>
          <p className="text-xs text-neutral-400 mt-1">Adjust your filters or create a new Suchana.</p>
        </div>
      ) : isMemberRole ? (
        <div className="space-y-7">
          {([
            { heading: 'Unread', items: paginated.filter(a => !readIds.has(a.id)), emptyLabel: 'No unread Suchanas.' },
            { heading: 'Read',   items: paginated.filter(a =>  readIds.has(a.id)), emptyLabel: 'No read Suchanas yet.' },
          ] as const).map(section => (
            <div key={section.heading}>
              <h2 className="text-[19px] font-semibold text-neutral-900 dark:text-white mb-3">
                {section.heading}
                <span className="text-neutral-400 dark:text-neutral-500 font-normal"> ({section.items.length})</span>
              </h2>
              {section.items.length === 0 ? (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{section.emptyLabel}</p>
              ) : (
                <div className="space-y-3">
                  {section.items.map(ann => renderAnnouncementCard(ann))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map(ann => renderAnnouncementCard(ann))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={PER_PAGE}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setPER_PAGE(n); setPage(1); }}
          />
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────── */}
      <ConfirmModal
        isOpen={showDelete && !!toDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${toDelete?.title}"? This action is permanent and cannot be undone.`}
        confirmLabel="Confirm Deletion"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={closeDeleteModal}
      />

    </div>
  );
}
