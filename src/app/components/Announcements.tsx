// ─────────────────────────────────────────────────────────────
// HSS UK Membership Management System — Announcements Module
// ─────────────────────────────────────────────────────────────
// Features: Create · Read · Delete
// Content types: Text | Image | Video | Cooldown delay
// Audience: National / Region / Town / Centre + demographic filters
// Notifications: Push (Instant / Scheduled) | Email (Instant / Scheduled)
// Bell icon: In-app notification receipt
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Eye,
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
  CheckCircle2,
  BookmarkCheck,
  X,
  ChevronDown,
  Info,
  Loader2,
  Pencil,
  Upload,
} from 'lucide-react';
import { PageHeader, PrimaryButton, Pagination, SearchBar, SecondaryButton } from './hb/listing';
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
import { MASTERS_CASCADE, ROLE_TYPE_OPTIONS } from '../../mockAPI/membersData';

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
  region:   { icon: Map,        label: 'Vibhaag',         color: 'text-violet-600 dark:text-violet-400'   },
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
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function scopeLabel(ann: Announcement) {
  if (ann.scope === 'national') return 'National';
  if (ann.scope === 'region')   return ann.targetRegion ?? 'Vibhaag';
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
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h3>
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
  scope: AnnouncementScope;
  targetRegion: string;
  targetTown: string;
  targetCentre: string;
  filterAgeCategories: ('child' | 'teen' | 'adult')[];
  filterGenders: ('male' | 'female')[];
  filterJobTitles: string[];
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
  scope: 'national',
  targetRegion: '',
  targetTown: '',
  targetCentre: '',
  filterAgeCategories: [],
  filterGenders: [],
  filterJobTitles: [],
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

function CheckChip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer select-none transition-colors ${
      checked
        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600'
    }`}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />}
      {label}
    </label>
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
  const { selectedRole } = useRoleScope();
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
  const [page, setPage]                   = useState(1);
  const [PER_PAGE, setPER_PAGE]           = useState(10);

  // Create form
  const [form, setForm] = useState<CreateForm>(blankForm());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateForm, string>>>({});

  useEffect(() => {
    if (!initialAnnouncementId) return;
    const announcement = announcements.find(item => item.id === initialAnnouncementId);
    if (announcement) {
      setSelected(announcement);
      setPageState('detail');
    }
    onConsumeInitialAnnouncement?.();
  }, [initialAnnouncementId, announcements, onConsumeInitialAnnouncement]);

  // Cascade options based on form scope
  const regionOptions  = Object.values(MASTERS_CASCADE.regions).flat();
  const townOptions    = form.targetRegion ? MASTERS_CASCADE.towns[form.targetRegion] ?? [] : [];
  const centreOptions  = form.targetTown   ? MASTERS_CASCADE.centres[form.targetTown]  ?? [] : [];

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
      return matchSearch && matchStatus && matchScope;
    });
  }, [announcements, searchQuery, filterStatus, filterScope]);

  const totalPages = PER_PAGE === 0 ? 1 : Math.ceil(filtered.length / PER_PAGE);
  const paginated  = PER_PAGE === 0 ? filtered : filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const bodyIsOver = bodyWordCount > 150;

  // ── Form helpers ────────────────────────────────────────────
  const setField = <K extends keyof CreateForm>(key: K, val: CreateForm[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const createBlankForm = () => ({
    ...blankForm(),
    scope: canViewAdminSuchanaValues ? 'national' as AnnouncementScope : 'region' as AnnouncementScope,
  });

  const toggleArrayItem = <T extends string>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof CreateForm, string>> = {};
    if (!form.title.trim())  errs.title = 'Title is required.';
    if (!form.body.trim())   errs.body  = 'Message body is required.';
    else if (bodyIsOver) errs.body = 'Message must not exceed 150 words.';
    if ((form.contentType === 'image' || form.contentType === 'video') && !form.mediaUrl.trim())
      errs.mediaUrl = 'Please upload an image or video attachment.';
    if (form.scope !== 'national' && !form.targetRegion) errs.targetRegion = 'Please select a target region.';
    if ((form.scope === 'town' || form.scope === 'centre') && !form.targetTown) errs.targetTown = 'Please select a target town.';
    if (form.scope === 'centre' && !form.targetCentre)   errs.targetCentre = 'Please select a target centre.';
    if (form.pushEnabled  && form.pushSchedule  === 'scheduled' && !form.pushScheduledAt)  errs.pushScheduledAt  = 'Schedule date/time required.';
    if (form.emailEnabled && form.emailSchedule === 'scheduled' && !form.emailScheduledAt) errs.emailScheduledAt = 'Schedule date/time required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
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
          scope:       form.scope,
          targetRegion:  form.targetRegion  || undefined,
          targetTown:    form.targetTown    || undefined,
          targetCentre:  form.targetCentre  || undefined,
          filterAgeCategories: form.filterAgeCategories,
          filterGenders:       form.filterGenders,
          filterJobTitles:     form.filterJobTitles,
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
        scope:       form.scope,
        targetRegion:  form.targetRegion  || undefined,
        targetTown:    form.targetTown    || undefined,
        targetCentre:  form.targetCentre  || undefined,
        filterAgeCategories: form.filterAgeCategories,
        filterGenders:       form.filterGenders,
        filterJobTitles:     form.filterJobTitles,
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
      scope:               ann.scope,
      targetRegion:        ann.targetRegion  ?? '',
      targetTown:          ann.targetTown    ?? '',
      targetCentre:        ann.targetCentre  ?? '',
      filterAgeCategories: (ann.filterAgeCategories as any) ?? [],
      filterGenders:       ann.filterGenders  ?? [],
      filterJobTitles:     ann.filterJobTitles ?? [],
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

  // ── Render: Detail View ─────────────────────────────────────
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

            {/* Demographic filters (if any) */}
            {(selected.filterAgeCategories.length > 0 || selected.filterGenders.length > 0 || selected.filterJobTitles.length > 0) && (
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
                  {selected.filterJobTitles.length > 0 && (
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Job Titles / Responsibilities</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.filterJobTitles.map(j => (
                          <span key={j} className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {j}
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
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
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

  // ── Render: List View ───────────────────────────────────────
  return (
    <div className="px-6 py-6">
      <PageHeader
        title="Suchana"
        subtitle={isMemberRole ? "Suchanas for your attention" : "Create and manage suchanas for members across the network"}
      >
        {isMemberRole ? (
          <SearchBar
            value={searchQuery}
            onChange={v => { setSearchQuery(v); setPage(1); }}
            placeholder="Search Suchanas…"
          />
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
      ) : (
        <div className="space-y-3">
          {paginated.map(ann => {
            const sc  = STATUS_CFG[ann.status];
            const pc  = PRIORITY_CFG[ann.priority];
            const cc  = CONTENT_CFG[ann.contentType];
            const ContentIcon = cc.icon;

            return (
              <div
                key={ann.id}
                onClick={isMemberRole ? () => openDetail(ann) : undefined}
                className={`bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group${isMemberRole ? ' cursor-pointer' : ''}`}
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
                        <div className="flex items-start gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {ann.title}
                          </h3>
                          {/* Status */}
                          {canViewAdminSuchanaValues && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          )}
                          {/* Priority */}
                          <span className={`text-xs font-medium ${pc.text}`}>
                            {pc.label} priority
                          </span>
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
                          {!isMemberRole && (
                            <button
                              onClick={() => openDetail(ann)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                              title="View Suchana"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {ap.canDelete && (canDeleteAnnouncement(ann) ? (
                            <button
                              onClick={() => { setToDelete(ann); setShowDelete(true); }}
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
          })}
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

      {/* ── Create Modal ─────────────────────────────────── */}
      {showCreate && (
        <FormModal
          isOpen
          title={editingId ? 'Edit Suchana' : 'New Suchana'}
          description={editingId ? 'Update the Suchana details below' : 'Compose a message, select your audience, and configure notifications'}
          onClose={closeCreate}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">

            {/* ── Section 1: Content ─────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Content</h4>
              </div>

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
                  {/* Word count */}
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

                {/* Attachment — upload image or video */}
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
                  <FormLabel>Cooldown Delay</FormLabel>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                    <span className="text-sm text-neutral-900 dark:text-white font-medium">5 minutes</span>
                    <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">Fixed</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">How long before the same member sees this Suchana again.</p>
                </FormField>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800" />

            {/* ── Section 2: Audience ────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Audience &amp; Targeting</h4>
              </div>

              <div className="space-y-4">
                {/* Scope */}
                <FormField>
                  <FormLabel>Scope Level</FormLabel>
                  <ToggleGroup
                    value={form.scope}
                    onChange={v => {
                      setField('scope', v as AnnouncementScope);
                      setField('targetRegion', '');
                      setField('targetTown', '');
                      setField('targetCentre', '');
                    }}
                    options={[
                      ...(canViewAdminSuchanaValues ? [{ value: 'national', label: '🌐 National' }] : []),
                      { value: 'region',   label: '🗺 Region'          },
                      { value: 'town',     label: '📍 Town'            },
                      { value: 'centre',   label: '🏢 Activity Centre' },
                    ]}
                  />
                </FormField>

                {/* Target Region */}
                {form.scope !== 'national' && (
                  <FormField>
                    <FormLabel required>Target Region</FormLabel>
                    <FormSelect
                      value={form.targetRegion}
                      onChange={e => {
                        setField('targetRegion', e.target.value);
                        setField('targetTown', '');
                        setField('targetCentre', '');
                      }}
                    >
                      <option value="">Select region…</option>
                      {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </FormSelect>
                    {formErrors.targetRegion && <p className="text-xs text-red-600 mt-1">{formErrors.targetRegion}</p>}
                  </FormField>
                )}

                {/* Target Town */}
                {(form.scope === 'town' || form.scope === 'centre') && (
                  <FormField>
                    <FormLabel required>Target Town</FormLabel>
                    <FormSelect
                      value={form.targetTown}
                      onChange={e => {
                        setField('targetTown', e.target.value);
                        setField('targetCentre', '');
                      }}
                      disabled={!form.targetRegion}
                    >
                      <option value="">Select town…</option>
                      {townOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </FormSelect>
                    {formErrors.targetTown && <p className="text-xs text-red-600 mt-1">{formErrors.targetTown}</p>}
                  </FormField>
                )}

                {/* Target Centre */}
                {form.scope === 'centre' && (
                  <FormField>
                    <FormLabel required>Target Activity Centre</FormLabel>
                    <FormSelect
                      value={form.targetCentre}
                      onChange={e => setField('targetCentre', e.target.value)}
                      disabled={!form.targetTown}
                    >
                      <option value="">Select centre…</option>
                      {centreOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </FormSelect>
                    {formErrors.targetCentre && <p className="text-xs text-red-600 mt-1">{formErrors.targetCentre}</p>}
                  </FormField>
                )}

                {/* Demographic filters */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4">
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Demographic Filters <span className="font-normal text-neutral-400">(optional — leave blank for all)</span></p>

                  <FormField>
                    <FormLabel>Age Category</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {(['teen', 'adult'] as const).map(cat => (
                        <CheckChip
                          key={cat}
                          label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                          checked={form.filterAgeCategories.includes(cat)}
                          onChange={() => setField('filterAgeCategories', toggleArrayItem(form.filterAgeCategories, cat))}
                        />
                      ))}
                    </div>
                  </FormField>

                  <FormField>
                    <FormLabel>Gender</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {(['male', 'female'] as const).map(g => (
                        <CheckChip
                          key={g}
                          label={g.charAt(0).toUpperCase() + g.slice(1)}
                          checked={form.filterGenders.includes(g)}
                          onChange={() => setField('filterGenders', toggleArrayItem(form.filterGenders, g))}
                        />
                      ))}
                    </div>
                  </FormField>

                  <FormField>
                    <FormLabel>Job Title / Responsibility</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {JOB_TITLE_OPTIONS.map(j => (
                        <CheckChip
                          key={j}
                          label={j}
                          checked={form.filterJobTitles.includes(j)}
                          onChange={() => setField('filterJobTitles', toggleArrayItem(form.filterJobTitles, j))}
                        />
                      ))}
                    </div>
                  </FormField>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800" />

            {/* ── Section 3: Notifications ───────────────── */}
            {canViewAdminSuchanaValues && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Notifications</h4>
              </div>

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
            </div>
            )}

            {/* ── Footer buttons ────────────────────────── */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button className={btnGhost} onClick={closeCreate}>Cancel</button>
              <button className={btnGhost} onClick={() => handleSave(true)}>
                <BookmarkCheck className="w-4 h-4" /> Save as Draft
              </button>
              <button className={btnPrimary} onClick={() => handleSave(false)}>
                <Send className="w-4 h-4" />
                {form.pushSchedule === 'scheduled' || form.emailSchedule === 'scheduled' ? 'Schedule' : 'Send Now'}
              </button>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
