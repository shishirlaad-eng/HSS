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
  Globe,
  Link2,
  ListChecks,
  Ticket,
  ScrollText,
  ChevronDown,
  Search,
  Check,
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
  useStickyListingHeader,
  type ColumnConfig,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import {
  FormField,
  FormLabel,
  FormInput,
  FormGrid,
  FormSelect,
  ErrorText,
  RichTextEditor,
} from './hb/common';
import { mockEvents, mockParticipants, Event } from '../../mockAPI/eventsData';
import { MASTERS_CASCADE } from '../../mockAPI/membersData';
import EventDetail from './EventDetail';
import EventEdit from './EventEdit';
import EventCreate from './EventCreate';
import { toast } from 'sonner';
import { useRoleScope, useModulePermissions } from '../contexts/RoleScopeContext';
import { filterByScope, getScopedFilterOptions } from '../../mockAPI/roleScope';
import { formatDate as sharedFormatDate, formatDateTime as sharedFormatDateTime, formatDateRange } from '../../utils/formatDate';

type ViewMode = 'grid' | 'list' | 'table';
type PageState = 'list' | 'detail' | 'edit' | 'create';
type ModalType = null | 'create' | 'status' | 'cancel' | 'override' | 'delete';

// ─── Listing tabs ─────────────────────────────────────────────────────────────
// Splits the admin listing into an in-flight working set (Draft/Scheduled/Active/
// In-progress) and a terminal set (Past/Completed/Closed), so finished Karyakrams
// don't clutter the default view.
type EventListTab = 'current' | 'completed';
const CURRENT_EVENT_STATUSES: Event['status'][]   = ['draft', 'published', 'active'];
const COMPLETED_EVENT_STATUSES: Event['status'][] = ['completed', 'cancelled'];

// ─── Cutoff helpers ───────────────────────────────────────────────────────────
// Decision (Shishir/Ritesh): "future only" was too strict — in-progress Karyakrams
// still need day-of edits (venue/time change, early closure, extension, emergency
// relocation, ticket/price/capacity updates). Draft, scheduled and in-progress stay
// editable; only Completed (and Cancelled, which is equally terminal) are locked.
const isPastStart = (event: Event) => new Date() >= new Date(event.startDate);
const canModify   = (event: Event) => CURRENT_EVENT_STATUSES.includes(event.status);
const canDelete   = (event: Event) => !isPastStart(event) && event.status !== 'completed';

