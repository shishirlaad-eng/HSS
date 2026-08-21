// ─────────────────────────────────────────────────────────────
// HSS UK — Donation Collection (Karyakram)
// Lets a Karyakram Admin/Coordinator pick a published/ongoing paid Karyakram
// from a card grid, then record an on-the-spot cash donation from an attendee
// (member or guest) of that Karyakram, and view everything collected for it.
// Distinct from Guru Purnima Cash Income (that one is Shakha-session +
// age-category based; this one is event + individual attendee based).
// ─────────────────────────────────────────────────────────────
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  MoreVertical,
  FileSpreadsheet,
  BarChart3,
  ChevronLeft,
  Wallet,
  Receipt,
  UserPlus,
  Check,
  Calendar,
  MapPin,
  Ticket,
} from 'lucide-react';
import {
  PageHeader,
  SearchBar,
  IconButton,
  PrimaryButton,
  Pagination,
  AdvancedSearchPanel,
} from './hb/listing';
import type { FilterCondition } from './hb/listing';
import { mockKaryakramDonations, KaryakramDonationRecord } from '../../mockAPI/donationsData';
import { mockEvents, mockParticipants, Event, EventParticipant } from '../../mockAPI/eventsData';
import { mockMembers } from '../../mockAPI/membersData';
import { useRoleScope } from '../contexts/RoleScopeContext';
import { filterByScope } from '../../mockAPI/roleScope';
import { formatDate as fmtDate, formatDateTime as fmtDateTime } from '../../utils/formatDate';
import { ErrorText } from './hb/common';
import { toast } from 'sonner';

type PageState = 'events' | 'list' | 'record';