// ─── Member view helpers ──────────────────────────────────────────────────────
const MON_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const utcHHMM = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`;
};
const utcDMY  = (iso: string) => {
  const d = new Date(iso);
  return { day: d.getUTCDate(), mon: MON_SHORT[d.getUTCMonth()], year: d.getUTCFullYear() };
};
const utcFull = (iso: string) => {
  const { day, mon, year } = utcDMY(iso);
  return `${String(day).padStart(2,'0')} ${mon} ${year}, ${utcHHMM(iso)}`;
};
const isMultiDayEvent = (ev: Event) => {
  const s = utcDMY(ev.startDate), e = utcDMY(ev.endDate);
  return s.day !== e.day || s.mon !== e.mon || s.year !== e.year;
};
// Single-day cards show just the time range; multi-day cards append the end
// date so the duration doesn't silently collapse to the start day only.
const timeRangeLabel = (ev: Event) => isMultiDayEvent(ev)
  ? `${utcHHMM(ev.startDate)} – ${utcHHMM(ev.endDate)} (ends ${String(utcDMY(ev.endDate).day).padStart(2,'0')} ${utcDMY(ev.endDate).mon})`
  : `${utcHHMM(ev.startDate)} – ${utcHHMM(ev.endDate)}`;

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Event['status'] }) {
  const map: Record<Event['status'], { bg: string; text: string; dot: string; label: string }> = {
    draft:     { bg: 'bg-neutral-50 dark:bg-neutral-900',         text: 'text-neutral-600 dark:text-neutral-400',   dot: 'bg-neutral-400',   label: 'Draft'     },
    published: { bg: 'bg-blue-50 dark:bg-blue-950/20',            text: 'text-blue-700 dark:text-blue-400',         dot: 'bg-blue-500',      label: 'Published' },
    active:    { bg: 'bg-success-50 dark:bg-success-950/20',      text: 'text-success-700 dark:text-success-400',   dot: 'bg-success-500',   label: 'In Progress' },
    cancelled: { bg: 'bg-error-50 dark:bg-error-950/20',          text: 'text-error-700 dark:text-error-400',       dot: 'bg-error-500',     label: 'Cancelled' },
    completed: { bg: 'bg-amber-50 dark:bg-amber-950/20',          text: 'text-amber-700 dark:text-amber-400',       dot: 'bg-amber-500',     label: 'Completed' },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border border-transparent text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ─── Payment badge ────────────────────────────────────────────────────────────
function PaymentBadge({ type, price, priceCategories }: { type: Event['paymentType']; price?: number; priceCategories?: Event['priceCategories'] }) {
  const resolvedPrice = price ?? priceCategories?.[0]?.price;
  const priceLabel = resolvedPrice != null ? `£${resolvedPrice}` : '£';

  return type === 'paid' ? (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
      {priceLabel}
    </span>
  ) : (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800">
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
          <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white">{title}</h3>
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

// ─── FILTER OPTIONS ───────────────────────────────────────────────────────────
const EVENT_FILTER_BASE = {
  'Status': ['Draft', 'Published', 'In Progress', 'Cancelled', 'Completed'],
  'Payment Type': ['Paid', 'Free'],
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EventManagement({ onNavigateToMember, initialEventId, onConsumeInitialEvent }: { onNavigateToMember?: (memberId: string) => void; initialEventId?: string | null; onConsumeInitialEvent?: () => void } = {}) {
  // ── Role scope & permissions ─────────────────────────────────
  const { scope, selectedRole } = useRoleScope();
  const ep = useModulePermissions('events');
  const scopedFilterOptions = getScopedFilterOptions(scope);
  const isMemberRole = selectedRole === 'Adult Member' || selectedRole === 'Teen Member';
  const isSuperAdmin = selectedRole === 'Super Admin';

  // Member data — counts + event arrays for panels and completed table
  const MEMBER_ID_BY_ROLE: Record<string, string> = { 'Adult Member': 'MBR-001', 'Teen Member': 'MBR-004' };
  const memberData = useMemo(() => {
    if (!isMemberRole) return null;
    const memberId = MEMBER_ID_BY_ROLE[selectedRole] ?? 'MBR-001';
    const now = new Date();
    const notRegisteredArr: Event[] = [];
    const registeredArr: Event[] = [];
    const attendedArr: Event[] = [];
    for (const ev of mockEvents) {
      const isFuture = new Date(ev.startDate) > now;
      const myRecord = (mockParticipants[ev.id] ?? []).find(p => p.memberId === memberId);
      if (isFuture && ev.status !== 'cancelled') {
        if (!myRecord) notRegisteredArr.push(ev);
        else if (myRecord.rsvp === 'going' || myRecord.rsvp === 'requested') registeredArr.push(ev);
      } else if (!isFuture && myRecord?.rsvp === 'going') {
        attendedArr.push(ev);
      }
    }
    notRegisteredArr.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    registeredArr.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    attendedArr.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return {
      counts: { attended: attendedArr.length, notRegistered: notRegisteredArr.length, registered: registeredArr.length },
      notRegistered: notRegisteredArr.slice(0, 3),
      registered:    registeredArr.slice(0, 3),
      attended:      attendedArr,
    };
  }, [isMemberRole, selectedRole]);

  const scopedEvents = useMemo(
    () => isMemberRole
      ? mockEvents.filter(e => e.status === 'published' || e.status === 'active')
      : filterByScope(mockEvents, scope),
    [isMemberRole, scope],
  );

  const [viewMode, setViewMode]       = useState<ViewMode>(
    isMemberRole ? 'list' : 'table'
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
  const [showSummary, setShowSummary]         = useState(true);
  const [showMemberSummary, setShowMemberSummary] = useState(true);
  const [activeEventTab, setActiveEventTab] = useState<EventListTab>('current');
  const { stickyHeaderRef, stickyTableStyle } = useStickyListingHeader();

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  };

  useEffect(() => {
    if (initialEventId) {
      const ev = mockEvents.find(e => e.id === initialEventId);
      if (ev) { setSelectedEvent(ev); setPageState('detail'); scrollToTop(); }
      onConsumeInitialEvent?.();
    }
  }, [initialEventId]);

  useEffect(() => {
    if ((pageState === 'detail' || pageState === 'edit') && selectedEvent) scrollToTop();
  }, [pageState, selectedEvent?.id]);

  // Modal state
  const [modal, setModal] = useState<{
    type: ModalType;
    event?: Event;
    isLoading: boolean;
  }>({ type: null, isLoading: false });

  // Column visibility
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const columnAnchorRef = useRef<HTMLDivElement>(null);
  const eventColumns: ColumnConfig[] = [
    { key: 'id',           label: 'Karyakram ID'           },
    { key: 'name',         label: 'Karyakram Title'        },
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

  const eventTabCounts = useMemo(() => ({
    current:   scopedEvents.filter(e => CURRENT_EVENT_STATUSES.includes(e.status)).length,
    completed: scopedEvents.filter(e => COMPLETED_EVENT_STATUSES.includes(e.status)).length,
  }), [scopedEvents]);

  // Filtering
  const filteredEvents = useMemo(() => {
    const tabStatuses = activeEventTab === 'current' ? CURRENT_EVENT_STATUSES : COMPLETED_EVENT_STATUSES;
    return scopedEvents.filter(event => {
      if (!isMemberRole && !tabStatuses.includes(event.status)) return false;
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
          case 'Vibhag':
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
  }, [scopedEvents, searchQuery, filters, eventDateStart, eventDateEnd, activeEventTab, isMemberRole]);

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
  const formatDateTime = (iso: string) => sharedFormatDateTime(iso);
  const formatDate = (iso: string) => sharedFormatDate(iso);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const openDetail = (event: Event) => { setSelectedEvent(event); setPageState('detail'); scrollToTop(); };
  const openEdit   = (event: Event) => { setSelectedEvent(event); setPageState('edit'); scrollToTop();   };
  const openClone  = (event: Event) => { setSelectedEvent(event); setPageState('create'); scrollToTop(); };
  const backToList = ()              => { setPageState('list'); setSelectedEvent(null); scrollToTop();   };

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
          newStatus === 'active' ? 'Karyakram activated successfully.' : 'Karyakram deactivated successfully.'
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
        toast.success('Karyakram cancelled successfully.');
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
              ? 'Completed Karyakrams cannot be deleted.'
              : 'This Karyakram can no longer be deleted after it starts.'
          );
          break;
        }
        setEvents(prev => prev.filter(e => e.id !== ev.id));
        if (pageState === 'detail') backToList();
        toast.success('Karyakram deleted successfully.');
        break;
      }
    }
    closeModal();
  };

  const buildNewEvent = (data: Partial<Event>): Event => ({
    id: `EVT-${Date.now().toString().slice(-6)}`,
    name: data.name ?? 'New Karyakram',
    host: 'Sarah Johnson',
    status: data.status ?? 'draft',
    country: data.country ?? '',
    region: data.region ?? '',
    town: data.town ?? '',
    activityCentre: data.activityCentre ?? '',
    locationType: data.locationType ?? 'physical',
    venueAddress: data.venueAddress,
    onlineUrl: data.onlineUrl,
    startDate: data.startDate ?? new Date().toISOString(),
    endDate: data.endDate ?? new Date().toISOString(),
    registrationStartDate: data.registrationStartDate,
    registrationEndDate: data.registrationEndDate,
    createdDate: data.createdDate ?? new Date().toISOString(),
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
    paymentType: data.paymentType ?? 'free',
    price: data.price,
    priceCategories: data.priceCategories,
    couponCode: data.couponCode,
    donationEnabled: data.donationEnabled,
    donationDescription: data.donationDescription,
    donationAmounts: data.donationAmounts,
    capacity: data.capacity,
    waitlistEnabled: data.waitlistEnabled,
    description: data.description,
    imageUrl: data.imageUrl,
    guestRegistrationEnabled: data.guestRegistrationEnabled,
    shakhaKaryawahaApprovalRequired: data.shakhaKaryawahaApprovalRequired,
    selfCheckInEnabled: data.selfCheckInEnabled,
    guestPaymentType: data.guestPaymentType,
    guestPrice: data.guestPrice,
    customQuestions: data.customQuestions,
    termsAndConditions: data.termsAndConditions,
    termsSections: data.termsSections,
    confirmationSubject: data.confirmationSubject,
    confirmationMessage: data.confirmationMessage,
    targetRegions: data.targetRegions,
    targetTowns: data.targetTowns,
    targetCentres: data.targetCentres,
    targetMemberIds: data.targetMemberIds,
    filterAgeCategories: data.filterAgeCategories,
    filterGenders: data.filterGenders,
    filterJobTitles: data.filterJobTitles,
    filterSpecificAge: data.filterSpecificAge,
    filterResponsibilityLevels: data.filterResponsibilityLevels,
    filterResponsibilityTypes: data.filterResponsibilityTypes,
    metrics: data.metrics ?? { going: 0, maybe: 0, notGoing: 0, participantCount: 0, mediaCount: 0 },
    chatState: 'archived',
  });

  const handleCreateSave = (data: Partial<Event>) => {
    setEvents(prev => [buildNewEvent(data), ...prev]);
    toast.success('Karyakram saved as draft.');
  };

  const handleCreatePublish = (data: Partial<Event>) => {
    setEvents(prev => [buildNewEvent(data), ...prev]);
    setPageState('list');
    scrollToTop();
    toast.success('Karyakram published successfully.');
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
    const isCancelledOrCompleted = event.status === 'cancelled' || event.status === 'completed';
    return {
      canModify:   ep.canEdit && canModify(event),
      modifyTip:   canModify(event) ? 'Modify Karyakram' : (event.status === 'completed' ? 'Completed Karyakrams cannot be edited.' : 'Cancelled Karyakrams cannot be edited.'),
      canActivate: ep.canEdit && !isCancelledOrCompleted,
      canCancel:   ep.canCancel && !isCancelledOrCompleted,
      canDelete:   ep.canDelete && canDelete(event),
      deleteTip:   !canDelete(event)
        ? (event.status === 'completed' ? 'Completed Karyakrams cannot be deleted.' : 'Karyakram cannot be deleted after it starts.')
        : 'Delete Karyakram',
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
          onClone={() => openClone(live)}
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
          message="Are you sure you want to cancel this Karyakram? This action cannot be undone."
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
          message="Are you sure you want to delete this Karyakram? This action is permanent and cannot be undone."
          confirmLabel="Confirm Deletion"
          confirmVariant="danger"
          isLoading={modal.isLoading}
          onConfirm={confirmAction}
          onClose={closeModal}
        />
      </>
    );
  }

  if (pageState === 'create') {
    return (
      <EventCreate
        cloneFrom={selectedEvent ?? undefined}
        onBack={() => { setPageState('list'); setSelectedEvent(null); scrollToTop(); }}
        onSave={handleCreateSave}
        onPublish={handleCreatePublish}
      />
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
          toast.success('Karyakram updated successfully.');
        }}
      />
    );
  }

  // ─── Listing ───────────────────────────────────────────────────────────────
  return (
    <div className="sticky-listing-table p-6 bg-transparent dark:bg-neutral-950" style={stickyTableStyle}>
      <div className="max-w-[100%] mx-auto">

        {/* PAGE HEADER */}
        <div ref={stickyHeaderRef} className="sticky top-[53px] z-30 bg-white dark:bg-neutral-950 pb-1">
        <PageHeader
          title="Karyakrams"
          subtitle={isMemberRole ? "Below is the list of all Karyakrams for your attention" : "View and govern Karyakrams across all Masters scopes."}
        >
          {isMemberRole ? (
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search Karyakrams..."
            />
          ) : (
            <div className="relative" ref={columnAnchorRef}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onAdvancedSearch={() => setShowAdvancedSearch(true)}
                onToggleColumns={viewMode === 'table' ? () => setShowColumnPanel(!showColumnPanel) : undefined}
                activeFilterCount={filters.filter(f => f.values.length > 0).length}
                placeholder="Search Karyakrams..."
              />
              <AdvancedSearchPanel
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                filters={filters}
                onFiltersChange={setFilters}
                filterOptions={{
                  ...EVENT_FILTER_BASE,
                  ...(scope.showCountryFilter  ? { 'Country':         MASTERS_CASCADE.countries } : {}),
                  ...(scope.showRegionFilter   ? { 'Vibhag':         scopedFilterOptions.regionOptions } : {}),
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
              title="Filter by Karyakram Dates"
              className={`h-10 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border transition-colors ${
                eventDateStart
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-600'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {eventDateStart ? (eventDateLabel || formatDateRange(eventDateStart, eventDateEnd)) : 'Karyakram dates'}
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
              title="Karyakram Date Range"
            />
          </div>

          {isMemberRole && (
            <IconButton icon={BarChart3} onClick={() => setShowMemberSummary(s => !s)} title="Summary" />
          )}
          {ep.canAdd && (
            <PrimaryButton icon={Plus} onClick={() => { setSelectedEvent(null); setPageState('create'); scrollToTop(); }}>
              Create Karyakram
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
        </div>

        {/* SUMMARY WIDGETS — admin */}
        {!isMemberRole && showSummary && (
          <SummaryWidgets
            title="Karyakram Summary"
            widgets={[
              { label: 'Total Karyakrams',  value: events.length,                                                                    icon: 'Activity'    },
              { label: 'In Progress',       value: scopedEvents.filter(e => e.status === 'active').length,                            icon: 'CheckCircle' },
              { label: 'Draft / Published', value: scopedEvents.filter(e => e.status === 'draft' || e.status === 'published').length, icon: 'Clock'       },
              { label: 'Completed',         value: scopedEvents.filter(e => e.status === 'completed').length,                         icon: 'XCircle'     },
            ]}
          />
        )}

        {/* TAB BAR — admin: current (working) vs completed (terminal) Karyakrams */}
        {!isMemberRole && (
          <div className="bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex gap-1">
              {([
                { id: 'current' as EventListTab,   label: 'Current Karyakrams' },
                { id: 'completed' as EventListTab, label: 'Completed Karyakrams' },
              ]).map(tab => {
                const count = eventTabCounts[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveEventTab(tab.id); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                      activeEventTab === tab.id
                        ? 'border-primary-600 text-primary-700 dark:text-primary-300 dark:border-primary-400'
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-error-600 text-white text-[10px] font-bold leading-none">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY WIDGETS — member */}
        {isMemberRole && memberData && showMemberSummary && (
          <SummaryWidgets
            title="My Karyakrams Summary"
            colorCards={true}
            centered={true}
            widgets={[
              { label: 'Total Karyakrams Attended',               value: memberData.counts.attended,      icon: 'CheckCircle', color: 'emerald' },
              { label: 'Upcoming Karyakrams (Not Yet Registered)', value: memberData.counts.notRegistered, icon: 'Clock',       color: 'amber'   },
              { label: 'Upcoming Karyakrams (Registered)',         value: memberData.counts.registered,    icon: 'Activity',    color: 'sky'     },
            ]}
          />
        )}

        {/* ── MEMBER VIEW: upcoming panels + completed table ── */}
        {isMemberRole && memberData && (
          <div className="space-y-6">

            {/* Two upcoming panels */}
            <div className="flex flex-col lg:flex-row gap-4">

              {/* Not Yet Registered */}
              <div className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
                  <Calendar size={15} className="text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                  <h3 className="font-bold text-[19px] text-neutral-900 dark:text-white">Upcoming Karyakrams – Not Yet Registered</h3>
                </div>
                <div className="px-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {memberData.notRegistered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-400">No upcoming Karyakrams to register for.</p>
                  ) : memberData.notRegistered.map(ev => {
                    const { day, mon, year } = utcDMY(ev.startDate);
                    return (
                      <div key={ev.id} className="flex items-start gap-4 py-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 -mx-4 px-4 transition-colors" onClick={() => openDetail(ev)}>
                        <div className="flex-shrink-0 w-12 text-center pt-0.5">
                          <div className="text-xl font-bold text-neutral-900 dark:text-white leading-none">{day}</div>
                          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">{mon}</div>
                          <div className="text-[10px] text-neutral-400">{year}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-[16px] font-semibold text-neutral-900 dark:text-white truncate" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>{ev.name}</span>
                              <StatusBadge status={ev.status} />
                            </div>
                            <span className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">Not Yet Registered</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1"><Clock size={10} />{timeRangeLabel(ev)}</span>
                            <span className="flex items-center gap-1"><MapPin size={10} />{ev.locationType === 'online' ? 'Online' : ev.activityCentre}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Registered */}
              <div className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden" style={{ borderTop: '3px solid #172E4D' }}>
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
                  <Calendar size={15} className="text-neutral-500 dark:text-neutral-400 flex-shrink-0" />
                  <h3 className="font-bold text-[19px] text-neutral-900 dark:text-white">Upcoming Karyakrams – Registered</h3>
                </div>
                <div className="px-4 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {memberData.registered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-400">You have not registered for any upcoming Karyakrams.</p>
                  ) : memberData.registered.map(ev => {
                    const { day, mon, year } = utcDMY(ev.startDate);
                    return (
                      <div key={ev.id} className="flex items-start gap-4 py-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 -mx-4 px-4 transition-colors" onClick={() => openDetail(ev)}>
                        <div className="flex-shrink-0 w-12 text-center pt-0.5">
                          <div className="text-xl font-bold text-neutral-900 dark:text-white leading-none">{day}</div>
                          <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">{mon}</div>
                          <div className="text-[10px] text-neutral-400">{year}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-[16px] font-semibold text-neutral-900 dark:text-white truncate" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>{ev.name}</span>
                              <StatusBadge status={ev.status} />
                            </div>
                            <span className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800 whitespace-nowrap">Registered</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1"><Clock size={10} />{timeRangeLabel(ev)}</span>
                            <span className="flex items-center gap-1"><MapPin size={10} />{ev.locationType === 'online' ? 'Online' : ev.activityCentre}</span>
                            <span className="flex items-center gap-1"><UsersIcon size={10} />{ev.metrics.participantCount} registered</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Completed Karyakrams – Attended (full width) */}
            {memberData.attended.length > 0 && (
              <div>
                <h2 className="text-[19px] font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                  Completed Karyakrams – Attended
                </h2>
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      {/* This table isn't meant to be sticky, but its <th> still inherit
                          `.sticky-listing-table thead th { position: sticky }` from the
                          page-level wrapper above (a descendant selector, so it applies
                          regardless of nesting) — the page's own sticky offset then makes
                          this header drift to the wrong spot on scroll. Inline style
                          beats any class-based rule, so opt this table out explicitly. */}
                      <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300" style={{ position: 'static' }}>Karyakram ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300" style={{ position: 'static' }}>Karyakram Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300" style={{ position: 'static' }}>Location</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300" style={{ position: 'static' }}>Start Date/Time</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300" style={{ position: 'static' }}>End Date/Time</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300" style={{ position: 'static' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const groups: Record<number, Event[]> = {};
                          for (const ev of memberData.attended) {
                            const yr = new Date(ev.startDate).getUTCFullYear();
                            if (!groups[yr]) groups[yr] = [];
                            groups[yr].push(ev);
                          }
                          return Object.entries(groups)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .flatMap(([year, evs]) => [
                              <tr key={`yr-${year}`}>
                                <td colSpan={6} className="px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: '#172E4D' }}>{year}</td>
                              </tr>,
                              ...evs.map((ev, i) => (
                                <tr
                                  key={ev.id}
                                  className={`border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors ${i % 2 === 1 ? 'bg-neutral-50/60 dark:bg-neutral-900/30' : ''}`}
                                  onClick={() => openDetail(ev)}
                                >
                                  <td className="px-4 py-3 font-mono text-xs font-medium text-primary-600 dark:text-primary-400">{ev.id}</td>
                                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white max-w-[200px] truncate">{ev.name}</td>
                                  <td className="px-4 py-3">
                                    <div className="text-xs text-neutral-600 dark:text-neutral-300">{ev.activityCentre}</div>
                                    <div className="text-[11px] text-neutral-400">{ev.region}</div>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{utcFull(ev.startDate)}</td>
                                  <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{utcFull(ev.endDate)}</td>
                                  <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                                </tr>
                              )),
                            ]);
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {!isMemberRole && viewMode === 'list' && (
          <div className="space-y-3">
            {paginatedEvents.length > 0 ? paginatedEvents.map(event => {
              const actions = getRowActions(event);
              return (
                <div
                  key={event.id}
                  className={`bg-white dark:bg-neutral-950 border rounded-lg overflow-hidden hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer relative group shadow-sm ${
                    selectedIds.has(event.id)
                      ? 'border-primary-300 dark:border-primary-600'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                  onClick={() => openDetail(event)}
                >
                  <div className="flex">
                  {isMemberRole && (
                    <div className={`w-1 flex-shrink-0 ${{
                      draft:     'bg-neutral-400',
                      published: 'bg-blue-500',
                      active:    'bg-[#4EAE33]',
                      cancelled: 'bg-red-500',
                      completed: 'bg-amber-500',
                    }[event.status] ?? 'bg-neutral-400'}`} />
                  )}
                  <div className="flex-1 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {!isMemberRole && !isSuperAdmin && (
                        <div onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelection(event.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                          />
                        </div>
                      )}
                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-neutral-900 dark:text-white font-semibold truncate" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>{event.name}</span>
                          <StatusBadge status={event.status} />
                          <PaymentBadge type={event.paymentType} price={event.price} priceCategories={event.priceCategories} />
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
                            <span>{formatDate(event.startDate)}{isMultiDayEvent(event) ? ` → ${formatDate(event.endDate)}` : ''}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <UsersIcon className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{event.metrics.participantCount} participants</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isMemberRole && (
                      <div className="flex items-center gap-1.5 ml-4" onClick={e => e.stopPropagation()}>
                        <IconButton
                          icon={MoreVertical}
                          borderless={true}
                          title="Actions"
                          menuItems={[
                            { icon: Eye,        label: 'View Details',                     onClick: () => openDetail(event)                                                   },
                            { icon: Edit,       label: actions.canModify ? 'Modify' : 'Modify (Blocked)', onClick: actions.canModify ? () => openEdit(event) : () => toast.warning(actions.modifyTip) },
                            { icon: event.status === 'active' ? Ban : Play, label: event.status === 'active' ? 'Deactivate' : 'Activate', onClick: actions.canActivate ? () => openModal('status', event) : () => toast.warning('Cannot change status of a cancelled or completed event.') },
                            { icon: XCircle,    label: 'Cancel Karyakram',                     onClick: actions.canCancel ? () => openModal('cancel', event) : () => toast.warning('Karyakram is already cancelled or completed.')    },
                            { icon: ShieldAlert,label: 'Override Approval',                onClick: () => openModal('override', event)                                        },
                            { icon: Trash2,     label: actions.canDelete ? 'Delete' : 'Delete (Blocked)', onClick: actions.canDelete ? () => openModal('delete', event) : () => toast.error(actions.deleteTip) },
                          ]}
                        />
                      </div>
                    )}
                  </div>
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
        {!isMemberRole && viewMode === 'grid' && (
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
                    {!isMemberRole && (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {!isSuperAdmin && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelection(event.id)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer flex-shrink-0"
                          />
                        )}
                        <IconButton
                          icon={MoreVertical}
                          borderless={true}
                          title="Actions"
                          menuItems={[
                            { icon: Eye,         label: 'View Details',                     onClick: () => openDetail(event)                                                   },
                            { icon: Edit,        label: actions.canModify ? 'Modify' : 'Modify (Blocked)', onClick: actions.canModify ? () => openEdit(event) : () => toast.warning(actions.modifyTip) },
                            { icon: event.status === 'active' ? Ban : Play, label: event.status === 'active' ? 'Deactivate' : 'Activate', onClick: actions.canActivate ? () => openModal('status', event) : () => toast.warning('Cannot change status of a cancelled or completed event.') },
                            { icon: XCircle,     label: 'Cancel Karyakram',                     onClick: actions.canCancel ? () => openModal('cancel', event) : () => toast.warning('Karyakram is already cancelled or completed.')    },
                            { icon: ShieldAlert, label: 'Override Approval',                onClick: () => openModal('override', event)                                        },
                            { icon: Trash2,      label: actions.canDelete ? 'Delete' : 'Delete (Blocked)', onClick: actions.canDelete ? () => openModal('delete', event) : () => toast.error(actions.deleteTip) },
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <StatusBadge status={event.status} />
                      <PaymentBadge type={event.paymentType} price={event.price} priceCategories={event.priceCategories} />
                    </div>
                    <h4 className="text-[16px] font-semibold text-neutral-900 dark:text-white truncate mb-0.5 mt-2" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>
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
                        <span>{formatDate(event.startDate)}{isMultiDayEvent(event) ? ` → ${formatDate(event.endDate)}` : ''}</span>
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
        {!isMemberRole && viewMode === 'table' && (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-visible shadow-sm">
            <div className="sticky-table-scroll slim-scroll">
              <table className="w-full min-w-max text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                    {!isMemberRole && !isSuperAdmin && (
                      <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 w-12 border-b border-neutral-200 dark:border-neutral-800">
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
                    )}
                    {visibleColumns.id && (
                      <th onClick={() => handleSort('id')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Karyakram ID {renderSortArrow('id')}
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th onClick={() => handleSort('name')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Karyakram Title {renderSortArrow('name')}
                      </th>
                    )}
                    {visibleColumns.location && (
                      <th onClick={() => handleSort('town')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Location {renderSortArrow('town')}
                      </th>
                    )}
                    {visibleColumns.startDate && (
                      <th onClick={() => handleSort('startDate')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Start Date/Time {renderSortArrow('startDate')}
                      </th>
                    )}
                    {visibleColumns.endDate && (
                      <th onClick={() => handleSort('endDate')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        End Date/Time {renderSortArrow('endDate')}
                      </th>
                    )}
                    {visibleColumns.paymentType && (
                      <th onClick={() => handleSort('paymentType')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Payment {renderSortArrow('paymentType')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th onClick={() => handleSort('status')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Status {renderSortArrow('status')}
                      </th>
                    )}
                    {visibleColumns.participants && (
                      <th className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Participants
                      </th>
                    )}
                    {visibleColumns.lastUpdated && (
                      <th onClick={() => handleSort('lastUpdated')} className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none border-b border-neutral-200 dark:border-neutral-800 whitespace-nowrap">
                        Last Updated {renderSortArrow('lastUpdated')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {paginatedEvents.length > 0 ? paginatedEvents.map(event => {
                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors group cursor-pointer"
                        onClick={() => openDetail(event)}
                      >
                        {!isMemberRole && !isSuperAdmin && (
                          <td className="px-4 py-3.5 w-12" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(event.id)}
                              onChange={() => toggleSelection(event.id)}
                              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-primary-600 cursor-pointer"
                            />
                          </td>
                        )}
                        {visibleColumns.id && (
                          <td className="px-6 py-4 text-sm font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                            {event.id}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors max-w-[200px]">
                            <span className="truncate block" style={{ fontFamily: '"TT Ramillas", "Open Sauce One", serif' }}>{event.name}</span>
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
                            <PaymentBadge type={event.paymentType} price={event.price} priceCategories={event.priceCategories} />
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-6 py-4">
                            <StatusBadge status={event.status} />
                          </td>
                        )}
                        {visibleColumns.participants && (
                          <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                            {(mockParticipants[event.id] ?? []).filter(p => p.rsvp !== 'denied').length}{event.capacity ? ` / ${event.capacity}` : ''}
                          </td>
                        )}
                        {visibleColumns.lastUpdated && (
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                            {formatDate(event.lastUpdated)}
                          </td>
                        )}
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-20 text-center">
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
        {!isMemberRole && (
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
        )}
      </div>

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
        message="Are you sure you want to delete this Karyakram? This action is permanent and cannot be undone."
        confirmLabel="Confirm Deletion"
        confirmVariant="danger"
        isLoading={modal.isLoading}
        onConfirm={confirmAction}
        onClose={closeModal}
      />
    </div>
  );
}