function fmtMoney(n: number) {
  return `£${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function priceLabel(ev: Event): string {
  if (ev.priceCategories?.length) {
    const prices = ev.priceCategories.map(pc => pc.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? fmtMoney(min) : `${fmtMoney(min)} – ${fmtMoney(max)}`;
  }
  return ev.price != null ? fmtMoney(ev.price) : '—';
}

function KpiCard({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">{value}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Event card ──────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  published: { label: 'Published', bg: 'bg-info-50 dark:bg-info-950/20',    text: 'text-info-700 dark:text-info-400' },
  active:    { label: 'Ongoing',    bg: 'bg-success-50 dark:bg-success-950/20', text: 'text-success-700 dark:text-success-400' },
};

function EventCard({ event, donationCount, onClick }: { event: Event; donationCount: number; onClick: () => void }) {
  const statusCfg = STATUS_CFG[event.status] ?? STATUS_CFG.published;
  return (
    <button
      onClick={onClick}
      className="text-left bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 hover:shadow-md hover:border-primary-600 dark:hover:border-primary-400 transition-all cursor-pointer shadow-sm flex flex-col gap-3"
    >
      <div className="flex justify-between items-start gap-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
          {statusCfg.label}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          <Ticket className="w-3.5 h-3.5" />
          {priceLabel(event)}
        </span>
      </div>
      <div>
        <p className="text-base font-semibold text-neutral-900 dark:text-white truncate">{event.name}</p>
        <p className="text-xs text-neutral-400 font-mono">{event.id}</p>
      </div>
      <div className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          {fmtDate(event.startDate)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          <span className="truncate">{event.activityCentre}</span>
        </div>
      </div>
      <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
        {donationCount} donation{donationCount !== 1 ? 's' : ''} recorded
      </div>
    </button>
  );
}

// ── Event-scoped participant autocomplete ──────────────────────

function ParticipantAutocomplete({
  value,
  participants,
  error,
  onChange,
}: {
  value: string;
  participants: EventParticipant[];
  error?: boolean;
  onChange: (name: string, participant: EventParticipant | null) => void;
}) {
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideField = !!ref.current?.contains(target);
      const insideMenu = !!menuRef.current?.contains(target);
      if (!insideField && !insideMenu) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() =>
    query.trim().length >= 1
      ? participants.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
      : participants.slice(0, 6),
    [query, participants],
  );

  const open = focused && suggestions.length > 0;

  // Dropdown is rendered via a portal to document.body (not clipped by this
  // form card's `overflow-hidden`), tracking the field's live position.
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  useEffect(() => {
    if (!open) { setRect(null); return; }
    const update = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      setRect({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        placeholder="Type to search event participants…"
        onChange={e => { setQuery(e.target.value); onChange(e.target.value, null); }}
        onFocus={() => setFocused(true)}
        className={`w-full text-sm rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
            : 'border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400'
        }`}
      />
      {open && rect && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[999] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        >
          {suggestions.map(p => (
            <button
              key={p.memberId}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setQuery(p.name); setFocused(false); onChange(p.name, p); }}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">{p.name}</span>
              <span className="text-xs font-mono text-neutral-400 ml-3 flex-shrink-0">{p.memberId}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Confirmation modal ──────────────────────────────────────────

function ConfirmModal({
  summary,
  isLoading,
  onClose,
  onConfirm,
}: {
  summary: { name: string; eventName: string; amount: number };
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-md p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-[18px] font-semibold text-neutral-900 dark:text-white mb-1">Confirm Donation</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Confirm <span className="font-semibold text-neutral-900 dark:text-white">{fmtMoney(summary.amount)}</span> collected
              from <span className="font-medium text-neutral-900 dark:text-white">{summary.name}</span> for{' '}
              <span className="font-medium text-neutral-900 dark:text-white">{summary.eventName}</span>.
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
            className="px-4 py-2 text-sm rounded-lg font-semibold bg-[#172E4D] hover:bg-[#172E4D]/80 text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Record form (event already chosen via card) ─────────────────

function DetailField({ label, value, editable, onChange, placeholder }: {
  label: string; value: string; editable?: boolean; onChange?: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{label}</label>
      {editable ? (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
          className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
        />
      ) : (
        <input
          type="text"
          readOnly
          value={value || '—'}
          className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 cursor-not-allowed"
        />
      )}
    </div>
  );
}

function DonationForm({
  event,
  onCancel,
  onSave,
}: {
  event: Event;
  onCancel: () => void;
  onSave: (data: {
    memberId?: string; guestName?: string; guestEmail?: string; guestPhone?: string; guestActivityCentre?: string; amount: number;
  }) => void;
}) {
  const [isGuest, setIsGuest] = useState(false);
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestShakha, setGuestShakha] = useState('');
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const participants = useMemo(
    () => (mockParticipants[event.id] ?? []).filter(p => p.rsvp !== 'denied' && p.rsvp !== 'cancelled'),
    [event.id],
  );

  const selectedMember = useMemo(() => (memberId ? mockMembers.find(m => m.id === memberId) ?? null : null), [memberId]);
  const selectedParticipant = useMemo(() => participants.find(p => p.memberId === memberId) ?? null, [participants, memberId]);

  const toggleGuest = (checked: boolean) => {
    setIsGuest(checked);
    setName('');
    setMemberId('');
    setGuestFirstName('');
    setGuestLastName('');
    setGuestEmail('');
    setGuestPhone('');
    setGuestShakha('');
  };

  const errors = {
    name: isGuest ? (!guestFirstName.trim() || !guestLastName.trim()) : !memberId,
    amount: amount === '' || isNaN(Number(amount)) || Number(amount) < 0,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const fieldCls = (err: boolean) =>
    `w-full text-sm rounded-lg border px-3 py-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition-colors ${
      touched && err
        ? 'border-red-400 dark:border-red-600 focus:ring-red-400/30'
        : 'border-neutral-200 dark:border-neutral-700 focus:ring-primary-500/30 focus:border-primary-500 dark:focus:border-primary-400'
    }`;

  const handleSubmit = () => {
    setTouched(true);
    if (hasErrors) {
      toast.error('Please fill in all required fields correctly.');
      return;
    }
    setConfirming(true);
  };

  const displayName = isGuest ? `${guestFirstName} ${guestLastName}`.trim() : name;

  const handleConfirm = () => {
    onSave({
      memberId: isGuest ? undefined : memberId || undefined,
      guestName: isGuest ? displayName : undefined,
      guestEmail: isGuest ? guestEmail.trim() || undefined : undefined,
      guestPhone: isGuest ? guestPhone.trim() || undefined : undefined,
      guestActivityCentre: isGuest ? guestShakha.trim() || undefined : undefined,
      amount: Math.round(Number(amount) * 100) / 100,
    });
  };

  const showDetails = isGuest || !!memberId;

  return (
    <div className="p-6 pb-12 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <h2 className="text-[18px] font-semibold text-neutral-900 dark:text-white">Add Donation</h2>
      </div>

      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-visible shadow-sm" style={{ borderTop: '3px solid #172E4D' }}>
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[19px] font-bold text-neutral-900 dark:text-white">Donation Details</h3>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Karyakram</label>
            <input
              type="text"
              readOnly
              value={`${event.name} · ${fmtDate(event.startDate)}`}
              className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Member Name <span className="text-red-500 ml-0.5">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGuest}
                  onChange={e => toggleGuest(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-600"
                />
                <UserPlus className="w-3.5 h-3.5" />
                Guest
              </label>
            </div>
            {isGuest ? (
              <input
                type="text"
                readOnly
                value={displayName}
                placeholder="Fill in guest details below…"
                className="w-full text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
              />
            ) : (
              <ParticipantAutocomplete
                value={name}
                participants={participants}
                error={touched && errors.name}
                onChange={(n, p) => { setName(n); setMemberId(p?.memberId ?? ''); }}
              />
            )}
            <ErrorText>{touched && errors.name && (isGuest ? 'Guest first and last name are required.' : 'Please select a participant.')}</ErrorText>
            {!isGuest && participants.length === 0 && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                No eligible participants found for this Karyakram.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">£</span>
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`${fieldCls(errors.amount)} pl-6`}
              />
            </div>
            <ErrorText>{touched && errors.amount && 'Enter a valid non-negative amount.'}</ErrorText>
          </div>
        </div>

        {showDetails && (
          <div className="px-5 pb-5 pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mt-4 mb-3">
              {isGuest ? 'Guest Details' : 'Participant Details'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {isGuest ? (
                <>
                  <DetailField label="First Name *" value={guestFirstName} editable onChange={setGuestFirstName} placeholder="First name" />
                  <DetailField label="Last Name *"  value={guestLastName}  editable onChange={setGuestLastName}  placeholder="Last name" />
                  <DetailField label="Member ID" value="N/A (Guest)" />
                  <DetailField label="Email" value={guestEmail} editable onChange={setGuestEmail} placeholder="Email address" />
                  <DetailField label="Phone Number" value={guestPhone} editable onChange={setGuestPhone} placeholder="Phone number" />
                  <DetailField label="Shakha" value={guestShakha} editable onChange={setGuestShakha} placeholder="Shakha (if any)" />
                </>
              ) : (
                <>
                  <DetailField label="First Name" value={selectedMember?.firstName ?? name.split(' ')[0] ?? ''} />
                  <DetailField label="Last Name"  value={selectedMember?.surname ?? name.split(' ').slice(1).join(' ')} />
                  <DetailField label="Member ID" value={memberId} />
                  <DetailField label="Email" value={selectedMember?.email ?? selectedParticipant?.email ?? ''} />
                  <DetailField label="Phone Number" value={selectedMember?.phone ?? selectedParticipant?.phone ?? ''} />
                  <DetailField label="Shakha" value={selectedMember?.activityCentre ?? event.activityCentre} />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-lg font-semibold bg-[#172E4D] hover:bg-[#172E4D]/80 text-white transition-colors">
          Submit
        </button>
      </div>

      {confirming && (
        <ConfirmModal
          summary={{ name: displayName, eventName: event.name, amount: Number(amount) || 0 }}
          isLoading={false}
          onClose={() => setConfirming(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function DonationCollection() {
  const { scope, selectedRole } = useRoleScope();
  const isCoordinator = selectedRole === 'Karyakram Coordinator';

  const [donations, setDonations] = useState<KaryakramDonationRecord[]>(mockKaryakramDonations);
  const [pageState, setPageState] = useState<PageState>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  // Paid Karyakrams in scope, further narrowed to Published/Ongoing for the
  // card grid — a donation is only ever collected while the Karyakram is
  // still live to attendees.
  const cardEvents = useMemo(() => {
    const paid = mockEvents.filter(e => e.paymentType === 'paid' && (e.status === 'published' || e.status === 'active'));
    return isCoordinator
      ? paid.filter(e => (mockParticipants[e.id] ?? []).some(p => p.memberId === scope.selfMemberId && p.isCoordinator))
      : filterByScope(paid, scope);
  }, [isCoordinator, scope]);

  const selectedEvent = mockEvents.find(e => e.id === selectedEventId) ?? null;

  const eventDonations = useMemo(
    () => (selectedEventId ? donations.filter(d => d.eventId === selectedEventId) : []),
    [donations, selectedEventId],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return eventDonations.filter(d => {
      const displayName = d.guestName ?? mockParticipants[d.eventId]?.find(p => p.memberId === d.memberId)?.name ?? d.memberId ?? '';
      const matchSearch = !q ||
        d.id.toLowerCase().includes(q) ||
        displayName.toLowerCase().includes(q);

      const evalFilter = (f: FilterCondition): boolean => {
        switch (f.field) {
          case 'Type': return f.values.includes(d.guestName ? 'Guest' : 'Member');
          default:     return true;
        }
      };
      const activeFilters = filters.filter(f => f.values.length > 0);
      const matchFilters = activeFilters.length === 0
        ? true
        : activeFilters.reduce<boolean>((acc, f, i) => {
            if (i === 0) return evalFilter(f);
            return f.logicOp === 'OR' ? (acc || evalFilter(f)) : (acc && evalFilter(f));
          }, true);
      return matchSearch && matchFilters;
    });
  }, [eventDonations, searchQuery, filters]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [filtered],
  );

  const paginated = useMemo(() => {
    if (itemsPerPage === 0) return sorted;
    return sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = itemsPerPage === 0 ? 1 : Math.max(1, Math.ceil(sorted.length / itemsPerPage));

  const totalCollected = useMemo(() => filtered.reduce((sum, d) => sum + d.amount, 0), [filtered]);
  const entriesRecorded = filtered.length;
  const guestEntries = useMemo(() => filtered.filter(d => d.guestName).length, [filtered]);

  const nextId = () => `KDN-${String(donations.length + 1).padStart(3, '0')}`;

  const handleSave = (data: {
    memberId?: string; guestName?: string; guestEmail?: string; guestPhone?: string; guestActivityCentre?: string; amount: number;
  }) => {
    if (!selectedEvent) return;
    const created: KaryakramDonationRecord = {
      id: nextId(),
      eventId: selectedEvent.id,
      memberId: data.memberId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestActivityCentre: data.guestActivityCentre,
      amount: data.amount,
      country: selectedEvent.country,
      region: selectedEvent.region,
      town: selectedEvent.town,
      activityCentre: selectedEvent.activityCentre,
      recordedAt: new Date().toISOString(),
    };
    setDonations(prev => [created, ...prev]);
    setPageState('list');
    toast.success('Donation recorded successfully.');
  };

  const handleExportCSV = () => {
    if (!filtered.length) { toast.error('No data to export.'); return; }
    const headers = ['ID', 'Member Name', 'Member ID', 'Shakha', 'Date', 'Amount'];
    const csv = [
      headers.join(','),
      ...sorted.map(d => {
        const displayName = d.guestName ?? mockParticipants[d.eventId]?.find(p => p.memberId === d.memberId)?.name ?? '';
        return [
          d.id,
          `"${displayName}"`,
          d.guestName ? 'Guest' : (d.memberId ?? ''),
          `"${d.activityCentre}"`,
          fmtDate(d.recordedAt),
          d.amount.toFixed(2),
        ].join(',');
      })
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${(selectedEvent?.name ?? 'karyakram').replace(/\s+/g, '-').toLowerCase()}-donations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV exported.');
  };

  // ── Record sub-page ─────────────────────────────────────────

  if (pageState === 'record' && selectedEvent) {
    return (
      <DonationForm
        event={selectedEvent}
        onCancel={() => setPageState('list')}
        onSave={handleSave}
      />
    );
  }

  // ── Events grid ──────────────────────────────────────────────

  if (pageState === 'events' || !selectedEvent) {
    return (
      <div className="p-6 bg-transparent dark:bg-neutral-950">
        <div className="max-w-[100%] mx-auto">
          <PageHeader
            title="Donation Collection"
            subtitle="Pick a published or ongoing paid Karyakram to record or view its donations."
          />
          <div className="mt-6">
            {cardEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cardEvents.map(ev => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    donationCount={donations.filter(d => d.eventId === ev.id).length}
                    onClick={() => { setSelectedEventId(ev.id); setPageState('list'); }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-neutral-400" />
                  </div>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-white">No published or ongoing paid Karyakrams in your scope.</h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Per-event donations list ────────────────────────────────

  const hasFilters = searchQuery.length > 0 || filters.some(f => f.values.length > 0);
  const filterOptions: Record<string, string[]> = { 'Type': ['Member', 'Guest'] };

  return (
    <div className="p-6 bg-transparent dark:bg-neutral-950">
      <div className="max-w-[100%] mx-auto">

        <div className="pb-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => { setPageState('events'); setSelectedEventId(null); }}
              className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Karyakrams
            </button>
          </div>
          <PageHeader
            title={selectedEvent.name}
            subtitle={`Donations collected for this Karyakram · ${fmtDate(selectedEvent.startDate)} · ${selectedEvent.activityCentre}`}
          >
            <div className="relative">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onAdvancedSearch={() => setShowAdvanced(true)}
                activeFilterCount={filters.filter(f => f.values.length > 0).length}
                placeholder="Search by member or guest name…"
              />
              <AdvancedSearchPanel
                isOpen={showAdvanced}
                onClose={() => setShowAdvanced(false)}
                filters={filters}
                onFiltersChange={setFilters}
                showMatchModeToggle
                filterOptions={filterOptions}
                title="Filter Donations"
              />
            </div>
            <IconButton icon={BarChart3} onClick={() => setShowSummary(!showSummary)} title="Summary" />
            <IconButton
              icon={MoreVertical}
              title="More options"
              menuItems={[
                { icon: FileSpreadsheet, label: 'Export as CSV', onClick: handleExportCSV },
              ]}
            />
            <PrimaryButton icon={Plus} onClick={() => setPageState('record')}>
              Add Donation
            </PrimaryButton>
          </PageHeader>
        </div>

        {showSummary && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Total Collected"   value={fmtMoney(totalCollected)}  icon={Wallet}  color="bg-primary-500" />
            <KpiCard label="Entries Recorded"  value={String(entriesRecorded)}   icon={Receipt} color="bg-info-500" />
            <KpiCard label="Guest Entries"     value={String(guestEntries)}      icon={UserPlus} color="bg-success-500" />
          </div>
        )}

        <div className="mt-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto slim-scroll">
            <table className="w-full min-w-max text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  {['ID', 'Member Name', 'Member ID', 'Date', 'Amount'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {paginated.length > 0 ? paginated.map(d => {
                  const displayName = d.guestName ?? mockParticipants[d.eventId]?.find(p => p.memberId === d.memberId)?.name ?? '—';
                  return (
                    <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-primary-600 dark:text-primary-400 font-mono whitespace-nowrap">{d.id}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white whitespace-nowrap">{displayName}</td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                        {d.guestName
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><UserPlus className="w-3 h-3" />Guest</span>
                          : <span className="text-neutral-600 dark:text-neutral-400 font-mono">{d.memberId}</span>
                        }
                      </td>
                      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{fmtDateTime(d.recordedAt)}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-neutral-900 dark:text-white whitespace-nowrap">{fmtMoney(d.amount)}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Wallet className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {hasFilters ? 'No donations match your search.' : 'No donations recorded yet for this Karyakram.'}
                        </p>
                        {!hasFilters && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Click "Add Donation" above to record one.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {sorted.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sorted.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
